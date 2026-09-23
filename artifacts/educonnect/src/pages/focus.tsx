import { useState, useEffect, useRef, useCallback } from "react";
import {
  Timer, Play, Pause, RotateCcw, CheckCircle2, Circle,
  Plus, Trash2, Target, TrendingUp, Coffee, Zap, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

type Mode = "focus" | "short-break" | "long-break";
type Goal = { id: string; text: string; done: boolean };
type Session = { date: string; focusMinutes: number };

const MODES: { id: Mode; label: string; minutes: number; color: string }[] = [
  { id: "focus", label: "Focus", minutes: 25, color: "text-red-500" },
  { id: "short-break", label: "Short Break", minutes: 5, color: "text-emerald-500" },
  { id: "long-break", label: "Long Break", minutes: 15, color: "text-blue-500" },
];

const QUOTES = [
  "The secret of getting ahead is getting started. — Mark Twain",
  "It does not matter how slowly you go as long as you do not stop. — Confucius",
  "Small steps every day add up to big changes. — Anonymous",
  "Focus is the key that unlocks all doors.",
  "Do the hard things first. The rest becomes easy.",
  "You don't rise to the level of your goals, you fall to the level of your systems. — James Clear",
  "Productivity is being able to do things that you were never able to do before. — Franz Kafka",
];

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function loadGoals(): Goal[] {
  try { return JSON.parse(localStorage.getItem("focus_goals") ?? "[]"); } catch { return []; }
}
function saveGoals(g: Goal[]) {
  localStorage.setItem("focus_goals", JSON.stringify(g));
}
function loadSessions(): Session[] {
  try { return JSON.parse(localStorage.getItem("focus_sessions") ?? "[]"); } catch { return []; }
}
function saveSessions(s: Session[]) {
  localStorage.setItem("focus_sessions", JSON.stringify(s));
}

export default function Focus() {
  const [mode, setMode] = useState<Mode>("focus");
  const [running, setRunning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [sessionsToday, setSessionsToday] = useState(0);
  const [totalMinutesToday, setTotalMinutesToday] = useState(0);
  const [goals, setGoals] = useState<Goal[]>(loadGoals);
  const [newGoal, setNewGoal] = useState("");
  const [quote] = useState(() => QUOTES[Math.floor(Math.random() * QUOTES.length)]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const completedMinRef = useRef(0);

  const currentMode = MODES.find((m) => m.id === mode)!;
  const totalSeconds = currentMode.minutes * 60;
  const progress = ((totalSeconds - secondsLeft) / totalSeconds) * 100;

  // Recompute today's stats from localStorage
  useEffect(() => {
    const sessions = loadSessions();
    const today = sessions.filter((s) => s.date === todayKey());
    setSessionsToday(today.length);
    setTotalMinutesToday(today.reduce((acc, s) => acc + s.focusMinutes, 0));
  }, []);

  const handleModeChange = useCallback((m: Mode) => {
    setMode(m);
    setRunning(false);
    setSecondsLeft(MODES.find((x) => x.id === m)!.minutes * 60);
    completedMinRef.current = 0;
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  function handleComplete() {
    setRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (mode === "focus") {
      const s = loadSessions();
      const entry: Session = { date: todayKey(), focusMinutes: currentMode.minutes };
      s.push(entry);
      saveSessions(s);
      setSessionsToday((p) => p + 1);
      setTotalMinutesToday((p) => p + currentMode.minutes);
    }
    // Reset
    setSecondsLeft(totalSeconds);
    completedMinRef.current = 0;
  }

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            handleComplete();
            return totalSeconds;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, mode]);

  function handleReset() {
    setRunning(false);
    setSecondsLeft(totalSeconds);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }

  function addGoal() {
    const text = newGoal.trim();
    if (!text) return;
    const updated = [...goals, { id: Date.now().toString(), text, done: false }];
    setGoals(updated);
    saveGoals(updated);
    setNewGoal("");
  }

  function toggleGoal(id: string) {
    const updated = goals.map((g) => g.id === id ? { ...g, done: !g.done } : g);
    setGoals(updated);
    saveGoals(updated);
  }

  function removeGoal(id: string) {
    const updated = goals.filter((g) => g.id !== id);
    setGoals(updated);
    saveGoals(updated);
  }

  const hrs = Math.floor(totalMinutesToday / 60);
  const mins = totalMinutesToday % 60;
  const focusDisplay = hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;

  // Weekly fake data
  const weekDays = ["M", "T", "W", "T", "F", "S", "S"];
  const weekData = [45, 90, 60, 120, 75, 30, totalMinutesToday];
  const maxW = Math.max(...weekData, 1);

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-primary mb-1">
          <Timer className="w-5 h-5" />
          <span className="text-sm font-medium">Focus Mode</span>
        </div>
        <h1 className="text-3xl font-bold font-serif">Productivity Hub</h1>
        <p className="text-muted-foreground text-sm mt-1">Pomodoro timer, goal tracker, and focus analytics</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT — Timer */}
        <div className="lg:col-span-2 space-y-6">
          {/* Mode Selector */}
          <div className="flex gap-2 p-1 bg-muted rounded-xl w-fit">
            {MODES.map((m) => (
              <button
                key={m.id}
                onClick={() => handleModeChange(m.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  mode === m.id
                    ? "bg-background shadow text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {m.id === "focus" && <Zap className="w-3.5 h-3.5 inline mr-1.5 text-red-500" />}
                {m.id === "short-break" && <Coffee className="w-3.5 h-3.5 inline mr-1.5 text-emerald-500" />}
                {m.id === "long-break" && <Coffee className="w-3.5 h-3.5 inline mr-1.5 text-blue-500" />}
                {m.label}
              </button>
            ))}
          </div>

          {/* Timer Display */}
          <div className="bg-card border rounded-3xl p-10 text-center space-y-6 shadow-sm">
            <div className={`text-8xl font-mono font-bold tracking-tight ${currentMode.color}`}>
              {pad(Math.floor(secondsLeft / 60))}:{pad(secondsLeft % 60)}
            </div>
            <Progress value={progress} className="h-2 max-w-sm mx-auto" />
            <p className="text-sm text-muted-foreground italic">"{quote}"</p>
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="outline"
                size="icon"
                className="rounded-full w-12 h-12"
                onClick={handleReset}
              >
                <RotateCcw className="w-5 h-5" />
              </Button>
              <Button
                size="lg"
                className={`rounded-full px-10 text-base ${
                  mode === "focus" ? "bg-red-500 hover:bg-red-600" :
                  mode === "short-break" ? "bg-emerald-500 hover:bg-emerald-600" :
                  "bg-blue-500 hover:bg-blue-600"
                } text-white border-0`}
                onClick={() => setRunning(!running)}
              >
                {running ? <><Pause className="w-5 h-5 mr-2" /> Pause</> : <><Play className="w-5 h-5 mr-2" /> Start</>}
              </Button>
            </div>
          </div>

          {/* Weekly Bar Chart */}
          <div className="bg-card border rounded-2xl p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> Focus This Week
            </h3>
            <div className="flex items-end gap-2 h-24">
              {weekDays.map((day, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className={`w-full rounded-t-md transition-all ${i === 6 ? "bg-primary" : "bg-primary/30"}`}
                    style={{ height: `${(weekData[i] / maxW) * 80}px` }}
                  />
                  <span className="text-xs text-muted-foreground">{day}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3 text-right">
              Total: {weekData.reduce((a, b) => a + b, 0)} min this week
            </p>
          </div>
        </div>

        {/* RIGHT — Stats & Goals */}
        <div className="space-y-5">
          {/* Today's Stats */}
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-5 space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" /> Today's Progress
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-background/60 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-primary">{sessionsToday}</div>
                <div className="text-xs text-muted-foreground">Sessions</div>
              </div>
              <div className="bg-background/60 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-primary">{focusDisplay}</div>
                <div className="text-xs text-muted-foreground">Focus Time</div>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Daily goal (4 sessions)</span>
                <span>{sessionsToday}/4</span>
              </div>
              <Progress value={(sessionsToday / 4) * 100} className="h-1.5" />
            </div>
          </div>

          {/* Goals */}
          <div className="bg-card border rounded-2xl p-5 space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Today's Goals
            </h3>

            <div className="flex gap-2">
              <Input
                placeholder="Add a goal…"
                value={newGoal}
                onChange={(e) => setNewGoal(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addGoal()}
                className="h-9 text-sm"
              />
              <Button size="sm" onClick={addGoal} className="h-9 px-3">
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {goals.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Add goals to track your session
                </p>
              )}
              {goals.map((goal) => (
                <div
                  key={goal.id}
                  className={`flex items-center gap-2 p-2.5 rounded-lg border transition-colors ${
                    goal.done ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20" : "bg-muted/30 border-transparent"
                  }`}
                >
                  <button onClick={() => toggleGoal(goal.id)} className="flex-shrink-0">
                    {goal.done ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Circle className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>
                  <span className={`flex-1 text-sm ${goal.done ? "line-through text-muted-foreground" : ""}`}>
                    {goal.text}
                  </span>
                  <button onClick={() => removeGoal(goal.id)} className="text-muted-foreground/50 hover:text-destructive transition-colors flex-shrink-0">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {goals.length > 0 && (
              <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-2">
                <span>{goals.filter((g) => g.done).length}/{goals.length} completed</span>
                <Badge variant="outline" className="text-xs">
                  {Math.round((goals.filter((g) => g.done).length / goals.length) * 100)}%
                </Badge>
              </div>
            )}
          </div>

          {/* Tips */}
          <div className="bg-muted/50 rounded-2xl p-4 text-xs text-muted-foreground space-y-1">
            <p className="font-medium text-foreground text-sm">Pomodoro Technique</p>
            <p>🍅 Work for 25 minutes</p>
            <p>☕ Take a 5-minute break</p>
            <p>🌿 After 4 sessions, take a 15-minute long break</p>
          </div>
        </div>
      </div>
    </div>
  );
}
