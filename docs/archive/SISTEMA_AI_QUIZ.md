# 🤖 Sistema Quiz AI Dinamico - Documentazione Completa

## 📋 Panoramica

Abbiamo trasformato il sistema quiz da **statico e ripetitivo** a **completamente dinamico e intelligente** con AI, creando un'esperienza di apprendimento adattiva e personalizzata.

---

## ✅ Funzionalità Implementate

### 1️⃣ **Generazione Domande AI**
- ✅ GPT-4o-mini / Grok-beta per domande uniche
- ✅ Nessuna ripetizione (tracking storico domande)
- ✅ Difficoltà adattiva (easy → medium → hard)
- ✅ Focus su punti deboli dell'utente
- ✅ Randomizzazione opzioni risposta
- ✅ Generazione automatica ogni 2 risposte corrette

### 2️⃣ **Sistema Tentativi Limitati**
- ✅ Max 3 tentativi per domanda
- ✅ Penalità XP per tentativi multipli
- ✅ Hint dopo 2 errori consecutivi
- ✅ Tracking errori per domanda

### 3️⃣ **Performance Tracking Avanzato**
```typescript
{
  correctAnswers: number,
  wrongAnswers: number,
  consecutiveWrong: number,
  accuracy: number,
  difficultyLevel: 'easy' | 'medium' | 'hard',
  previousQuestions: string[],
  weakTopics: string[]
}
```

### 4️⃣ **Review Obbligatorio AI**
- ✅ Alert automatico se accuracy < 50%
- ✅ Feedback AI personalizzato da Prof Satoshi
- ✅ Analisi errori e pattern
- ✅ Suggerimenti sezioni specifiche da rivedere
- ✅ Modal motivazionale con scelta (rivedi/continua)

### 5️⃣ **Escalation Difficoltà Automatica**
```typescript
// Se accuracy > 80%: difficulty++
// Se accuracy < 40%: difficulty--
// Adaptive learning in tempo reale
```

---

## 🏗️ Architettura

### **Backend** (`/supabase/functions/server/index.tsx`)

#### Endpoint 1: Generazione Quiz
```typescript
POST /make-server-7c0f82ca/generate-quiz-question

Request:
{
  lessonId: number,
  lessonTitle: string,
  lessonContent: string,
  difficulty: 'easy' | 'medium' | 'hard',
  performance: QuizPerformance
}

Response:
{
  question: {
    question: string,
    options: string[],
    correctAnswer: number,
    explanation: string,
    xp: number,
    hint: string
  }
}
```

#### Endpoint 2: Feedback AI
```typescript
POST /make-server-7c0f82ca/get-quiz-feedback

Request:
{
  lessonTitle: string,
  wrongAnswers: string[],
  performance: QuizPerformance
}

Response:
{
  feedback: string  // Personalizzato da GPT-4o-mini
}
```

#### Supporto Dual AI Provider
```typescript
// OpenAI (default)
OPENAI_API_KEY=sk-proj-...

// oppure Grok (xAI)
GROK_API_KEY=xai-...

// Fallback automatico se AI non disponibile
```

---

### **Frontend** (`/hooks/useAIQuizGenerator.ts`)

```typescript
export function useAIQuizGenerator() {
  // 🎯 Genera nuova domanda AI
  generateAIQuestion(
    lessonId: number,
    lessonTitle: string,
    lessonContent: string,
    difficulty: 'easy' | 'medium' | 'hard'
  ): Promise<Question | null>

  // 📊 Registra risposta e aggiorna performance
  recordAnswer(correct: boolean, questionText: string): void

  // ⚠️ Controlla se serve review
  shouldReviewLesson(): boolean

  // 💬 Ottieni feedback AI personalizzato
  getAIFeedback(
    lessonTitle: string,
    wrongAnswers: string[]
  ): Promise<string>

  // 🔄 Reset performance
  resetPerformance(): void

  // 📈 Performance state
  performance: QuizPerformance
  isGenerating: boolean
}
```

---

### **UI Components**

#### `/components/LessonView.tsx`
- ✅ Integrazione completa hook AI
- ✅ Indicatore performance real-time
- ✅ Modal review suggestion
- ✅ Toast notifiche generazione AI

#### `/components/quiz/QuizAttempts.tsx` (CREATO)
```typescript
export function QuizAttempts({ 
  current: number, 
  max: number,
  onHintRequest?: () => void 
})
```

#### `/components/quiz/ReviewSuggestion.tsx` (CREATO)
```typescript
export function ReviewSuggestion({
  isOpen: boolean,
  feedback: string,
  isLoading: boolean,
  onReview: () => void,
  onContinue: () => void
})
```

#### `/components/dev/AIDebugPanel.tsx` (DEBUG)
- 🛠️ Pannello debug performance AI
- 🛠️ Test generazione manuale
- 🛠️ Visualizzazione metriche real-time

---

## 🎯 Flow Utente

### **1. Inizio Quiz**
```
Lezione → Sezioni teoriche → "Inizia Quiz"
↓
Randomizzazione domande base
↓
Reset performance tracking
```

### **2. Durante Quiz**
```
Risposta corretta ✅
├─ +XP (+50 bonus primo tentativo)
├─ Performance tracking aggiornato
└─ Ogni 2 corrette → genera nuova domanda AI 🤖

Risposta sbagliata ❌
├─ Tentativo contato (max 3)
├─ Dopo 2 errori → mostra hint 💡
├─ Track weak topic
└─ Se accuracy < 50% → alert review 📚
```

### **3. Review Alert** (se accuracy < 50%)
```
Modal Prof Satoshi 🧙‍♂️
├─ Analisi AI errori (GPT-4o-mini)
├─ Feedback personalizzato
└─ Scelta:
    ├─ "Rivedi Lezione" → torna alla teoria
    └─ "Continua Quiz" → procedi (non consigliato)
```

### **4. Completamento**
```
Fine quiz
├─ +250 XP bonus
├─ Badge unlock check
└─ Report finale performance
```

---

## 🔧 Configurazione

### **1. Setup API Key**

#### Opzione A: OpenAI (Consigliato)
```bash
# Vai su Supabase Dashboard → Settings → Secrets
# Aggiungi:
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx
```

#### Opzione B: Grok (xAI)
```bash
# Vai su Supabase Dashboard → Settings → Secrets
# Aggiungi:
GROK_API_KEY=xai-xxxxxxxxxxxxx
```

### **2. Test Sistema**

1. **Vai a una lezione qualsiasi**
2. **Completa le sezioni teoriche**
3. **Inizia il quiz**
4. **Osserva il pannello AI Debug** (bottom-right)
5. **Testa generazione manuale**: click "Test AI Generation"

---

## 📊 Metriche & Analytics

### **Tracking Performance**
```typescript
// Salvato in localStorage per persistenza
{
  correctAnswers: 5,
  wrongAnswers: 2,
  consecutiveWrong: 0,
  accuracy: 71.4,  // Auto-calculated
  difficultyLevel: 'medium',
  previousQuestions: [...],  // Ultimi 5 concetti
  weakTopics: ['volatilità', 'put options']
}
```

### **Costi AI** (stimati)
- Generazione domanda: ~$0.0005 (500 tokens)
- Feedback review: ~$0.0003 (300 tokens)
- **Totale per lezione completa**: ~$0.005 (con 5 domande AI)

---

## 🎨 UI/UX Highlights

### **Header Quiz Dinamico**
```
Quiz: Lezione X
Progress: [████████░░] 80%

Difficoltà: [MEDIUM] ✓5 ✗2
🤖 Generando AI... (animato)
```

### **Review Modal**
```
⚠️ Forse dovresti rivedere la lezione 📚

[Prof Satoshi sta analizzando...] (loading)

oppure

"Vedo che hai avuto difficoltà con i concetti 
di volatilità. Ti consiglio di rivedere la sezione 
2 della lezione dove si spiega la differenza tra 
volatilità storica e implicita. 💪📚"

[Rivedi Lezione] [Continua Quiz]

💡 Rivedere ti aiuterà a comprendere meglio
```

### **Toast Notifications**
```
✅ Quiz iniziato! Domande randomizzate 🎲
🤖 Nuova domanda MEDIUM generata!
❌ Errore generazione domanda AI
📖 Rivediamo insieme la lezione!
```

---

## 🐛 Troubleshooting

### **Problema: "AI not configured"**
**Causa**: Nessuna API key  
**Fix**: Aggiungi `OPENAI_API_KEY` o `GROK_API_KEY`

### **Problema: "AI generation failed"**
**Causa**: API key invalida / quota esaurita  
**Fix**: Verifica key e credito su OpenAI Dashboard

### **Problema: Domande si ripetono**
**Causa**: Storico non tracked  
**Fix**: Sistema auto-gestito, verifica `previousQuestions` nel debug panel

### **Problema: Feedback generico**
**Causa**: AI fallback  
**Fix**: Verifica logs backend per errori API

---

## 🚀 Prossimi Step (Opzionali)

- [ ] Persistenza performance nel database Supabase
- [ ] Dashboard analytics globale quiz
- [ ] Leaderboard basato su accuracy
- [ ] Modalità "Sfida Temporizzata"
- [ ] Export report performance PDF
- [ ] Badge speciali per accuracy >90%

---

## 📚 File Modificati/Creati

### **Creati**
- ✅ `/hooks/useAIQuizGenerator.ts`
- ✅ `/components/quiz/QuizAttempts.tsx`
- ✅ `/components/quiz/ReviewSuggestion.tsx`
- ✅ `/components/dev/AIDebugPanel.tsx`
- ✅ `/docs/AI_SETUP.md`
- ✅ `/SISTEMA_AI_QUIZ.md`

### **Modificati**
- ✅ `/supabase/functions/server/index.tsx` (2 nuovi endpoint)
- ✅ `/components/LessonView.tsx` (integrazione completa AI)
- ✅ `/components/MascotAI.tsx` (fix HTML nesting bug)

---

## 🎉 Risultato Finale

**Prima**: Quiz statico, domande sempre uguali, nessun feedback, ripetitivo

**Dopo**: 
- 🤖 Domande generate AI uniche
- 📊 Performance tracking avanzato
- 💡 Feedback personalizzato
- 🎯 Difficoltà adattiva
- ⚠️ Review intelligente
- 🏆 Sistema motivazionale completo

---

**Sistema completamente operativo e pronto per la produzione!** 🚀

Per test: Vai su qualsiasi lezione → Completa teoria → Inizia quiz → Osserva il magic! ✨
