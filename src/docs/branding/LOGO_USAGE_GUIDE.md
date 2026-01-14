# 🎨 btcwheel Logo Usage Guide

## Logo Asset

**Source:** `figma:asset/b949a2489091127a98d29035203a5c2b69097613.png`

**Caratteristiche:**
- Simbolo "B" stilizzato dentro cerchio
- Colore principale: Verde acqua / Emerald (#34d399)
- Design moderno e minimale
- Perfetto per branding tech/finance

---

## Usage in Code

### Import Logo

```typescript
import btcwheelLogo from 'figma:asset/b949a2489091127a98d29035203a5c2b69097613.png';
```

### Basic Usage

```tsx
<img 
  src={btcwheelLogo} 
  alt="btcwheel Logo" 
  className="w-10 h-10"
/>
```

### With Glow Effect

```tsx
<img 
  src={btcwheelLogo} 
  alt="btcwheel Logo" 
  className="w-10 h-10"
  style={{ filter: 'drop-shadow(0 4px 12px rgba(52, 211, 153, 0.4))' }}
/>
```

### With Animation (Rotate)

```tsx
import { motion } from 'motion/react';

<motion.div
  className="w-10 h-10"
  animate={{ 
    rotate: [0, 5, -5, 0]
  }}
  transition={{ 
    duration: 3, 
    repeat: Infinity,
    ease: "easeInOut"
  }}
>
  <img 
    src={btcwheelLogo} 
    alt="btcwheel Logo" 
    className="w-full h-full object-contain"
  />
</motion.div>
```

### With Animation (Float + Rotate)

```tsx
<motion.div
  className="w-12 h-12"
  animate={{ 
    y: [0, -8, 0],
    rotate: [0, 10, -10, 0]
  }}
  transition={{ 
    duration: 4, 
    repeat: Infinity,
    ease: "easeInOut"
  }}
>
  <img 
    src={btcwheelLogo} 
    alt="btcwheel Logo" 
    className="w-full h-full object-contain"
    style={{ filter: 'drop-shadow(0 4px 16px rgba(52, 211, 153, 0.5))' }}
  />
</motion.div>
```

---

## Size Guidelines

### Recommended Sizes

| Context | Size | Class | Notes |
|---------|------|-------|-------|
| Favicon | 16-32px | `w-4 h-4` | Smallest, high clarity needed |
| Navigation | 40-56px | `w-10 h-10` / `w-14 h-14` | Primary nav icon |
| Header | 48-64px | `w-12 h-12` / `w-16 h-16` | Page headers |
| Hero | 80-120px | `w-20 h-20` / `w-30 h-30` | Landing page hero |
| Large Display | 128-256px | `w-32 h-32` / `w-64 h-64` | Special occasions |

### Minimum Size
**Never go below 16x16px** - Logo details may become illegible

### Maximum Size
**Recommended max: 512x512px** - Beyond this, use SVG for scalability

---

## Color Variations

### Primary (Default)
```css
/* No filter needed - native emerald color */
filter: none;
```

### With Glow (Recommended)
```css
filter: drop-shadow(0 4px 12px rgba(52, 211, 153, 0.4));
```

### Strong Glow (Hero sections)
```css
filter: drop-shadow(0 8px 24px rgba(52, 211, 153, 0.6));
```

### Subtle Glow (Small sizes)
```css
filter: drop-shadow(0 2px 8px rgba(52, 211, 153, 0.3));
```

### On Dark Background
```tsx
<img 
  src={btcwheelLogo}
  style={{ 
    filter: 'brightness(1.1) drop-shadow(0 4px 16px rgba(52, 211, 153, 0.5))'
  }}
/>
```

### On Light Background
```tsx
<img 
  src={btcwheelLogo}
  style={{ 
    filter: 'brightness(0.95) drop-shadow(0 2px 8px rgba(52, 211, 153, 0.3))'
  }}
/>
```

---

## Component Examples

### Navigation Logo

```tsx
// Desktop Sidebar
<div className="w-14 h-14 rounded-xl flex items-center justify-center mb-4">
  <img 
    src={btcwheelLogo} 
    alt="btcwheel" 
    className="w-full h-full object-contain"
    style={{ filter: 'drop-shadow(0 2px 8px rgba(52, 211, 153, 0.3))' }}
  />
</div>

// Mobile Header
<div className="w-10 h-10">
  <img 
    src={btcwheelLogo} 
    alt="btcwheel" 
    className="w-full h-full object-contain"
  />
</div>
```

### Landing Page Logo

```tsx
<motion.div 
  className="flex items-center gap-3 cursor-pointer"
  whileHover={{ scale: 1.05 }}
>
  <motion.div 
    className="w-10 h-10"
    animate={{ rotate: [0, 5, -5, 0] }}
    transition={{ duration: 3, repeat: Infinity }}
  >
    <img 
      src={btcwheelLogo} 
      alt="btcwheel Logo" 
      className="w-full h-full object-contain"
      style={{ filter: 'drop-shadow(0 4px 12px rgba(52, 211, 153, 0.4))' }}
    />
  </motion.div>
  <span className="text-white font-bold text-xl">btcwheel</span>
</motion.div>
```

### Hero Section Logo

```tsx
<motion.div
  initial={{ scale: 0, rotate: -180 }}
  animate={{ scale: 1, rotate: 0 }}
  transition={{ 
    type: "spring", 
    stiffness: 260,
    damping: 20,
    delay: 0.2
  }}
  className="w-24 h-24 mx-auto mb-8"
>
  <img 
    src={btcwheelLogo} 
    alt="btcwheel" 
    className="w-full h-full object-contain"
    style={{ filter: 'drop-shadow(0 8px 24px rgba(52, 211, 153, 0.6))' }}
  />
</motion.div>
```

---

## Accessibility

### Alt Text Guidelines

**Navigation:**
```tsx
alt="btcwheel"
```

**Hero/Landing:**
```tsx
alt="btcwheel Logo"
```

**Decorative:**
```tsx
alt="" // Empty for decorative usage
```

### ARIA Labels

For clickable logos:
```tsx
<a 
  href="/" 
  aria-label="btcwheel homepage"
>
  <img src={btcwheelLogo} alt="btcwheel Logo" />
</a>
```

---

## Dos and Don'ts

### ✅ DO

- ✅ Use consistent sizing across similar contexts
- ✅ Add subtle glow effects on dark backgrounds
- ✅ Maintain aspect ratio (always square)
- ✅ Use appropriate alt text
- ✅ Apply smooth animations (3-4s duration)
- ✅ Center align the logo
- ✅ Use emerald color glow (#34d399)

### ❌ DON'T

- ❌ Stretch or distort the logo
- ❌ Use below 16x16px
- ❌ Apply harsh drop shadows
- ❌ Use fast/jerky animations (<2s)
- ❌ Change the logo colors
- ❌ Add borders or backgrounds
- ❌ Overlay text on the logo
- ❌ Use low-quality/pixelated versions

---

## Brand Consistency

### With Text

When pairing logo with "btcwheel" text:

```tsx
<div className="flex items-center gap-3">
  <img src={btcwheelLogo} className="w-10 h-10" />
  <span className="font-bold text-xl">btcwheel</span>
</div>
```

**Spacing:** 12px gap (gap-3) between logo and text  
**Text Style:** Bold, 1.25rem (text-xl)  
**Alignment:** Center aligned vertically

### Color Palette

**Primary Brand Colors:**
- Emerald: `#34d399` (text-emerald-400)
- White: `#ffffff` (for dark backgrounds)
- Gray-900: `#111827` (for light backgrounds)

**Accent Colors:**
- Blue: `#3b82f6` (text-blue-600)
- Orange: `#f97316` (text-orange-500)

---

## Responsive Behavior

### Mobile (< 768px)
```tsx
<img 
  src={btcwheelLogo} 
  className="w-10 h-10 md:w-14 md:h-14"
/>
```

### Tablet (768px - 1024px)
```tsx
<img 
  src={btcwheelLogo} 
  className="w-12 h-12 md:w-16 md:h-16"
/>
```

### Desktop (> 1024px)
```tsx
<img 
  src={btcwheelLogo} 
  className="w-14 h-14 lg:w-20 lg:h-20"
/>
```

---

## Animation Presets

### Subtle Breathing
```tsx
animate={{ scale: [1, 1.05, 1] }}
transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
```

### Gentle Rotation
```tsx
animate={{ rotate: [0, 5, -5, 0] }}
transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
```

### Float Effect
```tsx
animate={{ y: [0, -8, 0] }}
transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
```

### Combined (Recommended)
```tsx
animate={{ 
  y: [0, -6, 0],
  rotate: [0, 3, -3, 0],
  scale: [1, 1.02, 1]
}}
transition={{ 
  duration: 4, 
  repeat: Infinity, 
  ease: "easeInOut" 
}}
```

### Hover Effect
```tsx
whileHover={{ 
  scale: 1.1, 
  rotate: 5,
  transition: { duration: 0.2 }
}}
```

---

## Performance Tips

### Lazy Loading

For below-the-fold logos:
```tsx
<img 
  src={btcwheelLogo}
  loading="lazy"
  alt="btcwheel"
/>
```

### Preloading

For above-the-fold critical logos:
```html
<link rel="preload" as="image" href="/path/to/logo.png">
```

### Caching

Ensure proper cache headers:
```
Cache-Control: public, max-age=31536000, immutable
```

---

## Testing Checklist

Before deploying logo changes:

- [ ] Test on mobile (iOS Safari, Chrome)
- [ ] Test on tablet (iPad, Android)
- [ ] Test on desktop (Chrome, Firefox, Safari, Edge)
- [ ] Verify animations are smooth (60fps)
- [ ] Check contrast ratios (WCAG AA)
- [ ] Test with screen readers
- [ ] Verify alt text is appropriate
- [ ] Check logo loads quickly (<100ms)
- [ ] Test on slow connections (3G)
- [ ] Verify no layout shift (CLS)

---

<div align="center">

## 🎨 btcwheel Brand Identity

**Logo:** Clean, Modern, Professional  
**Color:** Emerald Green #34d399  
**Style:** Minimalist, Tech-forward  

Use this guide to maintain brand consistency across the entire app.

</div>
