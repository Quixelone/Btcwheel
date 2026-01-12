import { Home, LayoutDashboard, BookOpen, TrendingUp, Trophy, LogOut, Sparkles, Link as LinkIcon } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'motion/react';
import type { View } from '../App';

// btcwheel logo - NEW circular emerald design (transparent)
import btcwheelLogo from 'figma:asset/b2ebfbbeb483ffdf078e6ecdca686b1e139921dc.png';

interface NavigationProps {
  currentView: View;
  onNavigate: (view: View) => void;
  onMascotToggle?: () => void;
  mascotVisible?: boolean;
}

export function Navigation({ currentView, onNavigate, onMascotToggle, mascotVisible }: NavigationProps) {
  const { user, signOut } = useAuth();
  
  const navItems = [
    { id: 'home' as View, icon: Home, label: 'Home' },
    { id: 'dashboard' as View, icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'lessons' as View, icon: BookOpen, label: 'Lezioni' },
    { id: 'simulation' as View, icon: TrendingUp, label: 'Trading' },
    { id: 'exchange' as View, icon: LinkIcon, label: 'Exchange' },
    { id: 'leaderboard' as View, icon: Trophy, label: 'Classifica' }
  ];

  const handleLogout = async () => {
    console.log('🚪 [Navigation] Logging out...');
    await signOut();
    // Wait a bit for state to clear, then reload
    setTimeout(() => {
      window.location.reload();
    }, 300);
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <nav className="hidden md:flex fixed left-0 top-0 h-screen w-20 bg-gray-900/95 backdrop-blur-xl border-r border-white/10 flex-col items-center py-6 z-50 safe-area-left">
        {/* Logo */}
        <div className="mb-8 w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 p-2 shadow-lg shadow-emerald-500/20">
          <img src={btcwheelLogo} alt="btcwheel" className="w-full h-full object-contain" />
        </div>

        {/* Nav Items */}
        <div className="flex-1 flex flex-col gap-4 w-full px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <motion.button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`relative group flex flex-col items-center justify-center gap-1 p-3 rounded-xl transition-all ${
                  isActive
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[9px] font-medium">{item.label}</span>
                
                {isActive && (
                  <motion.div
                    className="absolute -left-3 top-1/2 -translate-y-1/2 w-1 h-8 bg-emerald-500 rounded-r-full"
                    layoutId="activeIndicator"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}

                {/* Tooltip */}
                <div className="absolute left-full ml-4 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 border border-white/10">
                  {item.label}
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Mascot Toggle (Desktop) */}
        {onMascotToggle && (
          <button
            onClick={onMascotToggle}
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all mb-4 ${
              mascotVisible
                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
            }`}
            title={mascotVisible ? 'Nascondi Prof Satoshi' : 'Mostra Prof Satoshi'}
          >
            <Sparkles className="w-5 h-5" />
          </button>
        )}

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-12 h-12 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 flex items-center justify-center transition-all group"
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </nav>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-gray-900/95 backdrop-blur-xl border-t border-white/10 z-50 safe-area-bottom">
        <div className="h-full flex items-center justify-around px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <motion.button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex flex-col items-center justify-center gap-1 p-2 rounded-xl transition-all min-w-[60px] ${
                  isActive
                    ? 'text-emerald-400'
                    : 'text-gray-400'
                }`}
                whileTap={{ scale: 0.9 }}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[9px] font-medium">{item.label}</span>
                {isActive && (
                  <motion.div
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-emerald-500 rounded-t-full"
                    layoutId="mobileActiveIndicator"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
