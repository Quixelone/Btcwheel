import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import {
  TrendingUp,
  Users,
  FileText,
  Search,
  Check,
  Wallet,
  Eye,
  X,
} from 'lucide-react';
import { projectId } from '../utils/supabase/info';
import { toast } from 'sonner';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

interface BillingUser {
  id: string;
  email: string;
  full_name: string | null;
  total_capital: number;
  payment_model: 'fixed_fee' | 'profit_share';
  capital_threshold: number;
  profit_share_percentage: number;
  plan_name: string;
  plan_price: number;
  pending_invoices: number;
  overdue_invoices: number;
  total_paid: number;
  total_pending: number;
  last_invoice_date: string | null;
  last_invoice_amount: number | null;
}

interface Invoice {
  id: string;
  user_id: string;
  billing_period_start: string;
  billing_period_end: string;
  invoice_date: string;
  due_date: string;
  invoice_type: 'fixed_fee' | 'profit_share' | 'manual';
  total_capital: number;
  monthly_profit: number;
  profit_share_percentage: number;
  fixed_fee_amount: number;
  amount: number;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  paid_at: string | null;
  payment_method: string | null;
  user: { email: string };
  profile: { full_name: string; total_capital: number };
}

interface Strategy {
  id: string;
  name: string;
  status: string;
  allocated_capital: number;
  created_at: string;
}

export function AdminBillingPanel() {
  useAuth(); // Hook for auth context
  const [activeTab, setActiveTab] = useState<'overview' | 'invoices' | 'strategies'>('overview');
  const [users, setUsers] = useState<BillingUser[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [stats, setStats] = useState({
    total_users: 0,
    users_fixed_fee: 0,
    users_profit_share: 0,
    total_capital_managed: 0,
    pending_invoices_count: 0,
    pending_invoices_amount: 0,
    total_revenue: 0
  });
  const [, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [userStrategies, setUserStrategies] = useState<Strategy[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Invoice generation
  const [generateMonth, setGenerateMonth] = useState(new Date().getMonth() + 1);
  const [generateYear, setGenerateYear] = useState(new Date().getFullYear());

  // Fetch billing overview
  const fetchBillingOverview = async () => {
    setLoading(true);
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        console.error('Session error:', sessionError);
        throw new Error('Errore sessione: ' + sessionError.message);
      }

      if (!session?.access_token) {
        console.error('No active session found');
        throw new Error('Sessione non attiva. Prova a fare logout e login di nuovo.');
      }

      console.log('Fetching billing overview with token:', session.access_token.substring(0, 20) + '...');

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-7c0f82ca/admin/billing/overview`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('API error:', response.status, errorData);
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to fetch billing overview`);
      }

      const { stats: fetchedStats, users: fetchedUsers } = await response.json();
      setStats(fetchedStats);
      setUsers(fetchedUsers);
    } catch (error) {
      console.error('Error fetching billing overview:', error);
      toast.error(error instanceof Error ? error.message : 'Errore nel caricamento overview fatturazione');
    } finally {
      setLoading(false);
    }
  };

  // Fetch invoices
  const fetchInvoices = async (status = '') => {
    setLoading(true);
    try {
      // Try to refresh session first
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        console.error('Session error in fetchInvoices:', sessionError);
        throw new Error('Errore sessione: ' + sessionError.message);
      }

      if (!session?.access_token) {
        console.error('No active session in fetchInvoices');
        throw new Error('Sessione non attiva. Prova a fare logout e login di nuovo.');
      }

      console.log('Fetching invoices with token:', session.access_token.substring(0, 20) + '...');

      const queryParams = new URLSearchParams({
        ...(status && { status })
      });

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-7c0f82ca/admin/invoices?${queryParams}`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('API error in fetchInvoices:', response.status, errorData);
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to fetch invoices`);
      }

      const { invoices: fetchedInvoices } = await response.json();
      setInvoices(fetchedInvoices);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast.error(error instanceof Error ? error.message : 'Errore nel caricamento fatture');
    } finally {
      setLoading(false);
    }
  };

  // Fetch user strategies
  const fetchUserStrategies = async (userId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('No active session');

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-7c0f82ca/admin/users/${userId}/strategies`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) throw new Error('Failed to fetch strategies');

      const { strategies, summary } = await response.json();
      setUserStrategies(strategies);

      toast.success(`Strategie caricate: ${summary.total_strategies} totali, ${summary.active_strategies} attive`);
    } catch (error) {
      console.error('Error fetching user strategies:', error);
      toast.error('Errore nel caricamento strategie');
    }
  };

  // Generate invoice for user
  const generateInvoice = async (userId: string, userEmail: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('No active session');

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-7c0f82ca/admin/invoices/generate`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId,
            month: generateMonth,
            year: generateYear
          })
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate invoice');
      }

      const { invoice } = await response.json();
      toast.success(`Fattura generata per ${userEmail}: €${invoice.amount.toFixed(2)}`);

      fetchBillingOverview();
      if (activeTab === 'invoices') {
        fetchInvoices();
      }
    } catch (error: any) {
      console.error('Error generating invoice:', error);
      toast.error(error.message || 'Errore nella generazione fattura');
    }
  };

  // Mark invoice as paid
  const markInvoiceAsPaid = async (invoiceId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('No active session');

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-7c0f82ca/admin/invoices/${invoiceId}/mark-paid`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            paymentMethod: 'manual',
            notes: 'Marked as paid by admin'
          })
        }
      );

      if (!response.ok) throw new Error('Failed to mark invoice as paid');

      toast.success('Fattura segnata come pagata');
      fetchInvoices();
      fetchBillingOverview();
    } catch (error) {
      console.error('Error marking invoice as paid:', error);
      toast.error('Errore nell\'aggiornamento fattura');
    }
  };

  // Bulk generate invoices
  const bulkGenerateInvoices = async () => {
    if (!confirm(`Generare fatture per TUTTI gli utenti per ${generateMonth}/${generateYear}?`)) {
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('No active session');

      toast.info('Generazione fatture in corso...');

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-7c0f82ca/admin/invoices/bulk-generate`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            month: generateMonth,
            year: generateYear
          })
        }
      );

      if (!response.ok) throw new Error('Failed to bulk generate invoices');

      const { results } = await response.json();

      toast.success(
        `Fatture generate: ${results.success.length} success, ${results.errors.length} errori, ${results.skipped.length} già esistenti`
      );

      fetchBillingOverview();
      if (activeTab === 'invoices') {
        fetchInvoices();
      }
    } catch (error) {
      console.error('Error bulk generating invoices:', error);
      toast.error('Errore nella generazione massiva');
    }
  };

  useEffect(() => {
    fetchBillingOverview();
  }, []);

  useEffect(() => {
    if (activeTab === 'invoices') {
      fetchInvoices();
    }
  }, [activeTab]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'overdue': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'cancelled': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const filteredUsers = users.filter(u =>
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-4 bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20">
            <div className="flex items-center justify-between mb-2">
              <Wallet className="w-5 h-5 text-emerald-400" />
              <Badge className="bg-emerald-500/20 text-emerald-400">
                {stats.users_profit_share} profit share
              </Badge>
            </div>
            <div className="text-2xl font-bold text-white">
              €{stats.total_capital_managed.toLocaleString('it-IT')}
            </div>
            <div className="text-sm text-gray-400">Capitale Gestito</div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="p-4 bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
            <div className="flex items-center justify-between mb-2">
              <FileText className="w-5 h-5 text-blue-400" />
              <Badge className="bg-red-500/20 text-red-400">
                {stats.pending_invoices_count} pending
              </Badge>
            </div>
            <div className="text-2xl font-bold text-white">
              €{stats.pending_invoices_amount.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-sm text-gray-400">Da Incassare</div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="p-4 bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-5 h-5 text-purple-400" />
            </div>
            <div className="text-2xl font-bold text-white">
              €{stats.total_revenue.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-sm text-gray-400">Revenue Totale</div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="p-4 bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/20">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-5 h-5 text-orange-400" />
              <Badge className="bg-orange-500/20 text-orange-400">
                {stats.users_fixed_fee} canone fisso
              </Badge>
            </div>
            <div className="text-2xl font-bold text-white">{stats.total_users}</div>
            <div className="text-sm text-gray-400">Utenti Totali</div>
          </Card>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-700">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 font-medium transition-colors ${activeTab === 'overview'
              ? 'text-emerald-400 border-b-2 border-emerald-400'
              : 'text-gray-400 hover:text-white'
            }`}
        >
          Overview Utenti
        </button>
        <button
          onClick={() => setActiveTab('invoices')}
          className={`px-4 py-2 font-medium transition-colors ${activeTab === 'invoices'
              ? 'text-emerald-400 border-b-2 border-emerald-400'
              : 'text-gray-400 hover:text-white'
            }`}
        >
          Fatture
        </button>
        {selectedUser && (
          <button
            onClick={() => setActiveTab('strategies')}
            className={`px-4 py-2 font-medium transition-colors ${activeTab === 'strategies'
                ? 'text-emerald-400 border-b-2 border-emerald-400'
                : 'text-gray-400 hover:text-white'
              }`}
          >
            Strategie Utente
          </button>
        )}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          {/* Generate Invoice Controls */}
          <Card className="p-4 bg-gray-800/30 backdrop-blur-xl border-white/10">
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1">
                <label className="text-sm text-gray-400 mb-2 block">Periodo Fatturazione</label>
                <div className="flex gap-2">
                  <select
                    value={generateMonth}
                    onChange={(e) => setGenerateMonth(parseInt(e.target.value))}
                    className="px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white"
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                      <option key={m} value={m}>
                        {new Date(2024, m - 1).toLocaleString('it-IT', { month: 'long' })}
                      </option>
                    ))}
                  </select>
                  <Input
                    type="number"
                    value={generateYear}
                    onChange={(e) => setGenerateYear(parseInt(e.target.value))}
                    className="w-24 bg-gray-900/50 border-gray-700"
                  />
                </div>
              </div>
              <Button
                onClick={bulkGenerateInvoices}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <FileText className="w-4 h-4 mr-2" />
                Genera Fatture per Tutti
              </Button>
            </div>
          </Card>

          {/* Search */}
          <Card className="p-4 bg-gray-800/30 backdrop-blur-xl border-white/10">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Cerca utente per email o nome..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-900/50 border-gray-700 text-white"
              />
            </div>
          </Card>

          {/* Users Table */}
          <Card className="overflow-hidden bg-gray-800/30 backdrop-blur-xl border-white/10">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-900/50 border-b border-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Utente</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Capitale</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Modello</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Fatture</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Azioni</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/50">
                  {filteredUsers.map((user) => (
                    <motion.tr key={user.id} className="hover:bg-gray-700/20 transition-colors">
                      <td className="px-4 py-4">
                        <div>
                          <div className="text-white font-medium">{user.full_name || 'N/A'}</div>
                          <div className="text-sm text-gray-400">{user.email}</div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div>
                          <div className="text-white font-bold">€{(user.total_capital || 0).toLocaleString('it-IT')}</div>
                          <div className="text-xs text-gray-500">
                            Soglia: €{(user.capital_threshold || 2500).toLocaleString('it-IT')}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <Badge className={
                          user.payment_model === 'profit_share'
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                            : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                        }>
                          {user.payment_model === 'profit_share'
                            ? `${user.profit_share_percentage || 15}% profitti`
                            : `€${user.plan_price || 0}/mese`
                          }
                        </Badge>
                      </td>
                      <td className="px-4 py-4">
                        <div className="space-y-1">
                          <div className="text-sm text-gray-300">
                            Pagato: €{(user.total_paid || 0).toFixed(2)}
                          </div>
                          {user.pending_invoices > 0 && (
                            <div className="text-xs text-yellow-400">
                              {user.pending_invoices} pending (€{(user.total_pending || 0).toFixed(2)})
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedUser(user.id);
                              fetchUserStrategies(user.id);
                              setActiveTab('strategies');
                            }}
                            className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            Strategie
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => generateInvoice(user.id, user.email)}
                            className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                          >
                            <FileText className="w-3 h-3 mr-1" />
                            Fattura
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Invoices Tab */}
      {activeTab === 'invoices' && (
        <div className="space-y-4">
          <Card className="overflow-hidden bg-gray-800/30 backdrop-blur-xl border-white/10">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-900/50 border-b border-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Utente</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Periodo</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Tipo</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Importo</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Azioni</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/50">
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-gray-700/20 transition-colors">
                      <td className="px-4 py-4">
                        <div>
                          <div className="text-white font-medium">{invoice.profile?.full_name || 'N/A'}</div>
                          <div className="text-sm text-gray-400">{invoice.user?.email}</div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-300">
                          {new Date(invoice.billing_period_start).toLocaleDateString('it-IT')} -
                          {new Date(invoice.billing_period_end).toLocaleDateString('it-IT')}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <Badge className={
                          invoice.invoice_type === 'profit_share'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-blue-500/20 text-blue-400'
                        }>
                          {invoice.invoice_type === 'profit_share'
                            ? `Profit Share (${invoice.profit_share_percentage}%)`
                            : 'Canone Fisso'
                          }
                        </Badge>
                        {invoice.invoice_type === 'profit_share' && (
                          <div className="text-xs text-gray-500 mt-1">
                            Profitto: €{invoice.monthly_profit.toFixed(2)}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-lg font-bold text-white">
                          €{invoice.amount.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <Badge className={getStatusColor(invoice.status)}>
                          {invoice.status}
                        </Badge>
                        {invoice.paid_at && (
                          <div className="text-xs text-gray-500 mt-1">
                            {new Date(invoice.paid_at).toLocaleDateString('it-IT')}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        {invoice.status === 'pending' && (
                          <Button
                            size="sm"
                            onClick={() => markInvoiceAsPaid(invoice.id)}
                            className="bg-emerald-600 hover:bg-emerald-700"
                          >
                            <Check className="w-3 h-3 mr-1" />
                            Segna Pagato
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Strategies Tab */}
      {activeTab === 'strategies' && selectedUser && (
        <div className="space-y-4">
          <Card className="p-4 bg-gray-800/30 backdrop-blur-xl border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Strategie Utente</h3>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setSelectedUser(null);
                  setUserStrategies([]);
                  setActiveTab('overview');
                }}
                className="border-gray-700"
              >
                <X className="w-4 h-4 mr-1" />
                Chiudi
              </Button>
            </div>

            {userStrategies.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                Nessuna strategia trovata
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userStrategies.map((strategy) => (
                  <Card key={strategy.id} className="p-4 bg-gray-900/50 border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-white">{strategy.name}</h4>
                      <Badge className={
                        strategy.status === 'active'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-gray-500/20 text-gray-400'
                      }>
                        {strategy.status}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm text-gray-400">
                        Capitale: <span className="text-white font-bold">€{strategy.allocated_capital.toLocaleString('it-IT')}</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        Creata: {new Date(strategy.created_at).toLocaleDateString('it-IT')}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}