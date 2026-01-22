import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import {
  Users,
  Search,
  Download,
  UserCheck,
  TrendingUp,
  Activity,
  Calendar,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  BarChart3,
  Ban,
} from 'lucide-react';
import { projectId } from '../utils/supabase/info';
import { toast } from "sonner";
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

interface User {
  id: string;
  email: string;
  signup_date: string;
  last_sign_in_at: string | null;
  full_name: string | null;
  total_xp: number;
  level: number;
  streak_days: number;
  plan_name: string;
  subscription_status: string;
  subscription_expires: string | null;
  total_strategies: number;
  total_trades: number;
}

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  newUsersThisWeek: number;
  totalStrategies: number;
  totalTrades: number;
  planDistribution: Record<string, number>;
}

export function AdminUserManagement() {
  useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [planFilter, setPlanFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 20;

  // Fetch admin stats
  const fetchStats = async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        console.error('Session error:', sessionError);
        toast.error('Sessione scaduta. Ricarica la pagina e fai login di nuovo.');
        return;
      }

      if (!session?.access_token) {
        console.error('No active session');
        toast.error('Nessuna sessione attiva. Fai login per continuare.');
        return;
      }

      console.log('📊 Fetching admin stats...');
      console.log('Token preview:', session.access_token.substring(0, 30) + '...');
      console.log('Full URL:', `https://${projectId}.supabase.co/functions/v1/make-server-7c0f82ca/admin/stats`);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-7c0f82ca/admin/stats`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Stats response status:', response.status);
      console.log('Stats response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Stats API error response:', errorText);
        console.error('Response type:', response.headers.get('content-type'));
        throw new Error(`Failed to fetch stats: ${response.status} - ${errorText}`);
      }

      const { stats } = await response.json();
      console.log('✅ Stats loaded successfully:', stats);
      setStats(stats);
    } catch (error: any) {
      console.error('Error fetching stats:', error);
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');

      // Don't show toast if we already showed session error
      if (!error?.message?.includes('session')) {
        toast.error('Errore nel recupero delle statistiche');
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch users list
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        console.error('Session error:', sessionError);
        toast.error('Sessione scaduta. Ricarica la pagina e fai login di nuovo.');
        setLoading(false);
        return;
      }

      if (!session?.access_token) {
        console.error('No active session');
        toast.error('Nessuna sessione attiva. Fai login per continuare.');
        setLoading(false);
        return;
      }

      console.log('👥 Fetching admin users...');

      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
        ...(searchQuery && { search: searchQuery }),
        ...(planFilter && { plan: planFilter }),
        ...(statusFilter && { status: statusFilter })
      });

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-7c0f82ca/admin/users?${queryParams}`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Users response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Users API error response:', errorText);
        throw new Error(`Failed to fetch users: ${response.status} - ${errorText}`);
      }

      const { users: fetchedUsers, pagination } = await response.json();
      console.log('✅ Users loaded successfully:', fetchedUsers.length, 'users');
      setUsers(fetchedUsers);
      setTotalPages(pagination.totalPages);
    } catch (error: any) {
      console.error('Error fetching users:', error);

      // Don't show toast if we already showed session error
      if (!error?.message?.includes('session')) {
        toast.error('Errore nel caricamento utenti');
      }
    } finally {
      setLoading(false);
    }
  };

  // Suspend/Activate user
  const toggleUserStatus = async (userId: string, action: 'suspend' | 'activate') => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No active session');
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-7c0f82ca/admin/users/${userId}/status`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ action })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update user status');
      }

      toast.success(action === 'suspend' ? 'Utente sospeso' : 'Utente riattivato');
      fetchUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Errore nell\'aggiornamento stato utente');
    }
  };

  // Create backup
  const createBackup = async (userId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No active session');
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-7c0f82ca/backups/create`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ targetUserId: userId })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to create backup');
      }

      const { backup } = await response.json();
      toast.success(`Backup creato (${backup.size_kb} KB)`);
    } catch (error) {
      console.error('Error creating backup:', error);
      toast.error('Errore nella creazione del backup');
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, [currentPage, searchQuery, planFilter, statusFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'suspended': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'expired': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'trial': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="p-4 bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-5 h-5 text-emerald-400" />
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                  +{stats.newUsersThisWeek}
                </Badge>
              </div>
              <div className="text-2xl font-bold text-white">{stats.totalUsers}</div>
              <div className="text-sm text-gray-400">Utenti Totali</div>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="p-4 bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
              <div className="flex items-center justify-between mb-2">
                <Activity className="w-5 h-5 text-blue-400" />
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                  {Math.round((stats.activeUsers / stats.totalUsers) * 100)}%
                </Badge>
              </div>
              <div className="text-2xl font-bold text-white">{stats.activeUsers}</div>
              <div className="text-sm text-gray-400">Utenti Attivi</div>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="p-4 bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
              <div className="flex items-center justify-between mb-2">
                <BarChart3 className="w-5 h-5 text-purple-400" />
              </div>
              <div className="text-2xl font-bold text-white">{stats.totalStrategies}</div>
              <div className="text-sm text-gray-400">Strategie Create</div>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className="p-4 bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/20">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-5 h-5 text-orange-400" />
              </div>
              <div className="text-2xl font-bold text-white">{stats.totalTrades}</div>
              <div className="text-sm text-gray-400">Trades Totali</div>
            </Card>
          </motion.div>
        </div>
      )}

      {/* Filters */}
      <Card className="p-4 bg-gray-800/30 backdrop-blur-xl border-white/10">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Cerca per email o nome..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-900/50 border-gray-700 text-white"
            />
          </div>

          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">Tutti i piani</option>
            <option value="Free">Free</option>
            <option value="Pro">Pro</option>
            <option value="Enterprise">Enterprise</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">Tutti gli stati</option>
            <option value="active">Attivo</option>
            <option value="suspended">Sospeso</option>
            <option value="expired">Scaduto</option>
            <option value="trial">Trial</option>
          </select>

          <Button
            onClick={() => {
              fetchUsers();
              fetchStats();
            }}
            variant="outline"
            className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </Card>

      {/* Users Table */}
      <Card className="overflow-hidden bg-gray-800/30 backdrop-blur-xl border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900/50 border-b border-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Utente</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Piano</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Stato</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Attività</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-400">Caricamento...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-400">Nessun utente trovato</td>
                </tr>
              ) : (
                users.map((user) => (
                  <motion.tr key={user.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-gray-700/20 transition-colors">
                    <td className="px-4 py-4">
                      <div>
                        <div className="text-white font-medium">{user.full_name || 'N/A'}</div>
                        <div className="text-sm text-gray-400">{user.email}</div>
                        <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                          <Calendar className="w-3 h-3" />
                          {new Date(user.signup_date).toLocaleDateString('it-IT')}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <Badge className={
                        user.plan_name === 'Enterprise'
                          ? 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                          : user.plan_name === 'Pro'
                            ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                            : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                      }>
                        {user.plan_name || 'Free'}
                      </Badge>
                    </td>
                    <td className="px-4 py-4">
                      <Badge className={getStatusColor(user.subscription_status)}>
                        {user.subscription_status || 'active'}
                      </Badge>
                    </td>
                    <td className="px-4 py-4">
                      <div className="space-y-1">
                        <div className="text-sm text-gray-300">Level {user.level} • {user.total_xp} XP</div>
                        <div className="text-xs text-gray-500">{user.total_strategies} strategie • {user.total_trades} trades</div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        {user.subscription_status === 'suspended' ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleUserStatus(user.id, 'activate')}
                            className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                          >
                            <UserCheck className="w-3 h-3 mr-1" />
                            Attiva
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleUserStatus(user.id, 'suspend')}
                            className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                          >
                            <Ban className="w-3 h-3 mr-1" />
                            Sospendi
                          </Button>
                        )}

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => createBackup(user.id)}
                          className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                        >
                          <Download className="w-3 h-3" />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-700/50 flex items-center justify-between">
            <div className="text-sm text-gray-400">Pagina {currentPage} di {totalPages}</div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="border-gray-700 text-gray-400 hover:bg-gray-700/50"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="border-gray-700 text-gray-400 hover:bg-gray-700/50"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}