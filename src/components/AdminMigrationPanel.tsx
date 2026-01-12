import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card } from './ui/card';
import { 
  Crown, Users, Database, TrendingUp, RefreshCw, 
  CheckCircle2, XCircle, Loader2, AlertTriangle, 
  ArrowRight, Eye, Download 
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface UserData {
  userId: string;
  email?: string;
  strategies: number;
  trades: number;
  plans: number;
  hasActivePlan: boolean;
  hasUserProgress: boolean;
}

interface DatabaseStats {
  totalKeys: number;
  prefixes: Record<string, {
    userCount: number;
    itemCount: number;
  }>;
}

export function AdminMigrationPanel() {
  const [isScanning, setIsScanning] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [users, setUsers] = useState<UserData[]>([]);
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [sourcePrefix, setSourcePrefix] = useState('finanzacreativa');
  const [migrationProgress, setMigrationProgress] = useState<{
    current: number;
    total: number;
    currentUser?: string;
  } | null>(null);

  // Load database stats on mount
  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-7c0f82ca/admin/stats`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        setStats(result.stats);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const scanUsers = async () => {
    setIsScanning(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-7c0f82ca/admin/scan-users`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ sourcePrefix }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to scan users');
      }

      const result = await response.json();
      setUsers(result.users);
      
      toast.success(`✅ Trovati ${result.userCount} utenti con dati "${sourcePrefix}"`);
    } catch (error) {
      console.error('Error scanning users:', error);
      toast.error(`❌ Errore durante la scansione: ${error.message}`);
    } finally {
      setIsScanning(false);
    }
  };

  const toggleUserSelection = (userId: string) => {
    const newSelection = new Set(selectedUsers);
    if (newSelection.has(userId)) {
      newSelection.delete(userId);
    } else {
      newSelection.add(userId);
    }
    setSelectedUsers(newSelection);
  };

  const selectAll = () => {
    if (selectedUsers.size === users.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(users.map(u => u.userId)));
    }
  };

  const migrateBatch = async () => {
    if (selectedUsers.size === 0) {
      toast.error('Seleziona almeno un utente da migrare');
      return;
    }

    const confirmed = window.confirm(
      `⚠️ Stai per migrare ${selectedUsers.size} utenti da "${sourcePrefix}" a "btcwheel".\n\n` +
      `Questa operazione copierà tutti i loro dati. Continuare?`
    );

    if (!confirmed) return;

    setIsMigrating(true);
    setMigrationProgress({ current: 0, total: selectedUsers.size });

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-7c0f82ca/admin/migrate-batch`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            sourcePrefix,
            targetPrefix: 'btcwheel',
            userIds: Array.from(selectedUsers),
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Migration failed');
      }

      const result = await response.json();

      if (result.success) {
        toast.success(
          `🎉 Migrazione completata con successo!\n\n` +
          `✅ ${result.successCount} utenti migrati\n` +
          `📦 ${result.totalItemsMigrated} elementi totali\n` +
          `${result.failedCount > 0 ? `❌ ${result.failedCount} falliti` : ''}`
        );

        // Clear selection and reload
        setSelectedUsers(new Set());
        await loadStats();
        await scanUsers();
      } else {
        toast.error(`⚠️ Migrazione parziale: ${result.failedCount} utenti falliti`);
      }
    } catch (error) {
      console.error('Migration error:', error);
      toast.error(`❌ Errore durante la migrazione: ${error.message}`);
    } finally {
      setIsMigrating(false);
      setMigrationProgress(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-500/30">
          <Crown className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Admin Panel</h2>
          <p className="text-gray-400 text-sm">Gestione migrazione massiva utenti</p>
        </div>
      </div>

      {/* Database Stats */}
      {stats && (
        <Card className="p-5 bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-xl border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-medium flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-400" />
              Statistiche Database
            </h3>
            <motion.button
              onClick={loadStats}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RefreshCw className="w-4 h-4 text-gray-400" />
            </motion.button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="text-gray-400 text-xs mb-1">Chiavi Totali</p>
              <p className="text-2xl font-bold text-white">{stats.totalKeys}</p>
            </div>
            
            {Object.entries(stats.prefixes).map(([prefix, data]) => (
              <div key={prefix} className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                <p className="text-gray-400 text-xs mb-1">{prefix}</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold text-white">{data.userCount}</p>
                  <p className="text-sm text-gray-400">utenti</p>
                </div>
                <p className="text-xs text-gray-500 mt-1">{data.itemCount} elementi</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Scan Controls */}
      <Card className="p-5 bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-xl border border-white/10">
        <h3 className="text-white font-medium mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-emerald-400" />
          Scansione Utenti
        </h3>
        
        <div className="space-y-3">
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Prefisso Sorgente</label>
            <input
              type="text"
              value={sourcePrefix}
              onChange={(e) => setSourcePrefix(e.target.value)}
              placeholder="es: finanzacreativa"
              className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <motion.button
            onClick={scanUsers}
            disabled={isScanning || !sourcePrefix.trim()}
            className="w-full px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg shadow-lg shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isScanning ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Scansione in corso...
              </>
            ) : (
              <>
                <Eye className="w-5 h-5" />
                Scansiona Utenti con Dati "{sourcePrefix}"
              </>
            )}
          </motion.button>
        </div>
      </Card>

      {/* Users List */}
      {users.length > 0 && (
        <Card className="p-5 bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-xl border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-medium flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-400" />
              Utenti Trovati ({users.length})
            </h3>
            
            <div className="flex items-center gap-2">
              <button
                onClick={selectAll}
                className="px-3 py-1 text-sm bg-gray-700/50 hover:bg-gray-700 rounded text-gray-300 transition-colors"
              >
                {selectedUsers.size === users.length ? 'Deseleziona Tutti' : 'Seleziona Tutti'}
              </button>
              
              {selectedUsers.size > 0 && (
                <motion.button
                  onClick={migrateBatch}
                  disabled={isMigrating}
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg shadow-lg shadow-purple-500/30 disabled:opacity-50 flex items-center gap-2 text-sm font-medium"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isMigrating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Migrazione...
                    </>
                  ) : (
                    <>
                      <ArrowRight className="w-4 h-4" />
                      Migra Selezionati ({selectedUsers.size})
                    </>
                  )}
                </motion.button>
              )}
            </div>
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {users.map((user) => (
              <motion.div
                key={user.userId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-lg border transition-all cursor-pointer ${
                  selectedUsers.has(user.userId)
                    ? 'bg-purple-500/20 border-purple-500/50'
                    : 'bg-gray-800/30 border-gray-700/50 hover:border-gray-600'
                }`}
                onClick={() => toggleUserSelection(user.userId)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <input
                        type="checkbox"
                        checked={selectedUsers.has(user.userId)}
                        onChange={() => toggleUserSelection(user.userId)}
                        className="w-5 h-5 rounded border-gray-600"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div>
                        <p className="text-white font-medium">{user.email || 'Email non disponibile'}</p>
                        <p className="text-xs text-gray-500 font-mono">{user.userId}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 ml-8 text-sm">
                      <div className="flex items-center gap-1">
                        <Database className="w-4 h-4 text-blue-400" />
                        <span className="text-gray-400">{user.strategies} strategie</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                        <span className="text-gray-400">{user.trades} trade</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Download className="w-4 h-4 text-purple-400" />
                        <span className="text-gray-400">{user.plans} piani</span>
                      </div>
                    </div>
                  </div>

                  {selectedUsers.has(user.userId) && (
                    <CheckCircle2 className="w-6 h-6 text-purple-400 flex-shrink-0" />
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      )}

      {/* Migration Progress */}
      <AnimatePresence>
        {migrationProgress && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed bottom-8 right-8 z-50"
          >
            <Card className="p-5 bg-gray-900 border-purple-500/50 shadow-2xl shadow-purple-500/20 min-w-[300px]">
              <div className="flex items-center gap-3 mb-3">
                <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
                <div>
                  <p className="text-white font-medium">Migrazione in corso...</p>
                  <p className="text-sm text-gray-400">
                    {migrationProgress.current} / {migrationProgress.total} utenti
                  </p>
                </div>
              </div>
              
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-purple-500 to-pink-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${(migrationProgress.current / migrationProgress.total) * 100}%`,
                  }}
                />
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Warning Info */}
      <Card className="p-4 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 backdrop-blur-xl border border-yellow-500/20">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-gray-300 space-y-1">
            <p className="text-yellow-400 font-medium">⚠️ Attenzione - Pannello Amministratore</p>
            <ul className="space-y-1 text-xs">
              <li>• Questa operazione migra TUTTI i dati degli utenti selezionati</li>
              <li>• I dati vengono COPIATI, non spostati (originali rimangono intatti)</li>
              <li>• La migrazione può richiedere diversi minuti per molti utenti</li>
              <li>• Verifica sempre i risultati dopo la migrazione</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}