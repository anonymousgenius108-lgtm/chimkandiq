import {
  pgTable,
  text,
  integer,
  timestamp,
  primaryKey,
} from "drizzle-orm/pg-core";

export const votesTable = pgTable(
  "votes",
  {
    targetType: text("target_type").notNull(),
    targetId: text("target_id").notNull(),
    userName: text("user_name").notNull(),
    value: integer("value").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.targetType, t.targetId, t.userName] })],
);

export type Vote = typeof votesTable.$inferSelect;
export type InsertVote = typeof votesTable.$inferInsert;
