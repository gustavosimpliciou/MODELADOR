module.exports = [
"[project]/lib/parts-manager.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
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
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/three/build/three.core.js [app-ssr] (ecmascript)");
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
    return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MeshStandardMaterial"]({
        color: new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Color"]('#ff6600'),
        roughness: 0.6,
        metalness: 0.1,
        side: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DoubleSide"],
        flatShading: false
    });
}
function cloneMeshTransform(src, newGeo, newMat) {
    const m = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Mesh"](newGeo, newMat ?? src.material);
    m.castShadow = src.castShadow;
    m.receiveShadow = src.receiveShadow;
    m.position.copy(src.position);
    m.rotation.copy(src.rotation);
    m.scale.copy(src.scale);
    return m;
}
}),
"[project]/lib/i18n.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
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
}),
"[project]/lib/lang-store.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getT",
    ()=>getT,
    "useLangStore",
    ()=>useLangStore,
    "useT",
    ()=>useT
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/react.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$i18n$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/i18n.ts [app-ssr] (ecmascript)");
"use client";
;
;
const useLangStore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["create"])((set)=>({
        language: 'pt',
        setLanguage: (language)=>set({
                language
            })
    }));
function useT() {
    const language = useLangStore((s)=>s.language);
    return __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$i18n$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["translations"][language];
}
function getT() {
    return __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$i18n$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["translations"][useLangStore.getState().language];
}
}),
"[project]/lib/store.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useAppStore",
    ()=>useAppStore
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/react.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$parts$2d$manager$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/parts-manager.ts [app-ssr] (ecmascript)");
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
const useAppStore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["create"])((set, get)=>({
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
                const part = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$parts$2d$manager$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createPart"])(mesh, name.replace(/\.[^.]+$/, '') || 'Corpo Principal');
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
                const newPart = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$parts$2d$manager$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createPart"])(cutPart.mesh, cutPart.name, state.activePartId);
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
        const { getT } = __turbopack_context__.r("[project]/lib/lang-store.ts [app-ssr] (ecmascript)");
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
}),
"[project]/lib/model-loader.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "exportMesh",
    ()=>exportMesh,
    "loadModel",
    ()=>loadModel
]);
/**
 * Model Loader — Importação otimizada de modelos 3D
 * Suporte: STL, OBJ, GLB, GLTF, PLY
 * Otimizações:
 * - Leitura via ArrayBuffer (zero-copy)
 * - Decimação automática para modelos > DECIMATE_THRESHOLD triângulos
 * - mergeVertices para reduzir duplicatas e permitir índices
 * - computeBoundsTree via three-mesh-bvh para raycasting O(log n)
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/three/build/three.core.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$examples$2f$jsm$2f$loaders$2f$STLLoader$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/three/examples/jsm/loaders/STLLoader.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$examples$2f$jsm$2f$loaders$2f$OBJLoader$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/three/examples/jsm/loaders/OBJLoader.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$examples$2f$jsm$2f$loaders$2f$PLYLoader$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/three/examples/jsm/loaders/PLYLoader.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$examples$2f$jsm$2f$loaders$2f$GLTFLoader$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/three/examples/jsm/loaders/GLTFLoader.js [app-ssr] (ecmascript)");
;
;
;
;
;
/** Acima deste limite de triângulos, sugerir decimação */ const DECIMATE_THRESHOLD = 800_000;
async function loadModel(file) {
    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
    // Ler arquivo uma única vez como ArrayBuffer
    const buffer = await file.arrayBuffer();
    let geometry = null;
    if (ext === 'stl') {
        geometry = loadSTLFromBuffer(buffer);
    } else if (ext === 'obj') {
        geometry = await loadOBJFromText(buffer);
    } else if (ext === 'ply') {
        geometry = loadPLYFromBuffer(buffer);
    } else if (ext === 'glb' || ext === 'gltf') {
        geometry = await loadGLTFFromBuffer(buffer, file.name);
    } else {
        throw new Error(`Formato .${ext} não suportado.`);
    }
    if (!geometry) throw new Error('Falha ao carregar geometria.');
    // ── Garantir índices (mergeVertices reduz vértices duplicados e cria index) ──
    // Só para geometrias não-indexadas (STL binário típico)
    let faceCount = geometry.index ? geometry.index.count / 3 : geometry.getAttribute('position').count / 3;
    // Converter para indexado se não tiver índice (melhora performance do BVH)
    if (!geometry.index) {
        // Criar índices triviais — permite cache de adjacência e BVH
        const posAttr = geometry.getAttribute('position');
        const indices = new Uint32Array(posAttr.count);
        for(let i = 0; i < posAttr.count; i++)indices[i] = i;
        geometry.setIndex(new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BufferAttribute"](indices, 1));
    }
    // Decimação leve para modelos muito pesados
    let wasDecimated = false;
    if (faceCount > DECIMATE_THRESHOLD) {
        geometry = decimateGeometry(geometry, DECIMATE_THRESHOLD);
        wasDecimated = true;
        faceCount = geometry.index ? geometry.index.count / 3 : geometry.getAttribute('position').count / 3;
    }
    // Normais e bounding
    geometry.computeVertexNormals();
    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();
    // Centralizar
    const box = geometry.boundingBox;
    const center = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector3"]();
    box.getCenter(center);
    geometry.translate(-center.x, -center.y, -center.z);
    // Recalcular bounds após translação
    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();
    // Material — aparência de peça SÓLIDA (chapada), não de casca.
    // • side: FrontSide → backface culling. Como o modelo é um sólido fechado,
    //   ver só as faces frontais faz a peça parecer maciça (sem enxergar as
    //   paredes internas, o que dava o efeito de "casca de papel" com DoubleSide).
    // • flatShading → cada face recebe sua própria normal (facetado), leitura
    //   típica de peça física / preparação para impressão 3D, em vez do brilho
    //   suave que fazia chapas planas parecerem finas.
    const material = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MeshStandardMaterial"]({
        color: new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Color"](0x888888),
        roughness: 0.6,
        metalness: 0.1,
        // DoubleSide garante que modelos com normais invertidas (winding incorreto)
        // ainda apareçam visíveis — correção crítica para compatibilidade geral.
        side: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DoubleSide"],
        flatShading: true
    });
    const mesh = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Mesh"](geometry, material);
    mesh.name = file.name;
    // Sem castShadow/receiveShadow — não usamos sombras para CAD
    // Informações do modelo
    const size = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector3"]();
    geometry.boundingBox.getSize(size);
    const posAttr = geometry.getAttribute('position');
    const info = {
        name: file.name,
        vertices: posAttr.count,
        faces: faceCount,
        width: parseFloat(size.x.toFixed(2)),
        height: parseFloat(size.y.toFixed(2)),
        depth: parseFloat(size.z.toFixed(2)),
        fileSize: formatFileSize(file.size)
    };
    return {
        mesh,
        info,
        wasDecimated
    };
}
// ─── Loaders sincronos / assíncronos usando buffer direto ─────────────────
function loadSTLFromBuffer(buffer) {
    const loader = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$examples$2f$jsm$2f$loaders$2f$STLLoader$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["STLLoader"]();
    return loader.parse(buffer);
}
async function loadOBJFromText(buffer) {
    const text = new TextDecoder().decode(buffer);
    const loader = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$examples$2f$jsm$2f$loaders$2f$OBJLoader$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["OBJLoader"]();
    const obj = loader.parse(text);
    const geometries = [];
    obj.traverse((child)=>{
        if (child.isMesh) {
            const m = child;
            const g = m.geometry.clone();
            g.applyMatrix4(m.matrixWorld);
            geometries.push(g);
        }
    });
    if (geometries.length === 0) throw new Error('Nenhuma geometria encontrada no OBJ.');
    if (geometries.length === 1) return geometries[0];
    return mergeGeometriesFast(geometries);
}
function loadPLYFromBuffer(buffer) {
    const loader = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$examples$2f$jsm$2f$loaders$2f$PLYLoader$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PLYLoader"]();
    return loader.parse(buffer);
}
async function loadGLTFFromBuffer(buffer, filename) {
    return new Promise((resolve, reject)=>{
        const loader = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$examples$2f$jsm$2f$loaders$2f$GLTFLoader$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["GLTFLoader"]();
        const ext = filename.split('.').pop()?.toLowerCase();
        loader.parse(buffer, '', (gltf)=>{
            const geometries = [];
            gltf.scene.traverse((child)=>{
                if (child.isMesh) {
                    const m = child;
                    const g = m.geometry.clone();
                    g.applyMatrix4(child.matrixWorld);
                    geometries.push(g);
                }
            });
            if (geometries.length === 0) {
                reject(new Error('Nenhuma geometria encontrada.'));
                return;
            }
            resolve(geometries.length === 1 ? geometries[0] : mergeGeometriesFast(geometries));
        }, reject);
    });
}
// ─── Merge de geometrias com typed arrays ─────────────────────────────────
function mergeGeometriesFast(geos) {
    let totalVerts = 0;
    let totalIdx = 0;
    for (const g of geos){
        const p = g.getAttribute('position');
        totalVerts += p.count;
        totalIdx += g.index ? g.index.count : p.count;
    }
    const positions = new Float32Array(totalVerts * 3);
    const normals = new Float32Array(totalVerts * 3);
    const indices = new Uint32Array(totalIdx);
    let vOff = 0;
    let iOff = 0;
    for (const g of geos){
        const p = g.getAttribute('position');
        const n = g.getAttribute('normal');
        const idx = g.index;
        for(let i = 0; i < p.count; i++){
            const d = (vOff + i) * 3;
            positions[d] = p.getX(i);
            positions[d + 1] = p.getY(i);
            positions[d + 2] = p.getZ(i);
            if (n) {
                normals[d] = n.getX(i);
                normals[d + 1] = n.getY(i);
                normals[d + 2] = n.getZ(i);
            }
        }
        if (idx) {
            for(let i = 0; i < idx.count; i++)indices[iOff++] = idx.getX(i) + vOff;
        } else {
            for(let i = 0; i < p.count; i++)indices[iOff++] = i + vOff;
        }
        vOff += p.count;
    }
    const merged = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BufferGeometry"]();
    merged.setAttribute('position', new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BufferAttribute"](positions, 3));
    merged.setAttribute('normal', new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BufferAttribute"](normals, 3));
    merged.setIndex(new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BufferAttribute"](indices, 1));
    return merged;
}
// ─── Decimação simples por stride (preserva estrutura, reduz carga) ────────
function decimateGeometry(geo, targetFaces) {
    const indexAttr = geo.index;
    const posAttr = geo.getAttribute('position');
    const faceCount = indexAttr ? indexAttr.count / 3 : posAttr.count / 3;
    const keepEvery = Math.ceil(faceCount / targetFaces);
    const newPositions = [];
    const newNormals = [];
    const newIndices = [];
    const normalAttr = geo.getAttribute('normal');
    let vi = 0;
    for(let f = 0; f < faceCount; f += keepEvery){
        const base = f * 3;
        const a = indexAttr ? indexAttr.getX(base) : base;
        const b = indexAttr ? indexAttr.getX(base + 1) : base + 1;
        const c = indexAttr ? indexAttr.getX(base + 2) : base + 2;
        for (const v of [
            a,
            b,
            c
        ]){
            newPositions.push(posAttr.getX(v), posAttr.getY(v), posAttr.getZ(v));
            if (normalAttr) {
                newNormals.push(normalAttr.getX(v), normalAttr.getY(v), normalAttr.getZ(v));
            }
        }
        newIndices.push(vi, vi + 1, vi + 2);
        vi += 3;
    }
    const dec = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BufferGeometry"]();
    dec.setAttribute('position', new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Float32BufferAttribute"](newPositions, 3));
    if (newNormals.length > 0) {
        dec.setAttribute('normal', new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Float32BufferAttribute"](newNormals, 3));
    }
    dec.setIndex(newIndices);
    return dec;
}
async function exportMesh(mesh, format = 'stl', filename = 'model') {
    if (format === 'stl') {
        const { STLExporter } = await __turbopack_context__.A("[project]/node_modules/three/examples/jsm/exporters/STLExporter.js [app-ssr] (ecmascript, async loader)");
        const result = new STLExporter().parse(mesh, {
            binary: true
        });
        downloadBlob(new Blob([
            result
        ], {
            type: 'application/octet-stream'
        }), `${filename}.stl`);
    } else {
        const { OBJExporter } = await __turbopack_context__.A("[project]/node_modules/three/examples/jsm/exporters/OBJExporter.js [app-ssr] (ecmascript, async loader)");
        const result = new OBJExporter().parse(mesh);
        downloadBlob(new Blob([
            result
        ], {
            type: 'text/plain'
        }), `${filename}.obj`);
    }
}
function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    setTimeout(()=>URL.revokeObjectURL(url), 1000);
}
function formatFileSize(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
}),
"[project]/lib/open-file.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "openFile",
    ()=>openFile
]);
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
 */ const ACCEPTED = '.stl,.obj,.ply,.glb,.gltf';
const ACCEPTED_TYPES = [
    {
        description: 'Modelos 3D (STL, OBJ, PLY, GLB, GLTF)',
        accept: {
            'application/octet-stream': [
                '.stl',
                '.glb',
                '.ply'
            ],
            'model/obj': [
                '.obj'
            ],
            'model/gltf+json': [
                '.gltf'
            ]
        }
    }
];
function openFile() {
    // ── Método 1: File System Access API (Chrome 86+, Edge 86+) ──────────────
    if (("TURBOPACK compile-time value", "undefined") !== 'undefined' && 'showOpenFilePicker' in window) //TURBOPACK unreachable
    ;
    // ── Método 2: input programático fora do React ────────────────────────────
    return new Promise((resolve, reject)=>{
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = ACCEPTED;
        // Posicionado fora da tela, mas VISÍVEL para o browser (necessário em Safari)
        input.style.cssText = 'position:fixed;top:-200px;left:-200px;width:1px;height:1px;opacity:0.01;';
        document.body.appendChild(input);
        const cleanup = ()=>{
            try {
                document.body.removeChild(input);
            } catch  {}
        };
        input.addEventListener('change', ()=>{
            const file = input.files?.[0];
            cleanup();
            if (file) resolve(file);
            else reject(new Error('Nenhum arquivo selecionado'));
        }, {
            once: true
        });
        // Safari/Firefox: dispara 'cancel' quando o usuário fecha sem selecionar
        input.addEventListener('cancel', ()=>{
            cleanup();
            reject(new DOMException('Cancelled', 'AbortError'));
        }, {
            once: true
        });
        // Timeout de segurança: se em 5 min nada acontecer, limpa
        const timeout = setTimeout(()=>{
            cleanup();
            reject(new Error('Timeout'));
        }, 300_000);
        input.addEventListener('change', ()=>clearTimeout(timeout), {
            once: true
        });
        input.addEventListener('cancel', ()=>clearTimeout(timeout), {
            once: true
        });
        input.click();
    });
}
}),
"[project]/lib/utils.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "cn",
    ()=>cn
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/clsx/dist/clsx.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/tailwind-merge/dist/bundle-mjs.mjs [app-ssr] (ecmascript)");
;
;
function cn(...inputs) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["twMerge"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["clsx"])(inputs));
}
}),
"[project]/components/layout/config-modal.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ConfigModal",
    ()=>ConfigModal
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.mjs [app-ssr] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$globe$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Globe$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/globe.mjs [app-ssr] (ecmascript) <export default as Globe>");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$lang$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/lang-store.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils.ts [app-ssr] (ecmascript)");
"use client";
;
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
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$lang$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useT"])();
    const { language, setLanguage } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$lang$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useLangStore"])();
    const overlayRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    // Close on Escape
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!open) return;
        const onKey = (e)=>{
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', onKey);
        return ()=>window.removeEventListener('keydown', onKey);
    }, [
        open,
        onClose
    ]);
    if (!open) return null;
    const langLabels = {
        pt: t.portuguese,
        en: t.english,
        es: t.spanish
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                ref: overlayRef,
                className: "fixed inset-0 z-50",
                onClick: onClose
            }, void 0, false, {
                fileName: "[project]/components/layout/config-modal.tsx",
                lineNumber: 44,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "fixed z-50 top-14 right-4 w-64 rounded-2xl border shadow-2xl",
                style: {
                    background: 'oklch(0.09 0 0 / 98%)',
                    backdropFilter: 'blur(24px) saturate(1.4)',
                    borderColor: 'oklch(0.22 0 0)',
                    boxShadow: '0 12px 48px oklch(0 0 0 / 60%), inset 0 1px 0 oklch(1 0 0 / 5%)'
                },
                onClick: (e)=>e.stopPropagation(),
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center justify-between px-4 py-3 border-b",
                        style: {
                            borderColor: 'oklch(0.16 0 0)'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-[11px] font-mono uppercase tracking-widest text-muted-foreground",
                                children: t.settings
                            }, void 0, false, {
                                fileName: "[project]/components/layout/config-modal.tsx",
                                lineNumber: 66,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: onClose,
                                className: "text-muted-foreground/50 hover:text-foreground transition-colors p-0.5 rounded",
                                "aria-label": t.close,
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
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
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "p-4 flex flex-col gap-4",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-col gap-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-1.5",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$globe$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Globe$3e$__["Globe"], {
                                            className: "w-3 h-3 text-muted-foreground/60"
                                        }, void 0, false, {
                                            fileName: "[project]/components/layout/config-modal.tsx",
                                            lineNumber: 83,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
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
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex flex-col gap-1",
                                    children: LANGS.map(({ id, flag })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>setLanguage(id),
                                            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])('flex items-center gap-3 w-full px-3 py-2 rounded-lg text-left transition-all border', language === id ? 'text-background font-medium border-transparent' : 'text-muted-foreground border-border/50 hover:text-foreground hover:bg-secondary/50'),
                                            style: language === id ? {
                                                background: 'oklch(0.70 0.22 42)',
                                                borderColor: 'transparent'
                                            } : undefined,
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-base leading-none",
                                                    children: flag
                                                }, void 0, false, {
                                                    fileName: "[project]/components/layout/config-modal.tsx",
                                                    lineNumber: 105,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-xs font-mono",
                                                    children: langLabels[id]
                                                }, void 0, false, {
                                                    fileName: "[project]/components/layout/config-modal.tsx",
                                                    lineNumber: 106,
                                                    columnNumber: 19
                                                }, this),
                                                language === id && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
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
}),
"[project]/components/layout/top-bar.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "TopBar",
    ()=>TopBar
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$folder$2d$open$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FolderOpen$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/folder-open.mjs [app-ssr] (ecmascript) <export default as FolderOpen>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$download$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Download$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/download.mjs [app-ssr] (ecmascript) <export default as Download>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/settings.mjs [app-ssr] (ecmascript) <export default as Settings>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$grid$2d$3x3$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Grid3x3$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/grid-3x3.mjs [app-ssr] (ecmascript) <export default as Grid3x3>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$axis$2d$3d$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Axis3d$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/axis-3d.mjs [app-ssr] (ecmascript) <export default as Axis3d>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$wifi$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Wifi$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/wifi.mjs [app-ssr] (ecmascript) <export default as Wifi>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$lock$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Lock$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/lock.mjs [app-ssr] (ecmascript) <export default as Lock>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$lock$2d$open$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__LockOpen$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/lock-open.mjs [app-ssr] (ecmascript) <export default as LockOpen>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$log$2d$out$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__LogOut$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/log-out.mjs [app-ssr] (ecmascript) <export default as LogOut>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$b389eeca$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__m__as__invalidate$3e$__ = __turbopack_context__.i("[project]/node_modules/@react-three/fiber/dist/events-b389eeca.esm.js [app-ssr] (ecmascript) <export m as invalidate>");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/store.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$model$2d$loader$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/model-loader.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$open$2d$file$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/open-file.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$lang$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/lang-store.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$layout$2f$config$2d$modal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/layout/config-modal.tsx [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
;
;
;
;
;
function TopBar({ onExport }) {
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$lang$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useT"])();
    const { setStatus, registerModelAsPart, setModelInfo, setOriginalGeometry, modelMesh, showGrid, showAxes, showWireframe, toggleGrid, toggleAxes, toggleWireframe, allowCutPartSelection, toggleCutPartSelection, status } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAppStore"])();
    const [configOpen, setConfigOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [quitOpen, setQuitOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    // ── Processamento do arquivo ─────────────────────────────────────────────────
    const processFile = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async (file)=>{
        setStatus('loading', t.loading_file(file.name));
        try {
            const { mesh, info, wasDecimated } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$model$2d$loader$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["loadModel"])(file);
            registerModelAsPart(mesh, info.name);
            setModelInfo(info);
            setOriginalGeometry(mesh.geometry.clone());
            const decimNote = wasDecimated ? t.decimated_note : '';
            setStatus('loaded', t.loaded_file(info.name, decimNote));
            // Garantir que o canvas renderize o novo modelo (frameloop="demand" precisa
            // de invalidate() explícito; chamamos em cascata para cobrir variações de timing)
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$b389eeca$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__m__as__invalidate$3e$__["invalidate"])();
            setTimeout(()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$b389eeca$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__m__as__invalidate$3e$__["invalidate"])(), 50);
            setTimeout(()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$b389eeca$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__m__as__invalidate$3e$__["invalidate"])(), 200);
            setTimeout(()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$b389eeca$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__m__as__invalidate$3e$__["invalidate"])(), 600);
        } catch (err) {
            console.error('[Cortes] Erro ao carregar modelo:', err);
            setStatus('error', t.load_error(err?.message ?? 'Erro desconhecido'));
        }
    }, [
        setStatus,
        registerModelAsPart,
        setModelInfo,
        setOriginalGeometry,
        t
    ]);
    // ── Handler do botão Abrir ────────────────────────────────────────────────────
    // Usa openFile() de lib/open-file.ts — mesma estratégia robusta do Ctrl+O.
    // Tenta File System Access API (Chrome/Edge), cai para input programático.
    // Deve ser chamado DIRETAMENTE de um handler de clique (user gesture ativo).
    const handleOpenClick = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$open$2d$file$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["openFile"])().then((file)=>processFile(file)).catch((err)=>{
            // AbortError = usuário cancelou o seletor — não é erro
            if (err?.name === 'AbortError' || err?.message === 'Cancelled' || err?.message === 'Timeout') return;
            setStatus('error', t.load_error(err?.message ?? 'Erro desconhecido'));
        });
    }, [
        processFile,
        setStatus,
        t
    ]);
    // ── Quit — faz logout e volta para o login da aplicação principal ────────────
    const handleQuit = ()=>{
        setQuitOpen(false);
        // Resetar estado local
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAppStore"].getState().resetAll();
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAppStore"].setState({
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
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                className: "flex items-center h-11 px-4 border-b border-border shrink-0 z-10",
                style: {
                    background: 'oklch(0.08 0 0)'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>{
                            window.location.href = '/';
                        },
                        className: "flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono transition-all duration-150 text-muted-foreground hover:text-foreground hover:bg-secondary mr-3",
                        title: "Voltar ao Nativos Studio",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                width: "13",
                                height: "13",
                                viewBox: "0 0 24 24",
                                fill: "none",
                                stroke: "currentColor",
                                strokeWidth: "2",
                                strokeLinecap: "round",
                                strokeLinejoin: "round",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                    d: "M19 12H5M12 5l-7 7 7 7"
                                }, void 0, false, {
                                    fileName: "[project]/components/layout/top-bar.tsx",
                                    lineNumber: 123,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/layout/top-bar.tsx",
                                lineNumber: 122,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "hidden md:block",
                                children: "Studio"
                            }, void 0, false, {
                                fileName: "[project]/components/layout/top-bar.tsx",
                                lineNumber: 125,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/layout/top-bar.tsx",
                        lineNumber: 117,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-2.5 mr-6",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(LogoMark, {}, void 0, false, {
                                fileName: "[project]/components/layout/top-bar.tsx",
                                lineNumber: 130,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-col leading-none",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-sm font-bold tracking-tight text-foreground uppercase font-mono",
                                        children: "NATIVOS"
                                    }, void 0, false, {
                                        fileName: "[project]/components/layout/top-bar.tsx",
                                        lineNumber: 132,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-[10px] font-mono tracking-widest",
                                        style: {
                                            color: 'oklch(0.70 0.22 42)'
                                        },
                                        children: "CUT"
                                    }, void 0, false, {
                                        fileName: "[project]/components/layout/top-bar.tsx",
                                        lineNumber: 135,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/layout/top-bar.tsx",
                                lineNumber: 131,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "ml-1 px-1.5 py-0.5 rounded text-[9px] font-mono uppercase tracking-wider border",
                                style: {
                                    color: 'oklch(0.70 0.22 42)',
                                    borderColor: 'oklch(0.70 0.22 42 / 30%)',
                                    background: 'oklch(0.70 0.22 42 / 8%)'
                                },
                                children: "PRO"
                            }, void 0, false, {
                                fileName: "[project]/components/layout/top-bar.tsx",
                                lineNumber: 139,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/layout/top-bar.tsx",
                        lineNumber: 129,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "h-6 w-px bg-border mr-4"
                    }, void 0, false, {
                        fileName: "[project]/components/layout/top-bar.tsx",
                        lineNumber: 152,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-1",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: handleOpenClick,
                                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])('group relative flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono transition-all duration-150 cursor-pointer select-none', !modelMesh ? 'text-background font-medium hover:opacity-90' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'),
                                style: !modelMesh ? {
                                    background: 'oklch(0.70 0.22 42)',
                                    color: 'oklch(0.08 0 0)'
                                } : undefined,
                                title: `${t.open} (Ctrl+O)`,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$folder$2d$open$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FolderOpen$3e$__["FolderOpen"], {
                                        className: "w-3.5 h-3.5"
                                    }, void 0, false, {
                                        fileName: "[project]/components/layout/top-bar.tsx",
                                        lineNumber: 168,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: t.open
                                    }, void 0, false, {
                                        fileName: "[project]/components/layout/top-bar.tsx",
                                        lineNumber: 169,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/layout/top-bar.tsx",
                                lineNumber: 157,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(TopBarBtn, {
                                icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$download$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Download$3e$__["Download"], {
                                    className: "w-3.5 h-3.5"
                                }, void 0, false, {
                                    fileName: "[project]/components/layout/top-bar.tsx",
                                    lineNumber: 173,
                                    columnNumber: 19
                                }, this),
                                label: t.export,
                                shortcut: "Ctrl+E",
                                disabled: !modelMesh,
                                onClick: onExport
                            }, void 0, false, {
                                fileName: "[project]/components/layout/top-bar.tsx",
                                lineNumber: 172,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/layout/top-bar.tsx",
                        lineNumber: 155,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "h-6 w-px bg-border mx-3"
                    }, void 0, false, {
                        fileName: "[project]/components/layout/top-bar.tsx",
                        lineNumber: 182,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-1",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(ViewToggleBtn, {
                                icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$grid$2d$3x3$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Grid3x3$3e$__["Grid3x3"], {
                                    className: "w-3.5 h-3.5"
                                }, void 0, false, {
                                    fileName: "[project]/components/layout/top-bar.tsx",
                                    lineNumber: 186,
                                    columnNumber: 32
                                }, this),
                                label: t.grid,
                                active: showGrid,
                                onClick: toggleGrid
                            }, void 0, false, {
                                fileName: "[project]/components/layout/top-bar.tsx",
                                lineNumber: 186,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(ViewToggleBtn, {
                                icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$axis$2d$3d$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Axis3d$3e$__["Axis3d"], {
                                    className: "w-3.5 h-3.5"
                                }, void 0, false, {
                                    fileName: "[project]/components/layout/top-bar.tsx",
                                    lineNumber: 187,
                                    columnNumber: 32
                                }, this),
                                label: t.axes,
                                active: showAxes,
                                onClick: toggleAxes
                            }, void 0, false, {
                                fileName: "[project]/components/layout/top-bar.tsx",
                                lineNumber: 187,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(ViewToggleBtn, {
                                icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$wifi$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Wifi$3e$__["Wifi"], {
                                    className: "w-3.5 h-3.5 rotate-90"
                                }, void 0, false, {
                                    fileName: "[project]/components/layout/top-bar.tsx",
                                    lineNumber: 188,
                                    columnNumber: 32
                                }, this),
                                label: t.wireframe,
                                active: showWireframe,
                                onClick: toggleWireframe
                            }, void 0, false, {
                                fileName: "[project]/components/layout/top-bar.tsx",
                                lineNumber: 188,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(ViewToggleBtn, {
                                icon: allowCutPartSelection ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$lock$2d$open$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__LockOpen$3e$__["LockOpen"], {
                                    className: "w-3.5 h-3.5"
                                }, void 0, false, {
                                    fileName: "[project]/components/layout/top-bar.tsx",
                                    lineNumber: 190,
                                    columnNumber: 43
                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$lock$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Lock$3e$__["Lock"], {
                                    className: "w-3.5 h-3.5"
                                }, void 0, false, {
                                    fileName: "[project]/components/layout/top-bar.tsx",
                                    lineNumber: 190,
                                    columnNumber: 82
                                }, this),
                                label: allowCutPartSelection ? `${t.parts_toggle} ✓` : t.parts_toggle,
                                active: allowCutPartSelection,
                                onClick: toggleCutPartSelection,
                                title: allowCutPartSelection ? 'Seleção de peças: LIBERADA' : 'Seleção de peças: BLOQUEADA'
                            }, void 0, false, {
                                fileName: "[project]/components/layout/top-bar.tsx",
                                lineNumber: 189,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/layout/top-bar.tsx",
                        lineNumber: 185,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex-1"
                    }, void 0, false, {
                        fileName: "[project]/components/layout/top-bar.tsx",
                        lineNumber: 199,
                        columnNumber: 9
                    }, this),
                    status === 'loading' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-2 mr-4 animate-fade-in",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "w-1.5 h-1.5 rounded-full animate-pulse",
                                style: {
                                    background: 'oklch(0.70 0.22 42)'
                                }
                            }, void 0, false, {
                                fileName: "[project]/components/layout/top-bar.tsx",
                                lineNumber: 204,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-xs font-mono text-muted-foreground",
                                children: t.loading_indicator
                            }, void 0, false, {
                                fileName: "[project]/components/layout/top-bar.tsx",
                                lineNumber: 205,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/layout/top-bar.tsx",
                        lineNumber: 203,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-1",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setConfigOpen(true),
                                className: "flex items-center gap-1.5 px-2 py-1 rounded text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors",
                                "aria-label": t.settings,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings$3e$__["Settings"], {
                                        className: "w-3.5 h-3.5"
                                    }, void 0, false, {
                                        fileName: "[project]/components/layout/top-bar.tsx",
                                        lineNumber: 216,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "font-mono text-[11px] hidden md:block",
                                        children: t.config
                                    }, void 0, false, {
                                        fileName: "[project]/components/layout/top-bar.tsx",
                                        lineNumber: 217,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/layout/top-bar.tsx",
                                lineNumber: 211,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "h-4 w-px bg-border mx-1"
                            }, void 0, false, {
                                fileName: "[project]/components/layout/top-bar.tsx",
                                lineNumber: 220,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setQuitOpen(true),
                                className: "flex items-center gap-1.5 px-2 py-1 rounded text-xs text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 transition-colors",
                                "aria-label": t.quit,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$log$2d$out$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__LogOut$3e$__["LogOut"], {
                                        className: "w-3.5 h-3.5"
                                    }, void 0, false, {
                                        fileName: "[project]/components/layout/top-bar.tsx",
                                        lineNumber: 227,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "font-mono text-[11px] hidden md:block",
                                        children: t.quit
                                    }, void 0, false, {
                                        fileName: "[project]/components/layout/top-bar.tsx",
                                        lineNumber: 228,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/layout/top-bar.tsx",
                                lineNumber: 222,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/layout/top-bar.tsx",
                        lineNumber: 210,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/layout/top-bar.tsx",
                lineNumber: 110,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$layout$2f$config$2d$modal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ConfigModal"], {
                open: configOpen,
                onClose: ()=>setConfigOpen(false)
            }, void 0, false, {
                fileName: "[project]/components/layout/top-bar.tsx",
                lineNumber: 234,
                columnNumber: 7
            }, this),
            quitOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "fixed inset-0 z-50 flex items-center justify-center",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute inset-0 bg-black/60 backdrop-blur-sm",
                        onClick: ()=>setQuitOpen(false)
                    }, void 0, false, {
                        fileName: "[project]/components/layout/top-bar.tsx",
                        lineNumber: 239,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "relative flex flex-col gap-4 p-5 rounded-2xl border w-72 shadow-2xl",
                        style: {
                            background: 'oklch(0.09 0 0 / 98%)',
                            borderColor: 'oklch(0.22 0 0)',
                            boxShadow: '0 16px 64px oklch(0 0 0 / 70%)'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-col gap-1",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-sm font-mono font-semibold text-foreground",
                                        children: t.quit_title
                                    }, void 0, false, {
                                        fileName: "[project]/components/layout/top-bar.tsx",
                                        lineNumber: 249,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-xs font-mono text-muted-foreground",
                                        children: t.quit_message
                                    }, void 0, false, {
                                        fileName: "[project]/components/layout/top-bar.tsx",
                                        lineNumber: 250,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/layout/top-bar.tsx",
                                lineNumber: 248,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>setQuitOpen(false),
                                        className: "flex-1 px-3 py-2 rounded-lg text-xs font-mono border border-border text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors",
                                        children: t.quit_cancel
                                    }, void 0, false, {
                                        fileName: "[project]/components/layout/top-bar.tsx",
                                        lineNumber: 253,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: handleQuit,
                                        className: "flex-1 px-3 py-2 rounded-lg text-xs font-mono text-white bg-destructive hover:opacity-90 transition-opacity font-medium",
                                        children: t.quit_confirm
                                    }, void 0, false, {
                                        fileName: "[project]/components/layout/top-bar.tsx",
                                        lineNumber: 259,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/layout/top-bar.tsx",
                                lineNumber: 252,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/layout/top-bar.tsx",
                        lineNumber: 240,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/layout/top-bar.tsx",
                lineNumber: 238,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true);
}
function LogoMark() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
        width: "22",
        height: "22",
        viewBox: "0 0 22 22",
        fill: "none",
        className: "shrink-0",
        "aria-hidden": "true",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("polygon", {
                points: "11,1 21,6.5 21,15.5 11,21 1,15.5 1,6.5",
                stroke: "oklch(0.70 0.22 42)",
                strokeWidth: "1.5",
                fill: "none"
            }, void 0, false, {
                fileName: "[project]/components/layout/top-bar.tsx",
                lineNumber: 276,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                x1: "11",
                y1: "1",
                x2: "11",
                y2: "21",
                stroke: "oklch(0.70 0.22 42 / 40%)",
                strokeWidth: "1"
            }, void 0, false, {
                fileName: "[project]/components/layout/top-bar.tsx",
                lineNumber: 277,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                x1: "1",
                y1: "11",
                x2: "21",
                y2: "11",
                stroke: "oklch(0.70 0.22 42 / 40%)",
                strokeWidth: "1"
            }, void 0, false, {
                fileName: "[project]/components/layout/top-bar.tsx",
                lineNumber: 278,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("polygon", {
                points: "11,6 16,9 16,13 11,16 6,13 6,9",
                fill: "oklch(0.70 0.22 42)",
                opacity: "0.8"
            }, void 0, false, {
                fileName: "[project]/components/layout/top-bar.tsx",
                lineNumber: 279,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/layout/top-bar.tsx",
        lineNumber: 275,
        columnNumber: 5
    }, this);
}
function TopBarBtn({ icon, label, shortcut, onClick, disabled, highlight }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
        onClick: onClick,
        disabled: disabled,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])('group relative flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono transition-all duration-150', disabled ? 'text-muted-foreground/30 cursor-not-allowed' : highlight ? 'text-background font-medium hover:opacity-90' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'),
        style: !disabled && highlight ? {
            background: 'oklch(0.70 0.22 42)',
            color: 'oklch(0.08 0 0)'
        } : undefined,
        title: shortcut ? `${label} (${shortcut})` : label,
        children: [
            icon,
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                children: label
            }, void 0, false, {
                fileName: "[project]/components/layout/top-bar.tsx",
                lineNumber: 310,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/layout/top-bar.tsx",
        lineNumber: 295,
        columnNumber: 5
    }, this);
}
function ViewToggleBtn({ icon, label, active, onClick, title }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
        onClick: onClick,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])('flex items-center gap-1 px-2 py-1 rounded text-[11px] font-mono transition-all duration-150', active ? 'text-foreground bg-secondary' : 'text-muted-foreground/50 hover:text-muted-foreground hover:bg-secondary/50'),
        title: title ?? label,
        children: [
            icon,
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "hidden lg:block",
                children: label
            }, void 0, false, {
                fileName: "[project]/components/layout/top-bar.tsx",
                lineNumber: 336,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/layout/top-bar.tsx",
        lineNumber: 325,
        columnNumber: 5
    }, this);
}
}),
"[project]/components/layout/left-panel.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "LeftPanel",
    ()=>LeftPanel
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$mouse$2d$pointer$2d$click$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__MousePointerClick$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/mouse-pointer-click.mjs [app-ssr] (ecmascript) <export default as MousePointerClick>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$scissors$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Scissors$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/scissors.mjs [app-ssr] (ecmascript) <export default as Scissors>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$rotate$2d$ccw$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__RotateCcw$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/rotate-ccw.mjs [app-ssr] (ecmascript) <export default as RotateCcw>");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/store.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$lang$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/lang-store.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
function LeftPanel() {
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$lang$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useT"])();
    const { activeTool, setActiveTool, modelMesh, resetAll, sharpAngle, setSharpAngle, cutMode, setCutMode } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAppStore"])();
    const TOOLS = [
        {
            id: 'select',
            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$mouse$2d$pointer$2d$click$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__MousePointerClick$3e$__["MousePointerClick"], {
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
            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$scissors$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Scissors$3e$__["Scissors"], {
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
            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$mouse$2d$pointer$2d$click$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__MousePointerClick$3e$__["MousePointerClick"], {
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
            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$scissors$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Scissors$3e$__["Scissors"], {
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
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("aside", {
        className: "flex flex-col items-center w-14 border-r py-3 gap-1 shrink-0",
        style: {
            background: 'oklch(0.08 0 0)',
            borderColor: 'oklch(0.14 0 0)'
        },
        "aria-label": "Ferramentas",
        children: [
            tools.map((tool)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(ToolButton, {
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "w-8 h-px my-1",
                style: {
                    background: 'oklch(0.16 0 0)'
                }
            }, void 0, false, {
                fileName: "[project]/components/layout/left-panel.tsx",
                lineNumber: 60,
                columnNumber: 7
            }, this),
            activeTool === 'select' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-col items-center gap-1 w-full px-1.5",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
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
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-col gap-0.5 w-full",
                        children: [
                            'island',
                            'curvature'
                        ].map((mode)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setCutMode(mode),
                                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])('w-full rounded-lg py-1 text-[8px] font-mono uppercase tracking-wider transition-all duration-150', cutMode === mode ? 'text-background font-semibold' : 'border text-muted-foreground/60 hover:text-muted-foreground'),
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
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "w-8 h-px my-1",
                        style: {
                            background: 'oklch(0.16 0 0)'
                        }
                    }, void 0, false, {
                        fileName: "[project]/components/layout/left-panel.tsx",
                        lineNumber: 91,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-col items-center gap-1.5 w-full",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
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
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "relative group flex flex-col items-center",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
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
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "tool-tooltip whitespace-nowrap",
                                        children: [
                                            t.sensitivity,
                                            ": ",
                                            sharpAngle,
                                            "°",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                                                fileName: "[project]/components/layout/left-panel.tsx",
                                                lineNumber: 118,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
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
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
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
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-1"
            }, void 0, false, {
                fileName: "[project]/components/layout/left-panel.tsx",
                lineNumber: 131,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "relative group",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: resetAll,
                        className: "flex flex-col items-center justify-center gap-1 w-12 h-12 rounded-xl text-muted-foreground/50 hover:text-foreground hover:bg-secondary/30 transition-all duration-150",
                        "aria-label": t.reset_tooltip,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$rotate$2d$ccw$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__RotateCcw$3e$__["RotateCcw"], {
                                className: "w-4 h-4"
                            }, void 0, false, {
                                fileName: "[project]/components/layout/left-panel.tsx",
                                lineNumber: 140,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
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
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
function ToolButton({ icon, label, description, active, onClick, disabled }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "relative group",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: onClick,
                disabled: disabled,
                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])('tool-btn', active && 'active', disabled && 'opacity-25 cursor-not-allowed'),
                "aria-label": description,
                "aria-pressed": active,
                children: [
                    icon,
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-[8px] font-mono uppercase tracking-wider leading-none",
                        children: label
                    }, void 0, false, {
                        fileName: "[project]/components/layout/left-panel.tsx",
                        lineNumber: 170,
                        columnNumber: 9
                    }, this),
                    active && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
}),
"[project]/components/layout/right-panel.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "RightPanel",
    ()=>RightPanel
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/trash-2.mjs [app-ssr] (ecmascript) <export default as Trash2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-down.mjs [app-ssr] (ecmascript) <export default as ChevronDown>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-right.mjs [app-ssr] (ecmascript) <export default as ChevronRight>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$box$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/box.mjs [app-ssr] (ecmascript) <export default as Box>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layers$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Layers$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/layers.mjs [app-ssr] (ecmascript) <export default as Layers>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/eye.mjs [app-ssr] (ecmascript) <export default as Eye>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2d$off$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__EyeOff$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/eye-off.mjs [app-ssr] (ecmascript) <export default as EyeOff>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$lock$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Lock$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/lock.mjs [app-ssr] (ecmascript) <export default as Lock>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$lock$2d$open$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Unlock$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/lock-open.mjs [app-ssr] (ecmascript) <export default as Unlock>");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/store.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$lang$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/lang-store.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
;
function RightPanel() {
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$lang$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useT"])();
    const { modelInfo, modelMesh, selectedFaceIndices, selectionState, unit, setUnit, parts, activePartId, setActivePartId, togglePartVisibility, togglePartLocked, renamePart, removePart, setCutParts, setModelMesh, pushHistory, setStatus } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAppStore"])();
    const [infoOpen, setInfoOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const [selectionOpen, setSelectionOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const [partsOpen, setPartsOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const hasSelection = selectedFaceIndices.size > 0 && selectionState === 'selected';
    const unitMultiplier = unit === 'cm' ? 0.1 : unit === 'm' ? 0.001 : unit === 'in' ? 0.0393701 : 1;
    const fmt = (val)=>(val * unitMultiplier).toFixed(2);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("aside", {
        className: "flex flex-col w-60 border-l border-border overflow-y-auto shrink-0",
        style: {
            background: 'oklch(0.09 0 0)'
        },
        "aria-label": t.properties,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "section-header flex items-center justify-between",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        children: t.properties
                    }, void 0, false, {
                        fileName: "[project]/components/layout/right-panel.tsx",
                        lineNumber: 34,
                        columnNumber: 9
                    }, this),
                    modelInfo && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
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
            !modelMesh && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-col items-center justify-center flex-1 gap-3 p-6 text-center",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$box$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__["Box"], {
                        className: "w-8 h-8 text-muted-foreground/20"
                    }, void 0, false, {
                        fileName: "[project]/components/layout/right-panel.tsx",
                        lineNumber: 44,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-xs text-muted-foreground/40 font-mono leading-relaxed",
                        children: [
                            t.no_model_line1,
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
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
            modelInfo && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Section, {
                title: t.model_section,
                open: infoOpen,
                onToggle: ()=>setInfoOpen(!infoOpen),
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(StatRow, {
                        label: t.vertices,
                        value: modelInfo.vertices.toLocaleString()
                    }, void 0, false, {
                        fileName: "[project]/components/layout/right-panel.tsx",
                        lineNumber: 53,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(StatRow, {
                        label: t.faces,
                        value: modelInfo.faces.toLocaleString()
                    }, void 0, false, {
                        fileName: "[project]/components/layout/right-panel.tsx",
                        lineNumber: 54,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(StatRow, {
                        label: t.file_size,
                        value: modelInfo.fileSize
                    }, void 0, false, {
                        fileName: "[project]/components/layout/right-panel.tsx",
                        lineNumber: 55,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "stat-row",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "stat-label",
                                children: t.unit
                            }, void 0, false, {
                                fileName: "[project]/components/layout/right-panel.tsx",
                                lineNumber: 57,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                value: unit,
                                onChange: (e)=>setUnit(e.target.value),
                                className: "text-xs font-mono bg-transparent text-foreground border-none outline-none cursor-pointer",
                                "aria-label": t.unit,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "mm",
                                        children: "mm"
                                    }, void 0, false, {
                                        fileName: "[project]/components/layout/right-panel.tsx",
                                        lineNumber: 64,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "cm",
                                        children: "cm"
                                    }, void 0, false, {
                                        fileName: "[project]/components/layout/right-panel.tsx",
                                        lineNumber: 65,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "m",
                                        children: "m"
                                    }, void 0, false, {
                                        fileName: "[project]/components/layout/right-panel.tsx",
                                        lineNumber: 66,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
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
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "pt-1 mt-1",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "stat-label mb-2",
                                children: t.dimensions
                            }, void 0, false, {
                                fileName: "[project]/components/layout/right-panel.tsx",
                                lineNumber: 71,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(DimensionBar, {
                                axis: "X",
                                value: fmt(modelInfo.width),
                                unit: unit,
                                color: "#ff3333"
                            }, void 0, false, {
                                fileName: "[project]/components/layout/right-panel.tsx",
                                lineNumber: 72,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(DimensionBar, {
                                axis: "Y",
                                value: fmt(modelInfo.height),
                                unit: unit,
                                color: "#33ff66"
                            }, void 0, false, {
                                fileName: "[project]/components/layout/right-panel.tsx",
                                lineNumber: 73,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(DimensionBar, {
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
            modelMesh && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Section, {
                title: t.smartcut_selection,
                open: selectionOpen,
                onToggle: ()=>setSelectionOpen(!selectionOpen),
                badge: hasSelection ? selectedFaceIndices.size.toLocaleString() : undefined,
                badgeColor: "orange",
                children: !hasSelection ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-[11px] text-muted-foreground/40 font-mono py-2",
                    children: t.click_to_select
                }, void 0, false, {
                    fileName: "[project]/components/layout/right-panel.tsx",
                    lineNumber: 88,
                    columnNumber: 13
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(StatRow, {
                            label: t.triangles,
                            value: selectedFaceIndices.size.toLocaleString(),
                            highlight: true
                        }, void 0, false, {
                            fileName: "[project]/components/layout/right-panel.tsx",
                            lineNumber: 91,
                            columnNumber: 15
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(StatRow, {
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
            parts.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Section, {
                title: t.parts,
                open: partsOpen,
                onToggle: ()=>setPartsOpen(!partsOpen),
                badge: String(parts.length),
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-col gap-0.5",
                        children: parts.map((part)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(PartRow, {
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
                    activePartId && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-1"
            }, void 0, false, {
                fileName: "[project]/components/layout/right-panel.tsx",
                lineNumber: 132,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "px-3 py-2 border-t border-border flex items-center gap-2",
                style: {
                    background: 'oklch(0.08 0 0)'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layers$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Layers$3e$__["Layers"], {
                        className: "w-3 h-3 text-muted-foreground/30"
                    }, void 0, false, {
                        fileName: "[project]/components/layout/right-panel.tsx",
                        lineNumber: 135,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
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
function PartRow({ part, isActive, onSelect, onToggleVisible, onToggleLocked, onRename, onDelete }) {
    const [editing, setEditing] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [editValue, setEditValue] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(part.name);
    const inputRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (editing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [
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
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        onClick: onSelect,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])('group flex items-center gap-1.5 px-2 py-1.5 rounded cursor-pointer transition-colors', isActive ? 'bg-secondary' : 'hover:bg-secondary/40', !part.visible && 'opacity-40'),
        style: isActive ? {
            borderLeft: `2px solid oklch(0.70 0.22 42)`,
            paddingLeft: '6px'
        } : {
            borderLeft: '2px solid transparent',
            paddingLeft: '6px'
        },
        title: part.locked ? `${part.name} (bloqueada)` : part.name,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: onToggleVisible,
                className: "shrink-0 text-muted-foreground/40 hover:text-foreground transition-colors",
                "aria-label": part.visible ? 'Ocultar' : 'Exibir',
                children: part.visible ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__["Eye"], {
                    className: "w-3 h-3"
                }, void 0, false, {
                    fileName: "[project]/components/layout/right-panel.tsx",
                    lineNumber: 178,
                    columnNumber: 25
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2d$off$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__EyeOff$3e$__["EyeOff"], {
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
            editing ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
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
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])('flex-1 min-w-0 truncate text-[11px] font-mono', isActive ? 'text-foreground' : 'text-foreground/70'),
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: onToggleLocked,
                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])('shrink-0 transition-colors', part.locked ? 'text-foreground/60' : 'text-muted-foreground/20 hover:text-muted-foreground/50 opacity-0 group-hover:opacity-100'),
                "aria-label": part.locked ? 'Desbloquear' : 'Bloquear',
                children: part.locked ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$lock$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Lock$3e$__["Lock"], {
                    className: "w-3 h-3"
                }, void 0, false, {
                    fileName: "[project]/components/layout/right-panel.tsx",
                    lineNumber: 196,
                    columnNumber: 24
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$lock$2d$open$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Unlock$3e$__["Unlock"], {
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
            !part.locked && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: onDelete,
                className: "shrink-0 text-muted-foreground/20 hover:text-destructive transition-colors opacity-0 group-hover:opacity-100",
                "aria-label": `Remover ${part.name}`,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__["Trash2"], {
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
function Section({ title, open, onToggle, children, badge, badgeColor = 'default' }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "border-b border-border/50",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: onToggle,
                className: "flex items-center justify-between w-full px-3 py-2 hover:bg-secondary/30 transition-colors",
                "aria-expanded": open,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-2",
                        children: [
                            open ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__["ChevronDown"], {
                                className: "w-3 h-3 text-muted-foreground/50"
                            }, void 0, false, {
                                fileName: "[project]/components/layout/right-panel.tsx",
                                lineNumber: 219,
                                columnNumber: 19
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__["ChevronRight"], {
                                className: "w-3 h-3 text-muted-foreground/50"
                            }, void 0, false, {
                                fileName: "[project]/components/layout/right-panel.tsx",
                                lineNumber: 219,
                                columnNumber: 82
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
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
                    badge && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])('text-[10px] font-mono px-1.5 py-0.5 rounded', badgeColor === 'orange' ? 'text-background' : 'bg-secondary text-muted-foreground'),
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
            open && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
function StatRow({ label, value, highlight }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "stat-row",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "stat-label",
                children: label
            }, void 0, false, {
                fileName: "[project]/components/layout/right-panel.tsx",
                lineNumber: 237,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])('stat-value', highlight && 'font-bold'),
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
function DimensionBar({ axis, value, unit, color }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex items-center gap-2 py-0.5",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-1 h-px bg-border"
            }, void 0, false, {
                fileName: "[project]/components/layout/right-panel.tsx",
                lineNumber: 248,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "text-[10px] font-mono text-foreground",
                children: [
                    value,
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
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
}),
"[project]/components/layout/status-bar.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "StatusBar",
    ()=>StatusBar
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/store.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$activity$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Activity$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/activity.mjs [app-ssr] (ecmascript) <export default as Activity>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$cpu$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Cpu$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/cpu.mjs [app-ssr] (ecmascript) <export default as Cpu>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$hard$2d$drive$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__HardDrive$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/hard-drive.mjs [app-ssr] (ecmascript) <export default as HardDrive>");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$lang$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/lang-store.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
function StatusBar() {
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$lang$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useT"])();
    const { status, statusMessage, fps, unit, modelInfo, selectionState, selectedFaceIndices } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAppStore"])();
    const isError = status === 'error';
    const isLoading = status === 'loading';
    const isSelecting = selectionState === 'selecting';
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("footer", {
        className: "flex items-center h-7 px-4 border-t border-border gap-4 shrink-0 z-10",
        style: {
            background: 'oklch(0.07 0 0)'
        },
        "aria-label": "Barra de status",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-2 flex-1 min-w-0",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(StatusDot, {
                        status: status
                    }, void 0, false, {
                        fileName: "[project]/components/layout/status-bar.tsx",
                        lineNumber: 23,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])('text-[11px] font-mono truncate', isError ? 'text-destructive' : 'text-muted-foreground'),
                        children: statusMessage
                    }, void 0, false, {
                        fileName: "[project]/components/layout/status-bar.tsx",
                        lineNumber: 24,
                        columnNumber: 9
                    }, this),
                    (isLoading || isSelecting) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex gap-0.5 items-center ml-1 shrink-0",
                        children: [
                            0,
                            1,
                            2
                        ].map((i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-4 shrink-0",
                children: [
                    modelInfo && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(StatusItem, {
                        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$hard$2d$drive$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__HardDrive$3e$__["HardDrive"], {
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
                    selectedFaceIndices.size > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(StatusItem, {
                        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "h-3 w-px bg-border"
                    }, void 0, false, {
                        fileName: "[project]/components/layout/status-bar.tsx",
                        lineNumber: 48,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(StatusItem, {
                        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$cpu$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Cpu$3e$__["Cpu"], {
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
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-1",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$activity$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Activity$3e$__["Activity"], {
                                className: "w-2.5 h-2.5 text-muted-foreground/40",
                                "aria-hidden": "true"
                            }, void 0, false, {
                                fileName: "[project]/components/layout/status-bar.tsx",
                                lineNumber: 51,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])('text-[11px] font-mono tabular-nums', fps >= 55 ? '' : fps >= 30 ? 'text-yellow-500' : 'text-destructive'),
                                style: fps >= 55 ? {
                                    color: 'oklch(0.70 0.22 42 / 80%)'
                                } : undefined,
                                children: fps
                            }, void 0, false, {
                                fileName: "[project]/components/layout/status-bar.tsx",
                                lineNumber: 52,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
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
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "h-3 w-px bg-border"
                    }, void 0, false, {
                        fileName: "[project]/components/layout/status-bar.tsx",
                        lineNumber: 60,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-1 px-1.5 py-0.5 rounded border",
                        style: {
                            borderColor: 'oklch(0.70 0.22 42 / 20%)',
                            background: 'oklch(0.70 0.22 42 / 5%)'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
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
function StatusDot({ status }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])('w-1.5 h-1.5 rounded-full shrink-0', status === 'error' && 'bg-destructive', (status === 'loading' || status === 'cutting') && 'animate-pulse', status === 'idle' && 'bg-muted-foreground/30'),
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
function StatusItem({ icon, label, highlight }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex items-center gap-1",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "text-muted-foreground/40",
                "aria-hidden": "true",
                children: icon
            }, void 0, false, {
                fileName: "[project]/components/layout/status-bar.tsx",
                lineNumber: 86,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
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
}),
"[project]/components/layout/cut-actions.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CutActions",
    ()=>CutActions
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/sparkles.mjs [app-ssr] (ecmascript) <export default as Sparkles>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$box$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/box.mjs [app-ssr] (ecmascript) <export default as Box>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.mjs [app-ssr] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/store.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
function CutActions() {
    const { selectionState, selectedFaceIndices, modelMesh, clearSelection, autoCutOpen, setAutoCutOpen, encaixeOpen, setEncaixeOpen } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAppStore"])();
    const hasSelection = selectedFaceIndices.size > 0 && selectionState === 'selected';
    if (!hasSelection || !modelMesh) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "absolute bottom-10 left-1/2 -translate-x-1/2 z-20 animate-fade-in pointer-events-auto",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-center gap-1.5 p-1.5 rounded-2xl border",
            style: {
                background: 'oklch(0.09 0 0 / 97%)',
                backdropFilter: 'blur(24px) saturate(1.5)',
                borderColor: 'oklch(0.20 0 0)',
                boxShadow: '0 4px 24px oklch(0 0 0 / 55%), inset 0 1px 0 oklch(1 0 0 / 5%)'
            },
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(ActionChip, {
                    icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__["Sparkles"], {
                        className: "w-3.5 h-3.5"
                    }, void 0, false, {
                        fileName: "[project]/components/layout/cut-actions.tsx",
                        lineNumber: 36,
                        columnNumber: 17
                    }, this),
                    label: "AutoCut",
                    active: autoCutOpen,
                    accent: "oklch(0.70 0.22 42)",
                    onClick: ()=>{
                        setAutoCutOpen(!autoCutOpen);
                        if (encaixeOpen) setEncaixeOpen(false);
                    },
                    title: "Corte inteligente com contorno automático"
                }, void 0, false, {
                    fileName: "[project]/components/layout/cut-actions.tsx",
                    lineNumber: 35,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(ActionChip, {
                    icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$box$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__["Box"], {
                        className: "w-3.5 h-3.5"
                    }, void 0, false, {
                        fileName: "[project]/components/layout/cut-actions.tsx",
                        lineNumber: 46,
                        columnNumber: 17
                    }, this),
                    label: "Encaixe",
                    active: encaixeOpen,
                    accent: "oklch(0.62 0.15 260)",
                    onClick: ()=>{
                        setEncaixeOpen(!encaixeOpen);
                        if (autoCutOpen) setAutoCutOpen(false);
                    },
                    title: "Gerar pino/furo de encaixe na costura"
                }, void 0, false, {
                    fileName: "[project]/components/layout/cut-actions.tsx",
                    lineNumber: 45,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "w-px h-5 mx-0.5",
                    style: {
                        background: 'oklch(0.22 0 0)'
                    }
                }, void 0, false, {
                    fileName: "[project]/components/layout/cut-actions.tsx",
                    lineNumber: 55,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    onClick: clearSelection,
                    title: "Cancelar seleção",
                    className: "flex items-center justify-center w-7 h-7 rounded-xl text-muted-foreground/50 hover:text-foreground hover:bg-secondary/50 transition-all duration-150",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                        className: "w-3.5 h-3.5"
                    }, void 0, false, {
                        fileName: "[project]/components/layout/cut-actions.tsx",
                        lineNumber: 63,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/components/layout/cut-actions.tsx",
                    lineNumber: 58,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/components/layout/cut-actions.tsx",
            lineNumber: 25,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/components/layout/cut-actions.tsx",
        lineNumber: 24,
        columnNumber: 5
    }, this);
}
function ActionChip({ icon, label, active, accent, onClick, title }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
        onClick: onClick,
        title: title,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])('flex items-center gap-2 px-3 py-1.5 rounded-xl text-[11px] font-mono font-medium transition-all duration-150', active ? 'text-background' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40'),
        style: active ? {
            background: accent,
            boxShadow: `0 0 12px ${accent}55`
        } : undefined,
        children: [
            icon,
            label
        ]
    }, void 0, true, {
        fileName: "[project]/components/layout/cut-actions.tsx",
        lineNumber: 81,
        columnNumber: 5
    }, this);
}
}),
"[project]/lib/cap-generation.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "generateCap",
    ()=>generateCap,
    "generateCapWithHoles",
    ()=>generateCapWithHoles
]);
/**
 * High-Quality Cap Generation
 * ─────────────────────────────────────────────────────────────────────────────
 * Implements the 11-step pipeline specified in the architectural brief:
 *
 *  1.  Analyze boundary loop (curvature, spacing, normals, tangents)
 *  2.  Catmull-Rom spline reconstruction — continuous smooth contour
 *  3.  Contour fairing (Laplacian + projection) — remove triangulation noise
 *  4.  Rigid boundary lock — rebuilt contour becomes an inviolable constraint
 *  5.  Interior surface generation — concentric rings + harmonic interpolation
 *  6.  Global Taubin solver — minimize surface energy (λ/μ alternation)
 *  7.  Constrained Delaunay-quality remeshing (structured topology)
 *  8.  G1/G2 continuity at boundary — blend adjacent mesh normals
 *  9.  Adaptive fairing interior — weighted by curvature + distance from edge
 * 10.  Defect correction — remove degenerate triangles, fix normals
 * 11.  Per-vertex normal smoothing — eliminate flat-cap shading artefacts
 *
 * Principle: "Analyse the boundary → reconstruct a continuous contour →
 * generate an optimised mathematical surface → only then triangulate."
 * The triangulation represents the surface; it does not define it.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/three/build/three.core.js [app-ssr] (ecmascript)");
;
function generateCap(boundary, options = {}) {
    if (boundary.length < 3) return empty();
    // ── 1. Analyse ──────────────────────────────────────────────────────────────
    const analysis = analyseBoundary(boundary);
    const capNormal = analysis.normal;
    // ── 2–4. Boundary lock (watertight outer edge) ─────────────────────────────
    // The original boundary vertices are kept EXACTLY so the cap's outer edge
    // matches the shell's open boundary edges — any deviation creates visible gaps.
    const lockedBoundary = boundary.map((p)=>p.clone());
    const boundaryCount = lockedBoundary.length;
    // ── 2b. Smooth transition ring ──────────────────────────────────────────────
    // Build a uniformly-spaced ring at ~12% inward from the boundary.
    // This ring acts as the true "inner boundary" for the concentric mesh:
    // the irregular outer ring is stitched to it with a variable-ratio strip,
    // eliminating the sliver triangles that the jagged cut edge would cause.
    const targetInner = Math.max(24, Math.min(96, Math.round(boundaryCount * 0.45)));
    const T_INNER = 0.12;
    const rawInner = lockedBoundary.map((p)=>{
        const v = p.clone().lerp(analysis.centroid, T_INNER);
        return options.plane ? projectToPlane(v, options.plane) : v;
    });
    const innerRing = fairContour(rawInner.length > targetInner ? resampleCatmullRom(rawInner, targetInner, options.plane) : rawInner, options.contourFairIter ?? 8, 0.4, options.plane);
    const innerCount = innerRing.length;
    // ── 5. Interior surface generation ─────────────────────────────────────────
    // Concentric mesh is built FROM the smooth inner ring inward; the jagged
    // outer ring is handled separately via stitching.
    const rings = options.interiorRings ?? autoRings(analysis.area, analysis.avgSpacing);
    const { vertices: coreVerts, triangles: coreTris, boundaryCount: innerBC } = buildConcentricMesh(innerRing, analysis.centroid, Math.max(1, rings - 1), options.plane);
    // Assemble: [lockedBoundary (N) | coreVerts (innerRing + interior)]
    // Shift all core triangle indices by N so they reference the combined array.
    const vertices = [
        ...lockedBoundary,
        ...coreVerts
    ];
    const triangles = coreTris.map((t)=>[
            t[0] + boundaryCount,
            t[1] + boundaryCount,
            t[2] + boundaryCount
        ]);
    // Stitch outer ring (0..N-1) → inner ring (N..N+innerCount-1)
    stitchRings(vertices, triangles, Array.from({
        length: boundaryCount
    }, (_, i)=>i), Array.from({
        length: innerCount
    }, (_, i)=>i + boundaryCount), analysis.centroid);
    // Fixed count: outer ring + inner ring are both pinned during smoothing.
    const fixedCount = boundaryCount + innerBC;
    // ── 6. Global Taubin solver (free interior only) ────────────────────────────
    const smoothIter = options.smoothIterations ?? 30;
    const lambda = options.lambda ?? 0.5;
    const mu = options.mu ?? -0.53;
    taubinSmooth(vertices, triangles, fixedCount, smoothIter, lambda, mu, options.plane);
    // ── 7. Validate / remove degenerate triangles ───────────────────────────────
    const validTris = filterDegenerates(vertices, triangles);
    if (validTris.length === 0) return empty();
    // ── 8+9. Adaptive fairing — free interior only ─────────────────────────────
    adaptiveFairing(vertices, validTris, fixedCount, analysis.curvature, options.plane);
    // ── 10. Defect correction: ensure consistent winding ───────────────────────
    fixWinding(vertices, validTris, capNormal);
    // ── 11. Per-vertex normals (G1 continuity only at outer boundary) ───────────
    const normals = computePerVertexNormals(vertices, validTris, capNormal, boundaryCount, options.adjacentNormals);
    // ── Flatten to triangle soup ────────────────────────────────────────────────
    return flattenToSoup(vertices, validTris, normals, options.flipped ?? false);
}
function generateCapWithHoles(outer, holes, capNormal, planeU, planeV, planePoint, flipped = false) {
    if (outer.length < 3) return empty();
    // BOUNDARY LOCK: outer and hole vertices are exact cut-edge coordinates
    // produced by the mesh-plane intersection. They must not be resampled,
    // faired, or repositioned — any movement creates gaps between shell and cap.
    // All smoothing must happen exclusively in the interior.
    // Project to 2D in the plane basis
    const to2d = (p)=>{
        const rel = p.clone().sub(planePoint);
        return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector2"](rel.dot(planeU), rel.dot(planeV));
    };
    // Orient outer loop: CCW (area > 0) for ShapeUtils
    const outerArea = signedArea2D(outer.map(to2d));
    const outer2d = outerArea >= 0 ? outer.map(to2d) : [
        ...outer
    ].reverse().map(to2d);
    const outer3d = outerArea >= 0 ? [
        ...outer
    ] : [
        ...outer
    ].reverse();
    // Orient holes: CW (area < 0) for ShapeUtils
    const holes2d = [];
    const holes3d = [];
    for (const h of holes){
        const ha = signedArea2D(h.map(to2d));
        if (ha < 0) {
            holes2d.push(h.map(to2d));
            holes3d.push([
                ...h
            ]);
        } else {
            holes2d.push([
                ...h
            ].reverse().map(to2d));
            holes3d.push([
                ...h
            ].reverse());
        }
    }
    // Combined vertex array: [outer, hole0, hole1, ...] — indices from ShapeUtils
    const combined3d = [
        ...outer3d
    ];
    for (const h3 of holes3d)combined3d.push(...h3);
    let faces;
    try {
        faces = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ShapeUtils"].triangulateShape(outer2d, holes2d);
    } catch  {
        // Fallback: fan from first vertex
        faces = [];
        for(let i = 1; i + 1 < outer2d.length; i++)faces.push([
            0,
            i,
            i + 1
        ]);
    }
    // Emit triangle soup — original boundary vertices, flat cap normal
    const posArr = [];
    const nrmArr = [];
    const n = flipped ? capNormal.clone().negate() : capNormal.clone();
    for (const tri of faces){
        const A = combined3d[tri[0]];
        const B = combined3d[tri[1]];
        const C = combined3d[tri[2]];
        if (!A || !B || !C) continue;
        const [v0, v1, v2] = flipped ? [
            A,
            C,
            B
        ] : [
            A,
            B,
            C
        ];
        posArr.push(v0.x, v0.y, v0.z, v1.x, v1.y, v1.z, v2.x, v2.y, v2.z);
        nrmArr.push(n.x, n.y, n.z, n.x, n.y, n.z, n.x, n.y, n.z);
    }
    return {
        pos: new Float32Array(posArr),
        nrm: new Float32Array(nrmArr)
    };
}
function analyseBoundary(pts) {
    const n = pts.length;
    // Centroid
    const centroid = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector3"]();
    for (const p of pts)centroid.add(p);
    centroid.divideScalar(n);
    // Best-fit plane normal via Newell's method (robust for any polygon)
    const normal = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector3"]();
    for(let i = 0; i < n; i++){
        const cur = pts[i], nxt = pts[(i + 1) % n];
        normal.x += (cur.y - nxt.y) * (cur.z + nxt.z);
        normal.y += (cur.z - nxt.z) * (cur.x + nxt.x);
        normal.z += (cur.x - nxt.x) * (cur.y + nxt.y);
    }
    if (normal.lengthSq() > 1e-20) normal.normalize();
    else normal.set(0, 1, 0);
    // Orthonormal basis in the plane
    const refUp = Math.abs(normal.y) < 0.9 ? new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector3"](0, 1, 0) : new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector3"](1, 0, 0);
    const uAxis = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector3"]().crossVectors(refUp, normal).normalize();
    const vAxis = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector3"]().crossVectors(normal, uAxis).normalize();
    // Perimeter and average edge spacing
    let perimeter = 0;
    for(let i = 0; i < n; i++)perimeter += pts[i].distanceTo(pts[(i + 1) % n]);
    const avgSpacing = perimeter / n;
    // Approximate area (shoelace in local 2D)
    let area2d = 0;
    for(let i = 0; i < n; i++){
        const rel = pts[i].clone().sub(centroid);
        const rel2 = pts[(i + 1) % n].clone().sub(centroid);
        area2d += rel.dot(uAxis) * rel2.dot(vAxis) - rel2.dot(uAxis) * rel.dot(vAxis);
    }
    const area = Math.abs(area2d) * 0.5;
    // Discrete curvature at each vertex (turning angle)
    const curvature = new Float32Array(n);
    for(let i = 0; i < n; i++){
        const prev = pts[(i - 1 + n) % n];
        const cur = pts[i];
        const next = pts[(i + 1) % n];
        const a = cur.clone().sub(prev);
        const b = next.clone().sub(cur);
        const la = a.length(), lb = b.length();
        if (la > 1e-10 && lb > 1e-10) {
            a.divideScalar(la);
            b.divideScalar(lb);
            curvature[i] = Math.acos(Math.max(-1, Math.min(1, a.dot(b))));
        }
    }
    return {
        centroid,
        normal,
        uAxis,
        vAxis,
        avgSpacing,
        perimeter,
        area,
        curvature
    };
}
// ─────────────────────────────────────────────────────────────────────────────
// Step 2 — Catmull-Rom spline reconstruction
// ─────────────────────────────────────────────────────────────────────────────
function crPoint(P0, P1, P2, P3, t) {
    const t2 = t * t, t3 = t2 * t;
    return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector3"](0.5 * (2 * P1.x + (-P0.x + P2.x) * t + (2 * P0.x - 5 * P1.x + 4 * P2.x - P3.x) * t2 + (-P0.x + 3 * P1.x - 3 * P2.x + P3.x) * t3), 0.5 * (2 * P1.y + (-P0.y + P2.y) * t + (2 * P0.y - 5 * P1.y + 4 * P2.y - P3.y) * t2 + (-P0.y + 3 * P1.y - 3 * P2.y + P3.y) * t3), 0.5 * (2 * P1.z + (-P0.z + P2.z) * t + (2 * P0.z - 5 * P1.z + 4 * P2.z - P3.z) * t2 + (-P0.z + 3 * P1.z - 3 * P2.z + P3.z) * t3));
}
function resampleCatmullRom(pts, targetCount, plane) {
    const n = pts.length;
    if (n < 3) return pts.map((p)=>p.clone());
    const OVERSAMPLE = 16 // samples per input segment for accurate arc-length
    ;
    const dense = [];
    for(let i = 0; i < n; i++){
        const P0 = pts[(i - 1 + n) % n];
        const P1 = pts[i];
        const P2 = pts[(i + 1) % n];
        const P3 = pts[(i + 2) % n];
        for(let j = 0; j < OVERSAMPLE; j++){
            let p = crPoint(P0, P1, P2, P3, j / OVERSAMPLE);
            if (plane) p = projectToPlane(p, plane);
            dense.push(p);
        }
    }
    // Build cumulative arc length table.
    // Append a closing sentinel (dense[0] clone) so the binary search can
    // properly interpolate any target that falls in the last segment
    // (between the final sample and the loop start point).
    const arc = [
        0
    ];
    for(let i = 1; i < dense.length; i++){
        arc.push(arc[i - 1] + dense[i].distanceTo(dense[i - 1]));
    }
    const loopClose = dense[dense.length - 1].distanceTo(dense[0]);
    const totalLen = arc[arc.length - 1] + loopClose;
    // Extend with closing segment so binary search covers the full loop
    dense.push(dense[0].clone());
    arc.push(totalLen);
    // Resample at uniform arc length
    const result = [];
    for(let k = 0; k < targetCount; k++){
        const target = k / targetCount * totalLen;
        let lo = 0, hi = arc.length - 1;
        while(lo < hi - 1){
            const mid = lo + hi >> 1;
            if (arc[mid] <= target) lo = mid;
            else hi = mid;
        }
        const span = arc[hi] - arc[lo];
        const t = span > 1e-12 ? (target - arc[lo]) / span : 0;
        result.push(dense[lo].clone().lerp(dense[hi], t));
    }
    return result;
}
// ─────────────────────────────────────────────────────────────────────────────
// Step 3 — Contour fairing (Laplacian with plane projection)
// ─────────────────────────────────────────────────────────────────────────────
function fairContour(pts, iterations, alpha, plane) {
    let cur = pts.map((p)=>p.clone());
    const n = cur.length;
    for(let iter = 0; iter < iterations; iter++){
        const next = [];
        for(let i = 0; i < n; i++){
            const prev = cur[(i - 1 + n) % n];
            const nx = cur[(i + 1) % n];
            const lap = prev.clone().add(nx).multiplyScalar(0.5);
            let moved = cur[i].clone().lerp(lap, alpha);
            if (plane) moved = projectToPlane(moved, plane);
            next.push(moved);
        }
        cur = next;
    }
    return cur;
}
function buildConcentricMesh(boundary, centroid, rings, plane) {
    const bCount = boundary.length;
    const vertices = boundary.map((p)=>p.clone());
    const triangles = [];
    if (rings <= 0 || bCount < 3) {
        // Degenerate: fan from centroid
        const cIdx = vertices.length;
        const c = plane ? projectToPlane(centroid.clone(), plane) : centroid.clone();
        vertices.push(c);
        for(let i = 0; i < bCount; i++){
            triangles.push([
                i,
                (i + 1) % bCount,
                cIdx
            ]);
        }
        return {
            vertices,
            triangles,
            boundaryCount: bCount
        };
    }
    // Build ring indices: ring 0 = boundary, ring `rings` = centre
    const ringIndex = [
        Array.from({
            length: bCount
        }, (_, i)=>i)
    ];
    for(let r = 1; r < rings; r++){
        const t = r / rings;
        const row = [];
        for(let i = 0; i < bCount; i++){
            // Lerp each boundary point toward centroid (harmonic-like interpolation)
            let p = boundary[i].clone().lerp(centroid, t);
            if (plane) p = projectToPlane(p, plane);
            row.push(vertices.length);
            vertices.push(p);
        }
        ringIndex.push(row);
    }
    // Centre point
    const cIdx = vertices.length;
    const c = plane ? projectToPlane(centroid.clone(), plane) : centroid.clone();
    vertices.push(c);
    // Triangulate between consecutive rings (quad → two triangles)
    for(let r = 0; r < rings - 1; r++){
        const outer = ringIndex[r];
        const inner = ringIndex[r + 1];
        for(let i = 0; i < bCount; i++){
            const a = outer[i], b = outer[(i + 1) % bCount];
            const d = inner[i], c = inner[(i + 1) % bCount];
            triangles.push([
                a,
                b,
                c
            ]);
            triangles.push([
                a,
                c,
                d
            ]);
        }
    }
    // Cap innermost ring to centre
    const lastRing = ringIndex[rings - 1];
    for(let i = 0; i < bCount; i++){
        triangles.push([
            lastRing[i],
            lastRing[(i + 1) % bCount],
            cIdx
        ]);
    }
    return {
        vertices,
        triangles,
        boundaryCount: bCount
    };
}
// ─────────────────────────────────────────────────────────────────────────────
// Stitch two rings of potentially different sizes — variable-ratio zipper
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Connect two closed rings (outerRing and innerRing) with a triangle strip.
 *
 * Both rings must be ordered in the same direction (CCW when viewed from the
 * cap normal). The outer ring is typically larger/jagged; the inner ring is
 * smaller/resampled. A greedy shortest-diagonal zipper handles the size
 * mismatch: at each step it advances whichever ring produces the shorter
 * new diagonal, creating exactly (NO + NI) triangles that tile the band.
 *
 * Triangle winding: [oA, oB, iA] advances outer; [oA, iA, iB] advances inner.
 * Both are CCW when viewed from the positive cap-normal side.
 */ function stitchRings(vertices, triangles, outerRing, innerRing, _centroid) {
    const NO = outerRing.length;
    const NI = innerRing.length;
    if (NO < 3 || NI < 3) return;
    let oi = 0, ii = 0;
    const total = NO + NI // one triangle per step
    ;
    for(let step = 0; step < total; step++){
        const oA = outerRing[oi % NO];
        const iA = innerRing[ii % NI];
        const oB = outerRing[(oi + 1) % NO];
        const iB = innerRing[(ii + 1) % NI];
        let advOuter;
        if (oi >= NO) advOuter = false; // outer exhausted: must advance inner
        else if (ii >= NI) advOuter = true; // inner exhausted: must advance outer
        else {
            // Choose the triangle that produces the shorter shared diagonal
            const d1 = vertices[oB].distanceToSquared(vertices[iA]) // advance outer
            ;
            const d2 = vertices[oA].distanceToSquared(vertices[iB]) // advance inner
            ;
            advOuter = d1 <= d2;
        }
        if (advOuter) {
            triangles.push([
                oA,
                oB,
                iA
            ]);
            oi++;
        } else {
            triangles.push([
                oA,
                iA,
                iB
            ]);
            ii++;
        }
    }
}
// ─────────────────────────────────────────────────────────────────────────────
// Step 6 — Taubin smoother (global solver)
// ─────────────────────────────────────────────────────────────────────────────
function taubinSmooth(vertices, triangles, boundaryCount, iterations, lambda, mu, plane) {
    const n = vertices.length;
    if (boundaryCount >= n) return; // all vertices are boundary
    // Build adjacency for ALL vertices (needed for weight computation)
    const adj = Array.from({
        length: n
    }, ()=>[]);
    for (const [a, b, c] of triangles){
        if (!adj[a].includes(b)) adj[a].push(b);
        if (!adj[a].includes(c)) adj[a].push(c);
        if (!adj[b].includes(a)) adj[b].push(a);
        if (!adj[b].includes(c)) adj[b].push(c);
        if (!adj[c].includes(a)) adj[c].push(a);
        if (!adj[c].includes(b)) adj[c].push(b);
    }
    const step = (factor)=>{
        for(let i = boundaryCount; i < n; i++){
            const nb = adj[i];
            if (nb.length === 0) continue;
            let sx = 0, sy = 0, sz = 0;
            for (const j of nb){
                sx += vertices[j].x;
                sy += vertices[j].y;
                sz += vertices[j].z;
            }
            const inv = 1 / nb.length;
            const dx = sx * inv - vertices[i].x;
            const dy = sy * inv - vertices[i].y;
            const dz = sz * inv - vertices[i].z;
            vertices[i].x += factor * dx;
            vertices[i].y += factor * dy;
            vertices[i].z += factor * dz;
            if (plane) vertices[i] = projectToPlane(vertices[i], plane);
        }
    };
    for(let iter = 0; iter < iterations; iter++){
        step(lambda);
        step(mu);
    }
}
// ─────────────────────────────────────────────────────────────────────────────
// Step 9 — Adaptive fairing (weighted by curvature + distance from boundary)
// ─────────────────────────────────────────────────────────────────────────────
function adaptiveFairing(vertices, triangles, boundaryCount, boundaryCurvature, plane) {
    const n = vertices.length;
    if (boundaryCount >= n) return;
    // Build adjacency
    const adj = Array.from({
        length: n
    }, ()=>[]);
    for (const [a, b, c] of triangles){
        adj[a].push(b, c);
        adj[b].push(a, c);
        adj[c].push(a, b);
    }
    // Average curvature of boundary (used for weight scaling)
    let avgCurv = 0;
    for(let i = 0; i < boundaryCurvature.length; i++)avgCurv += boundaryCurvature[i];
    if (boundaryCurvature.length > 0) avgCurv /= boundaryCurvature.length;
    const ITER = 8;
    for(let iter = 0; iter < ITER; iter++){
        for(let i = boundaryCount; i < n; i++){
            const nb = adj[i];
            if (nb.length === 0) continue;
            // Distance from boundary in ring index: interior vertex i → ring it belongs to.
            // Approximated by: vertices close to boundary have small ring index.
            // Weight: more interior → higher alpha (more free to move)
            const ringEstimate = i >= boundaryCount ? (i - boundaryCount) / Math.max(1, n - boundaryCount) : 0;
            const alpha = 0.1 + 0.3 * ringEstimate // range [0.1, 0.4]
            ;
            let sx = 0, sy = 0, sz = 0;
            for (const j of nb){
                sx += vertices[j].x;
                sy += vertices[j].y;
                sz += vertices[j].z;
            }
            const inv = 1 / nb.length;
            vertices[i].x += alpha * (sx * inv - vertices[i].x);
            vertices[i].y += alpha * (sy * inv - vertices[i].y);
            vertices[i].z += alpha * (sz * inv - vertices[i].z);
            if (plane) vertices[i] = projectToPlane(vertices[i], plane);
        }
    }
}
// ─────────────────────────────────────────────────────────────────────────────
// Step 10 — Defect correction
// ─────────────────────────────────────────────────────────────────────────────
function filterDegenerates(vertices, triangles, minArea = 1e-18) {
    const valid = [];
    const AB = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector3"](), AC = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector3"](), cross = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector3"]();
    for (const tri of triangles){
        const A = vertices[tri[0]], B = vertices[tri[1]], C = vertices[tri[2]];
        if (!A || !B || !C) continue;
        AB.subVectors(B, A);
        AC.subVectors(C, A);
        cross.crossVectors(AB, AC);
        if (cross.lengthSq() > minArea) valid.push(tri);
    }
    return valid;
}
function fixWinding(vertices, triangles, capNormal) {
    const AB = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector3"](), AC = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector3"](), cross = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector3"]();
    for (const tri of triangles){
        const A = vertices[tri[0]], B = vertices[tri[1]], C = vertices[tri[2]];
        AB.subVectors(B, A);
        AC.subVectors(C, A);
        cross.crossVectors(AB, AC);
        if (cross.dot(capNormal) < 0) {
            // Flip winding
            const tmp = tri[1];
            tri[1] = tri[2];
            tri[2] = tmp;
        }
    }
}
// ─────────────────────────────────────────────────────────────────────────────
// Step 11 — Per-vertex normals with G1 boundary continuity
// ─────────────────────────────────────────────────────────────────────────────
function computePerVertexNormals(vertices, triangles, capNormal, boundaryCount, adjacentNormals) {
    const n = vertices.length;
    const normals = Array.from({
        length: n
    }, ()=>new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector3"]());
    const AB = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector3"](), AC = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector3"]();
    for (const [a, b, c] of triangles){
        const vA = vertices[a], vB = vertices[b], vC = vertices[c];
        AB.subVectors(vB, vA);
        AC.subVectors(vC, vA);
        // Area-weighted face normal
        const faceN = AB.clone().cross(AC);
        normals[a].add(faceN);
        normals[b].add(faceN);
        normals[c].add(faceN);
    }
    for(let i = 0; i < n; i++){
        if (normals[i].lengthSq() > 1e-20) {
            normals[i].normalize();
        } else {
            normals[i].copy(capNormal);
        }
        // Ensure same hemisphere as cap normal
        if (normals[i].dot(capNormal) < 0) normals[i].negate();
        // G1 continuity at boundary: blend with adjacent mesh normal if available
        if (i < boundaryCount && adjacentNormals) {
            const key = quantKey(vertices[i]);
            const adjN = adjacentNormals.get(key);
            if (adjN && adjN.dot(capNormal) > -0.5) {
                // Blend adjacent surface normal into boundary vertex normal
                normals[i].lerp(adjN, 0.4).normalize();
            }
        }
    }
    return normals;
}
// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
function empty() {
    return {
        pos: new Float32Array(0),
        nrm: new Float32Array(0)
    };
}
function projectToPlane(p, plane) {
    const d = p.clone().sub(plane.point).dot(plane.normal);
    return p.clone().addScaledVector(plane.normal, -d);
}
function autoRings(area, avgSpacing) {
    if (avgSpacing < 1e-10) return 2;
    const approxRadius = Math.sqrt(area / Math.PI);
    const rings = Math.round(approxRadius / avgSpacing);
    return Math.max(2, Math.min(8, rings));
}
function quantKey(p, Q = 1e4) {
    return `${Math.round(p.x * Q)},${Math.round(p.y * Q)},${Math.round(p.z * Q)}`;
}
function signedArea2D(pts) {
    let a = 0;
    const n = pts.length;
    for(let i = 0; i < n; i++){
        const p = pts[i], q = pts[(i + 1) % n];
        a += p.x * q.y - q.x * p.y;
    }
    return a * 0.5;
}
function flattenToSoup(vertices, triangles, normals, flipped) {
    const posArr = [];
    const nrmArr = [];
    for (const tri of triangles){
        const [ia, ib, ic] = flipped ? [
            tri[0],
            tri[2],
            tri[1]
        ] : [
            tri[0],
            tri[1],
            tri[2]
        ];
        const A = vertices[ia], B = vertices[ib], C = vertices[ic];
        const nA = flipped ? normals[ia].clone().negate() : normals[ia];
        const nB = flipped ? normals[ib].clone().negate() : normals[ib];
        const nC = flipped ? normals[ic].clone().negate() : normals[ic];
        posArr.push(A.x, A.y, A.z, B.x, B.y, B.z, C.x, C.y, C.z);
        nrmArr.push(nA.x, nA.y, nA.z, nB.x, nB.y, nB.z, nC.x, nC.y, nC.z);
    }
    return {
        pos: new Float32Array(posArr),
        nrm: new Float32Array(nrmArr)
    };
}
}),
"[project]/lib/solid-plane-cut.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "planeFromAxisOffset",
    ()=>planeFromAxisOffset,
    "solidPlaneCut",
    ()=>solidPlaneCut
]);
/**
 * Solid Plane Cut — Corte de sólido por plano (watertight manifold)
 * ------------------------------------------------------------------
 * Implementa o pipeline completo descrito na especificação técnica:
 *   1. Calcular a interseção do plano com todos os triângulos.
 *   2. Gerar segmentos de interseção (directed half-edges).
 *   3. Organizar os segmentos em loops fechados (chain following).
 *   4. Triangular o contorno (Ear Clipping via THREE.ShapeUtils).
 *   5. Criar as faces do CAP com winding correto para cada metade.
 *   6. Soldar vértices duplicados (quantized snapping).
 *   7. Recalcular normais.
 *   8. Garantir que a malha seja watertight.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/three/build/three.core.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$cap$2d$generation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/cap-generation.ts [app-ssr] (ecmascript)");
;
;
function planeFromAxisOffset(bbox, axis, offset, flip = false) {
    const center = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector3"]();
    bbox.getCenter(center);
    const normal = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector3"](axis === 'x' ? 1 : 0, axis === 'y' ? 1 : 0, axis === 'z' ? 1 : 0);
    if (flip) normal.negate();
    const min = bbox.min[axis];
    const max = bbox.max[axis];
    const coord = min + (max - min) * offset;
    const point = center.clone();
    point[axis] = coord;
    return {
        normal,
        point
    };
}
// ---------------------------------------------------------------------------
// Acumulador de triângulos para cada metade do corte
// ---------------------------------------------------------------------------
class SideBuilder {
    pos = [];
    nrm = [];
    pushTri(a, b, c) {
        this.pos.push(a.p.x, a.p.y, a.p.z, b.p.x, b.p.y, b.p.z, c.p.x, c.p.y, c.p.z);
        this.nrm.push(a.n.x, a.n.y, a.n.z, b.n.x, b.n.y, b.n.z, c.n.x, c.n.y, c.n.z);
    }
    pushCapTri(a, b, c, capN) {
        this.pos.push(a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z);
        this.nrm.push(capN.x, capN.y, capN.z, capN.x, capN.y, capN.z, capN.x, capN.y, capN.z);
    }
    toGeometry() {
        const geo = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BufferGeometry"]();
        geo.setAttribute('position', new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Float32BufferAttribute"](this.pos, 3));
        geo.setAttribute('normal', new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Float32BufferAttribute"](this.nrm, 3));
        geo.computeBoundingBox();
        geo.computeBoundingSphere();
        return geo;
    }
}
function planeBasis(n) {
    const a = Math.abs(n.x) < 0.9 ? new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector3"](1, 0, 0) : new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector3"](0, 1, 0);
    const u = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector3"]().crossVectors(a, n).normalize();
    const v = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector3"]().crossVectors(n, u).normalize();
    return {
        u,
        v
    };
}
function lerpVtx(a, b, t) {
    const p = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector3"]().lerpVectors(a.p, b.p, t);
    const nm = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector3"]().lerpVectors(a.n, b.n, t);
    if (nm.lengthSq() > 1e-12) nm.normalize();
    return {
        p,
        n: nm
    };
}
function solidPlaneCut(geometry, planeNormal, planePoint, eps) {
    const n = planeNormal.clone().normalize();
    const posAttr = geometry.getAttribute('position');
    const nrmAttr = geometry.getAttribute('normal');
    const idxAttr = geometry.index;
    const triCount = idxAttr ? idxAttr.count / 3 : posAttr.count / 3;
    if (!geometry.boundingSphere) geometry.computeBoundingSphere();
    const scale = geometry.boundingSphere ? geometry.boundingSphere.radius : 1;
    const EPS = eps ?? Math.max(1e-9, scale * 1e-6);
    const positive = new SideBuilder();
    const negative = new SideBuilder();
    // Armazena segmentos de interseção como pares de pontos [ax,ay,az, bx,by,bz]
    // com direção consistente: visto de +n, o material NEGATIVO fica à ESQUERDA.
    const segFlat = [];
    const idxA = idxAttr ? idxAttr.array : null;
    const tmpFaceN = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector3"]();
    const va = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector3"](), vb = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector3"](), vc = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector3"]();
    const readVtx = (vi, faceN)=>{
        const p = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector3"](posAttr.getX(vi), posAttr.getY(vi), posAttr.getZ(vi));
        let nm;
        if (nrmAttr) {
            nm = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector3"](nrmAttr.getX(vi), nrmAttr.getY(vi), nrmAttr.getZ(vi));
            if (nm.lengthSq() < 1e-12) nm.copy(faceN);
        } else {
            nm = faceN.clone();
        }
        return {
            p,
            n: nm
        };
    };
    // ---------------------------------------------------------------------------
    // PASSO 1-2: classifica e divide cada triângulo pelo plano
    // ---------------------------------------------------------------------------
    for(let f = 0; f < triCount; f++){
        const i0 = idxA ? idxA[f * 3] : f * 3;
        const i1 = idxA ? idxA[f * 3 + 1] : f * 3 + 1;
        const i2 = idxA ? idxA[f * 3 + 2] : f * 3 + 2;
        va.set(posAttr.getX(i0), posAttr.getY(i0), posAttr.getZ(i0));
        vb.set(posAttr.getX(i1), posAttr.getY(i1), posAttr.getZ(i1));
        vc.set(posAttr.getX(i2), posAttr.getY(i2), posAttr.getZ(i2));
        tmpFaceN.crossVectors(vb.clone().sub(va), vc.clone().sub(va));
        if (tmpFaceN.lengthSq() > 1e-20) tmpFaceN.normalize();
        const V = [
            readVtx(i0, tmpFaceN),
            readVtx(i1, tmpFaceN),
            readVtx(i2, tmpFaceN)
        ];
        const d = [
            V[0].p.clone().sub(planePoint).dot(n),
            V[1].p.clone().sub(planePoint).dot(n),
            V[2].p.clone().sub(planePoint).dot(n)
        ];
        // Classifica: snap vértices muito próximos do plano para cima/baixo
        const side = d.map((di)=>di > EPS ? 1 : di < -EPS ? -1 : 0);
        const dMin = Math.min(d[0], d[1], d[2]);
        const dMax = Math.max(d[0], d[1], d[2]);
        // ── Triângulo inteiramente acima (ou coplanar) → lado positivo ──────────
        if (dMin >= -EPS) {
            positive.pushTri(V[0], V[1], V[2]);
            // Aresta coplanar: dois vértices sobre o plano, terceiro acima.
            // Segmento deve ser emitido com o lado NEGATIVO à ESQUERDA visto de +n.
            // Como o winding do triângulo (CCW de +n) tem o positivo à esquerda,
            // a aresta coplanar a→b no sentido CCW deixa o interior positivo à
            // esquerda → inverte para b→a (negativo à esquerda).
            for(let i = 0; i < 3; i++){
                const j = (i + 1) % 3;
                const k = (i + 2) % 3;
                if (side[i] === 0 && side[j] === 0 && side[k] >= 0) {
                    const a = V[i].p, b = V[j].p;
                    if (a.distanceToSquared(b) > EPS * EPS) {
                        // Inverte: emite b→a
                        segFlat.push(b.x, b.y, b.z, a.x, a.y, a.z);
                    }
                }
            }
            continue;
        }
        // ── Triângulo inteiramente abaixo → lado negativo ──────────────────────
        if (dMax <= EPS) {
            negative.pushTri(V[0], V[1], V[2]);
            // Aresta coplanar com terceiro vértice abaixo: emite a→b direto
            // (winding CCW de +n já coloca o negativo à esquerda pois o tri está abaixo)
            for(let i = 0; i < 3; i++){
                const j = (i + 1) % 3;
                const k = (i + 2) % 3;
                if (side[i] === 0 && side[j] === 0 && side[k] <= 0) {
                    const a = V[i].p, b = V[j].p;
                    if (a.distanceToSquared(b) > EPS * EPS) {
                        segFlat.push(a.x, a.y, a.z, b.x, b.y, b.z);
                    }
                }
            }
            continue;
        }
        // ── Straddle: triângulo cruza o plano ──────────────────────────────────
        // Usa clip explícito com rastreamento de quais vértices estão sobre o plano.
        clipTriangle(V, d, side, EPS, positive, negative, segFlat);
    }
    // ---------------------------------------------------------------------------
    // PASSOS 3-4: reconstrói loops fechados a partir dos segmentos
    // ---------------------------------------------------------------------------
    const loops = buildLoops(segFlat, scale, EPS);
    // ---------------------------------------------------------------------------
    // PASSOS 5-7: triangula os loops e gera as tampas
    // ---------------------------------------------------------------------------
    const { u, v } = planeBasis(n);
    let capTriangles = 0;
    if (loops.length > 0) {
        capTriangles = buildCaps(loops, n, u, v, planePoint, positive, negative);
    }
    return {
        positive: positive.toGeometry(),
        negative: negative.toGeometry(),
        capLoops: loops.length,
        capTriangles
    };
}
// ---------------------------------------------------------------------------
// Clip de um triângulo que cruza o plano (Sutherland-Hodgman adaptado)
// ---------------------------------------------------------------------------
function clipTriangle(V, d, side, EPS, positive, negative, segFlat) {
    // Polígonos resultantes do clip: cada vértice carrega se está sobre o plano.
    const posPoly = [];
    const negPoly = [];
    const posOn = [];
    const negOn = [];
    for(let i = 0; i < 3; i++){
        const j = (i + 1) % 3;
        const di = d[i], dj = d[j];
        const si = side[i], sj = side[j];
        const vi = V[i], vj = V[j];
        // Adiciona vértice atual ao lado correto
        if (si >= 0) {
            posPoly.push(vi);
            posOn.push(si === 0);
        }
        if (si <= 0) {
            negPoly.push(vi);
            negOn.push(si === 0);
        }
        // Interseção estrita entre lados opostos (ignora vértices sobre o plano)
        if (si > 0 && sj < 0 || si < 0 && sj > 0) {
            const t = di / (di - dj);
            const ip = lerpVtx(vi, vj, t);
            posPoly.push(ip);
            posOn.push(true);
            negPoly.push(ip);
            negOn.push(true);
        }
    }
    // Fan-triangula o polígono positivo
    for(let i = 1; i + 1 < posPoly.length; i++){
        positive.pushTri(posPoly[0], posPoly[i], posPoly[i + 1]);
    }
    // Fan-triangula o polígono negativo
    for(let i = 1; i + 1 < negPoly.length; i++){
        negative.pushTri(negPoly[0], negPoly[i], negPoly[i + 1]);
    }
    // Extrai o segmento de interseção: aresta de negPoly cujos dois extremos
    // estão sobre o plano, percorrida no sentido CCW do polígono negativo.
    // Isso garante que o material negativo fique à esquerda visto de +n.
    const m = negPoly.length;
    for(let k = 0; k < m; k++){
        const k2 = (k + 1) % m;
        if (negOn[k] && negOn[k2]) {
            const a = negPoly[k].p;
            const b = negPoly[k2].p;
            if (a.distanceToSquared(b) > EPS * EPS) {
                segFlat.push(a.x, a.y, a.z, b.x, b.y, b.z);
            }
        // Continua procurando: pode haver múltiplos pares (ex.: um vértice está
        // exatamente sobre o plano junto com um ponto de interseção).
        }
    }
}
function buildLoops(segFlat, scale, EPS) {
    const segCount = segFlat.length / 6;
    if (segCount === 0) return [];
    // Solda pontos por posição quantizada para eliminar micro-gaps entre
    // segmentos de triângulos adjacentes.
    const Q = 1 / Math.max(scale * 1e-4, 1e-9);
    const keyToId = new Map();
    const idPos = [];
    const idOf = (x, y, z)=>{
        const k = `${Math.round(x * Q)},${Math.round(y * Q)},${Math.round(z * Q)}`;
        let id = keyToId.get(k);
        if (id === undefined) {
            id = idPos.length;
            keyToId.set(k, id);
            idPos.push(new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector3"](x, y, z));
        }
        return id;
    };
    // Constrói grafo direcionado a → [b1, b2, ...], removendo duplicatas.
    // Duplicatas surgem quando dois triângulos compartilham a mesma aresta
    // de corte (aresta interior da malha exatamente sobre o plano).
    const outEdges = new Map();
    const seen = new Set();
    for(let s = 0; s < segCount; s++){
        const o = s * 6;
        const a = idOf(segFlat[o], segFlat[o + 1], segFlat[o + 2]);
        const b = idOf(segFlat[o + 3], segFlat[o + 4], segFlat[o + 5]);
        if (a === b) continue;
        const key = `${a}>${b}`;
        if (seen.has(key)) continue;
        seen.add(key);
        const list = outEdges.get(a);
        if (list) {
            list.push(b);
        } else {
            outEdges.set(a, [
                b
            ]);
        }
    }
    // Chain following: percorre o grafo direcionado extraindo cadeias fechadas.
    // Usa um mapa de "próximo ponteiro" por nó para consumir arestas sem repetir.
    const nextPtr = new Map();
    const loops = [];
    for (const [startNode] of outEdges){
        // Enquanto este nó ainda tiver arestas não consumidas, inicia uma cadeia.
        while(true){
            const ptr = nextPtr.get(startNode) ?? 0;
            const outs = outEdges.get(startNode);
            if (!outs || ptr >= outs.length) break;
            // Percorre a cadeia até fechar o loop ou esgotar as saídas.
            const chain = [];
            let cur = startNode;
            const maxSteps = idPos.length + 4;
            let steps = 0;
            let closed = false;
            while(steps++ < maxSteps){
                const curPtr = nextPtr.get(cur) ?? 0;
                const curOuts = outEdges.get(cur);
                if (!curOuts || curPtr >= curOuts.length) break; // sem saída disponível
                chain.push(cur);
                const next = curOuts[curPtr];
                nextPtr.set(cur, curPtr + 1); // consome a aresta cur→next
                if (next === startNode) {
                    closed = true;
                    break;
                }
                cur = next;
            }
            if (closed && chain.length >= 3) {
                loops.push({
                    pts: chain.map((id)=>idPos[id])
                });
            }
        // Se não fechou, as arestas foram consumidas igualmente — sem loop infinito.
        }
    }
    return loops;
}
function signedArea2D(pts) {
    let a = 0;
    const n = pts.length;
    for(let i = 0; i < n; i++){
        const p = pts[i], q = pts[(i + 1) % n];
        a += p.x * q.y - q.x * p.y;
    }
    return a * 0.5;
}
function pointInPoly(pt, poly) {
    let inside = false;
    for(let i = 0, j = poly.length - 1; i < poly.length; j = i++){
        const xi = poly[i].x, yi = poly[i].y;
        const xj = poly[j].x, yj = poly[j].y;
        const intersect = yi > pt.y !== yj > pt.y && pt.x < (xj - xi) * (pt.y - yi) / (yj - yi + 1e-30) + xi;
        if (intersect) inside = !inside;
    }
    return inside;
}
function buildCaps(loops, n, u, v, planePoint, positive, negative) {
    // ── Determine loop nesting (outer loops vs holes) ─────────────────────────
    const L = loops.map((lp)=>{
        const pts2d = lp.pts.map((p)=>{
            const rel = p.clone().sub(planePoint);
            return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector2"](rel.dot(u), rel.dot(v));
        });
        return {
            pts3d: lp.pts,
            pts2d,
            area: signedArea2D(pts2d)
        };
    });
    const depth = L.map((li, i)=>{
        const rep = li.pts2d[0];
        let d = 0;
        for(let j = 0; j < L.length; j++){
            if (j === i) continue;
            if (Math.abs(L[j].area) <= Math.abs(li.area)) continue;
            if (pointInPoly(rep, L[j].pts2d)) d++;
        }
        return d;
    });
    const outers = [];
    const holesOf = new Map();
    L.forEach((_, i)=>{
        if (depth[i] % 2 === 0) {
            outers.push(i);
            holesOf.set(i, []);
        }
    });
    L.forEach((li, i)=>{
        if (depth[i] % 2 === 1) {
            let best = -1, bestArea = Infinity;
            for (const oi of outers){
                const outerArea = Math.abs(L[oi].area);
                if (outerArea < Math.abs(li.area)) continue;
                if (pointInPoly(li.pts2d[0], L[oi].pts2d) && outerArea < bestArea) {
                    best = oi;
                    bestArea = outerArea;
                }
            }
            if (best >= 0) holesOf.get(best).push(i);
        }
    });
    const plane = {
        normal: n,
        point: planePoint
    };
    let capTriangles = 0;
    for (const oi of outers){
        const outer = L[oi];
        const holeLoops = holesOf.get(oi).map((hi)=>L[hi].pts3d);
        // Normalise outer winding so pts3d runs CCW viewed from +n
        const outerPts = outer.area >= 0 ? outer.pts3d.slice() : outer.pts3d.slice().reverse();
        let negCap;
        let posCap;
        if (holeLoops.length === 0) {
            // ── Simple loop: full high-quality pipeline ──────────────────────────
            negCap = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$cap$2d$generation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["generateCap"])(outerPts, {
                plane,
                flipped: false
            });
            posCap = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$cap$2d$generation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["generateCap"])(outerPts, {
                plane,
                flipped: true
            });
        } else {
            // ── Loop with holes: smoothed contours + ShapeUtils ──────────────────
            negCap = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$cap$2d$generation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["generateCapWithHoles"])(outerPts, holeLoops, n, u, v, planePoint, false);
            posCap = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$cap$2d$generation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["generateCapWithHoles"])(outerPts, holeLoops, n, u, v, planePoint, true);
        }
        // Push negative-side cap — preserve per-vertex normals from generateCap
        const negCount = negCap.pos.length / 9;
        for(let t = 0; t < negCount; t++){
            const o = t * 9;
            negative.pos.push(negCap.pos[o], negCap.pos[o + 1], negCap.pos[o + 2], negCap.pos[o + 3], negCap.pos[o + 4], negCap.pos[o + 5], negCap.pos[o + 6], negCap.pos[o + 7], negCap.pos[o + 8]);
            negative.nrm.push(negCap.nrm[o], negCap.nrm[o + 1], negCap.nrm[o + 2], negCap.nrm[o + 3], negCap.nrm[o + 4], negCap.nrm[o + 5], negCap.nrm[o + 6], negCap.nrm[o + 7], negCap.nrm[o + 8]);
        }
        // Push positive-side cap — preserve per-vertex normals from generateCap
        const posCount = posCap.pos.length / 9;
        for(let t = 0; t < posCount; t++){
            const o = t * 9;
            positive.pos.push(posCap.pos[o], posCap.pos[o + 1], posCap.pos[o + 2], posCap.pos[o + 3], posCap.pos[o + 4], posCap.pos[o + 5], posCap.pos[o + 6], posCap.pos[o + 7], posCap.pos[o + 8]);
            positive.nrm.push(posCap.nrm[o], posCap.nrm[o + 1], posCap.nrm[o + 2], posCap.nrm[o + 3], posCap.nrm[o + 4], posCap.nrm[o + 5], posCap.nrm[o + 6], posCap.nrm[o + 7], posCap.nrm[o + 8]);
        }
        capTriangles += negCount + posCount;
    }
    return capTriangles;
}
}),
"[project]/components/layout/plane-cut-panel.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "PlaneCutPanel",
    ()=>PlaneCutPanel
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$scissors$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Scissors$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/scissors.mjs [app-ssr] (ecmascript) <export default as Scissors>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$flip$2d$horizontal$2d$2$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FlipHorizontal2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/flip-horizontal-2.mjs [app-ssr] (ecmascript) <export default as FlipHorizontal2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/three/build/three.core.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/store.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$solid$2d$plane$2d$cut$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/solid-plane-cut.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
;
;
const AXES = [
    {
        id: 'x',
        label: 'X',
        color: 'oklch(0.65 0.22 25)',
        glow: 'oklch(0.65 0.22 25 / 35%)'
    },
    {
        id: 'y',
        label: 'Y',
        color: 'oklch(0.72 0.20 145)',
        glow: 'oklch(0.72 0.20 145 / 35%)'
    },
    {
        id: 'z',
        label: 'Z',
        color: 'oklch(0.65 0.20 250)',
        glow: 'oklch(0.65 0.20 250 / 35%)'
    }
];
const RULER_TICKS = 20 // divisões da régua
;
function MiniRuler({ value, onChange, modelSize, axisColor }) {
    const trackRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const handlePointerDown = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((e)=>{
        e.currentTarget.setPointerCapture(e.pointerId);
        const rect = trackRef.current.getBoundingClientRect();
        const clamp = (v)=>Math.min(0.98, Math.max(0.02, v));
        onChange(clamp((e.clientX - rect.left) / rect.width));
    }, [
        onChange
    ]);
    const handlePointerMove = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((e)=>{
        if (e.buttons !== 1) return;
        const rect = trackRef.current.getBoundingClientRect();
        const clamp = (v)=>Math.min(0.98, Math.max(0.02, v));
        onChange(clamp((e.clientX - rect.left) / rect.width));
    }, [
        onChange
    ]);
    const mmTotal = modelSize || 100;
    const mmValue = (value * mmTotal).toFixed(1);
    const tickSpacing = 1 / RULER_TICKS;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col gap-1 select-none",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-between",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-[8px] font-mono uppercase tracking-widest",
                        style: {
                            color: 'oklch(0.40 0 0)'
                        },
                        children: "Posição do corte"
                    }, void 0, false, {
                        fileName: "[project]/components/layout/plane-cut-panel.tsx",
                        lineNumber: 52,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-[10px] font-mono tabular-nums font-medium",
                        style: {
                            color: axisColor
                        },
                        children: [
                            mmValue,
                            " mm"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/layout/plane-cut-panel.tsx",
                        lineNumber: 55,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/layout/plane-cut-panel.tsx",
                lineNumber: 51,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                ref: trackRef,
                onPointerDown: handlePointerDown,
                onPointerMove: handlePointerMove,
                className: "relative h-8 rounded-lg cursor-col-resize",
                style: {
                    background: 'oklch(0.12 0 0)',
                    border: '1px solid oklch(0.20 0 0)',
                    userSelect: 'none',
                    touchAction: 'none'
                },
                children: [
                    Array.from({
                        length: RULER_TICKS + 1
                    }).map((_, i)=>{
                        const pos = i / RULER_TICKS;
                        const isMajor = i % 5 === 0;
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "absolute top-0 w-px",
                            style: {
                                left: `${pos * 100}%`,
                                height: isMajor ? '60%' : '35%',
                                background: isMajor ? 'oklch(0.32 0 0)' : 'oklch(0.22 0 0)'
                            }
                        }, i, false, {
                            fileName: "[project]/components/layout/plane-cut-panel.tsx",
                            lineNumber: 78,
                            columnNumber: 13
                        }, this);
                    }),
                    Array.from({
                        length: 5
                    }).map((_, i)=>{
                        const pos = i / 4 * 100;
                        const mm = (i / 4 * mmTotal).toFixed(0);
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "absolute bottom-0.5 font-mono text-[6px] -translate-x-1/2",
                            style: {
                                left: `${pos}%`,
                                color: 'oklch(0.30 0 0)',
                                userSelect: 'none'
                            },
                            children: mm
                        }, i, false, {
                            fileName: "[project]/components/layout/plane-cut-panel.tsx",
                            lineNumber: 95,
                            columnNumber: 13
                        }, this);
                    }),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute top-0 bottom-0 flex flex-col items-center pointer-events-none",
                        style: {
                            left: `${value * 100}%`,
                            transform: 'translateX(-50%)'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "w-0.5 flex-1 rounded-full",
                                style: {
                                    background: axisColor,
                                    boxShadow: `0 0 6px ${axisColor}`
                                }
                            }, void 0, false, {
                                fileName: "[project]/components/layout/plane-cut-panel.tsx",
                                lineNumber: 111,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                width: "8",
                                height: "5",
                                viewBox: "0 0 8 5",
                                className: "shrink-0",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("polygon", {
                                    points: "4,0 8,5 0,5",
                                    fill: axisColor
                                }, void 0, false, {
                                    fileName: "[project]/components/layout/plane-cut-panel.tsx",
                                    lineNumber: 117,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/layout/plane-cut-panel.tsx",
                                lineNumber: 116,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/layout/plane-cut-panel.tsx",
                        lineNumber: 106,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/layout/plane-cut-panel.tsx",
                lineNumber: 61,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex-1 h-0.5 rounded-full",
                        style: {
                            background: 'oklch(0.14 0 0)'
                        },
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "h-full rounded-full transition-all duration-75",
                            style: {
                                width: `${value * 100}%`,
                                background: axisColor
                            }
                        }, void 0, false, {
                            fileName: "[project]/components/layout/plane-cut-panel.tsx",
                            lineNumber: 125,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/layout/plane-cut-panel.tsx",
                        lineNumber: 124,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-[8px] font-mono tabular-nums",
                        style: {
                            color: 'oklch(0.35 0 0)'
                        },
                        children: [
                            Math.round(value * 100),
                            "%"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/layout/plane-cut-panel.tsx",
                        lineNumber: 130,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/layout/plane-cut-panel.tsx",
                lineNumber: 123,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/layout/plane-cut-panel.tsx",
        lineNumber: 49,
        columnNumber: 5
    }, this);
}
function PlaneCutPanel() {
    const { activeTool, modelMesh, modelInfo, cutPlaneAxis, cutPlaneOffset, cutPlaneFlip, setCutPlaneAxis, setCutPlaneOffset, toggleCutPlaneFlip, setModelMesh, setModelInfo, addCutPart, cutParts, setStatus, pushHistory, clearSelection } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAppStore"])();
    // Tamanho do modelo no eixo selecionado para a régua — deve estar antes de qualquer return
    const modelSizeMm = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        if (!modelMesh) return 100;
        const geo = modelMesh.geometry;
        if (!geo.boundingBox) geo.computeBoundingBox();
        const bb = geo.boundingBox;
        const size = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector3"]();
        bb.getSize(size);
        return cutPlaneAxis === 'x' ? size.x : cutPlaneAxis === 'y' ? size.y : size.z;
    }, [
        modelMesh,
        cutPlaneAxis
    ]);
    if (activeTool !== 'cut' || !modelMesh) return null;
    const axisInfo = AXES.find((a)=>a.id === cutPlaneAxis);
    const handleExecute = ()=>{
        if (!modelMesh) return;
        pushHistory();
        setStatus('cutting', 'Executando corte de sólido (watertight)...');
        // rAF para não travar o frame corrente
        requestAnimationFrame(()=>setTimeout(()=>{
                const geo = modelMesh.geometry;
                if (!geo.boundingBox) geo.computeBoundingBox();
                const bbox = geo.boundingBox;
                const { normal, point } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$solid$2d$plane$2d$cut$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["planeFromAxisOffset"])(bbox, cutPlaneAxis, cutPlaneOffset, cutPlaneFlip);
                let result;
                try {
                    result = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$solid$2d$plane$2d$cut$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["solidPlaneCut"])(geo, normal, point);
                } catch (err) {
                    console.error('[PlaneCut] Erro no corte de sólido:', err);
                    setStatus('error', 'Falha ao cortar o sólido.');
                    return;
                }
                const { positive, negative, capLoops, capTriangles } = result;
                const posCount = positive.getAttribute('position')?.count ?? 0;
                const negCount = negative.getAttribute('position')?.count ?? 0;
                if (posCount === 0 || negCount === 0) {
                    setStatus('error', 'O plano não intercepta o modelo. Ajuste a posição do corte.');
                    return;
                }
                const mainMat = modelMesh.material.clone();
                mainMat.side = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DoubleSide"];
                mainMat.needsUpdate = true;
                const mainMesh = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Mesh"](positive, mainMat);
                mainMesh.position.copy(modelMesh.position);
                mainMesh.rotation.copy(modelMesh.rotation);
                mainMesh.scale.copy(modelMesh.scale);
                mainMesh.castShadow = true;
                mainMesh.receiveShadow = true;
                const partMat = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MeshStandardMaterial"]({
                    color: new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Color"]('#ff6600'),
                    roughness: 0.55,
                    metalness: 0.10,
                    side: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DoubleSide"]
                });
                const partMesh = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Mesh"](negative, partMat);
                partMesh.position.copy(modelMesh.position);
                partMesh.rotation.copy(modelMesh.rotation);
                partMesh.scale.copy(modelMesh.scale);
                partMesh.castShadow = true;
                partMesh.receiveShadow = true;
                const size = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector3"]();
                bbox.getSize(size);
                const spread = Math.max(size.x, size.y, size.z) * 0.18;
                partMesh.position.add(normal.clone().multiplyScalar(-spread));
                setModelMesh(mainMesh);
                if (modelInfo) {
                    const bb = positive.boundingBox;
                    const s = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector3"]();
                    bb?.getSize(s);
                    setModelInfo({
                        ...modelInfo,
                        vertices: posCount,
                        faces: Math.floor(posCount / 3),
                        width: bb ? parseFloat(s.x.toFixed(2)) : modelInfo.width,
                        height: bb ? parseFloat(s.y.toFixed(2)) : modelInfo.height,
                        depth: bb ? parseFloat(s.z.toFixed(2)) : modelInfo.depth
                    });
                }
                addCutPart({
                    id: `plane-${Date.now()}`,
                    name: `Metade ${cutParts.length + 1}`,
                    mesh: partMesh,
                    faceIndices: [],
                    color: '#ff6600'
                });
                clearSelection();
                setStatus('loaded', `Corte concluído — 2 peças fechadas · ${capLoops} contorno(s) · ${capTriangles.toLocaleString()} triângulos de tampa`);
            }, 20));
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "absolute bottom-10 left-1/2 -translate-x-1/2 z-20 animate-fade-in pointer-events-auto",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex flex-col gap-3 p-3.5 rounded-2xl border",
            style: {
                background: 'oklch(0.09 0 0 / 97%)',
                backdropFilter: 'blur(24px) saturate(1.4)',
                borderColor: 'oklch(0.18 0 0)',
                boxShadow: '0 8px 40px oklch(0 0 0 / 55%), inset 0 1px 0 oklch(1 0 0 / 4%)',
                minWidth: '340px'
            },
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center justify-between",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "w-1.5 h-4 rounded-full",
                                    style: {
                                        background: axisInfo.color,
                                        boxShadow: `0 0 8px ${axisInfo.glow}`
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/components/layout/plane-cut-panel.tsx",
                                    lineNumber: 280,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-[10px] font-mono uppercase tracking-widest text-muted-foreground",
                                    children: "Corte por plano"
                                }, void 0, false, {
                                    fileName: "[project]/components/layout/plane-cut-panel.tsx",
                                    lineNumber: 284,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/layout/plane-cut-panel.tsx",
                            lineNumber: 279,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "text-[8px] font-mono px-1.5 py-0.5 rounded-md",
                            style: {
                                background: 'oklch(0.14 0 0)',
                                color: 'oklch(0.40 0 0)'
                            },
                            children: "watertight"
                        }, void 0, false, {
                            fileName: "[project]/components/layout/plane-cut-panel.tsx",
                            lineNumber: 288,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/layout/plane-cut-panel.tsx",
                    lineNumber: 278,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center gap-2",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "text-[8px] font-mono uppercase tracking-widest w-8",
                            style: {
                                color: 'oklch(0.35 0 0)'
                            },
                            children: "Eixo"
                        }, void 0, false, {
                            fileName: "[project]/components/layout/plane-cut-panel.tsx",
                            lineNumber: 298,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex gap-1 flex-1",
                            children: AXES.map((ax)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setCutPlaneAxis(ax.id),
                                    className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])('flex-1 rounded-xl py-1.5 text-xs font-mono font-semibold transition-all duration-150', cutPlaneAxis === ax.id ? 'text-background' : 'border text-muted-foreground/50 hover:text-muted-foreground'),
                                    style: cutPlaneAxis === ax.id ? {
                                        background: ax.color,
                                        boxShadow: `0 0 12px ${ax.glow}`,
                                        borderColor: 'transparent'
                                    } : {
                                        borderColor: 'oklch(0.18 0 0)'
                                    },
                                    "aria-pressed": cutPlaneAxis === ax.id,
                                    children: ax.label
                                }, ax.id, false, {
                                    fileName: "[project]/components/layout/plane-cut-panel.tsx",
                                    lineNumber: 303,
                                    columnNumber: 15
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/components/layout/plane-cut-panel.tsx",
                            lineNumber: 301,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/layout/plane-cut-panel.tsx",
                    lineNumber: 297,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(MiniRuler, {
                    value: cutPlaneOffset,
                    onChange: setCutPlaneOffset,
                    modelSize: modelSizeMm,
                    axisColor: axisInfo.color
                }, void 0, false, {
                    fileName: "[project]/components/layout/plane-cut-panel.tsx",
                    lineNumber: 326,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center gap-2 pt-0.5",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: toggleCutPlaneFlip,
                            title: "Inverte qual metade fica com o modelo principal",
                            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])('flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-mono transition-all duration-150', cutPlaneFlip ? 'text-background' : 'border text-muted-foreground/50 hover:text-muted-foreground'),
                            style: cutPlaneFlip ? {
                                background: 'oklch(0.45 0.05 250)',
                                borderColor: 'transparent'
                            } : {
                                borderColor: 'oklch(0.18 0 0)'
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$flip$2d$horizontal$2d$2$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FlipHorizontal2$3e$__["FlipHorizontal2"], {
                                    className: "w-3.5 h-3.5"
                                }, void 0, false, {
                                    fileName: "[project]/components/layout/plane-cut-panel.tsx",
                                    lineNumber: 350,
                                    columnNumber: 13
                                }, this),
                                "Inverter"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/layout/plane-cut-panel.tsx",
                            lineNumber: 335,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: handleExecute,
                            className: "flex items-center justify-center gap-2 flex-1 px-4 py-2 rounded-xl text-[12px] font-mono font-semibold text-background hover:opacity-90 transition-all duration-150",
                            style: {
                                background: axisInfo.color,
                                boxShadow: `0 0 16px ${axisInfo.glow}`
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$scissors$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Scissors$3e$__["Scissors"], {
                                    className: "w-3.5 h-3.5"
                                }, void 0, false, {
                                    fileName: "[project]/components/layout/plane-cut-panel.tsx",
                                    lineNumber: 362,
                                    columnNumber: 13
                                }, this),
                                "Executar corte"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/layout/plane-cut-panel.tsx",
                            lineNumber: 354,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/layout/plane-cut-panel.tsx",
                    lineNumber: 334,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/components/layout/plane-cut-panel.tsx",
            lineNumber: 267,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/components/layout/plane-cut-panel.tsx",
        lineNumber: 266,
        columnNumber: 5
    }, this);
}
}),
"[project]/lib/auto-split.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "makePinPositions",
    ()=>makePinPositions,
    "performSplit",
    ()=>performSplit,
    "pickLongestAxis",
    ()=>pickLongestAxis,
    "planAutoSplit",
    ()=>planAutoSplit
]);
/**
 * Auto Split Engine — Sugestão automática de cortes por geometria
 * ---------------------------------------------------------------
 * Analisa a malha e sugere planos de corte nas SEÇÕES TRANSVERSAIS MÍNIMAS
 * (pescoços / junções naturais), onde a costura de impressão fica discreta e
 * a peça é fisicamente mais fácil de dividir.
 *
 * Pipeline:
 *   1. Escolhe o eixo de corte (automático = eixo mais longo).
 *   2. Varre a bounding box em N fatias e estima a área da seção transversal
 *      de cada fatia (envelope varrido dos triângulos que a cruzam).
 *   3. Suaviza o perfil e detecta vales (mínimos locais de área).
 *   4. Classifica os vales por "proeminência" (quão profundo é o pescoço) e
 *      seleciona os melhores respeitando separação mínima e sensibilidade.
 *   5. Para cada corte, calcula o centro sólido da seção (para posicionar os
 *      pinos de alinhamento) e a meia-extensão perpendicular.
 *
 * O corte físico watertight reaproveita `solidPlaneCut`.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/three/build/three.core.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$solid$2d$plane$2d$cut$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/solid-plane-cut.ts [app-ssr] (ecmascript)");
;
;
const PERP = {
    x: [
        'y',
        'z'
    ],
    y: [
        'x',
        'z'
    ],
    z: [
        'x',
        'y'
    ]
};
const AXIS_IDX = {
    x: 0,
    y: 1,
    z: 2
};
function comp(attr, i, c) {
    return c === 0 ? attr.getX(i) : c === 1 ? attr.getY(i) : attr.getZ(i);
}
function pickLongestAxis(bbox) {
    const s = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector3"]();
    bbox.getSize(s);
    if (s.x >= s.y && s.x >= s.z) return 'x';
    if (s.y >= s.x && s.y >= s.z) return 'y';
    return 'z';
}
function planAutoSplit(geometry, opts) {
    const pos = geometry.getAttribute('position');
    if (!geometry.boundingBox) geometry.computeBoundingBox();
    const bbox = geometry.boundingBox.clone();
    const axis = opts.axis === 'auto' ? pickLongestAxis(bbox) : opts.axis;
    const ai = AXIS_IDX[axis];
    const [ua, va] = PERP[axis];
    const ui = AXIS_IDX[ua];
    const vi = AXIS_IDX[va];
    const size = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector3"]();
    bbox.getSize(size);
    const axisMin = comp3(bbox.min, ai);
    const axisLen = size.getComponent(ai) || 1;
    const samples = Math.max(48, Math.min(opts.samples ?? 220, 400));
    // Envelope perpendicular varrido por triângulo (silhueta do sólido por fatia)
    const uMinB = new Float64Array(samples).fill(Infinity);
    const uMaxB = new Float64Array(samples).fill(-Infinity);
    const vMinB = new Float64Array(samples).fill(Infinity);
    const vMaxB = new Float64Array(samples).fill(-Infinity);
    // Centroide sólido por fatia (média dos vértices)
    const sumU = new Float64Array(samples);
    const sumV = new Float64Array(samples);
    const cnt = new Float64Array(samples);
    const idx = geometry.index;
    const triCount = idx ? idx.count / 3 : pos.count / 3;
    const idxArr = idx ? idx.array : null;
    const binOf = (coord)=>{
        const t = (coord - axisMin) / axisLen;
        let b = Math.floor(t * samples);
        if (b < 0) b = 0;
        if (b >= samples) b = samples - 1;
        return b;
    };
    // ── Passo 2: varredura de triângulos ─────────────────────────────────────
    for(let f = 0; f < triCount; f++){
        const i0 = idxArr ? idxArr[f * 3] : f * 3;
        const i1 = idxArr ? idxArr[f * 3 + 1] : f * 3 + 1;
        const i2 = idxArr ? idxArr[f * 3 + 2] : f * 3 + 2;
        const a0 = comp(pos, i0, ai), a1 = comp(pos, i1, ai), a2 = comp(pos, i2, ai);
        const u0 = comp(pos, i0, ui), u1 = comp(pos, i1, ui), u2 = comp(pos, i2, ui);
        const v0 = comp(pos, i0, vi), v1 = comp(pos, i1, vi), v2 = comp(pos, i2, vi);
        const tmin = Math.min(a0, a1, a2);
        const tmax = Math.max(a0, a1, a2);
        const uLo = Math.min(u0, u1, u2), uHi = Math.max(u0, u1, u2);
        const vLo = Math.min(v0, v1, v2), vHi = Math.max(v0, v1, v2);
        const b0 = binOf(tmin);
        const b1 = binOf(tmax);
        for(let b = b0; b <= b1; b++){
            if (uLo < uMinB[b]) uMinB[b] = uLo;
            if (uHi > uMaxB[b]) uMaxB[b] = uHi;
            if (vLo < vMinB[b]) vMinB[b] = vLo;
            if (vHi > vMaxB[b]) vMaxB[b] = vHi;
        }
    }
    // ── Centroide sólido por fatia (loop de vértices) ────────────────────────
    for(let i = 0; i < pos.count; i++){
        const b = binOf(comp(pos, i, ai));
        sumU[b] += comp(pos, i, ui);
        sumV[b] += comp(pos, i, vi);
        cnt[b] += 1;
    }
    // ── Perfil de área (com preenchimento de fatias vazias) ──────────────────
    const rawArea = new Float64Array(samples);
    for(let b = 0; b < samples; b++){
        if (uMaxB[b] > uMinB[b] && vMaxB[b] > vMinB[b]) {
            rawArea[b] = (uMaxB[b] - uMinB[b]) * (vMaxB[b] - vMinB[b]);
        } else {
            rawArea[b] = NaN;
        }
    }
    fillGaps(rawArea);
    // ── Suavização (média móvel) ─────────────────────────────────────────────
    const smoothWin = Math.max(1, Math.round(samples * 0.02));
    const area = movingAverage(rawArea, smoothWin);
    let maxArea = 0;
    for(let b = 0; b < samples; b++)if (area[b] > maxArea) maxArea = area[b];
    if (maxArea <= 0) maxArea = 1;
    // ── Passo 3-4: detecta vales e calcula proeminência ──────────────────────
    const edge = Math.round(samples * 0.06);
    const r = Math.max(2, Math.round(samples * 0.025));
    const promWin = Math.max(4, Math.round(samples * 0.18));
    const valleys = [];
    for(let b = edge; b < samples - edge; b++){
        let isMin = true;
        for(let k = b - r; k <= b + r; k++){
            if (k < 0 || k >= samples) continue;
            if (area[k] < area[b] - 1e-9) {
                isMin = false;
                break;
            }
        }
        if (!isMin) continue;
        // Evita duplicar platôs: exige que seja o início do vale
        if (b > 0 && area[b - 1] < area[b] - 1e-9) continue;
        let leftPeak = area[b];
        for(let k = b; k >= Math.max(0, b - promWin); k--)if (area[k] > leftPeak) leftPeak = area[k];
        let rightPeak = area[b];
        for(let k = b; k <= Math.min(samples - 1, b + promWin); k++)if (area[k] > rightPeak) rightPeak = area[k];
        const prom = Math.min(leftPeak, rightPeak) - area[b];
        valleys.push({
            b,
            area: area[b],
            prom: prom / maxArea
        });
    }
    // Ordena por proeminência (pescoços mais fundos primeiro)
    valleys.sort((p, q)=>q.prom - p.prom);
    const threshold = lerp(0.12, 0.004, clamp01(opts.sensitivity));
    const minGap = Math.max(3, Math.round(samples * 0.08));
    const chosen = [];
    const accept = (v)=>{
        for (const c of chosen)if (Math.abs(c.b - v.b) < minGap) return false;
        return true;
    };
    for (const v of valleys){
        if (chosen.length >= opts.maxCuts) break;
        if (v.prom < threshold) continue;
        if (accept(v)) chosen.push(v);
    }
    // Garante ao menos uma sugestão (o mínimo global) mesmo em peças uniformes
    if (chosen.length === 0 && valleys.length > 0) {
        // valleys[0] já é o de maior proeminência; se todos forem baixos, pega o
        // de menor área absoluta como fallback do "mínimo global".
        let best = valleys[0];
        for (const v of valleys)if (v.area < best.area) best = v;
        chosen.push(best);
    }
    // Ordena os cortes escolhidos ao longo do eixo
    chosen.sort((p, q)=>p.b - q.b);
    const centerAt = (b)=>{
        let cu, cv;
        if (cnt[b] > 0) {
            cu = sumU[b] / cnt[b];
            cv = sumV[b] / cnt[b];
        } else {
            cu = (uMinB[b] + uMaxB[b]) / 2;
            cv = (vMinB[b] + vMaxB[b]) / 2;
        }
        const coord = axisMin + (b + 0.5) / samples * axisLen;
        const out = [
            0,
            0,
            0
        ];
        out[ai] = coord;
        out[ui] = Number.isFinite(cu) ? cu : comp3(bboxCenter(bbox), ui);
        out[vi] = Number.isFinite(cv) ? cv : comp3(bboxCenter(bbox), vi);
        return out;
    };
    const cuts = chosen.map((v)=>{
        const coord = axisMin + (v.b + 0.5) / samples * axisLen;
        const halfU = Number.isFinite(uMaxB[v.b]) ? (uMaxB[v.b] - uMinB[v.b]) / 2 : 0;
        const halfV = Number.isFinite(vMaxB[v.b]) ? (vMaxB[v.b] - vMinB[v.b]) / 2 : 0;
        return {
            offset: (coord - axisMin) / axisLen,
            coord,
            area: v.area,
            prominence: v.prom,
            center: centerAt(v.b),
            halfU,
            halfV
        };
    });
    const profile = [];
    for(let b = 0; b < samples; b++){
        profile.push({
            coord: axisMin + (b + 0.5) / samples * axisLen,
            area: area[b]
        });
    }
    const normal = [
        0,
        0,
        0
    ];
    normal[ai] = 1;
    return {
        axis,
        normal,
        cuts,
        profile,
        maxArea
    };
}
function performSplit(geometry, plan) {
    const normal = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector3"](plan.normal[0], plan.normal[1], plan.normal[2]);
    const cuts = [
        ...plan.cuts
    ].sort((a, b)=>a.coord - b.coord);
    const pieces = [];
    let remaining = geometry;
    for (const cut of cuts){
        const point = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector3"](cut.center[0], cut.center[1], cut.center[2]);
        let res;
        try {
            res = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$solid$2d$plane$2d$cut$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["solidPlaneCut"])(remaining, normal, point);
        } catch  {
            continue;
        }
        const negCount = res.negative.getAttribute('position')?.count ?? 0;
        const posCount = res.positive.getAttribute('position')?.count ?? 0;
        if (negCount === 0 || posCount === 0) continue;
        pieces.push(res.negative);
        remaining = res.positive;
    }
    pieces.push(remaining);
    return pieces;
}
function makePinPositions(plan, cut, count) {
    const base = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector3"](cut.center[0], cut.center[1], cut.center[2]);
    if (count <= 1) return [
        base
    ];
    const [ua, va] = PERP[plan.axis];
    const useU = cut.halfU >= cut.halfV;
    const alongIdx = AXIS_IDX[useU ? ua : va];
    const half = useU ? cut.halfU : cut.halfV;
    const d = Math.max(half * 0.45, 0);
    const p1 = base.clone();
    p1.setComponent(alongIdx, base.getComponent(alongIdx) - d);
    const p2 = base.clone();
    p2.setComponent(alongIdx, base.getComponent(alongIdx) + d);
    return [
        p1,
        p2
    ];
}
// ─── Helpers ────────────────────────────────────────────────────────────────
function comp3(v, c) {
    return c === 0 ? v.x : c === 1 ? v.y : v.z;
}
function bboxCenter(b) {
    const c = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector3"]();
    b.getCenter(c);
    return c;
}
function clamp01(x) {
    return x < 0 ? 0 : x > 1 ? 1 : x;
}
function lerp(a, b, t) {
    return a + (b - a) * t;
}
/** Preenche valores NaN por interpolação linear com vizinhos válidos. */ function fillGaps(arr) {
    const n = arr.length;
    let i = 0;
    while(i < n){
        if (!Number.isNaN(arr[i])) {
            i++;
            continue;
        }
        let j = i;
        while(j < n && Number.isNaN(arr[j]))j++;
        const left = i - 1 >= 0 ? arr[i - 1] : j < n ? arr[j] : 0;
        const right = j < n ? arr[j] : left;
        const span = j - i + 1;
        for(let k = i; k < j; k++){
            const t = (k - i + 1) / span;
            arr[k] = left + (right - left) * t;
        }
        i = j;
    }
}
function movingAverage(arr, win) {
    const n = arr.length;
    const out = new Float64Array(n);
    for(let i = 0; i < n; i++){
        let s = 0;
        let c = 0;
        for(let k = i - win; k <= i + win; k++){
            if (k < 0 || k >= n) continue;
            s += arr[k];
            c++;
        }
        out[i] = c > 0 ? s / c : arr[i];
    }
    return out;
}
}),
"[project]/components/layout/auto-split-panel.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AutoSplitPanel",
    ()=>AutoSplitPanel
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$wand$2d$sparkles$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Wand2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/wand-sparkles.mjs [app-ssr] (ecmascript) <export default as Wand2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$scan$2d$line$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ScanLine$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/scan-line.mjs [app-ssr] (ecmascript) <export default as ScanLine>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$boxes$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Boxes$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/boxes.mjs [app-ssr] (ecmascript) <export default as Boxes>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$pin$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Pin$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/pin.mjs [app-ssr] (ecmascript) <export default as Pin>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/three/build/three.core.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2d$bvh$2d$csg$2f$src$2f$core$2f$Evaluator$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/three-bvh-csg/src/core/Evaluator.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2d$bvh$2d$csg$2f$src$2f$core$2f$Brush$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/three-bvh-csg/src/core/Brush.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2d$bvh$2d$csg$2f$src$2f$core$2f$constants$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/three-bvh-csg/src/core/constants.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/store.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auto$2d$split$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/auto-split.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
;
;
;
const AXES = [
    {
        id: 'auto',
        label: 'Auto'
    },
    {
        id: 'x',
        label: 'X'
    },
    {
        id: 'y',
        label: 'Y'
    },
    {
        id: 'z',
        label: 'Z'
    }
];
// Paleta para distinguir as peças no modo explodido (sem roxo/violeta)
const PALETTE = [
    '#ff6600',
    '#00b4d8',
    '#43aa8b',
    '#f9c74f',
    '#ef476f',
    '#4d96ff',
    '#f3722c',
    '#90be6d'
];
function AutoSplitPanel() {
    const { activeTool, modelMesh, modelInfo, autoSplitPlan, setAutoSplitPlan, setModelMesh, setModelInfo, addCutPart, setStatus, pushHistory, clearSelection } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAppStore"])();
    const [axis, setAxis] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('auto');
    const [maxCuts, setMaxCuts] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(3);
    const [sensitivity, setSensitivity] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0.5);
    const [usePins, setUsePins] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const [pinDiameter, setPinDiameter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(4);
    const [pinDepth, setPinDepth] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(6);
    const [pinTolerance, setPinTolerance] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0.15);
    const [pinCount, setPinCount] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(2);
    const [spacing, setSpacing] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0.25);
    const [busy, setBusy] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    if (activeTool !== 'autosplit' || !modelMesh) return null;
    const handleAnalyze = ()=>{
        if (!modelMesh) return;
        setBusy(true);
        setStatus('selecting', 'Analisando geometria — buscando seções mínimas...');
        setTimeout(()=>{
            try {
                const geo = modelMesh.geometry;
                const plan = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auto$2d$split$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["planAutoSplit"])(geo, {
                    axis,
                    maxCuts,
                    sensitivity
                });
                setAutoSplitPlan(plan);
                const n = plan.cuts.length;
                setStatus('loaded', n > 0 ? `${n} corte(s) sugerido(s) no eixo ${plan.axis.toUpperCase()} — revise e execute` : 'Nenhum pescoço encontrado. Aumente a sensibilidade.');
            } catch (err) {
                console.log('[v0] Erro na análise Auto Split:', err.message);
                setStatus('error', 'Falha ao analisar a geometria.');
            } finally{
                setBusy(false);
            }
        }, 40);
    };
    const handleExecute = ()=>{
        if (!modelMesh) return;
        setBusy(true);
        pushHistory();
        setStatus('cutting', 'Dividindo modelo e gerando pinos de alinhamento...');
        setTimeout(()=>{
            try {
                const geo = modelMesh.geometry;
                const plan = autoSplitPlan ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auto$2d$split$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["planAutoSplit"])(geo, {
                    axis,
                    maxCuts,
                    sensitivity
                });
                if (plan.cuts.length === 0) {
                    setStatus('error', 'Nenhum corte sugerido. Ajuste a sensibilidade e analise novamente.');
                    setBusy(false);
                    return;
                }
                const pieces = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auto$2d$split$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["performSplit"])(geo, plan);
                if (pieces.length < 2) {
                    setStatus('error', 'Não foi possível dividir — os planos não interceptam o sólido.');
                    setBusy(false);
                    return;
                }
                const normal = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector3"](plan.normal[0], plan.normal[1], plan.normal[2]);
                const sortedCuts = [
                    ...plan.cuts
                ].sort((a, b)=>a.coord - b.coord);
                // ── Pinos de alinhamento (furos via CSG + dowel separado) ──────────
                const dowels = [];
                let pinsOk = true;
                if (usePins) {
                    try {
                        const evaluator = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2d$bvh$2d$csg$2f$src$2f$core$2f$Evaluator$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Evaluator"]();
                        evaluator.attributes = [
                            'position',
                            'normal'
                        ];
                        const quat = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Quaternion"]().setFromUnitVectors(new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector3"](0, 1, 0), normal);
                        const rHole = pinDiameter / 2 + pinTolerance;
                        const rDowel = pinDiameter / 2;
                        const holeH = pinDepth * 2 + Math.max(pinDepth * 0.2, 0.5);
                        const dowelH = pinDepth * 2 - 0.4;
                        for(let k = 0; k < sortedCuts.length && k + 1 < pieces.length; k++){
                            const cut = sortedCuts[k];
                            const positions = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auto$2d$split$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["makePinPositions"])(plan, cut, pinCount);
                            for (const p of positions){
                                const holeGeo = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CylinderGeometry"](rHole, rHole, holeH, 28);
                                holeGeo.deleteAttribute('uv');
                                const holeBrush = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2d$bvh$2d$csg$2f$src$2f$core$2f$Brush$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Brush"](holeGeo);
                                holeBrush.position.copy(p);
                                holeBrush.quaternion.copy(quat);
                                holeBrush.updateMatrixWorld();
                                // Subtrai o furo das duas peças adjacentes (k e k+1)
                                for (const pi of [
                                    k,
                                    k + 1
                                ]){
                                    const pieceBrush = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2d$bvh$2d$csg$2f$src$2f$core$2f$Brush$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Brush"](pieces[pi]);
                                    pieceBrush.updateMatrixWorld();
                                    const out = evaluator.evaluate(pieceBrush, holeBrush, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2d$bvh$2d$csg$2f$src$2f$core$2f$constants$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SUBTRACTION"]);
                                    pieces[pi] = out.geometry;
                                }
                                dowels.push({
                                    pos: p.clone(),
                                    quat: quat.clone(),
                                    radius: rDowel,
                                    height: dowelH
                                });
                                holeGeo.dispose();
                            }
                        }
                    } catch (err) {
                        console.log('[v0] CSG de pinos falhou, seguindo sem furos:', err.message);
                        pinsOk = false;
                    }
                }
                // ── Monta as peças no viewport (base fica como modelo principal) ────
                const geoBox = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Box3"]().setFromBufferAttribute(geo.getAttribute('position'));
                const size = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector3"]();
                geoBox.getSize(size);
                const maxDim = Math.max(size.x, size.y, size.z) || 1;
                const spread = maxDim * spacing;
                pieces.forEach((g)=>{
                    g.computeVertexNormals();
                    g.computeBoundingBox();
                    g.computeBoundingSphere();
                });
                // Peça 0 (base) → modelo principal
                const mainMat = modelMesh.material.clone();
                mainMat.side = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DoubleSide"];
                mainMat.needsUpdate = true;
                const mainMesh = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Mesh"](pieces[0], mainMat);
                mainMesh.position.copy(modelMesh.position);
                mainMesh.rotation.copy(modelMesh.rotation);
                mainMesh.scale.copy(modelMesh.scale);
                setModelMesh(mainMesh);
                if (modelInfo) {
                    const bb = pieces[0].boundingBox;
                    const s = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector3"]();
                    bb?.getSize(s);
                    const count = pieces[0].getAttribute('position')?.count ?? 0;
                    setModelInfo({
                        ...modelInfo,
                        vertices: count,
                        faces: Math.floor(count / 3),
                        width: bb ? parseFloat(s.x.toFixed(2)) : modelInfo.width,
                        height: bb ? parseFloat(s.y.toFixed(2)) : modelInfo.height,
                        depth: bb ? parseFloat(s.z.toFixed(2)) : modelInfo.depth
                    });
                }
                // Peças 1..n → partes separadas coloridas, afastadas (exploded)
                for(let i = 1; i < pieces.length; i++){
                    const color = PALETTE[i % PALETTE.length];
                    const mat = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MeshStandardMaterial"]({
                        color: new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Color"](color),
                        roughness: 0.6,
                        metalness: 0.1,
                        side: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DoubleSide"]
                    });
                    const mesh = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Mesh"](pieces[i], mat);
                    mesh.position.copy(modelMesh.position);
                    mesh.rotation.copy(modelMesh.rotation);
                    mesh.scale.copy(modelMesh.scale);
                    mesh.position.add(normal.clone().multiplyScalar(spread * i));
                    addCutPart({
                        id: `auto-${Date.now()}-${i}`,
                        name: `Peça ${i + 1}`,
                        mesh,
                        faceIndices: [],
                        color
                    });
                }
                // Pinos (dowels) → peças cilíndricas separadas, no vão da junta
                dowels.forEach((d, i)=>{
                    const dGeo = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CylinderGeometry"](d.radius, d.radius, d.height, 28);
                    const m = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Matrix4"]().compose(d.pos, d.quat, new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector3"](1, 1, 1));
                    dGeo.applyMatrix4(m);
                    dGeo.computeVertexNormals();
                    const mat = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MeshStandardMaterial"]({
                        color: new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Color"]('#c0c4cc'),
                        roughness: 0.35,
                        metalness: 0.6,
                        side: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DoubleSide"]
                    });
                    const mesh = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Mesh"](dGeo, mat);
                    mesh.position.copy(modelMesh.position);
                    mesh.rotation.copy(modelMesh.rotation);
                    mesh.scale.copy(modelMesh.scale);
                    addCutPart({
                        id: `pin-${Date.now()}-${i}`,
                        name: `Pino ${i + 1}`,
                        mesh,
                        faceIndices: [],
                        color: '#c0c4cc'
                    });
                });
                setAutoSplitPlan(null);
                clearSelection();
                const pinMsg = usePins ? pinsOk ? ` · ${dowels.length} pino(s) de alinhamento` : ' · pinos ignorados (falha no booleano)' : '';
                setStatus('loaded', `Divisão automática concluída — ${pieces.length} peças${pinMsg}`);
            } catch (err) {
                console.log('[v0] Erro na execução Auto Split:', err.message);
                setStatus('error', 'Falha ao dividir o modelo.');
            } finally{
                setBusy(false);
            }
        }, 60);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "absolute bottom-10 left-1/2 -translate-x-1/2 z-20 animate-fade-in pointer-events-auto",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex flex-col gap-3 p-3 rounded-xl border w-[380px]",
            style: {
                background: 'oklch(0.10 0 0 / 95%)',
                backdropFilter: 'blur(16px)',
                borderColor: 'oklch(0.22 0 0)',
                boxShadow: '0 8px 32px oklch(0 0 0 / 60%)'
            },
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center justify-between",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-muted-foreground",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$wand$2d$sparkles$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Wand2$3e$__["Wand2"], {
                                    className: "w-3.5 h-3.5"
                                }, void 0, false, {
                                    fileName: "[project]/components/layout/auto-split-panel.tsx",
                                    lineNumber: 269,
                                    columnNumber: 13
                                }, this),
                                "Divisão automática"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/layout/auto-split-panel.tsx",
                            lineNumber: 268,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "text-[10px] font-mono text-muted-foreground/50",
                            children: "seção mínima"
                        }, void 0, false, {
                            fileName: "[project]/components/layout/auto-split-panel.tsx",
                            lineNumber: 272,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/layout/auto-split-panel.tsx",
                    lineNumber: 267,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center gap-2",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "text-[10px] font-mono text-muted-foreground/70 w-14",
                            children: "Eixo"
                        }, void 0, false, {
                            fileName: "[project]/components/layout/auto-split-panel.tsx",
                            lineNumber: 277,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex gap-1 flex-1",
                            children: AXES.map((ax)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setAxis(ax.id),
                                    className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])('flex-1 rounded py-1.5 text-xs font-mono font-medium transition-all duration-150', axis === ax.id ? 'text-background' : 'border border-border text-muted-foreground hover:text-foreground'),
                                    style: axis === ax.id ? {
                                        background: 'oklch(0.70 0.22 42)'
                                    } : undefined,
                                    "aria-pressed": axis === ax.id,
                                    children: ax.label
                                }, ax.id, false, {
                                    fileName: "[project]/components/layout/auto-split-panel.tsx",
                                    lineNumber: 280,
                                    columnNumber: 15
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/components/layout/auto-split-panel.tsx",
                            lineNumber: 278,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/layout/auto-split-panel.tsx",
                    lineNumber: 276,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(SliderRow, {
                    label: "Cortes",
                    value: maxCuts,
                    min: 1,
                    max: 8,
                    step: 1,
                    onChange: setMaxCuts,
                    display: `${maxCuts}`
                }, void 0, false, {
                    fileName: "[project]/components/layout/auto-split-panel.tsx",
                    lineNumber: 299,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(SliderRow, {
                    label: "Sensib.",
                    value: sensitivity,
                    min: 0,
                    max: 1,
                    step: 0.05,
                    onChange: setSensitivity,
                    display: `${Math.round(sensitivity * 100)}%`
                }, void 0, false, {
                    fileName: "[project]/components/layout/auto-split-panel.tsx",
                    lineNumber: 310,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(SliderRow, {
                    label: "Explodir",
                    value: spacing,
                    min: 0,
                    max: 0.6,
                    step: 0.02,
                    onChange: setSpacing,
                    display: `${Math.round(spacing * 100)}%`
                }, void 0, false, {
                    fileName: "[project]/components/layout/auto-split-panel.tsx",
                    lineNumber: 321,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex flex-col gap-2 rounded-lg border border-border/60 p-2",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: ()=>setUsePins((v)=>!v),
                            className: "flex items-center justify-between",
                            "aria-pressed": usePins,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "flex items-center gap-1.5 text-[11px] font-mono text-muted-foreground",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$pin$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Pin$3e$__["Pin"], {
                                            className: "w-3 h-3"
                                        }, void 0, false, {
                                            fileName: "[project]/components/layout/auto-split-panel.tsx",
                                            lineNumber: 339,
                                            columnNumber: 15
                                        }, this),
                                        "Pinos de alinhamento"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/layout/auto-split-panel.tsx",
                                    lineNumber: 338,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])('relative w-8 h-4 rounded-full transition-colors duration-150', usePins ? '' : 'bg-secondary'),
                                    style: usePins ? {
                                        background: 'oklch(0.70 0.22 42)'
                                    } : undefined,
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])('absolute top-0.5 w-3 h-3 rounded-full bg-background transition-all duration-150', usePins ? 'left-4' : 'left-0.5')
                                    }, void 0, false, {
                                        fileName: "[project]/components/layout/auto-split-panel.tsx",
                                        lineNumber: 349,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/components/layout/auto-split-panel.tsx",
                                    lineNumber: 342,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/layout/auto-split-panel.tsx",
                            lineNumber: 333,
                            columnNumber: 11
                        }, this),
                        usePins && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-col gap-2 pt-1 animate-fade-in",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-[10px] font-mono text-muted-foreground/70 w-14",
                                            children: "Qtd/junta"
                                        }, void 0, false, {
                                            fileName: "[project]/components/layout/auto-split-panel.tsx",
                                            lineNumber: 361,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex gap-1 flex-1",
                                            children: [
                                                1,
                                                2
                                            ].map((c)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    onClick: ()=>setPinCount(c),
                                                    className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])('flex-1 rounded py-1 text-[11px] font-mono transition-all duration-150', pinCount === c ? 'text-background' : 'border border-border text-muted-foreground hover:text-foreground'),
                                                    style: pinCount === c ? {
                                                        background: 'oklch(0.55 0.02 250)'
                                                    } : undefined,
                                                    children: [
                                                        c,
                                                        " pino",
                                                        c > 1 ? 's' : ''
                                                    ]
                                                }, c, true, {
                                                    fileName: "[project]/components/layout/auto-split-panel.tsx",
                                                    lineNumber: 364,
                                                    columnNumber: 21
                                                }, this))
                                        }, void 0, false, {
                                            fileName: "[project]/components/layout/auto-split-panel.tsx",
                                            lineNumber: 362,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/layout/auto-split-panel.tsx",
                                    lineNumber: 360,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(SliderRow, {
                                    label: "Ø (mm)",
                                    value: pinDiameter,
                                    min: 1,
                                    max: 16,
                                    step: 0.5,
                                    onChange: setPinDiameter,
                                    display: pinDiameter.toFixed(1)
                                }, void 0, false, {
                                    fileName: "[project]/components/layout/auto-split-panel.tsx",
                                    lineNumber: 380,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(SliderRow, {
                                    label: "Prof (mm)",
                                    value: pinDepth,
                                    min: 2,
                                    max: 30,
                                    step: 0.5,
                                    onChange: setPinDepth,
                                    display: pinDepth.toFixed(1)
                                }, void 0, false, {
                                    fileName: "[project]/components/layout/auto-split-panel.tsx",
                                    lineNumber: 381,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(SliderRow, {
                                    label: "Folga (mm)",
                                    value: pinTolerance,
                                    min: 0,
                                    max: 0.6,
                                    step: 0.01,
                                    onChange: setPinTolerance,
                                    display: pinTolerance.toFixed(2)
                                }, void 0, false, {
                                    fileName: "[project]/components/layout/auto-split-panel.tsx",
                                    lineNumber: 382,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/layout/auto-split-panel.tsx",
                            lineNumber: 359,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/layout/auto-split-panel.tsx",
                    lineNumber: 332,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center gap-2",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: handleAnalyze,
                            disabled: busy,
                            className: "flex items-center justify-center gap-1.5 flex-1 px-3 py-2 rounded-lg text-xs font-mono transition-all duration-150 border border-border text-muted-foreground hover:text-foreground disabled:opacity-50",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$scan$2d$line$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ScanLine$3e$__["ScanLine"], {
                                    className: "w-3.5 h-3.5"
                                }, void 0, false, {
                                    fileName: "[project]/components/layout/auto-split-panel.tsx",
                                    lineNumber: 394,
                                    columnNumber: 13
                                }, this),
                                "Analisar"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/layout/auto-split-panel.tsx",
                            lineNumber: 389,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: handleExecute,
                            disabled: busy,
                            className: "flex items-center justify-center gap-2 flex-1 px-4 py-2 rounded-lg text-sm font-mono font-medium text-background hover:opacity-90 selection-glow transition-all duration-150 disabled:opacity-50",
                            style: {
                                background: 'oklch(0.70 0.22 42)'
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$boxes$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Boxes$3e$__["Boxes"], {
                                    className: "w-4 h-4"
                                }, void 0, false, {
                                    fileName: "[project]/components/layout/auto-split-panel.tsx",
                                    lineNumber: 403,
                                    columnNumber: 13
                                }, this),
                                "Dividir"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/layout/auto-split-panel.tsx",
                            lineNumber: 397,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/layout/auto-split-panel.tsx",
                    lineNumber: 388,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/components/layout/auto-split-panel.tsx",
            lineNumber: 258,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/components/layout/auto-split-panel.tsx",
        lineNumber: 257,
        columnNumber: 5
    }, this);
}
function SliderRow({ label, value, min, max, step, onChange, display }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex items-center gap-2",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "text-[10px] font-mono text-muted-foreground/70 w-14",
                children: label
            }, void 0, false, {
                fileName: "[project]/components/layout/auto-split-panel.tsx",
                lineNumber: 425,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                type: "range",
                min: min,
                max: max,
                step: step,
                value: value,
                onChange: (e)=>onChange(Number(e.target.value)),
                className: "flex-1 cursor-pointer",
                style: {
                    accentColor: 'oklch(0.70 0.22 42)'
                },
                "aria-label": label
            }, void 0, false, {
                fileName: "[project]/components/layout/auto-split-panel.tsx",
                lineNumber: 426,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "text-[10px] font-mono tabular-nums w-10 text-right",
                style: {
                    color: 'oklch(0.70 0.22 42)'
                },
                children: display
            }, void 0, false, {
                fileName: "[project]/components/layout/auto-split-panel.tsx",
                lineNumber: 437,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/layout/auto-split-panel.tsx",
        lineNumber: 424,
        columnNumber: 5
    }, this);
}
}),
"[project]/lib/smart-cut.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DEFAULT_CONTOUR",
    ()=>DEFAULT_CONTOUR,
    "DEFAULT_OPTIONS",
    ()=>DEFAULT_OPTIONS,
    "autoFillMicroFragments",
    ()=>autoFillMicroFragments,
    "buildAdjacencyCache",
    ()=>buildAdjacencyCache,
    "buildCap",
    ()=>buildCap,
    "computeSmoothNormalsByPosition",
    ()=>computeSmoothNormalsByPosition,
    "ensureColorAttribute",
    ()=>ensureColorAttribute,
    "extractSubMesh",
    ()=>extractSubMesh,
    "getFaceCentroids",
    ()=>getFaceCentroids,
    "invalidateAdjacencyCache",
    ()=>invalidateAdjacencyCache,
    "paintFaces",
    ()=>paintFaces,
    "paintFacesDelta",
    ()=>paintFacesDelta,
    "paintHoverDelta",
    ()=>paintHoverDelta,
    "refineSelectionForPrint",
    ()=>refineSelectionForPrint,
    "removeSubMesh",
    ()=>removeSubMesh,
    "smartSelect",
    ()=>smartSelect
]);
/**
 * SmartCut — Segmentação por Curvatura Acumulada (Dijkstra Budget)
 *
 * Problema dos algoritmos BFS simples: param em cada aresta afiada,
 * quebrando a seleção no meio de uma peça orgânica.
 *
 * Solução: Dijkstra com "budget" de curvatura total.
 * - Cada aresta tem custo = ângulo diedro entre as normais das faces.
 * - O algoritmo expande faces em ordem de custo acumulado.
 * - Quando o custo acumulado de uma face ultrapassa o budget, ela é bloqueada.
 * - Isso fecha peças inteiras (óculos, cabelo) mesmo com bordas suaves.
 *
 * Para modelos STL binários (não-indexados), a adjacência é construída
 * via hash de posição (quantização 1e4) — resolve o problema de vértices
 * duplicados com posições iguais.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/three/build/three.core.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$cap$2d$generation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/cap-generation.ts [app-ssr] (ecmascript)");
;
;
const DEFAULT_OPTIONS = {
    sharpAngle: 30,
    maxFaces: 2_000_000,
    mode: 'island'
};
const geomCache = new WeakMap();
function invalidateAdjacencyCache(geo) {
    geomCache.delete(geo);
}
function buildAdjacencyCache(geometry, _sharpAngle = 30 // mantido para compatibilidade mas não usado aqui
) {
    if (geomCache.get(geometry)?.built) return;
    const posAttr = geometry.getAttribute('position');
    const idxAttr = geometry.index;
    const pos = posAttr.array;
    const faceCount = idxAttr ? idxAttr.count / 3 : posAttr.count / 3;
    // ── Normais por face ──────────────────────────────────────────────────────
    const faceNormals = new Float32Array(faceCount * 3);
    for(let f = 0; f < faceCount; f++){
        const b3 = f * 3;
        const ai = idxAttr ? idxAttr.getX(b3) : b3;
        const bi = idxAttr ? idxAttr.getX(b3 + 1) : b3 + 1;
        const ci = idxAttr ? idxAttr.getX(b3 + 2) : b3 + 2;
        const ax = pos[ai * 3], ay = pos[ai * 3 + 1], az = pos[ai * 3 + 2];
        const bx = pos[bi * 3], by = pos[bi * 3 + 1], bz = pos[bi * 3 + 2];
        const cx = pos[ci * 3], cy = pos[ci * 3 + 1], cz = pos[ci * 3 + 2];
        let nx = (by - ay) * (cz - az) - (bz - az) * (cy - ay);
        let ny = (bz - az) * (cx - ax) - (bx - ax) * (cz - az);
        let nz = (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
        const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
        if (len > 1e-10) {
            nx /= len;
            ny /= len;
            nz /= len;
        }
        faceNormals[f * 3] = nx;
        faceNormals[f * 3 + 1] = ny;
        faceNormals[f * 3 + 2] = nz;
    }
    // ── Hash de posição numérico para fundir vértices duplicados (STL binário) ─
    // Empacota 3 coordenadas quantizadas em 16-bit em um inteiro de 48 bits que
    // cabe em float64 (< 2^53). Elimina string allocation e GC pressure vs strings.
    const Q = 10 // resolução 0.1 unidade ≈ 0.1 mm — suficiente
    ;
    const OFF = 32768 // 2^15 — desloca negativos para o intervalo positivo
    ;
    const posKeyNum = (vi)=>{
        const x = Math.round(pos[vi * 3] * Q) + OFF & 0xFFFF;
        const y = Math.round(pos[vi * 3 + 1] * Q) + OFF & 0xFFFF;
        const z = Math.round(pos[vi * 3 + 2] * Q) + OFF & 0xFFFF;
        return x + y * 65536 + z * 65536 * 65536;
    };
    const posToUID = new Map();
    const faceVerts = new Int32Array(faceCount * 3);
    for(let f = 0; f < faceCount; f++){
        for(let c = 0; c < 3; c++){
            const raw = idxAttr ? idxAttr.getX(f * 3 + c) : f * 3 + c;
            const key = posKeyNum(raw);
            let uid = posToUID.get(key);
            if (uid === undefined) {
                uid = posToUID.size;
                posToUID.set(key, uid);
            }
            faceVerts[f * 3 + c] = uid;
        }
    }
    // ── vertFaces: lista invertida uid→[faces] ────────────────────────────────
    const uniq = posToUID.size;
    const vfCnt = new Int32Array(uniq);
    for(let i = 0; i < faceCount * 3; i++)vfCnt[faceVerts[i]]++;
    const vfOff = new Int32Array(uniq + 1);
    for(let v = 0; v < uniq; v++)vfOff[v + 1] = vfOff[v] + vfCnt[v];
    const vfList = new Int32Array(vfOff[uniq]);
    const vfPtr = new Int32Array(uniq);
    for(let f = 0; f < faceCount; f++){
        for(let c = 0; c < 3; c++){
            const v = faceVerts[f * 3 + c];
            vfList[vfOff[v] + vfPtr[v]++] = f;
        }
    }
    // ── Construir adjList e edgeCost ──────────────────────────────────────────
    const adjList = new Array(faceCount);
    const edgeCost = new Array(faceCount);
    const tmp = new Int32Array(512);
    // Scratch Uint8Array para deduplicação O(1) — substitui inner loop O(n)
    const seen = new Uint8Array(faceCount);
    const RAD2DEG = 180 / Math.PI;
    for(let f = 0; f < faceCount; f++){
        let cnt = 0;
        for(let c = 0; c < 3; c++){
            const v = faceVerts[f * 3 + c];
            for(let j = vfOff[v]; j < vfOff[v + 1]; j++){
                const nb = vfList[j];
                if (nb === f || seen[nb]) continue;
                seen[nb] = 1;
                if (cnt < tmp.length) tmp[cnt++] = nb;
            }
        }
        // Limpa seen apenas nas entradas que escrevemos — O(k) não O(n)
        for(let k = 0; k < cnt; k++)seen[tmp[k]] = 0;
        adjList[f] = new Int32Array(cnt);
        edgeCost[f] = new Float32Array(cnt);
        const fnx = faceNormals[f * 3], fny = faceNormals[f * 3 + 1], fnz = faceNormals[f * 3 + 2];
        for(let k = 0; k < cnt; k++){
            const nb = tmp[k];
            adjList[f][k] = nb;
            const dot = Math.max(-1, Math.min(1, fnx * faceNormals[nb * 3] + fny * faceNormals[nb * 3 + 1] + fnz * faceNormals[nb * 3 + 2]));
            // custo = ângulo em graus entre as normais (0=plano, 180=opostas)
            edgeCost[f][k] = Math.acos(dot) * RAD2DEG;
        }
    }
    // ── Rotular ilhas (componentes conexos) via BFS ───────────────────────────
    // Duas faces estão na mesma ilha se compartilham posição (vértice soldado),
    // independente da curvatura. Isso identifica peças fisicamente separadas
    // como cabelo, óculos e roupa em modelos exportados/mesclados.
    const compLabel = new Int32Array(faceCount).fill(-1);
    const compSizeArr = [];
    const stack = new Int32Array(faceCount);
    let compCount = 0;
    for(let start = 0; start < faceCount; start++){
        if (compLabel[start] !== -1) continue;
        const label = compCount++;
        let size = 0;
        let sp = 0;
        stack[sp++] = start;
        compLabel[start] = label;
        while(sp > 0){
            const f = stack[--sp];
            size++;
            const adj = adjList[f];
            for(let i = 0; i < adj.length; i++){
                const nb = adj[i];
                if (compLabel[nb] === -1) {
                    compLabel[nb] = label;
                    stack[sp++] = nb;
                }
            }
        }
        compSizeArr.push(size);
    }
    const compSize = Int32Array.from(compSizeArr);
    geomCache.set(geometry, {
        adjList,
        edgeCost,
        faceNormals,
        faceCount,
        compLabel,
        compSize,
        compCount,
        built: true
    });
}
function smartSelect(geometry, clickedFaceIndex, options = {}) {
    const opts = {
        ...DEFAULT_OPTIONS,
        ...options
    };
    buildAdjacencyCache(geometry, opts.sharpAngle);
    const cache = geomCache.get(geometry);
    const { adjList, edgeCost, faceCount, compLabel, compCount } = cache;
    if (clickedFaceIndex < 0 || clickedFaceIndex >= faceCount) return new Set();
    const clickedIsland = compLabel[clickedFaceIndex];
    // ── Modo ILHA: seleciona a peça inteira (componente conexo) ────────────────
    // Se o modelo tem partes separadas, isto captura exatamente a peça clicada
    // (só o cabelo, só os óculos, só a roupa) sem vazar para nada mais.
    // Fallback: se o modelo é uma única malha soldada (1 ilha), não faz sentido
    // "selecionar tudo", então caímos no modo curvatura automaticamente.
    if (opts.mode === 'island' && compCount > 1) {
        const selected = new Set();
        for(let f = 0; f < faceCount; f++){
            if (compLabel[f] === clickedIsland) selected.add(f);
        }
        return selected;
    }
    // ── Modo CURVATURA: Dijkstra com budget, restrito à ilha clicada ───────────
    // Nunca cruza a fronteira para outra peça (compLabel diferente), evitando
    // vazamento entre partes fisicamente separadas.
    const budget = opts.sharpAngle // budget = o sharpAngle (graus acumulados)
    ;
    const INF = 1e9;
    const dist = new Float32Array(faceCount).fill(INF);
    const visited = new Uint8Array(faceCount);
    dist[clickedFaceIndex] = 0;
    // Heap binário mínimo real — O(log n) push/pop vs O(n) splice anterior
    const heap = new BinaryMinHeap(Math.min(faceCount * 2, 131072));
    heap.push(0, clickedFaceIndex);
    const selected = new Set();
    selected.add(clickedFaceIndex);
    while(!heap.empty && selected.size < opts.maxFaces){
        const cost = heap.popCost();
        const f = heap.lastFace;
        if (visited[f]) continue;
        visited[f] = 1;
        const adj = adjList[f];
        const costs = edgeCost[f];
        for(let i = 0; i < adj.length; i++){
            const nb = adj[i];
            if (visited[nb]) continue;
            // Não sai da peça clicada
            if (compLabel[nb] !== clickedIsland) continue;
            const newCost = cost + costs[i];
            if (newCost <= budget && newCost < dist[nb]) {
                dist[nb] = newCost;
                selected.add(nb);
                heap.push(newCost, nb);
            }
        }
    }
    return selected;
}
// ── Heap binário mínimo — O(log n) push/pop ───────────────────────────────────
// Armazena pares [custo, face] em Float64Array intercalado.
// Float64 mantém custo (float32) e face (int ≤ 2M) sem perda em um único word.
class BinaryMinHeap {
    buf;
    _size = 0;
    lastFace = 0 // preenchido por popCost(), lido pelo caller
    ;
    constructor(initialCapacity = 4096){
        this.buf = new Float64Array(Math.max(initialCapacity, 64) * 2);
    }
    get empty() {
        return this._size === 0;
    }
    push(cost, face) {
        if (this._size * 2 >= this.buf.length) {
            const next = new Float64Array(this.buf.length * 2);
            next.set(this.buf);
            this.buf = next;
        }
        let i = this._size++;
        this.buf[i * 2] = cost;
        this.buf[i * 2 + 1] = face;
        // Sobe na árvore até ordenar
        while(i > 0){
            const p = i - 1 >> 1;
            if (this.buf[p * 2] <= this.buf[i * 2]) break;
            this._swap(p, i);
            i = p;
        }
    }
    /** Retorna o custo mínimo e guarda a face correspondente em `lastFace`. */ popCost() {
        const cost = this.buf[0];
        this.lastFace = this.buf[1];
        const last = --this._size;
        if (last > 0) {
            this.buf[0] = this.buf[last * 2];
            this.buf[1] = this.buf[last * 2 + 1];
            // Desce na árvore
            let i = 0;
            while(true){
                const l = i * 2 + 1, r = l + 1;
                let m = i;
                if (l < this._size && this.buf[l * 2] < this.buf[m * 2]) m = l;
                if (r < this._size && this.buf[r * 2] < this.buf[m * 2]) m = r;
                if (m === i) break;
                this._swap(i, m);
                i = m;
            }
        }
        return cost;
    }
    _swap(a, b) {
        const tc = this.buf[a * 2], tf = this.buf[a * 2 + 1];
        this.buf[a * 2] = this.buf[b * 2];
        this.buf[a * 2 + 1] = this.buf[b * 2 + 1];
        this.buf[b * 2] = tc;
        this.buf[b * 2 + 1] = tf;
    }
}
// ─── Centróides de face (cache) ───────────────────────────────────────────────
// Usado pela borracha para testar quais faces caem dentro do raio do pincel.
const centroidCache = new WeakMap();
function getFaceCentroids(geometry) {
    const cached = centroidCache.get(geometry);
    if (cached) return cached;
    const pos = geometry.getAttribute('position');
    const idx = geometry.index;
    const faceCount = idx ? idx.count / 3 : pos.count / 3;
    const centroids = new Float32Array(faceCount * 3);
    for(let f = 0; f < faceCount; f++){
        const a = idx ? idx.getX(f * 3) : f * 3;
        const b = idx ? idx.getX(f * 3 + 1) : f * 3 + 1;
        const c = idx ? idx.getX(f * 3 + 2) : f * 3 + 2;
        centroids[f * 3] = (pos.getX(a) + pos.getX(b) + pos.getX(c)) / 3;
        centroids[f * 3 + 1] = (pos.getY(a) + pos.getY(b) + pos.getY(c)) / 3;
        centroids[f * 3 + 2] = (pos.getZ(a) + pos.getZ(b) + pos.getZ(c)) / 3;
    }
    centroidCache.set(geometry, centroids);
    return centroids;
}
const DEFAULT_CONTOUR = {
    strength: 0.6,
    smoothIterations: 4,
    flipRatio: 0.6,
    minAreaFraction: 0.003,
    featureAngle: 42,
    printGuard: true
};
/** Área de cada triângulo da malha (metade do módulo do produto vetorial). */ function computeFaceAreas(geometry) {
    const pos = geometry.getAttribute('position');
    const idx = geometry.index;
    const p = pos.array;
    const faceCount = idx ? idx.count / 3 : pos.count / 3;
    const areas = new Float32Array(faceCount);
    for(let f = 0; f < faceCount; f++){
        const a = idx ? idx.getX(f * 3) : f * 3;
        const b = idx ? idx.getX(f * 3 + 1) : f * 3 + 1;
        const c = idx ? idx.getX(f * 3 + 2) : f * 3 + 2;
        const abx = p[b * 3] - p[a * 3], aby = p[b * 3 + 1] - p[a * 3 + 1], abz = p[b * 3 + 2] - p[a * 3 + 2];
        const acx = p[c * 3] - p[a * 3], acy = p[c * 3 + 1] - p[a * 3 + 1], acz = p[c * 3 + 2] - p[a * 3 + 2];
        const cx = aby * acz - abz * acy;
        const cy = abz * acx - abx * acz;
        const cz = abx * acy - aby * acx;
        areas[f] = 0.5 * Math.sqrt(cx * cx + cy * cy + cz * cz);
    }
    return areas;
}
/**
 * Dilata a seleção `k` vezes: toda face vizinha a uma face selecionada entra.
 * (Operador morfológico de crescimento sobre o grafo 1-ring da malha.)
 */ function dilateSelection(inSel, k, adjList) {
    const faceCount = inSel.length;
    for(let it = 0; it < k; it++){
        const add = [];
        for(let f = 0; f < faceCount; f++){
            if (inSel[f]) continue;
            const adj = adjList[f];
            for(let i = 0; i < adj.length; i++){
                if (inSel[adj[i]]) {
                    add.push(f);
                    break;
                }
            }
        }
        if (add.length === 0) break;
        for (const f of add)inSel[f] = 1;
    }
}
/**
 * Erode a seleção `k` vezes: toda face selecionada com vizinho de fora sai.
 * Se `isFeature` for passado, faces sobre relevo real (mecha/ponta) resistem —
 * é o que impede o Smart Contour de "comer" os fios de cabelo ao alisar.
 */ function erodeSelection(inSel, k, adjList, isFeature) {
    const faceCount = inSel.length;
    for(let it = 0; it < k; it++){
        const rem = [];
        for(let f = 0; f < faceCount; f++){
            if (!inSel[f]) continue;
            if (isFeature && isFeature[f]) continue; // relevo real preservado
            const adj = adjList[f];
            for(let i = 0; i < adj.length; i++){
                if (!inSel[adj[i]]) {
                    rem.push(f);
                    break;
                }
            }
        }
        if (rem.length === 0) break;
        for (const f of rem)inSel[f] = 0;
    }
}
function refineSelectionForPrint(geometry, selected, options = {}) {
    const opts = {
        ...DEFAULT_CONTOUR,
        ...options
    };
    if (selected.size === 0) return new Set(selected);
    buildAdjacencyCache(geometry);
    const cache = geomCache.get(geometry);
    if (!cache) return new Set(selected);
    const { adjList, faceNormals, faceCount } = cache;
    const areas = computeFaceAreas(geometry);
    let totalArea = 0;
    for (const f of selected)totalArea += areas[f];
    const minArea = Math.max(totalArea * opts.minAreaFraction, 0);
    const cosFeature = Math.cos(opts.featureAngle * Math.PI / 180);
    // Raio morfológico adaptativo pela intensidade (1..4 faces).
    const strength = Math.max(0, Math.min(1, opts.strength));
    const k = Math.max(1, Math.round(1 + strength * 3));
    const smoothIters = Math.max(0, Math.round(opts.smoothIterations * (0.4 + strength)));
    // ── 0. Curvatura local por face = desvio máximo de normal p/ vizinhos ───────
    // Faces com curvatura alta ficam sobre relevo real (mecha, ponta, volume) e
    // são protegidas da erosão — o que preserva os detalhes que importam.
    const isFeature = new Uint8Array(faceCount);
    for(let f = 0; f < faceCount; f++){
        const adj = adjList[f];
        const nx = faceNormals[f * 3], ny = faceNormals[f * 3 + 1], nz = faceNormals[f * 3 + 2];
        let minDot = 1;
        for(let i = 0; i < adj.length; i++){
            const nb = adj[i];
            const dot = nx * faceNormals[nb * 3] + ny * faceNormals[nb * 3 + 1] + nz * faceNormals[nb * 3 + 2];
            if (dot < minDot) minDot = dot;
        }
        if (minDot < cosFeature) isFeature[f] = 1;
    }
    const inSel = new Uint8Array(faceCount);
    for (const f of selected)inSel[f] = 1;
    // ── 1. Fechamento morfológico: preenche entalhes e vales de serrilhado ──────
    dilateSelection(inSel, k, adjList);
    erodeSelection(inSel, k, adjList, isFeature);
    // ── 2. Abertura morfológica: remove dentes e farpas (relevo preservado) ─────
    erodeSelection(inSel, k, adjList, isFeature);
    dilateSelection(inSel, k, adjList);
    // ── 3. Curvature-flow: alisa a fronteira remanescente por votação ──────────
    let cur = inSel;
    for(let it = 0; it < smoothIters; it++){
        const next = cur.slice();
        let changed = false;
        for(let f = 0; f < faceCount; f++){
            const adj = adjList[f];
            const n = adj.length;
            if (n === 0) continue;
            let diff = 0;
            for(let i = 0; i < n; i++)if (cur[adj[i]] !== cur[f]) diff++;
            const frac = diff / n;
            if (frac < opts.flipRatio) continue;
            // relevo real só inverte se o anel inteiro discordar (ruído gritante)
            if (isFeature[f] && frac < 0.85) continue;
            next[f] = cur[f] ^ 1;
            changed = true;
        }
        cur = next;
        if (!changed) break;
    }
    cur.forEach((v, f)=>{
        inSel[f] = v;
    });
    // ── 4. Limpeza de ilhas e buracos por área ─────────────────────────────────
    removeSmallComponents(inSel, 1, adjList, areas, minArea); // cacos soltos → fora
    removeSmallComponents(inSel, 0, adjList, areas, minArea); // furos pequenos → dentro
    // ── 5. Guarda de imprimibilidade: elimina pescoços/pontes de 1 face ─────────
    if (opts.printGuard) {
        for(let pass = 0; pass < 2; pass++){
            const rem = [];
            for(let f = 0; f < faceCount; f++){
                if (!inSel[f] || isFeature[f]) continue;
                const adj = adjList[f];
                const n = adj.length;
                if (n === 0) continue;
                let selN = 0;
                for(let i = 0; i < n; i++)if (inSel[adj[i]]) selN++;
                // Menos de 1/3 do anel dentro → parede fina / ponta frágil → remove
                if (selN <= 1 || selN / n < 0.34) rem.push(f);
            }
            if (rem.length === 0) break;
            for (const f of rem)inSel[f] = 0;
        }
        // Rebalanceia buracos criados pela guarda
        removeSmallComponents(inSel, 0, adjList, areas, minArea);
    }
    const out = new Set();
    for(let f = 0; f < faceCount; f++)if (inSel[f]) out.add(f);
    // segurança: nunca devolver vazio
    return out.size > 0 ? out : new Set(selected);
}
/**
 * Inverte a rotulação (value → value^1) de componentes conexos do lado `value`
 * cuja área total seja menor que `minArea`. Usa a adjacência 1-ring da malha.
 */ function removeSmallComponents(inSel, value, adjList, areas, minArea) {
    if (minArea <= 0) return;
    const faceCount = inSel.length;
    const visited = new Uint8Array(faceCount);
    const stack = new Int32Array(faceCount);
    for(let start = 0; start < faceCount; start++){
        if (visited[start] || inSel[start] !== value) continue;
        let sp = 0;
        stack[sp++] = start;
        visited[start] = 1;
        const comp = [];
        let area = 0;
        while(sp > 0){
            const f = stack[--sp];
            comp.push(f);
            area += areas[f];
            const adj = adjList[f];
            for(let i = 0; i < adj.length; i++){
                const nb = adj[i];
                if (!visited[nb] && inSel[nb] === value) {
                    visited[nb] = 1;
                    stack[sp++] = nb;
                }
            }
        }
        if (area < minArea) {
            for (const f of comp)inSel[f] = value ^ 1;
        }
    }
}
function autoFillMicroFragments(geometry, selected, minAreaFraction = 0.005) {
    if (selected.size === 0) return {
        cleaned: new Set(),
        addedFaces: 0,
        removedFaces: 0
    };
    buildAdjacencyCache(geometry);
    const cache = geomCache.get(geometry);
    if (!cache) return {
        cleaned: new Set(selected),
        addedFaces: 0,
        removedFaces: 0
    };
    const { adjList, faceCount } = cache;
    const areas = computeFaceAreas(geometry);
    // Área total da seleção → define a escala do limiar
    let selectedArea = 0;
    for (const f of selected)selectedArea += areas[f];
    if (selectedArea <= 0) return {
        cleaned: new Set(selected),
        addedFaces: 0,
        removedFaces: 0
    };
    const minArea = selectedArea * minAreaFraction;
    const inSel = new Uint8Array(faceCount);
    for (const f of selected)inSel[f] = 1;
    // 1. Absorve ilhas não-selecionadas pequenas (buracos minúsculos → dentro)
    removeSmallComponents(inSel, 0, adjList, areas, minArea);
    // 2. Remove cacos selecionados pequenos isolados do corpo principal
    removeSmallComponents(inSel, 1, adjList, areas, minArea);
    // Conta diferenças
    let addedFaces = 0, removedFaces = 0;
    for(let f = 0; f < faceCount; f++){
        if (inSel[f]) {
            if (!selected.has(f)) addedFaces++;
        } else {
            if (selected.has(f)) removedFaces++;
        }
    }
    const cleaned = new Set();
    for(let f = 0; f < faceCount; f++)if (inSel[f]) cleaned.add(f);
    // Segurança: nunca retornar seleção vazia
    return {
        cleaned: cleaned.size > 0 ? cleaned : new Set(selected),
        addedFaces,
        removedFaces
    };
}
// ─── Pintura de vertex colors ─────────────────────────────────────────────────
const C_SELECTED = [
    1.00,
    0.38,
    0.00
] // laranja vivo
;
const C_HOVER = [
    1.00,
    0.65,
    0.10
] // laranja hover
;
const C_HOVER_SUB = [
    0.20,
    0.50,
    1.00
] // azul subtract
;
const C_BASE = [
    0.50,
    0.50,
    0.52
] // cinza neutro
;
const C_DIMMED = [
    0.10,
    0.10,
    0.11
] // quase preto
;
function ensureColorAttribute(geometry, material) {
    material.color.set(0xffffff);
    material.vertexColors = true;
    material.needsUpdate = true;
    let attr = geometry.getAttribute('color');
    if (attr) return attr;
    const vertCount = geometry.getAttribute('position').count;
    const colors = new Float32Array(vertCount * 3);
    for(let i = 0; i < vertCount; i++){
        colors[i * 3] = C_BASE[0];
        colors[i * 3 + 1] = C_BASE[1];
        colors[i * 3 + 2] = C_BASE[2];
    }
    attr = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BufferAttribute"](colors, 3);
    attr.setUsage(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DynamicDrawUsage"]);
    geometry.setAttribute('color', attr);
    return attr;
}
function vertexOf(geometry, face, corner) {
    const idx = geometry.index;
    const base = face * 3 + corner;
    return idx ? idx.getX(base) : base;
}
function paintFaces(geometry, colorAttr, selected, hovered, mode) {
    const posAttr = geometry.getAttribute('position');
    const idxAttr = geometry.index;
    const faceCount = idxAttr ? idxAttr.count / 3 : posAttr.count / 3;
    const colors = colorAttr.array;
    const hasSel = selected.size > 0;
    for(let f = 0; f < faceCount; f++){
        const isSel = selected.has(f);
        const isHov = hovered.has(f);
        let col;
        if (isSel && isHov && mode === 'subtract') col = C_HOVER_SUB;
        else if (isSel) col = C_SELECTED;
        else if (isHov) col = mode === 'subtract' ? C_BASE : C_HOVER;
        else if (hasSel) col = C_DIMMED;
        else col = C_BASE;
        for(let c = 0; c < 3; c++){
            const vi = vertexOf(geometry, f, c);
            colors[vi * 3] = col[0];
            colors[vi * 3 + 1] = col[1];
            colors[vi * 3 + 2] = col[2];
        }
    }
    colorAttr.needsUpdate = true;
}
function paintFacesDelta(geometry, colorAttr, prevSelected, nextSelected, mode) {
    const colors = colorAttr.array;
    const hasNext = nextSelected.size > 0;
    const hadPrev = prevSelected.size > 0;
    // Transição entre "sem seleção" e "com seleção": bulk-fill TypedArray em loop
    // compacto (~10× mais rápido que iterar faceCount faces com Set.has()), depois
    // apenas as faces selecionadas recebem a cor laranja por cima.
    if (hadPrev !== hasNext) {
        const [br, bg, bb] = hasNext ? C_DIMMED : C_BASE;
        for(let i = 0; i < colors.length; i += 3){
            colors[i] = br;
            colors[i + 1] = bg;
            colors[i + 2] = bb;
        }
        const [sr, sg, sb] = C_SELECTED;
        for (const f of nextSelected){
            for(let c = 0; c < 3; c++){
                const vi = vertexOf(geometry, f, c);
                colors[vi * 3] = sr;
                colors[vi * 3 + 1] = sg;
                colors[vi * 3 + 2] = sb;
            }
        }
        colorAttr.needsUpdate = true;
        return;
    }
    // Mesmo estado de seleção (ambos vazios ou ambos com faces): pintar só o diff
    const [dr, dg, db] = hasNext ? C_DIMMED : C_BASE;
    const [sr, sg, sb] = C_SELECTED;
    for (const f of prevSelected){
        if (nextSelected.has(f)) continue;
        for(let c = 0; c < 3; c++){
            const vi = vertexOf(geometry, f, c);
            colors[vi * 3] = dr;
            colors[vi * 3 + 1] = dg;
            colors[vi * 3 + 2] = db;
        }
    }
    for (const f of nextSelected){
        if (prevSelected.has(f)) continue;
        for(let c = 0; c < 3; c++){
            const vi = vertexOf(geometry, f, c);
            colors[vi * 3] = sr;
            colors[vi * 3 + 1] = sg;
            colors[vi * 3 + 2] = sb;
        }
    }
    colorAttr.needsUpdate = true;
}
function paintHoverDelta(geometry, colorAttr, selected, prevHover, nextHover, mode) {
    const colors = colorAttr.array;
    const hasSel = selected.size > 0;
    const paint = (f, col)=>{
        for(let c = 0; c < 3; c++){
            const vi = vertexOf(geometry, f, c);
            colors[vi * 3] = col[0];
            colors[vi * 3 + 1] = col[1];
            colors[vi * 3 + 2] = col[2];
        }
    };
    for (const f of prevHover){
        if (nextHover.has(f)) continue;
        paint(f, selected.has(f) ? C_SELECTED : hasSel ? C_DIMMED : C_BASE);
    }
    for (const f of nextHover){
        if (prevHover.has(f)) continue;
        if (selected.has(f) && mode !== 'subtract') continue; // já laranja
        let col;
        if (selected.has(f) && mode === 'subtract') col = C_HOVER_SUB;
        else col = mode === 'subtract' ? C_BASE : C_HOVER;
        paint(f, col);
    }
    colorAttr.needsUpdate = true;
}
function computeSmoothNormalsByPosition(geometry) {
    const posAttr = geometry.getAttribute('position');
    const idxAttr = geometry.index;
    const vertCount = posAttr.count;
    const faceCount = idxAttr ? idxAttr.count / 3 : vertCount / 3;
    // Hash numérico 48-bit — elimina string allocation vs versão anterior
    const QN = 10, OFFN = 32768;
    const keyN = (v)=>{
        const x = Math.round(posAttr.getX(v) * QN) + OFFN & 0xFFFF;
        const y = Math.round(posAttr.getY(v) * QN) + OFFN & 0xFFFF;
        const z = Math.round(posAttr.getZ(v) * QN) + OFFN & 0xFFFF;
        return x + y * 65536 + z * 65536 * 65536;
    };
    // Acumula a normal (ponderada por área) por posição
    const accum = new Map();
    for(let f = 0; f < faceCount; f++){
        const a = idxAttr ? idxAttr.getX(f * 3) : f * 3;
        const b = idxAttr ? idxAttr.getX(f * 3 + 1) : f * 3 + 1;
        const c = idxAttr ? idxAttr.getX(f * 3 + 2) : f * 3 + 2;
        const ax = posAttr.getX(a), ay = posAttr.getY(a), az = posAttr.getZ(a);
        const bx = posAttr.getX(b), by = posAttr.getY(b), bz = posAttr.getZ(b);
        const cx = posAttr.getX(c), cy = posAttr.getY(c), cz = posAttr.getZ(c);
        const nx = (by - ay) * (cz - az) - (bz - az) * (cy - ay);
        const ny = (bz - az) * (cx - ax) - (bx - ax) * (cz - az);
        const nz = (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
        for (const v of [
            a,
            b,
            c
        ]){
            const k = keyN(v);
            const cur = accum.get(k);
            if (cur) {
                cur[0] += nx;
                cur[1] += ny;
                cur[2] += nz;
            } else accum.set(k, [
                nx,
                ny,
                nz
            ]);
        }
    }
    const normals = new Float32Array(vertCount * 3);
    for(let v = 0; v < vertCount; v++){
        const n = accum.get(keyN(v));
        if (n) {
            const len = Math.sqrt(n[0] * n[0] + n[1] * n[1] + n[2] * n[2]) || 1;
            normals[v * 3] = n[0] / len;
            normals[v * 3 + 1] = n[1] / len;
            normals[v * 3 + 2] = n[2] / len;
        }
    }
    geometry.setAttribute('normal', new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Float32BufferAttribute"](normals, 3));
    geometry.getAttribute('normal').needsUpdate = true;
}
function buildCap(geometry, faceSet, weldQ = 1e4) {
    const posAttr = geometry.getAttribute('position');
    const idxAttr = geometry.index;
    const faces = Array.isArray(faceSet) ? faceSet : Array.from(faceSet);
    if (faces.length === 0) return {
        pos: new Float32Array(0),
        nrm: new Float32Array(0)
    };
    // ── 1. Quantização e soldagem de vértices ──────────────────────────────────
    const Q = weldQ;
    const keyToId = new Map();
    const idPx = [] // posição x,y,z por ID
    ;
    const vId = (v)=>{
        const k = `${Math.round(posAttr.getX(v) * Q)},${Math.round(posAttr.getY(v) * Q)},${Math.round(posAttr.getZ(v) * Q)}`;
        let id = keyToId.get(k);
        if (id === undefined) {
            id = idPx.length / 3;
            keyToId.set(k, id);
            idPx.push(posAttr.getX(v), posAttr.getY(v), posAttr.getZ(v));
        }
        return id;
    };
    // ── 2. Arestas direcionadas — borda = aresta sem reverso ───────────────────
    // Usa string-key para evitar colisão numérica com modelos grandes
    const dirEdgeSet = new Set();
    const facesIds = [];
    for (const f of faces){
        const a = vId(idxAttr ? idxAttr.getX(f * 3) : f * 3);
        const b = vId(idxAttr ? idxAttr.getX(f * 3 + 1) : f * 3 + 1);
        const c = vId(idxAttr ? idxAttr.getX(f * 3 + 2) : f * 3 + 2);
        facesIds.push([
            a,
            b,
            c
        ]);
        dirEdgeSet.add(`${a}>${b}`);
        dirEdgeSet.add(`${b}>${c}`);
        dirEdgeSet.add(`${c}>${a}`);
    }
    // Grafo direcionado de arestas de borda: para cada nó, lista de saídas
    const outEdges = new Map();
    for (const [a, b, c] of facesIds){
        for (const [x, y] of [
            [
                a,
                b
            ],
            [
                b,
                c
            ],
            [
                c,
                a
            ]
        ]){
            // Aresta de borda: x→y existe mas y→x não existe
            if (!dirEdgeSet.has(`${y}>${x}`)) {
                // Tampa: percorremos y→x (inverso) para orientar a face "para fora"
                let list = outEdges.get(y);
                if (!list) {
                    list = [];
                    outEdges.set(y, list);
                }
                if (!list.includes(x)) list.push(x);
            }
        }
    }
    if (outEdges.size === 0) return {
        pos: new Float32Array(0),
        nrm: new Float32Array(0)
    };
    // ── 3. Chain-following: extrai loops fechados ──────────────────────────────
    const nextPtr = new Map();
    const rawLoops = [];
    for (const [startNode] of outEdges){
        while(true){
            const ptr = nextPtr.get(startNode) ?? 0;
            const outs = outEdges.get(startNode);
            if (!outs || ptr >= outs.length) break;
            const chain = [];
            let cur = startNode;
            const maxSteps = idPx.length / 3 + 4;
            let steps = 0;
            let closed = false;
            while(steps++ < maxSteps){
                const cPtr = nextPtr.get(cur) ?? 0;
                const cOuts = outEdges.get(cur);
                if (!cOuts || cPtr >= cOuts.length) break;
                chain.push(cur);
                const next = cOuts[cPtr];
                nextPtr.set(cur, cPtr + 1);
                if (next === startNode) {
                    closed = true;
                    break;
                }
                cur = next;
            }
            if (closed && chain.length >= 3) rawLoops.push({
                ids: chain
            });
        }
    }
    if (rawLoops.length === 0) return {
        pos: new Float32Array(0),
        nrm: new Float32Array(0)
    };
    // ── 4. High-quality cap generation via generateCap pipeline ───────────────
    const allPos = [];
    const allNrm = [];
    for (const { ids } of rawLoops){
        const pts3d = ids.map((id)=>new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector3"](idPx[id * 3], idPx[id * 3 + 1], idPx[id * 3 + 2]));
        if (pts3d.length < 3) continue;
        const { pos, nrm } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$cap$2d$generation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["generateCap"])(pts3d);
        for(let i = 0; i < pos.length; i++)allPos.push(pos[i]);
        for(let i = 0; i < nrm.length; i++)allNrm.push(nrm[i]);
    }
    return {
        pos: new Float32Array(allPos),
        nrm: new Float32Array(allNrm)
    };
}
function removeSubMesh(geometry, facesToRemove, weldQ = 1e4) {
    const posAttr = geometry.getAttribute('position');
    const normalAttr = geometry.getAttribute('normal');
    const uvAttr = geometry.getAttribute('uv');
    const idxAttr = geometry.index;
    const faceCount = idxAttr ? idxAttr.count / 3 : posAttr.count / 3;
    // Faces que permanecem
    const keepFaces = [];
    for(let f = 0; f < faceCount; f++){
        if (!facesToRemove.has(f)) keepFaces.push(f);
    }
    // Tampa que fecha a seção do corte (contorno aberto das faces mantidas)
    const cap = buildCap(geometry, keepFaces, weldQ);
    const capVerts = cap.pos.length / 3;
    const shellVerts = keepFaces.length * 3;
    const vCount = shellVerts + capVerts;
    const newPos = new Float32Array(vCount * 3);
    const newNormal = new Float32Array(vCount * 3);
    const newUV = uvAttr ? new Float32Array(vCount * 2) : null;
    let w = 0;
    for (const f of keepFaces){
        for(let c = 0; c < 3; c++){
            const v = idxAttr ? idxAttr.getX(f * 3 + c) : f * 3 + c;
            newPos[w * 3] = posAttr.getX(v);
            newPos[w * 3 + 1] = posAttr.getY(v);
            newPos[w * 3 + 2] = posAttr.getZ(v);
            if (normalAttr) {
                newNormal[w * 3] = normalAttr.getX(v);
                newNormal[w * 3 + 1] = normalAttr.getY(v);
                newNormal[w * 3 + 2] = normalAttr.getZ(v);
            }
            if (newUV) {
                newUV[w * 2] = uvAttr.getX(v);
                newUV[w * 2 + 1] = uvAttr.getY(v);
            }
            w++;
        }
    }
    // Anexa os vértices da tampa
    if (capVerts > 0) {
        newPos.set(cap.pos, shellVerts * 3);
        newNormal.set(cap.nrm, shellVerts * 3);
    // UV da tampa fica em (0,0) — o array já vem zerado
    }
    const geo = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BufferGeometry"]();
    geo.setAttribute('position', new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Float32BufferAttribute"](newPos, 3));
    geo.setAttribute('normal', new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Float32BufferAttribute"](newNormal, 3));
    if (newUV) geo.setAttribute('uv', new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Float32BufferAttribute"](newUV, 2));
    // Sempre recalcula normais para garantir consistência com a nova tampa
    geo.computeVertexNormals();
    geo.computeBoundingBox();
    geo.computeBoundingSphere();
    return geo;
}
function extractSubMesh(geometry, selectedFaces, cap = true, weldQ = 1e5) {
    const posAttr = geometry.getAttribute('position');
    const uvAttr = geometry.getAttribute('uv');
    const idxAttr = geometry.index;
    const faceArr = Array.from(selectedFaces);
    const maxV = faceArr.length * 3;
    // ── Coletar vértices únicos por posição para soldagem ──────────────────────
    const Q = weldQ;
    const posKey = (v)=>{
        const x = Math.round(posAttr.getX(v) * Q);
        const y = Math.round(posAttr.getY(v) * Q);
        const z = Math.round(posAttr.getZ(v) * Q);
        return `${x},${y},${z}`;
    };
    // uid unificado por posição → novo índice
    const uidToNew = new Map();
    const newPos = [];
    const newUV = [];
    const faceRaw = [] // [a0,b0,c0, a1,b1,c1 ...] raw indices originais
    ;
    for (const fi of faceArr){
        const b3 = fi * 3;
        const a = idxAttr ? idxAttr.getX(b3) : b3;
        const b = idxAttr ? idxAttr.getX(b3 + 1) : b3 + 1;
        const c = idxAttr ? idxAttr.getX(b3 + 2) : b3 + 2;
        faceRaw.push(a, b, c);
    }
    const rawToNew = new Int32Array(faceRaw.length);
    for(let i = 0; i < faceRaw.length; i++){
        const v = faceRaw[i];
        const key = posKey(v);
        let nv = uidToNew.get(key);
        if (nv === undefined) {
            nv = newPos.length / 3;
            uidToNew.set(key, nv);
            newPos.push(posAttr.getX(v), posAttr.getY(v), posAttr.getZ(v));
            if (uvAttr) newUV.push(uvAttr.getX(v), uvAttr.getY(v));
        }
        rawToNew[i] = nv;
    }
    const vertCount = newPos.length / 3;
    const newIdx = new Uint32Array(faceRaw.length);
    for(let i = 0; i < faceRaw.length; i++)newIdx[i] = rawToNew[i];
    // ── Normais suaves: acumular contribuição de cada face em cada vértice ──────
    const normals = new Float32Array(vertCount * 3) // zero init
    ;
    for(let fi = 0; fi < faceArr.length; fi++){
        const ia = newIdx[fi * 3], ib = newIdx[fi * 3 + 1], ic = newIdx[fi * 3 + 2];
        const ax = newPos[ia * 3], ay = newPos[ia * 3 + 1], az = newPos[ia * 3 + 2];
        const bx = newPos[ib * 3], by = newPos[ib * 3 + 1], bz = newPos[ib * 3 + 2];
        const cx = newPos[ic * 3], cy = newPos[ic * 3 + 1], cz = newPos[ic * 3 + 2];
        // Normal da face (não normalizada = peso pela área)
        const nx = (by - ay) * (cz - az) - (bz - az) * (cy - ay);
        const ny = (bz - az) * (cx - ax) - (bx - ax) * (cz - az);
        const nz = (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
        for (const vi of [
            ia,
            ib,
            ic
        ]){
            normals[vi * 3] += nx;
            normals[vi * 3 + 1] += ny;
            normals[vi * 3 + 2] += nz;
        }
    }
    // Normalizar
    for(let v = 0; v < vertCount; v++){
        const len = Math.sqrt(normals[v * 3] ** 2 + normals[v * 3 + 1] ** 2 + normals[v * 3 + 2] ** 2);
        if (len > 1e-10) {
            normals[v * 3] /= len;
            normals[v * 3 + 1] /= len;
            normals[v * 3 + 2] /= len;
        }
    }
    // ── Tampa: fecha a seção do corte → peça MACIÇA (volume fechado) ────────────
    // Sem a tampa, a peça é uma casca aberta e o fatiador não consegue preenchê-la.
    // buildCap gera os triângulos que tapam o(s) contorno(s) aberto(s) da seleção,
    // com orientação autoconsistente para este conjunto de faces.
    const capData = cap ? buildCap(geometry, selectedFaces, weldQ) : {
        pos: new Float32Array(0),
        nrm: new Float32Array(0)
    };
    const capVertCount = capData.pos.length / 3;
    const shellVertCount = vertCount // vértices soldados da casca
    ;
    const totalVertCount = shellVertCount + capVertCount;
    // Posições: casca soldada + vértices da tampa (sopa de triângulos)
    const finalPos = new Float32Array(totalVertCount * 3);
    finalPos.set(newPos, 0);
    if (capVertCount > 0) finalPos.set(capData.pos, shellVertCount * 3);
    // Normais: casca (suaves) + tampa (planas)
    const finalNrm = new Float32Array(totalVertCount * 3);
    finalNrm.set(normals, 0);
    if (capVertCount > 0) finalNrm.set(capData.nrm, shellVertCount * 3);
    // Índices: casca (indexada) + tampa (índices sequenciais)
    const finalIdx = new Uint32Array(newIdx.length + capVertCount);
    finalIdx.set(newIdx, 0);
    for(let i = 0; i < capVertCount; i++)finalIdx[newIdx.length + i] = shellVertCount + i;
    // UV: tampa fica em (0,0) — array já vem zerado
    let finalUV = null;
    if (uvAttr) {
        finalUV = new Float32Array(totalVertCount * 2);
        finalUV.set(newUV, 0);
    }
    // ── Montar geometria final ─────────────────────────────────────────────────
    const geo = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BufferGeometry"]();
    geo.setAttribute('position', new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Float32BufferAttribute"](finalPos, 3));
    geo.setAttribute('normal', new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BufferAttribute"](finalNrm, 3));
    if (finalUV) geo.setAttribute('uv', new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Float32BufferAttribute"](finalUV, 2));
    geo.setIndex(new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BufferAttribute"](finalIdx, 1));
    geo.computeBoundingBox();
    geo.computeBoundingSphere();
    return geo;
}
}),
"[project]/lib/quality-cut.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DEFAULT_QUALITY",
    ()=>DEFAULT_QUALITY,
    "qualityContourCut",
    ()=>qualityContourCut,
    "validateCutResult",
    ()=>validateCutResult
]);
/**
 * QualityCut — Corte por Contorno Matemático Reconstruído (Isocontorno)
 * ────────────────────────────────────────────────────────────────────────────
 *
 * PIPELINE PROFISSIONAL (conforme especificação):
 *   1. Campo indicador φ por vértice soldado: +1 dentro, -1 fora da seleção.
 *   2. Difusão Taubin (filtro passa-baixa): elimina ruído de triangulação,
 *      preserva volumes e formas reais.
 *   3. Ajuste de offset: desloca o isocontorno para expandir/contrair a peça.
 *   4. Marching-Triangles: corta no isocontorno φ=offset, gerando vértices
 *      NOVOS por interpolação. Curva contínua, independente da topologia.
 *   5. Relaxação de fronteira (Edge Relax): Taubin suavizante na linha de
 *      costura → elimina picos e irregularidades finais.
 *   6. Limpeza de malha (Boundary Cleanup): remove faces degeneradas, picos,
 *      vértices duplicados, conserta normais.
 *   7. Tampas (buildCap): fecham a costura → peças maciças e imprimíveis.
 *   8. Normais suaves por posição → acabamento contínuo.
 *   9. Validação da malha resultante.
 *
 * PRIORIDADE ABSOLUTA: A seleção do SmartCut é inviolável.
 * O algoritmo só constrói a SUPERFÍCIE DE SEPARAÇÃO — nunca altera o volume
 * ou o contorno da peça selecionada.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/three/build/three.core.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$smart$2d$cut$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/smart-cut.ts [app-ssr] (ecmascript)");
;
;
const DEFAULT_QUALITY = {
    strength: 0.6,
    qualityFirst: true,
    weldQ: 1e4,
    qualityThreshold: 12,
    offset: 0,
    relaxIterations: 2
};
function weldMesh(geometry, Q) {
    const posAttr = geometry.getAttribute('position');
    const idxAttr = geometry.index;
    const faceCount = idxAttr ? idxAttr.count / 3 : posAttr.count / 3;
    const keyToUID = new Map();
    const faceUID = new Int32Array(faceCount * 3);
    const faceCorner = new Int32Array(faceCount * 3);
    const uidOf = (v)=>{
        const k = `${Math.round(posAttr.getX(v) * Q)},${Math.round(posAttr.getY(v) * Q)},${Math.round(posAttr.getZ(v) * Q)}`;
        let id = keyToUID.get(k);
        if (id === undefined) {
            id = keyToUID.size;
            keyToUID.set(k, id);
        }
        return id;
    };
    for(let f = 0; f < faceCount; f++){
        for(let c = 0; c < 3; c++){
            const v = idxAttr ? idxAttr.getX(f * 3 + c) : f * 3 + c;
            faceCorner[f * 3 + c] = v;
            faceUID[f * 3 + c] = uidOf(v);
        }
    }
    const uidCount = keyToUID.size;
    const nbSets = Array.from({
        length: uidCount
    }, ()=>new Set());
    for(let f = 0; f < faceCount; f++){
        const a = faceUID[f * 3], b = faceUID[f * 3 + 1], c = faceUID[f * 3 + 2];
        nbSets[a].add(b);
        nbSets[a].add(c);
        nbSets[b].add(a);
        nbSets[b].add(c);
        nbSets[c].add(a);
        nbSets[c].add(b);
    }
    const neighbors = nbSets.map((s)=>Int32Array.from(s));
    return {
        faceUID,
        faceCorner,
        faceCount,
        uidCount,
        neighbors
    };
}
// ─── Campo indicador inicial φ0 ────────────────────────────────────────────────
function buildIndicatorField(w, selected) {
    const totalCnt = new Float32Array(w.uidCount);
    const selCnt = new Float32Array(w.uidCount);
    for(let f = 0; f < w.faceCount; f++){
        const inSel = selected.has(f) ? 1 : 0;
        for(let c = 0; c < 3; c++){
            const uid = w.faceUID[f * 3 + c];
            totalCnt[uid] += 1;
            selCnt[uid] += inSel;
        }
    }
    const phi = new Float32Array(w.uidCount);
    for(let u = 0; u < w.uidCount; u++){
        const t = totalCnt[u] > 0 ? selCnt[u] / totalCnt[u] : 0;
        phi[u] = t * 2 - 1;
    }
    return phi;
}
// ─── Difusão Taubin (filtro passa-baixa sem encolhimento) ───────────────────────
function diffuseField(phi0, w, iterations) {
    const LAMBDA = 0.6;
    const MU = -0.62;
    let cur = phi0.slice();
    let buf = new Float32Array(cur.length);
    for(let it = 0; it < iterations; it++){
        const factor = it % 2 === 0 ? LAMBDA : MU;
        for(let u = 0; u < w.uidCount; u++){
            const nb = w.neighbors[u];
            const n = nb.length;
            if (n === 0) {
                buf[u] = cur[u];
                continue;
            }
            let sum = 0;
            for(let i = 0; i < n; i++)sum += cur[nb[i]];
            const avg = sum / n;
            buf[u] = cur[u] + factor * (avg - cur[u]);
        }
        const tmp = cur;
        cur = buf;
        buf = tmp;
    }
    return cur;
}
function marchTriangles(geometry, w, phi, hasUV, threshold) {
    const posAttr = geometry.getAttribute('position');
    const uvAttr = hasUV ? geometry.getAttribute('uv') : null;
    const out = {
        posA: [],
        uvA: [],
        posB: [],
        uvB: [],
        seam: []
    };
    const P = [
        new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector3"](),
        new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector3"](),
        new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector3"]()
    ];
    const U = [
        new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector2"](),
        new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector2"](),
        new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector2"]()
    ];
    const d = [
        0,
        0,
        0
    ];
    const lerpCorner = (i, j, t)=>{
        const p = P[i].clone().lerp(P[j], t);
        const u = hasUV ? U[i].clone().lerp(U[j], t) : new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector2"]();
        return {
            p,
            u
        };
    };
    // Clip polygon keeping vertices where (d - threshold) satisfies keepInside
    const clip = (keepInside)=>{
        const poly = [];
        for(let i = 0; i < 3; i++){
            const j = (i + 1) % 3;
            const di = d[i] - threshold, dj = d[j] - threshold;
            const inI = keepInside ? di >= 0 : di < 0;
            const inJ = keepInside ? dj >= 0 : dj < 0;
            if (inI) poly.push({
                p: P[i].clone(),
                u: hasUV ? U[i].clone() : new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector2"]()
            });
            if (inI !== inJ) {
                const t = di / (di - dj);
                poly.push(lerpCorner(i, j, t));
            }
        }
        return poly;
    };
    const emit = (posArr, uvArr, poly)=>{
        for(let k = 1; k + 1 < poly.length; k++){
            const a = poly[0], b = poly[k], c = poly[k + 1];
            posArr.push(a.p.x, a.p.y, a.p.z, b.p.x, b.p.y, b.p.z, c.p.x, c.p.y, c.p.z);
            if (hasUV) uvArr.push(a.u.x, a.u.y, b.u.x, b.u.y, c.u.x, c.u.y);
        }
    };
    for(let f = 0; f < w.faceCount; f++){
        for(let c = 0; c < 3; c++){
            const v = w.faceCorner[f * 3 + c];
            P[c].set(posAttr.getX(v), posAttr.getY(v), posAttr.getZ(v));
            if (uvAttr) U[c].set(uvAttr.getX(v), uvAttr.getY(v));
            d[c] = phi[w.faceUID[f * 3 + c]];
        }
        const nInside = (d[0] >= threshold ? 1 : 0) + (d[1] >= threshold ? 1 : 0) + (d[2] >= threshold ? 1 : 0);
        if (nInside === 3) {
            emit(out.posA, out.uvA, [
                {
                    p: P[0].clone(),
                    u: hasUV ? U[0].clone() : new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector2"]()
                },
                {
                    p: P[1].clone(),
                    u: hasUV ? U[1].clone() : new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector2"]()
                },
                {
                    p: P[2].clone(),
                    u: hasUV ? U[2].clone() : new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector2"]()
                }
            ]);
        } else if (nInside === 0) {
            emit(out.posB, out.uvB, [
                {
                    p: P[0].clone(),
                    u: hasUV ? U[0].clone() : new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector2"]()
                },
                {
                    p: P[1].clone(),
                    u: hasUV ? U[1].clone() : new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector2"]()
                },
                {
                    p: P[2].clone(),
                    u: hasUV ? U[2].clone() : new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector2"]()
                }
            ]);
        } else {
            const inPoly = clip(true);
            const outPoly = clip(false);
            if (inPoly.length >= 3) emit(out.posA, out.uvA, inPoly);
            if (outPoly.length >= 3) emit(out.posB, out.uvB, outPoly);
            // Registra o segmento do isocontorno
            const cross = [];
            for(let i = 0; i < 3; i++){
                const j = (i + 1) % 3;
                const di = d[i] - threshold, dj = d[j] - threshold;
                if (di >= 0 !== dj >= 0) {
                    const t = di / (di - dj);
                    cross.push(P[i].clone().lerp(P[j], t));
                }
            }
            if (cross.length === 2) {
                out.seam.push(cross[0].x, cross[0].y, cross[0].z, cross[1].x, cross[1].y, cross[1].z);
            }
        }
    }
    return out;
}
// ─── Score de qualidade do contorno ────────────────────────────────────────────
function scoreSeam(seam, Q) {
    const segCount = seam.length / 6;
    if (segCount === 0) return {
        score: 0,
        segments: 0
    };
    const key = (x, y, z)=>`${Math.round(x * Q)},${Math.round(y * Q)},${Math.round(z * Q)}`;
    const nodePos = new Map();
    const adj = new Map();
    for(let s = 0; s < segCount; s++){
        const b = s * 6;
        const ka = key(seam[b], seam[b + 1], seam[b + 2]);
        const kb = key(seam[b + 3], seam[b + 4], seam[b + 5]);
        if (ka === kb) continue;
        nodePos.set(ka, [
            seam[b],
            seam[b + 1],
            seam[b + 2]
        ]);
        nodePos.set(kb, [
            seam[b + 3],
            seam[b + 4],
            seam[b + 5]
        ]);
        (adj.get(ka) ?? adj.set(ka, []).get(ka)).push(kb);
        (adj.get(kb) ?? adj.set(kb, []).get(kb)).push(ka);
    }
    let totalDev = 0;
    let nodes = 0;
    const a = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector3"](), c = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector3"](), center = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector3"]();
    for (const [k, nbs] of adj){
        if (nbs.length < 2) continue;
        const pc = nodePos.get(k);
        const pa = nodePos.get(nbs[0]);
        const pb = nodePos.get(nbs[1]);
        center.set(pc[0], pc[1], pc[2]);
        a.set(pa[0], pa[1], pa[2]).sub(center);
        c.set(pb[0], pb[1], pb[2]).sub(center);
        const la = a.length(), lc = c.length();
        if (la < 1e-9 || lc < 1e-9) continue;
        const cos = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MathUtils"].clamp(a.dot(c) / (la * lc), -1, 1);
        const angle = Math.acos(cos) * 180 / Math.PI;
        totalDev += Math.abs(180 - angle);
        nodes++;
    }
    const score = nodes > 0 ? totalDev / nodes : 0;
    return {
        score,
        segments: segCount
    };
}
// ─── Edge Relax: Taubin suavizante nos vértices da borda de corte ──────────────
/**
 * Identifica os vértices da borda aberta (costura) e aplica suavização Taubin
 * (λ/μ alternado) para eliminar picos e ondulações sem encolhimento.
 * Somente a borda de corte é modificada — a geometria externa permanece intacta.
 */ function relaxBoundary(pos, iterations) {
    if (iterations <= 0 || pos.length < 9) return;
    const Q = 1e4;
    const vertCount = pos.length / 3;
    const faceCount = vertCount / 3;
    // ── UID por posição quantizada ────────────────────────────────────────────
    const posKey = (i)=>`${Math.round(pos[i * 3] * Q)},${Math.round(pos[i * 3 + 1] * Q)},${Math.round(pos[i * 3 + 2] * Q)}`;
    const uidMap = new Map();
    const uid = new Int32Array(vertCount);
    for(let i = 0; i < vertCount; i++){
        const k = posKey(i);
        let id = uidMap.get(k);
        if (id === undefined) {
            id = uidMap.size;
            uidMap.set(k, id);
        }
        uid[i] = id;
    }
    const uidCount = uidMap.size;
    // ── Contagem de arestas → borda aberta = aparece 1 vez ───────────────────
    const edgeCnt = new Map();
    // Edge key = uid_min * uidCount + uid_max (hash compacto de inteiros)
    const edgeVerts = new Map();
    for(let f = 0; f < faceCount; f++){
        const corners = [
            f * 3,
            f * 3 + 1,
            f * 3 + 2
        ];
        for(let ci = 0; ci < 3; ci++){
            const a = corners[ci], b = corners[(ci + 1) % 3];
            const ua = uid[a], ub = uid[b];
            const k = ua < ub ? ua * uidCount + ub : ub * uidCount + ua;
            edgeCnt.set(k, (edgeCnt.get(k) ?? 0) + 1);
            if (!edgeVerts.has(k)) edgeVerts.set(k, [
                a,
                b
            ]);
        }
    }
    // ── Adjacência apenas na borda aberta ────────────────────────────────────
    const uidNeighbors = Array.from({
        length: uidCount
    }, ()=>new Set());
    const isBoundaryUID = new Uint8Array(uidCount);
    for (const [k, cnt] of edgeCnt){
        if (cnt !== 1) continue;
        const [a, b] = edgeVerts.get(k);
        const ua = uid[a], ub = uid[b];
        uidNeighbors[ua].add(ub);
        uidNeighbors[ub].add(ua);
        isBoundaryUID[ua] = 1;
        isBoundaryUID[ub] = 1;
    }
    if (isBoundaryUID.every((v)=>v === 0)) return;
    // ── Posição média por UID ─────────────────────────────────────────────────
    const uidPos = new Float32Array(uidCount * 3);
    const uidCnt = new Int32Array(uidCount);
    for(let i = 0; i < vertCount; i++){
        const u = uid[i];
        uidPos[u * 3] += pos[i * 3];
        uidPos[u * 3 + 1] += pos[i * 3 + 1];
        uidPos[u * 3 + 2] += pos[i * 3 + 2];
        uidCnt[u]++;
    }
    for(let u = 0; u < uidCount; u++){
        if (uidCnt[u] > 0) {
            uidPos[u * 3] /= uidCnt[u];
            uidPos[u * 3 + 1] /= uidCnt[u];
            uidPos[u * 3 + 2] /= uidCnt[u];
        }
    }
    // ── Taubin smooth (λ/μ alternado) sobre UIDs de borda ────────────────────
    const LAMBDA = 0.5;
    const MU = -0.53;
    const buf = new Float32Array(uidCount * 3);
    for(let iter = 0; iter < iterations * 2; iter++){
        const factor = iter % 2 === 0 ? LAMBDA : MU;
        buf.set(uidPos);
        for(let u = 0; u < uidCount; u++){
            if (!isBoundaryUID[u]) continue;
            const nb = uidNeighbors[u];
            const n = nb.size;
            if (n === 0) continue;
            let sx = 0, sy = 0, sz = 0;
            for (const v of nb){
                sx += uidPos[v * 3];
                sy += uidPos[v * 3 + 1];
                sz += uidPos[v * 3 + 2];
            }
            const avg_x = sx / n, avg_y = sy / n, avg_z = sz / n;
            buf[u * 3] = uidPos[u * 3] + factor * (avg_x - uidPos[u * 3]);
            buf[u * 3 + 1] = uidPos[u * 3 + 1] + factor * (avg_y - uidPos[u * 3 + 1]);
            buf[u * 3 + 2] = uidPos[u * 3 + 2] + factor * (avg_z - uidPos[u * 3 + 2]);
        }
        uidPos.set(buf);
    }
    // ── Aplica de volta nos vértices originais ────────────────────────────────
    for(let i = 0; i < vertCount; i++){
        const u = uid[i];
        if (!isBoundaryUID[u]) continue;
        pos[i * 3] = uidPos[u * 3];
        pos[i * 3 + 1] = uidPos[u * 3 + 1];
        pos[i * 3 + 2] = uidPos[u * 3 + 2];
    }
}
// ─── Boundary Cleanup: remove faces degeneradas e picos ───────────────────────
/**
 * Remove triângulos com área negligível (degenerate faces) que causam
 * artefatos visuais e problemas em impressão 3D.
 */ function cleanupDegenerateFaces(pos) {
    const cleaned = [];
    const faceCount = pos.length / 9;
    const MIN_AREA = 1e-10;
    const ab = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector3"](), ac = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector3"](), cross = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector3"]();
    for(let f = 0; f < faceCount; f++){
        const b = f * 9;
        ab.set(pos[b + 3] - pos[b], pos[b + 4] - pos[b + 1], pos[b + 5] - pos[b + 2]);
        ac.set(pos[b + 6] - pos[b], pos[b + 7] - pos[b + 1], pos[b + 8] - pos[b + 2]);
        cross.crossVectors(ab, ac);
        if (cross.lengthSq() > MIN_AREA) {
            for(let i = 0; i < 9; i++)cleaned.push(pos[b + i]);
        }
    }
    return cleaned;
}
// ─── Montagem de uma peça a partir dos buffers ─────────────────────────────────
function buildPiece(pos, uv, hasUV, weldQ, relaxIterations) {
    // Edge relax da borda de corte antes de fechar a tampa
    relaxBoundary(pos, relaxIterations);
    // Remove faces degeneradas geradas pelo clipping
    const cleanPos = cleanupDegenerateFaces(pos);
    const posToUse = cleanPos.length >= 9 ? cleanPos : pos;
    const geo = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BufferGeometry"]();
    geo.setAttribute('position', new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Float32BufferAttribute"](new Float32Array(posToUse), 3));
    if (hasUV && uv.length === posToUse.length / 3 * 2) {
        geo.setAttribute('uv', new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Float32BufferAttribute"](new Float32Array(uv), 2));
    }
    // Tampa fecha a costura → peça maciça e imprimível
    const faceCount = posToUse.length / 9;
    const allFaces = new Set();
    for(let f = 0; f < faceCount; f++)allFaces.add(f);
    const cap = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$smart$2d$cut$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["buildCap"])(geo, allFaces, weldQ);
    if (cap.pos.length > 0) {
        const shellV = posToUse.length / 3;
        const capV = cap.pos.length / 3;
        const merged = new Float32Array((shellV + capV) * 3);
        merged.set(new Float32Array(posToUse), 0);
        merged.set(cap.pos, shellV * 3);
        geo.setAttribute('position', new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Float32BufferAttribute"](merged, 3));
        if (geo.getAttribute('uv')) {
            const mUV = new Float32Array((shellV + capV) * 2);
            mUV.set(new Float32Array(uv), 0);
            geo.setAttribute('uv', new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Float32BufferAttribute"](mUV, 2));
        }
    }
    try {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$smart$2d$cut$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["computeSmoothNormalsByPosition"])(geo);
    } catch  {
        geo.computeVertexNormals();
    }
    geo.computeBoundingBox();
    geo.computeBoundingSphere();
    return geo;
}
function validateCutResult(selectedPiece, bodyPiece) {
    const issues = [];
    const checkPiece = (geo, label)=>{
        const posAttr = geo.getAttribute('position');
        const vertCount = posAttr.count;
        const faceCount = vertCount / 3;
        if (faceCount < 4) return;
        // 1. Faces degeneradas
        let degCount = 0;
        const ab = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector3"](), ac = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector3"](), cross = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector3"]();
        for(let f = 0; f < faceCount; f++){
            const b = f * 3;
            ab.set(posAttr.getX(b + 1) - posAttr.getX(b), posAttr.getY(b + 1) - posAttr.getY(b), posAttr.getZ(b + 1) - posAttr.getZ(b));
            ac.set(posAttr.getX(b + 2) - posAttr.getX(b), posAttr.getY(b + 2) - posAttr.getY(b), posAttr.getZ(b + 2) - posAttr.getZ(b));
            cross.crossVectors(ab, ac);
            if (cross.lengthSq() < 1e-18) degCount++;
        }
        if (degCount > 0) {
            issues.push({
                type: 'degenerate_faces',
                message: `${label}: ${degCount} face(s) degenerada(s) detectada(s)`,
                count: degCount
            });
        }
        // 2. Borda aberta (buracos)
        const Q = 1e4;
        const edgeCnt = new Map();
        const edgeKey = (ia, ib)=>{
            const qa = `${Math.round(posAttr.getX(ia) * Q)},${Math.round(posAttr.getY(ia) * Q)},${Math.round(posAttr.getZ(ia) * Q)}`;
            const qb = `${Math.round(posAttr.getX(ib) * Q)},${Math.round(posAttr.getY(ib) * Q)},${Math.round(posAttr.getZ(ib) * Q)}`;
            return qa < qb ? `${qa}|${qb}` : `${qb}|${qa}`;
        };
        for(let f = 0; f < faceCount; f++){
            const b = f * 3;
            for(let ci = 0; ci < 3; ci++){
                const k = edgeKey(b + ci, b + (ci + 1) % 3);
                edgeCnt.set(k, (edgeCnt.get(k) ?? 0) + 1);
            }
        }
        let openEdges = 0, nonManifold = 0;
        for (const cnt of edgeCnt.values()){
            if (cnt === 1) openEdges++;
            else if (cnt > 2) nonManifold++;
        }
        // Small number of open edges is expected (the seam before capping)
        const openThreshold = Math.max(3, faceCount * 0.01);
        if (openEdges > openThreshold) {
            issues.push({
                type: 'open_boundary',
                message: `${label}: ${openEdges} aresta(s) abertas — possível buraco na malha`,
                count: openEdges
            });
        }
        if (nonManifold > 0) {
            issues.push({
                type: 'non_manifold',
                message: `${label}: ${nonManifold} aresta(s) não-manifold`,
                count: nonManifold
            });
        }
    };
    checkPiece(selectedPiece, 'Peça selecionada');
    checkPiece(bodyPiece, 'Corpo');
    return issues;
}
function qualityContourCut(geometry, selected, options = {}) {
    const opts = {
        ...DEFAULT_QUALITY,
        ...options
    };
    const w = weldMesh(geometry, opts.weldQ);
    const phi0 = buildIndicatorField(w, selected);
    const hasUV = !!geometry.getAttribute('uv');
    const strength = Math.max(0, Math.min(1, opts.strength));
    let iterations = Math.max(6, Math.round(10 + strength * 60));
    const maxTries = opts.qualityFirst ? 4 : 1;
    let best = null;
    // Offset: desloca o isocontorno (threshold = offset em espaço phi)
    // Negativo expande a seleção, positivo contrai.
    const threshold = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MathUtils"].clamp(-(opts.offset ?? 0), -0.4, 0.4);
    for(let attempt = 0; attempt < maxTries; attempt++){
        const phi = diffuseField(phi0, w, iterations);
        const buf = marchTriangles(geometry, w, phi, hasUV, threshold);
        const { score, segments } = scoreSeam(buf.seam, opts.weldQ);
        if (!best || score < best.score) best = {
            buf,
            score,
            segments,
            iters: iterations
        };
        if (score <= opts.qualityThreshold || !opts.qualityFirst) break;
        iterations = Math.round(iterations * 1.8);
    }
    const chosen = best;
    const relaxIters = Math.max(0, Math.min(8, opts.relaxIterations ?? 2));
    const selectedPiece = buildPiece(chosen.buf.posA, chosen.buf.uvA, hasUV, opts.weldQ, relaxIters);
    const bodyPiece = buildPiece(chosen.buf.posB, chosen.buf.uvB, hasUV, opts.weldQ, relaxIters);
    const ok = (selectedPiece.getAttribute('position')?.count ?? 0) > 0 && (bodyPiece.getAttribute('position')?.count ?? 0) > 0;
    // Isocontorno como Float32Array para LineSegments no Preview
    const seamPoints = new Float32Array(chosen.buf.seam);
    // Validação automática das peças
    const validationIssues = ok ? validateCutResult(selectedPiece, bodyPiece) : [];
    return {
        selectedPiece,
        bodyPiece,
        seamPoints,
        seamScore: chosen.score,
        iterations: chosen.iters,
        seamSegments: chosen.segments,
        validationIssues,
        ok
    };
}
}),
"[project]/lib/smartcut-pipeline.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "V2_DEFAULT_OPTIONS",
    ()=>V2_DEFAULT_OPTIONS,
    "addCapsToShell",
    ()=>addCapsToShell,
    "computeOpenCut",
    ()=>computeOpenCut,
    "generateCaps",
    ()=>generateCaps,
    "optimizeMesh",
    ()=>optimizeMesh
]);
/**
 * SmartCut V2 Pipeline — Pipeline Modular de Corte Profissional
 * ──────────────────────────────────────────────────────────────
 *
 * Separa o pipeline em etapas independentes e explícitas:
 *
 *   ETAPA 1–3:  Cálculo do corte + Extração de Loops + Limpeza
 *               → cascas abertas (sem tampas)
 *   ETAPA 4–6:  Geração + Suavização + Validação das Tampas
 *               → peças totalmente fechadas
 *   ETAPA 7:    Preview inteligente (controlado pelo painel)
 *   ETAPA 8:    Geração de Encaixes (opcional, só se habilitado)
 *   ETAPA 9–10: União Final + Otimização
 *
 * Cada etapa é independente: falha em uma não destrói resultados anteriores.
 * A superfície externa original é SEMPRE preservada intacta.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/three/build/three.core.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$smart$2d$cut$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/smart-cut.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$quality$2d$cut$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/quality-cut.ts [app-ssr] (ecmascript)");
;
;
;
const V2_DEFAULT_OPTIONS = {
    strength: 0.6,
    weldQ: 1e4,
    offset: 0,
    relaxIterations: 2,
    qualityFirst: true
};
function weldMesh(geometry, Q) {
    const posAttr = geometry.getAttribute('position');
    const idxAttr = geometry.index;
    const faceCount = idxAttr ? idxAttr.count / 3 : posAttr.count / 3;
    const keyToUID = new Map();
    const faceUID = new Int32Array(faceCount * 3);
    const faceCorner = new Int32Array(faceCount * 3);
    const uidOf = (v)=>{
        const k = `${Math.round(posAttr.getX(v) * Q)},${Math.round(posAttr.getY(v) * Q)},${Math.round(posAttr.getZ(v) * Q)}`;
        let id = keyToUID.get(k);
        if (id === undefined) {
            id = keyToUID.size;
            keyToUID.set(k, id);
        }
        return id;
    };
    for(let f = 0; f < faceCount; f++){
        for(let c = 0; c < 3; c++){
            const v = idxAttr ? idxAttr.getX(f * 3 + c) : f * 3 + c;
            faceCorner[f * 3 + c] = v;
            faceUID[f * 3 + c] = uidOf(v);
        }
    }
    const uidCount = keyToUID.size;
    const nbSets = Array.from({
        length: uidCount
    }, ()=>new Set());
    for(let f = 0; f < faceCount; f++){
        const a = faceUID[f * 3], b = faceUID[f * 3 + 1], c = faceUID[f * 3 + 2];
        nbSets[a].add(b);
        nbSets[a].add(c);
        nbSets[b].add(a);
        nbSets[b].add(c);
        nbSets[c].add(a);
        nbSets[c].add(b);
    }
    return {
        faceUID,
        faceCorner,
        faceCount,
        uidCount,
        neighbors: nbSets.map((s)=>Int32Array.from(s))
    };
}
function buildIndicatorField(w, selected) {
    const totalCnt = new Float32Array(w.uidCount);
    const selCnt = new Float32Array(w.uidCount);
    for(let f = 0; f < w.faceCount; f++){
        const inSel = selected.has(f) ? 1 : 0;
        for(let c = 0; c < 3; c++){
            const uid = w.faceUID[f * 3 + c];
            totalCnt[uid] += 1;
            selCnt[uid] += inSel;
        }
    }
    const phi = new Float32Array(w.uidCount);
    for(let u = 0; u < w.uidCount; u++){
        const t = totalCnt[u] > 0 ? selCnt[u] / totalCnt[u] : 0;
        phi[u] = t * 2 - 1;
    }
    return phi;
}
function diffuseField(phi0, w, iterations) {
    const LAMBDA = 0.6, MU = -0.62;
    let cur = phi0.slice(), buf = new Float32Array(cur.length);
    for(let it = 0; it < iterations; it++){
        const factor = it % 2 === 0 ? LAMBDA : MU;
        for(let u = 0; u < w.uidCount; u++){
            const nb = w.neighbors[u];
            const n = nb.length;
            if (n === 0) {
                buf[u] = cur[u];
                continue;
            }
            let sum = 0;
            for(let i = 0; i < n; i++)sum += cur[nb[i]];
            buf[u] = cur[u] + factor * (sum / n - cur[u]);
        }
        const tmp = cur;
        cur = buf;
        buf = tmp;
    }
    return cur;
}
function marchTriangles(geometry, w, phi, hasUV, threshold) {
    const posAttr = geometry.getAttribute('position');
    const uvAttr = hasUV ? geometry.getAttribute('uv') : null;
    const out = {
        posA: [],
        uvA: [],
        posB: [],
        uvB: [],
        seam: []
    };
    const P = [
        new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector3"](),
        new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector3"](),
        new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector3"]()
    ];
    const U = [
        new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector2"](),
        new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector2"](),
        new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector2"]()
    ];
    const d = [
        0,
        0,
        0
    ];
    const lerpC = (i, j, t)=>({
            p: P[i].clone().lerp(P[j], t),
            u: hasUV ? U[i].clone().lerp(U[j], t) : new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector2"]()
        });
    const clip = (keepInside)=>{
        const poly = [];
        for(let i = 0; i < 3; i++){
            const j = (i + 1) % 3;
            const di = d[i] - threshold, dj = d[j] - threshold;
            const inI = keepInside ? di >= 0 : di < 0;
            const inJ = keepInside ? dj >= 0 : dj < 0;
            if (inI) poly.push({
                p: P[i].clone(),
                u: hasUV ? U[i].clone() : new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector2"]()
            });
            if (inI !== inJ) poly.push(lerpC(i, j, di / (di - dj)));
        }
        return poly;
    };
    const emit = (posArr, uvArr, poly)=>{
        for(let k = 1; k + 1 < poly.length; k++){
            const a = poly[0], b = poly[k], c = poly[k + 1];
            posArr.push(a.p.x, a.p.y, a.p.z, b.p.x, b.p.y, b.p.z, c.p.x, c.p.y, c.p.z);
            if (hasUV) uvArr.push(a.u.x, a.u.y, b.u.x, b.u.y, c.u.x, c.u.y);
        }
    };
    const noUV = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector2"]();
    for(let f = 0; f < w.faceCount; f++){
        for(let c = 0; c < 3; c++){
            const v = w.faceCorner[f * 3 + c];
            P[c].set(posAttr.getX(v), posAttr.getY(v), posAttr.getZ(v));
            if (uvAttr) U[c].set(uvAttr.getX(v), uvAttr.getY(v));
            d[c] = phi[w.faceUID[f * 3 + c]];
        }
        const nIn = (d[0] >= threshold ? 1 : 0) + (d[1] >= threshold ? 1 : 0) + (d[2] >= threshold ? 1 : 0);
        if (nIn === 3) {
            emit(out.posA, out.uvA, [
                {
                    p: P[0].clone(),
                    u: hasUV ? U[0].clone() : noUV
                },
                {
                    p: P[1].clone(),
                    u: hasUV ? U[1].clone() : noUV
                },
                {
                    p: P[2].clone(),
                    u: hasUV ? U[2].clone() : noUV
                }
            ]);
        } else if (nIn === 0) {
            emit(out.posB, out.uvB, [
                {
                    p: P[0].clone(),
                    u: hasUV ? U[0].clone() : noUV
                },
                {
                    p: P[1].clone(),
                    u: hasUV ? U[1].clone() : noUV
                },
                {
                    p: P[2].clone(),
                    u: hasUV ? U[2].clone() : noUV
                }
            ]);
        } else {
            const inPoly = clip(true), outPoly = clip(false);
            if (inPoly.length >= 3) emit(out.posA, out.uvA, inPoly);
            if (outPoly.length >= 3) emit(out.posB, out.uvB, outPoly);
            const cross = [];
            for(let i = 0; i < 3; i++){
                const j = (i + 1) % 3;
                const di = d[i] - threshold, dj = d[j] - threshold;
                if (di >= 0 !== dj >= 0) cross.push(P[i].clone().lerp(P[j], di / (di - dj)));
            }
            if (cross.length === 2) out.seam.push(cross[0].x, cross[0].y, cross[0].z, cross[1].x, cross[1].y, cross[1].z);
        }
    }
    return out;
}
function scoreSeam(seam, Q) {
    const segCount = seam.length / 6;
    if (segCount === 0) return {
        score: 0,
        segments: 0
    };
    const key = (x, y, z)=>`${Math.round(x * Q)},${Math.round(y * Q)},${Math.round(z * Q)}`;
    const nodePos = new Map();
    const adj = new Map();
    for(let s = 0; s < segCount; s++){
        const b = s * 6;
        const ka = key(seam[b], seam[b + 1], seam[b + 2]);
        const kb = key(seam[b + 3], seam[b + 4], seam[b + 5]);
        if (ka === kb) continue;
        nodePos.set(ka, [
            seam[b],
            seam[b + 1],
            seam[b + 2]
        ]);
        nodePos.set(kb, [
            seam[b + 3],
            seam[b + 4],
            seam[b + 5]
        ]);
        (adj.get(ka) ?? adj.set(ka, []).get(ka)).push(kb);
        (adj.get(kb) ?? adj.set(kb, []).get(kb)).push(ka);
    }
    let totalDev = 0, nodes = 0;
    const a = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector3"](), c = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector3"](), center = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector3"]();
    for (const [k, nbs] of adj){
        if (nbs.length < 2) continue;
        const pc = nodePos.get(k), pa = nodePos.get(nbs[0]), pb = nodePos.get(nbs[1]);
        center.set(pc[0], pc[1], pc[2]);
        a.set(pa[0], pa[1], pa[2]).sub(center);
        c.set(pb[0], pb[1], pb[2]).sub(center);
        const la = a.length(), lc = c.length();
        if (la < 1e-9 || lc < 1e-9) continue;
        totalDev += Math.abs(180 - Math.acos(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MathUtils"].clamp(a.dot(c) / (la * lc), -1, 1)) * 180 / Math.PI);
        nodes++;
    }
    return {
        score: nodes > 0 ? totalDev / nodes : 0,
        segments: segCount
    };
}
/** Etapa 3: Limpa a fronteira da malha via Taubin suave na borda aberta. */ function relaxBoundary(pos, iterations) {
    if (iterations <= 0 || pos.length < 9) return;
    const Q = 1e4;
    const vertCount = pos.length / 3;
    const faceCount = vertCount / 3;
    const posKey = (i)=>`${Math.round(pos[i * 3] * Q)},${Math.round(pos[i * 3 + 1] * Q)},${Math.round(pos[i * 3 + 2] * Q)}`;
    const uidMap = new Map();
    const uid = new Int32Array(vertCount);
    for(let i = 0; i < vertCount; i++){
        const k = posKey(i);
        let id = uidMap.get(k);
        if (id === undefined) {
            id = uidMap.size;
            uidMap.set(k, id);
        }
        uid[i] = id;
    }
    const uidCount = uidMap.size;
    const edgeCnt = new Map();
    const edgeVerts = new Map();
    for(let f = 0; f < faceCount; f++){
        for(let ci = 0; ci < 3; ci++){
            const a = f * 3 + ci, b = f * 3 + (ci + 1) % 3;
            const ua = uid[a], ub = uid[b];
            const k = ua < ub ? ua * uidCount + ub : ub * uidCount + ua;
            edgeCnt.set(k, (edgeCnt.get(k) ?? 0) + 1);
            if (!edgeVerts.has(k)) edgeVerts.set(k, [
                a,
                b
            ]);
        }
    }
    const uidNeighbors = Array.from({
        length: uidCount
    }, ()=>new Set());
    const isBoundaryUID = new Uint8Array(uidCount);
    for (const [k, cnt] of edgeCnt){
        if (cnt !== 1) continue;
        const [a, b] = edgeVerts.get(k);
        const ua = uid[a], ub = uid[b];
        uidNeighbors[ua].add(ub);
        uidNeighbors[ub].add(ua);
        isBoundaryUID[ua] = 1;
        isBoundaryUID[ub] = 1;
    }
    if (isBoundaryUID.every((v)=>v === 0)) return;
    const uidPos = new Float32Array(uidCount * 3);
    const uidCnt = new Int32Array(uidCount);
    for(let i = 0; i < vertCount; i++){
        const u = uid[i];
        uidPos[u * 3] += pos[i * 3];
        uidPos[u * 3 + 1] += pos[i * 3 + 1];
        uidPos[u * 3 + 2] += pos[i * 3 + 2];
        uidCnt[u]++;
    }
    for(let u = 0; u < uidCount; u++){
        if (uidCnt[u] > 0) {
            uidPos[u * 3] /= uidCnt[u];
            uidPos[u * 3 + 1] /= uidCnt[u];
            uidPos[u * 3 + 2] /= uidCnt[u];
        }
    }
    const LAMBDA = 0.5, MU = -0.53;
    const buf = new Float32Array(uidCount * 3);
    for(let iter = 0; iter < iterations * 2; iter++){
        const factor = iter % 2 === 0 ? LAMBDA : MU;
        buf.set(uidPos);
        for(let u = 0; u < uidCount; u++){
            if (!isBoundaryUID[u]) continue;
            const nb = uidNeighbors[u];
            const n = nb.size;
            if (n === 0) continue;
            let sx = 0, sy = 0, sz = 0;
            for (const v of nb){
                sx += uidPos[v * 3];
                sy += uidPos[v * 3 + 1];
                sz += uidPos[v * 3 + 2];
            }
            buf[u * 3] = uidPos[u * 3] + factor * (sx / n - uidPos[u * 3]);
            buf[u * 3 + 1] = uidPos[u * 3 + 1] + factor * (sy / n - uidPos[u * 3 + 1]);
            buf[u * 3 + 2] = uidPos[u * 3 + 2] + factor * (sz / n - uidPos[u * 3 + 2]);
        }
        uidPos.set(buf);
    }
    for(let i = 0; i < vertCount; i++){
        const u = uid[i];
        if (!isBoundaryUID[u]) continue;
        pos[i * 3] = uidPos[u * 3];
        pos[i * 3 + 1] = uidPos[u * 3 + 1];
        pos[i * 3 + 2] = uidPos[u * 3 + 2];
    }
}
/** Remove triângulos com área negligível (faces degeneradas). */ function cleanupDegenerateFaces(pos) {
    const cleaned = [];
    const faceCount = pos.length / 9;
    const ab = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector3"](), ac = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector3"](), cross = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector3"]();
    for(let f = 0; f < faceCount; f++){
        const b = f * 9;
        ab.set(pos[b + 3] - pos[b], pos[b + 4] - pos[b + 1], pos[b + 5] - pos[b + 2]);
        ac.set(pos[b + 6] - pos[b], pos[b + 7] - pos[b + 1], pos[b + 8] - pos[b + 2]);
        cross.crossVectors(ab, ac);
        if (cross.lengthSq() > 1e-10) for(let i = 0; i < 9; i++)cleaned.push(pos[b + i]);
    }
    return cleaned;
}
/** Constrói casca ABERTA (sem tampa). Inclui limpeza e normalização. */ function buildOpenShell(pos, weldQ, relaxIterations) {
    relaxBoundary(pos, relaxIterations);
    const cleanPos = cleanupDegenerateFaces(pos);
    const posToUse = cleanPos.length >= 9 ? cleanPos : pos;
    const geo = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BufferGeometry"]();
    geo.setAttribute('position', new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Float32BufferAttribute"](new Float32Array(posToUse), 3));
    try {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$smart$2d$cut$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["computeSmoothNormalsByPosition"])(geo);
    } catch  {
        geo.computeVertexNormals();
    }
    geo.computeBoundingBox();
    geo.computeBoundingSphere();
    return geo;
}
function addCapsToShell(openGeo, weldQ) {
    const posAttr = openGeo.getAttribute('position');
    const posArr = [];
    for(let i = 0; i < posAttr.count; i++){
        posArr.push(posAttr.getX(i), posAttr.getY(i), posAttr.getZ(i));
    }
    const geo = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BufferGeometry"]();
    geo.setAttribute('position', new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Float32BufferAttribute"](new Float32Array(posArr), 3));
    const faceCount = posArr.length / 9;
    const allFaces = new Set();
    for(let f = 0; f < faceCount; f++)allFaces.add(f);
    const cap = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$smart$2d$cut$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["buildCap"])(geo, allFaces, weldQ);
    if (cap.pos.length > 0) {
        const shellV = posArr.length / 3;
        const capV = cap.pos.length / 3;
        const merged = new Float32Array((shellV + capV) * 3);
        merged.set(new Float32Array(posArr), 0);
        merged.set(cap.pos, shellV * 3);
        geo.setAttribute('position', new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Float32BufferAttribute"](merged, 3));
    }
    try {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$smart$2d$cut$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["computeSmoothNormalsByPosition"])(geo);
    } catch  {
        geo.computeVertexNormals();
    }
    geo.computeBoundingBox();
    geo.computeBoundingSphere();
    return geo;
}
function computeOpenCut(geometry, selectedFaces, options = {}) {
    const opts = {
        ...V2_DEFAULT_OPTIONS,
        ...options
    };
    const w = weldMesh(geometry, opts.weldQ);
    const phi0 = buildIndicatorField(w, selectedFaces);
    const hasUV = !!geometry.getAttribute('uv');
    const strength = Math.max(0, Math.min(1, opts.strength));
    const threshold = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MathUtils"].clamp(-(opts.offset ?? 0), -0.4, 0.4);
    let iterations = Math.max(6, Math.round(10 + strength * 60));
    const maxTries = opts.qualityFirst !== false ? 4 : 1;
    let best = null;
    for(let attempt = 0; attempt < maxTries; attempt++){
        const phi = diffuseField(phi0, w, iterations);
        const buf = marchTriangles(geometry, w, phi, hasUV, threshold);
        const { score, segments } = scoreSeam(buf.seam, opts.weldQ);
        if (!best || score < best.score) best = {
            ...buf,
            score,
            segments,
            iters: iterations
        };
        if (score <= 12 || !opts.qualityFirst) break;
        iterations = Math.round(iterations * 1.8);
    }
    const chosen = best;
    const relaxIters = Math.max(0, Math.min(8, opts.relaxIterations ?? 2));
    const openSelectedGeometry = buildOpenShell(chosen.posA.slice(), opts.weldQ, relaxIters);
    const openBodyGeometry = buildOpenShell(chosen.posB.slice(), opts.weldQ, relaxIters);
    const ok = (openSelectedGeometry.getAttribute('position')?.count ?? 0) > 0 && (openBodyGeometry.getAttribute('position')?.count ?? 0) > 0;
    return {
        openSelectedGeometry,
        openBodyGeometry,
        seamPoints: new Float32Array(chosen.seam),
        seamScore: chosen.score,
        seamSegments: chosen.segments,
        iterations: chosen.iters,
        ok
    };
}
function generateCaps(openResult, weldQ) {
    const cappedSel = addCapsToShell(openResult.openSelectedGeometry, weldQ);
    const cappedBody = addCapsToShell(openResult.openBodyGeometry, weldQ);
    const ok = (cappedSel.getAttribute('position')?.count ?? 0) > 0 && (cappedBody.getAttribute('position')?.count ?? 0) > 0;
    const validationIssues = ok ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$quality$2d$cut$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["validateCutResult"])(cappedSel, cappedBody) : [];
    return {
        cappedSelectedGeometry: cappedSel,
        cappedBodyGeometry: cappedBody,
        validationIssues,
        ok
    };
}
function optimizeMesh(geo, weldQ = 1e4) {
    const posAttr = geo.getAttribute('position');
    const vertCount = posAttr.count;
    const keyToId = new Map();
    const idPos = [];
    const vertRemap = new Int32Array(vertCount);
    for(let i = 0; i < vertCount; i++){
        const k = `${Math.round(posAttr.getX(i) * weldQ)},${Math.round(posAttr.getY(i) * weldQ)},${Math.round(posAttr.getZ(i) * weldQ)}`;
        let id = keyToId.get(k);
        if (id === undefined) {
            id = idPos.length / 3;
            keyToId.set(k, id);
            idPos.push(posAttr.getX(i), posAttr.getY(i), posAttr.getZ(i));
        }
        vertRemap[i] = id;
    }
    const faceCount = vertCount / 3;
    const indices = [];
    for(let f = 0; f < faceCount; f++){
        const a = vertRemap[f * 3], b = vertRemap[f * 3 + 1], c = vertRemap[f * 3 + 2];
        if (a !== b && b !== c && a !== c) indices.push(a, b, c);
    }
    const newGeo = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BufferGeometry"]();
    newGeo.setAttribute('position', new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Float32BufferAttribute"](new Float32Array(idPos), 3));
    newGeo.setIndex(indices);
    newGeo.computeVertexNormals();
    newGeo.computeBoundingBox();
    newGeo.computeBoundingSphere();
    return newGeo;
}
}),
"[project]/lib/smart-autocut.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "analyzeSelection",
    ()=>analyzeSelection,
    "computeAutoCutPlane",
    ()=>computeAutoCutPlane,
    "makeDowelGeometry",
    ()=>makeDowelGeometry,
    "makeHoleGeometry",
    ()=>makeHoleGeometry,
    "planConnectors",
    ()=>planConnectors,
    "recommendConnectors",
    ()=>recommendConnectors
]);
/**
 * Smart AutoCut — AutoCut Inteligente na Seleção (SmartCut → AutoCut)
 * ------------------------------------------------------------------
 * Recebe uma REGIÃO selecionada pelo SmartCut (conjunto de faces) e decide
 * automaticamente a MELHOR forma de separá-la do resto do modelo:
 *
 *   1. Extrai a "costura" da seleção (arestas entre faces selecionadas e não
 *      selecionadas) — a junção natural onde o corte deve passar.
 *   2. Ajusta um PLANO por mínimos quadrados (PCA) ao anel de costura.
 *      - 'plano'       → plano alinhado ao eixo de menor variação.
 *      - 'inteligente' → melhor plano; se estiver ~alinhado a um eixo, encaixa
 *                        nele (corte mais limpo). Caso contrário, inclina.
 *      - 'adaptativo'  → melhor plano ajustado, sempre inclinado se necessário.
 *   3. Analisa a seção transversal (área, espessura, alongamento) para decidir
 *      se ENCAIXES agregam valor — e quantos/qual tipo.
 *   4. Planeja os encaixes (posição, orientação, raio, profundidade, tipo).
 *
 * O corte físico watertight reaproveita `solidPlaneCut`; os furos dos encaixes
 * são feitos por CSG (three-bvh-csg) no componente de UI.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/three/build/three.core.js [app-ssr] (ecmascript)");
;
// ─── Utilidades de vértice ──────────────────────────────────────────────────
const Q = 1e4;
function keyOf(x, y, z) {
    return `${Math.round(x * Q)},${Math.round(y * Q)},${Math.round(z * Q)}`;
}
function analyzeSelection(geometry, selectedFaces) {
    const posAttr = geometry.getAttribute('position');
    const idxAttr = geometry.index;
    const faceCount = idxAttr ? idxAttr.count / 3 : posAttr.count / 3;
    if (!geometry.boundingBox) geometry.computeBoundingBox();
    const bbox = geometry.boundingBox;
    const size = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector3"]();
    bbox.getSize(size);
    const modelDiagonal = size.length() || 1;
    // Soldagem de vértices por posição
    const keyToId = new Map();
    const idPos = [];
    const vId = (v)=>{
        const k = keyOf(posAttr.getX(v), posAttr.getY(v), posAttr.getZ(v));
        let id = keyToId.get(k);
        if (id === undefined) {
            id = idPos.length / 3;
            keyToId.set(k, id);
            idPos.push(posAttr.getX(v), posAttr.getY(v), posAttr.getZ(v));
        }
        return id;
    };
    const cornerId = (f, c)=>vId(idxAttr ? idxAttr.getX(f * 3 + c) : f * 3 + c);
    const edges = new Map();
    const selCenter = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector3"]();
    let selFaceCount = 0;
    for(let f = 0; f < faceCount; f++){
        const isSel = selectedFaces.has(f);
        const a = cornerId(f, 0);
        const b = cornerId(f, 1);
        const c = cornerId(f, 2);
        if (isSel) {
            // acumula centróide da seleção
            selCenter.x += (idPos[a * 3] + idPos[b * 3] + idPos[c * 3]) / 3;
            selCenter.y += (idPos[a * 3 + 1] + idPos[b * 3 + 1] + idPos[c * 3 + 1]) / 3;
            selCenter.z += (idPos[a * 3 + 2] + idPos[b * 3 + 2] + idPos[c * 3 + 2]) / 3;
            selFaceCount++;
        }
        const tri = [
            [
                a,
                b
            ],
            [
                b,
                c
            ],
            [
                c,
                a
            ]
        ];
        for (const [x, y] of tri){
            const lo = Math.min(x, y);
            const hi = Math.max(x, y);
            const k = `${lo}_${hi}`;
            let info = edges.get(k);
            if (!info) {
                info = {
                    sel: 0,
                    unsel: 0,
                    a: lo,
                    b: hi
                };
                edges.set(k, info);
            }
            if (isSel) info.sel++;
            else info.unsel++;
        }
    }
    if (selFaceCount > 0) selCenter.multiplyScalar(1 / selFaceCount);
    // Costura = arestas com pelo menos uma face selecionada e uma não selecionada
    const seamPointIds = new Set();
    let seamEdges = 0;
    for (const info of edges.values()){
        if (info.sel > 0 && info.unsel > 0) {
            seamEdges++;
            seamPointIds.add(info.a);
            seamPointIds.add(info.b);
        }
    }
    // ── Fallback: sem costura utilizável (seleção isolada ou peça inteira) ──────
    if (seamPointIds.size < 3) {
        return fallbackAnalysis(geometry, selectedFaces, selCenter, modelDiagonal, idPos);
    }
    // Pontos da costura
    const pts = [];
    const seamCenter = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector3"]();
    for (const id of seamPointIds){
        const p = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector3"](idPos[id * 3], idPos[id * 3 + 1], idPos[id * 3 + 2]);
        pts.push(p);
        seamCenter.add(p);
    }
    seamCenter.multiplyScalar(1 / pts.length);
    // ── PCA: covariância dos pontos da costura ─────────────────────────────────
    const cov = covariance(pts, seamCenter);
    const { values, vectors } = symmetricEigen3(cov);
    // values ascendente → vectors[0] é a menor variação = normal do plano
    const fitNormal = vectors[0].clone().normalize();
    const planeU = vectors[2].clone().normalize() // maior variação
    ;
    const planeV = vectors[1].clone().normalize();
    // Planaridade: 1 - (menorVar / mediaVar) — alta quando a costura é bem plana
    const sumVar = values[0] + values[1] + values[2] || 1;
    const planarity = clamp01(1 - values[0] / (sumVar / 3));
    // Extensões na base do plano
    let halfU = 0;
    let halfV = 0;
    for (const p of pts){
        const rel = p.clone().sub(seamCenter);
        halfU = Math.max(halfU, Math.abs(rel.dot(planeU)));
        halfV = Math.max(halfV, Math.abs(rel.dot(planeV)));
    }
    const crossArea = Math.PI * halfU * halfV;
    // Eixo cartesiano mais próximo da fitNormal
    const { axisNormal, tilt } = nearestAxis(fitNormal);
    return {
        seamEdges,
        seamCenter,
        selectionCenter: selCenter,
        fitNormal,
        axisNormal,
        planeU,
        planeV,
        halfU,
        halfV,
        crossArea,
        planarity,
        axisTilt: tilt,
        modelDiagonal,
        hasSeam: true
    };
}
/** Fallback quando não há costura clara: usa a bbox da seleção. */ function fallbackAnalysis(geometry, selectedFaces, selCenter, modelDiagonal, idPos) {
    const posAttr = geometry.getAttribute('position');
    const idxAttr = geometry.index;
    const box = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Box3"]();
    const v = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector3"]();
    for (const f of selectedFaces){
        for(let c = 0; c < 3; c++){
            const vi = idxAttr ? idxAttr.getX(f * 3 + c) : f * 3 + c;
            v.set(posAttr.getX(vi), posAttr.getY(vi), posAttr.getZ(vi));
            box.expandByPoint(v);
        }
    }
    const size = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector3"]();
    box.getSize(size);
    const center = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector3"]();
    box.getCenter(center);
    // Eixo de menor extensão da caixa = normal
    const comps = [
        [
            size.x,
            new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector3"](1, 0, 0)
        ],
        [
            size.y,
            new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector3"](0, 1, 0)
        ],
        [
            size.z,
            new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector3"](0, 0, 1)
        ]
    ];
    comps.sort((a, b)=>a[0] - b[0]);
    const normal = comps[0][1];
    const planeU = comps[2][1];
    const planeV = comps[1][1];
    return {
        seamEdges: 0,
        seamCenter: center,
        selectionCenter: selCenter.lengthSq() > 0 ? selCenter : center,
        fitNormal: normal.clone(),
        axisNormal: normal.clone(),
        planeU,
        planeV,
        halfU: comps[2][0] / 2,
        halfV: comps[1][0] / 2,
        crossArea: Math.PI * comps[2][0] * comps[1][0] / 4,
        planarity: 0.5,
        axisTilt: 0,
        modelDiagonal,
        hasSeam: false
    };
}
function computeAutoCutPlane(analysis, cutType) {
    const point = analysis.seamCenter.clone();
    if (cutType === 'plane') {
        return {
            normal: analysis.axisNormal.clone(),
            point
        };
    }
    if (cutType === 'adaptive') {
        return {
            normal: analysis.fitNormal.clone(),
            point
        };
    }
    // 'smart': encaixa no eixo se estiver quase alinhado, senão inclina
    if (analysis.axisTilt <= 14) {
        return {
            normal: analysis.axisNormal.clone(),
            point
        };
    }
    return {
        normal: analysis.fitNormal.clone(),
        point
    };
}
function recommendConnectors(analysis, opts) {
    const minDim = Math.min(analysis.halfU, analysis.halfV) * 2;
    const maxDim = Math.max(analysis.halfU, analysis.halfV) * 2;
    const diag = analysis.modelDiagonal;
    const disabled = (skipReason)=>({
            enabled: false,
            count: 0,
            type: 'cylindrical',
            radius: 0,
            depth: 0,
            skipReason
        });
    if (!opts.createConnectors) return disabled('encaixes desativados');
    // Detecção automática: peça muito pequena / seção muito fina → sem encaixe
    if (minDim < diag * 0.025) return disabled('seção fina demais para encaixe seguro');
    if (analysis.crossArea < diag * diag * 0.0009) return disabled('seção pequena demais');
    // Raio base ~ 18% da menor dimensão, limitado
    const radius = clamp(minDim * 0.18, diag * 0.006, diag * 0.06);
    const depth = clamp(radius * 2.4, diag * 0.02, diag * 0.14);
    // Quantidade automática por tamanho da seção
    let count;
    if (opts.count === 'auto') {
        if (maxDim > diag * 0.28) count = 3;
        else if (maxDim > diag * 0.12) count = 2;
        else count = 1;
    } else {
        count = opts.count;
    }
    // Não cria mais encaixes do que cabem lado a lado
    const maxFit = Math.max(1, Math.floor(maxDim / (radius * 3)));
    count = Math.min(count, maxFit);
    // Tipo automático: seção alongada → chavetado (anti-rotação); senão cilíndrico
    let type;
    if (opts.type === 'auto') {
        const aspect = maxDim / (minDim || 1);
        type = aspect > 1.8 ? 'keyed' : 'cylindrical';
    } else {
        type = opts.type;
    }
    return {
        enabled: true,
        count,
        type,
        radius,
        depth
    };
}
function planConnectors(analysis, plane, resolved) {
    if (!resolved.enabled || resolved.count <= 0) return [];
    const quat = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Quaternion"]().setFromUnitVectors(new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector3"](0, 1, 0), plane.normal.clone().normalize());
    // Distribui ao longo do eixo perpendicular mais largo da seção
    const useU = analysis.halfU >= analysis.halfV;
    const along = (useU ? analysis.planeU : analysis.planeV).clone().normalize();
    const half = useU ? analysis.halfU : analysis.halfV;
    const usableHalf = Math.max(half - resolved.radius * 1.5, 0);
    const specs = [];
    const n = resolved.count;
    for(let i = 0; i < n; i++){
        // t de -1..1 distribuído; centro quando n ímpar
        const t = n === 1 ? 0 : i / (n - 1) * 2 - 1;
        const pos = plane.point.clone().add(along.clone().multiplyScalar(t * usableHalf));
        specs.push({
            position: pos,
            quaternion: quat.clone(),
            type: resolved.type,
            radius: resolved.radius,
            depth: resolved.depth
        });
    }
    return specs;
}
function makeHoleGeometry(type, radius, tolerance, depth) {
    const r = radius + tolerance;
    const h = depth * 2 + Math.max(depth * 0.25, radius * 0.5);
    return makeShape(type, r, h);
}
function makeDowelGeometry(type, radius, depth) {
    const h = depth * 2 - Math.min(0.4, depth * 0.1);
    return makeShape(type, radius, h);
}
function makeShape(type, r, h) {
    let geo;
    switch(type){
        case 'conical':
            geo = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CylinderGeometry"](r * 0.6, r, h, 28);
            break;
        case 'rectangular':
            geo = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BoxGeometry"](r * 1.8, h, r * 1.8);
            break;
        case 'oval':
            geo = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CylinderGeometry"](r, r, h, 28);
            geo.scale(1.7, 1, 0.7);
            break;
        case 'keyed':
            // Prisma achatado (formato de chaveta) — impede rotação da junta
            geo = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BoxGeometry"](r * 2.4, h, r * 1.05);
            break;
        case 'cylindrical':
        default:
            geo = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CylinderGeometry"](r, r, h, 28);
            break;
    }
    geo.deleteAttribute('uv');
    return geo;
}
function covariance(pts, center) {
    let xx = 0, xy = 0, xz = 0, yy = 0, yz = 0, zz = 0;
    for (const p of pts){
        const dx = p.x - center.x;
        const dy = p.y - center.y;
        const dz = p.z - center.z;
        xx += dx * dx;
        xy += dx * dy;
        xz += dx * dz;
        yy += dy * dy;
        yz += dy * dz;
        zz += dz * dz;
    }
    const n = pts.length || 1;
    return [
        xx / n,
        xy / n,
        xz / n,
        xy / n,
        yy / n,
        yz / n,
        xz / n,
        yz / n,
        zz / n
    ];
}
/**
 * Autovalores/autovetores de uma matriz simétrica 3x3 via Jacobi cíclico.
 * Retorna valores em ordem ascendente com os vetores correspondentes.
 */ function symmetricEigen3(m) {
    // Matriz de trabalho
    const a = [
        [
            m[0],
            m[1],
            m[2]
        ],
        [
            m[3],
            m[4],
            m[5]
        ],
        [
            m[6],
            m[7],
            m[8]
        ]
    ];
    // Matriz de autovetores (identidade)
    const v = [
        [
            1,
            0,
            0
        ],
        [
            0,
            1,
            0
        ],
        [
            0,
            0,
            1
        ]
    ];
    for(let sweep = 0; sweep < 32; sweep++){
        // Soma dos off-diagonais
        const off = Math.abs(a[0][1]) + Math.abs(a[0][2]) + Math.abs(a[1][2]);
        if (off < 1e-12) break;
        for (const [p, q] of [
            [
                0,
                1
            ],
            [
                0,
                2
            ],
            [
                1,
                2
            ]
        ]){
            const apq = a[p][q];
            if (Math.abs(apq) < 1e-15) continue;
            const app = a[p][p];
            const aqq = a[q][q];
            const phi = 0.5 * Math.atan2(2 * apq, aqq - app);
            const c = Math.cos(phi);
            const s = Math.sin(phi);
            // Rotação a = Jᵀ a J
            for(let k = 0; k < 3; k++){
                const akp = a[k][p];
                const akq = a[k][q];
                a[k][p] = c * akp - s * akq;
                a[k][q] = s * akp + c * akq;
            }
            for(let k = 0; k < 3; k++){
                const apk = a[p][k];
                const aqk = a[q][k];
                a[p][k] = c * apk - s * aqk;
                a[q][k] = s * apk + c * aqk;
            }
            // Acumula autovetores
            for(let k = 0; k < 3; k++){
                const vkp = v[k][p];
                const vkq = v[k][q];
                v[k][p] = c * vkp - s * vkq;
                v[k][q] = s * vkp + c * vkq;
            }
        }
    }
    const eig = [
        {
            val: a[0][0],
            vec: new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector3"](v[0][0], v[1][0], v[2][0])
        },
        {
            val: a[1][1],
            vec: new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector3"](v[0][1], v[1][1], v[2][1])
        },
        {
            val: a[2][2],
            vec: new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector3"](v[0][2], v[1][2], v[2][2])
        }
    ];
    eig.sort((x, y)=>x.val - y.val);
    return {
        values: eig.map((e)=>e.val),
        vectors: eig.map((e)=>e.vec.normalize())
    };
}
function nearestAxis(n) {
    const ax = Math.abs(n.x);
    const ay = Math.abs(n.y);
    const az = Math.abs(n.z);
    let axisNormal;
    let dot;
    if (ax >= ay && ax >= az) {
        axisNormal = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector3"](Math.sign(n.x) || 1, 0, 0);
        dot = ax;
    } else if (ay >= ax && ay >= az) {
        axisNormal = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector3"](0, Math.sign(n.y) || 1, 0);
        dot = ay;
    } else {
        axisNormal = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector3"](0, 0, Math.sign(n.z) || 1);
        dot = az;
    }
    const tilt = Math.acos(clamp(dot, 0, 1)) * (180 / Math.PI);
    return {
        axisNormal,
        tilt
    };
}
function clamp(x, lo, hi) {
    return x < lo ? lo : x > hi ? hi : x;
}
function clamp01(x) {
    return clamp(x, 0, 1);
}
}),
"[project]/lib/use-draggable.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useDraggable",
    ()=>useDraggable
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
"use client";
;
function useDraggable() {
    const [pos, setPos] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const drag = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])({
        active: false,
        ox: 0,
        oy: 0,
        ex: 0,
        ey: 0
    });
    const onHandleMouseDown = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((e)=>{
        // Only respond to primary button
        if (e.button !== 0) return;
        e.preventDefault();
        const panel = e.currentTarget.closest('[data-draggable]');
        if (!panel) return;
        const rect = panel.getBoundingClientRect();
        drag.current = {
            active: true,
            ox: e.clientX,
            oy: e.clientY,
            ex: rect.left,
            ey: rect.top
        };
        const onMove = (mv)=>{
            if (!drag.current.active) return;
            setPos({
                x: drag.current.ex + mv.clientX - drag.current.ox,
                y: drag.current.ey + mv.clientY - drag.current.oy
            });
        };
        const onUp = ()=>{
            drag.current.active = false;
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);
        };
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
    }, []);
    return {
        pos,
        onHandleMouseDown
    };
}
}),
"[project]/components/layout/smart-autocut-panel.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SmartAutoCutPanel",
    ()=>SmartAutoCutPanel
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
/**
 * SmartAutoCutPanel V2 — Pipeline Modular de Corte
 *
 * Novo fluxo (SmartCut V2):
 *   Configurar → Calcular Corte (cascas abertas) →
 *   Gerar Tampas → [Gerar Encaixes] → Aplicar Corte Final
 *
 * REGRA ABSOLUTA: A seleção do SmartCut é inviolável.
 * O AutoCut age SOMENTE na superfície de separação.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/sparkles.mjs [app-ssr] (ecmascript) <export default as Sparkles>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$scissors$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Scissors$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/scissors.mjs [app-ssr] (ecmascript) <export default as Scissors>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.mjs [app-ssr] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/triangle-alert.mjs [app-ssr] (ecmascript) <export default as AlertTriangle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2d$2$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/settings-2.mjs [app-ssr] (ecmascript) <export default as Settings2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$waypoints$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Waypoints$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/waypoints.mjs [app-ssr] (ecmascript) <export default as Waypoints>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$brain$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Brain$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/brain.mjs [app-ssr] (ecmascript) <export default as Brain>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$waves$2d$horizontal$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Waves$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/waves-horizontal.mjs [app-ssr] (ecmascript) <export default as Waves>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/eye.mjs [app-ssr] (ecmascript) <export default as Eye>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-right.mjs [app-ssr] (ecmascript) <export default as ChevronRight>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sliders$2d$vertical$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Sliders$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/sliders-vertical.mjs [app-ssr] (ecmascript) <export default as Sliders>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/check.mjs [app-ssr] (ecmascript) <export default as Check>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$rotate$2d$ccw$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__RotateCcw$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/rotate-ccw.mjs [app-ssr] (ecmascript) <export default as RotateCcw>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/zap.mjs [app-ssr] (ecmascript) <export default as Zap>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layers$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Layers$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/layers.mjs [app-ssr] (ecmascript) <export default as Layers>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$square$2d$dashed$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__BoxSelect$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/square-dashed.mjs [app-ssr] (ecmascript) <export default as BoxSelect>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$grip$2d$horizontal$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__GripHorizontal$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/grip-horizontal.mjs [app-ssr] (ecmascript) <export default as GripHorizontal>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/three/build/three.core.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/store.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$smart$2d$cut$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/smart-cut.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$smartcut$2d$pipeline$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/smartcut-pipeline.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$smart$2d$autocut$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/smart-autocut.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$lang$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/lang-store.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$use$2d$draggable$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/use-draggable.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
;
;
;
;
;
;
const PRESETS = [
    {
        id: 'hair',
        label: 'Cabelo',
        icon: '✦',
        strength: 0.85,
        offset: 0,
        relaxIterations: 3,
        weldQ: 1e4,
        description: 'Contorno suave para mechas e detalhes finos'
    },
    {
        id: 'arm',
        label: 'Braço',
        icon: '⬡',
        strength: 0.65,
        offset: 0,
        relaxIterations: 2,
        weldQ: 1e4,
        description: 'Separação de membros e partes orgânicas'
    },
    {
        id: 'head',
        label: 'Cabeça',
        icon: '◉',
        strength: 0.7,
        offset: 0,
        relaxIterations: 2,
        weldQ: 1e4,
        description: 'Destacar cabeça, chapéu ou acessório'
    },
    {
        id: 'mini',
        label: 'Mini',
        icon: '◈',
        strength: 0.75,
        offset: 0,
        relaxIterations: 3,
        weldQ: 1e5,
        description: 'Alta precisão para miniaturas e peças pequenas'
    },
    {
        id: 'fdm',
        label: 'FDM',
        icon: '◆',
        strength: 1.0,
        offset: 0,
        relaxIterations: 4,
        weldQ: 1e5,
        description: 'Qualidade máxima para impressão 3D'
    }
];
const OFFSET_STEPS = [
    {
        value: -0.3,
        label: '−3'
    },
    {
        value: -0.15,
        label: '−1'
    },
    {
        value: 0,
        label: '0'
    },
    {
        value: 0.15,
        label: '+1'
    },
    {
        value: 0.3,
        label: '+3'
    }
];
const RELAX_STEPS = [
    {
        value: 0,
        label: 'Sem'
    },
    {
        value: 1,
        label: 'Leve'
    },
    {
        value: 2,
        label: 'Méd'
    },
    {
        value: 3,
        label: 'Fort'
    },
    {
        value: 4,
        label: 'Máx'
    }
];
const SMOOTH_LEVELS = [
    {
        id: 'subtle',
        label: 'Sutil',
        strength: 0.3
    },
    {
        id: 'balanced',
        label: 'Equil.',
        strength: 0.6
    },
    {
        id: 'strong',
        label: 'Forte',
        strength: 0.85
    },
    {
        id: 'max',
        label: 'Máx',
        strength: 1
    }
];
const PRECISION = [
    {
        id: 'low',
        label: 'Baixa',
        weldQ: 1e3
    },
    {
        id: 'medium',
        label: 'Média',
        weldQ: 1e4
    },
    {
        id: 'high',
        label: 'Alta',
        weldQ: 1e5
    },
    {
        id: 'ultra',
        label: 'Ultra',
        weldQ: 1e6
    }
];
function SmartAutoCutPanel() {
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$lang$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useT"])();
    const { pos, onHandleMouseDown } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$use$2d$draggable$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useDraggable"])();
    const { activeTool, autoCutOpen, setAutoCutOpen, modelMesh, modelInfo, selectedFaceIndices, selectionState, setModelMesh, setModelInfo, addCutPart, cutParts, setStatus, pushHistory, clearSelection, setAutoCutPreview, unit, cutPreview, setCutPreview, previewViewMode, setPreviewViewMode, openCutData, setOpenCutData, autoCutPipelineStage, setAutoCutPipelineStage, autoCutPreviewMode, setAutoCutPreviewMode, setSelectedFaceIndices } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAppStore"])();
    const [phase, setPhase] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('configure');
    const [contourMode, setContourMode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('ai');
    const [smoothLevel, setSmoothLevel] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('balanced');
    const [offset, setOffset] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    const [relaxIterations, setRelaxIterations] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(2);
    const [precision, setPrecision] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('high');
    const [activePreset, setActivePreset] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [advancedOpen, setAdvancedOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [noCap, setNoCap] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [busy, setBusy] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [capsGenerated, setCapsGenerated] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const recalcTimerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const computeVersionRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(0);
    const smoothStrength = SMOOTH_LEVELS.find((l)=>l.id === smoothLevel)?.strength ?? 0.6;
    const weldQ = PRECISION.find((p)=>p.id === precision).weldQ;
    const hasSelection = selectedFaceIndices.size > 0 && selectionState === 'selected';
    const visible = activeTool === 'select' && autoCutOpen && hasSelection && !!modelMesh;
    const analysis = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        if (!visible || !modelMesh) return null;
        try {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$smart$2d$autocut$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["analyzeSelection"])(modelMesh.geometry, selectedFaceIndices);
        } catch  {
            return null;
        }
    }, [
        visible,
        modelMesh,
        selectedFaceIndices
    ]);
    const disposePreviewGeos = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((preview)=>{
        if (!preview) return;
        try {
            preview.selectedGeometry.dispose();
        } catch  {}
        try {
            preview.bodyGeometry.dispose();
        } catch  {}
    }, []);
    const disposeOpenCutGeos = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((data)=>{
        if (!data) return;
        try {
            data.openSelectedGeometry.dispose();
        } catch  {}
        try {
            data.openBodyGeometry.dispose();
        } catch  {}
    }, []);
    const cancelPendingCompute = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        if (recalcTimerRef.current) {
            clearTimeout(recalcTimerRef.current);
            recalcTimerRef.current = null;
        }
        computeVersionRef.current++;
    }, []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!visible) {
            cancelPendingCompute();
            setPhase('configure');
            setCapsGenerated(false);
        }
        return ()=>{
            if (recalcTimerRef.current) clearTimeout(recalcTimerRef.current);
        };
    }, [
        visible,
        cancelPendingCompute
    ]);
    // ─── Etapa 1–3: Calcular Corte (cascas abertas) ─────────────────────────────
    const handleCalculateCut = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        if (!modelMesh || !analysis) return;
        const myVersion = ++computeVersionRef.current;
        setBusy(true);
        setCapsGenerated(false);
        setStatus('cutting', 'Calculando corte — extraindo cascas...');
        setTimeout(()=>{
            if (myVersion !== computeVersionRef.current) {
                setBusy(false);
                return;
            }
            try {
                const geo = modelMesh.geometry;
                // ── Auto-fill micro-fragmentos ──────────────────────────────────────
                // Antes de qualquer cálculo, absorve pequenas partículas não-selecionadas
                // que ficaram de fora do SmartCut e descarta cacos selecionados isolados.
                // Usa apenas limpeza por área — não altera o contorno da seleção principal.
                const { cleaned: effectiveSelection, addedFaces, removedFaces } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$smart$2d$cut$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["autoFillMicroFragments"])(geo, selectedFaceIndices);
                if (addedFaces + removedFaces > 0) {
                    setSelectedFaceIndices(effectiveSelection);
                    if (addedFaces > 0) {
                        setStatus('cutting', `Ajustando seleção — ${addedFaces} face(s) absorvida(s)${removedFaces > 0 ? `, ${removedFaces} caco(s) removido(s)` : ''}...`);
                    }
                }
                let openResult;
                if (contourMode === 'exact') {
                    // Modo exato: separa pelo contorno da malha sem reconstrução
                    const selGeo = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$smart$2d$cut$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["extractSubMesh"])(geo, effectiveSelection, true, weldQ);
                    const bodyGeo = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$smart$2d$cut$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["removeSubMesh"])(geo, effectiveSelection, weldQ);
                    openResult = {
                        openSelectedGeometry: selGeo,
                        openBodyGeometry: bodyGeo,
                        seamPoints: new Float32Array(0),
                        seamScore: 0,
                        seamSegments: 0,
                        iterations: 0,
                        ok: true
                    };
                } else {
                    openResult = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$smartcut$2d$pipeline$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["computeOpenCut"])(geo, effectiveSelection, {
                        strength: smoothStrength,
                        weldQ,
                        offset,
                        relaxIterations
                    });
                }
                if (myVersion !== computeVersionRef.current) {
                    openResult.openSelectedGeometry.dispose();
                    openResult.openBodyGeometry.dispose();
                    setBusy(false);
                    return;
                }
                if (!openResult.ok) {
                    setStatus('error', 'Seleção inválida para corte. Ajuste e tente novamente.');
                    setBusy(false);
                    return;
                }
                disposeOpenCutGeos(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAppStore"].getState().openCutData);
                disposePreviewGeos(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAppStore"].getState().cutPreview);
                setCutPreview(null);
                setOpenCutData(openResult);
                setAutoCutPipelineStage('cut_done');
                setAutoCutPreviewMode('shell');
                setPhase('preview');
                const scoreLabel = openResult.seamScore < 8 ? 'Excelente' : openResult.seamScore < 15 ? 'Boa' : 'Razoável';
                setStatus('loaded', `Cascas calculadas — qualidade ${scoreLabel} · ${openResult.seamSegments} segmentos`);
            } catch (err) {
                setStatus('error', 'Erro ao calcular corte.');
                console.error('[SmartCut V2] Cut error:', err);
            } finally{
                setBusy(false);
            }
        }, 60);
    }, [
        modelMesh,
        analysis,
        contourMode,
        selectedFaceIndices,
        weldQ,
        smoothStrength,
        offset,
        relaxIterations,
        setStatus,
        setOpenCutData,
        setAutoCutPipelineStage,
        setAutoCutPreviewMode,
        setCutPreview,
        disposeOpenCutGeos,
        disposePreviewGeos
    ]);
    // ─── Etapa 4–6: Gerar Tampas ────────────────────────────────────────────────
    const handleGenerateCaps = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        const currentOpenData = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAppStore"].getState().openCutData;
        if (!currentOpenData) return;
        const myVersion = ++computeVersionRef.current;
        setBusy(true);
        setStatus('cutting', 'Gerando tampas — triangulação e validação...');
        setTimeout(()=>{
            if (myVersion !== computeVersionRef.current) {
                setBusy(false);
                return;
            }
            try {
                const capResult = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$smartcut$2d$pipeline$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["generateCaps"])(currentOpenData, weldQ);
                if (myVersion !== computeVersionRef.current) {
                    capResult.cappedSelectedGeometry.dispose();
                    capResult.cappedBodyGeometry.dispose();
                    setBusy(false);
                    return;
                }
                if (!capResult.ok) {
                    setStatus('error', 'Falha ao gerar tampas. Tente aumentar a precisão.');
                    setBusy(false);
                    return;
                }
                disposePreviewGeos(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAppStore"].getState().cutPreview);
                setCutPreview({
                    selectedGeometry: capResult.cappedSelectedGeometry,
                    bodyGeometry: capResult.cappedBodyGeometry,
                    seamPoints: currentOpenData.seamPoints,
                    seamScore: currentOpenData.seamScore,
                    seamSegments: currentOpenData.seamSegments,
                    iterations: currentOpenData.iterations,
                    validationIssues: capResult.validationIssues,
                    params: {
                        strength: smoothStrength,
                        weldQ,
                        offset,
                        relaxIterations
                    }
                });
                setAutoCutPipelineStage('caps_done');
                setAutoCutPreviewMode('caps');
                setCapsGenerated(true);
                const issues = capResult.validationIssues.length;
                setStatus('loaded', `Tampas geradas${issues > 0 ? ` · ${issues} aviso(s)` : ' — malha fechada ✓'}`);
            } catch (err) {
                setStatus('error', 'Erro ao gerar tampas.');
                console.error('[SmartCut V2] Caps error:', err);
            } finally{
                setBusy(false);
            }
        }, 60);
    }, [
        weldQ,
        smoothStrength,
        offset,
        relaxIterations,
        setStatus,
        setCutPreview,
        setAutoCutPipelineStage,
        setAutoCutPreviewMode,
        disposePreviewGeos
    ]);
    // ─── Recalcular quando parâmetros mudam no preview ─────────────────────────
    const scheduleRecalc = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        if (phase !== 'preview') return;
        if (recalcTimerRef.current) clearTimeout(recalcTimerRef.current);
        recalcTimerRef.current = setTimeout(()=>{
            recalcTimerRef.current = null;
            handleCalculateCut();
        }, 350);
    }, [
        phase,
        handleCalculateCut
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (phase === 'preview') scheduleRecalc();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        smoothLevel,
        offset,
        relaxIterations,
        precision
    ]);
    if (!visible) return null;
    // ─── Aplicar preset ─────────────────────────────────────────────────────────
    const applyPreset = (preset)=>{
        setActivePreset(preset.id);
        setSmoothLevel(preset.strength <= 0.3 ? 'subtle' : preset.strength <= 0.65 ? 'balanced' : preset.strength <= 0.85 ? 'strong' : 'max');
        setOffset(preset.offset);
        setRelaxIterations(preset.relaxIterations);
        const p = PRECISION.find((pr)=>pr.weldQ === preset.weldQ) ?? PRECISION[2];
        setPrecision(p.id);
    };
    // ─── Aplicar corte definitivamente ─────────────────────────────────────────
    const handleApplyCut = ()=>{
        // Modo Sem Tampa: usa cascas abertas diretamente (sem caps)
        const currentOpenData = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAppStore"].getState().openCutData;
        if (noCap) {
            if (!modelMesh || !currentOpenData || !analysis) return;
        } else {
            if (!modelMesh || !cutPreview || !analysis) return;
        }
        setBusy(true);
        pushHistory();
        setStatus('cutting', 'Aplicando corte final...');
        setTimeout(()=>{
            try {
                // Escolhe a fonte da geometria:
                // - noCap: peça selecionada = aberta (sem cap); corpo = fechado (cap gerado agora)
                // - normal: ambas as peças com tampas (geradas previamente)
                let selectedPiece;
                let bodyPiece;
                if (noCap) {
                    // Peça extraída: sem tampa (casca aberta)
                    selectedPiece = currentOpenData.openSelectedGeometry.clone();
                    // Corpo: tampa gerada agora para selar o buraco no modelo principal
                    bodyPiece = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$smartcut$2d$pipeline$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["addCapsToShell"])(currentOpenData.openBodyGeometry.clone(), weldQ);
                } else {
                    selectedPiece = cutPreview.selectedGeometry.clone();
                    bodyPiece = cutPreview.bodyGeometry.clone();
                }
                const cleanBody = bodyPiece.clone();
                const cleanSel = selectedPiece.clone();
                const seamNormal = analysis.fitNormal.clone().normalize();
                const sideDot = analysis.selectionCenter.clone().sub(analysis.seamCenter).dot(seamNormal);
                for (const g of [
                    bodyPiece,
                    selectedPiece
                ]){
                    g.computeVertexNormals();
                    g.computeBoundingBox();
                    g.computeBoundingSphere();
                }
                const mainMat = modelMesh.material.clone();
                mainMat.side = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DoubleSide"];
                mainMat.vertexColors = false;
                mainMat.color = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Color"](0x9a9a9d);
                mainMat.needsUpdate = true;
                const mainMesh = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Mesh"](bodyPiece, mainMat);
                mainMesh.castShadow = true;
                mainMesh.receiveShadow = true;
                mainMesh.position.copy(modelMesh.position);
                mainMesh.rotation.copy(modelMesh.rotation);
                mainMesh.scale.copy(modelMesh.scale);
                mainMesh.userData.cleanGeometry = cleanBody;
                setModelMesh(mainMesh);
                if (modelInfo) {
                    const bb = bodyPiece.boundingBox;
                    const s = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector3"]();
                    bb?.getSize(s);
                    const vCount = bodyPiece.getAttribute('position')?.count ?? 0;
                    setModelInfo({
                        ...modelInfo,
                        vertices: vCount,
                        faces: Math.floor(vCount / 3),
                        width: bb ? parseFloat(s.x.toFixed(2)) : modelInfo.width,
                        height: bb ? parseFloat(s.y.toFixed(2)) : modelInfo.height,
                        depth: bb ? parseFloat(s.z.toFixed(2)) : modelInfo.depth
                    });
                }
                const geo = modelMesh.geometry;
                const box = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Box3"]().setFromBufferAttribute(geo.getAttribute('position'));
                const size = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector3"]();
                box.getSize(size);
                const spread = (Math.max(size.x, size.y, size.z) || 1) * 0.28;
                const dir = seamNormal.clone().multiplyScalar(sideDot >= 0 ? spread : -spread);
                const partMat = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MeshStandardMaterial"]({
                    color: new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Color"]('#ff6600'),
                    roughness: 0.55,
                    metalness: 0.12,
                    side: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DoubleSide"]
                });
                const partMesh = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Mesh"](selectedPiece, partMat);
                partMesh.castShadow = true;
                partMesh.receiveShadow = true;
                partMesh.position.copy(modelMesh.position);
                partMesh.rotation.copy(modelMesh.rotation);
                partMesh.scale.copy(modelMesh.scale);
                partMesh.userData.cleanGeometry = cleanSel;
                partMesh.position.add(dir);
                addCutPart({
                    id: `autocut-${Date.now()}`,
                    name: `Peça ${cutParts.length + 1}`,
                    mesh: partMesh,
                    faceIndices: [],
                    color: '#ff6600'
                });
                setAutoCutPreview(null);
                setAutoCutOpen(false);
                clearSelection();
                setStatus('loaded', 'AutoCut V2 concluído');
            } catch (err) {
                setStatus('error', 'Falha ao aplicar o AutoCut.');
                console.error('[AutoCut V2] Apply error:', err);
            } finally{
                setBusy(false);
            }
        }, 60);
    };
    const handleResetToConfig = ()=>{
        setCutPreview(null);
        setOpenCutData(null);
        setAutoCutPipelineStage('idle');
        setAutoCutPreviewMode('shell');
        setCapsGenerated(false);
        setPhase('configure');
        setStatus('loaded', 'Reconfigurar parâmetros e recalcular.');
    };
    // ─── Qualidade do corte ─────────────────────────────────────────────────────
    const seamScore = cutPreview?.seamScore ?? openCutData?.seamScore ?? null;
    const qualityLabel = seamScore !== null ? seamScore < 8 ? t.quality_excellent : seamScore < 15 ? t.quality_good : seamScore < 25 ? t.quality_fair : t.quality_low : null;
    const qualityColor = seamScore !== null ? seamScore < 8 ? '#4ade80' : seamScore < 15 ? '#facc15' : seamScore < 25 ? '#fb923c' : '#f87171' : '#ffffff';
    // ─── Preview mode disponíveis de acordo com o estágio ──────────────────────
    const previewModes = [
        {
            id: 'plane',
            label: t.vis_plane
        },
        {
            id: 'shell',
            label: t.vis_shell,
            disabled: autoCutPipelineStage === 'idle'
        },
        {
            id: 'caps',
            label: t.vis_caps,
            disabled: !capsGenerated
        },
        {
            id: 'final',
            label: t.vis_final,
            disabled: !capsGenerated
        }
    ];
    // ─── Render ─────────────────────────────────────────────────────────────────
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-draggable": true,
        className: pos ? '' : 'absolute bottom-28 left-1/2 -translate-x-1/2 z-20 animate-fade-in pointer-events-auto',
        style: pos ? {
            position: 'fixed',
            left: pos.x,
            top: pos.y,
            zIndex: 20
        } : {},
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex flex-col gap-2 p-3 rounded-2xl border w-[268px]",
            style: {
                background: 'oklch(0.09 0 0 / 97%)',
                backdropFilter: 'blur(24px) saturate(1.4)',
                borderColor: phase === 'preview' ? 'oklch(0.42 0.10 250 / 80%)' : 'oklch(0.18 0 0)',
                boxShadow: '0 8px 40px oklch(0 0 0 / 55%), inset 0 1px 0 oklch(1 0 0 / 4%)'
            },
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center justify-between cursor-grab active:cursor-grabbing select-none",
                    onMouseDown: onHandleMouseDown,
                    title: "Arraste para mover",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$grip$2d$horizontal$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__GripHorizontal$3e$__["GripHorizontal"], {
                                    className: "w-3 h-3 text-muted-foreground/30"
                                }, void 0, false, {
                                    fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                    lineNumber: 453,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__["Sparkles"], {
                                    className: "w-3 h-3",
                                    style: {
                                        color: 'oklch(0.70 0.22 42)'
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                    lineNumber: 454,
                                    columnNumber: 13
                                }, this),
                                phase === 'preview' ? t.autocut_header : t.autocut_on_selection
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                            lineNumber: 452,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-2",
                            children: [
                                phase === 'preview' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-[8px] font-mono px-1 py-0.5 rounded",
                                    style: noCap ? {
                                        background: 'oklch(0.70 0.22 42 / 20%)',
                                        color: 'oklch(0.80 0.20 42)'
                                    } : {
                                        background: 'oklch(0.55 0.15 250 / 20%)',
                                        color: 'oklch(0.75 0.15 250)'
                                    },
                                    children: noCap ? t.badge_no_cap : autoCutPipelineStage === 'caps_done' ? t.badge_caps_ok : t.badge_shells
                                }, void 0, false, {
                                    fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                    lineNumber: 459,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onMouseDown: (e)=>e.stopPropagation(),
                                    onClick: ()=>{
                                        setAutoCutOpen(false);
                                        setAutoCutPreview(null);
                                        setCutPreview(null);
                                        setOpenCutData(null);
                                        setAutoCutPipelineStage('idle');
                                        setPhase('configure');
                                        setCapsGenerated(false);
                                    },
                                    className: "text-muted-foreground/50 hover:text-foreground transition-colors",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                        className: "w-3.5 h-3.5"
                                    }, void 0, false, {
                                        fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                        lineNumber: 475,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                    lineNumber: 470,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                            lineNumber: 457,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                    lineNumber: 447,
                    columnNumber: 9
                }, this),
                phase === 'configure' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "grid grid-cols-2 gap-1",
                            children: [
                                [
                                    'ai',
                                    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$brain$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Brain$3e$__["Brain"],
                                    t.contour_ai,
                                    t.contour_ai_sub
                                ],
                                [
                                    'exact',
                                    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$waypoints$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Waypoints$3e$__["Waypoints"],
                                    t.contour_exact,
                                    t.contour_exact_sub
                                ]
                            ].map(([mode, Icon, title, sub])=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setContourMode(mode),
                                    className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])('flex flex-col items-start gap-0.5 rounded-lg border px-2 py-1.5 text-left transition-all', contourMode === mode ? 'border-transparent' : 'border-border text-muted-foreground hover:text-foreground'),
                                    style: contourMode === mode ? {
                                        background: 'oklch(0.70 0.22 42 / 16%)',
                                        borderColor: 'oklch(0.70 0.22 42 / 60%)'
                                    } : undefined,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "flex items-center gap-1 text-[10px] font-mono font-medium",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {
                                                    className: "w-3 h-3",
                                                    style: contourMode === mode ? {
                                                        color: 'oklch(0.70 0.22 42)'
                                                    } : undefined
                                                }, void 0, false, {
                                                    fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                                    lineNumber: 493,
                                                    columnNumber: 21
                                                }, this),
                                                title
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                            lineNumber: 492,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-[8px] font-mono text-muted-foreground/70",
                                            children: sub
                                        }, void 0, false, {
                                            fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                            lineNumber: 496,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, mode, true, {
                                    fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                    lineNumber: 486,
                                    columnNumber: 17
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                            lineNumber: 484,
                            columnNumber: 13
                        }, this),
                        contourMode === 'ai' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-col gap-1 rounded-lg border border-border/60 p-1.5",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "flex items-center gap-1 text-[8px] font-mono uppercase tracking-wider text-muted-foreground/60",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__["Zap"], {
                                            className: "w-2.5 h-2.5"
                                        }, void 0, false, {
                                            fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                            lineNumber: 505,
                                            columnNumber: 19
                                        }, this),
                                        t.presets_label
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                    lineNumber: 504,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "grid grid-cols-5 gap-0.5",
                                    children: PRESETS.map((p)=>{
                                        const presetLabel = p.id === 'hair' ? t.preset_hair : p.id === 'arm' ? t.preset_arm : p.id === 'head' ? t.preset_head : p.id === 'mini' ? t.preset_mini : t.preset_fdm;
                                        const presetDesc = p.id === 'hair' ? t.preset_hair_desc : p.id === 'arm' ? t.preset_arm_desc : p.id === 'head' ? t.preset_head_desc : p.id === 'mini' ? t.preset_mini_desc : t.preset_fdm_desc;
                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>applyPreset(p),
                                            title: presetDesc,
                                            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])('flex flex-col items-center gap-0.5 rounded py-1 text-[9px] font-mono transition-all', activePreset === p.id ? 'text-background' : 'border border-border text-muted-foreground hover:text-foreground'),
                                            style: activePreset === p.id ? {
                                                background: 'oklch(0.70 0.22 42)'
                                            } : undefined,
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-sm leading-none",
                                                    children: p.icon
                                                }, void 0, false, {
                                                    fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                                    lineNumber: 516,
                                                    columnNumber: 25
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-[8px]",
                                                    children: presetLabel
                                                }, void 0, false, {
                                                    fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                                    lineNumber: 517,
                                                    columnNumber: 25
                                                }, this)
                                            ]
                                        }, p.id, true, {
                                            fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                            lineNumber: 512,
                                            columnNumber: 23
                                        }, this);
                                    })
                                }, void 0, false, {
                                    fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                    lineNumber: 507,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                            lineNumber: 503,
                            columnNumber: 15
                        }, this),
                        contourMode === 'ai' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-col gap-1 rounded-lg border border-border/60 p-1.5",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "flex items-center gap-1 text-[8px] font-mono uppercase tracking-wider text-muted-foreground/60",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$waves$2d$horizontal$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Waves$3e$__["Waves"], {
                                            className: "w-2.5 h-2.5"
                                        }, void 0, false, {
                                            fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                            lineNumber: 529,
                                            columnNumber: 19
                                        }, this),
                                        t.smooth_label
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                    lineNumber: 528,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex gap-0.5",
                                    children: SMOOTH_LEVELS.map((l)=>{
                                        const smoothLabel = l.id === 'subtle' ? t.smooth_subtle : l.id === 'balanced' ? t.smooth_balanced : l.id === 'strong' ? t.smooth_strong : t.smooth_max;
                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>{
                                                setSmoothLevel(l.id);
                                                setActivePreset(null);
                                            },
                                            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])('flex-1 rounded py-1 text-[9px] font-mono transition-all', smoothLevel === l.id ? 'text-background' : 'border border-border text-muted-foreground hover:text-foreground'),
                                            style: smoothLevel === l.id ? {
                                                background: 'oklch(0.70 0.22 42)'
                                            } : undefined,
                                            children: smoothLabel
                                        }, l.id, false, {
                                            fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                            lineNumber: 535,
                                            columnNumber: 23
                                        }, this);
                                    })
                                }, void 0, false, {
                                    fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                    lineNumber: 531,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                            lineNumber: 527,
                            columnNumber: 15
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "rounded-lg border border-border/60 p-1.5",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setNoCap((v)=>!v),
                                className: "flex items-center justify-between w-full",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "flex flex-col items-start gap-0.5",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "flex items-center gap-1 text-[10px] font-mono text-muted-foreground",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$square$2d$dashed$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__BoxSelect$3e$__["BoxSelect"], {
                                                        className: "w-2.5 h-2.5"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                                        lineNumber: 550,
                                                        columnNumber: 21
                                                    }, this),
                                                    t.no_cap_label
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                                lineNumber: 549,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-[8px] font-mono text-muted-foreground/50",
                                                children: noCap ? t.no_cap_open_desc : t.no_cap_closed_desc
                                            }, void 0, false, {
                                                fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                                lineNumber: 552,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                        lineNumber: 548,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])('relative w-7 h-3.5 rounded-full transition-colors shrink-0', noCap ? '' : 'bg-secondary'),
                                        style: noCap ? {
                                            background: 'oklch(0.70 0.22 42)'
                                        } : undefined,
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])('absolute top-0.5 w-2.5 h-2.5 rounded-full bg-background transition-all', noCap ? 'left-3.5' : 'left-0.5')
                                        }, void 0, false, {
                                            fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                            lineNumber: 560,
                                            columnNumber: 19
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                        lineNumber: 556,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                lineNumber: 547,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                            lineNumber: 546,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-col gap-1.5 rounded-lg border border-border/60 p-1.5",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setAdvancedOpen((v)=>!v),
                                    className: "flex items-center gap-1 text-[10px] font-mono text-muted-foreground",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2d$2$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings2$3e$__["Settings2"], {
                                            className: "w-2.5 h-2.5"
                                        }, void 0, false, {
                                            fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                            lineNumber: 568,
                                            columnNumber: 17
                                        }, this),
                                        t.advanced_label,
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__["ChevronRight"], {
                                            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])('w-2.5 h-2.5 ml-auto transition-transform', advancedOpen && 'rotate-90')
                                        }, void 0, false, {
                                            fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                            lineNumber: 569,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                    lineNumber: 567,
                                    columnNumber: 15
                                }, this),
                                advancedOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex flex-col gap-2 pt-0.5 animate-fade-in",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex flex-col gap-1",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-[8px] font-mono uppercase tracking-wider text-muted-foreground/60",
                                                    children: t.precision_label
                                                }, void 0, false, {
                                                    fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                                    lineNumber: 574,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex gap-0.5",
                                                    children: PRECISION.map((p)=>{
                                                        const precLabel = p.id === 'low' ? t.prec_low : p.id === 'medium' ? t.prec_med : p.id === 'high' ? t.prec_high : t.prec_ultra;
                                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            onClick: ()=>setPrecision(p.id),
                                                            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])('flex-1 rounded py-0.5 text-[9px] font-mono transition-all', precision === p.id ? 'text-background' : 'border border-border text-muted-foreground hover:text-foreground'),
                                                            style: precision === p.id ? {
                                                                background: 'oklch(0.55 0.02 250)'
                                                            } : undefined,
                                                            children: precLabel
                                                        }, p.id, false, {
                                                            fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                                            lineNumber: 579,
                                                            columnNumber: 27
                                                        }, this);
                                                    })
                                                }, void 0, false, {
                                                    fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                                    lineNumber: 575,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                            lineNumber: 573,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex flex-col gap-1",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-[8px] font-mono uppercase tracking-wider text-muted-foreground/60",
                                                    children: t.edge_relax_label
                                                }, void 0, false, {
                                                    fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                                    lineNumber: 588,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex gap-0.5",
                                                    children: RELAX_STEPS.map((r, i)=>{
                                                        const relaxLabel = i === 0 ? t.relax_none : i === 1 ? t.relax_light : i === 2 ? t.relax_med : i === 3 ? t.relax_strong : t.relax_max;
                                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            onClick: ()=>setRelaxIterations(r.value),
                                                            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])('flex-1 rounded py-0.5 text-[9px] font-mono transition-all', relaxIterations === r.value ? 'text-background' : 'border border-border text-muted-foreground hover:text-foreground'),
                                                            style: relaxIterations === r.value ? {
                                                                background: 'oklch(0.55 0.02 250)'
                                                            } : undefined,
                                                            children: relaxLabel
                                                        }, r.value, false, {
                                                            fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                                            lineNumber: 593,
                                                            columnNumber: 27
                                                        }, this);
                                                    })
                                                }, void 0, false, {
                                                    fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                                    lineNumber: 589,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                            lineNumber: 587,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex flex-col gap-1",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-[8px] font-mono uppercase tracking-wider text-muted-foreground/60",
                                                    children: t.offset_label
                                                }, void 0, false, {
                                                    fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                                    lineNumber: 602,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex gap-0.5",
                                                    children: OFFSET_STEPS.map((o)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            onClick: ()=>setOffset(o.value),
                                                            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])('flex-1 rounded py-0.5 text-[9px] font-mono transition-all', offset === o.value ? 'text-background' : 'border border-border text-muted-foreground hover:text-foreground'),
                                                            style: offset === o.value ? {
                                                                background: 'oklch(0.55 0.02 250)'
                                                            } : undefined,
                                                            children: o.label
                                                        }, o.value, false, {
                                                            fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                                            lineNumber: 605,
                                                            columnNumber: 25
                                                        }, this))
                                                }, void 0, false, {
                                                    fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                                    lineNumber: 603,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                            lineNumber: 601,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                    lineNumber: 572,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                            lineNumber: 566,
                            columnNumber: 13
                        }, this),
                        analysis && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-2 text-[9px] font-mono text-muted-foreground/50",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: [
                                    t.boundary_label,
                                    ": ",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-foreground/70",
                                        children: analysis.hasSeam ? t.boundary_seam(analysis.seamEdges) : t.boundary_island
                                    }, void 0, false, {
                                        fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                        lineNumber: 619,
                                        columnNumber: 43
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                lineNumber: 619,
                                columnNumber: 17
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                            lineNumber: 618,
                            columnNumber: 15
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: handleCalculateCut,
                            disabled: busy || !analysis,
                            className: "flex items-center justify-center gap-1.5 w-full px-3 py-2 rounded-lg text-sm font-mono font-medium text-background hover:opacity-90 transition-all disabled:opacity-50",
                            style: {
                                background: 'oklch(0.70 0.22 42)'
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$scissors$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Scissors$3e$__["Scissors"], {
                                    className: "w-3.5 h-3.5"
                                }, void 0, false, {
                                    fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                    lineNumber: 630,
                                    columnNumber: 15
                                }, this),
                                busy ? t.calculating : t.calc_cut
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                            lineNumber: 624,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true),
                phase === 'preview' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-col gap-1 rounded-lg border border-border/60 p-1.5",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "flex items-center gap-1 text-[8px] font-mono uppercase tracking-wider text-muted-foreground/60",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__["Eye"], {
                                            className: "w-2.5 h-2.5"
                                        }, void 0, false, {
                                            fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                            lineNumber: 642,
                                            columnNumber: 17
                                        }, this),
                                        t.visualization_label
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                    lineNumber: 641,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex gap-0.5",
                                    children: previewModes.map(({ id, label, disabled })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>!disabled && setAutoCutPreviewMode(id),
                                            disabled: disabled,
                                            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])('flex-1 rounded py-1 text-[9px] font-mono transition-all', autoCutPreviewMode === id ? 'text-background' : 'border border-border text-muted-foreground', disabled ? 'opacity-30 cursor-not-allowed' : 'hover:text-foreground'),
                                            style: autoCutPreviewMode === id ? {
                                                background: 'oklch(0.55 0.02 250)'
                                            } : undefined,
                                            children: label
                                        }, id, false, {
                                            fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                            lineNumber: 646,
                                            columnNumber: 19
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                    lineNumber: 644,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                            lineNumber: 640,
                            columnNumber: 13
                        }, this),
                        qualityLabel && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center justify-between rounded-lg px-2 py-1.5",
                            style: {
                                background: 'oklch(0.55 0.15 250 / 10%)'
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex flex-col gap-0.5",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-[8px] font-mono uppercase text-muted-foreground/60",
                                            children: t.quality_label
                                        }, void 0, false, {
                                            fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                            lineNumber: 658,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-xs font-mono font-medium",
                                            style: {
                                                color: qualityColor
                                            },
                                            children: qualityLabel
                                        }, void 0, false, {
                                            fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                            lineNumber: 659,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                    lineNumber: 657,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex flex-col items-end gap-0.5",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-[8px] font-mono text-muted-foreground/50",
                                            children: [
                                                openCutData?.seamSegments ?? cutPreview?.seamSegments ?? 0,
                                                " ",
                                                t.seg_suffix
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                            lineNumber: 662,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-[8px] font-mono",
                                            style: {
                                                color: qualityColor
                                            },
                                            children: [
                                                (seamScore ?? 0).toFixed(1),
                                                "°"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                            lineNumber: 665,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                    lineNumber: 661,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                            lineNumber: 656,
                            columnNumber: 15
                        }, this),
                        cutPreview?.validationIssues && cutPreview.validationIssues.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-col gap-0.5",
                            children: cutPreview.validationIssues.slice(0, 2).map((issue, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-start gap-1 rounded bg-yellow-500/10 border border-yellow-500/20 px-1.5 py-1",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__["AlertTriangle"], {
                                            className: "w-2.5 h-2.5 mt-0.5 shrink-0",
                                            style: {
                                                color: '#facc15'
                                            }
                                        }, void 0, false, {
                                            fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                            lineNumber: 677,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-[8px] font-mono text-yellow-200/80 leading-relaxed",
                                            children: issue.message
                                        }, void 0, false, {
                                            fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                            lineNumber: 678,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, i, true, {
                                    fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                    lineNumber: 676,
                                    columnNumber: 19
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                            lineNumber: 674,
                            columnNumber: 15
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-col gap-1 rounded-lg border border-border/60 p-1.5",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "flex items-center gap-1 text-[8px] font-mono uppercase tracking-wider text-muted-foreground/60",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layers$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Layers$3e$__["Layers"], {
                                            className: "w-2.5 h-2.5"
                                        }, void 0, false, {
                                            fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                            lineNumber: 687,
                                            columnNumber: 17
                                        }, this),
                                        t.rendering_label
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                    lineNumber: 686,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex gap-0.5",
                                    children: [
                                        [
                                            'solid',
                                            t.render_solid
                                        ],
                                        [
                                            'wireframe',
                                            t.render_wire
                                        ],
                                        [
                                            'xray',
                                            t.render_xray
                                        ]
                                    ].map(([mode, label])=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>setPreviewViewMode(mode),
                                            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])('flex-1 rounded py-0.5 text-[9px] font-mono transition-all', previewViewMode === mode ? 'text-background' : 'border border-border text-muted-foreground hover:text-foreground'),
                                            style: previewViewMode === mode ? {
                                                background: 'oklch(0.35 0.02 250)'
                                            } : undefined,
                                            children: label
                                        }, mode, false, {
                                            fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                            lineNumber: 691,
                                            columnNumber: 19
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                    lineNumber: 689,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                            lineNumber: 685,
                            columnNumber: 13
                        }, this),
                        busy && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-1.5 text-[9px] font-mono text-muted-foreground/60",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "animate-spin w-2.5 h-2.5 border border-t-foreground/60 rounded-full"
                                }, void 0, false, {
                                    fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                    lineNumber: 701,
                                    columnNumber: 17
                                }, this),
                                t.processing
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                            lineNumber: 700,
                            columnNumber: 15
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-col gap-1.5 pt-0.5",
                            children: [
                                autoCutPipelineStage === 'cut_done' && noCap && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center gap-1 rounded-lg px-2 py-1.5",
                                            style: {
                                                background: 'oklch(0.70 0.22 42 / 12%)',
                                                border: '1px solid oklch(0.70 0.22 42 / 30%)'
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$square$2d$dashed$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__BoxSelect$3e$__["BoxSelect"], {
                                                    className: "w-3 h-3 shrink-0",
                                                    style: {
                                                        color: 'oklch(0.70 0.22 42)'
                                                    }
                                                }, void 0, false, {
                                                    fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                                    lineNumber: 715,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-[9px] font-mono",
                                                    style: {
                                                        color: 'oklch(0.80 0.15 42)'
                                                    },
                                                    children: t.no_cap_open_msg
                                                }, void 0, false, {
                                                    fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                                    lineNumber: 716,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                            lineNumber: 713,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex gap-1.5",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    onClick: handleResetToConfig,
                                                    disabled: busy,
                                                    className: "flex items-center justify-center gap-1 flex-1 px-2 py-1.5 rounded-lg text-xs font-mono font-medium border border-border text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all disabled:opacity-40",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$rotate$2d$ccw$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__RotateCcw$3e$__["RotateCcw"], {
                                                            className: "w-3 h-3"
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                                            lineNumber: 726,
                                                            columnNumber: 23
                                                        }, this),
                                                        t.reconfig
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                                    lineNumber: 721,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    onClick: handleApplyCut,
                                                    disabled: busy,
                                                    className: "flex items-center justify-center gap-1.5 flex-[2] px-3 py-1.5 rounded-lg text-xs font-mono font-medium text-background hover:opacity-90 transition-all disabled:opacity-50",
                                                    style: {
                                                        background: 'oklch(0.70 0.22 42)'
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__["Check"], {
                                                            className: "w-3 h-3"
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                                            lineNumber: 734,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$scissors$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Scissors$3e$__["Scissors"], {
                                                            className: "w-3 h-3"
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                                            lineNumber: 735,
                                                            columnNumber: 23
                                                        }, this),
                                                        busy ? t.applying : t.apply_no_cap
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                                    lineNumber: 728,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                            lineNumber: 720,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true),
                                autoCutPipelineStage === 'cut_done' && !noCap && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: handleGenerateCaps,
                                    disabled: busy,
                                    className: "flex items-center justify-center gap-1.5 w-full px-3 py-2 rounded-lg text-sm font-mono font-medium text-background hover:opacity-90 transition-all disabled:opacity-50",
                                    style: {
                                        background: 'oklch(0.70 0.22 42)'
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sliders$2d$vertical$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Sliders$3e$__["Sliders"], {
                                            className: "w-3.5 h-3.5"
                                        }, void 0, false, {
                                            fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                            lineNumber: 750,
                                            columnNumber: 19
                                        }, this),
                                        busy ? t.generating : t.gen_caps
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                    lineNumber: 744,
                                    columnNumber: 17
                                }, this),
                                autoCutPipelineStage === 'caps_done' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex gap-1.5",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: handleResetToConfig,
                                            disabled: busy,
                                            className: "flex items-center justify-center gap-1 flex-1 px-2 py-1.5 rounded-lg text-xs font-mono font-medium border border-border text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all disabled:opacity-40",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$rotate$2d$ccw$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__RotateCcw$3e$__["RotateCcw"], {
                                                    className: "w-3 h-3"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                                    lineNumber: 763,
                                                    columnNumber: 21
                                                }, this),
                                                t.reconfig
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                            lineNumber: 758,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: handleApplyCut,
                                            disabled: busy,
                                            className: "flex items-center justify-center gap-1.5 flex-[2] px-3 py-1.5 rounded-lg text-xs font-mono font-medium text-background hover:opacity-90 transition-all disabled:opacity-50",
                                            style: {
                                                background: 'oklch(0.70 0.22 42)'
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__["Check"], {
                                                    className: "w-3 h-3"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                                    lineNumber: 771,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$scissors$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Scissors$3e$__["Scissors"], {
                                                    className: "w-3 h-3"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                                    lineNumber: 772,
                                                    columnNumber: 21
                                                }, this),
                                                busy ? t.applying : t.apply_cut
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                            lineNumber: 765,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                    lineNumber: 757,
                                    columnNumber: 17
                                }, this),
                                autoCutPipelineStage === 'cut_done' && !noCap && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: handleResetToConfig,
                                    disabled: busy,
                                    className: "flex items-center justify-center gap-1 w-full px-2 py-1 rounded-lg text-[10px] font-mono font-medium border border-border text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all disabled:opacity-40",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$rotate$2d$ccw$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__RotateCcw$3e$__["RotateCcw"], {
                                            className: "w-2.5 h-2.5"
                                        }, void 0, false, {
                                            fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                            lineNumber: 785,
                                            columnNumber: 19
                                        }, this),
                                        t.reconfigure
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                    lineNumber: 780,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                            lineNumber: 707,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-2 text-[8px] font-mono text-muted-foreground/40",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "flex items-center gap-0.5",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "w-1.5 h-1.5 rounded-sm bg-gray-400"
                                        }, void 0, false, {
                                            fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                            lineNumber: 792,
                                            columnNumber: 59
                                        }, this),
                                        t.legend_body
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                    lineNumber: 792,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "flex items-center gap-0.5",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "w-1.5 h-1.5 rounded-sm",
                                            style: {
                                                background: autoCutPreviewMode === 'shell' ? '#f97316' : '#ef4444'
                                            }
                                        }, void 0, false, {
                                            fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                            lineNumber: 793,
                                            columnNumber: 59
                                        }, this),
                                        t.legend_part
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                    lineNumber: 793,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "flex items-center gap-0.5",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "w-1.5 h-1.5 rounded-sm bg-white"
                                        }, void 0, false, {
                                            fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                            lineNumber: 794,
                                            columnNumber: 59
                                        }, this),
                                        t.legend_seam
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                    lineNumber: 794,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                            lineNumber: 791,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true)
            ]
        }, void 0, true, {
            fileName: "[project]/components/layout/smart-autocut-panel.tsx",
            lineNumber: 437,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/components/layout/smart-autocut-panel.tsx",
        lineNumber: 432,
        columnNumber: 5
    }, this);
}
}),
"[project]/lib/encaixe.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "applyEncaixe",
    ()=>applyEncaixe,
    "planEncaixe",
    ()=>planEncaixe
]);
/**
 * Encaixe Quadrado — Geração de encaixe de quadrado tipo pino/furo
 * -----------------------------------------------------------------
 * Workflow separado do corte: o usuário seleciona com SmartCut a região
 * onde quer o encaixe (ex: pescoço), clica "Gerar Encaixe" e o sistema:
 *
 *   1. Analisa a costura da seleção para encontrar o plano de encaixe.
 *   2. Detecta automaticamente a peça complementar (aquela que foi
 *      descolada naquele ponto — ex: cabeça, mão).
 *   3. Subtrai o furo nas DUAS peças (pino vai por fora como peça solta).
 *   4. Cria o pino quadrado como cutPart separado (para impressão avulsa).
 *
 * Tamanho proporcional à seção transversal da costura.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/three/build/three.core.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2d$bvh$2d$csg$2f$src$2f$core$2f$Evaluator$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/three-bvh-csg/src/core/Evaluator.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2d$bvh$2d$csg$2f$src$2f$core$2f$Brush$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/three-bvh-csg/src/core/Brush.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2d$bvh$2d$csg$2f$src$2f$core$2f$constants$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/three-bvh-csg/src/core/constants.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$smart$2d$autocut$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/smart-autocut.ts [app-ssr] (ecmascript)");
;
;
;
// ─── Planejamento ─────────────────────────────────────────────────────────────
const SIZE_FRACTION = {
    xs: 0.08,
    s: 0.13,
    m: 0.20
};
const MIN_SIDE_MM = 0.8;
const MAX_SIDE_MM = 10.0;
function planEncaixe(geometry, selectedFaces, cutParts, params) {
    if (selectedFaces.size === 0) return null;
    const ana = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$smart$2d$autocut$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["analyzeSelection"])(geometry, selectedFaces);
    // ── Normal orientada da seleção para o complemento ───────────────────────
    const seamNormal = ana.fitNormal.clone().normalize();
    const sourceOffset = ana.selectionCenter.clone().sub(ana.seamCenter).dot(seamNormal);
    // Se a seleção está no lado positivo da normal, a normal já aponta
    // para longe da seleção (em direção ao complemento). Caso contrário, inverte.
    if (sourceOffset > 0) seamNormal.negate();
    // ── Tamanho proporcional à seção mínima da costura ───────────────────────
    const minSectionDim = Math.min(ana.halfU, ana.halfV) * 2;
    const fraction = SIZE_FRACTION[params.size];
    let side = minSectionDim * fraction;
    // Fallback: seção muito pequena ou inválida → usa escala global
    if (!isFinite(side) || side < MIN_SIDE_MM) {
        side = Math.max(MIN_SIDE_MM, ana.modelDiagonal * 0.012 * fraction / 0.13);
    }
    side = Math.min(side, MAX_SIDE_MM);
    const depth = side * 2.2 // profundidade total ≈ 2× a largura
    ;
    // ── Detecta peça complementar (opcional) ─────────────────────────────────
    const seamCenter = ana.seamCenter.clone();
    let bestIdx = -1;
    let bestDist = Infinity;
    for(let i = 0; i < cutParts.length; i++){
        const geo = cutParts[i].mesh.geometry;
        if (!geo.boundingBox) geo.computeBoundingBox();
        const center = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector3"]();
        geo.boundingBox.getCenter(center);
        // Prefere peças do lado oposto ao da seleção (lado do complemento)
        const sideSign = center.clone().sub(seamCenter).dot(seamNormal);
        // Pontuação: peças no lado certo (sideSign > 0) e próximas ao seam têm prioridade
        const penaltyWrongSide = sideSign < 0 ? 1e6 : 0;
        const score = center.distanceTo(seamCenter) + penaltyWrongSide;
        if (score < bestDist) {
            bestDist = score;
            bestIdx = i;
        }
    }
    // bestIdx === -1 quando não há peças cortadas — encaixe só na peça fonte
    return {
        seamCenter,
        seamNormal,
        side,
        depth,
        tolerance: params.tolerance,
        complementIndex: bestIdx,
        complementName: bestIdx >= 0 ? cutParts[bestIdx].name : ''
    };
}
// ─── Aplicação ────────────────────────────────────────────────────────────────
/**
 * Subtrai os furos das duas peças e retorna as geometrias atualizadas
 * junto com o pino quadrado para ser adicionado como cutPart separado.
 *
 * Pode lançar — envolva em try/catch no chamador.
 */ /** Cria um novo Brush do furo posicionado na costura. Recriado a cada operação
 *  para evitar estado acumulado no three-bvh-csg entre chamadas consecutivas. */ function makeHoleBrush(holeGeo, seamCenter, quat) {
    const b = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2d$bvh$2d$csg$2f$src$2f$core$2f$Brush$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Brush"](holeGeo.clone());
    b.position.copy(seamCenter);
    b.quaternion.copy(quat);
    b.updateMatrixWorld();
    return b;
}
function applyEncaixe(sourceMesh, complementMesh, plan) {
    // ── Geometria do furo (maior que o pino pela tolerância) ─────────────────
    const hs = plan.side + plan.tolerance * 2;
    const hd = plan.depth + plan.tolerance;
    const holeGeo = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BoxGeometry"](hs, hd, hs);
    const quat = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Quaternion"]().setFromUnitVectors(new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector3"](0, 1, 0), plan.seamNormal.clone().normalize());
    // ── Subtrai furo da peça fonte — avaliador independente ──────────────────
    let sourceGeo;
    try {
        const ev = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2d$bvh$2d$csg$2f$src$2f$core$2f$Evaluator$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Evaluator"]();
        ev.attributes = [
            'position',
            'normal'
        ];
        const srcBrush = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2d$bvh$2d$csg$2f$src$2f$core$2f$Brush$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Brush"](sourceMesh.geometry.clone());
        srcBrush.updateMatrixWorld();
        const holeSrc = makeHoleBrush(holeGeo, plan.seamCenter, quat);
        sourceGeo = ev.evaluate(srcBrush, holeSrc, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2d$bvh$2d$csg$2f$src$2f$core$2f$constants$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SUBTRACTION"]).geometry;
    } catch (e) {
        console.error('[Encaixe] CSG falhou na peça fonte:', e);
        sourceGeo = sourceMesh.geometry.clone();
    }
    // ── Subtrai furo da peça complementar — avaliador independente ───────────
    // null quando não existe peça cortada — encaixe só na fonte
    let complementGeo = null;
    if (complementMesh) {
        try {
            const ev = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2d$bvh$2d$csg$2f$src$2f$core$2f$Evaluator$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Evaluator"]();
            ev.attributes = [
                'position',
                'normal'
            ];
            const compBrush = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2d$bvh$2d$csg$2f$src$2f$core$2f$Brush$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Brush"](complementMesh.geometry.clone());
            compBrush.updateMatrixWorld();
            const holeComp = makeHoleBrush(holeGeo, plan.seamCenter, quat);
            complementGeo = ev.evaluate(compBrush, holeComp, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2d$bvh$2d$csg$2f$src$2f$core$2f$constants$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SUBTRACTION"]).geometry;
        } catch (e) {
            console.error('[Encaixe] CSG falhou na peça complementar:', e);
            complementGeo = complementMesh.geometry.clone();
        }
    }
    // ── Geometria do pino (levemente menor que o furo) ───────────────────────
    const ps = Math.max(0.3, plan.side - plan.tolerance * 0.5);
    const pd = Math.max(0.5, plan.depth - plan.tolerance * 1.0);
    const pegGeo = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BoxGeometry"](ps, pd, ps);
    // ── Finaliza ─────────────────────────────────────────────────────────────
    for (const g of [
        sourceGeo,
        complementGeo,
        pegGeo
    ]){
        if (!g) continue;
        g.computeVertexNormals();
        g.computeBoundingBox();
        g.computeBoundingSphere();
    }
    holeGeo.dispose();
    return {
        sourceGeo,
        complementGeo,
        pegGeo,
        pegPosition: plan.seamCenter.clone(),
        pegQuaternion: quat.clone()
    };
}
}),
"[project]/components/layout/encaixe-panel.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "EncaixePanel",
    ()=>EncaixePanel
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
/**
 * EncaixePanel — Gerar encaixe quadrado pino/furo em peças já cortadas
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$box$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/box.mjs [app-ssr] (ecmascript) <export default as Box>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/triangle-alert.mjs [app-ssr] (ecmascript) <export default as AlertTriangle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/loader-circle.mjs [app-ssr] (ecmascript) <export default as Loader2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.mjs [app-ssr] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$grip$2d$horizontal$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__GripHorizontal$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/grip-horizontal.mjs [app-ssr] (ecmascript) <export default as GripHorizontal>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/three/build/three.core.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/store.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$encaixe$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/encaixe.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$lang$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/lang-store.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$use$2d$draggable$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/use-draggable.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
;
;
;
;
const TOLERANCES = [
    0.10,
    0.15,
    0.20,
    0.25
];
function EncaixePanel() {
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$lang$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useT"])();
    const { pos, onHandleMouseDown } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$use$2d$draggable$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useDraggable"])();
    const { encaixeOpen, setEncaixeOpen, modelMesh, selectedFaceIndices, selectionState, cutParts, setCutParts, addCutPart, setModelMesh, setStatus, pushHistory, clearSelection } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAppStore"])();
    const SIZES = [
        {
            id: 'xs',
            label: t.size_xs_label,
            desc: t.size_xs_desc
        },
        {
            id: 's',
            label: t.size_s_label,
            desc: t.size_s_desc
        },
        {
            id: 'm',
            label: t.size_m_label,
            desc: t.size_m_desc
        }
    ];
    const [size, setSize] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('s');
    const [tolerance, setTolerance] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0.15);
    const [busy, setBusy] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const computeRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(0);
    const hasSelection = selectedFaceIndices.size > 0 && selectionState === 'selected';
    const visible = encaixeOpen && !!modelMesh;
    const plan = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        if (!visible || !modelMesh || !hasSelection) return null;
        try {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$encaixe$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["planEncaixe"])(modelMesh.geometry, selectedFaceIndices, cutParts, {
                size,
                tolerance
            });
        } catch  {
            return null;
        }
    }, [
        visible,
        modelMesh,
        selectedFaceIndices,
        cutParts,
        size,
        tolerance
    ]);
    const handleApply = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        if (!modelMesh || !plan) return;
        const myVersion = ++computeRef.current;
        setBusy(true);
        const hasComplement = plan.complementIndex >= 0;
        setStatus('cutting', hasComplement ? 'Gerando encaixe — furando peça atual e peça removida...' : 'Gerando encaixe — furando peça selecionada...');
        setTimeout(()=>{
            if (myVersion !== computeRef.current) {
                setBusy(false);
                return;
            }
            try {
                pushHistory();
                const complementPart = hasComplement ? cutParts[plan.complementIndex] : null;
                const { sourceGeo, complementGeo, pegGeo, pegPosition, pegQuaternion } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$encaixe$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["applyEncaixe"])(modelMesh, complementPart?.mesh ?? null, plan);
                const newSourceMesh = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Mesh"](sourceGeo, modelMesh.material.clone());
                newSourceMesh.castShadow = true;
                newSourceMesh.receiveShadow = true;
                newSourceMesh.position.copy(modelMesh.position);
                newSourceMesh.rotation.copy(modelMesh.rotation);
                newSourceMesh.scale.copy(modelMesh.scale);
                newSourceMesh.userData = {
                    ...modelMesh.userData
                };
                setModelMesh(newSourceMesh);
                if (complementPart && complementGeo) {
                    const newCompMesh = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Mesh"](complementGeo, complementPart.mesh.material);
                    newCompMesh.castShadow = true;
                    newCompMesh.receiveShadow = true;
                    newCompMesh.position.copy(complementPart.mesh.position);
                    newCompMesh.rotation.copy(complementPart.mesh.rotation);
                    newCompMesh.scale.copy(complementPart.mesh.scale);
                    newCompMesh.userData = {
                        ...complementPart.mesh.userData
                    };
                    const updatedParts = cutParts.map((cp, i)=>i === plan.complementIndex ? {
                            ...cp,
                            mesh: newCompMesh
                        } : cp);
                    setCutParts(updatedParts);
                }
                const pegM = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Matrix4"]().compose(pegPosition, pegQuaternion, new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector3"](1, 1, 1));
                pegGeo.applyMatrix4(pegM);
                pegGeo.computeVertexNormals();
                const pegMat = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MeshStandardMaterial"]({
                    color: '#c8ccd4',
                    roughness: 0.3,
                    metalness: 0.55,
                    side: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DoubleSide"]
                });
                const pegMesh = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Mesh"](pegGeo, pegMat);
                pegMesh.castShadow = true;
                pegMesh.receiveShadow = true;
                pegMesh.position.copy(modelMesh.position);
                pegMesh.rotation.copy(modelMesh.rotation);
                pegMesh.scale.copy(modelMesh.scale);
                addCutPart({
                    id: `encaixe-pino-${Date.now()}`,
                    name: `Pino (${plan.side.toFixed(1)}×${plan.side.toFixed(1)})`,
                    mesh: pegMesh,
                    faceIndices: [],
                    color: '#c8ccd4',
                    isConnector: true
                });
                clearSelection();
                setEncaixeOpen(false);
                setStatus('loaded', hasComplement ? `Encaixe gerado · pino ${plan.side.toFixed(1)}×${plan.depth.toFixed(1)}mm` : `Encaixe gerado · pino ${plan.side.toFixed(1)}×${plan.depth.toFixed(1)}mm`);
            } catch (err) {
                setStatus('error', 'Falha ao gerar encaixe. Tente nova seleção.');
                console.error('[Encaixe] Erro:', err);
            } finally{
                setBusy(false);
            }
        }, 60);
    }, [
        modelMesh,
        plan,
        cutParts,
        pushHistory,
        setModelMesh,
        setCutParts,
        addCutPart,
        setStatus,
        clearSelection,
        setEncaixeOpen
    ]);
    if (!visible) return null;
    const sizeLabel = plan ? `${plan.side.toFixed(1)} × ${plan.side.toFixed(1)} × ${plan.depth.toFixed(1)} mm` : '—';
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-draggable": true,
        className: pos ? '' : 'absolute bottom-28 left-1/2 -translate-x-1/2 z-20 animate-fade-in pointer-events-auto',
        style: pos ? {
            position: 'fixed',
            left: pos.x,
            top: pos.y,
            zIndex: 20
        } : {},
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex flex-col gap-2 p-3 rounded-2xl border w-[248px]",
            style: {
                background: 'oklch(0.09 0 0 / 97%)',
                backdropFilter: 'blur(24px) saturate(1.4)',
                borderColor: 'oklch(0.38 0.08 260 / 70%)',
                boxShadow: '0 8px 40px oklch(0 0 0 / 55%), inset 0 1px 0 oklch(1 0 0 / 4%)'
            },
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center gap-1.5 cursor-grab active:cursor-grabbing select-none",
                    onMouseDown: onHandleMouseDown,
                    title: "Arraste para mover",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$grip$2d$horizontal$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__GripHorizontal$3e$__["GripHorizontal"], {
                            className: "w-3 h-3 shrink-0 text-muted-foreground/30"
                        }, void 0, false, {
                            fileName: "[project]/components/layout/encaixe-panel.tsx",
                            lineNumber: 155,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$box$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__["Box"], {
                            className: "w-3 h-3 shrink-0",
                            style: {
                                color: 'oklch(0.65 0.18 260)'
                            }
                        }, void 0, false, {
                            fileName: "[project]/components/layout/encaixe-panel.tsx",
                            lineNumber: 156,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "text-[10px] font-mono uppercase tracking-wider text-muted-foreground flex-1",
                            children: t.encaixe_title
                        }, void 0, false, {
                            fileName: "[project]/components/layout/encaixe-panel.tsx",
                            lineNumber: 157,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onMouseDown: (e)=>e.stopPropagation(),
                            onClick: ()=>setEncaixeOpen(false),
                            className: "p-0.5 rounded text-muted-foreground/50 hover:text-foreground hover:bg-secondary/50 transition-colors",
                            title: "Fechar",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                className: "w-3 h-3"
                            }, void 0, false, {
                                fileName: "[project]/components/layout/encaixe-panel.tsx",
                                lineNumber: 166,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/components/layout/encaixe-panel.tsx",
                            lineNumber: 160,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/layout/encaixe-panel.tsx",
                    lineNumber: 150,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex flex-col gap-1 rounded-lg border border-border/60 p-1.5",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "text-[8px] font-mono uppercase tracking-wider text-muted-foreground/60",
                            children: t.pin_size_label
                        }, void 0, false, {
                            fileName: "[project]/components/layout/encaixe-panel.tsx",
                            lineNumber: 172,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex gap-0.5",
                            children: SIZES.map((s)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setSize(s.id),
                                    title: s.desc,
                                    className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])('flex-1 flex flex-col items-center gap-0.5 rounded py-1 transition-all', size === s.id ? 'text-background' : 'border border-border text-muted-foreground hover:text-foreground'),
                                    style: size === s.id ? {
                                        background: 'oklch(0.55 0.15 260)'
                                    } : undefined,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-[10px] font-mono font-medium",
                                            children: s.label
                                        }, void 0, false, {
                                            fileName: "[project]/components/layout/encaixe-panel.tsx",
                                            lineNumber: 187,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-[7px] font-mono opacity-70",
                                            children: s.desc
                                        }, void 0, false, {
                                            fileName: "[project]/components/layout/encaixe-panel.tsx",
                                            lineNumber: 188,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, s.id, true, {
                                    fileName: "[project]/components/layout/encaixe-panel.tsx",
                                    lineNumber: 177,
                                    columnNumber: 15
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/components/layout/encaixe-panel.tsx",
                            lineNumber: 175,
                            columnNumber: 11
                        }, this),
                        plan && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center justify-center gap-1 mt-0.5",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-[8px] font-mono text-muted-foreground/50",
                                    children: t.pin_suffix
                                }, void 0, false, {
                                    fileName: "[project]/components/layout/encaixe-panel.tsx",
                                    lineNumber: 194,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-[8px] font-mono",
                                    style: {
                                        color: 'oklch(0.75 0.12 260)'
                                    },
                                    children: sizeLabel
                                }, void 0, false, {
                                    fileName: "[project]/components/layout/encaixe-panel.tsx",
                                    lineNumber: 195,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/layout/encaixe-panel.tsx",
                            lineNumber: 193,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/layout/encaixe-panel.tsx",
                    lineNumber: 171,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex flex-col gap-1 rounded-lg border border-border/60 p-1.5",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "text-[8px] font-mono uppercase tracking-wider text-muted-foreground/60",
                            children: t.hole_clearance_label
                        }, void 0, false, {
                            fileName: "[project]/components/layout/encaixe-panel.tsx",
                            lineNumber: 202,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex gap-0.5",
                            children: TOLERANCES.map((tol)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setTolerance(tol),
                                    className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])('flex-1 rounded py-0.5 text-[9px] font-mono transition-all', tolerance === tol ? 'text-background' : 'border border-border text-muted-foreground hover:text-foreground'),
                                    style: tolerance === tol ? {
                                        background: 'oklch(0.55 0.15 260)'
                                    } : undefined,
                                    children: tol.toFixed(2)
                                }, tol, false, {
                                    fileName: "[project]/components/layout/encaixe-panel.tsx",
                                    lineNumber: 207,
                                    columnNumber: 15
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/components/layout/encaixe-panel.tsx",
                            lineNumber: 205,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/layout/encaixe-panel.tsx",
                    lineNumber: 201,
                    columnNumber: 9
                }, this),
                !hasSelection ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-start gap-1 rounded-lg bg-yellow-500/10 border border-yellow-500/20 px-1.5 py-1",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__["AlertTriangle"], {
                            className: "w-2.5 h-2.5 mt-0.5 shrink-0 text-yellow-400"
                        }, void 0, false, {
                            fileName: "[project]/components/layout/encaixe-panel.tsx",
                            lineNumber: 225,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "text-[8px] font-mono text-yellow-200/70 leading-relaxed",
                            children: t.select_faces_hint
                        }, void 0, false, {
                            fileName: "[project]/components/layout/encaixe-panel.tsx",
                            lineNumber: 226,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/layout/encaixe-panel.tsx",
                    lineNumber: 224,
                    columnNumber: 11
                }, this) : plan ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex flex-col gap-0.5 rounded-lg px-2 py-1.5",
                    style: {
                        background: 'oklch(0.55 0.15 260 / 10%)'
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center justify-between",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-[8px] font-mono text-muted-foreground/50",
                                    children: t.hole_in
                                }, void 0, false, {
                                    fileName: "[project]/components/layout/encaixe-panel.tsx",
                                    lineNumber: 231,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-[8px] font-mono text-foreground/70",
                                    children: t.piece_current
                                }, void 0, false, {
                                    fileName: "[project]/components/layout/encaixe-panel.tsx",
                                    lineNumber: 232,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/layout/encaixe-panel.tsx",
                            lineNumber: 230,
                            columnNumber: 13
                        }, this),
                        plan.complementIndex >= 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center justify-between",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-[8px] font-mono text-muted-foreground/50",
                                    children: t.hole_also_in
                                }, void 0, false, {
                                    fileName: "[project]/components/layout/encaixe-panel.tsx",
                                    lineNumber: 236,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-[8px] font-mono",
                                    style: {
                                        color: 'oklch(0.75 0.15 260)'
                                    },
                                    children: plan.complementName
                                }, void 0, false, {
                                    fileName: "[project]/components/layout/encaixe-panel.tsx",
                                    lineNumber: 237,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/layout/encaixe-panel.tsx",
                            lineNumber: 235,
                            columnNumber: 15
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center justify-between",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-[8px] font-mono text-muted-foreground/50",
                                    children: t.hole_also_in
                                }, void 0, false, {
                                    fileName: "[project]/components/layout/encaixe-panel.tsx",
                                    lineNumber: 241,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-[8px] font-mono text-muted-foreground/40 italic",
                                    children: t.no_complement
                                }, void 0, false, {
                                    fileName: "[project]/components/layout/encaixe-panel.tsx",
                                    lineNumber: 242,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/layout/encaixe-panel.tsx",
                            lineNumber: 240,
                            columnNumber: 15
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/layout/encaixe-panel.tsx",
                    lineNumber: 229,
                    columnNumber: 11
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-start gap-1 rounded-lg bg-yellow-500/10 border border-yellow-500/20 px-1.5 py-1",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__["AlertTriangle"], {
                            className: "w-2.5 h-2.5 mt-0.5 shrink-0 text-yellow-400"
                        }, void 0, false, {
                            fileName: "[project]/components/layout/encaixe-panel.tsx",
                            lineNumber: 248,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "text-[8px] font-mono text-yellow-200/70 leading-relaxed",
                            children: t.analysis_error
                        }, void 0, false, {
                            fileName: "[project]/components/layout/encaixe-panel.tsx",
                            lineNumber: 249,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/layout/encaixe-panel.tsx",
                    lineNumber: 247,
                    columnNumber: 11
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    onClick: handleApply,
                    disabled: busy || !plan,
                    className: "flex items-center justify-center gap-1.5 w-full px-3 py-2 rounded-lg text-sm font-mono font-medium text-background hover:opacity-90 transition-all disabled:opacity-50",
                    style: {
                        background: 'oklch(0.55 0.15 260)'
                    },
                    children: busy ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                                className: "w-3.5 h-3.5 animate-spin"
                            }, void 0, false, {
                                fileName: "[project]/components/layout/encaixe-panel.tsx",
                                lineNumber: 261,
                                columnNumber: 17
                            }, this),
                            t.generating_enc
                        ]
                    }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$box$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__["Box"], {
                                className: "w-3.5 h-3.5"
                            }, void 0, false, {
                                fileName: "[project]/components/layout/encaixe-panel.tsx",
                                lineNumber: 262,
                                columnNumber: 17
                            }, this),
                            t.apply_encaixe
                        ]
                    }, void 0, true)
                }, void 0, false, {
                    fileName: "[project]/components/layout/encaixe-panel.tsx",
                    lineNumber: 254,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center gap-3 text-[7px] font-mono text-muted-foreground/40",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "flex items-center gap-1",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "w-1.5 h-1.5 rounded-sm bg-gray-400"
                                }, void 0, false, {
                                    fileName: "[project]/components/layout/encaixe-panel.tsx",
                                    lineNumber: 267,
                                    columnNumber: 53
                                }, this),
                                t.legend_hole_in
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/layout/encaixe-panel.tsx",
                            lineNumber: 267,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "flex items-center gap-1",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "w-1.5 h-1.5 rounded-sm",
                                    style: {
                                        background: 'oklch(0.65 0.18 260)'
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/components/layout/encaixe-panel.tsx",
                                    lineNumber: 268,
                                    columnNumber: 53
                                }, this),
                                t.legend_pin_loose
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/layout/encaixe-panel.tsx",
                            lineNumber: 268,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/layout/encaixe-panel.tsx",
                    lineNumber: 266,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/components/layout/encaixe-panel.tsx",
            lineNumber: 140,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/components/layout/encaixe-panel.tsx",
        lineNumber: 135,
        columnNumber: 5
    }, this);
}
}),
"[project]/components/layout/export-panel.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ExportPanel",
    ()=>ExportPanel
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$download$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Download$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/download.mjs [app-ssr] (ecmascript) <export default as Download>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.mjs [app-ssr] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$down$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FileDown$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/file-down.mjs [app-ssr] (ecmascript) <export default as FileDown>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layers$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Layers$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/layers.mjs [app-ssr] (ecmascript) <export default as Layers>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$package$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Package$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/package.mjs [app-ssr] (ecmascript) <export default as Package>");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/store.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
function ExportPanel({ open, onClose }) {
    const { parts, setStatus } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAppStore"])();
    const [format, setFormat] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('stl');
    const [exporting, setExporting] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    if (!open) return null;
    const visibleParts = parts.filter((p)=>p.mesh);
    const handleExport = async ()=>{
        if (visibleParts.length === 0) return;
        setExporting(true);
        setStatus('exporting', 'Exportando todas as partes...');
        try {
            if (visibleParts.length === 1) {
                // Single part — download directly (no ZIP needed)
                await exportSingleMesh(visibleParts[0].mesh, format, visibleParts[0].name);
            } else {
                // Multiple parts — bundle into a ZIP
                await exportAllAsZip(visibleParts.map((p)=>({
                        mesh: p.mesh,
                        name: p.name
                    })), format);
            }
            setStatus('loaded', `Exportação concluída — ${visibleParts.length} parte(s).`);
            onClose();
        } catch (err) {
            setStatus('error', `Erro ao exportar: ${err.message}`);
        } finally{
            setExporting(false);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed inset-0 z-50 flex items-center justify-center",
        "aria-modal": "true",
        role: "dialog",
        "aria-label": "Exportar modelo",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute inset-0 bg-background/80 backdrop-blur-sm",
                onClick: onClose,
                "aria-hidden": "true"
            }, void 0, false, {
                fileName: "[project]/components/layout/export-panel.tsx",
                lineNumber: 51,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "relative w-96 rounded-xl border border-border animate-fade-in overflow-hidden",
                style: {
                    background: 'oklch(0.10 0 0)',
                    boxShadow: '0 24px 48px oklch(0 0 0 / 80%)'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center justify-between px-5 py-4 border-b border-border",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$down$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FileDown$3e$__["FileDown"], {
                                        className: "w-4 h-4",
                                        style: {
                                            color: 'oklch(0.70 0.22 42)'
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/components/layout/export-panel.tsx",
                                        lineNumber: 65,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "font-mono text-sm font-medium text-foreground uppercase tracking-wider",
                                        children: "Exportar"
                                    }, void 0, false, {
                                        fileName: "[project]/components/layout/export-panel.tsx",
                                        lineNumber: 66,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/layout/export-panel.tsx",
                                lineNumber: 64,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: onClose,
                                className: "text-muted-foreground hover:text-foreground transition-colors",
                                "aria-label": "Fechar",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                    className: "w-4 h-4"
                                }, void 0, false, {
                                    fileName: "[project]/components/layout/export-panel.tsx",
                                    lineNumber: 75,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/layout/export-panel.tsx",
                                lineNumber: 70,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/layout/export-panel.tsx",
                        lineNumber: 63,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "p-5 flex flex-col gap-5",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2",
                                        children: "Formato"
                                    }, void 0, false, {
                                        fileName: "[project]/components/layout/export-panel.tsx",
                                        lineNumber: 82,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex gap-2",
                                        children: [
                                            'stl',
                                            'obj'
                                        ].map((f)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>setFormat(f),
                                                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])('flex-1 py-2 rounded-lg border text-xs font-mono uppercase tracking-wider transition-all', format === f ? 'text-background border-transparent' : 'border-border text-muted-foreground hover:text-foreground hover:border-foreground/20'),
                                                style: format === f ? {
                                                    background: 'oklch(0.70 0.22 42)'
                                                } : undefined,
                                                children: [
                                                    ".",
                                                    f
                                                ]
                                            }, f, true, {
                                                fileName: "[project]/components/layout/export-panel.tsx",
                                                lineNumber: 87,
                                                columnNumber: 17
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/components/layout/export-panel.tsx",
                                        lineNumber: 85,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/layout/export-panel.tsx",
                                lineNumber: 81,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-start gap-3 px-3 py-3 rounded-lg border border-border/50",
                                style: {
                                    background: 'oklch(0.70 0.22 42 / 6%)'
                                },
                                children: [
                                    visibleParts.length > 1 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$package$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Package$3e$__["Package"], {
                                        className: "w-4 h-4 mt-0.5 shrink-0",
                                        style: {
                                            color: 'oklch(0.70 0.22 42)'
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/components/layout/export-panel.tsx",
                                        lineNumber: 114,
                                        columnNumber: 17
                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layers$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Layers$3e$__["Layers"], {
                                        className: "w-4 h-4 mt-0.5 shrink-0",
                                        style: {
                                            color: 'oklch(0.70 0.22 42)'
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/components/layout/export-panel.tsx",
                                        lineNumber: 115,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-xs font-mono font-medium text-foreground",
                                                children: visibleParts.length > 1 ? 'Exportar como Projeto.zip' : `Exportar ${visibleParts[0]?.name ?? 'parte'}`
                                            }, void 0, false, {
                                                fileName: "[project]/components/layout/export-panel.tsx",
                                                lineNumber: 118,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-[11px] text-muted-foreground/70 mt-0.5",
                                                children: visibleParts.length > 1 ? `${visibleParts.length} partes · cada uma em um arquivo .${format} separado dentro do ZIP` : `1 parte · arquivo .${format}`
                                            }, void 0, false, {
                                                fileName: "[project]/components/layout/export-panel.tsx",
                                                lineNumber: 121,
                                                columnNumber: 15
                                            }, this),
                                            visibleParts.length > 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                                className: "mt-2 flex flex-col gap-0.5",
                                                children: [
                                                    visibleParts.slice(0, 6).map((p)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                            className: "text-[10px] font-mono text-muted-foreground/60 truncate",
                                                            children: [
                                                                "└ ",
                                                                sanitizeFilename(p.name),
                                                                ".",
                                                                format
                                                            ]
                                                        }, p.id, true, {
                                                            fileName: "[project]/components/layout/export-panel.tsx",
                                                            lineNumber: 129,
                                                            columnNumber: 21
                                                        }, this)),
                                                    visibleParts.length > 6 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                        className: "text-[10px] font-mono text-muted-foreground/40",
                                                        children: [
                                                            "└ …e mais ",
                                                            visibleParts.length - 6,
                                                            " parte(s)"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/layout/export-panel.tsx",
                                                        lineNumber: 134,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/layout/export-panel.tsx",
                                                lineNumber: 127,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/layout/export-panel.tsx",
                                        lineNumber: 117,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/layout/export-panel.tsx",
                                lineNumber: 109,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: handleExport,
                                disabled: exporting || visibleParts.length === 0,
                                className: "flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-mono font-medium text-background transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed",
                                style: {
                                    background: 'oklch(0.70 0.22 42)'
                                },
                                children: exporting ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "w-3.5 h-3.5 border-2 border-background/30 border-t-background rounded-full animate-spin"
                                        }, void 0, false, {
                                            fileName: "[project]/components/layout/export-panel.tsx",
                                            lineNumber: 152,
                                            columnNumber: 17
                                        }, this),
                                        "Exportando..."
                                    ]
                                }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$download$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Download$3e$__["Download"], {
                                            className: "w-4 h-4"
                                        }, void 0, false, {
                                            fileName: "[project]/components/layout/export-panel.tsx",
                                            lineNumber: 157,
                                            columnNumber: 17
                                        }, this),
                                        visibleParts.length > 1 ? 'Exportar ZIP' : 'Exportar'
                                    ]
                                }, void 0, true)
                            }, void 0, false, {
                                fileName: "[project]/components/layout/export-panel.tsx",
                                lineNumber: 144,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/layout/export-panel.tsx",
                        lineNumber: 79,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/layout/export-panel.tsx",
                lineNumber: 58,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/layout/export-panel.tsx",
        lineNumber: 49,
        columnNumber: 5
    }, this);
}
// ─── Helpers de exportação ────────────────────────────────────────────────────
function sanitizeFilename(name) {
    return name.replace(/[^a-zA-Z0-9_\-À-ÿ ]/g, '_').trim() || 'Parte';
}
async function meshToBlob(mesh, format) {
    if (format === 'stl') {
        const { STLExporter } = await __turbopack_context__.A("[project]/node_modules/three/examples/jsm/exporters/STLExporter.js [app-ssr] (ecmascript, async loader)");
        const result = new STLExporter().parse(mesh, {
            binary: true
        });
        return new Blob([
            result
        ], {
            type: 'application/octet-stream'
        });
    } else {
        const { OBJExporter } = await __turbopack_context__.A("[project]/node_modules/three/examples/jsm/exporters/OBJExporter.js [app-ssr] (ecmascript, async loader)");
        const result = new OBJExporter().parse(mesh);
        return new Blob([
            result
        ], {
            type: 'text/plain'
        });
    }
}
function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    setTimeout(()=>URL.revokeObjectURL(url), 1000);
}
async function exportSingleMesh(mesh, format, name) {
    const blob = await meshToBlob(mesh, format);
    downloadBlob(blob, `${sanitizeFilename(name)}.${format}`);
}
async function exportAllAsZip(parts, format) {
    const JSZip = (await __turbopack_context__.A("[project]/node_modules/jszip/lib/index.js [app-ssr] (ecmascript, async loader)")).default;
    const zip = new JSZip();
    // Deduplicate filenames (e.g. two parts both named "Parte 1")
    const usedNames = new Map();
    for (const { mesh, name } of parts){
        const base = sanitizeFilename(name);
        const count = usedNames.get(base) ?? 0;
        usedNames.set(base, count + 1);
        const filename = count === 0 ? `${base}.${format}` : `${base} (${count + 1}).${format}`;
        const blob = await meshToBlob(mesh, format);
        zip.file(filename, blob);
    }
    const zipBlob = await zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: {
            level: 6
        }
    });
    downloadBlob(zipBlob, 'Projeto.zip');
}
}),
"[project]/components/viewport/cut-preview-overlay.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CutPreviewOverlay",
    ()=>CutPreviewOverlay
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
/**
 * CutPreviewOverlay V2 — Visualização interativa 3D do pipeline de corte.
 *
 * Suporta os modos de visualização do SmartCut V2:
 *   'plane'      → mostra apenas a linha de corte (isocontorno)
 *   'shell'      → cascas abertas (Etapas 1–3, sem tampas)
 *   'caps'       → peças com tampas geradas (Etapas 4–6)
 *   'connectors' → igual a 'caps' (encaixes são aplicados ao final)
 *   'final'      → resultado final (igual a 'caps')
 *
 * Para compatibilidade, quando autoCutPreviewMode não está ativo,
 * usa o comportamento legado com cutPreview e previewViewMode.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$b389eeca$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__m__as__invalidate$3e$__ = __turbopack_context__.i("[project]/node_modules/@react-three/fiber/dist/events-b389eeca.esm.js [app-ssr] (ecmascript) <export m as invalidate>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/three/build/three.core.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/store.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
function CutPreviewOverlay() {
    const cutPreview = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAppStore"])((s)=>s.cutPreview);
    const openCutData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAppStore"])((s)=>s.openCutData);
    const autoCutPreviewMode = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAppStore"])((s)=>s.autoCutPreviewMode);
    const autoCutPipelineStage = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAppStore"])((s)=>s.autoCutPipelineStage);
    const previewViewMode = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAppStore"])((s)=>s.previewViewMode);
    const modelMesh = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAppStore"])((s)=>s.modelMesh);
    const [seamGeo, setSeamGeo] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const seamGeoRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    // Determina quais geometrias mostrar de acordo com o modo
    const showShell = autoCutPreviewMode === 'shell' && autoCutPipelineStage !== 'idle' && !!openCutData;
    const showCaps = (autoCutPreviewMode === 'caps' || autoCutPreviewMode === 'connectors' || autoCutPreviewMode === 'final') && !!cutPreview;
    const showPlane = autoCutPreviewMode === 'plane';
    // Fallback: legado (quando o pipeline V2 não está ativo)
    const legacyMode = autoCutPipelineStage === 'idle' && !!cutPreview;
    const selectedGeo = showShell ? openCutData.openSelectedGeometry : showCaps ? cutPreview.selectedGeometry : legacyMode ? cutPreview.selectedGeometry : null;
    const bodyGeo = showShell ? openCutData.openBodyGeometry : showCaps ? cutPreview.bodyGeometry : legacyMode ? cutPreview.bodyGeometry : null;
    // Pontos do isocontorno (seam line)
    const seamPoints = showShell ? openCutData.seamPoints : cutPreview?.seamPoints ?? null;
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (seamGeoRef.current) {
            seamGeoRef.current.dispose();
            seamGeoRef.current = null;
        }
        if (seamPoints && seamPoints.length > 0) {
            const geo = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BufferGeometry"]();
            geo.setAttribute('position', new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BufferAttribute"](seamPoints, 3));
            seamGeoRef.current = geo;
            setSeamGeo(geo);
        } else {
            setSeamGeo(null);
        }
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$b389eeca$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__m__as__invalidate$3e$__["invalidate"])();
        return ()=>{
            if (seamGeoRef.current) {
                seamGeoRef.current.dispose();
                seamGeoRef.current = null;
            }
        };
    }, [
        seamPoints
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$b389eeca$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__m__as__invalidate$3e$__["invalidate"])();
    }, [
        previewViewMode,
        autoCutPreviewMode,
        selectedGeo,
        bodyGeo
    ]);
    if (!modelMesh) return null;
    if (!selectedGeo && !showPlane) return null;
    const pos = modelMesh.position.toArray();
    const rot = [
        modelMesh.rotation.x,
        modelMesh.rotation.y,
        modelMesh.rotation.z
    ];
    const scale = modelMesh.scale.toArray();
    const wireframe = previewViewMode === 'wireframe';
    const xray = previewViewMode === 'xray';
    const isShell = cutPreview?.params.cutType === 'shell';
    // Cor da peça selecionada depende do modo
    // Shell (cascas abertas) → laranja translúcido; Tampas → vermelho translúcido
    const selectedColor = showShell ? '#ff8800' : isShell ? '#3388ff' : '#ff2222';
    const selectedOpacity = wireframe ? 1 : showShell ? 0.35 : isShell ? 0.55 : 0.42;
    // Modo 'plane': mostra só a linha de corte, sem geometrias de peça
    if (showPlane && !selectedGeo) {
        if (!seamGeo) return null;
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("group", {
            position: pos,
            rotation: rot,
            scale: scale,
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("lineSegments", {
                geometry: seamGeo,
                renderOrder: 999,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("lineBasicMaterial", {
                    color: "#00aaff",
                    transparent: true,
                    opacity: 0.95,
                    depthTest: false
                }, void 0, false, {
                    fileName: "[project]/components/viewport/cut-preview-overlay.tsx",
                    lineNumber: 104,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/viewport/cut-preview-overlay.tsx",
                lineNumber: 103,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/components/viewport/cut-preview-overlay.tsx",
            lineNumber: 102,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("group", {
        position: pos,
        rotation: rot,
        scale: scale,
        children: [
            bodyGeo && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                geometry: bodyGeo,
                renderOrder: 1,
                castShadow: true,
                receiveShadow: true,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("meshStandardMaterial", {
                    color: "#8a8a8d",
                    roughness: 0.6,
                    metalness: 0.05,
                    transparent: xray,
                    opacity: xray ? 0.25 : 1,
                    wireframe: wireframe,
                    side: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DoubleSide"],
                    depthWrite: !xray
                }, void 0, false, {
                    fileName: "[project]/components/viewport/cut-preview-overlay.tsx",
                    lineNumber: 115,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/viewport/cut-preview-overlay.tsx",
                lineNumber: 114,
                columnNumber: 9
            }, this),
            selectedGeo && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                geometry: selectedGeo,
                renderOrder: 2,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("meshStandardMaterial", {
                    color: selectedColor,
                    roughness: showShell ? 0.7 : isShell ? 0.35 : 0.5,
                    metalness: showShell ? 0.0 : isShell ? 0.15 : 0.1,
                    transparent: true,
                    opacity: selectedOpacity,
                    wireframe: wireframe,
                    side: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DoubleSide"],
                    depthWrite: false
                }, void 0, false, {
                    fileName: "[project]/components/viewport/cut-preview-overlay.tsx",
                    lineNumber: 131,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/viewport/cut-preview-overlay.tsx",
                lineNumber: 130,
                columnNumber: 9
            }, this),
            seamGeo && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("lineSegments", {
                geometry: seamGeo,
                renderOrder: 999,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("lineBasicMaterial", {
                    color: showPlane || showShell ? '#00aaff' : '#ffffff',
                    transparent: true,
                    opacity: 0.9,
                    depthTest: false
                }, void 0, false, {
                    fileName: "[project]/components/viewport/cut-preview-overlay.tsx",
                    lineNumber: 147,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/viewport/cut-preview-overlay.tsx",
                lineNumber: 146,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/viewport/cut-preview-overlay.tsx",
        lineNumber: 111,
        columnNumber: 5
    }, this);
}
}),
"[project]/components/viewport/model-renderer.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ModelRenderer",
    ()=>ModelRenderer
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$b389eeca$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__m__as__invalidate$3e$__ = __turbopack_context__.i("[project]/node_modules/@react-three/fiber/dist/events-b389eeca.esm.js [app-ssr] (ecmascript) <export m as invalidate>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/three/build/three.core.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/store.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$solid$2d$plane$2d$cut$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/solid-plane-cut.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$viewport$2f$cut$2d$preview$2d$overlay$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/viewport/cut-preview-overlay.tsx [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
;
;
// Geometrias de plano pré-alocadas fora do ciclo de render — reutilizadas por
// todas as instâncias de preview, evitando criação de objeto a cada render.
const _PLANE_GEO_CACHE = new Map();
function getPlaneGeo(size) {
    // Arredonda para 2 casas decimais para maximizar cache hits
    const key = Math.round(size * 100);
    let geo = _PLANE_GEO_CACHE.get(key);
    if (!geo) {
        geo = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PlaneGeometry"](size, size);
        _PLANE_GEO_CACHE.set(key, geo);
    }
    return geo;
}
/**
 * Verdadeiro quando o CutPreviewOverlay está exibindo geometria de peça
 * (casca, tampas ou preview legado) — nesses casos o modelo original e as
 * peças já cortadas devem ficar ocultos para não sobrepor o overlay.
 * No modo 'plane' o overlay mostra apenas a linha de corte, então o
 * modelo permanece visível.
 */ function useCutOverlayActive() {
    const cutPreview = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAppStore"])((s)=>s.cutPreview);
    const openCutData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAppStore"])((s)=>s.openCutData);
    const autoCutPreviewMode = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAppStore"])((s)=>s.autoCutPreviewMode);
    const autoCutPipelineStage = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAppStore"])((s)=>s.autoCutPipelineStage);
    const showShell = autoCutPreviewMode === 'shell' && autoCutPipelineStage !== 'idle' && !!openCutData;
    const showCaps = (autoCutPreviewMode === 'caps' || autoCutPreviewMode === 'connectors' || autoCutPreviewMode === 'final') && !!cutPreview;
    const legacyMode = autoCutPipelineStage === 'idle' && !!cutPreview;
    return showShell || showCaps || legacyMode;
}
function ModelRenderer() {
    const parts = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAppStore"])((s)=>s.parts);
    const activePartId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAppStore"])((s)=>s.activePartId);
    const modelMesh = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAppStore"])((s)=>s.modelMesh);
    if (parts.length === 0 && !modelMesh) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("group", {
        children: [
            parts.map((part)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(PartMesh, {
                    part: part,
                    isActive: part.id === activePartId,
                    isolate: activePartId !== null
                }, part.id, false, {
                    fileName: "[project]/components/viewport/model-renderer.tsx",
                    lineNumber: 57,
                    columnNumber: 9
                }, this)),
            modelMesh && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(PlaneCutPreview, {
                mesh: modelMesh
            }, void 0, false, {
                fileName: "[project]/components/viewport/model-renderer.tsx",
                lineNumber: 65,
                columnNumber: 21
            }, this),
            modelMesh && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(AutoSplitPreview, {
                mesh: modelMesh
            }, void 0, false, {
                fileName: "[project]/components/viewport/model-renderer.tsx",
                lineNumber: 66,
                columnNumber: 21
            }, this),
            modelMesh && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(AutoCutPreview, {
                mesh: modelMesh
            }, void 0, false, {
                fileName: "[project]/components/viewport/model-renderer.tsx",
                lineNumber: 67,
                columnNumber: 21
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$viewport$2f$cut$2d$preview$2d$overlay$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CutPreviewOverlay"], {}, void 0, false, {
                fileName: "[project]/components/viewport/model-renderer.tsx",
                lineNumber: 69,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/viewport/model-renderer.tsx",
        lineNumber: 55,
        columnNumber: 5
    }, this);
}
const PartMesh = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["memo"])(function PartMesh({ part, isActive, isolate }) {
    const overlayActive = useCutOverlayActive();
    const { showWireframe } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAppStore"])();
    // Visibility rules:
    // 1. If overlay is active, hide everything (CutPreviewOverlay replaces the view)
    // 2. If in isolation mode and this is not the active part → hidden
    // 3. Respect the part's own visibility flag
    const visible = !overlayActive && (!isolate || isActive) && part.visible;
    // Sync visibility directly on the underlying Three.js object so raycasters
    // (which bypass React props and read the object directly) always see the
    // correct flag.  matrixWorld is kept current by R3F because the object is
    // actually in the scene graph via <primitive>.
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        part.mesh.visible = visible;
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$b389eeca$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__m__as__invalidate$3e$__["invalidate"])();
    }, [
        part.mesh,
        visible
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$b389eeca$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__m__as__invalidate$3e$__["invalidate"])();
    }, [
        showWireframe
    ]);
    // Use <primitive> so part.mesh IS the actual scene object.
    // This is critical: raycaster.intersectObject(modelMesh) uses matrixWorld,
    // which Three.js only updates for objects that live in the scene graph.
    // With a separate <mesh geometry={...}> the store's modelMesh reference is
    // never in the scene, so its matrixWorld stays at identity regardless of
    // any transforms — causing mismatched raycasts.
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("primitive", {
        object: part.mesh,
        visible: visible,
        castShadow: true,
        receiveShadow: true,
        children: isActive && visible && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("meshBasicMaterial", {
                color: "#ffffff",
                wireframe: true,
                transparent: true,
                opacity: 0.08
            }, void 0, false, {
                fileName: "[project]/components/viewport/model-renderer.tsx",
                lineNumber: 115,
                columnNumber: 11
            }, this)
        }, void 0, false, {
            fileName: "[project]/components/viewport/model-renderer.tsx",
            lineNumber: 114,
            columnNumber: 9
        }, this)
    }, void 0, false, {
        fileName: "[project]/components/viewport/model-renderer.tsx",
        lineNumber: 111,
        columnNumber: 5
    }, this);
});
// ── Plano de corte AutoCut ────────────────────────────────────────────────────
function AutoCutPreview({ mesh }) {
    const preview = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAppStore"])((s)=>s.autoCutPreview);
    const overlayActive = useCutOverlayActive();
    const data = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        if (!preview || overlayActive) return null;
        const geo = mesh.geometry;
        if (!geo.boundingBox) geo.computeBoundingBox();
        const size = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector3"]();
        geo.boundingBox.getSize(size);
        const diag = Math.max(size.x, size.y, size.z) * 1.35 || 1;
        const normal = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector3"](preview.normal[0], preview.normal[1], preview.normal[2]).normalize();
        const quat = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Quaternion"]().setFromUnitVectors(new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector3"](0, 0, 1), normal);
        const point = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector3"](preview.point[0], preview.point[1], preview.point[2]);
        return {
            point,
            quat,
            diag
        };
    }, [
        preview,
        mesh,
        overlayActive
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$b389eeca$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__m__as__invalidate$3e$__["invalidate"])();
    }, [
        data
    ]);
    if (!data) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("group", {
        position: data.point.toArray(),
        quaternion: data.quat.toArray(),
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                renderOrder: 999,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("planeGeometry", {
                        args: [
                            data.diag,
                            data.diag
                        ]
                    }, void 0, false, {
                        fileName: "[project]/components/viewport/model-renderer.tsx",
                        lineNumber: 150,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("meshBasicMaterial", {
                        color: "#ff6600",
                        transparent: true,
                        opacity: 0.18,
                        side: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DoubleSide"],
                        depthWrite: false
                    }, void 0, false, {
                        fileName: "[project]/components/viewport/model-renderer.tsx",
                        lineNumber: 151,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/viewport/model-renderer.tsx",
                lineNumber: 149,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("lineSegments", {
                renderOrder: 1000,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("primitive", {
                        object: new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["EdgesGeometry"](getPlaneGeo(data.diag)),
                        attach: "geometry"
                    }, void 0, false, {
                        fileName: "[project]/components/viewport/model-renderer.tsx",
                        lineNumber: 154,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("lineBasicMaterial", {
                        color: "#ff6600",
                        transparent: true,
                        opacity: 0.85,
                        depthTest: false
                    }, void 0, false, {
                        fileName: "[project]/components/viewport/model-renderer.tsx",
                        lineNumber: 155,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/viewport/model-renderer.tsx",
                lineNumber: 153,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/viewport/model-renderer.tsx",
        lineNumber: 145,
        columnNumber: 5
    }, this);
}
// ── Preview do plano de corte ─────────────────────────────────────────────────
function PlaneCutPreview({ mesh }) {
    const { cutPlaneAxis, cutPlaneOffset, cutPlaneFlip, activeTool } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAppStore"])();
    const overlayActive = useCutOverlayActive();
    const data = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        if (activeTool !== 'cut' || overlayActive) return null;
        const geo = mesh.geometry;
        if (!geo.boundingBox) geo.computeBoundingBox();
        const bb = geo.boundingBox;
        const size = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector3"]();
        bb.getSize(size);
        const diag = Math.max(size.x, size.y, size.z) * 1.35 || 1;
        const { normal, point } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$solid$2d$plane$2d$cut$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["planeFromAxisOffset"])(bb, cutPlaneAxis, cutPlaneOffset, cutPlaneFlip);
        const quat = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Quaternion"]().setFromUnitVectors(new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector3"](0, 0, 1), normal);
        return {
            point,
            quat,
            diag
        };
    }, [
        activeTool,
        mesh,
        cutPlaneAxis,
        cutPlaneOffset,
        cutPlaneFlip,
        overlayActive
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$b389eeca$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__m__as__invalidate$3e$__["invalidate"])();
    }, [
        data
    ]);
    if (!data) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("group", {
        position: data.point.toArray(),
        quaternion: data.quat.toArray(),
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                renderOrder: 2,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("planeGeometry", {
                        args: [
                            data.diag,
                            data.diag
                        ]
                    }, void 0, false, {
                        fileName: "[project]/components/viewport/model-renderer.tsx",
                        lineNumber: 189,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("meshBasicMaterial", {
                        color: 0x4488ff,
                        transparent: true,
                        opacity: 0.14,
                        side: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DoubleSide"],
                        depthWrite: false
                    }, void 0, false, {
                        fileName: "[project]/components/viewport/model-renderer.tsx",
                        lineNumber: 190,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/viewport/model-renderer.tsx",
                lineNumber: 188,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("lineSegments", {
                renderOrder: 3,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("primitive", {
                        object: new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["EdgesGeometry"](getPlaneGeo(data.diag)),
                        attach: "geometry"
                    }, void 0, false, {
                        fileName: "[project]/components/viewport/model-renderer.tsx",
                        lineNumber: 193,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("lineBasicMaterial", {
                        color: 0x4488ff,
                        transparent: true,
                        opacity: 0.7,
                        depthTest: false
                    }, void 0, false, {
                        fileName: "[project]/components/viewport/model-renderer.tsx",
                        lineNumber: 194,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/viewport/model-renderer.tsx",
                lineNumber: 192,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/viewport/model-renderer.tsx",
        lineNumber: 184,
        columnNumber: 5
    }, this);
}
// ── Preview dos planos de divisão automática ──────────────────────────────────
function AutoSplitPreview({ mesh }) {
    const { autoSplitPlan, activeTool } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAppStore"])();
    const overlayActive = useCutOverlayActive();
    const cuts = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        if (activeTool !== 'autosplit' || !autoSplitPlan || overlayActive) return [];
        const geo = mesh.geometry;
        if (!geo.boundingBox) geo.computeBoundingBox();
        const size = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector3"]();
        geo.boundingBox.getSize(size);
        const diag = Math.max(size.x, size.y, size.z) * 1.35 || 1;
        const planNormal = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector3"](...autoSplitPlan.normal);
        return autoSplitPlan.cuts.map((cut)=>{
            const quat = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Quaternion"]().setFromUnitVectors(new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector3"](0, 0, 1), planNormal);
            const point = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector3"](...cut.center);
            return {
                point,
                quat,
                diag
            };
        });
    }, [
        activeTool,
        mesh,
        autoSplitPlan,
        overlayActive
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$b389eeca$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__m__as__invalidate$3e$__["invalidate"])();
    }, [
        cuts
    ]);
    if (cuts.length === 0) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
        children: cuts.map((c, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("group", {
                position: c.point.toArray(),
                quaternion: c.quat.toArray(),
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                        renderOrder: 2,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("planeGeometry", {
                                args: [
                                    c.diag,
                                    c.diag
                                ]
                            }, void 0, false, {
                                fileName: "[project]/components/viewport/model-renderer.tsx",
                                lineNumber: 230,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("meshBasicMaterial", {
                                color: 0x44cc88,
                                transparent: true,
                                opacity: 0.12,
                                side: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DoubleSide"],
                                depthWrite: false
                            }, void 0, false, {
                                fileName: "[project]/components/viewport/model-renderer.tsx",
                                lineNumber: 231,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/viewport/model-renderer.tsx",
                        lineNumber: 229,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("lineSegments", {
                        renderOrder: 3,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("primitive", {
                                object: new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["EdgesGeometry"](getPlaneGeo(c.diag)),
                                attach: "geometry"
                            }, void 0, false, {
                                fileName: "[project]/components/viewport/model-renderer.tsx",
                                lineNumber: 234,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("lineBasicMaterial", {
                                color: 0x44cc88,
                                transparent: true,
                                opacity: 0.7,
                                depthTest: false
                            }, void 0, false, {
                                fileName: "[project]/components/viewport/model-renderer.tsx",
                                lineNumber: 235,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/viewport/model-renderer.tsx",
                        lineNumber: 233,
                        columnNumber: 11
                    }, this)
                ]
            }, i, true, {
                fileName: "[project]/components/viewport/model-renderer.tsx",
                lineNumber: 228,
                columnNumber: 9
            }, this))
    }, void 0, false);
}
}),
"[project]/components/viewport/axes-helper.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AxesHelper",
    ()=>AxesHelper
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/three/build/three.core.js [app-ssr] (ecmascript)");
"use client";
;
;
function AxesHelper() {
    const size = 1.5;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("group", {
        position: [
            -4.5,
            -1.8,
            -4.5
        ],
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("arrowHelper", {
                args: [
                    new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector3"](1, 0, 0),
                    new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector3"](0, 0, 0),
                    size,
                    0xff3333,
                    0.15,
                    0.08
                ]
            }, void 0, false, {
                fileName: "[project]/components/viewport/axes-helper.tsx",
                lineNumber: 13,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("arrowHelper", {
                args: [
                    new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector3"](0, 1, 0),
                    new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector3"](0, 0, 0),
                    size,
                    0x33ff66,
                    0.15,
                    0.08
                ]
            }, void 0, false, {
                fileName: "[project]/components/viewport/axes-helper.tsx",
                lineNumber: 24,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("arrowHelper", {
                args: [
                    new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector3"](0, 0, 1),
                    new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector3"](0, 0, 0),
                    size,
                    0x3366ff,
                    0.15,
                    0.08
                ]
            }, void 0, false, {
                fileName: "[project]/components/viewport/axes-helper.tsx",
                lineNumber: 35,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/viewport/axes-helper.tsx",
        lineNumber: 11,
        columnNumber: 5
    }, this);
}
}),
"[project]/components/viewport/viewport-3d.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Viewport3D",
    ()=>Viewport3D
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$react$2d$three$2d$fiber$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@react-three/fiber/dist/react-three-fiber.esm.js [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$b389eeca$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__D__as__useFrame$3e$__ = __turbopack_context__.i("[project]/node_modules/@react-three/fiber/dist/events-b389eeca.esm.js [app-ssr] (ecmascript) <export D as useFrame>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$b389eeca$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__C__as__useThree$3e$__ = __turbopack_context__.i("[project]/node_modules/@react-three/fiber/dist/events-b389eeca.esm.js [app-ssr] (ecmascript) <export C as useThree>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$b389eeca$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__m__as__invalidate$3e$__ = __turbopack_context__.i("[project]/node_modules/@react-three/fiber/dist/events-b389eeca.esm.js [app-ssr] (ecmascript) <export m as invalidate>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$drei$2f$core$2f$OrbitControls$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@react-three/drei/core/OrbitControls.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$drei$2f$core$2f$Grid$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@react-three/drei/core/Grid.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/three/build/three.core.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/store.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$smart$2d$cut$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/smart-cut.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$model$2d$loader$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/model-loader.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$open$2d$file$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/open-file.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$viewport$2f$model$2d$renderer$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/viewport/model-renderer.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$viewport$2f$axes$2d$helper$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/viewport/axes-helper.tsx [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
;
;
;
;
;
;
// ─── WebGL Error Boundary ─────────────────────────────────────────────────────
// Catches the "Error creating WebGL context" thrown by @react-three/fiber's
// Canvas when the device/environment has no GPU. Without this, the entire app
// crashes with an unhandled rejection.
class WebGLErrorBoundary extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Component"] {
    state = {
        failed: false,
        message: ''
    };
    static getDerivedStateFromError(err) {
        return {
            failed: true,
            message: err.message ?? String(err)
        };
    }
    componentDidCatch(err, info) {
        console.warn('[Viewport3D] WebGL context error caught by boundary:', err.message, info);
    }
    render() {
        if (this.state.failed) {
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute inset-0 flex flex-col items-center justify-center gap-3 text-muted-foreground/60 select-none pointer-events-none",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                        viewBox: "0 0 40 40",
                        className: "w-12 h-12 opacity-30",
                        fill: "none",
                        stroke: "currentColor",
                        strokeWidth: "1.5",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                                x: "4",
                                y: "4",
                                width: "32",
                                height: "32",
                                rx: "4"
                            }, void 0, false, {
                                fileName: "[project]/components/viewport/viewport-3d.tsx",
                                lineNumber: 44,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                                x1: "12",
                                y1: "12",
                                x2: "28",
                                y2: "28"
                            }, void 0, false, {
                                fileName: "[project]/components/viewport/viewport-3d.tsx",
                                lineNumber: 45,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                                x1: "28",
                                y1: "12",
                                x2: "12",
                                y2: "28"
                            }, void 0, false, {
                                fileName: "[project]/components/viewport/viewport-3d.tsx",
                                lineNumber: 46,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/viewport/viewport-3d.tsx",
                        lineNumber: 43,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-xs font-mono text-center px-6",
                        children: [
                            "WebGL não disponível neste dispositivo.",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                                fileName: "[project]/components/viewport/viewport-3d.tsx",
                                lineNumber: 50,
                                columnNumber: 13
                            }, this),
                            "Tente um navegador com aceleração de hardware ativada."
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/viewport/viewport-3d.tsx",
                        lineNumber: 48,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/viewport/viewport-3d.tsx",
                lineNumber: 42,
                columnNumber: 9
            }, this);
        }
        return this.props.children;
    }
}
// ─── FPS Counter ──────────────────────────────────────────────────────────────
function FpsCounter() {
    const setFps = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAppStore"])((s)=>s.setFps);
    const count = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(0);
    const last = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(performance.now());
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$b389eeca$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__D__as__useFrame$3e$__["useFrame"])(()=>{
        count.current++;
        const now = performance.now();
        const dt = now - last.current;
        if (dt >= 1000) {
            setFps(Math.round(count.current * 1000 / dt));
            count.current = 0;
            last.current = now;
        }
    });
    return null;
}
// ─── SmartCut Interaction ─────────────────────────────────────────────────────
function SmartCutInteraction() {
    const { modelMesh, activeTool, selectionMode, setSelectionMode, setSelectionState, setSelectedFaceIndices, selectedFaceIndices, setStatus, sharpAngle, cutMode, pushHistory, undo, redo, allowCutPartSelection, cutParts, activeCutPartId, setActiveCutPartId, activePartId } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAppStore"])();
    const { camera, gl, raycaster } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$b389eeca$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__C__as__useThree$3e$__["useThree"])();
    // Refs para estado mutable sem re-render
    const mouseNDC = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector2"]());
    const hoverRafRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const pendingMouse = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const isOrbitingRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(false);
    const orbitStartRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const modKeys = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])({
        ctrl: false,
        alt: false
    });
    // Cache do último resultado de hover: evita re-executar Dijkstra quando o
    // mouse permanece sobre a mesma face (mover dentro da mesma região é comum)
    const hoverCache = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    // Refs para estado de seleção acessível sem closure stale
    const selectedRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(new Set());
    const hoveredRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(new Set());
    const colorAttrRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const selModeRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])('new');
    // Sincroniza o ref de seleção com o store. Quando a mudança vem de fora do
    // fluxo normal de clique (ex.: desfazer/refazer), o objeto Set é diferente do
    // que está pintado, então repintamos o delta para refletir na geometria.
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const prev = selectedRef.current;
        if (prev !== selectedFaceIndices) {
            const colorAttr = colorAttrRef.current;
            if (modelMesh && colorAttr) {
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$smart$2d$cut$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["paintFacesDelta"])(modelMesh.geometry, colorAttr, prev, selectedFaceIndices, 'new');
                hoveredRef.current = new Set();
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$b389eeca$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__m__as__invalidate$3e$__["invalidate"])();
            }
            selectedRef.current = selectedFaceIndices;
        }
    }, [
        selectedFaceIndices,
        modelMesh
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        selModeRef.current = selectionMode;
    }, [
        selectionMode
    ]);
    // Inicializar colorAttr quando modelo carrega
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!modelMesh) {
            colorAttrRef.current = null;
            hoveredRef.current = new Set();
            hoverCache.current = null;
            return;
        }
        const mat = modelMesh.material;
        colorAttrRef.current = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$smart$2d$cut$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ensureColorAttribute"])(modelMesh.geometry, mat);
        // Construir cache de adjacência com ângulo atual (adiado para não travar o frame)
        setTimeout(()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$smart$2d$cut$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["buildAdjacencyCache"])(modelMesh.geometry, sharpAngle ?? 35), 80);
    }, [
        modelMesh,
        sharpAngle
    ]);
    // Invalida o hover cache sempre que os parâmetros de seleção mudam
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        hoverCache.current = null;
    }, [
        cutMode,
        sharpAngle
    ]);
    // ── Ctrl / Alt ───────────────────────────────────────────────────────────────
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const onKey = (e)=>{
            modKeys.current.ctrl = e.ctrlKey || e.metaKey;
            modKeys.current.alt = e.altKey;
            const next = e.ctrlKey || e.metaKey ? 'add' : e.altKey ? 'subtract' : 'new';
            selModeRef.current = next;
            setSelectionMode(next);
        };
        window.addEventListener('keydown', onKey, {
            passive: true
        });
        window.addEventListener('keyup', onKey, {
            passive: true
        });
        return ()=>{
            window.removeEventListener('keydown', onKey);
            window.removeEventListener('keyup', onKey);
        };
    }, [
        setSelectionMode
    ]);
    // ── Raycast ──────────────────────────────────────────────────────────────────
    const raycastFace = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((clientX, clientY)=>{
        if (!modelMesh) return null;
        const rect = gl.domElement.getBoundingClientRect();
        mouseNDC.current.set((clientX - rect.left) / rect.width * 2 - 1, -((clientY - rect.top) / rect.height) * 2 + 1);
        raycaster.setFromCamera(mouseNDC.current, camera);
        const hits = raycaster.intersectObject(modelMesh, false);
        return hits.length > 0 && hits[0].faceIndex !== undefined ? hits[0].faceIndex : null;
    }, [
        modelMesh,
        camera,
        gl,
        raycaster
    ]);
    // ── Hover: direto ao BufferAttribute, zero React ─────────────────────────────
    const doHover = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((clientX, clientY)=>{
        if (!modelMesh || activeTool !== 'select') return;
        const colorAttr = colorAttrRef.current;
        if (!colorAttr) return;
        const faceIndex = raycastFace(clientX, clientY);
        // Hover cache: se o cursor está sobre a mesma face com os mesmos parâmetros,
        // reutiliza o resultado anterior — evita re-executar Dijkstra em cada frame.
        const angle = sharpAngle ?? 35;
        let newHovered;
        if (faceIndex === null) {
            newHovered = new Set();
            hoverCache.current = null;
        } else {
            const c = hoverCache.current;
            if (c && c.face === faceIndex && c.mode === cutMode && c.angle === angle) {
                newHovered = c.result;
            } else {
                newHovered = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$smart$2d$cut$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["smartSelect"])(modelMesh.geometry, faceIndex, {
                    sharpAngle: angle,
                    mode: cutMode
                });
                hoverCache.current = {
                    face: faceIndex,
                    mode: cutMode,
                    angle,
                    result: newHovered
                };
            }
        }
        // Só repintar se o hover mudou (compara por identidade de Set)
        if (newHovered === hoveredRef.current) return;
        if (faceIndex === null && hoveredRef.current.size === 0) return;
        const prevHover = hoveredRef.current;
        hoveredRef.current = newHovered;
        // Pintura cirúrgica delta: só as faces que entraram/saíram do hover
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$smart$2d$cut$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["paintHoverDelta"])(modelMesh.geometry, colorAttr, selectedRef.current, prevHover, newHovered, selModeRef.current);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$b389eeca$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__m__as__invalidate$3e$__["invalidate"])();
    }, [
        modelMesh,
        activeTool,
        raycastFace,
        sharpAngle,
        cutMode
    ]);
    const handleMouseMove = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((e)=>{
        if (isOrbitingRef.current) return;
        pendingMouse.current = {
            x: e.clientX,
            y: e.clientY
        };
        if (hoverRafRef.current !== null) return;
        hoverRafRef.current = requestAnimationFrame(()=>{
            hoverRafRef.current = null;
            const pos = pendingMouse.current;
            if (!pos) return;
            pendingMouse.current = null;
            doHover(pos.x, pos.y);
        });
    }, [
        doHover
    ]);
    // ── Click: BFS + acumulação + state ──────────────────────────────────────────
    const handleClick = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((e)=>{
        if (!modelMesh || activeTool !== 'select' || isOrbitingRef.current) return;
        const colorAttr = colorAttrRef.current;
        if (!colorAttr) return;
        // Seleção de peças já cortadas (vermelhas): só quando habilitado E
        // nenhuma peça está em modo de isolamento. Em isolamento, apenas a peça
        // ativa importa; detectar outras peças aqui causaria interceptação falsa
        // (matrixWorld pode ser obsoleto para objetos fora do grafo da cena).
        if (allowCutPartSelection && cutParts.length > 0 && activePartId === null) {
            const rect = gl.domElement.getBoundingClientRect();
            mouseNDC.current.set((e.clientX - rect.left) / rect.width * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
            raycaster.setFromCamera(mouseNDC.current, camera);
            const partMeshes = cutParts.map((p)=>p.mesh);
            const partHits = raycaster.intersectObjects(partMeshes, false);
            if (partHits.length > 0) {
                const hitMesh = partHits[0].object;
                const part = cutParts.find((p)=>p.mesh === hitMesh);
                if (part) {
                    const nextActive = part.id === activeCutPartId ? null : part.id;
                    setActiveCutPartId(nextActive);
                    setStatus('loaded', nextActive ? `Peça selecionada — ${part.name}` : 'Seleção da peça removida');
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$b389eeca$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__m__as__invalidate$3e$__["invalidate"])();
                    return;
                }
            }
        }
        const faceIndex = raycastFace(e.clientX, e.clientY);
        // Clique no vazio com modo neutro → limpar tudo
        if (faceIndex === null) {
            if (!modKeys.current.ctrl && !modKeys.current.alt) {
                const prev = selectedRef.current;
                if (prev.size > 0) pushHistory();
                selectedRef.current = new Set();
                hoveredRef.current = new Set();
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$smart$2d$cut$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["paintFacesDelta"])(modelMesh.geometry, colorAttr, prev, new Set(), 'new');
                setSelectedFaceIndices(new Set());
                setSelectionState('idle');
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$b389eeca$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__m__as__invalidate$3e$__["invalidate"])();
            }
            return;
        }
        const mode = modKeys.current.ctrl ? 'add' : modKeys.current.alt ? 'subtract' : 'new';
        // Grava estado atual no histórico antes de mudar a seleção
        pushHistory();
        setStatus('selecting', 'SmartCut selecionando...');
        // Roda na mesma microtask para não bloquear o frame
        const region = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$smart$2d$cut$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["smartSelect"])(modelMesh.geometry, faceIndex, {
            sharpAngle: sharpAngle ?? 35,
            mode: cutMode
        });
        let next;
        if (mode === 'add') {
            next = new Set(selectedRef.current);
            for (const f of region)next.add(f);
        } else if (mode === 'subtract') {
            next = new Set(selectedRef.current);
            for (const f of region)next.delete(f);
        } else {
            next = region;
        }
        // Pintura incremental (cirúrgica)
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$smart$2d$cut$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["paintFacesDelta"])(modelMesh.geometry, colorAttr, selectedRef.current, next, mode);
        // Limpar hover após commit
        hoveredRef.current = new Set();
        selectedRef.current = next;
        setSelectedFaceIndices(next);
        setSelectionState(next.size > 0 ? 'selected' : 'idle');
        const label = mode === 'add' ? `+${region.size.toLocaleString()} faces adicionadas — ${next.size.toLocaleString()} total` : mode === 'subtract' ? `${region.size.toLocaleString()} faces removidas — ${next.size.toLocaleString()} total` : `${next.size.toLocaleString()} faces selecionadas`;
        setStatus('loaded', label);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$b389eeca$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__m__as__invalidate$3e$__["invalidate"])();
    }, [
        modelMesh,
        activeTool,
        raycastFace,
        setSelectedFaceIndices,
        setSelectionState,
        setStatus,
        sharpAngle,
        cutMode,
        pushHistory,
        allowCutPartSelection,
        cutParts,
        activeCutPartId,
        setActiveCutPartId,
        activePartId,
        camera,
        gl,
        raycaster
    ]);
    // ── Atalhos de teclado ────────────────────────────────────────────────────────
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const { setStatus, registerModelAsPart, setModelInfo, setOriginalGeometry } = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAppStore"].getState();
        const onKeyDown = (e)=>{
            const mod = e.ctrlKey || e.metaKey;
            if (!mod) return;
            const key = e.key.toLowerCase();
            if (key === 'z' && !e.shiftKey) {
                e.preventDefault();
                undo();
            } else if (key === 'z' && e.shiftKey || key === 'y') {
                e.preventDefault();
                redo();
            } else if (key === 'o') {
                // Ctrl+O — abrir arquivo usando a mesma estratégia robusta do botão Abrir
                e.preventDefault();
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$open$2d$file$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["openFile"])().then(async (file)=>{
                    const { setStatus, registerModelAsPart, setModelInfo, setOriginalGeometry } = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAppStore"].getState();
                    setStatus('loading', `Carregando ${file.name}...`);
                    const { mesh, info, wasDecimated } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$model$2d$loader$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["loadModel"])(file);
                    registerModelAsPart(mesh, info.name);
                    setModelInfo(info);
                    setOriginalGeometry(mesh.geometry.clone());
                    setStatus('loaded', `Modelo carregado — ${info.name}${wasDecimated ? ' (decimado para fluidez)' : ''}`);
                }).catch((err)=>{
                    if (err?.name === 'AbortError' || err?.message === 'Cancelled') return;
                    __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAppStore"].getState().setStatus('error', `Erro ao carregar: ${err?.message ?? 'desconhecido'}`);
                });
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return ()=>window.removeEventListener('keydown', onKeyDown);
    }, [
        undo,
        redo
    ]);
    // Pausar hover durante orbita
    const handlePointerDown = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((e)=>{
        isOrbitingRef.current = true;
        orbitStartRef.current = {
            x: e.clientX,
            y: e.clientY
        };
    }, []);
    const handlePointerUp = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((e)=>{
        const start = orbitStartRef.current;
        const moved = start ? Math.hypot(e.clientX - start.x, e.clientY - start.y) > 4 : false;
        if (!moved) isOrbitingRef.current = false;
        else setTimeout(()=>{
            isOrbitingRef.current = false;
        }, 60);
        orbitStartRef.current = null;
    }, []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const canvas = gl.domElement;
        canvas.addEventListener('mousemove', handleMouseMove, {
            passive: true
        });
        canvas.addEventListener('click', handleClick);
        canvas.addEventListener('pointerdown', handlePointerDown, {
            passive: true
        });
        canvas.addEventListener('pointerup', handlePointerUp, {
            passive: true
        });
        return ()=>{
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('click', handleClick);
            canvas.removeEventListener('pointerdown', handlePointerDown);
            canvas.removeEventListener('pointerup', handlePointerUp);
            if (hoverRafRef.current !== null) cancelAnimationFrame(hoverRafRef.current);
        };
    }, [
        gl.domElement,
        handleMouseMove,
        handleClick,
        handlePointerDown,
        handlePointerUp
    ]);
    return null;
}
// ─── Camera auto-fit ──────────────────────────────────────────────────────────
// Fires whenever modelMesh changes (new file loaded) and adjusts the camera +
// OrbitControls target so the model fills the viewport nicely.
function CameraFitter({ controlsRef }) {
    const modelMesh = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAppStore"])((s)=>s.modelMesh);
    const { camera } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$b389eeca$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__C__as__useThree$3e$__["useThree"])();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!modelMesh) return;
        const geo = modelMesh.geometry;
        if (!geo.boundingSphere) geo.computeBoundingSphere();
        const sphere = geo.boundingSphere;
        const radius = Math.max(sphere.radius, 0.001);
        const fov = camera.fov * (Math.PI / 180);
        // Distance so the sphere fits inside the viewport with a bit of padding
        const distance = radius / Math.sin(fov / 2) * 1.6;
        // Isometric-ish angle for a good first look
        const dir = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector3"](0.6, 0.45, 1).normalize();
        camera.position.copy(dir.multiplyScalar(distance));
        camera.near = distance * 0.001;
        camera.far = distance * 100;
        camera.updateProjectionMatrix();
        if (controlsRef.current) {
            controlsRef.current.target.set(0, 0, 0);
            controlsRef.current.update();
        }
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$b389eeca$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__m__as__invalidate$3e$__["invalidate"])();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        modelMesh
    ]);
    return null;
}
function Viewport3D() {
    const { showGrid, showAxes, modelMesh } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAppStore"])();
    const [webglFailed, setWebglFailed] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isDragOver, setIsDragOver] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const controlsRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    // R3F throws the WebGL context creation failure as an *async* unhandled
    // rejection, which React Error Boundaries cannot catch. We intercept it
    // globally so the app does not crash, and flip to the fallback UI instead.
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const handler = (event)=>{
            const msg = event.reason?.message ?? String(event.reason ?? '');
            if (msg.includes('WebGL') || msg.includes('webgl') || msg.includes('WebGLRenderer')) {
                event.preventDefault();
                console.warn('[Viewport3D] WebGL unavailable — showing fallback UI');
                setWebglFailed(true);
            }
        };
        window.addEventListener('unhandledrejection', handler);
        return ()=>window.removeEventListener('unhandledrejection', handler);
    }, []);
    if (webglFailed) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "relative w-full h-full bg-[#060608] flex flex-col items-center justify-center gap-3 text-muted-foreground/50 select-none",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                    viewBox: "0 0 40 40",
                    className: "w-14 h-14 opacity-25",
                    fill: "none",
                    stroke: "currentColor",
                    strokeWidth: "1.5",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                            x: "4",
                            y: "4",
                            width: "32",
                            height: "32",
                            rx: "4"
                        }, void 0, false, {
                            fileName: "[project]/components/viewport/viewport-3d.tsx",
                            lineNumber: 477,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                            x1: "12",
                            y1: "12",
                            x2: "28",
                            y2: "28"
                        }, void 0, false, {
                            fileName: "[project]/components/viewport/viewport-3d.tsx",
                            lineNumber: 478,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                            x1: "28",
                            y1: "12",
                            x2: "12",
                            y2: "28"
                        }, void 0, false, {
                            fileName: "[project]/components/viewport/viewport-3d.tsx",
                            lineNumber: 479,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/viewport/viewport-3d.tsx",
                    lineNumber: 476,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "text-xs font-mono text-center px-8 leading-relaxed",
                    children: [
                        "WebGL não disponível neste dispositivo.",
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                            fileName: "[project]/components/viewport/viewport-3d.tsx",
                            lineNumber: 483,
                            columnNumber: 11
                        }, this),
                        "Ative a aceleração de hardware no navegador e recarregue a página."
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/viewport/viewport-3d.tsx",
                    lineNumber: 481,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/components/viewport/viewport-3d.tsx",
            lineNumber: 475,
            columnNumber: 7
        }, this);
    }
    // ── Drag-and-drop de arquivos 3D ─────────────────────────────────────────────
    const handleDragOver = (e)=>{
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(true);
    };
    const handleDragLeave = (e)=>{
        e.preventDefault();
        setIsDragOver(false);
    };
    const handleDrop = async (e)=>{
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (!file) return;
        const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
        if (![
            'stl',
            'obj',
            'ply',
            'glb',
            'gltf'
        ].includes(ext)) {
            __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAppStore"].getState().setStatus('error', `Formato .${ext} não suportado.`);
            return;
        }
        const { setStatus, registerModelAsPart, setModelInfo, setOriginalGeometry } = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAppStore"].getState();
        setStatus('loading', `Carregando ${file.name}...`);
        try {
            const { mesh, info, wasDecimated } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$model$2d$loader$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["loadModel"])(file);
            registerModelAsPart(mesh, info.name);
            setModelInfo(info);
            setOriginalGeometry(mesh.geometry.clone());
            setStatus('loaded', `Modelo carregado — ${info.name}${wasDecimated ? ' (decimado para fluidez)' : ''}`);
        } catch (err) {
            console.error('[Cortes] Erro no drop:', err);
            setStatus('error', `Erro ao carregar: ${err?.message ?? 'desconhecido'}`);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "relative w-full h-full bg-[#060608]",
        onDragOver: handleDragOver,
        onDragLeave: handleDragLeave,
        onDrop: handleDrop,
        children: [
            isDragOver && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute inset-0 z-50 flex flex-col items-center justify-center pointer-events-none",
                style: {
                    background: 'oklch(0.08 0 0 / 85%)',
                    border: '2px dashed oklch(0.70 0.22 42 / 60%)'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                        viewBox: "0 0 40 40",
                        className: "w-12 h-12 mb-3",
                        fill: "none",
                        stroke: "oklch(0.70 0.22 42)",
                        strokeWidth: "1.5",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                d: "M20 4v20M12 16l8 8 8-8",
                                strokeLinecap: "round",
                                strokeLinejoin: "round"
                            }, void 0, false, {
                                fileName: "[project]/components/viewport/viewport-3d.tsx",
                                lineNumber: 537,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                                x: "4",
                                y: "28",
                                width: "32",
                                height: "8",
                                rx: "2"
                            }, void 0, false, {
                                fileName: "[project]/components/viewport/viewport-3d.tsx",
                                lineNumber: 538,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/viewport/viewport-3d.tsx",
                        lineNumber: 536,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-sm font-mono",
                        style: {
                            color: 'oklch(0.70 0.22 42)'
                        },
                        children: "Soltar para carregar"
                    }, void 0, false, {
                        fileName: "[project]/components/viewport/viewport-3d.tsx",
                        lineNumber: 540,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-xs font-mono text-muted-foreground mt-1",
                        children: "STL · OBJ · PLY · GLB · GLTF"
                    }, void 0, false, {
                        fileName: "[project]/components/viewport/viewport-3d.tsx",
                        lineNumber: 541,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/viewport/viewport-3d.tsx",
                lineNumber: 534,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute inset-0 pointer-events-none",
                style: {
                    backgroundImage: 'linear-gradient(oklch(0.18 0 0 / 30%) 1px, transparent 1px), linear-gradient(90deg, oklch(0.18 0 0 / 30%) 1px, transparent 1px)',
                    backgroundSize: '40px 40px'
                }
            }, void 0, false, {
                fileName: "[project]/components/viewport/viewport-3d.tsx",
                lineNumber: 546,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(WebGLErrorBoundary, {
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$react$2d$three$2d$fiber$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["Canvas"], {
                    frameloop: "demand",
                    // Com frameloop="demand", só renderiza quando invalidate() é chamado.
                    // O CameraFitter e PartMesh chamam invalidate() quando o modelo carrega.
                    camera: {
                        position: [
                            0,
                            0,
                            5
                        ],
                        fov: 45,
                        near: 0.001,
                        far: 2000
                    },
                    gl: {
                        antialias: true,
                        toneMapping: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ACESFilmicToneMapping"],
                        toneMappingExposure: 1.2,
                        outputColorSpace: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SRGBColorSpace"],
                        preserveDrawingBuffer: false,
                        powerPreference: 'high-performance',
                        failIfMajorPerformanceCaveat: false
                    },
                    style: {
                        background: 'transparent'
                    },
                    dpr: [
                        1,
                        2
                    ],
                    onCreated: ({ gl })=>{
                        // Silence any post-creation context-lost events so they don't
                        // propagate as unhandled rejections.
                        gl.domElement.addEventListener('webglcontextlost', (e)=>{
                            e.preventDefault();
                            console.warn('[Viewport3D] WebGL context lost');
                        }, false);
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(FpsCounter, {}, void 0, false, {
                            fileName: "[project]/components/viewport/viewport-3d.tsx",
                            lineNumber: 581,
                            columnNumber: 9
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(CameraFitter, {
                            controlsRef: controlsRef
                        }, void 0, false, {
                            fileName: "[project]/components/viewport/viewport-3d.tsx",
                            lineNumber: 582,
                            columnNumber: 9
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(SmartCutInteraction, {}, void 0, false, {
                            fileName: "[project]/components/viewport/viewport-3d.tsx",
                            lineNumber: 583,
                            columnNumber: 9
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("ambientLight", {
                            intensity: 0.55
                        }, void 0, false, {
                            fileName: "[project]/components/viewport/viewport-3d.tsx",
                            lineNumber: 585,
                            columnNumber: 9
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("directionalLight", {
                            position: [
                                5,
                                8,
                                5
                            ],
                            intensity: 1.2
                        }, void 0, false, {
                            fileName: "[project]/components/viewport/viewport-3d.tsx",
                            lineNumber: 586,
                            columnNumber: 9
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("directionalLight", {
                            position: [
                                -5,
                                3,
                                -5
                            ],
                            intensity: 0.35,
                            color: "#6688aa"
                        }, void 0, false, {
                            fileName: "[project]/components/viewport/viewport-3d.tsx",
                            lineNumber: 587,
                            columnNumber: 9
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("pointLight", {
                            position: [
                                0,
                                -5,
                                0
                            ],
                            intensity: 0.15,
                            color: "#334455"
                        }, void 0, false, {
                            fileName: "[project]/components/viewport/viewport-3d.tsx",
                            lineNumber: 588,
                            columnNumber: 9
                        }, this),
                        showGrid && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$drei$2f$core$2f$Grid$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Grid"], {
                            args: [
                                20,
                                20
                            ],
                            position: [
                                0,
                                -2,
                                0
                            ],
                            cellSize: 0.5,
                            cellThickness: 0.5,
                            cellColor: "#1a1a1a",
                            sectionSize: 2,
                            sectionThickness: 1,
                            sectionColor: "#222222",
                            fadeDistance: 15,
                            fadeStrength: 1,
                            followCamera: false
                        }, void 0, false, {
                            fileName: "[project]/components/viewport/viewport-3d.tsx",
                            lineNumber: 591,
                            columnNumber: 11
                        }, this),
                        showAxes && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$viewport$2f$axes$2d$helper$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AxesHelper"], {}, void 0, false, {
                            fileName: "[project]/components/viewport/viewport-3d.tsx",
                            lineNumber: 606,
                            columnNumber: 22
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Suspense"], {
                            fallback: null,
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$viewport$2f$model$2d$renderer$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ModelRenderer"], {}, void 0, false, {
                                fileName: "[project]/components/viewport/viewport-3d.tsx",
                                lineNumber: 609,
                                columnNumber: 11
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/components/viewport/viewport-3d.tsx",
                            lineNumber: 608,
                            columnNumber: 9
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$drei$2f$core$2f$OrbitControls$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["OrbitControls"], {
                            ref: controlsRef,
                            enableDamping: true,
                            dampingFactor: 0.06,
                            rotateSpeed: 0.65,
                            zoomSpeed: 1.2,
                            panSpeed: 0.85,
                            minDistance: 0.001,
                            maxDistance: 500,
                            enablePan: true,
                            mouseButtons: {
                                LEFT: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MOUSE"].ROTATE,
                                MIDDLE: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MOUSE"].DOLLY,
                                RIGHT: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MOUSE"].PAN
                            },
                            onChange: ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$b389eeca$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__m__as__invalidate$3e$__["invalidate"])()
                        }, void 0, false, {
                            fileName: "[project]/components/viewport/viewport-3d.tsx",
                            lineNumber: 612,
                            columnNumber: 9
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/viewport/viewport-3d.tsx",
                    lineNumber: 556,
                    columnNumber: 7
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/viewport/viewport-3d.tsx",
                lineNumber: 555,
                columnNumber: 7
            }, this),
            !modelMesh && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute inset-0 flex flex-col items-center justify-center pointer-events-none",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex flex-col items-center gap-4",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "w-20 h-20 rounded-lg border border-border/30 flex items-center justify-center",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                viewBox: "0 0 40 40",
                                className: "w-10 h-10 text-muted-foreground/30",
                                fill: "none",
                                stroke: "currentColor",
                                strokeWidth: "1",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("polygon", {
                                        points: "20,4 36,14 36,26 20,36 4,26 4,14"
                                    }, void 0, false, {
                                        fileName: "[project]/components/viewport/viewport-3d.tsx",
                                        lineNumber: 637,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                                        x1: "20",
                                        y1: "4",
                                        x2: "20",
                                        y2: "36"
                                    }, void 0, false, {
                                        fileName: "[project]/components/viewport/viewport-3d.tsx",
                                        lineNumber: 638,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                                        x1: "4",
                                        y1: "14",
                                        x2: "36",
                                        y2: "14"
                                    }, void 0, false, {
                                        fileName: "[project]/components/viewport/viewport-3d.tsx",
                                        lineNumber: 639,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                                        x1: "4",
                                        y1: "26",
                                        x2: "36",
                                        y2: "26"
                                    }, void 0, false, {
                                        fileName: "[project]/components/viewport/viewport-3d.tsx",
                                        lineNumber: 640,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/viewport/viewport-3d.tsx",
                                lineNumber: 636,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/components/viewport/viewport-3d.tsx",
                            lineNumber: 635,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "text-center",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-sm text-muted-foreground/50 font-mono uppercase tracking-widest",
                                    children: "Nenhum modelo carregado"
                                }, void 0, false, {
                                    fileName: "[project]/components/viewport/viewport-3d.tsx",
                                    lineNumber: 644,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-xs text-muted-foreground/30 mt-1",
                                    children: "STL · OBJ · PLY · GLB · GLTF"
                                }, void 0, false, {
                                    fileName: "[project]/components/viewport/viewport-3d.tsx",
                                    lineNumber: 647,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/viewport/viewport-3d.tsx",
                            lineNumber: 643,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/viewport/viewport-3d.tsx",
                    lineNumber: 634,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/viewport/viewport-3d.tsx",
                lineNumber: 633,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(ActiveToolIndicator, {}, void 0, false, {
                fileName: "[project]/components/viewport/viewport-3d.tsx",
                lineNumber: 653,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/viewport/viewport-3d.tsx",
        lineNumber: 526,
        columnNumber: 5
    }, this);
}
// ─── Indicador de modo ────────────────────────────────────────────────────────
function ActiveToolIndicator() {
    const { activeTool, selectionState, selectedFaceIndices, selectionMode } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAppStore"])();
    if (activeTool !== 'select') return null;
    const modeLabel = selectionMode === 'add' ? '+ Adicionar  (Ctrl)' : selectionMode === 'subtract' ? '− Remover  (Alt)' : null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "absolute bottom-16 left-1/2 -translate-x-1/2 pointer-events-none flex flex-col items-center gap-2",
        children: [
            modeLabel && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "glass-panel rounded px-3 py-1 text-xs font-mono tracking-wider",
                style: {
                    color: selectionMode === 'add' ? 'oklch(0.75 0.22 42)' : 'oklch(0.70 0.12 250)',
                    borderColor: selectionMode === 'add' ? 'oklch(0.50 0.20 42 / 60%)' : 'oklch(0.45 0.10 250 / 60%)'
                },
                children: modeLabel
            }, void 0, false, {
                fileName: "[project]/components/viewport/viewport-3d.tsx",
                lineNumber: 670,
                columnNumber: 9
            }, this),
            selectionState === 'selected' && selectedFaceIndices.size > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "animate-fade-in glass-panel rounded-md px-4 py-2 flex items-center gap-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "w-2 h-2 rounded-full",
                        style: {
                            background: 'oklch(0.70 0.22 42)',
                            boxShadow: '0 0 6px oklch(0.70 0.22 42)'
                        }
                    }, void 0, false, {
                        fileName: "[project]/components/viewport/viewport-3d.tsx",
                        lineNumber: 683,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-xs font-mono text-foreground",
                        children: [
                            selectedFaceIndices.size.toLocaleString(),
                            " faces selecionadas"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/viewport/viewport-3d.tsx",
                        lineNumber: 687,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/viewport/viewport-3d.tsx",
                lineNumber: 682,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/viewport/viewport-3d.tsx",
        lineNumber: 668,
        columnNumber: 5
    }, this);
}
}),
"[project]/app/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>NativosCut
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$layout$2f$top$2d$bar$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/layout/top-bar.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$layout$2f$left$2d$panel$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/layout/left-panel.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$layout$2f$right$2d$panel$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/layout/right-panel.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$layout$2f$status$2d$bar$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/layout/status-bar.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$layout$2f$cut$2d$actions$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/layout/cut-actions.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$layout$2f$plane$2d$cut$2d$panel$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/layout/plane-cut-panel.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$layout$2f$auto$2d$split$2d$panel$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/layout/auto-split-panel.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$layout$2f$smart$2d$autocut$2d$panel$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/layout/smart-autocut-panel.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$layout$2f$encaixe$2d$panel$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/layout/encaixe-panel.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$layout$2f$export$2d$panel$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/layout/export-panel.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$viewport$2f$viewport$2d$3d$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/viewport/viewport-3d.tsx [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
;
;
;
;
;
;
;
;
function NativosCut() {
    const [exportOpen, setExportOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        className: "flex flex-col h-dvh w-screen overflow-hidden select-none",
        style: {
            background: 'oklch(0.08 0 0)'
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$layout$2f$top$2d$bar$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TopBar"], {
                onExport: ()=>setExportOpen(true)
            }, void 0, false, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 25,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-1 overflow-hidden relative",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$layout$2f$left$2d$panel$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["LeftPanel"], {}, void 0, false, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 30,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex-1 relative overflow-hidden",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$viewport$2f$viewport$2d$3d$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Viewport3D"], {}, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 34,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$layout$2f$cut$2d$actions$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CutActions"], {}, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 36,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$layout$2f$smart$2d$autocut$2d$panel$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SmartAutoCutPanel"], {}, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 38,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$layout$2f$encaixe$2d$panel$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["EncaixePanel"], {}, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 40,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$layout$2f$plane$2d$cut$2d$panel$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PlaneCutPanel"], {}, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 42,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$layout$2f$auto$2d$split$2d$panel$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AutoSplitPanel"], {}, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 44,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 33,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$layout$2f$right$2d$panel$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["RightPanel"], {}, void 0, false, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 48,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 28,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$layout$2f$status$2d$bar$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["StatusBar"], {}, void 0, false, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 52,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$layout$2f$export$2d$panel$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ExportPanel"], {
                open: exportOpen,
                onClose: ()=>setExportOpen(false)
            }, void 0, false, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 55,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/page.tsx",
        lineNumber: 20,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=_0lw2yxu._.js.map