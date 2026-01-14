import { useState } from 'react';
import { motion } from 'motion/react';
import { Card } from './ui/card';
import { 
  LayoutDashboard, 
  Users, 
  Euro, 
  Shield,
  Crown
} from 'lucide-react';
import { AdminUserManagement } from './AdminUserManagement';
import { AdminBillingPanel } from './AdminBillingPanel';

type TabType = 'overview' | 'users' | 'billing';

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const tabs = [
    { id: 'overview' as const, label: 'Dashboard', icon: LayoutDashboard, color: 'emerald' },
    { id: 'users' as const, label: 'Utenti', icon: Users, color: 'blue' },
    { id: 'billing' as const, label: 'Fatturazione', icon: Euro, color: 'purple' },
  ];

  return (
    <div className="space-y-6">
      {/* Admin Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl"
      >
        <Card className="p-6 bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-red-500/10 border-amber-500/20">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-amber-500/20 border border-amber-500/30">
              <Shield className="w-8 h-8 text-amber-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold text-white">Pannello Amministrazione</h1>
                <Crown className="w-6 h-6 text-amber-400" />
              </div>
              <p className="text-gray-400">Gestisci utenti, fatturazione e monitora l'app</p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Navigation Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="p-2 bg-gray-800/40 backdrop-blur-xl border-white/10">
          <div className="flex gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              // Define color classes statically
              const activeClasses = {
                emerald: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-lg',
                blue: 'bg-blue-500/20 text-blue-400 border border-blue-500/30 shadow-lg',
                purple: 'bg-purple-500/20 text-purple-400 border border-purple-500/30 shadow-lg',
              };
              
              const inactiveClasses = 'text-gray-400 hover:text-white hover:bg-white/5';
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg
                    font-medium transition-all duration-200
                    ${isActive ? activeClasses[tab.color as keyof typeof activeClasses] : inactiveClasses}
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </Card>
      </motion.div>

      {/* Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'overview' && (
          <OverviewTab />
        )}
        
        {activeTab === 'users' && (
          <AdminUserManagement />
        )}
        
        {activeTab === 'billing' && (
          <AdminBillingPanel />
        )}
      </motion.div>
    </div>
  );
}

function OverviewTab() {
  return (
    <div className="space-y-6">
      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6 bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20 hover:border-emerald-500/40 transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-emerald-500/20">
                <Users className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <div className="text-3xl font-bold text-white">--</div>
                <div className="text-sm text-gray-400">Utenti Attivi</div>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20 hover:border-blue-500/40 transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-500/20">
                <Euro className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <div className="text-3xl font-bold text-white">€--</div>
                <div className="text-sm text-gray-400">Revenue Mensile</div>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6 bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20 hover:border-purple-500/40 transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-purple-500/20">
                <LayoutDashboard className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <div className="text-3xl font-bold text-white">--</div>
                <div className="text-sm text-gray-400">Strategie Attive</div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Welcome Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="p-8 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border-white/10">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Shield className="w-6 h-6 text-emerald-400" />
              Benvenuto nel Pannello Admin
            </h2>
            <p className="text-gray-400 mb-6">
              Da qui puoi gestire tutti gli aspetti dell'applicazione BTCWheel. Usa le tab sopra per navigare tra:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <div className="flex items-center gap-3 mb-2">
                  <Users className="w-5 h-5 text-blue-400" />
                  <h3 className="font-semibold text-white">Gestione Utenti</h3>
                </div>
                <p className="text-sm text-gray-400">
                  Visualizza, cerca e gestisci gli utenti. Sospendi account, crea backup e monitora l'attività.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                <div className="flex items-center gap-3 mb-2">
                  <Euro className="w-5 h-5 text-purple-400" />
                  <h3 className="font-semibold text-white">Fatturazione</h3>
                </div>
                <p className="text-sm text-gray-400">
                  Genera fatture, monitora pagamenti e visualizza revenue. Gestione automatica canone fisso e profit share.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* System Status (Future) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="p-6 bg-gray-800/30 backdrop-blur-xl border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4">Stato Sistema</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <span className="text-sm text-gray-300">Database</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                <span className="text-sm text-emerald-400 font-medium">Online</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <span className="text-sm text-gray-300">API Server</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                <span className="text-sm text-emerald-400 font-medium">Online</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <span className="text-sm text-gray-300">Edge Functions</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                <span className="text-sm text-emerald-400 font-medium">Online</span>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}