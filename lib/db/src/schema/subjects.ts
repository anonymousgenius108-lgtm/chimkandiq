import { pgTable, text } from "drizzle-orm/pg-core";

export const subjectsTable = pgTable("subjects", {
  slug: text("slug").primaryKey(),
  name: text("name").notNull(),
});

export type Subject = typeof subjectsTable.$inferSelect;
export type InsertSubject = typeof subjectsTable.$inferInsert;
