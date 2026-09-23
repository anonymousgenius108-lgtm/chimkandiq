import { useState } from "react";
import { Link, useParams, useLocation } from "wouter";
import {
  useGetBooking,
  useUpdateBooking,
} from "@workspace/api-client-react";
import {
  Calendar as CalendarIcon,
  Clock,
  CreditCard,
  MessageSquare,
  ChevronLeft,
  X,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PaymentDialog } from "@/components/payment-dialog";
import {
  formatDate,
  formatTime,
  formatPrice,
  statusLabel,
  statusVariant,
} from "@/lib/format";
import { useToast } from "@/hooks/use-toast";

export default function BookingDetail() {
  const params = useParams();
  const bookingId = params.bookingId as string;
  const [, setLocation] = useLocation();
  const { data: booking, isLoading, refetch } = useGetBooking(bookingId);
  const update = useUpdateBooking();
  const { toast } = useToast();
  const [paymentOpen, setPaymentOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-10 space-y-4">
        <Skeleton className="h-12 w-1/3" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }
  if (!booking) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-20 text-center">
        <h1 className="font-serif text-2xl mb-2">Booking not found</h1>
        <Link href="/bookings" className="text-primary hover:underline">
          Back to bookings
        </Link>
      </div>
    );
  }

  const handleCancel = async () => {
    try {
      await update.mutateAsync({
        bookingId,
        data: { status: "cancelled" },
      });
      toast({
        title: "Session cancelled",
        description: "Your booking has been cancelled.",
      });
      refetch();
    } catch (err) {
      toast({
        title: "Could not cancel",
        description: err instanceof Error ? err.message : "Try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <button
        onClick={() => setLocation("/bookings")}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
        data-testid="button-back"
      >
        <ChevronLeft className="w-4 h-4" /> Back to bookings
      </button>

      <Card>
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row md:items-start gap-6 mb-6">
            <img
              src={booking.tutorAvatarUrl}
              alt={booking.tutorName}
              className="w-20 h-20 rounded-full object-cover bg-muted"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant={statusVariant(booking.status)}>
                  {statusLabel(booking.status)}
                </Badge>
              </div>
              <h1 className="font-serif text-3xl font-bold text-foreground mb-1">
                Session with {booking.tutorName}
              </h1>
              <p className="text-muted-foreground capitalize">
                {booking.subject.replace(/-/g, " ")}
              </p>
            </div>
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Total</div>
              <div className="text-2xl font-bold text-foreground">
                {formatPrice(booking.price)}
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm">
            <div>
              <dt className="text-xs uppercase text-muted-foreground mb-1 flex items-center gap-1">
                <CalendarIcon className="w-3 h-3" /> Date
              </dt>
              <dd className="font-medium">{formatDate(booking.startsAt)}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase text-muted-foreground mb-1 flex items-center gap-1">
                <Clock className="w-3 h-3" /> Time
              </dt>
              <dd className="font-medium">
                {formatTime(booking.startsAt)} – {formatTime(booking.endsAt)}{" "}
                <span className="text-muted-foreground">
                  ({booking.durationMinutes} min)
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase text-muted-foreground mb-1">
                Student
              </dt>
              <dd className="font-medium">{booking.studentName}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase text-muted-foreground mb-1">
                Booking ID
              </dt>
              <dd className="font-mono text-xs">{booking.id.slice(0, 8)}…</dd>
            </div>
          </dl>

          {booking.notes && (
            <>
              <Separator className="my-6" />
              <div>
                <h3 className="text-sm font-medium mb-2">Session notes</h3>
                <p className="text-sm text-foreground/80 bg-secondary/50 rounded-md p-3">
                  {booking.notes}
                </p>
              </div>
            </>
          )}

          <Separator className="my-6" />

          <div className="flex flex-wrap gap-3">
            {booking.status === "pending_payment" && (
              <Button
                onClick={() => setPaymentOpen(true)}
                data-testid="button-pay-now"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Complete payment
              </Button>
            )}
            {booking.status === "confirmed" && (
              <div className="flex items-center gap-2 text-sm text-foreground bg-green-500/10 text-green-700 dark:text-green-400 px-3 py-2 rounded-md">
                <CheckCircle2 className="w-4 h-4" />
                Payment received — your session is confirmed.
              </div>
            )}
            <Link href={`/messages/${booking.tutorId}`}>
              <Button variant="outline" data-testid="button-message">
                <MessageSquare className="w-4 h-4 mr-2" />
                Message tutor
              </Button>
            </Link>
            <Link href={`/tutors/${booking.tutorId}`}>
              <Button variant="ghost" data-testid="button-view-tutor">
                View tutor profile
              </Button>
            </Link>
            {(booking.status === "pending_payment" ||
              booking.status === "confirmed") && (
              <Button
                variant="ghost"
                onClick={handleCancel}
                disabled={update.isPending}
                className="text-destructive hover:text-destructive ml-auto"
                data-testid="button-cancel-booking"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel session
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <PaymentDialog
        bookingId={bookingId}
        amount={booking.price}
        open={paymentOpen}
        onOpenChange={setPaymentOpen}
        onPaid={() => refetch()}
      />
    </div>
  );
}
