import { Router, type IRouter } from "express";
import { desc, eq, and, isNull } from "drizzle-orm";
import {
  db,
  studyRoomsTable,
  roomMembersTable,
  roomMessagesTable,
} from "@workspace/db";

const router: IRouter = Router();

const DEMO_USER = {
  userName: "alex_morgan",
  displayName: "Alex Morgan",
  avatarUrl: "https://i.pravatar.cc/200?img=5",
};

function makeRoomCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// GET /rooms — list all rooms
router.get("/rooms", async (req, res): Promise<void> => {
  const { type, status } = req.query as { type?: string; status?: string };

  const rows = await db
    .select()
    .from(studyRoomsTable)
    .orderBy(desc(studyRoomsTable.createdAt));

  const filtered = rows
    .filter((r) => !type || r.type === type)
    .filter((r) => !status || r.status === status);

  res.json(
    filtered.map((r) => ({
      id: r.id,
      title: r.title,
      type: r.type,
      hostName: r.hostName,
      hostAvatar: r.hostAvatar ?? null,
      roomCode: r.roomCode,
      isLocked: r.isLocked,
      hasPassword: !!r.password,
      maxParticipants: r.maxParticipants,
      currentParticipants: r.currentParticipants,
      scheduledAt: r.scheduledAt?.toISOString() ?? null,
      status: r.status,
      description: r.description ?? null,
      subject: r.subject ?? null,
      createdAt: r.createdAt.toISOString(),
    })),
  );
});

// POST /rooms — create a room
router.post("/rooms", async (req, res): Promise<void> => {
  const { title, type, password, maxParticipants, description, subject, scheduledAt } = req.body as {
    title: string;
    type: string;
    password?: string;
    maxParticipants?: number;
    description?: string;
    subject?: string;
    scheduledAt?: string;
  };

  if (!title || !type) {
    res.status(400).json({ error: "title and type are required" });
    return;
  }

  const [room] = await db
    .insert(studyRoomsTable)
    .values({
      title,
      type,
      hostName: DEMO_USER.displayName,
      hostAvatar: DEMO_USER.avatarUrl,
      roomCode: makeRoomCode(),
      password: password ?? null,
      isLocked: false,
      maxParticipants: maxParticipants ?? 20,
      currentParticipants: 1,
      status: scheduledAt ? "waiting" : "active",
      description: description ?? null,
      subject: subject ?? null,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
    })
    .returning();

  if (!room) {
    res.status(500).json({ error: "Failed to create room" });
    return;
  }

  // Auto-join as host
  await db.insert(roomMembersTable).values({
    roomId: room.id,
    userName: DEMO_USER.userName,
    displayName: DEMO_USER.displayName,
    avatarUrl: DEMO_USER.avatarUrl,
    role: "host",
    isMuted: false,
    isCameraOff: false,
    isHandRaised: false,
  });

  // System welcome message
  await db.insert(roomMessagesTable).values({
    roomId: room.id,
    userName: "system",
    displayName: "System",
    content: `${DEMO_USER.displayName} created this room. Welcome!`,
    type: "system",
  });

  res.status(201).json({
    id: room.id,
    title: room.title,
    type: room.type,
    hostName: room.hostName,
    hostAvatar: room.hostAvatar ?? null,
    roomCode: room.roomCode,
    isLocked: room.isLocked,
    hasPassword: !!room.password,
    maxParticipants: room.maxParticipants,
    currentParticipants: room.currentParticipants,
    scheduledAt: room.scheduledAt?.toISOString() ?? null,
    status: room.status,
    description: room.description ?? null,
    subject: room.subject ?? null,
    createdAt: room.createdAt.toISOString(),
  });
});

// GET /rooms/:roomId
router.get("/rooms/:roomId", async (req, res): Promise<void> => {
  const [room] = await db
    .select()
    .from(studyRoomsTable)
    .where(eq(studyRoomsTable.id, req.params.roomId!));

  if (!room) {
    res.status(404).json({ error: "Room not found" });
    return;
  }

  res.json({
    id: room.id,
    title: room.title,
    type: room.type,
    hostName: room.hostName,
    hostAvatar: room.hostAvatar ?? null,
    roomCode: room.roomCode,
    isLocked: room.isLocked,
    hasPassword: !!room.password,
    maxParticipants: room.maxParticipants,
    currentParticipants: room.currentParticipants,
    scheduledAt: room.scheduledAt?.toISOString() ?? null,
    status: room.status,
    description: room.description ?? null,
    subject: room.subject ?? null,
    createdAt: room.createdAt.toISOString(),
  });
});

// POST /rooms/:roomId/join
router.post("/rooms/:roomId/join", async (req, res): Promise<void> => {
  const [room] = await db
    .select()
    .from(studyRoomsTable)
    .where(eq(studyRoomsTable.id, req.params.roomId!));

  if (!room) {
    res.status(404).json({ error: "Room not found" });
    return;
  }

  if (room.isLocked) {
    res.status(403).json({ error: "Room is locked" });
    return;
  }

  const { password } = req.body as { password?: string };
  if (room.password && password !== room.password) {
    res.status(403).json({ error: "Wrong password" });
    return;
  }

  // Remove any prior leftAt entry and re-join
  await db
    .delete(roomMembersTable)
    .where(
      and(
        eq(roomMembersTable.roomId, room.id),
        eq(roomMembersTable.userName, DEMO_USER.userName),
      ),
    );

  await db.insert(roomMembersTable).values({
    roomId: room.id,
    userName: DEMO_USER.userName,
    displayName: DEMO_USER.displayName,
    avatarUrl: DEMO_USER.avatarUrl,
    role: room.hostName === DEMO_USER.displayName ? "host" : "member",
    isMuted: false,
    isCameraOff: false,
    isHandRaised: false,
  });

  await db
    .update(studyRoomsTable)
    .set({ currentParticipants: room.currentParticipants + 1, status: "active" })
    .where(eq(studyRoomsTable.id, room.id));

  const members = await db
    .select()
    .from(roomMembersTable)
    .where(and(eq(roomMembersTable.roomId, room.id), isNull(roomMembersTable.leftAt)));

  res.json({
    room: {
      ...room,
      hasPassword: !!room.password,
      scheduledAt: room.scheduledAt?.toISOString() ?? null,
      createdAt: room.createdAt.toISOString(),
      currentParticipants: room.currentParticipants + 1,
      status: "active",
    },
    members: members.map((m) => ({
      id: m.id,
      roomId: m.roomId,
      userName: m.userName,
      displayName: m.displayName,
      avatarUrl: m.avatarUrl ?? null,
      role: m.role,
      isMuted: m.isMuted,
      isCameraOff: m.isCameraOff,
      isHandRaised: m.isHandRaised,
      joinedAt: m.joinedAt.toISOString(),
    })),
  });
});

// POST /rooms/:roomId/leave
router.post("/rooms/:roomId/leave", async (req, res): Promise<void> => {
  await db
    .delete(roomMembersTable)
    .where(
      and(
        eq(roomMembersTable.roomId, req.params.roomId!),
        eq(roomMembersTable.userName, DEMO_USER.userName),
      ),
    );

  res.json({ success: true });
});

// GET /rooms/:roomId/messages
router.get("/rooms/:roomId/messages", async (req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(roomMessagesTable)
    .where(eq(roomMessagesTable.roomId, req.params.roomId!))
    .orderBy(roomMessagesTable.createdAt);

  res.json(
    rows.map((m) => ({
      id: m.id,
      roomId: m.roomId,
      userName: m.userName,
      displayName: m.displayName,
      avatarUrl: m.avatarUrl ?? null,
      content: m.content,
      type: m.type,
      createdAt: m.createdAt.toISOString(),
    })),
  );
});

// POST /rooms/:roomId/messages
router.post("/rooms/:roomId/messages", async (req, res): Promise<void> => {
  const { content, type } = req.body as { content: string; type?: string };

  if (!content) {
    res.status(400).json({ error: "content is required" });
    return;
  }

  const [msg] = await db
    .insert(roomMessagesTable)
    .values({
      roomId: req.params.roomId!,
      userName: DEMO_USER.userName,
      displayName: DEMO_USER.displayName,
      avatarUrl: DEMO_USER.avatarUrl,
      content,
      type: type ?? "text",
    })
    .returning();

  if (!msg) {
    res.status(500).json({ error: "Failed to send message" });
    return;
  }

  res.status(201).json({
    id: msg.id,
    roomId: msg.roomId,
    userName: msg.userName,
    displayName: msg.displayName,
    avatarUrl: msg.avatarUrl ?? null,
    content: msg.content,
    type: msg.type,
    createdAt: msg.createdAt.toISOString(),
  });
});

// GET /rooms/:roomId/members
router.get("/rooms/:roomId/members", async (req, res): Promise<void> => {
  const members = await db
    .select()
    .from(roomMembersTable)
    .where(and(eq(roomMembersTable.roomId, req.params.roomId!), isNull(roomMembersTable.leftAt)));

  res.json(
    members.map((m) => ({
      id: m.id,
      roomId: m.roomId,
      userName: m.userName,
      displayName: m.displayName,
      avatarUrl: m.avatarUrl ?? null,
      role: m.role,
      isMuted: m.isMuted,
      isCameraOff: m.isCameraOff,
      isHandRaised: m.isHandRaised,
      joinedAt: m.joinedAt.toISOString(),
    })),
  );
});

export default router;
