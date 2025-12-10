import { AppSidebar } from "@/components/common/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Outlet, createFileRoute, useLocation, redirect } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { DashboardHeader } from "@/components/dashboard-header";
import { getSessionCached } from "@/router";

export const Route = createFileRoute("/app/_authed")({
  component: RouteComponent,
  beforeLoad: async () => {
    // REMEMBER: reset before pushing (just for getting into the app locally)
    // TODO: Temporarily bypass authentication for local development
    const session = await getSessionCached();

    // In development, if no real session, create a mock one
    if (!session.data?.session && import.meta.env.DEV) {
      console.log("⚠️ Authentication bypassed for local development");
      // No redirect - allow access
      return;
    }

    if (!session.data?.session) {
      throw redirect({ to: "/auth/login" })
    }
  }
});

function RouteComponent() {
  const location = useLocation();
  const pathname = location.pathname;

  // Check if we're on an editor route or guide view route
  const isEditorRoute = pathname.startsWith('/app/editor');
  const isGuideViewRoute = /^\/app\/stepps\/[^/]+$/.test(pathname);
  const isFullscreenRoute = isEditorRoute || isGuideViewRoute;

  // Fullscreen layout for editor/guide view (no sidebar, no dashboard chrome)
  if (isFullscreenRoute) {
    return (
      <SidebarProvider>
        {/* Editor needs overflow-hidden for its own layout, Guide View needs overflow-auto (or default) to scroll */}
        <div className={`h-screen w-full bg-background ${isEditorRoute ? 'overflow-hidden' : 'overflow-y-auto'}`}>
          <Outlet />
          <Toaster />
        </div>
      </SidebarProvider>
    );
  }

  // Normal dashboard layout with sidebar
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <DashboardHeader />

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-[1600px] mx-auto h-full">
            <Outlet />
          </div>
          <Toaster />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
