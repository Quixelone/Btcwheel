import { useState } from 'react';
import { motion } from 'motion/react';
import { Card } from './ui/card';
import { Copy, Database, ArrowRight, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { toast } from "sonner";
import { projectId, publicAnonKey } from '../utils/supabase/info';

export function DbDuplicatePanel() {
  const [isScanning, setIsScanning] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [scanResults, setScanResults] = useState<any>(null);

  const scanDatabase = async (prefix: string) => {
    setIsScanning(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-7c0f82ca/db-duplicate/scan/${prefix}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to scan database');
      }

      const result = await response.json();
      setScanResults(result);
      toast.success(`✅ Trovate ${result.count} chiavi con prefisso ${prefix}`);
    } catch (error: any) {
      console.error('Error scanning database:', error);
      toast.error('❌ Errore durante la scansione del database');
    } finally {
      setIsScanning(false);
    }
  };

  const bulkCopy = async (sourcePrefix: string, targetPrefix: string, dryRun = false) => {
    setIsCopying(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-7c0f82ca/db-duplicate/bulk-copy`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sourcePrefix,
            targetPrefix,
            overwrite: false,
            dryRun
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to copy data');
      }

      const result = await response.json();
      
      if (dryRun) {
        toast.success(
          `🔍 DRY RUN: ${result.results.copied} chiavi verrebbero copiate, ${result.results.skipped} saltate`
        );
      } else {
        toast.success(
          `✅ ${result.results.copied} chiavi copiate da ${sourcePrefix} a ${targetPrefix}!`,
          {
            description: `${result.results.skipped} già esistenti, ${result.results.errors} errori`
          }
        );
      }

      // Refresh scan after copy
      if (!dryRun) {
        await scanDatabase(targetPrefix);
      }
    } catch (error: any) {
      console.error('Error copying data:', error);
      toast.error('❌ Errore durante la copia dei dati');
    } finally {
      setIsCopying(false);
    }
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-xl border border-white/10">
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
            <Copy className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-white font-medium">Duplica Dati Database</h3>
            <p className="text-xs text-gray-400">Copia dati da finanzacreativa a btcwheel</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <motion.button
            onClick={() => scanDatabase('finanzacreativa')}
            disabled={isScanning}
            className="p-4 bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-lg text-left hover:bg-blue-500/20 transition-colors disabled:opacity-50"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-2 mb-2">
              {isScanning ? (
                <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
              ) : (
                <Database className="w-4 h-4 text-blue-400" />
              )}
              <p className="text-sm text-white font-medium">Scansiona finanzacreativa</p>
            </div>
            <p className="text-xs text-gray-400">Vedi quanti dati ci sono</p>
          </motion.button>

          <motion.button
            onClick={() => scanDatabase('btcwheel')}
            disabled={isScanning}
            className="p-4 bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 border border-emerald-500/20 rounded-lg text-left hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-2 mb-2">
              {isScanning ? (
                <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
              ) : (
                <Database className="w-4 h-4 text-emerald-400" />
              )}
              <p className="text-sm text-white font-medium">Scansiona btcwheel</p>
            </div>
            <p className="text-xs text-gray-400">Controlla dati attuali</p>
          </motion.button>
        </div>

        {/* Scan Results */}
        {scanResults && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-gray-800/50 rounded-lg border border-gray-700/50"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-white font-medium">Risultati Scansione: {scanResults.prefix}</p>
              <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded">
                {scanResults.count} chiavi
              </span>
            </div>

            {scanResults.count > 0 && (
              <div className="space-y-2 max-h-[200px] overflow-y-auto text-xs">
                {scanResults.keys.slice(0, 10).map((item: any, idx: number) => (
                  <div key={idx} className="p-2 bg-gray-900/50 rounded text-gray-400 font-mono">
                    {item.key}
                  </div>
                ))}
                {scanResults.keys.length > 10 && (
                  <p className="text-gray-500 text-center py-2">
                    ...e altre {scanResults.keys.length - 10} chiavi
                  </p>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* Copy Actions */}
        <div className="border-t border-gray-700/50 pt-4 space-y-3">
          <p className="text-sm text-gray-400">Azioni di Copia</p>

          <motion.button
            onClick={() => bulkCopy('finanzacreativa', 'btcwheel', true)}
            disabled={isCopying}
            className="w-full p-3 bg-gray-700/30 hover:bg-gray-700/50 border border-gray-600/50 rounded-lg flex items-center justify-between transition-colors disabled:opacity-50"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <span className="text-sm text-white">Test Copy (Dry Run)</span>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400" />
          </motion.button>

          <motion.button
            onClick={() => {
              if (window.confirm('⚠️ Sei sicuro di voler copiare TUTTI i dati da finanzacreativa a btcwheel?\n\nQuesta operazione copierà tutti gli utenti e i loro dati.')) {
                bulkCopy('finanzacreativa', 'btcwheel', false);
              }
            }}
            disabled={isCopying}
            className="w-full p-3 bg-gradient-to-r from-cyan-500/20 to-blue-600/20 hover:from-cyan-500/30 hover:to-blue-600/30 border border-cyan-500/30 rounded-lg flex items-center justify-between transition-colors disabled:opacity-50"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <div className="flex items-center gap-2">
              {isCopying ? (
                <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              )}
              <span className="text-sm text-white font-medium">
                {isCopying ? 'Copia in corso...' : 'Copia TUTTI i Dati finanzacreativa → btcwheel'}
              </span>
            </div>
            <ArrowRight className="w-4 h-4 text-cyan-400" />
          </motion.button>
        </div>

        {/* Info Box */}
        <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-gray-300 space-y-1">
              <p className="text-blue-400 font-medium">ℹ️ Come funziona:</p>
              <ul className="space-y-0.5 ml-3">
                <li>• <strong>Scansiona:</strong> Mostra quante chiavi esistono per ogni prefisso</li>
                <li>• <strong>Test Copy:</strong> Simula la copia senza modificare nulla</li>
                <li>• <strong>Copia TUTTI:</strong> Duplica tutti i dati da finanzacreativa a btcwheel</li>
                <li>• ⚠️ Le chiavi già esistenti vengono saltate (nessuna sovrascrittura)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
