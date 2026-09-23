import { useState } from "react";
import { Link } from "wouter";
import { useListMarketplaceItems } from "@workspace/api-client-react";
import {
  Store, Search, Star, Download, Flame, Zap, FileText,
  Code2, Layout, Palette, Package, BookMarked, Globe, ChevronRight
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const CATEGORIES = [
  { value: "all", label: "All", icon: Store },
  { value: "notes", label: "Notes", icon: FileText },
  { value: "source-code", label: "Source Code", icon: Code2 },
  { value: "templates", label: "Templates", icon: Layout },
  { value: "ui-kits", label: "UI Kits", icon: Palette },
  { value: "theme-packs", label: "Themes", icon: Palette },
  { value: "study-bundles", label: "Study Bundles", icon: Package },
  { value: "apis", label: "APIs", icon: Globe },
];

const SORTS = [
  { value: "popular", label: "Most Popular" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "free-first", label: "Free First" },
];

const FILE_TYPE_ICONS: Record<string, string> = {
  pdf: "📄",
  zip: "🗜️",
  template: "📐",
};

type Item = {
  id: number;
  title: string;
  creatorName: string;
  creatorAvatar?: string | null;
  category: string;
  priceCredits: number;
  isFree: boolean;
  rating: number;
  reviewCount: number;
  downloads: number;
  description: string;
  previewUrl?: string | null;
  fileType: string;
  isFeatured: boolean;
  tags: string[];
};

function ItemCard({ item }: { item: Item }) {
  return (
    <Link href={`/marketplace/${item.id}`}>
      <div className="group bg-card border rounded-xl overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer h-full flex flex-col">
        <div className="relative">
          {item.previewUrl ? (
            <div className="h-36 overflow-hidden">
              <img
                src={item.previewUrl}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          ) : (
            <div className="h-36 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
              <span className="text-4xl">{FILE_TYPE_ICONS[item.fileType] ?? "📦"}</span>
            </div>
          )}
          {item.isFeatured && (
            <div className="absolute top-2 left-2">
              <Badge className="bg-amber-500 text-white border-0 text-xs flex items-center gap-1">
                <Flame className="w-2.5 h-2.5" /> Featured
              </Badge>
            </div>
          )}
          <div className="absolute top-2 right-2">
            {item.isFree ? (
              <Badge className="bg-emerald-500 text-white border-0 text-xs">Free</Badge>
            ) : (
              <Badge className="bg-primary text-primary-foreground border-0 text-xs">
                {item.priceCredits} cr
              </Badge>
            )}
          </div>
        </div>

        <div className="p-4 flex flex-col flex-1">
          <h3 className="font-semibold text-sm leading-snug line-clamp-2 mb-2 group-hover:text-primary transition-colors">
            {item.title}
          </h3>
          <div className="flex items-center gap-2 mb-2">
            {item.creatorAvatar && (
              <img src={item.creatorAvatar} alt={item.creatorName} className="w-5 h-5 rounded-full object-cover" />
            )}
            <span className="text-xs text-muted-foreground">{item.creatorName}</span>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2 flex-1 mb-3">{item.description}</p>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              {item.rating.toFixed(1)}
              <span className="text-muted-foreground/60">({item.reviewCount})</span>
            </span>
            <span className="flex items-center gap-1">
              <Download className="w-3 h-3" />{item.downloads.toLocaleString()}
            </span>
            <span className="uppercase font-mono text-[10px] bg-muted px-1.5 py-0.5 rounded">
              {FILE_TYPE_ICONS[item.fileType]} {item.fileType}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function ItemSkeleton() {
  return (
    <div className="bg-card border rounded-xl overflow-hidden">
      <Skeleton className="h-36 w-full rounded-none" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
      </div>
    </div>
  );
}

export default function Marketplace() {
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("popular");
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");

  const { data: items = [], isLoading } = useListMarketplaceItems({
    category: category === "all" ? undefined : category,
    sort: (sort as "popular" | "newest" | "price-asc" | "free-first") || undefined,
    q: debouncedQ || undefined,
  });

  function handleSearch(v: string) {
    setQ(v);
    clearTimeout((window as any)._mktTimer);
    (window as any)._mktTimer = setTimeout(() => setDebouncedQ(v), 400);
  }

  const featured = items.filter((i) => i.isFeatured).slice(0, 4);

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-10">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 bg-amber-500/10 text-amber-600 px-4 py-1.5 rounded-full text-sm font-medium">
          <Zap className="w-4 h-4" />
          Creator Economy
        </div>
        <h1 className="text-4xl font-bold font-serif">Creator Marketplace</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Discover and download premium notes, source code, templates, and study bundles crafted by top educators and developers.
        </p>
        <div className="flex gap-3 max-w-lg mx-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              className="pl-10 h-11 rounded-full bg-muted/50"
              placeholder="Search items, creators, tags…"
              value={q}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="h-11 px-3 rounded-full border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c.value}
            onClick={() => setCategory(c.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors flex items-center gap-1.5 ${
              category === c.value
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Featured */}
      {category === "all" && !debouncedQ && featured.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-500" />
              Featured Items
            </h2>
            <Link href="/marketplace">
              <button className="text-sm text-primary flex items-center hover:underline">
                See all <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {featured.map((item) => <ItemCard key={item.id} item={item} />)}
          </div>
        </section>
      )}

      {/* All Items */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">
            {debouncedQ ? `Results for "${debouncedQ}"` : CATEGORIES.find((c) => c.value === category)?.label ?? "All Items"}
            {!isLoading && <span className="text-sm font-normal text-muted-foreground ml-2">({items.length})</span>}
          </h2>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => <ItemSkeleton key={i} />)}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <Store className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No items found</p>
            <p className="text-sm">Try a different category or search term</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {items.map((item) => <ItemCard key={item.id} item={item} />)}
          </div>
        )}
      </section>

      {/* Creator CTA */}
      <section className="bg-gradient-to-r from-amber-500/10 to-primary/10 border border-amber-200/50 rounded-2xl p-8 text-center">
        <BookMarked className="w-10 h-10 text-amber-500 mx-auto mb-3" />
        <h3 className="text-xl font-bold mb-2">Become a Creator</h3>
        <p className="text-muted-foreground mb-4 max-w-md mx-auto text-sm">
          Share your notes, code, or study materials with thousands of students and earn credits.
        </p>
        <button className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2.5 rounded-full text-sm font-medium transition-colors">
          Start Selling →
        </button>
      </section>
    </div>
  );
}
