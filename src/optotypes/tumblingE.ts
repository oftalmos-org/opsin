// MIT — ver LICENSE
// Tumbling E: grid clásico 5×5 de dominio público. Grosor de trazo = altura/5.
// Construido procedimentalmente, sin referencia a ningún asset externo.

export type Rotation = 0 | 90 | 180 | 270

/** Dibuja una "E" apuntando a la derecha (rotación 0), rotada `rotationDeg` grados en sentido horario. */
export function drawTumblingE(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  heightPx: number,
  rotationDeg: Rotation,
  color = '#000000',
): void {
  const unit = heightPx / 5 // grosor de trazo = 1/5 de la altura

  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate((rotationDeg * Math.PI) / 180)
  ctx.fillStyle = color

  const half = heightPx / 2
  // Barra vertical izquierda: alto=heightPx, ancho=unit, desde x=-half
  ctx.fillRect(-half, -half, unit, heightPx)
  // Tres barras horizontales (arriba, medio, abajo) — largo=heightPx para
  // que la caja delimitadora sea cuadrada (alto=ancho); con un largo menor
  // la E medía distinto de alto que de ancho y se veía descuadrada al
  // rotar 90°/270° dentro de una línea con otros optotipos.
  const armLength = heightPx
  ctx.fillRect(-half, -half, armLength, unit)
  ctx.fillRect(-half, -unit / 2, armLength, unit)
  ctx.fillRect(-half, half - unit, armLength, unit)

  ctx.restore()
}

export function randomRotation(): Rotation {
  const options: Rotation[] = [0, 90, 180, 270]
  return options[Math.floor(Math.random() * options.length)]
}
