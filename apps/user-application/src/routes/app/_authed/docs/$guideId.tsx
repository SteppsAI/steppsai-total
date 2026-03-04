import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { DocsEditor } from "@/components/docs/docs-editor";
import { DocsGenerationWizard } from "@/components/docs/docs-generation-wizard";
import { trpc } from "@/router";
import { useState } from "react";
import type { GuideDocumentationContent, GuideDocsGenerationInput } from "@repo/data-ops/zod-schema";

export const Route = createFileRoute("/app/_authed/docs/$guideId")({
  component: DocsEditorPage,
  loader: async ({ context, params }) => {
    await context.queryClient.prefetchQuery(
      context.trpc.guideDocs.getByGuideId.queryOptions({ guideId: params.guideId })
    );
  },
});

function DocsEditorPage() {
  const { guideId } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [wizardOpen, setWizardOpen] = useState(false);

  const queryOptions = trpc.guideDocs.getByGuideId.queryOptions({ guideId });
  const { data } = useSuspenseQuery({
    ...queryOptions,
    refetchInterval: (query) => {
      const current = query.state.data;
      return current?.page?.status === "generating" ? 2000 : false;
    },
  });

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: queryOptions.queryKey });
    await queryClient.invalidateQueries({
      queryKey: trpc.guides.getById.queryOptions({ id: guideId }).queryKey,
    });
  };

  const generateMutation = useMutation({
    ...trpc.guideDocs.generate.mutationOptions(),
    onSuccess: async () => {
      await invalidate();
      setWizardOpen(false);
      toast.success("Docs generation started");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to start docs generation");
    },
  });

  const regenerateMutation = useMutation({
    ...trpc.guideDocs.regenerate.mutationOptions(),
    onSuccess: async () => {
      await invalidate();
      toast.success("Docs regeneration started");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to regenerate docs");
    },
  });

  const updateDraftMutation = useMutation({
    ...trpc.guideDocs.updateDraft.mutationOptions(),
    onSuccess: async () => {
      await invalidate();
      toast.success("Docs draft saved");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to save docs draft");
    },
  });

  const publishMutation = useMutation({
    ...trpc.guideDocs.publish.mutationOptions(),
    onSuccess: async () => {
      await invalidate();
      toast.success("Docs published");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to publish docs");
    },
  });

  const unpublishMutation = useMutation({
    ...trpc.guideDocs.unpublish.mutationOptions(),
    onSuccess: async () => {
      await invalidate();
      toast.success("Docs unpublished");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to unpublish docs");
    },
  });

  if (!data) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-muted-foreground">Guide not found</div>
      </div>
    );
  }

  async function handleGenerate(input: GuideDocsGenerationInput) {
    await generateMutation.mutateAsync({ guideId, input });
  }

  async function handleSaveDraft(draftContent: GuideDocumentationContent) {
    await updateDraftMutation.mutateAsync({ guideId, draftContent });
  }

  return (
    <>
      <DocsEditor
        guide={data.guide as any}
        page={data.page}
        stale={data.stale}
        onBack={() => navigate({ to: "/app/stepps/$guideId", params: { guideId } })}
        onOpenGenerateWizard={() => setWizardOpen(true)}
        onSaveDraft={handleSaveDraft}
        onRegenerate={async (section) => {
          await regenerateMutation.mutateAsync({ guideId, section });
        }}
        onPublish={async () => {
          await publishMutation.mutateAsync({ guideId });
        }}
        onUnpublish={async () => {
          await unpublishMutation.mutateAsync({ guideId });
        }}
        isSavingDraft={updateDraftMutation.isPending}
        isRegenerating={regenerateMutation.isPending}
        isPublishing={publishMutation.isPending}
        isUnpublishing={unpublishMutation.isPending}
      />

      <DocsGenerationWizard
        open={wizardOpen}
        onOpenChange={setWizardOpen}
        guideTitle={data.guide.title}
        defaultValue={data.page?.generationInput}
        onSubmit={handleGenerate}
        isSubmitting={generateMutation.isPending}
      />
    </>
  );
}
