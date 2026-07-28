# 001 — Make the Command Palette exit animation actually run

- **Status**: TODO
- **Commit**: 8b6d5ce
- **Severity**: HIGH
- **Category**: Interruptibility / Purpose & frequency
- **Estimated scope**: 1 file, ~15 lines restructured

## Problem

`CommandPalette` (opened constantly via ⌘K) imports `AnimatePresence` and defines an
`exit` transition, but neither is wired up — the component returns `null` the instant
`open` becomes false, so the element unmounts before any exit can play. The palette
**pops out with no animation**, while it animates *in*. Asymmetric, and the dead
`AnimatePresence` import is misleading.

```jsx
/* akira-saas/src/components/layout/CommandPalette.jsx:3 — current */
import { motion, AnimatePresence } from 'framer-motion'
```

```jsx
/* akira-saas/src/components/layout/CommandPalette.jsx:51 — current: early return kills exit */
  if (!open) return null

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 500, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '80px 16px 16px' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: -10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.98 }}
        transition={{ duration: 0.15 }}
        onClick={function(e) { e.stopPropagation() }}
        style={{ width: '100%', maxWidth: '560px', /* … */ }}
      >
```

Because `<div>` (the backdrop) is not a `motion` element and lives outside any
`AnimatePresence`, the whole subtree is removed synchronously on close.

## Target

Drive the open state **inside** `AnimatePresence` and remove the early `return null`.
Also promote the backdrop to a `motion.div` so it fades (addresses the "backdrop pops
in" opportunity). Reuse the palette's existing enter/exit values and duration exactly —
do not invent new ones.

```jsx
/* target — akira-saas/src/components/layout/CommandPalette.jsx */
  // NOTE: remove the `if (!open) return null` line entirely.

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="cmdk-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          style={{ position: 'fixed', inset: 0, zIndex: 500, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '80px 16px 16px' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            onClick={function(e) { e.stopPropagation() }}
            style={{ width: '100%', maxWidth: '560px', background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: '14px', boxShadow: 'var(--shadow-modal)', overflow: 'hidden' }}
          >
            {/* …existing header / results / footer unchanged… */}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
```

## Repo conventions to follow

- This is exactly how [`Modal.jsx:14-33`](akira-saas/src/components/ui/Modal.jsx#L14)
  already does it: `<AnimatePresence>{open && (<motion.div overlay …><motion.div box …>`.
  Mirror that structure. Keep the palette's own curve/duration (`duration: 0.15`,
  `y: -10, scale: 0.98`) — do not copy Modal's `[0.16, 1, 0.3, 1]` here.
- The `useEffect` hooks at lines 18-36 already guard on `open`; they keep working
  because the component still renders (it just renders `null` children via the
  `{open && …}` gate) — do **not** remove them.

## Steps

1. Delete the line `if (!open) return null` (currently line 51).
2. Wrap the returned markup in `<AnimatePresence>` … `</AnimatePresence>` with an
   `{open && ( … )}` gate immediately inside.
3. Convert the outer backdrop `<div>` to `<motion.div key="cmdk-backdrop">` with
   `initial/animate/exit` opacity `0→1→0` and `transition={{ duration: 0.15 }}`. Keep
   its existing `style` and `onClick={onClose}` verbatim.
4. Leave the inner `motion.div` (the panel) and all header/results/footer JSX exactly
   as-is.

## Boundaries

- Do NOT touch the search logic, keyboard handlers, or `go()`/`handleKeyDown`.
- Do NOT change the result-row markup or add per-row entrance animations (this list
  re-renders on every keystroke; animating rows would be a regression).
- Do NOT add dependencies.
- If the current code no longer matches the excerpt above (drift since commit
  `8b6d5ce`), STOP and report.

## Verification

- **Mechanical**: `cd akira-saas && npm run build` completes with no new errors; the
  file lints clean under oxlint.
- **Feel check**: run `npm run dev`, press ⌘K (or Ctrl+K) to open, then Esc to close:
  - The panel fades + lifts out (does not vanish instantly) on close.
  - The dark backdrop fades in on open and fades out on close, rather than snapping.
  - Spamming ⌘K open/close does not leave a stuck overlay.
  - In DevTools → Animations, set speed to 10% and confirm the exit plays fully.
- **Done when**: open and close are visually symmetric and no overlay is ever orphaned.
