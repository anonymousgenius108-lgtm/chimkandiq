import { useState } from "react";
import { useLocation, Link } from "wouter";
import {
  BookOpen, GraduationCap, Presentation, Eye, EyeOff, ArrowRight,
  ArrowLeft, Check, Sparkles, CheckCircle2, User, Mail, Phone,
  Lock, Globe, Tag, Target
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

type Role = "student" | "tutor" | null;

const STUDENT_SUBJECTS = ["Mathematics", "Physics", "Chemistry", "Biology", "Computer Science", "English", "History", "Economics", "Data Science", "Machine Learning", "Web Dev", "UPSC"];
const TUTOR_SUBJECTS = ["Mathematics", "Physics", "Chemistry", "Biology", "Computer Science", "English", "Coding", "Data Science", "ML/AI", "Web Development", "UPSC", "JEE Prep"];
const LANGUAGES = ["English", "Hindi", "Tamil", "Telugu", "Kannada", "Bengali", "Marathi", "Gujarati"];
const GOALS = ["Ace exams", "Learn coding", "Career change", "Competitive exams", "Skill development", "Research"];
const LEVELS = ["Class 9-10", "Class 11-12", "Undergraduate", "Postgraduate", "Working Professional", "All levels"];
const QUALIFICATIONS = ["B.Tech / B.E.", "B.Sc", "M.Tech / M.E.", "M.Sc", "MBA", "PhD", "Other"];

function FuturisticBg() {
  return (
    <>
      <style>{`
        @keyframes floatA2 { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-25px); } }
        @keyframes glowPulse2 { 0%,100% { opacity:0.12; } 50% { opacity:0.28; } }
        .float-a2 { animation: floatA2 6s ease-in-out infinite; }
        .glow2 { animation: glowPulse2 4s ease-in-out infinite; }
      `}</style>
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #0a0015 0%, #0d0a2e 40%, #0a1a2e 70%, #0f0a20 100%)" }} />
        <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: "linear-gradient(rgba(139,92,246,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.5) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
        <div className="glow2 absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full" style={{ background: "radial-gradient(circle, rgba(99,57,236,0.25) 0%, transparent 70%)" }} />
        <div className="glow2 absolute -bottom-40 -left-20 w-[400px] h-[400px] rounded-full" style={{ background: "radial-gradient(circle, rgba(59,130,246,0.2) 0%, transparent 70%)", animationDelay: "2s" }} />
        <div className="float-a2 absolute top-[10%] right-[5%] text-4xl opacity-10">🎓</div>
        <div className="float-a2 absolute bottom-[15%] left-[4%] text-3xl opacity-10" style={{ animationDelay: "2s" }}>📚</div>
        <div className="float-a2 absolute top-[50%] right-[3%] text-2xl opacity-10" style={{ animationDelay: "3.5s" }}>💡</div>
      </div>
    </>
  );
}

function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;
  const checks = [password.length >= 8, /[A-Z]/.test(password), /\d/.test(password), /[^a-zA-Z0-9]/.test(password)];
  const score = checks.filter(Boolean).length;
  const colors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-emerald-500"];
  const labels = ["Weak", "Fair", "Good", "Strong"];
  return (
    <div className="space-y-1.5">
      <div className="flex gap-1">{[0,1,2,3].map((i) => <div key={i} className={`flex-1 h-1 rounded-full transition-all ${i < score ? colors[score - 1] : "bg-white/10"}`} />)}</div>
      <div className="flex justify-between text-[11px]"><span className="text-white/35">Strength</span><span className={score >= 3 ? "text-emerald-400" : score >= 2 ? "text-yellow-400" : "text-red-400"}>{labels[Math.max(0, score - 1)]}</span></div>
    </div>
  );
}

function MultiSelect({ options, selected, onToggle, max }: { options: string[]; selected: string[]; onToggle: (v: string) => void; max?: number }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const active = selected.includes(o);
        const disabled = !active && max !== undefined && selected.length >= max;
        return (
          <button key={o} type="button" onClick={() => !disabled && onToggle(o)} className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${active ? "bg-purple-500/30 border-purple-500/60 text-purple-200" : disabled ? "border-white/5 text-white/20 cursor-not-allowed" : "border-white/15 text-white/50 hover:border-white/30 hover:text-white/80"}`}>
            {active && <Check className="w-3 h-3 inline mr-1" />}{o}
          </button>
        );
      })}
    </div>
  );
}

// ── Role selection ─────────────────────────────────────────────────────────────
function RoleSelection({ onSelect }: { onSelect: (r: Role) => void }) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-black text-white mb-1">Who are you?</h2>
        <p className="text-white/50 text-sm">Choose your role to get started</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Student card */}
        <div onClick={() => onSelect("student")} role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && onSelect("student")} className="group relative cursor-pointer text-left p-6 rounded-3xl border-2 border-white/10 bg-white/5 hover:border-purple-500/50 hover:bg-purple-500/10 transition-all duration-300 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/0 to-blue-600/0 group-hover:from-purple-600/10 group-hover:to-blue-600/10 transition-all duration-300" />
          <div className="relative space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform duration-300">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="text-white font-black text-lg mb-2">I am a Student</h3>
              <p className="text-white/50 text-sm leading-relaxed">Learn courses, solve questions, join study rooms, code, save resources, and grow with AI.</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {["Learn", "Practice", "Grow"].map((t) => <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/20">{t}</span>)}
            </div>
            <div className="w-full flex items-center justify-center gap-2 h-10 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold text-sm group-hover:shadow-lg group-hover:shadow-purple-500/25 transition-all">
              Continue as Student <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Tutor card */}
        <div onClick={() => onSelect("tutor")} role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && onSelect("tutor")} className="group relative cursor-pointer text-left p-6 rounded-3xl border-2 border-white/10 bg-white/5 hover:border-emerald-500/50 hover:bg-emerald-500/10 transition-all duration-300 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/0 to-teal-600/0 group-hover:from-emerald-600/10 group-hover:to-teal-600/10 transition-all duration-300" />
          <div className="relative space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform duration-300">
              <Presentation className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="text-white font-black text-lg mb-2">I am a Tutor</h3>
              <p className="text-white/50 text-sm leading-relaxed">Create courses, teach live, manage students, track analytics, sell resources, and grow your teaching business.</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {["Teach", "Earn", "Impact"].map((t) => <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/20">{t}</span>)}
            </div>
            <div className="w-full flex items-center justify-center gap-2 h-10 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-sm group-hover:shadow-lg group-hover:shadow-emerald-500/25 transition-all">
              Continue as Tutor <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Student signup ─────────────────────────────────────────────────────────────
function StudentSignup({ onDone }: { onDone: () => void }) {
  const [form, setForm] = useState({ name: "", username: "", email: "", phone: "", password: "", confirm: "", college: "", referral: "" });
  const [subjects, setSubjects] = useState<string[]>([]);
  const [goals, setGoals] = useState<string[]>([]);
  const [lang, setLang] = useState("English");
  const [showPw, setShowPw] = useState(false);
  const [terms, setTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  function set(k: string, v: string) { setForm((f) => ({ ...f, [k]: v })); setErrors((e) => ({ ...e, [k]: "" })); }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!form.name) errs.name = "Full name is required.";
    if (!form.username) errs.username = "Username is required.";
    if (!form.email.includes("@")) errs.email = "Please enter a valid email.";
    if (form.password.length < 8) errs.password = "Password must be at least 8 characters.";
    if (form.password !== form.confirm) errs.confirm = "Passwords do not match.";
    if (!terms) errs.terms = "Please accept Terms & Conditions.";
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
    toast({ title: "Account created! 🎉", description: "Welcome to EduConnect, " + form.name.split(" ")[0] });
    onDone();
  }

  const F = ({ label, name, type = "text", placeholder }: { label: string; name: string; type?: string; placeholder?: string }) => (
    <div>
      <Label className="text-white/70 text-xs mb-1.5 block">{label}</Label>
      <Input value={(form as Record<string,string>)[name]} onChange={(e) => set(name, e.target.value)} type={type} placeholder={placeholder ?? label} className="bg-white/5 border-white/10 text-white placeholder:text-white/25 h-10 rounded-xl text-sm" />
      {errors[name] && <p className="text-red-400 text-[11px] mt-1">{errors[name]}</p>}
    </div>
  );

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <F label="Full Name" name="name" placeholder="Alex Morgan" />
        <F label="Username" name="username" placeholder="alex_morgan" />
        <F label="Email" name="email" type="email" placeholder="you@example.com" />
        <F label="Phone" name="phone" type="tel" placeholder="+91 9876543210" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-white/70 text-xs mb-1.5 block">Password</Label>
          <div className="relative">
            <Input value={form.password} onChange={(e) => set("password", e.target.value)} type={showPw ? "text" : "password"} placeholder="8+ characters" className="bg-white/5 border-white/10 text-white placeholder:text-white/25 h-10 rounded-xl pr-9 text-sm" />
            <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">{showPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}</button>
          </div>
          {errors.password && <p className="text-red-400 text-[11px] mt-1">{errors.password}</p>}
          <PasswordStrength password={form.password} />
        </div>
        <div>
          <Label className="text-white/70 text-xs mb-1.5 block">Confirm Password</Label>
          <Input value={form.confirm} onChange={(e) => set("confirm", e.target.value)} type="password" placeholder="Repeat password" className="bg-white/5 border-white/10 text-white placeholder:text-white/25 h-10 rounded-xl text-sm" />
          {errors.confirm && <p className="text-red-400 text-[11px] mt-1">{errors.confirm}</p>}
        </div>
      </div>
      <F label="College / School / Course" name="college" placeholder="IIT Delhi, B.Tech CSE" />
      <div>
        <Label className="text-white/70 text-xs mb-2 block">Subjects of Interest <span className="text-white/30">(pick up to 5)</span></Label>
        <MultiSelect options={STUDENT_SUBJECTS} selected={subjects} onToggle={(v) => setSubjects((s) => s.includes(v) ? s.filter((x) => x !== v) : [...s, v])} max={5} />
      </div>
      <div>
        <Label className="text-white/70 text-xs mb-2 block">Learning Goals</Label>
        <MultiSelect options={GOALS} selected={goals} onToggle={(v) => setGoals((s) => s.includes(v) ? s.filter((x) => x !== v) : [...s, v])} max={3} />
      </div>
      <div>
        <Label className="text-white/70 text-xs mb-2 block">Preferred Language</Label>
        <div className="flex flex-wrap gap-2">{LANGUAGES.map((l) => <button key={l} type="button" onClick={() => setLang(l)} className={`px-3 py-1 rounded-full text-xs border transition-all ${lang === l ? "bg-purple-500/30 border-purple-500/50 text-purple-200" : "border-white/10 text-white/40 hover:border-white/25"}`}>{l}</button>)}</div>
      </div>
      <F label="Referral Code (optional)" name="referral" placeholder="EDU2026" />
      <div className="flex items-start gap-2.5">
        <input type="checkbox" id="terms" checked={terms} onChange={(e) => setTerms(e.target.checked)} className="mt-0.5 w-4 h-4 rounded accent-purple-500 flex-shrink-0" />
        <label htmlFor="terms" className="text-white/50 text-xs cursor-pointer leading-relaxed">I agree to EduConnect's <span className="text-purple-400 hover:underline cursor-pointer">Terms of Service</span> and <span className="text-purple-400 hover:underline cursor-pointer">Privacy Policy</span></label>
      </div>
      {errors.terms && <p className="text-red-400 text-[11px]">{errors.terms}</p>}
      <Button type="submit" disabled={loading} className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 border-0 text-white font-bold rounded-xl shadow-lg shadow-purple-500/20">
        {loading ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creating account…</span> : <span className="flex items-center gap-2">Create Student Account <ArrowRight className="w-4 h-4" /></span>}
      </Button>
    </form>
  );
}

// ── Tutor signup ───────────────────────────────────────────────────────────────
function TutorSignup({ onDone }: { onDone: () => void }) {
  const [form, setForm] = useState({ name: "", username: "", email: "", phone: "", password: "", confirm: "", experience: "", bio: "", referral: "" });
  const [subjects, setSubjects] = useState<string[]>([]);
  const [levels, setLevels] = useState<string[]>([]);
  const [langs, setLangs] = useState<string[]>(["English"]);
  const [qualification, setQualification] = useState("");
  const [availability, setAvailability] = useState<string[]>([]);
  const [showPw, setShowPw] = useState(false);
  const [terms, setTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  function set(k: string, v: string) { setForm((f) => ({ ...f, [k]: v })); setErrors((e) => ({ ...e, [k]: "" })); }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!form.name) errs.name = "Full name is required.";
    if (!form.email.includes("@")) errs.email = "Invalid email.";
    if (form.password.length < 8) errs.password = "Min 8 characters.";
    if (form.password !== form.confirm) errs.confirm = "Passwords don't match.";
    if (!terms) errs.terms = "Please accept Terms.";
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
    toast({ title: "Tutor account created! 🎉", description: "Welcome, " + form.name.split(" ")[0] });
    onDone();
  }

  const F = ({ label, name, type = "text", placeholder }: { label: string; name: string; type?: string; placeholder?: string }) => (
    <div>
      <Label className="text-white/70 text-xs mb-1.5 block">{label}</Label>
      <Input value={(form as Record<string,string>)[name]} onChange={(e) => set(name, e.target.value)} type={type} placeholder={placeholder ?? label} className="bg-white/5 border-white/10 text-white placeholder:text-white/25 h-10 rounded-xl text-sm" />
      {errors[name] && <p className="text-red-400 text-[11px] mt-1">{errors[name]}</p>}
    </div>
  );

  const AVAIL = ["Weekday mornings", "Weekday evenings", "Weekends", "Full-time", "Flexible"];

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <F label="Full Name" name="name" placeholder="Dr. Priya Sharma" />
        <F label="Username" name="username" placeholder="priya_sharma" />
        <F label="Email" name="email" type="email" placeholder="you@example.com" />
        <F label="Phone" name="phone" type="tel" placeholder="+91 9876543210" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-white/70 text-xs mb-1.5 block">Password</Label>
          <div className="relative">
            <Input value={form.password} onChange={(e) => set("password", e.target.value)} type={showPw ? "text" : "password"} placeholder="8+ characters" className="bg-white/5 border-white/10 text-white placeholder:text-white/25 h-10 rounded-xl pr-9 text-sm" />
            <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/30">{showPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}</button>
          </div>
          <PasswordStrength password={form.password} />
        </div>
        <div>
          <Label className="text-white/70 text-xs mb-1.5 block">Confirm Password</Label>
          <Input value={form.confirm} onChange={(e) => set("confirm", e.target.value)} type="password" placeholder="Repeat" className="bg-white/5 border-white/10 text-white placeholder:text-white/25 h-10 rounded-xl text-sm" />
          {errors.confirm && <p className="text-red-400 text-[11px] mt-1">{errors.confirm}</p>}
        </div>
      </div>
      <div>
        <Label className="text-white/70 text-xs mb-2 block">Teaching Subjects <span className="text-white/30">(pick up to 5)</span></Label>
        <MultiSelect options={TUTOR_SUBJECTS} selected={subjects} onToggle={(v) => setSubjects((s) => s.includes(v) ? s.filter((x) => x !== v) : [...s, v])} max={5} />
      </div>
      <div>
        <Label className="text-white/70 text-xs mb-2 block">Class / Level</Label>
        <MultiSelect options={LEVELS} selected={levels} onToggle={(v) => setLevels((s) => s.includes(v) ? s.filter((x) => x !== v) : [...s, v])} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-white/70 text-xs mb-2 block">Qualification</Label>
          <div className="flex flex-col gap-1">{QUALIFICATIONS.map((q) => <button key={q} type="button" onClick={() => setQualification(q)} className={`text-left px-3 py-1.5 rounded-lg text-xs border transition-all ${qualification === q ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300" : "border-white/10 text-white/40 hover:border-white/20"}`}>{q}</button>)}</div>
        </div>
        <div>
          <Label className="text-white/70 text-xs mb-2 block">Availability</Label>
          <div className="flex flex-col gap-1">{AVAIL.map((a) => <button key={a} type="button" onClick={() => setAvailability((s) => s.includes(a) ? s.filter((x) => x !== a) : [...s, a])} className={`text-left px-3 py-1.5 rounded-lg text-xs border transition-all ${availability.includes(a) ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300" : "border-white/10 text-white/40 hover:border-white/20"}`}>{availability.includes(a) && <Check className="w-3 h-3 inline mr-1" />}{a}</button>)}</div>
        </div>
      </div>
      <div>
        <Label className="text-white/70 text-xs mb-1.5 block">Teaching Languages</Label>
        <MultiSelect options={LANGUAGES} selected={langs} onToggle={(v) => setLangs((s) => s.includes(v) ? s.filter((x) => x !== v) : [...s, v])} />
      </div>
      <div>
        <Label className="text-white/70 text-xs mb-1.5 block">Years of Experience</Label>
        <Input value={form.experience} onChange={(e) => set("experience", e.target.value)} placeholder="e.g. 3 years" className="bg-white/5 border-white/10 text-white placeholder:text-white/25 h-10 rounded-xl text-sm" />
      </div>
      <div>
        <Label className="text-white/70 text-xs mb-1.5 block">Bio / Teaching Philosophy</Label>
        <textarea value={form.bio} onChange={(e) => set("bio", e.target.value)} placeholder="Tell students about yourself and your teaching style…" rows={3} className="w-full bg-white/5 border border-white/10 text-white placeholder:text-white/25 rounded-xl p-3 text-sm resize-none focus:outline-none focus:border-purple-500/50" />
      </div>
      <F label="Referral Code (optional)" name="referral" placeholder="EDU2026" />
      <div className="flex items-start gap-2.5">
        <input type="checkbox" id="terms" checked={terms} onChange={(e) => setTerms(e.target.checked)} className="mt-0.5 w-4 h-4 rounded accent-emerald-500 flex-shrink-0" />
        <label htmlFor="terms" className="text-white/50 text-xs cursor-pointer leading-relaxed">I agree to EduConnect's <span className="text-emerald-400 hover:underline cursor-pointer">Terms</span> and <span className="text-emerald-400 hover:underline cursor-pointer">Privacy Policy</span>. I confirm all provided information is accurate.</label>
      </div>
      {errors.terms && <p className="text-red-400 text-[11px]">{errors.terms}</p>}
      <Button type="submit" disabled={loading} className="w-full h-12 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 border-0 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20">
        {loading ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creating account…</span> : <span className="flex items-center gap-2">Create Tutor Account <ArrowRight className="w-4 h-4" /></span>}
      </Button>
    </form>
  );
}

export default function Signup() {
  const [, setLocation] = useLocation();
  const [role, setRole] = useState<Role>(null);
  const [step, setStep] = useState<"role" | "form" | "done">("role");

  function handleRoleSelect(r: Role) {
    setRole(r);
    setStep("form");
  }

  function handleDone() {
    setStep("done");
    localStorage.setItem("edu_role", role ?? "student");
    localStorage.setItem("edu_logged_in", "true");
    setTimeout(() => setLocation(role === "tutor" ? "/onboarding/tutor" : "/onboarding/student"), 1500);
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <FuturisticBg />
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-start py-10 px-5">
        {/* Top nav */}
        <div className="w-full max-w-2xl flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-400" />
            <span className="text-white font-black text-lg">EduConnect</span>
          </div>
          <Link href="/login">
            <button className="flex items-center gap-1.5 text-white/40 hover:text-white/70 text-sm transition-colors">
              <ArrowLeft className="w-4 h-4" />Already have an account?
            </button>
          </Link>
        </div>

        {/* Step progress */}
        <div className="w-full max-w-2xl mb-6">
          <div className="flex items-center gap-2 mb-2">
            {["Choose Role", "Your Details", "All Set!"].map((s, i) => {
              const stepMap = { role: 0, form: 1, done: 2 };
              const cur = stepMap[step];
              return (
                <div key={s} className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${cur > i ? "bg-emerald-500 text-white" : cur === i ? "bg-purple-500 text-white" : "bg-white/10 text-white/30"}`}>
                    {cur > i ? <Check className="w-3.5 h-3.5" /> : i + 1}
                  </div>
                  <span className={`text-xs hidden sm:block ${cur === i ? "text-white font-medium" : "text-white/30"}`}>{s}</span>
                  {i < 2 && <div className={`w-8 h-px transition-all ${cur > i ? "bg-emerald-500" : "bg-white/10"}`} />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Main card */}
        <div className="w-full max-w-2xl">
          {step === "done" ? (
            <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-10 text-center shadow-2xl shadow-black/50 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto animate-bounce" style={{ animationDuration: "0.8s" }}>
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              </div>
              <h2 className="text-2xl font-black text-white">Account Created!</h2>
              <p className="text-white/50">Setting up your personalized experience…</p>
              <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-500 to-emerald-500 rounded-full" style={{ animation: "w-full 1.5s linear forwards", width: "100%" }} />
              </div>
            </div>
          ) : (
            <div className={`bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl shadow-black/50 ${step === "role" ? "p-8" : "p-7"}`}>
              {step === "role" && <RoleSelection onSelect={handleRoleSelect} />}
              {step === "form" && role && (
                <>
                  <div className="flex items-center gap-3 mb-5">
                    <button onClick={() => { setStep("role"); setRole(null); }} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                      <ArrowLeft className="w-4 h-4 text-white/70" />
                    </button>
                    <div>
                      <h2 className="text-xl font-black text-white">
                        {role === "student" ? "Student" : "Tutor"} Registration
                      </h2>
                      <p className="text-white/40 text-xs">Fill in your details to get started</p>
                    </div>
                    <div className={`ml-auto w-9 h-9 rounded-xl flex items-center justify-center ${role === "student" ? "bg-purple-500" : "bg-emerald-500"}`}>
                      {role === "student" ? <GraduationCap className="w-5 h-5 text-white" /> : <Presentation className="w-5 h-5 text-white" />}
                    </div>
                  </div>
                  <div className="max-h-[70vh] overflow-y-auto pr-1 space-y-1">
                    {role === "student" ? <StudentSignup onDone={handleDone} /> : <TutorSignup onDone={handleDone} />}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
