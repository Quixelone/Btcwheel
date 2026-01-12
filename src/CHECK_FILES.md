# ✅ FILE VERIFICATION CHECKLIST

## 📋 CRITICAL FILES FOR VERCEL BUILD

Verifica che questi file esistano **PRIMA** di fare il push su GitHub:

### **Root Directory (`/`)**
```
✅ /index.html
✅ /App.tsx
✅ /package.json
✅ /vercel.json
✅ /vite.config.ts
✅ /tsconfig.json
✅ /.gitignore
✅ /.node-version
✅ /.nvmrc
```

### **Source Directory (`/src/`)** ⚠️ CRITICO
```
✅ /src/main.tsx
✅ /src/globals.css
```

### **Components Directory (`/components/`)**
```
✅ /components/Dashboard.tsx
✅ /components/LandingPage.tsx
✅ /components/AuthView.tsx
... (altri componenti)
```

### **Supabase Directory (`/supabase/`)**
```
✅ /supabase/functions/server/index.tsx
✅ /supabase/functions/server/kv_store.tsx
```

### **Utils Directory (`/utils/`)**
```
✅ /utils/supabase/info.tsx
```

---

## 🔍 COME VERIFICARE

### **Metodo 1: In Figma Make (prima dell'export)**

Non puoi verificare direttamente, ma assicurati di:
1. File → Export Project
2. Download ZIP completo
3. Estrai ZIP e controlla che `/src` ci sia

---

### **Metodo 2: Dopo Export (Windows Explorer)**

1. Estrai ZIP esportato da Figma Make
2. Apri la cartella estratta
3. Verifica che esista la cartella `src\`
4. Dentro `src\` devono esserci:
   - `main.tsx`
   - `globals.css`

**Screenshot delle cartelle:**
```
btcwheel-export\
├── src\              ← DEVE ESISTERE
│   ├── main.tsx      ← DEVE ESISTERE
│   └── globals.css   ← DEVE ESISTERE
├── components\
├── supabase\
├── index.html
├── App.tsx
├── package.json
└── vercel.json
```

---

### **Metodo 3: Su GitHub (dopo il push)**

1. Vai su: https://github.com/Quixelone/btcwheel
2. Verifica che esista la cartella `src/`
3. Click su `src/` → Devono esserci:
   - `main.tsx`
   - `globals.css`

---

## 🚨 SE `/src` MANCA

### **Scenario A: Manca nel ZIP esportato**

**Causa:** Bug di export da Figma Make

**Fix:**
1. In Figma Make, crea un file test in `/src`:
   ```
   /src/test.txt con testo "test"
   ```
2. Re-export
3. Verifica che `/src` appaia nel ZIP
4. Se ancora manca → Problema di Figma Make export

---

### **Scenario B: Manca su GitHub (ma c'è nel ZIP)**

**Causa:** `.gitignore` o GitHub Desktop non lo include

**Fix 1 - Verifica .gitignore:**
- Apri `.gitignore` nel progetto locale
- Assicurati che NON contenga:
  ```
  src/         ← NON DEVE ESSERCI
  /src/        ← NON DEVE ESSERCI
  src          ← NON DEVE ESSERCI
  ```

**Fix 2 - Force Add con GitHub Desktop:**
1. GitHub Desktop → Changes tab
2. Verifica che `src/main.tsx` e `src/globals.css` siano in lista
3. Se **NON** appaiono:
   - Click destro nella cartella del progetto
   - "Show in Explorer"
   - Verifica che `src\` esista fisicamente
4. Se esiste ma non appare in GitHub Desktop:
   - Repository → Repository Settings → Ignored Files
   - Verifica che `src` non sia in lista

**Fix 3 - Manual Git Command (se hai Git CLI):**
```bash
cd C:\Users\Quixel\Desktop\btcwheel
git add src/ -f
git commit -m "Force add src directory"
git push origin main
```

---

## ✅ SUCCESS VERIFICATION

Dopo il push, verifica su GitHub:

**URL:** https://github.com/Quixelone/btcwheel/tree/main/src

**Dovresti vedere:**
```
src/
  main.tsx         (10 lines)
  globals.css      (~100-200 lines)
```

**Se vedi "404 - This path does not exist"** → `/src` non è stato caricato

---

## 🎯 COMPLETE FILE TREE (REFERENCE)

```
btcwheel/
├── .gitignore
├── .node-version
├── .nvmrc
├── App.tsx
├── index.html
├── package.json
├── vercel.json
├── vite.config.ts
├── tsconfig.json
│
├── src/                    ⚠️ CRITICAL
│   ├── main.tsx           ⚠️ CRITICAL
│   └── globals.css        ⚠️ CRITICAL
│
├── components/
│   ├── Dashboard.tsx
│   ├── LandingPage.tsx
│   ├── AuthView.tsx
│   └── ... (50+ components)
│
├── supabase/
│   └── functions/
│       └── server/
│           ├── index.tsx
│           └── kv_store.tsx
│
├── utils/
│   └── supabase/
│       └── info.tsx
│
├── lib/
│   ├── badges.ts
│   ├── lessons.ts
│   └── supabase.ts
│
├── hooks/
│   ├── useAuth.ts
│   ├── useUserProgress.ts
│   └── ... (altri hooks)
│
├── public/
│   ├── manifest.json
│   ├── service-worker.js
│   └── icons/
│
└── styles/
    └── globals.css
```

---

## 📞 TROUBLESHOOTING CONTACT

Se `/src` continua a mancare, fornisci:

1. **Screenshot** della cartella estratta dal ZIP (mostra `src\`)
2. **Screenshot** di GitHub Desktop Changes tab
3. **Link** GitHub: https://github.com/Quixelone/btcwheel
4. **Screenshot** del contenuto di `.gitignore`

---

**Last Check Date:** [Run this before every push]
