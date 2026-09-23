import { useState } from "react";
import {
  useGetLeaderboard,
  useGetMyGamification,
  useListAllBadges,
} from "@workspace/api-client-react";
import {
  Trophy,
  Crown,
  Medal,
  Award,
  Flame,
  Sparkles,
  HelpCircle,
  MessageSquareReply,
  Library,
  Lightbulb,
  CalendarCheck,
  GraduationCap,
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

type Period = "daily" | "weekly" | "monthly" | "allTime";

const PERIOD_LABEL: Record<Period, string> = {
  daily: "Today",
  weekly: "This week",
  monthly: "This month",
  allTime: "All time",
};

const BADGE_ICONS: Record<string, LucideIcon> = {
  "help-circle": HelpCircle,
  "message-square-reply": MessageSquareReply,
  library: Library,
  lightbulb: Lightbulb,
  flame: Flame,
  "calendar-check": CalendarCheck,
  "graduation-cap": GraduationCap,
  trophy: Trophy,
};

const TIER_STYLES: Record<string, string> = {
  bronze: "bg-amber-100 text-amber-800 border-amber-300",
  silver: "bg-slate-100 text-slate-700 border-slate-300",
  gold: "bg-yellow-100 text-yellow-800 border-yellow-400",
};

function rankIcon(rank: number) {
  if (rank === 1) return <Crown className="w-5 h-5 text-yellow-500" />;
  if (rank === 2) return <Medal className="w-5 h-5 text-slate-400" />;
  if (rank === 3) return <Award className="w-5 h-5 text-amber-600" />;
  return null;
}

export default function Leaderboard() {
  const [period, setPeriod] = useState<Period>("weekly");
  const { data: rows = [], isLoading } = useGetLeaderboard({ period });
  const { data: me } = useGetMyGamification();
  const { data: allBadges = [] } = useListAllBadges();

  const earnedCodes = new Set((me?.badges ?? []).map((b) => b.code));

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <header className="mb-8">
        <h1 className="font-serif text-4xl font-bold text-foreground mb-2">
          Leaderboard
        </h1>
        <p className="text-muted-foreground">
          Earn points by asking questions, posting answers, completing sessions,
          and showing up daily.
        </p>
      </header>

      {me && (
        <Card className="mb-6 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="flex items-center gap-4 flex-1">
                <img
                  src={me.avatarUrl}
                  alt={me.userName}
                  className="w-16 h-16 rounded-full object-cover bg-muted ring-4 ring-primary/20"
                />
                <div>
                  <div className="text-sm text-muted-foreground">
                    Your standing
                  </div>
                  <div className="font-bold text-xl text-foreground">
                    {me.userName}
                  </div>
                  <div className="text-sm text-foreground/80">
                    {me.level.label} ·{" "}
                    <span className="font-medium">{me.points} pts</span> ·
                    Rank #{me.rankAllTime}
                  </div>
                </div>
              </div>
              <div className="flex-1 min-w-[220px]">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span>{me.level.label}</span>
                  <span>
                    {me.level.nextLevelPoints !== null
                      ? `${me.points} / ${me.level.nextLevelPoints}`
                      : "Max level"}
                  </span>
                </div>
                <Progress value={me.level.progressPct} />
                <div className="flex items-center gap-4 mt-3 text-xs">
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Sparkles className="w-3.5 h-3.5" /> Today: {me.pointsToday}
                  </span>
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Trophy className="w-3.5 h-3.5" /> Week: {me.pointsThisWeek}
                  </span>
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Flame className="w-3.5 h-3.5 text-orange-500" />
                    {me.currentStreak}-day streak
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs
        value={period}
        onValueChange={(v) => setPeriod(v as Period)}
        className="mb-4"
      >
        <TabsList>
          <TabsTrigger value="daily" data-testid="tab-period-daily">
            {PERIOD_LABEL.daily}
          </TabsTrigger>
          <TabsTrigger value="weekly" data-testid="tab-period-weekly">
            {PERIOD_LABEL.weekly}
          </TabsTrigger>
          <TabsTrigger value="monthly" data-testid="tab-period-monthly">
            {PERIOD_LABEL.monthly}
          </TabsTrigger>
          <TabsTrigger value="allTime" data-testid="tab-period-allTime">
            {PERIOD_LABEL.allTime}
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <Card className="mb-8">
        <CardContent className="p-2">
          {isLoading ? (
            <div className="p-4 space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-14 rounded-md" />
              ))}
            </div>
          ) : rows.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No activity yet for this period.
            </p>
          ) : (
            <ul>
              {rows.map((r) => (
                <li
                  key={r.userName}
                  className={`flex items-center gap-4 px-4 py-3 rounded-md ${
                    r.isMe ? "bg-primary/5" : ""
                  }`}
                  data-testid={`row-leader-${r.rank}`}
                >
                  <div className="w-8 flex items-center justify-center">
                    {rankIcon(r.rank) ?? (
                      <span className="text-sm font-bold text-muted-foreground">
                        {r.rank}
                      </span>
                    )}
                  </div>
                  <img
                    src={r.avatarUrl}
                    alt={r.userName}
                    className="w-10 h-10 rounded-full object-cover bg-muted"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-foreground flex items-center gap-2">
                      {r.userName}
                      {r.isMe && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-primary text-primary-foreground">
                          You
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {r.levelLabel}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-foreground">
                      {r.points}
                    </div>
                    <div className="text-xs text-muted-foreground">pts</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <h2 className="font-serif text-xl font-bold text-foreground mb-3">
        Badges
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {allBadges.map((b) => {
          const Icon = BADGE_ICONS[b.icon] ?? Trophy;
          const earned = earnedCodes.has(b.code);
          return (
            <Card
              key={b.code}
              className={earned ? "" : "opacity-60"}
              data-testid={`card-badge-${b.code}`}
            >
              <CardContent className="p-4 text-center">
                <div
                  className={`w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center border-2 ${
                    TIER_STYLES[b.tier] ?? "bg-secondary border-border"
                  }`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <div className="font-bold text-sm text-foreground">
                  {b.name}
                </div>
                <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {b.description}
                </div>
                {earned ? (
                  <div className="mt-2 text-[10px] uppercase tracking-wide font-bold text-green-700">
                    Earned
                  </div>
                ) : (
                  <div className="mt-2 text-[10px] uppercase tracking-wide font-medium text-muted-foreground">
                    Locked
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
