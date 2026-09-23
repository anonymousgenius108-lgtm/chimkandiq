# EduConnect

A full-stack tutoring marketplace where students discover and book tutors, engage in peer learning, and earn rewards — all in one platform.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Monorepo Structure](#monorepo-structure)
- [Architecture](#architecture)
- [Authentication & RBAC](#authentication--rbac)
- [Frontend Pages](#frontend-pages)
- [Backend API Routes](#backend-api-routes)
- [Database Schema](#database-schema)
- [Gamification System](#gamification-system)
- [Wallet & Credits](#wallet--credits)
- [Shared Libraries](#shared-libraries)
- [Getting Started](#getting-started)
- [Useful Commands](#useful-commands)

---

## Overview

EduConnect connects students with tutors by subject and availability. Beyond tutoring, it includes:

- **Peer Q&A** — students post doubts, others answer and vote
- **Learning Reels** — short-form vertical video lessons with likes and comments
- **Gamification** — points, badges, levels, and a leaderboard
- **Marketplace** — buy/sell study resources and digital assets
- **Study Rooms** — collaborative virtual study spaces
- **Codelab** — in-browser coding problems with submissions
- **Library** — curated reading material with an in-app reader
- **Lucky Royal** — gamified spin-wheel rewards
- **Wallet** — credits ledger with withdraw support (demo)
- **Focus Mode** — distraction-free timer for study sessions

The single demo user is **Alex Morgan** (`https://i.pravatar.cc/200?img=5`), used wherever actions are attributed to the current user.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, TypeScript, Tailwind CSS, shadcn/ui |
| Routing | Wouter |
| Data fetching | TanStack Query (React Query) v5 |
| Backend | Express 5, TypeScript |
| ORM | Drizzle ORM |
| Database | PostgreSQL |
| Charts | Recharts |
| API contract | OpenAPI 3.1 (Orval codegen) |
| Package manager | pnpm workspaces |
| AI integration | OpenAI (via Replit AI Integrations) |

---

## Monorepo Structure

```
/
├── artifacts/
│   ├── educonnect/          # React + Vite frontend (served at /)
│   └── api-server/          # Express 5 backend (served at /api)
├── lib/
│   ├── api-spec/            # OpenAPI 3.1 YAML — single source of truth
│   ├── api-client-react/    # TanStack Query hooks (Orval generated)
│   ├── api-zod/             # Zod schemas (Orval generated)
│   ├── db/                  # Drizzle ORM schema + Postgres client
│   ├── integrations-openai-ai-react/   # OpenAI React hooks
│   └── integrations-openai-ai-server/  # OpenAI server client
├── scripts/                 # Seed scripts for demo data
├── pnpm-workspace.yaml
├── tsconfig.base.json
└── tsconfig.json
```

---

## Architecture

```
Browser
  │
  ▼
[Vite Dev Server / Static]   artifacts/educonnect
  │  React SPA (Wouter router)
  │  TanStack Query → generated hooks from lib/api-client-react
  │
  ▼ (proxied via Replit shared proxy at /api)
[Express 5 Server]           artifacts/api-server
  │  Drizzle ORM
  ▼
[PostgreSQL Database]        lib/db
```

**Routing:** A global reverse proxy routes `/api/*` to the Express server and everything else to the Vite frontend. The frontend never calls backend ports directly; it uses relative `/api/` URLs.

**API Contract:** `lib/api-spec/openapi.yaml` is the single contract. Running `pnpm --filter @workspace/api-spec run codegen` regenerates React Query hooks (`lib/api-client-react`) and Zod schemas (`lib/api-zod`) from it. Never edit generated files manually.

---

## Authentication & RBAC

Authentication is **demo-only** (no real auth server). State is stored in `localStorage` and managed reactively via `useSyncExternalStore`.

### Roles

| Role | Description |
|---|---|
| `student` | Default after login. Access to all learning features. |
| `tutor` | Everything students have + tutor dashboard, analytics, course creation, reel upload, marketplace seller tools. |
| `admin` | All tutor permissions + admin tools + access to private student data. |

### How It Works

**`artifacts/educonnect/src/lib/auth.ts`** is the single authority:

```ts
const { isLoggedIn, role, isTutor, isAdmin, can } = useAuth();

// Fine-grained permission check:
can("create:course")        // true for tutor and admin only
can("access:reels-upload")  // true for tutor and admin
can("create:reel")          // true for all roles
```

### Permission Categories

- **`access:*`** — Feature access gates (tutor dashboard, analytics, live hosting, marketplace seller)
- **`view:*`** — Admin-only visibility into private student data
- **`create:*`** — Creation actions split between shared (students + tutors) and tutor-only

### Route Guards

Three wrapper components in `artifacts/educonnect/src/components/protected-route.tsx`:

| Component | Behaviour |
|---|---|
| `<AuthedRoute>` | Redirects to `/login` if not logged in |
| `<TutorRoute>` | Redirects to `/` with 403 UI if not tutor/admin |
| `<ProtectedRoute>` | General configurable guard |

### Backend Enforcement

The Express middleware in `artifacts/api-server/src/middleware/auth.ts` reads the `X-User-Role` header and returns `403 Forbidden` on tutor-only routes if the caller is not a tutor or admin.

---

## Frontend Pages

All routes live in `artifacts/educonnect/src/App.tsx`.

### Public / Auth

| Route | Description |
|---|---|
| `/login` | Login page with email, Google, OTP, and magic-link methods |
| `/signup` | New account creation |
| `/onboarding/student` | Student profile setup flow |
| `/onboarding/tutor` | Tutor profile and subject setup flow |

### Student (AuthedRoute)

| Route | Description |
|---|---|
| `/` | Discover — hero, featured tutors, subject browse |
| `/tutors` | Browse tutors with filters (subject, day, rating, price) and sort |
| `/tutors/:tutorId` | Tutor profile: About / Availability / Reviews tabs, book and message actions |
| `/bookings` | Tabbed list: upcoming / completed / cancelled |
| `/bookings/:bookingId` | Booking detail with payment dialog and cancel |
| `/messages` | Message thread list |
| `/messages/:tutorId` | Conversation with simulated tutor replies (~3s polling) |
| `/dashboard` | Stats, weekly hours chart, top subjects, recent activity, level/points card |
| `/notifications` | Inbox with mark-as-read |
| `/qna` | Doubt Q&A list: Recent / Top / Unanswered tabs, search |
| `/qna/ask` | Compose a question (title, body, 1–5 tags) |
| `/qna/:questionId` | Question detail: answers, voting, best-answer marking |
| `/reels` | Vertical learning reels with like / comments / next-prev, "Up next" rail |
| `/leaderboard` | Daily / weekly / monthly / all-time rankings, your standing, badge collection |
| `/profile` | Own profile with About / Activity / Badges / Followers / Following tabs |
| `/profile/:userName` | Another user's profile with Follow / Unfollow + Message |
| `/search` | Unified search across people, questions, reels, and tags |
| `/wallet` | Credits balance, weekly/monthly delta, ledger history, Withdraw dialog |
| `/marketplace` | Browse study resources and digital assets |
| `/marketplace/:id` | Item detail with purchase |
| `/library` | Curated book/article list |
| `/library/:id` | In-app reader |
| `/codelab` | Coding problem browser |
| `/codelab/:slug` | In-browser IDE with submission |
| `/lucky-royal` | Spin-wheel gamified reward rooms |
| `/lucky-royal/:id` | Active lucky royal room |
| `/study-rooms` | Collaborative virtual study spaces list |
| `/study-rooms/:roomId` | Active study room |
| `/focus` | Distraction-free Pomodoro-style focus timer |

### Tutor-only (TutorRoute)

| Route | Description |
|---|---|
| `/tutor-dashboard` | Overview, revenue, student list, course management, alerts |
| `/reels/upload` | Reel upload form (accessible to all authenticated users via `can("create:reel")`) |

---

## Backend API Routes

All routes are served at `/api`.

```
GET  /health

# Subjects
GET  /subjects

# Tutors
GET  /tutors
GET  /tutors/featured
GET  /tutors/:tutorId
GET  /tutors/:tutorId/reviews
POST /tutors/:tutorId/reviews
GET  /tutors/:tutorId/availability

# Bookings
GET    /bookings
POST   /bookings
GET    /bookings/:bookingId
PATCH  /bookings/:bookingId
POST   /bookings/:bookingId/pay          # demo payment — no real money

# Messages
GET  /messages/threads
GET  /messages/threads/:tutorId
POST /messages/threads/:tutorId          # auto-generates tutor reply

# Notifications
GET  /notifications
POST /notifications/:notificationId/read

# Dashboard
GET  /dashboard/summary

# Q&A
GET  /qna/questions
POST /qna/questions
GET  /qna/questions/:questionId
POST /qna/questions/:questionId/answers
POST /qna/questions/:questionId/vote
POST /qna/answers/:answerId/vote
POST /qna/answers/:answerId/best

# Reels
GET  /reels
POST /reels/:reelId/like
GET  /reels/:reelId/comments
POST /reels/:reelId/comments

# Gamification
GET  /gamification/me
GET  /gamification/leaderboard?period=daily|weekly|monthly|alltime
GET  /gamification/badges

# Profiles
GET    /profiles/me
PATCH  /profiles/me
GET    /profiles/:userName
POST   /profiles/:userName/follow
DELETE /profiles/:userName/follow
GET    /profiles/:userName/followers
GET    /profiles/:userName/following
GET    /profiles/:userName/activity

# Search
GET  /search?q=…

# Wallet
GET  /wallet/me
POST /wallet/withdraw

# Marketplace
GET  /marketplace
GET  /marketplace/:id
POST /marketplace/:id/purchase

# Library
GET  /library
GET  /library/:id

# Codelab
GET  /codelab
GET  /codelab/:slug
POST /codelab/:slug/submit

# Lucky Royal
GET  /lucky-royal/rooms
GET  /lucky-royal/rooms/:id
POST /lucky-royal/spin

# Study Rooms
GET  /study-rooms
POST /study-rooms
GET  /study-rooms/:id
POST /study-rooms/:id/join
POST /study-rooms/:id/leave
POST /study-rooms/:id/messages

# Tutor Dashboard (tutor/admin only)
GET  /tutor-dashboard/overview
GET  /tutor-dashboard/students
GET  /tutor-dashboard/courses
GET  /tutor-dashboard/revenue
GET  /tutor-dashboard/alerts
```

Payment is mocked — `POST /bookings/:id/pay` flips the booking to `confirmed` and returns a synthetic receipt.

---

## Database Schema

All tables are defined in `lib/db/src/schema/`.

| Table | Purpose |
|---|---|
| `profiles` | User profiles (PK: `user_name`, display name, avatar, bio, subjects/skills/interests) |
| `tutors` | Tutor records linked to profiles |
| `subjects` | Subject taxonomy |
| `tutor_availability` | Weekly availability windows per tutor |
| `tutor_courses` | Courses created by tutors |
| `course_enrollments` | Student–course enrollment records |
| `reviews` | Tutor reviews and ratings |
| `bookings` | Session bookings (pending → confirmed → completed/cancelled) |
| `messages` | Direct messages between students and tutors |
| `notifications` | System + activity notifications |
| `questions` | Q&A question posts |
| `answers` | Answers to questions |
| `votes` | Upvote/downvote on questions and answers (composite PK) |
| `reels` | Short learning video records |
| `reel_likes` | Per-user reel likes |
| `reel_comments` | Reel comments |
| `badges` | Badge definitions |
| `user_badges` | Earned badges per user |
| `user_stats` | Points total and streak per user |
| `points_events` | Ledger of all point-earning events (also the wallet ledger) |
| `follows` | Follow relationships (composite PK: `follower_name` + `followee_name`) |
| `library_books` | Curated reading material |
| `marketplace_items` | Marketplace listings |
| `codelab_problems` | Coding problems |
| `codelab_submissions` | User submissions with results |
| `lucky_royal` | Lucky royal spin records |
| `study_rooms` | Study room records |
| `room_members` | Active room membership |
| `room_messages` | In-room chat messages |

---

## Gamification System

Points are earned by inserting rows into `points_events`. Levels advance as points accumulate:

| Level | Minimum Points |
|---|---|
| Beginner | 0 |
| Learner | 100 |
| Contributor | 500 |
| Expert | 1 500 |
| Mentor | 5 000 |

**Point values:**

| Action | Points |
|---|---|
| Ask a question | 5 |
| Post an answer | 10 |
| Answer marked "best" | 25 |
| Session completed | 15 |
| Upvote received | 2 |

Asking and answering also insert a `notifications` row for the recipient (when they are not the acting user).

---

## Wallet & Credits

The wallet reuses `points_events` as a ledger:

- **Balance** = `user_stats.points` + `SUM(points_events.points)`
- **Withdraw** inserts a row with `kind = "withdraw"` and a **negative** `points` amount
- Minimum withdraw is 100 credits; currency shown as INR
- No real money is moved — this is a demo flow

---

## Shared Libraries

### `lib/api-spec`
OpenAPI 3.1 YAML contract. **Do not change `info.title`** — it controls generated file names.

### `lib/api-client-react`
TanStack Query v5 hooks generated by Orval. Import hooks from `@workspace/api-client-react`:
```ts
import { useListTutors, useGetTutorQueryKey } from "@workspace/api-client-react";
```

### `lib/api-zod`
Zod schemas generated from the OpenAPI spec. Used by the backend for input validation.

### `lib/db`
Drizzle ORM schema + PostgreSQL client. Used exclusively by `artifacts/api-server`.

The app prefers the `SUPABASE_DATABASE_URL` secret when it is present and falls
back to Replit's `DATABASE_URL` for local compatibility. Supabase connections
automatically use SSL. The Supabase URL and publishable key are stored securely
as `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY`; the current server-side data
layer does not expose either value to the browser.

### `lib/integrations-openai-ai-server` / `lib/integrations-openai-ai-react`
OpenAI client helpers (Replit AI Integrations — no user API key required). Server-side and React hooks respectively.

---

## Getting Started

### Prerequisites
- Node.js 20+
- pnpm 9+
- PostgreSQL (Replit provides one automatically)

### Install dependencies
```bash
pnpm install
```

### Apply database schema
```bash
pnpm --filter @workspace/db run push
```

When Supabase is configured, this command applies the Drizzle schema to the
Supabase database referenced by `SUPABASE_DATABASE_URL`. Confirm the target
database before running it.

### Seed demo data
```bash
pnpm --filter @workspace/scripts run seed
```

### Start the app

The app runs via two workflows managed by Replit:

| Workflow | Command |
|---|---|
| `artifacts/educonnect: web` | `pnpm --filter @workspace/educonnect run dev` |
| `artifacts/api-server: API Server` | `pnpm --filter @workspace/api-server run dev` |

---

## Useful Commands

```bash
# Apply Drizzle schema changes to the database
pnpm --filter @workspace/db run push

# Reseed all demo data (destructive — resets tables)
pnpm --filter @workspace/scripts run seed

# Regenerate React Query hooks and Zod schemas from OpenAPI spec
pnpm --filter @workspace/api-spec run codegen

# Typecheck the frontend
pnpm --filter @workspace/educonnect run typecheck

# Typecheck the API server
pnpm --filter @workspace/api-server run typecheck

# Full workspace typecheck (libs + all artifacts)
pnpm run typecheck
```
#   c h i m k a n d i  
 