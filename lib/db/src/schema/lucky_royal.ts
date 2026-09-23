import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";

export const luckyRoyalRoomsTable = pgTable("lucky_royal_rooms", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  creatorName: text("creator_name").notNull(),
  creatorAvatar: text("creator_avatar"),
  rewardTitle: text("reward_title").notNull(),
  rewardImage: text("reward_image"),
  rewardType: text("reward_type").notNull().default("item"),
  entryCredits: integer("entry_credits").notNull().default(10),
  maxParticipants: integer("max_participants").notNull().default(50),
  currentParticipants: integer("current_participants").notNull().default(0),
  endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),
  status: text("status").notNull().default("active"),
  category: text("category").notNull().default("general"),
  isFeatured: boolean("is_featured").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const luckyRoyalEntriesTable = pgTable("lucky_royal_entries", {
  id: uuid("id").primaryKey().defaultRandom(),
  roomId: uuid("room_id")
    .notNull()
    .references(() => luckyRoyalRoomsTable.id),
  userName: text("user_name").notNull(),
  enteredAt: timestamp("entered_at", { withTimezone: true }).notNull().defaultNow(),
  resultType: text("result_type").notNull().default("pending"),
  rewardAmount: integer("reward_amount").notNull().default(0),
  rewardLabel: text("reward_label"),
});

export type LuckyRoyalRoom = typeof luckyRoyalRoomsTable.$inferSelect;
export type LuckyRoyalEntry = typeof luckyRoyalEntriesTable.$inferSelect;
