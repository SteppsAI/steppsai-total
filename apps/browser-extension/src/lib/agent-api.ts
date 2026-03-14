import { trpc } from './trpc';

export async function claimBrowserSession(input: {
    pairingToken: string;
    displayName?: string;
    capabilities: Record<string, unknown>;
}) {
    return trpc.agentRuntime.claimBrowserSession.mutate(input);
}

export async function heartbeatBrowserSession(input: {
    browserSessionId: string;
    capabilities: Record<string, unknown>;
}) {
    return trpc.agentRuntime.heartbeatBrowserSession.mutate(input);
}

export async function updateAgentRunState(input: {
    browserSessionId: string;
    runId: string;
    payload: {
        status: 'running' | 'paused_for_user' | 'failed';
        failureCode?: string | null;
        failureMessage?: string | null;
        stepCount?: number;
    };
}) {
    return trpc.agentRuntime.updateRunState.mutate(input);
}

export async function completeAgentRun(input: {
    browserSessionId: string;
    runId: string;
    payload: {
        title?: string;
        rawSteps: Array<Record<string, unknown>>;
        brandImageKey?: string | null;
    };
}) {
    return trpc.agentRuntime.completeRun.mutate(input);
}
