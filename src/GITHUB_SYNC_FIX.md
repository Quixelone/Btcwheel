# 🔄 Guida di Allineamento Figma Make <-> GitHub <-> Vercel

## 🚨 Problema Identificato
Esiste una discrepanza critica nella struttura del progetto:
- **Figma Make:** Usa una struttura "Root-based" (i componenti sono in `/components`).
- **GitHub:** Mantiene una struttura "Standard Vite" (i componenti sono in `/src/components`).
- **Vercel:** Tenta di costruire il progetto da GitHub ma fallisce perché i riferimenti ai file non corrispondono.

Inoltre, le immagini SVG in `/public` potrebbero non caricarsi a causa di percorsi relativi errati o configurazione di Vite.

## 🛠 Soluzione 1: Standardizzare su Struttura Root (Consigliata per Figma Make)

Se vuoi mantenere la struttura attuale di Figma Make, devi **forzare** questa struttura su GitHub.

1. **Esegui questi comandi nel terminale locale (Git Bash / Terminal):**

```bash
# 1. Assicurati di essere sul branch corretto (es. main)
git checkout main

# 2. Aggiungi tutti i file attuali (inclusi quelli spostati/creati da Figma)
git add .

# 3. Commit che spiega il cambiamento strutturale
git commit -m "Refactor: Standardize project structure to Root-based for Figma Make compatibility"

# 4. Push forzato (ATTENZIONE: Sovrascrive la storia remota se divergente)
# Solo se sei sicuro che il codice locale sia quello 'giusto'
git push origin main
```

## 🛠 Soluzione 2: Debug Build Vercel

Ho creato uno script di build personalizzato (`verify-build.sh`) e aggiornato `vercel.json` per debuggare l'errore "No Output Directory named dist".

1. **Il nuovo script fa:**
   - Verifica la presenza di `node_modules`
   - Esegue `vite build`
   - Verifica se la cartella `dist` viene creata correttamente
   - Stampa i log dettagliati

2. **Cosa devi fare:**
   - Fai il push delle modifiche che ho appena fatto (`vercel.json`, `package.json`, `vite.config.ts`, `verify-build.sh`).
   - Vai su Vercel Dashboard -> Deployments.
   - Controlla i log del nuovo deployment. Se fallisce, vedrai esattamente PERCHÉ `dist` non viene creata.

## 🖼 Fix Immagini SVG

Ho aggiornato `vite.config.ts` per gestire meglio gli asset statici.

1. **Verifica:**
   - Le immagini devono essere in `/public` (es. `/public/mascot-normal.svg`).
   - Nel codice, usale come `/mascot-normal.svg` (SENZA `/public`).

Se le immagini ancora non si vedono, prova a cancellare la cache del browser o verificare che il file esista fisicamente nel repo GitHub (a volte `.gitignore` errati le escludono). Ho creato un `.gitignore` corretto per prevenire questo.

## 📋 Prossimi Passi

1. **Pusha le modifiche** generate ora.
2. Controlla il deployment su Vercel.
3. Se Vercel da ancora errore, controlla i log di `verify-build.sh`.
