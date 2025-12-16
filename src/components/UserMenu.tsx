import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { LogOut, User, Settings, Shield } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getSupabaseClient } from '../lib/supabase';
import type { View } from '../App';

interface UserMenuProps {
  onNavigate?: (view: View) => void;
}

export function UserMenu({ onNavigate }: UserMenuProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const supabase = getSupabaseClient();

  if (!user) return null;

  const userName = user.user_metadata?.name || user.email?.split('@')[0] || 'Utente';
  const userInitials = userName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
      >
        <Avatar className="w-10 h-10 border-2 border-white/50">
          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
            {userInitials}
          </AvatarFallback>
        </Avatar>
        <div className="hidden md:block text-left">
          <p className="text-sm font-semibold text-white">{userName}</p>
          <p className="text-xs text-white/70">
            {user.email}
          </p>
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Menu */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 w-64 z-50"
            >
              <Card className="p-4 shadow-2xl">
                {/* User Info */}
                <div className="flex items-center gap-3 pb-3 mb-3 border-b border-gray-200">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{userName}</p>
                    <p className="text-sm text-gray-600 truncate">{user.email}</p>
                  </div>
                </div>

                {/* Auth Provider Badge */}
                <div className="mb-3">
                  <div className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                    <Shield className="w-3 h-3" />
                    {user.app_metadata?.provider === 'google' ? 'Google Account' : 'Email Account'}
                  </div>
                </div>

                {/* Menu Items */}
                <div className="space-y-1">
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      setIsOpen(false);
                      // Navigate to profile settings (future feature)
                    }}
                  >
                    <User className="w-4 h-4 mr-2" />
                    Profilo
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      setIsOpen(false);
                      onNavigate?.('settings');
                    }}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Impostazioni
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
