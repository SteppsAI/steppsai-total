import * as React from "react";
import {
  Home,
  Library,
  Settings,
  User,
  LogOut,
  Edit,
  Plus,
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
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const location = useLocation();
  const pathname = location.pathname;
  const { state, isMobile } = useSidebar();

  const isActive = (path: string) => pathname === path;

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex items-center justify-center py-2">
          {state === "collapsed" ? (
            <img src="/brand/logo-symbol.svg" alt="Stepps.ai" className="size-8" />
          ) : (
            <img src="/brand/logo-light.svg" alt="Stepps.ai" className="h-8 w-auto" />
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive("/app")}
                  tooltip="Home"
                >
                  <Link to="/app">
                    <Home />
                    <span>Home</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname.startsWith("/app/editor")}
                  tooltip="Editor (Demo)"
                >
                  <Link to="/app/editor/$guideId" params={{ guideId: "test-guide-1" }}>
                    <Edit />
                    <span>Editor (Demo)</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive("/app/library")}
                  tooltip="My Stepps"
                >
                  <Link to="/app/folders" search={{ search: "" }}>
                    <Library />
                    <span>My Stepps</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <button
              className={`w-full h-10 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-md flex items-center justify-center transition-all duration-200 overflow-hidden ${state === "collapsed" ? "px-0" : "px-4 gap-2"
                }`}
              aria-label={state === "collapsed" ? "Create Stepps" : undefined}
            >
              <Plus className="size-4 flex-shrink-0" />
              <span className={`whitespace-nowrap transition-all duration-200 ${state === "collapsed" ? "w-0 opacity-0" : "w-auto opacity-100"}`}>
                Create Stepps
              </span>
            </button>
          </SidebarMenuItem>
        </SidebarMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <User className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">Vilém Barnet</span>
                <span className="truncate text-xs">Pro Plan</span>
              </div>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <div className="flex flex-col gap-1 px-2 py-2">
              <p className="text-sm font-semibold">Vilém Barnet</p>
              <p className="text-xs text-muted-foreground">Pro Plan</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
