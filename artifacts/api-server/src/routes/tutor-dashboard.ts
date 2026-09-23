import { Router } from "express";
import { eq, and, sql, gte, lt, inArray } from "drizzle-orm";
import {
  db,
  tutorsTable,
  bookingsTable,
  tutorCoursesTable,
  courseEnrollmentsTable,
} from "@workspace/db";
import {
  GetTutorOverviewResponse,
  ListTutorStudentsResponse,
  ListTutorCoursesResponse,
  GetTutorRevenueResponse,
} from "@workspace/api-zod";

const router = Router();

// Demo tutor: Daniel Okafor (t2)
const DEMO_TUTOR_ID = "t2";

// ──────────────────────────────────────────
// GET /tutor-dashboard/overview
// ──────────────────────────────────────────
router.get("/tutor-dashboard/overview", async (req, res) => {
  const [tutor] = await db
    .select()
    .from(tutorsTable)
    .where(eq(tutorsTable.id, DEMO_TUTOR_ID));
  if (!tutor) {
    res.status(404).json({ message: "Tutor not found" });
    return;
  }

  // Revenue from confirmed/completed bookings
  const bookings = await db
    .select()
    .from(bookingsTable)
    .where(
      and(
        eq(bookingsTable.tutorId, DEMO_TUTOR_ID),
        inArray(bookingsTable.status, ["confirmed", "completed"]),
      ),
    );

  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  let totalRevenue = 0;
  let revenueThisMonth = 0;
  let revenueLastMonth = 0;
  for (const b of bookings) {
    const amt = Number(b.price);
    totalRevenue += amt;
    if (b.startsAt >= thisMonthStart) revenueThisMonth += amt;
    else if (b.startsAt >= lastMonthStart) revenueLastMonth += amt;
  }

  // Course revenue
  const courses = await db
    .select()
    .from(tutorCoursesTable)
    .where(eq(tutorCoursesTable.tutorId, DEMO_TUTOR_ID));
  const courseIds = courses.map((c) => c.id);

  const enrollments =
    courseIds.length > 0
      ? await db
          .select()
          .from(courseEnrollmentsTable)
          .where(inArray(courseEnrollmentsTable.courseId, courseIds))
      : [];

  for (const c of courses) {
    const count = enrollments.filter((e) => e.courseId === c.id).length;
    totalRevenue += count * c.priceInr;
    // Approximate course revenue spread evenly across enrolledAt dates
    const courseEnrs = enrollments.filter((e) => e.courseId === c.id);
    for (const e of courseEnrs) {
      if (e.enrolledAt >= thisMonthStart) revenueThisMonth += c.priceInr;
      else if (e.enrolledAt >= lastMonthStart) revenueLastMonth += c.priceInr;
    }
  }

  const uniqueStudents = new Set(enrollments.map((e) => e.studentName));
  bookings.forEach((b) => uniqueStudents.add(b.studentName));

  // Smart alerts
  const struggling = enrollments.filter((e) => e.quizAvg < 50);
  const inactive = enrollments.filter((e) => {
    const daysAgo =
      (now.getTime() - e.lastActiveAt.getTime()) / (1000 * 60 * 60 * 24);
    return daysAgo > 5;
  });
  const lowAttendance = enrollments.filter((e) => e.attendancePct < 60);

  const alerts: { message: string; severity: "info" | "warning" | "critical" }[] = [];
  if (struggling.length > 0) {
    const topics = [
      ...new Set(struggling.flatMap((e) => e.weakTopics).slice(0, 2)),
    ];
    alerts.push({
      message: `${struggling.length} student${struggling.length > 1 ? "s" : ""} struggling${topics.length > 0 ? ` in ${topics.join(" and ")}` : ""} — avg quiz score below 50%.`,
      severity: "critical",
    });
  }
  if (inactive.length > 0) {
    alerts.push({
      message: `${inactive.length} student${inactive.length > 1 ? "s" : ""} inactive for more than 5 days.`,
      severity: "warning",
    });
  }
  if (lowAttendance.length > 0) {
    alerts.push({
      message: `${lowAttendance.length} student${lowAttendance.length > 1 ? "s" : ""} with attendance below 60%.`,
      severity: "info",
    });
  }

  res.json(
    GetTutorOverviewResponse.parse({
      tutorId: tutor.id,
      tutorName: tutor.name,
      avatarUrl: tutor.avatarUrl,
      headline: tutor.headline,
      totalStudents: uniqueStudents.size,
      totalCourses: courses.length,
      totalSessions: tutor.totalSessions,
      avgRating: Number(tutor.rating),
      reviewCount: tutor.reviewCount,
      totalRevenue,
      revenueThisMonth,
      revenueLastMonth,
      alerts,
    }),
  );
});

// ──────────────────────────────────────────
// GET /tutor-dashboard/students
// ──────────────────────────────────────────
router.get("/tutor-dashboard/students", async (req, res) => {
  const courses = await db
    .select()
    .from(tutorCoursesTable)
    .where(eq(tutorCoursesTable.tutorId, DEMO_TUTOR_ID));

  const courseMap = new Map(courses.map((c) => [c.id, c]));
  const courseIds = courses.map((c) => c.id);

  const enrollments =
    courseIds.length > 0
      ? await db
          .select()
          .from(courseEnrollmentsTable)
          .where(inArray(courseEnrollmentsTable.courseId, courseIds))
      : [];

  const result = enrollments.map((e) => ({
    id: e.id,
    courseId: e.courseId,
    courseTitle: courseMap.get(e.courseId)?.title ?? "Unknown Course",
    studentName: e.studentName,
    studentAvatarUrl: e.studentAvatarUrl,
    enrolledAt: e.enrolledAt.toISOString(),
    progressPct: e.progressPct,
    lastActiveAt: e.lastActiveAt.toISOString(),
    quizAvg: e.quizAvg,
    attendancePct: e.attendancePct,
    focusScore: e.focusScore,
    weakTopics: e.weakTopics ?? [],
    streakDays: e.streakDays,
  }));

  res.json(ListTutorStudentsResponse.parse(result));
});

// ──────────────────────────────────────────
// GET /tutor-dashboard/courses
// ──────────────────────────────────────────
router.get("/tutor-dashboard/courses", async (req, res) => {
  const courses = await db
    .select()
    .from(tutorCoursesTable)
    .where(eq(tutorCoursesTable.tutorId, DEMO_TUTOR_ID));

  const courseIds = courses.map((c) => c.id);
  const enrollments =
    courseIds.length > 0
      ? await db
          .select()
          .from(courseEnrollmentsTable)
          .where(inArray(courseEnrollmentsTable.courseId, courseIds))
      : [];

  const result = courses.map((c) => {
    const enrs = enrollments.filter((e) => e.courseId === c.id);
    const avgProgress =
      enrs.length > 0
        ? Math.round(enrs.reduce((s, e) => s + e.progressPct, 0) / enrs.length)
        : 0;
    return {
      id: c.id,
      title: c.title,
      subjectSlug: c.subjectSlug,
      description: c.description,
      thumbnailUrl: c.thumbnailUrl,
      priceInr: c.priceInr,
      chapterCount: c.chapterCount,
      isPublished: c.isPublished,
      enrolledCount: enrs.length,
      avgProgress,
      createdAt: c.createdAt.toISOString(),
    };
  });

  res.json(ListTutorCoursesResponse.parse(result));
});

// ──────────────────────────────────────────
// GET /tutor-dashboard/revenue
// ──────────────────────────────────────────
router.get("/tutor-dashboard/revenue", async (req, res) => {
  const now = new Date();

  // Paid bookings
  const bookings = await db
    .select()
    .from(bookingsTable)
    .where(
      and(
        eq(bookingsTable.tutorId, DEMO_TUTOR_ID),
        inArray(bookingsTable.status, ["confirmed", "completed"]),
      ),
    );

  const courses = await db
    .select()
    .from(tutorCoursesTable)
    .where(eq(tutorCoursesTable.tutorId, DEMO_TUTOR_ID));
  const courseMap = new Map(courses.map((c) => [c.id, c]));
  const courseIds = courses.map((c) => c.id);
  const enrollments =
    courseIds.length > 0
      ? await db
          .select()
          .from(courseEnrollmentsTable)
          .where(inArray(courseEnrollmentsTable.courseId, courseIds))
      : [];

  // Build monthly buckets for last 6 months
  const months: { label: string; start: Date; end: Date }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      label: d.toLocaleString("default", { month: "short", year: "2-digit" }),
      start: d,
      end: new Date(d.getFullYear(), d.getMonth() + 1, 1),
    });
  }

  const monthlyBreakdown = months.map(({ label, start, end }) => {
    const sessions = bookings
      .filter((b) => b.startsAt >= start && b.startsAt < end)
      .reduce((s, b) => s + Number(b.price), 0);
    const courses_ = enrollments
      .filter((e) => e.enrolledAt >= start && e.enrolledAt < end)
      .reduce((s, e) => {
        const c = courseMap.get(e.courseId);
        return s + (c ? c.priceInr : 0);
      }, 0);
    return { month: label, sessions, courses: courses_, total: sessions + courses_ };
  });

  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  let sessionRevenue = 0;
  let courseRevenue = 0;
  for (const b of bookings) sessionRevenue += Number(b.price);
  for (const e of enrollments) {
    const c = courseMap.get(e.courseId);
    if (c) courseRevenue += c.priceInr;
  }

  const thisMonth = monthlyBreakdown.at(-1)?.total ?? 0;
  const lastMonth = monthlyBreakdown.at(-2)?.total ?? 0;

  // Recent transactions (last 20)
  const txBookings = bookings
    .sort((a, b) => b.startsAt.getTime() - a.startsAt.getTime())
    .slice(0, 10)
    .map((b) => ({
      id: b.id,
      kind: "session" as const,
      description: `${b.subject} session with ${b.studentName}`,
      amount: Number(b.price),
      occurredAt: b.startsAt.toISOString(),
    }));

  const txCourses = enrollments
    .sort((a, b) => b.enrolledAt.getTime() - a.enrolledAt.getTime())
    .slice(0, 10)
    .map((e) => {
      const c = courseMap.get(e.courseId);
      return {
        id: e.id,
        kind: "course" as const,
        description: `${e.studentName} enrolled in ${c?.title ?? "course"}`,
        amount: c?.priceInr ?? 0,
        occurredAt: e.enrolledAt.toISOString(),
      };
    });

  const recentTransactions = [...txBookings, ...txCourses]
    .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime())
    .slice(0, 15);

  res.json(
    GetTutorRevenueResponse.parse({
      totalEarnings: sessionRevenue + courseRevenue,
      thisMonth,
      lastMonth,
      sessionRevenue,
      courseRevenue,
      monthlyBreakdown,
      recentTransactions,
    }),
  );
});

// Suppress unused import warning
void [sql, gte, lt];

export default router;
