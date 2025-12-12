import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/router";
import { authClient } from "@/components/auth/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/app/upgrade")({
  component: UpgradePage,
  loader: async ({ context }) => {
    await context.queryClient.prefetchQuery(
      context.trpc.users.getMePublic.queryOptions()
    );
  },
});

const FEATURES = [
  "Unlimited Guides & Stepps",
  "Smart AI Screenshot Capture",
  "Advanced Image Editor",
  "Public & Private Sharing",
  "Team Collaboration",
  "PDF & Markdown Export",
  "Priority Support",
  "Future Updates Included",
];

function UpgradePage() {
  const { data: user } = useSuspenseQuery(trpc.users.getMePublic.queryOptions());

  const [productId, setProductId] = useState<string | null>(null);

  // Detect region and choose product
  useEffect(() => {
    async function detectRegion() {
      try {
        const res = await fetch("https://ipapi.co/json/");
        const data: any = await res.json();
        const isEU = data?.continent_code === "EU";
        setProductId(
          isEU
            ? import.meta.env.VITE_CREEM_LIFETIME_PRODUCT_EU
            : import.meta.env.VITE_CREEM_LIFETIME_PRODUCT_US
        );
      } catch {
        setProductId(import.meta.env.VITE_CREEM_LIFETIME_PRODUCT_US);
      }
    }
    detectRegion();
  }, []);
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = async () => {
    setIsLoading(true);
    try {
      if (!productId) throw new Error("Detecting region...");

      const result = await authClient.creem.createCheckout({
        productId,
        successUrl: "/payment/success",
        metadata: {
          referenceId: user?.userId || "",
        },
      });

      const url = (result as any)?.data?.url;
      if (url) {
        window.location.href = url;
      } else {
        toast.error("Could not start checkout");
      }
    } catch (error) {
      console.error("[Upgrade] Checkout error:", error);
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-8 p-4 bg-background">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
          <span className="relative flex h-2 w-2">
            <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          Limited Time Offer
        </div>
        <h1 className="text-3xl md:text-4xl font-bold">
          {user?.name ? `Welcome, ${user.name}!` : "Welcome!"}
        </h1>
        <p className="text-muted-foreground text-lg max-w-md">
          One payment. Lifetime access. All future updates included.
        </p>
      </div>

      <div className="bg-card border-2 rounded-3xl p-8 w-full max-w-md space-y-6 shadow-xl">
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-2 bg-foreground text-background px-3 py-1 text-sm font-bold rounded-md mb-2">
            LIFETIME DEAL
          </div>
          <div className="flex items-baseline justify-center gap-2">
            <span className="text-5xl md:text-6xl font-bold">$149</span>
          </div>
          <p className="text-sm text-primary font-medium">One-time payment</p>
        </div>

        <ul className="space-y-3">
          {FEATURES.map((feature, i) => (
            <li key={i} className="flex items-center gap-3">
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                <Check className="w-3 h-3 text-primary" />
              </div>
              <span className="text-sm font-medium">{feature}</span>
            </li>
          ))}
        </ul>

        <Button
          className="w-full h-14 text-lg font-bold"
          size="lg"
          onClick={handleCheckout}
          disabled={isLoading || !productId}
        >
          {isLoading && <Loader2 className="h-5 w-5 mr-2 animate-spin" />}
          Get Lifetime Access
        </Button>

        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <span>30-day money-back guarantee</span>
          <span>•</span>
          <span>Instant access</span>
        </div>
      </div>
    </div>
  );
}
