import { motion } from 'motion/react';
import type { ReactNode } from 'react';

/**
 * PageWrapper - Wrapper standard per tutte le pagine (Dark Neon Edition)
 */

interface PageWrapperProps {
    children: ReactNode;
    className?: string;
}

export function PageWrapper({ children, className = '' }: PageWrapperProps) {
    return (
        <div className={`min-h-screen md:pl-24 bg-[#030305] text-white overflow-x-hidden ${className}`}>
            {/* Ambient Background Lights */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                {/* Top Right Purple Glow */}
                <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-purple-600/5 rounded-full blur-[120px]" />

                {/* Bottom Left Blue Glow */}
                <div className="absolute bottom-[-20%] left-[-10%] w-[800px] h-[800px] bg-blue-600/5 rounded-full blur-[120px]" />

                {/* Center Subtle Highlight */}
                <div className="absolute top-[40%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/[0.01] rounded-full blur-[100px]" />

                {/* Noise Texture (Optional for texture) */}
                <div className="absolute inset-0 opacity-[0.015] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-100 contrast-150" />
            </div>

            {/* Content */}
            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
}

/**
 * PageContent - Container per il contenuto principale
 */
interface PageContentProps {
    children: ReactNode;
    className?: string;
}

export function PageContent({ children, className = '' }: PageContentProps) {
    return (
        <div className={`max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12 py-10 md:py-14 pb-32 md:pb-20 space-y-12 ${className}`}>
            {children}
        </div>
    );
}

/**
 * PageHeader - Header standard per pagine
 */
interface PageHeaderProps {
    title: string;
    subtitle?: string;
    badge?: ReactNode;
    actions?: ReactNode;
}

export function PageHeader({ title, subtitle, badge, actions }: PageHeaderProps) {
    return (
        <motion.header
            className="flex flex-col lg:flex-row lg:items-end justify-between gap-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
            <div className="space-y-4 max-w-2xl">
                {badge && <div>{badge}</div>}
                <div>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tighter leading-[1.1]">
                        {title}
                    </h1>
                    {subtitle && (
                        <p className="text-[#888899] text-lg md:text-xl mt-4 leading-relaxed font-medium">
                            {subtitle}
                        </p>
                    )}
                </div>
            </div>
            {actions && (
                <div className="flex items-center gap-4 flex-wrap">
                    {actions}
                </div>
            )}
        </motion.header>
    );
}

/**
 * SectionHeader - Header per sezioni interne
 */
interface SectionHeaderProps {
    title: string;
    subtitle?: string;
    actions?: ReactNode;
}

export function SectionHeader({ title, subtitle, actions }: SectionHeaderProps) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 border-b border-white/[0.05]">
            <div>
                <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">{title}</h2>
                {subtitle && (
                    <p className="text-[#888899] text-base mt-2">{subtitle}</p>
                )}
            </div>
            {actions && <div className="flex items-center gap-3">{actions}</div>}
        </div>
    );
}
