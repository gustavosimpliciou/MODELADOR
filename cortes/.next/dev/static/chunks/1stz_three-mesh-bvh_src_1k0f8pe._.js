(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/math/SeparatingAxisBounds.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SeparatingAxisBounds",
    ()=>SeparatingAxisBounds,
    "areIntersecting",
    ()=>areIntersecting
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/three@0.185.1/node_modules/three/build/three.core.js [app-client] (ecmascript)");
;
class SeparatingAxisBounds {
    constructor(){
        this.min = Infinity;
        this.max = -Infinity;
    }
    setFromPointsField(points, field) {
        let min = Infinity;
        let max = -Infinity;
        for(let i = 0, l = points.length; i < l; i++){
            const p = points[i];
            const val = p[field];
            min = val < min ? val : min;
            max = val > max ? val : max;
        }
        this.min = min;
        this.max = max;
    }
    setFromPoints(axis, points) {
        let min = Infinity;
        let max = -Infinity;
        for(let i = 0, l = points.length; i < l; i++){
            const p = points[i];
            const val = axis.dot(p);
            min = val < min ? val : min;
            max = val > max ? val : max;
        }
        this.min = min;
        this.max = max;
    }
    isSeparated(other) {
        return this.min > other.max || other.min > this.max;
    }
}
SeparatingAxisBounds.prototype.setFromBox = function() {
    const p = /* @__PURE__ */ new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"]();
    return function setFromBox(axis, box) {
        const boxMin = box.min;
        const boxMax = box.max;
        let min = Infinity;
        let max = -Infinity;
        for(let x = 0; x <= 1; x++){
            for(let y = 0; y <= 1; y++){
                for(let z = 0; z <= 1; z++){
                    p.x = boxMin.x * x + boxMax.x * (1 - x);
                    p.y = boxMin.y * y + boxMax.y * (1 - y);
                    p.z = boxMin.z * z + boxMax.z * (1 - z);
                    const val = axis.dot(p);
                    min = Math.min(val, min);
                    max = Math.max(val, max);
                }
            }
        }
        this.min = min;
        this.max = max;
    };
}();
const areIntersecting = function() {
    const cacheSatBounds = /* @__PURE__ */ new SeparatingAxisBounds();
    return function areIntersecting(shape1, shape2) {
        const points1 = shape1.points;
        const satAxes1 = shape1.satAxes;
        const satBounds1 = shape1.satBounds;
        const points2 = shape2.points;
        const satAxes2 = shape2.satAxes;
        const satBounds2 = shape2.satBounds;
        // check axes of the first shape
        for(let i = 0; i < 3; i++){
            const sb = satBounds1[i];
            const sa = satAxes1[i];
            cacheSatBounds.setFromPoints(sa, points2);
            if (sb.isSeparated(cacheSatBounds)) return false;
        }
        // check axes of the second shape
        for(let i = 0; i < 3; i++){
            const sb = satBounds2[i];
            const sa = satAxes2[i];
            cacheSatBounds.setFromPoints(sa, points1);
            if (sb.isSeparated(cacheSatBounds)) return false;
        }
    };
}();
}),
"[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/math/MathUtilities.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "closestPointLineToLine",
    ()=>closestPointLineToLine,
    "closestPointsSegmentToSegment",
    ()=>closestPointsSegmentToSegment,
    "sphereIntersectTriangle",
    ()=>sphereIntersectTriangle
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/three@0.185.1/node_modules/three/build/three.core.js [app-client] (ecmascript)");
;
const closestPointLineToLine = function() {
    // https://github.com/juj/MathGeoLib/blob/master/src/Geometry/Line.cpp#L56
    const dir1 = /* @__PURE__ */ new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"]();
    const dir2 = /* @__PURE__ */ new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"]();
    const v02 = /* @__PURE__ */ new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"]();
    return function closestPointLineToLine(l1, l2, result) {
        const v0 = l1.start;
        const v10 = dir1;
        const v2 = l2.start;
        const v32 = dir2;
        v02.subVectors(v0, v2);
        dir1.subVectors(l1.end, l1.start);
        dir2.subVectors(l2.end, l2.start);
        // float d0232 = v02.Dot(v32);
        const d0232 = v02.dot(v32);
        // float d3210 = v32.Dot(v10);
        const d3210 = v32.dot(v10);
        // float d3232 = v32.Dot(v32);
        const d3232 = v32.dot(v32);
        // float d0210 = v02.Dot(v10);
        const d0210 = v02.dot(v10);
        // float d1010 = v10.Dot(v10);
        const d1010 = v10.dot(v10);
        // float denom = d1010*d3232 - d3210*d3210;
        const denom = d1010 * d3232 - d3210 * d3210;
        let d, d2;
        if (denom !== 0) {
            d = (d0232 * d3210 - d0210 * d3232) / denom;
        } else {
            d = 0;
        }
        d2 = (d0232 + d * d3210) / d3232;
        result.x = d;
        result.y = d2;
    };
}();
const closestPointsSegmentToSegment = function() {
    // https://github.com/juj/MathGeoLib/blob/master/src/Geometry/LineSegment.cpp#L187
    const paramResult = /* @__PURE__ */ new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector2"]();
    const temp1 = /* @__PURE__ */ new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"]();
    const temp2 = /* @__PURE__ */ new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"]();
    return function closestPointsSegmentToSegment(l1, l2, target1, target2) {
        closestPointLineToLine(l1, l2, paramResult);
        let d = paramResult.x;
        let d2 = paramResult.y;
        if (d >= 0 && d <= 1 && d2 >= 0 && d2 <= 1) {
            l1.at(d, target1);
            l2.at(d2, target2);
            return;
        } else if (d >= 0 && d <= 1) {
            // Only d2 is out of bounds.
            if (d2 < 0) {
                l2.at(0, target2);
            } else {
                l2.at(1, target2);
            }
            l1.closestPointToPoint(target2, true, target1);
            return;
        } else if (d2 >= 0 && d2 <= 1) {
            // Only d is out of bounds.
            if (d < 0) {
                l1.at(0, target1);
            } else {
                l1.at(1, target1);
            }
            l2.closestPointToPoint(target1, true, target2);
            return;
        } else {
            // Both u and u2 are out of bounds.
            let p;
            if (d < 0) {
                p = l1.start;
            } else {
                p = l1.end;
            }
            let p2;
            if (d2 < 0) {
                p2 = l2.start;
            } else {
                p2 = l2.end;
            }
            const closestPoint = temp1;
            const closestPoint2 = temp2;
            l1.closestPointToPoint(p2, true, temp1);
            l2.closestPointToPoint(p, true, temp2);
            if (closestPoint.distanceToSquared(p2) <= closestPoint2.distanceToSquared(p)) {
                target1.copy(closestPoint);
                target2.copy(p2);
                return;
            } else {
                target1.copy(p);
                target2.copy(closestPoint2);
                return;
            }
        }
    };
}();
const sphereIntersectTriangle = function() {
    // https://stackoverflow.com/questions/34043955/detect-collision-between-sphere-and-triangle-in-three-js
    const closestPointTemp = /* @__PURE__ */ new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"]();
    const projectedPointTemp = /* @__PURE__ */ new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"]();
    const planeTemp = /* @__PURE__ */ new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Plane"]();
    const lineTemp = /* @__PURE__ */ new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Line3"]();
    return function sphereIntersectTriangle(sphere, triangle) {
        const { radius, center } = sphere;
        const { a, b, c } = triangle;
        // phase 1
        lineTemp.start = a;
        lineTemp.end = b;
        const closestPoint1 = lineTemp.closestPointToPoint(center, true, closestPointTemp);
        if (closestPoint1.distanceTo(center) <= radius) return true;
        lineTemp.start = a;
        lineTemp.end = c;
        const closestPoint2 = lineTemp.closestPointToPoint(center, true, closestPointTemp);
        if (closestPoint2.distanceTo(center) <= radius) return true;
        lineTemp.start = b;
        lineTemp.end = c;
        const closestPoint3 = lineTemp.closestPointToPoint(center, true, closestPointTemp);
        if (closestPoint3.distanceTo(center) <= radius) return true;
        // phase 2
        const plane = triangle.getPlane(planeTemp);
        const dp = Math.abs(plane.distanceToPoint(center));
        if (dp <= radius) {
            const pp = plane.projectPoint(center, projectedPointTemp);
            const cp = triangle.containsPoint(pp);
            if (cp) return true;
        }
        return false;
    };
}();
}),
"[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/math/ExtendedTriangle.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ExtendedTriangle",
    ()=>ExtendedTriangle
]);
/** @import { Sphere } from 'three' */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/three@0.185.1/node_modules/three/build/three.core.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$math$2f$SeparatingAxisBounds$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/math/SeparatingAxisBounds.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$math$2f$MathUtilities$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/math/MathUtilities.js [app-client] (ecmascript)");
;
;
;
const componentKeys = [
    'x',
    'y',
    'z'
];
const ZERO_EPSILON = 1e-15;
const ZERO_EPSILON_SQR = ZERO_EPSILON * ZERO_EPSILON;
function isNearZero(value) {
    return Math.abs(value) < ZERO_EPSILON;
}
class ExtendedTriangle extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Triangle"] {
    constructor(...args){
        super(...args);
        this.isExtendedTriangle = true;
        this.satAxes = new Array(4).fill().map(()=>new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"]());
        this.satBounds = new Array(4).fill().map(()=>new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$math$2f$SeparatingAxisBounds$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SeparatingAxisBounds"]());
        this.points = [
            this.a,
            this.b,
            this.c
        ];
        this.plane = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Plane"]();
        this.isDegenerateIntoSegment = false;
        this.isDegenerateIntoPoint = false;
        this.degenerateSegment = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Line3"]();
        /**
		 * Indicates that the triangle fields have changed so cached variables to accelerate other
		 * function execution can be updated. Must be set to true after modifying the triangle
		 * `a`, `b`, `c` fields.
		 * @type {boolean}
		 */ this.needsUpdate = true;
    }
    /**
	 * Returns whether the triangle intersects the given sphere.
	 * @param {Sphere} sphere
	 * @returns {boolean}
	 */ intersectsSphere(sphere) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$math$2f$MathUtilities$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["sphereIntersectTriangle"])(sphere, this);
    }
    update() {
        const a = this.a;
        const b = this.b;
        const c = this.c;
        const points = this.points;
        const satAxes = this.satAxes;
        const satBounds = this.satBounds;
        const axis0 = satAxes[0];
        const sab0 = satBounds[0];
        this.getNormal(axis0);
        sab0.setFromPoints(axis0, points);
        const axis1 = satAxes[1];
        const sab1 = satBounds[1];
        axis1.subVectors(a, b);
        sab1.setFromPoints(axis1, points);
        const axis2 = satAxes[2];
        const sab2 = satBounds[2];
        axis2.subVectors(b, c);
        sab2.setFromPoints(axis2, points);
        const axis3 = satAxes[3];
        const sab3 = satBounds[3];
        axis3.subVectors(c, a);
        sab3.setFromPoints(axis3, points);
        const lengthAB = axis1.length();
        const lengthBC = axis2.length();
        const lengthCA = axis3.length();
        this.isDegenerateIntoPoint = false;
        this.isDegenerateIntoSegment = false;
        if (lengthAB < ZERO_EPSILON) {
            if (lengthBC < ZERO_EPSILON || lengthCA < ZERO_EPSILON) {
                this.isDegenerateIntoPoint = true;
            } else {
                this.isDegenerateIntoSegment = true;
                this.degenerateSegment.start.copy(a);
                this.degenerateSegment.end.copy(c);
            }
        } else if (lengthBC < ZERO_EPSILON) {
            if (lengthCA < ZERO_EPSILON) {
                this.isDegenerateIntoPoint = true;
            } else {
                this.isDegenerateIntoSegment = true;
                this.degenerateSegment.start.copy(b);
                this.degenerateSegment.end.copy(a);
            }
        } else if (lengthCA < ZERO_EPSILON) {
            this.isDegenerateIntoSegment = true;
            this.degenerateSegment.start.copy(c);
            this.degenerateSegment.end.copy(b);
        }
        this.plane.setFromNormalAndCoplanarPoint(axis0, a);
        this.needsUpdate = false;
    }
}
/**
 * Returns the distance to the provided line segment. `target1` and `target2` are set to the
 * closest points on the triangle and segment respectively.
 * @function
 * @param {Line3} segment
 * @param {Vector3} [target1]
 * @param {Vector3} [target2]
 * @returns {number}
 */ ExtendedTriangle.prototype.closestPointToSegment = function() {
    const point1 = /* @__PURE__ */ new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"]();
    const point2 = /* @__PURE__ */ new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"]();
    const edge = /* @__PURE__ */ new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Line3"]();
    return function distanceToSegment(segment, target1 = null, target2 = null) {
        const { start, end } = segment;
        const points = this.points;
        let distSq;
        let closestDistanceSq = Infinity;
        // check the triangle edges
        for(let i = 0; i < 3; i++){
            const nexti = (i + 1) % 3;
            edge.start.copy(points[i]);
            edge.end.copy(points[nexti]);
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$math$2f$MathUtilities$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["closestPointsSegmentToSegment"])(edge, segment, point1, point2);
            distSq = point1.distanceToSquared(point2);
            if (distSq < closestDistanceSq) {
                closestDistanceSq = distSq;
                if (target1) target1.copy(point1);
                if (target2) target2.copy(point2);
            }
        }
        // check end points
        this.closestPointToPoint(start, point1);
        distSq = start.distanceToSquared(point1);
        if (distSq < closestDistanceSq) {
            closestDistanceSq = distSq;
            if (target1) target1.copy(point1);
            if (target2) target2.copy(start);
        }
        this.closestPointToPoint(end, point1);
        distSq = end.distanceToSquared(point1);
        if (distSq < closestDistanceSq) {
            closestDistanceSq = distSq;
            if (target1) target1.copy(point1);
            if (target2) target2.copy(end);
        }
        return Math.sqrt(closestDistanceSq);
    };
}();
/**
 * Returns whether the triangles intersect. `target` is set to the line segment representing
 * the intersection.
 * @function
 * @param {Triangle} other
 * @param {Line3} [target]
 * @param {boolean} [suppressLog=false]
 * @returns {boolean}
 */ ExtendedTriangle.prototype.intersectsTriangle = function() {
    const saTri2 = /* @__PURE__ */ new ExtendedTriangle();
    const cachedSatBounds = /* @__PURE__ */ new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$math$2f$SeparatingAxisBounds$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SeparatingAxisBounds"]();
    const cachedSatBounds2 = /* @__PURE__ */ new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$math$2f$SeparatingAxisBounds$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SeparatingAxisBounds"]();
    const tmpVec = /* @__PURE__ */ new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"]();
    const dir1 = /* @__PURE__ */ new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"]();
    const dir2 = /* @__PURE__ */ new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"]();
    const tempDir = /* @__PURE__ */ new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"]();
    const edge1 = /* @__PURE__ */ new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Line3"]();
    const edge2 = /* @__PURE__ */ new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Line3"]();
    const tempPoint = /* @__PURE__ */ new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"]();
    const bounds1 = /* @__PURE__ */ new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector2"]();
    const bounds2 = /* @__PURE__ */ new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector2"]();
    function coplanarIntersectsTriangle(self, other, target, suppressLog) {
        // Perform separating axis intersection test only for coplanar triangles
        // There should be at least one non-degenerate triangle when calling this
        // Otherwise we won't know the plane normal
        const planeNormal = tmpVec;
        if (!self.isDegenerateIntoPoint && !self.isDegenerateIntoSegment) {
            planeNormal.copy(self.plane.normal);
        } else {
            planeNormal.copy(other.plane.normal);
        }
        const satBounds1 = self.satBounds;
        const satAxes1 = self.satAxes;
        for(let i = 1; i < 4; i++){
            const sb = satBounds1[i];
            const sa = satAxes1[i];
            cachedSatBounds.setFromPoints(sa, other.points);
            if (sb.isSeparated(cachedSatBounds)) return false;
            tempDir.copy(planeNormal).cross(sa);
            cachedSatBounds.setFromPoints(tempDir, self.points);
            cachedSatBounds2.setFromPoints(tempDir, other.points);
            if (cachedSatBounds.isSeparated(cachedSatBounds2)) return false;
        }
        const satBounds2 = other.satBounds;
        const satAxes2 = other.satAxes;
        for(let i = 1; i < 4; i++){
            const sb = satBounds2[i];
            const sa = satAxes2[i];
            cachedSatBounds.setFromPoints(sa, self.points);
            if (sb.isSeparated(cachedSatBounds)) return false;
            tempDir.crossVectors(planeNormal, sa);
            cachedSatBounds.setFromPoints(tempDir, self.points);
            cachedSatBounds2.setFromPoints(tempDir, other.points);
            if (cachedSatBounds.isSeparated(cachedSatBounds2)) return false;
        }
        if (target) {
            // TODO find two points that intersect on the edges and make that the result
            if (!suppressLog) {
                console.warn('ExtendedTriangle.intersectsTriangle: Triangles are coplanar which does not support an output edge. Setting edge to 0, 0, 0.');
            }
            target.start.set(0, 0, 0);
            target.end.set(0, 0, 0);
        }
        return true;
    }
    function findSingleBounds(a, b, c, aProj, bProj, cProj, aDist, bDist, cDist, bounds, edge) {
        let t = aDist / (aDist - bDist);
        bounds.x = aProj + (bProj - aProj) * t;
        edge.start.subVectors(b, a).multiplyScalar(t).add(a);
        t = aDist / (aDist - cDist);
        bounds.y = aProj + (cProj - aProj) * t;
        edge.end.subVectors(c, a).multiplyScalar(t).add(a);
    }
    /**
	 * Calculates intersection segment of a triangle with intersection line.
	 * Intersection line is snapped to its biggest component.
	 * And triangle points are passed as a projection on that component.
	 * @returns {boolean} whether this is a coplanar case or not
	 */ function findIntersectionLineBounds(self, aProj, bProj, cProj, abDist, acDist, aDist, bDist, cDist, bounds, edge) {
        if (abDist > 0) {
            // then bcDist < 0
            findSingleBounds(self.c, self.a, self.b, cProj, aProj, bProj, cDist, aDist, bDist, bounds, edge);
        } else if (acDist > 0) {
            findSingleBounds(self.b, self.a, self.c, bProj, aProj, cProj, bDist, aDist, cDist, bounds, edge);
        } else if (bDist * cDist > 0 || aDist != 0) {
            findSingleBounds(self.a, self.b, self.c, aProj, bProj, cProj, aDist, bDist, cDist, bounds, edge);
        } else if (bDist != 0) {
            findSingleBounds(self.b, self.a, self.c, bProj, aProj, cProj, bDist, aDist, cDist, bounds, edge);
        } else if (cDist != 0) {
            findSingleBounds(self.c, self.a, self.b, cProj, aProj, bProj, cDist, aDist, bDist, bounds, edge);
        } else {
            return true;
        }
        return false;
    }
    function intersectTriangleSegment(triangle, degenerateTriangle, target, suppressLog) {
        const segment = degenerateTriangle.degenerateSegment;
        const startDist = triangle.plane.distanceToPoint(segment.start);
        const endDist = triangle.plane.distanceToPoint(segment.end);
        if (isNearZero(startDist)) {
            if (isNearZero(endDist)) {
                return coplanarIntersectsTriangle(triangle, degenerateTriangle, target, suppressLog);
            } else {
                // Is this fine to modify target even if there might be no intersection?
                if (target) {
                    target.start.copy(segment.start);
                    target.end.copy(segment.start);
                }
                return triangle.containsPoint(segment.start);
            }
        } else if (isNearZero(endDist)) {
            if (target) {
                target.start.copy(segment.end);
                target.end.copy(segment.end);
            }
            return triangle.containsPoint(segment.end);
        } else {
            if (triangle.plane.intersectLine(segment, tmpVec) != null) {
                if (target) {
                    target.start.copy(tmpVec);
                    target.end.copy(tmpVec);
                }
                return triangle.containsPoint(tmpVec);
            } else {
                return false;
            }
        }
    }
    function intersectTrianglePoint(triangle, degenerateTriangle, target) {
        const point = degenerateTriangle.a;
        if (isNearZero(triangle.plane.distanceToPoint(point)) && triangle.containsPoint(point)) {
            if (target) {
                target.start.copy(point);
                target.end.copy(point);
            }
            return true;
        } else {
            return false;
        }
    }
    function intersectSegmentPoint(segmentTri, pointTri, target) {
        const segment = segmentTri.degenerateSegment;
        const point = pointTri.a;
        segment.closestPointToPoint(point, true, tmpVec);
        if (point.distanceToSquared(tmpVec) < ZERO_EPSILON_SQR) {
            if (target) {
                target.start.copy(point);
                target.end.copy(point);
            }
            return true;
        } else {
            return false;
        }
    }
    function handleDegenerateCases(self, other, target, suppressLog) {
        if (self.isDegenerateIntoSegment) {
            if (other.isDegenerateIntoSegment) {
                // TODO: replace with Line.distanceSqToLine3 after r179
                const segment1 = self.degenerateSegment;
                const segment2 = other.degenerateSegment;
                const delta1 = dir1;
                const delta2 = dir2;
                segment1.delta(delta1);
                segment2.delta(delta2);
                const startDelta = tmpVec.subVectors(segment2.start, segment1.start);
                const denom = delta1.x * delta2.y - delta1.y * delta2.x;
                if (isNearZero(denom)) {
                    return false;
                }
                const t = (startDelta.x * delta2.y - startDelta.y * delta2.x) / denom;
                const u = -(delta1.x * startDelta.y - delta1.y * startDelta.x) / denom;
                if (t < 0 || t > 1 || u < 0 || u > 1) {
                    return false;
                }
                const z1 = segment1.start.z + delta1.z * t;
                const z2 = segment2.start.z + delta2.z * u;
                if (isNearZero(z1 - z2)) {
                    if (target) {
                        target.start.copy(segment1.start).addScaledVector(delta1, t);
                        target.end.copy(segment1.start).addScaledVector(delta1, t);
                    }
                    return true;
                } else {
                    return false;
                }
            } else if (other.isDegenerateIntoPoint) {
                return intersectSegmentPoint(self, other, target);
            } else {
                return intersectTriangleSegment(other, self, target, suppressLog);
            }
        } else if (self.isDegenerateIntoPoint) {
            if (other.isDegenerateIntoPoint) {
                if (other.a.distanceToSquared(self.a) < ZERO_EPSILON_SQR) {
                    if (target) {
                        target.start.copy(self.a);
                        target.end.copy(self.a);
                    }
                    return true;
                } else {
                    return false;
                }
            } else if (other.isDegenerateIntoSegment) {
                return intersectSegmentPoint(other, self, target);
            } else {
                return intersectTrianglePoint(other, self, target);
            }
        } else {
            if (other.isDegenerateIntoPoint) {
                return intersectTrianglePoint(self, other, target);
            } else if (other.isDegenerateIntoSegment) {
                return intersectTriangleSegment(self, other, target, suppressLog);
            } /* else this is a general triangle-traingle case, so return undefined */ 
        }
    }
    /* TODO: If the triangles are coplanar and intersecting the target is nonsensical. It should at least
	 * be a line contained by both triangles if not a different special case somehow represented in the return result.
	 *
	 * General triangle intersection code is based on Moller's algorithm from here: https://web.stanford.edu/class/cs277/resources/papers/Moller1997b.pdf
	 * Reference implementation from here: https://github.com/erich666/jgt-code/blob/master/Volume_08/Number_1/Shen2003/tri_tri_test/include/Moller97.c#L570
	 * All degeneracies are handled before the general algorithm.
	 * Coplanar check is different from Moller's and based on SAT tests.
	 */ return function intersectsTriangle(other, target = null, suppressLog = false) {
        if (this.needsUpdate) {
            this.update();
        }
        if (!other.isExtendedTriangle) {
            saTri2.copy(other);
            saTri2.update();
            other = saTri2;
        } else if (other.needsUpdate) {
            other.update();
        }
        const res = handleDegenerateCases(this, other, target, suppressLog);
        if (res !== undefined) {
            return res;
        }
        const plane1 = this.plane;
        const plane2 = other.plane;
        let a1Dist = plane2.distanceToPoint(this.a);
        let b1Dist = plane2.distanceToPoint(this.b);
        let c1Dist = plane2.distanceToPoint(this.c);
        if (isNearZero(a1Dist)) a1Dist = 0;
        if (isNearZero(b1Dist)) b1Dist = 0;
        if (isNearZero(c1Dist)) c1Dist = 0;
        const a1b1Dist = a1Dist * b1Dist;
        const a1c1Dist = a1Dist * c1Dist;
        if (a1b1Dist > 0 && a1c1Dist > 0) {
            return false;
        }
        let a2Dist = plane1.distanceToPoint(other.a);
        let b2Dist = plane1.distanceToPoint(other.b);
        let c2Dist = plane1.distanceToPoint(other.c);
        if (isNearZero(a2Dist)) a2Dist = 0;
        if (isNearZero(b2Dist)) b2Dist = 0;
        if (isNearZero(c2Dist)) c2Dist = 0;
        const a2b2Dist = a2Dist * b2Dist;
        const a2c2Dist = a2Dist * c2Dist;
        if (a2b2Dist > 0 && a2c2Dist > 0) {
            return false;
        }
        dir1.copy(plane1.normal);
        dir2.copy(plane2.normal);
        const intersectionLine = dir1.cross(dir2);
        let componentIndex = 0;
        let maxComponent = Math.abs(intersectionLine.x);
        const comp1 = Math.abs(intersectionLine.y);
        if (comp1 > maxComponent) {
            maxComponent = comp1;
            componentIndex = 1;
        }
        const comp2 = Math.abs(intersectionLine.z);
        if (comp2 > maxComponent) {
            componentIndex = 2;
        }
        const key = componentKeys[componentIndex];
        const a1Proj = this.a[key];
        const b1Proj = this.b[key];
        const c1Proj = this.c[key];
        const a2Proj = other.a[key];
        const b2Proj = other.b[key];
        const c2Proj = other.c[key];
        if (findIntersectionLineBounds(this, a1Proj, b1Proj, c1Proj, a1b1Dist, a1c1Dist, a1Dist, b1Dist, c1Dist, bounds1, edge1)) {
            return coplanarIntersectsTriangle(this, other, target, suppressLog);
        }
        if (findIntersectionLineBounds(other, a2Proj, b2Proj, c2Proj, a2b2Dist, a2c2Dist, a2Dist, b2Dist, c2Dist, bounds2, edge2)) {
            return coplanarIntersectsTriangle(this, other, target, suppressLog);
        }
        if (bounds1.y < bounds1.x) {
            const tmp = bounds1.y;
            bounds1.y = bounds1.x;
            bounds1.x = tmp;
            tempPoint.copy(edge1.start);
            edge1.start.copy(edge1.end);
            edge1.end.copy(tempPoint);
        }
        if (bounds2.y < bounds2.x) {
            const tmp = bounds2.y;
            bounds2.y = bounds2.x;
            bounds2.x = tmp;
            tempPoint.copy(edge2.start);
            edge2.start.copy(edge2.end);
            edge2.end.copy(tempPoint);
        }
        if (bounds1.y < bounds2.x || bounds2.y < bounds1.x) {
            return false;
        }
        if (target) {
            if (bounds2.x > bounds1.x) {
                target.start.copy(edge2.start);
            } else {
                target.start.copy(edge1.start);
            }
            if (bounds2.y < bounds1.y) {
                target.end.copy(edge2.end);
            } else {
                target.end.copy(edge1.end);
            }
        }
        return true;
    };
}();
/**
 * Returns the distance to the provided point.
 * @function
 * @param {Vector3} point
 * @returns {number}
 */ ExtendedTriangle.prototype.distanceToPoint = function() {
    const target = /* @__PURE__ */ new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"]();
    return function distanceToPoint(point) {
        this.closestPointToPoint(point, target);
        return point.distanceTo(target);
    };
}();
/**
 * Returns the distance to the provided triangle.
 * @function
 * @param {Triangle} other
 * @param {Vector3} [target1]
 * @param {Vector3} [target2]
 * @returns {number}
 */ ExtendedTriangle.prototype.distanceToTriangle = function() {
    const point = /* @__PURE__ */ new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"]();
    const point2 = /* @__PURE__ */ new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"]();
    const cornerFields = [
        'a',
        'b',
        'c'
    ];
    const line1 = /* @__PURE__ */ new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Line3"]();
    const line2 = /* @__PURE__ */ new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Line3"]();
    return function distanceToTriangle(other, target1 = null, target2 = null) {
        const lineTarget = target1 || target2 ? line1 : null;
        // `intersectsTriangle` returns a zero-length segment for coplanar
        // intersecting triangles, which is fine for our purposes here. We
        // don't need the segment itself in this function. So we can suppress
        // the warning about coplanar triangles.
        if (this.intersectsTriangle(other, lineTarget, true)) {
            if (target1 || target2) {
                if (target1) lineTarget.getCenter(target1);
                if (target2) lineTarget.getCenter(target2);
            }
            return 0;
        }
        let closestDistanceSq = Infinity;
        // check all point distances
        for(let i = 0; i < 3; i++){
            let dist;
            const field = cornerFields[i];
            const otherVec = other[field];
            this.closestPointToPoint(otherVec, point);
            dist = otherVec.distanceToSquared(point);
            if (dist < closestDistanceSq) {
                closestDistanceSq = dist;
                if (target1) target1.copy(point);
                if (target2) target2.copy(otherVec);
            }
            const thisVec = this[field];
            other.closestPointToPoint(thisVec, point);
            dist = thisVec.distanceToSquared(point);
            if (dist < closestDistanceSq) {
                closestDistanceSq = dist;
                if (target1) target1.copy(thisVec);
                if (target2) target2.copy(point);
            }
        }
        for(let i = 0; i < 3; i++){
            const f11 = cornerFields[i];
            const f12 = cornerFields[(i + 1) % 3];
            line1.set(this[f11], this[f12]);
            for(let i2 = 0; i2 < 3; i2++){
                const f21 = cornerFields[i2];
                const f22 = cornerFields[(i2 + 1) % 3];
                line2.set(other[f21], other[f22]);
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$math$2f$MathUtilities$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["closestPointsSegmentToSegment"])(line1, line2, point, point2);
                const dist = point.distanceToSquared(point2);
                if (dist < closestDistanceSq) {
                    closestDistanceSq = dist;
                    if (target1) target1.copy(point);
                    if (target2) target2.copy(point2);
                }
            }
        }
        return Math.sqrt(closestDistanceSq);
    };
}();
}),
"[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/core/Constants.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Split strategy constants
/**
 * Option for splitting each BVH node down the center of the longest axis of the bounds.
 *
 * This is the fastest construction option and will yield a good, performant bounds.
 */ __turbopack_context__.s([
    "AVERAGE",
    ()=>AVERAGE,
    "BYTES_PER_NODE",
    ()=>BYTES_PER_NODE,
    "CENTER",
    ()=>CENTER,
    "CONTAINED",
    ()=>CONTAINED,
    "DEFAULT_OPTIONS",
    ()=>DEFAULT_OPTIONS,
    "FLOAT32_EPSILON",
    ()=>FLOAT32_EPSILON,
    "INTERSECTED",
    ()=>INTERSECTED,
    "IS_LEAFNODE_FLAG",
    ()=>IS_LEAFNODE_FLAG,
    "LEAFNODE_MASK_32",
    ()=>LEAFNODE_MASK_32,
    "NOT_INTERSECTED",
    ()=>NOT_INTERSECTED,
    "PRIMITIVE_INTERSECT_COST",
    ()=>PRIMITIVE_INTERSECT_COST,
    "SAH",
    ()=>SAH,
    "SKIP_GENERATION",
    ()=>SKIP_GENERATION,
    "TRAVERSAL_COST",
    ()=>TRAVERSAL_COST,
    "UINT32_PER_NODE",
    ()=>UINT32_PER_NODE
]);
const CENTER = 0;
const AVERAGE = 1;
const SAH = 2;
const NOT_INTERSECTED = 0;
const INTERSECTED = 1;
const CONTAINED = 2;
const PRIMITIVE_INTERSECT_COST = 1.25;
const TRAVERSAL_COST = 1;
const BYTES_PER_NODE = 6 * 4 + 4 + 4;
const UINT32_PER_NODE = BYTES_PER_NODE / 4;
const IS_LEAFNODE_FLAG = 0xFFFF;
const LEAFNODE_MASK_32 = IS_LEAFNODE_FLAG << 16;
const FLOAT32_EPSILON = Math.pow(2, -24);
const SKIP_GENERATION = Symbol('SKIP_GENERATION');
const DEFAULT_OPTIONS = {
    strategy: CENTER,
    maxDepth: 40,
    maxLeafSize: 10,
    useSharedArrayBuffer: false,
    setBoundingBox: true,
    onProgress: null,
    indirect: false,
    verbose: true,
    range: null,
    [SKIP_GENERATION]: false
};
}),
"[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/math/OrientedBox.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "OrientedBox",
    ()=>OrientedBox
]);
/** @import { Box3, Triangle } from 'three' */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/three@0.185.1/node_modules/three/build/three.core.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$math$2f$SeparatingAxisBounds$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/math/SeparatingAxisBounds.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$math$2f$ExtendedTriangle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/math/ExtendedTriangle.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$math$2f$MathUtilities$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/math/MathUtilities.js [app-client] (ecmascript)");
;
;
;
;
class OrientedBox {
    constructor(min, max, matrix){
        this.isOrientedBox = true;
        /** @type {Vector3} */ this.min = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"]();
        /** @type {Vector3} */ this.max = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"]();
        /**
		 * Matrix transformation applied to the box.
		 * @type {Matrix4}
		 */ this.matrix = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Matrix4"]();
        this.invMatrix = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Matrix4"]();
        this.points = new Array(8).fill().map(()=>new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"]());
        this.satAxes = new Array(3).fill().map(()=>new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"]());
        this.satBounds = new Array(3).fill().map(()=>new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$math$2f$SeparatingAxisBounds$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SeparatingAxisBounds"]());
        this.alignedSatBounds = new Array(3).fill().map(()=>new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$math$2f$SeparatingAxisBounds$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SeparatingAxisBounds"]());
        /**
		 * Indicates that the bounding box fields have changed so cached variables to accelerate
		 * other function execution can be updated. Must be set to true after modifying the
		 * oriented box `min`, `max`, `matrix` fields.
		 * @type {boolean}
		 */ this.needsUpdate = false;
        if (min) this.min.copy(min);
        if (max) this.max.copy(max);
        if (matrix) this.matrix.copy(matrix);
    }
    /**
	 * Sets the oriented box parameters.
	 * @param {Vector3} min
	 * @param {Vector3} max
	 * @param {Matrix4} matrix
	 */ set(min, max, matrix) {
        this.min.copy(min);
        this.max.copy(max);
        this.matrix.copy(matrix);
        this.needsUpdate = true;
    }
    copy(other) {
        this.min.copy(other.min);
        this.max.copy(other.max);
        this.matrix.copy(other.matrix);
        this.needsUpdate = true;
    }
}
OrientedBox.prototype.update = function() {
    return function update() {
        const matrix = this.matrix;
        const min = this.min;
        const max = this.max;
        const points = this.points;
        for(let x = 0; x <= 1; x++){
            for(let y = 0; y <= 1; y++){
                for(let z = 0; z <= 1; z++){
                    const i = (1 << 0) * x | (1 << 1) * y | (1 << 2) * z;
                    const v = points[i];
                    v.x = x ? max.x : min.x;
                    v.y = y ? max.y : min.y;
                    v.z = z ? max.z : min.z;
                    v.applyMatrix4(matrix);
                }
            }
        }
        const satBounds = this.satBounds;
        const satAxes = this.satAxes;
        const minVec = points[0];
        for(let i = 0; i < 3; i++){
            const axis = satAxes[i];
            const sb = satBounds[i];
            const index = 1 << i;
            const pi = points[index];
            axis.subVectors(minVec, pi);
            sb.setFromPoints(axis, points);
        }
        const alignedSatBounds = this.alignedSatBounds;
        alignedSatBounds[0].setFromPointsField(points, 'x');
        alignedSatBounds[1].setFromPointsField(points, 'y');
        alignedSatBounds[2].setFromPointsField(points, 'z');
        this.invMatrix.copy(this.matrix).invert();
        this.needsUpdate = false;
    };
}();
/**
 * Returns true if intersecting with the provided box.
 * @function
 * @param {Box3} box
 * @returns {boolean}
 */ OrientedBox.prototype.intersectsBox = function() {
    const aabbBounds = /* @__PURE__ */ new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$math$2f$SeparatingAxisBounds$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SeparatingAxisBounds"]();
    return function intersectsBox(box) {
        // TODO: should this be doing SAT against the AABB?
        if (this.needsUpdate) {
            this.update();
        }
        const min = box.min;
        const max = box.max;
        const satBounds = this.satBounds;
        const satAxes = this.satAxes;
        const alignedSatBounds = this.alignedSatBounds;
        aabbBounds.min = min.x;
        aabbBounds.max = max.x;
        if (alignedSatBounds[0].isSeparated(aabbBounds)) return false;
        aabbBounds.min = min.y;
        aabbBounds.max = max.y;
        if (alignedSatBounds[1].isSeparated(aabbBounds)) return false;
        aabbBounds.min = min.z;
        aabbBounds.max = max.z;
        if (alignedSatBounds[2].isSeparated(aabbBounds)) return false;
        for(let i = 0; i < 3; i++){
            const axis = satAxes[i];
            const sb = satBounds[i];
            aabbBounds.setFromBox(axis, box);
            if (sb.isSeparated(aabbBounds)) return false;
        }
        return true;
    };
}();
/**
 * Returns true if intersecting with the provided triangle.
 * @function
 * @param {Triangle} triangle
 * @returns {boolean}
 */ OrientedBox.prototype.intersectsTriangle = function() {
    const saTri = /* @__PURE__ */ new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$math$2f$ExtendedTriangle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ExtendedTriangle"]();
    const pointsArr = /* @__PURE__ */ new Array(3);
    const cachedSatBounds = /* @__PURE__ */ new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$math$2f$SeparatingAxisBounds$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SeparatingAxisBounds"]();
    const cachedSatBounds2 = /* @__PURE__ */ new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$math$2f$SeparatingAxisBounds$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SeparatingAxisBounds"]();
    const cachedAxis = /* @__PURE__ */ new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"]();
    return function intersectsTriangle(triangle) {
        if (this.needsUpdate) {
            this.update();
        }
        if (!triangle.isExtendedTriangle) {
            saTri.copy(triangle);
            saTri.update();
            triangle = saTri;
        } else if (triangle.needsUpdate) {
            triangle.update();
        }
        const satBounds = this.satBounds;
        const satAxes = this.satAxes;
        pointsArr[0] = triangle.a;
        pointsArr[1] = triangle.b;
        pointsArr[2] = triangle.c;
        for(let i = 0; i < 3; i++){
            const sb = satBounds[i];
            const sa = satAxes[i];
            cachedSatBounds.setFromPoints(sa, pointsArr);
            if (sb.isSeparated(cachedSatBounds)) return false;
        }
        const triSatBounds = triangle.satBounds;
        const triSatAxes = triangle.satAxes;
        const points = this.points;
        for(let i = 0; i < 3; i++){
            const sb = triSatBounds[i];
            const sa = triSatAxes[i];
            cachedSatBounds.setFromPoints(sa, points);
            if (sb.isSeparated(cachedSatBounds)) return false;
        }
        // check crossed axes
        for(let i = 0; i < 3; i++){
            const sa1 = satAxes[i];
            for(let i2 = 0; i2 < 4; i2++){
                const sa2 = triSatAxes[i2];
                cachedAxis.crossVectors(sa1, sa2);
                cachedSatBounds.setFromPoints(cachedAxis, pointsArr);
                cachedSatBounds2.setFromPoints(cachedAxis, points);
                if (cachedSatBounds.isSeparated(cachedSatBounds2)) return false;
            }
        }
        return true;
    };
}();
/**
 * Returns the distance to the provided point. Sets `target` to the closest point on the surface
 * of the box if provided.
 * @function
 * @param {Vector3} point
 * @param {Vector3} target
 * @returns {number}
 */ OrientedBox.prototype.closestPointToPoint = function() {
    return function closestPointToPoint(point, target1) {
        if (this.needsUpdate) {
            this.update();
        }
        target1.copy(point).applyMatrix4(this.invMatrix).clamp(this.min, this.max).applyMatrix4(this.matrix);
        return target1;
    };
}();
/**
 * Returns the distance to the provided point.
 * @function
 * @param {Vector3} point
 * @returns {number}
 */ OrientedBox.prototype.distanceToPoint = function() {
    const target = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"]();
    return function distanceToPoint(point) {
        this.closestPointToPoint(point, target);
        return point.distanceTo(target);
    };
}();
/**
 * Returns the distance to the provided box. `threshold` is an optional distance to return early
 * if the distance is found to be within it. `target1` and `target2` are set to the points on the
 * surface of this box and the `box` argument respectively.
 * @function
 * @param {Box3} box
 * @param {number} [threshold=0]
 * @param {Vector3} [target1]
 * @param {Vector3} [target2]
 * @returns {number}
 */ OrientedBox.prototype.distanceToBox = function() {
    const xyzFields = [
        'x',
        'y',
        'z'
    ];
    const segments1 = /* @__PURE__ */ new Array(12).fill().map(()=>new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Line3"]());
    const segments2 = /* @__PURE__ */ new Array(12).fill().map(()=>new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Line3"]());
    const point1 = /* @__PURE__ */ new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"]();
    const point2 = /* @__PURE__ */ new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"]();
    // early out if we find a value below threshold
    return function distanceToBox(box, threshold = 0, target1 = null, target2 = null) {
        if (this.needsUpdate) {
            this.update();
        }
        if (this.intersectsBox(box)) {
            if (target1 || target2) {
                box.getCenter(point2);
                this.closestPointToPoint(point2, point1);
                box.closestPointToPoint(point1, point2);
                if (target1) target1.copy(point1);
                if (target2) target2.copy(point2);
            }
            return 0;
        }
        const threshold2 = threshold * threshold;
        const min = box.min;
        const max = box.max;
        const points = this.points;
        // iterate over every edge and compare distances
        let closestDistanceSq = Infinity;
        // check over all these points
        for(let i = 0; i < 8; i++){
            const p = points[i];
            point2.copy(p).clamp(min, max);
            const dist = p.distanceToSquared(point2);
            if (dist < closestDistanceSq) {
                closestDistanceSq = dist;
                if (target1) target1.copy(p);
                if (target2) target2.copy(point2);
                if (dist < threshold2) return Math.sqrt(dist);
            }
        }
        // generate and check all line segment distances
        let count = 0;
        for(let i = 0; i < 3; i++){
            for(let i1 = 0; i1 <= 1; i1++){
                for(let i2 = 0; i2 <= 1; i2++){
                    const nextIndex = (i + 1) % 3;
                    const nextIndex2 = (i + 2) % 3;
                    // get obb line segments
                    const index = i1 << nextIndex | i2 << nextIndex2;
                    const index2 = 1 << i | i1 << nextIndex | i2 << nextIndex2;
                    const p1 = points[index];
                    const p2 = points[index2];
                    const line1 = segments1[count];
                    line1.set(p1, p2);
                    // get aabb line segments
                    const f1 = xyzFields[i];
                    const f2 = xyzFields[nextIndex];
                    const f3 = xyzFields[nextIndex2];
                    const line2 = segments2[count];
                    const start = line2.start;
                    const end = line2.end;
                    start[f1] = min[f1];
                    start[f2] = i1 ? min[f2] : max[f2];
                    start[f3] = i2 ? min[f3] : max[f2];
                    end[f1] = max[f1];
                    end[f2] = i1 ? min[f2] : max[f2];
                    end[f3] = i2 ? min[f3] : max[f2];
                    count++;
                }
            }
        }
        // check all the other boxes point
        for(let x = 0; x <= 1; x++){
            for(let y = 0; y <= 1; y++){
                for(let z = 0; z <= 1; z++){
                    point2.x = x ? max.x : min.x;
                    point2.y = y ? max.y : min.y;
                    point2.z = z ? max.z : min.z;
                    this.closestPointToPoint(point2, point1);
                    const dist = point2.distanceToSquared(point1);
                    if (dist < closestDistanceSq) {
                        closestDistanceSq = dist;
                        if (target1) target1.copy(point1);
                        if (target2) target2.copy(point2);
                        if (dist < threshold2) return Math.sqrt(dist);
                    }
                }
            }
        }
        for(let i = 0; i < 12; i++){
            const l1 = segments1[i];
            for(let i2 = 0; i2 < 12; i2++){
                const l2 = segments2[i2];
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$math$2f$MathUtilities$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["closestPointsSegmentToSegment"])(l1, l2, point1, point2);
                const dist = point1.distanceToSquared(point2);
                if (dist < closestDistanceSq) {
                    closestDistanceSq = dist;
                    if (target1) target1.copy(point1);
                    if (target2) target2.copy(point2);
                    if (dist < threshold2) return Math.sqrt(dist);
                }
            }
        }
        return Math.sqrt(closestDistanceSq);
    };
}();
}),
"[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/utils/PrimitivePool.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "PrimitivePool",
    ()=>PrimitivePool
]);
class PrimitivePool {
    constructor(getNewPrimitive){
        this._getNewPrimitive = getNewPrimitive;
        this._primitives = [];
    }
    getPrimitive() {
        const primitives = this._primitives;
        if (primitives.length === 0) {
            return this._getNewPrimitive();
        } else {
            return primitives.pop();
        }
    }
    releasePrimitive(primitive) {
        this._primitives.push(primitive);
    }
}
}),
"[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/utils/ExtendedTrianglePool.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ExtendedTrianglePool",
    ()=>ExtendedTrianglePool
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$math$2f$ExtendedTriangle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/math/ExtendedTriangle.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$utils$2f$PrimitivePool$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/utils/PrimitivePool.js [app-client] (ecmascript)");
;
;
class ExtendedTrianglePoolBase extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$utils$2f$PrimitivePool$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PrimitivePool"] {
    constructor(){
        super(()=>new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$math$2f$ExtendedTriangle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ExtendedTriangle"]());
    }
}
const ExtendedTrianglePool = /* @__PURE__ */ new ExtendedTrianglePoolBase();
}),
"[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/core/cast/closestPointToPoint.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "closestPointToPoint",
    ()=>closestPointToPoint
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/three@0.185.1/node_modules/three/build/three.core.js [app-client] (ecmascript)");
;
const temp = /* @__PURE__ */ new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"]();
const temp1 = /* @__PURE__ */ new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"]();
function closestPointToPoint(bvh, point, target = {}, minThreshold = 0, maxThreshold = Infinity) {
    // early out if under minThreshold
    // skip checking if over maxThreshold
    // set minThreshold = maxThreshold to quickly check if a point is within a threshold
    // returns Infinity if no value found
    const minThresholdSq = minThreshold * minThreshold;
    const maxThresholdSq = maxThreshold * maxThreshold;
    let closestDistanceSq = Infinity;
    let closestDistanceTriIndex = null;
    bvh.shapecast({
        boundsTraverseOrder: (box)=>{
            temp.copy(point).clamp(box.min, box.max);
            return temp.distanceToSquared(point);
        },
        intersectsBounds: (box, isLeaf, score)=>{
            return score < closestDistanceSq && score < maxThresholdSq;
        },
        intersectsTriangle: (tri, triIndex)=>{
            tri.closestPointToPoint(point, temp);
            const distSq = point.distanceToSquared(temp);
            if (distSq < closestDistanceSq) {
                temp1.copy(temp);
                closestDistanceSq = distSq;
                closestDistanceTriIndex = triIndex;
            }
            if (distSq < minThresholdSq) {
                return true;
            } else {
                return false;
            }
        }
    });
    if (closestDistanceSq === Infinity) return null;
    const closestDistance = Math.sqrt(closestDistanceSq);
    if (!target.point) target.point = temp1.clone();
    else target.point.copy(temp1);
    target.distance = closestDistance, target.faceIndex = closestDistanceTriIndex;
    return target;
}
}),
"[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/core/utils/nodeBufferUtils.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BOUNDING_DATA_INDEX",
    ()=>BOUNDING_DATA_INDEX,
    "COUNT",
    ()=>COUNT,
    "IS_LEAF",
    ()=>IS_LEAF,
    "LEFT_NODE",
    ()=>LEFT_NODE,
    "OFFSET",
    ()=>OFFSET,
    "RIGHT_NODE",
    ()=>RIGHT_NODE,
    "SPLIT_AXIS",
    ()=>SPLIT_AXIS
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$Constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/core/Constants.js [app-client] (ecmascript)");
;
function IS_LEAF(n16, uint16Array) {
    return uint16Array[n16 + 15] === __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$Constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["IS_LEAFNODE_FLAG"];
}
function OFFSET(n32, uint32Array) {
    return uint32Array[n32 + 6];
}
function COUNT(n16, uint16Array) {
    return uint16Array[n16 + 14];
}
function LEFT_NODE(n32) {
    return n32 + __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$Constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["UINT32_PER_NODE"];
}
function RIGHT_NODE(n32, uint32Array) {
    // stored value is relative offset from parent, convert to absolute uint32 index
    const relativeOffset = uint32Array[n32 + 6];
    return n32 + relativeOffset * __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$Constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["UINT32_PER_NODE"];
}
function SPLIT_AXIS(n32, uint32Array) {
    return uint32Array[n32 + 7];
}
function BOUNDING_DATA_INDEX(n32) {
    return n32;
}
}),
"[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/utils/ThreeRayIntersectUtilities.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "intersectTri",
    ()=>intersectTri
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/three@0.185.1/node_modules/three/build/three.core.js [app-client] (ecmascript)");
;
const IS_GT_REVISION_169 = parseInt(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["REVISION"]) >= 169;
const IS_LT_REVISION_161 = parseInt(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["REVISION"]) <= 161;
// Ripped and modified From THREE.js Mesh raycast
// https://github.com/mrdoob/three.js/blob/0aa87c999fe61e216c1133fba7a95772b503eddf/src/objects/Mesh.js#L115
const _vA = /* @__PURE__ */ new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"]();
const _vB = /* @__PURE__ */ new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"]();
const _vC = /* @__PURE__ */ new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"]();
const _uvA = /* @__PURE__ */ new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector2"]();
const _uvB = /* @__PURE__ */ new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector2"]();
const _uvC = /* @__PURE__ */ new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector2"]();
const _normalA = /* @__PURE__ */ new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"]();
const _normalB = /* @__PURE__ */ new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"]();
const _normalC = /* @__PURE__ */ new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"]();
const _intersectionPoint = /* @__PURE__ */ new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"]();
function checkIntersection(ray, pA, pB, pC, point, side, near, far) {
    let intersect;
    if (side === __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BackSide"]) {
        intersect = ray.intersectTriangle(pC, pB, pA, true, point);
    } else {
        intersect = ray.intersectTriangle(pA, pB, pC, side !== __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DoubleSide"], point);
    }
    if (intersect === null) return null;
    const distance = ray.origin.distanceTo(point);
    if (distance < near || distance > far) return null;
    return {
        distance: distance,
        point: point.clone()
    };
}
function checkBufferGeometryIntersection(ray, position, normal, uv, uv1, a, b, c, side, near, far) {
    _vA.fromBufferAttribute(position, a);
    _vB.fromBufferAttribute(position, b);
    _vC.fromBufferAttribute(position, c);
    const intersection = checkIntersection(ray, _vA, _vB, _vC, _intersectionPoint, side, near, far);
    if (intersection) {
        if (uv) {
            _uvA.fromBufferAttribute(uv, a);
            _uvB.fromBufferAttribute(uv, b);
            _uvC.fromBufferAttribute(uv, c);
            intersection.uv = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector2"]();
            const res = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Triangle"].getInterpolation(_intersectionPoint, _vA, _vB, _vC, _uvA, _uvB, _uvC, intersection.uv);
            if (!IS_GT_REVISION_169) {
                intersection.uv = res;
            }
        }
        if (uv1) {
            _uvA.fromBufferAttribute(uv1, a);
            _uvB.fromBufferAttribute(uv1, b);
            _uvC.fromBufferAttribute(uv1, c);
            intersection.uv1 = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector2"]();
            const res = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Triangle"].getInterpolation(_intersectionPoint, _vA, _vB, _vC, _uvA, _uvB, _uvC, intersection.uv1);
            if (!IS_GT_REVISION_169) {
                intersection.uv1 = res;
            }
            if (IS_LT_REVISION_161) {
                intersection.uv2 = intersection.uv1;
            }
        }
        if (normal) {
            _normalA.fromBufferAttribute(normal, a);
            _normalB.fromBufferAttribute(normal, b);
            _normalC.fromBufferAttribute(normal, c);
            intersection.normal = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"]();
            const res = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Triangle"].getInterpolation(_intersectionPoint, _vA, _vB, _vC, _normalA, _normalB, _normalC, intersection.normal);
            if (intersection.normal.dot(ray.direction) > 0) {
                intersection.normal.multiplyScalar(-1);
            }
            if (!IS_GT_REVISION_169) {
                intersection.normal = res;
            }
        }
        const face = {
            a: a,
            b: b,
            c: c,
            normal: new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"](),
            materialIndex: 0
        };
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Triangle"].getNormal(_vA, _vB, _vC, face.normal);
        intersection.face = face;
        intersection.faceIndex = a;
        if (IS_GT_REVISION_169) {
            const barycoord = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"]();
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Triangle"].getBarycoord(_intersectionPoint, _vA, _vB, _vC, barycoord);
            intersection.barycoord = barycoord;
        }
    }
    return intersection;
}
function getSide(materialOrSide) {
    return materialOrSide && materialOrSide.isMaterial ? materialOrSide.side : materialOrSide;
}
function intersectTri(geometry, materialOrSide, ray, tri, intersections, near, far) {
    const triOffset = tri * 3;
    let a = triOffset + 0;
    let b = triOffset + 1;
    let c = triOffset + 2;
    const { index, groups } = geometry;
    if (geometry.index) {
        a = index.getX(a);
        b = index.getX(b);
        c = index.getX(c);
    }
    const { position, normal, uv, uv1 } = geometry.attributes;
    if (Array.isArray(materialOrSide)) {
        // check which groups a triangle is present in and run the intersections
        // TODO: we shouldn't need to run and intersection test multiple times
        const firstIndex = tri * 3;
        for(let i = 0, l = groups.length; i < l; i++){
            const { start, count, materialIndex } = groups[i];
            if (firstIndex >= start && firstIndex < start + count) {
                const side = getSide(materialOrSide[materialIndex]);
                const intersection = checkBufferGeometryIntersection(ray, position, normal, uv, uv1, a, b, c, side, near, far);
                if (intersection) {
                    intersection.faceIndex = tri;
                    intersection.face.materialIndex = materialIndex;
                    if (intersections) {
                        intersections.push(intersection);
                    } else {
                        return intersection;
                    }
                }
            }
        }
    } else {
        // run the intersection for the single material
        const side = getSide(materialOrSide);
        const intersection = checkBufferGeometryIntersection(ray, position, normal, uv, uv1, a, b, c, side, near, far);
        if (intersection) {
            intersection.faceIndex = tri;
            intersection.face.materialIndex = 0;
            if (intersections) {
                intersections.push(intersection);
            } else {
                return intersection;
            }
        }
    }
    return null;
}
}),
"[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/utils/TriangleUtilities.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getTriangleHitPointInfo",
    ()=>getTriangleHitPointInfo,
    "setTriangle",
    ()=>setTriangle
]);
/** @import { BufferGeometry } from 'three' */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/three@0.185.1/node_modules/three/build/three.core.js [app-client] (ecmascript)");
;
function setTriangle(tri, i, index, pos) {
    const ta = tri.a;
    const tb = tri.b;
    const tc = tri.c;
    let i0 = i;
    let i1 = i + 1;
    let i2 = i + 2;
    if (index) {
        i0 = index.getX(i0);
        i1 = index.getX(i1);
        i2 = index.getX(i2);
    }
    ta.x = pos.getX(i0);
    ta.y = pos.getY(i0);
    ta.z = pos.getZ(i0);
    tb.x = pos.getX(i1);
    tb.y = pos.getY(i1);
    tb.z = pos.getZ(i1);
    tc.x = pos.getX(i2);
    tc.y = pos.getY(i2);
    tc.z = pos.getZ(i2);
}
const tempV1 = /* @__PURE__ */ new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"]();
const tempV2 = /* @__PURE__ */ new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"]();
const tempV3 = /* @__PURE__ */ new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"]();
const tempUV1 = /* @__PURE__ */ new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector2"]();
const tempUV2 = /* @__PURE__ */ new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector2"]();
const tempUV3 = /* @__PURE__ */ new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector2"]();
function getTriangleHitPointInfo(point, geometry, triangleIndex, target) {
    const indices = geometry.getIndex().array;
    const positions = geometry.getAttribute('position');
    const uvs = geometry.getAttribute('uv');
    const a = indices[triangleIndex * 3];
    const b = indices[triangleIndex * 3 + 1];
    const c = indices[triangleIndex * 3 + 2];
    tempV1.fromBufferAttribute(positions, a);
    tempV2.fromBufferAttribute(positions, b);
    tempV3.fromBufferAttribute(positions, c);
    // find the associated material index
    let materialIndex = 0;
    const groups = geometry.groups;
    const firstVertexIndex = triangleIndex * 3;
    for(let i = 0, l = groups.length; i < l; i++){
        const group = groups[i];
        const { start, count } = group;
        if (firstVertexIndex >= start && firstVertexIndex < start + count) {
            materialIndex = group.materialIndex;
            break;
        }
    }
    // extract barycoord
    const barycoord = target && target.barycoord ? target.barycoord : new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"]();
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Triangle"].getBarycoord(point, tempV1, tempV2, tempV3, barycoord);
    // extract uvs
    let uv = null;
    if (uvs) {
        tempUV1.fromBufferAttribute(uvs, a);
        tempUV2.fromBufferAttribute(uvs, b);
        tempUV3.fromBufferAttribute(uvs, c);
        if (target && target.uv) uv = target.uv;
        else uv = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector2"]();
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Triangle"].getInterpolation(point, tempV1, tempV2, tempV3, tempUV1, tempUV2, tempUV3, uv);
    }
    // adjust the provided target or create a new one
    if (target) {
        if (!target.face) target.face = {};
        target.face.a = a;
        target.face.b = b;
        target.face.c = c;
        target.face.materialIndex = materialIndex;
        if (!target.face.normal) target.face.normal = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"]();
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Triangle"].getNormal(tempV1, tempV2, tempV3, target.face.normal);
        if (uv) target.uv = uv;
        target.barycoord = barycoord;
        return target;
    } else {
        return {
            face: {
                a: a,
                b: b,
                c: c,
                materialIndex: materialIndex,
                normal: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Triangle"].getNormal(tempV1, tempV2, tempV3, new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"]())
            },
            uv: uv,
            barycoord: barycoord
        };
    }
}
}),
"[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/core/utils/iterationUtils.generated.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "intersectClosestTri",
    ()=>intersectClosestTri,
    "intersectTris",
    ()=>intersectTris,
    "iterateOverTriangles",
    ()=>iterateOverTriangles
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$utils$2f$ThreeRayIntersectUtilities$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/utils/ThreeRayIntersectUtilities.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$utils$2f$TriangleUtilities$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/utils/TriangleUtilities.js [app-client] (ecmascript)");
;
;
/*************************************************************/ /* This file is generated from "iterationUtils.template.js". */ /*************************************************************/ function intersectTris(bvh, materialOrSide, ray, offset, count, intersections, near, far) {
    const { geometry, _indirectBuffer } = bvh;
    for(let i = offset, end = offset + count; i < end; i++){
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$utils$2f$ThreeRayIntersectUtilities$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["intersectTri"])(geometry, materialOrSide, ray, i, intersections, near, far);
    }
}
function intersectClosestTri(bvh, materialOrSide, ray, offset, count, near, far) {
    const { geometry, _indirectBuffer } = bvh;
    let dist = Infinity;
    let res = null;
    for(let i = offset, end = offset + count; i < end; i++){
        let intersection;
        intersection = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$utils$2f$ThreeRayIntersectUtilities$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["intersectTri"])(geometry, materialOrSide, ray, i, null, near, far);
        if (intersection && intersection.distance < dist) {
            res = intersection;
            dist = intersection.distance;
        }
    }
    return res;
}
function iterateOverTriangles(offset, count, bvh, intersectsTriangleFunc, contained, depth, triangle) {
    const { geometry } = bvh;
    const { index } = geometry;
    const pos = geometry.attributes.position;
    for(let i = offset, l = count + offset; i < l; i++){
        let tri;
        tri = i;
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$utils$2f$TriangleUtilities$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["setTriangle"])(triangle, tri * 3, index, pos);
        triangle.needsUpdate = true;
        if (intersectsTriangleFunc(triangle, tri, contained, depth)) {
            return true;
        }
    }
    return false;
}
;
}),
"[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/core/cast/refit.generated.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "refit",
    ()=>refit
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$Constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/core/Constants.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$nodeBufferUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/core/utils/nodeBufferUtils.js [app-client] (ecmascript)");
;
;
/****************************************************/ /* This file is generated from "refit.template.js". */ /****************************************************/ function refit(bvh, nodeIndices = null) {
    if (nodeIndices && Array.isArray(nodeIndices)) {
        nodeIndices = new Set(nodeIndices);
    }
    const geometry = bvh.geometry;
    const indexArr = geometry.index ? geometry.index.array : null;
    const posAttr = geometry.attributes.position;
    let buffer, uint32Array, uint16Array, float32Array;
    let byteOffset = 0;
    const roots = bvh._roots;
    for(let i = 0, l = roots.length; i < l; i++){
        buffer = roots[i];
        uint32Array = new Uint32Array(buffer);
        uint16Array = new Uint16Array(buffer);
        float32Array = new Float32Array(buffer);
        _traverse(0, byteOffset);
        byteOffset += buffer.byteLength;
    }
    function _traverse(nodeIndex32, byteOffset, force = false) {
        const nodeIndex16 = nodeIndex32 * 2;
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$nodeBufferUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["IS_LEAF"])(nodeIndex16, uint16Array)) {
            const offset = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$nodeBufferUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["OFFSET"])(nodeIndex32, uint32Array);
            const count = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$nodeBufferUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["COUNT"])(nodeIndex16, uint16Array);
            let minx = Infinity;
            let miny = Infinity;
            let minz = Infinity;
            let maxx = -Infinity;
            let maxy = -Infinity;
            let maxz = -Infinity;
            for(let i = 3 * offset, l = 3 * (offset + count); i < l; i++){
                let index = indexArr[i];
                const x = posAttr.getX(index);
                const y = posAttr.getY(index);
                const z = posAttr.getZ(index);
                if (x < minx) minx = x;
                if (x > maxx) maxx = x;
                if (y < miny) miny = y;
                if (y > maxy) maxy = y;
                if (z < minz) minz = z;
                if (z > maxz) maxz = z;
            }
            if (float32Array[nodeIndex32 + 0] !== minx || float32Array[nodeIndex32 + 1] !== miny || float32Array[nodeIndex32 + 2] !== minz || float32Array[nodeIndex32 + 3] !== maxx || float32Array[nodeIndex32 + 4] !== maxy || float32Array[nodeIndex32 + 5] !== maxz) {
                float32Array[nodeIndex32 + 0] = minx;
                float32Array[nodeIndex32 + 1] = miny;
                float32Array[nodeIndex32 + 2] = minz;
                float32Array[nodeIndex32 + 3] = maxx;
                float32Array[nodeIndex32 + 4] = maxy;
                float32Array[nodeIndex32 + 5] = maxz;
                return true;
            } else {
                return false;
            }
        } else {
            const left = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$nodeBufferUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LEFT_NODE"])(nodeIndex32);
            const right = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$nodeBufferUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RIGHT_NODE"])(nodeIndex32, uint32Array);
            // the identifying node indices provided by the shapecast function include offsets of all
            // root buffers to guarantee they're unique between roots so offset left and right indices here.
            let forceChildren = force;
            let includesLeft = false;
            let includesRight = false;
            if (nodeIndices) {
                // if we see that neither the left or right child are included in the set that need to be updated
                // then we assume that all children need to be updated.
                if (!forceChildren) {
                    const leftNodeId = left / __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$Constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["UINT32_PER_NODE"] + byteOffset / __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$Constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BYTES_PER_NODE"];
                    const rightNodeId = right / __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$Constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["UINT32_PER_NODE"] + byteOffset / __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$Constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BYTES_PER_NODE"];
                    includesLeft = nodeIndices.has(leftNodeId);
                    includesRight = nodeIndices.has(rightNodeId);
                    forceChildren = !includesLeft && !includesRight;
                }
            } else {
                includesLeft = true;
                includesRight = true;
            }
            const traverseLeft = forceChildren || includesLeft;
            const traverseRight = forceChildren || includesRight;
            let leftChange = false;
            if (traverseLeft) {
                leftChange = _traverse(left, byteOffset, forceChildren);
            }
            let rightChange = false;
            if (traverseRight) {
                rightChange = _traverse(right, byteOffset, forceChildren);
            }
            const didChange = leftChange || rightChange;
            if (didChange) {
                for(let i = 0; i < 3; i++){
                    const left_i = left + i;
                    const right_i = right + i;
                    const minLeftValue = float32Array[left_i];
                    const maxLeftValue = float32Array[left_i + 3];
                    const minRightValue = float32Array[right_i];
                    const maxRightValue = float32Array[right_i + 3];
                    float32Array[nodeIndex32 + i] = minLeftValue < minRightValue ? minLeftValue : minRightValue;
                    float32Array[nodeIndex32 + i + 3] = maxLeftValue > maxRightValue ? maxLeftValue : maxRightValue;
                }
            }
            return didChange;
        }
    }
}
;
}),
"[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/core/utils/intersectUtils.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "intersectsNodeBounds",
    ()=>intersectsNodeBounds
]);
function intersectsNodeBounds(nodeIndex32, array, ray, near, far) {
    // This function performs intersection tests similar to Ray.intersectBox in three.js,
    // with the difference that the box values are read from an array to improve performance.
    let tmin, tmax, tymin, tymax, tzmin, tzmax;
    const invdirx = 1 / ray.direction.x, invdiry = 1 / ray.direction.y, invdirz = 1 / ray.direction.z;
    const ox = ray.origin.x;
    const oy = ray.origin.y;
    const oz = ray.origin.z;
    let minx = array[nodeIndex32];
    let maxx = array[nodeIndex32 + 3];
    let miny = array[nodeIndex32 + 1];
    let maxy = array[nodeIndex32 + 3 + 1];
    let minz = array[nodeIndex32 + 2];
    let maxz = array[nodeIndex32 + 3 + 2];
    if (invdirx >= 0) {
        tmin = (minx - ox) * invdirx;
        tmax = (maxx - ox) * invdirx;
    } else {
        tmin = (maxx - ox) * invdirx;
        tmax = (minx - ox) * invdirx;
    }
    if (invdiry >= 0) {
        tymin = (miny - oy) * invdiry;
        tymax = (maxy - oy) * invdiry;
    } else {
        tymin = (maxy - oy) * invdiry;
        tymax = (miny - oy) * invdiry;
    }
    if (tmin > tymax || tymin > tmax) return false;
    if (tymin > tmin || isNaN(tmin)) tmin = tymin;
    if (tymax < tmax || isNaN(tmax)) tmax = tymax;
    if (invdirz >= 0) {
        tzmin = (minz - oz) * invdirz;
        tzmax = (maxz - oz) * invdirz;
    } else {
        tzmin = (maxz - oz) * invdirz;
        tzmax = (minz - oz) * invdirz;
    }
    if (tmin > tzmax || tzmin > tmax) return false;
    if (tzmin > tmin || tmin !== tmin) tmin = tzmin;
    if (tzmax < tmax || tmax !== tmax) tmax = tzmax;
    //return point closest to the ray (positive side)
    return tmin <= far && tmax >= near;
}
}),
"[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/core/utils/BufferStack.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BufferStack",
    ()=>BufferStack
]);
class _BufferStack {
    constructor(){
        this.float32Array = null;
        this.uint16Array = null;
        this.uint32Array = null;
        const stack = [];
        let prevBuffer = null;
        this.setBuffer = (buffer)=>{
            if (prevBuffer) {
                stack.push(prevBuffer);
            }
            prevBuffer = buffer;
            this.float32Array = new Float32Array(buffer);
            this.uint16Array = new Uint16Array(buffer);
            this.uint32Array = new Uint32Array(buffer);
        };
        this.clearBuffer = ()=>{
            prevBuffer = null;
            this.float32Array = null;
            this.uint16Array = null;
            this.uint32Array = null;
            if (stack.length !== 0) {
                this.setBuffer(stack.pop());
            }
        };
    }
}
const BufferStack = /* @__PURE__ */ new _BufferStack();
}),
"[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/core/cast/raycast.generated.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "raycast",
    ()=>raycast
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$intersectUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/core/utils/intersectUtils.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$nodeBufferUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/core/utils/nodeBufferUtils.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$BufferStack$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/core/utils/BufferStack.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$iterationUtils$2e$generated$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/core/utils/iterationUtils.generated.js [app-client] (ecmascript)");
;
;
;
;
;
/******************************************************/ /* This file is generated from "raycast.template.js". */ /******************************************************/ function raycast(bvh, root, materialOrSide, ray, intersects, near, far) {
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$BufferStack$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BufferStack"].setBuffer(bvh._roots[root]);
    _raycast(0, bvh, materialOrSide, ray, intersects, near, far);
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$BufferStack$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BufferStack"].clearBuffer();
}
function _raycast(nodeIndex32, bvh, materialOrSide, ray, intersects, near, far) {
    const { float32Array, uint16Array, uint32Array } = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$BufferStack$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BufferStack"];
    const nodeIndex16 = nodeIndex32 * 2;
    const isLeaf = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$nodeBufferUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["IS_LEAF"])(nodeIndex16, uint16Array);
    if (isLeaf) {
        const offset = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$nodeBufferUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["OFFSET"])(nodeIndex32, uint32Array);
        const count = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$nodeBufferUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["COUNT"])(nodeIndex16, uint16Array);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$iterationUtils$2e$generated$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["intersectTris"])(bvh, materialOrSide, ray, offset, count, intersects, near, far);
    } else {
        const leftIndex = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$nodeBufferUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LEFT_NODE"])(nodeIndex32);
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$intersectUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["intersectsNodeBounds"])(leftIndex, float32Array, ray, near, far)) {
            _raycast(leftIndex, bvh, materialOrSide, ray, intersects, near, far);
        }
        const rightIndex = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$nodeBufferUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RIGHT_NODE"])(nodeIndex32, uint32Array);
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$intersectUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["intersectsNodeBounds"])(rightIndex, float32Array, ray, near, far)) {
            _raycast(rightIndex, bvh, materialOrSide, ray, intersects, near, far);
        }
    }
}
;
}),
"[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/core/cast/raycastFirst.generated.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "raycastFirst",
    ()=>raycastFirst
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$nodeBufferUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/core/utils/nodeBufferUtils.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$BufferStack$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/core/utils/BufferStack.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$intersectUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/core/utils/intersectUtils.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$iterationUtils$2e$generated$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/core/utils/iterationUtils.generated.js [app-client] (ecmascript)");
;
;
;
;
;
/***********************************************************/ /* This file is generated from "raycastFirst.template.js". */ /***********************************************************/ const _xyzFields = [
    'x',
    'y',
    'z'
];
function raycastFirst(bvh, root, materialOrSide, ray, near, far) {
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$BufferStack$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BufferStack"].setBuffer(bvh._roots[root]);
    const result = _raycastFirst(0, bvh, materialOrSide, ray, near, far);
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$BufferStack$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BufferStack"].clearBuffer();
    return result;
}
function _raycastFirst(nodeIndex32, bvh, materialOrSide, ray, near, far) {
    const { float32Array, uint16Array, uint32Array } = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$BufferStack$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BufferStack"];
    let nodeIndex16 = nodeIndex32 * 2;
    const isLeaf = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$nodeBufferUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["IS_LEAF"])(nodeIndex16, uint16Array);
    if (isLeaf) {
        const offset = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$nodeBufferUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["OFFSET"])(nodeIndex32, uint32Array);
        const count = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$nodeBufferUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["COUNT"])(nodeIndex16, uint16Array);
        // eslint-disable-next-line no-unreachable
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$iterationUtils$2e$generated$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["intersectClosestTri"])(bvh, materialOrSide, ray, offset, count, near, far);
    } else {
        // consider the position of the split plane with respect to the oncoming ray; whichever direction
        // the ray is coming from, look for an intersection among that side of the tree first
        const splitAxis = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$nodeBufferUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SPLIT_AXIS"])(nodeIndex32, uint32Array);
        const xyzAxis = _xyzFields[splitAxis];
        const rayDir = ray.direction[xyzAxis];
        const leftToRight = rayDir >= 0;
        // c1 is the child to check first
        let c1, c2;
        if (leftToRight) {
            c1 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$nodeBufferUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LEFT_NODE"])(nodeIndex32);
            c2 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$nodeBufferUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RIGHT_NODE"])(nodeIndex32, uint32Array);
        } else {
            c1 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$nodeBufferUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RIGHT_NODE"])(nodeIndex32, uint32Array);
            c2 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$nodeBufferUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LEFT_NODE"])(nodeIndex32);
        }
        const c1Intersection = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$intersectUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["intersectsNodeBounds"])(c1, float32Array, ray, near, far);
        const c1Result = c1Intersection ? _raycastFirst(c1, bvh, materialOrSide, ray, near, far) : null;
        // if we got an intersection in the first node and it's closer than the second node's bounding
        // box, we don't need to consider the second node because it couldn't possibly be a better result
        if (c1Result) {
            // check if the point is within the second bounds
            // "point" is in the local frame of the bvh
            const point = c1Result.point[xyzAxis];
            const isOutside = leftToRight ? point <= float32Array[c2 + splitAxis] : point >= float32Array[c2 + splitAxis + 3]; // max bounding data
            if (isOutside) {
                return c1Result;
            }
        }
        // either there was no intersection in the first node, or there could still be a closer
        // intersection in the second, so check the second node and then take the better of the two
        const c2Intersection = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$intersectUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["intersectsNodeBounds"])(c2, float32Array, ray, near, far);
        const c2Result = c2Intersection ? _raycastFirst(c2, bvh, materialOrSide, ray, near, far) : null;
        if (c1Result && c2Result) {
            return c1Result.distance <= c2Result.distance ? c1Result : c2Result;
        } else {
            return c1Result || c2Result || null;
        }
    }
}
;
}),
"[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/utils/ArrayBoxUtilities.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "arrayToBox",
    ()=>arrayToBox,
    "computeSurfaceArea",
    ()=>computeSurfaceArea,
    "copyBounds",
    ()=>copyBounds,
    "expandByPrimitiveBounds",
    ()=>expandByPrimitiveBounds,
    "getLongestEdgeIndex",
    ()=>getLongestEdgeIndex,
    "makeEmptyBounds",
    ()=>makeEmptyBounds,
    "unionBounds",
    ()=>unionBounds
]);
function arrayToBox(nodeIndex32, array, target) {
    target.min.x = array[nodeIndex32];
    target.min.y = array[nodeIndex32 + 1];
    target.min.z = array[nodeIndex32 + 2];
    target.max.x = array[nodeIndex32 + 3];
    target.max.y = array[nodeIndex32 + 4];
    target.max.z = array[nodeIndex32 + 5];
    return target;
}
function makeEmptyBounds(target) {
    target[0] = target[1] = target[2] = Infinity;
    target[3] = target[4] = target[5] = -Infinity;
}
function getLongestEdgeIndex(bounds) {
    let splitDimIdx = -1;
    let splitDist = -Infinity;
    for(let i = 0; i < 3; i++){
        const dist = bounds[i + 3] - bounds[i];
        if (dist > splitDist) {
            splitDist = dist;
            splitDimIdx = i;
        }
    }
    return splitDimIdx;
}
function copyBounds(source, target) {
    target.set(source);
}
function unionBounds(a, b, target) {
    let aVal, bVal;
    for(let d = 0; d < 3; d++){
        const d3 = d + 3;
        // set the minimum values
        aVal = a[d];
        bVal = b[d];
        target[d] = aVal < bVal ? aVal : bVal;
        // set the max values
        aVal = a[d3];
        bVal = b[d3];
        target[d3] = aVal > bVal ? aVal : bVal;
    }
}
function expandByPrimitiveBounds(startIndex, primitiveBounds, bounds) {
    for(let d = 0; d < 3; d++){
        const tCenter = primitiveBounds[startIndex + 2 * d];
        const tHalf = primitiveBounds[startIndex + 2 * d + 1];
        const tMin = tCenter - tHalf;
        const tMax = tCenter + tHalf;
        if (tMin < bounds[d]) {
            bounds[d] = tMin;
        }
        if (tMax > bounds[d + 3]) {
            bounds[d + 3] = tMax;
        }
    }
}
function computeSurfaceArea(bounds) {
    const d0 = bounds[3] - bounds[0];
    const d1 = bounds[4] - bounds[1];
    const d2 = bounds[5] - bounds[2];
    return 2 * (d0 * d1 + d1 * d2 + d2 * d0);
}
}),
"[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/core/build/geometryUtils.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ensureIndex",
    ()=>ensureIndex,
    "getIndexArray",
    ()=>getIndexArray,
    "getRootPrimitiveRanges",
    ()=>getRootPrimitiveRanges,
    "getTriCount",
    ()=>getTriCount,
    "getVertexCount",
    ()=>getVertexCount
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/three@0.185.1/node_modules/three/build/three.core.js [app-client] (ecmascript)");
;
function getVertexCount(geo) {
    return geo.index ? geo.index.count : geo.attributes.position.count;
}
function getTriCount(geo) {
    return getVertexCount(geo) / 3;
}
function getIndexArray(vertexCount, BufferConstructor = ArrayBuffer) {
    if (vertexCount > 65535) {
        return new Uint32Array(new BufferConstructor(4 * vertexCount));
    } else {
        return new Uint16Array(new BufferConstructor(2 * vertexCount));
    }
}
function ensureIndex(geo, options) {
    if (!geo.index) {
        const vertexCount = geo.attributes.position.count;
        const BufferConstructor = options.useSharedArrayBuffer ? SharedArrayBuffer : ArrayBuffer;
        const index = getIndexArray(vertexCount, BufferConstructor);
        geo.setIndex(new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BufferAttribute"](index, 1));
        for(let i = 0; i < vertexCount; i++){
            index[i] = i;
        }
    }
}
// Computes the set of { offset, count } ranges which need independent BVH roots. Each
// region in the geometry index that belongs to a different set of material groups requires
// a separate BVH root, so that triangles indices belonging to one group never get swapped
// with triangle indices belongs to another group. For example, if the groups were like this:
//
// [-------------------------------------------------------------]
// |__________________|
//   g0 = [0, 20]  |______________________||_____________________|
//                      g1 = [16, 40]           g2 = [41, 60]
//
// we would need four BVH roots: [0, 15], [16, 20], [21, 40], [41, 60].
function getFullPrimitiveRange(geo, range, stride) {
    const primitiveCount = getVertexCount(geo) / stride;
    const drawRange = range ? range : geo.drawRange;
    const start = drawRange.start / stride;
    const end = (drawRange.start + drawRange.count) / stride;
    const offset = Math.max(0, start);
    const count = Math.min(primitiveCount, end) - offset;
    return {
        offset: Math.floor(offset),
        count: Math.floor(count)
    };
}
function getPrimitiveGroupRanges(geo, stride) {
    return geo.groups.map((group)=>({
            offset: group.start / stride,
            count: group.count / stride
        }));
}
function getRootPrimitiveRanges(geo, range, stride) {
    const drawRange = getFullPrimitiveRange(geo, range, stride);
    const primitiveRanges = getPrimitiveGroupRanges(geo, stride);
    if (!primitiveRanges.length) {
        return [
            drawRange
        ];
    }
    const ranges = [];
    const drawRangeStart = drawRange.offset;
    const drawRangeEnd = drawRange.offset + drawRange.count;
    // Create events for group boundaries
    const primitiveCount = getVertexCount(geo) / stride;
    const events = [];
    for (const group of primitiveRanges){
        // Account for cases where group size is set to Infinity
        const { offset, count } = group;
        const groupStart = offset;
        const groupCount = isFinite(count) ? count : primitiveCount - offset;
        const groupEnd = offset + groupCount;
        // Only add events if the group intersects with the draw range
        if (groupStart < drawRangeEnd && groupEnd > drawRangeStart) {
            events.push({
                pos: Math.max(drawRangeStart, groupStart),
                isStart: true
            });
            events.push({
                pos: Math.min(drawRangeEnd, groupEnd),
                isStart: false
            });
        }
    }
    // Sort events by position, with 'end' events before 'start' events at the same position
    events.sort((a, b)=>{
        if (a.pos !== b.pos) {
            return a.pos - b.pos;
        } else {
            return a.type === 'end' ? -1 : 1;
        }
    });
    // sweep through events and create ranges where activeGroups > 0
    let activeGroups = 0;
    let lastPos = null;
    for (const event of events){
        const newPos = event.pos;
        if (activeGroups !== 0 && newPos !== lastPos) {
            ranges.push({
                offset: lastPos,
                count: newPos - lastPos
            });
        }
        activeGroups += event.isStart ? 1 : -1;
        lastPos = newPos;
    }
    return ranges;
}
}),
"[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/core/cast/intersectsGeometry.generated.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "intersectsGeometry",
    ()=>intersectsGeometry
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/three@0.185.1/node_modules/three/build/three.core.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$math$2f$OrientedBox$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/math/OrientedBox.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$math$2f$ExtendedTriangle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/math/ExtendedTriangle.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$utils$2f$TriangleUtilities$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/utils/TriangleUtilities.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$utils$2f$ArrayBoxUtilities$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/utils/ArrayBoxUtilities.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$nodeBufferUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/core/utils/nodeBufferUtils.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$BufferStack$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/core/utils/BufferStack.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$build$2f$geometryUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/core/build/geometryUtils.js [app-client] (ecmascript)");
;
;
;
;
;
;
;
;
/*****************************************************************/ /* This file is generated from "intersectsGeometry.template.js". */ /*****************************************************************/ /* eslint-disable indent */ const boundingBox = /* @__PURE__ */ new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Box3"]();
const triangle = /* @__PURE__ */ new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$math$2f$ExtendedTriangle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ExtendedTriangle"]();
const triangle2 = /* @__PURE__ */ new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$math$2f$ExtendedTriangle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ExtendedTriangle"]();
const invertedMat = /* @__PURE__ */ new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Matrix4"]();
const obb = /* @__PURE__ */ new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$math$2f$OrientedBox$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["OrientedBox"]();
const obb2 = /* @__PURE__ */ new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$math$2f$OrientedBox$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["OrientedBox"]();
function intersectsGeometry(bvh, root, otherGeometry, geometryToBvh) {
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$BufferStack$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BufferStack"].setBuffer(bvh._roots[root]);
    const result = _intersectsGeometry(0, bvh, otherGeometry, geometryToBvh);
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$BufferStack$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BufferStack"].clearBuffer();
    return result;
}
function _intersectsGeometry(nodeIndex32, bvh, otherGeometry, geometryToBvh, cachedObb = null) {
    const { float32Array, uint16Array, uint32Array } = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$BufferStack$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BufferStack"];
    let nodeIndex16 = nodeIndex32 * 2;
    if (cachedObb === null) {
        if (!otherGeometry.boundingBox) {
            otherGeometry.computeBoundingBox();
        }
        obb.set(otherGeometry.boundingBox.min, otherGeometry.boundingBox.max, geometryToBvh);
        cachedObb = obb;
    }
    const isLeaf = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$nodeBufferUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["IS_LEAF"])(nodeIndex16, uint16Array);
    if (isLeaf) {
        const thisGeometry = bvh.geometry;
        const thisIndex = thisGeometry.index;
        const thisPos = thisGeometry.attributes.position;
        const otherIndex = otherGeometry.index;
        const otherPos = otherGeometry.attributes.position;
        const offset = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$nodeBufferUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["OFFSET"])(nodeIndex32, uint32Array);
        const count = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$nodeBufferUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["COUNT"])(nodeIndex16, uint16Array);
        // get the inverse of the geometry matrix so we can transform our triangles into the
        // geometry space we're trying to test. We assume there are fewer triangles being checked
        // here.
        invertedMat.copy(geometryToBvh).invert();
        if (otherGeometry.boundsTree) {
            // if there's a bounds tree
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$utils$2f$ArrayBoxUtilities$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["arrayToBox"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$nodeBufferUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BOUNDING_DATA_INDEX"])(nodeIndex32), float32Array, obb2);
            obb2.matrix.copy(invertedMat);
            obb2.needsUpdate = true;
            // TODO: use a triangle iteration function here
            const res = otherGeometry.boundsTree.shapecast({
                intersectsBounds: (box)=>obb2.intersectsBox(box),
                intersectsTriangle: (tri)=>{
                    tri.a.applyMatrix4(geometryToBvh);
                    tri.b.applyMatrix4(geometryToBvh);
                    tri.c.applyMatrix4(geometryToBvh);
                    tri.needsUpdate = true;
                    for(let i = offset * 3, l = (count + offset) * 3; i < l; i += 3){
                        // this triangle needs to be transformed into the current BVH coordinate frame
                        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$utils$2f$TriangleUtilities$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["setTriangle"])(triangle2, i, thisIndex, thisPos);
                        triangle2.needsUpdate = true;
                        if (tri.intersectsTriangle(triangle2)) {
                            return true;
                        }
                    }
                    return false;
                }
            });
            return res;
        } else {
            // if we're just dealing with raw geometry
            const otherTriangleCount = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$build$2f$geometryUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getTriCount"])(otherGeometry);
            for(let i = offset * 3, l = (count + offset) * 3; i < l; i += 3){
                // this triangle needs to be transformed into the current BVH coordinate frame
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$utils$2f$TriangleUtilities$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["setTriangle"])(triangle, i, thisIndex, thisPos);
                triangle.a.applyMatrix4(invertedMat);
                triangle.b.applyMatrix4(invertedMat);
                triangle.c.applyMatrix4(invertedMat);
                triangle.needsUpdate = true;
                for(let i2 = 0, l2 = otherTriangleCount * 3; i2 < l2; i2 += 3){
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$utils$2f$TriangleUtilities$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["setTriangle"])(triangle2, i2, otherIndex, otherPos);
                    triangle2.needsUpdate = true;
                    if (triangle.intersectsTriangle(triangle2)) {
                        return true;
                    }
                }
            }
        }
    } else {
        const left = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$nodeBufferUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LEFT_NODE"])(nodeIndex32);
        const right = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$nodeBufferUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RIGHT_NODE"])(nodeIndex32, uint32Array);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$utils$2f$ArrayBoxUtilities$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["arrayToBox"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$nodeBufferUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BOUNDING_DATA_INDEX"])(left), float32Array, boundingBox);
        const leftIntersection = cachedObb.intersectsBox(boundingBox) && _intersectsGeometry(left, bvh, otherGeometry, geometryToBvh, cachedObb);
        if (leftIntersection) return true;
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$utils$2f$ArrayBoxUtilities$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["arrayToBox"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$nodeBufferUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BOUNDING_DATA_INDEX"])(right), float32Array, boundingBox);
        const rightIntersection = cachedObb.intersectsBox(boundingBox) && _intersectsGeometry(right, bvh, otherGeometry, geometryToBvh, cachedObb);
        if (rightIntersection) return true;
        return false;
    }
}
;
}),
"[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/core/cast/closestPointToGeometry.generated.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "closestPointToGeometry",
    ()=>closestPointToGeometry
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/three@0.185.1/node_modules/three/build/three.core.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$math$2f$OrientedBox$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/math/OrientedBox.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$utils$2f$TriangleUtilities$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/utils/TriangleUtilities.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$build$2f$geometryUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/core/build/geometryUtils.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$utils$2f$ExtendedTrianglePool$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/utils/ExtendedTrianglePool.js [app-client] (ecmascript)");
;
;
;
;
;
/*********************************************************************/ /* This file is generated from "closestPointToGeometry.template.js". */ /*********************************************************************/ const tempMatrix = /* @__PURE__ */ new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Matrix4"]();
const obb = /* @__PURE__ */ new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$math$2f$OrientedBox$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["OrientedBox"]();
const obb2 = /* @__PURE__ */ new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$math$2f$OrientedBox$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["OrientedBox"]();
const temp1 = /* @__PURE__ */ new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"]();
const temp2 = /* @__PURE__ */ new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"]();
const temp3 = /* @__PURE__ */ new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"]();
const temp4 = /* @__PURE__ */ new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"]();
function closestPointToGeometry(bvh, otherGeometry, geometryToBvh, target1 = {}, target2 = {}, minThreshold = 0, maxThreshold = Infinity) {
    if (!otherGeometry.boundingBox) {
        otherGeometry.computeBoundingBox();
    }
    obb.set(otherGeometry.boundingBox.min, otherGeometry.boundingBox.max, geometryToBvh);
    obb.needsUpdate = true;
    const geometry = bvh.geometry;
    const pos = geometry.attributes.position;
    const index = geometry.index;
    const otherPos = otherGeometry.attributes.position;
    const otherIndex = otherGeometry.index;
    const triangle = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$utils$2f$ExtendedTrianglePool$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ExtendedTrianglePool"].getPrimitive();
    const triangle2 = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$utils$2f$ExtendedTrianglePool$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ExtendedTrianglePool"].getPrimitive();
    let tempTarget1 = temp1;
    let tempTargetDest1 = temp2;
    let tempTarget2 = null;
    let tempTargetDest2 = null;
    if (target2) {
        tempTarget2 = temp3;
        tempTargetDest2 = temp4;
    }
    let closestDistance = Infinity;
    let closestDistanceTriIndex = null;
    let closestDistanceOtherTriIndex = null;
    tempMatrix.copy(geometryToBvh).invert();
    obb2.matrix.copy(tempMatrix);
    bvh.shapecast({
        boundsTraverseOrder: (box)=>{
            return obb.distanceToBox(box);
        },
        intersectsBounds: (box, isLeaf, score)=>{
            if (score < closestDistance && score < maxThreshold) {
                // if we know the triangles of this bounds will be intersected next then
                // save the bounds to use during triangle checks.
                if (isLeaf) {
                    obb2.min.copy(box.min);
                    obb2.max.copy(box.max);
                    obb2.needsUpdate = true;
                }
                return true;
            }
            return false;
        },
        intersectsRange: (offset, count)=>{
            if (otherGeometry.boundsTree) {
                // if the other geometry has a bvh then use the accelerated path where we use shapecast to find
                // the closest bounds in the other geometry to check.
                const otherBvh = otherGeometry.boundsTree;
                return otherBvh.shapecast({
                    boundsTraverseOrder: (box)=>{
                        return obb2.distanceToBox(box);
                    },
                    intersectsBounds: (box, isLeaf, score)=>{
                        return score < closestDistance && score < maxThreshold;
                    },
                    intersectsRange: (otherOffset, otherCount)=>{
                        for(let i2 = otherOffset, l2 = otherOffset + otherCount; i2 < l2; i2++){
                            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$utils$2f$TriangleUtilities$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["setTriangle"])(triangle2, 3 * i2, otherIndex, otherPos);
                            triangle2.a.applyMatrix4(geometryToBvh);
                            triangle2.b.applyMatrix4(geometryToBvh);
                            triangle2.c.applyMatrix4(geometryToBvh);
                            triangle2.needsUpdate = true;
                            for(let i = offset, l = offset + count; i < l; i++){
                                (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$utils$2f$TriangleUtilities$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["setTriangle"])(triangle, 3 * i, index, pos);
                                triangle.needsUpdate = true;
                                const dist = triangle.distanceToTriangle(triangle2, tempTarget1, tempTarget2);
                                if (dist < closestDistance) {
                                    tempTargetDest1.copy(tempTarget1);
                                    if (tempTargetDest2) {
                                        tempTargetDest2.copy(tempTarget2);
                                    }
                                    closestDistance = dist;
                                    closestDistanceTriIndex = i;
                                    closestDistanceOtherTriIndex = i2;
                                }
                                // stop traversal if we find a point that's under the given threshold
                                if (dist < minThreshold) {
                                    return true;
                                }
                            }
                        }
                    }
                });
            } else {
                // If no bounds tree then we'll just check every triangle.
                const triCount = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$build$2f$geometryUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getTriCount"])(otherGeometry);
                for(let i2 = 0, l2 = triCount; i2 < l2; i2++){
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$utils$2f$TriangleUtilities$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["setTriangle"])(triangle2, 3 * i2, otherIndex, otherPos);
                    triangle2.a.applyMatrix4(geometryToBvh);
                    triangle2.b.applyMatrix4(geometryToBvh);
                    triangle2.c.applyMatrix4(geometryToBvh);
                    triangle2.needsUpdate = true;
                    for(let i = offset, l = offset + count; i < l; i++){
                        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$utils$2f$TriangleUtilities$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["setTriangle"])(triangle, 3 * i, index, pos);
                        triangle.needsUpdate = true;
                        const dist = triangle.distanceToTriangle(triangle2, tempTarget1, tempTarget2);
                        if (dist < closestDistance) {
                            tempTargetDest1.copy(tempTarget1);
                            if (tempTargetDest2) {
                                tempTargetDest2.copy(tempTarget2);
                            }
                            closestDistance = dist;
                            closestDistanceTriIndex = i;
                            closestDistanceOtherTriIndex = i2;
                        }
                        // stop traversal if we find a point that's under the given threshold
                        if (dist < minThreshold) {
                            return true;
                        }
                    }
                }
            }
        }
    });
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$utils$2f$ExtendedTrianglePool$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ExtendedTrianglePool"].releasePrimitive(triangle);
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$utils$2f$ExtendedTrianglePool$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ExtendedTrianglePool"].releasePrimitive(triangle2);
    if (closestDistance === Infinity) {
        return null;
    }
    if (!target1.point) {
        target1.point = tempTargetDest1.clone();
    } else {
        target1.point.copy(tempTargetDest1);
    }
    target1.distance = closestDistance, target1.faceIndex = closestDistanceTriIndex;
    if (target2) {
        if (!target2.point) target2.point = tempTargetDest2.clone();
        else target2.point.copy(tempTargetDest2);
        target2.point.applyMatrix4(tempMatrix);
        tempTargetDest1.applyMatrix4(tempMatrix);
        target2.distance = tempTargetDest1.sub(target2.point).length();
        target2.faceIndex = closestDistanceOtherTriIndex;
    }
    return target1;
}
;
}),
"[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/core/utils/iterationUtils_indirect.generated.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "intersectClosestTri_indirect",
    ()=>intersectClosestTri_indirect,
    "intersectTris_indirect",
    ()=>intersectTris_indirect,
    "iterateOverTriangles_indirect",
    ()=>iterateOverTriangles_indirect
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$utils$2f$ThreeRayIntersectUtilities$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/utils/ThreeRayIntersectUtilities.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$utils$2f$TriangleUtilities$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/utils/TriangleUtilities.js [app-client] (ecmascript)");
;
;
/*************************************************************/ /* This file is generated from "iterationUtils.template.js". */ /*************************************************************/ function intersectTris_indirect(bvh, materialOrSide, ray, offset, count, intersections, near, far) {
    const { geometry, _indirectBuffer } = bvh;
    for(let i = offset, end = offset + count; i < end; i++){
        let vi = _indirectBuffer ? _indirectBuffer[i] : i;
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$utils$2f$ThreeRayIntersectUtilities$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["intersectTri"])(geometry, materialOrSide, ray, vi, intersections, near, far);
    }
}
function intersectClosestTri_indirect(bvh, materialOrSide, ray, offset, count, near, far) {
    const { geometry, _indirectBuffer } = bvh;
    let dist = Infinity;
    let res = null;
    for(let i = offset, end = offset + count; i < end; i++){
        let intersection;
        intersection = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$utils$2f$ThreeRayIntersectUtilities$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["intersectTri"])(geometry, materialOrSide, ray, _indirectBuffer ? _indirectBuffer[i] : i, null, near, far);
        if (intersection && intersection.distance < dist) {
            res = intersection;
            dist = intersection.distance;
        }
    }
    return res;
}
function iterateOverTriangles_indirect(offset, count, bvh, intersectsTriangleFunc, contained, depth, triangle) {
    const { geometry } = bvh;
    const { index } = geometry;
    const pos = geometry.attributes.position;
    for(let i = offset, l = count + offset; i < l; i++){
        let tri;
        tri = bvh.resolveTriangleIndex(i);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$utils$2f$TriangleUtilities$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["setTriangle"])(triangle, tri * 3, index, pos);
        triangle.needsUpdate = true;
        if (intersectsTriangleFunc(triangle, tri, contained, depth)) {
            return true;
        }
    }
    return false;
}
;
}),
"[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/core/cast/refit_indirect.generated.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "refit_indirect",
    ()=>refit_indirect
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$Constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/core/Constants.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$nodeBufferUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/core/utils/nodeBufferUtils.js [app-client] (ecmascript)");
;
;
/****************************************************/ /* This file is generated from "refit.template.js". */ /****************************************************/ function refit_indirect(bvh, nodeIndices = null) {
    if (nodeIndices && Array.isArray(nodeIndices)) {
        nodeIndices = new Set(nodeIndices);
    }
    const geometry = bvh.geometry;
    const indexArr = geometry.index ? geometry.index.array : null;
    const posAttr = geometry.attributes.position;
    let buffer, uint32Array, uint16Array, float32Array;
    let byteOffset = 0;
    const roots = bvh._roots;
    for(let i = 0, l = roots.length; i < l; i++){
        buffer = roots[i];
        uint32Array = new Uint32Array(buffer);
        uint16Array = new Uint16Array(buffer);
        float32Array = new Float32Array(buffer);
        _traverse(0, byteOffset);
        byteOffset += buffer.byteLength;
    }
    function _traverse(nodeIndex32, byteOffset, force = false) {
        const nodeIndex16 = nodeIndex32 * 2;
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$nodeBufferUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["IS_LEAF"])(nodeIndex16, uint16Array)) {
            const offset = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$nodeBufferUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["OFFSET"])(nodeIndex32, uint32Array);
            const count = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$nodeBufferUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["COUNT"])(nodeIndex16, uint16Array);
            let minx = Infinity;
            let miny = Infinity;
            let minz = Infinity;
            let maxx = -Infinity;
            let maxy = -Infinity;
            let maxz = -Infinity;
            for(let i = offset, l = offset + count; i < l; i++){
                const t = 3 * bvh.resolveTriangleIndex(i);
                for(let j = 0; j < 3; j++){
                    let index = t + j;
                    index = indexArr ? indexArr[index] : index;
                    const x = posAttr.getX(index);
                    const y = posAttr.getY(index);
                    const z = posAttr.getZ(index);
                    if (x < minx) minx = x;
                    if (x > maxx) maxx = x;
                    if (y < miny) miny = y;
                    if (y > maxy) maxy = y;
                    if (z < minz) minz = z;
                    if (z > maxz) maxz = z;
                }
            }
            if (float32Array[nodeIndex32 + 0] !== minx || float32Array[nodeIndex32 + 1] !== miny || float32Array[nodeIndex32 + 2] !== minz || float32Array[nodeIndex32 + 3] !== maxx || float32Array[nodeIndex32 + 4] !== maxy || float32Array[nodeIndex32 + 5] !== maxz) {
                float32Array[nodeIndex32 + 0] = minx;
                float32Array[nodeIndex32 + 1] = miny;
                float32Array[nodeIndex32 + 2] = minz;
                float32Array[nodeIndex32 + 3] = maxx;
                float32Array[nodeIndex32 + 4] = maxy;
                float32Array[nodeIndex32 + 5] = maxz;
                return true;
            } else {
                return false;
            }
        } else {
            const left = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$nodeBufferUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LEFT_NODE"])(nodeIndex32);
            const right = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$nodeBufferUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RIGHT_NODE"])(nodeIndex32, uint32Array);
            // the identifying node indices provided by the shapecast function include offsets of all
            // root buffers to guarantee they're unique between roots so offset left and right indices here.
            let forceChildren = force;
            let includesLeft = false;
            let includesRight = false;
            if (nodeIndices) {
                // if we see that neither the left or right child are included in the set that need to be updated
                // then we assume that all children need to be updated.
                if (!forceChildren) {
                    const leftNodeId = left / __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$Constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["UINT32_PER_NODE"] + byteOffset / __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$Constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BYTES_PER_NODE"];
                    const rightNodeId = right / __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$Constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["UINT32_PER_NODE"] + byteOffset / __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$Constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BYTES_PER_NODE"];
                    includesLeft = nodeIndices.has(leftNodeId);
                    includesRight = nodeIndices.has(rightNodeId);
                    forceChildren = !includesLeft && !includesRight;
                }
            } else {
                includesLeft = true;
                includesRight = true;
            }
            const traverseLeft = forceChildren || includesLeft;
            const traverseRight = forceChildren || includesRight;
            let leftChange = false;
            if (traverseLeft) {
                leftChange = _traverse(left, byteOffset, forceChildren);
            }
            let rightChange = false;
            if (traverseRight) {
                rightChange = _traverse(right, byteOffset, forceChildren);
            }
            const didChange = leftChange || rightChange;
            if (didChange) {
                for(let i = 0; i < 3; i++){
                    const left_i = left + i;
                    const right_i = right + i;
                    const minLeftValue = float32Array[left_i];
                    const maxLeftValue = float32Array[left_i + 3];
                    const minRightValue = float32Array[right_i];
                    const maxRightValue = float32Array[right_i + 3];
                    float32Array[nodeIndex32 + i] = minLeftValue < minRightValue ? minLeftValue : minRightValue;
                    float32Array[nodeIndex32 + i + 3] = maxLeftValue > maxRightValue ? maxLeftValue : maxRightValue;
                }
            }
            return didChange;
        }
    }
}
;
}),
"[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/core/cast/raycast_indirect.generated.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "raycast_indirect",
    ()=>raycast_indirect
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$intersectUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/core/utils/intersectUtils.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$nodeBufferUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/core/utils/nodeBufferUtils.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$BufferStack$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/core/utils/BufferStack.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$iterationUtils_indirect$2e$generated$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/core/utils/iterationUtils_indirect.generated.js [app-client] (ecmascript)");
;
;
;
;
;
/******************************************************/ /* This file is generated from "raycast.template.js". */ /******************************************************/ function raycast_indirect(bvh, root, materialOrSide, ray, intersects, near, far) {
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$BufferStack$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BufferStack"].setBuffer(bvh._roots[root]);
    _raycast(0, bvh, materialOrSide, ray, intersects, near, far);
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$BufferStack$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BufferStack"].clearBuffer();
}
function _raycast(nodeIndex32, bvh, materialOrSide, ray, intersects, near, far) {
    const { float32Array, uint16Array, uint32Array } = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$BufferStack$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BufferStack"];
    const nodeIndex16 = nodeIndex32 * 2;
    const isLeaf = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$nodeBufferUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["IS_LEAF"])(nodeIndex16, uint16Array);
    if (isLeaf) {
        const offset = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$nodeBufferUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["OFFSET"])(nodeIndex32, uint32Array);
        const count = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$nodeBufferUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["COUNT"])(nodeIndex16, uint16Array);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$iterationUtils_indirect$2e$generated$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["intersectTris_indirect"])(bvh, materialOrSide, ray, offset, count, intersects, near, far);
    } else {
        const leftIndex = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$nodeBufferUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LEFT_NODE"])(nodeIndex32);
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$intersectUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["intersectsNodeBounds"])(leftIndex, float32Array, ray, near, far)) {
            _raycast(leftIndex, bvh, materialOrSide, ray, intersects, near, far);
        }
        const rightIndex = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$nodeBufferUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RIGHT_NODE"])(nodeIndex32, uint32Array);
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$intersectUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["intersectsNodeBounds"])(rightIndex, float32Array, ray, near, far)) {
            _raycast(rightIndex, bvh, materialOrSide, ray, intersects, near, far);
        }
    }
}
;
}),
"[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/core/cast/raycastFirst_indirect.generated.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "raycastFirst_indirect",
    ()=>raycastFirst_indirect
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$nodeBufferUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/core/utils/nodeBufferUtils.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$BufferStack$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/core/utils/BufferStack.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$intersectUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/core/utils/intersectUtils.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$iterationUtils_indirect$2e$generated$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/core/utils/iterationUtils_indirect.generated.js [app-client] (ecmascript)");
;
;
;
;
;
/***********************************************************/ /* This file is generated from "raycastFirst.template.js". */ /***********************************************************/ const _xyzFields = [
    'x',
    'y',
    'z'
];
function raycastFirst_indirect(bvh, root, materialOrSide, ray, near, far) {
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$BufferStack$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BufferStack"].setBuffer(bvh._roots[root]);
    const result = _raycastFirst(0, bvh, materialOrSide, ray, near, far);
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$BufferStack$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BufferStack"].clearBuffer();
    return result;
}
function _raycastFirst(nodeIndex32, bvh, materialOrSide, ray, near, far) {
    const { float32Array, uint16Array, uint32Array } = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$BufferStack$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BufferStack"];
    let nodeIndex16 = nodeIndex32 * 2;
    const isLeaf = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$nodeBufferUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["IS_LEAF"])(nodeIndex16, uint16Array);
    if (isLeaf) {
        const offset = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$nodeBufferUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["OFFSET"])(nodeIndex32, uint32Array);
        const count = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$nodeBufferUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["COUNT"])(nodeIndex16, uint16Array);
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$iterationUtils_indirect$2e$generated$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["intersectClosestTri_indirect"])(bvh, materialOrSide, ray, offset, count, near, far);
    } else {
        // consider the position of the split plane with respect to the oncoming ray; whichever direction
        // the ray is coming from, look for an intersection among that side of the tree first
        const splitAxis = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$nodeBufferUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SPLIT_AXIS"])(nodeIndex32, uint32Array);
        const xyzAxis = _xyzFields[splitAxis];
        const rayDir = ray.direction[xyzAxis];
        const leftToRight = rayDir >= 0;
        // c1 is the child to check first
        let c1, c2;
        if (leftToRight) {
            c1 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$nodeBufferUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LEFT_NODE"])(nodeIndex32);
            c2 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$nodeBufferUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RIGHT_NODE"])(nodeIndex32, uint32Array);
        } else {
            c1 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$nodeBufferUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RIGHT_NODE"])(nodeIndex32, uint32Array);
            c2 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$nodeBufferUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LEFT_NODE"])(nodeIndex32);
        }
        const c1Intersection = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$intersectUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["intersectsNodeBounds"])(c1, float32Array, ray, near, far);
        const c1Result = c1Intersection ? _raycastFirst(c1, bvh, materialOrSide, ray, near, far) : null;
        // if we got an intersection in the first node and it's closer than the second node's bounding
        // box, we don't need to consider the second node because it couldn't possibly be a better result
        if (c1Result) {
            // check if the point is within the second bounds
            // "point" is in the local frame of the bvh
            const point = c1Result.point[xyzAxis];
            const isOutside = leftToRight ? point <= float32Array[c2 + splitAxis] : point >= float32Array[c2 + splitAxis + 3]; // max bounding data
            if (isOutside) {
                return c1Result;
            }
        }
        // either there was no intersection in the first node, or there could still be a closer
        // intersection in the second, so check the second node and then take the better of the two
        const c2Intersection = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$intersectUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["intersectsNodeBounds"])(c2, float32Array, ray, near, far);
        const c2Result = c2Intersection ? _raycastFirst(c2, bvh, materialOrSide, ray, near, far) : null;
        if (c1Result && c2Result) {
            return c1Result.distance <= c2Result.distance ? c1Result : c2Result;
        } else {
            return c1Result || c2Result || null;
        }
    }
}
;
}),
"[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/core/cast/intersectsGeometry_indirect.generated.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "intersectsGeometry_indirect",
    ()=>intersectsGeometry_indirect
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/three@0.185.1/node_modules/three/build/three.core.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$math$2f$OrientedBox$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/math/OrientedBox.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$math$2f$ExtendedTriangle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/math/ExtendedTriangle.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$utils$2f$TriangleUtilities$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/utils/TriangleUtilities.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$utils$2f$ArrayBoxUtilities$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/utils/ArrayBoxUtilities.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$nodeBufferUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/core/utils/nodeBufferUtils.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$BufferStack$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/core/utils/BufferStack.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$build$2f$geometryUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/core/build/geometryUtils.js [app-client] (ecmascript)");
;
;
;
;
;
;
;
;
/*****************************************************************/ /* This file is generated from "intersectsGeometry.template.js". */ /*****************************************************************/ /* eslint-disable indent */ const boundingBox = /* @__PURE__ */ new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Box3"]();
const triangle = /* @__PURE__ */ new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$math$2f$ExtendedTriangle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ExtendedTriangle"]();
const triangle2 = /* @__PURE__ */ new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$math$2f$ExtendedTriangle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ExtendedTriangle"]();
const invertedMat = /* @__PURE__ */ new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Matrix4"]();
const obb = /* @__PURE__ */ new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$math$2f$OrientedBox$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["OrientedBox"]();
const obb2 = /* @__PURE__ */ new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$math$2f$OrientedBox$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["OrientedBox"]();
function intersectsGeometry_indirect(bvh, root, otherGeometry, geometryToBvh) {
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$BufferStack$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BufferStack"].setBuffer(bvh._roots[root]);
    const result = _intersectsGeometry(0, bvh, otherGeometry, geometryToBvh);
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$BufferStack$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BufferStack"].clearBuffer();
    return result;
}
function _intersectsGeometry(nodeIndex32, bvh, otherGeometry, geometryToBvh, cachedObb = null) {
    const { float32Array, uint16Array, uint32Array } = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$BufferStack$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BufferStack"];
    let nodeIndex16 = nodeIndex32 * 2;
    if (cachedObb === null) {
        if (!otherGeometry.boundingBox) {
            otherGeometry.computeBoundingBox();
        }
        obb.set(otherGeometry.boundingBox.min, otherGeometry.boundingBox.max, geometryToBvh);
        cachedObb = obb;
    }
    const isLeaf = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$nodeBufferUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["IS_LEAF"])(nodeIndex16, uint16Array);
    if (isLeaf) {
        const thisGeometry = bvh.geometry;
        const thisIndex = thisGeometry.index;
        const thisPos = thisGeometry.attributes.position;
        const otherIndex = otherGeometry.index;
        const otherPos = otherGeometry.attributes.position;
        const offset = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$nodeBufferUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["OFFSET"])(nodeIndex32, uint32Array);
        const count = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$nodeBufferUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["COUNT"])(nodeIndex16, uint16Array);
        // get the inverse of the geometry matrix so we can transform our triangles into the
        // geometry space we're trying to test. We assume there are fewer triangles being checked
        // here.
        invertedMat.copy(geometryToBvh).invert();
        if (otherGeometry.boundsTree) {
            // if there's a bounds tree
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$utils$2f$ArrayBoxUtilities$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["arrayToBox"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$nodeBufferUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BOUNDING_DATA_INDEX"])(nodeIndex32), float32Array, obb2);
            obb2.matrix.copy(invertedMat);
            obb2.needsUpdate = true;
            // TODO: use a triangle iteration function here
            const res = otherGeometry.boundsTree.shapecast({
                intersectsBounds: (box)=>obb2.intersectsBox(box),
                intersectsTriangle: (tri)=>{
                    tri.a.applyMatrix4(geometryToBvh);
                    tri.b.applyMatrix4(geometryToBvh);
                    tri.c.applyMatrix4(geometryToBvh);
                    tri.needsUpdate = true;
                    for(let i = offset, l = count + offset; i < l; i++){
                        // this triangle needs to be transformed into the current BVH coordinate frame
                        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$utils$2f$TriangleUtilities$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["setTriangle"])(triangle2, 3 * bvh.resolveTriangleIndex(i), thisIndex, thisPos);
                        triangle2.needsUpdate = true;
                        if (tri.intersectsTriangle(triangle2)) {
                            return true;
                        }
                    }
                    return false;
                }
            });
            return res;
        } else {
            // if we're just dealing with raw geometry
            const otherTriangleCount = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$build$2f$geometryUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getTriCount"])(otherGeometry);
            for(let i = offset, l = count + offset; i < l; i++){
                // this triangle needs to be transformed into the current BVH coordinate frame
                const ti = bvh.resolveTriangleIndex(i);
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$utils$2f$TriangleUtilities$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["setTriangle"])(triangle, 3 * ti, thisIndex, thisPos);
                triangle.a.applyMatrix4(invertedMat);
                triangle.b.applyMatrix4(invertedMat);
                triangle.c.applyMatrix4(invertedMat);
                triangle.needsUpdate = true;
                for(let i2 = 0, l2 = otherTriangleCount * 3; i2 < l2; i2 += 3){
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$utils$2f$TriangleUtilities$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["setTriangle"])(triangle2, i2, otherIndex, otherPos);
                    triangle2.needsUpdate = true;
                    if (triangle.intersectsTriangle(triangle2)) {
                        return true;
                    }
                }
            }
        }
    } else {
        const left = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$nodeBufferUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LEFT_NODE"])(nodeIndex32);
        const right = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$nodeBufferUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RIGHT_NODE"])(nodeIndex32, uint32Array);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$utils$2f$ArrayBoxUtilities$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["arrayToBox"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$nodeBufferUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BOUNDING_DATA_INDEX"])(left), float32Array, boundingBox);
        const leftIntersection = cachedObb.intersectsBox(boundingBox) && _intersectsGeometry(left, bvh, otherGeometry, geometryToBvh, cachedObb);
        if (leftIntersection) return true;
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$utils$2f$ArrayBoxUtilities$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["arrayToBox"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$nodeBufferUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BOUNDING_DATA_INDEX"])(right), float32Array, boundingBox);
        const rightIntersection = cachedObb.intersectsBox(boundingBox) && _intersectsGeometry(right, bvh, otherGeometry, geometryToBvh, cachedObb);
        if (rightIntersection) return true;
        return false;
    }
}
;
}),
"[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/core/cast/closestPointToGeometry_indirect.generated.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "closestPointToGeometry_indirect",
    ()=>closestPointToGeometry_indirect
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/three@0.185.1/node_modules/three/build/three.core.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$math$2f$OrientedBox$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/math/OrientedBox.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$utils$2f$TriangleUtilities$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/utils/TriangleUtilities.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$build$2f$geometryUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/core/build/geometryUtils.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$utils$2f$ExtendedTrianglePool$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/utils/ExtendedTrianglePool.js [app-client] (ecmascript)");
;
;
;
;
;
/*********************************************************************/ /* This file is generated from "closestPointToGeometry.template.js". */ /*********************************************************************/ const tempMatrix = /* @__PURE__ */ new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Matrix4"]();
const obb = /* @__PURE__ */ new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$math$2f$OrientedBox$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["OrientedBox"]();
const obb2 = /* @__PURE__ */ new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$math$2f$OrientedBox$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["OrientedBox"]();
const temp1 = /* @__PURE__ */ new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"]();
const temp2 = /* @__PURE__ */ new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"]();
const temp3 = /* @__PURE__ */ new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"]();
const temp4 = /* @__PURE__ */ new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"]();
function closestPointToGeometry_indirect(bvh, otherGeometry, geometryToBvh, target1 = {}, target2 = {}, minThreshold = 0, maxThreshold = Infinity) {
    if (!otherGeometry.boundingBox) {
        otherGeometry.computeBoundingBox();
    }
    obb.set(otherGeometry.boundingBox.min, otherGeometry.boundingBox.max, geometryToBvh);
    obb.needsUpdate = true;
    const geometry = bvh.geometry;
    const pos = geometry.attributes.position;
    const index = geometry.index;
    const otherPos = otherGeometry.attributes.position;
    const otherIndex = otherGeometry.index;
    const triangle = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$utils$2f$ExtendedTrianglePool$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ExtendedTrianglePool"].getPrimitive();
    const triangle2 = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$utils$2f$ExtendedTrianglePool$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ExtendedTrianglePool"].getPrimitive();
    let tempTarget1 = temp1;
    let tempTargetDest1 = temp2;
    let tempTarget2 = null;
    let tempTargetDest2 = null;
    if (target2) {
        tempTarget2 = temp3;
        tempTargetDest2 = temp4;
    }
    let closestDistance = Infinity;
    let closestDistanceTriIndex = null;
    let closestDistanceOtherTriIndex = null;
    tempMatrix.copy(geometryToBvh).invert();
    obb2.matrix.copy(tempMatrix);
    bvh.shapecast({
        boundsTraverseOrder: (box)=>{
            return obb.distanceToBox(box);
        },
        intersectsBounds: (box, isLeaf, score)=>{
            if (score < closestDistance && score < maxThreshold) {
                // if we know the triangles of this bounds will be intersected next then
                // save the bounds to use during triangle checks.
                if (isLeaf) {
                    obb2.min.copy(box.min);
                    obb2.max.copy(box.max);
                    obb2.needsUpdate = true;
                }
                return true;
            }
            return false;
        },
        intersectsRange: (offset, count)=>{
            if (otherGeometry.boundsTree) {
                // if the other geometry has a bvh then use the accelerated path where we use shapecast to find
                // the closest bounds in the other geometry to check.
                const otherBvh = otherGeometry.boundsTree;
                return otherBvh.shapecast({
                    boundsTraverseOrder: (box)=>{
                        return obb2.distanceToBox(box);
                    },
                    intersectsBounds: (box, isLeaf, score)=>{
                        return score < closestDistance && score < maxThreshold;
                    },
                    intersectsRange: (otherOffset, otherCount)=>{
                        for(let i2 = otherOffset, l2 = otherOffset + otherCount; i2 < l2; i2++){
                            const ti2 = otherBvh.resolveTriangleIndex(i2);
                            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$utils$2f$TriangleUtilities$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["setTriangle"])(triangle2, 3 * ti2, otherIndex, otherPos);
                            triangle2.a.applyMatrix4(geometryToBvh);
                            triangle2.b.applyMatrix4(geometryToBvh);
                            triangle2.c.applyMatrix4(geometryToBvh);
                            triangle2.needsUpdate = true;
                            for(let i = offset, l = offset + count; i < l; i++){
                                const ti = bvh.resolveTriangleIndex(i);
                                (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$utils$2f$TriangleUtilities$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["setTriangle"])(triangle, 3 * ti, index, pos);
                                triangle.needsUpdate = true;
                                const dist = triangle.distanceToTriangle(triangle2, tempTarget1, tempTarget2);
                                if (dist < closestDistance) {
                                    tempTargetDest1.copy(tempTarget1);
                                    if (tempTargetDest2) {
                                        tempTargetDest2.copy(tempTarget2);
                                    }
                                    closestDistance = dist;
                                    closestDistanceTriIndex = i;
                                    closestDistanceOtherTriIndex = i2;
                                }
                                // stop traversal if we find a point that's under the given threshold
                                if (dist < minThreshold) {
                                    return true;
                                }
                            }
                        }
                    }
                });
            } else {
                // If no bounds tree then we'll just check every triangle.
                const triCount = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$build$2f$geometryUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getTriCount"])(otherGeometry);
                for(let i2 = 0, l2 = triCount; i2 < l2; i2++){
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$utils$2f$TriangleUtilities$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["setTriangle"])(triangle2, 3 * i2, otherIndex, otherPos);
                    triangle2.a.applyMatrix4(geometryToBvh);
                    triangle2.b.applyMatrix4(geometryToBvh);
                    triangle2.c.applyMatrix4(geometryToBvh);
                    triangle2.needsUpdate = true;
                    for(let i = offset, l = offset + count; i < l; i++){
                        const ti = bvh.resolveTriangleIndex(i);
                        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$utils$2f$TriangleUtilities$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["setTriangle"])(triangle, 3 * ti, index, pos);
                        triangle.needsUpdate = true;
                        const dist = triangle.distanceToTriangle(triangle2, tempTarget1, tempTarget2);
                        if (dist < closestDistance) {
                            tempTargetDest1.copy(tempTarget1);
                            if (tempTargetDest2) {
                                tempTargetDest2.copy(tempTarget2);
                            }
                            closestDistance = dist;
                            closestDistanceTriIndex = i;
                            closestDistanceOtherTriIndex = i2;
                        }
                        // stop traversal if we find a point that's under the given threshold
                        if (dist < minThreshold) {
                            return true;
                        }
                    }
                }
            }
        }
    });
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$utils$2f$ExtendedTrianglePool$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ExtendedTrianglePool"].releasePrimitive(triangle);
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$utils$2f$ExtendedTrianglePool$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ExtendedTrianglePool"].releasePrimitive(triangle2);
    if (closestDistance === Infinity) {
        return null;
    }
    if (!target1.point) {
        target1.point = tempTargetDest1.clone();
    } else {
        target1.point.copy(tempTargetDest1);
    }
    target1.distance = closestDistance, target1.faceIndex = closestDistanceTriIndex;
    if (target2) {
        if (!target2.point) target2.point = tempTargetDest2.clone();
        else target2.point.copy(tempTargetDest2);
        target2.point.applyMatrix4(tempMatrix);
        tempTargetDest1.applyMatrix4(tempMatrix);
        target2.distance = tempTargetDest1.sub(target2.point).length();
        target2.faceIndex = closestDistanceOtherTriIndex;
    }
    return target1;
}
;
}),
"[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/utils/GeometryRayIntersectUtilities.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// converts the given BVH raycast intersection to align with the three.js raycast
// structure (include object, world space distance and point).
__turbopack_context__.s([
    "convertRaycastIntersect",
    ()=>convertRaycastIntersect
]);
function convertRaycastIntersect(hit, object, raycaster) {
    if (hit === null) {
        return null;
    }
    hit.point.applyMatrix4(object.matrixWorld);
    hit.distance = hit.point.distanceTo(raycaster.ray.origin);
    hit.object = object;
    return hit;
}
}),
"[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/utils/BufferUtils.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "convertToBufferType",
    ()=>convertToBufferType,
    "isSharedArrayBufferSupported",
    ()=>isSharedArrayBufferSupported
]);
function isSharedArrayBufferSupported() {
    return typeof SharedArrayBuffer !== 'undefined';
}
function convertToBufferType(array, BufferConstructor) {
    if (array === null) {
        return array;
    } else if (array.buffer) {
        const buffer = array.buffer;
        if (buffer.constructor === BufferConstructor) {
            return array;
        }
        const ArrayConstructor = array.constructor;
        const result = new ArrayConstructor(new BufferConstructor(buffer.byteLength));
        result.set(array);
        return result;
    } else {
        if (array.constructor === BufferConstructor) {
            return array;
        }
        const result = new BufferConstructor(array.byteLength);
        new Uint8Array(result).set(new Uint8Array(array));
        return result;
    }
}
}),
"[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/core/build/computeBoundsUtils.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// computes the union of the bounds of all of the given primitives and puts the resulting box in "target".
// A bounding box is computed for the centroids of the primitives, as well, and placed in "centroidTarget".
// These are computed together to avoid redundant accesses to bounds array.
__turbopack_context__.s([
    "getBounds",
    ()=>getBounds
]);
function getBounds(primitiveBounds, offset, count, target, centroidTarget) {
    let minx = Infinity;
    let miny = Infinity;
    let minz = Infinity;
    let maxx = -Infinity;
    let maxy = -Infinity;
    let maxz = -Infinity;
    let cminx = Infinity;
    let cminy = Infinity;
    let cminz = Infinity;
    let cmaxx = -Infinity;
    let cmaxy = -Infinity;
    let cmaxz = -Infinity;
    const boundsOffset = primitiveBounds.offset || 0;
    for(let i = (offset - boundsOffset) * 6, end = (offset + count - boundsOffset) * 6; i < end; i += 6){
        const cx = primitiveBounds[i + 0];
        const hx = primitiveBounds[i + 1];
        const lx = cx - hx;
        const rx = cx + hx;
        if (lx < minx) minx = lx;
        if (rx > maxx) maxx = rx;
        if (cx < cminx) cminx = cx;
        if (cx > cmaxx) cmaxx = cx;
        const cy = primitiveBounds[i + 2];
        const hy = primitiveBounds[i + 3];
        const ly = cy - hy;
        const ry = cy + hy;
        if (ly < miny) miny = ly;
        if (ry > maxy) maxy = ry;
        if (cy < cminy) cminy = cy;
        if (cy > cmaxy) cmaxy = cy;
        const cz = primitiveBounds[i + 4];
        const hz = primitiveBounds[i + 5];
        const lz = cz - hz;
        const rz = cz + hz;
        if (lz < minz) minz = lz;
        if (rz > maxz) maxz = rz;
        if (cz < cminz) cminz = cz;
        if (cz > cmaxz) cmaxz = cz;
    }
    target[0] = minx;
    target[1] = miny;
    target[2] = minz;
    target[3] = maxx;
    target[4] = maxy;
    target[5] = maxz;
    centroidTarget[0] = cminx;
    centroidTarget[1] = cminy;
    centroidTarget[2] = cminz;
    centroidTarget[3] = cmaxx;
    centroidTarget[4] = cmaxy;
    centroidTarget[5] = cmaxz;
}
}),
"[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/core/build/splitUtils.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getOptimalSplit",
    ()=>getOptimalSplit
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$utils$2f$ArrayBoxUtilities$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/utils/ArrayBoxUtilities.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$Constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/core/Constants.js [app-client] (ecmascript)");
;
;
const BIN_COUNT = 32;
const binsSort = (a, b)=>a.candidate - b.candidate;
const sahBins = /* @__PURE__ */ new Array(BIN_COUNT).fill().map(()=>{
    return {
        count: 0,
        bounds: new Float32Array(6),
        rightCacheBounds: new Float32Array(6),
        leftCacheBounds: new Float32Array(6),
        candidate: 0
    };
});
const leftBounds = /* @__PURE__ */ new Float32Array(6);
function getOptimalSplit(nodeBoundingData, centroidBoundingData, primitiveBounds, offset, count, strategy) {
    let axis = -1;
    let pos = 0;
    // Center
    if (strategy === __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$Constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CENTER"]) {
        axis = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$utils$2f$ArrayBoxUtilities$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getLongestEdgeIndex"])(centroidBoundingData);
        if (axis !== -1) {
            pos = (centroidBoundingData[axis] + centroidBoundingData[axis + 3]) / 2;
        }
    } else if (strategy === __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$Constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AVERAGE"]) {
        axis = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$utils$2f$ArrayBoxUtilities$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getLongestEdgeIndex"])(nodeBoundingData);
        if (axis !== -1) {
            pos = getAverage(primitiveBounds, offset, count, axis);
        }
    } else if (strategy === __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$Constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SAH"]) {
        const rootSurfaceArea = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$utils$2f$ArrayBoxUtilities$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["computeSurfaceArea"])(nodeBoundingData);
        let bestCost = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$Constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PRIMITIVE_INTERSECT_COST"] * count;
        // iterate over all axes
        const boundsOffset = primitiveBounds.offset || 0;
        const cStart = (offset - boundsOffset) * 6;
        const cEnd = (offset + count - boundsOffset) * 6;
        for(let a = 0; a < 3; a++){
            const axisLeft = centroidBoundingData[a];
            const axisRight = centroidBoundingData[a + 3];
            const axisLength = axisRight - axisLeft;
            const binWidth = axisLength / BIN_COUNT;
            // If we have fewer primitives than we're planning to split then just check all
            // the primitive positions because it will be faster.
            if (count < BIN_COUNT / 4) {
                // initialize the bin candidates
                const truncatedBins = [
                    ...sahBins
                ];
                truncatedBins.length = count;
                // set the candidates
                let b = 0;
                for(let c = cStart; c < cEnd; c += 6, b++){
                    const bin = truncatedBins[b];
                    bin.candidate = primitiveBounds[c + 2 * a];
                    bin.count = 0;
                    const { bounds, leftCacheBounds, rightCacheBounds } = bin;
                    for(let d = 0; d < 3; d++){
                        rightCacheBounds[d] = Infinity;
                        rightCacheBounds[d + 3] = -Infinity;
                        leftCacheBounds[d] = Infinity;
                        leftCacheBounds[d + 3] = -Infinity;
                        bounds[d] = Infinity;
                        bounds[d + 3] = -Infinity;
                    }
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$utils$2f$ArrayBoxUtilities$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["expandByPrimitiveBounds"])(c, primitiveBounds, bounds);
                }
                truncatedBins.sort(binsSort);
                // remove redundant splits
                let splitCount = count;
                for(let bi = 0; bi < splitCount; bi++){
                    const bin = truncatedBins[bi];
                    while(bi + 1 < splitCount && truncatedBins[bi + 1].candidate === bin.candidate){
                        truncatedBins.splice(bi + 1, 1);
                        splitCount--;
                    }
                }
                // find the appropriate bin for each primitive and expand the bounds.
                for(let c = cStart; c < cEnd; c += 6){
                    const center = primitiveBounds[c + 2 * a];
                    for(let bi = 0; bi < splitCount; bi++){
                        const bin = truncatedBins[bi];
                        if (center >= bin.candidate) {
                            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$utils$2f$ArrayBoxUtilities$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["expandByPrimitiveBounds"])(c, primitiveBounds, bin.rightCacheBounds);
                        } else {
                            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$utils$2f$ArrayBoxUtilities$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["expandByPrimitiveBounds"])(c, primitiveBounds, bin.leftCacheBounds);
                            bin.count++;
                        }
                    }
                }
                // expand all the bounds
                for(let bi = 0; bi < splitCount; bi++){
                    const bin = truncatedBins[bi];
                    const leftCount = bin.count;
                    const rightCount = count - bin.count;
                    // check the cost of this split
                    const leftBounds = bin.leftCacheBounds;
                    const rightBounds = bin.rightCacheBounds;
                    let leftProb = 0;
                    if (leftCount !== 0) {
                        leftProb = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$utils$2f$ArrayBoxUtilities$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["computeSurfaceArea"])(leftBounds) / rootSurfaceArea;
                    }
                    let rightProb = 0;
                    if (rightCount !== 0) {
                        rightProb = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$utils$2f$ArrayBoxUtilities$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["computeSurfaceArea"])(rightBounds) / rootSurfaceArea;
                    }
                    const cost = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$Constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TRAVERSAL_COST"] + __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$Constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PRIMITIVE_INTERSECT_COST"] * (leftProb * leftCount + rightProb * rightCount);
                    if (cost < bestCost) {
                        axis = a;
                        bestCost = cost;
                        pos = bin.candidate;
                    }
                }
            } else {
                // reset the bins
                for(let i = 0; i < BIN_COUNT; i++){
                    const bin = sahBins[i];
                    bin.count = 0;
                    bin.candidate = axisLeft + binWidth + i * binWidth;
                    const bounds = bin.bounds;
                    for(let d = 0; d < 3; d++){
                        bounds[d] = Infinity;
                        bounds[d + 3] = -Infinity;
                    }
                }
                // iterate over all center positions
                for(let c = cStart; c < cEnd; c += 6){
                    const triCenter = primitiveBounds[c + 2 * a];
                    const relativeCenter = triCenter - axisLeft;
                    // in the partition function if the centroid lies on the split plane then it is
                    // considered to be on the right side of the split
                    let binIndex = ~~(relativeCenter / binWidth);
                    if (binIndex >= BIN_COUNT) binIndex = BIN_COUNT - 1;
                    const bin = sahBins[binIndex];
                    bin.count++;
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$utils$2f$ArrayBoxUtilities$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["expandByPrimitiveBounds"])(c, primitiveBounds, bin.bounds);
                }
                // cache the unioned bounds from right to left so we don't have to regenerate them each time
                const lastBin = sahBins[BIN_COUNT - 1];
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$utils$2f$ArrayBoxUtilities$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["copyBounds"])(lastBin.bounds, lastBin.rightCacheBounds);
                for(let i = BIN_COUNT - 2; i >= 0; i--){
                    const bin = sahBins[i];
                    const nextBin = sahBins[i + 1];
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$utils$2f$ArrayBoxUtilities$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["unionBounds"])(bin.bounds, nextBin.rightCacheBounds, bin.rightCacheBounds);
                }
                let leftCount = 0;
                for(let i = 0; i < BIN_COUNT - 1; i++){
                    const bin = sahBins[i];
                    const binCount = bin.count;
                    const bounds = bin.bounds;
                    const nextBin = sahBins[i + 1];
                    const rightBounds = nextBin.rightCacheBounds;
                    // don't do anything with the bounds if the new bounds have no primitives
                    if (binCount !== 0) {
                        if (leftCount === 0) {
                            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$utils$2f$ArrayBoxUtilities$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["copyBounds"])(bounds, leftBounds);
                        } else {
                            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$utils$2f$ArrayBoxUtilities$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["unionBounds"])(bounds, leftBounds, leftBounds);
                        }
                    }
                    leftCount += binCount;
                    // check the cost of this split
                    let leftProb = 0;
                    let rightProb = 0;
                    if (leftCount !== 0) {
                        leftProb = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$utils$2f$ArrayBoxUtilities$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["computeSurfaceArea"])(leftBounds) / rootSurfaceArea;
                    }
                    const rightCount = count - leftCount;
                    if (rightCount !== 0) {
                        rightProb = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$utils$2f$ArrayBoxUtilities$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["computeSurfaceArea"])(rightBounds) / rootSurfaceArea;
                    }
                    const cost = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$Constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TRAVERSAL_COST"] + __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$Constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PRIMITIVE_INTERSECT_COST"] * (leftProb * leftCount + rightProb * rightCount);
                    if (cost < bestCost) {
                        axis = a;
                        bestCost = cost;
                        pos = bin.candidate;
                    }
                }
            }
        }
    } else {
        console.warn(`BVH: Invalid build strategy value ${strategy} used.`);
    }
    return {
        axis,
        pos
    };
}
// returns the average coordinate on the specified axis of all the provided primitives
function getAverage(primitiveBounds, offset, count, axis) {
    let avg = 0;
    const boundsOffset = primitiveBounds.offset;
    for(let i = offset, end = offset + count; i < end; i++){
        avg += primitiveBounds[(i - boundsOffset) * 6 + axis * 2];
    }
    return avg / count;
}
}),
"[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/core/BVHNode.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BVHNode",
    ()=>BVHNode
]);
class BVHNode {
    constructor(){
        // internal nodes have boundingData, left, right, and splitAxis
        // leaf nodes have offset and count (referring to primitives in the mesh geometry)
        this.boundingData = new Float32Array(6);
    }
}
}),
"[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/core/build/sortUtils.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// reorders the partition buffer such that for `count` elements after `offset`, elements on the left side of the split
// will be on the left and elements on the right side of the split will be on the right. returns the index
// of the first element on the right side, or offset + count if there are no elements on the right side.
__turbopack_context__.s([
    "partition",
    ()=>partition
]);
function partition(buffer, stride, primitiveBounds, offset, count, split) {
    let left = offset;
    let right = offset + count - 1;
    const pos = split.pos;
    const axisOffset = split.axis * 2;
    const boundsOffset = primitiveBounds.offset || 0;
    // hoare partitioning, see e.g. https://en.wikipedia.org/wiki/Quicksort#Hoare_partition_scheme
    while(true){
        while(left <= right && primitiveBounds[(left - boundsOffset) * 6 + axisOffset] < pos){
            left++;
        }
        // if a primitive center lies on the partition plane it is considered to be on the right side
        while(left <= right && primitiveBounds[(right - boundsOffset) * 6 + axisOffset] >= pos){
            right--;
        }
        if (left < right) {
            // we need to swap all of the information associated with the primitives at index
            // left and right; that's the elements in the partition buffer and the bounds
            for(let i = 0; i < stride; i++){
                let t0 = buffer[left * stride + i];
                buffer[left * stride + i] = buffer[right * stride + i];
                buffer[right * stride + i] = t0;
            }
            // swap bounds
            for(let i = 0; i < 6; i++){
                const l = left - boundsOffset;
                const r = right - boundsOffset;
                const tb = primitiveBounds[l * 6 + i];
                primitiveBounds[l * 6 + i] = primitiveBounds[r * 6 + i];
                primitiveBounds[r * 6 + i] = tb;
            }
            left++;
            right--;
        } else {
            return left;
        }
    }
}
}),
"[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/core/build/buildUtils.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "countNodes",
    ()=>countNodes,
    "populateBuffer",
    ()=>populateBuffer
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$Constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/core/Constants.js [app-client] (ecmascript)");
;
let float32Array, uint32Array, uint16Array, uint8Array;
const MAX_POINTER = Math.pow(2, 32);
function countNodes(node) {
    if ('count' in node) {
        return 1;
    } else {
        return 1 + countNodes(node.left) + countNodes(node.right);
    }
}
function populateBuffer(byteOffset, node, buffer) {
    float32Array = new Float32Array(buffer);
    uint32Array = new Uint32Array(buffer);
    uint16Array = new Uint16Array(buffer);
    uint8Array = new Uint8Array(buffer);
    return _populateBuffer(byteOffset, node);
}
// pack structure
// boundingData  				: 6 float32
// right / offset 				: 1 uint32
// splitAxis / isLeaf + count 	: 1 uint32 / 2 uint16
function _populateBuffer(byteOffset, node) {
    const node32Index = byteOffset / 4;
    const node16Index = byteOffset / 2;
    const isLeaf = 'count' in node;
    const boundingData = node.boundingData;
    for(let i = 0; i < 6; i++){
        float32Array[node32Index + i] = boundingData[i];
    }
    if (isLeaf) {
        if (node.buffer) {
            uint8Array.set(new Uint8Array(node.buffer), byteOffset);
            return byteOffset + node.buffer.byteLength;
        } else {
            uint32Array[node32Index + 6] = node.offset;
            uint16Array[node16Index + 14] = node.count;
            uint16Array[node16Index + 15] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$Constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["IS_LEAFNODE_FLAG"];
            return byteOffset + __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$Constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BYTES_PER_NODE"];
        }
    } else {
        const { left, right, splitAxis } = node;
        // fill in the left node contents
        const leftByteOffset = byteOffset + __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$Constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BYTES_PER_NODE"];
        let rightByteOffset = _populateBuffer(leftByteOffset, left);
        // calculate relative offset from parent to right child
        const currentNodeIndex = byteOffset / __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$Constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BYTES_PER_NODE"];
        const rightNodeIndex = rightByteOffset / __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$Constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BYTES_PER_NODE"];
        const relativeRightIndex = rightNodeIndex - currentNodeIndex;
        // check if the relative offset is too high
        if (relativeRightIndex > MAX_POINTER) {
            throw new Error('MeshBVH: Cannot store relative child node offset greater than 32 bits.');
        }
        // fill in the right node contents (store as relative offset)
        uint32Array[node32Index + 6] = relativeRightIndex;
        uint32Array[node32Index + 7] = splitAxis;
        // return the next available buffer pointer
        return _populateBuffer(rightByteOffset, right);
    }
}
}),
"[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/core/build/buildTree.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "buildPackedTree",
    ()=>buildPackedTree,
    "buildTree",
    ()=>buildTree
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$build$2f$computeBoundsUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/core/build/computeBoundsUtils.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$build$2f$splitUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/core/build/splitUtils.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$BVHNode$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/core/BVHNode.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$Constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/core/Constants.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$build$2f$sortUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/core/build/sortUtils.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$build$2f$buildUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/core/build/buildUtils.js [app-client] (ecmascript)");
;
;
;
;
;
;
function buildTree(bvh, primitiveBounds, offset, count, options, loadRange) {
    // expand variables
    const { maxDepth, verbose, maxLeafSize, strategy, onProgress } = options;
    const partitionBuffer = bvh.primitiveBuffer;
    const partitionStride = bvh.primitiveBufferStride;
    // generate intermediate variables
    const cacheCentroidBoundingData = new Float32Array(6);
    let reachedMaxDepth = false;
    const root = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$BVHNode$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BVHNode"]();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$build$2f$computeBoundsUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getBounds"])(primitiveBounds, offset, count, root.boundingData, cacheCentroidBoundingData);
    splitNode(root, offset, count, cacheCentroidBoundingData);
    return root;
    //TURBOPACK unreachable
    ;
    function triggerProgress(primitivesProcessed) {
        if (onProgress) {
            onProgress((primitivesProcessed - loadRange.offset) / loadRange.count);
        }
    }
    // either recursively splits the given node, creating left and right subtrees for it, or makes it a leaf node,
    // recording the offset and count of its primitives and writing them into the reordered geometry index.
    function splitNode(node, offset, count, centroidBoundingData = null, depth = 0) {
        if (!reachedMaxDepth && depth >= maxDepth) {
            reachedMaxDepth = true;
            if (verbose) {
                console.warn(`BVH: Max depth of ${maxDepth} reached when generating BVH. Consider increasing maxDepth.`);
            }
        }
        // early out if we've met our capacity
        if (count <= maxLeafSize || depth >= maxDepth) {
            triggerProgress(offset + count);
            node.offset = offset;
            node.count = count;
            return node;
        }
        // Find where to split the volume
        const split = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$build$2f$splitUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getOptimalSplit"])(node.boundingData, centroidBoundingData, primitiveBounds, offset, count, strategy);
        if (split.axis === -1) {
            triggerProgress(offset + count);
            node.offset = offset;
            node.count = count;
            return node;
        }
        const splitOffset = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$build$2f$sortUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["partition"])(partitionBuffer, partitionStride, primitiveBounds, offset, count, split);
        // create the two new child nodes
        if (splitOffset === offset || splitOffset === offset + count) {
            triggerProgress(offset + count);
            node.offset = offset;
            node.count = count;
        } else {
            node.splitAxis = split.axis;
            // create the left child and compute its bounding box
            const left = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$BVHNode$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BVHNode"]();
            const lstart = offset;
            const lcount = splitOffset - offset;
            node.left = left;
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$build$2f$computeBoundsUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getBounds"])(primitiveBounds, lstart, lcount, left.boundingData, cacheCentroidBoundingData);
            splitNode(left, lstart, lcount, cacheCentroidBoundingData, depth + 1);
            // repeat for right
            const right = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$BVHNode$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BVHNode"]();
            const rstart = splitOffset;
            const rcount = count - lcount;
            node.right = right;
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$build$2f$computeBoundsUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getBounds"])(primitiveBounds, rstart, rcount, right.boundingData, cacheCentroidBoundingData);
            splitNode(right, rstart, rcount, cacheCentroidBoundingData, depth + 1);
        }
        return node;
    }
}
function buildPackedTree(bvh, options) {
    const BufferConstructor = options.useSharedArrayBuffer ? SharedArrayBuffer : ArrayBuffer;
    // get the range of buffer data to construct / arrange
    const rootRanges = bvh.getRootRanges(options.range);
    const firstRange = rootRanges[0];
    const lastRange = rootRanges[rootRanges.length - 1];
    const fullRange = {
        offset: firstRange.offset,
        count: lastRange.offset + lastRange.count - firstRange.offset
    };
    // construct the primitive bounds for sorting
    const primitiveBounds = new Float32Array(6 * fullRange.count);
    primitiveBounds.offset = fullRange.offset;
    bvh.computePrimitiveBounds(fullRange.offset, fullRange.count, primitiveBounds);
    // Build BVH roots
    bvh._roots = rootRanges.map((range)=>{
        const root = buildTree(bvh, primitiveBounds, range.offset, range.count, options, fullRange);
        const nodeCount = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$build$2f$buildUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["countNodes"])(root);
        const buffer = new BufferConstructor(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$Constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BYTES_PER_NODE"] * nodeCount);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$build$2f$buildUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["populateBuffer"])(0, root, buffer);
        return buffer;
    });
}
}),
"[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/core/cast/shapecast.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "shapecast",
    ()=>shapecast
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/three@0.185.1/node_modules/three/build/three.core.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$Constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/core/Constants.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$utils$2f$ArrayBoxUtilities$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/utils/ArrayBoxUtilities.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$utils$2f$PrimitivePool$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/utils/PrimitivePool.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$nodeBufferUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/core/utils/nodeBufferUtils.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$BufferStack$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/core/utils/BufferStack.js [app-client] (ecmascript)");
;
;
;
;
;
;
let _box1, _box2;
const boxStack = [];
const boxPool = /* @__PURE__ */ new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$utils$2f$PrimitivePool$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PrimitivePool"](()=>new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Box3"]());
function shapecast(bvh, root, intersectsBounds, intersectsRange, boundsTraverseOrder, nodeOffset) {
    // setup
    _box1 = boxPool.getPrimitive();
    _box2 = boxPool.getPrimitive();
    boxStack.push(_box1, _box2);
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$BufferStack$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BufferStack"].setBuffer(bvh._roots[root]);
    const result = shapecastTraverse(0, bvh.geometry, intersectsBounds, intersectsRange, boundsTraverseOrder, nodeOffset);
    // cleanup
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$BufferStack$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BufferStack"].clearBuffer();
    boxPool.releasePrimitive(_box1);
    boxPool.releasePrimitive(_box2);
    boxStack.pop();
    boxStack.pop();
    const length = boxStack.length;
    if (length > 0) {
        _box2 = boxStack[length - 1];
        _box1 = boxStack[length - 2];
    }
    return result;
}
function shapecastTraverse(nodeIndex32, geometry, intersectsBoundsFunc, intersectsRangeFunc, nodeScoreFunc = null, nodeIndexOffset = 0, depth = 0) {
    const { float32Array, uint16Array, uint32Array } = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$BufferStack$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BufferStack"];
    let nodeIndex16 = nodeIndex32 * 2;
    const isLeaf = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$nodeBufferUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["IS_LEAF"])(nodeIndex16, uint16Array);
    if (isLeaf) {
        const offset = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$nodeBufferUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["OFFSET"])(nodeIndex32, uint32Array);
        const count = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$nodeBufferUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["COUNT"])(nodeIndex16, uint16Array);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$utils$2f$ArrayBoxUtilities$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["arrayToBox"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$nodeBufferUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BOUNDING_DATA_INDEX"])(nodeIndex32), float32Array, _box1);
        return intersectsRangeFunc(offset, count, false, depth, nodeIndexOffset + nodeIndex32 / __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$Constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["UINT32_PER_NODE"], _box1);
    } else {
        const left = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$nodeBufferUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LEFT_NODE"])(nodeIndex32);
        const right = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$nodeBufferUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RIGHT_NODE"])(nodeIndex32, uint32Array);
        let c1 = left;
        let c2 = right;
        let score1, score2;
        let box1, box2;
        if (nodeScoreFunc) {
            box1 = _box1;
            box2 = _box2;
            // bounding data is not offset
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$utils$2f$ArrayBoxUtilities$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["arrayToBox"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$nodeBufferUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BOUNDING_DATA_INDEX"])(c1), float32Array, box1);
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$utils$2f$ArrayBoxUtilities$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["arrayToBox"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$nodeBufferUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BOUNDING_DATA_INDEX"])(c2), float32Array, box2);
            score1 = nodeScoreFunc(box1);
            score2 = nodeScoreFunc(box2);
            if (score2 < score1) {
                c1 = right;
                c2 = left;
                const temp = score1;
                score1 = score2;
                score2 = temp;
                box1 = box2;
            // box2 is always set before use below
            }
        }
        // Check box 1 intersection
        if (!box1) {
            box1 = _box1;
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$utils$2f$ArrayBoxUtilities$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["arrayToBox"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$nodeBufferUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BOUNDING_DATA_INDEX"])(c1), float32Array, box1);
        }
        const isC1Leaf = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$nodeBufferUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["IS_LEAF"])(c1 * 2, uint16Array);
        const c1Intersection = intersectsBoundsFunc(box1, isC1Leaf, score1, depth + 1, nodeIndexOffset + c1 / __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$Constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["UINT32_PER_NODE"]);
        let c1StopTraversal;
        if (c1Intersection === __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$Constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CONTAINED"]) {
            const offset = getLeftOffset(c1);
            const end = getRightEndOffset(c1);
            const count = end - offset;
            c1StopTraversal = intersectsRangeFunc(offset, count, true, depth + 1, nodeIndexOffset + c1 / __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$Constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["UINT32_PER_NODE"], box1);
        } else {
            c1StopTraversal = c1Intersection && shapecastTraverse(c1, geometry, intersectsBoundsFunc, intersectsRangeFunc, nodeScoreFunc, nodeIndexOffset, depth + 1);
        }
        if (c1StopTraversal) return true;
        // Check box 2 intersection
        // cached box2 will have been overwritten by previous traversal
        box2 = _box2;
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$utils$2f$ArrayBoxUtilities$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["arrayToBox"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$nodeBufferUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BOUNDING_DATA_INDEX"])(c2), float32Array, box2);
        const isC2Leaf = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$nodeBufferUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["IS_LEAF"])(c2 * 2, uint16Array);
        const c2Intersection = intersectsBoundsFunc(box2, isC2Leaf, score2, depth + 1, nodeIndexOffset + c2 / __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$Constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["UINT32_PER_NODE"]);
        let c2StopTraversal;
        if (c2Intersection === __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$Constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CONTAINED"]) {
            const offset = getLeftOffset(c2);
            const end = getRightEndOffset(c2);
            const count = end - offset;
            c2StopTraversal = intersectsRangeFunc(offset, count, true, depth + 1, nodeIndexOffset + c2 / __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$Constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["UINT32_PER_NODE"], box2);
        } else {
            c2StopTraversal = c2Intersection && shapecastTraverse(c2, geometry, intersectsBoundsFunc, intersectsRangeFunc, nodeScoreFunc, nodeIndexOffset, depth + 1);
        }
        if (c2StopTraversal) return true;
        return false;
        //TURBOPACK unreachable
        ;
        // Define these inside the function so it has access to the local variables needed
        // when converting to the buffer equivalents
        function getLeftOffset(nodeIndex32) {
            const { uint16Array, uint32Array } = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$BufferStack$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BufferStack"];
            let nodeIndex16 = nodeIndex32 * 2;
            // traverse until we find a leaf
            while(!(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$nodeBufferUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["IS_LEAF"])(nodeIndex16, uint16Array)){
                nodeIndex32 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$nodeBufferUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LEFT_NODE"])(nodeIndex32);
                nodeIndex16 = nodeIndex32 * 2;
            }
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$nodeBufferUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["OFFSET"])(nodeIndex32, uint32Array);
        }
        function getRightEndOffset(nodeIndex32) {
            const { uint16Array, uint32Array } = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$BufferStack$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BufferStack"];
            let nodeIndex16 = nodeIndex32 * 2;
            // traverse until we find a leaf
            while(!(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$nodeBufferUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["IS_LEAF"])(nodeIndex16, uint16Array)){
                // adjust offset to point to the right node
                nodeIndex32 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$nodeBufferUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RIGHT_NODE"])(nodeIndex32, uint32Array);
                nodeIndex16 = nodeIndex32 * 2;
            }
            // return the end offset of the triangle range
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$nodeBufferUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["OFFSET"])(nodeIndex32, uint32Array) + (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$nodeBufferUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["COUNT"])(nodeIndex16, uint16Array);
        }
    }
}
}),
"[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/core/cast/bvhcast.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "bvhcast",
    ()=>bvhcast
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/three@0.185.1/node_modules/three/build/three.core.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$BufferStack$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/core/utils/BufferStack.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$nodeBufferUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/core/utils/nodeBufferUtils.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$utils$2f$ArrayBoxUtilities$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/utils/ArrayBoxUtilities.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$utils$2f$PrimitivePool$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/utils/PrimitivePool.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$Constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/core/Constants.js [app-client] (ecmascript)");
;
;
;
;
;
;
const _bufferStack1 = /* @__PURE__ */ new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$BufferStack$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BufferStack"].constructor();
const _bufferStack2 = /* @__PURE__ */ new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$BufferStack$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BufferStack"].constructor();
const _boxPool = /* @__PURE__ */ new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$utils$2f$PrimitivePool$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PrimitivePool"](()=>new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Box3"]());
const _leftBox1 = /* @__PURE__ */ new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Box3"]();
const _rightBox1 = /* @__PURE__ */ new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Box3"]();
const _leftBox2 = /* @__PURE__ */ new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Box3"]();
const _rightBox2 = /* @__PURE__ */ new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Box3"]();
let _active = false;
function bvhcast(bvh, otherBvh, matrixToLocal, intersectsRanges) {
    if (_active) {
        throw new Error('MeshBVH: Recursive calls to bvhcast not supported.');
    }
    _active = true;
    const roots = bvh._roots;
    const otherRoots = otherBvh._roots;
    let result;
    let nodeOffset1 = 0;
    let nodeOffset2 = 0;
    const invMat = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Matrix4"]().copy(matrixToLocal).invert();
    // iterate over the first set of roots
    for(let i = 0, il = roots.length; i < il; i++){
        _bufferStack1.setBuffer(roots[i]);
        nodeOffset2 = 0;
        // prep the initial root box
        const localBox = _boxPool.getPrimitive();
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$utils$2f$ArrayBoxUtilities$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["arrayToBox"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$nodeBufferUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BOUNDING_DATA_INDEX"])(0), _bufferStack1.float32Array, localBox);
        localBox.applyMatrix4(invMat);
        // iterate over the second set of roots
        for(let j = 0, jl = otherRoots.length; j < jl; j++){
            _bufferStack2.setBuffer(otherRoots[j]);
            result = _traverse(0, 0, matrixToLocal, invMat, intersectsRanges, nodeOffset1, nodeOffset2, 0, 0, localBox);
            _bufferStack2.clearBuffer();
            nodeOffset2 += otherRoots[j].byteLength / __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$Constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BYTES_PER_NODE"];
            if (result) {
                break;
            }
        }
        // release stack info
        _boxPool.releasePrimitive(localBox);
        _bufferStack1.clearBuffer();
        nodeOffset1 += roots[i].byteLength / __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$Constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BYTES_PER_NODE"];
        if (result) {
            break;
        }
    }
    _active = false;
    return result;
}
function _traverse(node1Index32, node2Index32, matrix2to1, matrix1to2, intersectsRangesFunc, // offsets for ids
node1IndexOffset = 0, node2IndexOffset = 0, // tree depth
depth1 = 0, depth2 = 0, currBox = null, reversed = false) {
    // get the buffer stacks associated with the current indices
    let bufferStack1, bufferStack2;
    if (reversed) {
        bufferStack1 = _bufferStack2;
        bufferStack2 = _bufferStack1;
    } else {
        bufferStack1 = _bufferStack1;
        bufferStack2 = _bufferStack2;
    }
    // get the local instances of the typed buffers
    const float32Array1 = bufferStack1.float32Array, uint32Array1 = bufferStack1.uint32Array, uint16Array1 = bufferStack1.uint16Array, float32Array2 = bufferStack2.float32Array, uint32Array2 = bufferStack2.uint32Array, uint16Array2 = bufferStack2.uint16Array;
    const node1Index16 = node1Index32 * 2;
    const node2Index16 = node2Index32 * 2;
    const isLeaf1 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$nodeBufferUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["IS_LEAF"])(node1Index16, uint16Array1);
    const isLeaf2 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$nodeBufferUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["IS_LEAF"])(node2Index16, uint16Array2);
    let result = false;
    if (isLeaf2 && isLeaf1) {
        // if both bounds are leaf nodes then fire the callback if the boxes intersect
        // Note the "nodeIndex" values are just intended to be used as unique identifiers in the tree and
        // not used for accessing data
        if (reversed) {
            result = intersectsRangesFunc((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$nodeBufferUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["OFFSET"])(node2Index32, uint32Array2), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$nodeBufferUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["COUNT"])(node2Index32 * 2, uint16Array2), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$nodeBufferUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["OFFSET"])(node1Index32, uint32Array1), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$nodeBufferUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["COUNT"])(node1Index32 * 2, uint16Array1), depth2, node2IndexOffset + node2Index32 / __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$Constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["UINT32_PER_NODE"], depth1, node1IndexOffset + node1Index32 / __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$Constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["UINT32_PER_NODE"]);
        } else {
            result = intersectsRangesFunc((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$nodeBufferUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["OFFSET"])(node1Index32, uint32Array1), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$nodeBufferUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["COUNT"])(node1Index32 * 2, uint16Array1), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$nodeBufferUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["OFFSET"])(node2Index32, uint32Array2), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$nodeBufferUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["COUNT"])(node2Index32 * 2, uint16Array2), depth1, node1IndexOffset + node1Index32 / __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$Constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["UINT32_PER_NODE"], depth2, node2IndexOffset + node2Index32 / __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$Constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["UINT32_PER_NODE"]);
        }
    } else if (isLeaf2) {
        // SWAP
        // If we've traversed to the leaf node on the other bvh then we need to swap over
        // to traverse down the first one
        // get the new box to use
        const newBox = _boxPool.getPrimitive();
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$utils$2f$ArrayBoxUtilities$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["arrayToBox"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$nodeBufferUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BOUNDING_DATA_INDEX"])(node2Index32), float32Array2, newBox);
        newBox.applyMatrix4(matrix2to1);
        // get the child bounds to check before traversal
        const cl1 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$nodeBufferUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LEFT_NODE"])(node1Index32);
        const cr1 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$nodeBufferUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RIGHT_NODE"])(node1Index32, uint32Array1);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$utils$2f$ArrayBoxUtilities$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["arrayToBox"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$nodeBufferUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BOUNDING_DATA_INDEX"])(cl1), float32Array1, _leftBox1);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$utils$2f$ArrayBoxUtilities$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["arrayToBox"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$nodeBufferUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BOUNDING_DATA_INDEX"])(cr1), float32Array1, _rightBox1);
        // precompute the intersections otherwise the global boxes will be modified during traversal
        const intersectCl1 = newBox.intersectsBox(_leftBox1);
        const intersectCr1 = newBox.intersectsBox(_rightBox1);
        result = intersectCl1 && _traverse(node2Index32, cl1, matrix1to2, matrix2to1, intersectsRangesFunc, node2IndexOffset, node1IndexOffset, depth2, depth1 + 1, newBox, !reversed) || intersectCr1 && _traverse(node2Index32, cr1, matrix1to2, matrix2to1, intersectsRangesFunc, node2IndexOffset, node1IndexOffset, depth2, depth1 + 1, newBox, !reversed);
        _boxPool.releasePrimitive(newBox);
    } else {
        // if neither are leaves then we should swap if one of the children does not
        // intersect with the current bounds
        // get the child bounds to check
        const cl2 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$nodeBufferUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LEFT_NODE"])(node2Index32);
        const cr2 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$nodeBufferUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RIGHT_NODE"])(node2Index32, uint32Array2);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$utils$2f$ArrayBoxUtilities$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["arrayToBox"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$nodeBufferUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BOUNDING_DATA_INDEX"])(cl2), float32Array2, _leftBox2);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$utils$2f$ArrayBoxUtilities$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["arrayToBox"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$nodeBufferUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BOUNDING_DATA_INDEX"])(cr2), float32Array2, _rightBox2);
        const leftIntersects = currBox.intersectsBox(_leftBox2);
        const rightIntersects = currBox.intersectsBox(_rightBox2);
        if (leftIntersects && rightIntersects) {
            // continue to traverse both children if they both intersect
            result = _traverse(node1Index32, cl2, matrix2to1, matrix1to2, intersectsRangesFunc, node1IndexOffset, node2IndexOffset, depth1, depth2 + 1, currBox, reversed) || _traverse(node1Index32, cr2, matrix2to1, matrix1to2, intersectsRangesFunc, node1IndexOffset, node2IndexOffset, depth1, depth2 + 1, currBox, reversed);
        } else if (leftIntersects) {
            if (isLeaf1) {
                // if the current box is a leaf then just continue
                result = _traverse(node1Index32, cl2, matrix2to1, matrix1to2, intersectsRangesFunc, node1IndexOffset, node2IndexOffset, depth1, depth2 + 1, currBox, reversed);
            } else {
                // SWAP
                // if only one box intersects then we have to swap to the other bvh to continue
                const newBox = _boxPool.getPrimitive();
                newBox.copy(_leftBox2).applyMatrix4(matrix2to1);
                const cl1 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$nodeBufferUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LEFT_NODE"])(node1Index32);
                const cr1 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$nodeBufferUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RIGHT_NODE"])(node1Index32, uint32Array1);
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$utils$2f$ArrayBoxUtilities$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["arrayToBox"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$nodeBufferUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BOUNDING_DATA_INDEX"])(cl1), float32Array1, _leftBox1);
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$utils$2f$ArrayBoxUtilities$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["arrayToBox"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$nodeBufferUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BOUNDING_DATA_INDEX"])(cr1), float32Array1, _rightBox1);
                // precompute the intersections otherwise the global boxes will be modified during traversal
                const intersectCl1 = newBox.intersectsBox(_leftBox1);
                const intersectCr1 = newBox.intersectsBox(_rightBox1);
                result = intersectCl1 && _traverse(cl2, cl1, matrix1to2, matrix2to1, intersectsRangesFunc, node2IndexOffset, node1IndexOffset, depth2, depth1 + 1, newBox, !reversed) || intersectCr1 && _traverse(cl2, cr1, matrix1to2, matrix2to1, intersectsRangesFunc, node2IndexOffset, node1IndexOffset, depth2, depth1 + 1, newBox, !reversed);
                _boxPool.releasePrimitive(newBox);
            }
        } else if (rightIntersects) {
            if (isLeaf1) {
                // if the current box is a leaf then just continue
                result = _traverse(node1Index32, cr2, matrix2to1, matrix1to2, intersectsRangesFunc, node1IndexOffset, node2IndexOffset, depth1, depth2 + 1, currBox, reversed);
            } else {
                // SWAP
                // if only one box intersects then we have to swap to the other bvh to continue
                const newBox = _boxPool.getPrimitive();
                newBox.copy(_rightBox2).applyMatrix4(matrix2to1);
                const cl1 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$nodeBufferUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LEFT_NODE"])(node1Index32);
                const cr1 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$nodeBufferUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RIGHT_NODE"])(node1Index32, uint32Array1);
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$utils$2f$ArrayBoxUtilities$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["arrayToBox"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$nodeBufferUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BOUNDING_DATA_INDEX"])(cl1), float32Array1, _leftBox1);
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$utils$2f$ArrayBoxUtilities$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["arrayToBox"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$nodeBufferUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BOUNDING_DATA_INDEX"])(cr1), float32Array1, _rightBox1);
                // precompute the intersections otherwise the global boxes will be modified during traversal
                const intersectCl1 = newBox.intersectsBox(_leftBox1);
                const intersectCr1 = newBox.intersectsBox(_rightBox1);
                result = intersectCl1 && _traverse(cr2, cl1, matrix1to2, matrix2to1, intersectsRangesFunc, node2IndexOffset, node1IndexOffset, depth2, depth1 + 1, newBox, !reversed) || intersectCr1 && _traverse(cr2, cr1, matrix1to2, matrix2to1, intersectsRangesFunc, node2IndexOffset, node1IndexOffset, depth2, depth1 + 1, newBox, !reversed);
                _boxPool.releasePrimitive(newBox);
            }
        }
    }
    return result;
}
}),
"[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/core/BVH.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BVH",
    ()=>BVH
]);
/** @import { Matrix4 } from 'three' */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/three@0.185.1/node_modules/three/build/three.core.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$Constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/core/Constants.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$utils$2f$ArrayBoxUtilities$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/utils/ArrayBoxUtilities.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$nodeBufferUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/core/utils/nodeBufferUtils.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$build$2f$buildTree$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/core/build/buildTree.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$cast$2f$shapecast$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/core/cast/shapecast.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$cast$2f$bvhcast$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/core/cast/bvhcast.js [app-client] (ecmascript)");
;
;
;
;
;
;
;
const _tempBox = /* @__PURE__ */ new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Box3"]();
const _tempBuffer = /* @__PURE__ */ new Float32Array(6);
class BVH {
    constructor(){
        this._roots = null;
        this.primitiveBuffer = null;
        this.primitiveBufferStride = null;
    }
    init(options) {
        options = {
            ...__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$Constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DEFAULT_OPTIONS"],
            ...options
        };
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$build$2f$buildTree$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["buildPackedTree"])(this, options);
    }
    getRootRanges() {
        // TODO: can we avoid passing range in here?
        throw new Error('BVH: getRootRanges() not implemented');
    }
    // write the i-th primitive bounds in a 6-value min / max format to the buffer
    // starting at the given "writeOffset"
    writePrimitiveBounds() {
        throw new Error('BVH: writePrimitiveBounds() not implemented');
    }
    // writes the union bounds of all primitives in the given range in a min / max format
    // to the buffer
    writePrimitiveRangeBounds(offset, count, targetBuffer, baseIndex) {
        // Initialize bounds
        let minX = Infinity;
        let minY = Infinity;
        let minZ = Infinity;
        let maxX = -Infinity;
        let maxY = -Infinity;
        let maxZ = -Infinity;
        // compute union of all bounds
        for(let i = offset, end = offset + count; i < end; i++){
            this.writePrimitiveBounds(i, _tempBuffer, 0);
            // compute union
            const [lx, ly, lz, rx, ry, rz] = _tempBuffer;
            if (lx < minX) minX = lx;
            if (rx > maxX) maxX = rx;
            if (ly < minY) minY = ly;
            if (ry > maxY) maxY = ry;
            if (lz < minZ) minZ = lz;
            if (rz > maxZ) maxZ = rz;
        }
        // write bounds
        targetBuffer[baseIndex + 0] = minX;
        targetBuffer[baseIndex + 1] = minY;
        targetBuffer[baseIndex + 2] = minZ;
        targetBuffer[baseIndex + 3] = maxX;
        targetBuffer[baseIndex + 4] = maxY;
        targetBuffer[baseIndex + 5] = maxZ;
        return targetBuffer;
    }
    computePrimitiveBounds(offset, count, targetBuffer) {
        const boundsOffset = targetBuffer.offset || 0;
        for(let i = offset, end = offset + count; i < end; i++){
            this.writePrimitiveBounds(i, _tempBuffer, 0);
            // construction primitive bounds requires a center + half extents format
            const [lx, ly, lz, rx, ry, rz] = _tempBuffer;
            const cx = (lx + rx) / 2;
            const cy = (ly + ry) / 2;
            const cz = (lz + rz) / 2;
            const hx = (rx - lx) / 2;
            const hy = (ry - ly) / 2;
            const hz = (rz - lz) / 2;
            const baseIndex = (i - boundsOffset) * 6;
            targetBuffer[baseIndex + 0] = cx;
            targetBuffer[baseIndex + 1] = hx + (Math.abs(cx) + hx) * __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$Constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FLOAT32_EPSILON"];
            targetBuffer[baseIndex + 2] = cy;
            targetBuffer[baseIndex + 3] = hy + (Math.abs(cy) + hy) * __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$Constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FLOAT32_EPSILON"];
            targetBuffer[baseIndex + 4] = cz;
            targetBuffer[baseIndex + 5] = hz + (Math.abs(cz) + hz) * __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$Constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FLOAT32_EPSILON"];
        }
        return targetBuffer;
    }
    /**
	 * Adjusts all primitive offsets stored in the BVH leaf nodes by the given value. Useful when
	 * geometry buffers have been shifted or compacted (e.g. when merging geometries).
	 * @param {number} offset
	 */ shiftPrimitiveOffsets(offset) {
        const indirectBuffer = this._indirectBuffer;
        if (indirectBuffer) {
            // the offsets are embedded in the indirect buffer
            for(let i = 0, l = indirectBuffer.length; i < l; i++){
                indirectBuffer[i] += offset;
            }
        } else {
            // offsets are embedded in the leaf nodes
            const roots = this._roots;
            for(let rootIndex = 0; rootIndex < roots.length; rootIndex++){
                const root = roots[rootIndex];
                const uint32Array = new Uint32Array(root);
                const uint16Array = new Uint16Array(root);
                const totalNodes = root.byteLength / __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$Constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BYTES_PER_NODE"];
                for(let node = 0; node < totalNodes; node++){
                    const node32Index = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$Constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["UINT32_PER_NODE"] * node;
                    const node16Index = 2 * node32Index;
                    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$nodeBufferUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["IS_LEAF"])(node16Index, uint16Array)) {
                        // offset value
                        uint32Array[node32Index + 6] += offset;
                    }
                }
            }
        }
    }
    /**
	 * Traverses all nodes of the BVH, invoking a callback for each node.
	 *
	 * For leaf nodes the callback receives `( depth, isLeaf, boundingData, offset, count )`.
	 * For internal nodes it receives `( depth, isLeaf, boundingData, splitAxis )` and may
	 * return `true` to stop descending into that node's children.
	 *
	 * @param {Function} callback
	 * @param {number} [rootIndex=0]
	 */ traverse(callback, rootIndex = 0) {
        const buffer = this._roots[rootIndex];
        const uint32Array = new Uint32Array(buffer);
        const uint16Array = new Uint16Array(buffer);
        _traverse(0);
        function _traverse(node32Index, depth = 0) {
            const node16Index = node32Index * 2;
            const isLeaf = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$nodeBufferUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["IS_LEAF"])(node16Index, uint16Array);
            if (isLeaf) {
                const offset = uint32Array[node32Index + 6];
                const count = uint16Array[node16Index + 14];
                callback(depth, isLeaf, new Float32Array(buffer, node32Index * 4, 6), offset, count);
            } else {
                const left = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$nodeBufferUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LEFT_NODE"])(node32Index);
                const right = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$nodeBufferUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RIGHT_NODE"])(node32Index, uint32Array);
                const splitAxis = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$nodeBufferUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SPLIT_AXIS"])(node32Index, uint32Array);
                const stopTraversal = callback(depth, isLeaf, new Float32Array(buffer, node32Index * 4, 6), splitAxis);
                if (!stopTraversal) {
                    _traverse(left, depth + 1);
                    _traverse(right, depth + 1);
                }
            }
        }
    }
    /**
	 * Refits all BVH node bounds to reflect the current primitive positions. Faster than
	 * rebuilding the BVH but produces a less optimal tree after large vertex deformations.
	 */ refit() {
        // TODO: add support for "nodeIndices"
        // if ( nodeIndices && Array.isArray( nodeIndices ) ) {
        // 	nodeIndices = new Set( nodeIndices );
        // }
        const roots = this._roots;
        for(let rootIndex = 0, rootCount = roots.length; rootIndex < rootCount; rootIndex++){
            const buffer = roots[rootIndex];
            const uint32Array = new Uint32Array(buffer);
            const uint16Array = new Uint16Array(buffer);
            const float32Array = new Float32Array(buffer);
            const totalNodes = buffer.byteLength / __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$Constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BYTES_PER_NODE"];
            // Traverse nodes from right to left so children are updated before parents
            for(let nodeIndex = totalNodes - 1; nodeIndex >= 0; nodeIndex--){
                const nodeIndex32 = nodeIndex * __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$Constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["UINT32_PER_NODE"];
                const nodeIndex16 = nodeIndex32 * 2;
                const isLeaf = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$nodeBufferUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["IS_LEAF"])(nodeIndex16, uint16Array);
                if (isLeaf) {
                    // get the bounds
                    const offset = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$nodeBufferUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["OFFSET"])(nodeIndex32, uint32Array);
                    const count = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$nodeBufferUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["COUNT"])(nodeIndex16, uint16Array);
                    this.writePrimitiveRangeBounds(offset, count, _tempBuffer, 0);
                    // write directly to node bounds (already in min/max format)
                    float32Array.set(_tempBuffer, nodeIndex32);
                } else {
                    const left = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$nodeBufferUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LEFT_NODE"])(nodeIndex32);
                    const right = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$nodeBufferUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RIGHT_NODE"])(nodeIndex32, uint32Array);
                    // Union the bounds of left and right children
                    for(let i = 0; i < 3; i++){
                        const leftMin = float32Array[left + i];
                        const leftMax = float32Array[left + i + 3];
                        const rightMin = float32Array[right + i];
                        const rightMax = float32Array[right + i + 3];
                        float32Array[nodeIndex32 + i] = leftMin < rightMin ? leftMin : rightMin;
                        float32Array[nodeIndex32 + i + 3] = leftMax > rightMax ? leftMax : rightMax;
                    }
                }
            }
        }
    }
    /**
	 * Computes the axis-aligned bounding box of all primitives in the BVH.
	 * @param {Box3} target - Target box to write the result into.
	 * @returns {Box3}
	 */ getBoundingBox(target) {
        target.makeEmpty();
        const roots = this._roots;
        roots.forEach((buffer)=>{
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$utils$2f$ArrayBoxUtilities$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["arrayToBox"])(0, new Float32Array(buffer), _tempBox);
            target.union(_tempBox);
        });
        return target;
    }
    /**
	 * A generalized traversal function for performing spatial queries against the BVH. Returns
	 * `true` as soon as a primitive has been reported as intersected. The tree is traversed
	 * depth-first; `boundsTraverseOrder` controls which child is visited first. Returning
	 * `CONTAINED` from `intersectsBounds` skips further child traversal and intersects all
	 * primitives in that subtree immediately.
	 *
	 * @param {Object} callbacks
	 * @param {IntersectsBoundsCallback} callbacks.intersectsBounds
	 * @param {IntersectsRangeCallback} [callbacks.intersectsRange]
	 * @param {BoundsTraverseOrderCallback} [callbacks.boundsTraverseOrder]
	 * @returns {boolean}
	 */ // TODO: see if we can get rid of "iterateFunc" here as well as the primitive so the function
    // API aligns with the "shapecast" implementation
    shapecast(callbacks) {
        // TODO: can we get rid of "scratchPrimitive" and / or "iterate"? Or merge them somehow
        let { boundsTraverseOrder, intersectsBounds, intersectsRange, intersectsPrimitive, scratchPrimitive, iterate } = callbacks;
        // wrap the intersectsRange function
        if (intersectsRange && intersectsPrimitive) {
            const originalIntersectsRange = intersectsRange;
            intersectsRange = (offset, count, contained, depth, nodeIndex)=>{
                if (!originalIntersectsRange(offset, count, contained, depth, nodeIndex)) {
                    return iterate(offset, count, this, intersectsPrimitive, contained, depth, scratchPrimitive);
                }
                return true;
            };
        } else if (!intersectsRange) {
            if (intersectsPrimitive) {
                intersectsRange = (offset, count, contained, depth)=>{
                    return iterate(offset, count, this, intersectsPrimitive, contained, depth, scratchPrimitive);
                };
            } else {
                intersectsRange = (offset, count, contained)=>{
                    return contained;
                };
            }
        }
        // run shapecast
        let result = false;
        let nodeOffset = 0;
        const roots = this._roots;
        for(let i = 0, l = roots.length; i < l; i++){
            const root = roots[i];
            result = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$cast$2f$shapecast$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["shapecast"])(this, i, intersectsBounds, intersectsRange, boundsTraverseOrder, nodeOffset);
            if (result) {
                break;
            }
            nodeOffset += root.byteLength / __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$Constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BYTES_PER_NODE"];
        }
        return result;
    }
    /**
	 * Simultaneously traverses two BVH structures to find intersecting primitive pairs. Returns
	 * `true` as soon as any intersection is reported. Both trees are traversed depth-first with
	 * alternating descent. `matrixToLocal` transforms `otherBvh` into the local space of this BVH.
	 *
	 * @param {BVH} otherBvh
	 * @param {Matrix4} matrixToLocal
	 * @param {Object} callbacks
	 * @param {IntersectsRangesCallback} callbacks.intersectsRanges
	 * @returns {boolean}
	 */ bvhcast(otherBvh, matrixToLocal, callbacks) {
        let { intersectsRanges } = callbacks;
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$cast$2f$bvhcast$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["bvhcast"])(this, otherBvh, matrixToLocal, intersectsRanges);
    }
}
}),
"[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/core/GeometryBVH.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GeometryBVH",
    ()=>GeometryBVH,
    "generateIndirectBuffer",
    ()=>generateIndirectBuffer
]);
/** @import { BufferGeometry } from 'three' */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/three@0.185.1/node_modules/three/build/three.core.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$Constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/core/Constants.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$utils$2f$BufferUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/utils/BufferUtils.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$build$2f$geometryUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/core/build/geometryUtils.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$BVH$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/core/BVH.js [app-client] (ecmascript)");
;
;
;
;
;
function generateIndirectBuffer(ranges, useSharedArrayBuffer) {
    const lastRange = ranges[ranges.length - 1];
    const useUint32 = lastRange.offset + lastRange.count > 2 ** 16;
    // use getRootIndexRanges which excludes gaps
    const length = ranges.reduce((acc, val)=>acc + val.count, 0);
    const byteCount = useUint32 ? 4 : 2;
    const buffer = useSharedArrayBuffer ? new SharedArrayBuffer(length * byteCount) : new ArrayBuffer(length * byteCount);
    const indirectBuffer = useUint32 ? new Uint32Array(buffer) : new Uint16Array(buffer);
    // construct a compact form of the triangles in these ranges
    let index = 0;
    for(let r = 0; r < ranges.length; r++){
        const { offset, count } = ranges[r];
        for(let i = 0; i < count; i++){
            indirectBuffer[index + i] = offset + i;
        }
        index += count;
    }
    return indirectBuffer;
}
class GeometryBVH extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$BVH$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BVH"] {
    /**
	 * Whether the BVH was built in indirect mode.
	 * @type {boolean}
	 * @readonly
	 */ get indirect() {
        return !!this._indirectBuffer;
    }
    get primitiveStride() {
        return null;
    }
    get primitiveBufferStride() {
        return this.indirect ? 1 : this.primitiveStride;
    }
    set primitiveBufferStride(v) {}
    get primitiveBuffer() {
        return this.indirect ? this._indirectBuffer : this.geometry.index.array;
    }
    set primitiveBuffer(v) {}
    constructor(geometry, options = {}){
        if (!geometry.isBufferGeometry) {
            throw new Error('BVH: Only BufferGeometries are supported.');
        } else if (geometry.index && geometry.index.isInterleavedBufferAttribute) {
            throw new Error('BVH: InterleavedBufferAttribute is not supported for the index attribute.');
        }
        if (options.useSharedArrayBuffer && !(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$utils$2f$BufferUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isSharedArrayBufferSupported"])()) {
            throw new Error('BVH: SharedArrayBuffer is not available.');
        }
        super();
        // retain references to the geometry so we can use them it without having to
        // take a geometry reference in every function.
        /**
		 * The geometry this BVH was built from.
		 * @type {BufferGeometry}
		 * @readonly
		 */ this.geometry = geometry;
        this.resolvePrimitiveIndex = options.indirect ? (i)=>this._indirectBuffer[i] : (i)=>i;
        this.primitiveBuffer = null;
        this.primitiveBufferStride = null;
        this._indirectBuffer = null;
        options = {
            ...__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$Constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DEFAULT_OPTIONS"],
            ...options
        };
        // build the BVH unless we're deserializing
        if (!options[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$Constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SKIP_GENERATION"]]) {
            this.init(options);
        }
    }
    init(options) {
        const { geometry, primitiveStride } = this;
        if (options.indirect) {
            // construct an buffer that is indirectly sorts the triangles used for the BVH
            const ranges = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$build$2f$geometryUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getRootPrimitiveRanges"])(geometry, options.range, primitiveStride);
            const indirectBuffer = generateIndirectBuffer(ranges, options.useSharedArrayBuffer);
            this._indirectBuffer = indirectBuffer;
        } else {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$build$2f$geometryUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ensureIndex"])(geometry, options);
        }
        super.init(options);
        if (!geometry.boundingBox && options.setBoundingBox) {
            geometry.boundingBox = this.getBoundingBox(new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Box3"]());
        }
    }
    // Abstract methods to be implemented by subclasses
    getRootRanges(range) {
        // TODO: can we avoid passing options in here
        if (this.indirect) {
            return [
                {
                    offset: 0,
                    count: this._indirectBuffer.length
                }
            ];
        } else {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$build$2f$geometryUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getRootPrimitiveRanges"])(this.geometry, range, this.primitiveStride);
        }
    }
    raycastObject3D() {
        throw new Error('BVH: raycastObject3D() not implemented');
    }
}
}),
"[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/core/MeshBVH.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "MeshBVH",
    ()=>MeshBVH
]);
/** @import { BufferGeometry, Sphere, Box3, Intersection, Material, Object3D, Raycaster } from 'three' */ /** @import { ExtendedTriangle } from '../math/ExtendedTriangle.js' */ /** @import { IntersectsBoundsCallback, IntersectsRangeCallback, BoundsTraverseOrderCallback, IntersectsRangesCallback } from './BVH.js' */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/three@0.185.1/node_modules/three/build/three.core.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$Constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/core/Constants.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$math$2f$OrientedBox$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/math/OrientedBox.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$utils$2f$ExtendedTrianglePool$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/utils/ExtendedTrianglePool.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$cast$2f$closestPointToPoint$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/core/cast/closestPointToPoint.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$nodeBufferUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/core/utils/nodeBufferUtils.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$iterationUtils$2e$generated$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/core/utils/iterationUtils.generated.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$cast$2f$refit$2e$generated$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/core/cast/refit.generated.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$cast$2f$raycast$2e$generated$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/core/cast/raycast.generated.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$cast$2f$raycastFirst$2e$generated$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/core/cast/raycastFirst.generated.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$cast$2f$intersectsGeometry$2e$generated$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/core/cast/intersectsGeometry.generated.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$cast$2f$closestPointToGeometry$2e$generated$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/core/cast/closestPointToGeometry.generated.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$iterationUtils_indirect$2e$generated$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/core/utils/iterationUtils_indirect.generated.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$cast$2f$refit_indirect$2e$generated$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/core/cast/refit_indirect.generated.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$cast$2f$raycast_indirect$2e$generated$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/core/cast/raycast_indirect.generated.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$cast$2f$raycastFirst_indirect$2e$generated$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/core/cast/raycastFirst_indirect.generated.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$cast$2f$intersectsGeometry_indirect$2e$generated$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/core/cast/intersectsGeometry_indirect.generated.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$cast$2f$closestPointToGeometry_indirect$2e$generated$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/core/cast/closestPointToGeometry_indirect.generated.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$utils$2f$TriangleUtilities$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/utils/TriangleUtilities.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$utils$2f$GeometryRayIntersectUtilities$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/utils/GeometryRayIntersectUtilities.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$GeometryBVH$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/three-mesh-bvh@0.9.10_three@0.185.1/node_modules/three-mesh-bvh/src/core/GeometryBVH.js [app-client] (ecmascript)");
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
;
;
;
;
;
;
;
;
const _obb = /* @__PURE__ */ new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$math$2f$OrientedBox$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["OrientedBox"]();
const _ray = /* @__PURE__ */ new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Ray"]();
const _direction = /* @__PURE__ */ new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"]();
const _inverseMatrix = /* @__PURE__ */ new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Matrix4"]();
const _worldScale = /* @__PURE__ */ new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"]();
const _getters = [
    'getX',
    'getY',
    'getZ'
];
class MeshBVH extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$GeometryBVH$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GeometryBVH"] {
    /**
	 * Generates a representation of the complete bounds tree and the geometry index buffer which
	 * can be used to recreate a bounds tree using the `deserialize` function. The `serialize` and
	 * `deserialize` functions can be used to generate a MeshBVH asynchronously in a background web
	 * worker to prevent the main thread from stuttering. The BVH roots buffer stored in the
	 * serialized representation are the same as the ones used by the original BVH so they should
	 * not be modified. If `SharedArrayBuffers` are used then the same BVH memory can be used for
	 * multiple BVH in multiple WebWorkers.
	 *
	 * @static
	 * @param {MeshBVH} bvh - The BVH to serialize.
	 * @param {Object} [options]
	 * @param {boolean} [options.cloneBuffers=true] - If `true`, the index and BVH root buffers
	 *   are cloned so the serialized data is independent of the live BVH.
	 * @returns {SerializedBVH}
	 */ static serialize(bvh, options = {}) {
        options = {
            cloneBuffers: true,
            ...options
        };
        const geometry = bvh.geometry;
        const rootData = bvh._roots;
        const indirectBuffer = bvh._indirectBuffer;
        const indexAttribute = geometry.getIndex();
        const result = {
            version: 1,
            roots: null,
            index: null,
            indirectBuffer: null
        };
        if (options.cloneBuffers) {
            result.roots = rootData.map((root)=>root.slice());
            result.index = indexAttribute ? indexAttribute.array.slice() : null;
            result.indirectBuffer = indirectBuffer ? indirectBuffer.slice() : null;
        } else {
            result.roots = rootData;
            result.index = indexAttribute ? indexAttribute.array : null;
            result.indirectBuffer = indirectBuffer;
        }
        return result;
    }
    /**
	 * Returns a new MeshBVH instance from the serialized data. `geometry` is the geometry used
	 * to generate the original BVH `data` was derived from. The root buffers stored in `data`
	 * are set directly on the new BVH so the memory is shared.
	 *
	 * @static
	 * @param {SerializedBVH} data - Serialized BVH data.
	 * @param {BufferGeometry} geometry - The geometry the BVH was originally built from.
	 * @param {Object} [options]
	 * @param {boolean} [options.setIndex=true] - If `true`, sets `geometry.index` from the
	 *   serialized index buffer (creating one if none exists).
	 * @returns {MeshBVH}
	 */ static deserialize(data, geometry, options = {}) {
        options = {
            setIndex: true,
            indirect: Boolean(data.indirectBuffer),
            ...options
        };
        const { index, roots, indirectBuffer } = data;
        // handle backwards compatibility by fixing up the buffer roots
        // see issue gkjohnson/three-mesh-bvh#759
        if (!data.version) {
            console.warn('MeshBVH.deserialize: Serialization format has been changed and will be fixed up. ' + 'It is recommended to regenerate any stored serialized data.');
            fixupVersion0(roots);
        }
        const bvh = new MeshBVH(geometry, {
            ...options,
            [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$Constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SKIP_GENERATION"]]: true
        });
        bvh._roots = roots;
        bvh._indirectBuffer = indirectBuffer || null;
        if (options.setIndex) {
            const indexAttribute = geometry.getIndex();
            if (indexAttribute === null) {
                const newIndex = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BufferAttribute"](data.index, 1, false);
                geometry.setIndex(newIndex);
            } else if (indexAttribute.array !== index) {
                indexAttribute.array.set(index);
                indexAttribute.needsUpdate = true;
            }
        }
        return bvh;
        //TURBOPACK unreachable
        ;
        // convert version 0 serialized data (uint32 indices) to version 1 (node indices)
        function fixupVersion0(roots) {
            for(let rootIndex = 0; rootIndex < roots.length; rootIndex++){
                const root = roots[rootIndex];
                const uint32Array = new Uint32Array(root);
                const uint16Array = new Uint16Array(root);
                // iterate over nodes and convert right child offsets
                for(let node = 0, l = root.byteLength / __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$Constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BYTES_PER_NODE"]; node < l; node++){
                    const node32Index = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$Constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["UINT32_PER_NODE"] * node;
                    const node16Index = 2 * node32Index;
                    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$nodeBufferUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["IS_LEAF"])(node16Index, uint16Array)) {
                        // convert absolute right child offset to relative offset
                        uint32Array[node32Index + 6] = uint32Array[node32Index + 6] / __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$Constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["UINT32_PER_NODE"] - node;
                    }
                }
            }
        }
    }
    get primitiveStride() {
        return 3;
    }
    /**
	 * Helper function for use when `indirect` is set to true. This function takes a triangle
	 * index in the BVH layout and returns the associated triangle index in the geometry index
	 * buffer or position attribute.
	 * @type {function(number): number}
	 * @readonly
	 */ get resolveTriangleIndex() {
        return this.resolvePrimitiveIndex;
    }
    constructor(geometry, options = {}){
        if (options.maxLeafTris) {
            console.warn('MeshBVH: "maxLeafTris" option has been deprecated. Use maxLeafSize, instead.');
            options = {
                ...options,
                maxLeafSize: options.maxLeafTris
            };
        }
        super(geometry, options);
    }
    /**
	 * Adjusts all triangle offsets stored in the BVH by the given offset. This is useful when the
	 * triangle data has been compacted or shifted in the geometry buffers (e.g. in `BatchedMesh`
	 * when geometries are compacted using the 'optimize' function or constructing a 'merged' BVH).
	 * This function only adjusts the BVH to point to different triangles in the geometry. The
	 * geometry's index buffer and/or position attributes must be updated separately to match.
	 *
	 * @param {number} offset
	 * @returns {void}
	 */ // implement abstract methods from BVH base class
    shiftTriangleOffsets(offset) {
        return super.shiftPrimitiveOffsets(offset);
    }
    // write primitive bounds to the buffer - used only for validateBounds at the moment
    writePrimitiveBounds(i, targetBuffer, baseIndex) {
        const geometry = this.geometry;
        const indirectBuffer = this._indirectBuffer;
        const posAttr = geometry.attributes.position;
        const index = geometry.index ? geometry.index.array : null;
        const tri = indirectBuffer ? indirectBuffer[i] : i;
        const tri3 = tri * 3;
        let ai = tri3 + 0;
        let bi = tri3 + 1;
        let ci = tri3 + 2;
        if (index) {
            ai = index[ai];
            bi = index[bi];
            ci = index[ci];
        }
        for(let el = 0; el < 3; el++){
            const a = posAttr[_getters[el]](ai);
            const b = posAttr[_getters[el]](bi);
            const c = posAttr[_getters[el]](ci);
            let min = a;
            if (b < min) min = b;
            if (c < min) min = c;
            let max = a;
            if (b > max) max = b;
            if (c > max) max = c;
            // Write in min/max format [minx, miny, minz, maxx, maxy, maxz]
            targetBuffer[baseIndex + el] = min;
            targetBuffer[baseIndex + el + 3] = max;
        }
        return targetBuffer;
    }
    // precomputes the bounding box for each triangle; required for quickly calculating tree splits.
    // result is an array of size count * 6 where triangle i maps to a
    // [x_center, x_delta, y_center, y_delta, z_center, z_delta] tuple starting at index (i - offset) * 6,
    // representing the center and half-extent in each dimension of triangle i
    computePrimitiveBounds(offset, count, targetBuffer) {
        const geometry = this.geometry;
        const indirectBuffer = this._indirectBuffer;
        const posAttr = geometry.attributes.position;
        const index = geometry.index ? geometry.index.array : null;
        const normalized = posAttr.normalized;
        if (offset < 0 || count + offset - targetBuffer.offset > targetBuffer.length / 6) {
            throw new Error('MeshBVH: compute triangle bounds range is invalid.');
        }
        // used for non-normalized positions
        const posArr = posAttr.array;
        // support for an interleaved position buffer
        const bufferOffset = posAttr.offset || 0;
        let stride = 3;
        if (posAttr.isInterleavedBufferAttribute) {
            stride = posAttr.data.stride;
        }
        // used for normalized positions
        const getters = [
            'getX',
            'getY',
            'getZ'
        ];
        const writeOffset = targetBuffer.offset;
        // iterate over the triangle range
        for(let i = offset, l = offset + count; i < l; i++){
            const tri = indirectBuffer ? indirectBuffer[i] : i;
            const tri3 = tri * 3;
            const boundsIndexOffset = (i - writeOffset) * 6;
            let ai = tri3 + 0;
            let bi = tri3 + 1;
            let ci = tri3 + 2;
            if (index) {
                ai = index[ai];
                bi = index[bi];
                ci = index[ci];
            }
            // we add the stride and offset here since we access the array directly
            // below for the sake of performance
            if (!normalized) {
                ai = ai * stride + bufferOffset;
                bi = bi * stride + bufferOffset;
                ci = ci * stride + bufferOffset;
            }
            for(let el = 0; el < 3; el++){
                let a, b, c;
                if (normalized) {
                    a = posAttr[getters[el]](ai);
                    b = posAttr[getters[el]](bi);
                    c = posAttr[getters[el]](ci);
                } else {
                    a = posArr[ai + el];
                    b = posArr[bi + el];
                    c = posArr[ci + el];
                }
                let min = a;
                if (b < min) min = b;
                if (c < min) min = c;
                let max = a;
                if (b > max) max = b;
                if (c > max) max = c;
                // Increase the bounds size by float32 epsilon to avoid precision errors when
                // converting to 32 bit float. Scale the epsilon by the size of the numbers being
                // worked with.
                const halfExtents = (max - min) / 2;
                const el2 = el * 2;
                targetBuffer[boundsIndexOffset + el2 + 0] = min + halfExtents;
                targetBuffer[boundsIndexOffset + el2 + 1] = halfExtents + (Math.abs(min) + halfExtents) * __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$Constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FLOAT32_EPSILON"];
            }
        }
        return targetBuffer;
    }
    /**
	 * A convenience function for performing a raycast based on a mesh. Results are formed like
	 * three.js raycast results in world frame.
	 *
	 * @param {Object3D} object
	 * @param {Raycaster} raycaster
	 * @param {Array<Intersection>} [intersects=[]]
	 * @returns {Array<Intersection>}
	 */ raycastObject3D(object, raycaster, intersects = []) {
        const { material } = object;
        if (material === undefined) {
            return;
        }
        _inverseMatrix.copy(object.matrixWorld).invert();
        _ray.copy(raycaster.ray).applyMatrix4(_inverseMatrix);
        _worldScale.setFromMatrixScale(object.matrixWorld);
        _direction.copy(_ray.direction).multiply(_worldScale);
        const scaleFactor = _direction.length();
        const near = raycaster.near / scaleFactor;
        const far = raycaster.far / scaleFactor;
        if (raycaster.firstHitOnly === true) {
            let hit = this.raycastFirst(_ray, material, near, far);
            hit = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$utils$2f$GeometryRayIntersectUtilities$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["convertRaycastIntersect"])(hit, object, raycaster);
            if (hit) {
                intersects.push(hit);
            }
        } else {
            const hits = this.raycast(_ray, material, near, far);
            for(let i = 0, l = hits.length; i < l; i++){
                const hit = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$utils$2f$GeometryRayIntersectUtilities$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["convertRaycastIntersect"])(hits[i], object, raycaster);
                if (hit) {
                    intersects.push(hit);
                }
            }
        }
        return intersects;
    }
    /**
	 * Refit the node bounds to the current triangle positions. This is quicker than regenerating
	 * a new BVH but will not be optimal after significant changes to the vertices. `nodeIndices`
	 * is a set of node indices (provided by the `shapecast` function) that need to be refit
	 * including all internal nodes.
	 *
	 * @param {Set<number>|Array<number>|null} [nodeIndices=null]
	 */ refit(nodeIndices = null) {
        const refitFunc = this.indirect ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$cast$2f$refit_indirect$2e$generated$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["refit_indirect"] : __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$cast$2f$refit$2e$generated$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["refit"];
        return refitFunc(this, nodeIndices);
    }
    /* Core Cast Functions */ /**
	 * Returns all raycast triangle hits in unsorted order. It is expected that `ray` is in the
	 * frame of the BVH already. Likewise the returned results are also provided in the local
	 * frame of the BVH. The `side` identifier is used to determine the side to check when
	 * raycasting or a material with the given side field can be passed. If an array of materials
	 * is provided then it is expected that the geometry has groups and the appropriate material
	 * side is used per group.
	 *
	 * Note that unlike three.js' Raycaster results the points and distances in the intersections
	 * returned from this function are relative to the local frame of the MeshBVH. When using the
	 * `acceleratedRaycast` function as an override for `Mesh.raycast` they are transformed into
	 * world space to be consistent with three's results.
	 *
	 * @param {Ray} ray
	 * @param {number|Material|Array<Material>} [materialOrSide=FrontSide]
	 * @param {number} [near=0]
	 * @param {number} [far=Infinity]
	 * @returns {Array<Intersection>}
	 */ raycast(ray, materialOrSide = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FrontSide"], near = 0, far = Infinity) {
        const roots = this._roots;
        const intersects = [];
        const raycastFunc = this.indirect ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$cast$2f$raycast_indirect$2e$generated$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["raycast_indirect"] : __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$cast$2f$raycast$2e$generated$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["raycast"];
        for(let i = 0, l = roots.length; i < l; i++){
            raycastFunc(this, i, materialOrSide, ray, intersects, near, far);
        }
        return intersects;
    }
    /**
	 * Returns the first raycast hit in the model. This is typically much faster than returning
	 * all hits. See `raycast` for information on the side and material options as well as the
	 * frame of the returned intersections.
	 *
	 * @param {Ray} ray
	 * @param {number|Material|Array<Material>} [materialOrSide=FrontSide]
	 * @param {number} [near=0]
	 * @param {number} [far=Infinity]
	 * @returns {Intersection|null}
	 */ raycastFirst(ray, materialOrSide = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FrontSide"], near = 0, far = Infinity) {
        const roots = this._roots;
        let closestResult = null;
        const raycastFirstFunc = this.indirect ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$cast$2f$raycastFirst_indirect$2e$generated$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["raycastFirst_indirect"] : __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$cast$2f$raycastFirst$2e$generated$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["raycastFirst"];
        for(let i = 0, l = roots.length; i < l; i++){
            const result = raycastFirstFunc(this, i, materialOrSide, ray, near, far);
            if (result != null && (closestResult == null || result.distance < closestResult.distance)) {
                closestResult = result;
            }
        }
        return closestResult;
    }
    /**
	 * Returns whether or not the mesh intersects the given geometry.
	 *
	 * The `geometryToBvh` parameter is the transform of the geometry in the BVH's local frame.
	 *
	 * Performance improves considerably if the provided geometry also has a `boundsTree`.
	 *
	 * @param {BufferGeometry} otherGeometry
	 * @param {Matrix4} geometryToBvh - Transform of `otherGeometry` into the local space of
	 *   this BVH.
	 * @returns {boolean}
	 */ intersectsGeometry(otherGeometry, geomToMesh) {
        let result = false;
        const roots = this._roots;
        const intersectsGeometryFunc = this.indirect ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$cast$2f$intersectsGeometry_indirect$2e$generated$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["intersectsGeometry_indirect"] : __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$cast$2f$intersectsGeometry$2e$generated$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["intersectsGeometry"];
        for(let i = 0, l = roots.length; i < l; i++){
            result = intersectsGeometryFunc(this, i, otherGeometry, geomToMesh);
            if (result) {
                break;
            }
        }
        return result;
    }
    /**
	 * A generalized cast function that can be used to implement intersection logic for custom
	 * shapes. This is used internally for `intersectsBox`, `intersectsSphere`, and more. The
	 * function returns as soon as a triangle has been reported as intersected and returns `true`
	 * if a triangle has been intersected.
	 *
	 * @param {Object} callbacks
	 * @param {IntersectsBoundsCallback} callbacks.intersectsBounds
	 * @param {IntersectsTriangleCallback} [callbacks.intersectsTriangle]
	 * @param {IntersectsRangeCallback} [callbacks.intersectsRange]
	 * @param {BoundsTraverseOrderCallback} [callbacks.boundsTraverseOrder]
	 * @returns {boolean}
	 */ shapecast(callbacks) {
        const triangle = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$utils$2f$ExtendedTrianglePool$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ExtendedTrianglePool"].getPrimitive();
        const result = super.shapecast({
            ...callbacks,
            intersectsPrimitive: callbacks.intersectsTriangle,
            scratchPrimitive: triangle,
            // TODO: is the performance significant enough for the added complexity here?
            // can we just use one function?
            iterate: this.indirect ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$iterationUtils_indirect$2e$generated$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["iterateOverTriangles_indirect"] : __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$utils$2f$iterationUtils$2e$generated$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["iterateOverTriangles"]
        });
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$utils$2f$ExtendedTrianglePool$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ExtendedTrianglePool"].releasePrimitive(triangle);
        return result;
    }
    /**
	 * A generalized cast function that traverses two BVH structures simultaneously to perform
	 * intersection tests between them. This is used internally by `intersectsGeometry`. The
	 * function returns `true` as soon as a triangle pair has been reported as intersected by
	 * the callbacks.
	 *
	 * `matrixToLocal` is a Matrix4 that transforms `otherBvh` into the local space of this BVH.
	 * The other BVH's triangles are transformed by this matrix before intersection tests.
	 *
	 * @param {MeshBVH} otherBvh
	 * @param {Matrix4} matrixToLocal - Transforms `otherBvh` into the local space of this BVH.
	 * @param {Object} callbacks
	 * @param {IntersectsRangesCallback} [callbacks.intersectsRanges]
	 * @param {IntersectsTrianglesCallback} [callbacks.intersectsTriangles]
	 * @returns {boolean}
	 */ bvhcast(otherBvh, matrixToLocal, callbacks) {
        let { intersectsRanges, intersectsTriangles } = callbacks;
        const triangle1 = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$utils$2f$ExtendedTrianglePool$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ExtendedTrianglePool"].getPrimitive();
        const indexAttr1 = this.geometry.index;
        const positionAttr1 = this.geometry.attributes.position;
        const assignTriangle1 = this.indirect ? (i1)=>{
            const ti = this.resolveTriangleIndex(i1);
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$utils$2f$TriangleUtilities$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["setTriangle"])(triangle1, ti * 3, indexAttr1, positionAttr1);
        } : (i1)=>{
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$utils$2f$TriangleUtilities$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["setTriangle"])(triangle1, i1 * 3, indexAttr1, positionAttr1);
        };
        const triangle2 = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$utils$2f$ExtendedTrianglePool$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ExtendedTrianglePool"].getPrimitive();
        const indexAttr2 = otherBvh.geometry.index;
        const positionAttr2 = otherBvh.geometry.attributes.position;
        const assignTriangle2 = otherBvh.indirect ? (i2)=>{
            const ti2 = otherBvh.resolveTriangleIndex(i2);
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$utils$2f$TriangleUtilities$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["setTriangle"])(triangle2, ti2 * 3, indexAttr2, positionAttr2);
        } : (i2)=>{
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$utils$2f$TriangleUtilities$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["setTriangle"])(triangle2, i2 * 3, indexAttr2, positionAttr2);
        };
        // generate triangle callback if needed
        if (intersectsTriangles) {
            if (!(otherBvh instanceof MeshBVH)) {
                throw new Error('MeshBVH: "intersectsTriangles" callback can only be used with another MeshBVH.');
            }
            const iterateOverDoubleTriangles = (offset1, count1, offset2, count2, depth1, nodeIndex1, depth2, nodeIndex2)=>{
                for(let i2 = offset2, l2 = offset2 + count2; i2 < l2; i2++){
                    assignTriangle2(i2);
                    triangle2.a.applyMatrix4(matrixToLocal);
                    triangle2.b.applyMatrix4(matrixToLocal);
                    triangle2.c.applyMatrix4(matrixToLocal);
                    triangle2.needsUpdate = true;
                    for(let i1 = offset1, l1 = offset1 + count1; i1 < l1; i1++){
                        assignTriangle1(i1);
                        triangle1.needsUpdate = true;
                        if (intersectsTriangles(triangle1, triangle2, i1, i2, depth1, nodeIndex1, depth2, nodeIndex2)) {
                            return true;
                        }
                    }
                }
                return false;
            };
            if (intersectsRanges) {
                const originalIntersectsRanges = intersectsRanges;
                intersectsRanges = function(offset1, count1, offset2, count2, depth1, nodeIndex1, depth2, nodeIndex2) {
                    if (!originalIntersectsRanges(offset1, count1, offset2, count2, depth1, nodeIndex1, depth2, nodeIndex2)) {
                        return iterateOverDoubleTriangles(offset1, count1, offset2, count2, depth1, nodeIndex1, depth2, nodeIndex2);
                    }
                    return true;
                };
            } else {
                intersectsRanges = iterateOverDoubleTriangles;
            }
        }
        return super.bvhcast(otherBvh, matrixToLocal, {
            intersectsRanges
        });
    }
    /* Derived Cast Functions */ /**
	 * Returns whether or not the mesh intersects the given box.
	 *
	 * The `boxToBvh` parameter is the transform of the box in the meshes frame.
	 *
	 * @param {Box3} box
	 * @param {Matrix4} boxToBvh - Transform of the box in the local space of this BVH.
	 * @returns {boolean}
	 */ intersectsBox(box, boxToMesh) {
        _obb.set(box.min, box.max, boxToMesh);
        _obb.needsUpdate = true;
        return this.shapecast({
            intersectsBounds: (box)=>_obb.intersectsBox(box),
            intersectsTriangle: (tri)=>_obb.intersectsTriangle(tri)
        });
    }
    /**
	 * Returns whether or not the mesh intersects the given sphere.
	 *
	 * @param {Sphere} sphere
	 * @returns {boolean}
	 */ intersectsSphere(sphere) {
        return this.shapecast({
            intersectsBounds: (box)=>sphere.intersectsBox(box),
            intersectsTriangle: (tri)=>tri.intersectsSphere(sphere)
        });
    }
    /**
	 * Computes the closest distance from the geometry to the mesh and puts the closest point on
	 * the mesh in `target1` (in the frame of the BVH) and the closest point on the other
	 * geometry in `target2` (in the geometry frame). If `target1` is not provided a new Object
	 * is created and returned from the function.
	 *
	 * The `geometryToBvh` parameter is the transform of the geometry in the BVH's local frame.
	 *
	 * If a point is found that is closer than `minThreshold` then the function will return that
	 * result early. Any triangles or points outside of `maxThreshold` are ignored. If no point
	 * is found within the min / max thresholds then `null` is returned and the target objects
	 * are not modified.
	 *
	 * The returned faceIndex in `target1` and `target2` can be used with the standalone function
	 * `getTriangleHitPointInfo` to obtain more information like UV coordinates, triangle normal
	 * and materialIndex.
	 *
	 * _Note that this function can be very slow if `geometry` does not have a
	 * `geometry.boundsTree` computed._
	 *
	 * @param {BufferGeometry} otherGeometry
	 * @param {Matrix4} geometryToBvh - Transform of `otherGeometry` into the local space of
	 *   this BVH.
	 * @param {HitPointInfo} [target1={}]
	 * @param {HitPointInfo} [target2={}]
	 * @param {number} [minThreshold=0]
	 * @param {number} [maxThreshold=Infinity]
	 * @returns {HitPointInfo|null}
	 */ closestPointToGeometry(otherGeometry, geometryToBvh, target1 = {}, target2 = {}, minThreshold = 0, maxThreshold = Infinity) {
        const closestPointToGeometryFunc = this.indirect ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$cast$2f$closestPointToGeometry_indirect$2e$generated$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["closestPointToGeometry_indirect"] : __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$cast$2f$closestPointToGeometry$2e$generated$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["closestPointToGeometry"];
        return closestPointToGeometryFunc(this, otherGeometry, geometryToBvh, target1, target2, minThreshold, maxThreshold);
    }
    /**
	 * Computes the closest distance from the point to the mesh and gives additional information
	 * in `target`. The target can be left undefined to default to a new object which is
	 * ultimately returned by the function.
	 *
	 * If a point is found that is closer than `minThreshold` then the function will return that
	 * result early. Any triangles or points outside of `maxThreshold` are ignored. If no point
	 * is found within the min / max thresholds then `null` is returned and the `target` object
	 * is not modified.
	 *
	 * The returned faceIndex can be used with the standalone function `getTriangleHitPointInfo`
	 * to obtain more information like UV coordinates, triangle normal and materialIndex.
	 *
	 * @param {Vector3} point
	 * @param {HitPointInfo} [target={}]
	 * @param {number} [minThreshold=0]
	 * @param {number} [maxThreshold=Infinity]
	 * @returns {HitPointInfo|null}
	 */ closestPointToPoint(point, target = {}, minThreshold = 0, maxThreshold = Infinity) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$mesh$2d$bvh$40$0$2e$9$2e$10_three$40$0$2e$185$2e$1$2f$node_modules$2f$three$2d$mesh$2d$bvh$2f$src$2f$core$2f$cast$2f$closestPointToPoint$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["closestPointToPoint"])(this, point, target, minThreshold, maxThreshold);
    }
}
}),
]);

//# sourceMappingURL=1stz_three-mesh-bvh_src_1k0f8pe._.js.map