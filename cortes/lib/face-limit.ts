/**
 * Face Limit — limite de faces suportado na importação de modelos.
 *
 * Modelos acima do limite são recusados com um modal informativo que
 * direciona o usuário para a ferramenta externa de redução de polígonos.
 */

/** Modelos com mais faces que isto não são carregados. */
export const MAX_SUPPORTED_FACES = 1_000_000

/** Ferramenta externa de redução de polígonos (abre em nova aba). */
export const REDUCER_URL = 'https://rigbake.com/tools/reduce-polygons/'

export interface FaceLimitInfo {
  faces: number
  fileName: string
}

/** true quando o modelo excede o limite e deve ser recusado. */
export function isFaceLimitExceeded(faces: number): boolean {
  return Math.round(faces) > MAX_SUPPORTED_FACES
}

export function formatFaceCount(faces: number): string {
  return Math.round(faces).toLocaleString('pt-BR')
}
