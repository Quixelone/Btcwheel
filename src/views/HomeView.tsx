/**
 * HomeView - BTC Wheel Pro 2.0
 * 
 * Dashboard principale con:
 * - Compound Vision (obiettivo + proiezione)
 * - Daily Briefing Preview
 * - Quick Stats
 * - Next Action
 * - Weekly Review (domenica)
 */

import { motion } from 'motion/react';
import {
    TrendingUp,
    Calendar,
    Flame,
    Target,
    ArrowRight,
    Bot,
    BookOpen,
    Wallet,
    Clock,
    PlusCircle,
    Link2
} from 'lucide-react';
import type { View } from '../types/navigation';
import { PageWrapper, PageContent } from '../components/layout/PageWrapper';
import { StatCard, ActionCard, BaseCard } from '../components/ui/cards';
import { useAuth } from '../hooks/useAuth';
import { useUserProgress } from '../hooks/useUserProgress';
import { ActivePlanProgress } from '../components/ActivePlanProgress';
import { BTCAccumulatorCard } from '../components/BTCAccumulatorCard';
import { PACTrackerCard } from '../components/PACTrackerCard';
import { BestDealsCompact } from '../components/BestDealsCard';

interface HomeViewProps {
    currentView: View;
    onNavigate: (view: View) => void;
}

export function HomeView({ currentView, onNavigate }: HomeViewProps) {
    const { user } = useAuth();
    const { progress } = useUserProgress();

    const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'Costruttore';

    const mockDailyBriefing = {
        available: true,
        bias: 'bullish' as const,
        summary: 'Sentiment positivo, 3 strike disponibili',
        lastUpdate: '08:30',
    };

    const mockStats = {
        capitale: '€4,230',
        settimana: '+€127',
        streak: progress.streak || 0,
        pac: 'Fatto ✓',
    };

    // Check se è domenica (Weekly Review)
    const isWeeklyReview = currentView === 'weekly-review' || new Date().getDay() === 0;

    return (
        <PageWrapper>
            <PageContent>
                {/* Header */}
                <motion.header
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8"
                >
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-purple-400 mb-2">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date().toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                        {isWeeklyReview ? 'Weekly Review 📊' : `Ciao, ${userName}`}
                    </h1>
                    <p className="text-[#888899] text-base mt-2">
                        {isWeeklyReview
                            ? 'Ecco come è andata questa settimana'
                            : 'Ecco la tua situazione di oggi'
                        }
                    </p>
                </motion.header>

                {/* Piano Attivo con dati reali */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    <ActivePlanProgress onNavigate={onNavigate} />
                </motion.div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        label="Capitale"
                        value={mockStats.capitale}
                        icon={Wallet}
                        color="purple"
                        delay={0.2}
                    />
                    <StatCard
                        label="Settimana"
                        value={mockStats.settimana}
                        icon={TrendingUp}
                        color="green"
                        trend={{ value: 3.1, positive: true }}
                        delay={0.25}
                    />
                    <StatCard
                        label="Streak"
                        value={`${mockStats.streak} sett`}
                        icon={Flame}
                        color="orange"
                        delay={0.3}
                    />
                    <StatCard
                        label="PAC"
                        value={mockStats.pac}
                        icon={Calendar}
                        color="cyan"
                        delay={0.35}
                    />
                </div>

                {/* BTC Accumulator & PAC Tracker - Side by Side on Desktop */}
                <div className="grid md:grid-cols-2 gap-4">
                    <BTCAccumulatorCard />
                    <PACTrackerCard weeklyTarget={100} />
                </div>

                {/* Best Deals - Premium Feature */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                >
                    <BestDealsCompact onViewAll={() => onNavigate('best-deals')} />
                </motion.div>

                {/* Daily Briefing Preview */}
                {mockDailyBriefing.available && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <BaseCard
                            onClick={() => onNavigate('satoshi')}
                            className="group"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-purple-500/20 flex items-center justify-center">
                                        <Bot className="w-7 h-7 text-purple-400" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="text-lg font-bold text-white">Daily Briefing</h3>
                                            <span className={`
                        text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full
                        ${mockDailyBriefing.bias === 'bullish'
                                                    ? 'bg-green-500/10 text-green-400'
                                                    : mockDailyBriefing.bias === 'bearish'
                                                        ? 'bg-red-500/10 text-red-400'
                                                        : 'bg-yellow-500/10 text-yellow-400'
                                                }
                      `}>
                                                {mockDailyBriefing.bias === 'bullish' ? '🟢 Bullish' :
                                                    mockDailyBriefing.bias === 'bearish' ? '🔴 Bearish' : '🟡 Neutral'}
                                            </span>
                                        </div>
                                        <p className="text-sm text-[#888899]">{mockDailyBriefing.summary}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-[10px] font-medium text-[#666677] hidden sm:block">
                                        Aggiornato alle {mockDailyBriefing.lastUpdate}
                                    </span>
                                    <ArrowRight className="w-5 h-5 text-[#444455] group-hover:text-white group-hover:translate-x-1 transition-all" />
                                </div>
                            </div>
                        </BaseCard>
                    </motion.div>
                )}

                {/* Quick Actions */}
                <section>
                    <h2 className="text-xl font-bold text-white mb-4">Azioni rapide</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <ActionCard
                            title="Crea il tuo Piano"
                            description="Simula la crescita del capitale"
                            icon={Target}
                            iconColor="text-green-400"
                            iconBg="bg-green-500/10"
                            onClick={() => onNavigate('longterm')}
                            badge="Importante"
                            badgeColor="text-green-400 bg-green-500/10"
                        />
                        <ActionCard
                            title="Trade Journal"
                            description="Registra e monitora le operazioni"
                            icon={PlusCircle}
                            iconColor="text-cyan-400"
                            iconBg="bg-cyan-500/10"
                            onClick={() => onNavigate('trade-journal')}
                        />
                        <ActionCard
                            title="Continua il Corso"
                            description={`Lezione ${progress.currentLesson || 1} ti aspetta`}
                            icon={BookOpen}
                            iconColor="text-purple-400"
                            iconBg="bg-purple-500/10"
                            onClick={() => onNavigate('academy')}
                        />
                        <ActionCard
                            title="Parla con Satoshi"
                            description="Fai una domanda al tuo tutor AI"
                            icon={Bot}
                            iconColor="text-yellow-400"
                            iconBg="bg-yellow-500/10"
                            onClick={() => onNavigate('satoshi-chat')}
                        />
                        <ActionCard
                            title="Collega Exchange"
                            description="Connetti Pionex per import dati"
                            icon={Link2}
                            iconColor="text-blue-400"
                            iconBg="bg-blue-500/10"
                            onClick={() => onNavigate('exchange-connect')}
                            badge="Nuovo"
                            badgeColor="text-blue-400 bg-blue-500/10"
                        />
                    </div>
                </section>

                {/* Next Action / What to do */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <BaseCard variant="highlighted">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
                                <Target className="w-6 h-6 text-purple-400" />
                            </div>
                            <div className="flex-1">
                                <div className="text-[10px] font-bold uppercase tracking-wider text-purple-400 mb-1">
                                    Prossima azione consigliata
                                </div>
                                <h3 className="text-base font-bold text-white">
                                    Completa la lezione settimanale
                                </h3>
                                <p className="text-sm text-[#888899] mt-1">
                                    Ti manca la lezione di mercoledì per mantenere lo streak
                                </p>
                            </div>
                            <button
                                onClick={() => onNavigate('lesson')}
                                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold rounded-xl transition-all hover:scale-105"
                            >
                                Inizia
                            </button>
                        </div>
                    </BaseCard>
                </motion.div>
            </PageContent>
        </PageWrapper>
    );
}

export default HomeView;
