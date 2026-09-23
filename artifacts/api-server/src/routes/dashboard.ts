import { Router, type IRouter } from "express";
import { desc, eq, gte, lt, and, inArray } from "drizzle-orm";
import { db, bookingsTable, tutorsTable } from "@workspace/db";
import { GetDashboardSummaryResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/dashboard/summary", async (_req, res): Promise<void> => {
  const now = new Date();

  const allBookings = await db.select().from(bookingsTable);

  const upcoming = allBookings
    .filter(
      (b) =>
        b.startsAt > now &&
        (b.status === "confirmed" || b.status === "pending_payment"),
    )
    .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());

  const completed = allBookings.filter((b) => b.status === "completed");
  const paid = allBookings.filter(
    (b) => b.status === "confirmed" || b.status === "completed",
  );

  const hoursLearned = completed.reduce(
    (acc, b) => acc + b.durationMinutes / 60,
    0,
  );
  const totalSpent = paid.reduce((acc, b) => acc + Number(b.price), 0);

  // Subjects breakdown
  const subjectMap = new Map<string, number>();
  for (const b of completed) {
    subjectMap.set(
      b.subject,
      (subjectMap.get(b.subject) ?? 0) + b.durationMinutes / 60,
    );
  }
  const topSubjects = Array.from(subjectMap.entries())
    .map(([subject, hours]) => ({ subject, hours: Number(hours.toFixed(1)) }))
    .sort((a, b) => b.hours - a.hours)
    .slice(0, 5);
  const favoriteSubject = topSubjects[0]?.subject ?? "Mathematics";

  // Weekly hours (last 7 days)
  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const weeklyHours = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(now.getDate() - (6 - i));
    d.setHours(0, 0, 0, 0);
    const next = new Date(d);
    next.setDate(d.getDate() + 1);
    const dayHours = completed
      .filter((b) => b.startsAt >= d && b.startsAt < next)
      .reduce((acc, b) => acc + b.durationMinutes / 60, 0);
    return { day: dayLabels[d.getDay()]!, hours: Number(dayHours.toFixed(1)) };
  });

  // Recent activity
  const recent = allBookings
    .slice()
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 6);
  const tutorIds = Array.from(new Set(recent.map((b) => b.tutorId)));
  const tutors =
    tutorIds.length > 0
      ? await db
          .select()
          .from(tutorsTable)
          .where(inArray(tutorsTable.id, tutorIds))
      : [];
  const tutorMap = new Map(tutors.map((t) => [t.id, t]));
  const recentActivity = recent.map((b) => ({
    id: b.id,
    type: b.status,
    text: `${
      b.status === "completed"
        ? "Completed"
        : b.status === "cancelled"
          ? "Cancelled"
          : b.status === "confirmed"
            ? "Confirmed"
            : "Booked"
    } ${b.subject} session with ${tutorMap.get(b.tutorId)?.name ?? "tutor"}`,
    at: b.createdAt.toISOString(),
  }));

  let nextSession: Record<string, unknown> | null = null;
  const nx = upcoming[0];
  if (nx) {
    const tutor = tutorMap.get(nx.tutorId) ??
      (await db
        .select()
        .from(tutorsTable)
        .where(eq(tutorsTable.id, nx.tutorId))
        .then((r) => r[0]));
    nextSession = {
      id: nx.id,
      tutorId: nx.tutorId,
      tutorName: tutor?.name ?? "Tutor",
      tutorAvatarUrl: tutor?.avatarUrl ?? "",
      studentName: nx.studentName,
      subject: nx.subject,
      startsAt: nx.startsAt.toISOString(),
      endsAt: nx.endsAt.toISOString(),
      durationMinutes: nx.durationMinutes,
      price: Number(nx.price),
      status: nx.status,
      notes: nx.notes,
      createdAt: nx.createdAt.toISOString(),
    };
  }

  // unused-imports squelch
  void desc;
  void gte;
  void lt;
  void and;

  res.json(
    GetDashboardSummaryResponse.parse({
      upcomingSessions: upcoming.length,
      hoursLearned: Number(hoursLearned.toFixed(1)),
      totalSpent: Number(totalSpent.toFixed(2)),
      completedSessions: completed.length,
      favoriteSubject,
      nextSession,
      weeklyHours,
      topSubjects,
      recentActivity,
    }),
  );
});

export default router;
