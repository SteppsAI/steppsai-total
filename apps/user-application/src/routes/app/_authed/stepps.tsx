import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/app/_authed/stepps")({
  component: SteppsLayout,
});

function SteppsLayout() {
  return <Outlet />;
}

