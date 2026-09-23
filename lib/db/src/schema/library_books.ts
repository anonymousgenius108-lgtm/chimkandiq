import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  numeric,
} from "drizzle-orm/pg-core";

export const libraryBooksTable = pgTable("library_books", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  author: text("author").notNull(),
  category: text("category").notNull(),
  coverUrl: text("cover_url"),
  description: text("description").notNull(),
  shortDesc: text("short_desc").notNull(),
  tags: text("tags").array().notNull().default([]),
  pages: integer("pages").notNull().default(0),
  readingTimeMinutes: integer("reading_time_minutes").notNull().default(0),
  isFree: boolean("is_free").notNull().default(true),
  priceCredits: integer("price_credits").notNull().default(0),
  aiSummary: text("ai_summary"),
  contentPreview: text("content_preview"),
  rating: numeric("rating", { precision: 3, scale: 2 }).notNull().default("0"),
  reviewCount: integer("review_count").notNull().default(0),
  downloads: integer("downloads").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type LibraryBook = typeof libraryBooksTable.$inferSelect;
export type InsertLibraryBook = typeof libraryBooksTable.$inferInsert;
