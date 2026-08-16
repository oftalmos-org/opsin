import { useCallback, useEffect, useRef, useState } from 'react'
import FullscreenDisplay from './components/FullscreenDisplay'
import SettingsPanel from './components/SettingsPanel'
import { OptotypeEngine, type ChartType, type DisplayMode, type PathologyKey } from './engine/OptotypeEngine'
import { CHART_TYPE_KEY_MAP } from './engine/layout'
import { pxPerMmFromDiagonal } from './engine/calibration'
import { ACUITY_LEVELS, DEFAULT_UNIT_SYSTEM, type UnitSystem } from './engine/units'
import { applySoftStop, cycleDisplayMode } from './engine/levelNavigation'
import { PATHOLOGY_KEYS } from './pathologies'
import { loadCalibration, saveCalibration } from './engine/persistence'
import { RemoteClient } from './remote/RemoteClient'

const DEFAULT_LEVEL_INDEX = ACUITY_LEVELS.findIndex((l) => l.logMAR === 0) // 20/20
const MAX_LEVEL_INDEX = ACUITY_LEVELS.length - 1
const storedCalibration = loadCalibration()

export default function App() {
  const engineRef = useRef<OptotypeEngine | null>(null)

  const [chartType, setChartType] = useState<ChartType>('tumblingE')
  const [pathology, setPathology] = useState<PathologyKey>('normal')
  const [displayMode, setDisplayMode] = useState<DisplayMode>('single')
  // Calibración persistida — cada pantalla/consultorio se calibra una vez,
  // no debería perderse al recargar la página.
  const [diagonalInches, setDiagonalInches] = useState(storedCalibration.diagonalInches ?? 24)
  const [viewingDistanceM, setViewingDistanceM] = useState(storedCalibration.viewingDistanceM ?? 6)
  const [levelIndex, setLevelIndex] = useState(DEFAULT_LEVEL_INDEX)
  const [unit, setUnit] = useState<UnitSystem>(storedCalibration.unit ?? DEFAULT_UNIT_SYSTEM)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [mirrored, setMirrored] = useState(false)
  const [darkBackground, setDarkBackground] = useState(false)
  const [laserPointer, setLaserPointer] = useState(false)
  const [pathologyScale, setPathologyScale] = useState(1)

  const handleEngineReady = useCallback((engine: OptotypeEngine) => {
    engineRef.current = engine
  }, [])

  // "Soft stop" en 20/20: un movimiento que lo cruza de largo (arrastre del
  // slider, scroll rápido) se detiene ahí primero — hace falta un segundo
  // movimiento, ya parado en 20/20, para seguir hacia baja visión o hacia
  // letras más chicas que 20/10.
  const changeLevel = useCallback((delta: number) => {
    setLevelIndex((i) => applySoftStop(i, Math.min(MAX_LEVEL_INDEX, Math.max(0, i + delta)), DEFAULT_LEVEL_INDEX))
  }, [])

  const handleLevelChange = useCallback((newIndex: number) => {
    setLevelIndex((i) => applySoftStop(i, newIndex, DEFAULT_LEVEL_INDEX))
  }, [])

  const changePathologyScale = useCallback((delta: number) => {
    setPathologyScale((s) => Math.min(2.5, Math.max(0.3, Math.round((s + delta) * 10) / 10)))
  }, [])

  const cyclePathology = useCallback((delta: number) => {
    setPathology((p) => {
      const i = PATHOLOGY_KEYS.indexOf(p)
      const next = (i + delta + PATHOLOGY_KEYS.length) % PATHOLOGY_KEYS.length
      return PATHOLOGY_KEYS[next]
    })
  }, [])

  // Persiste diagonal/distancia/unidad — se calibra una vez por pantalla,
  // no debería perderse al recargar.
  useEffect(() => {
    saveCalibration({ diagonalInches, viewingDistanceM, unit })
  }, [diagonalInches, viewingDistanceM, unit])

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      // Nota: si esto se dispara por un comando remoto (Stream Deck vía
      // WebSocket) en vez de un clic/tecla real del usuario, el navegador
      // puede rechazar requestFullscreen() por no venir de un gesto
      // directo — es una limitación de seguridad del navegador, no de
      // Opsin. exitFullscreen() sí funciona igual desde remoto.
      document.documentElement.requestFullscreen().catch(() => {})
    }
  }, [])

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  // Lógica compartida por teclado real Y comandos remotos (Stream Deck vía
  // WebSocket, ver RemoteClient) — arriba/abajo cambian de línea (nivel de
  // AV), izquierda/derecha aleatorizan los optotipos mostrados, espacio
  // recorre los modos de despliegue, 1-7 seleccionan el tipo de cartilla
  // (ver CHART_TYPE_KEY_MAP), f alterna pantalla completa. En modo
  // patologías las flechas cambian de comportamiento: arriba/abajo
  // agrandan/achican el diagrama, izquierda/derecha cambian de diagrama.
  const handleCommandKey = useCallback(
    (key: string) => {
      const inPathologyMode = chartType === 'pathology'
      if (key === 'f' || key === 'F') {
        toggleFullscreen()
      } else if (key === 'ArrowDown') {
        if (inPathologyMode) changePathologyScale(-0.1)
        else changeLevel(1)
      } else if (key === 'ArrowUp') {
        if (inPathologyMode) changePathologyScale(0.1)
        else changeLevel(-1)
      } else if (key === 'ArrowLeft') {
        if (inPathologyMode) cyclePathology(-1)
        else engineRef.current?.randomize()
      } else if (key === 'ArrowRight') {
        if (inPathologyMode) cyclePathology(1)
        else engineRef.current?.randomize()
      } else if (key === ' ') {
        setDisplayMode((m) => cycleDisplayMode(m))
      } else if (key in CHART_TYPE_KEY_MAP) {
        setChartType(CHART_TYPE_KEY_MAP[key])
      }
    },
    [chartType, changeLevel, changePathologyScale, cyclePathology, toggleFullscreen],
  )

  // Acciones remotas sin atajo de teclado propio.
  const handleRemoteAction = useCallback(
    (action: string) => {
      if (action === 'mirror-toggle') setMirrored((v) => !v)
      else if (action === 'dark-background-toggle') setDarkBackground((v) => !v)
      else if (action === 'laser-pointer-toggle') setLaserPointer((v) => !v)
      else if (action === 'fullscreen-toggle') toggleFullscreen()
    },
    [toggleFullscreen],
  )

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isHandled =
        e.key === 'f' ||
        e.key === 'F' ||
        e.key === 'ArrowDown' ||
        e.key === 'ArrowUp' ||
        e.key === 'ArrowLeft' ||
        e.key === 'ArrowRight' ||
        e.key === ' ' ||
        e.key in CHART_TYPE_KEY_MAP
      if (isHandled) {
        e.preventDefault()
        handleCommandKey(e.key)
      }
    }
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
      if (chartType === 'pathology') changePathologyScale(e.deltaY > 0 ? -0.1 : 0.1)
      else changeLevel(e.deltaY > 0 ? 1 : -1)
    }
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('wheel', handleWheel, { passive: false })
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('wheel', handleWheel)
    }
  }, [handleCommandKey, changeLevel, changePathologyScale, chartType])

  // Puente de control remoto (Stream Deck) — ver backend/routes/remote_http.py.
  // "Space" (el backend evita mandar un literal " " por URL) se traduce a
  // ' ' antes de reusar handleCommandKey, igual que el teclado real.
  useEffect(() => {
    const client = new RemoteClient({
      onKey: (key) => handleCommandKey(key === 'Space' ? ' ' : key),
      onAction: handleRemoteAction,
    })
    client.connect()
    return () => client.disconnect()
  }, [handleCommandKey, handleRemoteAction])

  useEffect(() => {
    const engine = engineRef.current
    if (!engine) return

    const pxPerMm = pxPerMmFromDiagonal(diagonalInches, window.screen.width, window.screen.height)

    engine.setState({
      chartType,
      displayMode,
      levelIndex,
      calibration: { pxPerMm, viewingDistanceMm: viewingDistanceM * 1000 },
      unit,
      pathology,
      pathologyScale,
      mirrored,
      darkBackground,
    })
  }, [
    chartType,
    displayMode,
    diagonalInches,
    viewingDistanceM,
    levelIndex,
    unit,
    pathology,
    pathologyScale,
    mirrored,
    darkBackground,
  ])

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 min-h-0">
        <FullscreenDisplay onEngineReady={handleEngineReady} laserPointerEnabled={laserPointer} />
      </div>
      {/* Modo kiosko: el panel de controles se oculta en pantalla completa —
          pensado para el display que ve el paciente, no el examinador. */}
      {!isFullscreen && (
        <SettingsPanel
          chartType={chartType}
          onChartTypeChange={setChartType}
          pathology={pathology}
          onPathologyChange={setPathology}
          displayMode={displayMode}
          onDisplayModeChange={setDisplayMode}
          diagonalInches={diagonalInches}
          onDiagonalChange={setDiagonalInches}
          viewingDistanceM={viewingDistanceM}
          onViewingDistanceChange={setViewingDistanceM}
          levelIndex={levelIndex}
          onLevelChange={handleLevelChange}
          unit={unit}
          onUnitChange={setUnit}
          mirrored={mirrored}
          onMirroredChange={setMirrored}
          darkBackground={darkBackground}
          onDarkBackgroundChange={setDarkBackground}
          laserPointer={laserPointer}
          onLaserPointerChange={setLaserPointer}
          isFullscreen={isFullscreen}
          onToggleFullscreen={toggleFullscreen}
          onRandomize={() => engineRef.current?.randomize()}
        />
      )}
    </div>
  )
}
