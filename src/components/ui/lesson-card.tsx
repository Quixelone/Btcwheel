import { motion } from 'motion/react';
import { Check, Play, Lock, Zap, ArrowRight } from 'lucide-react';

/**
 * LessonCard - Dark Neon Edition
 */

interface LessonCardProps {
    id: number;
    title: string;
    category: string;
    xp: number;
    status: 'completed' | 'current' | 'locked';
    onClick?: () => void;
    delay?: number;
}

const categoryColors: Record<string, { bg: string, text: string, border: string }> = {
    'Fondamenti': { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/20' },
    'Strategie Base': { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
    'Risk Management': { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20' },
    'Analisi Tecnica': { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
    'Strategie Avanzate': { bg: 'bg-pink-500/10', text: 'text-pink-400', border: 'border-pink-500/20' },
    'Psicologia': { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/20' },
    'Portfolio Management': { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/20' },
    'Analisi Mercato': { bg: 'bg-teal-500/10', text: 'text-teal-400', border: 'border-teal-500/20' },
};

export function LessonCard({ id, title, category, xp, status, onClick, delay = 0 }: LessonCardProps) {
    const isCompleted = status === 'completed';
    const isCurrent = status === 'current';
    const isLocked = status === 'locked';

    const theme = categoryColors[category] || { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/20' };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
            <div
                onClick={!isLocked ? onClick : undefined}
                className={`
          relative overflow-hidden
          bg-[#0A0A0C] border 
          ${isCurrent ? 'border-purple-500/40 shadow-[0_0_30px_-10px_rgba(168,85,247,0.15)]' : 'border-white/[0.08]'}
          rounded-[24px] p-6 h-full
          ${!isLocked ? 'cursor-pointer hover:border-white/[0.15] hover:-translate-y-1' : 'opacity-50 cursor-not-allowed'}
          transition-all duration-300
          group
        `}
            >
                {/* Current Glow */}
                {isCurrent && (
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-[40px] -mr-16 -mt-16 pointer-events-none" />
                )}

                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                    <span className={`
            inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider
            ${theme.bg} ${theme.text} border ${theme.border}
          `}>
                        {category}
                    </span>

                    <div className={`
            w-10 h-10 rounded-xl flex items-center justify-center border
            ${isCompleted ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                            isCurrent ? 'bg-purple-500/10 border-purple-500/20 text-purple-400' :
                                'bg-white/[0.03] border-white/[0.05] text-[#666677]'}
          `}>
                        {isCompleted ? <Check className="w-5 h-5" /> :
                            isCurrent ? <Play className="w-5 h-5 fill-current" /> :
                                <Lock className="w-5 h-5" />}
                    </div>
                </div>

                {/* Content */}
                <div className="mb-6">
                    <p className="text-[10px] font-bold text-[#666677] uppercase tracking-wider mb-2">Lezione {id < 10 ? `0${id}` : id}</p>
                    <h3 className={`text-lg font-bold leading-snug ${isLocked ? 'text-[#888899]' : 'text-white'}`}>
                        {title}
                    </h3>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-white/[0.05]">
                    <div className="flex items-center gap-2">
                        <Zap className={`w-4 h-4 ${isLocked ? 'text-[#666677]' : 'text-yellow-400'}`} />
                        <span className={`text-xs font-bold ${isLocked ? 'text-[#666677]' : 'text-yellow-400'}`}>+{xp} XP</span>
                    </div>

                    {isCurrent && (
                        <div className="flex items-center gap-2 text-xs font-bold text-purple-400">
                            Inizia <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
