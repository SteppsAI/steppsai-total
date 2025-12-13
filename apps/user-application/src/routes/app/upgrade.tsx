import { createFileRoute, redirect } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState, useEffect, useRef } from "react";
import { Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { trpc } from "@/router";
import { authClient } from "@/components/auth/client";
import { getAccessCached } from "@/lib/auth-helpers";

export const Route = createFileRoute("/app/upgrade")({
  component: UpgradePage,
  beforeLoad: async () => {
    const hasAccess = await getAccessCached();
    if (hasAccess) {
      throw redirect({ to: "/app" });
    }
  },
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
  const containerRef = useRef<HTMLDivElement>(null);
  const { data: user } = useSuspenseQuery(trpc.users.getMePublic.queryOptions());

  const [productId, setProductId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function detectRegion() {
      try {
        const res = await fetch("https://ipapi.co/json/");
        const data: any = await res.json();
        const isEU = data?.continent_code === "EU";

        // Select Environment Variables based on Mode
        // Fallback to legacy VITE_CREEM_LIFETIME_PRODUCT_* if DEVELOPMENT var is missing
        const isProd = import.meta.env.MODE === "production";

        if (isProd) {
          setProductId(
            isEU
              ? import.meta.env.VITE_CREEM_LIFETIME_PRODUCT_EU_PRODUCTION
              : import.meta.env.VITE_CREEM_LIFETIME_PRODUCT_US_PRODUCTION
          );
        } else {
          setProductId(
            isEU
              ? (import.meta.env.VITE_CREEM_LIFETIME_PRODUCT_EU_DEVELOPMENT || import.meta.env.VITE_CREEM_LIFETIME_PRODUCT_EU)
              : (import.meta.env.VITE_CREEM_LIFETIME_PRODUCT_US_DEVELOPMENT || import.meta.env.VITE_CREEM_LIFETIME_PRODUCT_US)
          );
        }
      } catch {
        // Default to US (Development/Legacy) on error
        const isProd = import.meta.env.MODE === "production";
        setProductId(
          isProd
            ? import.meta.env.VITE_CREEM_LIFETIME_PRODUCT_US_PRODUCTION
            : (import.meta.env.VITE_CREEM_LIFETIME_PRODUCT_US_DEVELOPMENT || import.meta.env.VITE_CREEM_LIFETIME_PRODUCT_US)
        );
      }
    }
    detectRegion();
  }, []);

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
    <div
      ref={containerRef}
      className="fixed inset-0 flex items-center justify-center p-4 sm:p-6 overflow-hidden"
    >
      {/* Background - Radial cloudy/foggy gradient */}
      <div className="absolute inset-0 bg-foggy" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--color-100)_0%,_transparent_70%)]" />

      {/* Decorative blurs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/15 rounded-full blur-[100px]" />
      <div className="absolute bottom-1/4 right-1/4 w-56 h-56 bg-secondary/10 rounded-full blur-[80px]" />

      {/* Modal */}
      <div className="upgrade-modal relative z-10 w-full max-w-3xl">
        <div className="bg-background/95 backdrop-blur-2xl border-2 border-primary/20 rounded-3xl shadow-2xl overflow-hidden">

          {/* Header */}
          <div className="upgrade-header text-center px-6 pt-8 pb-5 sm:px-10 sm:pt-10 sm:pb-6">
            {/* Badge - Clean solid style */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--color-950)] text-white text-xs font-bold tracking-wide mb-5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
              </span>
              LAUNCH SPECIAL
            </div>

            {/* Welcome */}
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--color-950)]">
              {user?.name ? (
                <>Welcome, <span className="text-primary">{user.name}</span>!</>
              ) : (
                <>You're <span className="text-primary">Almost There</span>!</>
              )}
            </h1>
            <p className="mt-3 text-base sm:text-lg text-[var(--color-600)]">
              One payment. Lifetime access. No subscriptions ever.
            </p>
          </div>

          {/* Content Grid */}
          <div className="upgrade-content grid md:grid-cols-2 border-t border-primary/10">

            {/* Left: Pricing */}
            <div className="px-6 py-6 sm:px-10 sm:py-8 md:border-r border-primary/10">
              {/* Lifetime Badge */}
              <div className="inline-flex items-center gap-2 bg-primary text-white px-3 py-1 text-xs font-bold rounded-md mb-5">
                LIFETIME DEAL
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-5xl sm:text-6xl font-bold tracking-tight text-[var(--color-950)]">
                  $149
                </span>
                <div className="flex flex-col justify-center">
                  <span className="text-sm font-semibold text-primary uppercase tracking-wide">One-time</span>
                  <span className="text-xs text-[var(--color-500)]">No recurring fees</span>
                </div>
              </div>

              <div className="bg-[var(--color-50)] border border-[var(--color-200)] rounded-xl px-4 py-3 mb-5">
                <p className="text-sm text-[var(--color-700)] leading-relaxed font-medium">
                  Pay once, own forever. All Pro features + every future update included.
                </p>
              </div>

              {/* Urgency */}
              <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary" />
                </span>
                Limited spots at this price
              </div>
            </div>

            {/* Right: Features */}
            <div className="px-6 py-6 sm:px-10 sm:py-8 border-t md:border-t-0 border-primary/10">
              <h3 className="text-base font-bold text-[var(--color-800)] mb-4">
                What's included:
              </h3>
              <ul className="space-y-3">
                {FEATURES.map((feature, i) => (
                  <li
                    key={i}
                    className="upgrade-feature flex items-start gap-3"
                  >
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-[var(--color-700)] font-medium">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* CTA Footer */}
          <div className="upgrade-cta px-6 py-6 sm:px-10 sm:py-8 border-t border-primary/10">
            <button
              onClick={handleCheckout}
              disabled={isLoading || !productId}
              className="btn-glass-primary group cursor-pointer w-full h-14 sm:h-16 text-lg sm:text-xl font-bold rounded-full shadow-lg hover:shadow-primary/25 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="flex items-center justify-center gap-3">
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-primary-foreground" />
                ) : (
                  <>
                    <span className="relative block h-[1.2em] overflow-hidden text-primary-foreground">
                      <span className="block transition-transform duration-500 ease-in-out group-hover:-translate-y-full">
                        Get Lifetime Access
                      </span>
                      <span className="absolute top-full left-0 block transition-transform duration-500 ease-in-out group-hover:-translate-y-full">
                        Get Lifetime Access
                      </span>
                    </span>
                    <img
                      src="/icons/3d/rocket.png"
                      alt=""
                      className="w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"
                    />
                  </>
                )}
              </span>
            </button>

            {/* Simple trust text */}
            <p className="text-center text-xs text-[var(--color-600)] mt-4">
              30-day money-back guarantee • Instant access
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center mt-4 text-xs text-[var(--color-500)]">
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

