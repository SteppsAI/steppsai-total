import { updateGuide, updateGuideSteps, deleteGuide } from "@repo/data-ops/queries";
import type { StepsInsertMessage, Step } from "@repo/data-ops/zod-schema";
import { generateStepDescription } from "../helpers/generateStepDescription";

export async function handleStepsInsert(env: Env, event: StepsInsertMessage) {
    const { guideId, steps: rawSteps } = event;

    console.log(`Processing ${rawSteps.length} steps for guide ${guideId}`);

    try {
        // Transform extension steps to full steps with readable captions
        const steps: Step[] = rawSteps.map((step) => {
            const isNavigate = step.type === 'navigate';
            const caption = isNavigate
                ? `Navigate to ${new URL(step.pageUrl).hostname}`
                : generateStepDescription(step.domSelector || '');

            return {
                id: step.id,
                type: step.type,
                orderIndex: step.orderIndex,
                imageKey: step.imageKey,
                pageUrl: step.pageUrl,
                domSelector: step.domSelector,
                x: step.x,
                y: step.y,
                caption,
                isExcluded: false,
                overlays: (!isNavigate && step.x && step.y) ? [{
                    type: 'arrow',
                    // Simple arrow pointing to the click location
                    // Adjust coordinates slightly to have the arrow tip at the click point
                    from: [step.x - 50, step.y + 50],
                    to: [step.x, step.y]
                }] : undefined
            };
        });

        // Update guide with steps JSONB
        await updateGuideSteps(guideId, steps);

        // Update guide status to draft
        await updateGuide(guideId, { status: 'draft' });

        console.log(`Successfully inserted ${steps.length} steps for guide ${guideId}`);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`Steps insert failed for guide ${guideId}: ${errorMessage}`);

        // Cleanup on failure
        await cleanupFailedGuide(env, guideId);

        throw error;
    }
}

async function cleanupFailedGuide(env: Env, guideId: string) {
    console.log(`Cleaning up failed guide: ${guideId}`);

    try {
        // Delete guide (steps are embedded, so no separate cleanup needed)
        await deleteGuide(guideId);

        // Delete images from R2
        const prefix = `screenshots/${guideId}/`;
        const listed = await env.BUCKET.list({ prefix });

        if (listed.objects.length > 0) {
            await Promise.all(
                listed.objects.map(obj => env.BUCKET.delete(obj.key))
            );
            console.log(`Deleted ${listed.objects.length} images from R2`);
        }

        console.log(`Cleanup complete for guide ${guideId}`);
    } catch (cleanupError) {
        console.error(`Cleanup failed for guide ${guideId}:`, cleanupError);
    }
}
