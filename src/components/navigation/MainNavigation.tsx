/**
 * MainNavigation - BTC Wheel Pro 2.0
 * 
 * Navigazione principale a 5 sezioni:
 * - Desktop: Sidebar sinistra minimale
 * - Mobile: Bottom navigation bar
 * 
 * Design: Dark Neon Edition
 */

import { Home, TrendingUp, Bot, GraduationCap, User, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import type { View, MainSection } from '../../types/navigation';
import { getMainSection, MAIN_NAV_ITEMS } from '../../types/navigation';
import { MASCOT_FALLBACK } from '../../lib/mascot-images';

const btcwheelLogo = MASCOT_FALLBACK.logo;

// Icon mapping
const iconMap = {
    Home,
    TrendingUp,
    Bot,
    GraduationCap,
    User,
};

interface MainNavigationProps {
    currentView: View;
    onNavigate: (view: View) => void;
    mascotVisible?: boolean;
    onMascotShow?: () => void;
}

export function MainNavigation({ currentView, onNavigate, mascotVisible = true, onMascotShow }: MainNavigationProps) {
    const activeSection = getMainSection(currentView);

    const handleNavClick = (section: MainSection) => {
        const navItem = MAIN_NAV_ITEMS.find(item => item.id === section);
        if (navItem) {
            onNavigate(navItem.defaultView);
        }
    };

    return (
        <>
            {/* Desktop Sidebar */}
            <DesktopSidebar
                activeSection={activeSection}
                onNavigate={handleNavClick}
                onLogoClick={() => onNavigate('home')}
                mascotVisible={mascotVisible}
                onMascotShow={onMascotShow}
            />

            {/* Mobile Bottom Nav */}
            <MobileBottomNav
                activeSection={activeSection}
                onNavigate={handleNavClick}
                mascotVisible={mascotVisible}
                onMascotShow={onMascotShow}
            />
        </>
    );
}

// ============================================
// DESKTOP SIDEBAR
// ============================================

interface DesktopSidebarProps {
    activeSection: MainSection | null;
    onNavigate: (section: MainSection) => void;
    onLogoClick: () => void;
    mascotVisible?: boolean;
    onMascotShow?: () => void;
}

function DesktopSidebar({ activeSection, onNavigate, onLogoClick, mascotVisible, onMascotShow }: DesktopSidebarProps) {
    return (
        <nav className="hidden md:flex fixed left-0 top-0 h-screen w-20 bg-[#0A0A0C]/95 backdrop-blur-xl border-r border-white/[0.05] flex-col items-center py-6 z-50">
            {/* Logo */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onLogoClick}
                className="w-12 h-12 bg-purple-600 rounded-2xl flex items-center justify-center mb-8 shadow-[0_0_20px_rgba(147,51,234,0.4)] hover:shadow-[0_0_30px_rgba(147,51,234,0.6)] transition-shadow"
            >
                <img src={btcwheelLogo} alt="BTC Wheel" className="w-7 h-7 invert brightness-0" />
            </motion.button>

            {/* Nav Items */}
            <div className="flex-1 flex flex-col gap-2 w-full px-3">
                {MAIN_NAV_ITEMS.map((item) => {
                    const Icon = iconMap[item.icon as keyof typeof iconMap];
                    const isActive = activeSection === item.id;

                    return (
                        <motion.button
                            id={`nav-${item.id}`}
                            key={item.id}
                            onClick={() => onNavigate(item.id)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`
                relative group flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-xl transition-all
                ${isActive
                                    ? 'bg-purple-500/10 text-white'
                                    : 'text-[#666677] hover:text-white hover:bg-white/[0.03]'
                                }
              `}
                        >
                            {/* Active Indicator */}
                            {isActive && (
                                <motion.div
                                    layoutId="desktop-active-indicator"
                                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-purple-500 rounded-r-full shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                />
                            )}

                            <Icon className={`w-5 h-5 transition-transform ${isActive ? '' : 'group-hover:scale-110'}`} />

                            <span className={`
                text-[9px] font-bold uppercase tracking-wider transition-opacity
                ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
              `}>
                                {item.label}
                            </span>

                            {/* Tooltip */}
                            <div className="
                absolute left-full ml-3 px-3 py-1.5 
                bg-[#0A0A0C] border border-white/[0.1] 
                text-white text-[10px] font-medium 
                rounded-lg opacity-0 group-hover:opacity-100 
                pointer-events-none transition-all whitespace-nowrap z-50 
                translate-x-[-5px] group-hover:translate-x-0
                shadow-xl
              ">
                                {item.label}
                            </div>
                        </motion.button>
                    );
                })}
            </div>

            {/* Mascot Button - Show when mascot is hidden */}
            {!mascotVisible && onMascotShow && (
                <motion.button
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onMascotShow}
                    className="mb-4 w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:shadow-[0_0_30px_rgba(79,70,229,0.6)] transition-all group"
                    title="Apri Prof Satoshi AI"
                >
                    <Sparkles className="w-6 h-6 text-white group-hover:animate-pulse" />
                </motion.button>
            )}

            {/* Version/Status indicator (opzionale) */}
            <div className="mt-auto px-3 w-full">
                <div className="text-[8px] font-medium text-[#444455] uppercase tracking-wider text-center">
                    v2.0
                </div>
            </div>
        </nav>
    );
}

// ============================================
// MOBILE BOTTOM NAV
// ============================================

interface MobileBottomNavProps {
    activeSection: MainSection | null;
    onNavigate: (section: MainSection) => void;
    mascotVisible?: boolean;
    onMascotShow?: () => void;
}

function MobileBottomNav({ activeSection, onNavigate, mascotVisible, onMascotShow }: MobileBottomNavProps) {
    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 safe-area-bottom">
            {/* Mascot Button - Floating above nav when hidden */}
            {!mascotVisible && onMascotShow && (
                <div className="absolute -top-16 right-4">
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onMascotShow}
                        className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(79,70,229,0.5)] active:shadow-[0_0_30px_rgba(79,70,229,0.7)]"
                        aria-label="Apri Prof Satoshi AI"
                    >
                        <Sparkles className="w-6 h-6 text-white" />
                    </motion.button>
                </div>
            )}

            <div className="mx-3 mb-3">
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="bg-[#0A0A0C]/95 backdrop-blur-xl border border-white/[0.08] rounded-2xl px-2 py-2 shadow-2xl"
                >
                    <div className="flex items-center justify-around">
                        {MAIN_NAV_ITEMS.map((item) => {
                            const Icon = iconMap[item.icon as keyof typeof iconMap];
                            const isActive = activeSection === item.id;

                            return (
                                <motion.button
                                    id={`nav-mobile-${item.id}`}
                                    key={item.id}
                                    onClick={() => onNavigate(item.id)}
                                    whileTap={{ scale: 0.9 }}
                                    className={`
                    relative flex flex-col items-center gap-1 py-2 px-4 rounded-xl transition-all
                    ${isActive ? 'text-purple-400' : 'text-[#666677]'}
                  `}
                                >
                                    <Icon className="w-5 h-5" />

                                    <span className={`
                    text-[9px] font-bold uppercase tracking-wide
                    ${isActive ? 'text-purple-400' : 'text-[#555566]'}
                  `}>
                                        {item.label}
                                    </span>

                                    {/* Active Indicator */}
                                    {isActive && (
                                        <motion.div
                                            layoutId="mobile-active-indicator"
                                            className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-8 h-1 bg-purple-500 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                        />
                                    )}
                                </motion.button>
                            );
                        })}
                    </div>
                </motion.div>
            </div>
        </nav>
    );
}

export default MainNavigation;

