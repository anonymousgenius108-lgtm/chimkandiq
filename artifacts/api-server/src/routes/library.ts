import { Router } from "express";
import { db } from "@workspace/db";
import { libraryBooksTable } from "@workspace/db/schema";
import { eq, ilike, and, type SQL } from "drizzle-orm";

const router = Router();

// GET /library
router.get("/library", async (req, res) => {
  const { category, q } = req.query as Record<string, string | undefined>;

  const conditions: SQL[] = [];
  if (category && category !== "all") {
    conditions.push(eq(libraryBooksTable.category, category));
  }
  if (q) {
    conditions.push(ilike(libraryBooksTable.title, `%${q}%`));
  }

  const rows = await db
    .select()
    .from(libraryBooksTable)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(libraryBooksTable.downloads);

  const books = rows.map((b) => ({
    id: b.id,
    title: b.title,
    author: b.author,
    category: b.category,
    coverUrl: b.coverUrl ?? null,
    shortDesc: b.shortDesc,
    rating: Number(b.rating),
    reviewCount: b.reviewCount,
    downloads: b.downloads,
    isFree: b.isFree,
    priceCredits: b.priceCredits,
    pages: b.pages,
    readingTimeMinutes: b.readingTimeMinutes,
    tags: b.tags,
    createdAt: b.createdAt.toISOString(),
  }));

  res.json(books);
});

// GET /library/:id
router.get("/library/:id", async (req, res) => {
  const id = parseInt(req.params.id ?? "0", 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [row] = await db
    .select()
    .from(libraryBooksTable)
    .where(eq(libraryBooksTable.id, id));

  if (!row) {
    res.status(404).json({ error: "Book not found" });
    return;
  }

  res.json({
    id: row.id,
    title: row.title,
    author: row.author,
    category: row.category,
    coverUrl: row.coverUrl ?? null,
    shortDesc: row.shortDesc,
    description: row.description,
    aiSummary: row.aiSummary ?? null,
    contentPreview: row.contentPreview ?? null,
    rating: Number(row.rating),
    reviewCount: row.reviewCount,
    downloads: row.downloads,
    isFree: row.isFree,
    priceCredits: row.priceCredits,
    pages: row.pages,
    readingTimeMinutes: row.readingTimeMinutes,
    tags: row.tags,
    createdAt: row.createdAt.toISOString(),
  });
});

export default router;
