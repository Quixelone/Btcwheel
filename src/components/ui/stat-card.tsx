import { motion } from 'motion/react';
import type { LucideIcon } from 'lucide-react';

/**
 * StatCard - Dark Neon Edition
 */

interface StatCardProps {
    label: string;
    value: string | number;
    icon: LucideIcon;
    color: 'purple' | 'green' | 'cyan' | 'pink' | 'orange' | 'yellow';
    delay?: number;
}

const colors = {
    purple: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20', glow: 'shadow-[0_0_20px_-5px_rgba(168,85,247,0.3)]' },
    green: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', glow: 'shadow-[0_0_20px_-5px_rgba(16,185,129,0.3)]' },
    cyan: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/20', glow: 'shadow-[0_0_20px_-5px_rgba(6,182,212,0.3)]' },
    pink: { bg: 'bg-pink-500/10', text: 'text-pink-400', border: 'border-pink-500/20', glow: 'shadow-[0_0_20px_-5px_rgba(236,72,153,0.3)]' },
    orange: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20', glow: 'shadow-[0_0_20px_-5px_rgba(249,115,22,0.3)]' },
    yellow: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/20', glow: 'shadow-[0_0_20px_-5px_rgba(234,179,8,0.3)]' }
};

export function StatCard({ label, value, icon: Icon, color, delay = 0 }: StatCardProps) {
    const theme = colors[color];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
            <div className={`
        relative overflow-hidden
        bg-[#0A0A0C] border border-white/[0.08] 
        rounded-[24px] p-6 h-full
        hover:border-white/[0.15] transition-all duration-300
        group
      `}>
                {/* Hover Glow Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br from-${color}-500/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                <div className="relative z-10 flex flex-col h-full justify-between">
                    <div className="flex justify-between items-start mb-4">
                        <div className={`
              w-12 h-12 rounded-2xl flex items-center justify-center
              ${theme.bg} ${theme.border} border
              ${theme.text}
              group-hover:scale-110 transition-transform duration-300
            `}>
                            <Icon className="w-6 h-6" />
                        </div>

                        {/* Optional Trend Indicator could go here */}
                    </div>

                    <div>
                        <p className="text-3xl font-bold text-white tracking-tight mb-1">{value}</p>
                        <p className="text-xs font-medium text-[#666677] uppercase tracking-wider">{label}</p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

/**
 * StatCardSmall - Compact version
 */
interface StatCardSmallProps {
    label: string;
    value: string | number;
    icon: LucideIcon;
    color: 'purple' | 'green' | 'cyan' | 'pink' | 'orange' | 'yellow';
}

export function StatCardSmall({ label, value, icon: Icon, color }: StatCardSmallProps) {
    const theme = colors[color];

    return (
        <div className="flex items-center gap-4 bg-[#0A0A0C] border border-white/[0.08] px-5 py-3 rounded-2xl hover:border-white/[0.15] transition-colors">
            <div className={`
        w-10 h-10 rounded-xl flex items-center justify-center
        ${theme.bg} ${theme.border} border
        ${theme.text}
      `}>
                <Icon className="w-5 h-5" />
            </div>
            <div>
                <p className="text-xl font-bold text-white tracking-tight leading-none mb-1">{value}</p>
                <p className="text-[10px] font-bold text-[#666677] uppercase tracking-wider">{label}</p>
            </div>
        </div>
    );
}
