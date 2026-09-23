import { Router } from "express";
import { db } from "@workspace/db";
import {
  luckyRoyalRoomsTable,
  luckyRoyalEntriesTable,
  userStatsTable,
  pointsEventsTable,
} from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";

const router = Router();
const CURRENT_USER = "alex_morgan";

function mapRoom(r: typeof luckyRoyalRoomsTable.$inferSelect) {
  return {
    id: r.id,
    title: r.title,
    description: r.description,
    creatorName: r.creatorName,
    creatorAvatar: r.creatorAvatar ?? null,
    rewardTitle: r.rewardTitle,
    rewardImage: r.rewardImage ?? null,
    rewardType: r.rewardType,
    entryCredits: r.entryCredits,
    maxParticipants: r.maxParticipants,
    currentParticipants: r.currentParticipants,
    endsAt: r.endsAt.toISOString(),
    status: r.status,
    category: r.category,
    isFeatured: r.isFeatured,
    createdAt: r.createdAt.toISOString(),
  };
}

// Spin outcome resolver — probabilities hidden from users
function resolveOutcome(entryCredits: number): {
  resultType: string;
  rewardLabel: string;
  rewardAmount: number;
} {
  const roll = Math.random() * 100;
  if (roll < 8) {
    return { resultType: "win-full", rewardLabel: "You won the full reward!", rewardAmount: 0 };
  } else if (roll < 30) {
    const credits = Math.floor(Math.random() * 46) + 5; // 5-50 credits
    return { resultType: "win-credits", rewardLabel: `+${credits} Credits`, rewardAmount: credits };
  } else if (roll < 52) {
    return { resultType: "win-cashback", rewardLabel: `Cashback — ${entryCredits} Credits returned`, rewardAmount: entryCredits };
  } else if (roll < 72) {
    return { resultType: "win-discount", rewardLabel: "20% Marketplace Discount Unlocked!", rewardAmount: 0 };
  } else {
    const bonus = Math.floor(entryCredits * 0.5);
    return { resultType: "retry-bonus", rewardLabel: `Retry Bonus — +${bonus} Credits`, rewardAmount: bonus };
  }
}

// GET /lucky-royal
router.get("/lucky-royal", async (req, res) => {
  const rooms = await db
    .select()
    .from(luckyRoyalRoomsTable)
    .where(eq(luckyRoyalRoomsTable.status, "active"));
  res.json(rooms.map(mapRoom));
});

// GET /lucky-royal/:id
router.get("/lucky-royal/:id", async (req, res) => {
  const [room] = await db
    .select()
    .from(luckyRoyalRoomsTable)
    .where(eq(luckyRoyalRoomsTable.id, req.params.id ?? ""));
  if (!room) {
    res.status(404).json({ error: "Room not found" });
    return;
  }
  res.json(mapRoom(room));
});

// POST /lucky-royal/:id/spin
router.post("/lucky-royal/:id/spin", async (req, res) => {
  const [room] = await db
    .select()
    .from(luckyRoyalRoomsTable)
    .where(eq(luckyRoyalRoomsTable.id, req.params.id ?? ""));

  if (!room) {
    res.status(404).json({ error: "Room not found" });
    return;
  }
  if (room.status !== "active") {
    res.status(400).json({ error: "This room has ended." });
    return;
  }
  if (room.currentParticipants >= room.maxParticipants) {
    res.status(400).json({ error: "Room is full." });
    return;
  }

  const [stats] = await db
    .select()
    .from(userStatsTable)
    .where(eq(userStatsTable.userName, CURRENT_USER));

  const balance = stats?.points ?? 0;
  if (balance < room.entryCredits) {
    res.status(400).json({ error: `Not enough credits. Need ${room.entryCredits}, have ${balance}.` });
    return;
  }

  const outcome = resolveOutcome(room.entryCredits);

  // Deduct entry cost
  await db.insert(pointsEventsTable).values({
    userName: CURRENT_USER,
    points: -room.entryCredits,
    kind: "lucky_royal_entry",
    reference: `Entered Lucky Royal: ${room.title}`,
  });

  // Credit rewards if any
  let creditDelta = -room.entryCredits;
  if (outcome.rewardAmount > 0) {
    await db.insert(pointsEventsTable).values({
      userName: CURRENT_USER,
      points: outcome.rewardAmount,
      kind: "lucky_royal_reward",
      reference: `Lucky Royal reward: ${outcome.rewardLabel}`,
    });
    creditDelta += outcome.rewardAmount;
  }

  // Record entry
  await db.insert(luckyRoyalEntriesTable).values({
    roomId: room.id,
    userName: CURRENT_USER,
    resultType: outcome.resultType,
    rewardAmount: outcome.rewardAmount,
    rewardLabel: outcome.rewardLabel,
  });

  // Increment participants
  await db
    .update(luckyRoyalRoomsTable)
    .set({ currentParticipants: room.currentParticipants + 1 })
    .where(eq(luckyRoyalRoomsTable.id, room.id));

  const newBalance = balance + creditDelta;

  res.json({
    resultType: outcome.resultType,
    rewardLabel: outcome.rewardLabel,
    rewardAmount: outcome.rewardAmount,
    newBalance,
    message: outcome.rewardLabel,
  });
});

export default router;
