import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { useAskQuestion } from "@workspace/api-client-react";
import { ArrowLeft, Send } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const SUGGESTED_TAGS = [
  "mathematics",
  "physics",
  "biology",
  "chemistry",
  "computer-science",
  "spanish",
  "english",
  "statistics",
  "economics",
];

export default function QnAAsk() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const askQuestion = useAskQuestion();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  const addTag = (t: string) => {
    const tag = t.trim().toLowerCase().replace(/\s+/g, "-");
    if (!tag) return;
    if (tags.includes(tag)) return;
    if (tags.length >= 5) return;
    setTags([...tags, tag]);
    setTagInput("");
  };

  const removeTag = (t: string) => setTags(tags.filter((x) => x !== t));

  const canSubmit =
    title.trim().length >= 5 &&
    body.trim().length >= 10 &&
    tags.length > 0 &&
    !askQuestion.isPending;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    try {
      const created = await askQuestion.mutateAsync({
        data: { title: title.trim(), body: body.trim(), tags },
      });
      await queryClient.invalidateQueries({ queryKey: ["/api/qna/questions"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/gamification/me"] });
      toast({
        title: "Question posted",
        description: "You earned 5 points for asking.",
      });
      setLocation(`/qna/${created.id}`);
    } catch (err) {
      toast({
        title: "Could not post question",
        description: err instanceof Error ? err.message : "Try again in a moment.",
        variant: "destructive",
      });
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
      <header className="mb-8">
        <h1 className="font-serif text-4xl font-bold text-foreground mb-2">
          Ask a question
        </h1>
        <p className="text-muted-foreground">
          Be specific. The clearer your question, the better the answers.
        </p>
      </header>
      <Card>
        <CardContent className="p-6">
          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <Label htmlFor="title" className="mb-2 block">
                Title
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What's the question, in one sentence?"
                maxLength={200}
                data-testid="input-question-title"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {title.trim().length < 5
                  ? `At least 5 characters (${title.trim().length}/5)`
                  : `${title.length}/200`}
              </p>
            </div>
            <div>
              <Label htmlFor="body" className="mb-2 block">
                Details
              </Label>
              <Textarea
                id="body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={8}
                placeholder="Add what you've already tried, where you got stuck, and the result you expected."
                data-testid="input-question-body"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {body.trim().length < 10
                  ? `At least 10 characters (${body.trim().length}/10)`
                  : "Looks good."}
              </p>
            </div>
            <div>
              <Label htmlFor="tag-input" className="mb-2 block">
                Tags
              </Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => removeTag(t)}
                    className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-md hover-elevate"
                    data-testid={`chip-tag-${t}`}
                  >
                    {t.replace(/-/g, " ")} ×
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  id="tag-input"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag(tagInput);
                    }
                  }}
                  placeholder="e.g. calculus"
                  data-testid="input-tag"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addTag(tagInput)}
                  disabled={!tagInput.trim() || tags.length >= 5}
                  data-testid="button-add-tag"
                >
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="text-xs text-muted-foreground self-center">
                  Suggested:
                </span>
                {SUGGESTED_TAGS.filter((t) => !tags.includes(t))
                  .slice(0, 6)
                  .map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => addTag(t)}
                      className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-md hover-elevate"
                      data-testid={`suggest-tag-${t}`}
                    >
                      + {t.replace(/-/g, " ")}
                    </button>
                  ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Add 1–5 tags so the right people can find your question.
              </p>
            </div>
            <Button
              type="submit"
              disabled={!canSubmit}
              className="w-full"
              data-testid="button-submit-question"
            >
              <Send className="w-4 h-4 mr-2" />
              {askQuestion.isPending ? "Posting..." : "Post question"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
