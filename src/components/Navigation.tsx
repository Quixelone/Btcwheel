import { Home, LayoutDashboard, BookOpen, TrendingUp, Trophy, LogOut } from 'lucide-react';
import { getSupabaseClient } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'motion/react';
import type { View } from '../App';

// btcwheel logo - NEW circular emerald design (transparent)
import btcwheelLogo from 'figma:asset/b2ebfbbeb483ffdf078e6ecdca686b1e139921dc.png';

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
      {/* Desktop Navigation - Modern Dark */}
      <nav className="hidden md:flex fixed left-0 top-0 h-screen w-20 bg-gray-900/80 backdrop-blur-xl border-r border-white/10 flex-col items-center py-6 gap-6 z-50">
        {/* Logo */}
        <motion.div 
          className="w-12 h-12 rounded-xl flex items-center justify-center mb-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <img 
            src={btcwheelLogo}
            alt="btcwheel"
            className="w-full h-full object-contain"
            style={{ filter: 'drop-shadow(0 0 12px rgba(52, 211, 153, 0.5))' }}
          />
        </motion.div>

        {/* Nav Items */}
        <div className="flex-1 flex flex-col gap-3">
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <motion.button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`
                  relative w-14 h-14 rounded-xl flex items-center justify-center transition-all group
                  ${isActive
                    ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/50'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }
                `}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                title={item.label}
              >
                <item.icon className={`w-6 h-6 ${isActive ? 'drop-shadow-sm' : ''}`} />
                
                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    className="absolute -left-[1px] top-1/2 -translate-y-1/2 w-1 h-8 bg-emerald-400 rounded-r-full"
                    layoutId="activeIndicator"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}

                {/* Hover tooltip */}
                <div className="absolute left-full ml-4 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-white/10">
                  {item.label}
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Logout button */}
        {user && (
          <motion.button
            onClick={handleLogout}
            className="w-14 h-14 rounded-xl flex items-center justify-center text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all group"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Logout"
          >
            <LogOut className="w-6 h-6" />
            
            {/* Hover tooltip */}
            <div className="absolute left-full ml-4 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-white/10">
              Esci
            </div>
          </motion.button>
        )}
      </nav>

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
