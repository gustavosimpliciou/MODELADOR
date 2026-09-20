/**
 * Export 3MF com cores por triângulo (vertex colors → colorgroup)
 *
 * Gera um ZIP 3MF válido com:
 *  - [Content_Types].xml
 *  - _rels/.rels
 *  - 3D/3dmodel.model (com colorgroup m:colorgroup)
 *
 * Cada Part vira um <object> com <mesh>. Cores por face são mapeadas
 * para um colorgroup único (id=1) com <m:color>. Cada <triangle> referencia
 * a cor via pid="1" p1="idx" p2="idx" p3="idx" (cor uniforme por triângulo).
 *
 * Usa JSZip (mesma lib do export-panel). Escala uniforme para caber em
 * 200mm, igual ao export STL/OBJ existente.
 */

import * as THREE from 'three'
import { hexToRgbNorm } from './paint'

const MAX_PRINT_MM = 200

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9_\-À-ÿ ]/g, '_').trim() || 'Parte'
}

function computeUniformScaleFactor(meshes: THREE.Mesh[]): number {
  let maxDim = 0
  for (const mesh of meshes) {
    const box = new THREE.Box3().setFromObject(mesh)
    const size = new THREE.Vector3()
    box.getSize(size)
    maxDim = Math.max(maxDim, size.x, size.y, size.z)
  }
  if (maxDim <= 0) return 1
  return maxDim > MAX_PRINT_MM ? MAX_PRINT_MM / maxDim : 1
}

function buildExportMesh(mesh: THREE.Mesh, scaleFactor: number): THREE.Mesh {
  mesh.updateWorldMatrix(true, false)
  const geo = mesh.geometry.clone() as THREE.BufferGeometry
  const exportMatrix = new THREE.Matrix4().makeScale(scaleFactor, scaleFactor, scaleFactor).multiply(mesh.matrixWorld)
  geo.applyMatrix4(exportMatrix)
  // Garante que a geometria tenha índice para export
  const exportMesh = new THREE.Mesh(geo, mesh.material)
  exportMesh.position.set(0, 0, 0)
  exportMesh.rotation.set(0, 0, 0)
  exportMesh.scale.set(1, 1, 1)
  return exportMesh
}

function hexTo3MFColor(hex: string): string {
  const [r, g, b] = hexToRgbNorm(hex)
  const toHex = (v: number) => Math.round(Math.max(0, Math.min(1, v)) * 255).toString(16).padStart(2, '0').toUpperCase()
  // 3MF color é #RRGGBBAA (AA = FF opaco)
  return `#${toHex(r)}${toHex(g)}${toHex(b)}FF`
}

// Gera XML escapado
function escAttr(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
}

export interface PartWithMesh {
  id: string
  name: string
  mesh: THREE.Mesh
}

export async function exportTo3MF(
  parts: PartWithMesh[],
  paintedParts: Map<string, Map<number, string>>,
  filename = 'modelo-colorido.3mf',
): Promise<void> {
  if (parts.length === 0) throw new Error('Nenhuma parte para exportar')

  const JSZip = (await import('jszip')).default
  const zip = new JSZip()

  const scaleFactor = computeUniformScaleFactor(parts.map((p) => p.mesh))

  // Coleta todas as cores únicas (inclui base cinza se houver triângulos sem pintura)
  const colorSet = new Map<string, number>() // hex -> index
  const defaultHex = '#808084' // C_BASE aproximado para 3MF (se quiser, pode omitir)
  // Primeiro, varre todas as faces pintadas para registrar cores
  for (const part of parts) {
    const map = paintedParts.get(part.id)
    if (map) {
      for (const hex of map.values()) {
        const norm = hex.toLowerCase()
        if (!colorSet.has(norm)) colorSet.set(norm, colorSet.size)
      }
    }
  }
  // Se houver faces sem pintura, inclui a cor base
  let hasUnpainted = false
  for (const part of parts) {
    const mesh = buildExportMesh(part.mesh, scaleFactor)
    const geo = mesh.geometry as THREE.BufferGeometry
    const pos = geo.getAttribute('position') as THREE.BufferAttribute
    const faceCount = geo.index ? geo.index.count / 3 : pos.count / 3
    const map = paintedParts.get(part.id)
    if (!map || map.size < faceCount) hasUnpainted = true
    mesh.geometry.dispose()
  }
  if (hasUnpainted && !colorSet.has(defaultHex.toLowerCase())) {
    // Coloca base como última cor (índice 0 será usado para não pintadas)
    // Mas para manter índices estáveis, adicionamos no início se necessário
    // Vamos garantir que base seja índice 0 se houver não pintadas
    const entries = Array.from(colorSet.entries())
    colorSet.clear()
    colorSet.set(defaultHex.toLowerCase(), 0)
    for (const [hex, _] of entries) {
      if (hex !== defaultHex.toLowerCase()) colorSet.set(hex, colorSet.size)
    }
  }

  const colorList = Array.from(colorSet.keys()) // hex em lowercase
  const colorIndex = new Map<string, number>()
  colorList.forEach((hex, idx) => colorIndex.set(hex, idx))

  // Gera objetos 3MF
  let objectsXml = ''
  let buildXml = ''

  for (let objId = 1; objId <= parts.length; objId++) {
    const part = parts[objId - 1]
    const exportMesh = buildExportMesh(part.mesh, scaleFactor)
    const geo = exportMesh.geometry as THREE.BufferGeometry
    const pos = geo.getAttribute('position') as THREE.BufferAttribute
    const idx = geo.index

    const vertCount = pos.count
    const faceCount = idx ? idx.count / 3 : Math.floor(vertCount / 3)

    // Vertices
    let verticesXml = '        <vertices>\n'
    for (let v = 0; v < vertCount; v++) {
      verticesXml += `          <vertex x="${pos.getX(v).toFixed(4)}" y="${pos.getY(v).toFixed(4)}" z="${pos.getZ(v).toFixed(4)}" />\n`
    }
    verticesXml += '        </vertices>\n'

    // Triangles com cor por face
    const paintedMap = paintedParts.get(part.id)
    let trianglesXml = '        <triangles>\n'
    for (let f = 0; f < faceCount; f++) {
      const v1 = idx ? idx.getX(f * 3) : f * 3
      const v2 = idx ? idx.getX(f * 3 + 1) : f * 3 + 1
      const v3 = idx ? idx.getX(f * 3 + 2) : f * 3 + 2

      let hex: string | null = null
      if (paintedMap && paintedMap.has(f)) {
        hex = paintedMap.get(f)!.toLowerCase()
      } else if (hasUnpainted) {
        hex = defaultHex.toLowerCase()
      } else {
        // Se todas as faces pintadas mas esta não está no mapa (caso raro), usa primeira cor
        hex = colorList[0] ?? defaultHex.toLowerCase()
      }

      const cIdx = colorIndex.get(hex!) ?? 0
      // 3MF usa pid para colorgroup e p1/p2/p3 para índices de cor por vértice do triângulo
      trianglesXml += `          <triangle v1="${v1}" v2="${v2}" v3="${v3}" pid="1" p1="${cIdx}" p2="${cIdx}" p3="${cIdx}" />\n`
    }
    trianglesXml += '        </triangles>\n'

    const safeName = escAttr(sanitizeFilename(part.name))
    objectsXml += `    <object id="${objId}" name="${safeName}" type="model">\n      <mesh>\n${verticesXml}${trianglesXml}      </mesh>\n    </object>\n`
    // Build item sem transformação (geometria já baked em world)
    buildXml += `    <item objectid="${objId}" />\n`

    exportMesh.geometry.dispose()
  }

  // Colorgroup
  let colorgroupXml = ''
  if (colorList.length > 0) {
    colorgroupXml = '    <m:colorgroup id="1">\n'
    for (const hex of colorList) {
      colorgroupXml += `      <m:color color="${hexTo3MFColor(hex)}" />\n`
    }
    colorgroupXml += '    </m:colorgroup>\n'
  }

  const modelXml = `<?xml version="1.0" encoding="UTF-8"?>
<model unit="millimeter" xml:lang="en-US" xmlns="http://schemas.microsoft.com/3dmanufacturing/core/2015/02" xmlns:m="http://schemas.microsoft.com/3dmanufacturing/material/2015/02">
  <resources>
${colorgroupXml}${objectsXml}  </resources>
  <build>
${buildXml}  </build>
</model>
`

  // Arquivos obrigatórios do pacote 3MF
  const contentTypes = `<?xml version="1.0" encoding="UTF-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml" />
  <Default Extension="model" ContentType="application/vnd.ms-package.3dmanufacturing-3dmodel+xml" />
</Types>
`
  const rels = `<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Target="/3D/3dmodel.model" Id="rel0" Type="http://schemas.microsoft.com/3dmanufacturing/2013/01/3dmodel" />
</Relationships>
`

  zip.file('[Content_Types].xml', contentTypes)
  zip.folder('_rels')!.file('.rels', rels)
  zip.folder('3D')!.file('3dmodel.model', modelXml)

  const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 }, mimeType: 'application/vnd.ms-package.3dmanufacturing-3dmodel+xml' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename.endsWith('.3mf') ? filename : `${filename}.3mf`
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
