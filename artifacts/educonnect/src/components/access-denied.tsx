import { useLocation } from "wouter";
import { ShieldOff, ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";

interface AccessDeniedProps {
  title?: string;
  message?: string;
  backPath?: string;
}

export function AccessDenied({
  title = "Access Denied",
  message = "You do not have permission to access this section.",
  backPath,
}: AccessDeniedProps) {
  const [, setLocation] = useLocation();
  const { role } = useAuth();

  const defaultBack = role === "tutor" ? "/tutor-dashboard" : "/dashboard";

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-3xl bg-rose-50 border-2 border-rose-100 flex items-center justify-center">
            <ShieldOff className="w-9 h-9 text-rose-500" />
          </div>
        </div>

        {/* Text */}
        <div className="space-y-2">
          <h1 className="text-2xl font-black text-foreground">{title}</h1>
          <p className="text-muted-foreground text-sm leading-relaxed">{message}</p>
        </div>

        {/* Role pill */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted text-muted-foreground text-xs font-medium">
          <div className={`w-2 h-2 rounded-full ${role === "student" ? "bg-blue-500" : role === "tutor" ? "bg-emerald-500" : "bg-purple-500"}`} />
          Signed in as <strong className="text-foreground capitalize">{role ?? "guest"}</strong>
        </div>

        {/* What you CAN do */}
        <div className="bg-muted/50 rounded-2xl p-4 text-left space-y-2">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            {role === "student" ? "Students can access" : "You can access"}
          </p>
          <ul className="space-y-1.5 text-sm text-foreground">
            {role === "student" ? (
              <>
                <li className="flex items-center gap-2"><span className="text-emerald-500">✓</span> Dashboard &amp; Learning Tools</li>
                <li className="flex items-center gap-2"><span className="text-emerald-500">✓</span> Browse &amp; Book Tutors</li>
                <li className="flex items-center gap-2"><span className="text-emerald-500">✓</span> Q&amp;A Forum, Reels, Leaderboard</li>
                <li className="flex items-center gap-2"><span className="text-emerald-500">✓</span> Study Rooms, Codelab, Library</li>
                <li className="flex items-center gap-2"><span className="text-rose-400">✗</span> Tutor Dashboard &amp; Teaching Tools</li>
              </>
            ) : (
              <>
                <li className="flex items-center gap-2"><span className="text-emerald-500">✓</span> Tutor Dashboard &amp; Analytics</li>
                <li className="flex items-center gap-2"><span className="text-emerald-500">✓</span> All Student Features</li>
                <li className="flex items-center gap-2"><span className="text-emerald-500">✓</span> Course &amp; Student Management</li>
                <li className="flex items-center gap-2"><span className="text-rose-400">✗</span> Admin Control Panel</li>
              </>
            )}
          </ul>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-center">
          <Button
            variant="outline"
            onClick={() => setLocation(backPath ?? defaultBack)}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </Button>
          <Button
            onClick={() => setLocation(defaultBack)}
            className="gap-2"
          >
            <Home className="w-4 h-4" />
            My Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
