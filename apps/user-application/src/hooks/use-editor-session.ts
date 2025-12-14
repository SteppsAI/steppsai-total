import { useCallback, useEffect, useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Step, Guide } from '@/types/db';
import { trpc } from '@/router';

// Local session state type - uses DB Step type for compatibility
interface SessionState {
	title: string;
	steps: Step[];
}

interface EditorSession {
	// State
	guide: Guide | null;
	isLoading: boolean;
	isDirty: boolean;
	isSyncing: boolean;
	isSaving: boolean;
	lastSynced: Date | null;
	lastSaved: Date | null;
	error: string | null;

	// Actions
	updateTitle: (title: string) => void;
	updateSteps: (steps: Step[]) => void;
	updateStep: (stepId: string, updates: Partial<Step>) => void;
	save: () => Promise<void>;
	syncNow: () => Promise<void>;
	discard: () => Promise<void>;
}

// Sync to DO after 10 seconds of inactivity
const INACTIVITY_SYNC_DELAY = 10000;
// Max retries before giving up
const MAX_SYNC_RETRIES = 3;

/**
 * useEditorSession Hook
 * 
 * Smart state management with local-first approach:
 * 1. All edits update local state immediately (fast UI)
 * 2. After 10s of inactivity, sync to Durable Object (draft persistence)
 * 3. On explicit "Save", sync to DO then write to Database
 * 
 * Uses tRPC mutations which internally call BACKEND_SERVICE RPC methods.
 */
export function useEditorSession(guideId: string, initialGuide: Guide | null): EditorSession {
	// Local state - source of truth for UI
	const [localState, setLocalState] = useState<SessionState | null>(
		initialGuide ? { title: initialGuide.title || '', steps: initialGuide.steps || [] } : null
	);
	const [isLoading, setIsLoading] = useState(true);
	const [isDirty, setIsDirty] = useState(false);
	const [isSyncing, setIsSyncing] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [lastSynced, setLastSynced] = useState<Date | null>(null);
	const [lastSaved, setLastSaved] = useState<Date | null>(null);
	const [error, setError] = useState<string | null>(null);

	// Refs for sync management
	const inactivityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const pendingChangesRef = useRef<SessionState | null>(null);
	const syncRetriesRef = useRef(0);
	const hasErrorRef = useRef(false);

	// tRPC mutations
	const getSessionMutation = useMutation(trpc.editor.getSession.mutationOptions());
	const updateSessionMutation = useMutation(trpc.editor.updateSession.mutationOptions());
	const saveSessionMutation = useMutation(trpc.editor.saveSession.mutationOptions());
	const discardSessionMutation = useMutation(trpc.editor.discardSession.mutationOptions());

	// Sync pending changes to DO
	const syncToDO = useCallback(async (state: SessionState) => {
		if (!state || hasErrorRef.current) return;

		// Check retry limit
		if (syncRetriesRef.current >= MAX_SYNC_RETRIES) {
			console.error('[EditorSession] Max sync retries reached, stopping');
			return;
		}

		setIsSyncing(true);

		try {
			// Count overlays for logging
			const overlayCount = state.steps.reduce((count, step) => count + (step.overlays?.length || 0), 0);
			console.log(`[Sync] → DO: ${state.steps.length} steps, ${overlayCount} overlays`);

			await updateSessionMutation.mutateAsync({
				guideId,
				state: {
					title: state.title,
					steps: state.steps,
					lastModified: Date.now(),
				},
			});
			setLastSynced(new Date());
			pendingChangesRef.current = null;
			syncRetriesRef.current = 0; // Reset on success
			setError(null);
			console.log('[EditorSession] Synced to DO');
		} catch (err) {
			syncRetriesRef.current++;
			console.error('[EditorSession] Failed to sync to DO:', err);

			if (syncRetriesRef.current >= MAX_SYNC_RETRIES) {
				setError('Failed to sync. Changes saved locally only.');
				hasErrorRef.current = true;
			}
		} finally {
			setIsSyncing(false);
		}
	}, [guideId, updateSessionMutation]);

	// Schedule sync after inactivity
	const scheduleSync = useCallback((state: SessionState) => {
		// Don't schedule if we have persistent errors
		if (hasErrorRef.current) return;

		// Store pending changes
		pendingChangesRef.current = state;

		// Clear existing timer
		if (inactivityTimerRef.current) {
			clearTimeout(inactivityTimerRef.current);
		}

		// Schedule new sync after inactivity period
		inactivityTimerRef.current = setTimeout(() => {
			if (pendingChangesRef.current && !hasErrorRef.current) {
				syncToDO(pendingChangesRef.current);
			}
		}, INACTIVITY_SYNC_DELAY);
	}, [syncToDO]);

	// Initialize session on mount
	useEffect(() => {
		async function initSession() {
			if (!initialGuide) {
				setIsLoading(false);
				return;
			}

			setIsLoading(true);
			setError(null);
			hasErrorRef.current = false;
			syncRetriesRef.current = 0;

			try {
				const result = await getSessionMutation.mutateAsync({ guideId });

				if (result.source === 'draft' && result.data) {
					// Use draft from DO (user's unsaved work)
					const overlayCount = result.data.steps.reduce((count: number, step: any) => count + (step.overlays?.length || 0), 0);
					console.log(`[Sync] ← DO: ${result.data.steps.length} steps, ${overlayCount} overlays`);

					setLocalState({
						title: result.data.title,
						steps: result.data.steps,
					});
					setIsDirty(true);
					setLastSynced(new Date(result.data.lastModified));
				} else {
					// No draft - use initial guide data
					console.log('[EditorSession] No draft, using DB data');
					setLocalState({
						title: initialGuide.title || '',
						steps: initialGuide.steps || [],
					});
				}
			} catch (err) {
				console.error('[EditorSession] Failed to init session:', err);
				// Don't set error state - just use local data
				// The DO might not be available, that's okay
				setLocalState({
					title: initialGuide.title || '',
					steps: initialGuide.steps || [],
				});
			} finally {
				setIsLoading(false);
			}
		}

		initSession();

		// Cleanup on unmount
		return () => {
			if (inactivityTimerRef.current) {
				clearTimeout(inactivityTimerRef.current);
			}
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [guideId]);

	// Sync on page visibility change (user switches tab/closes)
	useEffect(() => {
		const handleVisibilityChange = () => {
			if (document.visibilityState === 'hidden' && pendingChangesRef.current && !hasErrorRef.current) {
				syncToDO(pendingChangesRef.current);
			}
		};

		document.addEventListener('visibilitychange', handleVisibilityChange);
		return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
	}, [syncToDO]);

	// Update title - local first, then schedule DO sync
	const updateTitle = useCallback((title: string) => {
		setLocalState(prev => {
			if (!prev) return prev;
			const updated = { ...prev, title };
			scheduleSync(updated);
			setIsDirty(true);
			return updated;
		});
	}, [scheduleSync]);

	// Update all steps - local first, then schedule DO sync
	const updateSteps = useCallback((steps: Step[]) => {
		setLocalState(prev => {
			if (!prev) return prev;
			const updated = { ...prev, steps };
			scheduleSync(updated);
			setIsDirty(true);
			return updated;
		});
	}, [scheduleSync]);

	// Update single step - local first, then schedule DO sync
	const updateStep = useCallback((stepId: string, updates: Partial<Step>) => {
		setLocalState(prev => {
			if (!prev) return prev;
			const updatedSteps = prev.steps.map(step =>
				step.id === stepId ? { ...step, ...updates } : step
			);
			const updated = { ...prev, steps: updatedSteps };
			scheduleSync(updated);
			setIsDirty(true);
			return updated;
		});
	}, [scheduleSync]);

	// Force sync to DO immediately
	const syncNow = useCallback(async () => {
		if (localState && !hasErrorRef.current) {
			if (inactivityTimerRef.current) {
				clearTimeout(inactivityTimerRef.current);
				inactivityTimerRef.current = null;
			}
			await syncToDO(localState);
		}
	}, [localState, syncToDO]);

	// Save to database (sync to DO first, then persist)
	const save = useCallback(async () => {
		if (!localState) return;

		setIsSaving(true);
		setError(null);

		try {
			// First, ensure DO has latest state (reset error state for save)
			hasErrorRef.current = false;
			syncRetriesRef.current = 0;
			await syncToDO(localState);

			// Then persist to database
			await saveSessionMutation.mutateAsync({ guideId });

			setIsDirty(false);
			setLastSaved(new Date());
			console.log('[EditorSession] Saved to database');
		} catch (err) {
			console.error('[EditorSession] Failed to save:', err);
			setError('Failed to save changes');
			throw err;
		} finally {
			setIsSaving(false);
		}
	}, [guideId, localState, syncToDO, saveSessionMutation]);

	// Discard draft and reload from initial
	const discard = useCallback(async () => {
		setError(null);
		hasErrorRef.current = false;
		syncRetriesRef.current = 0;

		try {
			if (inactivityTimerRef.current) {
				clearTimeout(inactivityTimerRef.current);
				inactivityTimerRef.current = null;
			}
			pendingChangesRef.current = null;

			await discardSessionMutation.mutateAsync({ guideId });

			setLocalState({
				title: initialGuide?.title || '',
				steps: initialGuide?.steps || [],
			});
			setIsDirty(false);
			setLastSynced(null);
			console.log('[EditorSession] Draft discarded');
		} catch (err) {
			console.error('[EditorSession] Failed to discard:', err);
			setError('Failed to discard draft');
			throw err;
		}
	}, [guideId, initialGuide]);

	// If the guide updates in the background (queue finished) hydrate steps once.
	useEffect(() => {
		if (!initialGuide) return;
		if (isDirty) return;
		if (!localState) return;

		const nextSteps = initialGuide.steps || [];
		const hasNewSteps = (localState.steps?.length || 0) === 0 && nextSteps.length > 0;
		if (!hasNewSteps) return;

		setLocalState({
			title: initialGuide.title || localState.title,
			steps: nextSteps,
		});
	}, [initialGuide?.updatedAt, initialGuide?.steps?.length, isDirty, localState]);

	// Build guide object from local state
	const guide: Guide | null = localState && initialGuide ? {
		...initialGuide,
		title: localState.title,
		steps: localState.steps,
	} : null;

	return {
		guide,
		isLoading,
		isDirty,
		isSyncing,
		isSaving,
		lastSynced,
		lastSaved,
		error,
		updateTitle,
		updateSteps,
		updateStep,
		save,
		syncNow,
		discard,
	};
}
