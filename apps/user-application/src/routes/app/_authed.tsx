import { AppSidebar } from "@/components/common/app-sidebar";
import { SiteHeader } from "@/components/common/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Outlet, createFileRoute } from "@tanstack/react-router";
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
    <div className="h-screen w-full overflow-hidden flex bg-[#F1F5F9]">
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebar />
        <SidebarInset className="flex-1 flex flex-col w-full h-full m-0 rounded-none shadow-none overflow-hidden">
          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto w-full h-full">
            <SiteHeader />
            <div className="p-6 md:p-8 max-w-[1600px] mx-auto">
              <Outlet />
            </div>
            <Toaster />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
