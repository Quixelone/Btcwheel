import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { toast } from 'sonner';

export function AppUpdatePrompt() {
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    // TEMPORARILY DISABLED - Service Worker not implemented yet
    // TODO: Implement proper PWA service worker with Workbox
    /*
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((reg) => {
        setRegistration(reg);

        // Check for updates every hour
        setInterval(() => {
          reg.update();
        }, 60 * 60 * 1000);

        // Listen for new service worker
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setShowUpdatePrompt(true);
              }
            });
          }
        });
      });

      // Listen for controller change
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });
    }
    */
  }, []);

  const handleUpdate = () => {
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      setShowUpdatePrompt(false);
      toast.success('Aggiornamento in corso...', {
        description: 'L\'app verrà ricaricata tra poco'
      });
    }
  };

  const handleDismiss = () => {
    setShowUpdatePrompt(false);
    toast.info('Aggiornamento rimandato', {
      description: 'Ricarica la pagina manualmente per aggiornare'
    });
  };

  if (!showUpdatePrompt) return null;

  return (
    <div className="fixed top-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-in slide-in-from-top-4">
      <Card className="p-4 bg-white border-blue-200 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <RefreshCw className="w-5 h-5 text-blue-600" />
          </div>
          
          <div className="flex-1">
            <h3 className="text-blue-900 mb-1">Aggiornamento Disponibile</h3>
            <p className="text-slate-600 text-sm mb-3">
              È disponibile una nuova versione dell'app con miglioramenti e nuove funzionalità!
            </p>
            
            <div className="flex gap-2">
              <Button 
                onClick={handleUpdate}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                Aggiorna Ora
              </Button>
              <Button 
                onClick={handleDismiss}
                size="sm"
                variant="outline"
              >
                Dopo
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}