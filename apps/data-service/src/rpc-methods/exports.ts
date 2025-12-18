/**
 * Exports RPC Methods
 * These are called directly from user-application via BACKEND_SERVICE binding
 */

export async function triggerExport(env: Env, guideId: string, format: 'pdf' | 'html' | 'docx') {
    await env.GUIDE_EXPORT_WORKFLOW.create({
        params: { guideId, format }
    });
    console.log(`[RPC] Triggered ${format} export for guide ${guideId}`);
    return { success: true, status: 'PENDING' };
}
