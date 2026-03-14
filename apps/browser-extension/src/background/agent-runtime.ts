/// <reference types="chrome" />

import { trpc } from '../lib/trpc';
import {
    claimBrowserSession,
    heartbeatBrowserSession,
    updateAgentRunState,
    completeAgentRun,
} from '../lib/agent-api';

const AGENT_RUNTIME_ALARM = 'stepps-agent-runtime-heartbeat';

type AgentAction = {
    id: string;
    type: 'open_tab' | 'focus_tab' | 'navigate' | 'click' | 'type' | 'press' | 'wait_for' | 'scroll' | 'capture' | 'extract_text';
    title: string;
    description?: string;
    url?: string;
    selector?: string;
    text?: string;
    value?: string;
    key?: string;
    timeoutMs?: number;
    recordStep?: boolean;
};

type AgentRun = {
    agentRunId: string;
    guideId: string | null;
    browserSessionId: string;
    status: 'queued' | 'planning' | 'waiting_for_browser' | 'running' | 'paused_for_user' | 'processing_guide' | 'generating_docs' | 'completed' | 'failed' | 'cancelled';
    title?: string | null;
    prompt: string;
    runtime: {
        maxSteps: number;
        maxDurationSec: number;
        screenshotPolicy: 'after_each_step';
        stopOnAuthWall: boolean;
    };
    plannerOutput?: {
        title: string;
        summary: string;
        actions: AgentAction[];
    } | null;
};

type StoredAgentSession = {
    browserSessionId: string;
    displayName?: string;
};

type RecordedStep = {
    id: string;
    type: 'click' | 'navigate' | 'manual';
    orderIndex: number;
    imageKey?: string;
    pageUrl: string;
    domSelector?: string;
    x?: number;
    y?: number;
};

let heartbeatInFlight = false;
let activeRunId: string | null = null;

async function getStoredAgentSession(): Promise<StoredAgentSession | null> {
    const result = await chrome.storage.local.get(['agentBrowserSession']);
    return (result.agentBrowserSession as StoredAgentSession | undefined) || null;
}

async function setStoredAgentSession(session: StoredAgentSession | null) {
    if (!session) {
        await chrome.storage.local.remove(['agentBrowserSession']);
        return;
    }
    await chrome.storage.local.set({ agentBrowserSession: session });
}

function getCapabilities() {
    return {
        platform: navigator.platform,
        browser: 'chrome',
        browserVersion: navigator.userAgent,
        extensionVersion: chrome.runtime.getManifest().version,
        actions: ['open_tab', 'focus_tab', 'navigate', 'click', 'type', 'press', 'wait_for', 'scroll', 'capture', 'extract_text'],
        supportsLiveBroker: false,
        supportsManualRecording: true,
    };
}

function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getTab(tabId: number): Promise<chrome.tabs.Tab> {
    return chrome.tabs.get(tabId);
}

async function waitForTabComplete(tabId: number, timeoutMs = 20000): Promise<chrome.tabs.Tab> {
    const existing = await chrome.tabs.get(tabId);
    if (existing.status === 'complete') return existing;

    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            chrome.tabs.onUpdated.removeListener(listener);
            reject(new Error('tab_load_timeout'));
        }, timeoutMs);

        const listener = (updatedTabId: number, changeInfo: chrome.tabs.TabChangeInfo, tab: chrome.tabs.Tab) => {
            if (updatedTabId === tabId && changeInfo.status === 'complete') {
                clearTimeout(timeout);
                chrome.tabs.onUpdated.removeListener(listener);
                resolve(tab);
            }
        };

        chrome.tabs.onUpdated.addListener(listener);
    });
}

async function activateTab(tabId: number) {
    const tab = await chrome.tabs.get(tabId);
    if (tab.windowId !== undefined) {
        await chrome.windows.update(tab.windowId, { focused: true });
    }
    await chrome.tabs.update(tabId, { active: true });
    return chrome.tabs.get(tabId);
}

async function queryTabSnapshot(tabId: number) {
    const [{ result }] = await chrome.scripting.executeScript({
        target: { tabId },
        func: () => {
            const passwordField = !!document.querySelector('input[type="password"]');
            const bodyText = (document.body?.innerText || '').slice(0, 4000).toLowerCase();
            const title = document.title || '';
            return {
                title,
                url: location.href,
                passwordField,
                bodyText,
            };
        },
    });

    return result as {
        title: string;
        url: string;
        passwordField: boolean;
        bodyText: string;
    };
}

function detectBlocker(snapshot: { passwordField: boolean; bodyText: string }) {
    const text = snapshot.bodyText;
    if (
        text.includes('captcha') ||
        text.includes('verify you are human') ||
        text.includes('verification') ||
        text.includes('real people')
    ) {
        return { code: 'captcha_required', message: 'The target page presented a verification or CAPTCHA wall.' };
    }

    if (
        snapshot.passwordField ||
        text.includes('sign in') ||
        text.includes('log in') ||
        text.includes('two-factor') ||
        text.includes('2fa')
    ) {
        return { code: 'auth_required', message: 'The run requires authentication or human sign-in.' };
    }

    return null;
}

async function waitForSelector(tabId: number, selector: string, timeoutMs = 10000) {
    const startedAt = Date.now();
    while (Date.now() - startedAt < timeoutMs) {
        const [{ result }] = await chrome.scripting.executeScript({
            target: { tabId },
            args: [selector],
            func: (querySelector) => {
                const element = document.querySelector(querySelector);
                if (!element) return null;
                const rect = (element as HTMLElement).getBoundingClientRect();
                return {
                    exists: true,
                    x: ((rect.left + rect.width / 2) / window.innerWidth) * 100,
                    y: ((rect.top + rect.height / 2) / window.innerHeight) * 100,
                };
            },
        });

        if (result?.exists) {
            return result as { exists: true; x: number; y: number };
        }

        await sleep(300);
    }

    throw new Error(`selector_not_found:${selector}`);
}

async function executeScriptInTab<T>(tabId: number, func: (...args: any[]) => T, args: any[] = []) {
    const [{ result }] = await chrome.scripting.executeScript({
        target: { tabId },
        func,
        args,
    });

    return result as T;
}

async function captureStepScreenshot(tab: chrome.tabs.Tab, run: AgentRun, stepIndex: number) {
    if (!tab.windowId) {
        throw new Error('missing_window_id');
    }

    await activateTab(tab.id!);
    await sleep(250);
    const dataUrl = await chrome.tabs.captureVisibleTab(tab.windowId, { format: 'png' });
    const key = `screenshots/${run.guideId}/${String(stepIndex + 1).padStart(3, '0')}-${crypto.randomUUID()}.png`;
    await trpc.images.upload.mutate({ key, dataUrl });
    return key;
}

async function maybeUploadBrandImage(run: AgentRun, tab: chrome.tabs.Tab) {
    const faviconUrl = tab.favIconUrl;
    if (!faviconUrl || !run.guideId) return null;
    try {
        const response = await fetch(faviconUrl);
        if (!response.ok) return null;
        const buffer = await response.arrayBuffer();
        const bytes = new Uint8Array(buffer);
        const chunkSize = 8192;
        let binary = '';
        for (let i = 0; i < bytes.length; i += chunkSize) {
            const chunk = bytes.subarray(i, Math.min(i + chunkSize, bytes.length));
            binary += String.fromCharCode(...chunk);
        }
        const contentType = response.headers.get('Content-Type') || 'image/png';
        const dataUrl = `data:${contentType};base64,${btoa(binary)}`;

        const key = `guides/${run.guideId}/brand-${crypto.randomUUID()}.png`;
        await trpc.images.upload.mutate({ key, dataUrl });
        return key;
    } catch {
        return null;
    }
}

async function recordStep(run: AgentRun, tabId: number, action: AgentAction, orderIndex: number, meta?: { x?: number; y?: number; pageUrl?: string }) {
    const tab = await chrome.tabs.get(tabId);
    const imageKey = action.recordStep === false ? undefined : await captureStepScreenshot(tab, run, orderIndex);
    const pageUrl = meta?.pageUrl || tab.url || '';

    return {
        id: crypto.randomUUID(),
        type: action.type === 'navigate' ? 'navigate' : action.type === 'click' ? 'click' : 'manual',
        orderIndex,
        imageKey,
        pageUrl,
        domSelector: action.selector,
        x: meta?.x,
        y: meta?.y,
    } satisfies RecordedStep;
}

async function executeAction(tabId: number, action: AgentAction) {
    switch (action.type) {
        case 'open_tab': {
            const tab = await chrome.tabs.create({ url: action.url || 'about:blank', active: true });
            if (!tab.id) throw new Error('tab_create_failed');
            await waitForTabComplete(tab.id, action.timeoutMs || 20000);
            return {
                tabId: tab.id,
                pageUrl: tab.url || action.url || 'about:blank',
            };
        }
        case 'focus_tab': {
            const tab = await activateTab(tabId);
            return { tabId: tab.id!, pageUrl: tab.url || '' };
        }
        case 'navigate': {
            const updated = await chrome.tabs.update(tabId, { url: action.url! });
            if (!updated.id) throw new Error('tab_navigation_failed');
            const loaded = await waitForTabComplete(updated.id, action.timeoutMs || 25000);
            return { tabId: loaded.id!, pageUrl: loaded.url || action.url || '' };
        }
        case 'wait_for': {
            if (!action.selector) throw new Error('selector_not_found:missing_selector');
            await waitForSelector(tabId, action.selector, action.timeoutMs || 10000);
            const tab = await getTab(tabId);
            return { tabId, pageUrl: tab.url || '' };
        }
        case 'click': {
            if (!action.selector) throw new Error('selector_not_found:missing_selector');
            const match = await waitForSelector(tabId, action.selector, action.timeoutMs || 10000);
            await executeScriptInTab(tabId, (selector) => {
                const element = document.querySelector(selector) as HTMLElement | null;
                if (!element) throw new Error('selector_not_found');
                element.scrollIntoView({ block: 'center', inline: 'center', behavior: 'auto' });
                element.click();
            }, [action.selector]);
            await sleep(500);
            const tab = await getTab(tabId);
            return { tabId, pageUrl: tab.url || '', x: match.x, y: match.y };
        }
        case 'type': {
            if (!action.selector) throw new Error('selector_not_found:missing_selector');
            await waitForSelector(tabId, action.selector, action.timeoutMs || 10000);
            await executeScriptInTab(tabId, (selector, value) => {
                const element = document.querySelector(selector) as HTMLInputElement | HTMLTextAreaElement | null;
                if (!element) throw new Error('selector_not_found');
                element.scrollIntoView({ block: 'center', inline: 'center', behavior: 'auto' });
                element.focus();
                element.value = value;
                element.dispatchEvent(new Event('input', { bubbles: true }));
                element.dispatchEvent(new Event('change', { bubbles: true }));
            }, [action.selector, action.value || action.text || '']);
            const tab = await getTab(tabId);
            return { tabId, pageUrl: tab.url || '' };
        }
        case 'press': {
            await executeScriptInTab(tabId, (key) => {
                const target = (document.activeElement as HTMLElement | null) || document.body;
                target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
                target.dispatchEvent(new KeyboardEvent('keyup', { key, bubbles: true }));
                if (key === 'Enter' && target instanceof HTMLInputElement && target.form) {
                    target.form.requestSubmit();
                }
            }, [action.key || 'Enter']);
            await sleep(500);
            const tab = await getTab(tabId);
            return { tabId, pageUrl: tab.url || '' };
        }
        case 'scroll': {
            await executeScriptInTab(tabId, (selector) => {
                if (selector) {
                    const element = document.querySelector(selector);
                    if (element) {
                        element.scrollIntoView({ block: 'center', inline: 'center', behavior: 'auto' });
                        return;
                    }
                }
                window.scrollBy({ top: window.innerHeight * 0.7, behavior: 'auto' });
            }, [action.selector || null]);
            await sleep(250);
            const tab = await getTab(tabId);
            return { tabId, pageUrl: tab.url || '' };
        }
        case 'capture': {
            const tab = await getTab(tabId);
            return { tabId, pageUrl: tab.url || '' };
        }
        case 'extract_text': {
            const text = await executeScriptInTab(tabId, (selector) => {
                const element = selector ? document.querySelector(selector) : document.body;
                return element?.textContent?.trim().slice(0, 1000) || '';
            }, [action.selector || null]);
            const tab = await getTab(tabId);
            return { tabId, pageUrl: tab.url || '', extractedText: text };
        }
        default: {
            const neverValue: never = action.type;
            throw new Error(`unsupported_action:${neverValue}`);
        }
    }
}

async function createInitialTab(run: AgentRun) {
    const firstUrl = run.plannerOutput?.actions.find((action) => action.url)?.url || 'about:blank';
    const tab = await chrome.tabs.create({ url: firstUrl, active: true });
    if (!tab.id) {
        throw new Error('failed_to_create_initial_tab');
    }
    await waitForTabComplete(tab.id, 20000).catch(() => tab);
    return chrome.tabs.get(tab.id);
}

async function runAutonomousCapture(run: AgentRun, session: StoredAgentSession) {
    if (!run.guideId || !run.plannerOutput?.actions?.length) {
        throw new Error('planner_failed');
    }

    activeRunId = run.agentRunId;
    await chrome.storage.local.set({ agentActiveRunId: run.agentRunId });
    await updateAgentRunState({
        browserSessionId: session.browserSessionId,
        runId: run.agentRunId,
        payload: { status: 'running', stepCount: 0 },
    });

    const recordedSteps: RecordedStep[] = [];
    let activeTab = await createInitialTab(run);
    const brandImageKey = await maybeUploadBrandImage(run, activeTab);
    const startedAt = Date.now();

    try {
        for (const action of run.plannerOutput.actions.slice(0, run.runtime.maxSteps)) {
            if (Date.now() - startedAt > run.runtime.maxDurationSec * 1000) {
                throw new Error('run_timeout');
            }

            const result = await executeAction(activeTab.id!, action);
            activeTab = await chrome.tabs.get(result.tabId);

            const snapshot = await queryTabSnapshot(activeTab.id!);
            const blocker = run.runtime.stopOnAuthWall ? detectBlocker(snapshot) : null;
            if (blocker) {
                await updateAgentRunState({
                    browserSessionId: session.browserSessionId,
                    runId: run.agentRunId,
                    payload: {
                        status: 'paused_for_user',
                        failureCode: blocker.code,
                        failureMessage: blocker.message,
                        stepCount: recordedSteps.length,
                    },
                });
                return;
            }

            if (action.recordStep !== false && action.type !== 'extract_text') {
                const step = await recordStep(
                    run,
                    activeTab.id!,
                    action,
                    recordedSteps.length,
                    { x: result.x, y: result.y, pageUrl: result.pageUrl }
                );
                recordedSteps.push(step);
                await updateAgentRunState({
                    browserSessionId: session.browserSessionId,
                    runId: run.agentRunId,
                    payload: {
                        status: 'running',
                        stepCount: recordedSteps.length,
                    },
                });
            }
        }

        await completeAgentRun({
            browserSessionId: session.browserSessionId,
            runId: run.agentRunId,
            payload: {
                title: run.plannerOutput.title || run.title || undefined,
                rawSteps: recordedSteps,
                brandImageKey,
            },
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'unknown_run_error';
        const failureCode =
            message.startsWith('selector_not_found') ? 'selector_not_found' :
            message === 'run_timeout' ? 'run_timeout' :
            message === 'upload_failed' ? 'upload_failed' :
            'planner_failed';

        await updateAgentRunState({
            browserSessionId: session.browserSessionId,
            runId: run.agentRunId,
            payload: {
                status: 'failed',
                failureCode,
                failureMessage: message,
                stepCount: recordedSteps.length,
            },
        });
    } finally {
        activeRunId = null;
        await chrome.storage.local.remove(['agentActiveRunId']);
    }
}

export async function pairAgentBrowserSession(pairingToken: string, displayName?: string) {
    const result = await claimBrowserSession({
        pairingToken,
        displayName,
        capabilities: getCapabilities(),
    });

    const session = {
        browserSessionId: result.browserSession.browserSessionId,
        displayName: result.browserSession.displayName || displayName,
    } satisfies StoredAgentSession;

    await setStoredAgentSession(session);
    await triggerAgentHeartbeat();
    return result;
}

export async function getAgentRuntimeState() {
    const session = await getStoredAgentSession();
    const { agentActiveRunId } = await chrome.storage.local.get(['agentActiveRunId']);
    return {
        session,
        activeRunId: agentActiveRunId || null,
    };
}

export async function clearAgentBrowserSession() {
    activeRunId = null;
    await chrome.storage.local.remove(['agentActiveRunId']);
    await setStoredAgentSession(null);
}

export async function triggerAgentHeartbeat() {
    if (heartbeatInFlight) return { success: false, skipped: true };
    heartbeatInFlight = true;

    try {
        const session = await getStoredAgentSession();
        if (!session) return { success: false, reason: 'no_session' };

        const result = await heartbeatBrowserSession({
            browserSessionId: session.browserSessionId,
            capabilities: getCapabilities(),
        });

        const currentRun = result.currentRun as AgentRun | null;
        if (
            currentRun &&
            currentRun.status === 'waiting_for_browser' &&
            currentRun.agentRunId !== activeRunId
        ) {
            void runAutonomousCapture(currentRun, session);
        }

        return { success: true, currentRun };
    } catch (error) {
        console.error('[AgentRuntime] Heartbeat failed:', error);
        return { success: false, reason: error instanceof Error ? error.message : 'heartbeat_failed' };
    } finally {
        heartbeatInFlight = false;
    }
}

export async function initializeAgentRuntime() {
    await chrome.alarms.create(AGENT_RUNTIME_ALARM, { periodInMinutes: 1 });
}

export function registerAgentRuntimeAlarmListener() {
    chrome.alarms.onAlarm.addListener((alarm) => {
        if (alarm.name === AGENT_RUNTIME_ALARM) {
            void triggerAgentHeartbeat();
        }
    });
}
