import { useState, useEffect, useRef } from "react";
import { useParams, Link, useLocation } from "wouter";
import { useGetLuckyRoyalRoom, useSpinLuckyRoyal } from "@workspace/api-client-react";
import {
  Crown, ArrowLeft, Users, Clock, Sparkles, Trophy, Gift,
  Star, Zap, Share2, X, Check, RefreshCw, Coins
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

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
  if (h > 0) return `${h}h ${m}m ${s}s`;
  return `${m}m ${s}s`;
}

// Spinning wheel animation
const REEL_ITEMS = ["🏆", "⭐", "💰", "🎁", "💎", "🔥", "✨", "🎯", "🚀", "💡"];

function SpinWheel({ spinning }: { spinning: boolean }) {
  const [frame, setFrame] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (spinning) {
      let speed = 60;
      let elapsed = 0;
      const tick = () => {
        setFrame((f) => (f + 1) % REEL_ITEMS.length);
        elapsed += speed;
        if (elapsed > 2000) speed = Math.min(speed * 1.05, 300);
      };
      const run = () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = setInterval(() => { tick(); run(); }, speed);
      };
      run();
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [spinning]);

  return (
    <div className="relative w-48 h-48 mx-auto">
      {/* Outer ring */}
      <div className={`absolute inset-0 rounded-full border-4 ${spinning ? "border-amber-400 animate-spin" : "border-purple-500/50"} transition-colors duration-500`}
        style={{ animationDuration: "1s" }}
      />
      {/* Mid ring */}
      <div className={`absolute inset-3 rounded-full border-2 ${spinning ? "border-purple-400" : "border-white/10"} transition-colors`} />
      {/* Center */}
      <div className={`absolute inset-6 rounded-full flex items-center justify-center transition-all duration-300 ${
        spinning ? "bg-amber-500/20 shadow-lg shadow-amber-500/30 scale-110" : "bg-white/5"
      }`}>
        <span className="text-5xl select-none transition-none">{REEL_ITEMS[frame]}</span>
      </div>
      {/* Spinning particles */}
      {spinning && [...Array(6)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"
          style={{
            top: `${50 + 45 * Math.sin((i * 60 + frame * 20) * Math.PI / 180)}%`,
            left: `${50 + 45 * Math.cos((i * 60 + frame * 20) * Math.PI / 180)}%`,
            animationDuration: "0.6s",
          }}
        />
      ))}
    </div>
  );
}

// Win result types
const RESULT_CONFIG: Record<string, { emoji: string; color: string; bg: string; title: string; subtitle: string }> = {
  "win-full": {
    emoji: "🏆",
    color: "text-amber-400",
    bg: "from-amber-500/20 to-orange-500/20 border-amber-500/40",
    title: "JACKPOT!",
    subtitle: "You won the full reward!",
  },
  "win-credits": {
    emoji: "💰",
    color: "text-emerald-400",
    bg: "from-emerald-500/20 to-teal-500/20 border-emerald-500/40",
    title: "Credits Won!",
    subtitle: "Deposited to your wallet",
  },
  "win-cashback": {
    emoji: "🔄",
    color: "text-blue-400",
    bg: "from-blue-500/20 to-cyan-500/20 border-blue-500/40",
    title: "Cashback!",
    subtitle: "Entry cost returned",
  },
  "win-discount": {
    emoji: "🎁",
    color: "text-purple-400",
    bg: "from-purple-500/20 to-pink-500/20 border-purple-500/40",
    title: "Discount Unlocked!",
    subtitle: "20% off your next purchase",
  },
  "retry-bonus": {
    emoji: "⚡",
    color: "text-cyan-400",
    bg: "from-cyan-500/20 to-blue-500/20 border-cyan-500/40",
    title: "Retry Bonus!",
    subtitle: "Credits added — try again!",
  },
};

interface SpinResult {
  resultType: string;
  rewardLabel: string;
  rewardAmount: number;
  newBalance: number;
}

function WinPopup({ result, onClose, onShare }: { result: SpinResult; onClose: () => void; onShare: () => void }) {
  const cfg = RESULT_CONFIG[result.resultType] ?? RESULT_CONFIG["retry-bonus"];
  const isWin = result.resultType !== "retry-bonus";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      {/* Confetti particles */}
      {isWin && [...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 rounded-sm animate-bounce"
          style={{
            background: ["#f59e0b", "#a855f7", "#22c55e", "#3b82f6", "#ef4444"][i % 5],
            top: Math.random() * 100 + "%",
            left: Math.random() * 100 + "%",
            animationDuration: Math.random() * 1.5 + 0.5 + "s",
            animationDelay: Math.random() * 0.5 + "s",
            opacity: 0.7,
          }}
        />
      ))}

      <div className={`relative mx-4 w-full max-w-sm bg-gradient-to-br ${cfg.bg} border-2 rounded-3xl p-8 text-center shadow-2xl`}>
        <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        {/* Animated emoji */}
        <div className={`text-7xl mb-4 animate-bounce`} style={{ animationDuration: "0.8s" }}>
          {cfg.emoji}
        </div>

        <h2 className={`text-3xl font-black mb-1 ${cfg.color}`}>{cfg.title}</h2>
        <p className="text-white/70 text-sm mb-4">{cfg.subtitle}</p>

        {/* Reward label */}
        <div className="bg-black/30 rounded-2xl px-5 py-3 mb-5 border border-white/10">
          <p className="text-white font-bold text-lg">{result.rewardLabel}</p>
          {result.rewardAmount > 0 && (
            <p className="text-white/60 text-xs mt-1">New balance: {result.newBalance} credits</p>
          )}
        </div>

        {/* Win notice */}
        {result.resultType === "win-full" && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 mb-4">
            <div className="flex items-center gap-2 text-amber-300 text-xs">
              <Trophy className="w-3.5 h-3.5" />
              <span>Saved to Profile → Store → Lucky Royal Wins</span>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 border-white/20 text-white bg-transparent hover:bg-white/10"
            onClick={onShare}
          >
            <Share2 className="w-4 h-4 mr-2" /> Share
          </Button>
          <Button size="sm" className="flex-1" onClick={onClose}>
            <Check className="w-4 h-4 mr-2" /> Awesome!
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function LuckyRoyalRoom() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { data: room, isLoading } = useGetLuckyRoyalRoom(id ?? "");
  const spin = useSpinLuckyRoyal();
  const { toast } = useToast();
  const [spinning, setSpinning] = useState(false);
  const [spinResult, setSpinResult] = useState<SpinResult | null>(null);
  const [hasSpun, setHasSpun] = useState(false);
  const countdown = useCountdown(room?.endsAt ?? new Date(Date.now() + 86400000).toISOString());

  async function handleSpin() {
    if (!room || spinning) return;
    setSpinning(true);
    try {
      // Start animation immediately
      await new Promise((r) => setTimeout(r, 2800));
      const result = await spin.mutateAsync({ id: room.id });
      setSpinResult(result as SpinResult);
      setHasSpun(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Could not spin";
      toast({ title: "Spin failed", description: msg, variant: "destructive" });
    } finally {
      setSpinning(false);
    }
  }

  function handleShare() {
    navigator.clipboard.writeText(`${window.location.origin}/lucky-royal/${id}`);
    toast({ title: "Room link copied!", description: "Share with friends to invite them" });
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-[500px] rounded-2xl" />
          <Skeleton className="h-[500px] rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8 text-center py-20">
        <Crown className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p className="text-muted-foreground">Room not found</p>
        <Link href="/lucky-royal">
          <Button className="mt-4">Browse Rooms</Button>
        </Link>
      </div>
    );
  }

  const pct = Math.round((room.currentParticipants / room.maxParticipants) * 100);
  const spotsLeft = room.maxParticipants - room.currentParticipants;

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950 text-white">
        <div className="max-w-5xl mx-auto px-6 py-8">
          {/* Back nav */}
          <Link href="/lucky-royal">
            <button className="flex items-center gap-2 text-sm text-white/50 hover:text-white/80 transition-colors mb-6">
              <ArrowLeft className="w-4 h-4" /> Back to Lucky Royal
            </button>
          </Link>

          <div className="grid grid-cols-1 md:grid-cols-[1fr_380px] gap-6">
            {/* Left — Reward preview */}
            <div>
              {/* Lucky Royal badge */}
              <div className="flex items-center gap-2 mb-3">
                <Crown className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Lucky Royal Exclusive</span>
                {room.isFeatured && (
                  <Badge className="bg-amber-500 text-white border-0 text-[10px]">Featured</Badge>
                )}
              </div>

              <h1 className="text-2xl font-black mb-2">{room.title}</h1>
              <p className="text-white/60 text-sm mb-5">{room.description}</p>

              {/* Reward image */}
              <div className="relative rounded-2xl overflow-hidden mb-5 border border-white/10">
                {room.rewardImage ? (
                  <img src={room.rewardImage} alt={room.rewardTitle} className="w-full h-64 object-cover" />
                ) : (
                  <div className="w-full h-64 bg-white/5 flex items-center justify-center">
                    <Gift className="w-16 h-16 opacity-20" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <p className="text-xs text-white/60 mb-1">You could win</p>
                  <h3 className="font-black text-xl">{room.rewardTitle}</h3>
                </div>
              </div>

              {/* Possible outcomes teaser */}
              <div className="grid grid-cols-2 gap-2 mb-5">
                {[
                  { emoji: "🏆", label: "Full Reward" },
                  { emoji: "💰", label: "Credits" },
                  { emoji: "🎁", label: "Discount Coupon" },
                  { emoji: "⚡", label: "Retry Bonus" },
                ].map((o) => (
                  <div key={o.label} className="flex items-center gap-2 bg-white/5 rounded-xl p-3 border border-white/10">
                    <span className="text-xl">{o.emoji}</span>
                    <span className="text-sm text-white/70">{o.label}</span>
                  </div>
                ))}
              </div>

              {/* Creator */}
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
                {room.creatorAvatar && (
                  <img src={room.creatorAvatar} alt={room.creatorName} className="w-9 h-9 rounded-full" />
                )}
                <div>
                  <p className="text-xs text-white/50">Created by</p>
                  <p className="text-sm font-semibold">{room.creatorName}</p>
                </div>
                <Badge className="ml-auto bg-white/10 text-white border-0 text-[10px]">Verified Creator</Badge>
              </div>
            </div>

            {/* Right — Spin panel */}
            <div className="space-y-4">
              {/* Stats card */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-white/5 rounded-xl p-3">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Coins className="w-3.5 h-3.5 text-amber-400" />
                    </div>
                    <div className="text-lg font-black">{room.entryCredits}</div>
                    <div className="text-[10px] text-white/50">Entry Credits</div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3">
                    <div className="flex items-center justify-center mb-1">
                      <Clock className="w-3.5 h-3.5 text-purple-400" />
                    </div>
                    <div className="text-xs font-black leading-none mt-1">{countdown}</div>
                    <div className="text-[10px] text-white/50 mt-1">Remaining</div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3">
                    <div className="flex items-center justify-center mb-1">
                      <Users className="w-3.5 h-3.5 text-cyan-400" />
                    </div>
                    <div className="text-lg font-black">{room.currentParticipants}</div>
                    <div className="text-[10px] text-white/50">Players</div>
                  </div>
                </div>

                {/* Fill bar */}
                <div>
                  <div className="flex justify-between text-[10px] text-white/50 mb-1.5">
                    <span>{pct}% full</span>
                    <span>{spotsLeft} spots left</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${pct >= 80 ? "bg-amber-400" : "bg-primary"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Spin wheel */}
              <div className="bg-gradient-to-br from-slate-900 to-purple-950/40 border border-purple-500/20 rounded-2xl p-6 text-center">
                <div className="mb-2">
                  <Sparkles className="w-4 h-4 inline text-purple-400 mr-1" />
                  <span className="text-xs text-purple-300">AI-secured fair randomization</span>
                </div>

                <SpinWheel spinning={spinning} />

                <div className="mt-5">
                  {hasSpun ? (
                    <Button
                      variant="outline"
                      className="w-full border-white/20 text-white bg-transparent hover:bg-white/10 gap-2"
                      onClick={() => { setHasSpun(false); setSpinResult(null); }}
                      disabled={spinning}
                    >
                      <RefreshCw className="w-4 h-4" /> Spin Again ({room.entryCredits} cr)
                    </Button>
                  ) : (
                    <Button
                      size="lg"
                      className="w-full h-14 text-lg font-black bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black border-0 gap-2 shadow-lg shadow-amber-500/25 disabled:opacity-50"
                      onClick={handleSpin}
                      disabled={spinning || room.status !== "active"}
                    >
                      {spinning ? (
                        <>
                          <span className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                          Spinning…
                        </>
                      ) : (
                        <>
                          <Zap className="w-5 h-5" /> SPIN — {room.entryCredits} Credits
                        </>
                      )}
                    </Button>
                  )}
                </div>

                <p className="text-[10px] text-white/30 mt-3">
                  Entry cost is deducted when you spin. All results are final.
                </p>
              </div>

              {/* Share */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 border-white/20 text-white bg-transparent hover:bg-white/10 gap-2"
                  onClick={handleShare}
                >
                  <Share2 className="w-4 h-4" /> Invite Friends
                </Button>
                <Link href="/lucky-royal" className="flex-1">
                  <Button variant="ghost" size="sm" className="w-full text-white/50 hover:text-white gap-1">
                    <Crown className="w-4 h-4" /> All Rooms
                  </Button>
                </Link>
              </div>

              {/* Trust indicators */}
              <div className="flex flex-wrap gap-2">
                {[
                  { icon: Star, label: "Anti-cheat system" },
                  { icon: Sparkles, label: "AI fairness" },
                  { icon: Users, label: "Cooldown timers" },
                ].map((t) => (
                  <div key={t.label} className="flex items-center gap-1.5 bg-white/5 rounded-full px-3 py-1 text-[10px] text-white/50">
                    <t.icon className="w-3 h-3" />
                    {t.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Win popup */}
      {spinResult && (
        <WinPopup
          result={spinResult}
          onClose={() => setSpinResult(null)}
          onShare={handleShare}
        />
      )}
    </>
  );
}
