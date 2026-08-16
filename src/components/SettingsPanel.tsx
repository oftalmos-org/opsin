import { ACUITY_LEVELS, formatAcuity, type UnitSystem } from '../engine/units'
import type { ChartType, DisplayMode, PathologyKey } from '../engine/OptotypeEngine'
import { CHART_TYPE_KEY_MAP } from '../engine/layout'
import { PATHOLOGY_LABELS, PATHOLOGY_KEYS, isPathologyImplemented } from '../pathologies'

const CHART_TYPE_NAMES: Record<ChartType, string> = {
  tumblingE: 'Tumbling E',
  landoltC: 'Landolt C',
  sloan: 'Sloan (Snellen)',
  hotv: 'HOTV',
  pediatric: 'Pediátrico',
  fixation: 'Fijación (retinoscopía)',
  pathology: 'Patologías (educación)',
}

// Orden del selector = orden de las teclas numéricas (1-7), con el número
// como prefijo — para que el menú coincida visualmente con el atajo.
const CHART_TYPE_OPTIONS: { value: ChartType; label: string }[] = Object.entries(CHART_TYPE_KEY_MAP)
  .sort(([a], [b]) => Number(a) - Number(b))
  .map(([key, chartType]) => ({ value: chartType, label: `${key} ${CHART_TYPE_NAMES[chartType]}` }))

const DISPLAY_MODE_LABELS: Record<DisplayMode, string> = {
  single: '1 optotipo',
  line: '1 línea',
  rows3: '3 líneas',
  rows5: '5 líneas',
  column: 'Columna (1 por nivel)',
}

interface Props {
  chartType: ChartType
  onChartTypeChange: (t: ChartType) => void
  pathology: PathologyKey
  onPathologyChange: (p: PathologyKey) => void
  displayMode: DisplayMode
  onDisplayModeChange: (m: DisplayMode) => void
  diagonalInches: number
  onDiagonalChange: (v: number) => void
  viewingDistanceM: number
  onViewingDistanceChange: (v: number) => void
  levelIndex: number
  onLevelChange: (i: number) => void
  unit: UnitSystem
  onUnitChange: (u: UnitSystem) => void
  mirrored: boolean
  onMirroredChange: (v: boolean) => void
  darkBackground: boolean
  onDarkBackgroundChange: (v: boolean) => void
  laserPointer: boolean
  onLaserPointerChange: (v: boolean) => void
  isFullscreen: boolean
  onToggleFullscreen: () => void
  onRandomize: () => void
}

export default function SettingsPanel(props: Props) {
  const level = ACUITY_LEVELS[props.levelIndex]
  const isPathologyMode = props.chartType === 'pathology'

  return (
    <div className="bg-surface border-t border-border p-3 flex flex-wrap items-center gap-4 text-sm">
      <label className="flex items-center gap-2">
        Cartilla
        <select
          value={props.chartType}
          onChange={(e) => props.onChartTypeChange(e.target.value as ChartType)}
          className="bg-background border border-border rounded px-1"
        >
          {CHART_TYPE_OPTIONS.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>

      {props.chartType === 'pathology' ? (
        <label className="flex items-center gap-2">
          Diagrama
          <select
            value={props.pathology}
            onChange={(e) => props.onPathologyChange(e.target.value as PathologyKey)}
            className="bg-background border border-border rounded px-1"
          >
            {PATHOLOGY_KEYS.map((key) => (
              <option key={key} value={key}>
                {PATHOLOGY_LABELS[key]}
                {isPathologyImplemented(key) ? '' : ' (próximamente)'}
              </option>
            ))}
          </select>
        </label>
      ) : (
        <label className="flex items-center gap-2">
          Modo
          <select
            value={props.displayMode}
            onChange={(e) => props.onDisplayModeChange(e.target.value as DisplayMode)}
            className="bg-background border border-border rounded px-1"
          >
            {Object.entries(DISPLAY_MODE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
      )}

      {!isPathologyMode && (
        <>
          <label className="flex items-center gap-2">
            Diagonal pantalla (in)
            <input
              type="number"
              value={props.diagonalInches}
              onChange={(e) => props.onDiagonalChange(Number(e.target.value))}
              className="w-16 bg-background border border-border rounded px-1"
            />
          </label>

          <label className="flex items-center gap-2">
            Distancia (m)
            <input
              type="number"
              step="0.1"
              value={props.viewingDistanceM}
              onChange={(e) => props.onViewingDistanceChange(Number(e.target.value))}
              className="w-16 bg-background border border-border rounded px-1"
            />
          </label>

          <label className="flex items-center gap-2">
            Nivel
            <input
              type="range"
              min={0}
              max={ACUITY_LEVELS.length - 1}
              value={props.levelIndex}
              onChange={(e) => props.onLevelChange(Number(e.target.value))}
            />
            <span className="font-mono w-16">{formatAcuity(level, props.unit)}</span>
          </label>

          <label className="flex items-center gap-2">
            Unidad
            <select
              value={props.unit}
              onChange={(e) => props.onUnitChange(e.target.value as UnitSystem)}
              className="bg-background border border-border rounded px-1"
            >
              <option value="imperial">Imperial (20/20)</option>
              <option value="decimal">Decimal</option>
              <option value="logMAR">logMAR</option>
            </select>
          </label>

          <button
            onClick={props.onRandomize}
            className="bg-background border border-border rounded px-2 py-1 hover:bg-border"
          >
            Aleatorizar
          </button>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={props.mirrored}
              onChange={(e) => props.onMirroredChange(e.target.checked)}
            />
            Espejo
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={props.darkBackground}
              onChange={(e) => props.onDarkBackgroundChange(e.target.checked)}
            />
            Fondo oscuro (retinoscopía)
          </label>
        </>
      )}

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={props.laserPointer}
          onChange={(e) => props.onLaserPointerChange(e.target.checked)}
        />
        Puntero láser
      </label>

      <button
        onClick={props.onToggleFullscreen}
        className="bg-background border border-border rounded px-2 py-1 hover:bg-border"
        title="Atajo: f"
      >
        Pantalla completa
      </button>
    </div>
  )
}
