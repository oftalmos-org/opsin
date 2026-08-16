// MIT — ver LICENSE
// HOTV — subset de 4 letras (H O T V) usado en cartillas pediátricas
// preverbales, reutiliza el mismo motor de trazo por grid que Sloan.

import { drawSloanLetter, type BlockLetter } from './sloanLetters'

export type HOTVLetter = 'H' | 'O' | 'T' | 'V'
export const HOTV_LETTERS: HOTVLetter[] = ['H', 'O', 'T', 'V']

export function drawHOTVLetter(
  ctx: CanvasRenderingContext2D,
  letter: HOTVLetter,
  cx: number,
  cy: number,
  heightPx: number,
  color = '#000000',
): void {
  drawSloanLetter(ctx, letter as BlockLetter, cx, cy, heightPx, color)
}

export function randomHOTVLetter(): HOTVLetter {
  return HOTV_LETTERS[Math.floor(Math.random() * HOTV_LETTERS.length)]
}
