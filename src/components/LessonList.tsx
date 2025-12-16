import { Navigation } from './Navigation';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { useUserProgress } from '../hooks/useUserProgress';
import { lessons } from '../lib/lessons';
import { Lock, CheckCircle, Book, Clock, TrendingUp } from 'lucide-react';
import type { View } from '../App';

interface LessonListProps {
  onNavigate: (view: View, lessonId?: number) => void;
}

const difficultyColors = {
  beginner: 'bg-green-100 text-green-800',
  intermediate: 'bg-yellow-100 text-yellow-800',
  advanced: 'bg-red-100 text-red-800'
};

const difficultyLabels = {
  beginner: 'Principiante',
  intermediate: 'Intermedio',
  advanced: 'Avanzato'
};

export function LessonList({ onNavigate }: LessonListProps) {
  const { progress } = useUserProgress();
  
  // Calculate completion stats
  const totalLessons = Object.keys(lessons).length;
  const completedLessons = progress.completedLessons.length;
  const completionPercentage = (completedLessons / totalLessons) * 100;

  const handleLessonClick = (lessonId: number) => {
    const lesson = lessons[lessonId];
    
    // Check if lesson is locked
    if (progress.level < lesson.requiredLevel) {
      return; // Locked lesson, do nothing
    }
    
    onNavigate('lesson', lessonId);
  };

  return (
    <div className="min-h-screen md:pl-20 pb-24 md:pb-0 bg-gray-50">
      <Navigation currentView="home" onNavigate={(view) => onNavigate(view)} />
      
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-8 md:px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-white mb-2">📚 Percorso Formativo</h1>
          <p className="text-blue-100 mb-6">
            Impara la Bitcoin Wheel Strategy passo dopo passo
          </p>
          
          {/* Progress Summary */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white">Progresso Totale</span>
              <span className="text-white">{completedLessons}/{totalLessons} Lezioni</span>
            </div>
            <Progress value={completionPercentage} className="h-3 bg-white/20" />
            <p className="text-blue-100 text-sm mt-2">
              {completionPercentage === 100 
                ? '🎉 Hai completato tutte le lezioni!' 
                : `Ancora ${totalLessons - completedLessons} lezioni da completare`}
            </p>
          </Card>
        </div>
      </header>

      {/* Lessons Grid */}
      <main className="max-w-6xl mx-auto px-4 py-6 md:px-6 md:py-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {Object.values(lessons).map((lesson) => {
            const isCompleted = progress.completedLessons.includes(lesson.id);
            const isLocked = progress.level < lesson.requiredLevel;
            const isAvailable = !isLocked;

            return (
              <Card
                key={lesson.id}
                className={`p-5 transition-all cursor-pointer ${
                  isLocked
                    ? 'opacity-60 cursor-not-allowed bg-gray-100'
                    : 'hover:shadow-lg hover:-translate-y-1'
                } ${isCompleted ? 'border-green-500 border-2' : ''}`}
                onClick={() => handleLessonClick(lesson.id)}
              >
                {/* Lesson Number & Status */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isCompleted 
                        ? 'bg-green-500 text-white' 
                        : isLocked
                        ? 'bg-gray-300 text-gray-600'
                        : 'bg-blue-600 text-white'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : isLocked ? (
                        <Lock className="w-5 h-5" />
                      ) : (
                        <span className="font-bold">{lesson.id}</span>
                      )}
                    </div>
                    <Badge className={difficultyColors[lesson.difficulty]}>
                      {difficultyLabels[lesson.difficulty]}
                    </Badge>
                  </div>
                </div>

                {/* Lesson Title */}
                <h3 className="text-gray-900 mb-2 line-clamp-2 min-h-[3.5rem]">
                  {lesson.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-3 min-h-[4rem]">
                  {lesson.description}
                </p>

                {/* Meta Info */}
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{lesson.estimatedTime}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Book className="w-4 h-4" />
                    <span>{lesson.questions.length} Quiz</span>
                  </div>
                </div>

                {/* Lock Info or CTA */}
                {isLocked ? (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Lock className="w-4 h-4" />
                    <span>Livello {lesson.requiredLevel} richiesto</span>
                  </div>
                ) : isCompleted ? (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span>Completata</span>
                  </div>
                ) : (
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLessonClick(lesson.id);
                    }}
                  >
                    Inizia Lezione
                  </Button>
                )}
              </Card>
            );
          })}
        </div>

        {/* Learning Path Info */}
        <Card className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-gray-900 mb-2">📈 Percorso di Apprendimento Progressivo</h3>
              <p className="text-gray-700 mb-3">
                Ogni lezione sblocca nuovi contenuti. Completa le lezioni in ordine per massimizzare 
                la comprensione e guadagnare XP per salire di livello!
              </p>
              <div className="bg-white/60 rounded-lg p-3 text-sm space-y-1">
                <p className="text-gray-700">
                  ✅ <strong>Livello {progress.level}</strong> attuale • {progress.xp} XP
                </p>
                <p className="text-gray-600">
                  🔓 Hai accesso a {Object.values(lessons).filter(l => l.requiredLevel <= progress.level).length} lezioni
                </p>
                <p className="text-gray-600">
                  🔒 {Object.values(lessons).filter(l => l.requiredLevel > progress.level).length} lezioni ancora da sbloccare
                </p>
              </div>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}
