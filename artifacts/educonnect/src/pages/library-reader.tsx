import { useState } from "react";
import { useParams, Link } from "wouter";
import { useGetLibraryBook } from "@workspace/api-client-react";
import {
  ArrowLeft, Star, Clock, Download, BookOpen, Sparkles,
  Lock, FileText, Brain, ChevronRight, ChevronLeft, CheckCircle2,
  Copy, Check
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

const FLASHCARDS: Record<string, { q: string; a: string }[]> = {
  coding: [
    { q: "What is the time complexity of binary search?", a: "O(log n) — it halves the search space each iteration." },
    { q: "What data structure uses LIFO order?", a: "A Stack — Last In, First Out. Push adds to top, Pop removes from top." },
    { q: "What is dynamic programming?", a: "Breaking a problem into overlapping subproblems and caching results to avoid recomputation." },
    { q: "Difference between BFS and DFS?", a: "BFS explores level by level (queue), finds shortest path. DFS goes deep first (stack/recursion)." },
    { q: "What is Big-O notation?", a: "A mathematical notation describing the upper bound of an algorithm's time or space complexity as input grows." },
  ],
  "ai-ml": [
    { q: "What is overfitting in ML?", a: "When a model learns training data too well (including noise) and performs poorly on new data. Fix: regularization, more data, simpler model." },
    { q: "What is gradient descent?", a: "An optimization algorithm that iteratively adjusts parameters to minimize a loss function by moving in the direction of steepest descent." },
    { q: "Difference between supervised and unsupervised learning?", a: "Supervised uses labeled data (input→output pairs). Unsupervised finds patterns in unlabeled data (clustering, dimensionality reduction)." },
    { q: "What is a neural network activation function?", a: "A function applied to each neuron's output to introduce non-linearity. Common: ReLU, sigmoid, tanh, softmax." },
    { q: "What is the bias-variance tradeoff?", a: "High bias = underfitting (model too simple). High variance = overfitting (model too complex). Goal: balance both for good generalization." },
  ],
  school: [
    { q: "State Newton's Second Law of Motion.", a: "F = ma — Force equals mass times acceleration. The rate of change of momentum equals the applied force." },
    { q: "What is Ohm's Law?", a: "V = IR — Voltage equals Current times Resistance. At constant temperature, current through a conductor is proportional to voltage." },
    { q: "Define photosynthesis.", a: "Process by which plants convert light energy + CO₂ + H₂O into glucose and oxygen using chlorophyll." },
    { q: "What is Avogadro's number?", a: "6.022 × 10²³ — the number of atoms/molecules in one mole of a substance." },
    { q: "What is the Doppler Effect?", a: "The change in observed frequency of a wave when the source or observer is moving relative to each other." },
  ],
};

const DEFAULT_FLASHCARDS = [
  { q: "What is the key idea of this chapter?", a: "Understanding the foundational concepts that all subsequent topics build upon." },
  { q: "What should you focus on for exams?", a: "Definitions, formulas, and their real-world applications. Practice problems are essential." },
  { q: "How to retain what you read?", a: "Active recall (flashcards), spaced repetition, teach someone else, practice problems." },
  { q: "What is the Feynman Technique?", a: "Explain a concept in simple terms as if teaching a child. Identify gaps, go back to source, repeat." },
  { q: "How many hours of focused study per day?", a: "3–4 hours of deep work (Pomodoro 25/5) is more effective than 8 hours of distracted studying." },
];

export default function LibraryReader() {
  const { id } = useParams<{ id: string }>();
  const { data: book, isLoading } = useGetLibraryBook(Number(id));
  const [tab, setTab] = useState<"overview" | "ai" | "content" | "flashcards">("overview");
  const [cardIdx, setCardIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        <Skeleton className="h-8 w-32" />
        <div className="flex gap-6">
          <Skeleton className="w-40 h-56 rounded-lg flex-shrink-0" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!book) return <div className="p-8 text-center text-muted-foreground">Book not found</div>;

  const hrs = Math.floor(book.readingTimeMinutes / 60);
  const mins = book.readingTimeMinutes % 60;
  const readTime = hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
  const flashcards = FLASHCARDS[book.category] ?? DEFAULT_FLASHCARDS;
  const card = flashcards[cardIdx];

  function copyContent() {
    if (book?.contentPreview) {
      navigator.clipboard.writeText(book.contentPreview);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  const TABS = [
    { id: "overview", label: "Overview", icon: BookOpen },
    { id: "ai", label: "AI Summary", icon: Sparkles },
    { id: "content", label: "Content Preview", icon: FileText },
    { id: "flashcards", label: "Flashcards", icon: Brain },
  ] as const;

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
      <Link href="/library">
        <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Library
        </button>
      </Link>

      {/* Book Header */}
      <div className="flex gap-6">
        <div className="w-36 h-52 flex-shrink-0 rounded-xl overflow-hidden bg-gradient-to-br from-muted to-muted/50 shadow-lg">
          {book.coverUrl ? (
            <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <BookOpen className="w-10 h-10 text-muted-foreground/40" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <Badge variant="outline" className="mb-2 text-xs capitalize">{book.category}</Badge>
          <h1 className="text-2xl font-bold leading-snug mb-1">{book.title}</h1>
          <p className="text-muted-foreground text-sm mb-4">by {book.author}</p>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
            <span className="flex items-center gap-1.5">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              {book.rating.toFixed(1)} ({book.reviewCount.toLocaleString()} reviews)
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-blue-500" />
              {readTime} read
            </span>
            <span className="flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-green-500" />
              {book.pages} pages
            </span>
            <span className="flex items-center gap-1.5">
              <Download className="w-4 h-4" />
              {book.downloads.toLocaleString()} downloads
            </span>
          </div>
          <div className="flex gap-3">
            {book.isFree ? (
              <Button className="rounded-full bg-emerald-600 hover:bg-emerald-700">
                <BookOpen className="w-4 h-4 mr-2" /> Read Free
              </Button>
            ) : (
              <Button className="rounded-full">
                <Lock className="w-4 h-4 mr-2" /> Unlock — {book.priceCredits} Credits
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2">
        {book.tags.map((tag) => (
          <Badge key={tag} variant="secondary" className="text-xs rounded-full">#{tag}</Badge>
        ))}
      </div>

      {/* Tabs */}
      <div className="border-b flex gap-0">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
              tab === t.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-64">
        {tab === "overview" && (
          <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
            <p className="text-base text-foreground">{book.description}</p>
          </div>
        )}

        {tab === "ai" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <Sparkles className="w-5 h-5" />
              <span className="font-semibold">AI-Generated Summary</span>
              <Badge className="bg-primary/10 text-primary border-0 text-xs">Beta</Badge>
            </div>
            {book.aiSummary ? (
              <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-xl p-6">
                <p className="text-sm leading-relaxed whitespace-pre-line">{book.aiSummary}</p>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Sparkles className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>AI summary not available for this book yet.</p>
              </div>
            )}
          </div>
        )}

        {tab === "content" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Sample Content</span>
              {book.contentPreview && (
                <Button variant="ghost" size="sm" onClick={copyContent}>
                  {copied ? <Check className="w-4 h-4 mr-1 text-green-500" /> : <Copy className="w-4 h-4 mr-1" />}
                  {copied ? "Copied!" : "Copy"}
                </Button>
              )}
            </div>
            {book.contentPreview ? (
              <div className="bg-muted/50 rounded-xl p-6 font-mono text-xs leading-relaxed whitespace-pre-wrap border">
                {book.contentPreview}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>Content preview not available.</p>
              </div>
            )}
          </div>
        )}

        {tab === "flashcards" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{cardIdx + 1} / {flashcards.length} cards</span>
              <div className="flex gap-1">
                {flashcards.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => { setCardIdx(i); setFlipped(false); }}
                    className={`w-2 h-2 rounded-full transition-all ${i === cardIdx ? "bg-primary w-5" : "bg-muted-foreground/30"}`}
                  />
                ))}
              </div>
            </div>

            <div
              className="relative h-56 cursor-pointer"
              onClick={() => setFlipped(!flipped)}
            >
              <div className={`absolute inset-0 rounded-2xl border-2 border-primary/20 flex flex-col items-center justify-center p-8 text-center transition-all duration-300 ${
                flipped ? "opacity-0 pointer-events-none" : "opacity-100"
              } bg-gradient-to-br from-primary/5 to-primary/10`}>
                <Brain className="w-8 h-8 text-primary/40 mb-4" />
                <p className="text-lg font-semibold leading-snug">{card.q}</p>
                <p className="text-xs text-muted-foreground mt-4">Click to reveal answer</p>
              </div>
              <div className={`absolute inset-0 rounded-2xl border-2 border-emerald-500/30 flex flex-col items-center justify-center p-8 text-center transition-all duration-300 ${
                flipped ? "opacity-100" : "opacity-0 pointer-events-none"
              } bg-gradient-to-br from-emerald-500/5 to-emerald-500/10`}>
                <CheckCircle2 className="w-8 h-8 text-emerald-500/60 mb-4" />
                <p className="text-base leading-relaxed">{card.a}</p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setCardIdx((cardIdx - 1 + flashcards.length) % flashcards.length); setFlipped(false); }}
                disabled={cardIdx === 0}
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> Previous
              </Button>
              <Button variant="outline" size="sm" onClick={() => setFlipped(!flipped)}>
                {flipped ? "Hide Answer" : "Show Answer"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setCardIdx((cardIdx + 1) % flashcards.length); setFlipped(false); }}
                disabled={cardIdx === flashcards.length - 1}
              >
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
