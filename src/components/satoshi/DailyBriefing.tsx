import { motion } from 'motion/react';
import {
    Clock,
    Target,
    TrendingUp,
    TrendingDown,
    Lightbulb,
    CheckCircle2,
    ArrowRight,
    AlertTriangle,
    MessageSquare,
    BookOpen
} from 'lucide-react';
import { BaseCard } from '../ui/cards';
import { BriefingData } from '../../types/satoshi';
import { View } from '../../types/navigation';

interface DailyBriefingProps {
    data: BriefingData;
    onNavigate: (view: View, params?: any) => void;
}

export function DailyBriefing({ data, onNavigate }: DailyBriefingProps) {
    return (
        <div className="space-y-8">
            {/* Header */}
            <motion.header
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-purple-400 mb-2">
                    <Clock className="w-3.5 h-3.5" />
                    Aggiornato alle {data.time} • {data.date}
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                    Daily Briefing 📊
                </h1>
                <p className="text-[#888899] mt-2">
                    BTC: <span className="text-white font-bold">${data.btcPrice.toLocaleString()}</span>
                </p>
            </motion.header>

            {/* STEP 1: COSA FARE OGGI */}
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
            >
                <BaseCard variant="highlighted" className="border-2 border-green-500/30 bg-green-500/5">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                            <Target className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                            <div className="text-[10px] font-bold uppercase tracking-wider text-green-400">
                                Step 1 • Cosa Fare Oggi
                            </div>
                            <h2 className="text-2xl font-black text-white">
                                {data.action}
                            </h2>
                        </div>
                    </div>

                    <div className="bg-slate-900/50 rounded-2xl p-6 space-y-4">
                        <div className="flex items-center gap-3">
                            {data.bias.direction === 'bullish' ? (
                                <TrendingUp className="w-6 h-6 text-green-400" />
                            ) : data.bias.direction === 'bearish' ? (
                                <TrendingDown className="w-6 h-6 text-red-400" />
                            ) : (
                                <TrendingUp className="w-6 h-6 text-yellow-400" />
                            )}
                            <span className="text-lg font-bold text-white">
                                Il mercato è <span className={
                                    data.bias.direction === 'bullish' ? 'text-green-400' :
                                        data.bias.direction === 'bearish' ? 'text-red-400' : 'text-yellow-400'
                                }>
                                    {data.bias.direction === 'bullish' ? 'RIALZISTA (Bullish)' :
                                        data.bias.direction === 'bearish' ? 'RIBASSISTA (Bearish)' : 'NEUTRALE'}
                                </span>
                            </span>
                        </div>

                        <p className="text-[#888899] leading-relaxed">
                            {data.bias.summary}
                        </p>

                        <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                            <p className="text-sm text-slate-300">
                                {data.bias.direction === 'bullish' || data.bias.direction === 'neutral' ? (
                                    <>
                                        Consiglio: Vendiamo una <strong className="text-white">PUT</strong>.
                                        Se il prezzo <strong className="text-green-400">sale o resta stabile</strong>, incassi il premium come profitto.
                                    </>
                                ) : (
                                    <>
                                        Consiglio: Il mercato è debole. Considera di vendere una <strong className="text-white">CALL</strong> (se hai BTC) o attendi.
                                    </>
                                )}
                            </p>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-[#666677]">
                            <Lightbulb className="w-4 h-4 text-yellow-400" />
                            <span>Confidenza analisi: <strong className="text-white">{data.bias.confidence}%</strong></span>
                        </div>
                    </div>
                </BaseCard>
            </motion.div>

            {/* STEP 2: SCEGLI LO STRIKE */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                        <span className="text-lg font-bold text-purple-400">2</span>
                    </div>
                    <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
                            Step 2 • Scegli lo Strike
                        </div>
                        <h2 className="text-xl font-bold text-white">Quale rischio vuoi prendere?</h2>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                    {data.strikes.map((strike, index) => {
                        const isRecommended = strike.price === data.recommendedStrike;
                        const riskColors = {
                            low: { border: 'border-green-500/30', bg: 'bg-green-500/5', text: 'text-green-400' },
                            medium: { border: 'border-yellow-500/30', bg: 'bg-yellow-500/5', text: 'text-yellow-400' },
                            high: { border: 'border-red-500/30', bg: 'bg-red-500/5', text: 'text-red-400' },
                        };
                        const colors = riskColors[strike.risk];

                        return (
                            <motion.div
                                key={strike.level}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 + index * 0.1 }}
                            >
                                <BaseCard
                                    className={`h-full ${isRecommended ? `${colors.border} border-2 ${colors.bg}` : ''}`}
                                >
                                    {isRecommended && (
                                        <div className={`mb-4 px-3 py-1.5 rounded-xl ${colors.bg} ${colors.text} text-[10px] font-bold uppercase tracking-wider inline-block`}>
                                            ⭐ Consigliato per te
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-2xl">{strike.emoji}</span>
                                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg ${colors.bg} ${colors.text}`}>
                                            {strike.level}
                                        </span>
                                    </div>

                                    <div className="text-3xl font-black text-white mb-2">
                                        ${strike.price.toLocaleString()}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <div className="text-[10px] font-bold text-[#666677] uppercase tracking-wider">Premium</div>
                                            <div className="text-lg font-bold text-green-400">+{strike.premium.toFixed(2)}%</div>
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-bold text-[#666677] uppercase tracking-wider">Distanza</div>
                                            <div className="text-lg font-bold text-white">{strike.distancePercent}%</div>
                                        </div>
                                    </div>

                                    <p className="text-xs text-[#888899] leading-relaxed">
                                        {strike.description}
                                    </p>
                                </BaseCard>
                            </motion.div>
                        );
                    })}
                </div>
            </motion.section>

            {/* STEP 3: COME ESEGUIRE L'ORDINE */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
            >
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                        <span className="text-lg font-bold text-cyan-400">3</span>
                    </div>
                    <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                            Step 3 • Come Eseguire l'Ordine
                        </div>
                        <h2 className="text-xl font-bold text-white">Istruzioni passo-passo</h2>
                    </div>
                </div>

                <BaseCard>
                    <div className="space-y-6">
                        {/* Step 3.1 */}
                        <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center shrink-0">
                                <span className="text-sm font-bold text-cyan-400">1</span>
                            </div>
                            <div>
                                <h4 className="font-bold text-white mb-1">Vai sul tuo Exchange</h4>
                                <p className="text-sm text-[#888899]">
                                    Apri Deribit, OKX o l'exchange che usi per le opzioni BTC con scadenza giornaliera (0DTE).
                                </p>
                            </div>
                        </div>

                        {/* Step 3.2 */}
                        <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center shrink-0">
                                <span className="text-sm font-bold text-cyan-400">2</span>
                            </div>
                            <div>
                                <h4 className="font-bold text-white mb-1">Seleziona {data.action}</h4>
                                <p className="text-sm text-[#888899]">
                                    {data.action === 'VENDI PUT' ? (
                                        <>Cerca l'opzione <strong className="text-white">PUT</strong> con scadenza <strong className="text-white">OGGI</strong> (0DTE).</>
                                    ) : (
                                        <>Cerca l'opzione <strong className="text-white">CALL</strong> con scadenza <strong className="text-white">OGGI</strong> (0DTE).</>
                                    )}
                                </p>
                            </div>
                        </div>

                        {/* Step 3.3 */}
                        <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center shrink-0">
                                <span className="text-sm font-bold text-cyan-400">3</span>
                            </div>
                            <div>
                                <h4 className="font-bold text-white mb-1">Imposta lo Strike</h4>
                                <p className="text-sm text-[#888899]">
                                    Scegli lo strike che hai selezionato: <strong className="text-green-400">${data.recommendedStrike.toLocaleString()}</strong> (consigliato per te)
                                </p>
                            </div>
                        </div>

                        {/* Step 3.4 */}
                        <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                                <CheckCircle2 className="w-4 h-4 text-green-400" />
                            </div>
                            <div>
                                <h4 className="font-bold text-white mb-1">Conferma e Registra</h4>
                                <p className="text-sm text-[#888899]">
                                    Esegui l'ordine, poi <strong className="text-white">registra l'operazione</strong> nell'app per tracciare i tuoi profitti.
                                </p>
                                <button
                                    onClick={() => {
                                        const recommendedOption = data.strikes.find(s => s.price === data.recommendedStrike);
                                        const estimatedPremium = recommendedOption
                                            ? Math.floor(data.btcPrice * recommendedOption.premium / 100)
                                            : undefined;

                                        onNavigate('trade-journal', {
                                            tradeData: {
                                                type: data.action === 'VENDI PUT' ? 'PUT' : 'CALL',
                                                strike: data.recommendedStrike,
                                                premium: estimatedPremium,
                                                action: data.action
                                            }
                                        });
                                    }}
                                    className="mt-3 flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white text-sm font-bold rounded-xl transition-colors"
                                >
                                    Registra Operazione <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </BaseCard>
            </motion.div>

            {/* Info Box: Cosa succede alla scadenza */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
            >
                <BaseCard className="border-amber-500/20">
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                            <AlertTriangle className="w-5 h-5 text-amber-400" />
                        </div>
                        <div>
                            <h4 className="font-bold text-white mb-2">Cosa succede alla scadenza?</h4>
                            <div className="space-y-3 text-sm text-[#888899]">
                                <p>
                                    <CheckCircle2 className="w-4 h-4 inline text-green-400 mr-2" />
                                    <strong className="text-green-400">Se BTC resta {data.action === 'VENDI PUT' ? 'SOPRA' : 'SOTTO'} lo strike:</strong> L'opzione scade senza valore.
                                    <span className="text-white"> Tieni il premium come profitto!</span>
                                </p>
                                <p>
                                    <AlertTriangle className="w-4 h-4 inline text-amber-400 mr-2" />
                                    <strong className="text-amber-400">Se BTC va {data.action === 'VENDI PUT' ? 'SOTTO' : 'SOPRA'} lo strike:</strong> Vieni assegnato.
                                    <span className="text-white"> {data.action === 'VENDI PUT' ? 'Acquisti BTC' : 'Vendi BTC'} allo strike scelto.</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </BaseCard>
            </motion.div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 gap-4">
                <BaseCard onClick={() => onNavigate('satoshi-chat')} className="group cursor-pointer hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                            <MessageSquare className="w-6 h-6 text-purple-400" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-white">Ho una domanda</h3>
                            <p className="text-sm text-[#666677]">Chatta con Prof Satoshi</p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-[#444455] group-hover:text-white transition-colors" />
                    </div>
                </BaseCard>

                <BaseCard onClick={() => onNavigate('academy')} className="group cursor-pointer hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                            <BookOpen className="w-6 h-6 text-cyan-400" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-white">Impara di più</h3>
                            <p className="text-sm text-[#666677]">Vai al corso Academy</p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-[#444455] group-hover:text-white transition-colors" />
                    </div>
                </BaseCard>
            </div>
        </div>
    );
}
