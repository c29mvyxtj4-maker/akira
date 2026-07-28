# 002 — Replace `transition: all` on nav items and buttons with scoped properties

- **Status**: TODO
- **Commit**: 8b6d5ce
- **Severity**: MEDIUM
- **Category**: Cohesion & tokens / Performance
- **Estimated scope**: 1 file (`index.css`), 2 declarations

## Problem

The two most-hovered elements in the app — sidebar nav items and buttons — use
`transition: all`, which tells the browser to watch **every** animatable property
(including layout-affecting ones) for changes. It is the classic lazy-transition
anti-pattern: it can animate properties you never intended (e.g. a `border-color`
flip on the active state, or box metrics) and needlessly widens the browser's
transition bookkeeping on high-frequency hover targets.

```css
/* akira-saas/src/index.css:300 — current (.nav-item) */
  transition: all 0.12s;
```

```css
/* akira-saas/src/index.css:408 — current (.btn) */
  transition: all 0.12s;
```

`.nav-item` only changes `color` and `background` on `:hover` and adds
`border-color` + `background` on `.active` (see `index.css:306-314`). `.btn` variants
change `background`, `color`, `border-color` and `box-shadow` on their hover/active
states.

## Target

Scope each transition to the exact properties that actually change. Keep the `0.12s`
duration (it is already correct for hover feedback).

```css
/* target — akira-saas/src/index.css:300 (.nav-item) */
  transition: color 0.12s, background-color 0.12s, border-color 0.12s;
```

```css
/* target — akira-saas/src/index.css:408 (.btn) */
  transition: background-color 0.12s, color 0.12s, border-color 0.12s, box-shadow 0.12s;
```

Note: `.btn-primary` uses a gradient background (`var(--gradient-brand)`); gradients
are not interpolable, so listing `background-color` (not `background`) is correct and
loses nothing — the gradient simply swaps instantly as it does today.

## Repo conventions to follow

- The codebase already ships the correct pattern as a utility — imitate it:
  ```css
  /* akira-saas/src/styles/globals.css:221 — .transition-colors (exemplar) */
  .transition-colors { transition: background-color 0.2s ease-out, color 0.2s ease-out, border-color 0.2s ease-out; }
  ```
- Leave the `.transition-all` utility at `globals.css:217` **untouched** — a utility
  literally named `transition-all` is `all` by design; that is not this finding.

## Steps

1. In `akira-saas/src/index.css`, line 300 (inside `.nav-item`), replace
   `transition: all 0.12s;` with `transition: color 0.12s, background-color 0.12s, border-color 0.12s;`.
2. Before editing line 408, read the `.btn`, `.btn-primary`, `.btn-secondary` (etc.)
   `:hover`/`:active` rules that follow it. Confirm the changing properties are a
   subset of `{background-color, color, border-color, box-shadow}`. If a variant also
   animates `transform` (e.g. a press `scale`), append `, transform 0.12s`.
3. Replace line 408's `transition: all 0.12s;` with
   `transition: background-color 0.12s, color 0.12s, border-color 0.12s, box-shadow 0.12s;`
   (plus `transform` if step 2 found it).

## Boundaries

- Do NOT change durations, colors, or any hover/active rule bodies — only the
  `transition` property list on these two selectors.
- Do NOT touch `.transition-all` in `globals.css`.
- Do NOT convert these to Framer Motion.
- If lines 300/408 no longer read `transition: all 0.12s;` (drift since `8b6d5ce`),
  STOP and report.

## Verification

- **Mechanical**: `cd akira-saas && npm run build` succeeds; no visual regressions in
  the build output.
- **Feel check**: `npm run dev`, then:
  - Hover sidebar nav items: color + background still fade over ~120ms exactly as
    before (no perceptible change — this is a correctness/perf cleanup, not a look
    change).
  - Hover and press each button variant: hover background/border/shadow still
    transition; no property that used to be instant is now animated and vice-versa.
  - In DevTools → Performance, a hover no longer shows `all` listed under the
    element's transitions (Elements → Styles shows the explicit list).
- **Done when**: both selectors list explicit properties and hover feel is unchanged.
