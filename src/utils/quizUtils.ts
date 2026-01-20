import { Lesson, Question } from '../lib/lessons';

/**
 * Interfaccia per una domanda processata (shuffled)
 * Mantiene il riferimento all'indice originale per la validazione se necessario,
 * ma qui ricalcoliamo tutto per semplicità.
 */
export interface ShuffledQuestion extends Omit<Question, 'correctAnswer'> {
    options: string[];
    correctAnswer: number; // Nuovo indice della risposta corretta
    originalIndex: number; // Indice originale della domanda nel file lessons
}

/**
 * Mescola un array usando l'algoritmo Fisher-Yates
 */
function shuffleArray<T>(array: T[]): T[] {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

/**
 * Prepara un quiz mescolando domande e risposte
 * @param lesson La lezione originale
 * @param maxQuestions Numero massimo di domande da includere (opzionale)
 */
export function prepareQuiz(lesson: Lesson, maxQuestions?: number): ShuffledQuestion[] {
    // 1. Mescola le domande
    let questions = shuffleArray(lesson.questions.map((q, index) => ({ ...q, originalIndex: index })));

    // 2. Limita il numero di domande se richiesto
    if (maxQuestions && maxQuestions < questions.length) {
        questions = questions.slice(0, maxQuestions);
    }

    // 3. Mescola le opzioni per ogni domanda e aggiorna l'indice della risposta corretta
    return questions.map(q => {
        if (!q.options || q.options.length === 0) return { ...q, correctAnswer: -1, options: [] };

        // Crea un array di oggetti { testo, isCorrect }
        const optionsWithValidity = q.options.map((opt, idx) => ({
            text: opt,
            isCorrect: idx === q.correctAnswer
        }));

        // Mescola le opzioni
        const shuffledOptions = shuffleArray(optionsWithValidity);

        // Trova il nuovo indice della risposta corretta
        const newCorrectAnswerIndex = shuffledOptions.findIndex(opt => opt.isCorrect);

        return {
            ...q,
            options: shuffledOptions.map(opt => opt.text),
            correctAnswer: newCorrectAnswerIndex
        };
    });
}
