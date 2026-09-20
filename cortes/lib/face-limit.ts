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

/**
 * Estimativa rápida de faces sem carregar a geometria completa.
 * Para STL binário lê o header de 80 bytes + uint32 LE de 4 bytes.
 * Para outros formatos, estima via tamanho do arquivo.
 * Retorna null se não for possível estimar rapidamente.
 */
export async function quickEstimateFaces(file: File): Promise<number | null> {
  try {
    const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
    if (ext === 'stl') {
      // Tenta ler header binário (80 + 4 bytes)
      if (file.size >= 84) {
        const buf = await file.slice(0, 84).arrayBuffer()
        const view = new DataView(buf)
        // Se for binário, os 80 bytes de header + 4 bytes de count são válidos
        // e o tamanho do arquivo deve ser 84 + count*50
        const count = view.getUint32(80, true)
        const expected = 84 + count * 50
        // Se o tamanho bate (ou é próximo), é binário e count é confiável
        if (Math.abs(file.size - expected) < 1024 || (count > 0 && count < 10_000_000)) {
          // Validação extra: se o arquivo é muito grande e o count é grande, confia
          if (count > 0) return count
        }
      }
      // Fallback STL ASCII: estima via tamanho (cada triângulo ~150-300 bytes)
      // Usa 200 bytes por face como média
      if (file.size > 10_000_000) {
        return Math.round(file.size / 200)
      }
    } else if (ext === 'obj' || ext === 'ply' || ext === 'glb' || ext === 'gltf') {
      // Estimativa grosseira por tamanho: 1 face ~= 100-150 bytes em texto
      if (file.size > 20_000_000) return Math.round(file.size / 120)
    }
    return null
  } catch {
    return null
  }
}
