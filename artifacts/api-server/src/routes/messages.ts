import { Router, type IRouter } from "express";
import { desc, eq, sql } from "drizzle-orm";
import {
  db,
  messagesTable,
  tutorsTable,
} from "@workspace/db";
import {
  ListMessageThreadsResponse,
  GetMessageThreadParams,
  GetMessageThreadResponse,
  SendMessageParams,
  SendMessageBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/messages/threads", async (_req, res): Promise<void> => {
  const rows = await db
    .select({
      tutorId: messagesTable.tutorId,
      lastMessage: sql<string>`(SELECT content FROM ${messagesTable} m2 WHERE m2.tutor_id = ${messagesTable.tutorId} ORDER BY m2.created_at DESC LIMIT 1)`,
      lastMessageAt: sql<Date>`MAX(${messagesTable.createdAt})`,
      unreadCount: sql<number>`0`,
    })
    .from(messagesTable)
    .groupBy(messagesTable.tutorId);

  const result = [];
  for (const r of rows) {
    const [tutor] = await db
      .select()
      .from(tutorsTable)
      .where(eq(tutorsTable.id, r.tutorId));
    if (!tutor) continue;
    result.push({
      tutorId: r.tutorId,
      tutorName: tutor.name,
      tutorAvatarUrl: tutor.avatarUrl,
      lastMessage: r.lastMessage ?? "",
      lastMessageAt:
        r.lastMessageAt instanceof Date
          ? r.lastMessageAt.toISOString()
          : new Date(r.lastMessageAt as unknown as string).toISOString(),
      unreadCount: Number(r.unreadCount ?? 0),
      isOnline: tutor.isOnline,
    });
  }

  result.sort((a, b) => b.lastMessageAt.localeCompare(a.lastMessageAt));
  res.json(ListMessageThreadsResponse.parse(result));
});

router.get("/messages/threads/:tutorId", async (req, res): Promise<void> => {
  const params = GetMessageThreadParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const rows = await db
    .select()
    .from(messagesTable)
    .where(eq(messagesTable.tutorId, params.data.tutorId))
    .orderBy(messagesTable.createdAt);
  res.json(
    GetMessageThreadResponse.parse(
      rows.map((m) => ({
        id: m.id,
        tutorId: m.tutorId,
        sender: m.sender,
        content: m.content,
        createdAt: m.createdAt.toISOString(),
      })),
    ),
  );
});

router.post("/messages/threads/:tutorId", async (req, res): Promise<void> => {
  const params = SendMessageParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const body = SendMessageBody.safeParse(req.body);
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

  const [msg] = await db
    .insert(messagesTable)
    .values({
      tutorId: params.data.tutorId,
      sender: "student",
      content: body.data.content,
    })
    .returning();

  // simulated tutor reply
  const replyTexts = [
    "Got it — I'll prepare materials before our session.",
    "Thanks for reaching out. Happy to help with that topic!",
    "Sounds good. Anything specific you'd like to focus on?",
    "Great question. Let's discuss it during our next session.",
    "Absolutely. I have some practice problems we can work through.",
  ];
  const reply = replyTexts[Math.floor(Math.random() * replyTexts.length)]!;
  setTimeout(() => {
    db.insert(messagesTable)
      .values({
        tutorId: params.data.tutorId,
        sender: "tutor",
        content: reply,
        createdAt: new Date(Date.now() + 1000),
      })
      .execute()
      .catch(() => {});
  }, 50);

  res.status(201).json({
    id: msg!.id,
    tutorId: msg!.tutorId,
    sender: msg!.sender,
    content: msg!.content,
    createdAt: msg!.createdAt.toISOString(),
  });
});

export default router;
