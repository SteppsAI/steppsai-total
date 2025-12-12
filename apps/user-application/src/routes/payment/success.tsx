import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { clearAccessCache } from "@/lib/auth-helpers";
import { trpc } from "@/router";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/payment/success")({
  component: PaymentSuccessPage,
});

const MAX_POLL_ATTEMPTS = 20;
const POLL_INTERVAL_MS = 1500;

function PaymentSuccessPage() {
  const navigate = useNavigate();
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
      // Small delay to show success message before redirect
      setTimeout(() => {
        navigate({ to: "/app" });
      }, 1500);
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

  if (status === "timeout") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-6 p-8 max-w-md">
          <AlertCircle className="h-16 w-16 text-yellow-500 mx-auto" />
          <h1 className="text-2xl font-bold">Processing Your Payment</h1>
          <p className="text-muted-foreground">
            Your payment was received but is still being processed.
            This usually takes a few seconds but can sometimes take longer.
          </p>
          <div className="space-y-3">
            <Button onClick={handleRetry} className="w-full">
              Check Again
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate({ to: "/app" })}
              className="w-full"
            >
              Continue to App
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            If access isn't granted within a few minutes, please contact support.
          </p>
        </div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-6 p-8 max-w-md">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
          <h1 className="text-2xl font-bold">Payment Successful!</h1>
          <p className="text-muted-foreground">
            Welcome to SteppsAI. Redirecting now...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6 p-8 max-w-md">
        <Loader2 className="h-16 w-16 text-primary mx-auto animate-spin" />
        <h1 className="text-2xl font-bold">Setting Up Your Access</h1>
        <p className="text-muted-foreground">
          Please wait while we activate your account...
        </p>
        <div className="w-full bg-secondary rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${Math.min((attempts / MAX_POLL_ATTEMPTS) * 100, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
