import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { X, ArrowLeft } from "lucide-react";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export const Route = createFileRoute("/payment/cancel")({
  component: PaymentCancelPage,
});

function PaymentCancelPage() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    tl.fromTo(".cancel-modal",
      { opacity: 0, scale: 0.96, y: 20 },
      { opacity: 1, scale: 1, y: 0, duration: 0.5 }
    );
  }, { scope: containerRef });

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
      <div className="fixed bottom-1/4 right-1/4 w-56 h-56 bg-destructive/5 rounded-full blur-[80px] -z-10" />

      {/* Modal */}
      <div className="cancel-modal relative z-10 w-full max-w-lg my-auto">
        <div className="bg-background/95 backdrop-blur-2xl border-2 border-destructive/10 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden p-8 sm:p-10 text-center">

          <div className="flex justify-center mb-6">
            <img src="/brand/logo-symbol.svg" alt="SteppsAI" className="w-12 h-12 object-contain" />
          </div>

          <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-destructive/10 rounded-full flex items-center justify-center mb-6">
            <X className="w-8 h-8 sm:w-10 sm:h-10 text-destructive" />
          </div>

          <div className="space-y-3 mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--color-950)]">
              Payment Cancelled
            </h1>
            <p className="text-sm sm:text-base text-[var(--color-600)] max-w-sm mx-auto">
              No worries! No charges were made. You can come back and upgrade whenever you're ready.
            </p>
          </div>

          <div className="flex justify-center">
            <button
              onClick={() => navigate({ to: "/app/upgrade" })}
              className="btn-glass-primary px-6 py-3 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 min-w-[200px]"
            >
              <ArrowLeft className="w-4 h-4" />
              Return to Upgrade
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-[var(--color-200)]">
            <p className="text-xs text-[var(--color-500)]">
              Questions? <a href="mailto:support@stepps.ai" className="text-primary hover:underline font-medium">Contact support</a>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
