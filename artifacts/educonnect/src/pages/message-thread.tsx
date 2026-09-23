import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "wouter";
import {
  useGetMessageThread,
  useSendMessage,
  useGetTutor,
} from "@workspace/api-client-react";
import { ChevronLeft, Send, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

export default function MessageThread() {
  const params = useParams();
  const tutorId = params.tutorId as string;
  const { data: tutor } = useGetTutor(tutorId);
  const { data: messages = [], isLoading, refetch } = useGetMessageThread(
    tutorId,
  );
  const sendMessage = useSendMessage();
  const { toast } = useToast();
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = setInterval(() => {
      refetch();
    }, 3000);
    return () => clearInterval(id);
  }, [refetch]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = draft.trim();
    if (!content) return;
    setDraft("");
    try {
      await sendMessage.mutateAsync({ tutorId, data: { content } });
      refetch();
    } catch (err) {
      toast({
        title: "Could not send",
        description: err instanceof Error ? err.message : "Try again.",
        variant: "destructive",
      });
      setDraft(content);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-6 h-[calc(100dvh-2rem)] flex flex-col">
      <Link
        href="/messages"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
        data-testid="link-back-messages"
      >
        <ChevronLeft className="w-4 h-4" /> All messages
      </Link>

      <header className="flex items-center gap-4 pb-4 border-b border-card-border mb-4">
        {tutor ? (
          <>
            <div className="relative">
              <img
                src={tutor.avatarUrl}
                alt={tutor.name}
                className="w-12 h-12 rounded-full object-cover bg-muted"
              />
              {tutor.isOnline && (
                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-card" />
              )}
            </div>
            <div className="flex-1">
              <div className="font-bold text-foreground">{tutor.name}</div>
              <div className="text-xs text-muted-foreground">
                {tutor.isOnline ? "Online now" : `Replies in ~${tutor.responseTimeMinutes}m`}
              </div>
            </div>
            <Link href={`/tutors/${tutor.id}`}>
              <Button variant="outline" size="sm" data-testid="button-view-profile">
                <CalendarIcon className="w-4 h-4 mr-2" />
                Book session
              </Button>
            </Link>
          </>
        ) : (
          <Skeleton className="h-12 w-full" />
        )}
      </header>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-3 pb-4"
        data-testid="messages-list"
      >
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-2/3 rounded-lg" />
          ))
        ) : messages.length === 0 ? (
          <div className="text-center text-muted-foreground py-12 text-sm">
            Start the conversation by saying hello.
          </div>
        ) : (
          messages.map((m) => {
            const isStudent = m.sender === "student";
            return (
              <div
                key={m.id}
                className={`flex ${isStudent ? "justify-end" : "justify-start"}`}
                data-testid={`message-${m.id}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                    isStudent
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-secondary text-secondary-foreground rounded-bl-sm"
                  }`}
                >
                  <p className="text-sm leading-relaxed">{m.content}</p>
                  <div
                    className={`text-[10px] mt-1 ${
                      isStudent
                        ? "text-primary-foreground/70"
                        : "text-secondary-foreground/60"
                    }`}
                  >
                    {new Date(m.createdAt).toLocaleTimeString(undefined, {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <form
        onSubmit={handleSend}
        className="flex gap-2 pt-3 border-t border-card-border"
      >
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={
            tutor
              ? `Message ${tutor.name
                  .split(/\s+/)
                  .filter((p) => !p.endsWith("."))[0] ?? tutor.name}…`
              : "Type a message…"
          }
          className="flex-1"
          data-testid="input-message"
        />
        <Button
          type="submit"
          disabled={!draft.trim() || sendMessage.isPending}
          data-testid="button-send-message"
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}
