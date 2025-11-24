import { createGuide } from "@repo/data-ops/queries/guides";
import { createStepsBatch } from "@repo/data-ops/queries/steps";
import { RecordingIngestMessageType } from "@repo/data-ops/zod-schema/queue";
import { nanoid } from "nanoid";

export async function handleRecordingIngest(env: Env, event: RecordingIngestMessageType) {
    const { userId, data } = event;
    const { guide, steps } = data;

    console.log(`Processing recording for user ${userId}`);

    // 1. Create Guide
    const guideId = await createGuide({
        userId: userId,
        title: guide.title || "Untitled Recording",
        description: guide.description,
        slug: nanoid(10),
        status: "recording",
    });

    // 2. Create Steps
    if (steps.length > 0) {
        await createStepsBatch(steps.map(step => ({
            guideId: guideId,
            orderIndex: step.orderIndex,
            pageUrl: step.pageUrl,
            domSelector: step.domSelector,
            screenshotUrl: step.imageKey,
            isExcluded: false,
        })));
    }

    console.log(`Successfully ingested guide ${guideId} with ${steps.length} steps.`);
}