# 003 — Stop animating `width: auto` on sidebar labels (fade instead)

- **Status**: TODO
- **Commit**: 8b6d5ce
- **Severity**: MEDIUM
- **Category**: Performance (layout thrash)
- **Estimated scope**: 1 file (`Sidebar.jsx`), ~4 motion blocks
- **Feel-check required**: yes — this changes how labels reveal during collapse.

## Problem

When the sidebar expands/collapses, each text label animates its own
`width: 0 → auto`. Animating to/from `auto` forces Framer Motion to measure and drive
a **pixel width per frame**, which triggers layout (reflow) on every frame — the one
animation type that cannot be GPU-composited. This runs on a frequent interaction
(toggling the sidebar) and stacks N labels animating layout simultaneously.

It is also redundant: the sidebar **container already animates its width** and clips
its overflow, so the labels do not need to animate width at all — only fade.

```jsx
/* akira-saas/src/components/layout/Sidebar.jsx:48-57 — current (Logo label; representative) */
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.15 }}
            style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}
          >
```

```jsx
/* akira-saas/src/components/layout/Sidebar.jsx:90-95 — the container already animates width + clips */
    <motion.div className={'sidebar' + …} animate={{ width: W }}
      transition={{ duration: 0.2, ease: 'easeInOut' }} style={{ width: W }}>
```

The same `width: 0 ↔ 'auto'` pattern repeats at **lines 120, 147, and 205** (nav
labels). All four are the same fix.

## Target

Animate **opacity only** (with a small horizontal slide for polish), and let the
container's existing width animation + `overflow: hidden` provide the space and the
clip. Keep `duration: 0.15` and the `overflow: hidden; white-space: nowrap` style so
labels clip cleanly while the container shrinks.

```jsx
/* target — every sidebar label reveal (apply to lines 48-57, 120, 147, 205) */
          <motion.div
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -4 }}
            transition={{ duration: 0.15 }}
            style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}
          >
```

`x` is a `transform` (compositor-friendly); `opacity` is too. No layout per frame.

## Repo conventions to follow

- The container animation at `Sidebar.jsx:92` (`animate={{ width: W }}`, `W = collapsed ? 52 : 220`)
  is the single source of truth for the sidebar's width — labels should ride inside it,
  not animate their own width. Do not change that line.
- Keep the `<AnimatePresence>` wrappers already present around each label — only the
  `initial`/`animate`/`exit` objects change.

## Steps

1. In `akira-saas/src/components/layout/Sidebar.jsx`, for the Logo label block
   (lines 48-57): replace `width: 0` with `x: -4` in `initial` and `exit`, and replace
   `width: 'auto'` with `x: 0` in `animate`. Leave `opacity`, `transition`, and `style`
   as-is.
2. Apply the identical replacement to the nav-label motion blocks at lines 120, 147,
   and 205 (search the file for `width: 'auto'` — there should be exactly these
   occurrences after step 1; each has the matching `width: 0` in its `initial`/`exit`).
3. Do **not** touch the submenu expand block at lines 163-166 (`height: 0 → auto`) in
   this plan — see Boundaries.

## Boundaries

- Do NOT modify the container width animation (`line 92`) or `W` (`line 83`).
- Do NOT change the submenu `height: 0 ↔ auto` accordion at lines 163-166. Height-auto
  accordions are an accepted pattern and a separate decision; changing it here would be
  scope creep. (If desired later, that is its own plan using a measured-height or
  grid-rows technique.)
- Do NOT remove `overflow: hidden` / `white-space: nowrap` — they do the clipping.
- Do NOT add dependencies.
- If the file no longer contains these `width: 'auto'` blocks (drift since `8b6d5ce`),
  STOP and report.

## Verification

- **Mechanical**: `cd akira-saas && npm run build` succeeds; oxlint clean.
- **Feel check** (this is the important part — the reveal behavior changes):
  - `npm run dev`, toggle the sidebar collapse/expand a few times.
  - Labels should **fade + slide** in/out while the container width animates; text
    clips at the container edge rather than visibly squeezing its own width.
  - In DevTools → Performance, record a collapse: confirm the label elements no longer
    show per-frame "Layout" events (only "Composite Layers"/"Paint" for opacity+transform).
  - Set Animations panel to 10% speed: no text reflow/jump; the slide is subtle (~4px).
  - Confirm collapsed state (52px) shows icons only, with labels fully hidden.
- **Done when**: toggling the sidebar shows no per-frame layout for the labels and the
  reveal reads smooth at 10% speed.
