import { useState, useCallback } from 'react';
import { Annotation } from '@/components/editor/annotation-types';
import type { HistoryState } from '@repo/data-ops/zod-schema';


export function useAnnotationHistory(initialAnnotations: Annotation[] = []) {
    const [history, setHistory] = useState<HistoryState>({
        past: [],
        present: initialAnnotations,
        future: [],
    });

    const canUndo = history.past.length > 0;
    const canRedo = history.future.length > 0;

    const set = useCallback((annotations: Annotation[]) => {
        setHistory((prev) => ({
            past: [...prev.past, prev.present],
            present: annotations,
            future: [], // Clear future when new action is taken
        }));
    }, []);

    const undo = useCallback(() => {
        setHistory((prev) => {
            if (prev.past.length === 0) return prev;

            const newPast = [...prev.past];
            const newPresent = newPast.pop()!;

            return {
                past: newPast,
                present: newPresent,
                future: [prev.present, ...prev.future],
            };
        });
    }, []);

    const redo = useCallback(() => {
        setHistory((prev) => {
            if (prev.future.length === 0) return prev;

            const newFuture = [...prev.future];
            const newPresent = newFuture.shift()!;

            return {
                past: [...prev.past, prev.present],
                present: newPresent,
                future: newFuture,
            };
        });
    }, []);

    const reset = useCallback((annotations: Annotation[] = []) => {
        setHistory({
            past: [],
            present: annotations,
            future: [],
        });
    }, []);

    return {
        annotations: history.present,
        set,
        undo,
        redo,
        canUndo,
        canRedo,
        reset,
    };
}
