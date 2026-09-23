import { useParams, Link } from "wouter";
import { useGetMarketplaceItem, usePurchaseMarketplaceItem } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft, Star, Download, ShoppingCart, Tag,
  Check, Package, Share2, Flame
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

const FILE_TYPE_ICONS: Record<string, string> = {
  pdf: "📄",
  zip: "🗜️",
  template: "📐",
};

export default function MarketplaceItem() {
  const { id } = useParams<{ id: string }>();
  const { data: item, isLoading } = useGetMarketplaceItem(Number(id));
  const purchaseMutation = usePurchaseMarketplaceItem();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  async function handlePurchase() {
    try {
      const result = await purchaseMutation.mutateAsync({ id: Number(id) });
      toast({
        title: item?.isFree ? "Added to Library!" : "Purchase Successful!",
        description: result.message,
      });
      void queryClient.invalidateQueries({ queryKey: ["/wallet/me"] });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Purchase failed";
      toast({ title: "Purchase Failed", description: message, variant: "destructive" });
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        <Skeleton className="h-8 w-32" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-4">
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-40 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!item) return <div className="p-8 text-center text-muted-foreground">Item not found</div>;

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
      <Link href="/marketplace">
        <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Marketplace
        </button>
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left — Details */}
        <div className="md:col-span-2 space-y-6">
          {/* Preview Image */}
          {item.previewUrl ? (
            <div className="h-56 rounded-2xl overflow-hidden border">
              <img src={item.previewUrl} alt={item.title} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="h-56 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border flex items-center justify-center">
              <span className="text-7xl">{FILE_TYPE_ICONS[item.fileType] ?? "📦"}</span>
            </div>
          )}

          {/* Title & Creator */}
          <div>
            {item.isFeatured && (
              <div className="flex items-center gap-1.5 text-amber-600 text-sm font-medium mb-2">
                <Flame className="w-4 h-4" /> Featured Item
              </div>
            )}
            <h1 className="text-2xl font-bold leading-snug mb-3">{item.title}</h1>
            <div className="flex items-center gap-3">
              {item.creatorAvatar && (
                <img src={item.creatorAvatar} alt={item.creatorName} className="w-8 h-8 rounded-full object-cover" />
              )}
              <div>
                <div className="text-sm font-medium">{item.creatorName}</div>
                <div className="text-xs text-muted-foreground">Creator</div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h2 className="font-semibold mb-2">About this item</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
          </div>

          {/* Tags */}
          <div>
            <h2 className="font-semibold mb-2 flex items-center gap-2">
              <Tag className="w-4 h-4" /> Tags
            </h2>
            <div className="flex flex-wrap gap-2">
              {item.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="rounded-full text-xs">#{tag}</Badge>
              ))}
            </div>
          </div>

          {/* What's Included */}
          <div className="bg-muted/50 rounded-xl p-5 space-y-3">
            <h2 className="font-semibold flex items-center gap-2">
              <Package className="w-4 h-4 text-primary" /> What's Included
            </h2>
            {[
              `${item.fileType.toUpperCase()} format download`,
              "Lifetime access after purchase",
              "Secure download via EduConnect",
              item.isFree ? "100% free — no credits needed" : `${item.priceCredits} credits to unlock`,
            ].map((line) => (
              <div key={line} className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                {line}
              </div>
            ))}
          </div>
        </div>

        {/* Right — Purchase Card */}
        <div className="space-y-4">
          <div className="bg-card border rounded-2xl p-5 shadow-sm space-y-4 sticky top-20">
            <div className="text-center">
              {item.isFree ? (
                <div className="text-3xl font-bold text-emerald-600">Free</div>
              ) : (
                <>
                  <div className="text-3xl font-bold text-primary">{item.priceCredits}</div>
                  <div className="text-sm text-muted-foreground">credits</div>
                </>
              )}
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  Rating
                </span>
                <span className="font-medium text-foreground">{item.rating.toFixed(1)} ({item.reviewCount})</span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Download className="w-3.5 h-3.5" />
                  Downloads
                </span>
                <span className="font-medium text-foreground">{item.downloads.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span>File Type</span>
                <span className="font-medium text-foreground uppercase">{item.fileType}</span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Category</span>
                <Badge variant="outline" className="text-xs capitalize">{item.category}</Badge>
              </div>
            </div>

            <Button
              className="w-full rounded-full"
              size="lg"
              onClick={handlePurchase}
              disabled={purchaseMutation.isPending}
            >
              {purchaseMutation.isPending ? (
                "Processing…"
              ) : item.isFree ? (
                <><Download className="w-4 h-4 mr-2" /> Get Free</>
              ) : (
                <><ShoppingCart className="w-4 h-4 mr-2" /> Buy — {item.priceCredits} Credits</>
              )}
            </Button>

            <button
              onClick={() => { navigator.clipboard.writeText(window.location.href); }}
              className="w-full flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
            >
              <Share2 className="w-4 h-4" /> Share
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
