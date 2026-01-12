import { useState, useCallback } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import type { Question } from '../lib/lessons';

interface QuizPerformance {
  correctAnswers: number;
  wrongAnswers: number;
  consecutiveWrong: number;
  consecutiveCorrect: number;
  difficultyLevel: 'easy' | 'medium' | 'hard';
  weakTopics: string[];
  questionsAsked: string[]; // Track asked questions to avoid repetition
  totalAttempts: number; // Total attempts per question (for retry tracking)
}

interface GeneratedQuestion extends Question {
  isAI: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
  topic?: string;
  attemptsLeft?: number; // Tentativi rimasti per questa domanda
}

const MAX_ATTEMPTS_PER_QUESTION = 3; // Massimo 3 tentativi per domanda

export function useAIQuizGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [performance, setPerformance] = useState<QuizPerformance>({
    correctAnswers: 0,
    wrongAnswers: 0,
    consecutiveWrong: 0,
    consecutiveCorrect: 0,
    difficultyLevel: 'easy',
    weakTopics: [],
    questionsAsked: [],
    totalAttempts: 0,
  });

  /**
   * Genera una domanda AI-powered basata sul contesto e performance
   * Con tracking per evitare ripetizioni
   */
  const generateAIQuestion = useCallback(async (
    lessonId: number,
    lessonTitle: string,
    lessonContent: string,
    difficulty?: 'easy' | 'medium' | 'hard'
  ): Promise<GeneratedQuestion | null> => {
    try {
      setIsGenerating(true);

      // Use adaptive difficulty if not specified
      const targetDifficulty = difficulty || performance.difficultyLevel;

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-7c0f82ca/generate-quiz-question`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            lessonId,
            lessonTitle,
            lessonContent,
            difficulty: targetDifficulty,
            performance: {
              ...performance,
              // Send previous questions to avoid repetition
              previousQuestions: performance.questionsAsked,
            },
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('AI question generation error:', errorText);
        
        // Try to parse error details if JSON
        try {
          const errorJson = JSON.parse(errorText);
          console.error('Error details:', errorJson);
          if (errorJson.rawResponse) {
            console.error('AI raw response preview:', errorJson.rawResponse);
          }
        } catch {
          // Not JSON, just log as text
        }
        
        return null;
      }

      const data = await response.json();
      
      // Track this question
      setPerformance(prev => ({
        ...prev,
        questionsAsked: [...prev.questionsAsked, data.question.question],
      }));

      return {
        ...data.question,
        isAI: true,
        difficulty: targetDifficulty,
        attemptsLeft: MAX_ATTEMPTS_PER_QUESTION,
      };
    } catch (error) {
      console.error('Error generating AI question:', error);
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [performance]);

  /**
   * Registra una risposta e aggiorna la performance con sistema adattivo intelligente
   */
  const recordAnswer = useCallback((
    isCorrect: boolean,
    questionTopic?: string,
    attemptsUsed: number = 1
  ) => {
    setPerformance(prev => {
      const newPerf = { ...prev };
      newPerf.totalAttempts += attemptsUsed;
      
      if (isCorrect) {
        newPerf.correctAnswers++;
        newPerf.consecutiveWrong = 0;
        newPerf.consecutiveCorrect++;
        
        // 🎯 ADAPTIVE DIFFICULTY: Aumenta dopo 3 risposte corrette consecutive al primo tentativo
        if (newPerf.consecutiveCorrect >= 3 && attemptsUsed === 1) {
          if (prev.difficultyLevel === 'easy') {
            newPerf.difficultyLevel = 'medium';
            console.log('🔼 Difficoltà aumentata a MEDIUM');
          } else if (prev.difficultyLevel === 'medium') {
            newPerf.difficultyLevel = 'hard';
            console.log('🔼 Difficoltà aumentata a HARD');
          }
          newPerf.consecutiveCorrect = 0; // Reset counter
        }
      } else {
        newPerf.wrongAnswers++;
        newPerf.consecutiveWrong++;
        newPerf.consecutiveCorrect = 0;
        
        // Traccia topic debole
        if (questionTopic && !newPerf.weakTopics.includes(questionTopic)) {
          newPerf.weakTopics.push(questionTopic);
        }
        
        // 🎯 ADAPTIVE DIFFICULTY: Riduce dopo 2 errori consecutivi
        if (newPerf.consecutiveWrong >= 2) {
          if (prev.difficultyLevel === 'hard') {
            newPerf.difficultyLevel = 'medium';
            console.log('🔽 Difficoltà ridotta a MEDIUM');
          } else if (prev.difficultyLevel === 'medium') {
            newPerf.difficultyLevel = 'easy';
            console.log('🔽 Difficoltà ridotta a EASY');
          }
        }
      }
      
      return newPerf;
    });
  }, []);

  /**
   * Determina se l'utente dovrebbe rivedere la lezione
   * Trigger più aggressivo per forzare il ripasso
   */
  const shouldReviewLesson = useCallback(() => {
    // Trigger review if:
    // - 3+ errori consecutivi
    // - 5+ errori totali con più errori che risposte corrette
    // - Accuracy < 50% dopo 10 domande
    const accuracy = performance.correctAnswers / (performance.correctAnswers + performance.wrongAnswers);
    const totalQuestions = performance.correctAnswers + performance.wrongAnswers;
    
    return performance.consecutiveWrong >= 3 || 
           (performance.wrongAnswers >= 5 && performance.correctAnswers < performance.wrongAnswers) ||
           (totalQuestions >= 10 && accuracy < 0.5);
  }, [performance]);

  /**
   * Ottiene un suggerimento AI personalizzato basato sugli errori
   */
  const getAIFeedback = useCallback(async (
    lessonTitle: string,
    wrongAnswers: string[]
  ): Promise<string> => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-7c0f82ca/get-quiz-feedback`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            lessonTitle,
            wrongAnswers,
            performance: {
              ...performance,
              accuracy: performance.correctAnswers / (performance.correctAnswers + performance.wrongAnswers),
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to get AI feedback');
      }

      const data = await response.json();
      return data.feedback;
    } catch (error) {
      console.error('Error getting AI feedback:', error);
      return 'Sembra che tu abbia qualche difficoltà con questo argomento. Ti consiglio di rivedere la lezione prima di continuare. Focus sui concetti chiave! 💪';
    }
  }, [performance]);

  /**
   * Ottiene suggerimenti per il ripasso basati su weak topics
   */
  const getReviewSuggestions = useCallback(() => {
    if (performance.weakTopics.length === 0) {
      return null;
    }

    return {
      topics: performance.weakTopics,
      message: `Hai avuto difficoltà con: ${performance.weakTopics.join(', ')}. Ripassa questi concetti prima di continuare!`,
      shouldBlock: performance.consecutiveWrong >= 3, // Blocca se troppi errori
    };
  }, [performance]);

  /**
   * Calcola statistiche del quiz
   */
  const getQuizStats = useCallback(() => {
    const total = performance.correctAnswers + performance.wrongAnswers;
    const accuracy = total > 0 ? (performance.correctAnswers / total) * 100 : 0;
    const averageAttempts = total > 0 ? performance.totalAttempts / total : 0;

    return {
      total,
      correct: performance.correctAnswers,
      wrong: performance.wrongAnswers,
      accuracy: Math.round(accuracy),
      averageAttempts: Math.round(averageAttempts * 10) / 10,
      difficulty: performance.difficultyLevel,
      weakTopics: performance.weakTopics,
    };
  }, [performance]);

  /**
   * Reset performance per una nuova lezione
   */
  const resetPerformance = useCallback(() => {
    setPerformance({
      correctAnswers: 0,
      wrongAnswers: 0,
      consecutiveWrong: 0,
      consecutiveCorrect: 0,
      difficultyLevel: 'easy',
      weakTopics: [],
      questionsAsked: [],
      totalAttempts: 0,
    });
  }, []);

  return {
    generateAIQuestion,
    recordAnswer,
    shouldReviewLesson,
    getAIFeedback,
    getReviewSuggestions,
    getQuizStats,
    resetPerformance,
    performance,
    isGenerating,
    maxAttemptsPerQuestion: MAX_ATTEMPTS_PER_QUESTION,
  };
}