import { Router, type IRouter } from "express";
import { and, desc, eq, gte, lt, inArray } from "drizzle-orm";
import {
  db,
  bookingsTable,
  tutorsTable,
  notificationsTable,
} from "@workspace/db";
import {
  ListBookingsQueryParams,
  ListBookingsResponse,
  CreateBookingBody,
  GetBookingParams,
  GetBookingResponse,
  UpdateBookingParams,
  UpdateBookingBody,
  UpdateBookingResponse,
  PayForBookingParams,
  PayForBookingBody,
  PayForBookingResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

async function hydrateBooking(row: typeof bookingsTable.$inferSelect) {
  const [tutor] = await db
    .select()
    .from(tutorsTable)
    .where(eq(tutorsTable.id, row.tutorId));
  return {
    id: row.id,
    tutorId: row.tutorId,
    tutorName: tutor?.name ?? "Unknown tutor",
    tutorAvatarUrl: tutor?.avatarUrl ?? "",
    studentName: row.studentName,
    subject: row.subject,
    startsAt: row.startsAt.toISOString(),
    endsAt: row.endsAt.toISOString(),
    durationMinutes: row.durationMinutes,
    price: Number(row.price),
    status: row.status,
    notes: row.notes,
    createdAt: row.createdAt.toISOString(),
  };
}

router.get("/bookings", async (req, res): Promise<void> => {
  const parsed = ListBookingsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { status } = parsed.data;
  const now = new Date();

  let where;
  if (status === "upcoming") {
    where = and(
      gte(bookingsTable.startsAt, now),
      inArray(bookingsTable.status, ["pending_payment", "confirmed"]),
    );
  } else if (status === "completed") {
    where = eq(bookingsTable.status, "completed");
  } else if (status === "cancelled") {
    where = eq(bookingsTable.status, "cancelled");
  }

  const rows = await db
    .select()
    .from(bookingsTable)
    .where(where)
    .orderBy(desc(bookingsTable.startsAt));

  const result = await Promise.all(rows.map(hydrateBooking));
  res.json(ListBookingsResponse.parse(result));
});

router.post("/bookings", async (req, res): Promise<void> => {
  const body = CreateBookingBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }
  const [tutor] = await db
    .select()
    .from(tutorsTable)
    .where(eq(tutorsTable.id, body.data.tutorId));
  if (!tutor) {
    res.status(404).json({ error: "Tutor not found" });
    return;
  }
  const startsAt = new Date(body.data.startsAt);
  const endsAt = new Date(
    startsAt.getTime() + body.data.durationMinutes * 60_000,
  );
  const price = (Number(tutor.hourlyRate) * body.data.durationMinutes) / 60;

  const [row] = await db
    .insert(bookingsTable)
    .values({
      tutorId: body.data.tutorId,
      studentName: body.data.studentName,
      subject: body.data.subject,
      startsAt,
      endsAt,
      durationMinutes: body.data.durationMinutes,
      price: price.toFixed(2),
      status: "pending_payment",
      notes: body.data.notes ?? "",
    })
    .returning();

  await db.insert(notificationsTable).values({
    type: "booking_confirmed",
    title: "Session reserved",
    body: `Your ${body.data.subject} session with ${tutor.name} is reserved. Complete payment to confirm.`,
    link: `/bookings/${row!.id}`,
  });

  const hydrated = await hydrateBooking(row!);
  res.status(201).json(GetBookingResponse.parse(hydrated));
});

router.get("/bookings/:bookingId", async (req, res): Promise<void> => {
  const params = GetBookingParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [row] = await db
    .select()
    .from(bookingsTable)
    .where(eq(bookingsTable.id, params.data.bookingId));
  if (!row) {
    res.status(404).json({ error: "Booking not found" });
    return;
  }
  res.json(GetBookingResponse.parse(await hydrateBooking(row)));
});

router.patch("/bookings/:bookingId", async (req, res): Promise<void> => {
  const params = UpdateBookingParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const body = UpdateBookingBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }
  const updates: Record<string, unknown> = {};
  if (body.data.status) updates.status = body.data.status;
  if (typeof body.data.notes === "string") updates.notes = body.data.notes;

  const [row] = await db
    .update(bookingsTable)
    .set(updates)
    .where(eq(bookingsTable.id, params.data.bookingId))
    .returning();

  if (!row) {
    res.status(404).json({ error: "Booking not found" });
    return;
  }
  res.json(UpdateBookingResponse.parse(await hydrateBooking(row)));
});

router.post("/bookings/:bookingId/pay", async (req, res): Promise<void> => {
  const params = PayForBookingParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const body = PayForBookingBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const [row] = await db
    .select()
    .from(bookingsTable)
    .where(eq(bookingsTable.id, params.data.bookingId));
  if (!row) {
    res.status(404).json({ error: "Booking not found" });
    return;
  }

  await db
    .update(bookingsTable)
    .set({ status: "confirmed" })
    .where(eq(bookingsTable.id, params.data.bookingId));

  const [tutor] = await db
    .select()
    .from(tutorsTable)
    .where(eq(tutorsTable.id, row.tutorId));

  await db.insert(notificationsTable).values({
    type: "booking_confirmed",
    title: "Payment confirmed",
    body: `Your booking with ${tutor?.name ?? "your tutor"} is confirmed. We'll remind you before the session starts.`,
    link: `/bookings/${row.id}`,
  });

  const result = {
    bookingId: row.id,
    status: "paid",
    receiptId: `RCPT-${row.id.slice(0, 8).toUpperCase()}`,
    paidAt: new Date().toISOString(),
    amount: Number(row.price),
  };

  // suppress unused linter
  void body.data;
  // mark old upcoming sessions completed if past
  await db
    .update(bookingsTable)
    .set({ status: "completed" })
    .where(
      and(
        eq(bookingsTable.status, "confirmed"),
        lt(bookingsTable.endsAt, new Date()),
      ),
    );

  res.json(PayForBookingResponse.parse(result));
});

export default router;
