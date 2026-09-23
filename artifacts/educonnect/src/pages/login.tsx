import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import {
  BookOpen, GraduationCap, Presentation, Eye, EyeOff, ArrowRight,
  Sparkles, Mail, Phone, Key, Chrome, ChevronLeft, CheckCircle2,
  Shield, Zap, Brain, Users, Star, RotateCcw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { setAuthState } from "@/lib/auth";

type Role = "student" | "tutor";
type AuthMethod = "email" | "google" | "otp" | "magic";
type PageMode = "login" | "forgot";

const DEMO_ACCOUNTS = {
  student: { email: "alex.morgan@student.edu", password: "demo123", name: "Alex Morgan", avatar: "https://i.pravatar.cc/200?img=5" },
  tutor: { email: "priya.sharma@tutor.edu", password: "tutor123", name: "Priya Sharma", avatar: "https://i.pravatar.cc/200?img=47" },
};

// Animated futuristic background
function FuturisticBg() {
  return (
    <>
      <style>{`
        @keyframes floatA { 0%,100% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-30px) rotate(8deg); } }
        @keyframes floatB { 0%,100% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-20px) rotate(-5deg); } }
        @keyframes driftL { 0% { transform: translateX(-100px) translateY(0); opacity:0; } 50% { opacity:0.6; } 100% { transform: translateX(100vw) translateY(-80px); opacity:0; } }
        @keyframes pulse-glow { 0%,100% { opacity:0.15; transform:scale(1); } 50% { opacity:0.35; transform:scale(1.1); } }
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .float-a { animation: floatA 7s ease-in-out infinite; }
        .float-b { animation: floatB 5s ease-in-out infinite; }
        .drift { animation: driftL 18s linear infinite; }
        .glow-orb { animation: pulse-glow 4s ease-in-out infinite; }
        .spin-slow { animation: spin-slow 20s linear infinite; }
      `}</style>
      <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
        {/* Base gradient */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #0a0015 0%, #0d0a2e 40%, #0a1a2e 70%, #0f0a20 100%)" }} />
        {/* Grid */}
        <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: "linear-gradient(rgba(139,92,246,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.5) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
        {/* Glow orbs */}
        <div className="glow-orb absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full" style={{ background: "radial-gradient(circle, rgba(99,57,236,0.2) 0%, transparent 70%)" }} />
        <div className="glow-orb absolute -bottom-40 -right-20 w-[500px] h-[500px] rounded-full" style={{ background: "radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)", animationDelay: "2s" }} />
        <div className="glow-orb absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full" style={{ background: "radial-gradient(circle, rgba(168,85,247,0.08) 0%, transparent 70%)", animationDelay: "1s" }} />
        {/* Floating shapes */}
        <div className="float-a absolute top-[15%] left-[8%] w-16 h-16 rounded-2xl border border-purple-500/20 bg-purple-500/5 backdrop-blur-sm flex items-center justify-center text-2xl">🎓</div>
        <div className="float-b absolute top-[25%] right-[6%] w-12 h-12 rounded-xl border border-blue-400/20 bg-blue-400/5 flex items-center justify-center text-xl" style={{ animationDelay: "2s" }}>💡</div>
        <div className="float-a absolute bottom-[20%] left-[5%] w-14 h-14 rounded-2xl border border-cyan-400/15 bg-cyan-400/5 flex items-center justify-center text-2xl" style={{ animationDelay: "3.5s" }}>📚</div>
        <div className="float-b absolute bottom-[35%] right-[8%] w-12 h-12 rounded-xl border border-purple-400/20 bg-purple-400/5 flex items-center justify-center text-xl" style={{ animationDelay: "1.5s" }}>🤖</div>
        <div className="float-a absolute top-[55%] left-[12%] w-10 h-10 rounded-lg border border-pink-400/15 bg-pink-400/5 flex items-center justify-center text-lg" style={{ animationDelay: "4s" }}>⚡</div>
        {/* Drifting particles */}
        {[...Array(6)].map((_, i) => (
          <div key={i} className="drift absolute w-1 h-1 rounded-full bg-purple-400/60" style={{ top: Math.random() * 100 + "%", left: "-5px", animationDelay: i * 3 + "s", animationDuration: (14 + i * 2) + "s" }} />
        ))}
        {/* Rotating ring */}
        <div className="spin-slow absolute top-[10%] right-[15%] w-32 h-32 rounded-full border border-dashed border-purple-500/10" />
        <div className="spin-slow absolute bottom-[10%] left-[18%] w-24 h-24 rounded-full border border-dashed border-blue-400/10" style={{ animationDirection: "reverse", animationDuration: "14s" }} />
      </div>
    </>
  );
}

// Password strength
function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: "8+ characters", ok: password.length >= 8 },
    { label: "Uppercase", ok: /[A-Z]/.test(password) },
    { label: "Number", ok: /\d/.test(password) },
    { label: "Symbol", ok: /[^a-zA-Z0-9]/.test(password) },
  ];
  const score = checks.filter((c) => c.ok).length;
  const colors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-emerald-500"];
  const labels = ["Weak", "Fair", "Good", "Strong"];
  if (!password) return null;
  return (
    <div className="space-y-2">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={`flex-1 h-1 rounded-full transition-all ${i < score ? colors[score - 1] : "bg-white/10"}`} />
        ))}
      </div>
      <div className="flex justify-between">
        <span className="text-xs text-white/40">Password strength</span>
        <span className={`text-xs font-medium ${score >= 3 ? "text-emerald-400" : score >= 2 ? "text-yellow-400" : "text-red-400"}`}>{labels[score - 1] ?? ""}</span>
      </div>
    </div>
  );
}

// OTP Input
function OTPFlow({ onSuccess }: { onSuccess: () => void }) {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "verify">("phone");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const { toast } = useToast();

  const sendOTP = async () => {
    if (phone.length < 10) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setStep("verify");
    setCountdown(30);
    toast({ title: "OTP Sent!", description: `Code sent to +91 ${phone}` });
  };

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const verify = async () => {
    if (otp.length < 4) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    onSuccess();
  };

  return (
    <div className="space-y-4">
      {step === "phone" ? (
        <>
          <div>
            <Label className="text-white/70 text-sm mb-1.5 block">Phone Number</Label>
            <div className="flex gap-2">
              <div className="flex items-center px-3 bg-white/5 border border-white/10 rounded-xl text-white/70 text-sm flex-shrink-0">+91</div>
              <Input value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/, ""))} maxLength={10} placeholder="9876543210" className="bg-white/5 border-white/10 text-white placeholder:text-white/30 h-11 rounded-xl" />
            </div>
          </div>
          <Button onClick={sendOTP} disabled={phone.length < 10 || loading} className="w-full h-11 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 border-0 text-white font-semibold rounded-xl">
            {loading ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Sending…</span> : "Send OTP"}
          </Button>
        </>
      ) : (
        <>
          <div>
            <Label className="text-white/70 text-sm mb-1.5 block">Enter 4-digit OTP</Label>
            <Input value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/, ""))} maxLength={6} placeholder="• • • •" className="bg-white/5 border-white/10 text-white placeholder:text-white/30 h-11 rounded-xl text-center text-xl tracking-[0.5em]" />
            <div className="flex items-center justify-between mt-2">
              <button onClick={() => setStep("phone")} className="text-xs text-white/40 hover:text-white/70 flex items-center gap-1"><ChevronLeft className="w-3 h-3" />Change number</button>
              <button onClick={sendOTP} disabled={countdown > 0} className="text-xs text-purple-400 hover:text-purple-300 disabled:text-white/30 flex items-center gap-1"><RotateCcw className="w-3 h-3" />{countdown > 0 ? `Resend in ${countdown}s` : "Resend OTP"}</button>
            </div>
          </div>
          <Button onClick={verify} disabled={otp.length < 4 || loading} className="w-full h-11 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 border-0 text-white font-semibold rounded-xl">
            {loading ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Verifying…</span> : "Verify OTP"}
          </Button>
        </>
      )}
    </div>
  );
}

// Magic link
function MagicLinkFlow({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const send = async () => {
    if (!email.includes("@")) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
    setSent(true);
    setTimeout(onSuccess, 3000);
  };

  if (sent) return (
    <div className="text-center py-6 space-y-3">
      <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto">
        <CheckCircle2 className="w-8 h-8 text-emerald-400" />
      </div>
      <h3 className="text-white font-bold text-lg">Check your email!</h3>
      <p className="text-white/50 text-sm">Magic link sent to <span className="text-purple-300">{email}</span>. Signing you in automatically…</p>
      <div className="w-full bg-white/10 rounded-full h-1 overflow-hidden mt-4">
        <div className="h-full bg-emerald-400 rounded-full" style={{ animation: "expand3s 3s linear forwards" }} />
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-white/70 text-sm mb-1.5 block">Email address</Label>
        <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="you@example.com" className="bg-white/5 border-white/10 text-white placeholder:text-white/30 h-11 rounded-xl" />
      </div>
      <Button onClick={send} disabled={!email.includes("@") || loading} className="w-full h-11 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 border-0 text-white font-semibold rounded-xl">
        {loading ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Sending link…</span> : <><Zap className="w-4 h-4 mr-2" />Send Magic Link</>}
      </Button>
    </div>
  );
}

// Forgot password flow
function ForgotPasswordFlow({ onBack }: { onBack: () => void }) {
  const [step, setStep] = useState<"email" | "otp" | "reset" | "done">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const next = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    if (step === "email") { setStep("otp"); toast({ title: "Code sent to " + email }); }
    else if (step === "otp") setStep("reset");
    else if (step === "reset") setStep("done");
  };

  const steps = ["email", "otp", "reset", "done"];
  const stepIdx = steps.indexOf(step);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
          <ChevronLeft className="w-4 h-4 text-white/70" />
        </button>
        <div>
          <h3 className="text-white font-bold">Reset Password</h3>
          <p className="text-white/40 text-xs">Step {stepIdx + 1} of 4</p>
        </div>
      </div>
      <div className="flex gap-1">
        {steps.map((_, i) => <div key={i} className={`flex-1 h-1 rounded-full transition-all ${i <= stepIdx ? "bg-purple-500" : "bg-white/10"}`} />)}
      </div>
      {step === "email" && (
        <>
          <p className="text-white/60 text-sm">Enter your registered email address.</p>
          <div><Label className="text-white/70 text-sm mb-1.5 block">Email</Label><Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="you@example.com" className="bg-white/5 border-white/10 text-white placeholder:text-white/30 h-11 rounded-xl" /></div>
        </>
      )}
      {step === "otp" && (
        <>
          <p className="text-white/60 text-sm">Enter the 6-digit code sent to <span className="text-purple-300">{email}</span></p>
          <div><Label className="text-white/70 text-sm mb-1.5 block">Reset Code</Label><Input value={code} onChange={(e) => setCode(e.target.value)} maxLength={6} placeholder="• • • • • •" className="bg-white/5 border-white/10 text-white placeholder:text-white/30 h-11 rounded-xl text-center text-xl tracking-[0.5em]" /></div>
        </>
      )}
      {step === "reset" && (
        <>
          <p className="text-white/60 text-sm">Create a strong new password.</p>
          <div><Label className="text-white/70 text-sm mb-1.5 block">New Password</Label><Input value={pw} onChange={(e) => setPw(e.target.value)} type="password" placeholder="••••••••" className="bg-white/5 border-white/10 text-white placeholder:text-white/30 h-11 rounded-xl" /></div>
          <PasswordStrength password={pw} />
        </>
      )}
      {step === "done" && (
        <div className="text-center py-4 space-y-3">
          <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto"><CheckCircle2 className="w-7 h-7 text-emerald-400" /></div>
          <h3 className="text-white font-bold">Password Reset!</h3>
          <p className="text-white/50 text-sm">Your password has been updated successfully.</p>
          <Button onClick={onBack} className="w-full h-11 bg-gradient-to-r from-purple-600 to-blue-600 border-0 text-white font-semibold rounded-xl">Back to Login</Button>
        </div>
      )}
      {step !== "done" && (
        <Button onClick={next} disabled={loading || (step === "email" && !email.includes("@")) || (step === "otp" && code.length < 4) || (step === "reset" && pw.length < 6)} className="w-full h-11 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 border-0 text-white font-semibold rounded-xl">
          {loading ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Processing…</span> : step === "reset" ? "Set New Password" : "Continue"}
        </Button>
      )}
    </div>
  );
}

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [role, setRole] = useState<Role>("student");
  const [mode, setMode] = useState<PageMode>("login");
  const [authMethod, setAuthMethod] = useState<AuthMethod>("email");
  const [email, setEmail] = useState(DEMO_ACCOUNTS.student.email);
  const [password, setPassword] = useState(DEMO_ACCOUNTS.student.password);
  const [showPw, setShowPw] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function switchRole(r: Role) {
    setRole(r);
    setEmail(DEMO_ACCOUNTS[r].email);
    setPassword(DEMO_ACCOUNTS[r].password);
    setError("");
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email.includes("@")) { setError("Please enter a valid email address."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setLoading(true);
    await new Promise((res) => setTimeout(res, 1000));
    setLoading(false);
    setAuthState(role);
    toast({ title: `Welcome back! 👋`, description: `Signed in as ${DEMO_ACCOUNTS[role].name}` });
    setLocation(role === "tutor" ? "/tutor-dashboard" : "/");
  }

  async function handleGoogleLogin() {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
    setAuthState(role);
    toast({ title: "Google sign-in successful! 🎉" });
    setLocation(role === "tutor" ? "/tutor-dashboard" : "/");
  }

  function handleAuthSuccess() {
    setAuthState(role);
    setLocation(role === "tutor" ? "/tutor-dashboard" : "/");
  }

  const AUTH_METHODS = [
    { id: "email" as AuthMethod, icon: Mail, label: "Email" },
    { id: "google" as AuthMethod, icon: Chrome, label: "Google" },
    { id: "otp" as AuthMethod, icon: Phone, label: "Phone" },
    { id: "magic" as AuthMethod, icon: Key, label: "Magic Link" },
  ];

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden">
      <FuturisticBg />

      <div className="relative z-10 w-full min-h-screen flex flex-col md:flex-row">
        {/* Left panel — info side */}
        <div className="hidden md:flex md:w-[42%] flex-col justify-between p-12 lg:p-16 relative">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-black text-white tracking-tight">EduConnect</span>
          </div>
          {/* Main content */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 bg-purple-500/20 border border-purple-500/30 rounded-full px-4 py-2 text-sm text-purple-300">
              <Sparkles className="w-4 h-4" /> AI-Powered Education Ecosystem
            </div>
            <div>
              <h1 className="text-4xl lg:text-5xl font-black text-white leading-tight mb-4">
                Learn, teach,<br />
                <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">build & grow.</span>
              </h1>
              <p className="text-white/60 text-lg leading-relaxed">Inside one AI-powered student ecosystem designed for the next generation of learners and educators.</p>
            </div>
            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Users, value: "12K+", label: "Active students" },
                { icon: Star, value: "500+", label: "Expert tutors" },
                { icon: Brain, value: "50+", label: "Subjects" },
                { icon: Zap, value: "80K+", label: "Sessions done" },
              ].map((s) => (
                <div key={s.label} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4">
                  <s.icon className="w-4 h-4 text-purple-400 mb-2" />
                  <div className="text-2xl font-black text-white">{s.value}</div>
                  <div className="text-white/50 text-xs">{s.label}</div>
                </div>
              ))}
            </div>
            {/* Trust badges */}
            <div className="flex flex-wrap gap-2">
              {["AI-Secured", "End-to-End Encrypted", "2FA Ready", "GDPR Compliant"].map((b) => (
                <div key={b} className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3 py-1 text-xs text-white/50">
                  <Shield className="w-3 h-3 text-emerald-400" />{b}
                </div>
              ))}
            </div>
          </div>
          <p className="text-white/30 text-xs">© 2026 EduConnect · Made for India 🇮🇳</p>
        </div>

        {/* Right panel — auth card */}
        <div className="flex-1 flex items-center justify-center px-5 py-10 md:px-8">
          <div className="w-full max-w-md">
            {/* Glass card */}
            <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-7 shadow-2xl shadow-black/50 space-y-5">
              {/* Mobile logo */}
              <div className="flex md:hidden items-center gap-2 mb-2">
                <BookOpen className="w-5 h-5 text-purple-400" />
                <span className="text-lg font-black text-white">EduConnect</span>
              </div>

              {mode === "forgot" ? (
                <ForgotPasswordFlow onBack={() => setMode("login")} />
              ) : (
                <>
                  {/* Header */}
                  <div className="space-y-1">
                    <h2 className="text-2xl font-black text-white">Welcome back</h2>
                    <p className="text-white/50 text-sm">Sign in to your EduConnect account</p>
                  </div>

                  {/* Role selector */}
                  <div className="grid grid-cols-2 gap-2">
                    {(["student", "tutor"] as Role[]).map((r) => {
                      const Icon = r === "student" ? GraduationCap : Presentation;
                      const active = role === r;
                      return (
                        <button key={r} onClick={() => switchRole(r)} className={`flex items-center gap-2.5 p-3.5 rounded-2xl border transition-all duration-200 text-left ${active ? "border-purple-500/60 bg-purple-500/15 shadow-lg shadow-purple-500/10" : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8"}`}>
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${active ? "bg-purple-500 shadow-lg shadow-purple-500/40" : "bg-white/10"}`}>
                            <Icon className="w-4.5 h-4.5 text-white" style={{ width: "1.1rem", height: "1.1rem" }} />
                          </div>
                          <div>
                            <div className={`text-sm font-bold capitalize ${active ? "text-white" : "text-white/60"}`}>{r}</div>
                            <div className="text-[10px] text-white/35">{r === "student" ? "Learn & grow" : "Teach & earn"}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Demo badge */}
                  <div className="flex items-center gap-2.5 bg-amber-500/10 border border-amber-500/20 rounded-2xl p-3">
                    <img src={DEMO_ACCOUNTS[role].avatar} alt="" className="w-8 h-8 rounded-full ring-2 ring-amber-500/30" />
                    <div className="flex-1 min-w-0">
                      <div className="text-amber-300 text-xs font-semibold">Demo: {DEMO_ACCOUNTS[role].name}</div>
                      <div className="text-amber-400/60 text-[10px]">Credentials pre-filled · Click Sign In</div>
                    </div>
                  </div>

                  {/* Auth method tabs */}
                  <div className="flex gap-1 bg-white/5 rounded-2xl p-1">
                    {AUTH_METHODS.map((m) => (
                      <button key={m.id} onClick={() => setAuthMethod(m.id)} className={`flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl transition-all text-xs ${authMethod === m.id ? "bg-white/15 text-white" : "text-white/30 hover:text-white/60"}`}>
                        <m.icon className="w-3.5 h-3.5" />
                        <span>{m.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Auth forms */}
                  {authMethod === "email" && (
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div>
                        <Label className="text-white/70 text-sm mb-1.5 block">Email address</Label>
                        <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="you@example.com" className="bg-white/5 border-white/10 text-white placeholder:text-white/30 h-11 rounded-xl focus:border-purple-500/50 focus:bg-white/8" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1.5">
                          <Label className="text-white/70 text-sm">Password</Label>
                          <button type="button" onClick={() => setMode("forgot")} className="text-xs text-purple-400 hover:text-purple-300">Forgot?</button>
                        </div>
                        <div className="relative">
                          <Input value={password} onChange={(e) => setPassword(e.target.value)} type={showPw ? "text" : "password"} placeholder="••••••••" className="bg-white/5 border-white/10 text-white placeholder:text-white/30 h-11 rounded-xl pr-10 focus:border-purple-500/50" />
                          <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70">
                            {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="checkbox" id="remember" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="w-4 h-4 rounded accent-purple-500" />
                        <label htmlFor="remember" className="text-white/50 text-xs cursor-pointer">Remember me for 30 days</label>
                      </div>
                      {error && <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2 text-red-400 text-xs">{error}</div>}
                      <Button type="submit" disabled={loading} className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 border-0 text-white font-bold text-base rounded-xl shadow-lg shadow-purple-500/25">
                        {loading ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Signing in…</span> : <span className="flex items-center gap-2">Sign in as {role === "student" ? "Student" : "Tutor"}<ArrowRight className="w-4 h-4" /></span>}
                      </Button>
                    </form>
                  )}

                  {authMethod === "google" && (
                    <div className="space-y-4">
                      <Button onClick={handleGoogleLogin} disabled={loading} className="w-full h-12 bg-white hover:bg-white/90 text-gray-800 font-bold text-base rounded-xl border-0 gap-3">
                        {loading ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />Connecting…</span> : <><img src="https://www.google.com/favicon.ico" alt="" className="w-5 h-5" />Continue with Google</>}
                      </Button>
                      <p className="text-center text-white/30 text-xs">You'll be redirected to Google's secure sign-in page</p>
                    </div>
                  )}

                  {authMethod === "otp" && <OTPFlow onSuccess={handleAuthSuccess} />}
                  {authMethod === "magic" && <MagicLinkFlow onSuccess={handleAuthSuccess} />}

                  {/* Divider + signup */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-white/10" />
                    <span className="text-white/30 text-xs">New here?</span>
                    <div className="flex-1 h-px bg-white/10" />
                  </div>

                  <Link href="/signup">
                    <Button variant="outline" className="w-full h-11 border-white/20 bg-transparent text-white hover:bg-white/10 hover:border-white/30 rounded-xl font-semibold">
                      Create Account <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>

                  {/* Quick access */}
                  <div className="pt-1">
                    <p className="text-white/20 text-[10px] text-center mb-2">Quick demo access</p>
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={() => { switchRole("student"); setTimeout(() => setLocation("/"), 50); }} className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 text-xs transition-colors">
                        <GraduationCap className="w-3.5 h-3.5" />Student
                      </button>
                      <button onClick={() => { switchRole("tutor"); setTimeout(() => setLocation("/tutor-dashboard"), 50); }} className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 text-xs transition-colors">
                        <Presentation className="w-3.5 h-3.5" />Tutor
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
            <p className="text-center text-white/20 text-xs mt-4">
              By signing in you agree to our <span className="text-white/40 hover:text-white/70 cursor-pointer underline underline-offset-2">Terms</span> and <span className="text-white/40 hover:text-white/70 cursor-pointer underline underline-offset-2">Privacy Policy</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
