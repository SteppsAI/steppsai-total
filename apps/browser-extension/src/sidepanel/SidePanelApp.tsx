import { Play, Pause, Trash2, Loader2 } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import Logo from '../assets/logo.svg';
import { Button } from '../components/Button';
import { WEB_APP_URL } from '../lib/config';
import { API_BASE_URL } from '../lib/constants';
import { generateStepDescription } from '../lib/helpers';
import type { RecordingState, Step } from '../types';

function SidePanelApp() {
    const [recordingState, setRecordingState] = useState<RecordingState>('idle');
    const [steps, setSteps] = useState<Step[]>([]);
    const [guideId, setGuideId] = useState<string | null>(null);

    const stepsContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chrome.storage.local.get(['isRecording', 'steps'], (result) => {
            if (result.isRecording) {
                setRecordingState('recording');
            }
            if (result.steps) {
                setSteps(result.steps);
            }
        });

        const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }) => {
            if (changes.isRecording) {
                setRecordingState(changes.isRecording.newValue ? 'recording' : 'idle');
            }
            if (changes.steps) {
                setSteps(changes.steps.newValue || []);
            }
        };

        chrome.storage.onChanged.addListener(handleStorageChange);
        return () => chrome.storage.onChanged.removeListener(handleStorageChange);
    }, []);

    useEffect(() => {
        if (stepsContainerRef.current) {
            stepsContainerRef.current.scrollTop = stepsContainerRef.current.scrollHeight;
        }
    }, [steps]);

    useEffect(() => {
        if (recordingState === 'finished' && guideId) {
            const timer = setTimeout(() => {
                chrome.tabs.create({ url: `${WEB_APP_URL}/app/editor/${guideId}` });
                window.close();
                setRecordingState('idle');
                setSteps([]);
                setGuideId(null);
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [recordingState, guideId]);

    const handleStartRecording = async () => {
        const response = await chrome.runtime.sendMessage({ type: 'START_RECORDING' });
        if (response?.success) setRecordingState('recording');
    };

    const handlePauseRecording = async () => {
        setRecordingState('paused');
        await chrome.storage.local.set({ isPaused: true });
    };

    const handleResumeRecording = async () => {
        setRecordingState('recording');
        await chrome.storage.local.set({ isPaused: false });
    };

    const handleEndRecording = async () => {

        const response = await chrome.runtime.sendMessage({ type: 'STOP_RECORDING' });
        if (response?.success) {
            setRecordingState('finished');
            setGuideId(response.guideId);
            // setSteps([]); // Keep steps to show count or preview if needed, or clear them
        }
    };

    const handleDiscardRecording = async () => {
        const response = await chrome.runtime.sendMessage({ type: 'DISCARD_RECORDING' });
        if (response?.success) {
            setRecordingState('idle');
            setSteps([]);
        }
    };

    const isRecording = recordingState !== 'idle';

    return (
        <div className="w-full h-screen flex flex-col relative overflow-hidden font-inter bg-background">
            {/* Background Gradient */}
            <div
                className="absolute inset-0 z-0 pointer-events-none"
                style={{
                    background: 'radial-gradient(circle at 50% 30%, #ffffff 10%, #06B6D440 50%, #6366F140 90%)'
                }}
            />
            <div className="absolute top-[-20%] left-[-20%] w-[70%] h-[70%] bg-[#06B6D4] opacity-20 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-20%] w-[70%] h-[70%] bg-[#6366F1] opacity-20 blur-[120px] rounded-full pointer-events-none" />

            {/* Header - Only visible when recording and not finished */}
            {isRecording && recordingState !== 'finished' && (
                <div className="z-10 shrink-0 px-6 pt-8 pb-4 flex flex-col items-center justify-center">
                    <img src={Logo} alt="Stepps.ai Logo" className="w-12 h-12 object-contain shadow-lg mb-4" />

                    {/* Status */}
                    <div className="min-h-[48px] flex flex-col items-center justify-center">
                        <div className="flex items-center gap-2 mb-1">
                            <div className={`w-2 h-2 rounded-full ${recordingState === 'recording' ? 'bg-rose-500 animate-pulse' : 'bg-amber-500'}`} />
                            <span className="font-medium text-lg text-slate-900 capitalize">{recordingState}</span>
                        </div>
                        <span className="text-slate-500 text-sm font-medium">({steps.length} steps captured)</span>
                    </div>
                </div>
            )}

            {/* Scrollable Content Area */}
            <div className="z-10 flex-1 min-h-0 px-6 py-4 overflow-hidden flex flex-col">
                {recordingState === 'finished' ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
                        <div className="mb-6">
                            <Loader2 className="w-12 h-12 text-[#6366F1] animate-spin" />
                        </div>
                        <h1 className="text-[24px] font-medium text-slate-900 leading-tight mb-2">
                            Recording Finished!
                        </h1>
                        <p className="text-slate-500 mb-8">
                            You will now be redirected to the editor...
                        </p>
                        <Button
                            variant="primary"
                            className="w-full max-w-[240px] shadow-xl shadow-indigo-500/20 bg-[#6366F1] hover:bg-[#5558DD] text-white rounded-xl py-3 text-lg font-medium"
                            onClick={() => {
                                if (guideId) {
                                    chrome.tabs.create({ url: `${WEB_APP_URL}/app/editor/${guideId}` });
                                    window.close();
                                    setRecordingState('idle');
                                    setSteps([]);
                                    setGuideId(null);
                                }
                            }}
                            icon={<Play className="w-5 h-5 fill-current" />}
                        >
                            Open Editor Now
                        </Button>
                    </div>
                ) : isRecording ? (
                    <>
                        {/* Steps List */}
                        <div ref={stepsContainerRef} className="flex-1 overflow-y-auto min-h-0 space-y-2 scrollbar-hide">
                            {steps.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full">
                                    <p className="text-sm font-medium text-slate-400">Click anywhere to capture</p>
                                </div>
                            ) : (
                                steps.map((step, index) => (
                                    <div
                                        key={step.id || index}
                                        className="bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200 shadow-sm overflow-hidden group"
                                    >
                                        <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-100">
                                            <div className={`flex items-center justify-center w-6 h-6 rounded-full ${step.type === 'navigate' ? 'bg-slate-500' : 'bg-[#6366F1]'} text-white text-xs font-bold shrink-0`}>
                                                {index + 1}
                                            </div>
                                            <span className="text-sm font-medium text-slate-800 truncate flex-1">
                                                {step.type === 'navigate'
                                                    ? `Navigate to ${new URL(step.pageUrl).hostname}`
                                                    : generateStepDescription(step.domSelector || '')}
                                            </span>
                                            <button
                                                onClick={async (e) => {
                                                    e.stopPropagation();
                                                    await chrome.runtime.sendMessage({
                                                        type: 'DELETE_STEP',
                                                        payload: { stepId: step.id }
                                                    });
                                                }}
                                                className="p-1 text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                title="Delete step"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                        {step.type === 'click' && (
                                            <div className="w-full relative bg-slate-100">
                                                <img
                                                    src={step.previewUrl || `${API_BASE_URL}/images/${step.imageKey}`}
                                                    alt={`Step ${index + 1}`}
                                                    className="w-full h-auto block"
                                                    loading="lazy"
                                                />
                                                {step.x !== undefined && step.y !== undefined && (
                                                    <div
                                                        className="absolute pointer-events-none"
                                                        style={{
                                                            left: `${step.x}%`,
                                                            top: `${step.y}%`,
                                                            transform: 'translate(-50%, -50%)'
                                                        }}
                                                    >
                                                        {/* Outer pulsing ring */}
                                                        <div className="absolute w-8 h-8 -ml-4 -mt-4 rounded-full border-2 border-rose-500 bg-rose-500/20 animate-ping" />
                                                        {/* Inner solid circle */}
                                                        <div className="w-4 h-4 -ml-2 -mt-2 rounded-full bg-rose-500 border-2 border-white shadow-lg" />
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        {step.type === 'navigate' && (
                                            <div className="px-3 py-2 bg-slate-50 text-xs text-slate-500 truncate font-mono">
                                                {step.pageUrl}
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center">
                        <img src={Logo} alt="Stepps.ai Logo" className="w-16 h-16 object-contain shadow-lg mb-6" />
                        <h1 className="text-[24px] font-medium text-slate-900 leading-tight text-center max-w-[280px] mb-8">
                            Capture any workflow <span className="text-[#6366F1]">in seconds</span>.
                        </h1>
                        <Button
                            variant="primary"
                            className="w-full max-w-[240px] shadow-xl shadow-indigo-500/20 bg-[#6366F1] hover:bg-[#5558DD] text-white rounded-xl py-3 text-lg font-medium"
                            onClick={handleStartRecording}
                            icon={<Play className="w-5 h-5 fill-current" />}
                        >
                            Start Recording
                        </Button>
                    </div>
                )}
            </div>

            {/* Fixed Footer */}
            <div className="z-10 shrink-0 px-6 pb-6">
                {recordingState === 'finished' ? null : isRecording ? (
                    <div className="space-y-2">
                        <Button
                            variant="primary"
                            className="w-full bg-[#6366F1] hover:bg-[#5558DD] text-white shadow-lg shadow-indigo-500/20 rounded-xl py-3 font-medium text-lg"
                            onClick={handleEndRecording}
                        >
                            End Recording
                        </Button>
                        {recordingState === 'recording' ? (
                            <Button
                                variant="danger"
                                className="w-full bg-[#F43F5E] hover:bg-[#E11D48] text-white shadow-lg shadow-rose-500/20 rounded-xl py-3 font-medium text-lg"
                                onClick={handlePauseRecording}
                                icon={<Pause className="w-5 h-5 fill-current" />}
                            >
                                Pause Recording
                            </Button>
                        ) : (
                            <Button
                                variant="secondary"
                                className="w-full bg-[#06B6D4] hover:bg-[#0891B2] text-white shadow-lg shadow-cyan-500/20 rounded-xl py-3 font-medium text-lg"
                                onClick={handleResumeRecording}
                                icon={<Play className="w-5 h-5 fill-current" />}
                            >
                                Continue
                            </Button>
                        )}
                        <Button
                            variant="danger"
                            className="w-full bg-slate-600 hover:bg-slate-700 text-white shadow-lg shadow-slate-500/20 rounded-xl py-3 font-medium text-lg"
                            onClick={handleDiscardRecording}
                            icon={<Trash2 className="w-5 h-5" />}
                        >
                            Delete Recording
                        </Button>
                    </div>
                ) : (
                    <div className="text-center">
                        <a href="#" className="text-sm text-slate-900 underline decoration-slate-900 underline-offset-4">
                            open dashboard
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
}

export default SidePanelApp;
