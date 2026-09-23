import { useState } from "react";
import { Link, useParams } from "wouter";
import {
  useGetTutor,
  useListTutorReviews,
} from "@workspace/api-client-react";
import {
  Star,
  MapPin,
  Clock,
  Award,
  Globe,
  MessageSquare,
  Calendar as CalendarIcon,
  GraduationCap,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { BookingDialog } from "@/components/booking-dialog";
import { ReviewForm } from "@/components/review-form";

const DAY_NAMES: Record<string, string> = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
};

function firstName(name: string): string {
  const parts = name.split(/\s+/).filter((p) => !p.endsWith("."));
  return parts[0] ?? name;
}

function fmtHour(h: number): string {
  if (h === 0) return "12 AM";
  if (h < 12) return `${h} AM`;
  if (h === 12) return "12 PM";
  return `${h - 12} PM`;
}

export default function TutorDetail() {
  const params = useParams();
  const tutorId = params.tutorId as string;
  const { data: tutor, isLoading } = useGetTutor(tutorId);
  const { data: reviews = [] } = useListTutorReviews(tutorId);
  const [bookingOpen, setBookingOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-10 space-y-4">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }
  if (!tutor) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-20 text-center">
        <h1 className="font-serif text-2xl mb-2">Tutor not found</h1>
        <Link
          href="/tutors"
          className="text-primary hover:underline"
          data-testid="link-back-to-tutors"
        >
          Browse all tutors
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <Link
        href="/tutors"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
        data-testid="link-back"
      >
        <ChevronLeft className="w-4 h-4" /> Back to tutors
      </Link>

      <div className="bg-gradient-to-br from-primary/10 via-card to-accent/10 rounded-2xl p-6 md:p-8 mb-8 border border-card-border">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="relative">
            <img
              src={tutor.avatarUrl}
              alt={tutor.name}
              className="w-32 h-32 rounded-full object-cover border-4 border-card shadow-md"
              data-testid="img-tutor-avatar"
            />
            {tutor.isOnline && (
              <span className="absolute bottom-2 right-2 w-4 h-4 rounded-full bg-green-500 border-2 border-card" />
            )}
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1
                className="font-serif text-3xl md:text-4xl font-bold text-foreground"
                data-testid="text-tutor-name"
              >
                {tutor.name}
              </h1>
              <div className="flex items-center gap-1 px-2 py-1 bg-card rounded-md border border-card-border">
                <Star className="w-4 h-4 fill-accent text-accent" />
                <span className="font-medium">{tutor.rating.toFixed(2)}</span>
                <span className="text-sm text-muted-foreground">
                  ({tutor.reviewCount})
                </span>
              </div>
            </div>
            <p className="text-lg text-muted-foreground mb-4">
              {tutor.headline}
            </p>
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground mb-4">
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {tutor.location}
              </span>
              <span className="flex items-center gap-1">
                <Award className="w-4 h-4" />
                {tutor.yearsExperience} years experience
              </span>
              <span className="flex items-center gap-1">
                <Globe className="w-4 h-4" />
                {tutor.languages.join(", ")}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Replies in ~{tutor.responseTimeMinutes}m
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {tutor.subjects.map((s) => (
                <Badge key={s} variant="secondary" className="capitalize">
                  {s.replace(/-/g, " ")}
                </Badge>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-3 md:items-end w-full md:w-auto">
            <div className="text-right">
              <div className="text-3xl font-bold text-foreground">
                ₹{tutor.hourlyRate}
                <span className="text-base font-normal text-muted-foreground">
                  /hr
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                {tutor.totalSessions} sessions taught
              </div>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <Link href={`/messages/${tutor.id}`} className="flex-1 md:flex-initial">
                <Button
                  variant="outline"
                  className="w-full"
                  data-testid="button-message-tutor"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Message
                </Button>
              </Link>
              <Button
                onClick={() => setBookingOpen(true)}
                className="flex-1 md:flex-initial"
                data-testid="button-book-session"
              >
                <CalendarIcon className="w-4 h-4 mr-2" />
                Book session
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="about" className="w-full">
        <TabsList>
          <TabsTrigger value="about" data-testid="tab-about">
            About
          </TabsTrigger>
          <TabsTrigger value="availability" data-testid="tab-availability">
            Availability
          </TabsTrigger>
          <TabsTrigger value="reviews" data-testid="tab-reviews">
            Reviews ({reviews.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="about" className="mt-6">
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardContent className="pt-6">
                <h2 className="font-serif text-xl font-bold mb-3">
                  About {firstName(tutor.name)}
                </h2>
                <p className="text-foreground/80 leading-relaxed whitespace-pre-line">
                  {tutor.bio}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <div className="flex items-center gap-2 text-sm font-medium mb-1">
                    <GraduationCap className="w-4 h-4 text-primary" />
                    Education
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {tutor.education}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium mb-1">Languages</div>
                  <div className="text-sm text-muted-foreground">
                    {tutor.languages.join(", ")}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium mb-1">Total sessions</div>
                  <div className="text-sm text-muted-foreground">
                    {tutor.totalSessions}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium mb-1">Avg response</div>
                  <div className="text-sm text-muted-foreground">
                    {tutor.responseTimeMinutes} minutes
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="availability" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <h2 className="font-serif text-xl font-bold mb-4">
                Weekly availability
              </h2>
              {tutor.availability.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  No regular hours posted. Send a message to arrange a time.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {tutor.availability.map((a, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between border border-card-border rounded-md p-3"
                    >
                      <span className="font-medium">
                        {DAY_NAMES[a.day] ?? a.day}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {fmtHour(a.startHour)} – {fmtHour(a.endHour)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              <Button
                onClick={() => setBookingOpen(true)}
                className="mt-6"
                data-testid="button-book-from-availability"
              >
                <CalendarIcon className="w-4 h-4 mr-2" />
                Pick a time and book
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews" className="mt-6">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              {reviews.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center text-muted-foreground">
                    No reviews yet. Be the first to review.
                  </CardContent>
                </Card>
              ) : (
                reviews.map((r) => (
                  <Card key={r.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <img
                          src={r.studentAvatarUrl}
                          alt={r.studentName}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-foreground">
                              {r.studentName}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(r.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex gap-0.5 mb-2">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3.5 h-3.5 ${
                                  i < r.rating
                                    ? "fill-accent text-accent"
                                    : "text-muted-foreground/40"
                                }`}
                              />
                            ))}
                          </div>
                          <p className="text-sm text-foreground/80">
                            {r.comment}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-serif text-lg font-bold mb-3">
                  Leave a review
                </h3>
                <ReviewForm tutorId={tutor.id} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <BookingDialog
        tutor={tutor}
        open={bookingOpen}
        onOpenChange={setBookingOpen}
      />
    </div>
  );
}
