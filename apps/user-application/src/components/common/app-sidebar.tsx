import * as React from "react";
import {
  Home,
  Library,
  Edit,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CreateButton } from "@/components/ui/create-button";
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
    <Sidebar
      collapsible="icon"
      variant="inset"
      {...props}
      className="border-r-0 bg-sidebar"
    >
      <SidebarHeader>
        <div className="flex items-center justify-center py-4 transition-all duration-300">
          {state === "collapsed" ? (
            <img src="/brand/logo-symbol.svg" alt="Stepps.ai" className="size-8 transition-all" />
          ) : (
            <img src="/brand/logo.svg" alt="Stepps.ai" className="h-8 w-auto transition-all" />
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
                  size="default"
                  className="h-10 transition-all duration-200 ease-in-out font-medium hover:bg-sidebar-accent hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:[&>span]:hidden"
                >
                  <Link to="/app" onClick={handleLinkClick} className="flex items-center gap-3">
                    <Home className="size-5 opacity-70 group-hover:opacity-100 transition-opacity" />
                    <span className="text-base">Home</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname.startsWith("/app/editor")}
                  tooltip="Editor (Demo)"
                  size="default"
                  className="h-10 transition-all duration-200 ease-in-out font-medium hover:bg-sidebar-accent hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:[&>span]:hidden"
                >
                  <Link to="/app/editor" onClick={handleLinkClick} className="flex items-center gap-3">
                    <Edit className="size-5 opacity-70 group-hover:opacity-100 transition-opacity" />
                    <span className="text-base">Editor</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive("/app/stepps")}
                  tooltip="My Stepps"
                  size="default"
                  className="h-10 transition-all duration-200 ease-in-out font-medium hover:bg-sidebar-accent hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:[&>span]:hidden"
                >
                  <Link to="/app/stepps" onClick={handleLinkClick} className="flex items-center gap-3">
                    <Library className="size-5 opacity-70 group-hover:opacity-100 transition-opacity" />
                    <span className="text-base">My Stepps</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className={state === "collapsed" ? "p-1.5" : "p-4"}>
        <SidebarMenu>
          <SidebarMenuItem className={state === "collapsed" ? "flex justify-center" : ""}>
            <CreateButton
              fullWidth={isMobile || state === "expanded"}
              size="lg"
              onClick={() => {
                if (isMobile) {
                  setIsMobileDialogOpen(true);
                } else {
                  triggerExtensionSidePanel().catch((e) => toast.error(e.message));
                }
              }}
              className={state === "collapsed" ? "w-12 h-12 p-0" : ""}
            >
              {state !== "collapsed" && "Create Stepps"}
            </CreateButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <SidebarMenu className="mt-2">
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              size="lg"
              className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:[&>div]:hidden group-data-[collapsible=icon]:!p-0"
            >
              <Link
                to="/app/settings"
                onClick={handleLinkClick}
                className="flex items-center justify-center w-full h-full"
              >
                <Avatar className="size-8 rounded-lg">
                  <AvatarImage src={user?.avatarUrl || undefined} alt="Profile" />
                  <AvatarFallback className="rounded-lg bg-sidebar-accent text-sidebar-primary-foreground text-xs font-medium border border-sidebar-border">
                    {getInitials(user?.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight ml-2">
                  <span className="truncate font-semibold">{user?.name || "User"}</span>
                  <span className="truncate text-xs opacity-70">Pro Plan</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <MobileCreationDialog open={isMobileDialogOpen} onOpenChange={setIsMobileDialogOpen} />
    </Sidebar>
  );
}
