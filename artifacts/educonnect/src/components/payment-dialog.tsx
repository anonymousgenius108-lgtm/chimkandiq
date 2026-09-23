import { useState } from "react";
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
import { CreditCard, Lock, CheckCircle2 } from "lucide-react";
import { usePayForBooking } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";

interface Props {
  bookingId: string;
  amount: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPaid: () => void;
}

export function PaymentDialog({
  bookingId,
  amount,
  open,
  onOpenChange,
  onPaid,
}: Props) {
  const [cardNumber, setCardNumber] = useState("4242 4242 4242 4242");
  const [expiry, setExpiry] = useState("12/28");
  const [cvc, setCvc] = useState("123");
  const [name, setName] = useState("Alex Morgan");
  void cvc;
  const pay = usePayForBooking();
  const { toast } = useToast();

  const handlePay = async () => {
    if (!cardNumber || !expiry || !cvc) {
      toast({
        title: "Missing details",
        description: "Fill in all card fields.",
        variant: "destructive",
      });
      return;
    }
    try {
      const digits = cardNumber.replace(/\D/g, "");
      const result = await pay.mutateAsync({
        bookingId,
        data: {
          cardholderName: name,
          cardLast4: digits.slice(-4),
          expiry,
        },
      });
      toast({
        title: "Payment successful",
        description: `Receipt ${result.receiptId} — your session is confirmed.`,
      });
      onOpenChange(false);
      onPaid();
    } catch (err) {
      toast({
        title: "Payment failed",
        description: err instanceof Error ? err.message : "Try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-primary" />
            Complete payment
          </DialogTitle>
          <DialogDescription>
            Demo checkout — no real charge. Pre-filled with a test card.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <Label htmlFor="cardName" className="text-sm font-medium">
              Name on card
            </Label>
            <Input
              id="cardName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1"
              data-testid="input-card-name"
            />
          </div>
          <div>
            <Label htmlFor="cardNumber" className="text-sm font-medium">
              Card number
            </Label>
            <Input
              id="cardNumber"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              className="mt-1 font-mono"
              data-testid="input-card-number"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="expiry" className="text-sm font-medium">
                Expiry
              </Label>
              <Input
                id="expiry"
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                className="mt-1 font-mono"
                data-testid="input-card-expiry"
              />
            </div>
            <div>
              <Label htmlFor="cvc" className="text-sm font-medium">
                CVC
              </Label>
              <Input
                id="cvc"
                value={cvc}
                onChange={(e) => setCvc(e.target.value)}
                className="mt-1 font-mono"
                data-testid="input-card-cvc"
              />
            </div>
          </div>
          <div className="bg-secondary/50 rounded-md p-3 flex items-center justify-between">
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Lock className="w-3.5 h-3.5" />
              Total to pay
            </span>
            <span className="font-bold text-lg text-foreground">
              ₹{amount.toFixed(2)}
            </span>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            data-testid="button-cancel-payment"
          >
            Cancel
          </Button>
          <Button
            onClick={handlePay}
            disabled={pay.isPending}
            data-testid="button-confirm-payment"
          >
            {pay.isPending ? (
              "Processing..."
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Pay ₹{amount.toFixed(2)}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
