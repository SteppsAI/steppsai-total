import { Navbar } from "./Navbar";
import { Hero } from "./Hero";
import { SocialProof } from "./SocialProof";
import { HowItWorks } from "./HowItWorks";
import { FAQ } from "./FAQ";
import { Footer } from "./footer";
import { LifetimeDeal } from "./LifetimeDeal";

export function LandingPage() {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar />

            <main className="flex-grow">
                <Hero />
                <div className="bg-foggy">
                    <SocialProof />
                    <HowItWorks />
                    <LifetimeDeal />
                </div>
                <FAQ />
            </main>

            <Footer />
        </div>
    );
}
