import { pgTable, text, integer } from "drizzle-orm/pg-core";

export const badgesTable = pgTable("badges", {
  code: text("code").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  tier: text("tier").notNull(),
  threshold: integer("threshold").notNull().default(0),
});

export type Badge = typeof badgesTable.$inferSelect;
export type InsertBadge = typeof badgesTable.$inferInsert;
