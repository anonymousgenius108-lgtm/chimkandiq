import { useState } from "react";
import { Link } from "wouter";
import { useListCodelabProblems } from "@workspace/api-client-react";
import {
  Code2,
  CheckCircle2,
  Clock,
  Filter,
  Zap,
  BookOpen,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: "bg-emerald-100 text-emerald-800 border-emerald-200",
  medium: "bg-amber-100 text-amber-800 border-amber-200",
  hard: "bg-red-100 text-red-800 border-red-200",
};

const SUBJECT_ICONS: Record<string, string> = {
  Arrays: "🗂",
  Strings: "📝",
  Recursion: "🔄",
  Math: "🔢",
  "Dynamic Programming": "🧩",
  "Trees & Graphs": "🌳",
};

export default function Codelab() {
  const [difficulty, setDifficulty] = useState<string>("all");
  const [subject, setSubject] = useState<string>("all");

  const params: Record<string, string> = {};
  if (difficulty !== "all") params.difficulty = difficulty;
  if (subject !== "all") params.subject = subject;

  const { data: problems = [], isLoading } = useListCodelabProblems(params);

  const solved = problems.filter((p) => p.solvedByUser).length;
  const total = problems.length;
  const attempted = problems.filter((p) => p.attemptCount > 0 && !p.solvedByUser).length;

  const subjects = [...new Set(problems.map((p) => p.subject))].sort();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Code2 className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">CodeLab</h1>
        </div>
        <p className="text-muted-foreground">
          Practice coding problems with AI-powered hints and explanations.
        </p>
      </div>

      {/* Progress row */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="pt-5 pb-5">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-8 w-8 text-emerald-500" />
              <div>
                <div className="text-2xl font-bold">{solved}</div>
                <div className="text-xs text-muted-foreground">Solved</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-5">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-amber-500" />
              <div>
                <div className="text-2xl font-bold">{attempted}</div>
                <div className="text-xs text-muted-foreground">In Progress</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-5">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-primary" />
              <div>
                <div className="text-2xl font-bold">{total > 0 ? Math.round((solved / total) * 100) : 0}%</div>
                <div className="text-xs text-muted-foreground">Completion</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <Select value={difficulty} onValueChange={setDifficulty}>
          <SelectTrigger className="w-36">
            <Filter className="h-4 w-4 mr-1 opacity-50" />
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="easy">Easy</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="hard">Hard</SelectItem>
          </SelectContent>
        </Select>
        <Select value={subject} onValueChange={setSubject}>
          <SelectTrigger className="w-40">
            <BookOpen className="h-4 w-4 mr-1 opacity-50" />
            <SelectValue placeholder="Subject" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subjects</SelectItem>
            {subjects.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Problem list */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {problems.map((problem, idx) => (
            <Link key={problem.id} href={`/codelab/${problem.slug}`}>
              <Card className={`cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 ${problem.solvedByUser ? "border-emerald-200 bg-emerald-50/30" : ""}`}>
                <CardContent className="py-4 px-5">
                  <div className="flex items-center gap-4">
                    {/* Index / status */}
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-semibold">
                      {problem.solvedByUser ? (
                        <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                      ) : (
                        <span className="text-muted-foreground">{idx + 1}</span>
                      )}
                    </div>

                    {/* Title + tags */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{problem.title}</span>
                        {problem.attemptCount > 0 && !problem.solvedByUser && (
                          <Badge variant="outline" className="text-xs text-amber-600 border-amber-300 bg-amber-50">
                            In Progress
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-muted-foreground">
                          {SUBJECT_ICONS[problem.subject] ?? "💡"} {problem.subject}
                        </span>
                        {problem.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs px-2 py-0">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Difficulty */}
                    <Badge className={`text-xs border capitalize ${DIFFICULTY_COLORS[problem.difficulty] ?? ""}`} variant="outline">
                      {problem.difficulty}
                    </Badge>

                    {/* Attempt count */}
                    {problem.attemptCount > 0 && (
                      <span className="text-xs text-muted-foreground w-16 text-right">
                        {problem.attemptCount} attempt{problem.attemptCount !== 1 ? "s" : ""}
                      </span>
                    )}

                    {/* Solve CTA */}
                    <Button size="sm" variant={problem.solvedByUser ? "outline" : "default"} className="flex-shrink-0">
                      {problem.solvedByUser ? "Review" : "Solve"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}

          {problems.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Zap className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p>No problems match the selected filters.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
