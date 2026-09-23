import { Router, type IRouter } from "express";
import { desc, eq, sql, gte } from "drizzle-orm";
import {
  db,
  userStatsTable,
  badgesTable,
  userBadgesTable,
  pointsEventsTable,
} from "@workspace/db";
import {
  GetMyGamificationResponse,
  GetLeaderboardQueryParams,
  GetLeaderboardResponse,
  ListAllBadgesResponse,
} from "@workspace/api-zod";

type LevelDef = { tier: string; label: string; min: number };

const router: IRouter = Router();

const CURRENT_USER = "Alex Morgan";
const CURRENT_USER_AVATAR = "https://i.pravatar.cc/200?img=5";

const LEVELS: LevelDef[] = [
  { tier: "beginner", label: "Beginner", min: 0 },
  { tier: "learner", label: "Learner", min: 100 },
  { tier: "contributor", label: "Contributor", min: 500 },
  { tier: "expert", label: "Expert", min: 1500 },
  { tier: "mentor", label: "Mentor", min: 5000 },
];

function levelFor(points: number) {
  let current: LevelDef = LEVELS[0]!;
  let next: LevelDef | null = null;
  for (let i = 0; i < LEVELS.length; i++) {
    if (points >= LEVELS[i]!.min) {
      current = LEVELS[i]!;
      next = LEVELS[i + 1] ?? null;
    }
  }
  const currentLevelPoints = current.min;
  const nextLevelPoints = next ? next.min : null;
  const progressPct = nextLevelPoints
    ? Math.max(
        0,
        Math.min(
          100,
          ((points - currentLevelPoints) /
            (nextLevelPoints - currentLevelPoints)) *
            100,
        ),
      )
    : 100;
  return {
    tier: current.tier,
    label: current.label,
    currentLevelPoints,
    nextLevelPoints,
    progressPct: Math.round(progressPct * 10) / 10,
  };
}

async function getAggregatePoints(
  userName: string,
): Promise<{ total: number; week: number; today: number }> {
  const now = new Date();
  const startOfDay = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  const startOfWeek = new Date(startOfDay);
  startOfWeek.setUTCDate(startOfWeek.getUTCDate() - 7);

  const [totalRow] = await db
    .select({
      total: sql<number>`coalesce(sum(${pointsEventsTable.points}), 0)`.mapWith(
        Number,
      ),
    })
    .from(pointsEventsTable)
    .where(eq(pointsEventsTable.userName, userName));
  const [weekRow] = await db
    .select({
      total: sql<number>`coalesce(sum(${pointsEventsTable.points}), 0)`.mapWith(
        Number,
      ),
    })
    .from(pointsEventsTable)
    .where(
      sql`${pointsEventsTable.userName} = ${userName} and ${pointsEventsTable.awardedAt} >= ${startOfWeek.toISOString()}`,
    );
  const [todayRow] = await db
    .select({
      total: sql<number>`coalesce(sum(${pointsEventsTable.points}), 0)`.mapWith(
        Number,
      ),
    })
    .from(pointsEventsTable)
    .where(
      sql`${pointsEventsTable.userName} = ${userName} and ${pointsEventsTable.awardedAt} >= ${startOfDay.toISOString()}`,
    );

  return {
    total: totalRow?.total ?? 0,
    week: weekRow?.total ?? 0,
    today: todayRow?.total ?? 0,
  };
}

router.get("/gamification/me", async (_req, res): Promise<void> => {
  let [stats] = await db
    .select()
    .from(userStatsTable)
    .where(eq(userStatsTable.userName, CURRENT_USER));
  if (!stats) {
    [stats] = await db
      .insert(userStatsTable)
      .values({
        userName: CURRENT_USER,
        avatarUrl: CURRENT_USER_AVATAR,
        points: 0,
        currentStreak: 0,
        longestStreak: 0,
      })
      .returning();
    if (!stats) {
      res.status(500).json({ error: "Failed to create stats" });
      return;
    }
  }

  const points = await getAggregatePoints(CURRENT_USER);
  const totalPoints = points.total + stats.points; // seeded base + events
  const level = levelFor(totalPoints);

  // Rank
  const allRanks = await db
    .select({
      userName: userStatsTable.userName,
      points: userStatsTable.points,
    })
    .from(userStatsTable);
  const eventTotals = new Map<string, number>();
  for (const u of allRanks) {
    const sums = await db
      .select({
        total:
          sql<number>`coalesce(sum(${pointsEventsTable.points}), 0)`.mapWith(
            Number,
          ),
      })
      .from(pointsEventsTable)
      .where(eq(pointsEventsTable.userName, u.userName));
    eventTotals.set(u.userName, (sums[0]?.total ?? 0) + u.points);
  }
  const sortedRanks = [...allRanks]
    .map((u) => ({ userName: u.userName, points: eventTotals.get(u.userName) ?? 0 }))
    .sort((a, b) => b.points - a.points);
  const rankAllTime =
    sortedRanks.findIndex((r) => r.userName === CURRENT_USER) + 1;

  const earned = await db
    .select()
    .from(userBadgesTable)
    .where(eq(userBadgesTable.userName, CURRENT_USER));
  const badgeCodes = earned.map((e) => e.badgeCode);
  const badgesData =
    badgeCodes.length > 0
      ? await db.select().from(badgesTable)
      : [];
  const earnedDetails = badgesData
    .filter((b) => badgeCodes.includes(b.code))
    .map((b) => {
      const e = earned.find((x) => x.badgeCode === b.code)!;
      return { ...b, earnedAt: e.earnedAt.toISOString() };
    });

  const recentEvents = await db
    .select()
    .from(pointsEventsTable)
    .where(eq(pointsEventsTable.userName, CURRENT_USER))
    .orderBy(desc(pointsEventsTable.awardedAt))
    .limit(10);

  res.json(
    GetMyGamificationResponse.parse({
      userName: stats.userName,
      avatarUrl: stats.avatarUrl,
      points: totalPoints,
      level,
      currentStreak: stats.currentStreak,
      longestStreak: stats.longestStreak,
      rankAllTime: rankAllTime || 1,
      pointsThisWeek: points.week,
      pointsToday: points.today,
      badges: earnedDetails,
      recentEvents: recentEvents.map((e) => ({
        id: e.id,
        kind: e.kind,
        points: e.points,
        reference: e.reference,
        awardedAt: e.awardedAt.toISOString(),
      })),
    }),
  );
});

router.get("/gamification/leaderboard", async (req, res): Promise<void> => {
  const params = GetLeaderboardQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const period = params.data.period ?? "allTime";

  const allUsers = await db.select().from(userStatsTable);

  let cutoff: Date | null = null;
  const now = new Date();
  if (period === "daily") {
    cutoff = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
    );
  } else if (period === "weekly") {
    cutoff = new Date(now);
    cutoff.setUTCDate(cutoff.getUTCDate() - 7);
  } else if (period === "monthly") {
    cutoff = new Date(now);
    cutoff.setUTCDate(cutoff.getUTCDate() - 30);
  }

  const totals: { userName: string; avatarUrl: string; points: number }[] = [];
  for (const u of allUsers) {
    let total = 0;
    if (period === "allTime") {
      const [row] = await db
        .select({
          t: sql<number>`coalesce(sum(${pointsEventsTable.points}), 0)`.mapWith(
            Number,
          ),
        })
        .from(pointsEventsTable)
        .where(eq(pointsEventsTable.userName, u.userName));
      total = (row?.t ?? 0) + u.points;
    } else {
      const [row] = await db
        .select({
          t: sql<number>`coalesce(sum(${pointsEventsTable.points}), 0)`.mapWith(
            Number,
          ),
        })
        .from(pointsEventsTable)
        .where(
          sql`${pointsEventsTable.userName} = ${u.userName} and ${pointsEventsTable.awardedAt} >= ${cutoff!.toISOString()}`,
        );
      total = row?.t ?? 0;
    }
    totals.push({ userName: u.userName, avatarUrl: u.avatarUrl, points: total });
  }

  const sorted = totals
    .filter((t) => t.points > 0 || period === "allTime")
    .sort((a, b) => b.points - a.points)
    .slice(0, 50);

  const ranked = sorted.map((t, i) => {
    const totalPoints =
      period === "allTime"
        ? t.points
        : (allUsers.find((u) => u.userName === t.userName)?.points ?? 0) +
          t.points;
    return {
      rank: i + 1,
      userName: t.userName,
      avatarUrl: t.avatarUrl,
      points: t.points,
      levelLabel: levelFor(totalPoints).label,
      isMe: t.userName === CURRENT_USER,
    };
  });

  res.json(GetLeaderboardResponse.parse(ranked));
  void gte;
});

router.get("/gamification/badges", async (_req, res): Promise<void> => {
  const rows = await db.select().from(badgesTable);
  res.json(
    ListAllBadgesResponse.parse(
      rows.map((b) => ({
        code: b.code,
        name: b.name,
        description: b.description,
        icon: b.icon,
        tier: b.tier,
        threshold: b.threshold,
      })),
    ),
  );
});

export default router;
