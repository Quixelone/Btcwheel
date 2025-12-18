import { ReactNode } from "react";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  Settings,
  Home,
  Trophy,
  LogOut,
} from "lucide-react";
import type { View } from "../App";
import { cn } from "@/components/ui/utils";
import { getSupabaseClient } from "../lib/supabase";

// Menu items configuration
const menuItems = [
  {
    title: "Home",
    icon: Home,
    view: "home" as const,
  },
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    view: "dashboard" as const,
  },
  {
    title: "Academy",
    icon: GraduationCap,
    view: "lessons" as const,
  },
  {
    title: "Journal",
    icon: BookOpen,
    view: "simulation" as const, // Using simulation as Journal for now
  },
  {
    title: "Classifica",
    icon: Trophy,
    view: "leaderboard" as const,
  },
];

interface LayoutProps {
  children: ReactNode;
  currentView: View;
  onNavigate: (view: View) => void;
}

function AppSidebar({ 
  currentView, 
  onNavigate,
  collapsible = "offcanvas"
}: { 
  currentView: View; 
  onNavigate: (view: View) => void;
  collapsible?: "offcanvas" | "icon" | "none";
}) {
  const supabase = getSupabaseClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <Sidebar 
      className="border-r border-white/10 bg-zinc-900/95 backdrop-blur-xl" 
      collapsible={collapsible}
    >
      <SidebarHeader className="p-4 border-b border-white/10">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <img src="/logo.svg" alt="Logo" className="w-5 h-5" />
          </div>
          <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            BtcWheel
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-400 font-medium px-2 mb-2">Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    onClick={() => onNavigate(item.view)}
                    isActive={currentView === item.view}
                    tooltip={item.title}
                    className={cn(
                      "transition-all duration-200 py-3",
                      currentView === item.view
                        ? "bg-emerald-500/10 text-emerald-400 font-medium"
                        : "text-gray-400 hover:bg-white/5 hover:text-blue-400"
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarGroupLabel className="text-gray-400 font-medium">Settings</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => onNavigate("settings")}
                  isActive={currentView === "settings"}
                  tooltip="Settings"
                  className={cn(
                    "transition-all duration-200",
                    currentView === "settings"
                      ? "bg-blue-500/10 text-blue-400 font-medium"
                      : "text-gray-400 hover:bg-white/5 hover:text-blue-400"
                  )}
                >
                  <Settings className="w-5 h-5" />
                  <span>Settings</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-white/10">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={handleLogout}
              className="text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-colors w-full justify-start"
            >
              <LogOut className="w-5 h-5 mr-2" />
              <span>Esci</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

export function Layout({ children, currentView, onNavigate }: LayoutProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full bg-[#050505] text-white">
        {/* Fixed Sidebar */}
        <div className="hidden md:block">
          <AppSidebar currentView={currentView} onNavigate={onNavigate} collapsible="none" />
        </div>
        
        {/* Mobile Sidebar (controlled by SidebarProvider) */}
        <div className="md:hidden">
          <AppSidebar currentView={currentView} onNavigate={onNavigate} collapsible="offcanvas" />
        </div>

        {/* Main Content with adjusted margins */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden w-full relative z-0 md:ml-64">
          {/* Mobile Header with Trigger */}
          <header className="flex items-center gap-4 border-b border-white/10 bg-[#050505]/95 backdrop-blur-md px-6 py-4 md:hidden sticky top-0 z-40">
            <SidebarTrigger className="text-white" />
            <div className="flex items-center gap-2">
              <img src="/logo.svg" alt="BtcWheel" className="h-6 w-auto" />
              <span className="font-semibold text-white">BtcWheel</span>
            </div>
          </header>

          <div className="flex-1 overflow-auto p-4 md:p-8 w-full">
            <div className="max-w-7xl mx-auto w-full">
              {children}
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
