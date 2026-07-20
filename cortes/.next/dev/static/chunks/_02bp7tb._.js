(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/lib/parts-manager.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "cloneMeshTransform",
    ()=>cloneMeshTransform,
    "createPart",
    ()=>createPart,
    "makeCutPartMaterial",
    ()=>makeCutPartMaterial
]);
/**
 * Parts Manager — Independent Parts System
 *
 * Each Part is a fully independent object with its own mesh, transform,
 * visibility, selection, lock state, and cut history.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/three/build/three.core.js [app-client] (ecmascript)");
;
let _partCounter = 1;
/** Generate a stable unique Part ID. */ function newPartId() {
    return `part-${Date.now()}-${(_partCounter++).toString(36)}`;
}
function createPart(mesh, name, parentId = null, historyEntry) {
    return {
        id: newPartId(),
        name,
        mesh,
        visible: true,
        selected: false,
        locked: false,
        parentId,
        cutHistory: historyEntry ? [
            historyEntry
        ] : []
    };
}
function makeCutPartMaterial() {
    return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MeshStandardMaterial"]({
        color: new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Color"]('#ff6600'),
        roughness: 0.6,
        metalness: 0.1,
        side: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DoubleSide"],
        flatShading: false
    });
}
function cloneMeshTransform(src, newGeo, newMat) {
    const m = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Mesh"](newGeo, newMat ?? src.material);
    m.castShadow = src.castShadow;
    m.receiveShadow = src.receiveShadow;
    m.position.copy(src.position);
    m.rotation.copy(src.rotation);
    m.scale.copy(src.scale);
    return m;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/i18n.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "translations",
    ()=>translations
]);
const translations = {
    pt: {
        // Top bar
        open: 'Abrir',
        export: 'Exportar',
        grid: 'Grid',
        axes: 'Eixos',
        wireframe: 'Wireframe',
        parts_toggle: 'Peças',
        config: 'Config',
        quit: 'Sair',
        loading_indicator: 'Carregando...',
        // Loading messages
        loading_file: (name)=>`Carregando ${name}...`,
        loaded_file: (name, note)=>`Modelo carregado — ${name}${note}`,
        decimated_note: ' (decimado para fluidez)',
        load_error: (msg)=>`Erro ao carregar: ${msg}`,
        // Config modal
        settings: 'Configurações',
        language: 'Idioma',
        portuguese: 'Português',
        english: 'Inglês',
        spanish: 'Espanhol',
        close: 'Fechar',
        // Quit
        quit_title: 'Sair do Nativos CUT?',
        quit_message: 'Seu trabalho não salvo será perdido.',
        quit_confirm: 'Sair',
        quit_cancel: 'Cancelar',
        // Left panel
        mode: 'Modo',
        part_mode: 'Peça',
        curv_mode: 'Curv.',
        sensitivity: 'Sens.',
        reset: 'Reset',
        tool_smart_desc: 'SmartCut — seleção inteligente por região',
        tool_cut_desc: 'Corte por plano com medidas',
        reset_tooltip: 'Limpar tudo e reiniciar',
        sensitivity_tooltip: (val, label)=>`Sensibilidade: ${val}°\n${label}`,
        sens_ultra: 'Ultra preciso',
        sens_restricted: 'Restrito',
        sens_standard: 'Padrão',
        sens_wide: 'Amplo',
        sens_max: 'Máximo',
        // Right panel
        properties: 'Propriedades',
        no_model_line1: 'Nenhum modelo',
        no_model_line2: 'carregado',
        model_section: 'Modelo',
        vertices: 'Vértices',
        faces: 'Faces',
        file_size: 'Arquivo',
        unit: 'Unidade',
        dimensions: 'Dimensões',
        smartcut_selection: 'Seleção SmartCut',
        click_to_select: 'Clique em uma região do modelo para selecionar',
        triangles: 'Triângulos',
        pct_of_model: '% do modelo',
        parts: 'Partes',
        isolation_hint: 'Apenas a parte selecionada é exibida.\nClique novamente para mostrar todas.',
        // Status bar
        tri_suffix: 'tri',
        sel_suffix: 'sel.',
        // Status messages
        status_idle: 'Pronto. Abra um modelo 3D para começar.',
        status_loading: 'Carregando modelo...',
        status_loaded: 'Modelo carregado. Clique em uma região para selecionar.',
        status_selecting: 'Selecionando... SmartCut analisando geometria.',
        status_cutting: 'Processando corte...',
        status_exporting: 'Exportando...',
        status_error: 'Erro ao processar.',
        // AutoCut panel
        autocut_header: 'AutoCut V2',
        autocut_on_selection: 'AutoCut na Seleção',
        badge_no_cap: 'SEM TAMPA',
        badge_caps_ok: 'TAMPAS OK',
        badge_shells: 'CASCAS',
        contour_ai: 'AutoCut AI',
        contour_ai_sub: 'Contorno matemático',
        contour_exact: 'Exato',
        contour_exact_sub: 'Segue a malha',
        presets_label: 'Presets',
        preset_hair: 'Cabelo',
        preset_hair_desc: 'Contorno suave para mechas e detalhes finos',
        preset_arm: 'Braço',
        preset_arm_desc: 'Separação de membros e partes orgânicas',
        preset_head: 'Cabeça',
        preset_head_desc: 'Destacar cabeça, chapéu ou acessório',
        preset_mini: 'Mini',
        preset_mini_desc: 'Alta precisão para miniaturas e peças pequenas',
        preset_fdm: 'FDM',
        preset_fdm_desc: 'Qualidade máxima para impressão 3D',
        smooth_label: 'Suavização',
        smooth_subtle: 'Sutil',
        smooth_balanced: 'Equil.',
        smooth_strong: 'Forte',
        smooth_max: 'Máx',
        no_cap_label: 'Sem Tampa',
        no_cap_open_desc: 'Peça aberta — sem fechamento nos cortes',
        no_cap_closed_desc: 'Peças fechadas com tampa no corte',
        advanced_label: 'Avançado',
        precision_label: 'Precisão',
        prec_low: 'Baixa',
        prec_med: 'Média',
        prec_high: 'Alta',
        prec_ultra: 'Ultra',
        edge_relax_label: 'Edge Relax',
        relax_none: 'Sem',
        relax_light: 'Leve',
        relax_med: 'Méd',
        relax_strong: 'Fort',
        relax_max: 'Máx',
        offset_label: 'Offset da Superfície',
        boundary_label: 'Fronteira',
        boundary_seam: (n)=>`${n} arestas`,
        boundary_island: 'ilha isolada',
        calc_cut: 'Calcular Corte',
        calculating: 'Calculando...',
        visualization_label: 'Visualização',
        vis_plane: 'Plano',
        vis_shell: 'Casca',
        vis_caps: 'Tampas',
        vis_final: 'Final',
        quality_label: 'Qualidade',
        quality_excellent: 'Excelente',
        quality_good: 'Boa',
        quality_fair: 'Razoável',
        quality_low: 'Baixa',
        rendering_label: 'Renderização',
        render_solid: 'Sólido',
        render_wire: 'Wire',
        render_xray: 'Raio-X',
        processing: 'Processando...',
        no_cap_open_msg: 'Sem tampa — peça será aplicada aberta',
        reconfig: 'Reconfig.',
        apply_no_cap: 'Aplicar Sem Tampa',
        applying: 'Aplicando...',
        gen_caps: 'Gerar Tampas',
        generating: 'Gerando...',
        apply_cut: 'Aplicar Corte',
        reconfigure: 'Reconfigurar',
        legend_body: 'Corpo',
        legend_part: 'Peça',
        legend_seam: 'Costura',
        seg_suffix: 'seg',
        // Encaixe panel
        encaixe_title: 'Gerar Encaixe',
        pin_size_label: 'Tamanho do pino',
        size_xs_label: 'XS',
        size_xs_desc: 'Muito pequeno',
        size_s_label: 'P',
        size_s_desc: 'Pequeno',
        size_m_label: 'M',
        size_m_desc: 'Médio',
        hole_clearance_label: 'Folga do furo (mm)',
        pin_suffix: 'pino',
        hole_in: 'Furo em',
        piece_current: 'Peça atual',
        hole_also_in: 'Furo também em',
        no_complement: 'sem peça removida',
        select_faces_hint: 'Selecione faces na região onde quer o encaixe',
        analysis_error: 'Não foi possível analisar a seleção',
        apply_encaixe: 'Gerar Encaixe',
        generating_enc: 'Gerando...',
        legend_hole_in: 'Furo nas peças',
        legend_pin_loose: 'Pino solto'
    },
    en: {
        open: 'Open',
        export: 'Export',
        grid: 'Grid',
        axes: 'Axes',
        wireframe: 'Wireframe',
        parts_toggle: 'Parts',
        config: 'Config',
        quit: 'Quit',
        loading_indicator: 'Loading...',
        loading_file: (name)=>`Loading ${name}...`,
        loaded_file: (name, note)=>`Model loaded — ${name}${note}`,
        decimated_note: ' (decimated for performance)',
        load_error: (msg)=>`Load error: ${msg}`,
        settings: 'Settings',
        language: 'Language',
        portuguese: 'Portuguese',
        english: 'English',
        spanish: 'Spanish',
        close: 'Close',
        quit_title: 'Quit Nativos CUT?',
        quit_message: 'Unsaved work will be lost.',
        quit_confirm: 'Quit',
        quit_cancel: 'Cancel',
        mode: 'Mode',
        part_mode: 'Part',
        curv_mode: 'Curv.',
        sensitivity: 'Sens.',
        reset: 'Reset',
        tool_smart_desc: 'SmartCut — intelligent region selection',
        tool_cut_desc: 'Plane cut with measurements',
        reset_tooltip: 'Clear everything and restart',
        sensitivity_tooltip: (val, label)=>`Sensitivity: ${val}°\n${label}`,
        sens_ultra: 'Ultra precise',
        sens_restricted: 'Restricted',
        sens_standard: 'Standard',
        sens_wide: 'Wide',
        sens_max: 'Maximum',
        properties: 'Properties',
        no_model_line1: 'No model',
        no_model_line2: 'loaded',
        model_section: 'Model',
        vertices: 'Vertices',
        faces: 'Faces',
        file_size: 'File',
        unit: 'Unit',
        dimensions: 'Dimensions',
        smartcut_selection: 'SmartCut Selection',
        click_to_select: 'Click on a region of the model to select',
        triangles: 'Triangles',
        pct_of_model: '% of model',
        parts: 'Parts',
        isolation_hint: 'Only the selected part is shown.\nClick again to show all.',
        tri_suffix: 'tri',
        sel_suffix: 'sel.',
        status_idle: 'Ready. Open a 3D model to begin.',
        status_loading: 'Loading model...',
        status_loaded: 'Model loaded. Click a region to select.',
        status_selecting: 'Selecting... SmartCut analyzing geometry.',
        status_cutting: 'Processing cut...',
        status_exporting: 'Exporting...',
        status_error: 'Processing error.',
        autocut_header: 'AutoCut V2',
        autocut_on_selection: 'AutoCut on Selection',
        badge_no_cap: 'NO CAP',
        badge_caps_ok: 'CAPS OK',
        badge_shells: 'SHELLS',
        contour_ai: 'AutoCut AI',
        contour_ai_sub: 'Mathematical contour',
        contour_exact: 'Exact',
        contour_exact_sub: 'Follows the mesh',
        presets_label: 'Presets',
        preset_hair: 'Hair',
        preset_hair_desc: 'Smooth contour for strands and fine details',
        preset_arm: 'Arm',
        preset_arm_desc: 'Separation of limbs and organic parts',
        preset_head: 'Head',
        preset_head_desc: 'Detach head, hat or accessory',
        preset_mini: 'Mini',
        preset_mini_desc: 'High precision for miniatures and small parts',
        preset_fdm: 'FDM',
        preset_fdm_desc: 'Maximum quality for 3D printing',
        smooth_label: 'Smoothing',
        smooth_subtle: 'Subtle',
        smooth_balanced: 'Balanced',
        smooth_strong: 'Strong',
        smooth_max: 'Max',
        no_cap_label: 'No Cap',
        no_cap_open_desc: 'Open part — no cap on cut face',
        no_cap_closed_desc: 'Closed parts with cap on cut',
        advanced_label: 'Advanced',
        precision_label: 'Precision',
        prec_low: 'Low',
        prec_med: 'Medium',
        prec_high: 'High',
        prec_ultra: 'Ultra',
        edge_relax_label: 'Edge Relax',
        relax_none: 'None',
        relax_light: 'Light',
        relax_med: 'Med',
        relax_strong: 'Strong',
        relax_max: 'Max',
        offset_label: 'Surface Offset',
        boundary_label: 'Boundary',
        boundary_seam: (n)=>`${n} edges`,
        boundary_island: 'isolated island',
        calc_cut: 'Calculate Cut',
        calculating: 'Calculating...',
        visualization_label: 'Visualization',
        vis_plane: 'Plane',
        vis_shell: 'Shell',
        vis_caps: 'Caps',
        vis_final: 'Final',
        quality_label: 'Quality',
        quality_excellent: 'Excellent',
        quality_good: 'Good',
        quality_fair: 'Fair',
        quality_low: 'Low',
        rendering_label: 'Rendering',
        render_solid: 'Solid',
        render_wire: 'Wire',
        render_xray: 'X-Ray',
        processing: 'Processing...',
        no_cap_open_msg: 'No cap — part will be applied open',
        reconfig: 'Reconfig.',
        apply_no_cap: 'Apply No Cap',
        applying: 'Applying...',
        gen_caps: 'Generate Caps',
        generating: 'Generating...',
        apply_cut: 'Apply Cut',
        reconfigure: 'Reconfigure',
        legend_body: 'Body',
        legend_part: 'Part',
        legend_seam: 'Seam',
        seg_suffix: 'seg',
        encaixe_title: 'Generate Connector',
        pin_size_label: 'Pin size',
        size_xs_label: 'XS',
        size_xs_desc: 'Very small',
        size_s_label: 'S',
        size_s_desc: 'Small',
        size_m_label: 'M',
        size_m_desc: 'Medium',
        hole_clearance_label: 'Hole clearance (mm)',
        pin_suffix: 'pin',
        hole_in: 'Hole in',
        piece_current: 'Current part',
        hole_also_in: 'Hole also in',
        no_complement: 'no removed part',
        select_faces_hint: 'Select faces in the region where you want the connector',
        analysis_error: 'Could not analyze the selection',
        apply_encaixe: 'Generate Connector',
        generating_enc: 'Generating...',
        legend_hole_in: 'Hole in parts',
        legend_pin_loose: 'Loose pin'
    },
    es: {
        open: 'Abrir',
        export: 'Exportar',
        grid: 'Grilla',
        axes: 'Ejes',
        wireframe: 'Malla',
        parts_toggle: 'Piezas',
        config: 'Config',
        quit: 'Salir',
        loading_indicator: 'Cargando...',
        loading_file: (name)=>`Cargando ${name}...`,
        loaded_file: (name, note)=>`Modelo cargado — ${name}${note}`,
        decimated_note: ' (decimado para fluidez)',
        load_error: (msg)=>`Error al cargar: ${msg}`,
        settings: 'Configuración',
        language: 'Idioma',
        portuguese: 'Portugués',
        english: 'Inglés',
        spanish: 'Español',
        close: 'Cerrar',
        quit_title: '¿Salir de Nativos CUT?',
        quit_message: 'El trabajo no guardado se perderá.',
        quit_confirm: 'Salir',
        quit_cancel: 'Cancelar',
        mode: 'Modo',
        part_mode: 'Pieza',
        curv_mode: 'Curv.',
        sensitivity: 'Sens.',
        reset: 'Reiniciar',
        tool_smart_desc: 'SmartCut — selección inteligente por región',
        tool_cut_desc: 'Corte por plano con medidas',
        reset_tooltip: 'Limpiar todo y reiniciar',
        sensitivity_tooltip: (val, label)=>`Sensibilidad: ${val}°\n${label}`,
        sens_ultra: 'Ultra preciso',
        sens_restricted: 'Restringido',
        sens_standard: 'Estándar',
        sens_wide: 'Amplio',
        sens_max: 'Máximo',
        properties: 'Propiedades',
        no_model_line1: 'Ningún modelo',
        no_model_line2: 'cargado',
        model_section: 'Modelo',
        vertices: 'Vértices',
        faces: 'Caras',
        file_size: 'Archivo',
        unit: 'Unidad',
        dimensions: 'Dimensiones',
        smartcut_selection: 'Selección SmartCut',
        click_to_select: 'Haz clic en una región del modelo para seleccionar',
        triangles: 'Triángulos',
        pct_of_model: '% del modelo',
        parts: 'Piezas',
        isolation_hint: 'Solo la pieza seleccionada es visible.\nHaz clic de nuevo para mostrar todas.',
        tri_suffix: 'tri',
        sel_suffix: 'sel.',
        status_idle: 'Listo. Abre un modelo 3D para comenzar.',
        status_loading: 'Cargando modelo...',
        status_loaded: 'Modelo cargado. Haz clic en una región para seleccionar.',
        status_selecting: 'Seleccionando... SmartCut analizando geometría.',
        status_cutting: 'Procesando corte...',
        status_exporting: 'Exportando...',
        status_error: 'Error al procesar.',
        autocut_header: 'AutoCut V2',
        autocut_on_selection: 'AutoCut en Selección',
        badge_no_cap: 'SIN TAPA',
        badge_caps_ok: 'TAPAS OK',
        badge_shells: 'CÁSCARAS',
        contour_ai: 'AutoCut AI',
        contour_ai_sub: 'Contorno matemático',
        contour_exact: 'Exacto',
        contour_exact_sub: 'Sigue la malla',
        presets_label: 'Presets',
        preset_hair: 'Cabello',
        preset_hair_desc: 'Contorno suave para mechones y detalles finos',
        preset_arm: 'Brazo',
        preset_arm_desc: 'Separación de miembros y partes orgánicas',
        preset_head: 'Cabeza',
        preset_head_desc: 'Separar cabeza, sombrero o accesorio',
        preset_mini: 'Mini',
        preset_mini_desc: 'Alta precisión para miniaturas y piezas pequeñas',
        preset_fdm: 'FDM',
        preset_fdm_desc: 'Máxima calidad para impresión 3D',
        smooth_label: 'Suavizado',
        smooth_subtle: 'Sutil',
        smooth_balanced: 'Equilib.',
        smooth_strong: 'Fuerte',
        smooth_max: 'Máx',
        no_cap_label: 'Sin Tapa',
        no_cap_open_desc: 'Pieza abierta — sin cierre en los cortes',
        no_cap_closed_desc: 'Piezas cerradas con tapa en el corte',
        advanced_label: 'Avanzado',
        precision_label: 'Precisión',
        prec_low: 'Baja',
        prec_med: 'Media',
        prec_high: 'Alta',
        prec_ultra: 'Ultra',
        edge_relax_label: 'Edge Relax',
        relax_none: 'Sin',
        relax_light: 'Leve',
        relax_med: 'Med',
        relax_strong: 'Fuerte',
        relax_max: 'Máx',
        offset_label: 'Offset de Superficie',
        boundary_label: 'Frontera',
        boundary_seam: (n)=>`${n} aristas`,
        boundary_island: 'isla aislada',
        calc_cut: 'Calcular Corte',
        calculating: 'Calculando...',
        visualization_label: 'Visualización',
        vis_plane: 'Plano',
        vis_shell: 'Cáscara',
        vis_caps: 'Tapas',
        vis_final: 'Final',
        quality_label: 'Calidad',
        quality_excellent: 'Excelente',
        quality_good: 'Buena',
        quality_fair: 'Regular',
        quality_low: 'Baja',
        rendering_label: 'Renderizado',
        render_solid: 'Sólido',
        render_wire: 'Malla',
        render_xray: 'Rayos-X',
        processing: 'Procesando...',
        no_cap_open_msg: 'Sin tapa — pieza se aplicará abierta',
        reconfig: 'Reconfig.',
        apply_no_cap: 'Aplicar Sin Tapa',
        applying: 'Aplicando...',
        gen_caps: 'Generar Tapas',
        generating: 'Generando...',
        apply_cut: 'Aplicar Corte',
        reconfigure: 'Reconfigurar',
        legend_body: 'Cuerpo',
        legend_part: 'Pieza',
        legend_seam: 'Costura',
        seg_suffix: 'seg',
        encaixe_title: 'Generar Conector',
        pin_size_label: 'Tamaño del pasador',
        size_xs_label: 'XS',
        size_xs_desc: 'Muy pequeño',
        size_s_label: 'P',
        size_s_desc: 'Pequeño',
        size_m_label: 'M',
        size_m_desc: 'Mediano',
        hole_clearance_label: 'Tolerancia del agujero (mm)',
        pin_suffix: 'pasador',
        hole_in: 'Agujero en',
        piece_current: 'Pieza actual',
        hole_also_in: 'Agujero también en',
        no_complement: 'sin pieza retirada',
        select_faces_hint: 'Selecciona caras en la región donde quieres el conector',
        analysis_error: 'No se pudo analizar la selección',
        apply_encaixe: 'Generar Conector',
        generating_enc: 'Generando...',
        legend_hole_in: 'Agujero en piezas',
        legend_pin_loose: 'Pasador suelto'
    }
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/lang-store.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getT",
    ()=>getT,
    "useLangStore",
    ()=>useLangStore,
    "useT",
    ()=>useT
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/react.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$i18n$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/i18n.ts [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
"use client";
;
;
const useLangStore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["create"])((set)=>({
        language: 'pt',
        setLanguage: (language)=>set({
                language
            })
    }));
function useT() {
    _s();
    const language = useLangStore({
        "useT.useLangStore[language]": (s)=>s.language
    }["useT.useLangStore[language]"]);
    return __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$i18n$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["translations"][language];
}
_s(useT, "UQQ9f9c4JEOd0kBag13Tnr98mlc=", false, function() {
    return [
        useLangStore
    ];
});
function getT() {
    return __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$i18n$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["translations"][useLangStore.getState().language];
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/store.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useAppStore",
    ()=>useAppStore
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/react.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$parts$2d$manager$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/parts-manager.ts [app-client] (ecmascript)");
"use client";
;
;
const MAX_HISTORY = 50;
function disposeOpenCutData(data) {
    if (!data) return;
    try {
        data.openSelectedGeometry.dispose();
    } catch  {}
    try {
        data.openBodyGeometry.dispose();
    } catch  {}
}
function disposeCutPreview(preview) {
    if (!preview) return;
    try {
        preview.selectedGeometry.dispose();
    } catch  {}
    try {
        preview.bodyGeometry.dispose();
    } catch  {}
}
const useAppStore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["create"])((set, get)=>({
        status: 'idle',
        statusMessage: 'Pronto. Abra um modelo 3D para começar.',
        fps: 60,
        modelInfo: null,
        modelMesh: null,
        originalGeometry: null,
        parts: [],
        activePartId: null,
        activeTool: 'select',
        unit: 'mm',
        selectionState: 'idle',
        selectionMode: 'new',
        selectedFaceIndices: new Set(),
        hoveredFaceIndices: new Set(),
        cutParts: [],
        activeCutPartId: null,
        showGrid: true,
        showAxes: true,
        showWireframe: false,
        allowCutPartSelection: false,
        sharpAngle: 10,
        cutMode: 'island',
        eraserSize: 5,
        cutPlaneAxis: 'y',
        cutPlaneOffset: 0.5,
        cutPlaneFlip: false,
        autoSplitPlan: null,
        autoCutOpen: false,
        autoCutPreview: null,
        encaixeOpen: false,
        openCutData: null,
        autoCutPipelineStage: 'idle',
        autoCutPreviewMode: 'shell',
        cutPreview: null,
        previewViewMode: 'solid',
        past: [],
        future: [],
        // ── Sistema de Partes ──────────────────────────────────────────────────────
        registerModelAsPart: (mesh, name)=>set((state)=>{
                const part = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$parts$2d$manager$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createPart"])(mesh, name.replace(/\.[^.]+$/, '') || 'Corpo Principal');
                return {
                    parts: [
                        part
                    ],
                    activePartId: part.id,
                    modelMesh: mesh,
                    cutParts: [],
                    activeCutPartId: null,
                    selectedFaceIndices: new Set(),
                    hoveredFaceIndices: new Set(),
                    selectionState: 'idle',
                    autoCutOpen: false,
                    encaixeOpen: false,
                    autoCutPreview: null,
                    cutPreview: null,
                    openCutData: null,
                    autoCutPipelineStage: 'idle',
                    autoCutPreviewMode: 'shell'
                };
            }),
        addPart: (part)=>set((state)=>({
                    parts: [
                        ...state.parts,
                        part
                    ]
                })),
        updatePart: (id, updates)=>set((state)=>({
                    parts: state.parts.map((p)=>p.id === id ? {
                            ...p,
                            ...updates
                        } : p)
                })),
        removePart: (id)=>set((state)=>{
                const newParts = state.parts.filter((p)=>p.id !== id);
                const newActiveId = state.activePartId === id ? newParts[0]?.id ?? null : state.activePartId;
                const newModelMesh = newActiveId !== state.activePartId ? newParts.find((p)=>p.id === newActiveId)?.mesh ?? null : state.modelMesh;
                return {
                    parts: newParts,
                    activePartId: newActiveId,
                    modelMesh: newModelMesh,
                    // Keep cutParts in sync
                    cutParts: state.cutParts.filter((cp)=>cp.id !== id)
                };
            }),
        setActivePartId: (id)=>set((state)=>{
                if (id === null) {
                    return {
                        activePartId: null
                    };
                }
                const part = state.parts.find((p)=>p.id === id);
                return {
                    activePartId: id,
                    // Redirect modelMesh so SmartCut operates on the active part
                    modelMesh: part?.mesh ?? state.modelMesh,
                    // Reset selection when switching parts
                    selectedFaceIndices: new Set(),
                    hoveredFaceIndices: new Set(),
                    selectionState: 'idle',
                    autoCutOpen: false
                };
            }),
        togglePartVisibility: (id)=>set((state)=>({
                    parts: state.parts.map((p)=>p.id === id ? {
                            ...p,
                            visible: !p.visible
                        } : p)
                })),
        togglePartLocked: (id)=>set((state)=>({
                    parts: state.parts.map((p)=>p.id === id ? {
                            ...p,
                            locked: !p.locked
                        } : p)
                })),
        renamePart: (id, name)=>set((state)=>({
                    parts: state.parts.map((p)=>p.id === id ? {
                            ...p,
                            name
                        } : p),
                    // Keep cutParts name in sync
                    cutParts: state.cutParts.map((cp)=>cp.id === id ? {
                            ...cp,
                            name
                        } : cp)
                })),
        // ── Ações legadas (mantidas para compatibilidade) ─────────────────────────
        setStatus: (status, message)=>set({
                status,
                statusMessage: message ?? getDefaultMessage(status)
            }),
        setFps: (fps)=>set({
                fps
            }),
        setModelInfo: (info)=>set({
                modelInfo: info
            }),
        /**
   * Atualiza modelMesh E sincroniza a malha da parte ativa em `parts`.
   */ setModelMesh: (mesh)=>set((state)=>{
                if (mesh === null) return {
                    modelMesh: null
                };
                const newParts = state.activePartId ? state.parts.map((p)=>p.id === state.activePartId ? {
                        ...p,
                        mesh
                    } : p) : state.parts;
                return {
                    modelMesh: mesh,
                    parts: newParts
                };
            }),
        setOriginalGeometry: (geo)=>set({
                originalGeometry: geo
            }),
        setActiveTool: (tool)=>set({
                activeTool: tool
            }),
        setUnit: (unit)=>set({
                unit
            }),
        setSelectionState: (selectionState)=>set({
                selectionState
            }),
        setSelectionMode: (selectionMode)=>set({
                selectionMode
            }),
        setSelectedFaceIndices: (selectedFaceIndices)=>set({
                selectedFaceIndices
            }),
        setHoveredFaceIndices: (hoveredFaceIndices)=>set({
                hoveredFaceIndices
            }),
        /**
   * Adiciona uma peça cortada ao sistema legado E também ao array de Partes.
   */ addCutPart: (cutPart)=>set((state)=>{
                const newPart = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$parts$2d$manager$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createPart"])(cutPart.mesh, cutPart.name, state.activePartId);
                // Use the same id as cutPart so removals stay in sync
                newPart.id = cutPart.id;
                return {
                    cutParts: [
                        ...state.cutParts,
                        cutPart
                    ],
                    parts: [
                        ...state.parts,
                        newPart
                    ]
                };
            }),
        /**
   * Remove uma peça cortada do sistema legado E também do array de Partes.
   */ removeCutPart: (id)=>set((state)=>({
                    cutParts: state.cutParts.filter((p)=>p.id !== id),
                    parts: state.parts.filter((p)=>p.id !== id),
                    activeCutPartId: state.activeCutPartId === id ? null : state.activeCutPartId,
                    activePartId: state.activePartId === id ? state.parts.find((p)=>p.id !== id)?.id ?? null : state.activePartId
                })),
        setCutParts: (cutParts)=>set((state)=>{
                // Sincroniza as malhas atualizadas em `parts` para que o ModelRenderer
                // re-renderize as peças cortadas com a nova geometria (ex: furo de encaixe).
                const cutById = new Map(cutParts.map((cp)=>[
                        cp.id,
                        cp
                    ]));
                const parts = state.parts.map((p)=>{
                    const updated = cutById.get(p.id);
                    if (!updated) return p;
                    return {
                        ...p,
                        mesh: updated.mesh
                    };
                });
                return {
                    cutParts,
                    parts
                };
            }),
        setActiveCutPartId: (id)=>set({
                activeCutPartId: id
            }),
        setSharpAngle: (sharpAngle)=>set({
                sharpAngle
            }),
        setCutMode: (cutMode)=>set({
                cutMode
            }),
        setEraserSize: (eraserSize)=>set({
                eraserSize
            }),
        setCutPlaneAxis: (cutPlaneAxis)=>set({
                cutPlaneAxis
            }),
        setCutPlaneOffset: (cutPlaneOffset)=>set({
                cutPlaneOffset
            }),
        toggleCutPlaneFlip: ()=>set((state)=>({
                    cutPlaneFlip: !state.cutPlaneFlip
                })),
        setAutoSplitPlan: (autoSplitPlan)=>set({
                autoSplitPlan
            }),
        setAutoCutOpen: (autoCutOpen)=>set({
                autoCutOpen
            }),
        setEncaixeOpen: (encaixeOpen)=>set({
                encaixeOpen
            }),
        setAutoCutPreview: (autoCutPreview)=>set({
                autoCutPreview
            }),
        setOpenCutData: (openCutData)=>set((state)=>{
                if (state.openCutData && state.openCutData !== openCutData) disposeOpenCutData(state.openCutData);
                return {
                    openCutData
                };
            }),
        setAutoCutPipelineStage: (autoCutPipelineStage)=>set({
                autoCutPipelineStage
            }),
        setAutoCutPreviewMode: (autoCutPreviewMode)=>set({
                autoCutPreviewMode
            }),
        setCutPreview: (cutPreview)=>set((state)=>{
                if (state.cutPreview && state.cutPreview !== cutPreview) disposeCutPreview(state.cutPreview);
                return {
                    cutPreview
                };
            }),
        setPreviewViewMode: (previewViewMode)=>set({
                previewViewMode
            }),
        toggleGrid: ()=>set((state)=>({
                    showGrid: !state.showGrid
                })),
        toggleAxes: ()=>set((state)=>({
                    showAxes: !state.showAxes
                })),
        toggleWireframe: ()=>set((state)=>({
                    showWireframe: !state.showWireframe
                })),
        toggleCutPartSelection: ()=>set((state)=>({
                    allowCutPartSelection: !state.allowCutPartSelection,
                    activeCutPartId: !state.allowCutPartSelection ? state.activeCutPartId : null
                })),
        clearSelection: ()=>set((state)=>{
                disposeCutPreview(state.cutPreview);
                disposeOpenCutData(state.openCutData);
                return {
                    selectedFaceIndices: new Set(),
                    hoveredFaceIndices: new Set(),
                    selectionState: 'idle',
                    autoCutOpen: false,
                    encaixeOpen: false,
                    autoCutPreview: null,
                    cutPreview: null,
                    openCutData: null,
                    autoCutPipelineStage: 'idle',
                    autoCutPreviewMode: 'shell'
                };
            }),
        resetAll: ()=>set((state)=>{
                disposeCutPreview(state.cutPreview);
                disposeOpenCutData(state.openCutData);
                return {
                    past: pushSnapshot(state.past, snapshotOf(state)),
                    future: [],
                    selectionState: 'idle',
                    selectedFaceIndices: new Set(),
                    hoveredFaceIndices: new Set(),
                    activeCutPartId: null,
                    autoCutOpen: false,
                    encaixeOpen: false,
                    autoCutPreview: null,
                    cutPreview: null,
                    openCutData: null,
                    autoCutPipelineStage: 'idle',
                    autoCutPreviewMode: 'shell',
                    status: 'loaded',
                    statusMessage: 'Seleção resetada.'
                };
            }),
        pushHistory: ()=>set((state)=>({
                    past: pushSnapshot(state.past, snapshotOf(state)),
                    future: []
                })),
        undo: ()=>set((state)=>{
                if (state.past.length === 0) return {};
                const previous = state.past[state.past.length - 1];
                const newPast = state.past.slice(0, -1);
                disposeCutPreview(state.cutPreview);
                return {
                    past: newPast,
                    future: [
                        snapshotOf(state),
                        ...state.future
                    ].slice(0, MAX_HISTORY),
                    selectedFaceIndices: previous.selectedFaceIndices,
                    cutParts: previous.cutParts,
                    selectionState: previous.selectionState,
                    activeCutPartId: previous.activeCutPartId,
                    modelMesh: previous.modelMesh,
                    modelInfo: previous.modelInfo,
                    parts: previous.parts,
                    activePartId: previous.activePartId,
                    hoveredFaceIndices: new Set(),
                    cutPreview: null,
                    status: 'loaded',
                    statusMessage: 'Ação desfeita.'
                };
            }),
        redo: ()=>set((state)=>{
                if (state.future.length === 0) return {};
                const next = state.future[0];
                const newFuture = state.future.slice(1);
                disposeCutPreview(state.cutPreview);
                return {
                    past: pushSnapshot(state.past, snapshotOf(state)),
                    future: newFuture,
                    selectedFaceIndices: next.selectedFaceIndices,
                    cutParts: next.cutParts,
                    selectionState: next.selectionState,
                    activeCutPartId: next.activeCutPartId,
                    modelMesh: next.modelMesh,
                    modelInfo: next.modelInfo,
                    parts: next.parts,
                    activePartId: next.activePartId,
                    hoveredFaceIndices: new Set(),
                    cutPreview: null,
                    status: 'loaded',
                    statusMessage: 'Ação refeita.'
                };
            })
    }));
// ── Helpers de histórico ──────────────────────────────────────────────────────
function snapshotOf(state) {
    return {
        selectedFaceIndices: new Set(state.selectedFaceIndices),
        cutParts: [
            ...state.cutParts
        ],
        selectionState: state.selectionState,
        activeCutPartId: state.activeCutPartId,
        modelMesh: state.modelMesh,
        modelInfo: state.modelInfo,
        parts: [
            ...state.parts
        ],
        activePartId: state.activePartId
    };
}
function pushSnapshot(past, snap) {
    const next = [
        ...past,
        snap
    ];
    return next.length > MAX_HISTORY ? next.slice(next.length - MAX_HISTORY) : next;
}
function getDefaultMessage(status) {
    // Use lang store if available (lazy import to avoid circular deps at module load time)
    try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { getT } = __turbopack_context__.r("[project]/lib/lang-store.ts [app-client] (ecmascript)");
        const t = getT();
        switch(status){
            case 'idle':
                return t.status_idle;
            case 'loading':
                return t.status_loading;
            case 'loaded':
                return t.status_loaded;
            case 'selecting':
                return t.status_selecting;
            case 'cutting':
                return t.status_cutting;
            case 'exporting':
                return t.status_exporting;
            case 'error':
                return t.status_error;
            default:
                return '';
        }
    } catch  {
        switch(status){
            case 'idle':
                return 'Pronto. Abra um modelo 3D para começar.';
            case 'loading':
                return 'Carregando modelo...';
            case 'loaded':
                return 'Modelo carregado. Clique em uma região para selecionar.';
            case 'selecting':
                return 'Selecionando... SmartCut analisando geometria.';
            case 'cutting':
                return 'Processando corte...';
            case 'exporting':
                return 'Exportando...';
            case 'error':
                return 'Erro ao processar.';
            default:
                return '';
        }
    }
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/utils.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "cn",
    ()=>cn
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/clsx/dist/clsx.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/tailwind-merge/dist/bundle-mjs.mjs [app-client] (ecmascript)");
;
;
function cn(...inputs) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["twMerge"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["clsx"])(inputs));
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/layout/config-modal.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ConfigModal",
    ()=>ConfigModal
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.mjs [app-client] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$globe$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Globe$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/globe.mjs [app-client] (ecmascript) <export default as Globe>");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$lang$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/lang-store.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
const LANGS = [
    {
        id: 'pt',
        flag: '🇧🇷'
    },
    {
        id: 'en',
        flag: '🇺🇸'
    },
    {
        id: 'es',
        flag: '🇪🇸'
    }
];
function ConfigModal({ open, onClose }) {
    _s();
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$lang$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useT"])();
    const { language, setLanguage } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$lang$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useLangStore"])();
    const overlayRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    // Close on Escape
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ConfigModal.useEffect": ()=>{
            if (!open) return;
            const onKey = {
                "ConfigModal.useEffect.onKey": (e)=>{
                    if (e.key === 'Escape') onClose();
                }
            }["ConfigModal.useEffect.onKey"];
            window.addEventListener('keydown', onKey);
            return ({
                "ConfigModal.useEffect": ()=>window.removeEventListener('keydown', onKey)
            })["ConfigModal.useEffect"];
        }
    }["ConfigModal.useEffect"], [
        open,
        onClose
    ]);
    if (!open) return null;
    const langLabels = {
        pt: t.portuguese,
        en: t.english,
        es: t.spanish
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                ref: overlayRef,
                className: "fixed inset-0 z-50",
                onClick: onClose
            }, void 0, false, {
                fileName: "[project]/components/layout/config-modal.tsx",
                lineNumber: 44,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "fixed z-50 top-14 right-4 w-64 rounded-2xl border shadow-2xl",
                style: {
                    background: 'oklch(0.09 0 0 / 98%)',
                    backdropFilter: 'blur(24px) saturate(1.4)',
                    borderColor: 'oklch(0.22 0 0)',
                    boxShadow: '0 12px 48px oklch(0 0 0 / 60%), inset 0 1px 0 oklch(1 0 0 / 5%)'
                },
                onClick: (e)=>e.stopPropagation(),
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center justify-between px-4 py-3 border-b",
                        style: {
                            borderColor: 'oklch(0.16 0 0)'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-[11px] font-mono uppercase tracking-widest text-muted-foreground",
                                children: t.settings
                            }, void 0, false, {
                                fileName: "[project]/components/layout/config-modal.tsx",
                                lineNumber: 66,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: onClose,
                                className: "text-muted-foreground/50 hover:text-foreground transition-colors p-0.5 rounded",
                                "aria-label": t.close,
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                    className: "w-3.5 h-3.5"
                                }, void 0, false, {
                                    fileName: "[project]/components/layout/config-modal.tsx",
                                    lineNumber: 74,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/layout/config-modal.tsx",
                                lineNumber: 69,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/layout/config-modal.tsx",
                        lineNumber: 62,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "p-4 flex flex-col gap-4",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-col gap-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-1.5",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$globe$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Globe$3e$__["Globe"], {
                                            className: "w-3 h-3 text-muted-foreground/60"
                                        }, void 0, false, {
                                            fileName: "[project]/components/layout/config-modal.tsx",
                                            lineNumber: 83,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-[10px] font-mono uppercase tracking-wider text-muted-foreground/60",
                                            children: t.language
                                        }, void 0, false, {
                                            fileName: "[project]/components/layout/config-modal.tsx",
                                            lineNumber: 84,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/layout/config-modal.tsx",
                                    lineNumber: 82,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex flex-col gap-1",
                                    children: LANGS.map(({ id, flag })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>setLanguage(id),
                                            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('flex items-center gap-3 w-full px-3 py-2 rounded-lg text-left transition-all border', language === id ? 'text-background font-medium border-transparent' : 'text-muted-foreground border-border/50 hover:text-foreground hover:bg-secondary/50'),
                                            style: language === id ? {
                                                background: 'oklch(0.70 0.22 42)',
                                                borderColor: 'transparent'
                                            } : undefined,
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-base leading-none",
                                                    children: flag
                                                }, void 0, false, {
                                                    fileName: "[project]/components/layout/config-modal.tsx",
                                                    lineNumber: 105,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-xs font-mono",
                                                    children: langLabels[id]
                                                }, void 0, false, {
                                                    fileName: "[project]/components/layout/config-modal.tsx",
                                                    lineNumber: 106,
                                                    columnNumber: 19
                                                }, this),
                                                language === id && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "ml-auto text-[9px] font-mono opacity-70",
                                                    children: "✓"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/layout/config-modal.tsx",
                                                    lineNumber: 108,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, id, true, {
                                            fileName: "[project]/components/layout/config-modal.tsx",
                                            lineNumber: 90,
                                            columnNumber: 17
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/components/layout/config-modal.tsx",
                                    lineNumber: 88,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/layout/config-modal.tsx",
                            lineNumber: 81,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/layout/config-modal.tsx",
                        lineNumber: 79,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/layout/config-modal.tsx",
                lineNumber: 51,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true);
}
_s(ConfigModal, "jEiAJbuS2UFtTjdKdSVCqFDuvi4=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$lang$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useT"],
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$lang$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useLangStore"]
    ];
});
_c = ConfigModal;
var _c;
__turbopack_context__.k.register(_c, "ConfigModal");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/layout/top-bar.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "TopBar",
    ()=>TopBar
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$folder$2d$open$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FolderOpen$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/folder-open.mjs [app-client] (ecmascript) <export default as FolderOpen>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$download$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Download$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/download.mjs [app-client] (ecmascript) <export default as Download>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/settings.mjs [app-client] (ecmascript) <export default as Settings>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$grid$2d$3x3$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Grid3x3$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/grid-3x3.mjs [app-client] (ecmascript) <export default as Grid3x3>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$axis$2d$3d$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Axis3d$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/axis-3d.mjs [app-client] (ecmascript) <export default as Axis3d>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$wifi$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Wifi$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/wifi.mjs [app-client] (ecmascript) <export default as Wifi>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$lock$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Lock$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/lock.mjs [app-client] (ecmascript) <export default as Lock>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$lock$2d$open$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LockOpen$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/lock-open.mjs [app-client] (ecmascript) <export default as LockOpen>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$log$2d$out$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LogOut$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/log-out.mjs [app-client] (ecmascript) <export default as LogOut>");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/store.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$lang$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/lang-store.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$layout$2f$config$2d$modal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/layout/config-modal.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
function TopBar({ onExport }) {
    _s();
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$lang$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useT"])();
    // Selective selectors — each subscribes only to the slice it needs,
    // so unrelated state changes (fps, hoveredFaceIndices, etc.) don't re-render TopBar.
    const modelMesh = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"])({
        "TopBar.useAppStore[modelMesh]": (s)=>s.modelMesh
    }["TopBar.useAppStore[modelMesh]"]);
    const showGrid = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"])({
        "TopBar.useAppStore[showGrid]": (s)=>s.showGrid
    }["TopBar.useAppStore[showGrid]"]);
    const showAxes = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"])({
        "TopBar.useAppStore[showAxes]": (s)=>s.showAxes
    }["TopBar.useAppStore[showAxes]"]);
    const showWireframe = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"])({
        "TopBar.useAppStore[showWireframe]": (s)=>s.showWireframe
    }["TopBar.useAppStore[showWireframe]"]);
    const allowCutPartSelection = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"])({
        "TopBar.useAppStore[allowCutPartSelection]": (s)=>s.allowCutPartSelection
    }["TopBar.useAppStore[allowCutPartSelection]"]);
    const status = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"])({
        "TopBar.useAppStore[status]": (s)=>s.status
    }["TopBar.useAppStore[status]"]);
    // Actions are stable references in zustand — safe to grab from getState()
    const { setStatus, registerModelAsPart, setModelInfo, setOriginalGeometry, toggleGrid, toggleAxes, toggleWireframe, toggleCutPartSelection } = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"].getState();
    const [configOpen, setConfigOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [quitOpen, setQuitOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    // ── Ref estável para o <input type="file"> ───────────────────────────────────
    // O input fica sempre no DOM (offscreen, NÃO display:none) e é clicado via
    // ref.current.click() no onClick do botão. Usamos addEventListener nativo
    // em vez de onChange do React para garantir que o evento seja capturado
    // independente de re-renders ou quirks do sistema de eventos sintéticos.
    const fileInputRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    // ── Carregamento do arquivo ──────────────────────────────────────────────────
    const processFile = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "TopBar.useCallback[processFile]": async (file)=>{
            setStatus('loading', t.loading_file(file.name));
            try {
                // Lazy-import so loadModel (and Three.js loaders) are not in the initial bundle
                const { loadModel } = await __turbopack_context__.A("[project]/lib/model-loader.ts [app-client] (ecmascript, async loader)");
                const { mesh, info, wasDecimated } = await loadModel(file);
                registerModelAsPart(mesh, info.name);
                setModelInfo(info);
                setOriginalGeometry(mesh.geometry.clone());
                const decimNote = wasDecimated ? t.decimated_note : '';
                setStatus('loaded', t.loaded_file(info.name, decimNote));
                // Lazy-import invalidate so @react-three/fiber is not in the initial bundle
                const { invalidate } = await __turbopack_context__.A("[project]/node_modules/@react-three/fiber/dist/react-three-fiber.esm.js [app-client] (ecmascript, async loader)");
                invalidate();
            } catch (err) {
                setStatus('error', t.load_error(err?.message ?? 'Erro desconhecido'));
            }
        }
    }["TopBar.useCallback[processFile]"], [
        setStatus,
        registerModelAsPart,
        setModelInfo,
        setOriginalGeometry,
        t
    ]);
    // ── Listener nativo no input — mais confiável que onChange do React ──────────
    // React's onChange às vezes não dispara em inputs de arquivo dentro de labels
    // com overflow:hidden ou após certos re-renders. addEventListener nativo
    // garante que o evento sempre chegue, independente do contexto do browser.
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "TopBar.useEffect": ()=>{
            const input = fileInputRef.current;
            if (!input) return;
            const handler = {
                "TopBar.useEffect.handler": (e)=>{
                    const target = e.target;
                    const file = target.files?.[0];
                    target.value = ''; // permite selecionar o mesmo arquivo novamente
                    if (file) processFile(file);
                }
            }["TopBar.useEffect.handler"];
            input.addEventListener('change', handler);
            return ({
                "TopBar.useEffect": ()=>input.removeEventListener('change', handler)
            })["TopBar.useEffect"];
        }
    }["TopBar.useEffect"], [
        processFile
    ]);
    // ── Quit — faz logout e volta para o login da aplicação principal ────────────
    const handleQuit = ()=>{
        setQuitOpen(false);
        // Resetar estado local
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"].getState().resetAll();
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"].setState({
            modelMesh: null,
            modelInfo: null,
            originalGeometry: null,
            parts: [],
            activePartId: null,
            cutParts: [],
            activeCutPartId: null,
            status: 'idle',
            statusMessage: t.status_idle
        });
        // Limpar sessão Supabase do localStorage (Cortes não tem Supabase instalado,
        // mas o token fica no localStorage — limpar faz o app principal mostrar login)
        try {
            const keys = Object.keys(localStorage).filter((k)=>k.startsWith('sb-') || k === 'nativos.token');
            keys.forEach((k)=>localStorage.removeItem(k));
        } catch  {}
        // Redirecionar para o app principal (que vai detectar sessão nula → login)
        window.location.href = '/';
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                className: "flex items-center h-11 px-4 border-b border-border shrink-0 z-10",
                style: {
                    background: 'oklch(0.08 0 0)'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>{
                            window.location.href = '/';
                        },
                        className: "flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono transition-all duration-150 text-muted-foreground hover:text-foreground hover:bg-secondary mr-3",
                        title: "Voltar ao Nativos Studio",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                width: "13",
                                height: "13",
                                viewBox: "0 0 24 24",
                                fill: "none",
                                stroke: "currentColor",
                                strokeWidth: "2",
                                strokeLinecap: "round",
                                strokeLinejoin: "round",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                    d: "M19 12H5M12 5l-7 7 7 7"
                                }, void 0, false, {
                                    fileName: "[project]/components/layout/top-bar.tsx",
                                    lineNumber: 136,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/layout/top-bar.tsx",
                                lineNumber: 135,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "hidden md:block",
                                children: "Studio"
                            }, void 0, false, {
                                fileName: "[project]/components/layout/top-bar.tsx",
                                lineNumber: 138,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/layout/top-bar.tsx",
                        lineNumber: 130,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-2.5 mr-6",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(LogoMark, {}, void 0, false, {
                                fileName: "[project]/components/layout/top-bar.tsx",
                                lineNumber: 143,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-col leading-none",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-sm font-bold tracking-tight text-foreground uppercase font-mono",
                                        children: "NATIVOS"
                                    }, void 0, false, {
                                        fileName: "[project]/components/layout/top-bar.tsx",
                                        lineNumber: 145,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-[10px] font-mono tracking-widest",
                                        style: {
                                            color: 'oklch(0.70 0.22 42)'
                                        },
                                        children: "CUT"
                                    }, void 0, false, {
                                        fileName: "[project]/components/layout/top-bar.tsx",
                                        lineNumber: 148,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/layout/top-bar.tsx",
                                lineNumber: 144,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "ml-1 px-1.5 py-0.5 rounded text-[9px] font-mono uppercase tracking-wider border",
                                style: {
                                    color: 'oklch(0.70 0.22 42)',
                                    borderColor: 'oklch(0.70 0.22 42 / 30%)',
                                    background: 'oklch(0.70 0.22 42 / 8%)'
                                },
                                children: "PRO"
                            }, void 0, false, {
                                fileName: "[project]/components/layout/top-bar.tsx",
                                lineNumber: 152,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/layout/top-bar.tsx",
                        lineNumber: 142,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "h-6 w-px bg-border mr-4"
                    }, void 0, false, {
                        fileName: "[project]/components/layout/top-bar.tsx",
                        lineNumber: 165,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-1",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                ref: fileInputRef,
                                id: "cortes-file-input",
                                type: "file",
                                accept: ".stl,.obj,.ply,.glb,.gltf",
                                tabIndex: -1,
                                "aria-hidden": "true",
                                style: {
                                    position: 'fixed',
                                    top: '-200px',
                                    left: '-200px',
                                    width: '1px',
                                    height: '1px',
                                    opacity: 0
                                }
                            }, void 0, false, {
                                fileName: "[project]/components/layout/top-bar.tsx",
                                lineNumber: 176,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>fileInputRef.current?.click(),
                                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono', 'transition-all duration-150 cursor-pointer select-none', !modelMesh ? 'text-background font-medium hover:opacity-90' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'),
                                style: !modelMesh ? {
                                    background: 'oklch(0.70 0.22 42)',
                                    color: 'oklch(0.08 0 0)'
                                } : undefined,
                                title: `${t.open} (Ctrl+O)`,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$folder$2d$open$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FolderOpen$3e$__["FolderOpen"], {
                                        className: "w-3.5 h-3.5"
                                    }, void 0, false, {
                                        fileName: "[project]/components/layout/top-bar.tsx",
                                        lineNumber: 205,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: t.open
                                    }, void 0, false, {
                                        fileName: "[project]/components/layout/top-bar.tsx",
                                        lineNumber: 206,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/layout/top-bar.tsx",
                                lineNumber: 193,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(TopBarBtn, {
                                icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$download$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Download$3e$__["Download"], {
                                    className: "w-3.5 h-3.5"
                                }, void 0, false, {
                                    fileName: "[project]/components/layout/top-bar.tsx",
                                    lineNumber: 210,
                                    columnNumber: 19
                                }, this),
                                label: t.export,
                                shortcut: "Ctrl+E",
                                disabled: !modelMesh,
                                onClick: onExport
                            }, void 0, false, {
                                fileName: "[project]/components/layout/top-bar.tsx",
                                lineNumber: 209,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/layout/top-bar.tsx",
                        lineNumber: 168,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "h-6 w-px bg-border mx-3"
                    }, void 0, false, {
                        fileName: "[project]/components/layout/top-bar.tsx",
                        lineNumber: 219,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-1",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ViewToggleBtn, {
                                icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$grid$2d$3x3$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Grid3x3$3e$__["Grid3x3"], {
                                    className: "w-3.5 h-3.5"
                                }, void 0, false, {
                                    fileName: "[project]/components/layout/top-bar.tsx",
                                    lineNumber: 223,
                                    columnNumber: 32
                                }, this),
                                label: t.grid,
                                active: showGrid,
                                onClick: toggleGrid
                            }, void 0, false, {
                                fileName: "[project]/components/layout/top-bar.tsx",
                                lineNumber: 223,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ViewToggleBtn, {
                                icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$axis$2d$3d$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Axis3d$3e$__["Axis3d"], {
                                    className: "w-3.5 h-3.5"
                                }, void 0, false, {
                                    fileName: "[project]/components/layout/top-bar.tsx",
                                    lineNumber: 224,
                                    columnNumber: 32
                                }, this),
                                label: t.axes,
                                active: showAxes,
                                onClick: toggleAxes
                            }, void 0, false, {
                                fileName: "[project]/components/layout/top-bar.tsx",
                                lineNumber: 224,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ViewToggleBtn, {
                                icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$wifi$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Wifi$3e$__["Wifi"], {
                                    className: "w-3.5 h-3.5 rotate-90"
                                }, void 0, false, {
                                    fileName: "[project]/components/layout/top-bar.tsx",
                                    lineNumber: 225,
                                    columnNumber: 32
                                }, this),
                                label: t.wireframe,
                                active: showWireframe,
                                onClick: toggleWireframe
                            }, void 0, false, {
                                fileName: "[project]/components/layout/top-bar.tsx",
                                lineNumber: 225,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ViewToggleBtn, {
                                icon: allowCutPartSelection ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$lock$2d$open$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LockOpen$3e$__["LockOpen"], {
                                    className: "w-3.5 h-3.5"
                                }, void 0, false, {
                                    fileName: "[project]/components/layout/top-bar.tsx",
                                    lineNumber: 227,
                                    columnNumber: 43
                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$lock$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Lock$3e$__["Lock"], {
                                    className: "w-3.5 h-3.5"
                                }, void 0, false, {
                                    fileName: "[project]/components/layout/top-bar.tsx",
                                    lineNumber: 227,
                                    columnNumber: 82
                                }, this),
                                label: allowCutPartSelection ? `${t.parts_toggle} ✓` : t.parts_toggle,
                                active: allowCutPartSelection,
                                onClick: toggleCutPartSelection,
                                title: allowCutPartSelection ? 'Seleção de peças: LIBERADA' : 'Seleção de peças: BLOQUEADA'
                            }, void 0, false, {
                                fileName: "[project]/components/layout/top-bar.tsx",
                                lineNumber: 226,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/layout/top-bar.tsx",
                        lineNumber: 222,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex-1"
                    }, void 0, false, {
                        fileName: "[project]/components/layout/top-bar.tsx",
                        lineNumber: 236,
                        columnNumber: 9
                    }, this),
                    status === 'loading' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-2 mr-4 animate-fade-in",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "w-1.5 h-1.5 rounded-full animate-pulse",
                                style: {
                                    background: 'oklch(0.70 0.22 42)'
                                }
                            }, void 0, false, {
                                fileName: "[project]/components/layout/top-bar.tsx",
                                lineNumber: 241,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-xs font-mono text-muted-foreground",
                                children: t.loading_indicator
                            }, void 0, false, {
                                fileName: "[project]/components/layout/top-bar.tsx",
                                lineNumber: 242,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/layout/top-bar.tsx",
                        lineNumber: 240,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-1",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setConfigOpen(true),
                                className: "flex items-center gap-1.5 px-2 py-1 rounded text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors",
                                "aria-label": t.settings,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings$3e$__["Settings"], {
                                        className: "w-3.5 h-3.5"
                                    }, void 0, false, {
                                        fileName: "[project]/components/layout/top-bar.tsx",
                                        lineNumber: 253,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "font-mono text-[11px] hidden md:block",
                                        children: t.config
                                    }, void 0, false, {
                                        fileName: "[project]/components/layout/top-bar.tsx",
                                        lineNumber: 254,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/layout/top-bar.tsx",
                                lineNumber: 248,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "h-4 w-px bg-border mx-1"
                            }, void 0, false, {
                                fileName: "[project]/components/layout/top-bar.tsx",
                                lineNumber: 257,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setQuitOpen(true),
                                className: "flex items-center gap-1.5 px-2 py-1 rounded text-xs text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 transition-colors",
                                "aria-label": t.quit,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$log$2d$out$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LogOut$3e$__["LogOut"], {
                                        className: "w-3.5 h-3.5"
                                    }, void 0, false, {
                                        fileName: "[project]/components/layout/top-bar.tsx",
                                        lineNumber: 264,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "font-mono text-[11px] hidden md:block",
                                        children: t.quit
                                    }, void 0, false, {
                                        fileName: "[project]/components/layout/top-bar.tsx",
                                        lineNumber: 265,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/layout/top-bar.tsx",
                                lineNumber: 259,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/layout/top-bar.tsx",
                        lineNumber: 247,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/layout/top-bar.tsx",
                lineNumber: 118,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$layout$2f$config$2d$modal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ConfigModal"], {
                open: configOpen,
                onClose: ()=>setConfigOpen(false)
            }, void 0, false, {
                fileName: "[project]/components/layout/top-bar.tsx",
                lineNumber: 271,
                columnNumber: 7
            }, this),
            quitOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "fixed inset-0 z-50 flex items-center justify-center",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute inset-0 bg-black/60 backdrop-blur-sm",
                        onClick: ()=>setQuitOpen(false)
                    }, void 0, false, {
                        fileName: "[project]/components/layout/top-bar.tsx",
                        lineNumber: 276,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "relative flex flex-col gap-4 p-5 rounded-2xl border w-72 shadow-2xl",
                        style: {
                            background: 'oklch(0.09 0 0 / 98%)',
                            borderColor: 'oklch(0.22 0 0)',
                            boxShadow: '0 16px 64px oklch(0 0 0 / 70%)'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-col gap-1",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-sm font-mono font-semibold text-foreground",
                                        children: t.quit_title
                                    }, void 0, false, {
                                        fileName: "[project]/components/layout/top-bar.tsx",
                                        lineNumber: 286,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-xs font-mono text-muted-foreground",
                                        children: t.quit_message
                                    }, void 0, false, {
                                        fileName: "[project]/components/layout/top-bar.tsx",
                                        lineNumber: 287,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/layout/top-bar.tsx",
                                lineNumber: 285,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>setQuitOpen(false),
                                        className: "flex-1 px-3 py-2 rounded-lg text-xs font-mono border border-border text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors",
                                        children: t.quit_cancel
                                    }, void 0, false, {
                                        fileName: "[project]/components/layout/top-bar.tsx",
                                        lineNumber: 290,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: handleQuit,
                                        className: "flex-1 px-3 py-2 rounded-lg text-xs font-mono text-white bg-destructive hover:opacity-90 transition-opacity font-medium",
                                        children: t.quit_confirm
                                    }, void 0, false, {
                                        fileName: "[project]/components/layout/top-bar.tsx",
                                        lineNumber: 296,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/layout/top-bar.tsx",
                                lineNumber: 289,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/layout/top-bar.tsx",
                        lineNumber: 277,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/layout/top-bar.tsx",
                lineNumber: 275,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true);
}
_s(TopBar, "wy3CyYjzaWGAFR2M5cTwxFeQ1dc=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$lang$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useT"],
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"]
    ];
});
_c = TopBar;
function LogoMark() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
        width: "22",
        height: "22",
        viewBox: "0 0 22 22",
        fill: "none",
        className: "shrink-0",
        "aria-hidden": "true",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("polygon", {
                points: "11,1 21,6.5 21,15.5 11,21 1,15.5 1,6.5",
                stroke: "oklch(0.70 0.22 42)",
                strokeWidth: "1.5",
                fill: "none"
            }, void 0, false, {
                fileName: "[project]/components/layout/top-bar.tsx",
                lineNumber: 313,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                x1: "11",
                y1: "1",
                x2: "11",
                y2: "21",
                stroke: "oklch(0.70 0.22 42 / 40%)",
                strokeWidth: "1"
            }, void 0, false, {
                fileName: "[project]/components/layout/top-bar.tsx",
                lineNumber: 314,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                x1: "1",
                y1: "11",
                x2: "21",
                y2: "11",
                stroke: "oklch(0.70 0.22 42 / 40%)",
                strokeWidth: "1"
            }, void 0, false, {
                fileName: "[project]/components/layout/top-bar.tsx",
                lineNumber: 315,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("polygon", {
                points: "11,6 16,9 16,13 11,16 6,13 6,9",
                fill: "oklch(0.70 0.22 42)",
                opacity: "0.8"
            }, void 0, false, {
                fileName: "[project]/components/layout/top-bar.tsx",
                lineNumber: 316,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/layout/top-bar.tsx",
        lineNumber: 312,
        columnNumber: 5
    }, this);
}
_c1 = LogoMark;
function TopBarBtn({ icon, label, shortcut, onClick, disabled, highlight }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
        onClick: onClick,
        disabled: disabled,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('group relative flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono transition-all duration-150', disabled ? 'text-muted-foreground/30 cursor-not-allowed' : highlight ? 'text-background font-medium hover:opacity-90' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'),
        style: !disabled && highlight ? {
            background: 'oklch(0.70 0.22 42)',
            color: 'oklch(0.08 0 0)'
        } : undefined,
        title: shortcut ? `${label} (${shortcut})` : label,
        children: [
            icon,
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                children: label
            }, void 0, false, {
                fileName: "[project]/components/layout/top-bar.tsx",
                lineNumber: 347,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/layout/top-bar.tsx",
        lineNumber: 332,
        columnNumber: 5
    }, this);
}
_c2 = TopBarBtn;
function ViewToggleBtn({ icon, label, active, onClick, title }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
        onClick: onClick,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('flex items-center gap-1 px-2 py-1 rounded text-[11px] font-mono transition-all duration-150', active ? 'text-foreground bg-secondary' : 'text-muted-foreground/50 hover:text-muted-foreground hover:bg-secondary/50'),
        title: title ?? label,
        children: [
            icon,
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "hidden lg:block",
                children: label
            }, void 0, false, {
                fileName: "[project]/components/layout/top-bar.tsx",
                lineNumber: 373,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/layout/top-bar.tsx",
        lineNumber: 362,
        columnNumber: 5
    }, this);
}
_c3 = ViewToggleBtn;
var _c, _c1, _c2, _c3;
__turbopack_context__.k.register(_c, "TopBar");
__turbopack_context__.k.register(_c1, "LogoMark");
__turbopack_context__.k.register(_c2, "TopBarBtn");
__turbopack_context__.k.register(_c3, "ViewToggleBtn");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/layout/left-panel.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "LeftPanel",
    ()=>LeftPanel
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$mouse$2d$pointer$2d$click$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MousePointerClick$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/mouse-pointer-click.mjs [app-client] (ecmascript) <export default as MousePointerClick>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$scissors$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Scissors$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/scissors.mjs [app-client] (ecmascript) <export default as Scissors>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$rotate$2d$ccw$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RotateCcw$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/rotate-ccw.mjs [app-client] (ecmascript) <export default as RotateCcw>");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/store.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$lang$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/lang-store.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
function LeftPanel() {
    _s();
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$lang$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useT"])();
    const { activeTool, setActiveTool, modelMesh, resetAll, sharpAngle, setSharpAngle, cutMode, setCutMode } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"])();
    const TOOLS = [
        {
            id: 'select',
            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$mouse$2d$pointer$2d$click$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MousePointerClick$3e$__["MousePointerClick"], {
                className: "w-4 h-4"
            }, void 0, false, {
                fileName: "[project]/components/layout/left-panel.tsx",
                lineNumber: 23,
                columnNumber: 27
            }, this),
            label: 'Smart',
            description: t.tool_smart_desc
        },
        {
            id: 'cut',
            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$scissors$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Scissors$3e$__["Scissors"], {
                className: "w-4 h-4"
            }, void 0, false, {
                fileName: "[project]/components/layout/left-panel.tsx",
                lineNumber: 24,
                columnNumber: 27
            }, this),
            label: t.reset /* Corte label via i18n would be "Corte" but it's always English-ish "CORTE" */ ,
            description: t.tool_cut_desc
        }
    ];
    // Recalculate tools with translated descriptions
    const tools = [
        {
            id: 'select',
            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$mouse$2d$pointer$2d$click$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MousePointerClick$3e$__["MousePointerClick"], {
                className: "w-4 h-4"
            }, void 0, false, {
                fileName: "[project]/components/layout/left-panel.tsx",
                lineNumber: 29,
                columnNumber: 27
            }, this),
            label: 'Smart',
            description: t.tool_smart_desc
        },
        {
            id: 'cut',
            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$scissors$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Scissors$3e$__["Scissors"], {
                className: "w-4 h-4"
            }, void 0, false, {
                fileName: "[project]/components/layout/left-panel.tsx",
                lineNumber: 30,
                columnNumber: 27
            }, this),
            label: 'Corte',
            description: t.tool_cut_desc
        }
    ];
    const sensLabel = sharpAngle <= 5 ? t.sens_ultra : sharpAngle < 15 ? t.sens_restricted : sharpAngle < 35 ? t.sens_standard : sharpAngle < 55 ? t.sens_wide : t.sens_max;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("aside", {
        className: "flex flex-col items-center w-14 border-r py-3 gap-1 shrink-0",
        style: {
            background: 'oklch(0.08 0 0)',
            borderColor: 'oklch(0.14 0 0)'
        },
        "aria-label": "Ferramentas",
        children: [
            tools.map((tool)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ToolButton, {
                    id: tool.id,
                    icon: tool.icon,
                    label: tool.label,
                    description: tool.description,
                    active: activeTool === tool.id,
                    onClick: ()=>setActiveTool(tool.id),
                    disabled: tool.id !== 'select' && !modelMesh
                }, tool.id, false, {
                    fileName: "[project]/components/layout/left-panel.tsx",
                    lineNumber: 47,
                    columnNumber: 9
                }, this)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "w-8 h-px my-1",
                style: {
                    background: 'oklch(0.16 0 0)'
                }
            }, void 0, false, {
                fileName: "[project]/components/layout/left-panel.tsx",
                lineNumber: 60,
                columnNumber: 7
            }, this),
            activeTool === 'select' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-col items-center gap-1 w-full px-1.5",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-[7px] font-mono uppercase tracking-widest",
                        style: {
                            color: 'oklch(0.40 0 0)'
                        },
                        children: t.mode
                    }, void 0, false, {
                        fileName: "[project]/components/layout/left-panel.tsx",
                        lineNumber: 65,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-col gap-0.5 w-full",
                        children: [
                            'island',
                            'curvature'
                        ].map((mode)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setCutMode(mode),
                                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('w-full rounded-lg py-1 text-[8px] font-mono uppercase tracking-wider transition-all duration-150', cutMode === mode ? 'text-background font-semibold' : 'border text-muted-foreground/60 hover:text-muted-foreground'),
                                style: cutMode === mode ? {
                                    background: 'oklch(0.70 0.22 42)',
                                    borderColor: 'transparent'
                                } : {
                                    borderColor: 'oklch(0.18 0 0)'
                                },
                                "aria-pressed": cutMode === mode,
                                children: mode === 'island' ? t.part_mode : t.curv_mode
                            }, mode, false, {
                                fileName: "[project]/components/layout/left-panel.tsx",
                                lineNumber: 70,
                                columnNumber: 15
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/components/layout/left-panel.tsx",
                        lineNumber: 68,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "w-8 h-px my-1",
                        style: {
                            background: 'oklch(0.16 0 0)'
                        }
                    }, void 0, false, {
                        fileName: "[project]/components/layout/left-panel.tsx",
                        lineNumber: 91,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-col items-center gap-1.5 w-full",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-[7px] font-mono uppercase tracking-widest",
                                style: {
                                    color: 'oklch(0.40 0 0)'
                                },
                                children: t.sensitivity
                            }, void 0, false, {
                                fileName: "[project]/components/layout/left-panel.tsx",
                                lineNumber: 95,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "relative group flex flex-col items-center",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "range",
                                        min: 1,
                                        max: 150,
                                        step: 1,
                                        value: sharpAngle,
                                        onChange: (e)=>setSharpAngle(Number(e.target.value)),
                                        className: "cursor-pointer",
                                        style: {
                                            writingMode: 'vertical-lr',
                                            direction: 'rtl',
                                            height: '64px',
                                            width: '4px',
                                            accentColor: 'oklch(0.70 0.22 42)'
                                        },
                                        "aria-label": `${t.sensitivity} ${sharpAngle}°`
                                    }, void 0, false, {
                                        fileName: "[project]/components/layout/left-panel.tsx",
                                        lineNumber: 99,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "tool-tooltip whitespace-nowrap",
                                        children: [
                                            t.sensitivity,
                                            ": ",
                                            sharpAngle,
                                            "°",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                                                fileName: "[project]/components/layout/left-panel.tsx",
                                                lineNumber: 118,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-muted-foreground/60 text-[9px]",
                                                children: sensLabel
                                            }, void 0, false, {
                                                fileName: "[project]/components/layout/left-panel.tsx",
                                                lineNumber: 119,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/layout/left-panel.tsx",
                                        lineNumber: 116,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/layout/left-panel.tsx",
                                lineNumber: 98,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-[9px] font-mono tabular-nums font-medium",
                                style: {
                                    color: 'oklch(0.70 0.22 42)'
                                },
                                children: [
                                    sharpAngle,
                                    "°"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/layout/left-panel.tsx",
                                lineNumber: 122,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/layout/left-panel.tsx",
                        lineNumber: 94,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "w-8 h-px my-1",
                        style: {
                            background: 'oklch(0.16 0 0)'
                        }
                    }, void 0, false, {
                        fileName: "[project]/components/layout/left-panel.tsx",
                        lineNumber: 127,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/layout/left-panel.tsx",
                lineNumber: 64,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-1"
            }, void 0, false, {
                fileName: "[project]/components/layout/left-panel.tsx",
                lineNumber: 131,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "relative group",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: resetAll,
                        className: "flex flex-col items-center justify-center gap-1 w-12 h-12 rounded-xl text-muted-foreground/50 hover:text-foreground hover:bg-secondary/30 transition-all duration-150",
                        "aria-label": t.reset_tooltip,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$rotate$2d$ccw$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RotateCcw$3e$__["RotateCcw"], {
                                className: "w-4 h-4"
                            }, void 0, false, {
                                fileName: "[project]/components/layout/left-panel.tsx",
                                lineNumber: 140,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-[8px] font-mono uppercase tracking-wider leading-none",
                                children: t.reset
                            }, void 0, false, {
                                fileName: "[project]/components/layout/left-panel.tsx",
                                lineNumber: 141,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/layout/left-panel.tsx",
                        lineNumber: 135,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "tool-tooltip whitespace-nowrap",
                        children: t.reset_tooltip
                    }, void 0, false, {
                        fileName: "[project]/components/layout/left-panel.tsx",
                        lineNumber: 143,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/layout/left-panel.tsx",
                lineNumber: 134,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/layout/left-panel.tsx",
        lineNumber: 40,
        columnNumber: 5
    }, this);
}
_s(LeftPanel, "wIxaFgj74J1RdJXi7auM9R5DknQ=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$lang$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useT"],
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"]
    ];
});
_c = LeftPanel;
function ToolButton({ icon, label, description, active, onClick, disabled }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "relative group",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: onClick,
                disabled: disabled,
                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('tool-btn', active && 'active', disabled && 'opacity-25 cursor-not-allowed'),
                "aria-label": description,
                "aria-pressed": active,
                children: [
                    icon,
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-[8px] font-mono uppercase tracking-wider leading-none",
                        children: label
                    }, void 0, false, {
                        fileName: "[project]/components/layout/left-panel.tsx",
                        lineNumber: 170,
                        columnNumber: 9
                    }, this),
                    active && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r",
                        style: {
                            background: 'oklch(0.70 0.22 42)'
                        },
                        "aria-hidden": "true"
                    }, void 0, false, {
                        fileName: "[project]/components/layout/left-panel.tsx",
                        lineNumber: 172,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/layout/left-panel.tsx",
                lineNumber: 162,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "tool-tooltip",
                role: "tooltip",
                children: description
            }, void 0, false, {
                fileName: "[project]/components/layout/left-panel.tsx",
                lineNumber: 179,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/layout/left-panel.tsx",
        lineNumber: 161,
        columnNumber: 5
    }, this);
}
_c1 = ToolButton;
var _c, _c1;
__turbopack_context__.k.register(_c, "LeftPanel");
__turbopack_context__.k.register(_c1, "ToolButton");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/layout/right-panel.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "RightPanel",
    ()=>RightPanel
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/trash-2.mjs [app-client] (ecmascript) <export default as Trash2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-down.mjs [app-client] (ecmascript) <export default as ChevronDown>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-right.mjs [app-client] (ecmascript) <export default as ChevronRight>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$box$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/box.mjs [app-client] (ecmascript) <export default as Box>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layers$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Layers$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/layers.mjs [app-client] (ecmascript) <export default as Layers>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/eye.mjs [app-client] (ecmascript) <export default as Eye>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2d$off$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__EyeOff$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/eye-off.mjs [app-client] (ecmascript) <export default as EyeOff>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$lock$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Lock$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/lock.mjs [app-client] (ecmascript) <export default as Lock>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$lock$2d$open$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Unlock$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/lock-open.mjs [app-client] (ecmascript) <export default as Unlock>");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/store.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$lang$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/lang-store.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
function RightPanel() {
    _s();
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$lang$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useT"])();
    const { modelInfo, modelMesh, selectedFaceIndices, selectionState, unit, setUnit, parts, activePartId, setActivePartId, togglePartVisibility, togglePartLocked, renamePart, removePart, setCutParts, setModelMesh, pushHistory, setStatus } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"])();
    const [infoOpen, setInfoOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [selectionOpen, setSelectionOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [partsOpen, setPartsOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const hasSelection = selectedFaceIndices.size > 0 && selectionState === 'selected';
    const unitMultiplier = unit === 'cm' ? 0.1 : unit === 'm' ? 0.001 : unit === 'in' ? 0.0393701 : 1;
    const fmt = (val)=>(val * unitMultiplier).toFixed(2);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("aside", {
        className: "flex flex-col w-60 border-l border-border overflow-y-auto shrink-0",
        style: {
            background: 'oklch(0.09 0 0)'
        },
        "aria-label": t.properties,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "section-header flex items-center justify-between",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        children: t.properties
                    }, void 0, false, {
                        fileName: "[project]/components/layout/right-panel.tsx",
                        lineNumber: 34,
                        columnNumber: 9
                    }, this),
                    modelInfo && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-[9px] text-foreground/40 font-mono normal-case tracking-normal truncate max-w-28",
                        title: modelInfo.name,
                        children: modelInfo.name
                    }, void 0, false, {
                        fileName: "[project]/components/layout/right-panel.tsx",
                        lineNumber: 36,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/layout/right-panel.tsx",
                lineNumber: 33,
                columnNumber: 7
            }, this),
            !modelMesh && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-col items-center justify-center flex-1 gap-3 p-6 text-center",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$box$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__["Box"], {
                        className: "w-8 h-8 text-muted-foreground/20"
                    }, void 0, false, {
                        fileName: "[project]/components/layout/right-panel.tsx",
                        lineNumber: 44,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-xs text-muted-foreground/40 font-mono leading-relaxed",
                        children: [
                            t.no_model_line1,
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                                fileName: "[project]/components/layout/right-panel.tsx",
                                lineNumber: 46,
                                columnNumber: 31
                            }, this),
                            t.no_model_line2
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/layout/right-panel.tsx",
                        lineNumber: 45,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/layout/right-panel.tsx",
                lineNumber: 43,
                columnNumber: 9
            }, this),
            modelInfo && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Section, {
                title: t.model_section,
                open: infoOpen,
                onToggle: ()=>setInfoOpen(!infoOpen),
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(StatRow, {
                        label: t.vertices,
                        value: modelInfo.vertices.toLocaleString()
                    }, void 0, false, {
                        fileName: "[project]/components/layout/right-panel.tsx",
                        lineNumber: 53,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(StatRow, {
                        label: t.faces,
                        value: modelInfo.faces.toLocaleString()
                    }, void 0, false, {
                        fileName: "[project]/components/layout/right-panel.tsx",
                        lineNumber: 54,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(StatRow, {
                        label: t.file_size,
                        value: modelInfo.fileSize
                    }, void 0, false, {
                        fileName: "[project]/components/layout/right-panel.tsx",
                        lineNumber: 55,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "stat-row",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "stat-label",
                                children: t.unit
                            }, void 0, false, {
                                fileName: "[project]/components/layout/right-panel.tsx",
                                lineNumber: 57,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                value: unit,
                                onChange: (e)=>setUnit(e.target.value),
                                className: "text-xs font-mono bg-transparent text-foreground border-none outline-none cursor-pointer",
                                "aria-label": t.unit,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "mm",
                                        children: "mm"
                                    }, void 0, false, {
                                        fileName: "[project]/components/layout/right-panel.tsx",
                                        lineNumber: 64,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "cm",
                                        children: "cm"
                                    }, void 0, false, {
                                        fileName: "[project]/components/layout/right-panel.tsx",
                                        lineNumber: 65,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "m",
                                        children: "m"
                                    }, void 0, false, {
                                        fileName: "[project]/components/layout/right-panel.tsx",
                                        lineNumber: 66,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "in",
                                        children: "in"
                                    }, void 0, false, {
                                        fileName: "[project]/components/layout/right-panel.tsx",
                                        lineNumber: 67,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/layout/right-panel.tsx",
                                lineNumber: 58,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/layout/right-panel.tsx",
                        lineNumber: 56,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "pt-1 mt-1",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "stat-label mb-2",
                                children: t.dimensions
                            }, void 0, false, {
                                fileName: "[project]/components/layout/right-panel.tsx",
                                lineNumber: 71,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(DimensionBar, {
                                axis: "X",
                                value: fmt(modelInfo.width),
                                unit: unit,
                                color: "#ff3333"
                            }, void 0, false, {
                                fileName: "[project]/components/layout/right-panel.tsx",
                                lineNumber: 72,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(DimensionBar, {
                                axis: "Y",
                                value: fmt(modelInfo.height),
                                unit: unit,
                                color: "#33ff66"
                            }, void 0, false, {
                                fileName: "[project]/components/layout/right-panel.tsx",
                                lineNumber: 73,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(DimensionBar, {
                                axis: "Z",
                                value: fmt(modelInfo.depth),
                                unit: unit,
                                color: "#3366ff"
                            }, void 0, false, {
                                fileName: "[project]/components/layout/right-panel.tsx",
                                lineNumber: 74,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/layout/right-panel.tsx",
                        lineNumber: 70,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/layout/right-panel.tsx",
                lineNumber: 52,
                columnNumber: 9
            }, this),
            modelMesh && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Section, {
                title: t.smartcut_selection,
                open: selectionOpen,
                onToggle: ()=>setSelectionOpen(!selectionOpen),
                badge: hasSelection ? selectedFaceIndices.size.toLocaleString() : undefined,
                badgeColor: "orange",
                children: !hasSelection ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-[11px] text-muted-foreground/40 font-mono py-2",
                    children: t.click_to_select
                }, void 0, false, {
                    fileName: "[project]/components/layout/right-panel.tsx",
                    lineNumber: 88,
                    columnNumber: 13
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(StatRow, {
                            label: t.triangles,
                            value: selectedFaceIndices.size.toLocaleString(),
                            highlight: true
                        }, void 0, false, {
                            fileName: "[project]/components/layout/right-panel.tsx",
                            lineNumber: 91,
                            columnNumber: 15
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(StatRow, {
                            label: t.pct_of_model,
                            value: `${(selectedFaceIndices.size / (modelInfo?.faces ?? 1) * 100).toFixed(1)}%`
                        }, void 0, false, {
                            fileName: "[project]/components/layout/right-panel.tsx",
                            lineNumber: 92,
                            columnNumber: 15
                        }, this)
                    ]
                }, void 0, true)
            }, void 0, false, {
                fileName: "[project]/components/layout/right-panel.tsx",
                lineNumber: 80,
                columnNumber: 9
            }, this),
            parts.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Section, {
                title: t.parts,
                open: partsOpen,
                onToggle: ()=>setPartsOpen(!partsOpen),
                badge: String(parts.length),
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-col gap-0.5",
                        children: parts.map((part)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(PartRow, {
                                part: part,
                                isActive: part.id === activePartId,
                                onSelect: ()=>setActivePartId(part.id === activePartId ? null : part.id),
                                onToggleVisible: (e)=>{
                                    e.stopPropagation();
                                    togglePartVisibility(part.id);
                                },
                                onToggleLocked: (e)=>{
                                    e.stopPropagation();
                                    togglePartLocked(part.id);
                                },
                                onRename: (name)=>renamePart(part.id, name),
                                onDelete: (e)=>{
                                    e.stopPropagation();
                                    pushHistory();
                                    removePart(part.id);
                                    setStatus('loaded', `"${part.name}" removida.`);
                                }
                            }, part.id, false, {
                                fileName: "[project]/components/layout/right-panel.tsx",
                                lineNumber: 107,
                                columnNumber: 15
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/components/layout/right-panel.tsx",
                        lineNumber: 105,
                        columnNumber: 11
                    }, this),
                    activePartId && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-[10px] text-muted-foreground/40 font-mono mt-2 leading-relaxed",
                        children: t.isolation_hint
                    }, void 0, false, {
                        fileName: "[project]/components/layout/right-panel.tsx",
                        lineNumber: 125,
                        columnNumber: 13
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/layout/right-panel.tsx",
                lineNumber: 99,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-1"
            }, void 0, false, {
                fileName: "[project]/components/layout/right-panel.tsx",
                lineNumber: 132,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "px-3 py-2 border-t border-border flex items-center gap-2",
                style: {
                    background: 'oklch(0.08 0 0)'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layers$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Layers$3e$__["Layers"], {
                        className: "w-3 h-3 text-muted-foreground/30"
                    }, void 0, false, {
                        fileName: "[project]/components/layout/right-panel.tsx",
                        lineNumber: 135,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-[10px] font-mono text-muted-foreground/30 uppercase tracking-widest",
                        children: "Nativos Cut v1.0"
                    }, void 0, false, {
                        fileName: "[project]/components/layout/right-panel.tsx",
                        lineNumber: 136,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/layout/right-panel.tsx",
                lineNumber: 134,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/layout/right-panel.tsx",
        lineNumber: 28,
        columnNumber: 5
    }, this);
}
_s(RightPanel, "ASGgRJVk2nRrzp7WTii+wXUv980=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$lang$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useT"],
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"]
    ];
});
_c = RightPanel;
function PartRow({ part, isActive, onSelect, onToggleVisible, onToggleLocked, onRename, onDelete }) {
    _s1();
    const [editing, setEditing] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [editValue, setEditValue] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(part.name);
    const inputRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "PartRow.useEffect": ()=>{
            if (editing && inputRef.current) {
                inputRef.current.focus();
                inputRef.current.select();
            }
        }
    }["PartRow.useEffect"], [
        editing
    ]);
    const commitRename = ()=>{
        const trimmed = editValue.trim();
        if (trimmed && trimmed !== part.name) onRename(trimmed);
        else setEditValue(part.name);
        setEditing(false);
    };
    const isMainPart = part.parentId === null;
    const swatchColor = isMainPart ? 'oklch(0.50 0 0)' : 'oklch(0.70 0.22 42)';
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        onClick: onSelect,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('group flex items-center gap-1.5 px-2 py-1.5 rounded cursor-pointer transition-colors', isActive ? 'bg-secondary' : 'hover:bg-secondary/40', !part.visible && 'opacity-40'),
        style: isActive ? {
            borderLeft: `2px solid oklch(0.70 0.22 42)`,
            paddingLeft: '6px'
        } : {
            borderLeft: '2px solid transparent',
            paddingLeft: '6px'
        },
        title: part.locked ? `${part.name} (bloqueada)` : part.name,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: onToggleVisible,
                className: "shrink-0 text-muted-foreground/40 hover:text-foreground transition-colors",
                "aria-label": part.visible ? 'Ocultar' : 'Exibir',
                children: part.visible ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__["Eye"], {
                    className: "w-3 h-3"
                }, void 0, false, {
                    fileName: "[project]/components/layout/right-panel.tsx",
                    lineNumber: 178,
                    columnNumber: 25
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2d$off$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__EyeOff$3e$__["EyeOff"], {
                    className: "w-3 h-3"
                }, void 0, false, {
                    fileName: "[project]/components/layout/right-panel.tsx",
                    lineNumber: 178,
                    columnNumber: 55
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/layout/right-panel.tsx",
                lineNumber: 177,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "w-2 h-2 rounded-sm shrink-0",
                style: {
                    background: swatchColor
                },
                "aria-hidden": "true"
            }, void 0, false, {
                fileName: "[project]/components/layout/right-panel.tsx",
                lineNumber: 180,
                columnNumber: 7
            }, this),
            editing ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                ref: inputRef,
                value: editValue,
                onChange: (e)=>setEditValue(e.target.value),
                onBlur: commitRename,
                onKeyDown: (e)=>{
                    if (e.key === 'Enter') commitRename();
                    if (e.key === 'Escape') {
                        setEditValue(part.name);
                        setEditing(false);
                    }
                    ;
                    e.stopPropagation();
                },
                onClick: (e)=>e.stopPropagation(),
                className: "flex-1 min-w-0 bg-transparent text-[11px] font-mono text-foreground border-b border-foreground/30 outline-none"
            }, void 0, false, {
                fileName: "[project]/components/layout/right-panel.tsx",
                lineNumber: 182,
                columnNumber: 9
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('flex-1 min-w-0 truncate text-[11px] font-mono', isActive ? 'text-foreground' : 'text-foreground/70'),
                onDoubleClick: (e)=>{
                    e.stopPropagation();
                    setEditing(true);
                    setEditValue(part.name);
                },
                title: "Duplo clique para renomear",
                children: part.name
            }, void 0, false, {
                fileName: "[project]/components/layout/right-panel.tsx",
                lineNumber: 191,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: onToggleLocked,
                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('shrink-0 transition-colors', part.locked ? 'text-foreground/60' : 'text-muted-foreground/20 hover:text-muted-foreground/50 opacity-0 group-hover:opacity-100'),
                "aria-label": part.locked ? 'Desbloquear' : 'Bloquear',
                children: part.locked ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$lock$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Lock$3e$__["Lock"], {
                    className: "w-3 h-3"
                }, void 0, false, {
                    fileName: "[project]/components/layout/right-panel.tsx",
                    lineNumber: 196,
                    columnNumber: 24
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$lock$2d$open$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Unlock$3e$__["Unlock"], {
                    className: "w-3 h-3"
                }, void 0, false, {
                    fileName: "[project]/components/layout/right-panel.tsx",
                    lineNumber: 196,
                    columnNumber: 55
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/layout/right-panel.tsx",
                lineNumber: 195,
                columnNumber: 7
            }, this),
            !part.locked && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: onDelete,
                className: "shrink-0 text-muted-foreground/20 hover:text-destructive transition-colors opacity-0 group-hover:opacity-100",
                "aria-label": `Remover ${part.name}`,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__["Trash2"], {
                    className: "w-3 h-3"
                }, void 0, false, {
                    fileName: "[project]/components/layout/right-panel.tsx",
                    lineNumber: 200,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/layout/right-panel.tsx",
                lineNumber: 199,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/layout/right-panel.tsx",
        lineNumber: 171,
        columnNumber: 5
    }, this);
}
_s1(PartRow, "HxAQvMR3bU5h5V/IqbLHLKyOCuE=");
_c1 = PartRow;
function Section({ title, open, onToggle, children, badge, badgeColor = 'default' }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "border-b border-border/50",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: onToggle,
                className: "flex items-center justify-between w-full px-3 py-2 hover:bg-secondary/30 transition-colors",
                "aria-expanded": open,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-2",
                        children: [
                            open ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__["ChevronDown"], {
                                className: "w-3 h-3 text-muted-foreground/50"
                            }, void 0, false, {
                                fileName: "[project]/components/layout/right-panel.tsx",
                                lineNumber: 219,
                                columnNumber: 19
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__["ChevronRight"], {
                                className: "w-3 h-3 text-muted-foreground/50"
                            }, void 0, false, {
                                fileName: "[project]/components/layout/right-panel.tsx",
                                lineNumber: 219,
                                columnNumber: 82
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-[10px] font-mono uppercase tracking-widest text-muted-foreground",
                                children: title
                            }, void 0, false, {
                                fileName: "[project]/components/layout/right-panel.tsx",
                                lineNumber: 220,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/layout/right-panel.tsx",
                        lineNumber: 218,
                        columnNumber: 9
                    }, this),
                    badge && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('text-[10px] font-mono px-1.5 py-0.5 rounded', badgeColor === 'orange' ? 'text-background' : 'bg-secondary text-muted-foreground'),
                        style: badgeColor === 'orange' ? {
                            background: 'oklch(0.70 0.22 42)'
                        } : undefined,
                        children: badge
                    }, void 0, false, {
                        fileName: "[project]/components/layout/right-panel.tsx",
                        lineNumber: 223,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/layout/right-panel.tsx",
                lineNumber: 217,
                columnNumber: 7
            }, this),
            open && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "px-3 pb-3 animate-fade-in",
                children: children
            }, void 0, false, {
                fileName: "[project]/components/layout/right-panel.tsx",
                lineNumber: 228,
                columnNumber: 16
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/layout/right-panel.tsx",
        lineNumber: 216,
        columnNumber: 5
    }, this);
}
_c2 = Section;
function StatRow({ label, value, highlight }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "stat-row",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "stat-label",
                children: label
            }, void 0, false, {
                fileName: "[project]/components/layout/right-panel.tsx",
                lineNumber: 237,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('stat-value', highlight && 'font-bold'),
                style: highlight ? {
                    color: 'oklch(0.70 0.22 42)'
                } : undefined,
                children: value
            }, void 0, false, {
                fileName: "[project]/components/layout/right-panel.tsx",
                lineNumber: 238,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/layout/right-panel.tsx",
        lineNumber: 236,
        columnNumber: 5
    }, this);
}
_c3 = StatRow;
function DimensionBar({ axis, value, unit, color }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex items-center gap-2 py-0.5",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "text-[10px] font-mono font-bold w-3 shrink-0",
                style: {
                    color
                },
                children: axis
            }, void 0, false, {
                fileName: "[project]/components/layout/right-panel.tsx",
                lineNumber: 247,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-1 h-px bg-border"
            }, void 0, false, {
                fileName: "[project]/components/layout/right-panel.tsx",
                lineNumber: 248,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "text-[10px] font-mono text-foreground",
                children: [
                    value,
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-muted-foreground ml-0.5",
                        children: unit
                    }, void 0, false, {
                        fileName: "[project]/components/layout/right-panel.tsx",
                        lineNumber: 249,
                        columnNumber: 70
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/layout/right-panel.tsx",
                lineNumber: 249,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/layout/right-panel.tsx",
        lineNumber: 246,
        columnNumber: 5
    }, this);
}
_c4 = DimensionBar;
var _c, _c1, _c2, _c3, _c4;
__turbopack_context__.k.register(_c, "RightPanel");
__turbopack_context__.k.register(_c1, "PartRow");
__turbopack_context__.k.register(_c2, "Section");
__turbopack_context__.k.register(_c3, "StatRow");
__turbopack_context__.k.register(_c4, "DimensionBar");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/layout/status-bar.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "StatusBar",
    ()=>StatusBar
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/store.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$activity$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Activity$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/activity.mjs [app-client] (ecmascript) <export default as Activity>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$cpu$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Cpu$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/cpu.mjs [app-client] (ecmascript) <export default as Cpu>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$hard$2d$drive$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__HardDrive$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/hard-drive.mjs [app-client] (ecmascript) <export default as HardDrive>");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$lang$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/lang-store.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
function StatusBar() {
    _s();
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$lang$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useT"])();
    const { status, statusMessage, fps, unit, modelInfo, selectionState, selectedFaceIndices } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"])();
    const isError = status === 'error';
    const isLoading = status === 'loading';
    const isSelecting = selectionState === 'selecting';
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("footer", {
        className: "flex items-center h-7 px-4 border-t border-border gap-4 shrink-0 z-10",
        style: {
            background: 'oklch(0.07 0 0)'
        },
        "aria-label": "Barra de status",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-2 flex-1 min-w-0",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(StatusDot, {
                        status: status
                    }, void 0, false, {
                        fileName: "[project]/components/layout/status-bar.tsx",
                        lineNumber: 23,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('text-[11px] font-mono truncate', isError ? 'text-destructive' : 'text-muted-foreground'),
                        children: statusMessage
                    }, void 0, false, {
                        fileName: "[project]/components/layout/status-bar.tsx",
                        lineNumber: 24,
                        columnNumber: 9
                    }, this),
                    (isLoading || isSelecting) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex gap-0.5 items-center ml-1 shrink-0",
                        children: [
                            0,
                            1,
                            2
                        ].map((i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "w-1 h-1 rounded-full animate-bounce",
                                style: {
                                    background: 'oklch(0.70 0.22 42)',
                                    animationDelay: `${i * 0.15}s`,
                                    animationDuration: '0.8s'
                                },
                                "aria-hidden": "true"
                            }, i, false, {
                                fileName: "[project]/components/layout/status-bar.tsx",
                                lineNumber: 30,
                                columnNumber: 15
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/components/layout/status-bar.tsx",
                        lineNumber: 28,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/layout/status-bar.tsx",
                lineNumber: 22,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-4 shrink-0",
                children: [
                    modelInfo && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(StatusItem, {
                        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$hard$2d$drive$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__HardDrive$3e$__["HardDrive"], {
                            className: "w-2.5 h-2.5"
                        }, void 0, false, {
                            fileName: "[project]/components/layout/status-bar.tsx",
                            lineNumber: 43,
                            columnNumber: 29
                        }, this),
                        label: `${modelInfo.faces.toLocaleString()} ${t.tri_suffix}`
                    }, void 0, false, {
                        fileName: "[project]/components/layout/status-bar.tsx",
                        lineNumber: 43,
                        columnNumber: 11
                    }, this),
                    selectedFaceIndices.size > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(StatusItem, {
                        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "w-2 h-2 rounded-sm",
                            style: {
                                background: 'oklch(0.70 0.22 42)'
                            }
                        }, void 0, false, {
                            fileName: "[project]/components/layout/status-bar.tsx",
                            lineNumber: 46,
                            columnNumber: 29
                        }, this),
                        label: `${selectedFaceIndices.size.toLocaleString()} ${t.sel_suffix}`,
                        highlight: true
                    }, void 0, false, {
                        fileName: "[project]/components/layout/status-bar.tsx",
                        lineNumber: 46,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "h-3 w-px bg-border"
                    }, void 0, false, {
                        fileName: "[project]/components/layout/status-bar.tsx",
                        lineNumber: 48,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(StatusItem, {
                        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$cpu$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Cpu$3e$__["Cpu"], {
                            className: "w-2.5 h-2.5"
                        }, void 0, false, {
                            fileName: "[project]/components/layout/status-bar.tsx",
                            lineNumber: 49,
                            columnNumber: 27
                        }, this),
                        label: unit.toUpperCase()
                    }, void 0, false, {
                        fileName: "[project]/components/layout/status-bar.tsx",
                        lineNumber: 49,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-1",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$activity$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Activity$3e$__["Activity"], {
                                className: "w-2.5 h-2.5 text-muted-foreground/40",
                                "aria-hidden": "true"
                            }, void 0, false, {
                                fileName: "[project]/components/layout/status-bar.tsx",
                                lineNumber: 51,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('text-[11px] font-mono tabular-nums', fps >= 55 ? '' : fps >= 30 ? 'text-yellow-500' : 'text-destructive'),
                                style: fps >= 55 ? {
                                    color: 'oklch(0.70 0.22 42 / 80%)'
                                } : undefined,
                                children: fps
                            }, void 0, false, {
                                fileName: "[project]/components/layout/status-bar.tsx",
                                lineNumber: 52,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-[9px] font-mono text-muted-foreground/30",
                                children: "FPS"
                            }, void 0, false, {
                                fileName: "[project]/components/layout/status-bar.tsx",
                                lineNumber: 58,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/layout/status-bar.tsx",
                        lineNumber: 50,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "h-3 w-px bg-border"
                    }, void 0, false, {
                        fileName: "[project]/components/layout/status-bar.tsx",
                        lineNumber: 60,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-1 px-1.5 py-0.5 rounded border",
                        style: {
                            borderColor: 'oklch(0.70 0.22 42 / 20%)',
                            background: 'oklch(0.70 0.22 42 / 5%)'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "w-1.5 h-1.5 rounded-full",
                                style: {
                                    background: 'oklch(0.70 0.22 42)'
                                },
                                "aria-hidden": "true"
                            }, void 0, false, {
                                fileName: "[project]/components/layout/status-bar.tsx",
                                lineNumber: 62,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-[9px] font-mono uppercase tracking-widest",
                                style: {
                                    color: 'oklch(0.70 0.22 42 / 70%)'
                                },
                                children: "SmartCut"
                            }, void 0, false, {
                                fileName: "[project]/components/layout/status-bar.tsx",
                                lineNumber: 63,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/layout/status-bar.tsx",
                        lineNumber: 61,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/layout/status-bar.tsx",
                lineNumber: 41,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/layout/status-bar.tsx",
        lineNumber: 17,
        columnNumber: 5
    }, this);
}
_s(StatusBar, "WsaHYb6AyMKzW2vkiNlsaTl3F54=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$lang$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useT"],
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"]
    ];
});
_c = StatusBar;
function StatusDot({ status }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('w-1.5 h-1.5 rounded-full shrink-0', status === 'error' && 'bg-destructive', (status === 'loading' || status === 'cutting') && 'animate-pulse', status === 'idle' && 'bg-muted-foreground/30'),
        style: status !== 'error' && status !== 'idle' ? {
            background: 'oklch(0.70 0.22 42)'
        } : undefined,
        "aria-hidden": "true"
    }, void 0, false, {
        fileName: "[project]/components/layout/status-bar.tsx",
        lineNumber: 74,
        columnNumber: 5
    }, this);
}
_c1 = StatusDot;
function StatusItem({ icon, label, highlight }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex items-center gap-1",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "text-muted-foreground/40",
                "aria-hidden": "true",
                children: icon
            }, void 0, false, {
                fileName: "[project]/components/layout/status-bar.tsx",
                lineNumber: 86,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "text-[11px] font-mono",
                style: highlight ? {
                    color: 'oklch(0.70 0.22 42)'
                } : {
                    color: 'oklch(0.50 0 0)'
                },
                children: label
            }, void 0, false, {
                fileName: "[project]/components/layout/status-bar.tsx",
                lineNumber: 87,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/layout/status-bar.tsx",
        lineNumber: 85,
        columnNumber: 5
    }, this);
}
_c2 = StatusItem;
var _c, _c1, _c2;
__turbopack_context__.k.register(_c, "StatusBar");
__turbopack_context__.k.register(_c1, "StatusDot");
__turbopack_context__.k.register(_c2, "StatusItem");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>NativosCut
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$shared$2f$lib$2f$app$2d$dynamic$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/shared/lib/app-dynamic.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$layout$2f$top$2d$bar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/layout/top-bar.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$layout$2f$left$2d$panel$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/layout/left-panel.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$layout$2f$right$2d$panel$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/layout/right-panel.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$layout$2f$status$2d$bar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/layout/status-bar.tsx [app-client] (ecmascript)");
;
;
;
;
;
;
;
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
// ─── Lazy-loaded 3D & heavy components ───────────────────────────────────────
// Splitting these into separate chunks means the browser only downloads
// Three.js / R3F / BVH / CSG code AFTER the UI shell has already painted.
// ssr: false → these components use browser-only APIs (WebGL, canvas).
const Viewport3D = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$shared$2f$lib$2f$app$2d$dynamic$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(()=>__turbopack_context__.A("[project]/components/viewport/viewport-3d.tsx [app-client] (ecmascript, next/dynamic entry, async loader)").then((m)=>({
            default: m.Viewport3D
        })), {
    loadableGenerated: {
        modules: [
            "[project]/components/viewport/viewport-3d.tsx [app-client] (ecmascript, next/dynamic entry)"
        ]
    },
    ssr: false,
    // Placeholder so layout doesn't jump while the chunk loads
    loading: ()=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "absolute inset-0 bg-[#060608]"
        }, void 0, false, {
            fileName: "[project]/app/page.tsx",
            lineNumber: 20,
            columnNumber: 20
        }, ("TURBOPACK compile-time value", void 0))
});
_c = Viewport3D;
const CutActions = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$shared$2f$lib$2f$app$2d$dynamic$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(()=>__turbopack_context__.A("[project]/components/layout/cut-actions.tsx [app-client] (ecmascript, next/dynamic entry, async loader)").then((m)=>({
            default: m.CutActions
        })), {
    loadableGenerated: {
        modules: [
            "[project]/components/layout/cut-actions.tsx [app-client] (ecmascript, next/dynamic entry)"
        ]
    },
    ssr: false
});
_c1 = CutActions;
const SmartAutoCutPanel = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$shared$2f$lib$2f$app$2d$dynamic$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(()=>__turbopack_context__.A("[project]/components/layout/smart-autocut-panel.tsx [app-client] (ecmascript, next/dynamic entry, async loader)").then((m)=>({
            default: m.SmartAutoCutPanel
        })), {
    loadableGenerated: {
        modules: [
            "[project]/components/layout/smart-autocut-panel.tsx [app-client] (ecmascript, next/dynamic entry)"
        ]
    },
    ssr: false
});
_c2 = SmartAutoCutPanel;
const EncaixePanel = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$shared$2f$lib$2f$app$2d$dynamic$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(()=>__turbopack_context__.A("[project]/components/layout/encaixe-panel.tsx [app-client] (ecmascript, next/dynamic entry, async loader)").then((m)=>({
            default: m.EncaixePanel
        })), {
    loadableGenerated: {
        modules: [
            "[project]/components/layout/encaixe-panel.tsx [app-client] (ecmascript, next/dynamic entry)"
        ]
    },
    ssr: false
});
_c3 = EncaixePanel;
const PlaneCutPanel = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$shared$2f$lib$2f$app$2d$dynamic$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(()=>__turbopack_context__.A("[project]/components/layout/plane-cut-panel.tsx [app-client] (ecmascript, next/dynamic entry, async loader)").then((m)=>({
            default: m.PlaneCutPanel
        })), {
    loadableGenerated: {
        modules: [
            "[project]/components/layout/plane-cut-panel.tsx [app-client] (ecmascript, next/dynamic entry)"
        ]
    },
    ssr: false
});
_c4 = PlaneCutPanel;
const AutoSplitPanel = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$shared$2f$lib$2f$app$2d$dynamic$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(()=>__turbopack_context__.A("[project]/components/layout/auto-split-panel.tsx [app-client] (ecmascript, next/dynamic entry, async loader)").then((m)=>({
            default: m.AutoSplitPanel
        })), {
    loadableGenerated: {
        modules: [
            "[project]/components/layout/auto-split-panel.tsx [app-client] (ecmascript, next/dynamic entry)"
        ]
    },
    ssr: false
});
_c5 = AutoSplitPanel;
const ExportPanel = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$shared$2f$lib$2f$app$2d$dynamic$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(()=>__turbopack_context__.A("[project]/components/layout/export-panel.tsx [app-client] (ecmascript, next/dynamic entry, async loader)").then((m)=>({
            default: m.ExportPanel
        })), {
    loadableGenerated: {
        modules: [
            "[project]/components/layout/export-panel.tsx [app-client] (ecmascript, next/dynamic entry)"
        ]
    },
    ssr: false
});
_c6 = ExportPanel;
function NativosCut() {
    _s();
    const [exportOpen, setExportOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        className: "flex flex-col h-dvh w-screen overflow-hidden select-none",
        style: {
            background: 'oklch(0.08 0 0)'
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$layout$2f$top$2d$bar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TopBar"], {
                onExport: ()=>setExportOpen(true)
            }, void 0, false, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 64,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-1 overflow-hidden relative",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$layout$2f$left$2d$panel$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LeftPanel"], {}, void 0, false, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 69,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex-1 relative overflow-hidden",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Viewport3D, {}, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 73,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(CutActions, {}, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 75,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SmartAutoCutPanel, {}, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 77,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(EncaixePanel, {}, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 79,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(PlaneCutPanel, {}, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 81,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AutoSplitPanel, {}, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 83,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 72,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$layout$2f$right$2d$panel$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RightPanel"], {}, void 0, false, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 87,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 67,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$layout$2f$status$2d$bar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["StatusBar"], {}, void 0, false, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 91,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ExportPanel, {
                open: exportOpen,
                onClose: ()=>setExportOpen(false)
            }, void 0, false, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 94,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/page.tsx",
        lineNumber: 59,
        columnNumber: 5
    }, this);
}
_s(NativosCut, "7pGchmrcAPSfWjp/aS3b1efqbLI=");
_c7 = NativosCut;
var _c, _c1, _c2, _c3, _c4, _c5, _c6, _c7;
__turbopack_context__.k.register(_c, "Viewport3D");
__turbopack_context__.k.register(_c1, "CutActions");
__turbopack_context__.k.register(_c2, "SmartAutoCutPanel");
__turbopack_context__.k.register(_c3, "EncaixePanel");
__turbopack_context__.k.register(_c4, "PlaneCutPanel");
__turbopack_context__.k.register(_c5, "AutoSplitPanel");
__turbopack_context__.k.register(_c6, "ExportPanel");
__turbopack_context__.k.register(_c7, "NativosCut");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=_02bp7tb._.js.map