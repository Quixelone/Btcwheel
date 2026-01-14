import { useState, useEffect } from 'react';
import { Navigation } from './Navigation';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Progress } from './ui/progress';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { useUserProgress } from '../hooks/useUserProgress';
import { useMascotEmotion } from '../hooks/useMascotEmotion';
import { useAIQuizGenerator } from '../hooks/useAIQuizGenerator';
import { CheckCircle2, XCircle, ArrowRight, ArrowLeft, Trophy, Lightbulb, RefreshCw, AlertCircle } from 'lucide-react';
import { XPGain } from './animations/XPGain';
import { QuizFeedback } from './animations/QuizFeedback';
import { BadgeUnlockAnimation } from './animations/BadgeUnlockAnimation';
// ❌ REMOVED: EnhancedMascot (now using global MascotAI with lesson context)
import { HintCard } from './HintCard';
import { QuizAttempts } from './quiz/QuizAttempts';
import { ReviewSuggestion } from './quiz/ReviewSuggestion';
import { AIDebugPanel } from './dev/AIDebugPanel';
import { useAnimations } from '../hooks/useAnimations';
import { lessons } from '../lib/lessons';
import { getUnlockedBadges } from '../lib/badges';
import type { View } from '../App';
import type { Question } from '../lib/lessons';
import { toast } from 'sonner';

interface LessonViewProps {
  onNavigate: (view: View) => void;
  lessonId?: number;
}

export function LessonView({ onNavigate, lessonId = 9 }: LessonViewProps) {
  // Get lesson data from library
  const lesson = lessons[lessonId];
  
  if (!lesson) {
    return (
      <div className="min-h-screen md:pl-20 pb-24 md:pb-0 bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-gray-900 mb-4">Lezione non trovata</h2>
          <p className="text-gray-600 mb-6">La lezione #{lessonId} non è ancora disponibile.</p>
          <Button onClick={() => onNavigate('home')} className="bg-blue-600 hover:bg-blue-700">
            Torna alla Home
          </Button>
        </Card>
      </div>
    );
  }

  const lessonContent = {
    title: lesson.title,
    description: lesson.description,
    sections: lesson.sections
  };
  const baseQuestions = lesson.questions;
  
  const [newBadgeId, setNewBadgeId] = useState<string | null>(null);
  const { progress: userProgress, addXP, completeLesson } = useUserProgress();
  const { triggers, triggerXPGain, triggerQuizFeedback, dismissQuizFeedback } = useAnimations();
  
  // 🎯 AI Quiz Generator Integration
  const {
    generateAIQuestion,
    recordAnswer,
    shouldReviewLesson,
    getAIFeedback,
    resetPerformance,
    performance,
    isGenerating
  } = useAIQuizGenerator();
  
  // Prof Satoshi integration
  const { emotion, message, isThinking, setActivity } = useMascotEmotion();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [answeredQuestions, setAnsweredQuestions] = useState<number[]>([]);
  const [lessonCompleted, setLessonCompleted] = useState(false);
  const [isFirstAttempt, setIsFirstAttempt] = useState(true);
  const [earnedXP, setEarnedXP] = useState(0);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);
  
  // 🎯 Dynamic Quiz State
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionsPool, setQuestionsPool] = useState<Question[]>([]);
  const [wrongAnswersList, setWrongAnswersList] = useState<string[]>([]);
  const [showReviewSuggestion, setShowReviewSuggestion] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<string>('');
  const [isLoadingFeedback, setIsLoadingFeedback] = useState(false);

  const totalSteps = lessonContent.sections.length;
  const totalQuestions = questions.length;

  // Trigger lesson start emotion
  useEffect(() => {
    setActivity('lesson_start', 4000);
  }, [lessonId, setActivity]);

  // 🎯 Initialize quiz with AI-generated questions ONLY
  useEffect(() => {
    if (quizStarted && questions.length === 0) {
      // 🚀 Generate initial AI questions instead of using static ones
      const initializeAIQuiz = async () => {
        toast.loading('🤖 Generando quiz personalizzato...', { id: 'ai-quiz-init' });
        
        const lessonFullContent = lessonContent.sections
          .map(s => `${s.title}: ${s.content}`)
          .join('\n\n');
        
        // Generate first 3 questions with AI
        const aiQuestions = [];
        let failedAttempts = 0;
        
        for (let i = 0; i < 3; i++) {
          const difficulty = i === 0 ? 'easy' : i === 1 ? 'easy' : 'medium';
          const aiQuestion = await generateAIQuestion(
            lessonId,
            lessonContent.title,
            lessonFullContent,
            difficulty
          );
          
          if (aiQuestion) {
            aiQuestions.push(aiQuestion);
          } else {
            failedAttempts++;
            console.warn(`Failed to generate AI question ${i + 1}/3`);
          }
        }
        
        if (aiQuestions.length > 0) {
          setQuestions(aiQuestions);
          setQuestionsPool(aiQuestions);
          resetPerformance();
          toast.success(`✨ Quiz AI pronto con ${aiQuestions.length} domande uniche!`, { id: 'ai-quiz-init' });
        } else {
          // 🆘 Fallback to base questions if all AI generation failed
          console.error('All AI question generation failed, falling back to base questions');
          const shuffled = [...baseQuestions].sort(() => Math.random() - 0.5);
          setQuestions(shuffled);
          setQuestionsPool(shuffled);
          resetPerformance();
          toast.warning('⚠️ Usando domande di backup (AI temporaneamente non disponibile)', { 
            id: 'ai-quiz-init',
            duration: 5000 
          });
        }
      };
      
      initializeAIQuiz();
    }
  }, [quizStarted, baseQuestions, questions.length, resetPerformance, lessonId, lessonContent, generateAIQuestion]);

  const handleNextSection = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setQuizStarted(true);
      // Trigger quiz start emotion
      setActivity('quiz_start', 4000);
    }
  };

  const handlePrevSection = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // 🎯 Generate new AI question dynamically
  const generateNewAIQuestion = async () => {
    toast.loading('Generando nuova domanda AI...', { id: 'ai-gen' });
    
    const lessonFullContent = lessonContent.sections
      .map(s => `${s.title}: ${s.content}`)
      .join('\n\n');
    
    const aiQuestion = await generateAIQuestion(
      lessonId,
      lessonContent.title,
      lessonFullContent,
      performance.difficultyLevel
    );
    
    if (aiQuestion) {
      setQuestions(prev => [...prev, aiQuestion]);
      toast.success(`Nuova domanda ${performance.difficultyLevel.toUpperCase()} generata! 🤖`, { id: 'ai-gen' });
    } else {
      toast.error('Errore generazione domanda AI', { id: 'ai-gen' });
    }
  };

  const handleSubmitAnswer = async () => {
    const question = questions[currentQuestion];
    const correct = selectedAnswer === String(question.correctAnswer);
    
    // 🎯 Record answer for AI performance tracking
    recordAnswer(correct, lessonContent.title);
    
    setIsCorrect(correct);
    setShowFeedback(true);
    
    // Trigger quiz feedback animation
    triggerQuizFeedback(correct);
    
    // Trigger Prof Satoshi emotion
    setActivity(correct ? 'quiz_correct' : 'quiz_wrong', 3000);
    
    if (correct) {
      const bonusXP = isFirstAttempt ? 50 : 0;
      const totalXP = question.xp + bonusXP;
      setEarnedXP(totalXP);
      addXP(totalXP);
      
      // Trigger XP gain animation after quiz feedback completes
      setTimeout(() => {
        triggerXPGain(totalXP);
      }, 1100);
      
      // 🎯 Generate new AI question after EVERY correct answer (more dynamic!)
      if (isFirstAttempt) {
        generateNewAIQuestion();
      }
    } else {
      setIsFirstAttempt(false);
      setWrongAttempts(wrongAttempts + 1);
      
      // Add to wrong answers list for AI feedback
      setWrongAnswersList(prev => [...prev, question.question]);
      
      // 🎯 Check if user should review lesson
      if (shouldReviewLesson()) {
        setShowReviewSuggestion(true);
        
        // Get personalized AI feedback
        setIsLoadingFeedback(true);
        const feedback = await getAIFeedback(lessonContent.title, wrongAnswersList);
        setAiFeedback(feedback);
        setIsLoadingFeedback(false);
      }
      
      if (wrongAttempts >= 2) {
        setShowHint(true);
      }
    }
  };

  const handleNextQuestion = async () => {
    setAnsweredQuestions([...answeredQuestions, currentQuestion]);
    setShowFeedback(false);
    setSelectedAnswer('');
    setIsFirstAttempt(true);
    setEarnedXP(0);
    setWrongAttempts(0); // Reset wrong attempts counter
    setShowHint(false); // Hide hint for next question
    
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Lesson completed
      setLessonCompleted(true);
      const updatedProgress = await completeLesson(lessonId);
      addXP(250); // Bonus for completing lesson
      triggerXPGain(250);
      
      // Trigger lesson complete emotion
      setActivity('lesson_complete', 5000);
      
      // Check for badge unlocks
      if (updatedProgress) {
        const newBadges = getUnlockedBadges(updatedProgress);
        if (newBadges.length > 0) {
          // Show first new badge animation
          setNewBadgeId(newBadges[0]);
          // Trigger badge unlock emotion
          setTimeout(() => {
            setActivity('badge_unlock', 5000);
          }, 1000);
        }
      }
    }
  };

  if (lessonCompleted) {
    return (
      <div className="min-h-screen md:pl-20 pb-24 md:pb-0 flex items-center justify-center bg-gray-50 p-4">
        <Navigation currentView="lesson" onNavigate={onNavigate} />
        <Card className="max-w-2xl w-full p-8 md:p-12 text-center">
          <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Trophy className="w-10 h-10 md:w-12 md:h-12 text-white" />
          </div>
          <h1 className="text-gray-900 mb-4">Complimenti! 🎉</h1>
          <p className="text-gray-700 mb-8">
            Hai completato la lezione "{lessonContent.title}"
          </p>
          <div className="bg-gradient-to-r from-blue-50 to-orange-50 rounded-lg p-6 mb-8">
            <p className="text-gray-900 mb-2 font-semibold">XP Totale Guadagnato</p>
            <p className="text-blue-600 font-bold">+{questions.reduce((acc, q) => acc + q.xp, 0) + 250}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={() => onNavigate('home')} className="bg-blue-600 hover:bg-blue-700 h-12">
              Torna alla Home
            </Button>
            <Button onClick={() => onNavigate('simulation')} variant="outline" className="h-12">
              Prova la Simulazione
            </Button>
          </div>
        </Card>
        
        {/* ❌ REMOVED: EnhancedMascot (now using global MascotAI with lesson context) */}
      </div>
    );
  }

  if (!quizStarted) {
    return (
      <div className="min-h-screen md:pl-20 pb-24 md:pb-0 bg-gray-50">
        <Navigation currentView="lesson" onNavigate={onNavigate} />
        
        {/* Mobile-Optimized Header */}
        <header className="bg-white border-b border-gray-200 px-4 py-4 md:px-6 sticky top-0 z-30 safe-area-top">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 md:gap-4 mb-4">
              <Button variant="ghost" onClick={() => onNavigate('home')} size="sm" className="h-10">
                <ArrowLeft className="w-5 h-5 md:w-4 md:h-4 mr-2" />
                <span className="hidden md:inline">Indietro</span>
              </Button>
              <div className="flex-1 min-w-0">
                <h2 className="text-gray-900 truncate">{lessonContent.title}</h2>
                <p className="text-gray-600 hidden md:block truncate">{lessonContent.description}</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-gray-600">
                <span>Sezione {currentStep + 1} di {totalSteps}</span>
                <span className="font-semibold">{Math.round(((currentStep + 1) / totalSteps) * 100)}%</span>
              </div>
              <Progress value={((currentStep + 1) / totalSteps) * 100} className="h-3" />
            </div>
          </div>
        </header>

        {/* Lesson Content - Mobile Optimized */}
        <main className="max-w-4xl mx-auto px-4 py-5 md:px-6 md:py-8">
          <Card className="p-5 md:p-8 mb-5 md:mb-6">
            <h2 className="text-gray-900 mb-4">{lessonContent.sections[currentStep].title}</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {lessonContent.sections[currentStep].content}
            </p>
          </Card>

          <div className="flex justify-between gap-3">
            <Button 
              variant="outline" 
              onClick={handlePrevSection}
              disabled={currentStep === 0}
              className="h-12 px-5"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              <span className="hidden sm:inline">Precedente</span>
            </Button>
            <Button 
              onClick={handleNextSection}
              className="bg-blue-600 hover:bg-blue-700 h-12 px-5 flex-1 max-w-xs"
            >
              {currentStep === totalSteps - 1 ? 'Inizia Quiz' : 'Successivo'}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </main>
        
        {/* ❌ REMOVED: EnhancedMascot (now using global MascotAI with lesson context) */}

        {/* Animations */}
        <XPGain amount={earnedXP} trigger={triggers.xpGain} />
        <QuizFeedback 
          isCorrect={triggers.quizFeedback.isCorrect} 
          show={triggers.quizFeedback.show}
          onDismiss={dismissQuizFeedback}
        />
        <BadgeUnlockAnimation 
          badgeId={newBadgeId} 
          onClose={() => setNewBadgeId(null)} 
        />
      </div>
    );
  }

  // Quiz View
  const question = questions[currentQuestion];
  
  // Safety check: wait for questions to be initialized
  if (!question) {
    return (
      <div className="min-h-screen md:pl-20 pb-24 md:pb-0 bg-gray-50 flex items-center justify-center">
        <Navigation currentView="lesson" onNavigate={onNavigate} />
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento quiz...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen md:pl-20 pb-24 md:pb-0 bg-gray-50">
      <Navigation currentView="lesson" onNavigate={onNavigate} />
      
      {/* Mobile-Optimized Quiz Header */}
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-5 md:px-6 md:py-6 sticky top-0 z-30 safe-area-top">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-white mb-4 truncate">Quiz: {lessonContent.title}</h2>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-blue-100">
              <span>Domanda {currentQuestion + 1} di {totalQuestions}</span>
              <span className="font-semibold">{Math.round(((currentQuestion + 1) / totalQuestions) * 100)}%</span>
            </div>
            <Progress value={((currentQuestion + 1) / totalQuestions) * 100} className="h-3 bg-white/20" />
            {/* 🎯 AI Performance Indicator */}
            <div className="flex items-center gap-2 pt-1">
              <span className="text-xs text-blue-100">Difficoltà:</span>
              <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                performance.difficultyLevel === 'easy' ? 'bg-green-500 text-white' :
                performance.difficultyLevel === 'medium' ? 'bg-yellow-500 text-gray-900' :
                'bg-red-500 text-white'
              }`}>
                {performance.difficultyLevel.toUpperCase()}
              </span>
              <span className="text-xs text-blue-100 ml-2">
                ✓ {performance.correctAnswers} | ✗ {performance.wrongAnswers}
              </span>
              {isGenerating && (
                <span className="text-xs text-yellow-300 ml-auto animate-pulse">
                  🤖 Generando AI...
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Quiz Content - Mobile Optimized */}
      <main className="max-w-4xl mx-auto px-4 py-5 md:px-6 md:py-8">
        <Card className="p-5 md:p-8">
          <div className="mb-6 md:mb-8">
            <p className="text-gray-900 mb-6 leading-relaxed">{question.question}</p>
          </div>

          <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer}>
            <div className="space-y-3">
              {question.options?.map((option, index) => (
                <div
                  key={index}
                  className={`flex items-start space-x-3 p-4 rounded-lg border-2 transition-all min-h-[60px] ${
                    showFeedback && String(index) === String(question.correctAnswer)
                      ? 'border-green-500 bg-green-50'
                      : showFeedback && selectedAnswer === String(index) && !isCorrect
                      ? 'border-red-500 bg-red-50'
                      : selectedAnswer === String(index)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <RadioGroupItem value={String(index)} id={`option-${index}`} disabled={showFeedback} className="mt-1" />
                  <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer leading-relaxed">
                    {option}
                  </Label>
                  {showFeedback && String(index) === String(question.correctAnswer) && (
                    <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
                  )}
                  {showFeedback && selectedAnswer === String(index) && !isCorrect && (
                    <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </RadioGroup>

          {showFeedback && (
            <div className={`mt-6 p-4 rounded-lg ${isCorrect ? 'bg-green-50 border-2 border-green-200' : 'bg-orange-50 border-2 border-orange-200'}`}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-900 font-semibold">{isCorrect ? '✓ Corretto!' : '✗ Risposta errata'}</p>
                {isCorrect && isFirstAttempt && (
                  <span className="text-blue-600 font-semibold">+{earnedXP} XP</span>
                )}
              </div>
              <p className="text-gray-700 leading-relaxed">{question.explanation}</p>
              {isCorrect && isFirstAttempt && (
                <p className="text-sm text-blue-600 mt-2">🎉 Bonus primo tentativo: +50 XP</p>
              )}
            </div>
          )}

          <div className="mt-8">
            {!showFeedback ? (
              <Button 
                onClick={handleSubmitAnswer}
                disabled={!selectedAnswer}
                className="w-full bg-blue-600 hover:bg-blue-700 h-12"
              >
                Verifica Risposta
              </Button>
            ) : (
              <Button 
                onClick={handleNextQuestion}
                className="w-full bg-blue-600 hover:bg-blue-700 h-12"
              >
                {currentQuestion < totalQuestions - 1 ? 'Prossima Domanda' : 'Completa Lezione'}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            )}
          </div>
        </Card>
      </main>

      {/* ❌ REMOVED: EnhancedMascot (now using global MascotAI with lesson context) */}

      {/* 🎯 AI Review Suggestion Modal */}
      {showReviewSuggestion && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full p-6 bg-orange-50 border-2 border-orange-300 shadow-2xl">
            <div className="flex items-start gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="text-gray-900 mb-2">Forse dovresti rivedere la lezione 📚</h3>
                {isLoadingFeedback ? (
                  <div className="flex items-center gap-2 text-gray-600">
                    <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                    <p>Prof Satoshi sta analizzando le tue risposte...</p>
                  </div>
                ) : (
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{aiFeedback}</p>
                )}
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <Button
                onClick={() => {
                  setQuizStarted(false);
                  setCurrentStep(0);
                  setCurrentQuestion(0);
                  setShowReviewSuggestion(false);
                  setWrongAnswersList([]);
                  resetPerformance();
                  toast.success('Rivediamo insieme la lezione! 📖');
                }}
                className="flex-1 bg-orange-600 hover:bg-orange-700"
                disabled={isLoadingFeedback}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Rivedi Lezione
              </Button>
              <Button
                onClick={() => {
                  setShowReviewSuggestion(false);
                  toast.info('Continua il quiz, ma fai attenzione! 💪');
                }}
                variant="outline"
                className="flex-1 border-orange-300 hover:bg-orange-100"
                disabled={isLoadingFeedback}
              >
                Continua Quiz
              </Button>
            </div>
            
            <p className="text-xs text-gray-500 mt-4 text-center">
              💡 Rivedere la lezione ti aiuterà a comprendere meglio i concetti
            </p>
          </Card>
        </div>
      )}

      {/* Animations */}
      <XPGain amount={earnedXP} trigger={triggers.xpGain} />
      <QuizFeedback 
        isCorrect={triggers.quizFeedback.isCorrect} 
        show={triggers.quizFeedback.show}
        onDismiss={dismissQuizFeedback}
      />
      <BadgeUnlockAnimation 
        badgeId={newBadgeId} 
        onClose={() => setNewBadgeId(null)} 
      />

      {/* 🎯 AI Debug Panel (Development Tool) */}
      <AIDebugPanel 
        performance={performance}
        isGenerating={isGenerating}
        onGenerateTest={generateNewAIQuestion}
      />
    </div>
  );
}