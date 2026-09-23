import { Router, type IRouter } from "express";
import { desc, ilike, or, sql, eq, inArray } from "drizzle-orm";
import {
  db,
  profilesTable,
  questionsTable,
  reelsTable,
  answersTable,
  followsTable,
  reelLikesTable,
  reelCommentsTable,
  pointsEventsTable,
  userStatsTable,
  votesTable,
} from "@workspace/db";
import {
  SearchQueryParams,
  SearchResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

const CURRENT_USER = "Alex Morgan";

type LevelDef = { tier: string; label: string; min: number };
const LEVELS: LevelDef[] = [
  { tier: "beginner", label: "Beginner", min: 0 },
  { tier: "learner", label: "Learner", min: 100 },
  { tier: "contributor", label: "Contributor", min: 500 },
  { tier: "expert", label: "Expert", min: 1500 },
  { tier: "mentor", label: "Mentor", min: 5000 },
];
function levelLabel(points: number): string {
  let label = LEVELS[0]!.label;
  for (const l of LEVELS) {
    if (points >= l.min) label = l.label;
  }
  return label;
}

router.get("/search", async (req, res): Promise<void> => {
  const parsed = SearchQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const q = parsed.data.q.trim();
  if (q.length === 0) {
    res.json(
      SearchResponse.parse({ users: [], questions: [], reels: [], tags: [] }),
    );
    return;
  }
  const like = `%${q}%`;

  const profileRows = await db
    .select()
    .from(profilesTable)
    .where(
      or(
        ilike(profilesTable.userName, like),
        ilike(profilesTable.displayName, like),
        ilike(profilesTable.bio, like),
        ilike(profilesTable.course, like),
        ilike(profilesTable.college, like),
      ),
    )
    .limit(20);

  const questionRows = await db
    .select()
    .from(questionsTable)
    .where(
      or(
        ilike(questionsTable.title, like),
        ilike(questionsTable.body, like),
      ),
    )
    .orderBy(desc(questionsTable.createdAt))
    .limit(20);

  const reelRows = await db
    .select()
    .from(reelsTable)
    .where(
      or(ilike(reelsTable.title, like), ilike(reelsTable.description, like)),
    )
    .orderBy(desc(reelsTable.createdAt))
    .limit(20);

  // Tag matches: find questions whose tags contain text matching q (case-insensitive substring)
  const allQuestions = await db.select().from(questionsTable);
  const tagCounts = new Map<string, number>();
  const lowerQ = q.toLowerCase();
  for (const qq of allQuestions) {
    for (const t of qq.tags ?? []) {
      if (t.toLowerCase().includes(lowerQ)) {
        tagCounts.set(t, (tagCounts.get(t) ?? 0) + 1);
      }
    }
  }
  const tags = Array.from(tagCounts.entries())
    .map(([tag, questionCount]) => ({ tag, questionCount }))
    .sort((a, b) => b.questionCount - a.questionCount)
    .slice(0, 10);

  // Build user summaries with points + isFollowedByMe
  const userNames = profileRows.map((p) => p.userName);
  const myFollows =
    userNames.length > 0
      ? await db
          .select()
          .from(followsTable)
          .where(eq(followsTable.followerName, CURRENT_USER))
      : [];
  const followingSet = new Set(myFollows.map((f) => f.followeeName));
  const users = [];
  for (const p of profileRows) {
    const [base] = await db
      .select({ p: userStatsTable.points })
      .from(userStatsTable)
      .where(eq(userStatsTable.userName, p.userName));
    const [evt] = await db
      .select({
        t: sql<number>`coalesce(sum(${pointsEventsTable.points}), 0)`.mapWith(
          Number,
        ),
      })
      .from(pointsEventsTable)
      .where(eq(pointsEventsTable.userName, p.userName));
    const points = (base?.p ?? 0) + (evt?.t ?? 0);
    users.push({
      userName: p.userName,
      displayName: p.displayName,
      avatarUrl: p.avatarUrl,
      bio: p.bio,
      course: p.course,
      college: p.college,
      points,
      levelLabel: levelLabel(points),
      isFollowedByMe: followingSet.has(p.userName),
    });
  }

  // Build question summaries (matching ListQuestionsResponse shape)
  const questions = [];
  for (const qq of questionRows) {
    const [voteRow] = await db
      .select({
        t: sql<number>`coalesce(sum(${votesTable.value}), 0)`.mapWith(Number),
      })
      .from(votesTable)
      .where(
        sql`${votesTable.targetType} = 'question' and ${votesTable.targetId} = ${qq.id}`,
      );
    const [aCountRow] = await db
      .select({ c: sql<number>`count(*)`.mapWith(Number) })
      .from(answersTable)
      .where(eq(answersTable.questionId, qq.id));
    questions.push({
      id: qq.id,
      title: qq.title,
      excerpt:
        qq.body.length > 160 ? qq.body.slice(0, 160).trim() + "…" : qq.body,
      authorName: qq.authorName,
      authorAvatarUrl: qq.authorAvatarUrl,
      tags: qq.tags ?? [],
      voteCount: voteRow?.t ?? 0,
      answerCount: aCountRow?.c ?? 0,
      viewCount: qq.viewCount,
      hasBestAnswer: qq.bestAnswerId !== null,
      createdAt: qq.createdAt.toISOString(),
    });
  }

  // Build reel summaries
  const reelIds = reelRows.map((r) => r.id);
  const myLikes =
    reelIds.length > 0
      ? await db
          .select()
          .from(reelLikesTable)
          .where(
            sql`${reelLikesTable.userName} = ${CURRENT_USER} and ${reelLikesTable.reelId} in ${reelIds}`,
          )
      : [];
  const likedSet = new Set(myLikes.map((l) => l.reelId));
  const reels = [];
  for (const r of reelRows) {
    const [likeRow] = await db
      .select({ c: sql<number>`count(*)`.mapWith(Number) })
      .from(reelLikesTable)
      .where(eq(reelLikesTable.reelId, r.id));
    const [commentRow] = await db
      .select({ c: sql<number>`count(*)`.mapWith(Number) })
      .from(reelCommentsTable)
      .where(eq(reelCommentsTable.reelId, r.id));
    reels.push({
      id: r.id,
      authorName: r.authorName,
      authorAvatarUrl: r.authorAvatarUrl,
      title: r.title,
      description: r.description,
      videoUrl: r.videoUrl,
      thumbnailUrl: r.thumbnailUrl,
      durationSec: r.durationSec,
      subjectSlug: r.subjectSlug,
      viewCount: r.viewCount,
      likeCount: likeRow?.c ?? 0,
      commentCount: commentRow?.c ?? 0,
      likedByMe: likedSet.has(r.id),
      createdAt: r.createdAt.toISOString(),
    });
  }

  void inArray;
  res.json(SearchResponse.parse({ users, questions, reels, tags }));
});

export default router;
