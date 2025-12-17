import { useState } from 'react';
import { Navigation } from './Navigation';
import { Card } from './ui/card';
import { Badge as BadgeComponent } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useUserProgress } from '../hooks/useUserProgress';
import { badges, rarityColors, rarityBorders, rarityLabels, getNextBadgeToUnlock, type Badge } from '../lib/badges';
import { Lock, Trophy, Sparkles, TrendingUp } from 'lucide-react';
import { SocialShare } from './SocialShare';
import type { View } from '../App';

interface BadgeShowcaseProps {
  onNavigate: (view: View) => void;
}

export function BadgeShowcase({ onNavigate }: BadgeShowcaseProps) {
  const { progress } = useUserProgress();
  const [selectedCategory, setSelectedCategory] = useState<'all' | Badge['category']>('all');

  const userProgressData = {
    completedLessons: progress.completedLessons,
    xp: progress.xp,
    streak: progress.streak,
    level: progress.level,
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
  const completionPercentage = (unlockedCount / totalCount) * 100;

  const nextBadge = getNextBadgeToUnlock(userProgressData);

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
      case 'lessons_completed':
        return Math.min((progress.completedLessons.length / req.value) * 100, 100);
      case 'xp_earned':
        return Math.min((progress.xp / req.value) * 100, 100);
      case 'streak_days':
        return Math.min((progress.streak / req.value) * 100, 100);
      case 'level_reached':
        return Math.min((progress.level / req.value) * 100, 100);
      case 'quiz_perfect':
        return Math.min(((progress.perfectQuizzes || 0) / req.value) * 100, 100);
      case 'simulation_profit':
        return Math.min(((progress.profitableSimulations || 0) / req.value) * 100, 100);
      default:
        return 0;
    }
  };

  const getCurrentValue = (badge: Badge): number => {
    const req = badge.requirement;
    
    switch (req.type) {
      case 'lessons_completed':
        return progress.completedLessons.length;
      case 'xp_earned':
        return progress.xp;
      case 'streak_days':
        return progress.streak;
      case 'level_reached':
        return progress.level;
      case 'quiz_perfect':
        return progress.perfectQuizzes || 0;
      case 'simulation_profit':
        return progress.profitableSimulations || 0;
      default:
        return 0;
    }
  };

  return (
    <div className="min-h-screen md:pl-20 pb-24 md:pb-0 bg-gray-50">
      <Navigation currentView="home" onNavigate={onNavigate} />

      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-8 md:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <Trophy className="w-8 h-8" />
            <h1 className="text-white">🏆 I Tuoi Badge</h1>
          </div>
          <p className="text-purple-100 mb-6">
            Colleziona badge completando lezioni, mantenendo streak e padroneggiando la Wheel Strategy!
          </p>

          {/* Progress Summary */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white">Collezione Badge</span>
              <span className="text-white">{unlockedCount}/{totalCount}</span>
            </div>
            <Progress value={completionPercentage} className="h-3 bg-white/20" />
            <p className="text-purple-100 text-sm mt-2">
              {completionPercentage === 100 
                ? '🎉 Collezione completa! Sei una leggenda!' 
                : `Ancora ${totalCount - unlockedCount} badge da sbloccare`}
            </p>
          </Card>

          {/* Next Badge to Unlock */}
          {nextBadge && (
            <Card className="mt-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-sm border-yellow-400/30 p-4">
              <div className="flex items-start gap-3">
                <div className="text-3xl">{nextBadge.icon}</div>
                <div className="flex-1">
                  <h3 className="text-white mb-1">🎯 Prossimo Badge</h3>
                  <p className="text-white/90 mb-2">{nextBadge.name}</p>
                  <p className="text-sm text-white/70 mb-2">{nextBadge.requirement.description}</p>
                  <div className="flex items-center gap-2">
                    <Progress value={getProgressForBadge(nextBadge)} className="h-2 flex-1 bg-white/20" />
                    <span className="text-xs text-white/90">
                      {getCurrentValue(nextBadge)}/{nextBadge.requirement.value}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </header>

      {/* Category Tabs */}
      <div className="max-w-6xl mx-auto px-4 py-6 md:px-6">
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="w-full justify-start overflow-x-auto flex-nowrap mb-6">
            {categories.map(cat => (
              <TabsTrigger 
                key={cat.id} 
                value={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className="whitespace-nowrap"
              >
                <cat.icon className="w-4 h-4 mr-2" />
                {cat.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={selectedCategory} className="mt-0">
            {/* Badges Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredBadges.map(badge => {
                const isUnlocked = userProgressData.unlockedBadges.includes(badge.id);
                const progressPercent = getProgressForBadge(badge);
                const currentValue = getCurrentValue(badge);

                return (
                  <Card
                    key={badge.id}
                    className={`p-5 transition-all relative overflow-hidden ${
                      isUnlocked 
                        ? `border-2 ${rarityBorders[badge.rarity]} shadow-lg` 
                        : 'opacity-60 bg-gray-100'
                    }`}
                  >
                    {/* Rarity Gradient Background */}
                    {isUnlocked && (
                      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${rarityColors[badge.rarity]}`} />
                    )}

                    {/* Badge Icon */}
                    <div className="flex items-start justify-between mb-3">
                      <div className={`text-5xl ${isUnlocked ? 'filter-none' : 'grayscale opacity-40'}`}>
                        {badge.icon}
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <BadgeComponent 
                          className={`${
                            badge.rarity === 'common' ? 'bg-gray-200 text-gray-800' :
                            badge.rarity === 'rare' ? 'bg-blue-100 text-blue-800' :
                            badge.rarity === 'epic' ? 'bg-purple-100 text-purple-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {rarityLabels[badge.rarity]}
                        </BadgeComponent>
                        {!isUnlocked && (
                          <Lock className="w-5 h-5 text-gray-400 mt-1" />
                        )}
                      </div>
                    </div>

                    {/* Badge Info */}
                    <h3 className={`text-gray-900 mb-2 ${!isUnlocked && 'text-gray-500'}`}>
                      {badge.name}
                    </h3>
                    <p className={`text-sm mb-3 ${isUnlocked ? 'text-gray-600' : 'text-gray-400'}`}>
                      {badge.description}
                    </p>

                    {/* Requirement */}
                    <div className="text-xs text-gray-500 mb-2">
                      {badge.requirement.description}
                    </div>

                    {/* Progress Bar (if not unlocked) */}
                    {!isUnlocked && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs text-gray-600">
                          <span>Progresso</span>
                          <span>{currentValue}/{badge.requirement.value}</span>
                        </div>
                        <Progress value={progressPercent} className="h-2" />
                      </div>
                    )}

                    {/* Reward Info (if unlocked) */}
                    {isUnlocked && (
                      <div className="mt-3 pt-3 border-t border-gray-200 space-y-3">
                        {badge.reward && (
                          <div className="flex items-center gap-2 text-sm text-green-600">
                            <Sparkles className="w-4 h-4" />
                            <span>
                              {badge.reward.xp && `+${badge.reward.xp} XP`}
                              {badge.reward.multiplier && ` • ${((badge.reward.multiplier - 1) * 100).toFixed(0)}% XP boost`}
                            </span>
                          </div>
                        )}
                        
                        <SocialShare 
                          title={`Ho sbloccato il badge "${badge.name}" su BTC Wheel! 🏆`} 
                          description={`${badge.description} - Unisciti a me per imparare la Bitcoin Wheel Strategy!`}
                          className="justify-center"
                        />
                      </div>
                    )}

                    {/* Unlocked Stamp */}
                    {isUnlocked && (
                      <div className="absolute top-3 right-3 bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center">
                        <Trophy className="w-4 h-4" />
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>

        {/* Empty State */}
        {filteredBadges.length === 0 && (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Nessun badge in questa categoria</p>
          </div>
        )}
      </div>
    </div>
  );
}
