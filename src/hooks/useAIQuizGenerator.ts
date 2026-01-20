import { useState, useCallback, useRef, useEffect } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import type { Question } from '../lib/lessons';

interface QuizPerformance {
  correctAnswers: number;
  wrongAnswers: number;
  consecutiveWrong: number;
  consecutiveCorrect: number;
  difficultyLevel: 'easy' | 'medium' | 'hard';
  weakTopics: string[];
  questionsAsked: string[];
  totalAttempts: number;
}

interface GeneratedQuestion extends Question {
  isAI: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
  topic?: string;
  attemptsLeft?: number;
}

const MAX_ATTEMPTS_PER_QUESTION = 3;

export function useAIQuizGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [performance, setPerformanceState] = useState<QuizPerformance>({
    correctAnswers: 0,
    wrongAnswers: 0,
    consecutiveWrong: 0,
    consecutiveCorrect: 0,
    difficultyLevel: 'easy',
    weakTopics: [],
    questionsAsked: [],
    totalAttempts: 0,
  });

  // 🎯 FIX: Use a ref to keep track of performance without re-creating functions
  const performanceRef = useRef<QuizPerformance>(performance);

  // Keep ref in sync with state
  useEffect(() => {
    performanceRef.current = performance;
  }, [performance]);

  /**
   * Genera una domanda AI-powered basata sul contesto e performance
   * STABLE: No dependencies to avoid re-render loops
   */
  const generateAIQuestion = useCallback(async (
    lessonId: number,
    lessonTitle: string,
    lessonContent: string,
    difficulty?: 'easy' | 'medium' | 'hard'
  ): Promise<GeneratedQuestion | null> => {
    try {
      setIsGenerating(true);

      // Use current values from ref to avoid function re-creation
      const currentPerf = performanceRef.current;
      const targetDifficulty = difficulty || currentPerf.difficultyLevel;

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
              ...currentPerf,
              previousQuestions: currentPerf.questionsAsked,
            },
          }),
        }
      );

      if (!response.ok) {
        console.error('AI question generation error');
        return null;
      }

      const data = await response.json();

      // Update state using functional update
      setPerformanceState(prev => ({
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
  }, []); // 🎯 STABLE: No dependencies!

  /**
   * Registra una risposta e aggiorna la performance
   */
  const recordAnswer = useCallback((
    isCorrect: boolean,
    questionTopic?: string,
    attemptsUsed: number = 1
  ) => {
    setPerformanceState(prev => {
      const newPerf = { ...prev };
      newPerf.totalAttempts += attemptsUsed;

      if (isCorrect) {
        newPerf.correctAnswers++;
        newPerf.consecutiveWrong = 0;
        newPerf.consecutiveCorrect++;

        if (newPerf.consecutiveCorrect >= 3 && attemptsUsed === 1) {
          if (prev.difficultyLevel === 'easy') newPerf.difficultyLevel = 'medium';
          else if (prev.difficultyLevel === 'medium') newPerf.difficultyLevel = 'hard';
          newPerf.consecutiveCorrect = 0;
        }
      } else {
        newPerf.wrongAnswers++;
        newPerf.consecutiveWrong++;
        newPerf.consecutiveCorrect = 0;

        if (questionTopic && !newPerf.weakTopics.includes(questionTopic)) {
          newPerf.weakTopics.push(questionTopic);
        }

        if (newPerf.consecutiveWrong >= 2) {
          if (prev.difficultyLevel === 'hard') newPerf.difficultyLevel = 'medium';
          else if (prev.difficultyLevel === 'medium') newPerf.difficultyLevel = 'easy';
        }
      }

      return newPerf;
    });
  }, []);

  const shouldReviewLesson = useCallback(() => {
    const perf = performanceRef.current;
    const totalQuestions = perf.correctAnswers + perf.wrongAnswers;
    const accuracy = totalQuestions > 0 ? perf.correctAnswers / totalQuestions : 1;

    return perf.consecutiveWrong >= 3 ||
      (perf.wrongAnswers >= 5 && perf.correctAnswers < perf.wrongAnswers) ||
      (totalQuestions >= 10 && accuracy < 0.5);
  }, []); // 🎯 STABLE

  const getAIFeedback = useCallback(async (
    lessonTitle: string,
    wrongAnswers: string[]
  ): Promise<string> => {
    try {
      const perf = performanceRef.current;
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
              ...perf,
              accuracy: perf.correctAnswers / (perf.correctAnswers + perf.wrongAnswers || 1),
            },
          }),
        }
      );

      if (!response.ok) throw new Error('Failed to get AI feedback');

      const data = await response.json();
      return data.feedback;
    } catch (error) {
      console.error('Error getting AI feedback:', error);
      return 'Ti consiglio di rivedere la lezione prima di continuare. 💪';
    }
  }, []); // 🎯 STABLE

  const resetPerformance = useCallback(() => {
    setPerformanceState({
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
    resetPerformance,
    performance,
    isGenerating,
    maxAttemptsPerQuestion: MAX_ATTEMPTS_PER_QUESTION,
  };
}