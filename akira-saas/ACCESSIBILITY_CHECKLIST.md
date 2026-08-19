# ♿ Accessibility Checklist for Developers

Use this checklist **BEFORE committing accessibility-related changes**.

## Pre-Commit Verification

### Keyboard Navigation
- [ ] All interactive elements are reachable via Tab key
- [ ] Tab order is logical (left-to-right, top-to-bottom)
- [ ] Focus is always visible (outline, border, or highlight)
- [ ] Escape key closes modals and menus
- [ ] Enter/Space activate buttons

### Screen Reader Support
- [ ] All buttons have accessible names (text or aria-label)
- [ ] Form inputs have associated `<label>` elements or aria-labels
- [ ] Headings use semantic `<h1>`-`<h6>` tags in logical order
- [ ] Images have descriptive `alt` text (or empty `alt=""` if decorative)
- [ ] Lists use semantic `<ul>/<ol>` tags
- [ ] Modals have `role="dialog"` and `aria-modal="true"`
- [ ] Error messages have `role="alert"` or are announced via `aria-live`
- [ ] Skip links present for keyboard users (if applicable)

### Color & Contrast
- [ ] Text contrast is at least 4.5:1 (WCAG AA normal text)
- [ ] Color is not the only way to convey information
- [ ] Disabled states are still distinguishable

### Form Validation
- [ ] Error messages are clear and descriptive
- [ ] Required fields are marked with asterisk AND aria-required
- [ ] Validation happens on blur/change, not just submit
- [ ] Form can be submitted via Enter key

### Mobile & Responsive
- [ ] Touch targets are at least 44x44px
- [ ] Interactive elements work on touch devices
- [ ] Text is readable without horizontal scrolling
- [ ] Zoom/scaling works correctly

## Running Tests

Before submitting PR:

```bash
# Run unit accessibility tests
npm run test:a11y

# Run full accessibility audit (requires dev server running)
npm run a11y:audit

# Run E2E tests
npx playwright test

# View Playwright report
npx playwright show-report
```

## Common Patterns

### ✅ Accessible Button with Icon

```jsx
import IconButton from '@/components/ui/IconButton'
import { Trash2 } from 'lucide-react'

// Auto-generates aria-label from icon name
<IconButton icon={Trash2} onClick={handleDelete} />

// Or explicit aria-label
<IconButton 
  icon={Edit3} 
  onClick={handleEdit}
  ariaLabel="Editar proyecto"
/>
```

### ✅ Accessible Form Input

```jsx
<div className="form-group">
  <label htmlFor="email">
    Email *
    <span aria-label="required">*</span>
  </label>
  <input
    id="email"
    type="email"
    required
    aria-required="true"
    aria-describedby={errors.email ? 'email-error' : undefined}
  />
  {errors.email && (
    <div 
      id="email-error" 
      role="alert" 
      className="error-message"
    >
      {errors.email}
    </div>
  )}
</div>
```

### ✅ Accessible Modal

```jsx
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
>
  <h2 id="modal-title">Confirm Delete</h2>
  <p>Are you sure? This cannot be undone.</p>
  <button onClick={handleConfirm}>Delete</button>
  <button onClick={handleCancel}>Cancel</button>
</div>
```

### ✅ Accessible List

```jsx
<ul className="client-list">
  {clients.map(client => (
    <li key={client.id}>
      <span className="client-name">{client.name}</span>
      <span className="client-status">{client.status}</span>
    </li>
  ))}
</ul>
```

### ✅ Toast Notification

```jsx
const { show } = useToast()

// Toast automatically has aria-live="polite"
show('Cliente creado exitosamente', 'success', 3000)
show('Error al guardar', 'error', 4000)
```

## Common Mistakes ❌

| Mistake | Fix |
|---------|-----|
| Button with only icon, no aria-label | Use `<IconButton>` component |
| Input without label | Add `<label htmlFor="id">` |
| Image with no alt text | Add `alt="descriptive text"` |
| Modal without role="dialog" | Add `role="dialog" aria-modal="true"` |
| Error shown only by color | Add text message in alert role |
| Touch target < 44px | Increase button size or add padding |
| Form labels floated, not semantic | Use `<label htmlFor>` |
| Tab order jumps around | Check z-index and DOM order match |
| Keyboard shortcut with no indication | Show hint or help text |

## Standards & References

- **WCAG 2.1 Level AA** - Target compliance level
- **Semantic HTML** - Use correct elements (`<button>`, `<label>`, `<h1>`, etc)
- **ARIA Authoring Practices** - https://www.w3.org/WAI/ARIA/apg/
- **WebAIM** - https://webaim.org/
- **MDN Accessibility** - https://developer.mozilla.org/en-US/docs/Web/Accessibility

## Tools

- **axe DevTools** - Chrome extension for quick audits
- **Lighthouse** - Built into Chrome DevTools (F12 → Lighthouse)
- **NVDA** - Free screen reader for Windows
- **VoiceOver** - Built-in screen reader on macOS/iOS
- **Playwright** - E2E testing with accessibility checks

## Questions?

Check [ACCESSIBILITY.md](./ACCESSIBILITY.md) for comprehensive guidance or create an issue with the `a11y` label.
