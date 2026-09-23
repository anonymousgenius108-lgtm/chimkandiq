import { pgTable, serial, text, integer } from "drizzle-orm/pg-core";

export const availabilityTable = pgTable("tutor_availability", {
  id: serial("id").primaryKey(),
  tutorId: text("tutor_id").notNull(),
  day: text("day").notNull(),
  startHour: integer("start_hour").notNull(),
  endHour: integer("end_hour").notNull(),
});

export type AvailabilityRow = typeof availabilityTable.$inferSelect;
export type InsertAvailabilityRow = typeof availabilityTable.$inferInsert;
