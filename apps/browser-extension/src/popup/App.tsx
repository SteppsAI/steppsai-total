import { Play, Pause } from 'lucide-react';
import { useState } from 'react';
import Logo from '../assets/logo.svg';
import { Button } from '../components/Button';
import { StatusBadge } from '../components/StatusBadge';
import { StepPreview } from '../components/StepPreview';

// Mock data for testing
const MOCK_STEPS = [
    {
        id: 1,
        title: 'Click on the "Gmail" link',
        image: 'https://lh3.googleusercontent.com/pw/AP1GczO_lFjMvFk-UfF1y4yX9j9w5f5z5v5z5v5z5v5z5v5z5v5z5v5z5v5z5v5z5v5z5v5z5v5z5v5z5v5z5v5z5v5z=w1024-h768-s-no-gm?authuser=0'
    },
    { id: 2, title: 'Click on Search', image: '' },
    { id: 3, title: 'Type "Stepps.ai"', image: '' },
    { id: 4, title: 'Press Enter', image: '' }
];

type RecordingState = 'idle' | 'recording' | 'paused';

function App() {
    const [recordingState, setRecordingState] = useState<RecordingState>('idle');
    const [steps, setSteps] = useState<typeof MOCK_STEPS>([]);

    const handleStartRecording = () => {
        setRecordingState('recording');
        setSteps(MOCK_STEPS);
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
        setSteps([]);
    };

    return (
        <div className="w-[350px] h-[600px] flex flex-col items-center justify-between py-8 px-6 relative overflow-hidden font-inter bg-background">
            {/* Background Gradient */}
            <div
                className="absolute inset-0 z-0 pointer-events-none"
                style={{
                    background: 'radial-gradient(circle at 50% 30%, #ffffff 0%, rgba(6, 182, 212, 0.15) 50%, rgba(99, 102, 241, 0.15) 100%)'
                }}
            />

            {/* Content */}
            <div className="z-10 flex flex-col items-center w-full h-full">
                {/* Logo */}
                <div className="w-12 h-12 flex items-center justify-center mb-6">
                    <img src={Logo} alt="Stepps.ai Logo" className="w-full h-full object-contain" />
                </div>

                {recordingState === 'idle' ? (
                    <div className="flex flex-col items-center justify-center flex-1 w-full space-y-8">
                        <div className="text-center space-y-1">
                            <h1 className="text-2xl font-sans font-medium text-foreground">
                                Capture any workflow
                            </h1>
                            <h1 className="text-2xl font-sans font-medium text-primary">
                                in seconds<span className="text-2xl font-sans font-medium text-foreground">.</span>
                            </h1>
                        </div>

                        <Button
                            variant="primary"
                            className="w-full text-lg py-3.5"
                            onClick={handleStartRecording}
                            icon={<Play className="w-5 h-5 fill-current" />}
                        >
                            Start Recording
                        </Button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center w-full flex-1 space-y-6">
                        <StatusBadge status={recordingState} stepCount={steps.length} />

                        <StepPreview step={steps[0]} />

                        <div className="w-full space-y-3 mt-auto pt-4">
                            <Button
                                variant="primary"
                                className="w-full"
                                onClick={handleEndRecording}
                            >
                                End Recording
                            </Button>

                            {recordingState === 'recording' ? (
                                <Button
                                    variant="danger"
                                    className="w-full"
                                    onClick={handlePauseRecording}
                                    icon={<Pause className="w-5 h-5 fill-current" />}
                                >
                                    Pause Recording
                                </Button>
                            ) : (
                                <Button
                                    variant="secondary"
                                    className="w-full"
                                    onClick={handleResumeRecording}
                                    icon={<Play className="w-5 h-5 fill-current" />}
                                >
                                    Continue
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            {recordingState === 'idle' && (
                <div className="z-10 mt-8">
                    <a
                        href="#"
                        className="text-sm text-muted-foreground hover:text-foreground underline decoration-border hover:decoration-foreground underline-offset-4 transition-all"
                        onClick={(e) => {
                            e.preventDefault();
                            chrome.tabs.create({ url: 'http://localhost:3000' });
                        }}
                    >
                        open dashboard
                    </a>
                </div>
            )}
        </div>
    );
}

export default App;
