import { AppSidebar } from "@/components/common/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Outlet, createFileRoute} from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { authClient } from "@/components/auth/client";
import { redirect } from "@tanstack/react-router";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSwipeToOpen } from "@/hooks/use-swipe";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/app/_authed")({
  component: RouteComponent,
  beforeLoad: async () => {
    const session = await authClient.getSession();
    if (!session.data?.session) {
      throw redirect({ to: "/" });
    }
  }
});
function RouteComponent() {
  const isMobile = useIsMobile();

  // Add swipe gesture to open sidebar on mobile
  const handleOpenSidebar = () => {
    const sidebarTrigger = document.querySelector('[data-sidebar="trigger"]') as HTMLButtonElement;
    if (sidebarTrigger && isMobile) {
      sidebarTrigger.click();
    }
  };

  useSwipeToOpen(handleOpenSidebar, 60);

  return (
    <div className="h-screen w-full overflow-hidden flex bg-muted">
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 64)",
            "--header-height": "calc(var(--spacing) * 12)",
            "--sidebar-width-mobile": "calc(var(--spacing) * 72)",
          } as React.CSSProperties
        }
      >
        <AppSidebar />
        <SidebarInset className="flex-1 flex flex-col w-full h-full m-0 rounded-none shadow-none overflow-hidden bg-muted">
          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto w-full h-full">
            {/* Mobile Navigation Header (Visible only on mobile) */}
            <div className="md:hidden sticky top-0 z-10 bg-white/95 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
              <div className="flex items-center justify-between p-4">
                {/* Left: Hamburger Menu */}
                <SidebarTrigger className="text-gray-700 hover:text-gray-900 hover:bg-gray-100 size-10 min-h-[44px] rounded-lg touch-manipulation transition-colors" />

                {/* Center: Logo */}
                <img
                  src="/brand/logo-symbol.svg"
                  alt="Stepps.ai"
                  className="h-8 w-8"
                />

                {/* Right: CTA Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-700 hover:text-gray-900 hover:bg-gray-100 size-10 min-h-[44px] rounded-lg touch-manipulation transition-colors"
                  aria-label="Create new Stepps"
                >
                  <Plus className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Dashboard Content */}
            <div className="px-4 md:px-8 py-6 max-w-[1600px] mx-auto">
              {/* Desktop Search Bar Area (Hidden on mobile) */}
              <div className="mb-8 hidden md:block max-w-2xl">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="size-5 text-muted-foreground group-focus-within:text-primary transition-colors" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.3-4.3" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search for Stepps, templates, or folders..."
                    className="w-full pl-11 pr-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm hover:border-primary/50"
                  />
                </div>
              </div>

              <Outlet />
            </div>
            <Toaster />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
