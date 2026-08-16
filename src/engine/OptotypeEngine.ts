// MIT — ver LICENSE
// Motor de renderizado imperativo — React solo entrega la ref del canvas,
// este motor maneja resize/redraw/DPR sin reconciliación de React en cada frame.
// (React solo maneja la UI de controles; este motor hace todo el dibujo imperativo en canvas.)

import { drawTumblingE } from '../optotypes/tumblingE'
import { drawLandoltC } from '../optotypes/landoltC'
import { drawSloanLetter, opticianSansReady } from '../optotypes/sloanLetters'
import { drawHOTVLetter } from '../optotypes/hotv'
import { drawPediatricFigure } from '../optotypes/pediatric'
import { drawFixationTarget } from '../optotypes/fixationTarget'
import { generateRows, type ChartType, type DisplayMode, type OptotypeItem, type Row } from './layout'
import type { Calibration } from './calibration'
import { ACUITY_LEVELS, formatAcuity, DEFAULT_UNIT_SYSTEM, type UnitSystem } from './units'
import {
  drawPathology,
  drawNormalReference,
  getPathologySubtitle,
  PATHOLOGY_LABELS,
  PATHOLOGY_CAPTION_FONT,
  type PathologyKey,
} from '../pathologies'
import { pathologyImagesReady } from '../pathologies/images'

export type { ChartType, DisplayMode } from './layout'
export type { PathologyKey } from '../pathologies'

export interface OptotypeState {
  chartType: ChartType
  displayMode: DisplayMode
  levelIndex: number
  calibration: Calibration
  unit: UnitSystem
  pathology: PathologyKey
  pathologyScale: number
  mirrored: boolean
  darkBackground: boolean
}

export class OptotypeEngine {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private state: OptotypeState = {
    chartType: 'tumblingE',
    displayMode: 'single',
    levelIndex: 0,
    calibration: { pxPerMm: 4, viewingDistanceMm: 6000 },
    unit: DEFAULT_UNIT_SYSTEM,
    pathology: 'normal',
    pathologyScale: 1,
    mirrored: false,
    darkBackground: false,
  }
  private rows: Row[] = []
  // Posiciones absolutas (espacio de canvas, ya resueltas por espejo) del
  // último render — usadas para encontrar el optotipo más cercano a un
  // clic (ver pointAt()).
  private lastItemPositions: { absX: number; absY: number; heightPx: number }[] = []
  private pointedPosition: { absX: number; absY: number; heightPx: number } | null = null

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('OptotypeEngine: no se pudo obtener contexto 2d')
    this.ctx = ctx
    this.regenerateRows()
    this.resize()
    // fillText() en canvas no dispara la carga del font como CSS — hay que
    // esperar explícitamente y re-dibujar cuando esté listo.
    opticianSansReady.then(() => this.render())
    // Igual para las imágenes de diagramas de patologías — drawImage()
    // antes de que carguen no dibuja nada.
    pathologyImagesReady.then(() => this.render())
  }

  resize(): void {
    const dpr = window.devicePixelRatio || 1
    const rect = this.canvas.parentElement?.getBoundingClientRect()
    const width = rect?.width ?? this.canvas.clientWidth
    const height = rect?.height ?? this.canvas.clientHeight
    this.canvas.width = width * dpr
    this.canvas.height = height * dpr
    this.canvas.style.width = `${width}px`
    this.canvas.style.height = `${height}px`
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    this.render()
  }

  setState(partial: Partial<OptotypeState>): void {
    const regenerateKeys: (keyof OptotypeState)[] = ['chartType', 'displayMode', 'levelIndex', 'calibration']
    const needsRegenerate = regenerateKeys.some(
      (k) => k in partial && JSON.stringify(partial[k]) !== JSON.stringify(this.state[k]),
    )
    this.state = { ...this.state, ...partial }
    if (needsRegenerate) this.regenerateRows()
    this.render()
  }

  getState(): OptotypeState {
    return this.state
  }

  /** Regenera aleatoriamente los optotipos mostrados sin cambiar nivel/modo. */
  randomize(): void {
    this.regenerateRows()
    this.render()
  }

  private regenerateRows(): void {
    this.rows = generateRows(this.state.chartType, this.state.displayMode, this.state.levelIndex, this.state.calibration)
    // Las posiciones quedaron obsoletas — el llamador debe volver a
    // señalar si quiere seguir apuntando a algo.
    this.pointedPosition = null
  }

  /**
   * Sigue el mouse/puntero: si (canvasX, canvasY) cae razonablemente cerca
   * de un optotipo, le pone una flecha encima; si no está cerca de
   * ninguno, la quita. Pensado para llamarse en cada mousemove — la
   * flecha aparece solo mientras el puntero está sobre la letra, no
   * queda pegada tras un clic (eso interfería con usar el clic para
   * aleatorizar).
   */
  hoverAt(canvasX: number, canvasY: number): void {
    if (this.lastItemPositions.length === 0) {
      if (this.pointedPosition) {
        this.pointedPosition = null
        this.render()
      }
      return
    }
    let nearest = this.lastItemPositions[0]
    let minDist = Infinity
    for (const p of this.lastItemPositions) {
      const d = Math.hypot(p.absX - canvasX, p.absY - canvasY)
      if (d < minDist) {
        minDist = d
        nearest = p
      }
    }
    // Solo "engancha" si el puntero está razonablemente encima del
    // optotipo (no en cualquier parte de la pantalla).
    const withinRange = minDist < nearest.heightPx * 0.75
    const next = withinRange ? nearest : null
    if (next !== this.pointedPosition) {
      this.pointedPosition = next
      this.render()
    }
  }

  clearPointer(): void {
    this.pointedPosition = null
    this.render()
  }

  /** Cuántos optotipos de tamaño `itemSize` (con espacio `gap` entre ellos) caben en `availableWidth`. */
  private maxItemsForWidth(availableWidth: number, itemSize: number, gap: number): number {
    return Math.max(1, Math.floor((availableWidth + gap) / (itemSize + gap)))
  }

  /** Flecha azul apuntando hacia abajo, sobre el optotipo señalado (ver pointAt()). */
  private drawPointerArrow(pos: { absX: number; absY: number; heightPx: number }): void {
    const size = Math.max(14, pos.heightPx * 0.3)
    const tipY = pos.absY - pos.heightPx / 2 - size * 0.4
    this.ctx.save()
    this.ctx.fillStyle = '#0000ff'
    this.ctx.beginPath()
    this.ctx.moveTo(pos.absX, tipY)
    this.ctx.lineTo(pos.absX - size / 2, tipY - size)
    this.ctx.lineTo(pos.absX + size / 2, tipY - size)
    this.ctx.closePath()
    this.ctx.fill()
    this.ctx.restore()
  }

  private drawItem(item: OptotypeItem, x: number, y: number, heightPx: number, color: string): void {
    switch (item.type) {
      case 'tumblingE':
        drawTumblingE(this.ctx, x, y, heightPx, item.rotation, color)
        break
      case 'landoltC':
        drawLandoltC(this.ctx, x, y, heightPx, item.gapDirection, color)
        break
      case 'sloan':
        drawSloanLetter(this.ctx, item.letter, x, y, heightPx, color)
        break
      case 'hotv':
        drawHOTVLetter(this.ctx, item.letter, x, y, heightPx, color)
        break
      case 'pediatric':
        drawPediatricFigure(this.ctx, item.figure, x, y, heightPx, color)
        break
      case 'fixation':
        drawFixationTarget(this.ctx, x, y, heightPx, color)
        break
    }
  }

  /**
   * Modo de diagramas de patologías — no es una prueba de agudeza visual.
   * Si la patología seleccionada no es "normal", se muestra en dos
   * paneles: "Ojo normal" a la izquierda como referencia, la patología
   * seleccionada a la derecha — mismo criterio que el diagrama de
   * queratocono (comparación lado a lado). Sin filas/niveles/AV, sin
   * autoajuste por calibración (usa el espacio disponible directamente).
   */
  private renderPathology(cssWidth: number, cssHeight: number): void {
    this.ctx.clearRect(0, 0, cssWidth, cssHeight)
    this.ctx.fillStyle = '#ffffff'
    this.ctx.fillRect(0, 0, cssWidth, cssHeight)

    const captionY = cssHeight * 0.08
    const panelCenterY = cssHeight / 2 + captionY * 0.5
    // "queratocono" ya trae su propia comparación normal-vs-patológico
    // horneada en la imagen (con sus propias leyendas) — envolverlo en un
    // segundo layout de comparación duplicaría el panel "normal".
    const isSelfContainedComparison = this.state.pathology === 'queratocono'
    const showComparison = this.state.pathology !== 'normal' && !isSelfContainedComparison
    const attributions = new Set<string>()

    const drawCaption = (text: string, cx: number) => {
      this.ctx.save()
      this.ctx.fillStyle = '#000000'
      this.ctx.textAlign = 'center'
      this.ctx.textBaseline = 'alphabetic'
      this.ctx.font = `bold ${Math.max(14, cssHeight * 0.032)}px ${PATHOLOGY_CAPTION_FONT}`
      this.ctx.fillText(text, cx, captionY)
      this.ctx.restore()
    }

    if (showComparison) {
      const panelSize = Math.min(cssWidth / 2, cssHeight - captionY * 1.5) * 0.85 * this.state.pathologyScale
      const leftCx = cssWidth / 4
      const rightCx = (cssWidth * 3) / 4

      drawCaption(PATHOLOGY_LABELS.normal, leftCx)
      const attrNormal = drawNormalReference(this.ctx, this.state.pathology, leftCx, panelCenterY, panelSize, '#000000')
      if (attrNormal) attributions.add(attrNormal)

      drawCaption(PATHOLOGY_LABELS[this.state.pathology], rightCx)
      const attrPathology = drawPathology(this.ctx, this.state.pathology, rightCx, panelCenterY, panelSize, '#000000')
      if (attrPathology) attributions.add(attrPathology)

      const subtitle = getPathologySubtitle(this.state.pathology)
      if (subtitle) {
        this.ctx.save()
        this.ctx.fillStyle = 'rgba(0,0,0,0.7)'
        this.ctx.textAlign = 'center'
        this.ctx.textBaseline = 'top'
        this.ctx.font = `${Math.max(11, cssHeight * 0.02)}px ${PATHOLOGY_CAPTION_FONT}`
        this.ctx.fillText(subtitle, cssWidth / 2, panelCenterY + panelSize / 2 + 10)
        this.ctx.restore()
      }
    } else {
      // "normal" solo, o una imagen que ya trae su propia comparación
      // horneada (ej. queratocono) — un panel centrado, sin leyenda propia
      // en el segundo caso (la imagen ya la incluye).
      const size = Math.min(cssWidth, cssHeight - captionY * 1.5) * 0.8 * this.state.pathologyScale
      if (!isSelfContainedComparison) drawCaption(PATHOLOGY_LABELS.normal, cssWidth / 2)
      const attr = drawPathology(this.ctx, this.state.pathology, cssWidth / 2, panelCenterY, size, '#000000')
      if (attr) attributions.add(attr)
    }

    if (attributions.size > 0) {
      this.ctx.save()
      this.ctx.fillStyle = 'rgba(0,0,0,0.55)'
      this.ctx.textAlign = 'right'
      this.ctx.textBaseline = 'bottom'
      this.ctx.font = `${Math.max(10, cssHeight * 0.016)}px sans-serif`
      let y = cssHeight - 10
      for (const text of attributions) {
        this.ctx.fillText(text, cssWidth - 12, y)
        y -= Math.max(10, cssHeight * 0.016) * 1.3
      }
      this.ctx.restore()
    }
  }

  private render(): void {
    const { width, height } = this.canvas
    const dpr = window.devicePixelRatio || 1
    const cssWidth = width / dpr
    const cssHeight = height / dpr

    if (this.state.chartType === 'pathology') {
      this.renderPathology(cssWidth, cssHeight)
      return
    }

    const isDark = this.state.chartType === 'fixation' || this.state.darkBackground

    this.ctx.clearRect(0, 0, cssWidth, cssHeight)
    this.ctx.fillStyle = isDark ? '#000000' : '#ffffff'
    this.ctx.fillRect(0, 0, cssWidth, cssHeight)

    const color = isDark ? '#ffffff' : '#000000'
    // El objetivo de fijación no es una prueba de agudeza — no aplica AV.
    const showLabels = this.state.chartType !== 'fixation'

    // Primera pasada: calcular la posición Y de cada fila (se necesita
    // tanto para dibujar los optotipos —espejados o no— como las
    // etiquetas de AV —siempre legibles, nunca espejadas).
    //
    // Espaciado vertical estilo ETDRS (Ferris et al. 1982): el espacio
    // entre una línea y la siguiente es igual a la altura de los
    // optotipos de la línea siguiente (la más chica de las dos) — no un
    // porcentaje fijo del canvas. Esto hace que el chart se vea
    // progresivamente más compacto hacia abajo, como una cartilla real.
    // this.rows ya viene ordenado de más grande a más chico (ver layout.ts).
    const rowGaps = this.rows.slice(1).map((row) => row.heightPx)
    const totalRowsHeight = this.rows.reduce((sum, r) => sum + r.heightPx, 0) + rowGaps.reduce((a, b) => a + b, 0)
    const rowPositions: { row: Row; centerY: number }[] = []
    let rowY = cssHeight / 2 - totalRowsHeight / 2
    this.rows.forEach((row, i) => {
      rowPositions.push({ row, centerY: rowY + row.heightPx / 2 })
      rowY += row.heightPx + (rowGaps[i] ?? 0)
    })

    const labelMargin = cssWidth * 0.02
    const labelAreaWidth = showLabels ? cssWidth * 0.09 : 0

    this.ctx.save()
    this.ctx.translate(labelAreaWidth, 0)
    if (this.state.mirrored) {
      this.ctx.translate(cssWidth - labelAreaWidth, 0)
      this.ctx.scale(-1, 1)
    }

    const availableWidth = cssWidth - labelAreaWidth
    this.lastItemPositions = []

    for (const { row, centerY } of rowPositions) {
      // Espaciado horizontal ETDRS: 1 ancho de letra entre optotipos.
      const itemGap = row.heightPx * 1.0
      // Autoajuste: si a este tamaño de optotipo no caben todos los items
      // de la fila (típico en niveles de AV grandes, ej. 20/1800), se
      // muestran solo los que sí caben en vez de desbordar la pantalla.
      const maxFit = this.maxItemsForWidth(availableWidth, row.heightPx, itemGap)
      const items = row.items.length > maxFit ? row.items.slice(0, maxFit) : row.items

      const totalRowWidth = items.length * row.heightPx + itemGap * (items.length - 1)
      let itemX = (cssWidth - labelAreaWidth) / 2 - totalRowWidth / 2 + row.heightPx / 2

      for (const item of items) {
        this.drawItem(item, itemX, centerY, row.heightPx, color)
        // Posición absoluta (compensando el espejo) para poder mapear un
        // clic de vuelta a este item — ver pointAt().
        const absX = this.state.mirrored ? cssWidth - itemX : labelAreaWidth + itemX
        this.lastItemPositions.push({ absX, absY: centerY, heightPx: row.heightPx })
        itemX += row.heightPx + itemGap
      }
    }

    this.ctx.restore()

    if (this.pointedPosition) {
      this.drawPointerArrow(this.pointedPosition)
    }

    if (showLabels) {
      this.ctx.save()
      this.ctx.fillStyle = color
      this.ctx.textAlign = 'left'
      this.ctx.textBaseline = 'middle'
      this.ctx.font = `${Math.max(12, cssHeight * 0.025)}px sans-serif`
      for (const { row, centerY } of rowPositions) {
        const level = ACUITY_LEVELS[row.levelIndex]
        this.ctx.fillText(formatAcuity(level, this.state.unit), labelMargin, centerY)
      }
      this.ctx.restore()
    }
  }

  destroy(): void {
    // placeholder — sin listeners persistentes todavía; existe para simetría con el ciclo de vida de React.
  }
}
