import { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Detect iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Listen for beforeinstallprompt event
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show install prompt after 10 seconds
      setTimeout(() => {
        setShowInstallPrompt(true);
      }, 10000);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Check if dismissed before
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      const dismissedDate = new Date(dismissed);
      const now = new Date();
      const daysSinceDismissed = (now.getTime() - dismissedDate.getTime()) / (1000 * 3600 * 24);
      
      // Show again after 7 days
      if (daysSinceDismissed < 7) {
        setShowInstallPrompt(false);
      }
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
      setIsInstalled(true);
    }

    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    localStorage.setItem('pwa-install-dismissed', new Date().toISOString());
  };

  if (isInstalled || !showInstallPrompt) return null;

  return (
    <div className="fixed bottom-20 md:bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-in slide-in-from-bottom-4">
      <Card className="p-4 bg-gradient-to-r from-blue-600 to-orange-500 border-none shadow-2xl">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <Smartphone className="w-6 h-6 text-white" />
          </div>
          
          <div className="flex-1">
            <h3 className="text-white mb-1">Installa l'App</h3>
            <p className="text-white/90 text-sm mb-3">
              {isIOS 
                ? "Tocca il pulsante 'Condividi' e seleziona 'Aggiungi a Home' per installare l'app."
                : "Installa btcwheel sul tuo dispositivo per un'esperienza migliore!"}
            </p>
            
            {!isIOS && (
              <div className="flex gap-2">
                <Button 
                  onClick={handleInstallClick}
                  size="sm"
                  className="bg-white text-blue-600 hover:bg-white/90"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Installa
                </Button>
                <Button 
                  onClick={handleDismiss}
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-white/20"
                >
                  Dopo
                </Button>
              </div>
            )}
          </div>

          <button
            onClick={handleDismiss}
            className="p-1 hover:bg-white/20 rounded transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>
      </Card>
    </div>
  );
}
