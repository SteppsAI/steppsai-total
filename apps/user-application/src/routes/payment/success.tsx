import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle, Loader2 } from "lucide-react";
import { clearAccessCache } from "@/lib/auth-helpers";

export const Route = createFileRoute("/payment/success")({
  component: PaymentSuccessPage,
});

function PaymentSuccessPage() {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    // Clear cache so next check fetches fresh access status
    clearAccessCache();

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate({ to: "/app" });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6 p-8 max-w-md">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
        <h1 className="text-2xl font-bold">Payment Successful!</h1>
        <p className="text-muted-foreground">
          Welcome to SteppsAI. Redirecting in {countdown}...
        </p>
        <Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
      </div>
    </div>
  );
}
