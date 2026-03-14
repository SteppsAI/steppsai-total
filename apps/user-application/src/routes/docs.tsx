import { createFileRoute } from "@tanstack/react-router";
import { ApiDocsPage } from "@/components/api-docs/api-docs-page";

export const Route = createFileRoute("/docs")({
  component: DocsRouteComponent,
});

function DocsRouteComponent() {
  return <ApiDocsPage />;
}
