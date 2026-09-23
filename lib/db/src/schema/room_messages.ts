import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const roomMessagesTable = pgTable("room_messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  roomId: uuid("room_id").notNull(),
  userName: text("user_name").notNull(),
  displayName: text("display_name").notNull(),
  avatarUrl: text("avatar_url"),
  content: text("content").notNull(),
  type: text("type").notNull().default("text"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type RoomMessage = typeof roomMessagesTable.$inferSelect;
export type InsertRoomMessage = typeof roomMessagesTable.$inferInsert;
