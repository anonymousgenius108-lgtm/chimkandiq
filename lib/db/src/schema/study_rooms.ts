import { pgTable, text, timestamp, uuid, boolean, integer } from "drizzle-orm/pg-core";

export const studyRoomsTable = pgTable("study_rooms", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  type: text("type").notNull().default("group_study"),
  hostName: text("host_name").notNull(),
  hostAvatar: text("host_avatar"),
  roomCode: text("room_code").notNull().unique(),
  password: text("password"),
  isLocked: boolean("is_locked").notNull().default(false),
  maxParticipants: integer("max_participants").notNull().default(20),
  currentParticipants: integer("current_participants").notNull().default(0),
  scheduledAt: timestamp("scheduled_at", { withTimezone: true }),
  status: text("status").notNull().default("waiting"),
  description: text("description"),
  subject: text("subject"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type StudyRoom = typeof studyRoomsTable.$inferSelect;
export type InsertStudyRoom = typeof studyRoomsTable.$inferInsert;
