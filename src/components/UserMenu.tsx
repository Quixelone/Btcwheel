import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { LogOut, User, Settings, Shield, Sparkles } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import type { View } from '../App';

interface UserMenuProps {
  onNavigate?: (view: View) => void;
}

export function UserMenu({ onNavigate }: UserMenuProps) {
  const { user, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  const userName = user.user_metadata?.name || user.email?.split('@')[0] || 'Utente';
  const userInitials = userName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleLogout = async () => {
    console.log('🚪 [UserMenu] Logging out...');
    setIsOpen(false);
    await signOut();
    setTimeout(() => {
      window.location.reload();
    }, 300);
  };

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-4 bg-slate-950/50 backdrop-blur-xl border border-white/10 p-2 pr-5 rounded-2xl hover:bg-slate-900/80 transition-all group shadow-lg"
      >
        <div className="relative">
          <Avatar className="w-10 h-10 border-2 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-black text-xs">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-950 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
        </div>
        <div className="hidden md:block text-left">
          <p className="text-[11px] font-black text-white uppercase tracking-wider">{userName}</p>
          <div className="flex items-center gap-1.5">
            <Shield className="w-2.5 h-2.5 text-emerald-500" />
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
              {user.app_metadata?.provider === 'google' ? 'Verified' : 'Member'}
            </p>
          </div>
        </div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />

            {/* Menu */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="absolute right-0 top-full mt-4 w-80 z-50"
            >
              <Card className="p-8 bg-slate-950/95 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.6)] overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none" />

                {/* User Info Header */}
                <div className="flex items-center gap-5 pb-8 mb-8 border-b border-white/5 relative z-10">
                  <div className="relative">
                    <Avatar className="w-16 h-16 border-2 border-emerald-500/30">
                      <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-black text-xl">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-4 border-slate-950 rounded-full" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-lg font-black text-white uppercase tracking-tight truncate">{userName}</p>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] truncate mt-1">{user.email}</p>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="space-y-3 relative z-10">
                  <Button
                    variant="ghost"
                    className="w-full h-14 justify-start rounded-2xl text-slate-400 hover:text-white hover:bg-white/5 font-black uppercase text-[10px] tracking-[0.2em] transition-all group"
                    onClick={() => {
                      setIsOpen(false);
                      onNavigate?.('dashboard');
                    }}
                  >
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center mr-4 group-hover:bg-blue-500/20 transition-colors">
                      <User className="w-5 h-5 text-blue-500" />
                    </div>
                    Il Mio Profilo
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full h-14 justify-start rounded-2xl text-slate-400 hover:text-white hover:bg-white/5 font-black uppercase text-[10px] tracking-[0.2em] transition-all group"
                    onClick={() => {
                      setIsOpen(false);
                      onNavigate?.('settings');
                    }}
                  >
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center mr-4 group-hover:bg-emerald-500/20 transition-colors">
                      <Settings className="w-5 h-5 text-emerald-500" />
                    </div>
                    Impostazioni
                  </Button>

                  <div className="pt-6 mt-6 border-t border-white/5">
                    <Button
                      variant="ghost"
                      className="w-full h-14 justify-start rounded-2xl text-red-500 hover:text-red-400 hover:bg-red-500/5 font-black uppercase text-[10px] tracking-[0.2em] transition-all group"
                      onClick={handleLogout}
                    >
                      <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center mr-4 group-hover:bg-red-500/20 transition-colors">
                        <LogOut className="w-5 h-5" />
                      </div>
                      Disconnetti
                    </Button>
                  </div>
                </div>

                {/* Premium Badge Section */}
                <div className="mt-8 p-5 bg-gradient-to-br from-emerald-600/10 to-teal-600/10 rounded-[1.5rem] border border-emerald-500/20 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="flex items-center gap-4 relative z-10">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div>
                      <span className="block text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]">Master of the Wheel</span>
                      <span className="block text-[8px] font-black text-emerald-500/50 uppercase tracking-widest mt-0.5">Premium Member</span>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}