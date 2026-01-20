import { useState, useEffect } from 'react';
import { Button } from './ui/button';

import { useUserProgress } from '../hooks/useUserProgress';
import { useMascotEmotion } from '../hooks/useMascotEmotion';
import { useAIQuizGenerator } from '../hooks/useAIQuizGenerator';
import {
  CheckCircle2,
  XCircle,
  X,
  Heart,
  Trophy,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Lightbulb,
  Zap,
  Target
} from 'lucide-react';
import { BadgeUnlockAnimation } from './animations/BadgeUnlockAnimation';
import { QuizDragDrop } from './quiz/QuizDragDrop';
import { QuizCalculation } from './quiz/QuizCalculation';
import { QuizMultipleChoice } from './quiz/QuizMultipleChoice';
import { useAnimations } from '../hooks/useAnimations';
import { lessons } from '../lib/lessons';
import { getUnlockedBadges } from '../lib/badges';
import type { View } from '../App';
import type { Question, LessonSection } from '../lib/lessons';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

interface LessonViewProps {
  onNavigate: (view: View) => void;
  lessonId?: number;
}

type Step =
  | { type: 'content'; data: LessonSection }
  | { type: 'question'; data: Question };

export function LessonView({ onNavigate, lessonId = 1 }: LessonViewProps) {
  const lesson = lessons[lessonId];
  const { addXP, completeLesson } = useUserProgress();
  const { triggerXPGain, triggerQuizFeedback } = useAnimations();
  const { setActivity } = useMascotEmotion();
  const { recordAnswer } = useAIQuizGenerator();

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [hearts, setHearts] = useState(5);
  const [isLessonCompleted, setIsLessonCompleted] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [feedbackState, setFeedbackState] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [earnedXP, setEarnedXP] = useState(0);
  const [newBadgeId, setNewBadgeId] = useState<string | null>(null);
  const [steps, setSteps] = useState<Step[]>([]);
  const [isInitializing, setIsInitializing] = useState(true);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  useEffect(() => {
    if (!lesson) return;

    const initialSteps: Step[] = [];
    lesson.sections.forEach((section, idx) => {
      initialSteps.push({ type: 'content', data: section });
      if (lesson.questions[idx]) {
        initialSteps.push({ type: 'question', data: lesson.questions[idx] });
      }
    });

    if (lesson.questions.length > lesson.sections.length) {
      lesson.questions.slice(lesson.sections.length).forEach(q => {
        initialSteps.push({ type: 'question', data: q });
      });
    }

    setSteps(initialSteps);
    setIsInitializing(false);
    setActivity('lesson_start', 3000);
  }, [lesson, setActivity]);

  const currentStep = steps[currentStepIndex];
  const progress = steps.length > 0 ? ((currentStepIndex + 1) / steps.length) * 100 : 0;

  const handleCheck = async () => {
    if (currentStep.type === 'content') {
      handleNext();
      return;
    }

    const question = currentStep.data;
    let isCorrect = false;

    if (question.type === 'multiple-choice') {
      isCorrect = selectedAnswer === String(question.correctAnswer);
    } else if (question.type === 'calculation' || question.type === 'drag-drop') {
      isCorrect = selectedAnswer === 'correct';
    }

    if (isCorrect) {
      setFeedbackState('correct');
      setEarnedXP(prev => prev + question.xp);
      addXP(question.xp);
      triggerQuizFeedback(true);
      setActivity('quiz_correct', 2000);
      recordAnswer(true, lesson.title);
    } else {
      setFeedbackState('wrong');
      setHearts(prev => Math.max(0, prev - 1));
      triggerQuizFeedback(false);
      setActivity('quiz_wrong', 2000);
      recordAnswer(false, lesson.title);

      if (hearts <= 1) {
        toast.error('Hai esaurito i cuori! Riprova la lezione.');
        onNavigate('lessons');
      }
    }
  };

  const handleNext = async () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
      setFeedbackState('idle');
      setSelectedAnswer('');
    } else {
      setIsLessonCompleted(true);
      const updatedProgress = await completeLesson(lessonId);
      addXP(250);
      triggerXPGain(250);
      setActivity('lesson_complete', 5000);

      if (updatedProgress) {
        const newBadges = getUnlockedBadges(updatedProgress);
        if (newBadges.length > 0) {
          setNewBadgeId(newBadges[0]);
        }
      }
    }
  };

  if (isInitializing || !lesson) {
    return (
      <div className="min-h-screen bg-[#030305] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isLessonCompleted) {
    return (
      <div className="min-h-screen bg-[#030305] flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-purple-600/10 blur-[150px] rounded-full pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center relative z-10"
        >
          <div className="relative mb-10">
            <div className="absolute inset-0 bg-purple-500/20 blur-3xl rounded-full" />
            <div className="w-32 h-32 bg-[#0A0A0C] border border-purple-500/30 rounded-[2.5rem] flex items-center justify-center mx-auto relative z-10 shadow-[0_0_50px_-10px_rgba(168,85,247,0.4)]">
              <Trophy className="w-16 h-16 text-purple-500" />
            </div>
          </div>

          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Lezione Completata!</h1>
          <p className="text-[#888899] font-medium mb-10">Hai fatto un ottimo lavoro con "{lesson.title}"</p>

          <div className="grid grid-cols-2 gap-6 mb-10">
            <div className="bg-[#0A0A0C] p-6 rounded-3xl border border-white/[0.08]">
              <p className="text-[10px] font-bold text-[#666677] uppercase tracking-wider mb-2">XP Guadagnati</p>
              <div className="flex items-center justify-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                <p className="text-3xl font-bold text-white">+{earnedXP + 250}</p>
              </div>
            </div>
            <div className="bg-[#0A0A0C] p-6 rounded-3xl border border-white/[0.08]">
              <p className="text-[10px] font-bold text-[#666677] uppercase tracking-wider mb-2">Precisione</p>
              <div className="flex items-center justify-center gap-2">
                <Target className="w-5 h-5 text-emerald-400" />
                <p className="text-3xl font-bold text-white">100%</p>
              </div>
            </div>
          </div>

          <Button
            onClick={() => onNavigate('lessons')}
            className="w-full h-16 bg-purple-600 hover:bg-purple-500 text-white text-lg font-bold rounded-2xl shadow-[0_0_30px_rgba(139,92,246,0.4)] transition-all hover:scale-[1.02]"
          >
            Continua <ArrowRight className="w-6 h-6 ml-3" />
          </Button>
        </motion.div>

        <BadgeUnlockAnimation
          badgeId={newBadgeId}
          onClose={() => setNewBadgeId(null)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030305] text-white flex flex-col relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-purple-600/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[800px] h-[800px] bg-blue-600/5 rounded-full blur-[120px]" />
      </div>

      <header className="relative z-40 px-4 py-8 md:px-8 max-w-5xl mx-auto w-full flex items-center gap-8">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowExitConfirm(true)}
          className="w-12 h-12 bg-[#0A0A0C] border border-white/[0.08] rounded-2xl flex items-center justify-center text-[#666677] hover:text-white hover:border-white/[0.2] transition-colors"
        >
          <X className="w-6 h-6" />
        </motion.button>

        <div className="flex-1 space-y-3">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
            <span className="text-[#666677]">Progresso Lezione</span>
            <span className="text-purple-400">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-[#0A0A0C] rounded-full overflow-hidden border border-white/[0.05]">
            <motion.div
              className="h-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        <div className="flex items-center gap-3 bg-[#0A0A0C] border border-white/[0.08] px-4 py-2 rounded-2xl">
          <Heart className={`w-6 h-6 ${hearts > 0 ? 'text-red-500 fill-red-500' : 'text-[#333344]'}`} />
          <span className="font-bold text-xl">{hearts}</span>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-12 max-w-3xl mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStepIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full"
          >
            {currentStep.type === 'content' ? (
              <div className="space-y-10">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-purple-500/10 border border-purple-500/20 rounded-2xl flex items-center justify-center shadow-[0_0_30px_-10px_rgba(168,85,247,0.3)]">
                    <Lightbulb className="w-8 h-8 text-purple-500" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight leading-tight">
                    {currentStep.data.title}
                  </h2>
                </div>

                <div className="bg-[#0A0A0C] border border-white/[0.08] p-10 rounded-[32px] relative overflow-hidden">
                  <div className="relative z-10 leading-relaxed text-xl text-[#888899] font-medium space-y-6">
                    {currentStep.data.content.split('\n').map((line, i) => (
                      <p key={i}>{line}</p>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full space-y-8">
                <div className="flex items-center gap-6 mb-8">
                  <div className="w-16 h-16 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center shadow-[0_0_30px_-10px_rgba(59,130,246,0.3)]">
                    <Sparkles className="w-8 h-8 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-blue-400 text-[10px] font-bold uppercase tracking-widest mb-1">Sfida Rapida</p>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Metti alla prova le tue conoscenze</h2>
                  </div>
                </div>

                {currentStep.data.type === 'multiple-choice' && (
                  <QuizMultipleChoice
                    question={currentStep.data.question}
                    options={currentStep.data.options || []}
                    correctAnswer={currentStep.data.correctAnswer as number}
                    selectedAnswer={selectedAnswer}
                    onSelect={setSelectedAnswer}
                    feedbackState={feedbackState}
                    disabled={feedbackState !== 'idle'}
                  />
                )}

                {currentStep.data.type === 'calculation' && (
                  <QuizCalculation
                    question={currentStep.data.question}
                    correctAnswer={currentStep.data.correctAnswer as number}
                    explanation={currentStep.data.explanation}
                    onAnswer={(correct) => {
                      setSelectedAnswer(correct ? 'correct' : 'wrong');
                    }}
                    disabled={feedbackState !== 'idle'}
                  />
                )}

                {currentStep.data.type === 'drag-drop' && (
                  <QuizDragDrop
                    question={currentStep.data.question}
                    items={currentStep.data.options || []}
                    correctOrder={currentStep.data.correctAnswer as unknown as number[]}
                    explanation={currentStep.data.explanation}
                    onAnswer={(correct) => {
                      setSelectedAnswer(correct ? 'correct' : 'wrong');
                    }}
                    disabled={feedbackState !== 'idle'}
                  />
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className={`
        relative z-50 p-8 border-t transition-all duration-500
        ${feedbackState === 'idle' ? 'bg-[#0A0A0C] border-white/[0.05]' :
          feedbackState === 'correct' ? 'bg-emerald-950/50 border-emerald-500/20' :
            'bg-red-950/50 border-red-500/20'}
      `}>
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex-1">
            <AnimatePresence mode="wait">
              {feedbackState === 'correct' && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center gap-6"
                >
                  <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                  </div>
                  <div>
                    <p className="font-bold text-xl text-white tracking-tight">Eccellente!</p>
                    <p className="text-emerald-400/70 text-sm font-medium">{currentStep.type === 'question' ? currentStep.data.explanation : ''}</p>
                  </div>
                </motion.div>
              )}
              {feedbackState === 'wrong' && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center gap-6"
                >
                  <div className="w-14 h-14 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center">
                    <XCircle className="w-8 h-8 text-red-500" />
                  </div>
                  <div>
                    <p className="font-bold text-xl text-white tracking-tight">Quasi...</p>
                    <p className="text-red-400/70 text-sm font-medium">{currentStep.type === 'question' ? currentStep.data.explanation : ''}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Button
            onClick={feedbackState === 'idle' ? handleCheck : handleNext}
            disabled={currentStep?.type === 'question' && !selectedAnswer && feedbackState === 'idle'}
            className={`
              w-full md:w-64 h-16 text-base font-bold uppercase tracking-wider rounded-xl transition-all duration-300 shadow-lg
              ${feedbackState === 'idle' ? 'bg-purple-600 hover:bg-purple-500 shadow-purple-600/20' :
                feedbackState === 'correct' ? 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-emerald-500/20' :
                  'bg-red-500 hover:bg-red-400 text-white shadow-red-500/20'}
              disabled:opacity-50 disabled:grayscale
            `}
          >
            {feedbackState === 'idle' ? (currentStep?.type === 'content' ? 'Continua' : 'Verifica') : 'Continua'}
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </footer>

      {/* Exit Confirmation Modal */}
      <AnimatePresence>
        {showExitConfirm && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <div className="max-w-sm w-full p-8 bg-[#0A0A0C] border border-white/[0.1] text-center rounded-[32px] shadow-2xl">
                <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <XCircle className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Vuoi uscire?</h3>
                <p className="text-[#888899] text-sm mb-8">I tuoi progressi in questa lezione andranno persi.</p>
                <div className="space-y-3">
                  <Button
                    onClick={() => onNavigate('lessons')}
                    variant="ghost"
                    className="w-full h-12 text-red-500 hover:text-red-400 hover:bg-red-500/5 font-bold uppercase text-xs tracking-wider"
                  >
                    Esci comunque
                  </Button>
                  <Button
                    onClick={() => setShowExitConfirm(false)}
                    className="w-full h-12 bg-purple-600 hover:bg-purple-500 text-white font-bold uppercase text-xs tracking-wider rounded-xl"
                  >
                    Continua lezione
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}