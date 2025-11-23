import * as React from "react";
import {
  Home,
  Library,
  Settings,
  User,
  Folder,
  BookOpen,
  MessageSquare,
  Plus
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

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const location = useLocation();
  const pathname = location.pathname;

  const isActive = (path: string) => pathname === path;

  return (
    <Sidebar collapsible="offcanvas" className="bg-sidebar" {...props}>
      <SidebarHeader className="h-16 flex items-center justify-center px-4 border-b border-sidebar-border/50">
        <div className="flex items-center justify-start w-full pl-2">
          <img src="/brand/logo-light.svg" alt="Stepps.ai" className="h-7 w-auto" />
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-4 gap-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1.5">
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive("/app")}
                  tooltip="Home"
                  className="h-10 px-3 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground font-medium transition-all duration-200"
                >
                  <Link to="/app" className="flex items-center gap-3">
                    <Home className="size-[18px]" />
                    <span>Home</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive("/app/library")}
                  tooltip="My Stepps"
                  className="h-10 px-3 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground font-medium transition-all duration-200"
                >
                  <Link to="/app" className="flex items-center gap-3">
                    <Library className="size-[18px]" />
                    <span>My Stepps</span>
                  </Link>
                </SidebarMenuButton>

                {/* Sub-items for showcase - simplified for now */}
                <div className="pl-9 flex flex-col gap-1 mt-1">
                  {["Marketing", "Support", "Product"].map((item) => (
                    <div key={item} className="flex items-center gap-3 px-2 py-1.5 text-sidebar-foreground/60 hover:text-sidebar-accent-foreground hover:bg-sidebar-accent/50 rounded-md cursor-pointer transition-colors">
                      <Folder className="size-3.5" />
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="bg-sidebar-border/30 w-[85%] mx-auto my-2" />

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1.5">
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip="Tutorials"
                  className="h-10 px-3 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground font-medium transition-all duration-200"
                >
                  <Link to="/app" className="flex items-center gap-3">
                    <BookOpen className="size-[18px]" />
                    <span>Tutorials</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip="Feedback"
                  className="h-10 px-3 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground font-medium transition-all duration-200"
                >
                  <Link to="/app" className="flex items-center gap-3">
                    <MessageSquare className="size-[18px]" />
                    <span>Feedback</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu className="gap-1.5">
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip="Settings"
                  className="h-10 px-3 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground font-medium transition-all duration-200"
                >
                  <Link to="/app" className="flex items-center gap-3">
                    <Settings className="size-[18px]" />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border/50 gap-4">
        <button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg active:scale-[0.98]">
          <Plus className="size-5" />
          <span>Create Stepps</span>
        </button>

        <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-sidebar-accent transition-colors cursor-pointer group">
          <div className="size-9 rounded-full bg-sidebar-accent flex items-center justify-center text-sidebar-primary group-hover:bg-sidebar-accent/80 transition-colors">
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
