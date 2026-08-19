# 📱 Responsive Design Guide

AKIRA SaaS está optimizado para desktop, tablet, y mobile (320px - 1920px).

## Breakpoints

| Device | Width | Class |
|--------|-------|-------|
| Mobile | < 480px | `sm:` (default) |
| Tablet | 480px - 1024px | `md:` |
| Desktop | 1024px - 1280px | `lg:` |
| Wide Desktop | > 1280px | `xl:` |

**Default (mobile-first):** Diseña primero para móvil, luego escala.

## Responsive Grid Standard

**Estándar AKIRA:**
```jsx
import { ResponsiveGrid } from '@/components/responsive'

<ResponsiveGrid cols={4} gap="gap-4">
  {items.map(item => (
    <Card key={item.id}>{item.name}</Card>
  ))}
</ResponsiveGrid>
```

**Breakpoints automáticos:**
- **Mobile (< 480px):** 1 columna
- **Tablet (480-1024px):** 2 columnas
- **Desktop (1024-1280px):** 3 columnas
- **Wide (> 1280px):** 4 columnas (o props.cols)

**No repitas estos breakpoints.** Si necesitas algo custom:
```jsx
<ResponsiveGrid 
  cols={6} 
  gap="gap-3"
  className="custom-class"
>
  {/* contenido */}
</ResponsiveGrid>
```

## Typography Responsive

**Mobile-first scaling:**
```jsx
// Título: 24px mobile → 32px desktop
<h1 className="text-2xl md:text-3xl lg:text-4xl">
  Título Principal
</h1>

// Body: 14px mobile → 16px desktop
<p className="text-sm md:text-base">
  Descripción detallada del producto
</p>
```

**Predefined sizes:**
- `text-xs` - 12px (labels, help text)
- `text-sm` - 14px (captions, metadata)
- `text-base` - 16px (body text)
- `text-lg` - 18px (larger body)
- `text-xl` - 20px (section heading)
- `text-2xl` - 24px (heading 3)
- `text-3xl` - 30px (heading 2)
- `text-4xl` - 36px (heading 1)

## Spacing Responsive

**Padding/Margin scale:**
```jsx
// Mobile: 12px, Tablet: 16px, Desktop: 20px
<div className="p-3 md:p-4 lg:p-5">
  Contenido con padding responsive
</div>

// Gap between items
<div className="flex gap-2 md:gap-3 lg:gap-4">
  {items}
</div>
```

**Margin utility:**
```jsx
// Mobile: full width (no margin)
// Tablet+: centered with margins
<div className="mx-0 md:mx-auto max-w-2xl">
  Contenido centrado
</div>
```

## Common Patterns

### Sidebar Layout
```jsx
<div className="flex flex-col lg:flex-row gap-4">
  {/* Mobile: stacked, Desktop: side-by-side */}
  <aside className="w-full lg:w-60 flex-shrink-0">
    Sidebar
  </aside>
  <main className="flex-1">
    Contenido principal
  </main>
</div>
```

### Card Grid
```jsx
<ResponsiveGrid cols={3} gap="gap-4">
  {/* Mobile: 1 col, Tablet: 2 col, Desktop: 3 col */}
  {cards.map(card => (
    <Card key={card.id}>{card.name}</Card>
  ))}
</ResponsiveGrid>
```

### Hidden Elements
```jsx
{/* Solo en desktop */}
<div className="hidden lg:block">
  Sidebar no visible en móvil
</div>

{/* Solo en móvil */}
<div className="lg:hidden">
  Mobile menu
</div>
```

### Responsive Table
```jsx
{/* Desktop: tabla normal */}
<div className="hidden md:block overflow-x-auto">
  <table>{/* tabla */}</table>
</div>

{/* Mobile: cards list */}
<div className="md:hidden">
  {items.map(item => (
    <Card key={item.id}>
      <div>{item.name}</div>
      <div>{item.value}</div>
    </Card>
  ))}
</div>
```

### Modal/Drawer
```jsx
{/* Desktop: centered modal, Mobile: bottom sheet */}
<motion.div
  className="fixed inset-0 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2"
  initial={{ y: '100%', opacity: 0 }}
  animate={{ y: 0, opacity: 1 }}
>
  {/* Modal content */}
</motion.div>
```

## Touch-Friendly Design

**Mobile interaction guidelines:**

1. **Button/Link size:** Mínimo 44x44px (recomendado: 48x48px)
   ```jsx
   <button className="px-4 py-3 md:px-3 md:py-2">
     {/* Más grande en móvil */}
   </button>
   ```

2. **Spacing:** Más espacio entre elementos en móvil
   ```jsx
   <div className="space-y-4 md:space-y-3 lg:space-y-2">
     {items}
   </div>
   ```

3. **Inputs:** Font-size ≥ 16px para evitar zoom iOS
   ```jsx
   <input 
     className="text-base" 
     type="email"
     // No usar text-sm en móvil
   />
   ```

4. **Hover effects:** Solo en desktop
   ```jsx
   <button className="hover:bg-blue-100 md:hover:shadow-lg transition">
     {/* Hover solo visible en desktop */}
   </button>
   ```

## Safe Areas (Notch Support)

Para devices con notch (iPhone X, etc):

```jsx
{/* Topbar */}
<header className="pt-4 md:pt-0">
  {/* Padding top en móvil para notch */}
  Contenido
</header>

{/* Bottom nav */}
<nav className="pb-20 md:pb-4">
  {/* Extra padding para home indicator */}
  Navegación
</nav>
```

## Performance Tips

1. **Lazy-load large images**
   ```jsx
   <img 
     src="thumb.jpg"
     srcSet="small.jpg 480w, medium.jpg 1024w, large.jpg 1920w"
     sizes="(max-width: 480px) 100vw, (max-width: 1024px) 50vw, 33vw"
   />
   ```

2. **Responsive SVG icons**
   ```jsx
   <Icon className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6" />
   ```

3. **Conditional rendering for expensive components**
   ```jsx
   const isMobile = window.innerWidth < 480
   
   {!isMobile && <ComplexChart data={data} />}
   {isMobile && <SimpleSummary data={data} />}
   ```

## Testing Responsive

### Browser DevTools
1. F12 → Toggle device toolbar (Ctrl+Shift+M)
2. Test presets: iPhone SE (375px), iPad (768px)
3. Rotate device to test landscape

### Real Devices
Test on:
- iPhone SE (375px - pequeño)
- iPhone 14 (390px - mediano)
- iPhone 14 Max (430px - grande)
- iPad (768px - tablet)
- Android phones (320px - 480px)

### Lighthouse
1. F12 → Lighthouse
2. Device: Mobile
3. Check scores for:
   - Performance
   - Accessibility
   - Best Practices

## Common Mistakes ❌

| Mistake | Fix |
|---------|-----|
| Hardcoded widths (width: 300px) | Use `max-w-xs`, responsive classes |
| Horizontal scroll on mobile | Ensure content fits, use overflow-x-auto |
| Text too small on mobile (< 16px) | Use text-base by default on small screens |
| Touch targets too small (< 44px) | Increase padding/height on mobile |
| Fixed position blocking content | Use `md:fixed` to only fix on desktop |
| No gap between mobile buttons | Add `space-y-2` or similar |
| Images not responsive | Use srcSet or ResponsiveImage component |
| Assuming portrait orientation | Test in landscape too |

## Resources

- [Tailwind Responsive Design](https://tailwindcss.com/docs/responsive-design)
- [MDN Responsive Design](https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design)
- [Google Mobile Usability](https://developers.google.com/search/mobile-sites)
- [WCAG Mobile Accessibility](https://www.w3.org/WAI/standards-guidelines/wcag/mobile/)

---

**Next:** FASE 10 testing strategy for all device sizes
