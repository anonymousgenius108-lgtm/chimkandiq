import { useState } from "react";
import { useLocation } from "wouter";
import {
  BookOpen, ArrowRight, ArrowLeft, Check, Presentation,
  Video, Globe, DollarSign, CheckCircle2, Sparkles, Zap,
  Users, BarChart3, Eye, EyeOff
} from "lucide-react";
import { Button } from "@/components/ui/button";

const STEPS = ["Subjects", "Teaching Level", "Features", "Availability", "All Done!"];

const SUBJECTS = ["Mathematics", "Physics", "Chemistry", "Biology", "Computer Science", "Data Science", "Machine Learning", "Web Development", "English", "UPSC", "JEE / NEET", "Programming"];
const LEVELS = ["Class 6-8", "Class 9-10", "Class 11-12", "JEE / NEET", "Undergraduate", "Postgraduate", "Working Professionals", "All levels"];
const SLOTS = ["Mon–Fri mornings", "Mon–Fri evenings", "Weekends only", "Daily 2hrs", "Full-time", "On demand"];
const THEMES = [
  { id: "dark", label: "Dark Professional", emoji: "🌙", desc: "Sleek and focused" },
  { id: "light", label: "Light & Clean", emoji: "☀️", desc: "Bright and minimal" },
  { id: "neon", label: "Neon Focus", emoji: "⚡", desc: "High energy vibes" },
];

function FuturisticBg() {
  return (
    <>
      <style>{`
        @keyframes glowOt { 0%,100%{opacity:.1;}50%{opacity:.22;} }
        .glow-ot { animation: glowOt 4s ease-in-out infinite; }
      `}</style>
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg,#001a0a 0%,#0a2e0d 40%,#0a1a1a 100%)" }} />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "linear-gradient(rgba(52,211,153,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(52,211,153,.5) 1px,transparent 1px)", backgroundSize: "50px 50px" }} />
        <div className="glow-ot absolute top-0 left-0 w-[500px] h-[500px] rounded-full" style={{ background: "radial-gradient(circle,rgba(16,185,129,.18) 0%,transparent 70%)" }} />
        <div className="glow-ot absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full" style={{ background: "radial-gradient(circle,rgba(59,130,246,.15) 0%,transparent 70%)", animationDelay: "2s" }} />
      </div>
    </>
  );
}

function ProgressBar({ step, total }: { step: number; total: number }) {
  return (
    <div className="space-y-2 mb-8">
      <div className="flex justify-between text-xs text-white/40">
        <span>Step {step + 1} of {total}</span>
        <span>{Math.round((step / (total - 1)) * 100)}% complete</span>
      </div>
      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500" style={{ width: `${(step / (total - 1)) * 100}%` }} />
      </div>
      <div className="flex gap-1">
        {STEPS.map((s, i) => (
          <div key={s} className={`flex-1 text-center text-[9px] transition-colors ${i === step ? "text-emerald-300 font-bold" : i < step ? "text-white/50" : "text-white/20"}`}>{s}</div>
        ))}
      </div>
    </div>
  );
}

export default function OnboardingTutor() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(0);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [levels, setLevels] = useState<string[]>([]);
  const [features, setFeatures] = useState({ courses: false, live: false, resources: false, analytics: true });
  const [slots, setSlots] = useState<string[]>([]);
  const [visibility, setVisibility] = useState<"public" | "private" | "verified">("public");
  const [dashTheme, setDashTheme] = useState("dark");
  const [saving, setSaving] = useState(false);

  function toggleSubject(s: string) {
    setSubjects((p) => p.includes(s) ? p.filter((x) => x !== s) : p.length < 6 ? [...p, s] : p);
  }
  function toggleLevel(l: string) {
    setLevels((p) => p.includes(l) ? p.filter((x) => x !== l) : [...p, l]);
  }
  function toggleSlot(s: string) {
    setSlots((p) => p.includes(s) ? p.filter((x) => x !== s) : [...p, s]);
  }

  async function finish() {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 1500));
    setSaving(false);
    localStorage.setItem("edu_onboarded", "true");
    setStep(4);
    setTimeout(() => setLocation("/tutor-dashboard"), 2000);
  }

  function canNext() {
    if (step === 0) return subjects.length > 0;
    if (step === 1) return levels.length > 0;
    if (step === 2) return true;
    if (step === 3) return slots.length > 0;
    return true;
  }

  const FEATURE_LIST = [
    { key: "courses" as const, icon: BookOpen, label: "Create Courses", desc: "Build structured courses with lessons, quizzes & resources" },
    { key: "live" as const, icon: Video, label: "Host Live Classes", desc: "Schedule and run interactive live sessions with students" },
    { key: "resources" as const, icon: DollarSign, label: "Sell Resources", desc: "Upload and sell notes, PDFs, templates on the Marketplace" },
    { key: "analytics" as const, icon: BarChart3, label: "Student Analytics", desc: "Track student progress, watch time, and engagement" },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      <FuturisticBg />
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-5 py-12">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <BookOpen className="w-5 h-5 text-emerald-400" />
          <span className="text-white font-black text-lg">EduConnect</span>
          <span className="text-white/30 text-xs ml-2">· Tutor Setup</span>
        </div>

        <div className="w-full max-w-xl">
          {step < 4 && (
            <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl shadow-black/50">
              <ProgressBar step={step} total={STEPS.length} />

              {/* Step 0 — Subjects */}
              {step === 0 && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-2xl font-black text-white mb-1">What do you teach?</h2>
                    <p className="text-white/50 text-sm">Select up to 6 subjects you're an expert in</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {SUBJECTS.map((s) => {
                      const active = subjects.includes(s);
                      return (
                        <button key={s} onClick={() => toggleSubject(s)} className={`px-4 py-2 rounded-full text-sm border transition-all ${active ? "bg-emerald-500/25 border-emerald-500/50 text-emerald-200" : "bg-white/5 border-white/15 text-white/50 hover:border-white/30"}`}>
                          {active && <Check className="w-3 h-3 inline mr-1.5" />}{s}
                        </button>
                      );
                    })}
                  </div>
                  {subjects.length > 0 && (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3">
                      <p className="text-emerald-300 text-xs">{subjects.length} subject{subjects.length !== 1 ? "s" : ""} selected: {subjects.join(", ")}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Step 1 — Level */}
              {step === 1 && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-2xl font-black text-white mb-1">Which level do you teach?</h2>
                    <p className="text-white/50 text-sm">You can select multiple levels</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {LEVELS.map((l) => {
                      const active = levels.includes(l);
                      return (
                        <button key={l} onClick={() => toggleLevel(l)} className={`flex items-center gap-2 p-3.5 rounded-2xl border text-left transition-all ${active ? "bg-emerald-500/20 border-emerald-500/40 text-white" : "bg-white/5 border-white/10 text-white/50 hover:border-white/20"}`}>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${active ? "border-emerald-500 bg-emerald-500" : "border-white/20"}`}>
                            {active && <Check className="w-3 h-3 text-white" />}
                          </div>
                          <span className="text-sm">{l}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step 2 — Features */}
              {step === 2 && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-2xl font-black text-white mb-1">What do you want to offer?</h2>
                    <p className="text-white/50 text-sm">Enable the features you want to use</p>
                  </div>
                  <div className="space-y-3">
                    {FEATURE_LIST.map((f) => (
                      <button key={f.key} onClick={() => setFeatures((p) => ({ ...p, [f.key]: !p[f.key] }))} className={`w-full flex items-center gap-4 p-4 rounded-2xl border text-left transition-all ${features[f.key] ? "bg-emerald-500/15 border-emerald-500/40" : "bg-white/5 border-white/10 hover:border-white/20"}`}>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${features[f.key] ? "bg-emerald-500" : "bg-white/10"}`}>
                          <f.icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`text-sm font-bold ${features[f.key] ? "text-white" : "text-white/60"}`}>{f.label}</div>
                          <div className="text-xs text-white/35 leading-snug">{f.desc}</div>
                        </div>
                        <div className={`w-11 h-6 rounded-full transition-colors flex-shrink-0 ${features[f.key] ? "bg-emerald-500" : "bg-white/15"}`}>
                          <div className={`w-5 h-5 rounded-full bg-white m-0.5 transition-transform ${features[f.key] ? "translate-x-5" : "translate-x-0"}`} />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 3 — Availability + visibility + theme */}
              {step === 3 && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-2xl font-black text-white mb-1">Availability & settings</h2>
                    <p className="text-white/50 text-sm">Almost done — set your availability and preferences</p>
                  </div>
                  <div>
                    <p className="text-white/60 text-sm font-medium mb-2">When are you available?</p>
                    <div className="grid grid-cols-2 gap-2">
                      {SLOTS.map((s) => {
                        const active = slots.includes(s);
                        return (
                          <button key={s} onClick={() => toggleSlot(s)} className={`flex items-center gap-2 p-3 rounded-xl border text-left text-sm transition-all ${active ? "bg-emerald-500/20 border-emerald-500/40 text-white" : "bg-white/5 border-white/10 text-white/50 hover:border-white/20"}`}>
                            <Check className={`w-3.5 h-3.5 flex-shrink-0 ${active ? "text-emerald-400" : "text-transparent"}`} />{s}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <p className="text-white/60 text-sm font-medium mb-2">Profile visibility</p>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { v: "public" as const, label: "Public", icon: Globe, desc: "Anyone can find you" },
                        { v: "verified" as const, label: "Verified only", icon: Users, desc: "Logged-in users" },
                        { v: "private" as const, label: "Private", icon: EyeOff, desc: "Hidden until ready" },
                      ].map((p) => (
                        <button key={p.v} onClick={() => setVisibility(p.v)} className={`flex flex-col items-center gap-2 p-3 rounded-2xl border text-center transition-all ${visibility === p.v ? "bg-emerald-500/20 border-emerald-500/40 text-white" : "bg-white/5 border-white/10 text-white/40 hover:border-white/20"}`}>
                          <p.icon className="w-4 h-4" />
                          <div className="text-xs font-medium">{p.label}</div>
                          <div className="text-[10px] text-white/30 leading-tight">{p.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-white/60 text-sm font-medium mb-2">Dashboard theme</p>
                    <div className="grid grid-cols-3 gap-2">
                      {THEMES.map((t) => (
                        <button key={t.id} onClick={() => setDashTheme(t.id)} className={`p-3 rounded-2xl border text-center transition-all ${dashTheme === t.id ? "bg-emerald-500/20 border-emerald-500/40 text-white" : "bg-white/5 border-white/10 text-white/40 hover:border-white/20"}`}>
                          <div className="text-2xl mb-1">{t.emoji}</div>
                          <div className="text-xs font-medium">{t.label}</div>
                          <div className="text-[10px] text-white/30">{t.desc}</div>
                        </button>
                      ))}
                    </div>
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
                  <Button onClick={() => setStep(step + 1)} disabled={!canNext()} className="flex-1 h-12 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 border-0 text-white font-bold rounded-xl">
                    Continue <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button onClick={finish} disabled={!canNext() || saving} className="flex-1 h-12 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 border-0 text-white font-bold rounded-xl">
                    {saving ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Setting up…</span> : <><Sparkles className="w-4 h-4 mr-2" />Launch My Dashboard</>}
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
                <h2 className="text-3xl font-black text-white mb-2">Tutor Profile Ready! 🎉</h2>
                <p className="text-white/50 text-base">Your teaching command center is set up.</p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: Users, label: "Student Network" },
                  { icon: BarChart3, label: "Analytics Active" },
                  { icon: Zap, label: "AI Insights On" },
                ].map((f) => (
                  <div key={f.label} className="bg-white/5 border border-white/10 rounded-2xl p-3">
                    <f.icon className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                    <p className="text-white/60 text-[11px]">{f.label}</p>
                  </div>
                ))}
              </div>
              <p className="text-white/30 text-sm">Taking you to your Tutor Dashboard…</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
