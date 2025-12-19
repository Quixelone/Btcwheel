import { ReactNode, useState } from "react";
import { LayoutDashboard, BookOpen, GraduationCap, Settings, Home, Trophy, LogOut, PanelLeftOpen, PanelLeftClose } from "lucide-react";
import type { View } from "../App";
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

function SimpleSidebar({ currentView, onNavigate, collapsed, setCollapsed }: { currentView: View; onNavigate: (view: View) => void; collapsed: boolean; setCollapsed: (v: boolean) => void }) {
  const supabase = getSupabaseClient();
  const handleLogout = async () => { await supabase.auth.signOut(); window.location.reload(); };
  return (
    <aside className={`relative shrink-0 transition-all duration-300 ease-in-out ${collapsed ? 'w-20' : 'w-[260px]'} bg-zinc-900/95 text-white`}>
      <div className="px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
            <img src="/logo.svg" alt="Logo" className="w-5 h-5" />
          </div>
          {!collapsed && <span className="font-bold tracking-tight">BtcWheel</span>}
        </div>
        <button onClick={() => setCollapsed(!collapsed)} className="p-2 rounded hover:bg-white/10">
          {collapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
        </button>
      </div>
      <nav className="px-2">
        <p className={`text-xs text-gray-400 mb-2 ${collapsed ? 'sr-only' : ''}`}>Menu</p>
        <ul className="space-y-1">
          {menuItems.map(item => (
            <li key={item.title}>
              <button onClick={() => onNavigate(item.view)} className={`w-full flex items-center gap-3 rounded px-3 py-2 transition-all ${currentView === item.view ? 'bg-emerald-500/10 text-emerald-400' : 'text-gray-300 hover:bg-white/5'}`}>
                <item.icon className="w-5 h-5" />
                {!collapsed && <span className="truncate">{item.title}</span>}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      <div className="mt-auto px-2 py-4">
        <button onClick={handleLogout} className={`w-full flex items-center gap-3 rounded px-3 py-2 text-gray-300 hover:bg-red-500/10 hover:text-red-400`}>
          <LogOut className="w-5 h-5" />
          {!collapsed && <span>Esci</span>}
        </button>
      </div>
    </aside>
  );
}

export function Layout({ children, currentView, onNavigate }: LayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className="flex h-screen w-full bg-[#050505] text-white overflow-hidden">
      <SimpleSidebar currentView={currentView} onNavigate={onNavigate} collapsed={collapsed} setCollapsed={setCollapsed} />
      <main className="flex-1 min-w-0 overflow-y-auto p-8">
        <div className="w-full max-w-screen-2xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
