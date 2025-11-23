import * as React from "react";
import {
  Home,
  Library,
  Settings,
  User,
  Folder,
  BookOpen,
  MessageSquare,
  Plus,
  X
} from "lucide-react";
import { Link, useLocation } from "@tanstack/react-router";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupContent,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSwipeToClose } from "@/hooks/use-swipe";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const location = useLocation();
  const pathname = location.pathname;
  const isMobile = useIsMobile();

  const isActive = (path: string) => pathname === path;

  // Add swipe gesture to close sidebar on mobile
  const handleCloseSidebar = () => {
    if (isMobile) {
      const sidebar = document.querySelector('[data-sidebar="sidebar"]')?.closest('.sheet');
      if (sidebar) {
        const closeButton = sidebar.querySelector('[data-state="open"] button') as HTMLButtonElement;
        closeButton?.click();
      }
    }
  };

  useSwipeToClose(handleCloseSidebar, 60);

  return (
    <Sidebar collapsible="offcanvas" className="bg-sidebar border-r border-sidebar-border shadow-sm" {...props}>
      <SidebarHeader className="h-16 flex items-center justify-center px-4 border-b border-sidebar-border/50 bg-sidebar relative">
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            onClick={() => {
              const sidebar = document.querySelector('[data-sidebar="sidebar"]')?.closest('.sheet');
              if (sidebar) {
                const closeButton = sidebar.querySelector('[data-state="open"] button') as HTMLButtonElement;
                closeButton?.click();
              }
            }}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close sidebar</span>
          </Button>
        )}
        <div className="flex items-center justify-center">
          <img src="/brand/logo-light.svg" alt="Stepps.ai" className="h-7 w-auto" />
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-4 gap-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive("/app")}
                  tooltip="Home"
                  className={`h-12 px-4 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-primary data-[active=true]:text-primary-foreground font-medium transition-all duration-200 rounded-lg ${isMobile ? 'min-h-[44px]' : ''}`}
                >
                  <Link to="/app" className="flex items-center gap-3">
                    <Home className="size-5" />
                    <span className="text-sm">Home</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive("/app/library")}
                  tooltip="My Stepps"
                  className={`h-12 px-4 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-primary data-[active=true]:text-primary-foreground font-medium transition-all duration-200 rounded-lg ${isMobile ? 'min-h-[44px]' : ''}`}
                >
                  <Link to="/app" className="flex items-center gap-3">
                    <Library className="size-5" />
                    <span className="text-sm">My Stepps</span>
                  </Link>
                </SidebarMenuButton>

                {/* Sub-items for showcase - improved for mobile */}
                <div className={`pl-12 flex flex-col gap-1 mt-2 ${isMobile ? 'gap-2' : 'gap-1'}`}>
                  {["Marketing", "Support", "Product"].map((item) => (
                    <SidebarMenuButton
                      key={item}
                      asChild
                      className={`h-10 px-3 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground font-normal transition-colors rounded-md ${isMobile ? 'min-h-[40px]' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        <Folder className="size-4" />
                        <span className="text-xs">{item}</span>
                      </div>
                    </SidebarMenuButton>
                  ))}
                </div>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="bg-sidebar-border/30 w-[85%] mx-auto my-2" />

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip="Tutorials"
                  className={`h-12 px-4 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground font-medium transition-all duration-200 rounded-lg ${isMobile ? 'min-h-[44px]' : ''}`}
                >
                  <Link to="/app" className="flex items-center gap-3">
                    <BookOpen className="size-5" />
                    <span className="text-sm">Tutorials</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip="Feedback"
                  className={`h-12 px-4 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground font-medium transition-all duration-200 rounded-lg ${isMobile ? 'min-h-[44px]' : ''}`}
                >
                  <Link to="/app" className="flex items-center gap-3">
                    <MessageSquare className="size-5" />
                    <span className="text-sm">Feedback</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip="Settings"
                  className={`h-12 px-4 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground font-medium transition-all duration-200 rounded-lg ${isMobile ? 'min-h-[44px]' : ''}`}
                >
                  <Link to="/app" className="flex items-center gap-3">
                    <Settings className="size-5" />
                    <span className="text-sm">Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border/50 gap-4">
        <button className={`w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg active:scale-[0.98] ${isMobile ? 'min-h-[44px] text-sm' : 'py-2.5'}`}>
          <Plus className="size-5" />
          <span>Create Stepps</span>
        </button>

        <div className={`flex items-center gap-3 p-3 rounded-xl hover:bg-sidebar-accent transition-colors cursor-pointer group ${isMobile ? 'min-h-[44px]' : ''}`}>
          <div className="size-10 rounded-full bg-sidebar-accent flex items-center justify-center text-sidebar-primary group-hover:bg-sidebar-accent/80 transition-colors">
            <User className="size-5" />
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-medium text-sidebar-foreground truncate">Vilém Barnet</span>
            <span className="text-xs text-sidebar-foreground/60 truncate">Pro Plan</span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
