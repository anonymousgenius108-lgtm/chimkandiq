import { Router } from "express";
import { db } from "@workspace/db";
import {
  marketplaceItemsTable,
  marketplacePurchasesTable,
  userStatsTable,
  pointsEventsTable,
} from "@workspace/db/schema";
import { eq, ilike, and, asc, desc, type SQL } from "drizzle-orm";

const router = Router();
const CURRENT_USER = "alex_morgan";

function mapItem(b: typeof marketplaceItemsTable.$inferSelect) {
  return {
    id: b.id,
    title: b.title,
    creatorName: b.creatorName,
    creatorAvatar: b.creatorAvatar ?? null,
    category: b.category,
    priceCredits: b.priceCredits,
    isFree: b.isFree,
    rating: Number(b.rating),
    reviewCount: b.reviewCount,
    downloads: b.downloads,
    description: b.description,
    previewUrl: b.previewUrl ?? null,
    fileType: b.fileType,
    isFeatured: b.isFeatured,
    tags: b.tags,
    createdAt: b.createdAt.toISOString(),
  };
}

// GET /marketplace
router.get("/marketplace", async (req, res) => {
  const { category, q, sort } = req.query as Record<string, string | undefined>;

  const conditions: SQL[] = [];
  if (category && category !== "all") {
    conditions.push(eq(marketplaceItemsTable.category, category));
  }
  if (q) {
    conditions.push(ilike(marketplaceItemsTable.title, `%${q}%`));
  }

  let rows = await db
    .select()
    .from(marketplaceItemsTable)
    .where(conditions.length ? and(...conditions) : undefined);

  switch (sort) {
    case "newest":
      rows = rows.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      break;
    case "price-asc":
      rows = rows.sort((a, b) => a.priceCredits - b.priceCredits);
      break;
    case "free-first":
      rows = rows.sort((a, b) => (a.isFree ? -1 : b.isFree ? 1 : 0));
      break;
    default:
      rows = rows.sort((a, b) => b.downloads - a.downloads);
  }

  res.json(rows.map(mapItem));
});

// GET /marketplace/:id
router.get("/marketplace/:id", async (req, res) => {
  const id = parseInt(req.params.id ?? "0", 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [row] = await db
    .select()
    .from(marketplaceItemsTable)
    .where(eq(marketplaceItemsTable.id, id));

  if (!row) {
    res.status(404).json({ error: "Item not found" });
    return;
  }

  res.json(mapItem(row));
});

// POST /marketplace/:id/purchase
router.post("/marketplace/:id/purchase", async (req, res) => {
  const id = parseInt(req.params.id ?? "0", 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [item] = await db
    .select()
    .from(marketplaceItemsTable)
    .where(eq(marketplaceItemsTable.id, id));

  if (!item) {
    res.status(404).json({ error: "Item not found" });
    return;
  }

  if (item.isFree) {
    await db.insert(marketplacePurchasesTable).values({
      itemId: id,
      userName: CURRENT_USER,
      pricePaid: 0,
    });
    res.json({ success: true, newBalance: 0, message: "Free item added to your library!" });
    return;
  }

  const [stats] = await db
    .select()
    .from(userStatsTable)
    .where(eq(userStatsTable.userName, CURRENT_USER));

  const balance = stats?.points ?? 0;

  if (balance < item.priceCredits) {
    res.status(400).json({ error: `Not enough credits. Need ${item.priceCredits}, have ${balance}.` });
    return;
  }

  await db.insert(marketplacePurchasesTable).values({
    itemId: id,
    userName: CURRENT_USER,
    pricePaid: item.priceCredits,
  });

  await db.insert(pointsEventsTable).values({
    userName: CURRENT_USER,
    points: -item.priceCredits,
    kind: "marketplace_purchase",
    reference: `Purchased: ${item.title}`,
  });

  const newBalance = balance - item.priceCredits;
  res.json({
    success: true,
    newBalance,
    message: `Purchased! ${item.priceCredits} credits deducted.`,
  });
});

export default router;
