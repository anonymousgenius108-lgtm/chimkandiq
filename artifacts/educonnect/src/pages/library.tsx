import { useState } from "react";
import { Link } from "wouter";
import { useListLibraryBooks } from "@workspace/api-client-react";
import {
  BookOpen, Search, Star, Clock, Download, Lock, Sparkles,
  ChevronRight, Layers
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const CATEGORIES = [
  { value: "all", label: "All Books" },
  { value: "coding", label: "Coding" },
  { value: "ai-ml", label: "AI & ML" },
  { value: "engineering", label: "Engineering" },
  { value: "school", label: "School" },
  { value: "upsc", label: "UPSC" },
  { value: "medical", label: "Medical" },
  { value: "business", label: "Business" },
  { value: "productivity", label: "Productivity" },
];

const CATEGORY_COLORS: Record<string, string> = {
  coding: "bg-blue-500/10 text-blue-600 border-blue-200",
  "ai-ml": "bg-purple-500/10 text-purple-600 border-purple-200",
  engineering: "bg-orange-500/10 text-orange-600 border-orange-200",
  school: "bg-green-500/10 text-green-600 border-green-200",
  upsc: "bg-amber-500/10 text-amber-600 border-amber-200",
  medical: "bg-red-500/10 text-red-600 border-red-200",
  business: "bg-teal-500/10 text-teal-600 border-teal-200",
  productivity: "bg-indigo-500/10 text-indigo-600 border-indigo-200",
};

function BookCard({ book }: { book: { id: number; title: string; author: string; category: string; coverUrl?: string | null; shortDesc: string; rating: number; reviewCount: number; downloads: number; isFree: boolean; priceCredits: number; pages: number; readingTimeMinutes: number; tags: string[] } }) {
  const hrs = Math.floor(book.readingTimeMinutes / 60);
  const mins = book.readingTimeMinutes % 60;
  const readTime = hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;

  return (
    <Link href={`/library/${book.id}`}>
      <div className="group bg-card border rounded-xl overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer h-full flex flex-col">
        <div className="relative h-44 bg-gradient-to-br from-muted to-muted/50 overflow-hidden">
          {book.coverUrl ? (
            <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <BookOpen className="w-12 h-12 text-muted-foreground/40" />
            </div>
          )}
          <div className="absolute top-2 right-2">
            {book.isFree ? (
              <Badge className="bg-emerald-500 text-white border-0 text-xs">Free</Badge>
            ) : (
              <Badge className="bg-primary/90 text-primary-foreground border-0 text-xs flex items-center gap-1">
                <Lock className="w-2.5 h-2.5" />{book.priceCredits} cr
              </Badge>
            )}
          </div>
          <div className="absolute bottom-2 left-2">
            <Badge variant="outline" className={`text-xs border ${CATEGORY_COLORS[book.category] ?? "bg-muted"}`}>
              {book.category}
            </Badge>
          </div>
        </div>
        <div className="p-4 flex flex-col flex-1">
          <h3 className="font-semibold text-sm leading-snug line-clamp-2 mb-1 group-hover:text-primary transition-colors">
            {book.title}
          </h3>
          <p className="text-xs text-muted-foreground mb-2">{book.author}</p>
          <p className="text-xs text-muted-foreground line-clamp-2 flex-1 mb-3">{book.shortDesc}</p>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              {book.rating.toFixed(1)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />{readTime}
            </span>
            <span className="flex items-center gap-1">
              <Download className="w-3 h-3" />{book.downloads.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function BookSkeleton() {
  return (
    <div className="bg-card border rounded-xl overflow-hidden">
      <Skeleton className="h-44 w-full rounded-none" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-full" />
      </div>
    </div>
  );
}

export default function Library() {
  const [category, setCategory] = useState("all");
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");

  const { data: books = [], isLoading } = useListLibraryBooks({
    category: category === "all" ? undefined : category,
    q: debouncedQ || undefined,
  });

  function handleSearch(v: string) {
    setQ(v);
    clearTimeout((window as any)._libTimer);
    (window as any)._libTimer = setTimeout(() => setDebouncedQ(v), 400);
  }

  const featured = books.filter((b) => b.isFree && b.downloads > 15000).slice(0, 3);

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-10">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium">
          <Sparkles className="w-4 h-4" />
          AI-Powered Knowledge Vault
        </div>
        <h1 className="text-4xl font-bold font-serif">Knowledge Library</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Explore free & premium books across every subject — with AI summaries, flashcards, and interactive reading tools.
        </p>
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            className="pl-10 h-11 rounded-full bg-muted/50"
            placeholder="Search books, authors, topics…"
            value={q}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c.value}
            onClick={() => setCategory(c.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              category === c.value
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Featured Books */}
      {category === "all" && !debouncedQ && featured.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Layers className="w-5 h-5 text-primary" />
              Featured Free Books
            </h2>
            <Button variant="ghost" size="sm" className="text-primary" onClick={() => setCategory("all")}>
              View all <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {featured.map((b) => (
              <BookCard key={b.id} book={b} />
            ))}
          </div>
        </section>
      )}

      {/* All Books Grid */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">
            {debouncedQ ? `Results for "${debouncedQ}"` : category === "all" ? "All Books" : CATEGORIES.find(c => c.value === category)?.label}
            {!isLoading && <span className="text-sm font-normal text-muted-foreground ml-2">({books.length})</span>}
          </h2>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => <BookSkeleton key={i} />)}
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No books found</p>
            <p className="text-sm">Try a different category or search term</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {books.map((b) => (
              <BookCard key={b.id} book={b} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
