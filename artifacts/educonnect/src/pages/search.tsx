import { useEffect, useState } from "react";
import { Link, useLocation, useSearch } from "wouter";
import {
  useSearch as useSearchApi,
  getSearchQueryKey,
} from "@workspace/api-client-react";
import {
  Search as SearchIcon,
  Users,
  HelpCircle,
  Film,
  Tag,
  CheckCircle2,
  ArrowUp,
  MessageSquareReply,
  Eye,
  Play,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { formatRelative } from "@/lib/format";

export default function SearchPage() {
  const search = useSearch();
  const [, setLocation] = useLocation();
  const initialQ = new URLSearchParams(search).get("q") ?? "";
  const [input, setInput] = useState(initialQ);
  const [debounced, setDebounced] = useState(initialQ);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(input), 250);
    return () => clearTimeout(t);
  }, [input]);

  useEffect(() => {
    const url = debounced
      ? `/search?q=${encodeURIComponent(debounced)}`
      : `/search`;
    setLocation(url, { replace: true });
  }, [debounced, setLocation]);

  const q = debounced.trim();
  const enabled = q.length > 0;
  const { data, isFetching } = useSearchApi(
    { q },
    { query: { enabled, queryKey: getSearchQueryKey({ q }) } },
  );

  const userCount = data?.users.length ?? 0;
  const questionCount = data?.questions.length ?? 0;
  const reelCount = data?.reels.length ?? 0;
  const tagCount = data?.tags.length ?? 0;
  const totalCount = userCount + questionCount + reelCount + tagCount;

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <header className="mb-6">
        <h1 className="font-serif text-4xl font-bold text-foreground mb-2">
          Search
        </h1>
        <p className="text-muted-foreground">
          Find people, questions, reels, and topics across EduConnect.
        </p>
      </header>

      <div className="relative mb-6">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          autoFocus
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Search by name, topic, tag…"
          className="pl-10 h-12 text-base"
          data-testid="input-search-global"
        />
      </div>

      {!enabled ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            <SearchIcon className="w-10 h-10 mx-auto mb-3 opacity-50" />
            Type to search — try "calculus", "Carlos", or "spanish".
          </CardContent>
        </Card>
      ) : isFetching && !data ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
      ) : totalCount === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            No results for "{debounced}".
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all" data-testid="tab-all">
              All ({totalCount})
            </TabsTrigger>
            <TabsTrigger value="users" data-testid="tab-users">
              <Users className="w-4 h-4 mr-1.5" />
              People ({userCount})
            </TabsTrigger>
            <TabsTrigger value="questions" data-testid="tab-questions">
              <HelpCircle className="w-4 h-4 mr-1.5" />
              Questions ({questionCount})
            </TabsTrigger>
            <TabsTrigger value="reels" data-testid="tab-reels">
              <Film className="w-4 h-4 mr-1.5" />
              Reels ({reelCount})
            </TabsTrigger>
            <TabsTrigger value="tags" data-testid="tab-tags">
              <Tag className="w-4 h-4 mr-1.5" />
              Tags ({tagCount})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6 space-y-8">
            {userCount > 0 && (
              <Section title="People">
                {(data?.users ?? []).slice(0, 4).map((u) => (
                  <UserResult key={u.userName} u={u} />
                ))}
              </Section>
            )}
            {questionCount > 0 && (
              <Section title="Questions">
                {(data?.questions ?? []).slice(0, 4).map((q) => (
                  <QuestionResult key={q.id} q={q} />
                ))}
              </Section>
            )}
            {reelCount > 0 && (
              <Section title="Reels">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {(data?.reels ?? []).slice(0, 6).map((r) => (
                    <ReelResult key={r.id} r={r} />
                  ))}
                </div>
              </Section>
            )}
            {tagCount > 0 && (
              <Section title="Tags">
                <div className="flex flex-wrap gap-2">
                  {(data?.tags ?? []).map((t) => (
                    <TagResult key={t.tag} tag={t.tag} count={t.questionCount} />
                  ))}
                </div>
              </Section>
            )}
          </TabsContent>
          <TabsContent value="users" className="mt-6 space-y-3">
            {(data?.users ?? []).map((u) => (
              <UserResult key={u.userName} u={u} />
            ))}
          </TabsContent>
          <TabsContent value="questions" className="mt-6 space-y-3">
            {(data?.questions ?? []).map((q) => (
              <QuestionResult key={q.id} q={q} />
            ))}
          </TabsContent>
          <TabsContent value="reels" className="mt-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {(data?.reels ?? []).map((r) => (
                <ReelResult key={r.id} r={r} />
              ))}
            </div>
          </TabsContent>
          <TabsContent value="tags" className="mt-6">
            <div className="flex flex-wrap gap-2">
              {(data?.tags ?? []).map((t) => (
                <TagResult key={t.tag} tag={t.tag} count={t.questionCount} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="text-sm font-semibold text-muted-foreground mb-2">
        {title}
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function UserResult({ u }: { u: NonNullable<{ users: any[] }["users"][number]> }) {
  return (
    <Link href={`/profile/${encodeURIComponent(u.userName)}`}>
      <Card
        className="cursor-pointer hover-elevate active-elevate-2"
        data-testid={`result-user-${u.userName.replace(/\s+/g, "-")}`}
      >
        <CardContent className="p-4 flex items-center gap-3">
          <img
            src={u.avatarUrl}
            alt={u.displayName}
            className="w-12 h-12 rounded-full object-cover bg-muted flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="font-semibold truncate">{u.displayName}</div>
            <div className="text-xs text-muted-foreground truncate">
              {u.course} · {u.college}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {u.points.toLocaleString()} pts · {u.levelLabel}
            </div>
          </div>
          {u.isFollowedByMe && (
            <Badge variant="outline" className="text-[10px] flex-shrink-0">
              Following
            </Badge>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

function QuestionResult({ q }: { q: any }) {
  return (
    <Link href={`/qna/${q.id}`}>
      <Card
        className="cursor-pointer hover-elevate active-elevate-2"
        data-testid={`result-question-${q.id}`}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className="font-bold line-clamp-1">{q.title}</h3>
            {q.hasBestAnswer && (
              <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-500/10 px-2 py-0.5 rounded">
                <CheckCircle2 className="w-3 h-3" />
                Resolved
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
            {q.excerpt}
          </p>
          <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
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
              {q.tags.map((t: string) => (
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
        </CardContent>
      </Card>
    </Link>
  );
}

function ReelResult({ r }: { r: any }) {
  return (
    <Link href="/reels">
      <Card
        className="cursor-pointer hover-elevate active-elevate-2 overflow-hidden"
        data-testid={`result-reel-${r.id}`}
      >
        <div
          className="aspect-[9/16] bg-cover bg-center relative"
          style={{ backgroundImage: `url(${r.thumbnailUrl})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          <div className="absolute top-2 right-2">
            <span className="text-[10px] bg-black/70 text-white px-1.5 py-0.5 rounded">
              {Math.floor(r.durationSec / 60)}:
              {String(r.durationSec % 60).padStart(2, "0")}
            </span>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Play className="w-10 h-10 text-white/90 drop-shadow" />
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-2.5">
            <div className="text-white text-sm font-semibold line-clamp-2 drop-shadow">
              {r.title}
            </div>
            <div className="text-white/80 text-[11px] mt-0.5">
              {r.authorName}
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}

function TagResult({ tag, count }: { tag: string; count: number }) {
  return (
    <Link href={`/qna?tag=${encodeURIComponent(tag)}`}>
      <Badge
        variant="secondary"
        className="cursor-pointer text-sm py-1.5 px-3 capitalize hover-elevate"
        data-testid={`result-tag-${tag}`}
      >
        <Tag className="w-3 h-3 mr-1.5" />
        {tag.replace(/-/g, " ")}
        <span className="ml-1.5 text-muted-foreground">· {count}</span>
      </Badge>
    </Link>
  );
}
