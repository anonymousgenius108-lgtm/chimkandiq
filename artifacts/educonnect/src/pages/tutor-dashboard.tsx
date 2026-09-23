import { useState } from "react";
import {
  useGetTutorOverview,
  useListTutorStudents,
  useListTutorCourses,
  useGetTutorRevenue,
} from "@workspace/api-client-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Users,
  BookOpen,
  TrendingUp,
  Star,
  AlertTriangle,
  Info,
  AlertCircle,
  Flame,
  Target,
  Clock,
  CheckCircle2,
  Search,
  IndianRupee,
  LayoutDashboard,
  GraduationCap,
  ChevronDown,
  ChevronUp,
  Layers,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { formatRelative } from "@/lib/format";

// ── helpers ──────────────────────────────────────────────────────────────────
function fmtInr(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

function scoreColor(n: number) {
  if (n >= 75) return "text-green-700";
  if (n >= 50) return "text-amber-600";
  return "text-red-600";
}

function scoreBg(n: number) {
  if (n >= 75) return "bg-green-500/10 text-green-700";
  if (n >= 50) return "bg-amber-500/10 text-amber-600";
  return "bg-red-500/10 text-red-600";
}

function SkeletonPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
      <Skeleton className="h-36 rounded-xl" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-lg" />
        ))}
      </div>
      <Skeleton className="h-64 rounded-xl" />
    </div>
  );
}

// ── main page ─────────────────────────────────────────────────────────────────
export default function TutorDashboardPage() {
  const { data: overview, isLoading: ovLoading } = useGetTutorOverview();
  const { data: students = [], isLoading: stuLoading } = useListTutorStudents();
  const { data: courses = [], isLoading: crsLoading } = useListTutorCourses();
  const { data: revenue, isLoading: revLoading } = useGetTutorRevenue();

  const [studentSearch, setStudentSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState<string>("all");
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null);

  if (ovLoading || !overview) return <SkeletonPage />;

  const filteredStudents = students.filter((s) => {
    const matchSearch =
      !studentSearch ||
      s.studentName.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.courseTitle.toLowerCase().includes(studentSearch.toLowerCase());
    const matchCourse =
      courseFilter === "all" || s.courseId === courseFilter;
    return matchSearch && matchCourse;
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <img
          src={overview.avatarUrl}
          alt={overview.tutorName}
          className="w-16 h-16 rounded-full object-cover ring-2 ring-primary/30 flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="font-serif text-3xl font-bold">{overview.tutorName}</h1>
            <Badge variant="secondary" className="font-normal">
              <LayoutDashboard className="w-3 h-3 mr-1" />
              Tutor Command Center
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1 line-clamp-1">{overview.headline}</p>
          <div className="flex items-center gap-1 mt-1 text-sm text-amber-600">
            <Star className="w-4 h-4 fill-current" />
            <span className="font-bold">{overview.avgRating.toFixed(2)}</span>
            <span className="text-muted-foreground">
              · {overview.reviewCount} reviews
            </span>
          </div>
        </div>
      </div>

      {/* Smart Alerts */}
      {overview.alerts.length > 0 && (
        <div className="space-y-2" data-testid="alert-section">
          {overview.alerts.map((a, i) => {
            const Icon =
              a.severity === "critical"
                ? AlertCircle
                : a.severity === "warning"
                  ? AlertTriangle
                  : Info;
            const cls =
              a.severity === "critical"
                ? "border-red-300 bg-red-50 text-red-800"
                : a.severity === "warning"
                  ? "border-amber-300 bg-amber-50 text-amber-800"
                  : "border-blue-200 bg-blue-50 text-blue-800";
            return (
              <div
                key={i}
                className={`flex items-start gap-3 rounded-lg border px-4 py-3 text-sm ${cls}`}
                data-testid={`alert-${a.severity}-${i}`}
              >
                <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                {a.message}
              </div>
            );
          })}
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Students" value={overview.totalStudents} tone="primary" />
        <StatCard icon={BookOpen} label="Courses" value={overview.totalCourses} sub={`${courses.filter((c) => c.isPublished).length} published`} />
        <StatCard icon={GraduationCap} label="Total Sessions" value={overview.totalSessions.toLocaleString()} />
        <StatCard icon={IndianRupee} label="Total Revenue" value={fmtInr(overview.totalRevenue)} sub={`${fmtInr(overview.revenueThisMonth)} this month`} tone="success" />
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="overview">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="students" data-testid="tab-students">
            Students ({students.length})
          </TabsTrigger>
          <TabsTrigger value="courses" data-testid="tab-courses">
            Courses ({courses.length})
          </TabsTrigger>
          <TabsTrigger value="revenue" data-testid="tab-revenue">
            Revenue
          </TabsTrigger>
        </TabsList>

        {/* ── Overview Tab ─────────────────────────────────── */}
        <TabsContent value="overview" className="mt-6 grid lg:grid-cols-2 gap-6">
          {/* Revenue mini chart */}
          {revenue && (
            <Card>
              <CardContent className="p-5">
                <div className="font-bold mb-1">Monthly Revenue</div>
                <div className="text-2xl font-serif font-bold mb-4">
                  {fmtInr(revenue.thisMonth)}
                  <span className="text-sm font-normal text-muted-foreground ml-2">
                    this month
                  </span>
                </div>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={revenue.monthlyBreakdown} barSize={18}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip
                      formatter={(v: number) => fmtInr(v)}
                      contentStyle={{ fontSize: 12 }}
                    />
                    <Bar dataKey="sessions" name="Sessions" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="courses" name="Courses" fill="hsl(var(--primary) / 0.4)" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Top students by progress */}
          <Card>
            <CardContent className="p-5">
              <div className="font-bold mb-3">Top Students</div>
              <div className="space-y-3">
                {[...students]
                  .sort((a, b) => b.progressPct - a.progressPct)
                  .slice(0, 5)
                  .map((s) => (
                    <div key={s.id} className="flex items-center gap-3">
                      <img
                        src={s.studentAvatarUrl}
                        alt={s.studentName}
                        className="w-9 h-9 rounded-full object-cover bg-muted flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-medium truncate">{s.studentName}</span>
                          <span className="text-xs text-muted-foreground flex-shrink-0">{s.progressPct}%</span>
                        </div>
                        <Progress value={s.progressPct} className="h-1.5 mt-1" />
                        <div className="text-[11px] text-muted-foreground mt-0.5 truncate">{s.courseTitle}</div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Course performance summary */}
          <Card className="lg:col-span-2">
            <CardContent className="p-5">
              <div className="font-bold mb-3">Course Performance Snapshot</div>
              <div className="grid sm:grid-cols-3 gap-4">
                {courses.filter((c) => c.isPublished).map((c) => (
                  <div key={c.id} className="rounded-lg border p-4">
                    <div className="font-semibold text-sm line-clamp-2 mb-2">{c.title}</div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                      <span><Users className="inline w-3 h-3 mr-0.5" />{c.enrolledCount}</span>
                      <span><Target className="inline w-3 h-3 mr-0.5" />{c.avgProgress}% avg</span>
                      <span><Layers className="inline w-3 h-3 mr-0.5" />{c.chapterCount} chapters</span>
                    </div>
                    <Progress value={c.avgProgress} className="h-1.5 mt-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Students Tab ─────────────────────────────────── */}
        <TabsContent value="students" className="mt-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                placeholder="Search students…"
                className="pl-9"
                data-testid="input-student-search"
              />
            </div>
            <select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="border rounded-md px-3 py-2 text-sm bg-background"
              data-testid="select-course-filter"
            >
              <option value="all">All Courses</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>

          {stuLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)}
            </div>
          ) : filteredStudents.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground">No students found.</CardContent></Card>
          ) : (
            <Card>
              <div className="divide-y">
                {filteredStudents.map((s) => {
                  const isExpanded = expandedStudent === s.id;
                  return (
                    <div key={s.id} data-testid={`student-row-${s.studentName.replace(/\s+/g, "-")}`}>
                      <button
                        className="w-full px-5 py-3 flex items-center gap-3 hover:bg-muted/30 transition-colors text-left"
                        onClick={() => setExpandedStudent(isExpanded ? null : s.id)}
                      >
                        <img
                          src={s.studentAvatarUrl}
                          alt={s.studentName}
                          className="w-10 h-10 rounded-full object-cover bg-muted flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold">{s.studentName}</span>
                            <span className="text-xs text-muted-foreground truncate">{s.courseTitle}</span>
                            {s.weakTopics.length > 0 && (
                              <Badge variant="destructive" className="text-[10px]">Needs help</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground flex-wrap">
                            <span>Progress <b className="text-foreground">{s.progressPct}%</b></span>
                            <span>Quiz <b className={scoreColor(s.quizAvg)}>{s.quizAvg}%</b></span>
                            <span>Attendance <b className={scoreColor(s.attendancePct)}>{s.attendancePct}%</b></span>
                            <span className="flex items-center gap-1"><Flame className="w-3 h-3 text-amber-500" />{s.streakDays}d</span>
                            <span>Active {formatRelative(s.lastActiveAt)}</span>
                          </div>
                        </div>
                        <div className="flex-shrink-0 text-muted-foreground">
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                      </button>
                      {isExpanded && (
                        <div className="px-5 pb-4 bg-muted/20 grid sm:grid-cols-3 gap-4">
                          <MetricCell label="Quiz Average" value={`${s.quizAvg}%`} className={scoreBg(s.quizAvg)} />
                          <MetricCell label="Focus Score" value={`${s.focusScore}%`} className={scoreBg(s.focusScore)} />
                          <MetricCell label="Attendance" value={`${s.attendancePct}%`} className={scoreBg(s.attendancePct)} />
                          <div className="sm:col-span-3">
                            <div className="text-xs text-muted-foreground mb-1">Progress</div>
                            <Progress value={s.progressPct} className="h-2" />
                            <div className="text-xs mt-1">{s.progressPct}% complete</div>
                          </div>
                          {s.weakTopics.length > 0 && (
                            <div className="sm:col-span-3">
                              <div className="text-xs text-muted-foreground mb-1.5">Weak topics detected by AI</div>
                              <div className="flex flex-wrap gap-1.5">
                                {s.weakTopics.map((t) => (
                                  <Badge key={t} variant="destructive" className="font-normal text-xs">{t}</Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          <div className="sm:col-span-3 text-xs text-muted-foreground">
                            Enrolled {formatRelative(s.enrolledAt)} · Last active {formatRelative(s.lastActiveAt)}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          )}
        </TabsContent>

        {/* ── Courses Tab ─────────────────────────────────── */}
        <TabsContent value="courses" className="mt-6">
          {crsLoading ? (
            <div className="grid sm:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-52 rounded-lg" />)}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {courses.map((c) => (
                <Card key={c.id} className="overflow-hidden" data-testid={`course-${c.id}`}>
                  <div
                    className="h-32 bg-cover bg-center"
                    style={{ backgroundImage: `url(${c.thumbnailUrl})` }}
                  >
                    <div className="h-full bg-black/30 flex items-end p-3">
                      <Badge variant={c.isPublished ? "default" : "secondary"} className="text-[10px]">
                        {c.isPublished ? "Published" : "Draft"}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-bold line-clamp-2 mb-1">{c.title}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{c.description}</p>
                    <div className="flex items-center justify-between gap-2 text-xs flex-wrap mb-3">
                      <span className="flex items-center gap-1"><Layers className="w-3.5 h-3.5" />{c.chapterCount} chapters</span>
                      <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{c.enrolledCount} enrolled</span>
                      <span className="flex items-center gap-1"><IndianRupee className="w-3.5 h-3.5" />{c.priceInr.toLocaleString("en-IN")}</span>
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                        <span>Avg progress</span>
                        <span>{c.avgProgress}%</span>
                      </div>
                      <Progress value={c.avgProgress} className="h-1.5" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ── Revenue Tab ─────────────────────────────────── */}
        <TabsContent value="revenue" className="mt-6 space-y-6">
          {revLoading || !revenue ? (
            <Skeleton className="h-64 rounded-xl" />
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={IndianRupee} label="Total Earnings" value={fmtInr(revenue.totalEarnings)} tone="success" />
                <StatCard icon={TrendingUp} label="This Month" value={fmtInr(revenue.thisMonth)} sub={revenue.thisMonth >= revenue.lastMonth ? "up from last month" : "down from last month"} />
                <StatCard icon={GraduationCap} label="Session Revenue" value={fmtInr(revenue.sessionRevenue)} />
                <StatCard icon={BookOpen} label="Course Revenue" value={fmtInr(revenue.courseRevenue)} />
              </div>

              <Card>
                <CardContent className="p-5">
                  <div className="font-bold mb-4">Monthly Breakdown</div>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={revenue.monthlyBreakdown} barSize={22}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₹${v}`} />
                      <Tooltip formatter={(v: number) => fmtInr(v)} contentStyle={{ fontSize: 12 }} />
                      <Bar dataKey="sessions" name="Sessions" stackId="a" fill="hsl(var(--primary))" radius={[0, 0, 0, 0]} />
                      <Bar dataKey="courses" name="Courses" stackId="a" fill="hsl(var(--primary) / 0.4)" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-5">
                  <div className="font-bold mb-3">Recent Transactions</div>
                  <div className="divide-y -mx-5">
                    {revenue.recentTransactions.map((t) => (
                      <div key={t.id} className="px-5 py-3 flex items-center gap-3" data-testid={`tx-${t.id}`}>
                        <div className={`w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 ${t.kind === "session" ? "bg-blue-500/10 text-blue-700" : "bg-purple-500/10 text-purple-700"}`}>
                          {t.kind === "session" ? <Clock className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{t.description}</div>
                          <div className="text-xs text-muted-foreground">{formatRelative(t.occurredAt)}</div>
                        </div>
                        <div className="font-bold text-green-700 flex-shrink-0">{fmtInr(t.amount)}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ── sub-components ────────────────────────────────────────────────────────────
function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  tone,
}: {
  icon: typeof Users;
  label: string;
  value: string | number;
  sub?: string;
  tone?: "primary" | "success";
}) {
  const toneClass =
    tone === "primary"
      ? "bg-primary/10 text-primary"
      : tone === "success"
        ? "bg-green-500/10 text-green-700"
        : "bg-muted text-foreground";
  return (
    <Card data-testid={`stat-${label.toLowerCase().replace(/\s+/g, "-")}`}>
      <CardContent className="p-4">
        <div className={`w-9 h-9 rounded-md flex items-center justify-center ${toneClass}`}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="mt-2 text-2xl font-bold leading-none break-all">{value}</div>
        <div className="text-xs text-muted-foreground mt-1">{label}</div>
        {sub && <div className="text-[11px] text-muted-foreground">{sub}</div>}
      </CardContent>
    </Card>
  );
}

function MetricCell({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className: string;
}) {
  return (
    <div className={`rounded-md px-3 py-2 ${className}`}>
      <div className="text-[10px] font-medium uppercase tracking-wide opacity-70">{label}</div>
      <div className="text-lg font-bold">{value}</div>
    </div>
  );
}

// Suppress unused icon imports
void [CheckCircle2];
