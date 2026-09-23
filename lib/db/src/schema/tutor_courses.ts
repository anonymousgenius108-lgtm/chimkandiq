import { pgTable, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const tutorCoursesTable = pgTable("tutor_courses", {
  id: text("id").primaryKey(),
  tutorId: text("tutor_id").notNull(),
  title: text("title").notNull(),
  subjectSlug: text("subject_slug").notNull(),
  description: text("description").notNull().default(""),
  thumbnailUrl: text("thumbnail_url").notNull().default(""),
  priceInr: integer("price_inr").notNull().default(0),
  chapterCount: integer("chapter_count").notNull().default(0),
  isPublished: boolean("is_published").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .default(sql`now()`),
});
