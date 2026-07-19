(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/node_modules/.pnpm/three@0.185.1/node_modules/three/examples/jsm/exporters/OBJExporter.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "OBJExporter",
    ()=>OBJExporter
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/three@0.185.1/node_modules/three/build/three.core.js [app-client] (ecmascript)");
;
/**
 * An exporter for OBJ.
 *
 * `OBJExporter` is not able to export material data into MTL files so only geometry data are supported.
 *
 * ```js
 * const exporter = new OBJExporter();
 * const data = exporter.parse( scene );
 * ```
 *
 * @three_import import { OBJExporter } from 'three/addons/exporters/OBJExporter.js';
 */ class OBJExporter {
    /**
	 * Parses the given 3D object and generates the OBJ output.
	 *
	 * If the 3D object is composed of multiple children and geometry, they are merged into a single mesh in the file.
	 *
	 * @param {Object3D} object - The 3D object to export.
	 * @return {string} The exported OBJ.
	 */ parse(object) {
        let output = '';
        let indexVertex = 0;
        let indexVertexUvs = 0;
        let indexNormals = 0;
        const vertex = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"]();
        const color = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Color"]();
        const normal = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"]();
        const uv = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector2"]();
        const face = [];
        function parseMesh(mesh) {
            let nbVertex = 0;
            let nbNormals = 0;
            let nbVertexUvs = 0;
            const geometry = mesh.geometry;
            const normalMatrixWorld = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Matrix3"]();
            // shortcuts
            const vertices = geometry.getAttribute('position');
            const normals = geometry.getAttribute('normal');
            const uvs = geometry.getAttribute('uv');
            const indices = geometry.getIndex();
            // name of the mesh object
            output += 'o ' + mesh.name + '\n';
            // name of the mesh material
            if (mesh.material && mesh.material.name) {
                output += 'usemtl ' + mesh.material.name + '\n';
            }
            // vertices
            if (vertices !== undefined) {
                for(let i = 0, l = vertices.count; i < l; i++, nbVertex++){
                    vertex.fromBufferAttribute(vertices, i);
                    // transform the vertex to world space
                    vertex.applyMatrix4(mesh.matrixWorld);
                    // transform the vertex to export format
                    output += 'v ' + vertex.x + ' ' + vertex.y + ' ' + vertex.z + '\n';
                }
            }
            // uvs
            if (uvs !== undefined) {
                for(let i = 0, l = uvs.count; i < l; i++, nbVertexUvs++){
                    uv.fromBufferAttribute(uvs, i);
                    // transform the uv to export format
                    output += 'vt ' + uv.x + ' ' + uv.y + '\n';
                }
            }
            // normals
            if (normals !== undefined) {
                normalMatrixWorld.getNormalMatrix(mesh.matrixWorld);
                for(let i = 0, l = normals.count; i < l; i++, nbNormals++){
                    normal.fromBufferAttribute(normals, i);
                    // transform the normal to world space
                    normal.applyMatrix3(normalMatrixWorld).normalize();
                    // transform the normal to export format
                    output += 'vn ' + normal.x + ' ' + normal.y + ' ' + normal.z + '\n';
                }
            }
            // faces
            if (indices !== null) {
                for(let i = 0, l = indices.count; i < l; i += 3){
                    for(let m = 0; m < 3; m++){
                        const j = indices.getX(i + m) + 1;
                        face[m] = indexVertex + j + (normals || uvs ? '/' + (uvs ? indexVertexUvs + j : '') + (normals ? '/' + (indexNormals + j) : '') : '');
                    }
                    // transform the face to export format
                    output += 'f ' + face.join(' ') + '\n';
                }
            } else {
                for(let i = 0, l = vertices.count; i < l; i += 3){
                    for(let m = 0; m < 3; m++){
                        const j = i + m + 1;
                        face[m] = indexVertex + j + (normals || uvs ? '/' + (uvs ? indexVertexUvs + j : '') + (normals ? '/' + (indexNormals + j) : '') : '');
                    }
                    // transform the face to export format
                    output += 'f ' + face.join(' ') + '\n';
                }
            }
            // update index
            indexVertex += nbVertex;
            indexVertexUvs += nbVertexUvs;
            indexNormals += nbNormals;
        }
        function parseLine(line) {
            let nbVertex = 0;
            const geometry = line.geometry;
            const type = line.type;
            // shortcuts
            const vertices = geometry.getAttribute('position');
            // name of the line object
            output += 'o ' + line.name + '\n';
            if (vertices !== undefined) {
                for(let i = 0, l = vertices.count; i < l; i++, nbVertex++){
                    vertex.fromBufferAttribute(vertices, i);
                    // transform the vertex to world space
                    vertex.applyMatrix4(line.matrixWorld);
                    // transform the vertex to export format
                    output += 'v ' + vertex.x + ' ' + vertex.y + ' ' + vertex.z + '\n';
                }
            }
            if (type === 'Line') {
                output += 'l ';
                for(let j = 1, l = vertices.count; j <= l; j++){
                    output += indexVertex + j + ' ';
                }
                output += '\n';
            }
            if (type === 'LineSegments') {
                for(let j = 1, k = j + 1, l = vertices.count; j < l; j += 2, k = j + 1){
                    output += 'l ' + (indexVertex + j) + ' ' + (indexVertex + k) + '\n';
                }
            }
            // update index
            indexVertex += nbVertex;
        }
        function parsePoints(points) {
            let nbVertex = 0;
            const geometry = points.geometry;
            const vertices = geometry.getAttribute('position');
            const colors = geometry.getAttribute('color');
            output += 'o ' + points.name + '\n';
            if (vertices !== undefined) {
                for(let i = 0, l = vertices.count; i < l; i++, nbVertex++){
                    vertex.fromBufferAttribute(vertices, i);
                    vertex.applyMatrix4(points.matrixWorld);
                    output += 'v ' + vertex.x + ' ' + vertex.y + ' ' + vertex.z;
                    if (colors !== undefined) {
                        color.fromBufferAttribute(colors, i);
                        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ColorManagement"].workingToColorSpace(color, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SRGBColorSpace"]);
                        output += ' ' + color.r + ' ' + color.g + ' ' + color.b;
                    }
                    output += '\n';
                }
                output += 'p ';
                for(let j = 1, l = vertices.count; j <= l; j++){
                    output += indexVertex + j + ' ';
                }
                output += '\n';
            }
            // update index
            indexVertex += nbVertex;
        }
        object.traverse(function(child) {
            if (child.isMesh === true) {
                parseMesh(child);
            }
            if (child.isLine === true) {
                parseLine(child);
            }
            if (child.isPoints === true) {
                parsePoints(child);
            }
        });
        return output;
    }
}
;
}),
]);

//# sourceMappingURL=0hqc_three_examples_jsm_exporters_OBJExporter_09of4ie.js.map