import { useSyncExternalStore, useCallback } from "react";

// ── Types ──────────────────────────────────────────────────────────────────────
export type UserRole = "student" | "tutor" | "admin";

export type Permission =
  // ── Access permissions (tutor-only features) ───────────────────────────────
  | "access:tutor-dashboard"
  | "access:tutor-analytics"
  | "access:tutor-courses"
  | "access:tutor-students"
  | "access:tutor-revenue"
  | "access:tutor-live-host"
  | "access:reels-upload"
  | "access:marketplace-seller"
  | "access:admin-tools"
  // ── View permissions (admin-only) ──────────────────────────────────────────
  | "view:student-private-data"
  | "view:student-wallet"
  | "view:student-private-chats"
  | "view:student-private-files"
  | "view:student-security"
  // ── Student creation permissions ──────────────────────────────────────────
  | "create:note"
  | "create:goal"
  | "create:study-room"
  | "create:group"
  | "create:code-project"
  | "create:reel"
  | "create:question"
  | "create:answer"
  | "create:flashcard"
  | "create:marketplace-asset"
  | "create:auction"
  | "create:lucky-royal"
  | "create:reading-list"
  // ── Tutor-only creation permissions ───────────────────────────────────────
  | "create:course"
  | "create:class"
  | "create:live-class"
  | "create:assignment"
  | "create:test"
  | "create:certificate"
  | "create:batch"
  | "create:student-report"
  | "create:resource"
  | "create:club"
  | "create:subject"
  | "create:chapter";

// ── Shared student creation permissions ───────────────────────────────────────
const STUDENT_CREATE: Permission[] = [
  "create:note",
  "create:goal",
  "create:study-room",
  "create:group",
  "create:code-project",
  "create:reel",
  "create:question",
  "create:answer",
  "create:flashcard",
  "create:marketplace-asset",
  "create:auction",
  "create:lucky-royal",
  "create:reading-list",
];

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  student: [...STUDENT_CREATE],
  tutor: [
    // access
    "access:tutor-dashboard",
    "access:tutor-analytics",
    "access:tutor-courses",
    "access:tutor-students",
    "access:tutor-revenue",
    "access:tutor-live-host",
    "access:reels-upload",
    "access:marketplace-seller",
    // create: inherit student
    ...STUDENT_CREATE,
    // create: tutor-only
    "create:course",
    "create:class",
    "create:live-class",
    "create:assignment",
    "create:test",
    "create:certificate",
    "create:batch",
    "create:student-report",
    "create:resource",
    "create:club",
    "create:subject",
    "create:chapter",
  ],
  admin: [
    // access
    "access:tutor-dashboard",
    "access:tutor-analytics",
    "access:tutor-courses",
    "access:tutor-students",
    "access:tutor-revenue",
    "access:tutor-live-host",
    "access:reels-upload",
    "access:marketplace-seller",
    "access:admin-tools",
    // view
    "view:student-private-data",
    "view:student-wallet",
    "view:student-private-chats",
    "view:student-private-files",
    "view:student-security",
    // create: everything
    ...STUDENT_CREATE,
    "create:course",
    "create:class",
    "create:live-class",
    "create:assignment",
    "create:test",
    "create:certificate",
    "create:batch",
    "create:student-report",
    "create:resource",
    "create:club",
    "create:subject",
    "create:chapter",
  ],
};

// ── Auth state (reactive via localStorage events) ──────────────────────────────
function readSnapshot(): string {
  return JSON.stringify({
    isLoggedIn: localStorage.getItem("edu_logged_in") === "true",
    role: localStorage.getItem("edu_role") as UserRole | null,
    isOnboarded: localStorage.getItem("edu_onboarded") === "true",
  });
}

const listeners = new Set<() => void>();

function subscribe(cb: () => void) {
  listeners.add(cb);

  function onStorage(e: StorageEvent) {
    if (e.key === "edu_logged_in" || e.key === "edu_role" || e.key === "edu_onboarded") {
      listeners.forEach((l) => l());
    }
  }

  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

export function notifyAuthChange() {
  listeners.forEach((l) => l());
}

// ── Core hook ──────────────────────────────────────────────────────────────────
export function useAuth() {
  const raw = useSyncExternalStore(subscribe, readSnapshot, readSnapshot);
  const { isLoggedIn, role, isOnboarded } = JSON.parse(raw) as {
    isLoggedIn: boolean;
    role: UserRole | null;
    isOnboarded: boolean;
  };

  const permissions = role ? ROLE_PERMISSIONS[role] : [];

  const can = useCallback(
    (permission: Permission) => permissions.includes(permission),
    [permissions],
  );

  return {
    isLoggedIn,
    role,
    isOnboarded,
    isStudent: role === "student",
    isTutor: role === "tutor",
    isAdmin: role === "admin",
    can,
  };
}

// ── Helpers for non-hook contexts ─────────────────────────────────────────────
export function getStoredRole(): UserRole | null {
  return localStorage.getItem("edu_role") as UserRole | null;
}

export function getStoredLoggedIn(): boolean {
  return localStorage.getItem("edu_logged_in") === "true";
}

// ── Auth mutations ─────────────────────────────────────────────────────────────
export function setAuthState(role: UserRole) {
  localStorage.setItem("edu_logged_in", "true");
  localStorage.setItem("edu_role", role);
  notifyAuthChange();
}

export function clearAuthState() {
  localStorage.removeItem("edu_logged_in");
  localStorage.removeItem("edu_role");
  localStorage.removeItem("edu_onboarded");
  notifyAuthChange();
}
