import { Navbar } from "./Navbar";
import { Hero } from "./Hero";
import { SocialProof } from "./SocialProof";
import {HowItWorks} from "./HowItWorks";
import { BlackFridayDeal } from "./BlackFridayDeal";
import { FAQ } from "./FAQ";
import { Footer } from "./footer";

export function LandingPage() {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar />

            <main className="flex-grow">
                <Hero />
                <SocialProof />
                <HowItWorks />
                <BlackFridayDeal />
                <FAQ />
            </main>

            <Footer />
        </div>
    );
}
