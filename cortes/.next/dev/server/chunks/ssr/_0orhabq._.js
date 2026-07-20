module.exports = [
"[project]/lib/model-loader.ts [app-ssr] (ecmascript, async loader)", ((__turbopack_context__) => {

__turbopack_context__.v((parentImport) => {
    return Promise.all([
  "server/chunks/ssr/node_modules_three_examples_jsm_0vl471z._.js",
  "server/chunks/ssr/lib_model-loader_ts_1nf0oic._.js"
].map((chunk) => __turbopack_context__.l(chunk))).then(() => {
        return parentImport("[project]/lib/model-loader.ts [app-ssr] (ecmascript)");
    });
});
}),
"[project]/node_modules/@react-three/fiber/dist/react-three-fiber.esm.js [app-ssr] (ecmascript, async loader)", ((__turbopack_context__) => {

__turbopack_context__.v((parentImport) => {
    return Promise.all([
  "server/chunks/ssr/node_modules_three_build_three_module_079k5cw.js",
  "server/chunks/ssr/node_modules_@react-three_fiber_dist_20hy-mo._.js",
  "server/chunks/ssr/node_modules_1yckgvy._.js"
].map((chunk) => __turbopack_context__.l(chunk))).then(() => {
        return parentImport("[project]/node_modules/@react-three/fiber/dist/react-three-fiber.esm.js [app-ssr] (ecmascript)");
    });
});
}),
];