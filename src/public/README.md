# Public Assets

Questa cartella contiene tutti gli asset statici dell'app btcwheel.

## Struttura

```
/public/
├── favicon.png                    # Logo btcwheel (48x48)
├── favicon.svg                    # Logo btcwheel vettoriale
├── prof-satoshi-normal.png       # Mascotte stato normale
├── prof-satoshi-excited.png      # Mascotte stato eccitato
├── prof-satoshi-disappointed.png # Mascotte stato deluso
├── mascot-normal.svg             # Mascotte SVG normale
├── mascot-excited.svg            # Mascotte SVG eccitata
├── mascot-disappointed.svg       # Mascotte SVG delusa
├── manifest.json                 # PWA manifest
├── /icons/                       # Icone PWA (72x72, 96x96, etc.)
└── /splash/                      # Splash screens iOS/Android
```

## Note importanti

⚠️ **I file PNG NON vengono committati automaticamente da Figma Make!**

Se vedi errori 404 per le immagini, devi caricarli manualmente:

1. Vai su https://github.com/Quixelone/Btcwheel/tree/main/public
2. Clicca "Add file" → "Upload files"
3. Carica i file PNG mancanti
4. Vercel farà automaticamente il redeploy

## Alternative

- Usa gli **SVG** invece dei PNG (più leggeri e scalabili!)
- Usa **Unsplash** per immagini decorative
- Usa **CDN esterni** (Imgur, Cloudinary) per asset pesanti
