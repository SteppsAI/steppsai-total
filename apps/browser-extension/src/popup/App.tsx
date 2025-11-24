import { Play } from 'lucide-react';
import Logo from '../assets/logo.svg';

function App() {
    return (
        <div className="w-[350px] h-[500px] flex flex-col items-center justify-between py-12 px-6 relative overflow-hidden font-inter bg-background">
            {/* Background Gradient */}
            <div
                className="absolute inset-0 z-0 pointer-events-none"
                style={{
                    background: 'radial-gradient(circle at 50% 30%, #ffffff 0%, rgba(6, 182, 212, 0.15) 50%, rgba(99, 102, 241, 0.15) 100%)'
                }}
            />

            {/* Content */}
            <div className="z-10 flex flex-col items-center w-full space-y-8 mt-8">
                {/* Logo */}
                <div className="w-16 h-16 flex items-center justify-center">
                    <img src={Logo} alt="Stepps.ai Logo" className="w-full h-full object-contain" />
                </div>

                <div className="text-center space-y-1">
                    <h1 className="text-2xl font-sans font-medium text-foreground">
                        Capture any workflow
                    </h1>
                    <h1 className="text-2xl font-sans font-medium text-primary">
                        in seconds<span className="text-2xl font-sans font-medium text-foreground">.</span>
                    </h1>
                </div>

                <button
                    className="group flex items-center gap-2 bg-primary hover:bg-indigo-500 text-primary-foreground px-8 py-3.5 rounded-xl font-medium transition-all shadow-lg hover:shadow-indigo-500/25 active:scale-95 w-full justify-center text-lg"
                    onClick={() => {
                        console.log('Start Recording');
                    }}
                >
                    <Play className="w-5 h-5 fill-current" />
                    Start Recording
                </button>
            </div>

            {/* Footer */}
            <div className="z-10">
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
        </div>
    );
}

export default App;
