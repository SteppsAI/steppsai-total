import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { trpc } from "@/router";
import { authClient } from "@/components/auth/client";
import { Button } from "@/components/ui/button";
import { BlackFridayDeal } from "@/components/home-page/BlackFridayDeal";

export const Route = createFileRoute("/app/upgrade")({
  component: UpgradePage,
  loader: async ({ context }) => {
    await context.queryClient.prefetchQuery(context.trpc.users.getMe.queryOptions());
  },
});

function UpgradePage() {
  const { data: user } = useSuspenseQuery(trpc.users.getMe.queryOptions());

  const handleCheckout = async () => {
    const result = await authClient.creem.createCheckout({
      productId: import.meta.env.VITE_CREEM_LIFETIME_PRODUCT,
      successUrl: "/app",
    });
    const url = (result as any)?.data?.url;
    if (url) window.location.href = url;
  };

  return (
    <div className="pt-10 space-y-10">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Welcome {user?.name}, unlock SteppsAI forever
        </h1>
        <p className="text-muted-foreground">
          One-time payment • Lifetime access • All future updates included
        </p>
      </div>

      <div className="flex justify-center">
        <Button size="lg" className="text-lg px-8" onClick={handleCheckout}>
          Upgrade Now – Lifetime Deal
        </Button>
      </div>

      <BlackFridayDeal />
    </div>
  );
}
