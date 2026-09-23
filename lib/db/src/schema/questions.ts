import {
  pgTable,
  text,
  integer,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const questionsTable = pgTable("questions", {
  id: uuid("id").primaryKey().defaultRandom(),
  authorName: text("author_name").notNull(),
  authorAvatarUrl: text("author_avatar_url").notNull(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  tags: text("tags").array().notNull().default([]),
  viewCount: integer("view_count").notNull().default(0),
  bestAnswerId: uuid("best_answer_id"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Question = typeof questionsTable.$inferSelect;
export type InsertQuestion = typeof questionsTable.$inferInsert;
