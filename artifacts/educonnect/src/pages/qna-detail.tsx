import { useState } from "react";
import { Link, useRoute } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetQuestion,
  usePostAnswer,
  useVoteOnQuestion,
  useVoteOnAnswer,
  useMarkBestAnswer,
} from "@workspace/api-client-react";
import {
  ArrowLeft,
  ArrowUp,
  CheckCircle2,
  Eye,
  Send,
  Sparkles,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { formatRelative } from "@/lib/format";

const CURRENT_USER = "Alex Morgan";

export default function QnADetail() {
  const [, params] = useRoute("/qna/:questionId");
  const questionId = params?.questionId ?? "";
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data, isLoading, refetch } = useGetQuestion(questionId);
  const postAnswer = usePostAnswer();
  const voteQuestion = useVoteOnQuestion();
  const voteAnswer = useVoteOnAnswer();
  const markBest = useMarkBestAnswer();
  const [answerBody, setAnswerBody] = useState("");

  if (isLoading || !data) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-10 space-y-4">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-32 rounded-lg" />
        <Skeleton className="h-24 rounded-lg" />
      </div>
    );
  }

  const { question, answers } = data;
  const isMyQuestion = question.authorName === CURRENT_USER;

  const refresh = async () => {
    await refetch();
    await queryClient.invalidateQueries({ queryKey: ["/api/qna/questions"] });
    await queryClient.invalidateQueries({ queryKey: ["/api/gamification/me"] });
    await queryClient.invalidateQueries({ queryKey: ["/api/gamification/leaderboard"] });
  };

  const onUpvoteQuestion = async () => {
    try {
      await voteQuestion.mutateAsync({
        questionId: question.id,
        data: { value: 1 },
      });
      await refresh();
    } catch {
      toast({ title: "Could not record vote", variant: "destructive" });
    }
  };

  const onUpvoteAnswer = async (answerId: string) => {
    try {
      await voteAnswer.mutateAsync({ answerId, data: { value: 1 } });
      await refresh();
    } catch {
      toast({ title: "Could not record vote", variant: "destructive" });
    }
  };

  const onMarkBest = async (answerId: string) => {
    try {
      await markBest.mutateAsync({ answerId });
      await refresh();
      toast({
        title: "Marked as best answer",
        description: "The author received 25 points.",
      });
    } catch {
      toast({ title: "Could not update best answer", variant: "destructive" });
    }
  };

  const onPostAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (answerBody.trim().length < 5) return;
    try {
      await postAnswer.mutateAsync({
        questionId: question.id,
        data: { body: answerBody.trim() },
      });
      setAnswerBody("");
      await refresh();
      toast({
        title: "Answer posted",
        description: "You earned 10 points for helping out.",
      });
    } catch {
      toast({ title: "Could not post answer", variant: "destructive" });
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <Link href="/qna">
        <Button
          variant="ghost"
          size="sm"
          className="mb-4 -ml-2"
          data-testid="button-back-qna"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Q&amp;A
        </Button>
      </Link>

      <Card className="mb-6">
        <CardContent className="p-6">
          <h1
            className="font-serif text-3xl font-bold text-foreground mb-3"
            data-testid="text-question-title"
          >
            {question.title}
          </h1>
          <div className="flex items-center gap-3 mb-5">
            <img
              src={question.authorAvatarUrl}
              alt={question.authorName}
              className="w-9 h-9 rounded-full object-cover bg-muted"
            />
            <div className="text-sm">
              <div className="font-medium text-foreground">
                {question.authorName}
              </div>
              <div className="text-xs text-muted-foreground">
                Asked {formatRelative(question.createdAt)} ·{" "}
                <Eye className="inline w-3 h-3" /> {question.viewCount} views
              </div>
            </div>
          </div>
          <p className="text-foreground/90 whitespace-pre-line leading-relaxed mb-5">
            {question.body}
          </p>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex flex-wrap gap-1.5">
              {question.tags.map((t) => (
                <Badge
                  key={t}
                  variant="secondary"
                  className="text-xs capitalize"
                >
                  {t.replace(/-/g, " ")}
                </Badge>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onUpvoteQuestion}
              data-testid="button-upvote-question"
            >
              <ArrowUp className="w-4 h-4 mr-1" />
              Upvote · {question.voteCount}
            </Button>
          </div>
        </CardContent>
      </Card>

      <h2 className="font-serif text-xl font-bold text-foreground mb-3">
        {answers.length} {answers.length === 1 ? "Answer" : "Answers"}
      </h2>
      {answers.length === 0 ? (
        <Card className="mb-6">
          <CardContent className="py-12 text-center">
            <Sparkles className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">
              No answers yet. Be the first to help.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3 mb-8">
          {answers.map((a) => (
            <Card
              key={a.id}
              className={a.isBest ? "border-l-4 border-l-green-600" : ""}
              data-testid={`card-answer-${a.id}`}
            >
              <CardContent className="p-5">
                {a.isBest && (
                  <div className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-500/10 px-2 py-1 rounded mb-3">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Best answer
                  </div>
                )}
                <div className="flex items-start gap-3 mb-3">
                  <img
                    src={a.authorAvatarUrl}
                    alt={a.authorName}
                    className="w-9 h-9 rounded-full object-cover bg-muted"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-foreground text-sm">
                      {a.authorName}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatRelative(a.createdAt)}
                    </div>
                  </div>
                </div>
                <p className="text-foreground/90 whitespace-pre-line leading-relaxed mb-4">
                  {a.body}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onUpvoteAnswer(a.id)}
                    data-testid={`button-upvote-answer-${a.id}`}
                  >
                    <ArrowUp className="w-4 h-4 mr-1" />
                    {a.voteCount}
                  </Button>
                  {isMyQuestion && !a.isBest && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onMarkBest(a.id)}
                      data-testid={`button-mark-best-${a.id}`}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      Mark as best
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card>
        <CardContent className="p-6">
          <h3 className="font-serif text-lg font-bold mb-3">Your answer</h3>
          <form onSubmit={onPostAnswer} className="space-y-3">
            <Textarea
              value={answerBody}
              onChange={(e) => setAnswerBody(e.target.value)}
              rows={5}
              placeholder="Share what you know. Be clear and supportive."
              data-testid="input-answer-body"
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Earn 10 points for posting an answer.
              </p>
              <Button
                type="submit"
                disabled={
                  answerBody.trim().length < 5 || postAnswer.isPending
                }
                data-testid="button-submit-answer"
              >
                <Send className="w-4 h-4 mr-2" />
                {postAnswer.isPending ? "Posting..." : "Post answer"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
