// MIT — ver LICENSE
// Matemática pura de calibración física: tamaño de pantalla + distancia de
// visualización → tamaño en px de un optotipo para un nivel de agudeza dado.

const MM_PER_INCH = 25.4

/** px por mm dada la diagonal física de pantalla (in) y resolución (px). */
export function pxPerMmFromDiagonal(diagonalInches: number, widthPx: number, heightPx: number): number {
  if (diagonalInches <= 0 || widthPx <= 0 || heightPx <= 0) {
    throw new Error('pxPerMmFromDiagonal: dimensiones deben ser positivas')
  }
  const diagonalPx = Math.hypot(widthPx, heightPx)
  const ppi = diagonalPx / diagonalInches
  return ppi / MM_PER_INCH
}

/** Altura física (mm) que debe tener un optotipo para subtender `angleArcmin` a `distanceMm`. */
export function opticalHeightMm(angleArcmin: number, distanceMm: number): number {
  const halfAngleRad = (angleArcmin / 2) * (Math.PI / 10800)
  return 2 * distanceMm * Math.tan(halfAngleRad)
}

/** Altura en px, combinando calibración de pantalla + distancia de visualización. */
export function opticalHeightPx(angleArcmin: number, distanceMm: number, pxPerMm: number): number {
  return opticalHeightMm(angleArcmin, distanceMm) * pxPerMm
}

export interface Calibration {
  pxPerMm: number
  viewingDistanceMm: number
}

export function heightPxForLevel(angleArcmin: number, cal: Calibration): number {
  return opticalHeightPx(angleArcmin, cal.viewingDistanceMm, cal.pxPerMm)
}
