import {
  pgTable,
  text,
  integer,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const pointsEventsTable = pgTable("points_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  userName: text("user_name").notNull(),
  kind: text("kind").notNull(),
  points: integer("points").notNull(),
  reference: text("reference").notNull().default(""),
  awardedAt: timestamp("awarded_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type PointsEvent = typeof pointsEventsTable.$inferSelect;
export type InsertPointsEvent = typeof pointsEventsTable.$inferInsert;
