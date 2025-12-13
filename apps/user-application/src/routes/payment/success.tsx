import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useCallback, useRef } from "react";
import { Check, Loader2, AlertCircle, RefreshCcw, ArrowRight, Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { clearAccessCache } from "@/lib/auth-helpers";
import { trpc } from "@/router";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import confetti from "canvas-confetti";

export const Route = createFileRoute("/payment/success")({
  component: PaymentSuccessPage,
});

const MAX_POLL_ATTEMPTS = 20;
const POLL_INTERVAL_MS = 1500;

function PaymentSuccessPage() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"polling" | "success" | "timeout">("polling");
  const [attempts, setAttempts] = useState(0);

  // Use the same pattern as other components
  const accessQuery = useQuery({
    ...trpc.users.getMePublic.queryOptions(),
    enabled: status === "polling",
    refetchInterval: status === "polling" ? POLL_INTERVAL_MS : false,
    staleTime: 0,
    gcTime: 0,
  });

  useEffect(() => {
    // Clear cache so queries fetch fresh access status
    clearAccessCache();
  }, []);

  useEffect(() => {
    if (status !== "polling") return;

    // Check if user has access
    const hasAccess = accessQuery.data?.hasAccess;

    if (hasAccess) {
      setStatus("success");
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#4f46e5', '#0ea5e9', '#ec4899']
      });
      // Small delay to show success message before redirect
      setTimeout(() => {
        navigate({ to: "/app" });
      }, 3500); // Increased slightly so user can enjoy the success state
      return;
    }

    // Track attempts
    if (accessQuery.isFetched && !accessQuery.isFetching) {
      setAttempts((prev) => prev + 1);
    }

    // Timeout after max attempts
    if (attempts >= MAX_POLL_ATTEMPTS) {
      setStatus("timeout");
    }
  }, [accessQuery.data, accessQuery.isFetched, accessQuery.isFetching, attempts, status, navigate]);

  const handleRetry = useCallback(() => {
    setAttempts(0);
    setStatus("polling");
    clearAccessCache();
    accessQuery.refetch();
  }, [accessQuery]);

  // Animations
  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    tl.fromTo(".success-card",
      { opacity: 0, y: 20, scale: 0.98 },
      { opacity: 1, y: 0, scale: 1, duration: 0.6 }
    );

    tl.fromTo(".success-item",
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, stagger: 0.1, duration: 0.4 },
      "-=0.2"
    );

  }, { scope: containerRef });

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 min-h-[100dvh] flex items-center justify-center p-4 bg-background overflow-hidden"
    >
      {/* Premium Background */}
      <div className="absolute inset-0 bg-foggy opacity-60 z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.1),rgba(255,255,255,0))]" />

      {/* Decorative Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-indigo-500/10 rounded-full blur-[120px] mix-blend-multiply animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40rem] h-[40rem] bg-blue-500/10 rounded-full blur-[120px] mix-blend-multiply animate-pulse" style={{ animationDelay: "2s" }} />

      {/* Main Card */}
      <div className="success-card relative z-10 w-full max-w-md">
        <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-white/70 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:bg-slate-900/60 dark:border-white/10 p-8 sm:p-10">

          {/* Top decorative gradient line */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50" />

          {status === "polling" && (
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="success-item relative">
                <div className="absolute inset-0 bg-indigo-100 rounded-full blur-xl opacity-50 animate-pulse dark:bg-indigo-900/40" />
                <div className="relative w-20 h-20 flex items-center justify-center">
                  {/* Animated pulse rings */}
                  <div className="absolute inset-0 rounded-full border-2 border-indigo-400/30 animate-ping" style={{ animationDuration: '2s' }} />
                  <div className="absolute inset-2 rounded-full border-2 border-indigo-500/40 animate-ping" style={{ animationDuration: '2s', animationDelay: '0.5s' }} />
                  {/* Center orb */}
                  <div className="relative w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-full shadow-lg shadow-indigo-500/30 flex items-center justify-center">
                    <div className="w-6 h-6 bg-white/20 rounded-full animate-pulse" />
                  </div>
                </div>
              </div>

              <div className="success-item space-y-2">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-display">
                  Finalizing Access
                </h1>
                <p className="text-slate-500 dark:text-slate-400">
                  Please wait a moment while we activate your lifetime license.
                </p>
              </div>

              {/* Enhanced Progress Bar */}
              <div className="success-item w-full space-y-2">
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden dark:bg-slate-800">
                  <div
                    className="h-full bg-indigo-600 rounded-full transition-all duration-300 ease-out relative"
                    style={{ width: `${Math.min((attempts / MAX_POLL_ATTEMPTS) * 100, 100)}%` }}
                  >
                    <div className="absolute inset-0 bg-white/30 animate-[shimmer_2s_infinite]" />
                  </div>
                </div>
                <p className="text-xs text-slate-400 text-center font-medium">
                  Constructing your dashboard...
                </p>
              </div>
            </div>
          )}

          {status === "success" && (
            <div className="flex flex-col items-center text-center space-y-8">
              <div className="success-item relative">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-200 via-green-100 to-emerald-200 rounded-full blur-2xl opacity-60 dark:from-indigo-900/40 dark:via-green-900/40 dark:to-emerald-900/40" />
                {/* Animated celebration rings */}
                <div className="absolute inset-[-8px] rounded-full border border-green-400/20 animate-ping" style={{ animationDuration: '3s' }} />
                <div className="absolute inset-[-4px] rounded-full border border-emerald-400/30 animate-ping" style={{ animationDuration: '2.5s', animationDelay: '0.3s' }} />
                {/* Main success circle */}
                <div className="relative w-24 h-24 bg-gradient-to-br from-emerald-400 via-green-500 to-teal-500 rounded-full shadow-xl shadow-green-500/30 flex items-center justify-center">
                  <Check className="w-12 h-12 text-white" strokeWidth={2.5} />
                </div>
                {/* Sparkle accents */}
                <div className="absolute -top-2 -right-2 bg-white rounded-full p-2 shadow-lg dark:bg-slate-800 border border-white/50">
                  <Sparkles className="w-5 h-5 text-amber-400 fill-amber-400 animate-pulse" />
                </div>
                <div className="absolute -bottom-1 -left-1 bg-white rounded-full p-1.5 shadow-md dark:bg-slate-800 border border-white/50">
                  <Sparkles className="w-3 h-3 text-indigo-400 fill-indigo-400" />
                </div>
              </div>

              <div className="success-item space-y-2">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white font-display">
                  Welcome Aboard!
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-lg">
                  Your lifetime license is active.
                </p>
              </div>

              <div className="success-item bg-slate-50 rounded-2xl p-4 w-full dark:bg-slate-800/50">
                <p className="text-sm text-slate-600 dark:text-slate-300 flex items-center justify-center gap-2">
                  <Loader2 className="w-3 h-3 animate-spin text-slate-400" />
                  Redirecting to dashboard...
                </p>
              </div>
            </div>
          )}

          {status === "timeout" && (
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="success-item relative">
                <div className="absolute inset-0 bg-amber-100 rounded-full blur-xl opacity-60 dark:bg-amber-900/40" />
                <div className="relative w-16 h-16 bg-amber-50 rounded-2xl border border-amber-100 flex items-center justify-center dark:bg-amber-900/20 dark:border-amber-800">
                  <AlertCircle className="w-8 h-8 text-amber-600 dark:text-amber-500" />
                </div>
              </div>

              <div className="success-item space-y-2">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-display">
                  Taking Longer Than Usual
                </h1>
                <p className="text-slate-500 dark:text-slate-400">
                  We received your payment, but activation is delayed. Don't worry, your funds are safe.
                </p>
              </div>

              <div className="success-item flex flex-col w-full gap-3 pt-2">
                <button
                  onClick={handleRetry}
                  className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-md shadow-indigo-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 group"
                >
                  <RefreshCcw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                  Try Checking Again
                </button>

                <button
                  onClick={() => navigate({ to: "/app" })}
                  className="w-full py-3 px-4 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl font-medium transition-colors dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700 flex items-center justify-center gap-2"
                >
                  Continue to Dashboard
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <p className="mt-8 text-center text-xs text-slate-400 dark:text-slate-500 font-medium">
          Order ID: {new URLSearchParams(window.location.search).get("session_id")?.slice(-8) || "Processing..."}
        </p>
      </div>
    </div>
  );
}
