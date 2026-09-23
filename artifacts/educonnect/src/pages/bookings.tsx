import { useState } from "react";
import { Link } from "wouter";
import { useListBookings } from "@workspace/api-client-react";
import { Calendar as CalendarIcon, Clock, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  formatDateTime,
  formatPrice,
  statusLabel,
  statusVariant,
} from "@/lib/format";

export default function Bookings() {
  const [tab, setTab] = useState<"upcoming" | "completed" | "cancelled">(
    "upcoming",
  );
  const { data: bookings = [], isLoading } = useListBookings({ status: tab });

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <header className="mb-8">
        <h1 className="font-serif text-4xl font-bold text-foreground mb-2">
          My Bookings
        </h1>
        <p className="text-muted-foreground">
          Manage your sessions and review past lessons.
        </p>
      </header>

      <Tabs
        value={tab}
        onValueChange={(v) =>
          setTab(v as "upcoming" | "completed" | "cancelled")
        }
        className="w-full"
      >
        <TabsList>
          <TabsTrigger value="upcoming" data-testid="tab-upcoming">
            Upcoming
          </TabsTrigger>
          <TabsTrigger value="completed" data-testid="tab-completed">
            Completed
          </TabsTrigger>
          <TabsTrigger value="cancelled" data-testid="tab-cancelled">
            Cancelled
          </TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="mt-6">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-28 w-full rounded-lg" />
              ))}
            </div>
          ) : bookings.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <CalendarIcon className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                <h3 className="font-bold text-lg mb-1">
                  No {tab} sessions
                </h3>
                <p className="text-muted-foreground mb-4">
                  {tab === "upcoming"
                    ? "Book your next session to get started."
                    : tab === "completed"
                      ? "Your past sessions will appear here."
                      : "Cancelled sessions will appear here."}
                </p>
                <Link href="/tutors">
                  <Button data-testid="button-find-tutor">Find a tutor</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {bookings.map((b) => (
                <Link
                  key={b.id}
                  href={`/bookings/${b.id}`}
                  data-testid={`link-booking-${b.id}`}
                >
                  <Card className="hover-elevate active-elevate-2 cursor-pointer">
                    <CardContent className="p-5 flex items-center gap-4">
                      <img
                        src={b.tutorAvatarUrl}
                        alt={b.tutorName}
                        className="w-14 h-14 rounded-full object-cover bg-muted"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-bold text-foreground truncate">
                            {b.tutorName}
                          </span>
                          <Badge variant={statusVariant(b.status)}>
                            {statusLabel(b.status)}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground capitalize mb-1">
                          {b.subject.replace(/-/g, " ")}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <CalendarIcon className="w-3 h-3" />
                            {formatDateTime(b.startsAt)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {b.durationMinutes}m
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="font-bold text-foreground">
                          {formatPrice(b.price)}
                        </span>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
