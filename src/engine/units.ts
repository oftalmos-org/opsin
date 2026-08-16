// MIT — ver LICENSE
// Niveles de agudeza visual estándar (pasos de logMAR de 0.1, equivalentes ETDRS/Snellen).
// height arcmin = 5 * 10^logMAR (la letra completa subtiende 5 arcmin a 20/20; cada trazo 1 arcmin).

export type UnitSystem = 'imperial' | 'decimal' | 'logMAR'

export interface AcuityLevel {
  logMAR: number
  snellenDenominatorFt: number // "20/x"
  decimal: number // test/denominator
  heightArcmin: number
}

function buildLevel(logMAR: number): AcuityLevel {
  const decimal = Math.pow(10, -logMAR)
  const snellenDenominatorFt = Math.round(20 / decimal)
  const heightArcmin = 5 * Math.pow(10, logMAR)
  return { logMAR: Math.round(logMAR * 100) / 100, snellenDenominatorFt, decimal, heightArcmin }
}

// 20/1800 (baja visión) → 20/10, pasos de 0.1 logMAR salvo el extremo superior
// (log10(1800/20) ≈ 1.9542, no cae exacto en la rejilla de 0.1) que se agrega
// explícito para llegar exactamente a 20/1800.
const TOP_LOW_VISION_LOGMAR = Math.log10(1800 / 20)
const GRID_LOGMAR_STEPS = Array.from({ length: 23 }, (_, i) => 1.9 - i * 0.1) // 1.9 → -0.3

export const ACUITY_LEVELS: AcuityLevel[] = [TOP_LOW_VISION_LOGMAR, ...GRID_LOGMAR_STEPS].map(buildLevel)

export const DEFAULT_ACUITY_LEVEL = ACUITY_LEVELS.find((l) => l.logMAR === 0) ?? ACUITY_LEVELS[10]

export function formatAcuity(level: AcuityLevel, unit: UnitSystem): string {
  switch (unit) {
    case 'imperial':
      return `20/${level.snellenDenominatorFt}`
    case 'decimal':
      return level.decimal.toFixed(2)
    case 'logMAR':
      return level.logMAR.toFixed(1)
  }
}

export const DEFAULT_UNIT_SYSTEM: UnitSystem = 'imperial'
