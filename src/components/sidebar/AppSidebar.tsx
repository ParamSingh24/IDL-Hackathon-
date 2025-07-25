
import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Home,
  Mic,
  BookOpen,
  BarChart3,
  Trophy,
  Settings,
  ChevronRight,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { DebateSetupModal } from "@/components/debate/DebateSetupModal";

const menuItems = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Practice Debates", url: "/practice", icon: Mic, badge: "3 Active" },
  { title: "Learning Path", url: "/learning", icon: BookOpen },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "Achievements", url: "/achievements", icon: Trophy, badge: "2 New" },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const isCollapsed = state === "collapsed";

  const getNavClassName = (url: string) => {
    const isActive = location.pathname === url;
    return `flex items-center gap-3 w-full text-left transition-all duration-200 ${
      isActive
        ? "bg-primary text-white shadow-sm"
        : "text-white hover:bg-accent/10 hover:text-accent-foreground"
    }`;
  };

  return (
    <Sidebar className="sidebar border-r border-border bg-secondary text-primary">
      <SidebarContent className="pt-6">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavClassName(item.url)}>
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      {!isCollapsed && (
                        <>
                          <span className="flex-1 text-white">{item.title}</span>
                          {item.badge && (
                            <Badge 
                              variant="secondary" 
                              className="text-xs ml-auto text-accent"
                            >
                              {item.badge}
                            </Badge>
                          )}
                        </>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Quick Actions */}
        {!isCollapsed && (
          <div className="mt-8 px-4">
            <h3 className="text-sm font-medium text-white mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <DebateSetupModal>
                <button className="w-full btn bg-accent text-white font-bold rounded-lg py-2 hover:shadow-[0_0_15px_#A3FF6A,0_0_25px_#7ED321] hover:bg-accent transition-all">
                  <span className="font-medium">Start New Debate</span>
                </button>
              </DebateSetupModal>

              <button
                className="w-full p-2 border border-border rounded-lg hover:bg-accent/10 hover:border-accent transition-colors text-white bg-secondary"
              >
                <span className="text-sm">Log In</span>
              </button>
            </div>
          </div>
        )}
      </SidebarContent>

    </Sidebar>
  );
}
