import { createStepsBatch } from "@repo/data-ops/queries/steps";
import { updateGuide, deleteGuide } from "@repo/data-ops/queries/guides";
import { deleteStepsByGuide } from "@repo/data-ops/queries/steps";
import { StepsInsertMessageType } from "@repo/data-ops/zod-schema/queue";

export async function handleStepsInsert(env: Env, event: StepsInsertMessageType) {
    const { guideId, steps } = event;

    console.log(`Processing ${steps.length} steps for guide ${guideId}`);
    console.log(`Steps data:`, JSON.stringify(steps, null, 2));

    try {
        // Insert steps into DB
        if (steps.length > 0) {
            const stepsToInsert = steps.map((step, index) => ({
                guideId: guideId,
                orderIndex: index,
                pageUrl: step.pageUrl || '',
                domSelector: step.domSelector || '',
                screenshotUrl: step.imageKey,
                isExcluded: false,
            }));
            
            console.log(`Inserting steps:`, JSON.stringify(stepsToInsert, null, 2));
            
            await createStepsBatch(stepsToInsert);
        }

        // Update guide status to draft
        await updateGuide(guideId, { status: 'draft' });

        console.log(`Successfully inserted ${steps.length} steps for guide ${guideId}`);
    } catch (error) {
        // BETTER ERROR LOGGING
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const errorStack = error instanceof Error ? error.stack : '';
        const errorName = error instanceof Error ? error.name : 'Unknown';
        
        console.error(`=== STEPS INSERT FAILED ===`);
        console.error(`Guide ID: ${guideId}`);
        console.error(`Error Name: ${errorName}`);
        console.error(`Error Message: ${errorMessage}`);
        console.error(`Error Stack: ${errorStack}`);
        console.error(`Full Error:`, error);
        
        // FALLBACK: Clean up zombie data
        await cleanupFailedGuide(env, guideId);
        
        throw error;
    }
}

async function cleanupFailedGuide(env: Env, guideId: string) {
    console.log(`Cleaning up failed guide: ${guideId}`);
    
    try {
        await deleteStepsByGuide(guideId);
        await deleteGuide(guideId);
        
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
