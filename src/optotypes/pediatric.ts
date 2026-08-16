// MIT — ver LICENSE
// Pictogramas pediátricos originales — formas genéricas simples (casa,
// sol, corazón, estrella), no arte de ningún proveedor específico.
// Dibujadas con primitivas de canvas (rect/arc/path), no SVG externo.
// (El paraguas se descartó — poco reconocible para niños en zonas
// donde casi no llueve; el sol es universal independientemente del clima.)

export type PediatricFigure = 'house' | 'sun' | 'heart' | 'star'
export const PEDIATRIC_FIGURES: PediatricFigure[] = ['house', 'sun', 'heart', 'star']

function drawHouse(ctx: CanvasRenderingContext2D, size: number, color: string) {
  const half = size / 2
  ctx.fillStyle = color
  // Techo (triángulo)
  ctx.beginPath()
  ctx.moveTo(0, -half)
  ctx.lineTo(half, -half * 0.15)
  ctx.lineTo(-half, -half * 0.15)
  ctx.closePath()
  ctx.fill()
  // Cuerpo
  ctx.fillRect(-half * 0.65, -half * 0.15, size * 0.65, half * 1.15)
}

function drawSun(ctx: CanvasRenderingContext2D, size: number, color: string) {
  const half = size / 2
  const coreR = half * 0.5
  ctx.strokeStyle = color
  ctx.fillStyle = color
  ctx.lineWidth = size / 12
  ctx.lineCap = 'round'

  // Rayos
  const rays = 8
  for (let i = 0; i < rays; i++) {
    const angle = (Math.PI * 2 * i) / rays
    ctx.beginPath()
    ctx.moveTo(Math.cos(angle) * coreR * 1.3, Math.sin(angle) * coreR * 1.3)
    ctx.lineTo(Math.cos(angle) * half * 0.95, Math.sin(angle) * half * 0.95)
    ctx.stroke()
  }

  // Núcleo
  ctx.beginPath()
  ctx.arc(0, 0, coreR, 0, Math.PI * 2)
  ctx.fill()
}

function drawHeart(ctx: CanvasRenderingContext2D, size: number, color: string) {
  const half = size / 2
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.moveTo(0, half * 0.65)
  ctx.bezierCurveTo(-half * 1.15, -half * 0.1, -half * 0.55, -half * 0.95, 0, -half * 0.3)
  ctx.bezierCurveTo(half * 0.55, -half * 0.95, half * 1.15, -half * 0.1, 0, half * 0.65)
  ctx.closePath()
  ctx.fill()
}

function drawStar(ctx: CanvasRenderingContext2D, size: number, color: string) {
  const outerR = size / 2
  const innerR = outerR * 0.4
  const spikes = 5
  ctx.fillStyle = color
  ctx.beginPath()
  for (let i = 0; i < spikes * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR
    const angle = (Math.PI / spikes) * i - Math.PI / 2
    const x = Math.cos(angle) * r
    const y = Math.sin(angle) * r
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.closePath()
  ctx.fill()
}

export function drawPediatricFigure(
  ctx: CanvasRenderingContext2D,
  figure: PediatricFigure,
  cx: number,
  cy: number,
  size: number,
  color = '#000000',
): void {
  ctx.save()
  ctx.translate(cx, cy)

  switch (figure) {
    case 'house':
      drawHouse(ctx, size, color)
      break
    case 'sun':
      drawSun(ctx, size, color)
      break
    case 'heart':
      drawHeart(ctx, size, color)
      break
    case 'star':
      drawStar(ctx, size, color)
      break
  }

  ctx.restore()
}

export function randomPediatricFigure(): PediatricFigure {
  return PEDIATRIC_FIGURES[Math.floor(Math.random() * PEDIATRIC_FIGURES.length)]
}
