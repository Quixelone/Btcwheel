/**
 * Core Card Components - BTC Wheel Pro 2.0
 * 
 * Card system coerente per tutta l'app:
 * - BaseCard: Card base con stile Dark Neon
 * - ActionCard: Card cliccabile con freccia
 * - StatCard: Card per statistiche
 * - InfoCard: Card informativa con icona
 * - ProgressCard: Card con barra progresso
 */

import { motion } from 'motion/react';
import { ArrowRight, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

// ============================================
// BASE CARD
// ============================================

interface BaseCardProps {
    children: ReactNode;
    className?: string;
    onClick?: () => void;
    noPadding?: boolean;
    variant?: 'default' | 'highlighted' | 'glass';
}

export function BaseCard({
    children,
    className = '',
    onClick,
    noPadding = false,
    variant = 'default'
}: BaseCardProps) {
    const baseStyles = `
    bg-[#0A0A0C] border border-white/[0.08] rounded-[24px] overflow-hidden
    ${!noPadding ? 'p-6' : ''}
    ${onClick ? 'cursor-pointer hover:border-white/[0.15] hover:-translate-y-0.5 transition-all duration-300' : ''}
    ${variant === 'highlighted' ? 'border-purple-500/30 shadow-[0_0_30px_-10px_rgba(168,85,247,0.2)]' : ''}
    ${variant === 'glass' ? 'bg-white/[0.02] backdrop-blur-xl' : ''}
    ${className}
  `;

    const content = <div className={baseStyles}>{children}</div>;

    if (onClick) {
        return (
            <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={onClick}
            >
                {content}
            </motion.div>
        );
    }

    return content;
}

// ============================================
// ACTION CARD
// ============================================

interface ActionCardProps {
    title: string;
    description?: string;
    icon: LucideIcon;
    iconColor?: string;
    iconBg?: string;
    onClick: () => void;
    badge?: string;
    badgeColor?: string;
}

export function ActionCard({
    title,
    description,
    icon: Icon,
    iconColor = 'text-purple-400',
    iconBg = 'bg-purple-500/10',
    onClick,
    badge,
    badgeColor = 'text-purple-400 bg-purple-500/10',
}: ActionCardProps) {
    return (
        <motion.button
            onClick={onClick}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="w-full text-left bg-[#0A0A0C] border border-white/[0.08] rounded-[24px] p-6 hover:border-white/[0.15] transition-all duration-300 group"
        >
            <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-2xl ${iconBg} border border-white/[0.05] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-6 h-6 ${iconColor}`} />
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base font-bold text-white truncate">{title}</h3>
                        {badge && (
                            <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${badgeColor}`}>
                                {badge}
                            </span>
                        )}
                    </div>
                    {description && (
                        <p className="text-sm text-[#666677] leading-relaxed">{description}</p>
                    )}
                </div>

                <ArrowRight className="w-5 h-5 text-[#444455] group-hover:text-white group-hover:translate-x-1 transition-all shrink-0 mt-3" />
            </div>
        </motion.button>
    );
}

// ============================================
// STAT CARD (Reimplementato)
// ============================================

interface StatCardProps {
    label: string;
    value: string | number;
    icon: LucideIcon;
    color?: 'purple' | 'cyan' | 'green' | 'yellow' | 'orange' | 'red';
    trend?: { value: number; positive: boolean };
    subtitle?: string;
    delay?: number;
}

const colorMap = {
    purple: { text: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
    cyan: { text: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
    green: { text: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20' },
    yellow: { text: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
    orange: { text: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
    red: { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
};

export function StatCard({
    label,
    value,
    icon: Icon,
    color = 'purple',
    trend,
    subtitle,
    delay = 0
}: StatCardProps) {
    const colors = colorMap[color];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.5 }}
            className="bg-[#0A0A0C] border border-white/[0.08] rounded-[20px] p-5"
        >
            <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl ${colors.bg} ${colors.border} border flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${colors.text}`} />
                </div>
                {trend && (
                    <span className={`text-xs font-bold ${trend.positive ? 'text-green-400' : 'text-red-400'}`}>
                        {trend.positive ? '+' : ''}{trend.value}%
                    </span>
                )}
            </div>

            <div className="text-2xl font-bold text-white tracking-tight mb-1">
                {value}
            </div>

            <div className="text-[10px] font-bold text-[#666677] uppercase tracking-wider">
                {label}
            </div>

            {subtitle && (
                <div className="text-xs text-[#888899] mt-2">{subtitle}</div>
            )}
        </motion.div>
    );
}

// ============================================
// INFO CARD
// ============================================

interface InfoCardProps {
    title: string;
    content: ReactNode;
    icon: LucideIcon;
    iconColor?: string;
    variant?: 'default' | 'success' | 'warning' | 'error';
}

const variantStyles = {
    default: { border: 'border-white/[0.08]', iconBg: 'bg-white/[0.05]', iconColor: 'text-white' },
    success: { border: 'border-green-500/20', iconBg: 'bg-green-500/10', iconColor: 'text-green-400' },
    warning: { border: 'border-yellow-500/20', iconBg: 'bg-yellow-500/10', iconColor: 'text-yellow-400' },
    error: { border: 'border-red-500/20', iconBg: 'bg-red-500/10', iconColor: 'text-red-400' },
};

export function InfoCard({
    title,
    content,
    icon: Icon,
    iconColor,
    variant = 'default'
}: InfoCardProps) {
    const styles = variantStyles[variant];

    return (
        <div className={`bg-[#0A0A0C] border ${styles.border} rounded-[20px] p-5`}>
            <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-xl ${styles.iconBg} flex items-center justify-center shrink-0`}>
                    <Icon className={`w-5 h-5 ${iconColor || styles.iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-white mb-2">{title}</h4>
                    <div className="text-sm text-[#888899] leading-relaxed">{content}</div>
                </div>
            </div>
        </div>
    );
}

// ============================================
// PROGRESS CARD
// ============================================

interface ProgressCardProps {
    title: string;
    subtitle?: string;
    progress: number; // 0-100
    progressLabel?: string;
    color?: 'purple' | 'cyan' | 'green' | 'yellow' | 'orange';
    icon?: LucideIcon;
    children?: ReactNode;
}

export function ProgressCard({
    title,
    subtitle,
    progress,
    progressLabel,
    color = 'purple',
    icon: Icon,
    children,
}: ProgressCardProps) {
    const colors = colorMap[color];

    return (
        <div className="bg-[#0A0A0C] border border-white/[0.08] rounded-[24px] p-6">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h3 className="text-lg font-bold text-white">{title}</h3>
                    {subtitle && (
                        <p className="text-sm text-[#666677] mt-1">{subtitle}</p>
                    )}
                </div>
                {Icon && (
                    <div className={`w-10 h-10 rounded-xl ${colors.bg} ${colors.border} border flex items-center justify-center`}>
                        <Icon className={`w-5 h-5 ${colors.text}`} />
                    </div>
                )}
            </div>

            {/* Progress Bar */}
            <div className="space-y-2 mb-4">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                    <span className="text-[#666677]">Progresso</span>
                    <span className="text-white">{progressLabel || `${Math.round(progress)}%`}</span>
                </div>
                <div className="h-2 bg-[#050506] rounded-full overflow-hidden border border-white/[0.05]">
                    <motion.div
                        className={`h-full rounded-full ${color === 'purple' ? 'bg-gradient-to-r from-purple-600 to-indigo-600' :
                                color === 'cyan' ? 'bg-gradient-to-r from-cyan-600 to-blue-600' :
                                    color === 'green' ? 'bg-gradient-to-r from-green-600 to-emerald-600' :
                                        color === 'yellow' ? 'bg-gradient-to-r from-yellow-600 to-amber-600' :
                                            'bg-gradient-to-r from-orange-600 to-red-600'
                            }`}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                    />
                </div>
            </div>

            {children}
        </div>
    );
}

// ============================================
// COMPOUND VISION CARD (Speciale per Home)
// ============================================

interface CompoundVisionCardProps {
    objectiveName: string;
    objectiveIcon?: string;
    targetDate: string;
    targetAmount: number;
    currentProjection: number;
    progressPercent: number;
    streakWeeks: number;
    onEdit?: () => void;
}

export function CompoundVisionCard({
    objectiveName,
    objectiveIcon = '🎯',
    targetDate,
    targetAmount,
    currentProjection,
    progressPercent,
    streakWeeks,
    onEdit,
}: CompoundVisionCardProps) {
    const isAhead = currentProjection >= targetAmount;

    return (
        <div className="relative overflow-hidden bg-[#0A0A0C] border border-white/[0.08] rounded-[32px] p-8 shadow-2xl">
            {/* Ambient Glow */}
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none" />

            <div className="relative z-10">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">{objectiveIcon}</span>
                        <div>
                            <h2 className="text-xl font-bold text-white">{objectiveName}</h2>
                            <p className="text-xs text-[#666677] mt-0.5">Obiettivo: {targetDate}</p>
                        </div>
                    </div>
                    {onEdit && (
                        <button
                            onClick={onEdit}
                            className="text-[10px] font-bold uppercase tracking-wider text-[#666677] hover:text-purple-400 transition-colors"
                        >
                            Modifica
                        </button>
                    )}
                </div>

                {/* Projection */}
                <div className="mb-8">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[#666677] mb-2">
                        Proiezione attuale
                    </div>
                    <div className="flex items-baseline gap-3">
                        <span className={`text-4xl font-bold tracking-tight ${isAhead ? 'text-green-400' : 'text-yellow-400'}`}>
                            €{currentProjection.toLocaleString()}
                        </span>
                        <span className={`text-sm font-bold ${isAhead ? 'text-green-400' : 'text-yellow-400'}`}>
                            {isAhead ? '✓ In anticipo!' : '⚠️ Da recuperare'}
                        </span>
                    </div>
                    <p className="text-sm text-[#888899] mt-2">
                        Obiettivo: €{targetAmount.toLocaleString()}
                    </p>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2 mb-6">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                        <span className="text-[#666677]">Avanzamento</span>
                        <span className="text-white">{Math.round(progressPercent)}%</span>
                    </div>
                    <div className="h-3 bg-[#050506] rounded-full overflow-hidden border border-white/[0.05]">
                        <motion.div
                            className="h-full bg-gradient-to-r from-purple-600 to-green-500 shadow-[0_0_20px_rgba(147,51,234,0.4)]"
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercent}%` }}
                            transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                        />
                    </div>
                </div>

                {/* Streak */}
                <div className="flex items-center gap-2 text-sm">
                    <span className="text-orange-400">🔥</span>
                    <span className="font-bold text-white">{streakWeeks} settimane</span>
                    <span className="text-[#666677]">di seguito</span>
                </div>
            </div>
        </div>
    );
}
