# 🎮 Sistema Gamification

Il sistema di gamification rende l'apprendimento coinvolgente e motivante.

---

## 🎯 Overview

**4 Pilastri:**
1. **XP & Livelli** - Sistema progressione
2. **Badge System** - Achievement unlockabili
3. **Streak Tracking** - Motivazione giornaliera
4. **Leaderboard** - Competizione sociale

---

## ⭐ XP & Livelli

### Come Guadagnare XP

**Lezioni:**
- Completa lezione: +50 XP
- Quiz perfetto (100%): +100 XP bonus
- Prima volta: +50 XP extra

**Simulazioni:**
- Completa trading sim: +75 XP
- Simulazione profittevole: +150 XP bonus
- Primo profit: +100 XP extra

**Streak:**
- Ogni giorno consecutivo: +10 XP
- Milestone 7 giorni: +100 XP
- Milestone 30 giorni: +500 XP

### Sistema Livelli

```
Livello 1: 0 XP
Livello 2: 1,000 XP
Livello 3: 2,500 XP
Livello 4: 4,500 XP
Livello 5: 7,000 XP
...
Formula: XP_needed = level * 1000 * (level / 2)
```

**Benefici per livello:**
- **Liv 5:** Unlock Badge "Principiante Completato"
- **Liv 10:** Unlock Badge "Trader Intermedio"
- **Liv 15:** Unlock Badge "Master Trader"
- **Liv 20:** Unlock Leaderboard Hall of Fame

---

## 🏆 Badge System

### Badge Disponibili

**Progressione:**
- 🎓 **Primo Passo** - Completa onboarding
- 📚 **Studente** - Completa 3 lezioni
- 🎯 **Dedicato** - Completa 10 lezioni
- 🏅 **Master** - Completa tutte le 15 lezioni

**Performance:**
- 💯 **Perfezionista** - 3 quiz con punteggio 100%
- 🎯 **Precisione** - 10 quiz senza errori
- 💰 **Profittevole** - 5 simulazioni con profit
- 📈 **Bull Market** - 10 simulazioni profittevoli

**Streak:**
- 🔥 **In Fiamme** - 7 giorni di streak
- ⚡ **Inarrestabile** - 30 giorni di streak
- 💎 **Leggenda** - 100 giorni di streak

**Speciali:**
- 🚀 **Early Adopter** - Tra i primi 100 utenti
- 👑 **Top 10** - Entra in Top 10 leaderboard
- 🎖️ **Champion** - Raggiunge posizione #1

### Implementazione Badge

```typescript
// Hook per badge
const { badges, checkBadgeUnlock } = useUserProgress();

// Check dopo azione
checkBadgeUnlock('LESSON_COMPLETE', {
  lessonsCompleted: newTotal
});

// Animazione unlock
<BadgeUnlockAnimation 
  badge={newBadge}
  onComplete={() => toast.success('Badge sbloccato!')}
/>
```

---

## 🔥 Streak System

### Come Funziona

**Tracking:**
- Ogni giorno di attività incrementa streak
- Attività = completare quiz/lezione/simulazione
- Conta solo il primo completamento del giorno
- Streak si azzera se salti un giorno

**Motivazione:**
- Notifica giornaliera per mantenere streak
- Icona fuoco 🔥 mostra streak corrente
- Animazione speciale a milestone (7, 30, 100 giorni)

**Freeze (Coming Soon):**
- 1 "Streak Freeze" ogni 7 giorni di streak
- Protegge da perdere streak per 1 giorno

### Implementazione

```typescript
// Update streak
const updateStreak = async () => {
  const lastActivity = user.lastActivity;
  const today = new Date();
  
  if (isSameDay(lastActivity, today)) {
    // Già completato oggi
    return;
  }
  
  if (isYesterday(lastActivity)) {
    // Streak continua
    setStreak(streak + 1);
  } else {
    // Streak rotto
    setStreak(1);
  }
  
  await saveProgress();
};
```

---

## 🏅 Leaderboard

### Classifiche Disponibili

**Global All-Time:**
- Classifica globale permanente
- Ordinata per Total XP
- Tie-breaker: Livello → Streak

**Weekly:**
- Reset ogni lunedì
- XP guadagnato nella settimana
- Premi speciali per top 3

**Friends (Coming Soon):**
- Solo amici connessi
- Motivazione peer-to-peer

### Ranking Algorithm

```typescript
// Ordine ranking
1. Total XP (descending)
2. Level (descending)  
3. Streak (descending)
4. Badges Count (descending)
5. Registration Date (ascending)
```

### Privacy

- Username pubblico (scegli tu)
- XP e livello visibili
- Progressi dettagliati privati
- Opt-out disponibile in Settings

---

## 🎨 Animazioni

### 8 Animazioni React/Motion

**1. XP Gain Animation**
```tsx
<XPGain amount={50} onComplete={() => {}} />
```
- Numeri che salgono
- Particelle dorate
- Suono di coin (opzionale)

**2. Level Up Animation**
```tsx
<LevelUpAnimation 
  newLevel={5} 
  onComplete={() => {}}
/>
```
- Esplosione di confetti
- Badge glow
- Celebrazione

**3. Badge Unlock**
```tsx
<BadgeUnlockAnimation 
  badge={badge}
  onComplete={() => {}}
/>
```
- Badge che emerge
- Glow effect
- Descrizione slide-in

**4. Streak Fire**
```tsx
<StreakFire days={7} />
```
- Fiamma animata
- Cresce con streak
- Cambia colore (7d=arancione, 30d=blu, 100d=oro)

**5. Progress Bar**
```tsx
<ProgressBarAnimated 
  current={750}
  target={1000}
  label="XP to Level 5"
/>
```
- Fill animato smooth
- Percentage label
- Pulse al completamento

**6. Achievement Toast**
```tsx
<AchievementToast 
  title="Quiz Perfetto!"
  description="+100 XP Bonus"
  icon={<Trophy />}
/>
```
- Slide from top
- Auto-dismiss
- Stack multipli

**7. Quiz Feedback**
```tsx
<QuizFeedback 
  correct={true}
  message="Ottimo!"
/>
```
- Checkmark/X animato
- Colore dinamico
- Haptic feedback

**8. Card Flip**
```tsx
<CardFlip front={<Question />} back={<Answer />} />
```
- 3D flip smooth
- Touch/click trigger
- Responsive

---

## 📊 Dashboard Progressi

### Visualizzazioni

**Overview Card:**
```
┌─────────────────────────────┐
│  Livello 8    1,250 / 2,000 │
│  ███████░░░░░░░░  62.5%     │
│                              │
│  🔥 Streak: 14 giorni        │
│  🏆 Badge: 8/12              │
│  📚 Lezioni: 9/15            │
└─────────────────────────────┘
```

**Activity Timeline:**
- Ultimi 7 giorni di attività
- Heatmap calendar
- Hover per dettagli

**Recent Achievements:**
- Timeline badge sbloccati
- Milestones raggiunte
- Progressi recenti

---

## 🔧 Configurazione

### Personalizzazione XP

Modifica in `/lib/gamification.ts`:

```typescript
export const XP_REWARDS = {
  LESSON_COMPLETE: 50,
  QUIZ_PERFECT: 100,
  SIMULATION_COMPLETE: 75,
  SIMULATION_PROFITABLE: 150,
  DAILY_STREAK: 10,
};

export const XP_PER_LEVEL = (level: number) => {
  return level * 1000 * (level / 2);
};
```

### Personalizzazione Badge

Aggiungi in `/lib/badges.ts`:

```typescript
export const BADGES = [
  {
    id: 'NEW_BADGE',
    name: 'Nome Badge',
    description: 'Descrizione',
    icon: '🎯',
    condition: (progress: UserProgress) => {
      return progress.customMetric >= 10;
    }
  }
];
```

---

## 🎯 Best Practices

### Design UX

✅ **Do:**
- Feedback immediato su azioni
- Animazioni smooth e veloci (< 500ms)
- Celebra ogni achievement
- Progress bars sempre visibili

❌ **Don't:**
- Animazioni troppo lunghe
- Troppe notifiche
- Badge impossibili da sbloccare
- Hidden metrics

### Performance

```typescript
// Lazy load animazioni pesanti
const BadgeUnlockAnimation = lazy(() => 
  import('./animations/BadgeUnlockAnimation')
);

// Throttle aggiornamenti DB
const debouncedSave = debounce(saveProgress, 1000);
```

---

## 📈 Metriche Success

**Engagement:**
- Daily Active Users (DAU)
- Average session duration
- Lesson completion rate
- Return rate dopo 7 giorni

**Gamification Effectiveness:**
- % users con streak > 7 giorni
- Average badges per user
- Leaderboard participation
- Time to Level 10

**Tools:** Supabase Analytics + Custom events

---

<div align="center">

**Sistema Gamification Completo!** 🎮

[⬆ Back to top](#-sistema-gamification)

</div>
