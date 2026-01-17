import { createFileRoute, Link } from '@tanstack/react-router'
import { Navbar } from '@/components/home-page/Navbar'
import { Footer } from '@/components/home-page/footer'

export const Route = createFileRoute('/guides')({
  component: GuidesPage,
  // TODO: Add prefetching in route loader
  // loader: async ({ context }) => {
  //   await context.queryClient.prefetchQuery(
  //     context.trpc.publicGuides.getAllPublished.queryOptions()
  //   );
  // },
})

// TODO: Backend Integration - Replace dummy data with tRPC query
// 1. Add getAllPublished procedure to publicGuidesRouter
//    File: /worker/trpc/routers/public-guides.ts
// 2. Create getAllPublishedGuides() in packages/data-ops/src/queries/guides.ts
//    Query: SELECT * FROM guides WHERE status = 'published' ORDER BY updated_at DESC
// 3. Replace DUMMY_GUIDES with:
//    const queryOptions = trpc.publicGuides.getAllPublished.queryOptions();
//    const { data: guides = [] } = useSuspenseQuery(queryOptions);

// TODO: Asset URL Transformation (automatic when using real data)
// transformGuideWithUrls() in tRPC router will prepend ASSETS_URL
// to brandImageKey and step imageKeys automatically.
// No changes needed in component.

interface Step {
  id: string
  type: string
  orderIndex: number
  imageKey?: string
  pageUrl?: string
  caption?: string
}

interface Guide {
  guideId: string
  userId: string
  title: string
  description?: string
  slug?: string
  status: string
  visibility: string
  brandImageKey?: string
  steps?: Step[]
  createdAt: string
  updatedAt: string
}

// Dummy data
const DUMMY_GUIDES: Guide[] = [
  {
    guideId: "d6f14e87-6a34-408a-97e2-cf4d2a9aec0c",
    userId: "dummy-user-1",
    title: "How to Set Up Your First Campaign",
    slug: "setup-first-campaign",
    status: "published",
    visibility: "public",
    brandImageKey: "/icons/3d/rocket.png",
    steps: [
      {
        id: "step-1",
        type: "click",
        orderIndex: 0,
        imageKey: "/website/install-extension.webp",
        pageUrl: "https://example.com",
        caption: "Click the Get Started button"
      },
      {
        id: "step-2",
        type: "input",
        orderIndex: 1,
        imageKey: "/website/share-export.webp",
        pageUrl: "https://example.com/step2",
        caption: "Enter your campaign name"
      },
      {
        id: "step-3",
        type: "click",
        orderIndex: 2,
        pageUrl: "https://example.com/step3",
        caption: "Select your target audience"
      },
      {
        id: "step-4",
        type: "click",
        orderIndex: 3,
        pageUrl: "https://example.com/step4",
        caption: "Set your budget and schedule"
      },
      {
        id: "step-5",
        type: "click",
        orderIndex: 4,
        pageUrl: "https://example.com/step5",
        caption: "Review and launch your campaign"
      }
    ],
    createdAt: "2025-01-10T00:00:00.000Z",
    updatedAt: "2025-01-15T00:00:00.000Z",
  },
]

interface GuideCardProps {
  guide: Guide
}

function GuideCard({ guide }: GuideCardProps) {
  const previewImage =
    guide.steps?.[0]?.imageKey ||
    guide.brandImageKey ||
    '/website/share-export.webp'

  const stepCount = guide.steps?.length || 0

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const month = date.toLocaleDateString('en-US', { month: 'short' })
    const day = date.getDate()
    return `${month} ${day}`
  }

  const formattedDate = formatDate(guide.updatedAt)

  return (
    <Link
      to="/shared/$guideId"
      params={{ guideId: guide.guideId }}
      className="group block"
    >
      <div className="relative overflow-hidden bg-white border border-border rounded-2xl hover:border-primary/50 transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-1">
        <div className="relative aspect-video w-full overflow-hidden bg-muted">
          <img
            src={previewImage}
            alt={guide.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </div>

        <div className="p-6 space-y-3">
          <h3 className="text-xl font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
            {guide.title || 'Untitled Guide'}
          </h3>
          <div className="flex items-center gap-3 text-xs text-muted-foreground pt-2 border-t">
            <span>• {stepCount} steps</span>
            <span>•</span>
            <span>Updated {formattedDate}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] py-20 px-4 text-center">
      <div className="bg-white/50 backdrop-blur-sm rounded-3xl p-16 max-w-lg border border-border shadow-lg">
        <div className="mb-8 relative">
          <div className="absolute inset-0 bg-primary/5 rounded-full blur-3xl"></div>
          <img
            src="/icons/3d/folder.png"
            alt="No guides"
            className="w-24 h-24 mx-auto relative z-10"
          />
        </div>
        <h3 className="text-3xl font-bold text-foreground mb-4">
          No Public Guides Yet
        </h3>
        <p className="text-base text-muted-foreground mb-8 leading-relaxed">
          Our community hasn't published any guides yet. Be among the first to create and share step-by-step guides with the world!
        </p>
        <a
          href="/#waitlist"
          className="btn-glass-primary inline-flex h-12 items-center justify-center rounded-full px-10 text-base font-medium group"
        >
          <span className="mr-2">Join Waitlist</span>
          <img src="/icons/3d/rocket.png" alt="Rocket" className="w-5 h-5 object-contain group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
        </a>
      </div>
    </div>
  )
}

function GuidesPage() {
  // Using dummy data for now
  // To test the empty state, change DUMMY_GUIDES to [] below
  const guides = DUMMY_GUIDES

  return (
    <div className="min-h-screen bg-foggy flex flex-col font-sans relative overflow-x-hidden">
      <Navbar />

      <main className="flex-grow pt-32 pb-24 px-4 relative z-10">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h1 className="section-heading">Explore Public Guides</h1>
            <p className="section-subheading">
              Browse step-by-step guides created by our community to help you accomplish any task
            </p>
          </div>

          {guides.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {guides.map((guide) => (
                <GuideCard key={guide.guideId} guide={guide} />
              ))}
            </div>
          ) : (
            <EmptyState />
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
