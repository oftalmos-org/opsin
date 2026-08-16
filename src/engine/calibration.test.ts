import { describe, it, expect } from 'vitest'
import { pxPerMmFromDiagonal, opticalHeightMm, heightPxForLevel } from './calibration'
import { ACUITY_LEVELS } from './units'

describe('pxPerMmFromDiagonal', () => {
  it('calcula ppi/pxPerMm para una pantalla 27" 2560x1440 (~108.79 ppi)', () => {
    const pxPerMm = pxPerMmFromDiagonal(27, 2560, 1440)
    const ppi = pxPerMm * 25.4
    expect(ppi).toBeCloseTo(108.79, 1)
  })

  it('lanza si las dimensiones no son positivas', () => {
    expect(() => pxPerMmFromDiagonal(0, 100, 100)).toThrow()
  })
})

describe('opticalHeightMm', () => {
  it('una cartilla 20/20 (5 arcmin) a 6m da ~8.73mm de altura', () => {
    const heightMm = opticalHeightMm(5, 6000)
    expect(heightMm).toBeCloseTo(8.73, 1)
  })

  it('el ángulo es proporcional a la distancia', () => {
    const near = opticalHeightMm(5, 3000)
    const far = opticalHeightMm(5, 6000)
    expect(far).toBeCloseTo(near * 2, 5)
  })
})

describe('heightPxForLevel', () => {
  it('combina calibración de pantalla + distancia para 20/20 a 6m en una pantalla típica', () => {
    const level20_20 = ACUITY_LEVELS.find((l) => l.logMAR === 0)!
    const pxPerMm = pxPerMmFromDiagonal(27, 2560, 1440)
    const px = heightPxForLevel(level20_20.heightArcmin, { pxPerMm, viewingDistanceMm: 6000 })
    expect(px).toBeGreaterThan(30)
    expect(px).toBeLessThan(45)
  })
})
