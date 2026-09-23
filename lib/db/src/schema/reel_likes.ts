import {
  pgTable,
  text,
  timestamp,
  uuid,
  primaryKey,
} from "drizzle-orm/pg-core";

export const reelLikesTable = pgTable(
  "reel_likes",
  {
    reelId: uuid("reel_id").notNull(),
    userName: text("user_name").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.reelId, t.userName] })],
);

export type ReelLike = typeof reelLikesTable.$inferSelect;
export type InsertReelLike = typeof reelLikesTable.$inferInsert;
