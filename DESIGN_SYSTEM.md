# 🎨 BTC Wheel Pro - Design System 2026 (Dark Neon Edition)

> Sistema di design evoluto per un look "Dark & Clean Neon" ultra-moderno.
> Focus su contrasti elevati, sfondi profondi e accenti vibranti.

---

## 🎨 Palette Colori

### Backgrounds (Deep Dark)
```css
--bg-app: #030305;          /* Nero quasi assoluto */
--bg-card: #0A0A0C;         /* Grigio scuro profondo per le card */
--bg-card-hover: #121215;   /* Stato hover leggermente più chiaro */
--bg-overlay: rgba(10, 10, 12, 0.8); /* Backdrop blur overlay */
```

### Neon Accents (Vibrant)
```css
/* Primary Brand - Electric Purple */
--neon-purple: #8B5CF6;
--neon-purple-glow: 0 0 20px rgba(139, 92, 246, 0.5);

/* Secondary - Acid Green */
--neon-green: #10B981;
--neon-green-glow: 0 0 20px rgba(16, 185, 129, 0.5);

/* Accent - Cyber Cyan */
--neon-cyan: #06B6D4;
--neon-cyan-glow: 0 0 20px rgba(6, 182, 212, 0.5);

/* Accent - Hot Pink */
--neon-pink: #EC4899;
--neon-pink-glow: 0 0 20px rgba(236, 72, 153, 0.5);
```

### Gradients (Subtle & Deep)
```css
--grad-purple: linear-gradient(180deg, rgba(139, 92, 246, 0.15) 0%, rgba(139, 92, 246, 0) 100%);
--grad-green: linear-gradient(180deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0) 100%);
--grad-surface: linear-gradient(145deg, #0A0A0C 0%, #050506 100%);
```

### Borders (Ultra Thin)
```css
--border-subtle: rgba(255, 255, 255, 0.08);
--border-highlight: rgba(255, 255, 255, 0.15);
--border-neon-purple: rgba(139, 92, 246, 0.3);
```

---

## 🃏 Componenti Card (Glass & Depth)

### Stile Base
```html
<div class="bg-[#0A0A0C] border border-white/[0.08] rounded-[24px] p-6 shadow-2xl relative overflow-hidden group">
  <!-- Glow Effect on Hover -->
  <div class="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
</div>
```

### Stile "Neon Border" (Active/Featured)
```html
<div class="bg-[#0A0A0C] border border-purple-500/30 rounded-[24px] p-6 shadow-[0_0_30px_-10px_rgba(139,92,246,0.2)]">
```

---

## 🔤 Tipografia (Modern Display)

### Font Stack
`Inter` (con `tracking-tight` per titoli) o `Outfit` per un look più tech.

| Elemento | Stile | Tailwind |
|----------|-------|----------|
| **H1 Hero** | 64px Bold | `text-6xl font-bold tracking-tighter text-white` |
| **H2 Section** | 32px Bold | `text-3xl font-bold tracking-tight text-white` |
| **H3 Card** | 20px Semibold | `text-xl font-semibold tracking-tight text-white` |
| **Body** | 16px Regular | `text-base text-[#888899] leading-relaxed` |
| **Label** | 12px Medium | `text-xs font-medium text-[#666677] uppercase tracking-wider` |

---

## 🔘 Bottoni (Glow & Solid)

### Primary Neon
```html
<button class="h-12 px-8 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-semibold shadow-[0_0_20px_rgba(139,92,246,0.4)] hover:shadow-[0_0_30px_rgba(139,92,246,0.6)] transition-all duration-300 transform hover:-translate-y-0.5">
```

### Secondary Glass
```html
<button class="h-12 px-8 bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-white rounded-xl font-medium backdrop-blur-md transition-all">
```

---

## 📱 Layout & Spacing

- **Container**: `max-w-[1400px]` (più largo per respiro)
- **Grid Gap**: `gap-6` o `gap-8`
- **Section Padding**: `py-20` o `py-24`

---

## ✨ Micro-Interazioni

- **Hover Card**: Leggero `scale-[1.02]`, bordo diventa più luminoso.
- **Click**: `scale-[0.98]`.
- **Load**: Fade in dal basso con `y: 20`.

---

## 🛠️ Implementazione

1.  **Sfondo Pagina**: `#030305` fisso.
2.  **Luci Ambientali**: Orb sfocati molto grandi (800px+) con opacità bassissima (3-5%) per dare profondità senza disturbare.
3.  **Icone**: Stroke sottile (1.5px), colore bianco o neon.

---
*Aggiornato: Gennaio 2026 - Dark Neon Edition*
