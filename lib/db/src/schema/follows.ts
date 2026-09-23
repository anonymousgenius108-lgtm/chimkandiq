import {
  pgTable,
  text,
  timestamp,
  primaryKey,
} from "drizzle-orm/pg-core";

export const followsTable = pgTable(
  "follows",
  {
    followerName: text("follower_name").notNull(),
    followeeName: text("followee_name").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.followerName, t.followeeName] }),
  }),
);

export type Follow = typeof followsTable.$inferSelect;
export type InsertFollow = typeof followsTable.$inferInsert;
