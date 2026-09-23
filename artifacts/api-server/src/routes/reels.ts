import { Router, type IRouter } from "express";
import { and, desc, eq, sql } from "drizzle-orm";
import {
  db,
  reelsTable,
  reelLikesTable,
  reelCommentsTable,
} from "@workspace/db";
import {
  ListReelsQueryParams,
  ListReelsResponse,
  ToggleReelLikeParams,
  ToggleReelLikeResponse,
  ListReelCommentsParams,
  ListReelCommentsResponse,
  PostReelCommentParams,
  PostReelCommentBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

const CURRENT_USER = "Alex Morgan";
const CURRENT_USER_AVATAR = "https://i.pravatar.cc/200?img=5";

router.get("/reels", async (req, res): Promise<void> => {
  const params = ListReelsQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const rows = params.data.subject
    ? await db
        .select()
        .from(reelsTable)
        .where(eq(reelsTable.subjectSlug, params.data.subject))
        .orderBy(desc(reelsTable.createdAt))
    : await db.select().from(reelsTable).orderBy(desc(reelsTable.createdAt));

  const enriched = await Promise.all(
    rows.map(async (r) => {
      const [{ count: commentCount }] = await db
        .select({ count: sql<number>`count(*)`.mapWith(Number) })
        .from(reelCommentsTable)
        .where(eq(reelCommentsTable.reelId, r.id));
      const liked = await db
        .select()
        .from(reelLikesTable)
        .where(
          and(
            eq(reelLikesTable.reelId, r.id),
            eq(reelLikesTable.userName, CURRENT_USER),
          ),
        );
      return {
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
        likeCount: r.likeCount,
        commentCount: commentCount ?? 0,
        likedByMe: liked.length > 0,
        createdAt: r.createdAt.toISOString(),
      };
    }),
  );
  res.json(ListReelsResponse.parse(enriched));
});

router.post("/reels/:reelId/like", async (req, res): Promise<void> => {
  const params = ToggleReelLikeParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const existing = await db
    .select()
    .from(reelLikesTable)
    .where(
      and(
        eq(reelLikesTable.reelId, params.data.reelId),
        eq(reelLikesTable.userName, CURRENT_USER),
      ),
    );

  let likedByMe: boolean;
  if (existing.length > 0) {
    await db
      .delete(reelLikesTable)
      .where(
        and(
          eq(reelLikesTable.reelId, params.data.reelId),
          eq(reelLikesTable.userName, CURRENT_USER),
        ),
      );
    await db
      .update(reelsTable)
      .set({ likeCount: sql`${reelsTable.likeCount} - 1` })
      .where(eq(reelsTable.id, params.data.reelId));
    likedByMe = false;
  } else {
    await db.insert(reelLikesTable).values({
      reelId: params.data.reelId,
      userName: CURRENT_USER,
    });
    await db
      .update(reelsTable)
      .set({ likeCount: sql`${reelsTable.likeCount} + 1` })
      .where(eq(reelsTable.id, params.data.reelId));
    likedByMe = true;
  }
  const [r] = await db
    .select()
    .from(reelsTable)
    .where(eq(reelsTable.id, params.data.reelId));
  if (!r) {
    res.status(404).json({ error: "Reel not found" });
    return;
  }
  res.json(
    ToggleReelLikeResponse.parse({
      reelId: r.id,
      likeCount: r.likeCount,
      likedByMe,
    }),
  );
});

router.get("/reels/:reelId/comments", async (req, res): Promise<void> => {
  const params = ListReelCommentsParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const rows = await db
    .select()
    .from(reelCommentsTable)
    .where(eq(reelCommentsTable.reelId, params.data.reelId))
    .orderBy(desc(reelCommentsTable.createdAt));
  res.json(
    ListReelCommentsResponse.parse(
      rows.map((c) => ({
        id: c.id,
        reelId: c.reelId,
        authorName: c.authorName,
        authorAvatarUrl: c.authorAvatarUrl,
        body: c.body,
        createdAt: c.createdAt.toISOString(),
      })),
    ),
  );
});

router.post("/reels/:reelId/comments", async (req, res): Promise<void> => {
  const params = PostReelCommentParams.safeParse(req.params);
  const body = PostReelCommentBody.safeParse(req.body);
  if (!params.success || !body.success) {
    res.status(400).json({
      error: !params.success ? params.error.message : body.error!.message,
    });
    return;
  }
  const [row] = await db
    .insert(reelCommentsTable)
    .values({
      reelId: params.data.reelId,
      authorName: CURRENT_USER,
      authorAvatarUrl: CURRENT_USER_AVATAR,
      body: body.data.body,
    })
    .returning();
  if (!row) {
    res.status(500).json({ error: "Failed to insert comment" });
    return;
  }
  res.status(201).json({
    id: row.id,
    reelId: row.reelId,
    authorName: row.authorName,
    authorAvatarUrl: row.authorAvatarUrl,
    body: row.body,
    createdAt: row.createdAt.toISOString(),
  });
});

export default router;
