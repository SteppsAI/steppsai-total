import * as React from "react";
import {
  Home,
  Library,
  Settings,
  Edit,
  Plus,
  MessageSquare,
} from "lucide-react";
import { toast } from "sonner";
import { Link, useLocation } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { triggerExtensionSidePanel } from "@/lib/extension";
import { MobileCreationDialog } from "@/components/mobile-creation-dialog";
import { useState } from "react";
import { trpc } from "@/router";
import { User as UserType } from "@/types/db";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const location = useLocation();
  const pathname = location.pathname;
  const { state, isMobile, setOpenMobile } = useSidebar();
  const [isMobileDialogOpen, setIsMobileDialogOpen] = useState(false);

  const { data: userData } = useQuery(trpc.users.getMe.queryOptions());
  const user = userData as UserType | null | undefined;

  const isActive = (path: string) => pathname === path;

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

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
            <img src="/brand/logo-symbol.svg" alt="Stepps.ai" className="size-7" />
          ) : (
            <img src="/brand/logo-light.svg" alt="Stepps.ai" className="h-7 w-auto" />
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
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
                  <Link to="/app/stepps" onClick={handleLinkClick}>
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
              className={`mb-2 w-full h-10 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-md flex items-center justify-center transition-all duration-200 overflow-hidden cursor-pointer ${state === "collapsed" ? "px-0" : "px-4 gap-2"
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
              <Avatar className="size-8">
                <AvatarImage src={user?.avatarUrl || undefined} alt="Profile" />
                <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-xs">
                  {getInitials(user?.name)}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{user?.name || "User"}</span>
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
            <DropdownMenuItem asChild>
              <Link to="/app/settings" className="flex w-full items-center">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                to="/app/feedback"
                className="flex w-full items-center cursor-pointer"
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                <span>Send feedback</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
      <MobileCreationDialog open={isMobileDialogOpen} onOpenChange={setIsMobileDialogOpen} />
    </Sidebar>
  );
}
