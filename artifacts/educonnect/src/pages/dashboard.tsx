import { Link } from "wouter";
import {
  useGetDashboardSummary,
  useGetMyGamification,
} from "@workspace/api-client-react";
import {
  Calendar as CalendarIcon,
  Clock,
  DollarSign,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  Trophy,
  Flame,
  Sparkles,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";
import { formatPrice, formatDateTime, formatRelative } from "@/lib/format";

export default function Dashboard() {
  const { data, isLoading } = useGetDashboardSummary();
  const { data: me } = useGetMyGamification();

  if (isLoading || !data) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-10 space-y-4">
        <Skeleton className="h-12 w-1/3" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-lg" />
      </div>
    );
  }

  const stats = [
    {
      label: "Upcoming sessions",
      value: data.upcomingSessions,
      icon: CalendarIcon,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Hours learned",
      value: data.hoursLearned.toFixed(1),
      icon: Clock,
      color: "text-accent",
      bg: "bg-accent/10",
    },
    {
      label: "Sessions completed",
      value: data.completedSessions,
      icon: CheckCircle2,
      color: "text-green-600",
      bg: "bg-green-500/10",
    },
    {
      label: "Total invested",
      value: formatPrice(data.totalSpent),
      icon: DollarSign,
      color: "text-foreground",
      bg: "bg-secondary",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <header className="mb-8">
        <h1 className="font-serif text-4xl font-bold text-foreground mb-2">
          Welcome back, Alex
        </h1>
        <p className="text-muted-foreground">
          Here's your learning at a glance.
        </p>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-5">
              <div className={`inline-flex p-2 rounded-md ${s.bg} mb-3`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <div className="text-2xl font-bold text-foreground">
                {s.value}
              </div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {me && (
        <Card className="mb-8 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center gap-6">
              <div className="flex items-center gap-4 flex-1">
                <div className="p-3 rounded-md bg-primary/15 text-primary">
                  <Trophy className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">
                    Your level
                  </div>
                  <div className="font-bold text-2xl text-foreground">
                    {me.level.label}
                  </div>
                  <div className="text-sm text-foreground/80">
                    {me.points} points · Rank #{me.rankAllTime}
                  </div>
                </div>
              </div>
              <div className="flex-1 min-w-[220px]">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span>Progress to next level</span>
                  <span>
                    {me.level.nextLevelPoints !== null
                      ? `${me.points} / ${me.level.nextLevelPoints}`
                      : "Max level"}
                  </span>
                </div>
                <Progress value={me.level.progressPct} />
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> Today: {me.pointsToday}
                  </span>
                  <span className="flex items-center gap-1">
                    <Trophy className="w-3.5 h-3.5" /> Week: {me.pointsThisWeek}
                  </span>
                  <span className="flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-orange-500" />
                    {me.currentStreak}-day streak
                  </span>
                </div>
              </div>
              <Link href="/leaderboard">
                <Button variant="outline" size="sm" data-testid="button-view-leaderboard">
                  View leaderboard
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-serif text-xl font-bold">
                  Hours this week
                </h2>
                <p className="text-sm text-muted-foreground">
                  Your study cadence over the last 7 days.
                </p>
              </div>
              <TrendingUp className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.weeklyHours}>
                  <XAxis
                    dataKey="day"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--card-border))",
                      borderRadius: "0.5rem",
                      fontSize: "0.875rem",
                    }}
                    formatter={(value: number) => [`${value}h`, "Hours"]}
                  />
                  <Bar dataKey="hours" radius={[6, 6, 0, 0]}>
                    {data.weeklyHours.map((_, i) => (
                      <Cell
                        key={i}
                        fill={
                          i === data.weeklyHours.length - 1
                            ? "hsl(var(--accent))"
                            : "hsl(var(--primary))"
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h2 className="font-serif text-xl font-bold mb-4">
              Next session
            </h2>
            {data.nextSession ? (
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={data.nextSession.tutorAvatarUrl}
                    alt={data.nextSession.tutorName}
                    className="w-12 h-12 rounded-full object-cover bg-muted"
                  />
                  <div>
                    <div className="font-bold text-foreground">
                      {data.nextSession.tutorName}
                    </div>
                    <div className="text-xs text-muted-foreground capitalize">
                      {data.nextSession.subject.replace(/-/g, " ")}
                    </div>
                  </div>
                </div>
                <div className="text-sm text-foreground/80 mb-1">
                  <CalendarIcon className="inline w-3.5 h-3.5 mr-1 text-muted-foreground" />
                  {formatDateTime(data.nextSession.startsAt)}
                </div>
                <div className="text-xs text-muted-foreground mb-4">
                  {data.nextSession.durationMinutes} minute session
                </div>
                <Link href={`/bookings/${data.nextSession.id}`}>
                  <Button
                    size="sm"
                    className="w-full"
                    data-testid="button-view-next"
                  >
                    View details
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground mb-4">
                  No upcoming sessions.
                </p>
                <Link href="/tutors">
                  <Button size="sm" data-testid="button-find-tutor">
                    Find a tutor
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <h2 className="font-serif text-xl font-bold mb-4">
              Top subjects
            </h2>
            {data.topSubjects.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Complete sessions to see your favorite subjects here.
              </p>
            ) : (
              <div className="space-y-3">
                {data.topSubjects.map((s) => {
                  const max = Math.max(
                    ...data.topSubjects.map((x) => x.hours),
                  );
                  return (
                    <div key={s.subject}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="capitalize text-foreground">
                          {s.subject.replace(/-/g, " ")}
                        </span>
                        <span className="text-muted-foreground">
                          {s.hours}h
                        </span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{
                            width: `${max > 0 ? (s.hours / max) * 100 : 0}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-xl font-bold">
                Recent activity
              </h2>
              <Link
                href="/bookings"
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                All bookings <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            {data.recentActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No recent activity.
              </p>
            ) : (
              <ul className="space-y-3">
                {data.recentActivity.map((a) => (
                  <li
                    key={a.id}
                    className="flex items-start gap-3 text-sm pb-3 border-b border-card-border last:border-0"
                  >
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="text-foreground">{a.text}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatRelative(a.at)}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
