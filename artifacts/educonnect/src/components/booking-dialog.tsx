import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import {
  useGetTutorAvailability,
  useCreateBooking,
  type Tutor,
} from "@workspace/api-client-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

function firstName(name: string): string {
  const parts = name.split(/\s+/).filter((p) => !p.endsWith("."));
  return parts[0] ?? name;
}

function groupSlotsByDay(
  slots: { startsAt: string; endsAt: string }[],
): Record<string, { startsAt: string; endsAt: string }[]> {
  const grouped: Record<string, { startsAt: string; endsAt: string }[]> = {};
  for (const slot of slots) {
    const d = new Date(slot.startsAt);
    const key = d.toISOString().slice(0, 10);
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(slot);
  }
  return grouped;
}

interface Props {
  tutor: Tutor;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BookingDialog({ tutor, open, onOpenChange }: Props) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { data: slots = [], isLoading: loadingSlots } = useGetTutorAvailability(
    tutor.id,
  );
  const grouped = useMemo(() => groupSlotsByDay(slots), [slots]);
  const dayKeys = Object.keys(grouped).sort();
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [duration, setDuration] = useState<string>("60");
  const [subject, setSubject] = useState<string>(tutor.subjects[0] ?? "");
  const [studentName, setStudentName] = useState("Alex Morgan");
  const [notes, setNotes] = useState("");

  const createBooking = useCreateBooking();

  const activeDay = selectedDay ?? dayKeys[0] ?? null;
  const slotsForDay = activeDay ? (grouped[activeDay] ?? []) : [];
  const totalPrice =
    Number(tutor.hourlyRate) * (Number(duration) / 60);

  const handleConfirm = async () => {
    if (!selectedSlot) {
      toast({
        title: "Pick a time",
        description: "Choose an available slot to continue.",
        variant: "destructive",
      });
      return;
    }
    if (!subject) {
      toast({
        title: "Pick a subject",
        description: "Tell your tutor what you want to focus on.",
        variant: "destructive",
      });
      return;
    }
    try {
      const booking = await createBooking.mutateAsync({
        data: {
          tutorId: tutor.id,
          studentName,
          subject,
          startsAt: selectedSlot,
          durationMinutes: Number(duration),
          notes,
        },
      });
      toast({
        title: "Session reserved",
        description: "Now complete payment to confirm.",
      });
      onOpenChange(false);
      setLocation(`/bookings/${booking.id}`);
    } catch (err) {
      toast({
        title: "Booking failed",
        description: err instanceof Error ? err.message : "Try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">
            Book a session with {firstName(tutor.name)}
          </DialogTitle>
          <DialogDescription>
            Pick a time, choose your focus, and we'll lock it in.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div>
            <Label className="text-sm font-medium mb-2 block">
              Available days
            </Label>
            {loadingSlots ? (
              <Skeleton className="h-10 w-full" />
            ) : dayKeys.length === 0 ? (
              <div className="text-sm text-muted-foreground border border-dashed border-card-border rounded-md p-4 text-center">
                No upcoming availability — message {firstName(tutor.name)} to
                arrange a time.
              </div>
            ) : (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {dayKeys.slice(0, 7).map((day) => {
                  const d = new Date(day + "T00:00:00");
                  const isActive = day === activeDay;
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => {
                        setSelectedDay(day);
                        setSelectedSlot(null);
                      }}
                      className={`flex-shrink-0 px-4 py-2 rounded-md border text-center min-w-[80px] hover-elevate active-elevate-2 ${
                        isActive
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-card-border bg-card text-foreground"
                      }`}
                      data-testid={`button-day-${day}`}
                    >
                      <div className="text-xs uppercase opacity-80">
                        {d.toLocaleDateString(undefined, { weekday: "short" })}
                      </div>
                      <div className="font-bold">{d.getDate()}</div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {slotsForDay.length > 0 && (
            <div>
              <Label className="text-sm font-medium mb-2 block">Time</Label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {slotsForDay.map((slot) => {
                  const isActive = selectedSlot === slot.startsAt;
                  return (
                    <button
                      key={slot.startsAt}
                      type="button"
                      onClick={() => setSelectedSlot(slot.startsAt)}
                      className={`py-2 rounded-md border text-sm hover-elevate active-elevate-2 ${
                        isActive
                          ? "border-primary bg-primary text-primary-foreground font-medium"
                          : "border-card-border bg-card text-foreground"
                      }`}
                      data-testid={`button-slot-${slot.startsAt}`}
                    >
                      {new Date(slot.startsAt).toLocaleTimeString(undefined, {
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="duration" className="text-sm font-medium">
                Duration
              </Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger
                  id="duration"
                  className="mt-1"
                  data-testid="select-duration"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">60 minutes</SelectItem>
                  <SelectItem value="90">90 minutes</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="subject" className="text-sm font-medium">
                Focus subject
              </Label>
              <Select value={subject} onValueChange={setSubject}>
                <SelectTrigger
                  id="subject"
                  className="mt-1"
                  data-testid="select-booking-subject"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {tutor.subjects.map((s) => (
                    <SelectItem key={s} value={s} className="capitalize">
                      {s.replace(/-/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="studentName" className="text-sm font-medium">
              Your name
            </Label>
            <Input
              id="studentName"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              className="mt-1"
              data-testid="input-student-name"
            />
          </div>

          <div>
            <Label htmlFor="notes" className="text-sm font-medium">
              What do you want to focus on? (optional)
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. integration by parts, exam prep for next Monday..."
              rows={3}
              className="mt-1"
              data-testid="input-notes"
            />
          </div>

          <div className="bg-secondary/50 rounded-md p-4 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              <Calendar className="inline w-4 h-4 mr-1" />
              {selectedSlot
                ? new Date(selectedSlot).toLocaleString(undefined, {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })
                : "Select a time slot"}
            </div>
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Total</div>
              <div className="font-bold text-lg text-foreground">
                ₹{totalPrice.toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            data-testid="button-cancel-booking"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={createBooking.isPending}
            data-testid="button-confirm-booking"
          >
            {createBooking.isPending ? (
              "Reserving..."
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Reserve session
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
