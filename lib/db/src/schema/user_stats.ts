import {
  pgTable,
  text,
  integer,
  timestamp,
  date,
} from "drizzle-orm/pg-core";

export const userStatsTable = pgTable("user_stats", {
  userName: text("user_name").primaryKey(),
  avatarUrl: text("avatar_url").notNull(),
  points: integer("points").notNull().default(0),
  currentStreak: integer("current_streak").notNull().default(0),
  longestStreak: integer("longest_streak").notNull().default(0),
  lastActiveOn: date("last_active_on"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type UserStats = typeof userStatsTable.$inferSelect;
export type InsertUserStats = typeof userStatsTable.$inferInsert;
