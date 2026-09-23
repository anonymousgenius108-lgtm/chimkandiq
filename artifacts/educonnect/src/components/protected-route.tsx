import { ReactNode, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { AccessDenied } from "@/components/access-denied";
import { Layout } from "@/components/layout";
import { TutorLayout } from "@/components/tutor-layout";

// ── Auth gate: redirect to /login if not signed in ────────────────────────────
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isLoggedIn } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoggedIn) setLocation("/login");
  }, [isLoggedIn, setLocation]);

  if (!isLoggedIn) return null;
  return <>{children}</>;
}

// ── Tutor-only route ──────────────────────────────────────────────────────────
// Students see an access-denied page wrapped in their normal Layout.
// Tutors/admins see the content wrapped in TutorLayout.
export function TutorRoute({ children }: { children: ReactNode }) {
  const { isLoggedIn, role } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoggedIn) setLocation("/login");
  }, [isLoggedIn, setLocation]);

  if (!isLoggedIn) return null;

  if (role === "student") {
    return (
      <Layout>
        <AccessDenied
          title="Tutor Zone"
          message="You do not have permission to access this section. This area is reserved for tutors and instructors."
        />
      </Layout>
    );
  }

  return (
    <TutorLayout>
      {children}
    </TutorLayout>
  );
}

// ── Admin-only route ──────────────────────────────────────────────────────────
export function AdminRoute({ children }: { children: ReactNode }) {
  const { isLoggedIn, role } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoggedIn) setLocation("/login");
  }, [isLoggedIn, setLocation]);

  if (!isLoggedIn) return null;

  if (role !== "admin") {
    return (
      <Layout>
        <AccessDenied
          title="Admin Only"
          message="You do not have permission to access this section. This area is reserved for platform administrators."
        />
      </Layout>
    );
  }

  return <>{children}</>;
}

// ── General auth-required route with Layout ───────────────────────────────────
export function AuthedRoute({ children }: { children: ReactNode }) {
  const { isLoggedIn } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoggedIn) setLocation("/login");
  }, [isLoggedIn, setLocation]);

  if (!isLoggedIn) return null;

  return (
    <Layout>
      {children}
    </Layout>
  );
}
