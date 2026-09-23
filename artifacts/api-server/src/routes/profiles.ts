import { Router, type IRouter } from "express";
import { and, desc, eq, sql, inArray } from "drizzle-orm";
import {
  db,
  profilesTable,
  followsTable,
  userStatsTable,
  badgesTable,
  userBadgesTable,
  pointsEventsTable,
  questionsTable,
  answersTable,
  reelsTable,
  votesTable,
} from "@workspace/db";
import {
  GetProfileParams,
  GetProfileResponse,
  UpdateMyProfileBody,
  GetMyProfileResponse,
  UpdateMyProfileResponse,
  FollowUserParams,
  FollowUserResponse,
  UnfollowUserParams,
  UnfollowUserResponse,
  ListFollowersParams,
  ListFollowersResponse,
  ListFollowingParams,
  ListFollowingResponse,
  ListProfileActivityParams,
  ListProfileActivityResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

const CURRENT_USER = "Alex Morgan";
const CURRENT_USER_AVATAR = "https://i.pravatar.cc/200?img=5";

type LevelDef = { tier: string; label: string; min: number };
const LEVELS: LevelDef[] = [
  { tier: "beginner", label: "Beginner", min: 0 },
  { tier: "learner", label: "Learner", min: 100 },
  { tier: "contributor", label: "Contributor", min: 500 },
  { tier: "expert", label: "Expert", min: 1500 },
  { tier: "mentor", label: "Mentor", min: 5000 },
];

function levelFor(points: number): { tier: string; label: string } {
  let current: LevelDef = LEVELS[0]!;
  for (let i = 0; i < LEVELS.length; i++) {
    if (points >= LEVELS[i]!.min) {
      current = LEVELS[i]!;
    }
  }
  return { tier: current.tier, label: current.label };
}

async function totalPointsFor(userName: string): Promise<number> {
  const [base] = await db
    .select({ p: userStatsTable.points })
    .from(userStatsTable)
    .where(eq(userStatsTable.userName, userName));
  const [evt] = await db
    .select({
      t: sql<number>`coalesce(sum(${pointsEventsTable.points}), 0)`.mapWith(
        Number,
      ),
    })
    .from(pointsEventsTable)
    .where(eq(pointsEventsTable.userName, userName));
  return (base?.p ?? 0) + (evt?.t ?? 0);
}

async function rankAllTimeFor(userName: string): Promise<number> {
  const all = await db.select().from(userStatsTable);
  const totals: { name: string; points: number }[] = [];
  for (const u of all) {
    const total = await totalPointsFor(u.userName);
    totals.push({ name: u.userName, points: total });
  }
  totals.sort((a, b) => b.points - a.points);
  const idx = totals.findIndex((t) => t.name === userName);
  return idx >= 0 ? idx + 1 : totals.length + 1;
}

async function ensureMyProfile() {
  let [profile] = await db
    .select()
    .from(profilesTable)
    .where(eq(profilesTable.userName, CURRENT_USER));
  if (!profile) {
    [profile] = await db
      .insert(profilesTable)
      .values({
        userName: CURRENT_USER,
        displayName: CURRENT_USER,
        avatarUrl: CURRENT_USER_AVATAR,
        bio: "",
        course: "",
        college: "",
        yearOfStudy: "",
        location: "",
        subjects: [],
        skills: [],
        interests: [],
        activities: [],
      })
      .returning();
  }
  return profile!;
}

function serializeProfile(p: typeof profilesTable.$inferSelect) {
  return {
    userName: p.userName,
    displayName: p.displayName,
    avatarUrl: p.avatarUrl,
    bio: p.bio,
    course: p.course,
    college: p.college,
    yearOfStudy: p.yearOfStudy,
    location: p.location,
    subjects: p.subjects ?? [],
    skills: p.skills ?? [],
    interests: p.interests ?? [],
    activities: p.activities ?? [],
    isPrivate: p.isPrivate,
    joinedAt: p.joinedAt.toISOString(),
  };
}

router.get("/profiles/me", async (_req, res): Promise<void> => {
  const profile = await ensureMyProfile();
  res.json(GetMyProfileResponse.parse(serializeProfile(profile)));
});

router.patch("/profiles/me", async (req, res): Promise<void> => {
  const body = UpdateMyProfileBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }
  await ensureMyProfile();
  const [updated] = await db
    .update(profilesTable)
    .set({
      ...(body.data.bio !== undefined && { bio: body.data.bio }),
      ...(body.data.course !== undefined && { course: body.data.course }),
      ...(body.data.college !== undefined && { college: body.data.college }),
      ...(body.data.yearOfStudy !== undefined && {
        yearOfStudy: body.data.yearOfStudy,
      }),
      ...(body.data.location !== undefined && { location: body.data.location }),
      ...(body.data.subjects !== undefined && { subjects: body.data.subjects }),
      ...(body.data.skills !== undefined && { skills: body.data.skills }),
      ...(body.data.interests !== undefined && {
        interests: body.data.interests,
      }),
      ...(body.data.activities !== undefined && {
        activities: body.data.activities,
      }),
      ...(body.data.isPrivate !== undefined && {
        isPrivate: body.data.isPrivate,
      }),
    })
    .where(eq(profilesTable.userName, CURRENT_USER))
    .returning();
  if (!updated) {
    res.status(500).json({ error: "Failed to update profile" });
    return;
  }
  res.json(UpdateMyProfileResponse.parse(serializeProfile(updated)));
});

router.get("/profiles/:userName", async (req, res): Promise<void> => {
  const params = GetProfileParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const userName = decodeURIComponent(params.data.userName);

  const [profile] = await db
    .select()
    .from(profilesTable)
    .where(eq(profilesTable.userName, userName));
  if (!profile) {
    res.status(404).json({ error: "Profile not found" });
    return;
  }

  const [stats] = await db
    .select()
    .from(userStatsTable)
    .where(eq(userStatsTable.userName, userName));

  const points = await totalPointsFor(userName);
  const level = levelFor(points);
  const rank = await rankAllTimeFor(userName);

  // Counts
  const [followerRow] = await db
    .select({ c: sql<number>`count(*)`.mapWith(Number) })
    .from(followsTable)
    .where(eq(followsTable.followeeName, userName));
  const [followingRow] = await db
    .select({ c: sql<number>`count(*)`.mapWith(Number) })
    .from(followsTable)
    .where(eq(followsTable.followerName, userName));

  const [followLink] =
    userName === CURRENT_USER
      ? [undefined]
      : await db
          .select()
          .from(followsTable)
          .where(
            and(
              eq(followsTable.followerName, CURRENT_USER),
              eq(followsTable.followeeName, userName),
            ),
          );

  const [qCountRow] = await db
    .select({ c: sql<number>`count(*)`.mapWith(Number) })
    .from(questionsTable)
    .where(eq(questionsTable.authorName, userName));
  const [aCountRow] = await db
    .select({ c: sql<number>`count(*)`.mapWith(Number) })
    .from(answersTable)
    .where(eq(answersTable.authorName, userName));
  // Best answers = answers by this user that are marked as best on their question
  const myAnswerIdsForBest = await db
    .select({ id: answersTable.id })
    .from(answersTable)
    .where(eq(answersTable.authorName, userName));
  const myAnswerIds = myAnswerIdsForBest.map((a) => a.id);
  let bestCount = 0;
  if (myAnswerIds.length > 0) {
    const [r] = await db
      .select({ c: sql<number>`count(*)`.mapWith(Number) })
      .from(questionsTable)
      .where(inArray(questionsTable.bestAnswerId, myAnswerIds));
    bestCount = r?.c ?? 0;
  }
  const bestRow = { c: bestCount };
  const [reelCountRow] = await db
    .select({ c: sql<number>`count(*)`.mapWith(Number) })
    .from(reelsTable)
    .where(eq(reelsTable.authorName, userName));

  // Upvotes received: count votes on questions and answers authored by user with value > 0
  const myQuestions = await db
    .select({ id: questionsTable.id })
    .from(questionsTable)
    .where(eq(questionsTable.authorName, userName));
  const myAnswers = await db
    .select({ id: answersTable.id })
    .from(answersTable)
    .where(eq(answersTable.authorName, userName));
  const qIds = myQuestions.map((q) => q.id);
  const aIds = myAnswers.map((a) => a.id);
  let upvotesReceived = 0;
  if (qIds.length > 0) {
    const [r] = await db
      .select({
        t: sql<number>`coalesce(sum(case when ${votesTable.value} > 0 then ${votesTable.value} else 0 end), 0)`.mapWith(
          Number,
        ),
      })
      .from(votesTable)
      .where(
        and(
          eq(votesTable.targetType, "question"),
          inArray(votesTable.targetId, qIds),
        ),
      );
    upvotesReceived += r?.t ?? 0;
  }
  if (aIds.length > 0) {
    const [r] = await db
      .select({
        t: sql<number>`coalesce(sum(case when ${votesTable.value} > 0 then ${votesTable.value} else 0 end), 0)`.mapWith(
          Number,
        ),
      })
      .from(votesTable)
      .where(
        and(
          eq(votesTable.targetType, "answer"),
          inArray(votesTable.targetId, aIds),
        ),
      );
    upvotesReceived += r?.t ?? 0;
  }

  // Badges
  const earned = await db
    .select()
    .from(userBadgesTable)
    .where(eq(userBadgesTable.userName, userName));
  const codes = earned.map((e) => e.badgeCode);
  const allBadges = codes.length > 0 ? await db.select().from(badgesTable) : [];
  const badges = allBadges
    .filter((b) => codes.includes(b.code))
    .map((b) => {
      const e = earned.find((x) => x.badgeCode === b.code)!;
      return {
        code: b.code,
        name: b.name,
        description: b.description,
        icon: b.icon,
        tier: b.tier,
        threshold: b.threshold,
        earnedAt: e.earnedAt.toISOString(),
      };
    });

  res.json(
    GetProfileResponse.parse({
      profile: serializeProfile(profile),
      points,
      levelLabel: level.label,
      levelTier: level.tier,
      currentStreak: stats?.currentStreak ?? 0,
      longestStreak: stats?.longestStreak ?? 0,
      followerCount: followerRow?.c ?? 0,
      followingCount: followingRow?.c ?? 0,
      isFollowedByMe: !!followLink,
      isMe: userName === CURRENT_USER,
      analytics: {
        questionsAsked: qCountRow?.c ?? 0,
        answersGiven: aCountRow?.c ?? 0,
        bestAnswers: bestRow?.c ?? 0,
        reelsPosted: reelCountRow?.c ?? 0,
        upvotesReceived,
        rankAllTime: rank,
      },
      badges,
    }),
  );
});

async function summarizeUsers(userNames: string[]) {
  if (userNames.length === 0) return [];
  const profiles = await db
    .select()
    .from(profilesTable)
    .where(inArray(profilesTable.userName, userNames));
  const myFollows = await db
    .select()
    .from(followsTable)
    .where(
      and(
        eq(followsTable.followerName, CURRENT_USER),
        inArray(followsTable.followeeName, userNames),
      ),
    );
  const followingSet = new Set(myFollows.map((f) => f.followeeName));
  const out = [];
  for (const p of profiles) {
    const points = await totalPointsFor(p.userName);
    out.push({
      userName: p.userName,
      displayName: p.displayName,
      avatarUrl: p.avatarUrl,
      bio: p.bio,
      course: p.course,
      college: p.college,
      points,
      levelLabel: levelFor(points).label,
      isFollowedByMe: followingSet.has(p.userName),
    });
  }
  return out;
}

router.post("/profiles/:userName/follow", async (req, res): Promise<void> => {
  const params = FollowUserParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const userName = decodeURIComponent(params.data.userName);
  if (userName === CURRENT_USER) {
    res.status(400).json({ error: "Cannot follow yourself" });
    return;
  }
  const [target] = await db
    .select()
    .from(profilesTable)
    .where(eq(profilesTable.userName, userName));
  if (!target) {
    res.status(404).json({ error: "Profile not found" });
    return;
  }
  await db
    .insert(followsTable)
    .values({ followerName: CURRENT_USER, followeeName: userName })
    .onConflictDoNothing();
  const [row] = await db
    .select({ c: sql<number>`count(*)`.mapWith(Number) })
    .from(followsTable)
    .where(eq(followsTable.followeeName, userName));
  res.json(
    FollowUserResponse.parse({
      userName,
      isFollowedByMe: true,
      followerCount: row?.c ?? 0,
    }),
  );
});

router.delete("/profiles/:userName/follow", async (req, res): Promise<void> => {
  const params = UnfollowUserParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const userName = decodeURIComponent(params.data.userName);
  await db
    .delete(followsTable)
    .where(
      and(
        eq(followsTable.followerName, CURRENT_USER),
        eq(followsTable.followeeName, userName),
      ),
    );
  const [row] = await db
    .select({ c: sql<number>`count(*)`.mapWith(Number) })
    .from(followsTable)
    .where(eq(followsTable.followeeName, userName));
  res.json(
    UnfollowUserResponse.parse({
      userName,
      isFollowedByMe: false,
      followerCount: row?.c ?? 0,
    }),
  );
});

router.get("/profiles/:userName/followers", async (req, res): Promise<void> => {
  const params = ListFollowersParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const userName = decodeURIComponent(params.data.userName);
  const rows = await db
    .select({ name: followsTable.followerName })
    .from(followsTable)
    .where(eq(followsTable.followeeName, userName))
    .orderBy(desc(followsTable.createdAt));
  const summaries = await summarizeUsers(rows.map((r) => r.name));
  res.json(ListFollowersResponse.parse(summaries));
});

router.get("/profiles/:userName/following", async (req, res): Promise<void> => {
  const params = ListFollowingParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const userName = decodeURIComponent(params.data.userName);
  const rows = await db
    .select({ name: followsTable.followeeName })
    .from(followsTable)
    .where(eq(followsTable.followerName, userName))
    .orderBy(desc(followsTable.createdAt));
  const summaries = await summarizeUsers(rows.map((r) => r.name));
  res.json(ListFollowingResponse.parse(summaries));
});

router.get("/profiles/:userName/activity", async (req, res): Promise<void> => {
  const params = ListProfileActivityParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const userName = decodeURIComponent(params.data.userName);
  const qs = await db
    .select()
    .from(questionsTable)
    .where(eq(questionsTable.authorName, userName))
    .orderBy(desc(questionsTable.createdAt))
    .limit(10);
  const ans = await db
    .select()
    .from(answersTable)
    .where(eq(answersTable.authorName, userName))
    .orderBy(desc(answersTable.createdAt))
    .limit(10);
  const rls = await db
    .select()
    .from(reelsTable)
    .where(eq(reelsTable.authorName, userName))
    .orderBy(desc(reelsTable.createdAt))
    .limit(10);

  const qById = new Map<string, typeof questionsTable.$inferSelect>();
  if (ans.length > 0) {
    const ids = ans.map((a) => a.questionId);
    const qRows = await db
      .select()
      .from(questionsTable)
      .where(inArray(questionsTable.id, ids));
    for (const q of qRows) qById.set(q.id, q);
  }
  const bestSet = new Set(
    Array.from(qById.values())
      .map((q) => q.bestAnswerId)
      .filter((x): x is string => !!x),
  );

  const items = [
    ...qs.map((q) => ({
      id: q.id,
      kind: "question" as const,
      title: q.title,
      subtitle: "Asked a question",
      href: `/qna/${q.id}`,
      createdAt: q.createdAt.toISOString(),
    })),
    ...ans.map((a) => {
      const q = qById.get(a.questionId);
      return {
        id: a.id,
        kind: "answer" as const,
        title: q?.title ?? "Answered a question",
        subtitle: bestSet.has(a.id) ? "Best answer" : "Posted an answer",
        href: `/qna/${a.questionId}`,
        createdAt: a.createdAt.toISOString(),
      };
    }),
    ...rls.map((r) => ({
      id: r.id,
      kind: "reel" as const,
      title: r.title,
      subtitle: "Posted a reel",
      href: `/reels`,
      createdAt: r.createdAt.toISOString(),
    })),
  ].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  res.json(ListProfileActivityResponse.parse(items.slice(0, 20)));
});

export default router;
