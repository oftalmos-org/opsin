import { useEffect, useRef, useState } from 'react'
import { OptotypeEngine } from '../engine/OptotypeEngine'

interface Props {
  onEngineReady: (engine: OptotypeEngine) => void
  laserPointerEnabled: boolean
}

export default function FullscreenDisplay({ onEngineReady, laserPointerEnabled }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const engineRef = useRef<OptotypeEngine | null>(null)
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null)

  useEffect(() => {
    if (!canvasRef.current) return
    const engine = new OptotypeEngine(canvasRef.current)
    engineRef.current = engine
    onEngineReady(engine)

    const handleResize = () => engine.resize()
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      engine.destroy()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // El clic siempre aleatoriza — señalar una letra ya no depende del clic
  // (antes competían: clic para aleatorizar vs. clic para señalar).
  const handleClick = () => {
    engineRef.current?.randomize()
  }

  // La flecha de señalización sigue al mouse: aparece solo mientras el
  // puntero está encima de un optotipo, no queda pegada tras un clic.
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    if (laserPointerEnabled) setMousePos({ x, y })
    engineRef.current?.hoverAt(x, y)
  }

  const handleMouseLeave = () => {
    setMousePos(null)
    engineRef.current?.clearPointer()
  }

  return (
    <div className="w-full h-full relative" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
      <canvas ref={canvasRef} className="block w-full h-full cursor-pointer" onClick={handleClick} />
      {laserPointerEnabled && mousePos && (
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            left: mousePos.x - 6,
            top: mousePos.y - 6,
            width: 12,
            height: 12,
            backgroundColor: '#0000ff',
            boxShadow: '0 0 8px 2px rgba(0,0,255,0.7)',
          }}
        />
      )}
    </div>
  )
}
