// Sin licencia declarada — ver NOTICE.md. Catálogo de diagramas de
// patologías comunes para educación del paciente — módulo separado del
// motor de optotipos, pensado para poder crecer diagrama por diagrama
// (y eventualmente cambiar a un visor 3D manipulable sin tocar Opsin).

import { PATHOLOGY_IMAGE_URLS, getImage } from './images'

export type PathologyKey =
  | 'normal'
  | 'blefaritis'
  | 'orzuelo'
  | 'dvp'
  | 'fotopsias'
  | 'miodesopsias'
  | 'drr'
  | 'drt'
  | 'retinopatiaDiabetica'
  | 'rop'
  | 'dmaeHumeda'
  | 'dmaeSeca'
  | 'emd'
  | 'oclusionVena'
  | 'glaucoma'
  | 'catarata'
  | 'miopia'
  | 'membranaEpirretiniana'
  | 'pterigion'
  | 'conjuntivitis'
  | 'agujeroMacular'
  | 'queratocono'
  | 'ojoSeco'
  | 'uveitis'
  | 'hipermetropia'
  | 'astigmatismo'
  | 'nervioOptico'

export const PATHOLOGY_LABELS: Record<PathologyKey, string> = {
  normal: 'Ojo normal',
  blefaritis: 'Blefaritis',
  orzuelo: 'Orzuelo',
  dvp: 'Desprendimiento de vítreo posterior (DVP)',
  fotopsias: 'Fotopsias',
  miodesopsias: 'Miodesopsias',
  drr: 'Desprendimiento de retina regmatógeno (DRR)',
  drt: 'Desprendimiento de retina traccional (DRT)',
  retinopatiaDiabetica: 'Retinopatía diabética',
  rop: 'Retinopatía del prematuro (ROP)',
  dmaeHumeda: 'DMAE húmeda',
  dmaeSeca: 'DMAE seca',
  emd: 'Edema macular diabético (EMD)',
  oclusionVena: 'Oclusión de vena retiniana',
  glaucoma: 'Glaucoma',
  catarata: 'Catarata',
  miopia: 'Miopía',
  membranaEpirretiniana: 'Membrana epirretiniana',
  pterigion: 'Pterigión',
  conjuntivitis: 'Conjuntivitis',
  agujeroMacular: 'Agujero macular',
  queratocono: 'Queratocono',
  ojoSeco: 'Ojo seco',
  uveitis: 'Uveítis',
  hipermetropia: 'Hipermetropía',
  astigmatismo: 'Astigmatismo',
  nervioOptico: 'Nervio óptico — normal vs. patológico',
}

export const PATHOLOGY_KEYS: PathologyKey[] = Object.keys(PATHOLOGY_LABELS) as PathologyKey[]

export function isPathologyImplemented(key: PathologyKey): boolean {
  return key in PATHOLOGY_IMAGE_URLS
}

// Atribución requerida por la licencia de cada imagen — debe mostrarse
// visible junto al diagrama, no solo documentada en NOTICE.md.
export const ATTRIBUTION_BY_KEY: Partial<Record<PathologyKey, string>> = {
  normal: 'Servier Medical Art, Les Laboratoires Servier — CC BY 4.0',
  dmaeSeca: 'Servier Medical Art, Les Laboratoires Servier — CC BY 4.0',
  dmaeHumeda: 'Servier Medical Art, Les Laboratoires Servier — CC BY 4.0',
  retinopatiaDiabetica: 'Servier Medical Art, Les Laboratoires Servier — CC BY 4.0',
  glaucoma: 'Servier Medical Art, Les Laboratoires Servier — CC BY 4.0',
  catarata: 'Servier Medical Art, Les Laboratoires Servier — CC BY 4.0',
  conjuntivitis: 'Servier Medical Art, Les Laboratoires Servier — CC BY 4.0',
  miopia: 'Servier Medical Art, Les Laboratoires Servier — CC BY 4.0',
  queratocono: 'Madhero88, M.Komorniczak — Wikimedia Commons, CC BY-SA 3.0 (adaptado)',
  hipermetropia: 'Servier Medical Art, Les Laboratoires Servier — CC BY 4.0',
  astigmatismo: 'Servier Medical Art, Les Laboratoires Servier — CC BY 4.0',
}

/** Tipografía única para todas las leyendas que Opsin dibuja sobre los diagramas (no el texto ya incrustado en las imágenes de terceros). */
export const PATHOLOGY_CAPTION_FONT = "'Georgia', 'Times New Roman', serif"

/** El <img> para `pathology` (o una key cruda de PATHOLOGY_IMAGE_URLS), o null si no hay imagen lista todavía. */
function getImageFor(rawKey: string): HTMLImageElement | null {
  const url = PATHOLOGY_IMAGE_URLS[rawKey]
  if (!url) return null
  const img = getImage(url)
  return img.complete && img.naturalWidth > 0 ? img : null
}

export function getPathologyImage(pathology: PathologyKey): HTMLImageElement | null {
  return getImageFor(pathology)
}

// Para algunas patologías, la referencia "normal" con el cono de rayos de
// luz confunde más de lo que ayuda (lo relevante es la retina, no la
// refracción) — se usa una vista sin rayos en su lugar.
const NORMAL_REFERENCE_OVERRIDE: Partial<Record<PathologyKey, string>> = {
  retinopatiaDiabetica: '_normalNoRays',
}

/** Dibuja la referencia "normal" apropiada para comparar con `comparisonPathology` (con o sin rayos, según el caso). */
export function drawNormalReference(
  ctx: CanvasRenderingContext2D,
  comparisonPathology: PathologyKey,
  cx: number,
  cy: number,
  size: number,
  color = '#000000',
): string | null {
  const rawKey = NORMAL_REFERENCE_OVERRIDE[comparisonPathology] ?? 'normal'
  return drawImageOrPlaceholder(ctx, rawKey, getImageFor(rawKey), ATTRIBUTION_BY_KEY.normal, cx, cy, size, color)
}

function drawImageOrPlaceholder(
  ctx: CanvasRenderingContext2D,
  rawKey: string,
  img: HTMLImageElement | null,
  attribution: string | undefined,
  cx: number,
  cy: number,
  size: number,
  color: string,
): string | null {
  if (img) {
    const scale = Math.min(size / img.naturalWidth, size / img.naturalHeight)
    const w = img.naturalWidth * scale
    const h = img.naturalHeight * scale
    const x = cx - w / 2
    const y = cy - h / 2
    ctx.drawImage(img, x, y, w, h)
    if (rawKey === 'catarata') drawCataractBlockedLightOverlay(ctx, x, y, w, h)
    return attribution ?? null
  }

  ctx.save()
  ctx.fillStyle = color
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.globalAlpha = 0.4
  ctx.font = `${size * 0.06}px sans-serif`
  ctx.fillText(PATHOLOGY_IMAGE_URLS[rawKey] ? 'Cargando…' : 'Diagrama próximamente', cx, cy)
  ctx.restore()
  return null
}

/**
 * La imagen base de catarata no comunica bien "la luz no pasa" — se
 * refuerza con una neblina sobre el cristalino y un rayo que se corta en
 * seco ahí en vez de llegar a la retina (posición aproximada dentro de la
 * plantilla de Servier: cristalino ~33% del ancho, ~49% del alto).
 */
function drawCataractBlockedLightOverlay(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  const lensX = x + w * 0.33
  const lensY = y + h * 0.49
  const lensR = w * 0.09

  ctx.save()
  const fog = ctx.createRadialGradient(lensX, lensY, 0, lensX, lensY, lensR * 1.7)
  fog.addColorStop(0, 'rgba(255,255,255,0.85)')
  fog.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = fog
  ctx.beginPath()
  ctx.arc(lensX, lensY, lensR * 1.7, 0, Math.PI * 2)
  ctx.fill()

  // Rayos entrantes que se detienen en el cristalino, no llegan a la retina.
  const startX = x + w * 0.18
  ctx.strokeStyle = 'rgba(255,196,64,0.6)'
  ctx.lineWidth = Math.max(2, w * 0.008)
  ctx.beginPath()
  ctx.moveTo(startX, lensY - lensR * 0.7)
  ctx.lineTo(lensX - lensR * 0.3, lensY)
  ctx.moveTo(startX, lensY + lensR * 0.7)
  ctx.lineTo(lensX - lensR * 0.3, lensY)
  ctx.stroke()

  // Marca de bloqueo.
  ctx.strokeStyle = 'rgba(190,20,20,0.9)'
  ctx.lineWidth = Math.max(2, w * 0.012)
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(lensX - lensR * 0.55, lensY - lensR * 0.55)
  ctx.lineTo(lensX + lensR * 0.55, lensY + lensR * 0.55)
  ctx.moveTo(lensX + lensR * 0.55, lensY - lensR * 0.55)
  ctx.lineTo(lensX - lensR * 0.55, lensY + lensR * 0.55)
  ctx.stroke()
  ctx.restore()
}

// Subtítulo aclaratorio para diagramas donde la imagen sola no comunica
// bien el efecto — mismo criterio tipográfico que las leyendas principales.
const SUBTITLE_BY_KEY: Partial<Record<PathologyKey, string>> = {
  astigmatismo: 'Enfoca en dos puntos distintos — imagen borrosa a toda distancia',
}

export function getPathologySubtitle(pathology: PathologyKey): string | null {
  return SUBTITLE_BY_KEY[pathology] ?? null
}

/**
 * Dibuja la imagen de `pathology` centrada en (cx, cy), ajustada dentro de
 * un cuadro de `size` x `size` — o un placeholder "próximamente"/"cargando"
 * si no hay imagen lista todavía. Devuelve el texto de atribución
 * requerido por la licencia, o null si no aplica.
 */
export function drawPathology(
  ctx: CanvasRenderingContext2D,
  pathology: PathologyKey,
  cx: number,
  cy: number,
  size: number,
  color = '#000000',
): string | null {
  return drawImageOrPlaceholder(ctx, pathology, getPathologyImage(pathology), ATTRIBUTION_BY_KEY[pathology], cx, cy, size, color)
}
