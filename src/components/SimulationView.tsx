import { useState, useEffect } from 'react';
import { Navigation } from './Navigation';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { useUserProgress } from '../hooks/useUserProgress';
import { useAuth } from '../hooks/useAuth';
import { CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, XAxis, YAxis } from 'recharts';
import { DollarSign, Target, Lock, CheckCircle2, Lightbulb, Zap, TrendingUp, TrendingDown } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { storage } from '../lib/localStorage';
import { saveSimulationState, getSimulationState } from '../lib/supabase';
import { PageWrapper, PageContent, PageHeader } from './layout/PageWrapper';
import { StatCardSmall } from './ui/stat-card';
import type { View } from '../App';

interface SimulationViewProps {
  onNavigate: (view: View) => void;
  mascotVisible?: boolean;
  onMascotToggle?: () => void;
}

interface Position {
  id: string;
  type: 'put' | 'call';
  strike: number;
  premium: number;
  quantity: number;
  openDate: Date;
  status: 'open' | 'closed';
  assignmentPrice?: number;
}

interface Mission {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  objectives: {
    type: 'sell_option' | 'collect_premium' | 'close_position' | 'handle_assignment' | 'complete_wheel';
    target: number;
    current: number;
    description: string;
  }[];
  reward: {
    xp: number;
    badgeId?: string;
  };
  tutorial: {
    step: number;
    title: string;
    content: string;
  }[];
  status: 'locked' | 'active' | 'completed';
  unlockRequirement?: string;
}

const MISSIONS: Mission[] = [
  {
    id: 'mission-1',
    title: 'Il Tuo Primo Premium',
    description: 'Impara a vendere la tua prima opzione put e raccogliere premium',
    difficulty: 'easy',
    objectives: [
      {
        type: 'sell_option',
        target: 1,
        current: 0,
        description: 'Vendi 1 opzione put'
      }
    ],
    reward: { xp: 200, badgeId: 'first-premium' },
    tutorial: [
      {
        step: 1,
        title: 'Cos\'è una Put?',
        content: 'Vendere una put significa che accetti di comprare Bitcoin a un prezzo fisso (strike) se il prezzo scende. In cambio, ricevi subito un pagamento (premium).'
      },
      {
        step: 2,
        title: 'Scegli lo Strike',
        content: 'Seleziona uno strike price SOTTO il prezzo corrente di Bitcoin. Consiglio: inizia con 5-10% sotto il prezzo attuale per maggiore sicurezza.'
      },
      {
        step: 3,
        title: 'Raccogli il Premium',
        content: 'Il premium è il tuo guadagno immediato! Più basso è lo strike, più basso è le premium ma più sicura è la posizione.'
      }
    ],
    status: 'active',
  },
  {
    id: 'mission-2',
    title: 'Collezionista di Premium',
    description: 'Raccogli $1,000 totali in premium vendendo multiple opzioni',
    difficulty: 'medium',
    objectives: [
      {
        type: 'collect_premium',
        target: 1000,
        current: 0,
        description: 'Raccogli $1,000 in premium'
      }
    ],
    reward: { xp: 300 },
    tutorial: [
      {
        step: 1,
        title: 'Gestione del Rischio',
        content: 'Vendere più opzioni aumenta il tuo guadagno ma anche il capitale richiesto. Assicurati di avere abbastanza liquidità!'
      }
    ],
    status: 'locked',
    unlockRequirement: 'Completa la missione "Il Tuo Primo Premium"'
  },
  {
    id: 'mission-3',
    title: 'L\'Assegnazione',
    description: 'Sperimenta cosa succede quando il prezzo scende sotto lo strike',
    difficulty: 'hard',
    objectives: [
      {
        type: 'handle_assignment',
        target: 1,
        current: 0,
        description: 'Ricevi un\'assegnazione di BTC'
      }
    ],
    reward: { xp: 500, badgeId: 'bitcoin-owner' },
    tutorial: [
      {
        step: 1,
        title: 'Essere Assegnati',
        content: 'Se alla scadenza il prezzo di BTC è sotto il tuo strike, compri i BTC a quel prezzo. Non è un male: ora possiedi l\'asset e puoi vendere Call!'
      }
    ],
    status: 'locked',
    unlockRequirement: 'Raccogli $1,000 in premium'
  },
  {
    id: 'mission-4',
    title: 'Chiudi il Cerchio (The Wheel)',
    description: 'Vendi una Covered Call sui BTC che possiedi per completare la strategia',
    difficulty: 'expert',
    objectives: [
      {
        type: 'complete_wheel',
        target: 1,
        current: 0,
        description: 'Vendi una Call e chiudi il cerchio'
      }
    ],
    reward: { xp: 1000, badgeId: 'wheel-master' },
    tutorial: [
      {
        step: 1,
        title: 'Covered Call',
        content: 'Ora che hai BTC, vendi una Call sopra il tuo prezzo di acquisto. Se il prezzo sale, vendi i BTC in profitto e ricominci il giro!'
      }
    ],
    status: 'locked',
    unlockRequirement: 'Ricevi la tua prima assegnazione'
  }
];

export function SimulationView({ onNavigate, mascotVisible, onMascotToggle }: SimulationViewProps) {
  const { user } = useAuth();
  const { addXP } = useUserProgress();

  // Simulation State
  const [btcPrice, setBtcPrice] = useState(45000);
  const [priceHistory, setPriceHistory] = useState<{ time: string, price: number }[]>([]);
  const [portfolioValue, setPortfolioValue] = useState(10000);
  const [btcOwned, setBtcOwned] = useState(0);
  const [positions, setPositions] = useState<Position[]>([]);
  const [missions, setMissions] = useState<Mission[]>(MISSIONS);
  const [activeMission, setActiveMission] = useState<Mission | null>(MISSIONS[0]);
  const [showTutorial, setShowTutorial] = useState(true);
  const [currentTutorialStep, setCurrentTutorialStep] = useState(0);

  // Trading Form State
  const [strikePrice, setStrikePrice] = useState('');
  const [premium, setPremium] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [optionType, setOptionType] = useState<'put' | 'call'>('put');

  // Load state from Supabase or LocalStorage
  useEffect(() => {
    const loadState = async () => {
      if (user) {
        const state = await getSimulationState(user.id);
        if (state) {
          if (state.missions) setMissions(state.missions);
          if (state.portfolio) {
            setPortfolioValue(state.portfolio.portfolioValue);
            setBtcOwned(state.portfolio.btcOwned);
            setPositions(state.portfolio.positions.map((p: any) => ({
              ...p,
              openDate: new Date(p.openDate)
            })));
          }
        }
      } else {
        const savedJson = storage.getItem('simulation_state');
        if (savedJson) {
          try {
            const saved = JSON.parse(savedJson);
            setPortfolioValue(saved.portfolioValue);
            setPositions(saved.positions.map((p: any) => ({ ...p, openDate: new Date(p.openDate) })));
            setBtcOwned(saved.btcOwned);
            setMissions(saved.missions);
          } catch (e) {
            console.error("Failed to parse simulation state", e);
          }
        }
      }
    };
    loadState();
  }, [user]);

  // Save state
  useEffect(() => {
    const state = {
      portfolioValue,
      positions,
      btcOwned,
      missions
    };

    if (user) {
      saveSimulationState(user.id, {
        portfolio: { portfolioValue, positions, btcOwned },
        missions
      });
    } else {
      storage.setItem('simulation_state', JSON.stringify(state));
    }
  }, [portfolioValue, positions, btcOwned, missions, user]);

  // Price Simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setBtcPrice(prev => {
        const change = (Math.random() - 0.5) * 200;
        const newPrice = prev + change;

        setPriceHistory(history => {
          const newHistory = [...history, { time: new Date().toLocaleTimeString(), price: newPrice }];
          if (newHistory.length > 20) newHistory.shift();
          return newHistory;
        });

        checkAssignments(newPrice);
        return newPrice;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [positions]);

  const checkAssignments = (currentPrice: number) => {
    setPositions(prevPositions => {
      const updatedPositions = prevPositions.map(pos => {
        if (pos.status === 'closed') return pos;

        // Put Assignment Logic
        if (pos.type === 'put' && currentPrice <= pos.strike) {
          // 5% chance of assignment if ITM
          if (Math.random() < 0.05) {
            const cost = pos.strike * pos.quantity;
            if (portfolioValue >= cost) {
              setPortfolioValue(v => v - cost);
              setBtcOwned(b => b + pos.quantity);
              toast.error(`Assegnato! Hai comprato ${pos.quantity} BTC a $${pos.strike}`);
              updateMissionProgress('handle_assignment', 1);
              return { ...pos, status: 'closed', assignmentPrice: pos.strike } as Position;
            }
          }
        }

        // Call Assignment Logic
        if (pos.type === 'call' && currentPrice >= pos.strike) {
          if (Math.random() < 0.05) {
            const revenue = pos.strike * pos.quantity;
            setPortfolioValue(v => v + revenue);
            setBtcOwned(b => b - pos.quantity);
            toast.success(`Assegnato! Hai venduto ${pos.quantity} BTC a $${pos.strike}`);
            updateMissionProgress('complete_wheel', 1);
            return { ...pos, status: 'closed', assignmentPrice: pos.strike } as Position;
          }
        }

        return pos;
      });
      return updatedPositions;
    });
  };

  const handleSellOption = () => {
    if (!strikePrice || !premium || !quantity) return;

    const strike = parseFloat(strikePrice);
    const prem = parseFloat(premium);
    const qty = parseFloat(quantity);
    const totalPremium = prem * qty;

    if (optionType === 'put') {
      const collateral = strike * qty;
      if (portfolioValue < collateral) {
        toast.error('Capitale insufficiente per il collaterale');
        return;
      }
    } else {
      if (btcOwned < qty) {
        toast.error('Non possiedi abbastanza BTC per vendere Call');
        return;
      }
    }

    const newPosition: Position = {
      id: Math.random().toString(36).substr(2, 9),
      type: optionType,
      strike,
      premium: prem,
      quantity: qty,
      openDate: new Date(),
      status: 'open'
    };

    setPositions([newPosition, ...positions]);
    setPortfolioValue(v => v + totalPremium);

    toast.success(`Opzione ${optionType.toUpperCase()} venduta! Premium raccolto: $${totalPremium}`);

    updateMissionProgress('sell_option', 1);
    updateMissionProgress('collect_premium', totalPremium);

    setStrikePrice('');
    setPremium('');
  };

  const updateMissionProgress = (type: Mission['objectives'][0]['type'], amount: number) => {
    setMissions(prevMissions => {
      return prevMissions.map(mission => {
        if (mission.status === 'locked') return mission;

        const updatedObjectives = mission.objectives.map(obj => {
          if (obj.type === type) {
            return { ...obj, current: Math.min(obj.target, obj.current + amount) };
          }
          return obj;
        });

        const isComplete = updatedObjectives.every(obj => obj.current >= obj.target);

        if (isComplete && mission.status !== 'completed') {
          handleMissionComplete(mission);
          return { ...mission, objectives: updatedObjectives, status: 'completed' } as Mission;
        }

        return { ...mission, objectives: updatedObjectives };
      });
    });
  };

  const handleMissionComplete = (mission: Mission) => {
    toast.success(`Missione Completata: ${mission.title}! +${mission.reward.xp} XP`);
    addXP(mission.reward.xp);

    // Unlock next mission logic
    const missionIndex = MISSIONS.findIndex(m => m.id === mission.id);
    if (missionIndex < MISSIONS.length - 1) {
      const nextMission = MISSIONS[missionIndex + 1];
      setMissions(prev => prev.map(m =>
        m.id === nextMission.id ? { ...m, status: 'active' } : m
      ));
    }
  };

  const selectMission = (mission: Mission) => {
    if (mission.status === 'locked') {
      toast.error(`Sblocca prima: ${mission.unlockRequirement}`);
      return;
    }
    setActiveMission(mission);
    setShowTutorial(true);
    setCurrentTutorialStep(0);
  };

  const getDifficultyColor = (difficulty: Mission['difficulty']) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'hard': return 'text-orange-400';
      case 'expert': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  return (
    <PageWrapper>
      <Navigation currentView="simulation" onNavigate={onNavigate} onMascotToggle={onMascotToggle} mascotVisible={mascotVisible} />

      <PageContent>
        <PageHeader
          title="Simulatore Wheel"
          subtitle="Metti in pratica le tue strategie senza rischiare capitale reale."
          actions={
            <div className="flex items-center gap-4">
              <StatCardSmall label="Portfolio" value={`$${portfolioValue.toLocaleString()}`} icon={DollarSign} color="green" />
              <StatCardSmall label="BTC" value={btcOwned.toFixed(4)} icon={Target} color="orange" />
            </div>
          }
        />

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Trading & Chart */}
          <div className="lg:col-span-2 space-y-8">
            {/* Chart */}
            <div className="bg-[#0A0A0C] border border-white/[0.08] rounded-[24px] p-6 h-[400px] relative overflow-hidden">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white">BTC/USD</h3>
                  <p className={`text-2xl font-bold ${btcPrice >= 45000 ? 'text-green-400' : 'text-red-400'}`}>
                    ${btcPrice.toFixed(2)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Badge className="bg-white/[0.05] text-[#888899]">1H</Badge>
                  <Badge className="bg-purple-500/20 text-purple-400">Live</Badge>
                </div>
              </div>

              <ResponsiveContainer width="100%" height="80%">
                <AreaChart data={priceHistory}>
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="time" stroke="#666677" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis domain={['auto', 'auto']} stroke="#666677" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0A0A0C', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="price" stroke="#8B5CF6" strokeWidth={2} fillOpacity={1} fill="url(#colorPrice)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Trading Interface */}
            <div className="bg-[#0A0A0C] border border-white/[0.08] rounded-[24px] p-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                  <Zap className="w-5 h-5 text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-white">Esegui Ordine</h3>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="flex bg-white/[0.03] p-1 rounded-xl border border-white/[0.05]">
                    <button
                      onClick={() => setOptionType('put')}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${optionType === 'put' ? 'bg-purple-600 text-white shadow-lg' : 'text-[#888899] hover:text-white'}`}
                    >
                      Vendi PUT
                    </button>
                    <button
                      onClick={() => setOptionType('call')}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${optionType === 'call' ? 'bg-purple-600 text-white shadow-lg' : 'text-[#888899] hover:text-white'}`}
                    >
                      Vendi CALL
                    </button>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-[#666677]">Strike Price ($)</Label>
                    <Input
                      type="number"
                      value={strikePrice}
                      onChange={(e) => setStrikePrice(e.target.value)}
                      placeholder="Es. 42000"
                      className="bg-white/[0.03] border-white/[0.08] rounded-xl h-12 text-white focus:border-purple-500/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-[#666677]">Premium ($)</Label>
                    <Input
                      type="number"
                      value={premium}
                      onChange={(e) => setPremium(e.target.value)}
                      placeholder="Es. 150"
                      className="bg-white/[0.03] border-white/[0.08] rounded-xl h-12 text-white focus:border-purple-500/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-[#666677]">Quantità (Contratti)</Label>
                    <Input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      placeholder="Es. 1"
                      className="bg-white/[0.03] border-white/[0.08] rounded-xl h-12 text-white focus:border-purple-500/50"
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="p-6 bg-white/[0.02] rounded-2xl border border-white/[0.05] space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-[#888899]">Collaterale Richiesto</span>
                      <span className="text-white font-bold">
                        ${strikePrice && quantity ? (parseFloat(strikePrice) * parseFloat(quantity)).toLocaleString() : '0'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#888899]">Premium Stimato</span>
                      <span className="text-green-400 font-bold">
                        +${premium && quantity ? (parseFloat(premium) * parseFloat(quantity)).toLocaleString() : '0'}
                      </span>
                    </div>
                    <div className="h-px bg-white/[0.05]" />
                    <div className="flex justify-between text-sm">
                      <span className="text-[#888899]">Break-even</span>
                      <span className="text-white font-bold">
                        ${strikePrice && premium ? (parseFloat(strikePrice) - parseFloat(premium)).toLocaleString() : '0'}
                      </span>
                    </div>
                  </div>

                  <Button
                    onClick={handleSellOption}
                    className="w-full h-12 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all hover:-translate-y-1"
                  >
                    Conferma Ordine
                  </Button>
                </div>
              </div>
            </div>

            {/* Active Positions */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white">Posizioni Aperte</h3>
              {positions.length === 0 ? (
                <div className="text-center py-12 bg-[#0A0A0C] border border-white/[0.08] rounded-[24px]">
                  <p className="text-[#666677]">Nessuna posizione attiva</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {positions.map(pos => (
                    <div key={pos.id} className="bg-[#0A0A0C] border border-white/[0.08] p-6 rounded-2xl flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${pos.type === 'put' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                          {pos.type === 'put' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="font-bold text-white uppercase">{pos.type} @ ${pos.strike}</p>
                          <p className="text-xs text-[#666677]">Premium: ${pos.premium}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${pos.status === 'open' ? 'text-green-400' : 'text-[#666677]'}`}>
                          {pos.status.toUpperCase()}
                        </p>
                        <p className="text-xs text-[#666677]">{new Date(pos.openDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Missions & Tutorial */}
          <div className="space-y-8">
            {/* Tutorial Card */}
            <AnimatePresence mode="wait">
              {showTutorial && activeMission && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-gradient-to-br from-purple-900/20 to-[#0A0A0C] border border-purple-500/30 rounded-[24px] p-6 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-[40px] -mr-16 -mt-16 pointer-events-none" />

                  <div className="flex items-center gap-3 mb-4">
                    <Lightbulb className="w-5 h-5 text-yellow-400" />
                    <h3 className="font-bold text-white">Tutorial: {activeMission.title}</h3>
                  </div>

                  <div className="bg-white/[0.03] rounded-xl p-4 mb-4 border border-white/[0.05]">
                    <h4 className="font-bold text-purple-300 mb-2">
                      {activeMission.tutorial[currentTutorialStep].title}
                    </h4>
                    <p className="text-sm text-[#888899] leading-relaxed">
                      {activeMission.tutorial[currentTutorialStep].content}
                    </p>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex gap-1">
                      {activeMission.tutorial.map((_, i) => (
                        <div
                          key={i}
                          className={`w-2 h-2 rounded-full ${i === currentTutorialStep ? 'bg-purple-500' : 'bg-white/10'}`}
                        />
                      ))}
                    </div>
                    <Button
                      size="sm"
                      onClick={() => {
                        if (currentTutorialStep < activeMission.tutorial.length - 1) {
                          setCurrentTutorialStep(c => c + 1);
                        } else {
                          setShowTutorial(false);
                        }
                      }}
                      className="bg-white/10 hover:bg-white/20 text-white"
                    >
                      {currentTutorialStep < activeMission.tutorial.length - 1 ? 'Avanti' : 'Ho capito'}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Missions List */}
            <div className="bg-[#0A0A0C] border border-white/[0.08] rounded-[24px] p-6">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-400" />
                Missioni
              </h3>

              <div className="space-y-4">
                {missions.map((mission) => (
                  <div
                    key={mission.id}
                    onClick={() => selectMission(mission)}
                    className={`
                      p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden
                      ${activeMission?.id === mission.id
                        ? 'bg-purple-500/10 border-purple-500/30'
                        : mission.status === 'locked'
                          ? 'bg-white/[0.02] border-white/[0.05] opacity-50'
                          : 'bg-white/[0.02] border-white/[0.05] hover:border-white/[0.15]'}
                    `}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-white text-sm">{mission.title}</h4>
                      {mission.status === 'completed' ? (
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                      ) : mission.status === 'locked' ? (
                        <Lock className="w-4 h-4 text-[#666677]" />
                      ) : (
                        <span className={`text-[10px] font-bold uppercase ${getDifficultyColor(mission.difficulty)}`}>
                          {mission.difficulty}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-[#888899] mb-3 line-clamp-2">{mission.description}</p>

                    {mission.status !== 'locked' && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-[10px] uppercase font-bold text-[#666677]">
                          <span>Progressi</span>
                          <span>{Math.round((mission.objectives[0].current / mission.objectives[0].target) * 100)}%</span>
                        </div>
                        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-purple-500"
                            style={{ width: `${(mission.objectives[0].current / mission.objectives[0].target) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </PageContent>
    </PageWrapper>
  );
}