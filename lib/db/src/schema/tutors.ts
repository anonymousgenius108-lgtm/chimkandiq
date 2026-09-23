import {
  pgTable,
  text,
  integer,
  numeric,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";

export const tutorsTable = pgTable("tutors", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  headline: text("headline").notNull(),
  bio: text("bio").notNull(),
  avatarUrl: text("avatar_url").notNull(),
  hourlyRate: numeric("hourly_rate", { precision: 10, scale: 2 }).notNull(),
  rating: numeric("rating", { precision: 3, scale: 2 }).notNull(),
  reviewCount: integer("review_count").notNull().default(0),
  yearsExperience: integer("years_experience").notNull().default(0),
  totalSessions: integer("total_sessions").notNull().default(0),
  responseTimeMinutes: integer("response_time_minutes").notNull().default(60),
  location: text("location").notNull(),
  isOnline: boolean("is_online").notNull().default(false),
  education: text("education").notNull(),
  subjects: text("subjects").array().notNull().default([]),
  languages: text("languages").array().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Tutor = typeof tutorsTable.$inferSelect;
export type InsertTutor = typeof tutorsTable.$inferInsert;
