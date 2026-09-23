import { useState } from "react";
import { useLocation } from "wouter";
import {
  BookOpen, ArrowRight, ArrowLeft, Check, GraduationCap, Code2,
  Brain, Clock, Bell, Sun, Moon, Sparkles, Target, CheckCircle2, Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";

const STEPS = ["Your Studies", "Weak Subjects", "Your Goal", "Preferences", "All Done!"];

const COURSES = [
  { id: "jee", label: "JEE / NEET", emoji: "🔬" },
  { id: "btech", label: "B.Tech / B.E.", emoji: "💻" },
  { id: "upsc", label: "UPSC / Govt Exams", emoji: "📜" },
  { id: "mba", label: "MBA / CAT", emoji: "📊" },
  { id: "school", label: "Class 9-12", emoji: "📚" },
  { id: "coding", label: "Self-taught Coder", emoji: "⌨️" },
  { id: "data", label: "Data Science / ML", emoji: "🤖" },
  { id: "other", label: "Something else", emoji: "✨" },
];

const SUBJECTS = ["Mathematics", "Physics", "Chemistry", "Biology", "Computer Science", "English", "History", "Economics", "Programming", "Data Structures", "Machine Learning", "Networks"];

const GOALS = [
  { id: "exams", label: "Crack entrance exams", emoji: "🏆" },
  { id: "college", label: "Get into top college", emoji: "🎓" },
  { id: "job", label: "Land a good job", emoji: "💼" },
  { id: "skills", label: "Learn new skills", emoji: "⚡" },
  { id: "startup", label: "Build my own startup", emoji: "🚀" },
  { id: "research", label: "Research & academia", emoji: "🔬" },
];

const STUDY_TIMES = [
  { id: "morning", label: "Morning", emoji: "🌅", time: "6am – 12pm" },
  { id: "afternoon", label: "Afternoon", emoji: "☀️", time: "12pm – 5pm" },
  { id: "evening", label: "Evening", emoji: "🌆", time: "5pm – 9pm" },
  { id: "night", label: "Night owl", emoji: "🌙", time: "9pm – late" },
  { id: "flexible", label: "Flexible", emoji: "🔄", time: "Anytime" },
];

function FuturisticBg() {
  return (
    <>
      <style>{`
        @keyframes glowOb { 0%,100%{opacity:.1;}50%{opacity:.25;} }
        .glow-ob { animation: glowOb 4s ease-in-out infinite; }
      `}</style>
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg,#0a0015 0%,#0d0a2e 50%,#0a1020 100%)" }} />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "linear-gradient(rgba(139,92,246,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(139,92,246,.5) 1px,transparent 1px)", backgroundSize: "50px 50px" }} />
        <div className="glow-ob absolute top-0 right-0 w-[500px] h-[500px] rounded-full" style={{ background: "radial-gradient(circle,rgba(139,92,246,.2) 0%,transparent 70%)" }} />
        <div className="glow-ob absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full" style={{ background: "radial-gradient(circle,rgba(59,130,246,.15) 0%,transparent 70%)", animationDelay: "2s" }} />
      </div>
    </>
  );
}

function ProgressBar({ step, total }: { step: number; total: number }) {
  return (
    <div className="space-y-2 mb-8">
      <div className="flex justify-between text-xs text-white/40">
        <span>Step {step + 1} of {total}</span>
        <span>{Math.round(((step) / (total - 1)) * 100)}% complete</span>
      </div>
      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-500" style={{ width: `${(step / (total - 1)) * 100}%` }} />
      </div>
      <div className="flex gap-1">
        {STEPS.map((s, i) => (
          <div key={s} className={`flex-1 text-center text-[9px] transition-colors ${i === step ? "text-purple-300 font-bold" : i < step ? "text-white/50" : "text-white/20"}`}>{s}</div>
        ))}
      </div>
    </div>
  );
}

export default function OnboardingStudent() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(0);
  const [course, setCourse] = useState("");
  const [weakSubjects, setWeakSubjects] = useState<string[]>([]);
  const [goal, setGoal] = useState("");
  const [codingSupport, setCodingSupport] = useState<boolean | null>(null);
  const [studyTime, setStudyTime] = useState("");
  const [theme, setTheme] = useState<"light" | "dark" | "">("");
  const [notifications, setNotifications] = useState(true);
  const [saving, setSaving] = useState(false);

  function toggleSubject(s: string) {
    setWeakSubjects((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : prev.length < 5 ? [...prev, s] : prev);
  }

  async function finish() {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 1500));
    setSaving(false);
    localStorage.setItem("edu_onboarded", "true");
    setStep(4);
    setTimeout(() => setLocation("/"), 2000);
  }

  function canNext() {
    if (step === 0) return !!course;
    if (step === 1) return weakSubjects.length > 0;
    if (step === 2) return !!goal;
    if (step === 3) return !!studyTime;
    return true;
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <FuturisticBg />
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-5 py-12">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <BookOpen className="w-5 h-5 text-purple-400" />
          <span className="text-white font-black text-lg">EduConnect</span>
          <span className="text-white/30 text-xs ml-2">· Student Setup</span>
        </div>

        <div className="w-full max-w-xl">
          {step < 4 && (
            <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl shadow-black/50">
              <ProgressBar step={step} total={STEPS.length} />

              {/* Step 0 — What are you studying */}
              {step === 0 && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-2xl font-black text-white mb-1">What are you studying?</h2>
                    <p className="text-white/50 text-sm">We'll tailor your experience based on this</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {COURSES.map((c) => (
                      <button key={c.id} onClick={() => setCourse(c.id)} className={`flex items-center gap-3 p-3.5 rounded-2xl border text-left transition-all ${course === c.id ? "bg-purple-500/20 border-purple-500/50 text-white" : "bg-white/5 border-white/10 text-white/60 hover:border-white/20 hover:bg-white/8"}`}>
                        <span className="text-xl">{c.emoji}</span>
                        <span className="text-sm font-medium">{c.label}</span>
                        {course === c.id && <Check className="w-4 h-4 text-purple-400 ml-auto" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 1 — Weak subjects */}
              {step === 1 && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-2xl font-black text-white mb-1">Which subjects to improve?</h2>
                    <p className="text-white/50 text-sm">Pick up to 5 — we'll focus on these for you</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {SUBJECTS.map((s) => {
                      const active = weakSubjects.includes(s);
                      return (
                        <button key={s} onClick={() => toggleSubject(s)} className={`px-4 py-2 rounded-full text-sm border transition-all ${active ? "bg-purple-500/25 border-purple-500/50 text-purple-200" : "bg-white/5 border-white/15 text-white/50 hover:border-white/30"}`}>
                          {active && <Check className="w-3 h-3 inline mr-1.5" />}{s}
                        </button>
                      );
                    })}
                  </div>
                  {weakSubjects.length > 0 && (
                    <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-3">
                      <p className="text-purple-300 text-xs font-medium">Selected: {weakSubjects.join(", ")}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Step 2 — Main goal */}
              {step === 2 && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-2xl font-black text-white mb-1">What's your main goal?</h2>
                    <p className="text-white/50 text-sm">This helps us prioritize recommendations for you</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {GOALS.map((g) => (
                      <button key={g.id} onClick={() => setGoal(g.id)} className={`flex items-center gap-3 p-4 rounded-2xl border text-left transition-all ${goal === g.id ? "bg-purple-500/20 border-purple-500/50 text-white" : "bg-white/5 border-white/10 text-white/60 hover:border-white/20"}`}>
                        <span className="text-2xl">{g.emoji}</span>
                        <span className="text-sm font-medium">{g.label}</span>
                      </button>
                    ))}
                  </div>
                  <div className="border border-white/10 rounded-2xl p-4">
                    <p className="text-white/60 text-sm mb-2 font-medium">Want coding support?</p>
                    <div className="grid grid-cols-3 gap-2">
                      {[{ v: true, label: "Yes, definitely! 💻" }, { v: false, label: "Not for now" }, { v: null, label: "Maybe later" }].map((o) => (
                        <button key={String(o.v)} onClick={() => setCodingSupport(o.v as boolean | null)} className={`py-2.5 rounded-xl text-xs border transition-all ${codingSupport === o.v ? "bg-purple-500/20 border-purple-500/40 text-purple-200" : "border-white/10 text-white/40 hover:border-white/20"}`}>{o.label}</button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3 — Preferences */}
              {step === 3 && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-2xl font-black text-white mb-1">Study preferences</h2>
                    <p className="text-white/50 text-sm">Customize your learning environment</p>
                  </div>
                  <div>
                    <p className="text-white/60 text-sm mb-2 font-medium">When do you study best?</p>
                    <div className="grid grid-cols-1 gap-2">
                      {STUDY_TIMES.map((t) => (
                        <button key={t.id} onClick={() => setStudyTime(t.id)} className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${studyTime === t.id ? "bg-purple-500/20 border-purple-500/40" : "bg-white/5 border-white/10 hover:border-white/20"}`}>
                          <span className="text-xl">{t.emoji}</span>
                          <div>
                            <div className={`text-sm font-medium ${studyTime === t.id ? "text-white" : "text-white/60"}`}>{t.label}</div>
                            <div className="text-[11px] text-white/30">{t.time}</div>
                          </div>
                          {studyTime === t.id && <Check className="w-4 h-4 text-purple-400 ml-auto" />}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-white/60 text-sm mb-2 font-medium">Interface theme</p>
                    <div className="grid grid-cols-2 gap-2">
                      {[{ v: "light" as const, label: "Light", icon: Sun }, { v: "dark" as const, label: "Dark", icon: Moon }].map((t) => (
                        <button key={t.v} onClick={() => setTheme(t.v)} className={`flex items-center gap-2.5 p-3.5 rounded-xl border transition-all ${theme === t.v ? "bg-purple-500/20 border-purple-500/40 text-white" : "bg-white/5 border-white/10 text-white/50 hover:border-white/20"}`}>
                          <t.icon className="w-4.5 h-4.5" style={{ width: "1.1rem", height: "1.1rem" }} />
                          <span className="text-sm font-medium">{t.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Bell className="w-4 h-4 text-white/50" />
                      <div>
                        <p className="text-white/80 text-sm font-medium">Smart notifications</p>
                        <p className="text-white/35 text-xs">Study reminders, new answers, badges</p>
                      </div>
                    </div>
                    <button onClick={() => setNotifications(!notifications)} className={`w-11 h-6 rounded-full transition-colors relative ${notifications ? "bg-purple-500" : "bg-white/20"}`}>
                      <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${notifications ? "translate-x-5" : "translate-x-0.5"}`} />
                    </button>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex gap-3 mt-6">
                {step > 0 && (
                  <Button variant="outline" onClick={() => setStep(step - 1)} className="border-white/20 text-white bg-transparent hover:bg-white/10 rounded-xl gap-2">
                    <ArrowLeft className="w-4 h-4" /> Back
                  </Button>
                )}
                {step < 3 ? (
                  <Button onClick={() => setStep(step + 1)} disabled={!canNext()} className="flex-1 h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 border-0 text-white font-bold rounded-xl">
                    Continue <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button onClick={finish} disabled={!canNext() || saving} className="flex-1 h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 border-0 text-white font-bold rounded-xl">
                    {saving ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Setting up…</span> : <><Sparkles className="w-4 h-4 mr-2" />Build My Profile</>}
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Done screen */}
          {step === 4 && (
            <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-12 text-center shadow-2xl shadow-black/50 space-y-5">
              <div className="relative w-20 h-20 mx-auto">
                <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" />
                <div className="relative w-20 h-20 rounded-full bg-emerald-500/30 border-2 border-emerald-500/50 flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                </div>
              </div>
              <div>
                <h2 className="text-3xl font-black text-white mb-2">You're all set! 🎉</h2>
                <p className="text-white/50 text-base">Your AI-powered student profile is ready.</p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: Brain, label: "AI Tutor Ready" },
                  { icon: Target, label: "Goals Saved" },
                  { icon: Zap, label: "Personalized Feed" },
                ].map((f) => (
                  <div key={f.label} className="bg-white/5 border border-white/10 rounded-2xl p-3">
                    <f.icon className="w-5 h-5 text-purple-400 mx-auto mb-1" />
                    <p className="text-white/60 text-[11px]">{f.label}</p>
                  </div>
                ))}
              </div>
              <p className="text-white/30 text-sm">Taking you to your dashboard…</p>
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-500 to-emerald-500 rounded-full" style={{ width: "100%", animation: "none", transition: "width 2s linear" }} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
