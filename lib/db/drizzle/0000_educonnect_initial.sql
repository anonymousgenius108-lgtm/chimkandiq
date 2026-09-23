CREATE TABLE "tutors" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"headline" text NOT NULL,
	"bio" text NOT NULL,
	"avatar_url" text NOT NULL,
	"hourly_rate" numeric(10, 2) NOT NULL,
	"rating" numeric(3, 2) NOT NULL,
	"review_count" integer DEFAULT 0 NOT NULL,
	"years_experience" integer DEFAULT 0 NOT NULL,
	"total_sessions" integer DEFAULT 0 NOT NULL,
	"response_time_minutes" integer DEFAULT 60 NOT NULL,
	"location" text NOT NULL,
	"is_online" boolean DEFAULT false NOT NULL,
	"education" text NOT NULL,
	"subjects" text[] DEFAULT '{}' NOT NULL,
	"languages" text[] DEFAULT '{}' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subjects" (
	"slug" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tutor_availability" (
	"id" serial PRIMARY KEY NOT NULL,
	"tutor_id" text NOT NULL,
	"day" text NOT NULL,
	"start_hour" integer NOT NULL,
	"end_hour" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tutor_id" text NOT NULL,
	"student_name" text NOT NULL,
	"student_avatar_url" text NOT NULL,
	"rating" integer NOT NULL,
	"comment" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bookings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tutor_id" text NOT NULL,
	"student_name" text NOT NULL,
	"subject" text NOT NULL,
	"starts_at" timestamp with time zone NOT NULL,
	"ends_at" timestamp with time zone NOT NULL,
	"duration_minutes" integer NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"status" text DEFAULT 'pending_payment' NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tutor_id" text NOT NULL,
	"sender" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"link" text DEFAULT '' NOT NULL,
	"read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"author_name" text NOT NULL,
	"author_avatar_url" text NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"tags" text[] DEFAULT '{}' NOT NULL,
	"view_count" integer DEFAULT 0 NOT NULL,
	"best_answer_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "answers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question_id" uuid NOT NULL,
	"author_name" text NOT NULL,
	"author_avatar_url" text NOT NULL,
	"body" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "votes" (
	"target_type" text NOT NULL,
	"target_id" text NOT NULL,
	"user_name" text NOT NULL,
	"value" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "votes_target_type_target_id_user_name_pk" PRIMARY KEY("target_type","target_id","user_name")
);
--> statement-breakpoint
CREATE TABLE "reels" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"author_name" text NOT NULL,
	"author_avatar_url" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"video_url" text NOT NULL,
	"thumbnail_url" text NOT NULL,
	"duration_sec" integer NOT NULL,
	"subject_slug" text NOT NULL,
	"view_count" integer DEFAULT 0 NOT NULL,
	"like_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reel_likes" (
	"reel_id" uuid NOT NULL,
	"user_name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "reel_likes_reel_id_user_name_pk" PRIMARY KEY("reel_id","user_name")
);
--> statement-breakpoint
CREATE TABLE "reel_comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reel_id" uuid NOT NULL,
	"author_name" text NOT NULL,
	"author_avatar_url" text NOT NULL,
	"body" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "badges" (
	"code" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"icon" text NOT NULL,
	"tier" text NOT NULL,
	"threshold" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_stats" (
	"user_name" text PRIMARY KEY NOT NULL,
	"avatar_url" text NOT NULL,
	"points" integer DEFAULT 0 NOT NULL,
	"current_streak" integer DEFAULT 0 NOT NULL,
	"longest_streak" integer DEFAULT 0 NOT NULL,
	"last_active_on" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_badges" (
	"user_name" text NOT NULL,
	"badge_code" text NOT NULL,
	"earned_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_badges_user_name_badge_code_pk" PRIMARY KEY("user_name","badge_code")
);
--> statement-breakpoint
CREATE TABLE "points_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_name" text NOT NULL,
	"kind" text NOT NULL,
	"points" integer NOT NULL,
	"reference" text DEFAULT '' NOT NULL,
	"awarded_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"user_name" text PRIMARY KEY NOT NULL,
	"display_name" text NOT NULL,
	"avatar_url" text NOT NULL,
	"bio" text DEFAULT '' NOT NULL,
	"course" text DEFAULT '' NOT NULL,
	"college" text DEFAULT '' NOT NULL,
	"year_of_study" text DEFAULT '' NOT NULL,
	"location" text DEFAULT '' NOT NULL,
	"subjects" text[] DEFAULT '{}' NOT NULL,
	"skills" text[] DEFAULT '{}' NOT NULL,
	"interests" text[] DEFAULT '{}' NOT NULL,
	"activities" text[] DEFAULT '{}' NOT NULL,
	"is_private" boolean DEFAULT false NOT NULL,
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "follows" (
	"follower_name" text NOT NULL,
	"followee_name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "follows_follower_name_followee_name_pk" PRIMARY KEY("follower_name","followee_name")
);
--> statement-breakpoint
CREATE TABLE "tutor_courses" (
	"id" text PRIMARY KEY NOT NULL,
	"tutor_id" text NOT NULL,
	"title" text NOT NULL,
	"subject_slug" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"thumbnail_url" text DEFAULT '' NOT NULL,
	"price_inr" integer DEFAULT 0 NOT NULL,
	"chapter_count" integer DEFAULT 0 NOT NULL,
	"is_published" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "course_enrollments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_id" text NOT NULL,
	"student_name" text NOT NULL,
	"student_avatar_url" text DEFAULT '' NOT NULL,
	"enrolled_at" timestamp with time zone DEFAULT now() NOT NULL,
	"progress_pct" integer DEFAULT 0 NOT NULL,
	"last_active_at" timestamp with time zone DEFAULT now() NOT NULL,
	"quiz_avg" integer DEFAULT 0 NOT NULL,
	"attendance_pct" integer DEFAULT 0 NOT NULL,
	"focus_score" integer DEFAULT 0 NOT NULL,
	"weak_topics" text[] DEFAULT '{}'::text[] NOT NULL,
	"streak_days" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "codelab_problems" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"difficulty" text NOT NULL,
	"subject" text NOT NULL,
	"description" text NOT NULL,
	"starter_code" text NOT NULL,
	"solution_code" text NOT NULL,
	"test_cases" text NOT NULL,
	"hints" text NOT NULL,
	"tags" text[] DEFAULT '{}' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "codelab_problems_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "codelab_submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"problem_id" uuid NOT NULL,
	"user_name" text NOT NULL,
	"code" text NOT NULL,
	"language" text DEFAULT 'python' NOT NULL,
	"passed" boolean DEFAULT false NOT NULL,
	"passed_count" integer DEFAULT 0 NOT NULL,
	"total_count" integer DEFAULT 0 NOT NULL,
	"output" text DEFAULT '' NOT NULL,
	"submitted_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "library_books" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"author" text NOT NULL,
	"category" text NOT NULL,
	"cover_url" text,
	"description" text NOT NULL,
	"short_desc" text NOT NULL,
	"tags" text[] DEFAULT '{}' NOT NULL,
	"pages" integer DEFAULT 0 NOT NULL,
	"reading_time_minutes" integer DEFAULT 0 NOT NULL,
	"is_free" boolean DEFAULT true NOT NULL,
	"price_credits" integer DEFAULT 0 NOT NULL,
	"ai_summary" text,
	"content_preview" text,
	"rating" numeric(3, 2) DEFAULT '0' NOT NULL,
	"review_count" integer DEFAULT 0 NOT NULL,
	"downloads" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "marketplace_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"creator_name" text NOT NULL,
	"creator_avatar" text,
	"category" text NOT NULL,
	"price_credits" integer DEFAULT 0 NOT NULL,
	"is_free" boolean DEFAULT false NOT NULL,
	"rating" numeric(3, 2) DEFAULT '0' NOT NULL,
	"review_count" integer DEFAULT 0 NOT NULL,
	"downloads" integer DEFAULT 0 NOT NULL,
	"description" text NOT NULL,
	"preview_url" text,
	"tags" text[] DEFAULT '{}' NOT NULL,
	"file_type" text DEFAULT 'pdf' NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "marketplace_purchases" (
	"id" serial PRIMARY KEY NOT NULL,
	"item_id" integer NOT NULL,
	"user_name" text NOT NULL,
	"purchased_at" timestamp with time zone DEFAULT now() NOT NULL,
	"price_paid" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lucky_royal_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"room_id" uuid NOT NULL,
	"user_name" text NOT NULL,
	"entered_at" timestamp with time zone DEFAULT now() NOT NULL,
	"result_type" text DEFAULT 'pending' NOT NULL,
	"reward_amount" integer DEFAULT 0 NOT NULL,
	"reward_label" text
);
--> statement-breakpoint
CREATE TABLE "lucky_royal_rooms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"creator_name" text NOT NULL,
	"creator_avatar" text,
	"reward_title" text NOT NULL,
	"reward_image" text,
	"reward_type" text DEFAULT 'item' NOT NULL,
	"entry_credits" integer DEFAULT 10 NOT NULL,
	"max_participants" integer DEFAULT 50 NOT NULL,
	"current_participants" integer DEFAULT 0 NOT NULL,
	"ends_at" timestamp with time zone NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"category" text DEFAULT 'general' NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "study_rooms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"type" text DEFAULT 'group_study' NOT NULL,
	"host_name" text NOT NULL,
	"host_avatar" text,
	"room_code" text NOT NULL,
	"password" text,
	"is_locked" boolean DEFAULT false NOT NULL,
	"max_participants" integer DEFAULT 20 NOT NULL,
	"current_participants" integer DEFAULT 0 NOT NULL,
	"scheduled_at" timestamp with time zone,
	"status" text DEFAULT 'waiting' NOT NULL,
	"description" text,
	"subject" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "study_rooms_room_code_unique" UNIQUE("room_code")
);
--> statement-breakpoint
CREATE TABLE "room_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"room_id" uuid NOT NULL,
	"user_name" text NOT NULL,
	"display_name" text NOT NULL,
	"avatar_url" text,
	"role" text DEFAULT 'member' NOT NULL,
	"is_muted" boolean DEFAULT false NOT NULL,
	"is_camera_off" boolean DEFAULT false NOT NULL,
	"is_hand_raised" boolean DEFAULT false NOT NULL,
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL,
	"left_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "room_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"room_id" uuid NOT NULL,
	"user_name" text NOT NULL,
	"display_name" text NOT NULL,
	"avatar_url" text,
	"content" text NOT NULL,
	"type" text DEFAULT 'text' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "marketplace_purchases" ADD CONSTRAINT "marketplace_purchases_item_id_marketplace_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."marketplace_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lucky_royal_entries" ADD CONSTRAINT "lucky_royal_entries_room_id_lucky_royal_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."lucky_royal_rooms"("id") ON DELETE no action ON UPDATE no action;