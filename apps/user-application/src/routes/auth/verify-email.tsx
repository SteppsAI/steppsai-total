// routes/auth/verify-email.tsx
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { Check, ArrowRight } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export const Route = createFileRoute("/auth/verify-email")({
  component: VerifyEmailPage,
});

function VerifyEmailPage() {
  const navigate = useNavigate();
  const [redirectProgress, setRedirectProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const REDIRECT_TIME_MS = 3000;

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / REDIRECT_TIME_MS) * 100, 100);
      setRedirectProgress(progress);

      if (progress >= 100) {
        clearInterval(interval);
        navigate({ to: "/app" });
      }
    }, 50);

    return () => clearInterval(interval);
  }, [navigate]);

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    tl.fromTo(".verify-card",
      { opacity: 0, scale: 0.95, y: 20 },
      { opacity: 1, scale: 1, y: 0, duration: 0.6 }
    )
      .fromTo(".verify-icon",
        { scale: 0, rotation: -45 },
        { scale: 1, rotation: 0, duration: 0.5, ease: "back.out(1.7)" },
        "-=0.3"
      )
      .fromTo(".verify-content > *",
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.1 },
        "-=0.2"
      );
  }, { scope: containerRef });

  return (
    <div
      ref={containerRef}
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
    >
      {/* Background - Foggy Style */}
      <div className="fixed inset-0 bg-foggy -z-10" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,_var(--color-100)_0%,_transparent_70%)] -z-10" />

      {/* Decorative Blurs */}
      <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] -z-10" />
      <div className="fixed bottom-1/4 right-1/4 w-80 h-80 bg-secondary/10 rounded-full blur-[100px] -z-10" />

      {/* Logo */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 z-20">
        <Link to="/">
          <img
            src="/brand/logo-symbol.svg"
            alt="Stepps"
            className="h-10 w-10 hover:scale-105 transition-transform duration-300"
          />
        </Link>
      </div>

      <div className="verify-card w-full max-w-lg relative">
        <div className="bg-background/95 backdrop-blur-2xl border-2 border-primary/10 rounded-3xl shadow-2xl p-8 md:p-12 text-center relative overflow-hidden">

          {/* Success Icon */}
          <div className="verify-icon mx-auto mb-8 relative">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto ring-8 ring-green-50">
              <Check className="w-10 h-10 text-green-600 stroke-[3]" />
            </div>
            {/* Confetti-like bits could go here */}
          </div>

          <div className="verify-content space-y-4">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--color-950)]">
              Email Verified!
            </h1>

            <p className="text-lg text-[var(--color-600)] max-w-sm mx-auto leading-relaxed">
              Your account has been successfully activated. You're all set to go.
            </p>

            {/* Progress Bar for Redirect */}
            <div className="py-6 w-full max-w-xs mx-auto">
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-100 ease-linear rounded-full"
                  style={{ width: `${redirectProgress}%` }}
                />
              </div>
              <p className="text-xs text-[var(--color-500)] mt-2 font-medium">
                Redirecting to workspace...
              </p>
            </div>

            <button
              onClick={() => navigate({ to: "/app" })}
              className="btn-glass-primary text-primary-foreground group w-full sm:w-auto mx-auto inline-flex h-12 items-center justify-center rounded-full px-8 text-base font-semibold shadow-lg hover:shadow-primary/25 transition-all hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}