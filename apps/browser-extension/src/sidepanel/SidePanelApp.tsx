import { Play, Pause, ChevronDown, Trash2 } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import Logo from '../assets/logo.svg';
import { Button } from '../components/Button';
import { API_BASE_URL } from '../lib/constants';
import { generateStepDescription } from '../lib/helpers';
import type { RecordingState, Step } from '../types';

function SidePanelApp() {
    const [recordingState, setRecordingState] = useState<RecordingState>('idle');
    const [steps, setSteps] = useState<Step[]>([]);
    const stepsEndRef = useRef<HTMLDivElement>(null);

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
        stepsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [steps]);

    const handleStartRecording = async () => {
        const response = await chrome.runtime.sendMessage({ type: 'START_RECORDING' });
        if (response?.success) setRecordingState('recording');
    };

    const handlePauseRecording = () => setRecordingState('paused');
    const handleResumeRecording = () => setRecordingState('recording');

    const handleEndRecording = async () => {
        const response = await chrome.runtime.sendMessage({ type: 'STOP_RECORDING' });
        if (response?.success) {
            setRecordingState('idle');
            setSteps([]);
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

            {/* Fixed Header - Always same height */}
            <div className="z-10 shrink-0 h-[140px] px-6 flex flex-col items-center justify-center">
                <img src={Logo} alt="Stepps.ai Logo" className="w-16 h-16 object-contain shadow-lg rounded-lg" />
                
                {/* Status - Fixed height container */}
                <div className="h-[48px] flex flex-col items-center justify-center mt-2">
                    {isRecording ? (
                        <>
                            <div className="flex items-center gap-2">
                                <div className={`w-1.5 h-1.5 rounded-full ${recordingState === 'recording' ? 'bg-rose-500 animate-pulse' : 'bg-amber-500'}`} />
                                <span className="font-normal text-lg text-slate-900 capitalize">{recordingState}</span>
                            </div>
                            <span className="text-slate-600 text-sm">({steps.length} steps captured)</span>
                        </>
                    ) : (
                        <h1 className="text-[18px] font-normal text-slate-900 leading-snug text-center">
                            Capture any workflow <span className="text-[#6366F1]">in seconds</span>.
                        </h1>
                    )}
                </div>
            </div>

            {/* Scrollable Content Area */}
            <div className="z-10 flex-1 min-h-0 px-6 py-4 overflow-hidden flex flex-col">
                {isRecording ? (
                    <>
                        {/* Steps List */}
                        <div className="flex-1 overflow-y-auto min-h-0 space-y-2">
                            {steps.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                                    <ChevronDown className="w-8 h-8 animate-bounce" />
                                    <p className="text-sm mt-2">Click anywhere to capture</p>
                                </div>
                            ) : (
                                <>
                                    {steps.map((step, index) => (
                                        <div
                                            key={step.stepId || index}
                                            className="bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200 shadow-sm overflow-hidden"
                                        >
                                            <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-100">
                                                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#6366F1] text-white text-xs font-bold">
                                                    {index + 1}
                                                </div>
                                                <span className="text-sm font-medium text-slate-800 truncate flex-1">
                                                    {generateStepDescription(step.domSelector)}
                                                </span>
                                            </div>
                                            <div className="aspect-video bg-slate-100">
                                                <img
                                                    src={`${API_BASE_URL}/images/${step.imageKey}`}
                                                    alt={`Step ${index + 1}`}
                                                    className="w-full h-full object-cover"
                                                    loading="lazy"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                    <div ref={stepsEndRef} />
                                </>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-start justify-center pt-4">
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
                {isRecording ? (
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
