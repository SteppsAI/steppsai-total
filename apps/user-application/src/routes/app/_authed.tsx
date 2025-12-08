import { AppSidebar } from "@/components/common/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Outlet, createFileRoute, useLocation, Navigate } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { DashboardHeader } from "@/components/dashboard-header";
import { authClient } from "@/components/auth/client";

export const Route = createFileRoute("/app/_authed")({
  component: RouteComponent,
  // beforeLoad: async () => {
  //   const session = await authClient.getSession();
  //   if (!session.data?.session) {
  //     throw redirect({ to: "/" })
  //   }
  // }
});

function RouteComponent() {
  const location = useLocation();
  const pathname = location.pathname;

  const { data: session, isPending } = authClient.useSession();
  // Loading
  if (isPending) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  // Niet ingelogd → redirect via component
  if (!session?.user) {
    return <Navigate to="/" />;
  }
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
