import { Router, type IRouter } from "express";
import { and, desc, eq, sql, asc } from "drizzle-orm";
import {
  db,
  questionsTable,
  answersTable,
  votesTable,
  pointsEventsTable,
  notificationsTable,
} from "@workspace/db";
import {
  ListQuestionsQueryParams,
  ListQuestionsResponse,
  AskQuestionBody,
  GetQuestionParams,
  GetQuestionResponse,
  PostAnswerParams,
  PostAnswerBody,
  VoteOnQuestionParams,
  VoteOnQuestionBody,
  VoteOnQuestionResponse,
  VoteOnAnswerParams,
  VoteOnAnswerBody,
  VoteOnAnswerResponse,
  MarkBestAnswerParams,
  MarkBestAnswerResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

const CURRENT_USER = "Alex Morgan";
const CURRENT_USER_AVATAR = "https://i.pravatar.cc/200?img=5";

async function getVoteCount(
  targetType: "question" | "answer",
  targetId: string,
): Promise<number> {
  const [row] = await db
    .select({
      total: sql<number>`coalesce(sum(${votesTable.value}), 0)`.mapWith(Number),
    })
    .from(votesTable)
    .where(
      and(
        eq(votesTable.targetType, targetType),
        eq(votesTable.targetId, targetId),
      ),
    );
  return row?.total ?? 0;
}

router.get("/qna/questions", async (req, res): Promise<void> => {
  const params = ListQuestionsQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const { q, tag, sort } = params.data;
  const allQuestions = await db.select().from(questionsTable);

  const filtered = allQuestions.filter((qq) => {
    if (q) {
      const needle = q.toLowerCase();
      if (
        !qq.title.toLowerCase().includes(needle) &&
        !qq.body.toLowerCase().includes(needle)
      ) {
        return false;
      }
    }
    if (tag && !qq.tags.includes(tag)) return false;
    return true;
  });

  // Aggregate answer counts and vote counts
  const enriched = await Promise.all(
    filtered.map(async (qq) => {
      const [{ count: answerCount }] = await db
        .select({ count: sql<number>`count(*)`.mapWith(Number) })
        .from(answersTable)
        .where(eq(answersTable.questionId, qq.id));
      const voteCount = await getVoteCount("question", qq.id);
      return {
        id: qq.id,
        authorName: qq.authorName,
        authorAvatarUrl: qq.authorAvatarUrl,
        title: qq.title,
        excerpt:
          qq.body.length > 200 ? qq.body.slice(0, 200).trim() + "..." : qq.body,
        tags: qq.tags,
        viewCount: qq.viewCount,
        answerCount: answerCount ?? 0,
        voteCount,
        hasBestAnswer: qq.bestAnswerId !== null,
        createdAt: qq.createdAt.toISOString(),
      };
    }),
  );

  let sorted = enriched;
  if (sort === "top") {
    sorted = [...enriched].sort((a, b) => b.voteCount - a.voteCount);
  } else if (sort === "unanswered") {
    sorted = enriched
      .filter((e) => e.answerCount === 0)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  } else {
    sorted = [...enriched].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }

  res.json(ListQuestionsResponse.parse(sorted));
});

router.post("/qna/questions", async (req, res): Promise<void> => {
  const body = AskQuestionBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }
  const [row] = await db
    .insert(questionsTable)
    .values({
      authorName: CURRENT_USER,
      authorAvatarUrl: CURRENT_USER_AVATAR,
      title: body.data.title,
      body: body.data.body,
      tags: body.data.tags,
    })
    .returning();
  if (!row) {
    res.status(500).json({ error: "Failed to insert question" });
    return;
  }

  await db.insert(pointsEventsTable).values({
    userName: CURRENT_USER,
    kind: "ask_question",
    points: 5,
    reference: row.id,
  });

  res.status(201).json({
    id: row.id,
    authorName: row.authorName,
    authorAvatarUrl: row.authorAvatarUrl,
    title: row.title,
    body: row.body,
    tags: row.tags,
    viewCount: row.viewCount,
    voteCount: 0,
    bestAnswerId: row.bestAnswerId,
    createdAt: row.createdAt.toISOString(),
  });
});

router.get("/qna/questions/:questionId", async (req, res): Promise<void> => {
  const params = GetQuestionParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [q] = await db
    .select()
    .from(questionsTable)
    .where(eq(questionsTable.id, params.data.questionId));
  if (!q) {
    res.status(404).json({ error: "Question not found" });
    return;
  }
  await db
    .update(questionsTable)
    .set({ viewCount: q.viewCount + 1 })
    .where(eq(questionsTable.id, q.id));

  const answers = await db
    .select()
    .from(answersTable)
    .where(eq(answersTable.questionId, q.id))
    .orderBy(desc(answersTable.createdAt));

  const answersWithVotes = await Promise.all(
    answers.map(async (a) => ({
      id: a.id,
      questionId: a.questionId,
      authorName: a.authorName,
      authorAvatarUrl: a.authorAvatarUrl,
      body: a.body,
      voteCount: await getVoteCount("answer", a.id),
      isBest: q.bestAnswerId === a.id,
      createdAt: a.createdAt.toISOString(),
    })),
  );

  // Sort: best first, then by votes desc
  answersWithVotes.sort((a, b) => {
    if (a.isBest && !b.isBest) return -1;
    if (!a.isBest && b.isBest) return 1;
    return b.voteCount - a.voteCount;
  });

  void asc; // keep import

  res.json(
    GetQuestionResponse.parse({
      question: {
        id: q.id,
        authorName: q.authorName,
        authorAvatarUrl: q.authorAvatarUrl,
        title: q.title,
        body: q.body,
        tags: q.tags,
        viewCount: q.viewCount + 1,
        voteCount: await getVoteCount("question", q.id),
        bestAnswerId: q.bestAnswerId,
        createdAt: q.createdAt.toISOString(),
      },
      answers: answersWithVotes,
    }),
  );
});

router.post(
  "/qna/questions/:questionId/answers",
  async (req, res): Promise<void> => {
    const params = PostAnswerParams.safeParse(req.params);
    const body = PostAnswerBody.safeParse(req.body);
    if (!params.success || !body.success) {
      res.status(400).json({
        error: !params.success ? params.error.message : body.error!.message,
      });
      return;
    }
    const [q] = await db
      .select()
      .from(questionsTable)
      .where(eq(questionsTable.id, params.data.questionId));
    if (!q) {
      res.status(404).json({ error: "Question not found" });
      return;
    }
    const [row] = await db
      .insert(answersTable)
      .values({
        questionId: params.data.questionId,
        authorName: CURRENT_USER,
        authorAvatarUrl: CURRENT_USER_AVATAR,
        body: body.data.body,
      })
      .returning();
    if (!row) {
      res.status(500).json({ error: "Failed to insert answer" });
      return;
    }

    await db.insert(pointsEventsTable).values({
      userName: CURRENT_USER,
      kind: "post_answer",
      points: 10,
      reference: row.id,
    });

    // Notify the question author (only if they aren't the same)
    if (q.authorName !== CURRENT_USER) {
      await db.insert(notificationsTable).values({
        type: "system",
        title: `${CURRENT_USER} answered your question`,
        body: q.title,
        link: `/qna/${q.id}`,
        read: false,
      });
    }

    res.status(201).json({
      id: row.id,
      questionId: row.questionId,
      authorName: row.authorName,
      authorAvatarUrl: row.authorAvatarUrl,
      body: row.body,
      voteCount: 0,
      isBest: false,
      createdAt: row.createdAt.toISOString(),
    });
  },
);

async function castVote(
  targetType: "question" | "answer",
  targetId: string,
  value: number,
): Promise<{ targetId: string; voteCount: number; myVote: -1 | 0 | 1 }> {
  if (value === 0) {
    await db
      .delete(votesTable)
      .where(
        and(
          eq(votesTable.targetType, targetType),
          eq(votesTable.targetId, targetId),
          eq(votesTable.userName, CURRENT_USER),
        ),
      );
  } else {
    await db
      .insert(votesTable)
      .values({
        targetType,
        targetId,
        userName: CURRENT_USER,
        value,
      })
      .onConflictDoUpdate({
        target: [votesTable.targetType, votesTable.targetId, votesTable.userName],
        set: { value },
      });
  }
  return {
    targetId,
    voteCount: await getVoteCount(targetType, targetId),
    myVote: value as -1 | 0 | 1,
  };
}

router.post(
  "/qna/questions/:questionId/vote",
  async (req, res): Promise<void> => {
    const params = VoteOnQuestionParams.safeParse(req.params);
    const body = VoteOnQuestionBody.safeParse(req.body);
    if (!params.success || !body.success) {
      res.status(400).json({
        error: !params.success ? params.error.message : body.error!.message,
      });
      return;
    }
    const result = await castVote(
      "question",
      params.data.questionId,
      body.data.value,
    );
    res.json(VoteOnQuestionResponse.parse(result));
  },
);

router.post(
  "/qna/answers/:answerId/vote",
  async (req, res): Promise<void> => {
    const params = VoteOnAnswerParams.safeParse(req.params);
    const body = VoteOnAnswerBody.safeParse(req.body);
    if (!params.success || !body.success) {
      res.status(400).json({
        error: !params.success ? params.error.message : body.error!.message,
      });
      return;
    }
    const result = await castVote(
      "answer",
      params.data.answerId,
      body.data.value,
    );
    res.json(VoteOnAnswerResponse.parse(result));
  },
);

router.post(
  "/qna/answers/:answerId/best",
  async (req, res): Promise<void> => {
    const params = MarkBestAnswerParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }
    const [a] = await db
      .select()
      .from(answersTable)
      .where(eq(answersTable.id, params.data.answerId));
    if (!a) {
      res.status(404).json({ error: "Answer not found" });
      return;
    }
    await db
      .update(questionsTable)
      .set({ bestAnswerId: a.id })
      .where(eq(questionsTable.id, a.questionId));

    // Award points to the answerer
    await db.insert(pointsEventsTable).values({
      userName: a.authorName,
      kind: "best_answer",
      points: 25,
      reference: a.id,
    });

    // Re-fetch detail
    const [q] = await db
      .select()
      .from(questionsTable)
      .where(eq(questionsTable.id, a.questionId));
    if (!q) {
      res.status(404).json({ error: "Question vanished" });
      return;
    }
    const answers = await db
      .select()
      .from(answersTable)
      .where(eq(answersTable.questionId, q.id));
    const answersWithVotes = await Promise.all(
      answers.map(async (an) => ({
        id: an.id,
        questionId: an.questionId,
        authorName: an.authorName,
        authorAvatarUrl: an.authorAvatarUrl,
        body: an.body,
        voteCount: await getVoteCount("answer", an.id),
        isBest: q.bestAnswerId === an.id,
        createdAt: an.createdAt.toISOString(),
      })),
    );
    answersWithVotes.sort((x, y) => {
      if (x.isBest && !y.isBest) return -1;
      if (!x.isBest && y.isBest) return 1;
      return y.voteCount - x.voteCount;
    });

    res.json(
      MarkBestAnswerResponse.parse({
        question: {
          id: q.id,
          authorName: q.authorName,
          authorAvatarUrl: q.authorAvatarUrl,
          title: q.title,
          body: q.body,
          tags: q.tags,
          viewCount: q.viewCount,
          voteCount: await getVoteCount("question", q.id),
          bestAnswerId: q.bestAnswerId,
          createdAt: q.createdAt.toISOString(),
        },
        answers: answersWithVotes,
      }),
    );
  },
);

export default router;
