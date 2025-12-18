import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * Catch-all route for unknown paths
 * Redirects all unmatched routes to the home page
 */
export const Route = createFileRoute("/$")({
  beforeLoad: () => {
    throw redirect({ to: "/" });
  },
  component: () => null,
});
