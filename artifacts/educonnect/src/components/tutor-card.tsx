import { Link } from "wouter";
import { Star, MapPin, Clock } from "lucide-react";
import type { TutorSummary } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function TutorCard({ tutor }: { tutor: TutorSummary }) {
  return (
    <Link
      href={`/tutors/${tutor.id}`}
      data-testid={`link-tutor-${tutor.id}`}
    >
      <Card className="h-full hover-elevate active-elevate-2 cursor-pointer overflow-hidden border-card-border">
        <div className="h-24 bg-gradient-to-br from-primary/10 to-accent/10 relative">
          <img
            src={tutor.avatarUrl}
            alt={tutor.name}
            className="absolute -bottom-10 left-6 w-20 h-20 rounded-full border-4 border-card object-cover bg-muted"
          />
          <div className="absolute top-3 right-3 bg-card/95 backdrop-blur-sm px-2 py-1 rounded text-sm font-medium flex items-center gap-1 text-foreground">
            <Star className="w-3 h-3 fill-accent text-accent" />
            {tutor.rating.toFixed(2)}
          </div>
          {tutor.isOnline && (
            <div className="absolute top-3 left-3">
              <Badge variant="secondary" className="text-xs gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                Online now
              </Badge>
            </div>
          )}
        </div>
        <CardContent className="pt-12 pb-5 px-5">
          <h3 className="font-bold text-lg text-foreground line-clamp-1">
            {tutor.name}
          </h3>
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2 min-h-[2.5rem]">
            {tutor.headline}
          </p>

          <div className="flex flex-wrap gap-1 mb-3">
            {tutor.subjects.slice(0, 3).map((s) => (
              <Badge key={s} variant="outline" className="text-xs capitalize">
                {s.replace(/-/g, " ")}
              </Badge>
            ))}
          </div>

          <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {tutor.location}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {tutor.yearsExperience}y exp
            </span>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-card-border">
            <span className="font-bold text-foreground">
              ₹{tutor.hourlyRate}
              <span className="text-sm font-normal text-muted-foreground">
                /hr
              </span>
            </span>
            <span className="text-xs text-muted-foreground">
              {tutor.reviewCount} reviews
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
