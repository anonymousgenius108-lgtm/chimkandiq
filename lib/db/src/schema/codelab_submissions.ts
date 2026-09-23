import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const codelabSubmissionsTable = pgTable("codelab_submissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  problemId: uuid("problem_id").notNull(),
  userName: text("user_name").notNull(),
  code: text("code").notNull(),
  language: text("language").notNull().default("python"),
  passed: boolean("passed").notNull().default(false),
  passedCount: integer("passed_count").notNull().default(0),
  totalCount: integer("total_count").notNull().default(0),
  output: text("output").notNull().default(""),
  submittedAt: timestamp("submitted_at", { withTimezone: true }).notNull().defaultNow(),
});

export type CodelabSubmission = typeof codelabSubmissionsTable.$inferSelect;
export type InsertCodelabSubmission = typeof codelabSubmissionsTable.$inferInsert;
