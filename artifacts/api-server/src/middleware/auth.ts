import { Request, Response, NextFunction } from "express";

export type UserRole = "student" | "tutor" | "admin";

declare global {
  namespace Express {
    interface Request {
      userRole: UserRole | null;
    }
  }
}

// ── Attach role from header to every request ──────────────────────────────────
// The frontend reads edu_role from localStorage and sends it as X-User-Role.
// This is a demo-grade approach — in production, use signed JWTs or sessions.
export function attachRole(req: Request, _res: Response, next: NextFunction) {
  const raw = req.headers["x-user-role"] as string | undefined;
  const allowed: UserRole[] = ["student", "tutor", "admin"];
  req.userRole = allowed.includes(raw as UserRole) ? (raw as UserRole) : null;
  next();
}

// ── Middleware factory: require one of the given roles ─────────────────────────
export function requireRole(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.userRole) {
      res.status(401).json({
        error: "Unauthorized",
        message: "Authentication required. Please sign in.",
      });
      return;
    }
    if (!roles.includes(req.userRole)) {
      res.status(403).json({
        error: "Forbidden",
        message: "You do not have permission to access this section.",
        requiredRole: roles,
        yourRole: req.userRole,
      });
      return;
    }
    next();
  };
}

// ── Convenience shorthands ────────────────────────────────────────────────────
export const requireTutor = requireRole("tutor", "admin");
export const requireAdmin = requireRole("admin");
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.userRole) {
    res.status(401).json({ error: "Unauthorized", message: "Please sign in." });
    return;
  }
  next();
};
