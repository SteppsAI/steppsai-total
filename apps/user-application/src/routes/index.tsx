import { createFileRoute } from '@tanstack/react-router'
import { Hero } from '@/components/home-page/Hero'
import { Footer } from '@/components/home-page/footer'
import { Navigation } from '@/components/home-page/navigation'
import HowItWorks from '@/components/home-page/HowItWorks'
import BuiltForTeams from '@/components/home-page/BuiltForTeams'

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      <Navigation />
      <main className="flex-1">
        <Hero />
        <HowItWorks />
        <BuiltForTeams />
      </main>
      <Footer />
    </div>
  )
}
