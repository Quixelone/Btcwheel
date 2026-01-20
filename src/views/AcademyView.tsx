/**
 * AcademyView - BTC Wheel Pro 2.0
 * 
 * Sezione Academy con:
 * - Overview Percorso con fasi reali
 * - Lezioni da lessons.ts
 * - Quiz interattivi
 * - Risorse
 */

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
    BookOpen,
    Play,
    Headphones,
    CheckCircle2,
    Lock,
    ChevronRight,
    FileText,
    HelpCircle,
    ArrowLeft,
    Trophy,
    Star,
    Sparkles,
    Clock
} from 'lucide-react';
import type { View } from '../types/navigation';
import { PageWrapper, PageContent, PageHeader, SectionHeader } from '../components/layout/PageWrapper';
import { BaseCard, ActionCard, ProgressCard } from '../components/ui/cards';
import { useUserProgress } from '../hooks/useUserProgress';
import { lessons, type Lesson, type Question } from '../lib/lessons';
import {
    coursePhases,
    getPhaseLesson,
    getPhaseProgress,
    isPhaseUnlocked,
    getNextLesson,
    getTotalProgress,
    getLessonPhase
} from '../lib/course-structure';
import { toast } from 'sonner';

interface AcademyViewProps {
    currentView: View;
    lessonId?: number;
    onNavigate: (view: View, params?: { lessonId?: number }) => void;
}

import { prepareQuiz, type ShuffledQuestion } from '../utils/quizUtils';

// ... imports

export function AcademyView({ currentView, lessonId = 1, onNavigate }: AcademyViewProps) {
    const { progress, addXP, completeLesson } = useUserProgress();

    // State for quiz
    const [quizQuestions, setQuizQuestions] = useState<ShuffledQuestion[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [isAnswerChecked, setIsAnswerChecked] = useState(false);
    const [correctAnswers, setCorrectAnswers] = useState(0);
    const [quizCompleted, setQuizCompleted] = useState(false);

    // Get current lesson
    const currentLesson = lessons[lessonId];
    const currentPhase = getLessonPhase(lessonId);

    // Initialize quiz when entering quiz view or changing lesson
    useEffect(() => {
        if (currentView === 'quiz' && currentLesson) {
            setQuizQuestions(prepareQuiz(currentLesson));
            setCurrentQuestionIndex(0);
            setSelectedAnswer(null);
            setIsAnswerChecked(false);
            setCorrectAnswers(0);
            setQuizCompleted(false);
        }
    }, [currentView, lessonId, currentLesson]);

    // Get completed lessons from localStorage
    const getCompletedLessons = (): number[] => {
        const saved = localStorage.getItem('btcwheel_completed_lessons');
        return saved ? JSON.parse(saved) : [];
    };

    const [completedLessons, setCompletedLessons] = useState<number[]>(getCompletedLessons);

    const saveCompletedLesson = (id: number) => {
        const updated = [...new Set([...completedLessons, id])];
        setCompletedLessons(updated);
        localStorage.setItem('btcwheel_completed_lessons', JSON.stringify(updated));
    };

    // Quiz handlers
    const handleAnswerSelect = (answerIndex: number) => {
        if (!isAnswerChecked) {
            setSelectedAnswer(answerIndex);
        }
    };

    const handleCheckAnswer = () => {
        if (selectedAnswer === null || quizQuestions.length === 0) return;

        setIsAnswerChecked(true);
        const question = quizQuestions[currentQuestionIndex];

        if (selectedAnswer === question.correctAnswer) {
            setCorrectAnswers(prev => prev + 1);
            addXP(question.xp);
            toast.success(`Corretto! +${question.xp} XP`);
        } else {
            toast.error('Risposta sbagliata');
        }
    };

    const handleNextQuestion = () => {
        if (quizQuestions.length === 0) return;

        if (currentQuestionIndex < quizQuestions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setSelectedAnswer(null);
            setIsAnswerChecked(false);
        } else {
            // Quiz completed
            setQuizCompleted(true);
            saveCompletedLesson(lessonId);
            completeLesson(lessonId);

            const percentage = Math.round((correctAnswers / quizQuestions.length) * 100);
            if (percentage >= 70) {
                toast.success('🎉 Lezione completata!');
            }
        }
    };

    // ============================================
    // LESSON VIEW
    // ============================================
    if (currentView === 'lesson' && currentLesson) {
        return (
            <PageWrapper>
                <PageContent>
                    <button
                        onClick={() => onNavigate('academy')}
                        className="flex items-center gap-2 text-[#888899] hover:text-white mb-6 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="text-sm font-medium">Torna al percorso</span>
                    </button>

                    <PageHeader
                        title={currentLesson.title}
                        subtitle={currentLesson.description}
                        badge={
                            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
                                {currentPhase?.name || 'Lezione'} • {currentLesson.estimatedTime}
                            </span>
                        }
                    />

                    {/* Lesson Info */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                        <BaseCard className="text-center py-4">
                            <Clock className="w-5 h-5 text-cyan-400 mx-auto mb-2" />
                            <p className="text-sm font-bold text-white">{currentLesson.estimatedTime}</p>
                            <p className="text-xs text-[#666677]">Durata</p>
                        </BaseCard>
                        <BaseCard className="text-center py-4">
                            <Star className="w-5 h-5 text-yellow-400 mx-auto mb-2" />
                            <p className="text-sm font-bold text-white capitalize">{currentLesson.difficulty}</p>
                            <p className="text-xs text-[#666677]">Difficoltà</p>
                        </BaseCard>
                        <BaseCard className="text-center py-4">
                            <Trophy className="w-5 h-5 text-purple-400 mx-auto mb-2" />
                            <p className="text-sm font-bold text-white">
                                {currentLesson.questions.reduce((sum, q) => sum + q.xp, 0)} XP
                            </p>
                            <p className="text-xs text-[#666677]">Ricompensa</p>
                        </BaseCard>
                    </div>

                    {/* Media Options */}
                    <div className="grid md:grid-cols-2 gap-4 mb-8">
                        <BaseCard onClick={() => { }} className="group">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Play className="w-8 h-8 text-purple-400" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-lg">Guarda Video</h3>
                                    <p className="text-sm text-[#666677]">{currentLesson.estimatedTime}</p>
                                </div>
                            </div>
                        </BaseCard>

                        <BaseCard onClick={() => { }} className="group">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Headphones className="w-8 h-8 text-cyan-400" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-lg">Ascolta Podcast</h3>
                                    <p className="text-sm text-[#666677]">Disponibile su Telegram</p>
                                </div>
                            </div>
                        </BaseCard>
                    </div>

                    {/* Lesson Content Sections */}
                    <section>
                        <SectionHeader title="Contenuto" />
                        <div className="space-y-4 mt-6">
                            {currentLesson.sections.map((section, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <BaseCard>
                                        <div className="flex items-start gap-4">
                                            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-sm font-bold text-purple-400 shrink-0">
                                                {index + 1}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-white mb-2">{section.title}</h4>
                                                <p className="text-sm text-[#888899] leading-relaxed">{section.content}</p>
                                            </div>
                                        </div>
                                    </BaseCard>
                                </motion.div>
                            ))}
                        </div>
                    </section>

                    {/* Start Quiz Button */}
                    <div className="flex justify-center mt-8">
                        <button
                            onClick={() => onNavigate('quiz', { lessonId })}
                            className="px-8 py-4 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-2xl shadow-[0_0_30px_rgba(147,51,234,0.4)] hover:shadow-[0_0_40px_rgba(147,51,234,0.6)] transition-all hover:scale-105"
                        >
                            <span className="flex items-center gap-2">
                                <HelpCircle className="w-5 h-5" />
                                Inizia il Quiz ({currentLesson.questions.length} domande)
                            </span>
                        </button>
                    </div>
                </PageContent>
            </PageWrapper>
        );
    }

    // ============================================
    // QUIZ VIEW
    // ============================================
    // ============================================
    // QUIZ VIEW
    // ============================================
    if (currentView === 'quiz' && currentLesson) {
        // Se non ci sono domande caricate (es. primo render), mostra loading o niente
        if (quizQuestions.length === 0) return null;

        const question = quizQuestions[currentQuestionIndex];

        if (quizCompleted) {
            const percentage = Math.round((correctAnswers / quizQuestions.length) * 100);
            const passed = percentage >= 70;

            return (
                <PageWrapper>
                    <PageContent>
                        <div className="max-w-lg mx-auto text-center py-12">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', stiffness: 200 }}
                                className={`w-24 h-24 rounded-full mx-auto mb-8 flex items-center justify-center ${passed ? 'bg-green-500/20 border-2 border-green-500' : 'bg-red-500/20 border-2 border-red-500'
                                    }`}
                            >
                                {passed ? (
                                    <Trophy className="w-12 h-12 text-green-400" />
                                ) : (
                                    <HelpCircle className="w-12 h-12 text-red-400" />
                                )}
                            </motion.div>

                            <h2 className="text-3xl font-black text-white mb-3">
                                {passed ? '🎉 Lezione Completata!' : '📚 Riprova'}
                            </h2>

                            <p className="text-[#888899] mb-8">
                                Hai risposto correttamente a {correctAnswers} domande su {quizQuestions.length}
                            </p>

                            <div className="mb-8 p-6 rounded-2xl bg-white/[0.03] border border-white/[0.05]">
                                <div className="text-5xl font-black mb-2" style={{
                                    color: passed ? '#10b981' : '#ef4444'
                                }}>
                                    {percentage}%
                                </div>
                                <p className="text-sm text-[#666677]">
                                    {passed ? 'Ottimo lavoro!' : 'Serve il 70% per passare'}
                                </p>
                            </div>

                            <div className="flex gap-3 justify-center">
                                {!passed && (
                                    <button
                                        onClick={() => {
                                            // Reshuffle on retry!
                                            setQuizQuestions(prepareQuiz(currentLesson));
                                            setCurrentQuestionIndex(0);
                                            setSelectedAnswer(null);
                                            setIsAnswerChecked(false);
                                            setCorrectAnswers(0);
                                            setQuizCompleted(false);
                                        }}
                                        className="px-6 py-3 bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-white font-bold rounded-xl transition-all"
                                    >
                                        Riprova
                                    </button>
                                )}
                                <button
                                    onClick={() => onNavigate('academy')}
                                    className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-all"
                                >
                                    Torna al Percorso
                                </button>
                            </div>
                        </div>
                    </PageContent>
                </PageWrapper>
            );
        }

        return (
            <PageWrapper>
                <PageContent>
                    <button
                        onClick={() => onNavigate('lesson', { lessonId })}
                        className="flex items-center gap-2 text-[#888899] hover:text-white mb-6 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="text-sm font-medium">Torna alla lezione</span>
                    </button>

                    {/* Progress */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-[#666677]">
                                Domanda {currentQuestionIndex + 1} di {quizQuestions.length}
                            </span>
                            <span className="text-sm text-purple-400 font-bold">
                                +{question.xp} XP
                            </span>
                        </div>
                        <div className="h-2 bg-white/[0.05] rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-purple-500"
                                initial={{ width: 0 }}
                                animate={{ width: `${((currentQuestionIndex + 1) / quizQuestions.length) * 100}%` }}
                            />
                        </div>
                    </div>

                    {/* Question */}
                    <BaseCard className="mb-6">
                        <h2 className="text-xl font-bold text-white mb-2">
                            {question.question}
                        </h2>
                    </BaseCard>

                    {/* Options */}
                    <div className="space-y-3 mb-8">
                        {question.options?.map((option, index) => {
                            const isSelected = selectedAnswer === index;
                            const isCorrect = index === question.correctAnswer;
                            const showResult = isAnswerChecked;

                            let borderColor = 'border-white/[0.05]';
                            let bgColor = 'bg-white/[0.02]';

                            if (isSelected && !showResult) {
                                borderColor = 'border-purple-500/50';
                                bgColor = 'bg-purple-500/10';
                            }
                            if (showResult && isCorrect) {
                                borderColor = 'border-green-500/50';
                                bgColor = 'bg-green-500/10';
                            }
                            if (showResult && isSelected && !isCorrect) {
                                borderColor = 'border-red-500/50';
                                bgColor = 'bg-red-500/10';
                            }

                            return (
                                <motion.button
                                    key={index}
                                    onClick={() => handleAnswerSelect(index)}
                                    disabled={isAnswerChecked}
                                    whileHover={!isAnswerChecked ? { scale: 1.01 } : {}}
                                    whileTap={!isAnswerChecked ? { scale: 0.99 } : {}}
                                    className={`w-full p-4 rounded-xl border ${borderColor} ${bgColor} text-left transition-all ${!isAnswerChecked ? 'hover:border-purple-500/30 cursor-pointer' : 'cursor-default'
                                        }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${isSelected ? 'bg-purple-500/20 text-purple-400' : 'bg-white/[0.05] text-[#666677]'
                                            }`}>
                                            {String.fromCharCode(65 + index)}
                                        </div>
                                        <span className="text-white">{option}</span>
                                        {showResult && isCorrect && (
                                            <CheckCircle2 className="w-5 h-5 text-green-400 ml-auto" />
                                        )}
                                    </div>
                                </motion.button>
                            );
                        })}
                    </div>

                    {/* Explanation */}
                    {isAnswerChecked && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-8"
                        >
                            <BaseCard className="border-cyan-500/20">
                                <div className="flex gap-3">
                                    <Sparkles className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-bold text-cyan-400 mb-1">Spiegazione</p>
                                        <p className="text-sm text-[#888899]">{question.explanation}</p>
                                    </div>
                                </div>
                            </BaseCard>
                        </motion.div>
                    )}

                    {/* Action Button */}
                    <div className="flex justify-center">
                        {!isAnswerChecked ? (
                            <button
                                onClick={handleCheckAnswer}
                                disabled={selectedAnswer === null}
                                className={`px-8 py-4 font-bold rounded-2xl transition-all ${selectedAnswer !== null
                                    ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_30px_rgba(147,51,234,0.4)]'
                                    : 'bg-white/[0.05] text-[#666677] cursor-not-allowed'
                                    }`}
                            >
                                Verifica Risposta
                            </button>
                        ) : (
                            <button
                                onClick={handleNextQuestion}
                                className="px-8 py-4 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-2xl shadow-[0_0_30px_rgba(147,51,234,0.4)] hover:shadow-[0_0_40px_rgba(147,51,234,0.6)] transition-all"
                            >
                                {currentQuestionIndex < quizQuestions.length - 1 ? 'Prossima Domanda' : 'Completa Quiz'}
                            </button>
                        )}
                    </div>
                </PageContent>
            </PageWrapper>
        );
    }

    // ============================================
    // RESOURCES VIEW
    // ============================================
    if (currentView === 'resources') {
        return (
            <PageWrapper>
                <PageContent>
                    <button
                        onClick={() => onNavigate('academy')}
                        className="flex items-center gap-2 text-[#888899] hover:text-white mb-6 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="text-sm font-medium">Torna all'Academy</span>
                    </button>

                    <PageHeader
                        title="Risorse"
                        subtitle="Glossario, FAQ e materiali aggiuntivi"
                    />

                    <div className="grid md:grid-cols-3 gap-4">
                        <ActionCard
                            title="Glossario"
                            description="Tutti i termini del trading"
                            icon={FileText}
                            iconColor="text-purple-400"
                            iconBg="bg-purple-500/10"
                            onClick={() => { }}
                        />
                        <ActionCard
                            title="FAQ"
                            description="Domande frequenti"
                            icon={HelpCircle}
                            iconColor="text-cyan-400"
                            iconBg="bg-cyan-500/10"
                            onClick={() => { }}
                        />
                        <ActionCard
                            title="Podcast Library"
                            description="Tutte le lezioni in audio"
                            icon={Headphones}
                            iconColor="text-yellow-400"
                            iconBg="bg-yellow-500/10"
                            onClick={() => { }}
                        />
                    </div>
                </PageContent>
            </PageWrapper>
        );
    }

    // ============================================
    // MAIN ACADEMY VIEW (Overview)
    // ============================================
    const totalProgress = getTotalProgress(completedLessons);
    const nextLesson = getNextLesson(completedLessons);

    return (
        <PageWrapper>
            <PageContent>
                <PageHeader
                    title="Academy"
                    subtitle="Il tuo percorso verso la maestria della Wheel Strategy"
                />

                {/* Overall Progress */}
                <ProgressCard
                    title="Il Tuo Percorso"
                    subtitle="Completa tutte le lezioni per diventare un Wheel Master"
                    progress={totalProgress.percentage}
                    progressLabel={`${totalProgress.completed}/${totalProgress.total} lezioni completate`}
                    color="purple"
                    icon={BookOpen}
                />

                {/* Phases */}
                {coursePhases.map((phase) => {
                    const phaseProgress = getPhaseProgress(phase.id, completedLessons);
                    const unlocked = isPhaseUnlocked(phase.id, completedLessons);
                    const phaseLessons = getPhaseLesson(phase.id);

                    return (
                        <section key={phase.id}>
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className={`
                                        w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm
                                        ${!unlocked
                                            ? 'bg-white/[0.03] text-[#444455] border border-white/[0.05]'
                                            : phaseProgress.percentage === 100
                                                ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                                                : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                                        }
                                    `}>
                                        {!unlocked ? (
                                            <Lock className="w-5 h-5" />
                                        ) : phaseProgress.percentage === 100 ? (
                                            <CheckCircle2 className="w-5 h-5" />
                                        ) : (
                                            phase.id
                                        )}
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-white">{phase.name}</h2>
                                        <p className="text-xs text-[#666677]">{phase.description}</p>
                                    </div>
                                </div>
                                {unlocked && (
                                    <span className="text-sm text-[#888899]">
                                        {phaseProgress.completed}/{phaseProgress.total}
                                    </span>
                                )}
                            </div>

                            {unlocked ? (
                                <div className="space-y-2">
                                    {phaseLessons.map((lesson, lessonIndex) => {
                                        const isCompleted = completedLessons.includes(lesson.id);
                                        const isCurrent = nextLesson?.lessonId === lesson.id;

                                        return (
                                            <motion.div
                                                key={lesson.id}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: lessonIndex * 0.05 }}
                                            >
                                                <BaseCard
                                                    onClick={() => onNavigate('lesson', { lessonId: lesson.id })}
                                                    className={`group ${isCurrent ? 'border-purple-500/30' : ''}`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-4">
                                                            <div className={`
                                                                w-8 h-8 rounded-lg flex items-center justify-center
                                                                ${isCompleted
                                                                    ? 'bg-green-500/10 text-green-400'
                                                                    : isCurrent
                                                                        ? 'bg-purple-500/10 text-purple-400'
                                                                        : 'bg-white/[0.03] text-[#666677]'
                                                                }
                                                            `}>
                                                                {isCompleted ? (
                                                                    <CheckCircle2 className="w-5 h-5" />
                                                                ) : (
                                                                    <span className="text-sm font-bold">{lessonIndex + 1}</span>
                                                                )}
                                                            </div>
                                                            <div>
                                                                <div className="flex items-center gap-2">
                                                                    <span className={`font-medium ${isCurrent ? 'text-white' : isCompleted ? 'text-[#888899]' : 'text-white'}`}>
                                                                        {lesson.title}
                                                                    </span>
                                                                    {isCurrent && (
                                                                        <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400">
                                                                            Prossima
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <span className="text-xs text-[#666677]">{lesson.estimatedTime}</span>
                                                            </div>
                                                        </div>
                                                        <ChevronRight className="w-5 h-5 text-[#444455] group-hover:text-white transition-colors" />
                                                    </div>
                                                </BaseCard>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <BaseCard className="opacity-50">
                                    <div className="flex items-center gap-4 py-4">
                                        <Lock className="w-5 h-5 text-[#444455]" />
                                        <span className="text-[#666677]">Completa la fase precedente per sbloccare</span>
                                    </div>
                                </BaseCard>
                            )}
                        </section>
                    );
                })}

                {/* Resources Link */}
                <ActionCard
                    title="Risorse Aggiuntive"
                    description="Glossario, FAQ e podcast library"
                    icon={FileText}
                    iconColor="text-cyan-400"
                    iconBg="bg-cyan-500/10"
                    onClick={() => onNavigate('resources')}
                />
            </PageContent>
        </PageWrapper>
    );
}

export default AcademyView;
