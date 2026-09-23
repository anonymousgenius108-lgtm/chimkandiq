import { useState } from "react";
import { Link } from "wouter";
import { useListQuestions } from "@workspace/api-client-react";
import {
  HelpCircle,
  MessageSquareReply,
  Plus,
  Search,
  CheckCircle2,
  ArrowUp,
  Eye,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { formatRelative } from "@/lib/format";

type Sort = "recent" | "top" | "unanswered";

export default function QnA() {
  const [sort, setSort] = useState<Sort>("recent");
  const [query, setQuery] = useState("");
  const { data: questions = [], isLoading } = useListQuestions({
    sort,
    q: query.trim() ? query.trim() : undefined,
  });

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-4xl font-bold text-foreground mb-2">
            Doubt Q&amp;A
          </h1>
          <p className="text-muted-foreground">
            Ask anything. Help others. Earn points along the way.
          </p>
        </div>
        <Link href="/qna/ask">
          <Button data-testid="button-ask-question">
            <Plus className="w-4 h-4 mr-2" />
            Ask a question
          </Button>
        </Link>
      </header>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search questions..."
            className="pl-9"
            data-testid="input-search-questions"
          />
        </div>
        <Tabs value={sort} onValueChange={(v) => setSort(v as Sort)}>
          <TabsList>
            <TabsTrigger value="recent" data-testid="tab-recent">Recent</TabsTrigger>
            <TabsTrigger value="top" data-testid="tab-top">Top</TabsTrigger>
            <TabsTrigger value="unanswered" data-testid="tab-unanswered">Unanswered</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-lg" />
          ))}
        </div>
      ) : questions.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <HelpCircle className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
            <h3 className="font-bold text-lg mb-1">No questions yet</h3>
            <p className="text-muted-foreground mb-4">
              Be the first to spark a discussion.
            </p>
            <Link href="/qna/ask">
              <Button data-testid="button-empty-ask">Ask a question</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {questions.map((q) => (
            <Link
              key={q.id}
              href={`/qna/${q.id}`}
              data-testid={`link-question-${q.id}`}
            >
              <Card className="cursor-pointer hover-elevate active-elevate-2">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <img
                      src={q.authorAvatarUrl}
                      alt={q.authorName}
                      className="w-10 h-10 rounded-full object-cover bg-muted flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-bold text-foreground line-clamp-1">
                          {q.title}
                        </h3>
                        {q.hasBestAnswer && (
                          <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-500/10 px-2 py-0.5 rounded">
                            <CheckCircle2 className="w-3 h-3" />
                            Resolved
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {q.excerpt}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                        <span>by {q.authorName}</span>
                        <span>·</span>
                        <span>{formatRelative(q.createdAt)}</span>
                        <span className="flex items-center gap-1">
                          <ArrowUp className="w-3 h-3" />
                          {q.voteCount}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquareReply className="w-3 h-3" />
                          {q.answerCount}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {q.viewCount}
                        </span>
                        <div className="flex items-center gap-1.5 ml-auto">
                          {q.tags.map((t) => (
                            <Badge
                              key={t}
                              variant="secondary"
                              className="text-[10px] capitalize"
                            >
                              {t.replace(/-/g, " ")}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
