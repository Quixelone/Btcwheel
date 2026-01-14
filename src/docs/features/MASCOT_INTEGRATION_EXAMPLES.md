# 🎯 Mascot Animation - Integration Examples

Esempi pratici di integrazione delle nuove animazioni Prof Satoshi.

---

## 🚀 Quick Start

### 1. Mascotte Base con Micro-Animazioni

```typescript
import { EnhancedMascot } from './components/EnhancedMascot';

function MyComponent() {
  return (
    <EnhancedMascot
      tip="Benvenuto! Inizia la tua prima lezione!"
      emotion="teaching"
      idleAnimation={true} // Breathing + floating
    />
  );
}
```

**Risultato:**
- ✅ Breathing effect (lieve scale)
- ✅ Floating effect (su/giù smooth)
- ✅ Blinking ogni 3-5 secondi
- ✅ AI badge sempre visibile

---

## 🎭 Gestione Stati Emotivi

### Esempio: Quiz Interaction

```typescript
import { EnhancedMascot } from './components/EnhancedMascot';
import { useMascotEmotion } from './hooks/useMascotEmotion';

function QuizComponent() {
  const { emotion, message, setActivity } = useMascotEmotion();
  
  const handleAnswerSubmit = (isCorrect: boolean) => {
    if (isCorrect) {
      setActivity('quiz_correct', 3000); // Celebrating per 3 secondi
    } else {
      setActivity('quiz_wrong', 3000); // Encouraging per 3 secondi
    }
  };

  return (
    <>
      <EnhancedMascot
        tip={message}
        emotion={emotion}
        autoShow={true}
      />
      
      <button onClick={() => handleAnswerSubmit(true)}>
        Risposta Corretta
      </button>
    </>
  );
}
```

**Stati supportati:**
- `quiz_correct` → celebrating 🎉
- `quiz_wrong` → encouraging 💪
- `quiz_start` → teaching 📚
- E molti altri! (vedi hook completo)

---

## 🤖 AI Chat Integration

### Esempio: Mascotte AI con Thinking Indicator

```typescript
import { EnhancedMascot } from './components/EnhancedMascot';
import { AIThinkingIndicator, ChatTypingBubble } from './components/animations/AIThinkingIndicator';
import { useMascotEmotion } from './hooks/useMascotEmotion';

function AIChatComponent() {
  const [isThinking, setIsThinking] = useState(false);
  const { emotion, message, setActivity } = useMascotEmotion();

  const sendMessage = async (userMessage: string) => {
    // 1. User invia messaggio
    setActivity('ai_listening');
    
    // 2. AI inizia a pensare
    setIsThinking(true);
    setActivity('ai_thinking');
    
    try {
      // 3. Chiama backend
      const response = await fetch('/api/chat', {
        method: 'POST',
        body: JSON.stringify({ message: userMessage }),
      });
      
      const data = await response.json();
      
      // 4. AI risponde
      setIsThinking(false);
      setActivity('ai_responding', 2000);
      
      return data.response;
      
    } catch (error) {
      setIsThinking(false);
      setActivity('idle');
    }
  };

  return (
    <div className="relative">
      {/* Floating mascot button */}
      <EnhancedMascot
        tip={message}
        emotion={emotion}
        isThinking={isThinking} // Mostra "..." quando true
        position="right"
      />
      
      {/* Chat window */}
      <div className="chat-container">
        {/* Messages */}
        {messages.map(msg => (
          <div key={msg.id}>{msg.content}</div>
        ))}
        
        {/* Typing indicator when AI thinks */}
        {isThinking && (
          <ChatTypingBubble />
        )}
        
        {/* Input */}
        <input 
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(e.target.value);
          }}
        />
      </div>
    </div>
  );
}
```

**Key features:**
- ✅ `isThinking` mostra "..." animato sulla mascotte
- ✅ `ChatTypingBubble` mostra typing nella chat
- ✅ Stati automatici (listening → thinking → responding)

---

## 🎮 Gamification Events

### Esempio: Level Up Celebration

```typescript
import { EnhancedMascot } from './components/EnhancedMascot';
import { useMascotEmotion } from './hooks/useMascotEmotion';
import { XPGain } from './components/animations/XPGain';

function Dashboard() {
  const { emotion, message, setActivity } = useMascotEmotion();
  const [showXPGain, setShowXPGain] = useState(false);

  const handleXPGain = (amount: number, newLevel?: number) => {
    // Show XP animation
    setShowXPGain(true);
    
    // Mascot celebrates
    if (newLevel) {
      setActivity('level_up', 5000); // Celebrating per 5 secondi
    } else {
      setActivity('excited', 2000);
    }
    
    setTimeout(() => setShowXPGain(false), 3000);
  };

  return (
    <>
      {/* Mascot reacts to events */}
      <EnhancedMascot
        tip={message}
        emotion={emotion}
      />
      
      {/* XP gain animation */}
      {showXPGain && (
        <XPGain amount={50} reason="Quiz completato" />
      )}
      
      {/* Trigger XP gain */}
      <button onClick={() => handleXPGain(50, 5)}>
        Complete Quest
      </button>
    </>
  );
}
```

---

## 📚 Lesson Progress

### Esempio: Lesson Start/Complete

```typescript
function LessonView({ lessonId }: { lessonId: number }) {
  const { setActivity } = useMascotEmotion();
  
  useEffect(() => {
    // Mascot greeting quando inizia lezione
    setActivity('lesson_start', 4000);
  }, [lessonId, setActivity]);
  
  const handleLessonComplete = () => {
    // Mascot celebration
    setActivity('lesson_complete', 5000);
    
    // ... save progress, show quiz, etc
  };

  return (
    <>
      <EnhancedMascot
        tip="Buono studio! Sono qui se hai domande 📖"
        emotion="teaching"
        position="left"
      />
      
      {/* Lesson content */}
      <div className="lesson-content">
        {/* ... */}
      </div>
      
      <button onClick={handleLessonComplete}>
        Completa Lezione
      </button>
    </>
  );
}
```

---

## 💰 Trading Simulator

### Esempio: Trade Result Reactions

```typescript
function TradingSimulator() {
  const { emotion, message, setActivity } = useMascotEmotion();
  
  const handleTradeClose = (profitLoss: number) => {
    if (profitLoss > 0) {
      setActivity('trade_profit', 4000);
    } else {
      setActivity('trade_loss', 4000);
    }
  };

  return (
    <>
      <EnhancedMascot
        tip={message}
        emotion={emotion}
      />
      
      <button onClick={() => handleTradeClose(250)}>
        Close Trade (+$250)
      </button>
      
      <button onClick={() => handleTradeClose(-100)}>
        Close Trade (-$100)
      </button>
    </>
  );
}
```

**Emozioni:**
- Profit → `excited` 📈
- Loss → `teaching` (non disappointed!) 📊
- Big win → `celebrating` 🎉

---

## 🎨 Multiple Thinking Indicators

### Quando Usare Ogni Variante

```typescript
import { AIThinkingIndicator } from './components/animations/AIThinkingIndicator';

// 1. DOTS - Minimale, per chat
<AIThinkingIndicator 
  variant="dots" 
  size="sm"
  message="Sto pensando..."
/>

// 2. BRAIN - Medium, per AI features visibili
<AIThinkingIndicator 
  variant="brain" 
  size="md"
  message="Elaborazione in corso..."
/>

// 3. PULSE - Prominent, per loading states importanti
<AIThinkingIndicator 
  variant="pulse" 
  size="lg"
  message="Generazione risposta AI..."
/>

// 4. SPARKLES - Special, per "magic moments"
<AIThinkingIndicator 
  variant="sparkles" 
  size="md"
  message="Creazione percorso personalizzato..."
/>
```

**Linee guida:**
- **Dots:** Chat messages, quick responses
- **Brain:** AI analysis, thinking deeply
- **Pulse:** Important processing (onboarding, quiz results)
- **Sparkles:** Special moments (badge unlock, level up)

---

## 🔧 Customization Examples

### Custom Emotion with Manual Control

```typescript
import { EnhancedMascot } from './components/EnhancedMascot';
import { useMascotEmotion } from './hooks/useMascotEmotion';

function CustomComponent() {
  const { emotion, message, setEmotion, reset } = useMascotEmotion();
  
  const handleSpecialEvent = () => {
    // Set custom emotion + message
    setEmotion(
      'excited',
      'Wow! Hai fatto qualcosa di speciale! 🌟',
      false // not thinking
    );
    
    // Reset dopo 5 secondi
    setTimeout(() => reset(), 5000);
  };

  return (
    <EnhancedMascot
      tip={message}
      emotion={emotion}
      onInteraction={() => console.log('Mascot clicked!')}
    />
  );
}
```

---

## 🎯 Best Practices

### DO ✅

```typescript
// 1. Use appropriate emotion for context
setActivity('quiz_correct'); // celebrating
setActivity('quiz_wrong');   // encouraging (NOT disappointed!)

// 2. Show thinking indicator for AI
<EnhancedMascot isThinking={true} emotion="thinking" />

// 3. Reset to normal after event
setActivity('level_up', 5000); // Auto-reset after 5s

// 4. Combine with other animations
<>
  <EnhancedMascot emotion="celebrating" />
  <BadgeUnlockAnimation badge={newBadge} />
</>
```

### DON'T ❌

```typescript
// 1. Don't use 'disappointed' for wrong answers
setActivity('quiz_wrong'); // ✅ This uses 'encouraging'
setEmotion('disappointed', '...'); // ❌ Too negative!

// 2. Don't show thinking without indicator
<EnhancedMascot emotion="thinking" isThinking={false} /> // ❌

// 3. Don't forget to reset
setActivity('celebrating'); // ❌ Will stay celebrating forever!
setActivity('celebrating', 3000); // ✅ Auto-reset

// 4. Don't overuse animations
// Too many mascot changes = distracting
```

---

## 📱 Mobile Considerations

### Responsive Mascot Position

```typescript
// Desktop: bottom-right
// Mobile: bottom-center (above nav)
<EnhancedMascot
  position="right" // auto-adjusts on mobile
  tip="Ciao!"
/>

// Or force position
<EnhancedMascot
  position={window.innerWidth < 768 ? 'center' : 'right'}
/>
```

---

## 🎬 Advanced: Sequence of Emotions

```typescript
function OnboardingComplete() {
  const { setActivity } = useMascotEmotion();
  
  const playEmotionSequence = async () => {
    // 1. Thinking
    setActivity('ai_thinking', 2000);
    await sleep(2000);
    
    // 2. Eureka moment (use excited)
    setActivity('level_up', 3000);
    await sleep(3000);
    
    // 3. Teaching
    setActivity('lesson_start', 4000);
    await sleep(4000);
    
    // 4. Reset
    setActivity('idle');
  };
  
  return (
    <button onClick={playEmotionSequence}>
      Play Emotion Sequence
    </button>
  );
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
```

---

## 🧪 Testing Emotions

### Debug Panel per Testing

```typescript
function MascotDebugPanel() {
  const { emotion, setActivity } = useMascotEmotion();
  
  const activities = [
    'quiz_correct', 'quiz_wrong', 'quiz_start',
    'lesson_start', 'lesson_complete',
    'level_up', 'badge_unlock',
    'ai_thinking', 'ai_responding',
  ];
  
  return (
    <div className="fixed top-4 left-4 bg-white p-4 rounded-lg shadow-lg z-50">
      <h3>Mascot Emotion Tester</h3>
      <p>Current: {emotion}</p>
      
      <div className="grid grid-cols-2 gap-2 mt-4">
        {activities.map(activity => (
          <button
            key={activity}
            onClick={() => setActivity(activity as any)}
            className="px-3 py-2 bg-blue-500 text-white rounded"
          >
            {activity}
          </button>
        ))}
      </div>
    </div>
  );
}

// Add to development mode only:
// /?test=mascot
```

---

## 📊 Performance Tips

### Lazy Loading Emotions

```typescript
// Solo se hai MOLTE immagini (10+)
const loadEmotion = async (emotion: string) => {
  const images = {
    normal: () => import('./assets/satoshi-normal.webp'),
    excited: () => import('./assets/satoshi-excited.webp'),
    // ... etc
  };
  
  return await images[emotion]();
};
```

### Preload Critical Emotions

```typescript
useEffect(() => {
  // Preload most common emotions
  const preload = ['normal', 'thinking', 'teaching'];
  preload.forEach(emotion => {
    const img = new Image();
    img.src = getEmotionImage(emotion);
  });
}, []);
```

---

## 🎁 Bonus: Easter Eggs

### Secret Mascot Interactions

```typescript
function EasterEggMascot() {
  const [clickCount, setClickCount] = useState(0);
  const { setEmotion } = useMascotEmotion();
  
  const handleClick = () => {
    setClickCount(prev => prev + 1);
    
    // Easter egg after 10 clicks
    if (clickCount === 9) {
      setEmotion(
        'celebrating',
        'Hai scoperto un segreto! 🎉🎊✨',
        false
      );
      // Unlock special badge?
    }
  };
  
  return (
    <EnhancedMascot
      onInteraction={handleClick}
      tip={clickCount > 5 ? 'Continua a cliccare...' : 'Ciao!'}
    />
  );
}
```

---

<div align="center">

**Mascot Animation Integration Complete!** 🤖✨

Ready to bring Prof Satoshi to life!

[⬆ Back to top](#-mascot-animation---integration-examples)

</div>
