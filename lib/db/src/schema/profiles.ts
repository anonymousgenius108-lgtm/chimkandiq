import {
  pgTable,
  text,
  timestamp,
  boolean,
} from "drizzle-orm/pg-core";

export const profilesTable = pgTable("profiles", {
  userName: text("user_name").primaryKey(),
  displayName: text("display_name").notNull(),
  avatarUrl: text("avatar_url").notNull(),
  bio: text("bio").notNull().default(""),
  course: text("course").notNull().default(""),
  college: text("college").notNull().default(""),
  yearOfStudy: text("year_of_study").notNull().default(""),
  location: text("location").notNull().default(""),
  subjects: text("subjects").array().notNull().default([]),
  skills: text("skills").array().notNull().default([]),
  interests: text("interests").array().notNull().default([]),
  activities: text("activities").array().notNull().default([]),
  isPrivate: boolean("is_private").notNull().default(false),
  joinedAt: timestamp("joined_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Profile = typeof profilesTable.$inferSelect;
export type InsertProfile = typeof profilesTable.$inferInsert;
