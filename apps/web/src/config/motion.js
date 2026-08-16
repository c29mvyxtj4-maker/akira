/**
 * Sistema de movimiento de AKIRA — una sola fuente de ritmo.
 *
 * Framer-motion no lee variables CSS, así que los tokens de motion viven aquí
 * (JS) y, en paralelo, en index.css (:root --dur-* / --ease-*) para lo que se
 * anima con CSS. Mantener ambos en sincronía.
 *
 * Regla: ningún componente define duraciones/curvas a ojo. Se importa de aquí.
 */

// ── Curvas (cubic-bezier) ─────────────────────────────────────────────
// out: ease-out expo suave — entradas y todo lo que responde al usuario.
// inOut: para elementos ya en pantalla que se mueven de A a B.
// in: salidas.
export const EASE = {
  out:   [0.16, 1, 0.3, 1],
  inOut: [0.65, 0, 0.35, 1],
  in:    [0.4, 0, 1, 1],
}

// ── Duraciones (segundos, formato framer) ─────────────────────────────
export const DUR = {
  fast: 0.14, // micro-interacciones (hover, tap)
  base: 0.2,  // estándar
  slow: 0.28, // transiciones de estado (expandir, modal)
  page: 0.32, // entrada de página / sección
}

// ── Muelles físicos ───────────────────────────────────────────────────
export const SPRING = {
  default: { type: 'spring', stiffness: 320, damping: 30, mass: 0.9 },
  snappy:  { type: 'spring', stiffness: 420, damping: 32 },
  soft:    { type: 'spring', stiffness: 220, damping: 26 },
}

// ── Variantes reutilizables ───────────────────────────────────────────
// Entrada estándar: sube y aparece.
export const fadeUp = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: DUR.slow, ease: EASE.out },
}

// Aparición con escala (tarjetas, popovers).
export const scaleIn = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1 },
  exit:    { opacity: 0, scale: 0.96 },
  transition: { duration: DUR.base, ease: EASE.out },
}

// Overlay / scrim: salida más rápida que la entrada (exit-faster-than-enter).
export const overlay = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: DUR.base, ease: EASE.out } },
  exit:    { opacity: 0, transition: { duration: DUR.fast, ease: EASE.in } },
}

// Sheet / modal: escala + fade desde el centro, con muelle.
export const sheet = {
  initial: { opacity: 0, scale: 0.96, y: 8 },
  animate: { opacity: 1, scale: 1, y: 0, transition: SPRING.default },
  exit:    { opacity: 0, scale: 0.97, y: 4, transition: { duration: DUR.fast, ease: EASE.in } },
}

// Contenedor con hijos escalonados (listas, grids).
export const staggerParent = (gap = 0.04) => ({
  animate: { transition: { staggerChildren: gap } },
})
