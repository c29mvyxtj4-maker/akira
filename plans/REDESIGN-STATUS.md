# AKIRA redesign — status & handoff

Goal: redesign **all AKIRA pages** to the `minimalist-ui` aesthetic (warm-monochrome
editorial), then run the `impeccable` design passes. This file survives a Claude Code
restart so work can resume. Base commit: `8b6d5ce`.

## Design target (minimalist-ui, adapted for a dense SaaS app)
- Canvas bone `#f7f6f3`, white surfaces, borders `#eaeaea`, text charcoal `#1a1a18`.
- No gradients / glow / heavy shadows (shadow opacity < 0.05).
- Red (`#9f2f2d`) kept ONLY as a scarce semantic accent; primary CTA = solid charcoal `#111111`.
- Fonts: serif `Newsreader` for headings, system sans for body, `JetBrains Mono` for mono.
- Crisp radii (4–12px), generous whitespace, 1px dividers.

## DONE
- **Fase 1 — token layer** in `akira-saas/src/index.css`:
  - Rewrote `:root` tokens to the minimalist palette (bg/text/border/shadow/gradient vars).
  - Swapped font `@import` (Newsreader + JetBrains Mono; dropped Inter).
  - Added `--font-sans/--font-serif/--font-mono`; `body` now uses `var(--font-sans)`.
  - Light scrollbars.
  - Verified: dev server (port 5173) compiles with **no errors**. NOT yet visually
    confirmed (browser pane was not displayable during the session).

## REMAINING — minimalist redesign
Per-file **hardcoded** colors do not follow tokens; convert these to tokens/minimalist:
- `components/dashboard/KpiCard.jsx` — `rgba(255,255,255,0.02)` bg, `#ffffff` text, red gradient accent line.
- `components/layout/CommandPalette.jsx` — inline `rgba(0,0,0,0.6)` backdrop, `#e63946` accents.
- `pages/Brain.jsx`, `pages/auth/Login.jsx`, `pages/AIOperatives.jsx`, `components/time/*`,
  `components/ui/EmptyState*.jsx`, `components/operatives/*` — many inline
  `linear-gradient(135deg, rgba(...))` fills and hardcoded darks.
- `src/index.css` component classes (`.nav-item`, `.btn`, `.card`, `.modal-*`, `.sidebar*`)
  — audit for dark-specific hardcoded values now that the app is light.
- `src/index.css` `.light` token block (lines ~73–104) — now redundant/ conflicting since
  `:root` is light; reconcile or remove.
- Sweep: `grep -rn "rgba(255,255,255" akira-saas/src` and `grep -rn "#e63946\|#ffffff\|#0a0a0d" akira-saas/src`.

## REMAINING — impeccable passes (skill installed in project `.claude/skills/impeccable`)
Run in this order (init first, per impeccable docs):
1. `/impeccable init` — writes `PRODUCT.md` + `DESIGN.md`.
2. `/impeccable shape` — plan UX/UI (non-visual).
3. `/impeccable craft` — shape-then-build with visual iteration.
4. `/impeccable critique` — UX review (hierarchy, clarity).
5. `/impeccable audit` — a11y / perf / responsive checks.
6. `/impeccable polish` — design-system alignment, shipping readiness.
7. `/impeccable bolder` — amplify where too plain.
(User requested: craft, shape, critique, audit, polish, bolder.)

## Also pending (separate)
- Animation plans `plans/001..003` (CommandPalette exit, `transition: all` scoping,
  Sidebar `width:auto`) — still TODO; implement with `improve-animations execute` or by hand.

## Blockers to clear before resuming
1. **Display the Browser pane** and confirm `http://localhost:5173` loads — required for all
   visual verification and the impeccable visual passes.
2. **Restart Claude Code** so the project `/impeccable` skill loads (project skills load at startup).

## To resume after restart
Say: "continue the AKIRA minimalist + impeccable redesign per plans/REDESIGN-STATUS.md".
