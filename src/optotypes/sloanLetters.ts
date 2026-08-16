// Optotipos Sloan/HOTV — usa la tipografía "Optician Sans" (SIL Open Font
// License 1.1, ver src/assets/fonts/OFL-LICENSE.md), basada en los 10
// optotipos históricos de Louise Sloan (1959). NO es MIT — es un font
// bundleado bajo su propia licencia OFL, permitida para embeber en
// software; ver NOTICE.md para el detalle del split de licencias de este
// repo. Reemplaza el intento anterior de dibujar las letras a mano
// (geometría por grid / segmentos vectoriales), que no lograba una
// calidad tipográfica aceptable.

export type BlockLetter = 'C' | 'D' | 'H' | 'K' | 'N' | 'O' | 'R' | 'S' | 'V' | 'Z' | 'T'
export type SloanLetter = 'C' | 'D' | 'H' | 'K' | 'N' | 'O' | 'R' | 'S' | 'V' | 'Z'

export const SLOAN_LETTERS: SloanLetter[] = ['C', 'D', 'H', 'K', 'N', 'O', 'R', 'S', 'V', 'Z']

const FONT_FAMILY = 'OpticianSans'

// El font debe estar cargado antes de que fillText() lo use en canvas —
// a diferencia de CSS, Canvas no dispara la carga automáticamente.
export const opticianSansReady: Promise<void> = document.fonts
  ? document.fonts
      .load(`100px ${FONT_FAMILY}`)
      .then(() => undefined)
      .catch(() => undefined)
  : Promise.resolve()

export function drawSloanLetter(
  ctx: CanvasRenderingContext2D,
  letter: BlockLetter,
  cx: number,
  cy: number,
  heightPx: number,
  color = '#000000',
): void {
  ctx.save()
  ctx.fillStyle = color
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  // Optician Sans tiene un ascent/descent generoso — el tamaño de fuente
  // en CSS/canvas NO coincide con la altura visual real del glifo. Factor
  // 2.0 medido con actualBoundingBoxAscent/Descent sobre 'H' (letra de
  // referencia de cap-height): a fontSize=heightPx*2.0, H mide exactamente
  // heightPx de alto. Con el factor anterior (1.35, sin medir) las letras
  // se dibujaban solo al ~67-70% del tamaño óptico calibrado — la cartilla
  // habría medido agudeza visual de forma incorrecta.
  ctx.font = `${heightPx * 2.0}px ${FONT_FAMILY}`
  ctx.fillText(letter, cx, cy)
  ctx.restore()
}

export function randomSloanLetter(): SloanLetter {
  return SLOAN_LETTERS[Math.floor(Math.random() * SLOAN_LETTERS.length)]
}
