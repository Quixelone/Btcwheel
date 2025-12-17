import { Home, LayoutDashboard, BookOpen, TrendingUp, Trophy, LogOut } from 'lucide-react';
import { getSupabaseClient } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'motion/react';
import type { View } from '../App';

// btcwheel logo - NEW circular emerald design (transparent)
const btcwheelLogo = '/logo.svg';

interface NavigationProps {
  currentView: View;
  onNavigate: (view: View) => void;
}

export function Navigation({ currentView, onNavigate }: NavigationProps) {
  const { user } = useAuth();
  const supabase = getSupabaseClient();
  
  const navItems = [
    { id: 'home' as View, icon: Home, label: 'Home' },
    { id: 'dashboard' as View, icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'lessons' as View, icon: BookOpen, label: 'Lezioni' },
    { id: 'simulation' as View, icon: TrendingUp, label: 'Trading' },
    { id: 'leaderboard' as View, icon: Trophy, label: 'Classifica' }
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <>
      {/* Desktop Navigation removed as it is handled by Layout Sidebar */}
      
      {/* Mobile Navigation - Modern Dark */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-xl border-t border-white/10 safe-area-bottom z-50 shadow-2xl">
        <div className="flex justify-around items-center px-2 py-3">
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <motion.button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`
                  flex flex-col items-center gap-1.5 px-3 py-2 rounded-xl transition-all touch-manipulation min-w-[64px]
                  ${isActive ? 'text-emerald-400' : 'text-gray-400 active:scale-95'}
                `}
                whileTap={{ scale: 0.95 }}
              >
                <div className="relative">
                  <motion.div
                    animate={isActive ? { scale: [1, 1.2, 1] } : {}}
                    transition={{ duration: 0.3 }}
                  >
                    <item.icon className={`w-6 h-6 ${isActive ? 'drop-shadow-[0_0_8px_rgba(52,211,153,0.6)]' : ''}`} />
                  </motion.div>
                  
                  {/* Active indicator dot */}
                  {isActive && (
                    <motion.div
                      className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-emerald-400 rounded-full"
                      layoutId="mobileActiveIndicator"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </div>
                
                <span className={`text-xs transition-all ${isActive ? 'font-semibold text-emerald-400' : 'font-normal text-gray-400'}`}>
                  {item.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
