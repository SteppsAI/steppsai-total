import { AppSidebar } from "@/components/common/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Outlet, createFileRoute, useLocation, useNavigate } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState } from "react";
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
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;
  const [searchQuery, setSearchQuery] = useState("");

  // Check if we're on an editor route or guide view route
  const isEditorRoute = pathname.startsWith('/app/editor');
  const isGuideViewRoute = /^\/app\/stepps\/[^/]+$/.test(pathname);
  const isFullscreenRoute = isEditorRoute || isGuideViewRoute;

  // Handle search submission
  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      // Navigate to stepps page
      // TODO: When backend is ready, implement search with query params
      // For now, we'll navigate to the stepps page and let it handle local filtering
      navigate({
        to: "/app/stepps",
        // In future, pass search as a search param: search: { q: searchQuery }
      });

      // Store search query in sessionStorage for the stepps page to pick up
      // TODO: Replace with proper URL search params when implementing backend search
      sessionStorage.setItem('searchQuery', searchQuery);
    }
  };

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
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search stepps..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearch}
                className="pl-9 bg-muted/50 border-none"
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
