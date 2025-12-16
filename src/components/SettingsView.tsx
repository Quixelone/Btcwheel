import { Navigation } from './Navigation';
import { Card } from './ui/card';
import { Volume2, VolumeX, Vibrate, User, Bell, Shield, Info } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../hooks/useAuth';
import type { View } from '../App';

interface SettingsViewProps {
  onNavigate: (view: View) => void;
}

export function SettingsView({ onNavigate }: SettingsViewProps) {
  const { user } = useAuth();
  const [soundEnabled, setSoundEnabled] = useState(() => {
    return localStorage.getItem('mascotSoundEnabled') !== 'false';
  });
  
  const [hapticEnabled, setHapticEnabled] = useState(() => {
    return localStorage.getItem('mascotHapticEnabled') !== 'false';
  });

  // Check if device supports vibration
  const supportsHaptics = 'vibrate' in navigator;

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

  return (
    <div className="min-h-screen md:pl-20 pb-24 md:pb-0 bg-gray-50">
      <Navigation currentView="home" onNavigate={onNavigate} />
      
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 safe-area-top sticky top-0 z-40 shadow-lg">
        <div className="px-4 py-4 md:px-6 md:py-6">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-white">Impostazioni</h1>
            <p className="text-blue-100">Personalizza la tua esperienza</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6 md:px-6 md:py-8">
        {/* Account Section */}
        <div className="mb-6">
          <h2 className="text-gray-900 mb-4 flex items-center gap-2">
            <User className="w-5 h-5" />
            Account
          </h2>
          <Card className="p-5 md:p-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-600">Nome</label>
                <p className="text-gray-900 font-medium">{userName}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Email</label>
                <p className="text-gray-900 font-medium">{user?.email}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Provider</label>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm mt-1">
                  <Shield className="w-4 h-4" />
                  {user?.app_metadata?.provider === 'google' ? 'Google Account' : 'Email/Password'}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Feedback & Sounds Section */}
        <div className="mb-6">
          <h2 className="text-gray-900 mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Feedback Mascotte
          </h2>
          <Card className="p-5 md:p-6">
            <p className="text-sm text-gray-600 mb-4">
              Personalizza i feedback della mascotte per un'esperienza ottimale
            </p>
            
            <div className="space-y-3">
              {/* Sound Toggle */}
              <button
                onClick={toggleSound}
                className="w-full flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors active:scale-98 touch-manipulation"
              >
                <div className="flex items-center gap-3">
                  {soundEnabled ? (
                    <Volume2 className="w-5 h-5 text-blue-600" />
                  ) : (
                    <VolumeX className="w-5 h-5 text-gray-400" />
                  )}
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900">Suoni</p>
                    <p className="text-xs text-gray-500">
                      {soundEnabled ? 'La mascotte emetterà suoni' : 'Suoni disattivati'}
                    </p>
                  </div>
                </div>
                <div
                  className={`w-11 h-6 rounded-full transition-colors ${
                    soundEnabled ? 'bg-blue-600' : 'bg-gray-300'
                  } relative`}
                >
                  <motion.div
                    className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                    animate={{ x: soundEnabled ? 24 : 4 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                </div>
              </button>

              {/* Haptic Toggle (only if supported) */}
              {supportsHaptics && (
                <button
                  onClick={toggleHaptic}
                  className="w-full flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors active:scale-98 touch-manipulation"
                >
                  <div className="flex items-center gap-3">
                    <Vibrate className={`w-5 h-5 ${hapticEnabled ? 'text-purple-600' : 'text-gray-400'}`} />
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-900">Vibrazioni</p>
                      <p className="text-xs text-gray-500">
                        {hapticEnabled ? 'Feedback tattile attivo' : 'Vibrazioni disattivate'}
                      </p>
                    </div>
                  </div>
                  <div
                    className={`w-11 h-6 rounded-full transition-colors ${
                      hapticEnabled ? 'bg-purple-600' : 'bg-gray-300'
                    } relative`}
                  >
                    <motion.div
                      className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                      animate={{ x: hapticEnabled ? 24 : 4 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  </div>
                </button>
              )}
            </div>
          </Card>
        </div>

        {/* About Section */}
        <div>
          <h2 className="text-gray-900 mb-4 flex items-center gap-2">
            <Info className="w-5 h-5" />
            Informazioni
          </h2>
          <Card className="p-5 md:p-6">
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">App Version</p>
                <p className="text-gray-900 font-medium">1.0.0</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Build</p>
                <p className="text-gray-900 font-medium">Production</p>
              </div>
              <div className="pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-500 leading-relaxed">
                  btcwheel - Impara la Bitcoin Wheel Strategy con gamification, AI tutor e simulazioni realistiche.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
