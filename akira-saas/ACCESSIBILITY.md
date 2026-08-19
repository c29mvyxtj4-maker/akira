# Accesibilidad AKIRA - Guía de Mejores Prácticas

## 📋 Estándares WCAG 2.1 AA

AKIRA se adhiere a los estándares WCAG 2.1 Level AA para máxima accesibilidad.

---

## 🔑 Componentes Accesibles

### 1. **IconButton** - Botones con icono
Todos los botones que contienen SOLO un icono deben usar el componente `IconButton`:

```jsx
import IconButton from '@/components/ui/IconButton'
import { Archive, Edit3, Trash2 } from 'lucide-react'

// ✅ CORRECTO
<IconButton icon={Archive} onClick={() => handleArchive(id)} />
<IconButton icon={Edit3} onClick={() => handleEdit(item)} />

// ❌ INCORRECTO  
<button onClick={() => handleArchive(id)}><Archive size={16} /></button>
```

**Características:**
- aria-label automático basado en nombre del icono
- Fallback a title si no se proporciona ariaLabel
- Tamaño consistente: 28x28px (w-7 h-7)
- Transiciones hover uniformes

### 2. **Toast** - Notificaciones
Todas las notificaciones usan el sistema Toast con aria-live:

```jsx
const { toasts, show, dismiss } = useToast()

show('Operación exitosa', 'success', 3000)
show('Error al guardar', 'error', 4000)
```

**Características:**
- aria-live="polite" para anuncios no-disruptivos
- Auto-dismiss configurable
- Contraste color >= 4.5:1
- 3000-4000ms duración

### 3. **Form Validation** - Errores en formularios
Los formularios muestran errores visual y textualmente:

```jsx
{errors.name && (
  <div role="alert" aria-live="assertive" className="error-message">
    <AlertCircle size={16} />
    {errors.name}
  </div>
)}
```

**Características:**
- `role="alert"` para errores críticos
- Mensajes descriptivos en español
- Navegación por teclado (Tab, Enter, Esc)

### 4. **Modal/Dialog**
Todos los modales deben tener aria-modal y focus trap:

```jsx
<div role="dialog" aria-modal="true" aria-labelledby="modal-title">
  <h2 id="modal-title">Confirmar acción</h2>
  {/* contenido */}
</div>
```

---

## 🎯 Checklist de Accesibilidad

Antes de mergearse, todo PR debe cumplir:

### Teclado
- [ ] Todos los elementos interactivos son accesibles por Tab
- [ ] Focus visible en todos los elementos
- [ ] Orden Tab lógico (left-to-right, top-to-bottom)
- [ ] Escape cierra modales y menus
- [ ] Enter/Space activan botones

### Pantalla
- [ ] Texto con contraste >= 4.5:1 (WCAG AA)
- [ ] Iconos tienen aria-label o title
- [ ] Colores no son la única forma de comunicar información
- [ ] Responsive en 320px, 768px, 1920px

### Lector de Pantalla
- [ ] aria-label en botones de icono
- [ ] Headings (h1-h6) en jerarquía lógica
- [ ] Listas semánticas (<ul>, <ol>)
- [ ] Tablas con <th> y scope
- [ ] Form labels con <label htmlFor>
- [ ] aria-live para notificaciones dinámicas
- [ ] aria-modal en dialogs
- [ ] alt text en imágenes

### Validación
- [ ] Errores de formulario comunicados textualmente
- [ ] Success feedback con toast + aria-live
- [ ] Sin campos "requeridos" solo por color

---

## 🚀 Herramientas de Testing

### Navegador
```bash
# Chrome DevTools
1. Abre DevTools (F12)
2. Ir a Lighthouse tab
3. Click "Generate report"
4. Mira scores de Accessibility
```

### Automático (futuro)
```bash
npm install --save-dev @axe-core/playwright
npm run test:a11y
```

### Manual (ahora)
```bash
# Test con keyboard
1. Desactiva mouse
2. Usa solo Tab, Enter, Arrow keys, Escape
3. Verifica que puedes acceder a todo

# Test con lector
1. macOS: System Preferences > Accessibility > VoiceOver
2. Linux: Orca (GNOME)
3. Windows: NVDA (free), JAWS (commercial)
```

---

## 📈 Roadmap Accesibilidad

**✅ FASE 6 (Actual)**
- IconButton component con aria-labels
- Accesibilidad Guide (este documento)
- Toast con aria-live regions
- Form validation con role="alert"

**⏳ FASE 7 (Próximo)**
- Agregar aria-label a todos los icon buttons (50+)
- Implementar focus-trap en modales
- Color contrast audit en todas las páginas
- Heading hierarchy en todas las páginas

**⏳ FASE 8 (Futuro)**
- Automated testing con Axe Core
- ARIA attributes completeness audit
- Keyboard navigation testing
- Lector de pantalla testing (NVDA/JAWS)

---

## 📚 Referencias

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM](https://webaim.org/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)

---

## ✨ Principios Clave

1. **Semantic HTML First** — Use `<button>`, `<label>`, `<h1>` en lugar de divs
2. **Keyboard Navigable** — Todo debe funcionar sin mouse
3. **Screen Reader Friendly** — Describe acciones, no solo iconos
4. **Sufficient Contrast** — 4.5:1 para texto normal, 3:1 para grande
5. **Clear Focus** — Focus indicator siempre visible
6. **Error Prevention** — Validación clara, mensajes descriptivos

---

**Última actualización:** 2026-08-19 (FASE 6)  
**Versión:** 1.0
