# 🤝 Contributing Guide

## Struttura del Progetto

```
btcwheel/
├── /components/          # Componenti React
│   ├── /ui/             # UI components (shadcn/ui)
│   ├── /animations/     # Animazioni Motion
│   ├── /quiz/           # Quiz types
│   ├── Dashboard.tsx    # Dashboard principale
│   ├── LessonView.tsx   # Visualizzatore lezioni
│   ├── SimulationView.tsx # Simulatore trading
│   ├── MascotAI.tsx     # Mascotte AI globale
│   └── ...
├── /hooks/              # Custom React hooks
│   ├── useAuth.ts       # Autenticazione
│   ├── useUserProgress.ts # Progressione utente
│   ├── useAIQuizGenerator.ts # Quiz AI dinamici
│   ├── useMascotEmotion.ts # Emozioni mascotte
│   └── ...
├── /lib/                # Libraries & data
│   ├── supabase.ts      # Supabase client
│   ├── lessons.ts       # Contenuto lezioni
│   ├── badges.ts        # Definizioni badge
│   └── openai.ts        # Client OpenAI
├── /supabase/functions/server/ # Edge Functions
│   ├── index.tsx        # Server Hono principale
│   └── kv_store.tsx     # 🔒 PROTECTED - Key-Value store
├── /utils/              # Utilities
│   └── supabase/
│       └── info.tsx     # 🔒 PROTECTED - Supabase config
├── /docs/               # Documentazione
│   ├── /setup/          # Guide setup
│   ├── /deployment/     # Guide deployment
│   ├── /features/       # Documentazione features
│   └── /testing/        # Guide testing
└── /styles/
    └── globals.css      # Stili globali + Tailwind

```

---

## 🔒 File Protetti

**NON modificare questi file:**

- `/supabase/functions/server/kv_store.tsx` - Sistema KV protetto
- `/utils/supabase/info.tsx` - Credenziali Supabase
- `/components/figma/ImageWithFallback.tsx` - Componente immagini

---

## 📝 Convenzioni Codice

### TypeScript

```typescript
// ✅ Usa type per props semplici
type ButtonProps = {
  label: string;
  onClick: () => void;
};

// ✅ Usa interface per oggetti estendibili
interface User {
  id: string;
  name: string;
  xp: number;
}

// ✅ Esporta componenti come named exports
export function MyComponent({ ... }: MyComponentProps) {
  // ...
}

// ⚠️ ECCETTO App.tsx che DEVE avere default export
export default function App() {
  // ...
}
```

### React Hooks

```typescript
// ✅ Custom hooks iniziano con "use"
export function useCustomHook() {
  const [state, setState] = useState();
  // ...
  return { state, setState };
}

// ✅ Memoizza callbacks pesanti
const handleClick = useCallback(() => {
  // expensive operation
}, [dependencies]);

// ✅ Usa useMemo per calcoli costosi
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(a, b);
}, [a, b]);
```

### Tailwind CSS

```tsx
// ✅ Usa classi Tailwind
<div className="flex items-center gap-4 p-6 bg-emerald-50 rounded-lg">

// ❌ NO font-size, font-weight, line-height
// (Sono definiti in /styles/globals.css)
<h1 className="text-2xl font-bold">❌ NO</h1>
<h1>✅ YES - usa stili di default</h1>

// ✅ OK solo se esplicitamente richiesto
<h1 className="text-4xl font-extrabold">✅ OK se necessario</h1>
```

### Componenti

```tsx
// ✅ Componenti funzionali con TypeScript
export function MyComponent({ title, children }: MyComponentProps) {
  return (
    <div>
      <h2>{title}</h2>
      {children}
    </div>
  );
}

// ✅ Usa early return per condizioni
export function MyComponent({ isLoading, data }: Props) {
  if (isLoading) return <LoadingSkeleton />;
  if (!data) return <EmptyState />;
  
  return <Content data={data} />;
}

// ✅ Separa logica da rendering
export function ComplexComponent() {
  const { data, isLoading } = useData();
  const { handleClick, isDisabled } = useActions();
  
  // Rendering
  return (
    <div>
      {/* ... */}
    </div>
  );
}
```

---

## 🎨 Design System

### Colori

```css
/* Tema principale: Emerald Green */
--color-primary: #10b981;      /* emerald-500 */
--color-primary-dark: #059669; /* emerald-600 */
--color-primary-light: #34d399; /* emerald-400 */

/* Secondario: Orange */
--color-secondary: #f97316;    /* orange-500 */

/* Neutrali */
--color-background: #ffffff;
--color-surface: #f9fafb;     /* gray-50 */
--color-text: #111827;        /* gray-900 */
```

### Spaziatura

```tsx
// ✅ Sistema spaziatura consistente
gap-2  // 0.5rem (8px)
gap-4  // 1rem (16px)
gap-6  // 1.5rem (24px)
gap-8  // 2rem (32px)

p-4    // padding 1rem
p-6    // padding 1.5rem
m-4    // margin 1rem
```

### Animazioni

```tsx
// ✅ Usa Motion per animazioni
import { motion } from 'motion/react';

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
  {/* content */}
</motion.div>

// ✅ Componenti animazione già pronti in /components/animations/
import { XPGain } from './components/animations/XPGain';
import { BadgeUnlockAnimation } from './components/animations/BadgeUnlockAnimation';
```

---

## 🧪 Testing

### Test Locali

```bash
# Development server
npm run dev

# Build production
npm run build

# Test build locale
npm run preview

# Test Supabase connection
# Apri: http://localhost:5173/?status=supabase

# Test Chat AI
# Apri: http://localhost:5173/?test=chat
```

### Debug Mode

```typescript
// ✅ Usa console.log per debug (rimossi in production)
console.log('[DEBUG] User data:', userData);

// ✅ Usa try-catch per operazioni rischiose
try {
  const result = await riskyOperation();
} catch (error) {
  console.error('[ERROR] Operation failed:', error);
  // Fallback graceful
}
```

---

## 📦 Dipendenze

### Installare nuove librerie

```bash
# ✅ Installa con npm
npm install package-name

# ✅ Verifica versione in package.json
# ✅ Testa che funzioni in dev mode
# ✅ Testa che buildi correttamente
```

### Librerie chiave

- `react` - Framework UI
- `motion` (ex Framer Motion) - Animazioni
- `recharts` - Grafici
- `lucide-react` - Icone
- `@supabase/supabase-js` - Database/Auth
- `sonner` - Toast notifications
- `react-hook-form@7.55.0` - Form handling (versione fissata)

---

## 🔐 Environment Variables

```bash
# .env.local (opzionale)
VITE_SUPABASE_URL=https://rsmvjsokqolxgczclqjv.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
VITE_OPENAI_API_KEY=sk-proj-xxx...
```

**Nota:** Le credenziali Supabase sono già in `/utils/supabase/info.tsx`.

---

## 🚀 Deploy

### Pre-deploy Checklist

- [ ] `npm run build` completa senza errori
- [ ] `npm run preview` funziona correttamente
- [ ] Test auth (login/logout)
- [ ] Test progressione (XP, badge, lezioni)
- [ ] Test simulazione trading
- [ ] Test PWA (installabile)
- [ ] Mobile responsive OK

### Deploy su Vercel

Vedi guida completa: [`/docs/deployment/QUICK_DEPLOY.md`](/docs/deployment/QUICK_DEPLOY.md)

```bash
# Push su GitHub
git add .
git commit -m "feat: nuova feature"
git push origin main

# Vercel deployer automaticamente! 🚀
```

---

## 📚 Documentazione Utile

### Setup & Configuration
- [`/docs/setup/SUPABASE_SETUP.md`](/docs/setup/SUPABASE_SETUP.md) - Setup database
- [`/docs/setup/GOOGLE_OAUTH_SETUP.md`](/docs/setup/GOOGLE_OAUTH_SETUP.md) - Setup Google login
- [`/docs/setup/ENV_VARIABLES.md`](/docs/setup/ENV_VARIABLES.md) - Variabili ambiente

### Deployment
- [`/docs/deployment/QUICK_DEPLOY.md`](/docs/deployment/QUICK_DEPLOY.md) - Deploy rapido
- [`/docs/deployment/DEPLOYMENT_GUIDE.md`](/docs/deployment/DEPLOYMENT_GUIDE.md) - Guida completa
- [`/docs/deployment/CUSTOM_DOMAIN.md`](/docs/deployment/CUSTOM_DOMAIN.md) - Custom domain

### Features
- [`/docs/features/GAMIFICATION.md`](/docs/features/GAMIFICATION.md) - Sistema gamification
- [`/docs/features/MASCOT_ANIMATION_GUIDE.md`](/docs/features/MASCOT_ANIMATION_GUIDE.md) - Mascotte
- [`/docs/features/MOBILE_APP_GUIDE.md`](/docs/features/MOBILE_APP_GUIDE.md) - PWA mobile

### Testing
- [`/docs/testing/TESTING_GUIDE.md`](/docs/testing/TESTING_GUIDE.md) - Testing completo

---

## 🐛 Bug Reporting

Se trovi un bug:

1. **Verifica console browser** - Copia errori
2. **Riproduzione** - Come replicare il bug?
3. **Environment** - Browser, OS, device
4. **Screenshot** - Se possibile
5. **Passi riproduzione** - Lista step-by-step

---

## 💡 Feature Requests

Nuove idee? Segui questo formato:

```markdown
## Feature: [Nome Feature]

### Problema
Descrizione del problema che questa feature risolve

### Soluzione Proposta
Come funzionerebbe la feature

### Alternative Considerate
Altre possibili soluzioni

### Benefits
Perché aggiungere questa feature?
```

---

## ✅ Pull Request Guidelines

1. **Branch naming:**
   - `feat/nome-feature` - Nuove feature
   - `fix/nome-bug` - Bug fix
   - `docs/nome-doc` - Documentazione
   - `refactor/nome` - Refactoring

2. **Commit messages:**
   ```
   feat: aggiungi nuova lezione Bitcoin basics
   fix: correggi calcolo XP nel quiz
   docs: aggiorna README con nuove istruzioni
   refactor: ottimizza rendering leaderboard
   ```

3. **PR Checklist:**
   - [ ] Codice testato localmente
   - [ ] Build production OK
   - [ ] Nessun warning in console
   - [ ] Documentazione aggiornata (se necessario)
   - [ ] Mobile responsive verificato

---

## 🎯 Best Practices

### Performance

```typescript
// ✅ Lazy load componenti pesanti
const HeavyComponent = lazy(() => import('./HeavyComponent'));

// ✅ Debounce input fields
const debouncedSearch = useMemo(
  () => debounce((value) => search(value), 300),
  []
);

// ✅ Virtualizza liste lunghe
import { useVirtualizer } from '@tanstack/react-virtual';
```

### Accessibilità

```tsx
// ✅ ARIA labels
<button aria-label="Chiudi finestra">
  <X />
</button>

// ✅ Keyboard navigation
<div
  role="button"
  tabIndex={0}
  onKeyDown={(e) => e.key === 'Enter' && handleClick()}
>

// ✅ Alt text per immagini
<img src={imgSrc} alt="Prof Satoshi mascotte" />
```

### Security

```typescript
// ✅ Sanitizza user input
import DOMPurify from 'dompurify';
const cleanHTML = DOMPurify.sanitize(userInput);

// ✅ Environment variables per secrets
const apiKey = import.meta.env.VITE_API_KEY;

// ❌ MAI hardcodare secrets
const apiKey = 'sk-proj-123456'; // ❌ NO!
```

---

## 📞 Support

- **Documentation:** `/docs/`
- **Status Dashboard:** `?status=supabase`
- **Chat Test:** `?test=chat`

---

**Happy coding! 🚀**
