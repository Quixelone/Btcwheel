# 🚨 FIX URGENTE: Redirect a finanzacreativa.live

## ❌ Problema
Login su Vercel → Redirect a finanzacreativa.live ❌

---

## ✅ SOLUZIONE RAPIDA (5 minuti)

### 1️⃣ Vai su Supabase Dashboard
👉 https://supabase.com/dashboard/project/tzorfzsdhyceyumhlfdp

### 2️⃣ Vai su Authentication → URL Configuration
Nel menu laterale: **Authentication** → **URL Configuration**

### 3️⃣ Cambia Site URL
**Da:**
```
https://finanzacreativa.live
```

**A:**
```
https://tuo-app-btcwheel.vercel.app
```
(Usa il tuo URL Vercel reale!)

### 4️⃣ Aggiungi Redirect URLs
Nella sezione **Redirect URLs**, aggiungi tutte queste (una per riga):

```
http://localhost:5173
https://tuo-app-btcwheel.vercel.app
https://tuo-app-btcwheel.vercel.app/*
https://finanzacreativa.live
https://finanzacreativa.live/*
```

> ⚠️ **Lascia finanzacreativa.live** se vuoi che quella app continui a funzionare!

### 5️⃣ Salva
Clicca **Save** e aspetta 1-2 minuti

### 6️⃣ Test
1. Vai all'app su Vercel
2. Logout (se loggato)
3. Pulisci localStorage: `localStorage.clear()` in console
4. Login di nuovo
5. ✅ Dovresti rimanere su btcwheel!

---

## 🎯 Se Non Funziona

### Opzione B: Crea Nuovo Progetto Supabase
1. Crea nuovo progetto: https://supabase.com/dashboard
2. Copia le nuove credenziali (Project ID, Anon Key)
3. Aggiorna `/utils/supabase/info.tsx` con le nuove credenziali
4. Configura Site URL nel nuovo progetto con il tuo dominio Vercel
5. Deploy

---

## 📖 Documentazione Completa
Leggi `/SUPABASE_REDIRECT_FIX.md` per dettagli completi

---

**Status:** 🔴 Da Applicare  
**Priorità:** 🔥 CRITICA  
**Tempo:** ⏱️ 5 minuti  
