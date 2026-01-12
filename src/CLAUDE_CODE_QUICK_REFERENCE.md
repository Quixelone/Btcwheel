# 🤖 QUICK REFERENCE PER CLAUDE CODE

## 📌 CONTESTO PROGETTO

**App:** btcwheel - Educational app per Bitcoin Wheel Strategy  
**Stack:** React + Tailwind v4 + Supabase + Edge Functions (Deno)  
**Stato:** Sistema user management completato, costo medio BTC da implementare

---

## 🎯 TASK PRIORITARI

### **TASK 1: Implementa Costo Medio BTC** ⭐⭐⭐

**Obiettivo:** Tracciare accumulo BTC in bear market e calcolare prezzo medio ponderato.

**File da modificare:**
1. `/supabase/functions/server/wheel-routes.tsx` - Aggiungi funzioni backend
2. `/components/BTCAccumulationCard.tsx` - Crea nuovo component (non esiste)
3. `/components/trading/WheelDashboard.tsx` - Integra il nuovo card

**Guida completa:** `/BTC_AVERAGE_COST_IMPLEMENTATION.md`

**SQL da eseguire prima:**
```sql
ALTER TABLE wheel_strategies
ADD COLUMN total_btc_accumulated DECIMAL(18,8) DEFAULT 0,
ADD COLUMN total_btc_cost_basis DECIMAL(18,2) DEFAULT 0,
ADD COLUMN average_btc_price DECIMAL(18,2) DEFAULT 0,
ADD COLUMN last_accumulation_date TIMESTAMPTZ,
ADD COLUMN accumulation_history JSONB DEFAULT '[]'::jsonb;
```

**Funzioni da aggiungere in wheel-routes.tsx:**
- `updateBTCAccumulation()` - Calcola e aggiorna costo medio
- `canSellCall()` - Valida se si può vendere CALL
- Route GET `/can-sell-call` - Endpoint validazione

**Component da creare:**
- `BTCAccumulationCard.tsx` - Mostra costo medio, gap, warning

**Test checklist:**
- [ ] Aggiungi PUT assigned → verifica average_price aggiornato
- [ ] Aggiungi altra PUT → verifica calcolo ponderato corretto
- [ ] Prova vendita CALL con prezzo < costo medio → verifica warning
- [ ] Verifica accumulation_history popolato

---

### **TASK 2: Fix/Debug User Management** ⭐⭐

**Se l'utente riporta errori:**

**File chiave:**
- `/supabase/functions/server/user-management.tsx` - Backend API
- `/components/AdminUserManagement.tsx` - Frontend panel
- `/components/SettingsView.tsx` - Integrazione admin

**Checklist debug:**
```typescript
// 1. Verifica che le tabelle esistano
// Esegui in Supabase SQL Editor:
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_profiles', 'subscription_plans', 'user_subscriptions');

// 2. Verifica trigger funzioni
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';

// 3. Verifica admin access in SettingsView.tsx (righe 38-49)
const DEV_MODE = true; // Deve essere true in dev
const ADMIN_EMAILS = ['email@utente.com']; // Aggiungi email

// 4. Testa endpoint manualmente
curl https://[PROJECT_ID].supabase.co/functions/v1/make-server-7c0f82ca/admin/stats \
  -H "Authorization: Bearer [ACCESS_TOKEN]"
```

**Errori comuni:**
- `403 Unauthorized` → Verifica `isAdmin()` logic e DEV_MODE
- `Table does not exist` → Schema SQL non eseguito
- `No data returned` → Verifica RLS policies

---

## 🔧 FILE STRUCTURE IMPORTANTE

```
/supabase/functions/server/
├── index.tsx                    # Main server (monta tutte le route)
├── kv_store.tsx                 # KV helpers (read-only, NON MODIFICARE)
├── wheel-routes.tsx             # Wheel strategy API ← MODIFICA PER COSTO MEDIO
├── user-management.tsx          # User management API ← GIÀ COMPLETO
├── exchange-connectors.tsx      # Exchange integrations
└── db-duplicate.tsx             # Database duplication

/components/
├── trading/
│   └── WheelDashboard.tsx       # Main wheel UI ← INTEGRA BTCAccumulationCard
├── AdminUserManagement.tsx      # Admin panel ← GIÀ COMPLETO
├── SettingsView.tsx             # Settings page ← GIÀ INTEGRATO
└── (DA CREARE) BTCAccumulationCard.tsx ← CREA QUESTO!

/docs/
├── USER_MANAGEMENT_SETUP.md           # Guida user management
├── BTC_AVERAGE_COST_IMPLEMENTATION.md # Guida costo medio BTC
└── NEXT_STEPS_SUMMARY.md              # Riepilogo generale
```

---

## 🚨 REGOLE CRITICHE

### **NON MODIFICARE MAI:**
- `/supabase/functions/server/kv_store.tsx` (protetto)
- `/utils/supabase/info.tsx` (protetto)
- `/components/figma/ImageWithFallback.tsx` (protetto)

### **SEMPRE FARE:**
- ✅ Usa `import { createClient } from 'npm:@supabase/supabase-js@2'` nel backend
- ✅ Usa Motion per animazioni: `import { motion } from 'motion/react'`
- ✅ Verifica icon exists in lucide-react prima di importare
- ✅ Aggiungi error handling e loading states
- ✅ Console.log dettagliati per debug
- ✅ Toast notifications per feedback utente

### **BACKEND SPECIFICS:**
```typescript
// ✅ CORRETTO - Service role per admin ops
const supabase = createClient(
  Deno.env.get('SUPABASE_URL'),
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
);

// ❌ SBAGLIATO - Non usare anon key per admin
const supabase = createClient(url, publicAnonKey);

// ✅ CORRETTO - Validate user auth
const { data: { user }, error } = await supabase.auth.getUser(accessToken);
if (!user) return c.json({ error: 'Unauthorized' }, 401);

// ✅ CORRETTO - Route prefix
app.get('/make-server-7c0f82ca/endpoint', ...);
```

---

## 🎨 STYLE GUIDE

### **Colors (Tailwind)**
```css
Primary: emerald-500 (green)
Secondary: orange-500
Accent: purple-500, blue-500
Text: white, gray-400
Background: gray-950, gray-900
Borders: gray-700, white/10
```

### **Components Pattern**
```typescript
// ✅ BUONO - Usa componenti UI esistenti
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

// ✅ BUONO - Motion animations
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.1 }}
>
  ...
</motion.div>

// ✅ BUONO - Toast feedback
import { toast } from 'sonner@2.0.3';
toast.success('Operazione completata!');
toast.error('Si è verificato un errore');
```

---

## 🧪 TESTING CHECKLIST

### **User Management**
```bash
# 1. Signup nuovo utente
# 2. Verifica profilo creato automaticamente
SELECT * FROM user_profiles WHERE user_id = '[USER_ID]';

# 3. Verifica piano Free assegnato
SELECT * FROM user_subscriptions WHERE user_id = '[USER_ID]';

# 4. Login come admin
# 5. Vai Settings → Gestione Utenti
# 6. Verifica statistiche visibili
# 7. Cerca utente per email
# 8. Cambia piano a Pro
# 9. Verifica aggiornamento in DB
# 10. Crea backup
# 11. Verifica record in user_backups
```

### **Costo Medio BTC**
```bash
# 1. Crea strategia wheel
POST /wheel/strategies { name, ticker, totalCapital }

# 2. Aggiungi PUT assigned
POST /wheel/trades {
  strategyId, type: 'put', action: 'sell', 
  strike: 45000, premium: 200, quantity: 0.1,
  status: 'assigned'
}

# 3. Verifica calcolo
SELECT average_btc_price, accumulation_history 
FROM wheel_strategies WHERE id = '[STRATEGY_ID]';

# 4. Aggiungi seconda PUT
POST /wheel/trades { ..., strike: 42000, ... }

# 5. Verifica media ponderata corretta
# Expected: (45000 * 0.1 + 42000 * 0.1) / 0.2 = 43500

# 6. Test validazione
GET /can-sell-call?strategyId=[ID]&currentPrice=41000
# Expected: { canSell: false, reason: '...' }

# 7. Test vendita sopra costo medio
GET /can-sell-call?strategyId=[ID]&currentPrice=46000
# Expected: { canSell: true, data: { profit: ... } }
```

---

## 🔍 DEBUG HELPERS

### **Backend Logs**
```typescript
// Aggiungi sempre log dettagliati
console.log(`✅ [FUNCTION_NAME] Success:`, data);
console.error(`❌ [FUNCTION_NAME] Error:`, error);
console.log(`📊 [FUNCTION_NAME] Stats:`, { count, total });
```

### **Frontend Debug**
```typescript
// React DevTools
useEffect(() => {
  console.log('Component mounted, data:', data);
}, []);

// Network tab
// Verifica response format e status codes

// Supabase Dashboard
// Edge Functions → Logs (real-time)
```

### **SQL Debug**
```sql
-- Verifica dati
SELECT * FROM wheel_strategies WHERE user_id = '[USER_ID]';
SELECT * FROM user_subscriptions WHERE user_id = '[USER_ID]';

-- Verifica RLS policies
SELECT * FROM pg_policies WHERE tablename IN ('user_profiles', 'user_subscriptions');

-- Verifica trigger
SELECT * FROM pg_trigger;
```

---

## 💡 PROMPT SUGGERITI PER CLAUDE CODE

### **Per implementare costo medio BTC:**
```
"Implementa il sistema di calcolo costo medio BTC seguendo la guida in 
/BTC_AVERAGE_COST_IMPLEMENTATION.md. Devi:
1. Creare le funzioni updateBTCAccumulation() e canSellCall() in wheel-routes.tsx
2. Aggiungere la route GET /can-sell-call
3. Modificare POST /wheel/trades per update automatico
4. Creare il component BTCAccumulationCard.tsx
5. Integrarlo in WheelDashboard.tsx

Assicurati di aggiungere error handling, loading states e toast notifications."
```

### **Per debug user management:**
```
"Ho un problema con il sistema user management. L'errore è: [DESCRIVI ERRORE].
Verifica:
1. Che le tabelle esistano in Supabase
2. Che le route in user-management.tsx siano corrette
3. Che l'autenticazione admin funzioni (SettingsView.tsx)
4. Che le RLS policies permettano le operazioni
5. Che i logs mostrino errori specifici

Fornisci step-by-step debug e fix."
```

### **Per aggiungere feature:**
```
"Voglio aggiungere [FEATURE]. Segui queste guidelines:
- Backend: usa Supabase service role per admin ops
- Frontend: usa componenti UI esistenti (Card, Button, Badge)
- Animazioni: usa Motion
- Style: emerald-500 primary, orange-500 secondary
- Toast: sonner per feedback
- Error handling: try/catch con log dettagliati
- Loading states: useState + conditional rendering"
```

---

## ✅ COMPLETION CHECKLIST

Prima di considerare il task completo:

- [ ] Codice implementato secondo guide
- [ ] Error handling su tutte le async operations
- [ ] Loading states visibili
- [ ] Toast notifications per feedback
- [ ] Console logs per debug
- [ ] Testato scenario success
- [ ] Testato scenario error
- [ ] Responsive design verificato
- [ ] No TypeScript errors
- [ ] No console errors in browser
- [ ] Backend deployed (se modificato)

---

## 🎯 QUICK WINS

**Se hai poco tempo, implementa nell'ordine:**

1. **Costo Medio BTC Backend** (30 min)
   - SQL ALTER TABLE
   - Funzioni in wheel-routes.tsx
   - Route /can-sell-call

2. **Costo Medio BTC Frontend** (30 min)
   - BTCAccumulationCard component
   - Integrazione in WheelDashboard

3. **Test End-to-End** (15 min)
   - Crea strategia
   - Aggiungi trades
   - Verifica calcoli

**Totale: ~75 minuti per feature completa** ⚡

---

## 📞 RISORSE

- **Guide:** `/USER_MANAGEMENT_SETUP.md`, `/BTC_AVERAGE_COST_IMPLEMENTATION.md`
- **Summary:** `/NEXT_STEPS_SUMMARY.md`
- **Supabase Docs:** https://supabase.com/docs
- **Motion Docs:** https://motion.dev/docs/react-quick-start
- **Tailwind v4:** https://tailwindcss.com/docs

**Buon lavoro! 🚀**
