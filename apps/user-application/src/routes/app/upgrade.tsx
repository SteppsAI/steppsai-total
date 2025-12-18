import { createFileRoute, redirect } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState, useRef } from "react";
import { Loader2, Check, Users, User } from "lucide-react";
import { toast } from "sonner";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { trpc } from "@/router";
import { authClient } from "@/components/auth/client";
import { getAccessCached } from "@/lib/auth-helpers";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/upgrade")({
  component: UpgradePage,
  beforeLoad: async () => {
    const hasAccess = await getAccessCached();
    if (hasAccess) {
      throw redirect({ to: "/app" });
    }
  },
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.prefetchQuery(
        context.trpc.users.getMePublic.queryOptions()
      ),
      context.queryClient.prefetchQuery(
        context.trpc.config.getPublicConfig.queryOptions()
      ),
    ]);
  },
});

const INDIVIDUAL_FEATURES = [
  "Unlimited Guides & Stepps",
  "Smart AI Screenshot Capture",
  "Advanced Image Editor",
  "Public & Private Sharing",
  "PDF & Markdown Export",
  "Priority Support",
  "Future Updates Included",
];

const TEAM_FEATURES = [
  "Everything in Individual",
  "3 Team Member Seats",
  "Shared Guide Library",
  "Team Collaboration Tools",
  "Admin Dashboard",
  "Priority Support",
  "Future Updates Included",
];

type PlanType = "individual" | "team";

function UpgradePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { data: user } = useSuspenseQuery(trpc.users.getMePublic.queryOptions());
  const { data: config } = useSuspenseQuery(trpc.config.getPublicConfig.queryOptions());

  const [selectedPlan, setSelectedPlan] = useState<PlanType>("individual");
  const [isLoading, setIsLoading] = useState(false);

  // Check if team product is available
  const hasTeamProduct = !!config.teamProductId;

  // Animation effect
  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    tl.fromTo(".upgrade-modal",
      { opacity: 0, scale: 0.96, y: 20 },
      { opacity: 1, scale: 1, y: 0, duration: 0.5 }
    )
      .fromTo(".upgrade-header > *",
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.08 },
        "-=0.2"
      )
      .fromTo(".plan-selector",
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.4 },
        "-=0.2"
      )
      .fromTo(".upgrade-content",
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.4 },
        "-=0.2"
      )
      .fromTo(".upgrade-feature",
        { opacity: 0, x: 8 },
        { opacity: 1, x: 0, duration: 0.25, stagger: 0.03 },
        "-=0.2"
      )
      .fromTo(".upgrade-cta",
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.4 },
        "-=0.1"
      );

  }, { scope: containerRef });

  const handleCheckout = async () => {
    setIsLoading(true);
    try {
      const productId = selectedPlan === "team" ? config.teamProductId : config.productId;

      if (!productId) {
        console.error("[Upgrade] Product ID missing from backend config", config);
        throw new Error("Configuration unavailable");
      }

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

  const currentProductId = selectedPlan === "team" ? config.teamProductId : config.productId;
  const currentFeatures = selectedPlan === "team" ? TEAM_FEATURES : INDIVIDUAL_FEATURES;
  const currentPrice = selectedPlan === "team" ? "$249" : "$149";
  const currentBadge = selectedPlan === "team" ? "TEAM DEAL" : "LIFETIME DEAL";
  const currentDescription = selectedPlan === "team"
    ? "Perfect for small teams. 3 seats included with all Pro features."
    : "Pay once, own forever. All Pro features + every future update included.";

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 overflow-y-auto overflow-x-hidden min-h-[100dvh] flex items-center justify-center p-4"
    >
      {/* Background - Radial cloudy/foggy gradient */}
      <div className="fixed inset-0 bg-foggy -z-10" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,_var(--color-100)_0%,_transparent_70%)] -z-10" />

      {/* Decorative blurs */}
      <div className="fixed top-1/4 left-1/4 w-64 h-64 bg-primary/15 rounded-full blur-[100px] -z-10" />
      <div className="fixed bottom-1/4 right-1/4 w-56 h-56 bg-secondary/10 rounded-full blur-[80px] -z-10" />

      {/* Modal */}
      <div className="upgrade-modal relative z-10 w-full max-w-3xl my-auto">
        <div className="bg-background/95 backdrop-blur-2xl border-2 border-primary/20 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden">

          {/* Header */}
          <div className="upgrade-header text-center px-6 pt-5 pb-3 sm:px-8 sm:pt-8 sm:pb-5">
            {/* Logo */}
            <div className="flex justify-center mb-4">
              <img src="/brand/logo-symbol.svg" alt="SteppsAI" className="w-12 h-12 object-contain" />
            </div>

            {/* Badge - Clean solid style */}
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-[var(--color-950)] text-white text-[10px] sm:text-xs font-bold tracking-wide mb-3">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
              </span>
              LAUNCH SPECIAL
            </div>

            {/* Welcome */}
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--color-950)]">
              {user?.name ? (
                <>Welcome, <span className="text-primary">{user.name}</span>!</>
              ) : (
                <>You're <span className="text-primary">Almost There</span>!</>
              )}
            </h1>
            <p className="mt-2 text-sm text-[var(--color-600)]">
              One payment. Lifetime access. No subscriptions ever.
            </p>
          </div>

          {/* Plan Selector - Only show if team product is available */}
          {hasTeamProduct && (
            <div className="plan-selector px-6 sm:px-8 pb-4">
              <div className="flex gap-2 p-1 bg-[var(--color-100)] rounded-xl max-w-sm mx-auto">
                <button
                  onClick={() => setSelectedPlan("individual")}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all",
                    selectedPlan === "individual"
                      ? "bg-white text-[var(--color-950)] shadow-sm"
                      : "text-[var(--color-600)] hover:text-[var(--color-800)]"
                  )}
                >
                  <User className="w-4 h-4" />
                  Individual
                </button>
                <button
                  onClick={() => setSelectedPlan("team")}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all",
                    selectedPlan === "team"
                      ? "bg-white text-[var(--color-950)] shadow-sm"
                      : "text-[var(--color-600)] hover:text-[var(--color-800)]"
                  )}
                >
                  <Users className="w-4 h-4" />
                  Team (3 seats)
                </button>
              </div>
            </div>
          )}

          {/* Content Grid */}
          <div className="upgrade-content grid md:grid-cols-2 border-t border-primary/10">

            {/* Left: Pricing */}
            <div className="px-5 py-5 sm:px-8 sm:py-6 md:border-r border-primary/10 flex flex-col items-center md:items-start text-center md:text-left h-full justify-center">
              {/* Deal Badge */}
              <div className={cn(
                "inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] sm:text-xs font-bold rounded-md mb-3",
                selectedPlan === "team" ? "bg-secondary text-white" : "bg-primary text-white"
              )}>
                {currentBadge}
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-2 sm:gap-3 mb-3">
                <span className="text-4xl sm:text-5xl font-bold tracking-tight text-[var(--color-950)]">
                  {currentPrice}
                </span>
                <div className="flex flex-col justify-center text-left">
                  <span className="text-xs sm:text-sm font-semibold text-primary uppercase tracking-wide">
                    One-time
                  </span>
                  <span className="text-[10px] sm:text-xs text-[var(--color-500)]">
                    {selectedPlan === "team" ? "3 team members" : "No recurring fees"}
                  </span>
                </div>
              </div>

              <div className="bg-[var(--color-50)] border border-[var(--color-200)] rounded-xl px-3 py-2.5 mb-4 w-full">
                <p className="text-sm text-[var(--color-700)] leading-snug font-medium">
                  {currentDescription}
                </p>
              </div>

              {/* Urgency */}
              <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-primary">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary" />
                </span>
                Limited spots at this price
              </div>
            </div>

            {/* Right: Features */}
            <div className="px-5 py-5 sm:px-8 sm:py-6 border-t md:border-t-0 border-primary/10 bg-primary/5 md:bg-transparent h-full flex flex-col justify-center">
              <h3 className="text-sm font-bold text-[var(--color-800)] mb-3 text-center md:text-left">
                What's included:
              </h3>
              <ul className="space-y-2 pl-2 sm:pl-0">
                {currentFeatures.map((feature, i) => (
                  <li
                    key={i}
                    className="upgrade-feature flex items-start gap-2.5"
                  >
                    <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-[var(--color-700)] font-medium text-left">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* CTA Footer */}
          <div className="upgrade-cta px-6 py-5 sm:px-10 sm:py-6 border-t border-primary/10 bg-white/50">
            <button
              onClick={handleCheckout}
              disabled={isLoading || !currentProductId}
              className={cn(
                "group cursor-pointer w-full h-12 sm:h-13 text-base sm:text-lg font-bold rounded-xl sm:rounded-full shadow-lg transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed text-white",
                selectedPlan === "team"
                  ? "bg-secondary hover:bg-secondary/90 hover:shadow-secondary/25"
                  : "btn-glass-primary hover:shadow-primary/25"
              )}
            >
              <span className="flex items-center justify-center gap-2 w-full h-full px-4">
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span className="relative flex h-[1.2em] overflow-hidden items-center justify-center">
                      <span className="block transition-transform duration-500 ease-in-out group-hover:-translate-y-full">
                        {selectedPlan === "team" ? "Get Team Access" : "Get Lifetime Access"}
                      </span>
                      <span className="absolute top-full left-0 right-0 block transition-transform duration-500 ease-in-out group-hover:-translate-y-full text-center">
                        {selectedPlan === "team" ? "Get Team Access" : "Get Lifetime Access"}
                      </span>
                    </span>
                    <img
                      src="/icons/3d/rocket.png"
                      alt=""
                      className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"
                    />
                  </>
                )}
              </span>
            </button>

            {/* Simple trust text */}
            <p className="text-center text-[10px] sm:text-xs text-[var(--color-600)] mt-3">
              30-day money-back guarantee • Instant access
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center mt-4 text-xs text-[var(--color-500)] pb-4">
          Questions?{" "}
          <a
            href="mailto:support@stepps.ai"
            className="text-primary font-medium hover:underline"
          >
            Contact us
          </a>
        </p>
      </div>
    </div>
  );
}
