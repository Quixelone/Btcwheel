import { useState } from 'react';
import { motion } from 'motion/react';
import { Card } from './ui/card';
import { Download, Upload, ArrowRightLeft, Loader2, CheckCircle2, Database, FileJson, AlertCircle } from 'lucide-react';
import { toast } from "sonner";
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { useAuth } from '../hooks/useAuth';

export function DataMigration() {
  const { user } = useAuth();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [mergeMode, setMergeMode] = useState(true);
  const [showDataPreview, setShowDataPreview] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);

  // 📤 Export data to JSON file
  const handleExport = async () => {
    if (!user) {
      toast.error('Devi essere autenticato per esportare i dati');
      return;
    }

    setIsExporting(true);

    try {
      // 🎯 EXPORT FROM LOCALSTORAGE (primary source)
      const localStrategies = JSON.parse(localStorage.getItem('btcwheel_strategies') || '[]');

      // Get trades for each strategy from localStorage
      const localTrades: Record<string, any[]> = {};
      for (const strategy of localStrategies) {
        const strategyTrades = localStorage.getItem(`btcwheel_trades_${strategy.id}`);
        if (strategyTrades) {
          try {
            localTrades[strategy.id] = JSON.parse(strategyTrades);
          } catch (e) {
            console.warn(`Failed to parse trades for strategy ${strategy.id}`);
          }
        }
      }

      const localPlans = JSON.parse(localStorage.getItem('btcwheel_longterm_plans') || '[]');
      const localActivePlan = localStorage.getItem('btcwheel_active_plan')
        ? JSON.parse(localStorage.getItem('btcwheel_active_plan')!)
        : null;
      const localUserProgress = localStorage.getItem('btcwheel_user_progress')
        ? JSON.parse(localStorage.getItem('btcwheel_user_progress')!)
        : null;

      console.log('📦 Exporting from localStorage:', {
        strategies: localStrategies.length,
        trades: Object.keys(localTrades).length,
        plans: localPlans.length,
        hasActivePlan: !!localActivePlan,
        hasUserProgress: !!localUserProgress
      });

      // Create export data object
      const exportData = {
        metadata: {
          exportedAt: new Date().toISOString(),
          sourceApp: 'btcwheel',
          version: '1.0.0',
          source: 'localStorage'
        },
        strategies: localStrategies,
        trades: localTrades,
        plans: localPlans,
        activePlan: localActivePlan,
        userProgress: localUserProgress
      };

      // If localStorage is empty, try fetching from cloud database
      if (localStrategies.length === 0) {
        console.log('📡 No local data found, trying cloud database...');

        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-7c0f82ca/data/export`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${publicAnonKey}`,
            },
            body: JSON.stringify({
              userId: user.id,
              appPrefix: 'btcwheel',
            }),
          }
        );

        if (response.ok) {
          const result = await response.json();
          if (result.data && result.data.strategies?.length > 0) {
            console.log('✅ Using cloud data instead');
            exportData.strategies = result.data.strategies;
            exportData.trades = result.data.trades;
            exportData.plans = result.data.plans;
            exportData.activePlan = result.data.activePlan;
            exportData.userProgress = result.data.userProgress;
            exportData.metadata.source = 'cloud';
          }
        }
      }

      // Create download link
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `btcwheel-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      const totalStrategies = exportData.strategies.length;
      const totalTrades = Object.keys(exportData.trades).length;
      const totalPlans = exportData.plans.length;

      toast.success(`✅ Export completato! ${totalStrategies} strategie, ${totalTrades} trade sets, ${totalPlans} piani`, {
        description: `Fonte: ${exportData.metadata.source === 'localStorage' ? 'Dati locali' : 'Database cloud'}`
      });
    } catch (error) {
      console.error('❌ Export error:', error);
      toast.error(`❌ Errore durante l'export: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`);
    } finally {
      setIsExporting(false);
    }
  };

  // 📥 Import data from JSON file
  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) {
      toast.error('Devi essere autenticato per importare i dati');
      return;
    }

    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);

    try {
      const fileContent = await file.text();
      const importData = JSON.parse(fileContent);

      // Validate structure
      if (!importData.metadata || !importData.strategies) {
        throw new Error('File JSON non valido - struttura dati mancante');
      }

      console.log('📦 Import data structure:', {
        strategies: importData.strategies?.length || 0,
        trades: Object.keys(importData.trades || {}).length,
        plans: importData.plans?.length || 0,
        metadata: importData.metadata
      });

      // 🎯 IMPORT DIRETTO IN LOCALSTORAGE (modalità doppia: local + cloud)

      // 1. Import strategies
      if (importData.strategies && importData.strategies.length > 0) {
        const existingStrategies = mergeMode
          ? JSON.parse(localStorage.getItem('btcwheel_strategies') || '[]')
          : [];

        const mergedStrategies = mergeMode
          ? [...existingStrategies, ...importData.strategies]
          : importData.strategies;

        localStorage.setItem('btcwheel_strategies', JSON.stringify(mergedStrategies));
        console.log(`✅ Imported ${importData.strategies.length} strategies to localStorage`);
      }

      // 2. Import trades for each strategy
      if (importData.trades) {
        for (const [strategyId, trades] of Object.entries(importData.trades)) {
          localStorage.setItem(`btcwheel_trades_${strategyId}`, JSON.stringify(trades));
          console.log(`✅ Imported ${(trades as any[]).length} trades for strategy ${strategyId}`);
        }
      }

      // 3. Import long-term plans
      if (importData.plans && importData.plans.length > 0) {
        const existingPlans = mergeMode
          ? JSON.parse(localStorage.getItem('btcwheel_longterm_plans') || '[]')
          : [];

        const mergedPlans = mergeMode
          ? [...existingPlans, ...importData.plans]
          : importData.plans;

        localStorage.setItem('btcwheel_longterm_plans', JSON.stringify(mergedPlans));
        console.log(`✅ Imported ${importData.plans.length} plans to localStorage`);
      }

      // 4. Import active plan
      if (importData.activePlan) {
        localStorage.setItem('btcwheel_active_plan', JSON.stringify(importData.activePlan));
        console.log(`✅ Imported active plan to localStorage`);
      }

      // 5. Import user progress
      if (importData.userProgress) {
        localStorage.setItem('btcwheel_user_progress', JSON.stringify(importData.userProgress));
        console.log(`✅ Imported user progress to localStorage`);
      }

      // 🌩️ ALSO SAVE TO CLOUD DATABASE (backend)
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-7c0f82ca/data/import`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            userId: user.id,
            data: importData,
            targetPrefix: 'btcwheel',
            mergeMode,
          }),
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        console.log(`✅ Also saved to cloud: ${result.importedCount} items`);
      } else {
        console.warn('⚠️ Cloud save failed but localStorage import succeeded:', result.error);
      }

      const totalItems =
        (importData.strategies?.length || 0) +
        Object.keys(importData.trades || {}).length +
        (importData.plans?.length || 0);

      toast.success(`✅ Import completato! ${totalItems} elementi importati`, {
        description: 'Dati salvati in locale e nel cloud'
      });

      // Reload page to refresh data
      setTimeout(() => {
        window.location.reload();
      }, 1500);

    } catch (error: any) {
      console.error('❌ Import error:', error);
      toast.error(`❌ Errore durante l'import: ${error.message}`);
    } finally {
      setIsImporting(false);
      // Reset file input
      event.target.value = '';
    }
  };

  // 🔄 Migrate data from another prefix (e.g., finanzacreativa -> btcwheel)
  const handleMigrate = async () => {
    if (!user) {
      toast.error('Devi essere autenticato per migrare i dati');
      return;
    }

    setIsMigrating(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-7c0f82ca/data/migrate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            userId: user.id,
            sourcePrefix: 'finanzacreativa',
            targetPrefix: 'btcwheel',
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Migration failed');
      }

      const result = await response.json();

      if (result.success) {
        toast.success(`✅ Migrazione completata! ${result.migratedCount} elementi migrati da "finanzacreativa" a "btcwheel"`);

        // Reload page to refresh data
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        toast.error(`⚠️ Migrazione parziale: ${result.errors.join(', ')}`);
      }
    } catch (error: any) {
      console.error('Migration error:', error);
      toast.error(`❌ Errore durante la migrazione: ${error.message}`);
    } finally {
      setIsMigrating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
    >
      <h2 className="text-white mb-4 flex items-center gap-2 text-xl">
        <Database className="w-6 h-6 text-purple-400" />
        Gestione Dati
      </h2>

      <div className="space-y-4">
        {/* Export Data */}
        <Card className="p-5 bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-xl border border-white/10">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <Download className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-white font-medium">Esporta Dati</p>
                  <p className="text-gray-400 text-sm">Scarica tutte le tue strategie e trade in JSON</p>
                </div>
              </div>
            </div>
            <motion.button
              onClick={handleExport}
              disabled={isExporting}
              className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg shadow-lg shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Esportando...
                </>
              ) : (
                <>
                  <FileJson className="w-4 h-4" />
                  Esporta
                </>
              )}
            </motion.button>
          </div>
        </Card>

        {/* Import Data */}
        <Card className="p-5 bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-xl border border-white/10">
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                    <Upload className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Importa Dati</p>
                    <p className="text-gray-400 text-sm">Carica un file JSON esportato in precedenza</p>
                  </div>
                </div>
              </div>
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  disabled={isImporting}
                  className="hidden"
                />
                <motion.div
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg shadow-lg shadow-blue-500/30 flex items-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isImporting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Importando...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Importa
                    </>
                  )}
                </motion.div>
              </label>
            </div>

            {/* Merge Mode Toggle */}
            <div className="flex items-center gap-3 pt-2 border-t border-white/10">
              <button
                onClick={() => setMergeMode(!mergeMode)}
                className="flex items-center gap-2"
              >
                <div className={`w-12 h-6 rounded-full transition-colors ${mergeMode ? 'bg-blue-500' : 'bg-gray-700'
                  }`}>
                  <div className={`w-5 h-5 bg-white rounded-full mt-0.5 transition-transform ${mergeMode ? 'ml-6' : 'ml-0.5'
                    }`} />
                </div>
                <span className="text-sm text-gray-300">
                  Modalità merge (aggiungi ai dati esistenti)
                </span>
              </button>
            </div>
          </div>
        </Card>

        {/* Migrate from another prefix */}
        <Card className="p-5 bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-xl border border-purple-500/20">
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <ArrowRightLeft className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-white font-medium">Migra da Altra App</p>
                <p className="text-gray-400 text-sm">Importa dati da finanzacreativa.live o altra app</p>
              </div>
            </div>

            <div className="space-y-3">
              <motion.button
                onClick={handleMigrate}
                disabled={isMigrating}
                className="w-full px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg shadow-lg shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isMigrating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Migrazione in corso...
                  </>
                ) : (
                  <>
                    <ArrowRightLeft className="w-4 h-4" />
                    Avvia Migrazione
                  </>
                )}
              </motion.button>

              {/* Info note */}
              <div className="flex items-start gap-2 p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                <AlertCircle className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-gray-300">
                  <p className="mb-1"><strong>Nota:</strong> La migrazione copia tutti i dati dal prefisso sorgente al prefisso "btcwheel".</p>
                  <p>Se condividi lo stesso database con finanzacreativa.live, i dati verranno copiati automaticamente.</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Info Box */}
        <Card className="p-4 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 backdrop-blur-xl border border-emerald-500/20">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-gray-300 space-y-1">
              <p className="text-emerald-400 font-medium">Cosa viene migrato?</p>
              <ul className="space-y-1 text-xs">
                <li>• Tutte le strategie Wheel create</li>
                <li>• Tutti i trade registrati per ogni strategia</li>
                <li>• Long-term plans salvati</li>
                <li>• Piano attivo (se presente)</li>
                <li>• Progressi utente (XP, badge, streak)</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </motion.div>
  );
}