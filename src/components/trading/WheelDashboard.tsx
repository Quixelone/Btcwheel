import { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import {
  TrendingUp,

  DollarSign,
  Target,
  Activity,
  Clock,
  ArrowUpCircle,
  ArrowDownCircle,
  RefreshCw,
  PieChart,
  BarChart3,
  Zap,
  Shield,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

interface Position {
  id: string;
  type: 'put' | 'call' | 'shares';
  strike?: number;
  premium?: number;
  shares?: number;
  costBasis?: number;
  openDate: string;
  expiration?: string;
  status: 'open' | 'assigned' | 'called-away' | 'expired';
  pnl: number;
}

interface WheelDashboardProps {
  onNavigate?: (view: string) => void;
}

export function WheelDashboard({ }: WheelDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'positions' | 'history'>('overview');

  // Mock data (da sostituire con dati reali dal paper trading)
  const stats = {
    totalPnL: 2450.50,
    totalPremium: 5680.00,
    winRate: 78.5,
    activeTrades: 3,
    completedCycles: 12,
    currentCapital: 25450.50,
    weeklyReturn: 2.3,
    monthlyReturn: 9.8
  };

  const positions: Position[] = [
    {
      id: '1',
      type: 'put',
      strike: 42000,
      premium: 180,
      openDate: '2026-01-02',
      expiration: '2026-01-02',
      status: 'open',
      pnl: 120
    },
    {
      id: '2',
      type: 'shares',
      shares: 100,
      costBasis: 41800,
      openDate: '2025-12-28',
      status: 'assigned',
      pnl: -200
    },
    {
      id: '3',
      type: 'call',
      strike: 42500,
      premium: 150,
      openDate: '2025-12-29',
      expiration: '2026-01-02',
      status: 'open',
      pnl: 100
    }
  ];

  const wheelCycle = [
    { phase: 'Sell Put', status: 'completed', icon: ArrowDownCircle, color: 'text-emerald-600' },
    { phase: 'Get Assigned', status: 'active', icon: Target, color: 'text-orange-600' },
    { phase: 'Sell Call', status: 'pending', icon: ArrowUpCircle, color: 'text-gray-400' },
    { phase: 'Get Called Away', status: 'pending', icon: CheckCircle2, color: 'text-gray-400' },
    { phase: 'Repeat', status: 'pending', icon: RefreshCw, color: 'text-gray-400' }
  ];

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">P&L Totale</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <p className={`text-2xl font-bold ${stats.totalPnL >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            ${stats.totalPnL >= 0 ? '+' : ''}{stats.totalPnL.toFixed(2)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            <TrendingUp className="w-3 h-3 inline mr-1" />
            +{stats.weeklyReturn}% questa settimana
          </p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Premium Totale</span>
            <Target className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            ${stats.totalPremium.toFixed(0)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Incassato finora
          </p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Win Rate</span>
            <Activity className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {stats.winRate}%
          </p>
          <div className="mt-2">
            <Progress value={stats.winRate} className="h-2" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Trade Attivi</span>
            <Zap className="w-4 h-4 text-orange-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {stats.activeTrades}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {stats.completedCycles} cicli completati
          </p>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 font-medium transition-colors relative ${activeTab === 'overview'
              ? 'text-emerald-600'
              : 'text-gray-600 hover:text-gray-900'
            }`}
        >
          Overview
          {activeTab === 'overview' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('positions')}
          className={`px-4 py-2 font-medium transition-colors relative ${activeTab === 'positions'
              ? 'text-emerald-600'
              : 'text-gray-600 hover:text-gray-900'
            }`}
        >
          Posizioni
          {activeTab === 'positions' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 font-medium transition-colors relative ${activeTab === 'history'
              ? 'text-emerald-600'
              : 'text-gray-600 hover:text-gray-900'
            }`}
        >
          Storico
          {activeTab === 'history' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600" />
          )}
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Wheel Cycle Tracker */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-gray-900">Ciclo Wheel Strategy</h3>
                <p className="text-sm text-gray-600">Tracking del ciclo corrente</p>
              </div>
              <RefreshCw className="w-5 h-5 text-emerald-600" />
            </div>

            <div className="space-y-4">
              {wheelCycle.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={index} className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step.status === 'completed' ? 'bg-emerald-100' :
                        step.status === 'active' ? 'bg-orange-100' :
                          'bg-gray-100'
                      }`}>
                      <Icon className={`w-5 h-5 ${step.color}`} />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{step.phase}</p>
                      <p className="text-sm text-gray-600 capitalize">{step.status}</p>
                    </div>
                    {step.status === 'completed' && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    )}
                    {step.status === 'active' && (
                      <div className="w-2 h-2 rounded-full bg-orange-600 animate-pulse" />
                    )}
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Performance Chart Placeholder */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-gray-900">Performance 30 Giorni</h3>
                <p className="text-sm text-gray-600">P&L giornaliero</p>
              </div>
              <BarChart3 className="w-5 h-5 text-blue-600" />
            </div>

            {/* Simple chart visualization */}
            <div className="flex items-end justify-between h-40 gap-2">
              {[65, 78, 85, 72, 90, 88, 95, 82, 75, 88, 92, 85, 78, 90].map((height, i) => (
                <div
                  key={i}
                  className="flex-1 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-sm transition-all hover:opacity-80"
                  style={{ height: `${height}%` }}
                  title={`Giorno ${i + 1}`}
                />
              ))}
            </div>

            <div className="flex justify-between mt-4 text-xs text-gray-500">
              <span>30 giorni fa</span>
              <span>Oggi</span>
            </div>
          </Card>

          {/* Risk Metrics */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-gray-900">Risk Management</h3>
                  <p className="text-sm text-gray-600">Esposizione corrente</p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Capitale Utilizzato</span>
                    <span className="font-medium text-gray-900">45%</span>
                  </div>
                  <Progress value={45} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Delta Exposure</span>
                    <span className="font-medium text-gray-900">-0.25</span>
                  </div>
                  <Progress value={25} className="h-2 [&>div]:bg-orange-500" />
                </div>

                <div className="pt-3 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Max Drawdown</span>
                    <span className="text-sm font-medium text-red-600">-3.2%</span>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <PieChart className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-gray-900">Allocazione</h3>
                  <p className="text-sm text-gray-600">Portfolio corrente</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="text-sm text-gray-600">Cash</span>
                  </div>
                  <span className="font-medium text-gray-900">$14,025</span>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <span className="text-sm text-gray-600">BTC Shares</span>
                  </div>
                  <span className="font-medium text-gray-900">$8,400</span>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-orange-500" />
                    <span className="text-sm text-gray-600">Options</span>
                  </div>
                  <span className="font-medium text-gray-900">$3,025</span>
                </div>

                <div className="pt-3 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-900">Totale</span>
                    <span className="font-bold text-gray-900">${stats.currentCapital.toFixed(0)}</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Positions Tab */}
      {activeTab === 'positions' && (
        <div className="space-y-4">
          {positions.length === 0 ? (
            <Card className="p-12 text-center">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">Nessuna posizione aperta</p>
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                Apri Prima Posizione
              </Button>
            </Card>
          ) : (
            positions.map((position) => (
              <Card key={position.id} className="p-4 md:p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${position.type === 'put' ? 'bg-emerald-100' :
                        position.type === 'call' ? 'bg-blue-100' :
                          'bg-orange-100'
                      }`}>
                      {position.type === 'put' ? (
                        <ArrowDownCircle className="w-5 h-5 text-emerald-600" />
                      ) : position.type === 'call' ? (
                        <ArrowUpCircle className="w-5 h-5 text-blue-600" />
                      ) : (
                        <Target className="w-5 h-5 text-orange-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 capitalize">
                        {position.type === 'shares' ? 'BTC Shares' : `${position.type.toUpperCase()} Option`}
                      </p>
                      <p className="text-sm text-gray-600">
                        {position.type !== 'shares' ? `Strike: $${position.strike}` : `${position.shares} shares @ $${position.costBasis}`}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${position.status === 'open' ? 'bg-blue-100 text-blue-800' :
                        position.status === 'assigned' ? 'bg-orange-100 text-orange-800' :
                          position.status === 'called-away' ? 'bg-purple-100 text-purple-800' :
                            'bg-gray-100 text-gray-800'
                      }`}>
                      {position.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {position.premium && (
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Premium</p>
                      <p className="font-semibold text-gray-900">${position.premium}</p>
                    </div>
                  )}

                  {position.expiration && (
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Scadenza</p>
                      <p className="font-semibold text-gray-900 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(position.expiration).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })}
                      </p>
                    </div>
                  )}

                  <div>
                    <p className="text-xs text-gray-600 mb-1">Data Apertura</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(position.openDate).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-600 mb-1">P&L</p>
                    <p className={`font-bold ${position.pnl >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      ${position.pnl >= 0 ? '+' : ''}{position.pnl}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    Dettagli
                  </Button>
                  {position.status === 'open' && (
                    <Button size="sm" variant="outline" className="flex-1 text-red-600 border-red-200 hover:bg-red-50">
                      Chiudi
                    </Button>
                  )}
                </div>
              </Card>
            ))
          )}

          {/* Quick Actions */}
          <Card className="p-6 bg-gradient-to-r from-emerald-50 to-blue-50">
            <h3 className="text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid md:grid-cols-2 gap-3">
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                <ArrowDownCircle className="w-4 h-4 mr-2" />
                Sell Put 0DTE
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <ArrowUpCircle className="w-4 h-4 mr-2" />
                Sell Covered Call
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <Card className="p-6">
          <h3 className="text-gray-900 mb-4">Storico Operazioni</h3>
          <div className="space-y-3">
            {[
              { date: '2025-12-28', action: 'Sell Put', strike: 41500, premium: 175, outcome: 'Assigned', pnl: 175 },
              { date: '2025-12-23', action: 'Sell Call', strike: 42000, premium: 160, outcome: 'Expired', pnl: 160 },
              { date: '2025-12-20', action: 'Sell Put', strike: 40500, premium: 190, outcome: 'Expired', pnl: 190 },
              { date: '2025-12-18', action: 'Sell Call', strike: 41500, premium: 145, outcome: 'Called Away', pnl: 645 },
            ].map((trade, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${trade.action === 'Sell Put' ? 'bg-emerald-100' : 'bg-blue-100'
                    }`}>
                    {trade.action === 'Sell Put' ? (
                      <ArrowDownCircle className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <ArrowUpCircle className="w-4 h-4 text-blue-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{trade.action} @ ${trade.strike}</p>
                    <p className="text-sm text-gray-600">{trade.date} • {trade.outcome}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-emerald-600">+${trade.pnl}</p>
                  <p className="text-xs text-gray-500">Premium ${trade.premium}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
