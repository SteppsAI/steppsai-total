import { Navbar } from "./Navbar";
import { Hero } from "./Hero";
import { SocialProof } from "./SocialProof";
import { HowItWorks } from "./HowItWorks";
import { WaitlistSection } from "./WaitlistSection";
import { FAQ } from "./FAQ";
import { Footer } from "./footer";

export function LandingPage() {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar />

            <main className="flex-grow">
                <Hero />
                <div className="bg-foggy">
                    <SocialProof />
                    <HowItWorks />
                    {/* <BlackFridayDeal /> */}
                </div>
                <FAQ />
                <WaitlistSection />

            </main>

            <Footer />
        </div>
    );
}
