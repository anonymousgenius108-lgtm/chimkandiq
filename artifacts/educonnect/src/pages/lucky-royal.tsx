import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useListLuckyRoyalRooms, LuckyRoyalRoom } from "@workspace/api-client-react";
import {
  Crown, Zap, Users, Clock, Sparkles, ChevronRight, Trophy,
  Star, Shield, Flame, Filter
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

function useCountdown(endsAt: string) {
  const [diff, setDiff] = useState(0);
  useEffect(() => {
    const update = () => setDiff(Math.max(0, new Date(endsAt).getTime() - Date.now()));
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, [endsAt]);
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  if (diff === 0) return "Ended";
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m ${s}s`;
}

function urgency(endsAt: string) {
  const diff = new Date(endsAt).getTime() - Date.now();
  if (diff < 3600000) return "critical";
  if (diff < 7200000) return "high";
  return "normal";
}

function fullnessPercent(cur: number, max: number) {
  return Math.round((cur / max) * 100);
}

const CATEGORY_ICONS: Record<string, typeof Crown> = {
  coding: Zap,
  "ai-ml": Sparkles,
  upsc: Shield,
  design: Star,
  general: Trophy,
  default: Crown,
};

const CATEGORY_COLORS: Record<string, string> = {
  coding: "from-cyan-500/20 to-blue-600/20 border-cyan-500/30",
  "ai-ml": "from-purple-500/20 to-pink-600/20 border-purple-500/30",
  upsc: "from-amber-500/20 to-orange-600/20 border-amber-500/30",
  design: "from-pink-500/20 to-rose-600/20 border-pink-500/30",
  general: "from-emerald-500/20 to-teal-600/20 border-emerald-500/30",
  default: "from-primary/20 to-primary/10 border-primary/30",
};

function RoomCard({ room }: { room: LuckyRoyalRoom }) {
  const countdown = useCountdown(room.endsAt);
  const urgent = urgency(room.endsAt);
  const pct = fullnessPercent(room.currentParticipants, room.maxParticipants);
  const Cat = CATEGORY_ICONS[room.category] ?? CATEGORY_ICONS.default;
  const gradient = CATEGORY_COLORS[room.category] ?? CATEGORY_COLORS.default;
  const almostFull = pct >= 80;

  return (
    <Link href={`/lucky-royal/${room.id}`}>
      <div className={`relative bg-gradient-to-br ${gradient} border rounded-2xl p-5 cursor-pointer hover:scale-[1.02] transition-all duration-200 group overflow-hidden`}>
        {/* Glow effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <div className="absolute inset-0 rounded-2xl bg-white/5" />
        </div>

        {/* Featured badge */}
        {room.isFeatured && (
          <div className="absolute top-3 right-3">
            <Badge className="bg-amber-500 text-white border-0 text-[10px] gap-1">
              <Flame className="w-2.5 h-2.5" /> Featured
            </Badge>
          </div>
        )}

        {/* Lucky Royal badge */}
        <div className="flex items-center gap-1.5 mb-3">
          <Crown className="w-3 h-3 text-amber-400" />
          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Lucky Royal Exclusive</span>
        </div>

        {/* Reward image */}
        {room.rewardImage ? (
          <div className="w-full h-36 rounded-xl overflow-hidden mb-4 bg-black/20">
            <img src={room.rewardImage} alt={room.rewardTitle} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-full h-36 rounded-xl mb-4 bg-black/20 flex items-center justify-center">
            <Cat className="w-12 h-12 opacity-30" />
          </div>
        )}

        {/* Reward title */}
        <h3 className="font-bold text-sm leading-snug mb-1 line-clamp-2">{room.rewardTitle}</h3>
        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{room.description}</p>

        {/* Creator */}
        <div className="flex items-center gap-2 mb-4">
          {room.creatorAvatar && (
            <img src={room.creatorAvatar} alt={room.creatorName} className="w-5 h-5 rounded-full" />
          )}
          <span className="text-xs text-muted-foreground">{room.creatorName}</span>
          <Badge variant="secondary" className="text-[9px] ml-auto capitalize">{room.category}</Badge>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="text-center">
            <div className="text-xs font-bold">{room.entryCredits}</div>
            <div className="text-[10px] text-muted-foreground">Credits</div>
          </div>
          <div className="text-center">
            <div className={`text-xs font-bold ${urgent === "critical" ? "text-red-500 animate-pulse" : urgent === "high" ? "text-amber-500" : ""}`}>
              {countdown}
            </div>
            <div className="text-[10px] text-muted-foreground">Remaining</div>
          </div>
          <div className="text-center">
            <div className={`text-xs font-bold ${almostFull ? "text-amber-500" : ""}`}>
              {room.currentParticipants}/{room.maxParticipants}
            </div>
            <div className="text-[10px] text-muted-foreground">Players</div>
          </div>
        </div>

        {/* Fill bar */}
        <div className="mb-4">
          <div className="h-1.5 rounded-full bg-black/20 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${almostFull ? "bg-amber-400" : "bg-primary"}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          {almostFull && (
            <p className="text-[10px] text-amber-500 mt-1 font-medium">Almost full — {room.maxParticipants - room.currentParticipants} spots left!</p>
          )}
        </div>

        {/* CTA */}
        <Button size="sm" className="w-full gap-2 group-hover:shadow-lg transition-shadow">
          Enter Room <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </Link>
  );
}

const FILTERS = ["All", "Featured", "Ending Soon", "Coding", "AI & ML", "Design", "UPSC", "General"];

export default function LuckyRoyal() {
  const { data: rooms = [], isLoading } = useListLuckyRoyalRooms();
  const [filter, setFilter] = useState("All");

  const filtered = rooms.filter((r) => {
    if (filter === "All") return true;
    if (filter === "Featured") return r.isFeatured;
    if (filter === "Ending Soon") return new Date(r.endsAt).getTime() - Date.now() < 7200000;
    if (filter === "Coding") return r.category === "coding";
    if (filter === "AI & ML") return r.category === "ai-ml";
    if (filter === "Design") return r.category === "design";
    if (filter === "UPSC") return r.category === "upsc";
    if (filter === "General") return r.category === "general";
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Hero header */}
      <div className="relative mb-8 rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900/40 to-slate-900 border border-purple-500/20 p-8">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full animate-ping opacity-20"
              style={{
                width: Math.random() * 4 + 2 + "px",
                height: Math.random() * 4 + 2 + "px",
                background: i % 2 === 0 ? "#a855f7" : "#f59e0b",
                top: Math.random() * 100 + "%",
                left: Math.random() * 100 + "%",
                animationDuration: Math.random() * 3 + 1 + "s",
                animationDelay: Math.random() * 2 + "s",
              }}
            />
          ))}
        </div>
        <div className="relative">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
              <Crown className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight">Lucky Royal</h1>
              <p className="text-purple-300 text-sm">Mystery Reward System</p>
            </div>
          </div>
          <p className="text-white/70 text-sm max-w-xl leading-relaxed">
            Spin, Win, Learn — Enter mystery reward rooms and unlock educational assets,
            credits, and exclusive content. Every spin is a chance to win something great.
          </p>
          <div className="flex flex-wrap gap-3 mt-4">
            <div className="flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1.5 text-xs text-white">
              <Users className="w-3.5 h-3.5" />
              {rooms.reduce((a, r) => a + r.currentParticipants, 0).toLocaleString()} active players
            </div>
            <div className="flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1.5 text-xs text-white">
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              {rooms.length} live rooms
            </div>
            <div className="flex items-center gap-1.5 bg-amber-500/20 border border-amber-500/30 rounded-full px-3 py-1.5 text-xs text-amber-300">
              <Sparkles className="w-3.5 h-3.5" />
              AI-secured fair randomization
            </div>
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
        <Filter className="w-4 h-4 mt-2 flex-shrink-0 text-muted-foreground" />
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Rooms grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-80 rounded-2xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Crown className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No rooms match this filter</p>
          <Button variant="ghost" className="mt-2" onClick={() => setFilter("All")}>Show all rooms</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((room) => <RoomCard key={room.id} room={room} />)}
        </div>
      )}

      {/* How it works */}
      <div className="mt-12 border rounded-2xl p-6">
        <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" /> How Lucky Royal Works
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[
            { step: "1", title: "Choose a Room", desc: "Browse active rooms and pick a reward that interests you", icon: Crown },
            { step: "2", title: "Pay Entry Credits", desc: "Spend your credits to enter — no hidden fees ever", icon: Zap },
            { step: "3", title: "SPIN", desc: "Hit the spin button and let the mystery unfold", icon: Sparkles },
            { step: "4", title: "Claim Your Win", desc: "Wins go straight to your Profile → Store", icon: Trophy },
          ].map((s) => (
            <div key={s.step} className="flex flex-col items-center text-center gap-2">
              <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                <s.icon className="w-5 h-5 text-primary" />
              </div>
              <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-xs font-bold">{s.step}</div>
              <h4 className="font-semibold text-sm">{s.title}</h4>
              <p className="text-xs text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
