import { useState } from "react";
import { Star } from "lucide-react";
import { useCreateTutorReview } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export function ReviewForm({ tutorId }: { tutorId: string }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [studentName, setStudentName] = useState("Alex Morgan");
  const { toast } = useToast();
  const createReview = useCreateTutorReview();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast({
        title: "Add a comment",
        description: "Tell others what your experience was like.",
        variant: "destructive",
      });
      return;
    }
    try {
      await createReview.mutateAsync({
        tutorId,
        data: { studentName, rating, comment },
      });
      toast({
        title: "Review posted",
        description: "Thanks for sharing your feedback.",
      });
      setComment("");
      setRating(5);
    } catch (err) {
      toast({
        title: "Could not post review",
        description: err instanceof Error ? err.message : "Try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label className="text-sm font-medium mb-2 block">Your rating</Label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              className="p-1 hover-elevate rounded"
              data-testid={`button-rating-${n}`}
            >
              <Star
                className={`w-6 h-6 ${
                  n <= rating
                    ? "fill-accent text-accent"
                    : "text-muted-foreground"
                }`}
              />
            </button>
          ))}
        </div>
      </div>
      <div>
        <Label htmlFor="reviewName" className="text-sm font-medium">
          Your name
        </Label>
        <Input
          id="reviewName"
          value={studentName}
          onChange={(e) => setStudentName(e.target.value)}
          className="mt-1"
          data-testid="input-review-name"
        />
      </div>
      <div>
        <Label htmlFor="reviewComment" className="text-sm font-medium">
          Your experience
        </Label>
        <Textarea
          id="reviewComment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="What did you learn? How was the tutor's style?"
          rows={4}
          className="mt-1"
          data-testid="input-review-comment"
        />
      </div>
      <Button
        type="submit"
        disabled={createReview.isPending}
        data-testid="button-submit-review"
      >
        {createReview.isPending ? "Posting..." : "Post review"}
      </Button>
    </form>
  );
}
