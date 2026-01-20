import { useState } from 'react';
import { Navigation } from './Navigation';
import { Card } from './ui/card';
import { Badge as BadgeComponent } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useUserProgress } from '../hooks/useUserProgress';
import { badges, rarityColors, rarityBorders, rarityLabels, type Badge } from '../lib/badges';
import { Lock, Trophy, Sparkles, TrendingUp, ArrowLeft, Medal } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { View } from '../App';

interface BadgeShowcaseProps {
  onNavigate: (view: View) => void;
}

export function BadgeShowcase({ onNavigate }: BadgeShowcaseProps) {
  const { progress } = useUserProgress();
  const [selectedCategory, setSelectedCategory] = useState<'all' | Badge['category']>('all');

  const userProgressData = {
    completedLessons: progress.completedLessons || [],
    xp: progress.xp || 0,
    streak: progress.streak || 0,
    level: progress.level || 1,
    perfectQuizzes: progress.perfectQuizzes || 0,
    profitableSimulations: progress.profitableSimulations || 0,
    unlockedBadges: progress.badges || []
  };

  const allBadges = Object.values(badges);
  const filteredBadges = selectedCategory === 'all'
    ? allBadges
    : allBadges.filter(b => b.category === selectedCategory);

  const unlockedCount = filteredBadges.filter(b => userProgressData.unlockedBadges.includes(b.id)).length;
  const totalCount = filteredBadges.length;
  const completionPercentage = (unlockedCount / (totalCount || 1)) * 100;

  const categories = [
    { id: 'all' as const, label: 'Tutti', icon: Trophy },
    { id: 'learning' as const, label: 'Apprendimento', icon: Sparkles },
    { id: 'achievement' as const, label: 'Achievement', icon: TrendingUp },
    { id: 'streak' as const, label: 'Streak', icon: Trophy },
    { id: 'trading' as const, label: 'Trading', icon: TrendingUp },
    { id: 'mastery' as const, label: 'Mastery', icon: Trophy }
  ];

  const getProgressForBadge = (badge: Badge): number => {
    const req = badge.requirement;
    switch (req.type) {
      case 'lessons_completed': return Math.min(((progress.completedLessons?.length || 0) / req.value) * 100, 100);
      case 'xp_earned': return Math.min(((progress.xp || 0) / req.value) * 100, 100);
      case 'streak_days': return Math.min(((progress.streak || 0) / req.value) * 100, 100);
      case 'level_reached': return Math.min(((progress.level || 1) / req.value) * 100, 100);
      case 'quiz_perfect': return Math.min(((progress.perfectQuizzes || 0) / req.value) * 100, 100);
      case 'simulation_profit': return Math.min(((progress.profitableSimulations || 0) / req.value) * 100, 100);
      default: return 0;
    }
  };

  const getCurrentValue = (badge: Badge): number => {
    const req = badge.requirement;
    switch (req.type) {
      case 'lessons_completed': return progress.completedLessons?.length || 0;
      case 'xp_earned': return progress.xp || 0;
      case 'streak_days': return progress.streak || 0;
      case 'level_reached': return progress.level || 1;
      case 'quiz_perfect': return progress.perfectQuizzes || 0;
      case 'simulation_profit': return progress.profitableSimulations || 0;
      default: return 0;
    }
  };

  return (
    <div className="min-h-screen md:pl-24 bg-slate-950 text-white relative overflow-x-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }} />
      </div>
      <div className="fixed top-0 right-0 w-[800px] h-[800px] bg-purple-500/5 rounded-full blur-[180px] pointer-events-none -mr-96 -mt-96" />
      <div className="fixed bottom-0 left-0 w-[800px] h-[800px] bg-emerald-500/5 rounded-full blur-[180px] pointer-events-none -ml-96 -mb-96" />

      <Navigation currentView="home" onNavigate={onNavigate} />

      <header className="relative z-30 px-6 py-12 md:px-12 max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-10">
        <div className="flex items-center gap-8">
          <motion.div
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onNavigate('dashboard')}
            className="w-16 h-16 bg-slate-950 border border-white/10 rounded-2xl flex items-center justify-center cursor-pointer hover:border-purple-500/50 transition-colors shadow-xl"
          >
            <ArrowLeft className="w-8 h-8 text-slate-400" />
          </motion.div>
          <div>
            <div className="flex items-center gap-4">
              <h1 className="text-4xl font-black text-white uppercase tracking-tighter">I Tuoi Badge</h1>
              <Trophy className="w-8 h-8 text-yellow-500" />
            </div>
            <p className="text-slate-500 text-lg font-medium mt-1">Colleziona trofei e sblocca ricompense esclusive</p>
          </div>
        </div>

        <Card className="bg-slate-950/40 backdrop-blur-3xl border border-white/10 px-10 py-6 rounded-[2rem] shadow-2xl min-w-[300px]">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em]">Collezione</span>
            <span className="text-xl font-black text-white">{unlockedCount}/{totalCount}</span>
          </div>
          <div className="h-3 bg-slate-950 rounded-full overflow-hidden border border-white/5 p-0.5 shadow-inner">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shadow-[0_0_15px_rgba(168,85,247,0.4)]"
              initial={{ width: 0 }}
              animate={{ width: `${completionPercentage}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          </div>
        </Card>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-6 md:px-12 space-y-16 pb-40">
        {/* Category Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="bg-slate-950/40 backdrop-blur-3xl border border-white/10 p-2 rounded-[2rem] mb-12 h-auto flex-wrap justify-start gap-3 shadow-xl">
            {categories.map(cat => (
              <TabsTrigger
                key={cat.id}
                value={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className="px-8 py-4 rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.2em] data-[state=active]:bg-purple-600 data-[state=active]:text-white transition-all shadow-lg"
              >
                <cat.icon className="w-5 h-5 mr-3" />
                {cat.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={selectedCategory} className="mt-0">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              <AnimatePresence mode="popLayout">
                {filteredBadges.map((badge, index) => {
                  const isUnlocked = userProgressData.unlockedBadges.includes(badge.id);
                  const progressPercent = getProgressForBadge(badge);
                  const currentValue = getCurrentValue(badge);

                  return (
                    <motion.div
                      key={badge.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card
                        className={`p-10 h-full transition-all relative overflow-hidden group rounded-[3rem] border-white/5 shadow-2xl ${isUnlocked
                          ? `bg-slate-950/40 backdrop-blur-3xl border-2 ${rarityBorders[badge.rarity]}`
                          : 'bg-slate-950/20 opacity-40 grayscale'
                          }`}
                      >
                        {/* Rarity Glow */}
                        {isUnlocked && (
                          <div className={`absolute top-0 right-0 w-40 h-40 bg-gradient-to-br ${rarityColors[badge.rarity]} opacity-5 rounded-full blur-3xl -mr-20 -mt-20 group-hover:opacity-10 transition-opacity`} />
                        )}

                        <div className="flex items-start justify-between mb-10">
                          <div className={`text-7xl transition-transform duration-500 ${isUnlocked ? 'group-hover:scale-110 group-hover:rotate-6 drop-shadow-2xl' : ''}`}>
                            {badge.icon}
                          </div>
                          <div className="flex flex-col items-end gap-3">
                            <BadgeComponent
                              className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 border-0 shadow-lg ${badge.rarity === 'common' ? 'bg-slate-800 text-slate-400' :
                                badge.rarity === 'rare' ? 'bg-blue-500/20 text-blue-400' :
                                  badge.rarity === 'epic' ? 'bg-purple-500/20 text-purple-400' :
                                    'bg-yellow-500/20 text-yellow-400'
                                }`}
                            >
                              {rarityLabels[badge.rarity]}
                            </BadgeComponent>
                            {!isUnlocked && <Lock className="w-5 h-5 text-slate-700" />}
                          </div>
                        </div>

                        <h3 className={`text-2xl font-black uppercase tracking-tight mb-3 ${isUnlocked ? 'text-white' : 'text-slate-600'}`}>
                          {badge.name}
                        </h3>
                        <p className={`text-base font-medium mb-8 leading-relaxed ${isUnlocked ? 'text-slate-400' : 'text-slate-700'}`}>
                          {badge.description}
                        </p>

                        <div className="mt-auto space-y-5">
                          <div className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">
                            {badge.requirement.description}
                          </div>

                          {!isUnlocked && (
                            <div className="space-y-3">
                              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                                <span className="text-slate-600">Progresso</span>
                                <span className="text-slate-500">{currentValue}/{badge.requirement.value}</span>
                              </div>
                              <div className="h-2 bg-slate-950 rounded-full overflow-hidden border border-white/5 p-0.5 shadow-inner">
                                <motion.div
                                  className="h-full bg-slate-800 rounded-full"
                                  initial={{ width: 0 }}
                                  animate={{ width: `${progressPercent}%` }}
                                />
                              </div>
                            </div>
                          )}

                          {isUnlocked && badge.reward && (
                            <div className="pt-6 border-t border-white/5">
                              <div className="flex items-center gap-3 text-[11px] font-black uppercase tracking-widest text-emerald-500">
                                <Sparkles className="w-4 h-4" />
                                <span>
                                  {badge.reward.xp && `+${badge.reward.xp} XP`}
                                  {badge.reward.multiplier && ` • ${((badge.reward.multiplier - 1) * 100).toFixed(0)}% Boost`}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>

                        {isUnlocked && (
                          <div className="absolute bottom-6 right-6 opacity-10 group-hover:opacity-30 transition-opacity">
                            <Medal className="w-16 h-16 text-white" />
                          </div>
                        )}
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </TabsContent>
        </Tabs>

        {filteredBadges.length === 0 && (
          <div className="text-center py-40 bg-slate-950/20 rounded-[4rem] border border-dashed border-white/10 shadow-inner">
            <Trophy className="w-24 h-24 text-slate-800 mx-auto mb-8" />
            <p className="text-slate-600 font-black uppercase tracking-[0.3em]">Nessun badge in questa categoria</p>
          </div>
        )}
      </main>
    </div>
  );
}
