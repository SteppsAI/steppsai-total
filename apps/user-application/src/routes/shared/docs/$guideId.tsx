import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { trpc } from "@/router";
import { PublicDocsPage } from "@/components/docs/public-docs-page";

export const Route = createFileRoute("/shared/docs/$guideId")({
  component: PublicDocsRouteComponent,
  loader: async ({ context, params }) => {
    await context.queryClient.prefetchQuery(
      context.trpc.publicGuideDocs.getPublished.queryOptions({ guideId: params.guideId })
    );
  },
});

function PublicDocsRouteComponent() {
  const { guideId } = Route.useParams();
  const navigate = useNavigate();
  const { data } = useSuspenseQuery(
    trpc.publicGuideDocs.getPublished.queryOptions({ guideId })
  );

  useEffect(() => {
    if (!data) {
      navigate({ to: "/" });
    }
  }, [data, navigate]);

  if (!data?.page?.publishedContent) return null;

  return (
    <PublicDocsPage
      guide={data.guide as any}
      content={data.page.publishedContent}
      generationInput={data.page.generationInput}
    />
  );
}
