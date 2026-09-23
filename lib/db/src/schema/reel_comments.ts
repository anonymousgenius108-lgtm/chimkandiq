import {
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const reelCommentsTable = pgTable("reel_comments", {
  id: uuid("id").primaryKey().defaultRandom(),
  reelId: uuid("reel_id").notNull(),
  authorName: text("author_name").notNull(),
  authorAvatarUrl: text("author_avatar_url").notNull(),
  body: text("body").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type ReelComment = typeof reelCommentsTable.$inferSelect;
export type InsertReelComment = typeof reelCommentsTable.$inferInsert;
