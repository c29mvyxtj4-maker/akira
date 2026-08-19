# 🎨 Component Patterns & Best Practices

Patrones comprobados para componentes accesibles, responsivos y reutilizables en AKIRA.

## 1. Button Variants

### Text Button
```jsx
<Button>Guardar</Button>
<Button variant="secondary">Cancelar</Button>
<Button variant="danger">Eliminar</Button>
```

### Icon Button (Icon Only)
```jsx
import IconButton from '@/components/ui/IconButton'

// Auto-generates aria-label
<IconButton icon={Edit3} onClick={handleEdit} />

// With custom label
<IconButton 
  icon={Trash2} 
  onClick={handleDelete}
  ariaLabel="Eliminar proyecto"
/>
```

### Button with Icon + Text
```jsx
<Button icon={<Save className="w-4 h-4" />}>
  Guardar cambios
</Button>

<Button variant="danger" icon={<Trash2 className="w-4 h-4" />}>
  Eliminar
</Button>
```

### Loading State
```jsx
<Button loading={isLoading}>
  {isLoading ? 'Cargando...' : 'Enviar'}
</Button>
```

## 2. Form Elements

### Basic Input
```jsx
<div>
  <label htmlFor="name" className="label-base">
    Nombre *
  </label>
  <input
    id="name"
    type="text"
    required
    aria-required="true"
    placeholder="Tu nombre"
    className="input-base"
  />
</div>
```

### Input with Error
```jsx
<div>
  <label htmlFor="email">Email *</label>
  <input
    id="email"
    type="email"
    required
    aria-invalid={!!errors.email}
    aria-describedby={errors.email ? 'email-error' : undefined}
    className={errors.email ? 'input-base error' : 'input-base'}
  />
  {errors.email && (
    <div 
      id="email-error" 
      role="alert" 
      className="text-sm text-status-danger mt-1"
    >
      {errors.email}
    </div>
  )}
</div>
```

### Select Dropdown
```jsx
<div>
  <label htmlFor="status" className="label-base">
    Estado
  </label>
  <select
    id="status"
    value={status}
    onChange={(e) => setStatus(e.target.value)}
    className="input-base"
  >
    <option value="">Selecciona un estado</option>
    {statuses.map(s => (
      <option key={s.id} value={s.id}>{s.label}</option>
    ))}
  </select>
</div>
```

### Textarea
```jsx
<div>
  <label htmlFor="notes" className="label-base">
    Notas adicionales
  </label>
  <textarea
    id="notes"
    value={notes}
    onChange={(e) => setNotes(e.target.value)}
    rows={4}
    placeholder="Escribe aquí..."
    className="input-base resize-vertical"
  />
</div>
```

### Checkbox
```jsx
<div className="flex items-center gap-2">
  <input
    id="agree"
    type="checkbox"
    checked={agreed}
    onChange={(e) => setAgreed(e.target.checked)}
    className="w-4 h-4"
  />
  <label htmlFor="agree" className="text-sm cursor-pointer">
    Acepto los términos y condiciones
  </label>
</div>
```

### Radio Group
```jsx
<fieldset>
  <legend className="label-base">Tipo de documento</legend>
  <div className="space-y-2">
    {types.map(type => (
      <div key={type.id} className="flex items-center gap-2">
        <input
          id={`type-${type.id}`}
          type="radio"
          name="docType"
          value={type.id}
          checked={docType === type.id}
          onChange={(e) => setDocType(e.target.value)}
          className="w-4 h-4"
        />
        <label htmlFor={`type-${type.id}`} className="text-sm cursor-pointer">
          {type.label}
        </label>
      </div>
    ))}
  </div>
</fieldset>
```

## 3. Card Components

### Basic Card
```jsx
<div className="surface-card p-4 rounded-lg border border-border">
  <h3 className="font-semibold text-text-1 mb-2">
    Título de la tarjeta
  </h3>
  <p className="text-sm text-text-3">
    Contenido descriptivo
  </p>
</div>
```

### Card with Actions
```jsx
<div className="surface-card p-4 rounded-lg border border-border">
  <div className="flex items-start justify-between mb-3">
    <div>
      <h3 className="font-semibold text-text-1">Proyecto X</h3>
      <p className="text-xs text-text-4">Creado hace 2 días</p>
    </div>
    <div className="flex gap-1.5">
      <IconButton icon={Edit3} onClick={() => handleEdit(item)} />
      <IconButton icon={Archive} onClick={() => handleDelete(item.id)} />
    </div>
  </div>
  <p className="text-sm text-text-3">Descripción corta</p>
</div>
```

### Animated Card (Framer Motion)
```jsx
import { motion } from 'framer-motion'

<motion.div
  initial={{ opacity: 0, y: 6 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.2 }}
  className="surface-card p-4 rounded-lg"
  whileHover={{ y: -2, shadow: '0 8px 16px rgba(0,0,0,0.1)' }}
>
  {/* Contenido */}
</motion.div>
```

## 4. Modal / Dialog

### Basic Modal
```jsx
import Modal from '@/components/ui/Modal'

<Modal isOpen={isOpen} onClose={handleClose} title="Confirmar acción">
  <p className="text-sm text-text-3 mb-4">
    ¿Estás seguro? Esta acción no se puede deshacer.
  </p>
  <div className="flex justify-end gap-2">
    <Button variant="secondary" onClick={handleClose}>
      Cancelar
    </Button>
    <Button variant="danger" onClick={handleConfirm}>
      Confirmar
    </Button>
  </div>
</Modal>
```

### Confirm Dialog
```jsx
import ConfirmDialog from '@/components/ui/ConfirmDialog'

<ConfirmDialog
  isOpen={showConfirm}
  title="Eliminar cliente"
  message="¿Eliminar a María García? No se puede deshacer."
  confirmText="Eliminar"
  cancelText="Cancelar"
  isDangerous
  onConfirm={handleDelete}
  onCancel={() => setShowConfirm(false)}
/>
```

## 5. List & Table

### Simple List
```jsx
<ul className="space-y-2">
  {items.map(item => (
    <li 
      key={item.id} 
      className="flex items-center justify-between p-3 rounded-lg bg-surface-1 border border-border"
    >
      <span>{item.name}</span>
      <span className="text-sm text-text-4">{item.count}</span>
    </li>
  ))}
</ul>
```

### Responsive Table
```jsx
{/* Desktop: tabla */}
<div className="hidden md:block overflow-x-auto">
  <table className="w-full">
    <thead>
      <tr className="border-b border-border">
        <th className="text-left p-3 font-semibold">Nombre</th>
        <th className="text-left p-3 font-semibold">Estado</th>
        <th className="text-right p-3 font-semibold">Acciones</th>
      </tr>
    </thead>
    <tbody>
      {items.map(item => (
        <tr key={item.id} className="border-b border-border hover:bg-surface-1">
          <td className="p-3">{item.name}</td>
          <td className="p-3"><Badge>{item.status}</Badge></td>
          <td className="p-3 text-right">
            <IconButton icon={Edit3} onClick={() => handleEdit(item)} />
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

{/* Mobile: cards */}
<div className="md:hidden space-y-2">
  {items.map(item => (
    <div key={item.id} className="surface-card p-4 rounded-lg border border-border">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold">{item.name}</h3>
        <Badge>{item.status}</Badge>
      </div>
      <div className="flex gap-1.5 justify-end">
        <IconButton icon={Edit3} onClick={() => handleEdit(item)} />
        <IconButton icon={Archive} onClick={() => handleDelete(item.id)} />
      </div>
    </div>
  ))}
</div>
```

## 6. Empty State

### No Data
```jsx
import EmptyState from '@/components/ui/EmptyState'

<EmptyState
  icon={Inbox}
  title="Sin proyectos"
  description="Crea tu primer proyecto para empezar"
  action={<Button onClick={handleCreate} icon={<Plus className="w-4 h-4" />}>
    Crear proyecto
  </Button>}
/>
```

## 7. Notification / Toast

### Success
```jsx
const { show } = useToast()

show('Cliente guardado exitosamente', 'success', 3000)
```

### Error
```jsx
show('Error al guardar: ' + error.message, 'error', 4000)
```

### Info
```jsx
show('Se enviaron 5 invitaciones', 'info', 3000)
```

## 8. Badge / Pill

### Color Coded
```jsx
<Badge color="success">Completado</Badge>
<Badge color="warning">Pendiente</Badge>
<Badge color="danger">Cancelado</Badge>
<Badge color="info">Información</Badge>
```

### Size
```jsx
<Badge size="xs">Etiqueta pequeña</Badge>
<Badge size="sm">Etiqueta mediana</Badge>
<Badge>Etiqueta normal</Badge>
```

## 9. Loading States

### Spinner
```jsx
import { PageSpinner } from '@/components/ui/Spinner'

{isLoading && <PageSpinner label="Cargando proyectos..." />}
```

### Skeleton Loader
```jsx
{isLoading ? (
  <div className="space-y-2">
    {[1, 2, 3].map(i => (
      <div 
        key={i} 
        className="h-16 bg-surface-2 rounded-lg animate-pulse"
      />
    ))}
  </div>
) : (
  {/* Contenido actual */}
)}
```

## 10. Layout Containers

### Page Container
```jsx
<div className="max-w-7xl mx-auto px-4 py-6">
  {/* Contenido página */}
</div>
```

### Grid Layout
```jsx
import { ResponsiveGrid } from '@/components/responsive'

<ResponsiveGrid cols={3} gap="gap-4" className="mb-6">
  {items.map(item => (
    <Card key={item.id}>{item.name}</Card>
  ))}
</ResponsiveGrid>
```

### Flex Layout
```jsx
{/* Sidebar + Main */}
<div className="flex flex-col lg:flex-row gap-6">
  <aside className="w-full lg:w-64 flex-shrink-0">
    Sidebar
  </aside>
  <main className="flex-1">
    Contenido principal
  </main>
</div>
```

---

## Do's & Don'ts

| Do ✅ | Don't ❌ |
|--------|---------|
| Use semantic HTML (`<button>`, `<label>`) | DIV buttons without role |
| Add aria-label to icon-only buttons | Buttons without accessible names |
| Use ResponsiveGrid for card layouts | Hardcoded grid cols (grid-cols-3) |
| Label all inputs with `<label>` | Placeholder as substitute for label |
| Show errors with role="alert" | Error text without accessibility |
| Test on mobile devices | Assume desktop-only UX |
| Use ResponsiveImage for images | Oversized images without srcSet |
| Animate with Framer Motion | CSS animations for critical UI |

---

## Resources

- [Shadcn/ui](https://ui.shadcn.com/) - Inspiration for component design
- [Radix UI](https://www.radix-ui.com/) - Accessible component patterns
- [Headless UI](https://headlessui.com/) - Unstyled, accessible components
- [Tailwind UI](https://tailwindui.com/) - Real-world component examples

---

**Last Updated:** 2026-08-19  
**Compliance:** WCAG 2.1 AA + Mobile First + Accessible
