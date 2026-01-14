import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Shield, 
  LogOut, 
  Database,
  Info,
  Volume2,
  VolumeX,
  Vibrate,
  Eye,
  EyeOff,
  Crown,
  Trash2,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { Navigation } from './Navigation';
import { DataMigration } from './DataMigration';
import { DataPreviewPanel } from './DataPreviewPanel';
import { DbDuplicatePanel } from './DbDuplicatePanel';
import { AdminDashboard } from './AdminDashboard';
import type { View } from '../App';

interface SettingsViewProps {
  onNavigate: (view: View) => void;
  mascotVisible?: boolean;
  onMascotToggle?: () => void;
}

export function SettingsView({ onNavigate, mascotVisible, onMascotToggle }: SettingsViewProps) {
  const { user } = useAuth();
  const [soundEnabled, setSoundEnabled] = useState(() => {
    return localStorage.getItem('mascotSoundEnabled') !== 'false';
  });
  
  const [hapticEnabled, setHapticEnabled] = useState(() => {
    return localStorage.getItem('mascotHapticEnabled') !== 'false';
  });

  const [showAdminPanel, setShowAdminPanel] = useState(false);

  // Check if device supports vibration
  const supportsHaptics = 'vibrate' in navigator;

  // 👑 ADMIN ACCESS CONTROL
  // Customize this logic based on your needs:
  const ADMIN_EMAILS = [
    'admin@btcwheel.com',
    // Add more admin emails here
  ];
  
  // For development/testing: enable admin for all users
  const DEV_MODE = true; // Set to false in production
  
  const isAdmin = DEV_MODE || 
    ADMIN_EMAILS.includes(user?.email || '') ||
    user?.email?.includes('admin') ||
    user?.user_metadata?.role === 'admin';

  useEffect(() => {
    localStorage.setItem('mascotSoundEnabled', String(soundEnabled));
  }, [soundEnabled]);

  useEffect(() => {
    localStorage.setItem('mascotHapticEnabled', String(hapticEnabled));
  }, [hapticEnabled]);

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
  };

  const toggleHaptic = () => {
    setHapticEnabled(!hapticEnabled);
    // Give immediate feedback
    if (!hapticEnabled && 'vibrate' in navigator) {
      navigator.vibrate(20);
    }
  };

  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'Utente';

  const handleLogout = async () => {
    try {
      // Clear auth state
      await supabase.auth.signOut();
      
      // Clear local storage
      localStorage.clear();
      
      // Refresh page to reset app state
      window.location.reload();
      
      toast.success('Logout effettuato con successo');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Errore durante il logout');
    }
  };

  return (
    <div className="min-h-screen md:pl-20 pb-24 md:pb-0 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white relative">
      
      {/* Subtle grid background */}
      <div className="fixed inset-0 opacity-[0.02] pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }} />
      </div>

      {/* Gradient orbs */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[150px] pointer-events-none" />

      <Navigation 
        currentView="settings" 
        onNavigate={onNavigate}
        mascotVisible={mascotVisible}
        onMascotToggle={onMascotToggle}
      />
      
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative px-4 py-8 md:px-6 max-w-4xl mx-auto"
      >
        <div className="flex items-center gap-4 mb-2">
          <motion.div
            className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/50"
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            <SettingsIcon className="w-8 h-8 text-white drop-shadow-sm" />
          </motion.div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Impostazioni
              </h1>
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-6 h-6 text-blue-400" />
              </motion.div>
            </div>
            <p className="text-gray-400 mt-1">
              Personalizza la tua esperienza
            </p>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="relative max-w-4xl mx-auto px-4 py-6 md:px-6 md:py-8 space-y-6">
        
        {/* Admin Badge - Visible at top if user is admin */}
        {isAdmin && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.05 }}
          >
            <Card className="p-4 bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-orange-500/20 backdrop-blur-xl border border-amber-400/30">
              <div className="flex items-center gap-3">
                <Crown className="w-8 h-8 text-amber-400 animate-pulse" />
                <div>
                  <h3 className="text-amber-300 font-bold text-lg">👑 Modalità Amministratore</h3>
                  <p className="text-amber-200/80 text-sm">Hai accesso completo a tutte le funzioni admin. Scorri in basso per vedere i pannelli di gestione.</p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
        
        {/* Account Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-white mb-4 flex items-center gap-2 text-xl">
            <User className="w-6 h-6 text-blue-400" />
            Account
          </h2>
          <Card className="p-6 bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-xl border border-white/10">
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400">Nome</label>
                <p className="text-white font-medium text-lg">{userName}</p>
              </div>
              <div>
                <label className="text-sm text-gray-400">Email</label>
                <p className="text-white font-medium">{user?.email}</p>
              </div>
              <div>
                <label className="text-sm text-gray-400">Provider</label>
                <p className="text-white font-medium capitalize">
                  {user?.app_metadata?.provider || 'Email'}
                </p>
              </div>
              {isAdmin && (
                <div className="pt-2 border-t border-amber-400/20">
                  <label className="text-sm text-amber-400">Ruolo</label>
                  <p className="text-amber-300 font-bold flex items-center gap-2">
                    <Crown className="w-5 h-5" />
                    Amministratore
                  </p>
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Preferences Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-white mb-4 flex items-center gap-2 text-xl">
            <Bell className="w-6 h-6 text-emerald-400" />
            Preferenze
          </h2>
          <div className="space-y-4">
            {/* Sound Toggle */}
            <Card className="p-5 bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-xl border border-white/10">
              <button
                onClick={toggleSound}
                className="w-full flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    soundEnabled 
                      ? 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/30' 
                      : 'bg-gray-700/50'
                  }`}>
                    {soundEnabled ? (
                      <Volume2 className="w-6 h-6 text-white" />
                    ) : (
                      <VolumeX className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                  <div className="text-left">
                    <p className="text-white font-medium">Audio Mascotte</p>
                    <p className="text-gray-400 text-sm">
                      {soundEnabled ? 'Attivo' : 'Disattivato'}
                    </p>
                  </div>
                </div>
                <div className={`w-14 h-8 rounded-full transition-colors ${
                  soundEnabled ? 'bg-emerald-500' : 'bg-gray-700'
                }`}>
                  <div className={`w-6 h-6 bg-white rounded-full mt-1 transition-transform ${
                    soundEnabled ? 'ml-7' : 'ml-1'
                  }`} />
                </div>
              </button>
            </Card>

            {/* Haptic Feedback Toggle */}
            {supportsHaptics && (
              <Card className="p-5 bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-xl border border-white/10">
                <button
                  onClick={toggleHaptic}
                  className="w-full flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      hapticEnabled 
                        ? 'bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg shadow-purple-500/30' 
                        : 'bg-gray-700/50'
                    }`}>
                      <Vibrate className={`w-6 h-6 ${hapticEnabled ? 'text-white' : 'text-gray-400'}`} />
                    </div>
                    <div className="text-left">
                      <p className="text-white font-medium">Feedback Aptico</p>
                      <p className="text-gray-400 text-sm">
                        {hapticEnabled ? 'Attivo' : 'Disattivato'}
                      </p>
                    </div>
                  </div>
                  <div className={`w-14 h-8 rounded-full transition-colors ${
                    hapticEnabled ? 'bg-purple-500' : 'bg-gray-700'
                  }`}>
                    <div className={`w-6 h-6 bg-white rounded-full mt-1 transition-transform ${
                      hapticEnabled ? 'ml-7' : 'ml-1'
                    }`} />
                  </div>
                </button>
              </Card>
            )}
          </div>
        </motion.div>

        {/* Privacy & Security */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-white mb-4 flex items-center gap-2 text-xl">
            <Shield className="w-6 h-6 text-amber-400" />
            Privacy & Sicurezza
          </h2>
          <Card className="p-6 bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-xl border border-white/10">
            <div className="space-y-3 text-gray-300">
              <p className="flex items-start gap-2">
                <span className="text-emerald-400 mt-1">✓</span>
                <span>I tuoi dati sono crittografati end-to-end</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-emerald-400 mt-1">✓</span>
                <span>Le API keys degli exchange sono salvate in modo sicuro</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-emerald-400 mt-1">✓</span>
                <span>Non condividiamo mai i tuoi dati con terze parti</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-emerald-400 mt-1">✓</span>
                <span>Tutte le connessioni usano HTTPS sicuro</span>
              </p>
            </div>
          </Card>
        </motion.div>

        {/* Data Migration Section */}
        <DataMigration />

        {/* Data Preview Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.36 }}
        >
          <DataPreviewPanel />
        </motion.div>

        {/* DB Duplicate Panel (Admin Only) */}
        {isAdmin && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.38 }}
          >
            <h2 className="text-white mb-4 flex items-center gap-2 text-xl">
              <Database className="w-6 h-6 text-cyan-400" />
              Duplica Database
            </h2>
            <DbDuplicatePanel />
          </motion.div>
        )}

        {/* Admin Dashboard - Unified Admin Panel */}
        {isAdmin && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <AdminDashboard />
          </motion.div>
        )}

        {/* About Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-white mb-4 flex items-center gap-2 text-xl">
            <Info className="w-6 h-6 text-blue-400" />
            Informazioni
          </h2>
          <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-xl border border-blue-500/20">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Versione App</span>
                <span className="text-white font-medium">1.0.0</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Build</span>
                <span className="text-white font-medium">2024.01</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Piattaforma</span>
                <span className="text-white font-medium">Web PWA</span>
              </div>
              <div className="pt-3 mt-3 border-t border-white/10">
                <p className="text-gray-400 text-sm text-center">
                  Made with 💚 for Bitcoin Traders
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}