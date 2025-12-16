export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  category: 'learning' | 'trading' | 'streak' | 'achievement' | 'mastery';
  requirement: {
    type: 'lessons_completed' | 'xp_earned' | 'streak_days' | 'quiz_perfect' | 'level_reached' | 'simulation_profit' | 'challenge_completed';
    value: number;
    description: string;
  };
  reward?: {
    xp?: number;
    multiplier?: number;
  };
}

export const badges: Record<string, Badge> = {
  // LEARNING BADGES
  first_lesson: {
    id: 'first_lesson',
    name: 'Primo Passo',
    description: 'Hai completato la tua prima lezione!',
    icon: '📚',
    rarity: 'common',
    category: 'learning',
    requirement: {
      type: 'lessons_completed',
      value: 1,
      description: 'Completa 1 lezione'
    },
    reward: { xp: 50 }
  },

  bitcoin_basics: {
    id: 'bitcoin_basics',
    name: 'Bitcoin Enthusiast',
    description: 'Padroneggi le basi di Bitcoin',
    icon: '₿',
    rarity: 'common',
    category: 'learning',
    requirement: {
      type: 'lessons_completed',
      value: 3,
      description: 'Completa le prime 3 lezioni'
    },
    reward: { xp: 100 }
  },

  options_scholar: {
    id: 'options_scholar',
    name: 'Options Scholar',
    description: 'Comprendi il mondo delle opzioni',
    icon: '📊',
    rarity: 'rare',
    category: 'learning',
    requirement: {
      type: 'lessons_completed',
      value: 6,
      description: 'Completa 6 lezioni (metà corso)'
    },
    reward: { xp: 200 }
  },

  wheel_master: {
    id: 'wheel_master',
    name: 'Wheel Master',
    description: 'Hai completato tutte le lezioni sulla Wheel Strategy!',
    icon: '🎓',
    rarity: 'epic',
    category: 'mastery',
    requirement: {
      type: 'lessons_completed',
      value: 9,
      description: 'Completa 9 lezioni (Wheel completa)'
    },
    reward: { xp: 500 }
  },

  knowledge_seeker: {
    id: 'knowledge_seeker',
    name: 'Knowledge Seeker',
    description: 'Hai completato 12 lezioni avanzate',
    icon: '🔍',
    rarity: 'epic',
    category: 'learning',
    requirement: {
      type: 'lessons_completed',
      value: 12,
      description: 'Completa 12 lezioni'
    },
    reward: { xp: 750 }
  },

  grand_master: {
    id: 'grand_master',
    name: 'Grand Master',
    description: 'Hai completato TUTTE le 15 lezioni! Sei un esperto!',
    icon: '👑',
    rarity: 'legendary',
    category: 'mastery',
    requirement: {
      type: 'lessons_completed',
      value: 15,
      description: 'Completa tutte le 15 lezioni'
    },
    reward: { xp: 1000, multiplier: 1.1 }
  },

  // XP & LEVEL BADGES
  xp_collector_1k: {
    id: 'xp_collector_1k',
    name: 'XP Collector',
    description: 'Hai guadagnato 1,000 XP!',
    icon: '⭐',
    rarity: 'common',
    category: 'achievement',
    requirement: {
      type: 'xp_earned',
      value: 1000,
      description: 'Guadagna 1,000 XP'
    },
    reward: { xp: 100 }
  },

  xp_hunter_5k: {
    id: 'xp_hunter_5k',
    name: 'XP Hunter',
    description: 'Hai accumulato 5,000 XP!',
    icon: '🌟',
    rarity: 'rare',
    category: 'achievement',
    requirement: {
      type: 'xp_earned',
      value: 5000,
      description: 'Guadagna 5,000 XP'
    },
    reward: { xp: 500 }
  },

  xp_legend_10k: {
    id: 'xp_legend_10k',
    name: 'XP Legend',
    description: 'Hai raggiunto 10,000 XP! Incredibile!',
    icon: '💫',
    rarity: 'legendary',
    category: 'achievement',
    requirement: {
      type: 'xp_earned',
      value: 10000,
      description: 'Guadagna 10,000 XP'
    },
    reward: { xp: 1000, multiplier: 1.05 }
  },

  level_5: {
    id: 'level_5',
    name: 'Rising Trader',
    description: 'Hai raggiunto il livello 5!',
    icon: '📈',
    rarity: 'rare',
    category: 'achievement',
    requirement: {
      type: 'level_reached',
      value: 5,
      description: 'Raggiungi livello 5'
    },
    reward: { xp: 250 }
  },

  level_10: {
    id: 'level_10',
    name: 'Advanced Trader',
    description: 'Livello 10! Sei tra i migliori!',
    icon: '🚀',
    rarity: 'epic',
    category: 'achievement',
    requirement: {
      type: 'level_reached',
      value: 10,
      description: 'Raggiungi livello 10'
    },
    reward: { xp: 500 }
  },

  level_15: {
    id: 'level_15',
    name: 'Elite Trader',
    description: 'Livello 15! Sei un\'élite!',
    icon: '💎',
    rarity: 'legendary',
    category: 'mastery',
    requirement: {
      type: 'level_reached',
      value: 15,
      description: 'Raggiungi livello 15'
    },
    reward: { xp: 1000, multiplier: 1.15 }
  },

  // STREAK BADGES
  streak_3: {
    id: 'streak_3',
    name: 'On Fire',
    description: '3 giorni di streak! Continua così!',
    icon: '🔥',
    rarity: 'common',
    category: 'streak',
    requirement: {
      type: 'streak_days',
      value: 3,
      description: 'Mantieni uno streak di 3 giorni'
    },
    reward: { xp: 100 }
  },

  streak_7: {
    id: 'streak_7',
    name: 'Weekly Warrior',
    description: 'Una settimana di streak! Dedizione totale!',
    icon: '🔥🔥',
    rarity: 'rare',
    category: 'streak',
    requirement: {
      type: 'streak_days',
      value: 7,
      description: 'Mantieni uno streak di 7 giorni'
    },
    reward: { xp: 300, multiplier: 1.05 }
  },

  streak_30: {
    id: 'streak_30',
    name: 'Monthly Master',
    description: '30 giorni di streak! Sei inarrestabile!',
    icon: '🔥🔥🔥',
    rarity: 'epic',
    category: 'streak',
    requirement: {
      type: 'streak_days',
      value: 30,
      description: 'Mantieni uno streak di 30 giorni'
    },
    reward: { xp: 1000, multiplier: 1.1 }
  },

  streak_100: {
    id: 'streak_100',
    name: 'Centurion',
    description: '100 giorni consecutivi! Leggenda vivente!',
    icon: '👑🔥',
    rarity: 'legendary',
    category: 'streak',
    requirement: {
      type: 'streak_days',
      value: 100,
      description: 'Mantieni uno streak di 100 giorni'
    },
    reward: { xp: 5000, multiplier: 1.2 }
  },

  // QUIZ BADGES
  quiz_perfectionist: {
    id: 'quiz_perfectionist',
    name: 'Perfectionist',
    description: 'Hai fatto 5 quiz con punteggio perfetto!',
    icon: '💯',
    rarity: 'rare',
    category: 'achievement',
    requirement: {
      type: 'quiz_perfect',
      value: 5,
      description: 'Completa 5 quiz con 100% risposte corrette'
    },
    reward: { xp: 300 }
  },

  quiz_genius: {
    id: 'quiz_genius',
    name: 'Quiz Genius',
    description: '10 quiz perfetti! Hai memoria fotografica!',
    icon: '🧠',
    rarity: 'epic',
    category: 'achievement',
    requirement: {
      type: 'quiz_perfect',
      value: 10,
      description: 'Completa 10 quiz con 100% risposte corrette'
    },
    reward: { xp: 750 }
  },

  // TRADING SIMULATION BADGES
  first_profit: {
    id: 'first_profit',
    name: 'First Profit',
    description: 'Hai completato la tua prima simulazione in profitto!',
    icon: '💰',
    rarity: 'common',
    category: 'trading',
    requirement: {
      type: 'simulation_profit',
      value: 1,
      description: 'Completa 1 simulazione con profitto positivo'
    },
    reward: { xp: 150 }
  },

  profitable_trader: {
    id: 'profitable_trader',
    name: 'Profitable Trader',
    description: 'Hai completato 5 simulazioni profittevoli!',
    icon: '💵',
    rarity: 'rare',
    category: 'trading',
    requirement: {
      type: 'simulation_profit',
      value: 5,
      description: 'Completa 5 simulazioni con profitto positivo'
    },
    reward: { xp: 500 }
  },

  trading_pro: {
    id: 'trading_pro',
    name: 'Trading Pro',
    description: '10 simulazioni profittevoli! Sei un professionista!',
    icon: '🏆',
    rarity: 'epic',
    category: 'trading',
    requirement: {
      type: 'simulation_profit',
      value: 10,
      description: 'Completa 10 simulazioni con profitto positivo'
    },
    reward: { xp: 1000, multiplier: 1.1 }
  }
};

// Helper functions
export function getBadgesByCategory(category: Badge['category']): Badge[] {
  return Object.values(badges).filter(badge => badge.category === category);
}

export function getBadgesByRarity(rarity: Badge['rarity']): Badge[] {
  return Object.values(badges).filter(badge => badge.rarity === rarity);
}

export function checkBadgeUnlock(badge: Badge, userProgress: {
  completedLessons: number[];
  xp: number;
  streak: number;
  level: number;
  perfectQuizzes?: number;
  profitableSimulations?: number;
}): boolean {
  switch (badge.requirement.type) {
    case 'lessons_completed':
      return userProgress.completedLessons.length >= badge.requirement.value;
    
    case 'xp_earned':
      return userProgress.xp >= badge.requirement.value;
    
    case 'streak_days':
      return userProgress.streak >= badge.requirement.value;
    
    case 'level_reached':
      return userProgress.level >= badge.requirement.value;
    
    case 'quiz_perfect':
      return (userProgress.perfectQuizzes || 0) >= badge.requirement.value;
    
    case 'simulation_profit':
      return (userProgress.profitableSimulations || 0) >= badge.requirement.value;
    
    default:
      return false;
  }
}

export function getUnlockedBadges(userProgress: {
  completedLessons: number[];
  xp: number;
  streak: number;
  level: number;
  perfectQuizzes?: number;
  profitableSimulations?: number;
  unlockedBadges?: string[];
}): string[] {
  const unlocked: string[] = [];
  
  Object.values(badges).forEach(badge => {
    const alreadyUnlocked = userProgress.unlockedBadges?.includes(badge.id);
    if (!alreadyUnlocked && checkBadgeUnlock(badge, userProgress)) {
      unlocked.push(badge.id);
    }
  });
  
  return unlocked;
}

export function getNextBadgeToUnlock(userProgress: {
  completedLessons: number[];
  xp: number;
  streak: number;
  level: number;
  perfectQuizzes?: number;
  profitableSimulations?: number;
  unlockedBadges?: string[];
}): Badge | null {
  const lockedBadges = Object.values(badges).filter(badge => 
    !userProgress.unlockedBadges?.includes(badge.id) &&
    !checkBadgeUnlock(badge, userProgress)
  );

  if (lockedBadges.length === 0) return null;

  // Find the badge closest to being unlocked
  return lockedBadges.reduce((closest, badge) => {
    const currentProgress = getCurrentProgress(badge, userProgress);
    const closestProgress = getCurrentProgress(closest, userProgress);
    
    return currentProgress > closestProgress ? badge : closest;
  });
}

function getCurrentProgress(badge: Badge, userProgress: any): number {
  switch (badge.requirement.type) {
    case 'lessons_completed':
      return userProgress.completedLessons.length / badge.requirement.value;
    case 'xp_earned':
      return userProgress.xp / badge.requirement.value;
    case 'streak_days':
      return userProgress.streak / badge.requirement.value;
    case 'level_reached':
      return userProgress.level / badge.requirement.value;
    case 'quiz_perfect':
      return (userProgress.perfectQuizzes || 0) / badge.requirement.value;
    case 'simulation_profit':
      return (userProgress.profitableSimulations || 0) / badge.requirement.value;
    default:
      return 0;
  }
}

export const rarityColors = {
  common: 'from-gray-400 to-gray-600',
  rare: 'from-blue-400 to-blue-600',
  epic: 'from-purple-400 to-purple-600',
  legendary: 'from-yellow-400 to-orange-600'
};

export const rarityBorders = {
  common: 'border-gray-400',
  rare: 'border-blue-400',
  epic: 'border-purple-400',
  legendary: 'border-yellow-400'
};

export const rarityLabels = {
  common: 'Comune',
  rare: 'Raro',
  epic: 'Epico',
  legendary: 'Leggendario'
};
