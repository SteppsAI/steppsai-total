import * as React from "react";
import {
  Home,
  Library,
  Settings,
  User,
  LogOut,
  Edit,
  Plus,
  MessageSquare,
} from "lucide-react";
import { toast } from "sonner";
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
import { triggerExtensionSidePanel } from "@/lib/extension";
import { MobileCreationDialog } from "@/components/mobile-creation-dialog";
import { useState } from "react";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const location = useLocation();
  const pathname = location.pathname;
  const { state, isMobile, setOpenMobile } = useSidebar();
  const [isMobileDialogOpen, setIsMobileDialogOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

  // Close sidebar on mobile when clicking a link
  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

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
                  <Link to="/app" onClick={handleLinkClick}>
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
                  <Link to="/app/editor" onClick={handleLinkClick}>
                    <Edit />
                    <span>Editor</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive("/app/library")}
                  tooltip="My Stepps"
                >
                  <Link to="/app/stepps" search={{ search: "" }} onClick={handleLinkClick}>
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
              className={`w-full h-10 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-md flex items-center justify-center transition-all duration-200 overflow-hidden cursor-pointer ${state === "collapsed" ? "px-0" : "px-4 gap-2"
                }`}
              aria-label={state === "collapsed" ? "Create Stepps" : undefined}
              onClick={() => {
                if (isMobile) {
                  setIsMobileDialogOpen(true);
                } else {
                  triggerExtensionSidePanel().catch((e) => toast.error(e.message));
                }
              }}
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
            sideOffset={6}
            className="w-56"
          >
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Workspace settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a
                href="https://feedback.stepps.ai"
                target="_blank"
                rel="noreferrer"
                className="flex w-full items-center"
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                <span>Send feedback</span>
              </a>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
      <MobileCreationDialog open={isMobileDialogOpen} onOpenChange={setIsMobileDialogOpen} />
    </Sidebar>
  );
}
