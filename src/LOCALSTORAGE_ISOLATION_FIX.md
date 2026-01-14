# 🔧 localStorage Isolation Fix

## Problema Identificato

Quando deployato su Vercel e autenticato con Supabase, l'app caricava i dati di **un'altra app** invece di quelli di btcwheel.

### Causa Root
- **Stesso progetto Supabase condiviso** tra più applicazioni
- **localStorage senza prefisso** → chiavi condivise tra app diverse
- Quando l'utente faceva login, Supabase autenticava correttamente, ma i dati caricati erano della vecchia app

### Esempio del Problema:
```javascript
// App 1 (btcwheel)
localStorage.setItem('btc-wheel-progress', '...')

// App 2 (altra app sullo stesso progetto Supabase)
localStorage.setItem('btc-wheel-progress', '...')

// ❌ CONFLITTO! Le app si sovrascrivono i dati
```

---

## ✅ Soluzione Implementata

### 1. Creato `/lib/localStorage.ts`
Wrapper per localStorage con **prefisso unico per app**:

```typescript
const APP_PREFIX = 'btcwheel_';

export const storage = {
  getItem: (key: string) => localStorage.getItem(`${APP_PREFIX}${key}`),
  setItem: (key: string, value: string) => localStorage.setItem(`${APP_PREFIX}${key}`, value),
  removeItem: (key: string) => localStorage.removeItem(`${APP_PREFIX}${key}`),
  clear: () => { /* Clear only btcwheel_ keys */ }
};
```

### 2. Aggiornato Supabase Client (`/lib/supabase.ts`)
Usa storage isolato per sessioni Supabase:

```typescript
import { storage } from './localStorage';

const customStorage = {
  getItem: (key: string) => storage.getItem(key),
  setItem: (key: string, value: string) => storage.setItem(key, value),
  removeItem: (key: string) => storage.removeItem(key),
};

const supabase = createClient(url, key, {
  auth: {
    storage: customStorage // ✅ Usa storage isolato
  }
});
```

### 3. Aggiornati tutti i Hook
- ✅ `/hooks/useAuth.ts` → Usa `storage.getItem('btcwheel_local_user')`
- ✅ `/hooks/useUserProgress.ts` → Usa `storage.getItem('btc-wheel-progress')`
- ✅ `/hooks/useHaptics.ts` → Usa `storage.getItem('mascotHapticEnabled')`
- ✅ `/hooks/useOnboarding.ts` → Usa `storage.getItem('btc-wheel-onboarding')`

---

## 📊 Prima vs Dopo

### Prima (Problema)
```
localStorage:
├─ btc-wheel-progress → dati di app1
├─ sb-tzorfzsdhyceyumhlfdp-auth-token → utente autenticato
└─ ...

// Login → Carica dati di app1 ❌
```

### Dopo (Risolto)
```
localStorage:
├─ btcwheel_btc-wheel-progress → dati di btcwheel ✅
├─ btcwheel_sb-tzorfzsdhyceyumhlfdp-auth-token → sessione isolata ✅
├─ vecchi_dati_senza_prefisso → ignorati
└─ ...

// Login → Carica solo dati btcwheel ✅
```

---

## 🧪 Test

### Test 1: Verifica Isolamento
1. Apri Developer Tools → Application → localStorage
2. Cerca chiavi con prefisso `btcwheel_`
3. Tutte le nuove chiavi dovrebbero avere il prefisso

### Test 2: Login/Logout
1. Login con account Supabase
2. Controlla che i dati caricati siano corretti
3. Logout
4. Verifica che solo le chiavi `btcwheel_` siano state rimosse

### Test 3: Migrazione Dati Vecchi (Opzionale)
Se hai dati esistenti da migrare:

```javascript
// Console del browser
import { storage } from './lib/localStorage';

// Migra dati vecchi
storage.migrateFromOldKeys([
  'btc-wheel-progress',
  'btcwheel_local_user',
  'btc-wheel-onboarding'
]);

// ✅ Dati copiati con prefisso btcwheel_
```

---

## 🚀 Deploy

### Cosa Fare Dopo il Deploy su Vercel:

1. **Pulisci localStorage** (per utenti esistenti):
   ```javascript
   // Console del browser su app deployata
   localStorage.clear();
   location.reload();
   ```

2. **Primi utenti** non avranno problemi
3. **Utenti esistenti** dovranno:
   - Rifare login
   - Completare nuovamente onboarding (se necessario)
   - I dati vecchi rimarranno in localStorage ma saranno ignorati

---

## 📝 Checklist Deploy

- [x] Creato `/lib/localStorage.ts` con prefisso `btcwheel_`
- [x] Aggiornato `/lib/supabase.ts` per usare storage isolato
- [x] Aggiornati tutti gli hook: `useAuth`, `useUserProgress`, `useHaptics`, `useOnboarding`
- [x] Testato localmente
- [ ] Deploy su Vercel
- [ ] Testato su produzione
- [ ] Documentato agli utenti (se necessario)

---

## 🔮 Prevenzione Futura

### Best Practices:
1. **Sempre usare prefissi unici** per localStorage in app multi-progetto
2. **Documentare schema localStorage** in README
3. **Testare isolamento** prima del deploy
4. **Creare progetti Supabase separati** per app diverse (quando possibile)

### Schema localStorage Corrente:
```
btcwheel_btc-wheel-progress          → User progress data
btcwheel_btcwheel_local_user         → Local auth user
btcwheel_btc-wheel-onboarding        → Onboarding state
btcwheel_btc-wheel-onboarding-${uid} → User-specific onboarding
btcwheel_mascotHapticEnabled         → Haptic feedback setting
btcwheel_sb-*                        → Supabase auth tokens (auto-prefixed)
```

---

## 🆘 Troubleshooting

### Problema: Dati ancora mischiati
**Soluzione:**
1. Apri Developer Tools
2. Vai su Application → localStorage
3. Elimina tutte le chiavi **senza** prefisso `btcwheel_`
4. Ricarica pagina

### Problema: Login non funziona
**Soluzione:**
1. Verifica in console: `console.log(storage.getItem('sb-tzorfzsdhyceyumhlfdp-auth-token'))`
2. Se null, fai logout/login
3. Controlla che la sessione venga salvata con prefisso

### Problema: Dati persi dopo aggiornamento
**Soluzione (Migrazione):**
```javascript
// In console del browser
const oldData = localStorage.getItem('btc-wheel-progress');
if (oldData) {
  localStorage.setItem('btcwheel_btc-wheel-progress', oldData);
  console.log('✅ Dati migrati!');
}
```

---

## ✅ Risultato Finale

✅ **localStorage completamente isolato** per btcwheel
✅ **Nessuna interferenza** con altre app sullo stesso progetto Supabase
✅ **Sessioni Supabase** gestite correttamente con prefisso
✅ **Backward compatible** (i vecchi dati non causano errori, semplicemente ignorati)
✅ **Facile da debuggare** (tutte le chiavi hanno prefisso `btcwheel_`)

---

**Data:** 2026-01-05  
**Versione:** 1.0.0  
**Status:** ✅ Implementato e Testato
