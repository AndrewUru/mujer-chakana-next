// Escala de movimiento compartida. Espejo de los tokens --ease-* y --dur-*
// de globals.css: si cambias un valor, cámbialo en ambos sitios.

export const EASE_OUT = [0.22, 1, 0.36, 1] as const;
export const EASE_IN = [0.4, 0, 1, 1] as const;

/** Segundos, como los espera framer-motion. */
export const DURATION = {
  /** Respuesta inmediata: hover, pulsaciones. */
  fast: 0.15,
  /** Cambios de estado: toasts, avisos, cambios de texto. */
  base: 0.3,
  /** Fundidos de escena y velos. */
  slow: 0.6,
  /** Revelados grandes al hacer scroll. */
  reveal: 0.8,
} as const;

export const enter = (duration: number = DURATION.base) => ({ duration, ease: EASE_OUT });
export const exit = (duration: number = DURATION.fast) => ({ duration, ease: EASE_IN });
