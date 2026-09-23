import {
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const answersTable = pgTable("answers", {
  id: uuid("id").primaryKey().defaultRandom(),
  questionId: uuid("question_id").notNull(),
  authorName: text("author_name").notNull(),
  authorAvatarUrl: text("author_avatar_url").notNull(),
  body: text("body").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Answer = typeof answersTable.$inferSelect;
export type InsertAnswer = typeof answersTable.$inferInsert;
