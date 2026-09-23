import {
  pgTable,
  text,
  integer,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const reelsTable = pgTable("reels", {
  id: uuid("id").primaryKey().defaultRandom(),
  authorName: text("author_name").notNull(),
  authorAvatarUrl: text("author_avatar_url").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  videoUrl: text("video_url").notNull(),
  thumbnailUrl: text("thumbnail_url").notNull(),
  durationSec: integer("duration_sec").notNull(),
  subjectSlug: text("subject_slug").notNull(),
  viewCount: integer("view_count").notNull().default(0),
  likeCount: integer("like_count").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Reel = typeof reelsTable.$inferSelect;
export type InsertReel = typeof reelsTable.$inferInsert;
