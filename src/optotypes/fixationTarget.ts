// MIT — ver LICENSE
// Objetivo de fijación para retinoscopía — target simple sobre fondo
// oscuro para reducir reflejos durante retinoscopía en franja. Dibujado
// con primitivas de canvas.

export function drawFixationTarget(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  color = '#ffffff',
): void {
  ctx.save()
  ctx.translate(cx, cy)
  ctx.strokeStyle = color
  ctx.fillStyle = color
  ctx.lineWidth = size / 20

  // Punto central
  ctx.beginPath()
  ctx.arc(0, 0, size / 10, 0, Math.PI * 2)
  ctx.fill()

  // Cruz de fijación
  ctx.beginPath()
  ctx.moveTo(-size / 2, 0)
  ctx.lineTo(size / 2, 0)
  ctx.moveTo(0, -size / 2)
  ctx.lineTo(0, size / 2)
  ctx.stroke()

  ctx.restore()
}
