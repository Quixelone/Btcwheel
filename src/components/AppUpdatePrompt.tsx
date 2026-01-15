import { RefreshCw } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { toast } from 'sonner';
import { useRegisterSW } from 'virtual:pwa-register/react';

export function AppUpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered: ' + r)
    },
    onRegisterError(error) {
      console.log('SW registration error', error)
    },
  });

  const handleUpdate = () => {
    updateServiceWorker(true);
  };

  const handleDismiss = () => {
    setNeedRefresh(false);
    toast.info('Aggiornamento rimandato', {
      description: 'Ricarica la pagina manualmente per aggiornare'
    });
  };

  if (!needRefresh) return null;

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
