import { useState } from "react";
import {
  useGetMyWallet,
  useRequestWithdraw,
  getGetMyWalletQueryKey,
  getGetMyGamificationQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Wallet as WalletIcon,
  Banknote,
  ArrowUpRight,
  ArrowDownLeft,
  TrendingUp,
  Calendar,
  Info,
  ShieldCheck,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { formatRelative } from "@/lib/format";

const KIND_LABEL: Record<string, string> = {
  ask_question: "Asked a question",
  post_answer: "Posted an answer",
  best_answer: "Best answer awarded",
  session_completed: "Session completed",
  upvote_received: "Upvote received",
  withdraw: "Withdrew to bank",
};

export default function WalletPage() {
  const { data, isLoading } = useGetMyWallet();
  const withdraw = useRequestWithdraw();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState<string>("");

  if (isLoading || !data) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-10">
        <Skeleton className="h-44 rounded-xl" />
      </div>
    );
  }

  const canWithdraw = data.withdrawableCredits >= data.minWithdrawCredits;
  const fmt = (n: number) => `${data.currency} ${n.toLocaleString()}`;

  function openDialog() {
    setAmount(String(data!.withdrawableCredits));
    setOpen(true);
  }

  function submit() {
    const n = Number(amount);
    if (!Number.isFinite(n) || n <= 0) {
      toast({ title: "Enter a valid amount", variant: "destructive" });
      return;
    }
    if (n > data!.withdrawableCredits) {
      toast({
        title: `Maximum is ${fmt(data!.withdrawableCredits)}`,
        variant: "destructive",
      });
      return;
    }
    withdraw.mutate(
      { data: { amount: Math.floor(n) } },
      {
        onSuccess: (res) => {
          setOpen(false);
          toast({
            title: "Withdrawal queued",
            description: res.message,
          });
          qc.invalidateQueries({ queryKey: getGetMyWalletQueryKey() });
          qc.invalidateQueries({ queryKey: getGetMyGamificationQueryKey() });
        },
        onError: (err: any) => {
          toast({
            title: "Withdrawal failed",
            description: err?.message ?? "Please try again",
            variant: "destructive",
          });
        },
      },
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <header className="mb-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-md bg-primary/10 text-primary flex items-center justify-center">
          <WalletIcon className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-serif text-3xl font-bold">Credits Wallet</h1>
          <p className="text-sm text-muted-foreground">
            Earn credits by asking, answering, and helping others. Withdraw once
            you cross {data.minWithdrawCredits}.
          </p>
        </div>
      </header>

      {/* Balance card */}
      <Card className="overflow-hidden">
        <div className="p-6 bg-gradient-to-br from-primary/15 to-primary/5">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <div className="text-sm text-muted-foreground">
                Available balance
              </div>
              <div
                className="font-serif text-4xl font-bold mt-1"
                data-testid="text-credit-balance"
              >
                {fmt(data.credits)}
              </div>
              <div className="flex items-center gap-3 mt-3 text-sm flex-wrap">
                <Badge variant="outline" className="font-normal">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +{fmt(data.creditsThisWeek)} this week
                </Badge>
                <Badge variant="outline" className="font-normal">
                  <Calendar className="w-3 h-3 mr-1" />
                  +{fmt(data.creditsThisMonth)} this month
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="lg"
                onClick={openDialog}
                disabled={!canWithdraw}
                data-testid="button-withdraw"
              >
                <Banknote className="w-4 h-4 mr-2" />
                Withdraw
              </Button>
            </div>
          </div>
          {!canWithdraw && (
            <div className="mt-4 text-xs text-muted-foreground flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5" />
              Earn at least {fmt(data.minWithdrawCredits)} to enable
              withdrawals.
            </div>
          )}
        </div>
      </Card>

      {/* History */}
      <div className="mt-8">
        <h2 className="font-bold text-lg mb-3">Credit history</h2>
        {data.history.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No credit activity yet.
            </CardContent>
          </Card>
        ) : (
          <Card>
            <div className="divide-y">
              {data.history.map((h) => {
                const isCredit = h.amount > 0;
                return (
                  <div
                    key={h.id}
                    className="px-5 py-3 flex items-center gap-3"
                    data-testid={`wallet-event-${h.id}`}
                  >
                    <div
                      className={`w-9 h-9 rounded-md flex items-center justify-center flex-shrink-0 ${
                        isCredit
                          ? "bg-green-500/10 text-green-700"
                          : "bg-amber-500/10 text-amber-700"
                      }`}
                    >
                      {isCredit ? (
                        <ArrowDownLeft className="w-4 h-4" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">
                        {KIND_LABEL[h.kind] ?? h.kind}
                      </div>
                      {h.reference && (
                        <div className="text-xs text-muted-foreground truncate">
                          {h.reference}
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground flex-shrink-0">
                      {formatRelative(h.occurredAt)}
                    </div>
                    <div
                      className={`font-bold tabular-nums ${
                        isCredit ? "text-green-700" : "text-amber-700"
                      }`}
                    >
                      {isCredit ? "+" : ""}
                      {h.amount}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Withdraw credits</DialogTitle>
            <DialogDescription>
              You can withdraw up to {fmt(data.withdrawableCredits)}. Demo only —
              no real money is moved.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <label className="text-sm font-medium">Amount ({data.currency})</label>
            <Input
              type="number"
              min={1}
              max={data.withdrawableCredits}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              data-testid="input-withdraw-amount"
            />
            <div className="flex items-start gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
              In production this would route through a verified payout
              partner. For this demo, the amount is simply deducted from your
              ledger.
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={submit}
              disabled={withdraw.isPending}
              data-testid="button-confirm-withdraw"
            >
              Confirm withdrawal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
