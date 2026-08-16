import { describe, it, expect } from 'vitest'
import { applySoftStop, cycleDisplayMode } from './levelNavigation'

describe('applySoftStop', () => {
  const stop = 20

  it('se detiene en el stop si el movimiento lo cruza de largo desde abajo', () => {
    expect(applySoftStop(19, 25, stop)).toBe(20)
  })

  it('se detiene en el stop si el movimiento lo cruza de largo desde arriba', () => {
    expect(applySoftStop(22, 10, stop)).toBe(20)
  })

  it('deja pasar el movimiento si ya se estaba parado en el stop', () => {
    expect(applySoftStop(20, 21, stop)).toBe(21)
    expect(applySoftStop(20, 15, stop)).toBe(15)
  })

  it('no interfiere con movimientos que no cruzan el stop', () => {
    expect(applySoftStop(5, 10, stop)).toBe(10)
    expect(applySoftStop(22, 23, stop)).toBe(23)
  })

  it('aterrizar justo en el stop no se considera un cruce', () => {
    expect(applySoftStop(15, 20, stop)).toBe(20)
  })
})

describe('cycleDisplayMode', () => {
  it('recorre single → line → rows3 → rows5 → column → single', () => {
    expect(cycleDisplayMode('single')).toBe('line')
    expect(cycleDisplayMode('line')).toBe('rows3')
    expect(cycleDisplayMode('rows3')).toBe('rows5')
    expect(cycleDisplayMode('rows5')).toBe('column')
    expect(cycleDisplayMode('column')).toBe('single')
  })
})
