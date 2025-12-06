import { createGuide, deleteGuide, updateGuide, deleteStep } from '@repo/data-ops/queries';
import { nanoid } from 'nanoid';

/**
 * Guides RPC Methods
 * These are called directly from user-application via BACKEND_SERVICE binding
 */

export async function startRecording(env: Env, userId: string) {
    const guideId = await createGuide({
        userId,
        title: 'Recording in progress...',
        description: '',
        slug: nanoid(10),
        status: 'recording',
        visibility: 'private',
    });
    console.log(`[RPC] Created draft guide: ${guideId}`);
    return { success: true, guideId, userId };
}

export async function completeRecording(env: Env, guideId: string, title: string, steps: any[]) {
    await updateGuide(guideId, {
        title: title || 'Untitled Recording',
        status: 'processing'
    });

    await env.QUEUE.send({
        type: 'STEPS_INSERT',
        guideId,
        steps: steps || []
    });

    console.log(`[RPC] Guide ${guideId} sent to queue with ${steps?.length || 0} steps`);
    return { success: true, guideId };
}

export async function deleteGuideWithImages(env: Env, guideId: string) {
    // 1. Delete images from R2
    const prefix = `screenshots/${guideId}/`;
    const listed = await env.BUCKET.list({ prefix });

    if (listed.objects.length > 0) {
        await Promise.all(listed.objects.map(obj => env.BUCKET.delete(obj.key)));
        console.log(`[RPC] Deleted ${listed.objects.length} images from R2 for guide ${guideId}`);
    }

    // 2. Delete from DB
    await deleteGuide(guideId);
    console.log(`[RPC] Deleted guide: ${guideId}`);
    return { success: true };
}

export async function deleteStepWithImage(env: Env, guideId: string, stepId: string, imageKey?: string) {
    // 1. Delete image from R2 if exists
    if (imageKey) {
        try {
            let key = imageKey;
            if (key.startsWith('http')) {
                const url = new URL(key);
                key = url.pathname.startsWith('/') ? url.pathname.slice(1) : url.pathname;
            }
            await env.BUCKET.delete(key);
            console.log(`[RPC] Deleted image from R2: ${key}`);
        } catch (error) {
            console.warn('[RPC] Failed to delete image from R2:', error);
        }
    }

    // 2. Delete from DB
    await deleteStep(guideId, stepId);
    console.log(`[RPC] Deleted step ${stepId} from guide ${guideId}`);
    return { success: true };
}
