import { Router, type IRouter } from "express";
import { and, desc, asc, eq, gte, lte, sql, or, ilike } from "drizzle-orm";
import {
  db,
  tutorsTable,
  availabilityTable,
  reviewsTable,
} from "@workspace/db";
import {
  ListTutorsQueryParams,
  ListTutorsResponse,
  ListFeaturedTutorsResponse,
  GetTutorParams,
  GetTutorResponse,
  ListTutorReviewsParams,
  ListTutorReviewsResponse,
  CreateTutorReviewParams,
  CreateTutorReviewBody,
  GetTutorAvailabilityParams,
  GetTutorAvailabilityResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

const STUDENT_AVATARS = [
  "https://i.pravatar.cc/120?img=11",
  "https://i.pravatar.cc/120?img=22",
  "https://i.pravatar.cc/120?img=33",
];

function tutorRowToSummary(row: typeof tutorsTable.$inferSelect) {
  return {
    id: row.id,
    name: row.name,
    headline: row.headline,
    avatarUrl: row.avatarUrl,
    subjects: row.subjects,
    hourlyRate: Number(row.hourlyRate),
    rating: Number(row.rating),
    reviewCount: row.reviewCount,
    yearsExperience: row.yearsExperience,
    languages: row.languages,
    location: row.location,
    isOnline: row.isOnline,
  };
}

router.get("/tutors", async (req, res): Promise<void> => {
  const parsed = ListTutorsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { q, subject, day, minRating, maxPrice, sort } = parsed.data;

  const filters = [];
  if (q) {
    filters.push(
      or(
        ilike(tutorsTable.name, `%${q}%`),
        ilike(tutorsTable.headline, `%${q}%`),
        ilike(tutorsTable.bio, `%${q}%`),
      )!,
    );
  }
  if (subject) {
    filters.push(sql`${subject} = ANY(${tutorsTable.subjects})`);
  }
  if (typeof minRating === "number") {
    filters.push(gte(tutorsTable.rating, String(minRating)));
  }
  if (typeof maxPrice === "number") {
    filters.push(lte(tutorsTable.hourlyRate, String(maxPrice)));
  }
  if (day) {
    filters.push(
      sql`EXISTS (SELECT 1 FROM ${availabilityTable} a WHERE a.tutor_id = ${tutorsTable.id} AND a.day = ${day})`,
    );
  }

  let orderBy;
  switch (sort) {
    case "rating":
      orderBy = [desc(tutorsTable.rating), desc(tutorsTable.reviewCount)];
      break;
    case "priceAsc":
      orderBy = [asc(tutorsTable.hourlyRate)];
      break;
    case "priceDesc":
      orderBy = [desc(tutorsTable.hourlyRate)];
      break;
    case "experience":
      orderBy = [desc(tutorsTable.yearsExperience)];
      break;
    default:
      orderBy = [desc(tutorsTable.rating), desc(tutorsTable.totalSessions)];
  }

  const rows = await db
    .select()
    .from(tutorsTable)
    .where(filters.length ? and(...filters) : undefined)
    .orderBy(...orderBy);

  res.json(ListTutorsResponse.parse(rows.map(tutorRowToSummary)));
});

router.get("/tutors/featured", async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(tutorsTable)
    .orderBy(desc(tutorsTable.rating), desc(tutorsTable.totalSessions))
    .limit(6);
  res.json(ListFeaturedTutorsResponse.parse(rows.map(tutorRowToSummary)));
});

router.get("/tutors/:tutorId", async (req, res): Promise<void> => {
  const params = GetTutorParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [row] = await db
    .select()
    .from(tutorsTable)
    .where(eq(tutorsTable.id, params.data.tutorId));
  if (!row) {
    res.status(404).json({ error: "Tutor not found" });
    return;
  }
  const availability = await db
    .select()
    .from(availabilityTable)
    .where(eq(availabilityTable.tutorId, row.id));

  const tutor = {
    ...tutorRowToSummary(row),
    bio: row.bio,
    education: row.education,
    responseTimeMinutes: row.responseTimeMinutes,
    totalSessions: row.totalSessions,
    availability: availability.map((a) => ({
      day: a.day,
      startHour: a.startHour,
      endHour: a.endHour,
    })),
  };
  res.json(GetTutorResponse.parse(tutor));
});

router.get("/tutors/:tutorId/reviews", async (req, res): Promise<void> => {
  const params = ListTutorReviewsParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const rows = await db
    .select()
    .from(reviewsTable)
    .where(eq(reviewsTable.tutorId, params.data.tutorId))
    .orderBy(desc(reviewsTable.createdAt));
  res.json(ListTutorReviewsResponse.parse(rows));
});

router.post("/tutors/:tutorId/reviews", async (req, res): Promise<void> => {
  const params = CreateTutorReviewParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const body = CreateTutorReviewBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const [tutor] = await db
    .select()
    .from(tutorsTable)
    .where(eq(tutorsTable.id, params.data.tutorId));
  if (!tutor) {
    res.status(404).json({ error: "Tutor not found" });
    return;
  }

  const avatar =
    STUDENT_AVATARS[Math.floor(Math.random() * STUDENT_AVATARS.length)]!;

  const [review] = await db
    .insert(reviewsTable)
    .values({
      tutorId: params.data.tutorId,
      studentName: body.data.studentName,
      studentAvatarUrl: avatar,
      rating: body.data.rating,
      comment: body.data.comment,
    })
    .returning();

  // recalc tutor rating/count
  const [agg] = await db
    .select({
      avg: sql<string>`AVG(${reviewsTable.rating})::numeric(3,2)`,
      count: sql<number>`COUNT(*)::int`,
    })
    .from(reviewsTable)
    .where(eq(reviewsTable.tutorId, params.data.tutorId));

  if (agg) {
    await db
      .update(tutorsTable)
      .set({
        rating: agg.avg ?? "0",
        reviewCount: Number(agg.count),
      })
      .where(eq(tutorsTable.id, params.data.tutorId));
  }

  res.status(201).json(review);
});

router.get("/tutors/:tutorId/availability", async (req, res): Promise<void> => {
  const params = GetTutorAvailabilityParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const rows = await db
    .select()
    .from(availabilityTable)
    .where(eq(availabilityTable.tutorId, params.data.tutorId));

  if (rows.length === 0) {
    res.json([]);
    return;
  }

  const dayMap: Record<string, number> = {
    sun: 0,
    mon: 1,
    tue: 2,
    wed: 3,
    thu: 4,
    fri: 5,
    sat: 6,
  };

  const slots: { startsAt: string; endsAt: string }[] = [];
  const now = new Date();
  now.setMinutes(0, 0, 0);

  for (let dayOffset = 0; dayOffset < 14; dayOffset++) {
    const d = new Date(now);
    d.setDate(now.getDate() + dayOffset);
    const dow = d.getDay();
    for (const win of rows) {
      if (dayMap[win.day] !== dow) continue;
      for (let h = win.startHour; h + 1 <= win.endHour; h++) {
        const start = new Date(d);
        start.setHours(h, 0, 0, 0);
        if (start.getTime() <= now.getTime()) continue;
        const end = new Date(start);
        end.setHours(h + 1);
        slots.push({
          startsAt: start.toISOString(),
          endsAt: end.toISOString(),
        });
      }
    }
  }

  slots.sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  res.json(GetTutorAvailabilityResponse.parse(slots.slice(0, 60)));
});

export default router;
