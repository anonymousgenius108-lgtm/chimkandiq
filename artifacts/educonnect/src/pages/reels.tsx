import { useEffect, useRef, useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useListReels,
  useToggleReelLike,
  useListReelComments,
  usePostReelComment,
} from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import {
  Heart, MessageCircle, Eye, Play, Pause, X, Send, Film,
  ChevronUp, ChevronDown, Bookmark, Share2, Gauge, UserPlus,
  UserCheck, Sparkles, Brain, HelpCircle, FileText, Upload,
  ChevronRight, Zap,
} from "lucide-react";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { formatRelative } from "@/lib/format";

function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// localStorage helpers
function getSaved(): string[] {
  try { return JSON.parse(localStorage.getItem("saved_reels") ?? "[]"); } catch { return []; }
}
function toggleSaved(id: string): boolean {
  const saved = getSaved();
  const idx = saved.indexOf(id);
  if (idx > -1) { saved.splice(idx, 1); } else { saved.push(id); }
  localStorage.setItem("saved_reels", JSON.stringify(saved));
  return idx === -1;
}
function getFollowed(): string[] {
  try { return JSON.parse(localStorage.getItem("followed_creators") ?? "[]"); } catch { return []; }
}
function toggleFollowed(name: string): boolean {
  const followed = getFollowed();
  const idx = followed.indexOf(name);
  if (idx > -1) { followed.splice(idx, 1); } else { followed.push(name); }
  localStorage.setItem("followed_creators", JSON.stringify(followed));
  return idx === -1;
}

// AI content generators
const AI_NOTES: Record<string, string[]> = {
  "data-structures": ["Arrays give O(1) access but O(n) insert/delete at middle", "Hash maps provide O(1) average lookup using key hashing", "Trees enable O(log n) operations when balanced", "Graphs model relationships — use BFS for shortest path", "Dynamic programming trades space for time by caching subproblems"],
  "web-development": ["React's virtual DOM diffs only changed nodes, minimizing real DOM updates", "useEffect runs after render — return cleanup to prevent memory leaks", "useState triggers re-render; useRef does NOT", "CSS Grid is 2D layout; Flexbox is 1D — use both together", "Lazy loading defers non-critical resources to speed initial load"],
  "machine-learning": ["Gradient descent minimizes loss by moving in the direction of steepest decrease", "Overfitting: model memorizes training data — fix with dropout, regularization", "Bias-variance tradeoff: high bias=underfitting, high variance=overfitting", "CNNs use local receptive fields to detect spatial patterns in images", "Transformers use self-attention to model long-range dependencies"],
};
const DEFAULT_NOTES = ["Take notes in your own words to boost retention by 40%", "Spaced repetition: review after 1 day, 3 days, 1 week, 1 month", "Active recall beats passive re-reading for long-term memory", "The Pomodoro technique: 25 min focus + 5 min break maximizes productivity", "Teach what you learn — the Feynman technique cements understanding"];

function getAINotes(subjectSlug: string) {
  return AI_NOTES[subjectSlug] ?? DEFAULT_NOTES;
}

const AI_QUIZZES: Record<string, { q: string; opts: string[]; ans: number }[]> = {
  "data-structures": [
    { q: "What is the time complexity of binary search?", opts: ["O(n)", "O(log n)", "O(n²)", "O(1)"], ans: 1 },
    { q: "Which data structure uses LIFO order?", opts: ["Queue", "Array", "Stack", "Heap"], ans: 2 },
    { q: "What is the best-case time for quicksort?", opts: ["O(n²)", "O(n log n)", "O(n)", "O(log n)"], ans: 1 },
  ],
  "machine-learning": [
    { q: "What does CNN stand for?", opts: ["Connected Neural Network", "Convolutional Neural Network", "Computed Node Network", "Cellular Net Node"], ans: 1 },
    { q: "Which is used to prevent overfitting?", opts: ["More layers", "Dropout", "Higher learning rate", "Larger batches"], ans: 1 },
    { q: "What does gradient descent minimize?", opts: ["Accuracy", "Loss function", "Layer count", "Batch size"], ans: 1 },
  ],
};
const DEFAULT_QUIZ = [
  { q: "What is the Feynman Technique?", opts: ["Speed reading", "Explaining concepts simply to find gaps", "Highlighting notes", "Group study"], ans: 1 },
  { q: "How many hours should you study per Pomodoro session?", opts: ["1 hour", "45 minutes", "25 minutes", "2 hours"], ans: 2 },
  { q: "Which brain wave is associated with deep focus?", opts: ["Alpha", "Beta", "Theta", "Delta"], ans: 0 },
];

function getQuiz(subjectSlug: string) {
  return AI_QUIZZES[subjectSlug] ?? DEFAULT_QUIZ;
}

const FLASHCARD_SETS: Record<string, { q: string; a: string }[]> = {
  "data-structures": [
    { q: "What is Big-O notation?", a: "A mathematical notation describing the upper bound of an algorithm's time/space complexity as input size grows." },
    { q: "What is a hash collision?", a: "When two different keys hash to the same index. Resolved by chaining (linked list) or open addressing (linear probing)." },
    { q: "What is memoization?", a: "Caching the results of expensive function calls to avoid recomputation — the core idea of dynamic programming." },
  ],
  "machine-learning": [
    { q: "What is the activation function?", a: "A function applied after each neuron to introduce non-linearity. Common: ReLU (max(0,x)), sigmoid, softmax." },
    { q: "What is backpropagation?", a: "The algorithm for training neural networks — calculates gradients by propagating the error backwards through layers." },
    { q: "What is a learning rate?", a: "A hyperparameter controlling how much to adjust weights during training. Too high = diverges; too low = slow convergence." },
  ],
};
const DEFAULT_FLASHCARDS = [
  { q: "What is active recall?", a: "Retrieving information from memory without looking at notes — the most effective study technique." },
  { q: "What is spaced repetition?", a: "Reviewing material at increasing intervals (1d, 3d, 7d, 30d) to maximize long-term retention." },
  { q: "What is chunking?", a: "Grouping related information into units to reduce cognitive load and improve working memory." },
];

function getFlashcards(subjectSlug: string) {
  return FLASHCARD_SETS[subjectSlug] ?? DEFAULT_FLASHCARDS;
}

// Comments Panel
function CommentsPanel({ reelId, onClose }: { reelId: string; onClose: () => void }) {
  const { data: comments = [], isLoading, refetch } = useListReelComments(reelId);
  const post = usePostReelComment();
  const [body, setBody] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;
    try {
      await post.mutateAsync({ reelId, data: { body: body.trim() } });
      setBody("");
      await refetch();
      await queryClient.invalidateQueries({ queryKey: ["/api/reels"] });
    } catch {
      toast({ title: "Could not post comment", variant: "destructive" });
    }
  };

  return (
    <div className="absolute inset-0 z-20 bg-black/95 backdrop-blur-sm flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <h3 className="font-bold text-white">Comments</h3>
        <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/10">
          <X className="w-4 h-4" />
        </Button>
      </div>
      <div className="flex-1 overflow-auto p-4 space-y-3">
        {isLoading ? (
          <Skeleton className="h-16 rounded-lg bg-white/10" />
        ) : comments.length === 0 ? (
          <p className="text-sm text-white/50 text-center py-8">No comments yet. Start the conversation.</p>
        ) : (
          comments.map((c) => (
            <div key={c.id} className="flex items-start gap-3">
              <img src={c.authorAvatarUrl} alt={c.authorName} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-white mr-2">{c.authorName}</span>
                <span className="text-sm text-white/80">{c.body}</span>
                <div className="text-xs text-white/40 mt-0.5">{formatRelative(c.createdAt)}</div>
              </div>
            </div>
          ))
        )}
      </div>
      <form onSubmit={onSubmit} className="p-4 border-t border-white/10 flex gap-2">
        <Input value={body} onChange={(e) => setBody(e.target.value)} placeholder="Add a comment..." className="bg-white/10 border-white/20 text-white placeholder:text-white/40" />
        <Button type="submit" disabled={!body.trim() || post.isPending} size="icon">
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}

// AI Tools Panel
function AIPanel({ subjectSlug, onClose }: { subjectSlug: string; onClose: () => void }) {
  const [tab, setTab] = useState<"notes" | "quiz" | "flashcards">("notes");
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizRevealed, setQuizRevealed] = useState(false);
  const [cardIdx, setCardIdx] = useState(0);
  const [cardFlipped, setCardFlipped] = useState(false);

  const notes = getAINotes(subjectSlug);
  const quiz = getQuiz(subjectSlug);
  const flashcards = getFlashcards(subjectSlug);

  return (
    <div className="absolute inset-0 z-20 bg-black/95 backdrop-blur-sm flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-2 text-white">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span className="font-bold">AI Study Tools</span>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/10">
          <X className="w-4 h-4" />
        </Button>
      </div>
      <div className="flex gap-0 border-b border-white/10">
        {[
          { id: "notes", label: "AI Notes", icon: FileText },
          { id: "quiz", label: "Quick Quiz", icon: HelpCircle },
          { id: "flashcards", label: "Flashcards", icon: Brain },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as typeof tab)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-medium border-b-2 transition-colors ${
              tab === t.id ? "border-purple-400 text-purple-400" : "border-transparent text-white/50 hover:text-white"
            }`}
          >
            <t.icon className="w-3.5 h-3.5" />{t.label}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-auto p-4">
        {tab === "notes" && (
          <div className="space-y-3">
            <p className="text-xs text-white/50 mb-3">AI-generated key points from this reel</p>
            {notes.map((note, i) => (
              <div key={i} className="flex items-start gap-2.5 bg-white/5 rounded-lg p-3">
                <span className="text-purple-400 font-bold text-xs mt-0.5 flex-shrink-0">{i + 1}.</span>
                <p className="text-sm text-white/90 leading-snug">{note}</p>
              </div>
            ))}
          </div>
        )}
        {tab === "quiz" && (
          <div className="space-y-5">
            <p className="text-xs text-white/50">Test your understanding</p>
            {quiz.map((q, qi) => (
              <div key={qi} className="space-y-2">
                <p className="text-sm font-medium text-white">{qi + 1}. {q.q}</p>
                <div className="grid grid-cols-1 gap-2">
                  {q.opts.map((opt, oi) => {
                    const selected = quizAnswers[qi] === oi;
                    const isCorrect = oi === q.ans;
                    const showResult = quizRevealed;
                    return (
                      <button
                        key={oi}
                        onClick={() => !quizRevealed && setQuizAnswers((p) => ({ ...p, [qi]: oi }))}
                        className={`text-left text-sm px-3 py-2.5 rounded-lg border transition-colors ${
                          showResult && isCorrect ? "bg-emerald-500/20 border-emerald-500 text-emerald-400" :
                          showResult && selected && !isCorrect ? "bg-red-500/20 border-red-500 text-red-400" :
                          selected ? "bg-purple-500/20 border-purple-400 text-white" :
                          "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
            <Button
              size="sm"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              onClick={() => setQuizRevealed(true)}
              disabled={quizRevealed || Object.keys(quizAnswers).length === 0}
            >
              {quizRevealed ? `Score: ${quiz.filter((q, i) => quizAnswers[i] === q.ans).length}/${quiz.length}` : "Check Answers"}
            </Button>
          </div>
        )}
        {tab === "flashcards" && (
          <div className="space-y-4">
            <p className="text-xs text-white/50">{cardIdx + 1} / {flashcards.length} — tap card to flip</p>
            <div
              className="h-40 cursor-pointer relative"
              onClick={() => setCardFlipped(!cardFlipped)}
            >
              <div className={`absolute inset-0 rounded-xl flex items-center justify-center p-6 text-center transition-all ${cardFlipped ? "opacity-0" : "opacity-100"} bg-gradient-to-br from-purple-500/20 to-purple-900/40 border border-purple-500/30`}>
                <p className="text-white font-semibold text-sm leading-snug">{flashcards[cardIdx].q}</p>
              </div>
              <div className={`absolute inset-0 rounded-xl flex items-center justify-center p-6 text-center transition-all ${cardFlipped ? "opacity-100" : "opacity-0"} bg-gradient-to-br from-emerald-500/20 to-emerald-900/40 border border-emerald-500/30`}>
                <p className="text-white text-sm leading-relaxed">{flashcards[cardIdx].a}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => { setCardIdx((i) => Math.max(0, i - 1)); setCardFlipped(false); }} disabled={cardIdx === 0} className="flex-1 border-white/20 text-white bg-transparent hover:bg-white/10">
                ← Prev
              </Button>
              <Button variant="outline" size="sm" onClick={() => setCardFlipped(!cardFlipped)} className="flex-1 border-white/20 text-white bg-transparent hover:bg-white/10">
                {cardFlipped ? "Hide" : "Flip"}
              </Button>
              <Button variant="outline" size="sm" onClick={() => { setCardIdx((i) => Math.min(flashcards.length - 1, i + 1)); setCardFlipped(false); }} disabled={cardIdx === flashcards.length - 1} className="flex-1 border-white/20 text-white bg-transparent hover:bg-white/10">
                Next →
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Speed Control
const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];
function SpeedMenu({ speed, onChange, onClose }: { speed: number; onChange: (s: number) => void; onClose: () => void }) {
  return (
    <div className="absolute top-14 right-3 z-30 bg-black/90 border border-white/20 rounded-xl p-2 min-w-[100px]">
      {SPEEDS.map((s) => (
        <button
          key={s}
          onClick={() => { onChange(s); onClose(); }}
          className={`w-full text-center py-1.5 px-3 rounded-lg text-sm transition-colors ${
            speed === s ? "bg-white/20 text-white font-bold" : "text-white/70 hover:bg-white/10"
          }`}
        >
          {s}×
        </button>
      ))}
    </div>
  );
}

export default function Reels() {
  const { data: reels = [], isLoading, refetch } = useListReels();
  const { isTutor, isAdmin } = useAuth();
  const canUpload = isTutor || isAdmin;
  const [activeIdx, setActiveIdx] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [showSpeed, setShowSpeed] = useState(false);
  const [paused, setPaused] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [saved, setSaved] = useState<string[]>(getSaved);
  const [followed, setFollowed] = useState<string[]>(getFollowed);
  const [progress, setProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const toggleLike = useToggleReelLike();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const active = reels[activeIdx];

  useEffect(() => {
    setShowComments(false);
    setShowAI(false);
    setShowSpeed(false);
    setPaused(false);
    setProgress(0);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.playbackRate = speed;
      videoRef.current.play().catch(() => {});
    }
  }, [activeIdx]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  }, [speed]);

  // Keyboard navigation
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "ArrowDown") setActiveIdx((i) => Math.min(reels.length - 1, i + 1));
      if (e.key === "ArrowUp") setActiveIdx((i) => Math.max(0, i - 1));
      if (e.key === " ") { e.preventDefault(); togglePlay(); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [reels.length]);

  const onLike = async () => {
    if (!active) return;
    try {
      await toggleLike.mutateAsync({ reelId: active.id });
      await refetch();
      await queryClient.invalidateQueries({ queryKey: ["/api/reels"] });
    } catch {
      toast({ title: "Could not update like", variant: "destructive" });
    }
  };

  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) { videoRef.current.play().catch(() => {}); setPaused(false); }
    else { videoRef.current.pause(); setPaused(true); }
  }, []);

  const handleSave = () => {
    if (!active) return;
    const added = toggleSaved(active.id);
    setSaved(getSaved());
    toast({ title: added ? "Saved to Study Later ✓" : "Removed from saved", description: added ? "Find it in Profile → Store → Saved Reels" : "" });
  };

  const handleShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}/reels`);
    toast({ title: "Link copied!", description: "Share this reel with your friends" });
  };

  const handleFollow = () => {
    if (!active) return;
    const now = toggleFollowed(active.authorName);
    setFollowed(getFollowed());
    toast({ title: now ? `Following ${active.authorName}` : `Unfollowed ${active.authorName}` });
  };

  const next = () => setActiveIdx((i) => Math.min(reels.length - 1, i + 1));
  const prev = () => setActiveIdx((i) => Math.max(0, i - 1));

  const isSaved = active ? saved.includes(active.id) : false;
  const isFollowed = active ? followed.includes(active.authorName) : false;

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-10">
        <Skeleton className="h-12 w-1/3 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-[480px_1fr] gap-6">
          <Skeleton className="h-[640px] rounded-2xl" />
          <Skeleton className="h-[640px] rounded-2xl" />
        </div>
      </div>
    );
  }

  if (reels.length === 0 || !active) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-10">
        <Card>
          <CardContent className="py-16 text-center">
            <Film className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
            <h3 className="font-bold text-lg mb-1">No reels yet</h3>
            <p className="text-muted-foreground mb-4">Check back soon for short lessons.</p>
            {canUpload && (
              <Link href="/reels/upload">
                <Button><Upload className="w-4 h-4 mr-2" /> Upload First Reel</Button>
              </Link>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <header className="mb-5 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-primary mb-1">
            <Film className="w-4 h-4" />
            <span className="text-xs font-medium uppercase tracking-wide">Learning Reels</span>
          </div>
          <h1 className="font-serif text-3xl font-bold">Bite-sized Knowledge</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Short lessons from EduConnect tutors. ↑↓ keys or swipe to navigate.
          </p>
        </div>
        {canUpload && (
          <Link href="/reels/upload">
            <Button size="sm" className="gap-2">
              <Upload className="w-4 h-4" /> Upload Reel
            </Button>
          </Link>
        )}
      </header>

      <div className="grid grid-cols-1 md:grid-cols-[420px_1fr] gap-6">
        {/* Player */}
        <div className="relative">
          <div
            className="relative aspect-[9/16] bg-black rounded-2xl overflow-hidden shadow-2xl"
            data-testid="reel-player"
          >
            <video
              ref={videoRef}
              key={active.id}
              src={active.videoUrl}
              poster={active.thumbnailUrl}
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover cursor-pointer"
              onClick={togglePlay}
              onTimeUpdate={() => {
                if (videoRef.current && videoRef.current.duration) {
                  setProgress((videoRef.current.currentTime / videoRef.current.duration) * 100);
                }
              }}
            />

            {/* Pause overlay */}
            {paused && (
              <button onClick={togglePlay} className="absolute inset-0 flex items-center justify-center bg-black/30 z-10">
                <div className="bg-white/20 backdrop-blur-sm rounded-full p-5">
                  <Play className="w-10 h-10 text-white" fill="white" />
                </div>
              </button>
            )}

            {/* Gradient */}
            <div className="absolute bottom-0 left-0 right-0 h-2/5 bg-gradient-to-t from-black/90 to-transparent pointer-events-none" />
            <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-black/50 to-transparent pointer-events-none" />

            {/* Duration badge */}
            <div className="absolute top-3 left-3 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-lg text-xs text-white font-medium">
              {formatDuration(active.durationSec)}
            </div>

            {/* Speed control button */}
            <button
              onClick={() => setShowSpeed(!showSpeed)}
              className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-lg text-xs text-white font-medium hover:bg-black/80 transition-colors z-10"
            >
              <Gauge className="w-3 h-3" />{speed}×
            </button>

            {showSpeed && (
              <SpeedMenu speed={speed} onChange={(s) => { setSpeed(s); }} onClose={() => setShowSpeed(false)} />
            )}

            {/* Subject badge */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2">
              <Badge className="bg-primary/80 text-white text-[10px] border-0 backdrop-blur-sm">
                {active.subjectSlug.replace(/-/g, " ")}
              </Badge>
            </div>

            {/* Author + title */}
            <div className="absolute bottom-10 left-4 right-16 text-white z-10">
              <button
                onClick={handleFollow}
                className="flex items-center gap-2 mb-2 group"
              >
                <img src={active.authorAvatarUrl} alt={active.authorName} className="w-8 h-8 rounded-full border-2 border-white/80 object-cover" />
                <span className="font-medium text-sm">{active.authorName}</span>
                <span className={`ml-1 text-[10px] px-2 py-0.5 rounded-full border transition-colors ${
                  isFollowed ? "bg-white/20 border-white/40 text-white" : "border-white/60 text-white/80 group-hover:bg-white/20"
                }`}>
                  {isFollowed ? "Following" : "+ Follow"}
                </span>
              </button>
              <h3 className="font-bold text-base leading-snug mb-1">{active.title}</h3>
              <p className="text-xs text-white/70 line-clamp-2">{active.description}</p>
            </div>

            {/* Progress bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
              <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
            </div>

            {/* Right rail actions */}
            <div className="absolute right-3 bottom-24 flex flex-col gap-4 items-center z-10">
              {/* Like */}
              <button onClick={onLike} className="flex flex-col items-center text-white" data-testid="button-like-reel">
                <div className={`p-3 rounded-full backdrop-blur-sm transition-all ${active.likedByMe ? "bg-red-500 shadow-lg shadow-red-500/50" : "bg-black/40 hover:bg-black/60"}`}>
                  <Heart className="w-5 h-5" fill={active.likedByMe ? "white" : "transparent"} />
                </div>
                <span className="text-xs mt-1 font-medium">{active.likeCount}</span>
              </button>

              {/* Comment */}
              <button onClick={() => { setShowComments(true); setShowAI(false); }} className="flex flex-col items-center text-white" data-testid="button-open-comments">
                <div className="p-3 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <span className="text-xs mt-1 font-medium">{active.commentCount}</span>
              </button>

              {/* Save */}
              <button onClick={handleSave} className="flex flex-col items-center text-white">
                <div className={`p-3 rounded-full backdrop-blur-sm transition-all ${isSaved ? "bg-amber-500 shadow-lg shadow-amber-500/40" : "bg-black/40 hover:bg-black/60"}`}>
                  <Bookmark className="w-5 h-5" fill={isSaved ? "white" : "transparent"} />
                </div>
                <span className="text-xs mt-1 font-medium">{isSaved ? "Saved" : "Save"}</span>
              </button>

              {/* Share */}
              <button onClick={handleShare} className="flex flex-col items-center text-white">
                <div className="p-3 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm">
                  <Share2 className="w-5 h-5" />
                </div>
                <span className="text-xs mt-1 font-medium">Share</span>
              </button>

              {/* AI Tools */}
              <button onClick={() => { setShowAI(true); setShowComments(false); }} className="flex flex-col items-center text-white">
                <div className="p-3 rounded-full bg-purple-600/70 hover:bg-purple-600 backdrop-blur-sm">
                  <Sparkles className="w-5 h-5" />
                </div>
                <span className="text-xs mt-1 font-medium">AI</span>
              </button>

              {/* Views */}
              <div className="flex flex-col items-center text-white opacity-60">
                <div className="p-3 rounded-full bg-black/30 backdrop-blur-sm">
                  <Eye className="w-5 h-5" />
                </div>
                <span className="text-xs mt-1 font-medium">{active.viewCount}</span>
              </div>
            </div>

            {/* Overlays */}
            {showComments && <CommentsPanel reelId={active.id} onClose={() => setShowComments(false)} />}
            {showAI && <AIPanel subjectSlug={active.subjectSlug} onClose={() => setShowAI(false)} />}
          </div>

          {/* Nav controls */}
          <div className="flex items-center justify-between mt-3">
            <Button variant="outline" size="sm" onClick={prev} disabled={activeIdx === 0} data-testid="button-prev-reel">
              <ChevronUp className="w-4 h-4 mr-1" /> Previous
            </Button>
            <span className="text-xs text-muted-foreground">{activeIdx + 1} / {reels.length}</span>
            <Button variant="outline" size="sm" onClick={next} disabled={activeIdx === reels.length - 1} data-testid="button-next-reel">
              Next <ChevronDown className="w-4 h-4 ml-1" />
            </Button>
          </div>

          {/* Smart actions */}
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              onClick={() => setShowAI(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs font-medium hover:bg-purple-100 transition-colors"
            >
              <Brain className="w-3.5 h-3.5" /> Generate Flashcards
            </button>
            <button
              onClick={() => setShowAI(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-xs font-medium hover:bg-amber-100 transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5" /> Quick Quiz
            </button>
          </div>
        </div>

        {/* Right panel: Up next + Smart features */}
        <div className="flex flex-col gap-4">
          {/* Smart discovery banner */}
          <div className="bg-gradient-to-r from-purple-500/10 to-primary/10 border border-purple-200/50 rounded-xl p-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
              <Zap className="w-4 h-4 text-purple-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold">Continue learning from this reel</p>
              <p className="text-xs text-muted-foreground">Open related chapter in Library</p>
            </div>
            <Link href="/library">
              <Button size="sm" variant="ghost" className="text-primary px-2 flex-shrink-0">
                Open <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </div>

          {/* Up next */}
          <h2 className="font-serif text-lg font-bold">Up next</h2>
          <div className="space-y-2 overflow-y-auto max-h-[580px] pr-1">
            {reels.map((r, i) => (
              <button key={r.id} onClick={() => setActiveIdx(i)} className={`w-full text-left ${i === activeIdx ? "" : "hover-elevate"}`} data-testid={`button-reel-${r.id}`}>
                <Card className={i === activeIdx ? "border-primary border-2" : ""}>
                  <CardContent className="p-3 flex gap-3">
                    <div className="relative w-20 h-28 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      <img src={r.thumbnailUrl} alt={r.title} className="w-full h-full object-cover" />
                      <div className="absolute bottom-1 right-1 px-1 py-0.5 bg-black/70 rounded text-[9px] text-white">{formatDuration(r.durationSec)}</div>
                      {i === activeIdx && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                          {paused ? <Pause className="w-5 h-5 text-white" /> : <Play className="w-5 h-5 text-white" fill="white" />}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm text-foreground line-clamp-2 mb-1">{r.title}</h4>
                      <div className="text-xs text-muted-foreground mb-2">{r.authorName}</div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{r.likeCount}</span>
                        <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{r.viewCount}</span>
                        <Badge variant="secondary" className="text-[10px] capitalize ml-auto">{r.subjectSlug.replace(/-/g, " ")}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
