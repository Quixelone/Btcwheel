# 🤖 Configurazione AI per Quiz Dinamici

## Scelta del Provider AI

L'app supporta **due provider AI** per generare domande quiz dinamiche:

### 1. **OpenAI (GPT-4o-mini)** - Consigliato ✅
- **API**: `https://api.openai.com/v1/chat/completions`
- **Modello**: `gpt-4o-mini`
- **Pro**: Stabile, testato, ottimo per educazione
- **Setup**: Aggiungi `OPENAI_API_KEY` nelle variabili d'ambiente

### 2. **Grok (xAI Beta)**
- **API**: `https://api.x.ai/v1/chat/completions`
- **Modello**: `grok-beta`
- **Pro**: Modello alternativo, spesso più veloce
- **Setup**: Aggiungi `GROK_API_KEY` nelle variabili d'ambiente

---

## 🚀 Setup Rapido

### Opzione A: OpenAI
```bash
# Aggiungi nelle variabili d'ambiente Supabase:
OPENAI_API_KEY=sk-proj-...
```

### Opzione B: Grok
```bash
# Aggiungi nelle variabili d'ambiente Supabase:
GROK_API_KEY=xai-...
```

> **Nota**: Se hai entrambe le chiavi, l'app userà **OpenAI per default**. Per forzare Grok, rimuovi `OPENAI_API_KEY`.

---

## 🧪 Come Funziona

### 1. Generazione Quiz Dinamica
```typescript
// Chiamata backend
POST /make-server-7c0f82ca/generate-quiz-question
{
  lessonId: 1,
  lessonTitle: "Introduzione Bitcoin",
  lessonContent: "...",
  difficulty: "medium",
  performance: {
    correctAnswers: 3,
    wrongAnswers: 1,
    difficultyLevel: "medium",
    previousQuestions: [...]
  }
}

// Risposta
{
  question: {
    question: "Cos'è la volatilità di Bitcoin?",
    options: ["A", "B", "C", "D"],
    correctAnswer: 1,
    explanation: "La risposta B è corretta perché...",
    xp: 50,
    hint: "Pensa alla variazione del prezzo..."
  }
}
```

### 2. Feedback AI Personalizzato
```typescript
// Chiamata backend quando accuracy < 50%
POST /make-server-7c0f82ca/get-quiz-feedback
{
  lessonTitle: "Introduzione Bitcoin",
  wrongAnswers: ["Domanda 1", "Domanda 2"],
  performance: {
    correctAnswers: 2,
    wrongAnswers: 4,
    accuracy: 33
  }
}

// Risposta
{
  feedback: "Vedo che hai avuto difficoltà con i concetti di volatilità. Ti consiglio di rivedere la sezione 2 della lezione dove si spiega la differenza tra volatilità storica e implicita. Prova a rileggere con calma prima di riprovare il quiz! 💪📚"
}
```

---

## 🎯 Funzionalità AI Implementate

### ✅ Quiz Dinamico
- ✅ Generazione domande uniche (no ripetizioni)
- ✅ Difficoltà adattiva (easy → medium → hard)
- ✅ Randomizzazione opzioni
- ✅ Focus su punti deboli utente
- ✅ Spiegazioni educative personalizzate

### ✅ Performance Tracking
- ✅ Tentativi limitati (max 3 per domanda)
- ✅ Calcolo accuracy real-time
- ✅ Identificazione punti deboli
- ✅ Escalation difficoltà automatica

### ✅ Review Intelligente
- ✅ Alert quando accuracy < 50%
- ✅ Feedback AI personalizzato
- ✅ Suggerimenti sezioni da rivedere
- ✅ Motivazione costruttiva

---

## 📊 Metriche Performance

```typescript
performance = {
  correctAnswers: 5,      // Risposte corrette
  wrongAnswers: 2,        // Risposte sbagliate
  consecutiveWrong: 0,    // Errori consecutivi
  accuracy: 71.4,         // % successo
  difficultyLevel: "medium",
  previousQuestions: [...], // Storico domande
  weakTopics: ["volatilità", "put options"]
}
```

---

## 🔧 Troubleshooting

### Errore: "AI not configured"
**Causa**: Nessuna API key configurata  
**Soluzione**: Aggiungi `OPENAI_API_KEY` o `GROK_API_KEY`

### Errore: "AI generation failed"
**Causa**: API key invalida o quota esaurita  
**Soluzione**: Verifica la key e il credito API

### Fallback Automatico
Se l'AI fallisce, l'app usa **quiz statici** predefiniti nel file `/lib/lessons.ts`

---

## 💡 Best Practices

1. **Usa OpenAI per produzione** (più stabile)
2. **Monitora i costi API** (ogni quiz costa ~$0.0005)
3. **Testa con Grok se vuoi alternative**
4. **Non esporre le API keys nel frontend** (già gestito ✅)

---

## 📝 Note Implementazione

- **Prompt engineering**: Ottimizzato per quiz educativi in italiano
- **JSON parsing**: Gestisce risposte malformate con graceful fallback
- **Rate limiting**: L'AI genera max 1 domanda ogni 2 risposte corrette
- **Caching**: Le domande generate vengono aggiunte al pool locale
