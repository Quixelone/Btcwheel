import { useState, useEffect, useCallback, useRef } from 'react';

export type EmotionType = 
  | 'normal'
  | 'excited'
  | 'disappointed'
  | 'thinking'
  | 'teaching'
  | 'celebrating'
  | 'encouraging'
  | 'sleeping';

export type ActivityType =
  | 'quiz_correct'
  | 'quiz_wrong'
  | 'quiz_start'
  | 'lesson_start'
  | 'lesson_complete'
  | 'level_up'
  | 'badge_unlock'
  | 'streak_active'
  | 'streak_broken'
  | 'trade_profit'
  | 'trade_loss'
  | 'ai_listening'
  | 'ai_thinking'
  | 'ai_responding'
  | 'idle'
  | 'excited'
  | 'celebrating'
  | 'disappointed';

interface MascotEmotionState {
  emotion: EmotionType;
  message: string;
  isThinking: boolean;
}

/**
 * Hook per gestire intelligentemente le emozioni di Prof Satoshi
 * basate sul contesto e le attività dell'utente
 */
export function useMascotEmotion() {
  const [emotionState, setEmotionState] = useState<MascotEmotionState>({
    emotion: 'normal',
    message: 'Ciao! Sono Prof Satoshi, il tuo tutor personale! 🎓',
    isThinking: false,
  });

  // Use ref instead of state to avoid recreating callbacks
  const idleTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Map activity to emotion and message
  const activityToEmotion = useCallback((activity: ActivityType): MascotEmotionState => {
    switch (activity) {
      // Quiz interactions
      case 'quiz_correct':
        return {
          emotion: 'celebrating',
          message: 'Perfetto! Hai capito benissimo! 🎉',
          isThinking: false,
        };
      
      case 'quiz_wrong':
        return {
          emotion: 'encouraging',
          message: 'Nessun problema! Impariamo dagli errori. Riprova! 💪',
          isThinking: false,
        };
      
      case 'quiz_start':
        return {
          emotion: 'teaching',
          message: 'Vediamo cosa hai imparato! Ce la puoi fare! 📚',
          isThinking: false,
        };

      // Lessons
      case 'lesson_start':
        return {
          emotion: 'teaching',
          message: 'Iniziamo questa lezione! Sarà interessante! 💡',
          isThinking: false,
        };
      
      case 'lesson_complete':
        return {
          emotion: 'celebrating',
          message: 'Lezione completata! Sei sulla strada giusta! 🌟',
          isThinking: false,
        };

      // Progress events
      case 'level_up':
        return {
          emotion: 'celebrating',
          message: 'Nuovo livello! Stai facendo progressi incredibili! 🚀',
          isThinking: false,
        };
      
      case 'badge_unlock':
        return {
          emotion: 'excited',
          message: 'Wow! Hai sbloccato un nuovo badge! Fantastico! 🏆',
          isThinking: false,
        };

      // Streak
      case 'streak_active':
        return {
          emotion: 'excited',
          message: 'Grande! Continua così la tua streak! 🔥',
          isThinking: false,
        };
      
      case 'streak_broken':
        return {
          emotion: 'encouraging',
          message: 'Non preoccuparti, ricominciamo oggi! 💪',
          isThinking: false,
        };

      // Trading
      case 'trade_profit':
        return {
          emotion: 'excited',
          message: 'Trade profittevole! Ottima strategia! 📈',
          isThinking: false,
        };
      
      case 'trade_loss':
        return {
          emotion: 'teaching',
          message: 'Ogni trade è una lezione. Analizziamo insieme! 📊',
          isThinking: false,
        };

      // AI Chat states
      case 'ai_listening':
        return {
          emotion: 'normal',
          message: 'Ti ascolto... dimmi tutto! 👂',
          isThinking: false,
        };
      
      case 'ai_thinking':
        return {
          emotion: 'thinking',
          message: 'Hmm, fammi pensare... 🤔',
          isThinking: true, // Shows typing indicator!
        };
      
      case 'ai_responding':
        return {
          emotion: 'teaching',
          message: 'Ecco cosa ne penso! 💬',
          isThinking: false,
        };

      // Idle
      case 'idle':
        return {
          emotion: 'normal',
          message: 'Ciao! Sono Prof Satoshi, il tuo tutor personale! 🎓',
          isThinking: false,
        };

      // Direct emotion setting
      case 'excited':
        return {
          emotion: 'excited',
          message: 'Fantastico! 🤩',
          isThinking: false,
        };
      case 'celebrating':
        return {
          emotion: 'celebrating',
          message: 'Evviva! 🎉',
          isThinking: false,
        };
      case 'disappointed':
        return {
          emotion: 'disappointed',
          message: 'Oh no... 😔',
          isThinking: false,
        };

      default:
        return {
          emotion: 'normal',
          message: 'Ciao! Come posso aiutarti? 👋',
          isThinking: false,
        };
    }
  }, []);

  // Set emotion based on activity
  const setActivity = useCallback((activity: ActivityType, duration: number = 3000) => {
    const newState = activityToEmotion(activity);
    setEmotionState(newState);

    // Clear existing timeout using ref
    if (idleTimeoutRef.current) {
      clearTimeout(idleTimeoutRef.current);
      idleTimeoutRef.current = null;
    }

    // Return to normal after duration (except for thinking state)
    if (!newState.isThinking && activity !== 'idle') {
      const timeout = setTimeout(() => {
        setEmotionState({
          emotion: 'normal',
          message: 'Sono qui se hai bisogno! 👋',
          isThinking: false,
        });
      }, duration);
      idleTimeoutRef.current = timeout;
    }
  }, [activityToEmotion]); // Now stable! No idleTimeout dependency

  // Manual emotion override
  const setEmotion = useCallback((
    emotion: EmotionType,
    message: string,
    isThinking: boolean = false
  ) => {
    setEmotionState({ emotion, message, isThinking });
    
    if (idleTimeoutRef.current) {
      clearTimeout(idleTimeoutRef.current);
      idleTimeoutRef.current = null;
    }
  }, []); // Now stable! No dependencies

  // Reset to normal
  const reset = useCallback(() => {
    setEmotionState({
      emotion: 'normal',
      message: 'Sono qui se hai bisogno! 👋',
      isThinking: false,
    });
    
    if (idleTimeoutRef.current) {
      clearTimeout(idleTimeoutRef.current);
      idleTimeoutRef.current = null;
    }
  }, []); // Now stable! No dependencies

  // Auto-idle after 30 seconds of no activity
  useEffect(() => {
    const autoIdleTimer = setTimeout(() => {
      if (emotionState.emotion === 'normal') {
        setActivity('idle');
      }
    }, 30000); // 30 seconds

    return () => clearTimeout(autoIdleTimer);
  }, [emotionState.emotion, setActivity]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (idleTimeoutRef.current) {
        clearTimeout(idleTimeoutRef.current);
      }
    };
  }, []); // Cleanup only on unmount

  return {
    emotion: emotionState.emotion,
    message: emotionState.message,
    isThinking: emotionState.isThinking,
    setActivity,
    setEmotion,
    reset,
  };
}
