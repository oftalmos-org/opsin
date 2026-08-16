// MIT — ver LICENSE
// Lógica pura de navegación entre líneas/modos — separada de React para
// poder testearla sin simular eventos de teclado/mouse en un browser.

import type { DisplayMode } from './layout'

/**
 * "Soft stop" en un índice de referencia (ej. 20/20): si el movimiento de
 * `oldIndex` a `newIndex` cruza `stopIndex` de largo sin partir de ahí, se
 * detiene primero en `stopIndex` — hace falta un segundo movimiento, ya
 * parado en el stop, para seguir más allá.
 */
export function applySoftStop(oldIndex: number, newIndex: number, stopIndex: number): number {
  const crossed = (oldIndex < stopIndex && newIndex > stopIndex) || (oldIndex > stopIndex && newIndex < stopIndex)
  return crossed && oldIndex !== stopIndex ? stopIndex : newIndex
}

const DISPLAY_MODE_CYCLE: DisplayMode[] = ['single', 'line', 'rows3', 'rows5', 'column']

/** Barra espaciadora: 1 optotipo → 1 línea → 3 líneas → 5 líneas → columna → (vuelta a 1 optotipo). */
export function cycleDisplayMode(current: DisplayMode): DisplayMode {
  const i = DISPLAY_MODE_CYCLE.indexOf(current)
  return DISPLAY_MODE_CYCLE[(i + 1) % DISPLAY_MODE_CYCLE.length]
}
