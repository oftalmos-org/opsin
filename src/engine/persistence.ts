// MIT — ver LICENSE
// Persistencia de calibración en localStorage — para que diagonal de
// pantalla/distancia de visualización/unidad no se pierdan al recargar
// (cada consultorio/pantalla se calibra una vez, no en cada sesión).

import type { UnitSystem } from './units'

const STORAGE_KEY = 'opsin.calibration.v1'

export interface StoredCalibration {
  diagonalInches: number
  viewingDistanceM: number
  unit: UnitSystem
}

export function loadCalibration(): Partial<StoredCalibration> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return typeof parsed === 'object' && parsed !== null ? parsed : {}
  } catch {
    return {}
  }
}

export function saveCalibration(calibration: StoredCalibration): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(calibration))
  } catch {
    // localStorage no disponible (modo privado, cuota llena, etc.) — no es crítico, se ignora.
  }
}
