---
name: RBAC Architecture
description: How role-based access control is implemented across the EduConnect stack
---

## Rule
Three-level RBAC: UI hiding → route guards → backend enforcement.

**Roles:** `student` | `tutor` | `admin` stored in `localStorage["edu_role"]`.

**Level 1 — UI:** `useAuth()` hook (`src/lib/auth.ts`) reactively reads localStorage via `useSyncExternalStore`. Mega drawer hides `tutorOnly` categories from students. Sidebar shows role badge + sign-out.

**Level 2 — Routes:** `AuthedRoute` / `TutorRoute` / `AdminRoute` in `src/components/protected-route.tsx`. `TutorRoute` wraps with `TutorLayout` for tutors, renders `<AccessDenied>` inside `Layout` for students. Does NOT redirect tutors away from student pages (tutors can browse student features).

**Level 3 — Backend:** `attachRole` middleware (`api-server/src/middleware/auth.ts`) reads `X-User-Role` header on every request. `requireTutor` guards `/api/tutor-dashboard/*` routes. Frontend injects header via `setRoleGetter` in `custom-fetch.ts` (called at app startup in `main.tsx`).

**Why:** Frontend hiding alone is bypassable. Backend returns 403/401 without correct role header.

**How to apply:** Add new tutor routes → apply `requireRole("tutor", "admin")` in `routes/index.ts`. Add new admin routes → apply `requireRole("admin")`.
