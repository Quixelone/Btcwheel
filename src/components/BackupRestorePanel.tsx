import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
    Download,
    Upload,
    RefreshCw,
    Clock,
    AlertCircle,
    HardDrive,
    FileJson
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../hooks/useAuth';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface Backup {
    id: string;
    created_at: string;
    backup_type: 'manual' | 'automatic' | 'export';
    backup_size_bytes: number;
}

export function BackupRestorePanel() {
    const { user } = useAuth();
    const [backups, setBackups] = useState<Backup[]>([]);
    const [loading, setLoading] = useState(false);
    const [creating, setCreating] = useState(false);
    const [restoring, setRestoring] = useState<string | null>(null);

    // Carica lista backup all'avvio
    useEffect(() => {
        if (user?.id) {
            loadBackups();
        }
    }, [user?.id]);

    const loadBackups = async () => {
        if (!user?.id) return;

        setLoading(true);
        try {
            const response = await fetch(
                `https://${projectId}.supabase.co/functions/v1/make-server-7c0f82ca/backups`,
                {
                    headers: {
                        'Authorization': `Bearer ${publicAnonKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.ok) {
                const data = await response.json();
                setBackups(data.backups || []);
            }
        } catch (error) {
            console.error('Error loading backups:', error);
        } finally {
            setLoading(false);
        }
    };

    const createBackup = async () => {
        if (!user?.id) {
            toast.error('Devi essere loggato per creare un backup');
            return;
        }

        setCreating(true);
        try {
            const response = await fetch(
                `https://${projectId}.supabase.co/functions/v1/make-server-7c0f82ca/backups/create`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${publicAnonKey}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ userId: user.id })
                }
            );

            const data = await response.json();

            if (response.ok && data.backup) {
                toast.success('Backup creato con successo!');
                loadBackups();
            } else {
                throw new Error(data.error || 'Errore nella creazione del backup');
            }
        } catch (error) {
            console.error('Error creating backup:', error);
            toast.error('Errore nella creazione del backup');
        } finally {
            setCreating(false);
        }
    };

    const downloadBackup = async (backupId: string) => {
        try {
            const response = await fetch(
                `https://${projectId}.supabase.co/functions/v1/make-server-7c0f82ca/backups/${backupId}/download`,
                {
                    headers: {
                        'Authorization': `Bearer ${publicAnonKey}`
                    }
                }
            );

            if (response.ok) {
                const data = await response.json();

                // Crea e scarica il file JSON
                const blob = new Blob([JSON.stringify(data.backup_data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `btcwheel-backup-${new Date().toISOString().split('T')[0]}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);

                toast.success('Backup scaricato!');
            } else {
                throw new Error('Download fallito');
            }
        } catch (error) {
            console.error('Error downloading backup:', error);
            toast.error('Errore nel download del backup');
        }
    };

    const restoreBackup = async (backupId: string) => {
        if (!confirm('Sei sicuro di voler ripristinare questo backup? I dati attuali verranno sovrascritti.')) {
            return;
        }

        setRestoring(backupId);
        try {
            const response = await fetch(
                `https://${projectId}.supabase.co/functions/v1/make-server-7c0f82ca/backups/${backupId}/restore`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${publicAnonKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            const data = await response.json();

            if (response.ok) {
                toast.success('Backup ripristinato con successo! Ricarica la pagina per vedere le modifiche.');
            } else {
                throw new Error(data.error || 'Errore nel ripristino');
            }
        } catch (error) {
            console.error('Error restoring backup:', error);
            toast.error('Errore nel ripristino del backup');
        } finally {
            setRestoring(null);
        }
    };

    const exportLocalData = () => {
        // Esporta tutti i dati salvati in localStorage
        const localData: Record<string, unknown> = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key?.startsWith('btcwheel_')) {
                try {
                    localData[key] = JSON.parse(localStorage.getItem(key) || '');
                } catch {
                    localData[key] = localStorage.getItem(key);
                }
            }
        }

        const blob = new Blob([JSON.stringify(localData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `btcwheel-local-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast.success('Dati locali esportati!');
    };

    const formatBytes = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('it-IT', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
        >
            <h2 className="text-white mb-4 flex items-center gap-2 text-xl">
                <HardDrive className="w-6 h-6 text-cyan-400" />
                Backup & Ripristino
            </h2>

            <Card className="p-6 bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-xl border border-white/10">
                <div className="space-y-6">

                    {/* Azioni rapide */}
                    <div className="flex flex-wrap gap-3">
                        <Button
                            onClick={createBackup}
                            disabled={creating || !user}
                            className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 border-0"
                        >
                            {creating ? (
                                <>
                                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                    Creazione...
                                </>
                            ) : (
                                <>
                                    <Upload className="w-4 h-4 mr-2" />
                                    Crea Backup Cloud
                                </>
                            )}
                        </Button>

                        <Button
                            onClick={exportLocalData}
                            variant="outline"
                            className="border-gray-600 text-gray-300 hover:bg-gray-800"
                        >
                            <FileJson className="w-4 h-4 mr-2" />
                            Esporta Dati Locali
                        </Button>

                        <Button
                            onClick={loadBackups}
                            variant="ghost"
                            disabled={loading}
                            className="text-gray-400 hover:text-white"
                        >
                            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                            Aggiorna
                        </Button>
                    </div>

                    {/* Info */}
                    <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                        <p className="text-sm text-blue-300">
                            💡 I backup cloud salvano: progressi, badge, strategie wheel, trade e impostazioni.
                            I dati locali includono le preferenze dell'app salvate sul dispositivo.
                        </p>
                    </div>

                    {/* Lista backup */}
                    <div>
                        <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            Backup Disponibili
                        </h3>

                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <RefreshCw className="w-6 h-6 text-gray-400 animate-spin" />
                            </div>
                        ) : backups.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <HardDrive className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                <p>Nessun backup disponibile</p>
                                <p className="text-sm mt-1">Crea il tuo primo backup per proteggere i tuoi dati</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <AnimatePresence>
                                    {backups.map((backup, index) => (
                                        <motion.div
                                            key={backup.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700/50"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-lg flex items-center justify-center">
                                                    <FileJson className="w-5 h-5 text-cyan-400" />
                                                </div>
                                                <div>
                                                    <p className="text-white font-medium">
                                                        {formatDate(backup.created_at)}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <Badge
                                                            variant="outline"
                                                            className={`text-xs ${backup.backup_type === 'automatic'
                                                                    ? 'border-green-500/50 text-green-400'
                                                                    : 'border-blue-500/50 text-blue-400'
                                                                }`}
                                                        >
                                                            {backup.backup_type === 'automatic' ? 'Automatico' : 'Manuale'}
                                                        </Badge>
                                                        <span className="text-xs text-gray-500">
                                                            {formatBytes(backup.backup_size_bytes)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => downloadBackup(backup.id)}
                                                    className="text-gray-400 hover:text-cyan-400"
                                                >
                                                    <Download className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => restoreBackup(backup.id)}
                                                    disabled={restoring === backup.id}
                                                    className="text-gray-400 hover:text-emerald-400"
                                                >
                                                    {restoring === backup.id ? (
                                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <Upload className="w-4 h-4" />
                                                    )}
                                                </Button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>

                    {/* Warning */}
                    <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-amber-300 font-medium">Attenzione</p>
                                <p className="text-sm text-amber-200/70 mt-1">
                                    Il ripristino di un backup sovrascriverà tutti i dati attuali.
                                    Assicurati di creare un backup dei dati correnti prima di procedere.
                                </p>
                            </div>
                        </div>
                    </div>

                </div>
            </Card>
        </motion.div>
    );
}
