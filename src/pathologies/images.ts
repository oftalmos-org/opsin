// Sin licencia declarada — ver NOTICE.md. Imágenes de Servier Medical Art
// (CC BY 4.0 — requiere atribución, ver NOTICE.md), no MIT, no dibujadas
// por el motor de Opsin. Precargadas para que drawImage() no falle la
// primera vez que se selecciona un diagrama.

import normalUrl from '../assets/pathologies/normal.png'
import eyeStructureUrl from '../assets/pathologies/eye-structure.png'
import dmaeUrl from '../assets/pathologies/dmae.png'
import dmaeHumedaUrl from '../assets/pathologies/dmae-humeda.png'
import retinopatiaDiabeticaUrl from '../assets/pathologies/retinopatia-diabetica.png'
import glaucomaUrl from '../assets/pathologies/glaucoma.png'
import catarataUrl from '../assets/pathologies/catarata.png'
import conjuntivitisUrl from '../assets/pathologies/conjuntivitis.png'
import miopiaUrl from '../assets/pathologies/miopia.png'
import queratoconoUrl from '../assets/pathologies/queratocono.svg'
import hipermetropiaUrl from '../assets/pathologies/hipermetropia.png'
import astigmatismoUrl from '../assets/pathologies/astigmatismo.png'

export const PATHOLOGY_IMAGE_URLS: Partial<Record<string, string>> = {
  normal: normalUrl,
  dmaeSeca: dmaeUrl,
  dmaeHumeda: dmaeHumedaUrl,
  retinopatiaDiabetica: retinopatiaDiabeticaUrl,
  glaucoma: glaucomaUrl,
  catarata: catarataUrl,
  conjuntivitis: conjuntivitisUrl,
  miopia: miopiaUrl,
  queratocono: queratoconoUrl,
  hipermetropia: hipermetropiaUrl,
  astigmatismo: astigmatismoUrl,
  // Referencia "normal" alternativa, sin el cono de rayos de luz — para
  // patologías donde el rayo confunde más de lo que ayuda (ej. retinopatía
  // diabética, donde lo relevante es la retina, no la refracción).
  _normalNoRays: eyeStructureUrl,
}

export const EYE_STRUCTURE_IMAGE_URL = eyeStructureUrl

const imageCache = new Map<string, HTMLImageElement>()

/** Devuelve el <img> (posiblemente aún cargando) para una URL, cacheado. */
export function getImage(url: string): HTMLImageElement {
  let img = imageCache.get(url)
  if (!img) {
    img = new Image()
    img.src = url
    imageCache.set(url, img)
  }
  return img
}

/** Promesa que resuelve cuando TODAS las imágenes de patologías están cargadas. */
export const pathologyImagesReady: Promise<void> = Promise.all(
  Object.values(PATHOLOGY_IMAGE_URLS)
    .filter((url): url is string => !!url)
    .map(
      (url) =>
        new Promise<void>((resolve) => {
          const img = getImage(url)
          if (img.complete) resolve()
          else {
            img.onload = () => resolve()
            img.onerror = () => resolve()
          }
        }),
    ),
).then(() => undefined)
