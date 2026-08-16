// MIT — ver LICENSE
// Generación de filas de optotipos para los modos de despliegue: un solo
// optotipo, una línea, o varias líneas consecutivas de agudeza (como una
// cartilla Snellen real). Cada item se randomiza al regenerar la fila.

import type { Rotation } from '../optotypes/tumblingE'
import { randomRotation } from '../optotypes/tumblingE'
import type { GapDirection } from '../optotypes/landoltC'
import { randomGapDirection } from '../optotypes/landoltC'
import type { SloanLetter } from '../optotypes/sloanLetters'
import { randomSloanLetter } from '../optotypes/sloanLetters'
import type { HOTVLetter } from '../optotypes/hotv'
import { randomHOTVLetter } from '../optotypes/hotv'
import type { PediatricFigure } from '../optotypes/pediatric'
import { randomPediatricFigure } from '../optotypes/pediatric'
import { ACUITY_LEVELS } from './units'
import { heightPxForLevel, type Calibration } from './calibration'

export type ChartType = 'tumblingE' | 'landoltC' | 'sloan' | 'hotv' | 'pediatric' | 'fixation' | 'pathology'
export type DisplayMode = 'single' | 'line' | 'rows3' | 'rows5' | 'column'

// Orden fijo — usado por el selector de UI.
export const CHART_TYPE_ORDER: ChartType[] = [
  'sloan',
  'fixation',
  'pediatric',
  'pathology',
  'tumblingE',
  'landoltC',
  'hotv',
]

// Atajos de teclado numéricos — orden pedido por el usuario, no el mismo
// que CHART_TYPE_ORDER.
export const CHART_TYPE_KEY_MAP: Record<string, ChartType> = {
  '1': 'sloan',
  '2': 'fixation',
  '3': 'pediatric',
  '4': 'pathology',
  '5': 'tumblingE',
  '6': 'landoltC',
  '7': 'hotv',
}

export type OptotypeItem =
  | { type: 'tumblingE'; rotation: Rotation }
  | { type: 'landoltC'; gapDirection: GapDirection }
  | { type: 'sloan'; letter: SloanLetter }
  | { type: 'hotv'; letter: HOTVLetter }
  | { type: 'pediatric'; figure: PediatricFigure }
  | { type: 'fixation' }

export interface Row {
  levelIndex: number
  heightPx: number
  items: OptotypeItem[]
}

function randomItem(chartType: ChartType): OptotypeItem {
  switch (chartType) {
    case 'tumblingE':
      return { type: 'tumblingE', rotation: randomRotation() }
    case 'landoltC':
      return { type: 'landoltC', gapDirection: randomGapDirection() }
    case 'sloan':
      return { type: 'sloan', letter: randomSloanLetter() }
    case 'hotv':
      return { type: 'hotv', letter: randomHOTVLetter() }
    case 'pediatric':
      return { type: 'pediatric', figure: randomPediatricFigure() }
    case 'fixation':
      return { type: 'fixation' }
    case 'pathology':
      // El modo de patologías no usa el sistema de filas/items — se
      // renderiza aparte en OptotypeEngine (ver renderPathology()).
      throw new Error('randomItem: "pathology" no genera OptotypeItem, se maneja aparte')
  }
}

// 'column': cartilla completa en columna descendiente, 1 solo optotipo
// por nivel (a diferencia de 'line'/'rows3'/'rows5', que muestran 5 por
// fila) — típico de un screening rápido en vez de una línea ETDRS completa.
const ROWS_FOR_MODE: Record<DisplayMode, number> = { single: 1, line: 1, rows3: 3, rows5: 5, column: 9 }
const ITEMS_PER_ROW: Record<DisplayMode, number> = { single: 1, line: 5, rows3: 5, rows5: 5, column: 1 }

/** Índices de nivel a mostrar, centrados en `levelIndex`, respetando los límites del array. */
function levelIndicesFor(displayMode: DisplayMode, levelIndex: number): number[] {
  const count = ROWS_FOR_MODE[displayMode]
  if (count === 1) return [levelIndex]

  const half = Math.floor(count / 2)
  let start = levelIndex - half
  let end = start + count - 1
  if (start < 0) {
    end += -start
    start = 0
  }
  if (end > ACUITY_LEVELS.length - 1) {
    start -= end - (ACUITY_LEVELS.length - 1)
    end = ACUITY_LEVELS.length - 1
  }
  start = Math.max(0, start)

  const indices: number[] = []
  for (let i = start; i <= end; i++) indices.push(i)
  return indices
}

export function generateRows(
  chartType: ChartType,
  displayMode: DisplayMode,
  levelIndex: number,
  calibration: Calibration,
): Row[] {
  // El modo de patologías se renderiza aparte (un solo diagrama a pantalla
  // completa, no filas de optotipos con nivel de AV) — ver
  // OptotypeEngine.renderPathology().
  if (chartType === 'pathology') return []

  const itemsPerRow = ITEMS_PER_ROW[displayMode]
  return levelIndicesFor(displayMode, levelIndex).map((li) => {
    const level = ACUITY_LEVELS[li]
    const heightPx = heightPxForLevel(level.heightArcmin, calibration)
    const items = Array.from({ length: itemsPerRow }, () => randomItem(chartType))
    return { levelIndex: li, heightPx, items }
  })
}
