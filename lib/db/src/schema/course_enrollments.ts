import { pgTable, text, integer, timestamp, uuid } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const courseEnrollmentsTable = pgTable("course_enrollments", {
  id: uuid("id").primaryKey().defaultRandom(),
  courseId: text("course_id").notNull(),
  studentName: text("student_name").notNull(),
  studentAvatarUrl: text("student_avatar_url").notNull().default(""),
  enrolledAt: timestamp("enrolled_at", { withTimezone: true })
    .notNull()
    .default(sql`now()`),
  progressPct: integer("progress_pct").notNull().default(0),
  lastActiveAt: timestamp("last_active_at", { withTimezone: true })
    .notNull()
    .default(sql`now()`),
  quizAvg: integer("quiz_avg").notNull().default(0),
  attendancePct: integer("attendance_pct").notNull().default(0),
  focusScore: integer("focus_score").notNull().default(0),
  weakTopics: text("weak_topics").array().notNull().default(sql`'{}'::text[]`),
  streakDays: integer("streak_days").notNull().default(0),
});
