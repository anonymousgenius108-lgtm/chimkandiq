import {
  pgTable,
  text,
  timestamp,
  uuid,
  primaryKey,
} from "drizzle-orm/pg-core";

export const userBadgesTable = pgTable(
  "user_badges",
  {
    userName: text("user_name").notNull(),
    badgeCode: text("badge_code").notNull(),
    earnedAt: timestamp("earned_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userName, t.badgeCode] })],
);

export type UserBadge = typeof userBadgesTable.$inferSelect;
export type InsertUserBadge = typeof userBadgesTable.$inferInsert;

void uuid;
