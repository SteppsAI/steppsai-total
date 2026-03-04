import { AppSidebar } from "@/components/common/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Outlet, createFileRoute, useLocation, redirect } from "@tanstack/react-router";
import { DashboardHeader } from "@/components/dashboard-header";
import { getSessionCached, getAccessCached } from "@/lib/auth-helpers";

export const Route = createFileRoute("/app/_authed")({
  component: RouteComponent,
  beforeLoad: async ({ location }) => {
    // 1. Session check
    const session = await getSessionCached();
    if (!session.data?.session) {
      throw redirect({ to: "/auth/login" });
    }

    // 2. Access check (skip for upgrade page)
    const isUpgradePage = location.pathname === "/app/upgrade";
    if (!isUpgradePage) {
      const hasAccess = await getAccessCached();
      if (!hasAccess) {
        throw redirect({ to: "/app/upgrade" });
      }
    }
  },
});

function RouteComponent() {
  const location = useLocation();
  const pathname = location.pathname;

  // Check if we're on an editor route, guide view route, or carousel route
  const isEditorRoute = pathname.startsWith('/app/editor');
  const isDocsRoute = pathname.startsWith('/app/docs');
  const isGuideViewRoute = /^\/app\/stepps\/[^/]+$/.test(pathname);
  const isCarouselRoute = pathname.startsWith('/app/carousel');
  const isFullscreenRoute = isEditorRoute || isDocsRoute || isGuideViewRoute || isCarouselRoute;

  // Fullscreen layout for editor/guide view (no sidebar, no dashboard chrome)
  if (isFullscreenRoute) {
    return (
      <SidebarProvider>
        {/* Editor/Carousel needs overflow-hidden for layout, Guide View needs auto scrolling */}
        <div className={`h-screen w-full bg-background ${isEditorRoute || isCarouselRoute || isDocsRoute ? 'overflow-hidden' : 'overflow-y-auto custom-scrollbar'}`}>
          <Outlet />
        </div>
      </SidebarProvider>
    );
  }

  // Normal dashboard layout with inset sidebar
  return (
    <SidebarProvider
      defaultOpen={true}
      className="h-svh overflow-hidden bg-sidebar"
    >
      <AppSidebar />

      {/* SidebarInset creates the white 'card' effect on top of the sidebar background */}
      {/* It needs to flex-1 to fill the remaining width, and h-full to fill the provider height */}
      <SidebarInset className="flex flex-col h-full bg-background shadow-sm border-l border-t border-border/50 overflow-hidden">
        <DashboardHeader />

        {/* Scrollable Content Area - Fixed Header, Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar w-full">
          <div className="max-w-7xl mx-auto min-h-full">
            <Outlet />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
