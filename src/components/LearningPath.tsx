import { Navigation } from './Navigation';
import { useUserProgress } from '../hooks/useUserProgress';
import { lessons } from '../lib/lessons';
import { Lock, CheckCircle, Star, Trophy, Flame, Zap, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { PageWrapper, PageContent, PageHeader } from './layout/PageWrapper';
import { StatCardSmall } from './ui/stat-card';
import type { View } from '../App';

interface LearningPathProps {
    onNavigate: (view: View, lessonId?: number) => void;
    mascotVisible?: boolean;
    onMascotToggle?: () => void;
}

export function LearningPath({ onNavigate, mascotVisible, onMascotToggle }: LearningPathProps) {
    const { progress } = useUserProgress();
    const lessonList = Object.values(lessons);

    return (
        <PageWrapper>
            <Navigation
                currentView="lessons"
                onNavigate={(view) => onNavigate(view)}
                mascotVisible={mascotVisible}
                onMascotToggle={onMascotToggle}
            />

            <PageContent>
                {/* Header Stats */}
                <PageHeader
                    title="Il Tuo Percorso"
                    subtitle="Segui la mappa per diventare un esperto."
                    actions={
                        <div className="flex items-center gap-4">
                            <StatCardSmall label="Streak" value={progress.streak} icon={Flame} color="orange" />
                            <StatCardSmall label="XP" value={progress.xp} icon={Zap} color="yellow" />
                            <div className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.08] px-5 py-3 rounded-2xl">
                                <Trophy className="w-5 h-5 text-purple-400" />
                                <span className="text-sm font-bold text-white tracking-tight">Livello {progress.level}</span>
                            </div>
                        </div>
                    }
                />

                <div className="relative py-20 pb-40">
                    {/* The Path Line */}
                    <div className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-purple-500/20 via-blue-500/20 to-transparent -translate-x-1/2 z-0" />

                    <div className="relative z-10 space-y-24">
                        {lessonList.map((lesson, index) => {
                            const isCompleted = progress.completedLessons.includes(lesson.id);
                            const isLocked = progress.level < lesson.requiredLevel;
                            const isNext = !isCompleted && !isLocked;

                            // Zig-zag offset
                            const xOffset = index % 2 === 0 ? 'md:-translate-x-32' : 'md:translate-x-32';

                            return (
                                <div key={lesson.id} className="flex flex-col items-center">
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        className={`relative group ${xOffset} transition-all duration-500`}
                                    >
                                        {/* Lesson Node */}
                                        <div className="relative">
                                            <motion.button
                                                whileHover={!isLocked ? { scale: 1.1 } : {}}
                                                whileTap={!isLocked ? { scale: 0.95 } : {}}
                                                onClick={() => !isLocked && onNavigate('lesson', lesson.id)}
                                                disabled={isLocked}
                                                className={`
                                                    w-24 h-24 md:w-32 md:h-32 rounded-[32px] flex items-center justify-center
                                                    transition-all duration-300 shadow-2xl relative z-10 border
                                                    ${isCompleted
                                                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_30px_-10px_rgba(16,185,129,0.3)]'
                                                        : isLocked
                                                            ? 'bg-[#0A0A0C] border-white/[0.05] text-[#444455] cursor-not-allowed'
                                                            : 'bg-purple-600 border-purple-400 text-white shadow-[0_0_40px_-10px_rgba(168,85,247,0.5)] ring-8 ring-purple-500/10'}
                                                `}
                                            >
                                                {isCompleted ? (
                                                    <CheckCircle className="w-12 h-12" />
                                                ) : isLocked ? (
                                                    <Lock className="w-10 h-10" />
                                                ) : (
                                                    <Star className="w-12 h-12 fill-current" />
                                                )}
                                            </motion.button>

                                            {/* Label */}
                                            <div className={`
                                                absolute top-1/2 -translate-y-1/2 whitespace-nowrap
                                                ${index % 2 === 0 ? 'left-full ml-8' : 'right-full mr-8'}
                                                hidden md:block
                                            `}>
                                                <div className={`
                                                    px-6 py-4 rounded-2xl border transition-all duration-300
                                                    ${isLocked
                                                        ? 'bg-[#0A0A0C] border-white/[0.05] text-[#666677]'
                                                        : 'bg-[#0A0A0C] border-white/[0.15] text-white shadow-xl'}
                                                `}>
                                                    <p className="text-[10px] font-bold text-[#666677] uppercase tracking-wider mb-1">Lezione {lesson.id}</p>
                                                    <p className="text-lg font-bold tracking-tight">{lesson.title}</p>
                                                </div>
                                            </div>

                                            {/* Mobile Label */}
                                            <div className="md:hidden absolute -bottom-12 left-1/2 -translate-x-1/2 whitespace-nowrap text-center">
                                                <p className={`text-xs font-bold uppercase tracking-wider ${isLocked ? 'text-[#666677]' : 'text-white'}`}>
                                                    {lesson.title}
                                                </p>
                                            </div>

                                            {/* Status Indicator */}
                                            {isNext && (
                                                <motion.div
                                                    animate={{ y: [0, -10, 0] }}
                                                    transition={{ duration: 2, repeat: Infinity }}
                                                    className="absolute -top-12 left-1/2 -translate-x-1/2 bg-purple-500 text-white text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-[0_0_20px_rgba(168,85,247,0.4)] flex items-center gap-2"
                                                >
                                                    <Sparkles className="w-3 h-3" />
                                                    Inizia!
                                                </motion.div>
                                            )}
                                        </div>
                                    </motion.div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Final Trophy */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        className="mt-40 flex flex-col items-center"
                    >
                        <div className="relative">
                            <div className="absolute inset-0 bg-yellow-500/10 blur-[80px] rounded-full" />
                            <div className="w-40 h-40 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-[40px] flex items-center justify-center shadow-[0_0_50px_-10px_rgba(234,179,8,0.2)] relative z-10 border border-yellow-500/30">
                                <Trophy className="w-20 h-20 text-yellow-400" />
                            </div>
                        </div>
                        <h3 className="mt-10 text-3xl font-bold text-center tracking-tight text-white">
                            Traguardo Finale<br />
                            <span className="text-yellow-400">Master of the Wheel</span>
                        </h3>
                        <p className="text-[#888899] text-base font-medium mt-4">Completa tutte le lezioni per sbloccare la certificazione</p>
                    </motion.div>
                </div>
            </PageContent>
        </PageWrapper>
    );
}
