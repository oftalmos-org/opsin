// MIT — ver LICENSE
// Landolt C — geometría ISO 8596: grosor de trazo = ancho de brecha = diámetro/5.
// Construido paramétricamente con arcos de canvas, sin SVG externo.

export type GapDirection = 0 | 90 | 180 | 270 // 0 = brecha a la derecha

export function drawLandoltC(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  diameterPx: number,
  gapDirection: GapDirection,
  color = '#000000',
): void {
  const strokeWidth = diameterPx / 5
  const radius = (diameterPx - strokeWidth) / 2 // radio de la línea central del trazo
  // Ángulo cuya cuerda, medida en el radio donde realmente se dibuja el
  // trazo, mide strokeWidth — antes se calculaba con diameterPx/2 (radio
  // exterior, más grande que el radio real del trazo), lo que hacía la
  // brecha más angosta de lo que pide ISO 8596.
  const gapWidthRad = 2 * Math.asin(strokeWidth / 2 / radius)

  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate((gapDirection * Math.PI) / 180)

  ctx.strokeStyle = color
  ctx.lineWidth = strokeWidth
  ctx.lineCap = 'butt'

  ctx.beginPath()
  ctx.arc(0, 0, radius, gapWidthRad / 2, Math.PI * 2 - gapWidthRad / 2)
  ctx.stroke()

  ctx.restore()
}

export function randomGapDirection(): GapDirection {
  const options: GapDirection[] = [0, 90, 180, 270]
  return options[Math.floor(Math.random() * options.length)]
}
