import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Database, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  Users, 
  Activity,
  TrendingUp,
  Shield,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';

interface TableStatus {
  name: string;
  exists: boolean;
  rowCount?: number;
  error?: string;
}

export function SupabaseStatus() {
  const { user, signIn, signUp, signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);
  const [tableStatus, setTableStatus] = useState<TableStatus[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'error' | 'unconfigured'>('unconfigured');
  
  // Test auth
  const [testEmail, setTestEmail] = useState('test@btcwheel.com');
  const [testPassword, setTestPassword] = useState('testpassword123');

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    setLoading(true);
    
    if (!isSupabaseConfigured) {
      setConnectionStatus('unconfigured');
      setLoading(false);
      return;
    }

    try {
      // Test basic connection
      const { error } = await supabase.from('kv_store_7c0f82ca').select('count', { count: 'exact', head: true });
      
      if (error) {
        console.error('Connection error:', error);
        setConnectionStatus('error');
      } else {
        setConnectionStatus('connected');
        await checkTables();
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setConnectionStatus('error');
    }
    
    setLoading(false);
  };

  const checkTables = async () => {
    if (!supabase) return;

    const tables = [
      'kv_store_7c0f82ca',
      'user_progress',
      'user_activities',
      'leaderboard_entries',
      'trading_simulations',
    ];

    const results: TableStatus[] = [];

    for (const tableName of tables) {
      try {
        const { count, error } = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true });

        if (error) {
          results.push({
            name: tableName,
            exists: false,
            error: error.message,
          });
        } else {
          results.push({
            name: tableName,
            exists: true,
            rowCount: count || 0,
          });
        }
      } catch (err: any) {
        results.push({
          name: tableName,
          exists: false,
          error: err.message,
        });
      }
    }

    setTableStatus(results);
  };

  const testAuth = async (action: 'signin' | 'signup') => {
    setTesting(true);
    try {
      if (action === 'signup') {
        const result = await signUp(testEmail, testPassword, 'Test User');
        if (result.user) {
          toast.success('✅ Signup funzionante!');
        }
      } else {
        const result = await signIn(testEmail, testPassword);
        if (result.user) {
          toast.success('✅ Login funzionante!');
        }
      }
    } catch (err: any) {
      toast.error('Test fallito: ' + err.message);
    }
    setTesting(false);
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success('Logout effettuato');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Database className="w-8 h-8 text-emerald-600" />
            <h1 className="text-emerald-900">Supabase Status Dashboard</h1>
          </div>
          <p className="text-emerald-700">
            Verifica connessione database, tabelle e autenticazione
          </p>
        </div>

        {/* Connection Status */}
        <Card className="mb-6 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-emerald-600" />
              <h2 className="text-emerald-900">Stato Connessione</h2>
            </div>
            <Button
              onClick={checkConnection}
              disabled={loading}
              variant="outline"
              size="sm"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center gap-2 text-gray-600">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Controllo connessione...</span>
            </div>
          ) : (
            <div className="space-y-4">
              {connectionStatus === 'unconfigured' && (
                <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <XCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="text-yellow-900 mb-1">Supabase non configurato</p>
                    <p className="text-sm text-yellow-700">
                      Le credenziali non sono disponibili. L&apos;app funziona in modalità locale.
                    </p>
                  </div>
                </div>
              )}

              {connectionStatus === 'error' && (
                <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="text-red-900 mb-1">Errore di connessione</p>
                    <p className="text-sm text-red-700">
                      Impossibile connettersi al database. Verifica le credenziali.
                    </p>
                  </div>
                </div>
              )}

              {connectionStatus === 'connected' && (
                <div className="flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5" />
                  <div>
                    <p className="text-emerald-900 mb-1">✅ Connesso a Supabase</p>
                    <p className="text-sm text-emerald-700">
                      Project ID: <code className="bg-emerald-100 px-2 py-0.5 rounded">rsmvjsokqolxgczclqjv</code>
                    </p>
                    <a
                      href="https://supabase.com/dashboard/project/rsmvjsokqolxgczclqjv"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700 mt-2"
                    >
                      Apri Dashboard Supabase
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Tables Status */}
        {connectionStatus === 'connected' && (
          <Card className="mb-6 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Activity className="w-6 h-6 text-emerald-600" />
              <h2 className="text-emerald-900">Stato Tabelle Database</h2>
            </div>

            <div className="space-y-3">
              {tableStatus.map((table) => (
                <div
                  key={table.name}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {table.exists ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                    <div>
                      <p className="text-gray-900">
                        <code className="text-sm bg-gray-100 px-2 py-0.5 rounded">
                          {table.name}
                        </code>
                      </p>
                      {table.error && (
                        <p className="text-xs text-red-600 mt-1">{table.error}</p>
                      )}
                    </div>
                  </div>
                  {table.exists && (
                    <Badge variant="secondary">
                      {table.rowCount} {table.rowCount === 1 ? 'riga' : 'righe'}
                    </Badge>
                  )}
                </div>
              ))}
            </div>

            {tableStatus.some(t => !t.exists) && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-900 mb-2">
                  ℹ️ Alcune tabelle non esistono ancora
                </p>
                <p className="text-xs text-blue-700">
                  Questo è normale se è la prima volta che usi l&apos;app. Le tabelle verranno create automaticamente quando necessario, oppure puoi crearle manualmente dalla dashboard Supabase.
                </p>
              </div>
            )}
          </Card>
        )}

        {/* Auth Status */}
        <Card className="mb-6 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Users className="w-6 h-6 text-emerald-600" />
            <h2 className="text-emerald-900">Autenticazione</h2>
          </div>

          {user ? (
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-emerald-900 mb-1">✅ Utente autenticato</p>
                  <p className="text-sm text-emerald-700">
                    Email: <code className="bg-emerald-100 px-2 py-0.5 rounded">{user.email}</code>
                  </p>
                  <p className="text-sm text-emerald-700 mt-1">
                    ID: <code className="bg-emerald-100 px-2 py-0.5 rounded text-xs">{user.id}</code>
                  </p>
                </div>
              </div>
              <Button onClick={handleSignOut} variant="outline" className="w-full">
                Logout
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <XCircle className="w-5 h-5 text-gray-600 mt-0.5" />
                <div>
                  <p className="text-gray-900 mb-1">Nessun utente autenticato</p>
                  <p className="text-sm text-gray-600">
                    Testa login/signup per verificare che l&apos;autenticazione funzioni
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Email Test</label>
                  <input
                    type="email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="test@btcwheel.com"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Password Test</label>
                  <input
                    type="password"
                    value={testPassword}
                    onChange={(e) => setTestPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="********"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={() => testAuth('signup')}
                    disabled={testing || !isSupabaseConfigured}
                    variant="outline"
                  >
                    {testing ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : null}
                    Test Signup
                  </Button>
                  <Button
                    onClick={() => testAuth('signin')}
                    disabled={testing || !isSupabaseConfigured}
                  >
                    {testing ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : null}
                    Test Accesso
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Quick Actions */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-6 h-6 text-emerald-600" />
            <h2 className="text-emerald-900">Quick Actions</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => window.open('https://supabase.com/dashboard/project/rsmvjsokqolxgczclqjv/editor', '_blank')}
            >
              <Database className="w-4 h-4 mr-2" />
              Apri Table Editor
            </Button>
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => window.open('https://supabase.com/dashboard/project/rsmvjsokqolxgczclqjv/auth/users', '_blank')}
            >
              <Users className="w-4 h-4 mr-2" />
              Gestisci Utenti
            </Button>
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => window.open('https://supabase.com/dashboard/project/rsmvjsokqolxgczclqjv/logs/postgres-logs', '_blank')}
            >
              <Activity className="w-4 h-4 mr-2" />
              Vedi Logs
            </Button>
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => window.open('https://supabase.com/dashboard/project/rsmvjsokqolxgczclqjv/settings/api', '_blank')}
            >
              <Shield className="w-4 h-4 mr-2" />
              API Settings
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}