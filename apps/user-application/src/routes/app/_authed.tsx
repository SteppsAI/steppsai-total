import { AppSidebar } from "@/components/common/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Outlet, createFileRoute, Link } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { authClient } from "@/components/auth/client";
import { redirect } from "@tanstack/react-router";

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
  return (
    <div className="h-screen w-full overflow-hidden flex bg-muted">
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 64)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebar />
        <SidebarInset className="flex-1 flex flex-col w-full h-full m-0 rounded-none shadow-none overflow-hidden bg-muted">
          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto w-full h-full">

            {/* Dashboard Content */}
            <div className="px-4 md:px-8 py-6 max-w-[1600px] mx-auto">
              {/* Mobile Sidebar Trigger & Search Bar Area */}
              {/* Mobile Header (Visible only on mobile) */}
              <div className="md:hidden mb-6 flex items-center justify-between bg-sidebar border border-sidebar-border/50 rounded-xl p-3 shadow-sm">
                <div className="flex items-center gap-3">
                  <SidebarTrigger className="text-muted-foreground hover:text-primary" />
                  <div className="h-4 w-px bg-border/50" />
                  <Link to="/app" className="flex items-center gap-2 text-sm font-medium text-foreground/80 hover:text-primary transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-home"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                    <span>Home</span>
                  </Link>
                </div>
                <div className="flex items-center gap-3">
                  <button className="flex items-center justify-center size-8 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-plus"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
                  </button>
                  <button className="flex items-center justify-center size-8 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-search"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                  </button>
                  <div className="size-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 p-[1px]">
                    <div className="size-full rounded-full bg-background flex items-center justify-center overflow-hidden">
                      <span className="text-xs font-bold text-foreground">VB</span>
                    </div>
                  </div>
                </div>
              </div>

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
