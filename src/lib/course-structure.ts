/**
 * Course Structure - BTC Wheel Pro
 * 
 * Organizza le lezioni in fasi del percorso formativo.
 * Le fasi definite nel PROJECT_OVERVIEW.md:
 * - Fase 1: Fondamenta (6 lezioni)
 * - Fase 2: Costruzione (6 lezioni)
 * - Fase 3: Consolidamento (4 lezioni)
 * - Fase 4: Maestria (ongoing)
 */

import { lessons, type Lesson } from './lessons';

export interface CoursePhase {
    id: number;
    name: string;
    description: string;
    duration: string;
    lessonIds: number[];
    requiredPhaseId?: number; // Fase precedente da completare
}

export interface CourseProgress {
    completedLessons: number[];
    currentLessonId: number;
    currentPhaseId: number;
    totalXP: number;
}

// Definizione delle fasi del corso
export const coursePhases: CoursePhase[] = [
    {
        id: 1,
        name: 'Fondamenta',
        description: 'Le basi per iniziare il tuo percorso nella Wheel Strategy',
        duration: 'Settimane 1-4',
        lessonIds: [1, 2, 3, 16, 17, 18], // Bitcoin, Volatilità, Opzioni, Interesse Composto, PAC, Setup Exchange
    },
    {
        id: 2,
        name: 'Costruzione',
        description: 'Inizia a operare con le prime strategie',
        duration: 'Mesi 2-6',
        lessonIds: [4, 5, 6, 7, 8, 9], // Cash-Secured Put, Covered Call, Wheel Strategy, Greeks, Risk Management, Roll & Adjust
        requiredPhaseId: 1,
    },
    {
        id: 3,
        name: 'Consolidamento',
        description: 'Strategie avanzate e ottimizzazione',
        duration: 'Mesi 6-12',
        lessonIds: [10, 11, 12, 13], // IV, Analisi Tecnica, Tax, Piattaforme
        requiredPhaseId: 2,
    },
    {
        id: 4,
        name: 'Maestria',
        description: 'Tecniche avanzate e perfezionamento continuo',
        duration: 'Anno 2+',
        lessonIds: [14, 15], // Psicologia, Master Strategies
        requiredPhaseId: 3,
    },
];

/**
 * Ottiene tutte le lezioni di una fase
 */
export function getPhaseLesson(phaseId: number): Lesson[] {
    const phase = coursePhases.find(p => p.id === phaseId);
    if (!phase) return [];

    return phase.lessonIds
        .map(id => lessons[id])
        .filter((lesson): lesson is Lesson => lesson !== undefined);
}

/**
 * Calcola il progresso di una fase
 */
export function getPhaseProgress(phaseId: number, completedLessons: number[]): { completed: number; total: number; percentage: number } {
    const phase = coursePhases.find(p => p.id === phaseId);
    if (!phase) return { completed: 0, total: 0, percentage: 0 };

    const completed = phase.lessonIds.filter(id => completedLessons.includes(id)).length;
    const total = phase.lessonIds.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { completed, total, percentage };
}

/**
 * Verifica se una fase è sbloccata
 */
export function isPhaseUnlocked(phaseId: number, completedLessons: number[]): boolean {
    const phase = coursePhases.find(p => p.id === phaseId);
    if (!phase) return false;

    // La prima fase è sempre sbloccata
    if (!phase.requiredPhaseId) return true;

    // Verifica che la fase precedente sia completata
    const { percentage } = getPhaseProgress(phase.requiredPhaseId, completedLessons);
    return percentage >= 100;
}

/**
 * Ottiene la prossima lezione da completare
 */
export function getNextLesson(completedLessons: number[]): { lessonId: number; phaseId: number } | null {
    for (const phase of coursePhases) {
        if (!isPhaseUnlocked(phase.id, completedLessons)) continue;

        const nextLessonId = phase.lessonIds.find(id => !completedLessons.includes(id));
        if (nextLessonId !== undefined) {
            return { lessonId: nextLessonId, phaseId: phase.id };
        }
    }

    return null; // Tutte le lezioni completate
}

/**
 * Calcola il progresso totale del corso
 */
export function getTotalProgress(completedLessons: number[]): { completed: number; total: number; percentage: number } {
    const totalLessons = coursePhases.flatMap(p => p.lessonIds);
    const uniqueLessons = [...new Set(totalLessons)];
    const completed = uniqueLessons.filter(id => completedLessons.includes(id)).length;
    const total = uniqueLessons.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { completed, total, percentage };
}

/**
 * Mappa lezione -> fase
 */
export function getLessonPhase(lessonId: number): CoursePhase | undefined {
    return coursePhases.find(phase => phase.lessonIds.includes(lessonId));
}

export default coursePhases;
