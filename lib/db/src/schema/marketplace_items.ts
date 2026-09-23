import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  numeric,
} from "drizzle-orm/pg-core";

export const marketplaceItemsTable = pgTable("marketplace_items", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  creatorName: text("creator_name").notNull(),
  creatorAvatar: text("creator_avatar"),
  category: text("category").notNull(),
  priceCredits: integer("price_credits").notNull().default(0),
  isFree: boolean("is_free").notNull().default(false),
  rating: numeric("rating", { precision: 3, scale: 2 }).notNull().default("0"),
  reviewCount: integer("review_count").notNull().default(0),
  downloads: integer("downloads").notNull().default(0),
  description: text("description").notNull(),
  previewUrl: text("preview_url"),
  tags: text("tags").array().notNull().default([]),
  fileType: text("file_type").notNull().default("pdf"),
  isFeatured: boolean("is_featured").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const marketplacePurchasesTable = pgTable("marketplace_purchases", {
  id: serial("id").primaryKey(),
  itemId: integer("item_id").notNull().references(() => marketplaceItemsTable.id),
  userName: text("user_name").notNull(),
  purchasedAt: timestamp("purchased_at", { withTimezone: true }).notNull().defaultNow(),
  pricePaid: integer("price_paid").notNull().default(0),
});

export type MarketplaceItem = typeof marketplaceItemsTable.$inferSelect;
export type InsertMarketplaceItem = typeof marketplaceItemsTable.$inferInsert;
export type MarketplacePurchase = typeof marketplacePurchasesTable.$inferSelect;
