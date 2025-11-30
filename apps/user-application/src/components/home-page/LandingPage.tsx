import { Navbar } from "./Navbar";
import { Hero } from "./Hero";
import { SocialProof } from "./SocialProof";
import { WhoIsItFor } from "./WhoIsItFor";
import { Features } from "./Features";
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
                <WhoIsItFor />
                <Features />
                <BlackFridayDeal />
                <FAQ />
            </main>

            <Footer />
        </div>
    );
}
