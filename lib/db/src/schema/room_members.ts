import { pgTable, text, timestamp, uuid, boolean } from "drizzle-orm/pg-core";

export const roomMembersTable = pgTable("room_members", {
  id: uuid("id").primaryKey().defaultRandom(),
  roomId: uuid("room_id").notNull(),
  userName: text("user_name").notNull(),
  displayName: text("display_name").notNull(),
  avatarUrl: text("avatar_url"),
  role: text("role").notNull().default("member"),
  isMuted: boolean("is_muted").notNull().default(false),
  isCameraOff: boolean("is_camera_off").notNull().default(false),
  isHandRaised: boolean("is_hand_raised").notNull().default(false),
  joinedAt: timestamp("joined_at", { withTimezone: true }).notNull().defaultNow(),
  leftAt: timestamp("left_at", { withTimezone: true }),
});

export type RoomMember = typeof roomMembersTable.$inferSelect;
export type InsertRoomMember = typeof roomMembersTable.$inferInsert;
