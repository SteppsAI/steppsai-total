/**
 * Editor RPC Methods
 * These are called directly from user-application via BACKEND_SERVICE binding
 */

export async function getEditorState(env: Env, guideId: string) {
    const stub = env.GUIDE_SESSION.get(env.GUIDE_SESSION.idFromName(guideId));
    await stub.setGuideId(guideId);
    return await stub.getState();
}

export async function updateEditorState(env: Env, guideId: string, state: any) {
    const stub = env.GUIDE_SESSION.get(env.GUIDE_SESSION.idFromName(guideId));
    return await stub.updateState(state);
}

export async function saveEditorSession(env: Env, guideId: string) {
    const stub = env.GUIDE_SESSION.get(env.GUIDE_SESSION.idFromName(guideId));
    const result = await stub.saveToDb(guideId);
    console.log(`[RPC] Saved guide ${guideId} to database`);
    return result;
}

export async function discardEditorSession(env: Env, guideId: string) {
    const stub = env.GUIDE_SESSION.get(env.GUIDE_SESSION.idFromName(guideId));
    const result = await stub.discard();
    console.log(`[RPC] Discarded draft for ${guideId}`);
    return result;
}
