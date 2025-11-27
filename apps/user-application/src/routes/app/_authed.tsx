import { AppSidebar } from "@/components/common/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Outlet, createFileRoute, useLocation } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
// import { authClient } from "@/components/auth/client";
// import { redirect } from "@tanstack/react-router";




export const Route = createFileRoute("/app/_authed")({
  component: RouteComponent,
  //beforeLoad: async () => {
  //const session = await authClient.getSession();
  //if (!session.data?.session) {
  //throw redirect({ to: "/" });
  //}
  //}
});
function RouteComponent() {

  const location = useLocation();
  const pathname = location.pathname;

  // Check if we're on an editor route
  const isEditorRoute = pathname.startsWith('/app/editor');

  // Fullscreen layout for editor (no sidebar, no dashboard chrome)
  if (isEditorRoute) {
    return (
      <div className="h-screen w-full overflow-hidden bg-background">
        <Outlet />
        <Toaster />
      </div>
    );
  }

  // Normal dashboard layout with sidebar
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* Sticky Header */}
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 sticky top-0 bg-background z-10 relative">
          <SidebarTrigger className="-ml-1" />

          {/* Mobile Centered Logo */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 md:hidden">
            <img src="/brand/logo-symbol.svg" alt="Stepps.ai" className="size-8" />
          </div>

          <div className="flex-1" /> {/* Spacer */}

          {/* Search Bar - Only show on Dashboard */}
          {pathname === '/app' && (
            <div className="relative w-full max-w-md hidden md:block">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="size-4 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-9 pr-4 py-2 bg-muted/50 border-none rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && e.currentTarget.value) {
                    window.location.href = `/app/stepps?search=${encodeURIComponent(e.currentTarget.value)}`;
                  }
                }}
              />
            </div>
          )}

          {/* Mobile CTA (Visible only on mobile) */}

        </header>

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
