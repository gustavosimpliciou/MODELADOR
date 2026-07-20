/**
 * open-file.ts — abre o file picker de forma confiável em qualquer contexto
 * (proxy, iframe, React 19, etc.)
 *
 * Estratégia em cascata:
 *  1. window.showOpenFilePicker — API moderna, sem eventos DOM, funciona em iframes
 *  2. input programático fora da árvore React — fallback universal
 *
 * IMPORTANTE: chamar openFile() diretamente de um handler de clique do usuário
 * (sem awaits antes da chamada) para manter o "user gesture" ativo.
 */

const ACCEPTED = '.stl,.obj,.ply,.glb,.gltf'
const ACCEPTED_TYPES = [
  {
    description: 'Modelos 3D (STL, OBJ, PLY, GLB, GLTF)',
    accept: {
      'application/octet-stream': ['.stl', '.glb', '.ply'],
      'model/obj': ['.obj'],
      'model/gltf+json': ['.gltf'],
    },
  },
]

/**
 * Abre o seletor de arquivo e resolve com o File selecionado.
 * Rejeita se o usuário cancelar (AbortError) ou em caso de erro.
 *
 * Deve ser chamado sincronamente a partir de um evento de usuário.
 */
export function openFile(): Promise<File> {
  // ── Método 1: File System Access API (Chrome 86+, Edge 86+) ──────────────
  if (typeof window !== 'undefined' && 'showOpenFilePicker' in window) {
    return (window as any)
      .showOpenFilePicker({ multiple: false, types: ACCEPTED_TYPES, excludeAcceptAllOption: false })
      .then(([handle]: FileSystemFileHandle[]) => handle.getFile())
  }

  // ── Método 2: input programático fora do React ────────────────────────────
  return new Promise<File>((resolve, reject) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = ACCEPTED
    // Posicionado fora da tela, mas VISÍVEL para o browser (necessário em Safari)
    input.style.cssText =
      'position:fixed;top:-200px;left:-200px;width:1px;height:1px;opacity:0.01;'
    document.body.appendChild(input)

    const cleanup = () => {
      try { document.body.removeChild(input) } catch {}
    }

    input.addEventListener(
      'change',
      () => {
        const file = input.files?.[0]
        cleanup()
        if (file) resolve(file)
        else reject(new Error('Nenhum arquivo selecionado'))
      },
      { once: true },
    )

    // Safari/Firefox: dispara 'cancel' quando o usuário fecha sem selecionar
    input.addEventListener('cancel', () => { cleanup(); reject(new DOMException('Cancelled', 'AbortError')) }, { once: true })

    // Timeout de segurança: se em 5 min nada acontecer, limpa
    const timeout = setTimeout(() => { cleanup(); reject(new Error('Timeout')) }, 300_000)
    input.addEventListener('change', () => clearTimeout(timeout), { once: true })
    input.addEventListener('cancel', () => clearTimeout(timeout), { once: true })

    input.click()
  })
}
