# 📝 Esempi Quiz Types Avanzati

Guida rapida per aggiungere quiz di tipo `calculation` e `drag-drop` alle lezioni.

---

## 🧮 Quiz Type: Calculation

### Esempio 1: Calcolo Breakeven

```typescript
{
  id: 4,
  type: 'calculation',
  question: 'Se vendi una put strike $45,000 e ricevi $500 di premium, qual è il tuo breakeven price?',
  correctAnswer: 44500,
  tolerance: 50,
  unit: '$',
  explanation: 'Il breakeven è strike - premium ricevuto = $45,000 - $500 = $44,500. A quel prezzo sei in pareggio anche se assegnato.',
  hint: 'Ricorda: il premium ricevuto riduce il tuo costo effettivo di acquisto!',
  xp: 100
}
```

### Esempio 2: Calcolo Percentuale di Rendimento

```typescript
{
  id: 5,
  type: 'calculation',
  question: 'Investi $50,000 e guadagni $1,500 di premium in un mese. Qual è il rendimento mensile percentuale?',
  correctAnswer: 3,
  tolerance: 0.1,
  unit: '%',
  explanation: 'Rendimento % = (Premium / Capitale) * 100 = (1,500 / 50,000) * 100 = 3%',
  hint: 'Formula: (Guadagno / Capitale Investito) * 100',
  xp: 150
}
```

### Esempio 3: Calcolo IV Rank

```typescript
{
  id: 6,
  type: 'calculation',
  question: 'IV attuale = 75%, IV min (12 mesi) = 40%, IV max = 120%. Calcola IV Rank.',
  correctAnswer: 43.75,
  tolerance: 1,
  unit: '%',
  explanation: 'IV Rank = ((IV attuale - IV min) / (IV max - IV min)) * 100 = ((75 - 40) / (120 - 40)) * 100 = 43.75%',
  hint: 'Formula: ((Attuale - Min) / (Max - Min)) * 100',
  xp: 200
}
```

---

## 🔄 Quiz Type: Drag & Drop

### Esempio 1: Ordine Wheel Strategy

```typescript
{
  id: 7,
  type: 'drag-drop',
  question: 'Metti in ordine corretto i passaggi della Wheel Strategy:',
  items: [
    'Vendi Covered Call sul BTC posseduto',
    'Vieni assegnato - compri BTC al prezzo strike',
    'Vendi Cash-Secured Put',
    'Vieni assegnato - vendi BTC al prezzo strike',
    'Ripeti il ciclo'
  ],
  correctOrder: [2, 1, 0, 3, 4], // Indici nell'ordine corretto
  explanation: 'La Wheel inizia vendendo put. Se assegnati, si passa a vendere call. Se assegnati di nuovo, si ricomincia.',
  hint: 'Pensa al ciclo: prima COMPRI con le put, poi VENDI con le call!',
  xp: 150
}
```

### Esempio 2: Ordine Analisi Pre-Trade

```typescript
{
  id: 8,
  type: 'drag-drop',
  question: 'Ordina i passaggi di analisi prima di aprire un trade:',
  items: [
    'Analizza IV Rank e volatilità',
    'Scegli lo strike in base a supporti/resistenze',
    'Controlla il sentiment di mercato',
    'Calcola il rischio e il rendimento atteso',
    'Esegui il trade'
  ],
  correctOrder: [2, 0, 1, 3, 4],
  explanation: 'Prima controlla il contesto macro, poi la volatilità, scegli strike tecnici, calcola rischio e infine esegui.',
  hint: 'Inizia sempre con il quadro generale (sentiment) prima dei dettagli tecnici!',
  xp: 200
}
```

### Esempio 3: Ordine Priorità nel Risk Management

```typescript
{
  id: 9,
  type: 'drag-drop',
  question: 'Ordina per importanza (dal più importante) le regole di risk management:',
  items: [
    'Mantenere sempre buffer di cash',
    'Non usare più del 2% per singolo trade',
    'Diversificare strike e scadenze',
    'Chiudere posizioni perdenti oltre -200% premium'
  ],
  correctOrder: [1, 3, 2, 0],
  explanation: 'La regola del 2% è fondamentale. Poi stop loss per limitare danni. Diversificazione e buffer aiutano ma sono secondari.',
  hint: 'Pensa: quale regola protegge il capitale PRIMA che il danno sia fatto?',
  xp: 200
}
```

---

## 📋 Come Aggiungerli alle Lezioni

### Step 1: Apri `/lib/lessons.ts`

### Step 2: Trova la lezione dove vuoi aggiungere la domanda

```typescript
export const lessons: Record<number, Lesson> = {
  4: {
    id: 4,
    title: 'Cash-Secured Put',
    // ... resto della lezione
    questions: [
      // Domande esistenti...
      
      // AGGIUNGI QUI LA NUOVA DOMANDA
      {
        id: 4,
        type: 'calculation',
        question: 'Se vendi una put strike $45,000...',
        correctAnswer: 44500,
        tolerance: 50,
        unit: '$',
        explanation: '...',
        hint: '...',
        xp: 100
      }
    ]
  }
}
```

### Step 3: Ricorda di aggiungere il campo `hint`

Anche alle domande `multiple-choice` esistenti, aggiungi un campo `hint`:

```typescript
{
  id: 1,
  type: 'multiple-choice',
  question: 'Una CALL option ti dà il diritto di:',
  options: ['Vendere', 'Comprare', 'Tenere', 'Scambiare'],
  correctAnswer: 1,
  explanation: 'Una CALL ti dà il diritto di COMPRARE...',
  hint: 'Pensa: CALL = Chiamare il venditore per COMPRARE!', // ✨ NUOVO
  xp: 50
}
```

---

## 🎯 Best Practices

### Per Quiz Calculation

**DO ✅**
- Usa `tolerance` per accettare piccole differenze nei decimali
- Specifica sempre l'`unit` quando applicabile
- Rendi il calcolo fattibile mentalmente o con calcolatrice semplice
- Spiega la formula nella `explanation`

**DON'T ❌**
- Non chiedere calcoli troppo complessi (max 2-3 operazioni)
- Non usare numeri troppo grandi senza arrotondamenti
- Non dimenticare la `tolerance` per numeri con decimali

### Per Quiz Drag & Drop

**DO ✅**
- Usa 4-6 elementi (non troppi, non troppo pochi)
- Assicurati che ci sia una logica chiara nell'ordine
- Scrivi elementi con lunghezza simile per UI uniforme
- Fornisci hint che guida al ragionamento

**DON'T ❌**
- Non creare ordini ambigui dove 2+ soluzioni sono valide
- Non usare elementi troppo lunghi (max 1-2 righe)
- Non fare drag-drop per concetti non sequenziali

---

## 🎨 UI Preview

### Calculation Quiz
```
╔════════════════════════════════════════╗
║  Se vendi put strike $45,000 e ricevi  ║
║  $500 premium, qual è il breakeven?    ║
╚════════════════════════════════════════╝

┌────────────────────────────────────────┐
│  🧮 Inserisci la tua risposta:         │
│  ┌──────────────────────────────┐      │
│  │       44500           $      │      │
│  └──────────────────────────────┘      │
│  [Verifica]                            │
└────────────────────────────────────────┘
```

### Drag & Drop Quiz
```
╔════════════════════════════════════════╗
║  Ordina i passaggi della Wheel:        ║
╚════════════════════════════════════════╝

📋 Trascina o usa frecce ↑↓

╔═══ 1 ══════════════════════════════╗
║  [≡] Vendi Put             [↑][↓] ║
╚════════════════════════════════════╝
┌─── 2 ──────────────────────────────┐
│  [≡] Compri BTC            [↑][↓] │
└────────────────────────────────────┘
╔═══ 3 ══════════════════════════════╗
║  [≡] Vendi Call            [↑][↓] ║
╚════════════════════════════════════╝

[Verifica Ordine]
```

---

## 🚀 Quick Start

### 1. Aggiungi 1 domanda calculation alla Lezione 4 (Cash-Secured Put)

```typescript
{
  id: 4,
  type: 'calculation',
  question: 'Hai $50,000. Vendi put strike $45k per $900. Qual è il tuo rendimento % se la put scade senza valore?',
  correctAnswer: 2,
  tolerance: 0.1,
  unit: '%',
  explanation: 'Rendimento = (900 / 45,000) * 100 = 2%. Il rendimento si calcola sul capitale impegnato (strike), non sul totale.',
  hint: 'Dividi il premium per il capitale che devi tenere da parte (lo strike)!',
  xp: 100
}
```

### 2. Aggiungi 1 domanda drag-drop alla Lezione 6 (Wheel Strategy Completa)

```typescript
{
  id: 4,
  type: 'drag-drop',
  question: 'Ordina i 4 step della Wheel Strategy:',
  items: [
    '3. Vieni assegnato → vendi BTC a profitto',
    '2. Vendi Covered Call',
    '1. Vieni assegnato → compri BTC',
    '0. Vendi Cash-Secured Put'
  ],
  correctOrder: [3, 2, 1, 0],
  explanation: 'Wheel: Put → Assegnato compra → Call → Assegnato vende → Ripeti',
  hint: 'Inizia con cosa fai PRIMA di possedere BTC!',
  xp: 150
}
```

### 3. Aggiungi hint a 3 domande esistenti

Scegli 3 domande multiple-choice difficili e aggiungi:

```typescript
hint: 'Pensa a [concetto chiave] e ricorda che [principio importante]!'
```

---

## ✅ Testing Checklist

Dopo aver aggiunto le domande:

- [ ] Build senza errori TypeScript
- [ ] Calculation: inserisci numero corretto → feedback positivo
- [ ] Calculation: inserisci numero sbagliato → feedback negativo
- [ ] Calculation: premi Enter → submit funziona
- [ ] Drag-drop: trascina elementi → ordine cambia
- [ ] Drag-drop: usa frecce su mobile → ordine cambia
- [ ] Drag-drop: verifica ordine corretto → feedback positivo
- [ ] Drag-drop: verifica ordine sbagliato → mostra ordine corretto
- [ ] Hint: sbaglia 2 volte → hint appare
- [ ] Hint: clicca X → hint scompare

---

<div align="center">

**Ready to enhance your lessons!** 🚀

Questi quiz types rendono l'apprendimento più interattivo e coinvolgente!

</div>
