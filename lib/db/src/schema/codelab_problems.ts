import {
  pgTable,
  text,
  integer,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const codelabProblemsTable = pgTable("codelab_problems", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  difficulty: text("difficulty").notNull(), // easy | medium | hard
  subject: text("subject").notNull(),
  description: text("description").notNull(),
  starterCode: text("starter_code").notNull(),
  solutionCode: text("solution_code").notNull(),
  testCases: text("test_cases").notNull(), // JSON string
  hints: text("hints").notNull(), // JSON string array
  tags: text("tags").array().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type CodelabProblem = typeof codelabProblemsTable.$inferSelect;
export type InsertCodelabProblem = typeof codelabProblemsTable.$inferInsert;
