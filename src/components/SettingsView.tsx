import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import {
  Settings as SettingsIcon,
  LogOut,
  Volume2,
  VolumeX,
  Vibrate,
  Crown,
  Heart,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { Navigation } from './Navigation';
import { DataMigration } from './DataMigration';
import { DataPreviewPanel } from './DataPreviewPanel';
import { DbDuplicatePanel } from './DbDuplicatePanel';
import { AdminDashboard } from './AdminDashboard';
import { BackupRestorePanel } from './BackupRestorePanel';
import { PageWrapper, PageContent, PageHeader, SectionHeader } from './layout/PageWrapper';
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
  const ADMIN_EMAILS = [
    'admin@btcwheel.com',
  ];

  const DEV_MODE = true;

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
    if (!hapticEnabled && 'vibrate' in navigator) {
      navigator.vibrate(20);
    }
  };

  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'Utente';

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.clear();
      onNavigate('landing');
      toast.success('Logout effettuato con successo');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Errore durante il logout');
    }
  };

  return (
    <PageWrapper>
      <Navigation
        currentView="settings"
        onNavigate={onNavigate}
        mascotVisible={mascotVisible}
        onMascotToggle={onMascotToggle}
      />

      <PageContent>
        <PageHeader
          title="Impostazioni"
          subtitle="Gestisci il tuo account e le preferenze dell'applicazione."
        />

        {isAdmin && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20 rounded-[24px] p-8 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none" />
            <div className="flex items-center gap-6 relative z-10">
              <div className="w-16 h-16 bg-amber-500/20 border border-amber-500/30 rounded-2xl flex items-center justify-center shadow-[0_0_30px_-10px_rgba(245,158,11,0.3)]">
                <Crown className="w-8 h-8 text-amber-500" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white tracking-tight">Modalità Amministratore</h3>
                <p className="text-amber-200/70 text-base mt-1">Accesso completo a migrazioni, backup e strumenti di debug.</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Account Section */}
        <section>
          <SectionHeader title="Profilo Utente" />
          <div className="mt-6 bg-[#0A0A0C] border border-white/[0.08] rounded-[24px] p-8">
            <div className="flex flex-col md:flex-row md:items-center gap-8">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center text-3xl font-bold text-white uppercase shadow-lg">
                {userName.substring(0, 2)}
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-[#666677] uppercase tracking-wider block mb-1">Nome Visualizzato</label>
                  <p className="text-xl font-bold text-white">{userName}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#666677] uppercase tracking-wider block mb-1">Indirizzo Email</label>
                  <p className="text-[#888899] font-medium">{user?.email}</p>
                </div>
              </div>
              {isAdmin && (
                <div className="bg-amber-500/10 border border-amber-500/20 px-6 py-3 rounded-xl">
                  <p className="text-[10px] font-bold text-amber-500 uppercase tracking-wider mb-1">Ruolo</p>
                  <p className="text-sm font-bold text-white uppercase flex items-center gap-2">
                    <Crown className="w-4 h-4" /> Admin
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Preferences Section */}
        <section>
          <SectionHeader title="Esperienza & Feedback" />
          <div className="grid md:grid-cols-2 gap-6 mt-6">
            <div className="bg-[#0A0A0C] border border-white/[0.08] rounded-[24px] p-8 hover:border-white/[0.15] transition-all group">
              <div className="flex items-center justify-between mb-6">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${soundEnabled ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-white/[0.03] border border-white/[0.05] text-[#666677]'}`}>
                  {soundEnabled ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
                </div>
                <button
                  onClick={toggleSound}
                  className={`w-14 h-8 rounded-full transition-all relative ${soundEnabled ? 'bg-emerald-500' : 'bg-white/[0.1]'}`}
                >
                  <motion.div
                    className="w-6 h-6 bg-white rounded-full absolute top-1 shadow-lg"
                    animate={{ left: soundEnabled ? 28 : 4 }}
                  />
                </button>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Audio Mascotte</h3>
              <p className="text-[#888899] text-sm leading-relaxed">Abilita i suoni e la voce del tuo tutor Bitcoin.</p>
            </div>

            {supportsHaptics && (
              <div className="bg-[#0A0A0C] border border-white/[0.08] rounded-[24px] p-8 hover:border-white/[0.15] transition-all group">
                <div className="flex items-center justify-between mb-6">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${hapticEnabled ? 'bg-purple-500/10 border border-purple-500/20 text-purple-400' : 'bg-white/[0.03] border border-white/[0.05] text-[#666677]'}`}>
                    <Vibrate className="w-6 h-6" />
                  </div>
                  <button
                    onClick={toggleHaptic}
                    className={`w-14 h-8 rounded-full transition-all relative ${hapticEnabled ? 'bg-purple-500' : 'bg-white/[0.1]'}`}
                  >
                    <motion.div
                      className="w-6 h-6 bg-white rounded-full absolute top-1 shadow-lg"
                      animate={{ left: hapticEnabled ? 28 : 4 }}
                    />
                  </button>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Feedback Aptico</h3>
                <p className="text-[#888899] text-sm leading-relaxed">Vibrazioni tattili durante le interazioni e i quiz.</p>
              </div>
            )}
          </div>
        </section>

        {/* Security Section */}
        <section>
          <SectionHeader title="Sicurezza & Privacy" />
          <div className="mt-6 bg-[#0A0A0C] border border-white/[0.08] rounded-[24px] p-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="flex gap-5">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center flex-shrink-0 border border-emerald-500/20">
                  <ShieldCheck className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h4 className="font-bold text-white mb-1">Dati Protetti</h4>
                  <p className="text-[#888899] text-sm leading-relaxed">I tuoi progressi e le chiavi API sono crittografati end-to-end.</p>
                </div>
              </div>
              <div className="flex gap-5">
                <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center flex-shrink-0 border border-blue-500/20">
                  <ShieldCheck className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h4 className="font-bold text-white mb-1">Zero Tracking</h4>
                  <p className="text-[#888899] text-sm leading-relaxed">Non condividiamo mai i tuoi dati con terze parti o inserzionisti.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Admin Section */}
        {isAdmin && (
          <section>
            <SectionHeader title="Strumenti di Sistema" />
            <div className="mt-6 space-y-6">
              <DataMigration />
              <BackupRestorePanel />
              <DbDuplicatePanel />
              <DataPreviewPanel />

              <div className="bg-[#0A0A0C] border border-white/[0.08] rounded-[24px] p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/20">
                      <SettingsIcon className="w-6 h-6 text-blue-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white">Pannello di Controllo</h3>
                  </div>
                  <Button
                    onClick={() => setShowAdminPanel(!showAdminPanel)}
                    variant="outline"
                    className="border-white/10 hover:bg-white/5 text-xs font-bold uppercase tracking-wider"
                  >
                    {showAdminPanel ? 'Nascondi' : 'Mostra'}
                  </Button>
                </div>
                <AnimatePresence>
                  {showAdminPanel && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <AdminDashboard />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </section>
        )}

        {/* Logout Section */}
        <section className="pt-8 pb-12">
          <Button
            onClick={handleLogout}
            className="w-full h-16 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-xl font-bold uppercase tracking-widest transition-all hover:scale-[1.01]"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Disconnetti Account
          </Button>

          <div className="text-center mt-8 space-y-2">
            <p className="text-[#666677] font-bold text-[10px] uppercase tracking-widest">BTC Wheel Pro v1.0.0</p>
            <p className="text-[#888899] font-medium text-sm flex items-center justify-center gap-2">
              Made with <Heart className="w-4 h-4 text-red-500 fill-current" /> for Bitcoiners
            </p>
          </div>
        </section>
      </PageContent>
    </PageWrapper>
  );
}