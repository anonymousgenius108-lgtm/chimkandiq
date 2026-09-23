import { Router, type IRouter } from "express";
import { db, subjectsTable, tutorsTable } from "@workspace/db";
import { sql } from "drizzle-orm";
import { ListSubjectsResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/subjects", async (_req, res): Promise<void> => {
  const subjects = await db.select().from(subjectsTable).orderBy(subjectsTable.name);
  const counts = await db
    .select({
      slug: sql<string>`unnest(${tutorsTable.subjects})`.as("slug"),
      count: sql<number>`count(*)::int`.as("count"),
    })
    .from(tutorsTable)
    .groupBy(sql`1`);

  const countMap = new Map<string, number>();
  for (const c of counts) {
    countMap.set(c.slug, Number(c.count));
  }

  const result = subjects.map((s) => ({
    slug: s.slug,
    name: s.name,
    tutorCount: countMap.get(s.slug) ?? 0,
  }));

  res.json(ListSubjectsResponse.parse(result));
});

export default router;
