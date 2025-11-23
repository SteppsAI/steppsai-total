import * as React from "react";
import {
  Home,
  Library,
  BookOpen,
  MessageSquare,
  Folder,
  Plus
} from "lucide-react";
import { Link } from "@tanstack/react-router";

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
  return (
    <Sidebar collapsible="offcanvas" className="bg-white border-r border-secondary" {...props}>
      <SidebarHeader className="h-24 flex items-center justify-center px-6">
        <div className="flex items-center justify-center w-full">
          <img src="/brand/logo.svg" alt="stepps.ai" className="h-8 w-auto" />
        </div>
      </SidebarHeader>
      <SidebarContent className="px-3 py-2 gap-6">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive tooltip="Home" className="h-10 px-3 hover:bg-slate-50 text-slate-600 data-[active=true]:bg-indigo-50 data-[active=true]:text-indigo-600 font-medium">
                  <Link to="/app" className="flex items-center gap-3">
                    <Home className="size-[18px]" />
                    <span>Home</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="My Stepps" className="h-10 px-3 hover:bg-slate-50 text-slate-600 font-medium">
                  <div className="flex items-center gap-3 cursor-pointer">
                    <Library className="size-[18px]" />
                    <span>My Stepps</span>
                  </div>
                </SidebarMenuButton>
                {/* Sub-items for showcase */}
                <div className="pl-9 flex flex-col gap-1 mt-1">
                  <div className="flex items-center gap-3 px-2 py-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-50 rounded-md cursor-pointer transition-colors">
                    <Folder className="size-3.5" />
                    <span className="text-sm">Marketing</span>
                  </div>
                  <div className="flex items-center gap-3 px-2 py-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-50 rounded-md cursor-pointer transition-colors">
                    <Folder className="size-3.5" />
                    <span className="text-sm">Support</span>
                  </div>
                  <div className="flex items-center gap-3 px-2 py-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-50 rounded-md cursor-pointer transition-colors">
                    <Folder className="size-3.5" />
                    <span className="text-sm">Product</span>
                  </div>
                </div>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="bg-slate-200 w-[85%] mx-auto" />

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Tutorials" className="h-10 px-3 hover:bg-slate-50 text-slate-600 font-medium">
                  <Link to="/app" className="flex items-center gap-3">
                    <BookOpen className="size-[18px]" />
                    <span>Tutorials</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Feedback" className="h-10 px-3 hover:bg-slate-50 text-slate-600 font-medium">
                  <Link to="/app" className="flex items-center gap-3">
                    <MessageSquare className="size-[18px]" />
                    <span>Feedback</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

      </SidebarContent>
      <SidebarFooter className="p-6">
        <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg shadow-indigo-500/20 active:scale-[0.98]">
          <Plus className="size-5" />
          <span>Create Stepps</span>
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}
