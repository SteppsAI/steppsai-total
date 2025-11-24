import { Play, Pause, Image as ImageIcon } from 'lucide-react';
import { useState } from 'react';
import Logo from '../assets/logo.svg';
import { Button } from '../components/Button';

type RecordingState = 'idle' | 'recording' | 'paused';

function SidePanelApp() {
    const [recordingState, setRecordingState] = useState<RecordingState>('idle');

    const handleStartRecording = () => {
        setRecordingState('recording');
    };

    const handlePauseRecording = () => {
        setRecordingState('paused');
    };

    const handleResumeRecording = () => {
        setRecordingState('recording');
    };

    const handleEndRecording = () => {
        console.log('End Recording');
        setRecordingState('idle');
    };

    return (
        <div className="w-full h-screen flex flex-col items-center py-8 px-6 relative overflow-hidden font-inter bg-background">
            {/* Background Gradient - More colorful and vibrant */}
            <div
                className="absolute inset-0 z-0 pointer-events-none"
                style={{
                    background: 'radial-gradient(circle at 50% 0%, #ffffff 0%, rgba(6, 182, 212, 0.2) 40%, rgba(99, 102, 241, 0.2) 70%, rgba(244, 63, 94, 0.1) 100%)'
                }}
            />

            {/* Additional decorative blur blobs for more color */}
            <div className="absolute top-[-10%] left-[-20%] w-[50%] h-[50%] bg-cyan-400/20 blur-[100px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-20%] w-[50%] h-[50%] bg-indigo-400/20 blur-[100px] rounded-full pointer-events-none" />

            {/* Content */}
            <div className="z-10 flex flex-col items-center w-full h-full space-y-6">
                {/* Logo */}
                <div className={`${recordingState === 'idle' ? 'mt-24' : 'mt-8'} transition-all duration-300`}>
                    <img src={Logo} alt="Stepps.ai Logo" className="w-16 h-16 object-contain shadow-lg rounded-lg" />
                </div>

                {recordingState === 'idle' ? (
                    <div className="flex flex-col items-center text-center space-y-8 mt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h1 className="text-[22px] font-normal text-slate-900 leading-tight">
                            Capture any workflow <span className="text-[#6366F1]">in<br />seconds</span>.
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
                ) : (
                    <>
                        <div className="flex flex-col items-center space-y-1">
                            <div className="flex items-center gap-2">
                                <div className={`w-1.5 h-1.5 rounded-full ${recordingState === 'recording' ? 'bg-rose-500 animate-pulse' : 'bg-rose-500'}`} />
                                <span className="font-normal text-lg text-slate-900">
                                    {recordingState}
                                </span>
                            </div>
                            <span className="text-slate-900 text-lg">
                                (4 steps captured)
                            </span>
                        </div>

                        <div className="w-full flex-1 flex flex-col items-center justify-center space-y-4 min-h-0">
                            <p className="text-sm text-slate-900 text-center">
                                Click on the “Gmail” link
                            </p>
                            {/* Placeholder Image */}
                            <div className="w-full aspect-video bg-slate-50 rounded-xl border border-slate-200 shadow-sm overflow-hidden relative flex items-center justify-center group">
                                <div className="absolute inset-0 bg-slate-100/50" />
                                <div className="z-10 flex flex-col items-center gap-3 text-slate-300">
                                    <ImageIcon className="w-12 h-12" />
                                    <span className="text-sm font-medium">Preview Placeholder</span>
                                </div>
                            </div>
                        </div>

                        <div className="w-full space-y-3 mt-auto pt-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
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
                        </div>
                    </>
                )}

                {recordingState === 'idle' && (
                    <div className="mt-auto pb-4">
                        <a href="#" className="text-sm text-slate-900 underline decoration-slate-900 underline-offset-4 transition-colors">
                            open dashboard
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
}

export default SidePanelApp;
