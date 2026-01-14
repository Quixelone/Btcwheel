// OpenAI Client for AI-powered user profiling and course personalization
// Calls are proxied through backend server for security

import { projectId, publicAnonKey } from '../utils/supabase/info';

export interface UserProfile {
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  tradingKnowledge: 'none' | 'basic' | 'experienced';
  optionsKnowledge: 'none' | 'basic' | 'experienced';
  goals: string[];
  availableTime: 'limited' | 'moderate' | 'plenty';
  capital: 'learning' | 'small' | 'medium' | 'large';
  learningStyle: string[];
}

export interface PersonalizedRecommendation {
  startingLesson: number;
  recommendedPath: string[];
  estimatedDuration: string;
  focusAreas: string[];
  tips: string[];
  customMessage: string;
}

export async function analyzeUserProfile(
  profile: UserProfile
): Promise<PersonalizedRecommendation> {
  try {
    const serverUrl = `https://${projectId}.supabase.co/functions/v1/make-server-7c0f82ca/analyze-profile`;
    
    const response = await fetch(serverUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify(profile),
    });

    if (!response.ok) {
      console.error('Server error:', response.status);
      return getFallbackRecommendations(profile);
    }

    const data = await response.json();
    
    // If server says to use fallback (API key not configured or error)
    if (data.useFallback) {
      console.warn('Using fallback recommendations (OpenAI not available on server)');
      return getFallbackRecommendations(profile);
    }

    if (data.recommendation) {
      console.log('✅ AI-powered recommendations generated successfully!');
      return data.recommendation;
    }

    return getFallbackRecommendations(profile);
  } catch (error) {
    console.error('Error calling analyze-profile endpoint:', error);
    return getFallbackRecommendations(profile);
  }
}

// Fallback recommendations when OpenAI is not available
function getFallbackRecommendations(
  profile: UserProfile
): PersonalizedRecommendation {
  // Beginner path
  if (profile.experienceLevel === 'beginner' && profile.optionsKnowledge === 'none') {
    return {
      startingLesson: 1,
      recommendedPath: [
        'Lezione 1: Introduzione Bitcoin',
        'Lezione 2: Wheel Strategy Basics',
        'Lezione 3: Fondamenti Opzioni',
        'Lezione 4: Put Cash-Secured',
        'Lezione 6: Gestione Rischio',
      ],
      estimatedDuration: '3-4 settimane',
      focusAreas: [
        'Basi del Bitcoin e volatilità',
        'Comprendere le opzioni Put e Call',
        'Gestione rischio fondamentale',
        'Pratica con simulatore',
      ],
      tips: [
        'Inizia con piccole somme nel simulatore',
        'Studia ogni giorno 15-20 minuti',
        'Non saltare le basi delle opzioni',
        'Fai domande alla mascotte quando hai dubbi',
      ],
      customMessage:
        '🎓 Benvenuto! Sei all\'inizio del tuo viaggio nel trading di opzioni Bitcoin. Inizieremo dalle basi assolute per costruire una solida fondazione. Prenditi il tuo tempo e completa ogni lezione con attenzione!',
    };
  }

  // Intermediate path
  if (
    profile.experienceLevel === 'intermediate' ||
    profile.tradingKnowledge === 'basic'
  ) {
    return {
      startingLesson: 3,
      recommendedPath: [
        'Lezione 3: Fondamenti Opzioni',
        'Lezione 5: Strike Selection',
        'Lezione 7: Time Decay',
        'Lezione 9: Roll & Adjust',
        'Lezione 11: Greeks Avanzati',
      ],
      estimatedDuration: '2-3 settimane',
      focusAreas: [
        'Selezione strike ottimale',
        'Time decay e gestione tempo',
        'Tecniche di roll avanzate',
        'Greeks per decisioni informate',
      ],
      tips: [
        'Concentrati sulla gestione delle posizioni',
        'Pratica roll scenarios nel simulatore',
        'Studia i Greeks in dettaglio',
        'Tieni un journal delle tue simulazioni',
      ],
      customMessage:
        '💼 Ottimo! Hai già delle basi. Ci concentreremo su strategie intermedie e gestione avanzata delle posizioni. Il tuo obiettivo è padroneggiare il roll e l\'aggiustamento delle posizioni.',
    };
  }

  // Advanced path
  return {
    startingLesson: 7,
    recommendedPath: [
      'Lezione 7: Time Decay',
      'Lezione 9: Roll & Adjust',
      'Lezione 11: Greeks Avanzati',
      'Lezione 12: Portfolio Management',
      'Lezione 15: Strategie Multi-Leg',
    ],
    estimatedDuration: '1-2 settimane',
    focusAreas: [
      'Greeks avanzati e volatilità',
      'Portfolio diversification',
      'Strategie multi-leg complesse',
      'Ottimizzazione fiscale',
    ],
    tips: [
      'Sperimenta con strategie avanzate',
      'Ottimizza il tuo portfolio per rischio/rendimento',
      'Studia le implicazioni fiscali',
      'Pratica scenari complessi di mercato',
    ],
    customMessage:
      '🚀 Eccellente! Sei un trader esperto. Ci focalizzeremo su strategie avanzate, ottimizzazione del portfolio e tecniche professionali. Pronto per portare il tuo trading al livello successivo!',
  };
}

// Chat with AI tutor for questions
export async function chatWithAITutor(
  userMessage: string,
  context?: string
): Promise<string> {
  try {
    const serverUrl = `https://${projectId}.supabase.co/functions/v1/make-server-7c0f82ca/chat-tutor`;
    
    const response = await fetch(serverUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify({
        message: userMessage,
        context,
      }),
    });

    if (!response.ok) {
      console.error('Server error:', response.status);
      return 'Si è verificato un errore. Riprova tra poco.';
    }

    const data = await response.json();
    return data.message || 'Mi dispiace, non ho capito. Puoi riformulare?';
  } catch (error) {
    console.error('Error calling chat-tutor endpoint:', error);
    return 'Si è verificato un errore. Riprova tra poco.';
  }
}
