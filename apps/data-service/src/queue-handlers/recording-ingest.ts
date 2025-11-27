import { createStepsBatch } from "@repo/data-ops/queries/steps";
import { updateGuide } from "@repo/data-ops/queries/guides";
import { StepsInsertMessageType } from "@repo/data-ops/zod-schema/queue";

export async function handleStepsInsert(env: Env, event: StepsInsertMessageType) {
    const { guideId, steps } = event;

    console.log(`Processing ${steps.length} steps for guide ${guideId}`);

    try {
        // Insert steps into DB
        if (steps.length > 0) {
            await createStepsBatch(steps.map((step, index) => ({
                guideId: guideId,
                orderIndex: index,
                pageUrl: step.pageUrl || '',
                domSelector: step.domSelector || '',
                screenshotUrl: step.imageKey,
                isExcluded: false,
            })));
        }

        // Update guide status to draft
        await updateGuide(guideId, { status: 'draft' });

        console.log(`Successfully inserted ${steps.length} steps for guide ${guideId}`);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`Failed to insert steps for guide ${guideId}:`, errorMessage);
        throw error;
    }
}
