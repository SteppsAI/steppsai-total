import { createFileRoute } from '@tanstack/react-router'
import { LandingPage } from '@/components/home-page/LandingPage'

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  return <LandingPage />
}
