import { Link } from "wouter";
import { useListMessageThreads } from "@workspace/api-client-react";
import { MessageSquare, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { formatRelative } from "@/lib/format";

export default function Messages() {
  const { data: threads = [], isLoading } = useListMessageThreads();

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <header className="mb-8">
        <h1 className="font-serif text-4xl font-bold text-foreground mb-2">
          Messages
        </h1>
        <p className="text-muted-foreground">
          Chat with your tutors before and between sessions.
        </p>
      </header>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      ) : threads.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <MessageSquare className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
            <h3 className="font-bold text-lg mb-1">No conversations yet</h3>
            <p className="text-muted-foreground mb-4">
              Start chatting from any tutor's profile.
            </p>
            <Link href="/tutors">
              <Button data-testid="button-browse-tutors">Browse tutors</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {threads.map((t) => (
            <Link
              key={t.tutorId}
              href={`/messages/${t.tutorId}`}
              data-testid={`link-thread-${t.tutorId}`}
            >
              <Card className="hover-elevate active-elevate-2 cursor-pointer">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="relative flex-shrink-0">
                    <img
                      src={t.tutorAvatarUrl}
                      alt={t.tutorName}
                      className="w-12 h-12 rounded-full object-cover bg-muted"
                    />
                    {t.isOnline && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-card" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-bold text-foreground truncate">
                        {t.tutorName}
                      </span>
                      <span className="text-xs text-muted-foreground flex-shrink-0">
                        {formatRelative(t.lastMessageAt)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {t.lastMessage}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
