import { AdditiveBlending, Color, DoubleSide, ShaderMaterial } from "three";

/**
 * Shader materials for the stage. All glow is additive and drawn without postprocessing,
 * so the scene keeps its look on devices where bloom would be too expensive.
 */
const outro = /* glsl */ `
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
`;

const glowDefaults = { transparent: true, depthWrite: false, blending: AdditiveBlending };

/**
 * Shared depth-of-field term: 0 on the focal plane, 1 when fully out of focus. `uFocusRange`
 * defaults high enough that materials which never set a focus stay sharp.
 */
const focusChunk = /* glsl */ `
  uniform float uFocus;
  uniform float uFocusRange;
  float blurAt(float depth) {
    return clamp(abs(depth - uFocus) / uFocusRange, 0.0, 1.0);
  }
`;
const focusUniforms = () => ({ uFocus: { value: 12 }, uFocusRange: { value: 1e4 } });

/** Soft point sprites sized in world units. `uScale` = drawing-buffer height / (2·tan(fov/2)). */
export function createHaloMaterial() {
  return new ShaderMaterial({
    ...glowDefaults,
    uniforms: { uScale: { value: 600 }, uOpacity: { value: 1 }, ...focusUniforms() },
    vertexShader: /* glsl */ `
      attribute float aSize;
      attribute float aGlow;
      attribute vec3 aColor;
      uniform float uScale;
      varying vec3 vColor;
      varying float vGlow;
      varying float vBlur;
      ${focusChunk}
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vBlur = blurAt(-mv.z);
        // Out-of-focus sprites open into wider, dimmer bokeh discs.
        gl_PointSize = aSize * (0.75 + aGlow * 0.45) * (1.0 + vBlur * 0.9) * uScale / max(-mv.z, 0.5);
        gl_Position = projectionMatrix * mv;
        vColor = aColor;
        vGlow = aGlow * (1.0 - vBlur * 0.6);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uOpacity;
      varying vec3 vColor;
      varying float vGlow;
      varying float vBlur;
      void main() {
        float r = length(gl_PointCoord - 0.5) * 2.0;
        if (r > 1.0) discard;
        float core = exp(-r * r * mix(14.0, 4.0, vBlur));
        float halo = exp(-r * r * 3.2) * 0.42;
        float alpha = (core * 0.9 + halo) * vGlow * uOpacity * (1.0 - r);
        gl_FragColor = vec4(mix(vColor, vec3(1.0), core * 0.5 * (1.0 - vBlur)), alpha);
        ${outro}
      }
    `,
  });
}

/**
 * Instanced network nodes drawn as luminous glass orbs: a dark tinted body, a hot centre that
 * faces the camera, a coloured fresnel rim and one sharp key-light glint. Per-instance colour
 * comes from `instanceColor`; nodes off the focal plane fade like a shallow lens.
 */
export function createOrbMaterial() {
  return new ShaderMaterial({
    transparent: true,
    uniforms: { uOpacity: { value: 1 }, ...focusUniforms() },
    vertexShader: /* glsl */ `
      varying vec3 vNormal;
      varying vec3 vView;
      varying vec3 vColor;
      varying float vBlur;
      ${focusChunk}
      void main() {
        mat4 model = modelMatrix * instanceMatrix;
        vec4 world = model * vec4(position, 1.0);
        vNormal = normalize(mat3(model) * normal);
        vView = normalize(cameraPosition - world.xyz);
        vec4 mv = viewMatrix * world;
        vBlur = blurAt(-mv.z);
        #ifdef USE_INSTANCING_COLOR
          vColor = instanceColor;
        #else
          vColor = vec3(0.0, 0.9, 0.95);
        #endif
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uOpacity;
      varying vec3 vNormal;
      varying vec3 vView;
      varying vec3 vColor;
      varying float vBlur;
      void main() {
        vec3 n = normalize(vNormal);
        vec3 v = normalize(vView);
        float facing = max(dot(n, v), 0.0);
        float rim = pow(1.0 - facing, 2.4);
        vec3 key = normalize(vec3(-0.45, 0.75, 0.55));
        float glint = pow(max(dot(reflect(-key, n), v), 0.0), 48.0);
        float sheen = pow(max(dot(n, normalize(vec3(0.6, -0.2, 0.4))), 0.0), 3.0) * 0.25;
        vec3 color = vColor * 0.16;
        color += mix(vColor, vec3(1.0), 0.55) * pow(facing, 7.0) * 1.35;
        color += vColor * rim * 1.8;
        color += vec3(0.62, 0.9, 1.0) * sheen;
        color += vec3(1.0) * glint * 1.4 * (1.0 - vBlur);
        // Defocused orbs soften into their own colour instead of darkening into holes.
        color = mix(color, mix(vColor, vec3(1.0), 0.25) * 0.75, vBlur * 0.8);
        float alpha = mix(0.96, 0.18, vBlur) * uOpacity;
        gl_FragColor = vec4(color, alpha);
        ${outro}
      }
    `,
  });
}

/**
 * Screen-space ribbons for network edges: each segment is a quad widened in the vertex shader
 * so connections keep a soft, glowing body at any distance (GL lines are fixed at 1px).
 * `aGrow` draws an edge on from parent to child; pulses travel the same way.
 */
export function createRibbonMaterial() {
  return new ShaderMaterial({
    ...glowDefaults,
    side: DoubleSide,
    uniforms: {
      uTime: { value: 0 },
      uOpacity: { value: 1 },
      uWidth: { value: 2.4 },
      uResolution: { value: [1, 1] },
      uFrom: { value: new Color("#35f56d") },
      uTo: { value: new Color("#00e5f2") },
      uHot: { value: new Color("#eafff8") },
      ...focusUniforms(),
    },
    vertexShader: /* glsl */ `
      attribute vec3 aOther;
      attribute float aSide;
      attribute float aDir;
      attribute float aT;
      attribute float aSeed;
      attribute float aHi;
      attribute float aGrow;
      attribute float aWeight;
      uniform float uWidth;
      uniform vec2 uResolution;
      varying float vT;
      varying float vSeed;
      varying float vHi;
      varying float vGrow;
      varying float vSide;
      varying float vFade;
      ${focusChunk}
      void main() {
        vec4 a = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        vec4 b = projectionMatrix * modelViewMatrix * vec4(aOther, 1.0);
        vec2 sa = a.xy / max(a.w, 1e-3) * uResolution;
        vec2 sb = b.xy / max(b.w, 1e-3) * uResolution;
        vec2 dir = (sb - sa) * aDir;
        dir = length(dir) > 1e-4 ? normalize(dir) : vec2(1.0, 0.0);
        float blur = blurAt(a.w);
        float px = uWidth * aWeight * (1.0 + aHi * 1.1) * clamp(11.0 / a.w, 0.55, 1.7) * (1.0 + blur * 0.8);
        a.xy += vec2(-dir.y, dir.x) * aSide * px / uResolution * 2.0 * a.w;
        gl_Position = a;
        vT = aT;
        vSeed = aSeed;
        vHi = aHi;
        vGrow = aGrow;
        vSide = aSide;
        // Hide segments that cross behind the camera, and fade the far field.
        vFade = step(0.05, min(a.w, b.w)) * smoothstep(32.0, 6.0, a.w) * (1.0 - blur * 0.55);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform float uOpacity;
      uniform vec3 uFrom;
      uniform vec3 uTo;
      uniform vec3 uHot;
      varying float vT;
      varying float vSeed;
      varying float vHi;
      varying float vGrow;
      varying float vSide;
      varying float vFade;
      void main() {
        if (vT > vGrow) discard;
        float body = exp(-vSide * vSide * 3.2) * (1.0 - abs(vSide));
        float filament = exp(-vSide * vSide * 22.0);
        float head = fract(uTime * (0.16 + vHi * 0.3) + vSeed);
        float d = vT - head;
        float pulse = exp(-d * d * 260.0);
        float front = vGrow < 0.999 ? exp(-pow(vT - vGrow, 2.0) * 900.0) * 2.5 : 0.0;
        vec3 color = mix(uFrom, uTo, vT);
        color = mix(color, uHot, clamp(filament * 0.35 + pulse * 0.75 + vHi * 0.3 + front, 0.0, 1.0));
        float level = mix(0.2, 0.62, vHi) + pulse * (0.65 + vHi * 0.9) + front;
        float alpha = (body * 0.55 + filament * 0.6) * level * uOpacity * vFade;
        gl_FragColor = vec4(color, alpha);
        ${outro}
      }
    `,
  });
}

/** Living energy core: drifting plasma bands under a fresnel skin, white-hot where it faces you. */
export function createCoreMaterial() {
  return new ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uLevel: { value: 1 },
      uDeep: { value: new Color("#021a1f") },
      uMid: { value: new Color("#00b8d4") },
      uHot: { value: new Color("#c8fff0") },
    },
    vertexShader: /* glsl */ `
      varying vec3 vNormal;
      varying vec3 vView;
      varying vec3 vLocal;
      void main() {
        vec4 world = modelMatrix * vec4(position, 1.0);
        vNormal = normalize(mat3(modelMatrix) * normal);
        vView = normalize(cameraPosition - world.xyz);
        vLocal = position;
        gl_Position = projectionMatrix * viewMatrix * world;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform float uLevel;
      uniform vec3 uDeep;
      uniform vec3 uMid;
      uniform vec3 uHot;
      varying vec3 vNormal;
      varying vec3 vView;
      varying vec3 vLocal;
      float hash(vec3 p) {
        p = fract(p * 0.3183099 + 0.1);
        p *= 17.0;
        return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
      }
      float noise(vec3 x) {
        vec3 i = floor(x);
        vec3 f = fract(x);
        f = f * f * (3.0 - 2.0 * f);
        return mix(
          mix(mix(hash(i), hash(i + vec3(1, 0, 0)), f.x), mix(hash(i + vec3(0, 1, 0)), hash(i + vec3(1, 1, 0)), f.x), f.y),
          mix(mix(hash(i + vec3(0, 0, 1)), hash(i + vec3(1, 0, 1)), f.x), mix(hash(i + vec3(0, 1, 1)), hash(i + vec3(1, 1, 1)), f.x), f.y),
          f.z);
      }
      float fbm(vec3 p) {
        float value = 0.0;
        float amp = 0.5;
        for (int i = 0; i < 4; i++) {
          value += amp * noise(p);
          p = p * 2.03 + vec3(1.7, -0.6, 2.3);
          amp *= 0.5;
        }
        return value;
      }
      void main() {
        vec3 n = normalize(vNormal);
        float facing = max(dot(n, normalize(vView)), 0.0);
        vec3 p = normalize(vLocal) * 2.2;
        float warp = fbm(p + vec3(0.0, uTime * 0.12, 0.0));
        float shade = fbm(p * 1.2 + warp * 1.4 - vec3(uTime * 0.05, 0.0, uTime * 0.03));
        // Holographic globe: faint meridians and parallels, a scan band, and a bright rim.
        vec3 dir = normalize(vLocal);
        float lon = atan(dir.z, dir.x) + uTime * 0.12;
        float lat = asin(clamp(dir.y, -1.0, 1.0));
        float meridian = smoothstep(0.455, 0.5, abs(fract(lon * 12.0 / 6.2831853) - 0.5));
        float parallel = smoothstep(0.46, 0.5, abs(fract(lat * 7.0 / 3.1415927) - 0.5));
        float grid = clamp(max(meridian, parallel), 0.0, 1.0) * pow(facing, 0.6);
        float scan = exp(-pow(dir.y - sin(uTime * 0.45) * 0.85, 2.0) * 40.0);
        vec3 color = mix(uDeep, uDeep * 2.0 + uMid * 0.18, smoothstep(0.3, 0.75, shade));
        color += uMid * pow(facing, 2.0) * 0.32 * uLevel;
        color += mix(uMid, uHot, 0.5) * grid * 0.32;
        color += uHot * scan * 0.28 * (0.5 + 0.5 * uLevel);
        color += mix(uMid, uHot, 0.7) * pow(1.0 - facing, 2.4) * 1.3;
        gl_FragColor = vec4(color, 1.0);
        ${outro}
      }
    `,
  });
}

/**
 * Orbit ring drawn as fading comet trails behind `uBeads` evenly spaced heads. Uses the torus
 * UV, whose x runs around the major circle, so the trail turns with the mesh.
 */
export function createTrailMaterial(color = "#5ad7f2", beads = 1) {
  return new ShaderMaterial({
    ...glowDefaults,
    uniforms: { uColor: { value: new Color(color) }, uBeads: { value: beads }, uOpacity: { value: 1 } },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      uniform float uBeads;
      uniform float uOpacity;
      varying vec2 vUv;
      void main() {
        float trail = fract(vUv.x * uBeads);
        float alpha = 0.06 + pow(trail, 5.0) * 0.9;
        gl_FragColor = vec4(mix(uColor, vec3(1.0), pow(trail, 24.0) * 0.6), alpha * uOpacity);
        ${outro}
      }
    `,
  });
}

/**
 * Holographic analytics columns: glassy sides that brighten towards a lit cap, crisp vertical
 * edges, and a slow scan line climbing each bar. The box is translated so local y runs 0→1.
 */
export function createColumnMaterial() {
  return new ShaderMaterial({
    ...glowDefaults,
    uniforms: { uTime: { value: 0 }, uOpacity: { value: 0 } },
    vertexShader: /* glsl */ `
      varying vec3 vLocal;
      varying vec3 vColor;
      varying float vHeight;
      void main() {
        vLocal = position;
        vHeight = length(instanceMatrix[1].xyz);
        #ifdef USE_INSTANCING_COLOR
          vColor = instanceColor;
        #else
          vColor = vec3(0.0, 0.72, 0.82);
        #endif
        gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform float uOpacity;
      varying vec3 vLocal;
      varying vec3 vColor;
      varying float vHeight;
      void main() {
        vec2 side = abs(vLocal.xz);
        float edge = smoothstep(0.41, 0.5, min(side.x, side.y));
        float cap = step(0.999, vLocal.y);
        float rise = pow(vLocal.y, 1.6);
        float worldY = vLocal.y * vHeight;
        float scan = exp(-pow(fract(worldY * 0.35 - uTime * 0.25) - 0.5, 2.0) * 160.0);
        vec3 color = mix(vColor * 0.55, mix(vColor, vec3(1.0), 0.45), rise);
        float alpha = 0.05 + rise * 0.22 + edge * (0.25 + rise * 0.5) + cap * 0.75 + scan * 0.35;
        color += vec3(0.8, 0.95, 1.0) * (cap * 0.5 + scan * 0.4);
        gl_FragColor = vec4(color, alpha * uOpacity);
        ${outro}
      }
    `,
  });
}

/**
 * Full-screen nebula behind everything: slow coloured clouds and a soft key light, offset by
 * the camera's heading so the deepest layer still parallaxes.
 */
export function createNebulaMaterial() {
  return new ShaderMaterial({
    ...glowDefaults,
    uniforms: {
      uTime: { value: 0 },
      uIntensity: { value: 1 },
      uOffset: { value: [0, 0] },
      uAspect: { value: 1 },
      uFocusPoint: { value: [0.68, 0.52] },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position.xy * 2.0, 0.9999, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform float uIntensity;
      uniform vec2 uOffset;
      uniform float uAspect;
      uniform vec2 uFocusPoint;
      varying vec2 vUv;
      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
      }
      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
      }
      float fbm(vec2 p) {
        float v = 0.0;
        float a = 0.5;
        for (int i = 0; i < 5; i++) {
          v += a * noise(p);
          p = p * 2.02 + vec2(3.1, 1.7);
          a *= 0.5;
        }
        return v;
      }
      void main() {
        vec2 uv = vUv;
        vec2 p = vec2(uv.x * uAspect, uv.y) * 1.6 + uOffset;
        float t = uTime * 0.018;
        float clouds = fbm(p + vec2(t, -t * 0.6) + fbm(p * 0.7 - t) * 0.9);
        float wisps = fbm(p * 2.3 - vec2(t * 1.4, 0.0));
        vec2 d = (uv - uFocusPoint) * vec2(uAspect, 1.0);
        float key = exp(-dot(d, d) * 2.4);
        vec3 violet = vec3(0.0, 0.3, 0.4);
        vec3 cyan = vec3(0.08, 0.55, 0.34);
        vec3 color = mix(violet, cyan, smoothstep(0.35, 0.75, wisps));
        float density = smoothstep(0.38, 0.85, clouds) * (0.35 + key * 0.9);
        float alpha = (density * 0.32 + key * 0.12) * uIntensity;
        gl_FragColor = vec4(color, alpha);
        ${outro}
      }
    `,
  });
}

/** Network edges with energy pulses travelling from parent to child. */
export function createEdgeMaterial() {
  return new ShaderMaterial({
    ...glowDefaults,
    uniforms: {
      uTime: { value: 0 },
      uOpacity: { value: 1 },
      uFrom: { value: new Color("#35f56d") },
      uTo: { value: new Color("#00e5f2") },
      uHot: { value: new Color("#eafff8") },
    },
    vertexShader: /* glsl */ `
      attribute float aT;
      attribute float aSeed;
      attribute float aHi;
      varying float vT;
      varying float vSeed;
      varying float vHi;
      varying float vDepth;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vT = aT;
        vSeed = aSeed;
        vHi = aHi;
        vDepth = -mv.z;
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform float uOpacity;
      uniform vec3 uFrom;
      uniform vec3 uTo;
      uniform vec3 uHot;
      varying float vT;
      varying float vSeed;
      varying float vHi;
      varying float vDepth;
      void main() {
        float head = fract(uTime * (0.16 + vHi * 0.3) + vSeed);
        float d = vT - head;
        float pulse = exp(-d * d * 220.0);
        vec3 color = mix(uFrom, uTo, vT);
        color = mix(color, uHot, clamp(pulse * 0.7 + vHi * 0.3, 0.0, 1.0));
        float fade = smoothstep(30.0, 6.0, vDepth);
        float alpha = (mix(0.17, 0.62, vHi) + pulse * (0.5 + vHi * 0.8)) * uOpacity * fade;
        gl_FragColor = vec4(color, alpha);
        ${outro}
      }
    `,
  });
}

/** Ambient dust. Positions drift in the vertex shader, so the CPU never touches them. */
export function createDustMaterial() {
  return new ShaderMaterial({
    ...glowDefaults,
    uniforms: { uTime: { value: 0 }, uScale: { value: 600 }, uOpacity: { value: 1 } },
    vertexShader: /* glsl */ `
      attribute float aSeed;
      uniform float uTime;
      uniform float uScale;
      varying float vAlpha;
      varying float vTone;
      void main() {
        vec3 p = position;
        p.x = mod(p.x + uTime * (0.05 + aSeed * 0.08) + 22.0, 44.0) - 22.0;
        p.y += sin(uTime * 0.3 + aSeed * 40.0) * 0.35;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        float depth = max(-mv.z, 0.5);
        gl_PointSize = (0.035 + aSeed * 0.05) * uScale / depth;
        gl_Position = projectionMatrix * mv;
        float twinkle = 0.55 + 0.45 * sin(uTime * (0.8 + aSeed * 1.6) + aSeed * 90.0);
        vAlpha = twinkle * smoothstep(34.0, 8.0, depth) * smoothstep(0.6, 2.5, depth);
        vTone = aSeed;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uOpacity;
      varying float vAlpha;
      varying float vTone;
      void main() {
        float r = length(gl_PointCoord - 0.5) * 2.0;
        if (r > 1.0) discard;
        vec3 color = vTone > 0.82 ? vec3(0.66, 1.0, 0.0) : (vTone > 0.45 ? vec3(0.0, 0.96, 0.83) : vec3(0.0, 0.9, 0.95));
        gl_FragColor = vec4(color, exp(-r * r * 5.0) * vAlpha * uOpacity * 0.85);
        ${outro}
      }
    `,
  });
}

/** Holographic floor grid with an expanding scan ring. */
export function createGridMaterial() {
  return new ShaderMaterial({
    ...glowDefaults,
    uniforms: {
      uTime: { value: 0 },
      uOpacity: { value: 1 },
      uColor: { value: new Color("#0a8fa0") },
      uScan: { value: new Color("#00e5f2") },
    },
    vertexShader: /* glsl */ `
      varying vec3 vWorld;
      void main() {
        vec4 world = modelMatrix * vec4(position, 1.0);
        vWorld = world.xyz;
        gl_Position = projectionMatrix * viewMatrix * world;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform float uOpacity;
      uniform vec3 uColor;
      uniform vec3 uScan;
      varying vec3 vWorld;
      void main() {
        vec2 cell = vWorld.xz / 0.92;
        vec2 grid = abs(fract(cell - 0.5) - 0.5) / fwidth(cell);
        float line = 1.0 - min(min(grid.x, grid.y), 1.0);
        float dist = length(vWorld.xz);
        float fade = smoothstep(20.0, 2.0, dist);
        float ring = mod(dist - uTime * 1.6, 16.0);
        float scan = exp(-pow(ring - 1.0, 2.0) * 1.4);
        vec3 color = mix(uColor, uScan, scan);
        float alpha = line * (0.16 + scan * 0.5) * fade * uOpacity;
        gl_FragColor = vec4(color, alpha);
        ${outro}
      }
    `,
  });
}

/** View-dependent rim light for glassy shells. */
export function createFresnelMaterial({ inner = "#4f8cff", outer = "#5ad7f2", power = 2.4, intensity = 1 } = {}) {
  return new ShaderMaterial({
    ...glowDefaults,
    uniforms: {
      uInner: { value: new Color(inner) },
      uOuter: { value: new Color(outer) },
      uPower: { value: power },
      uIntensity: { value: intensity },
    },
    vertexShader: /* glsl */ `
      varying vec3 vNormal;
      varying vec3 vView;
      void main() {
        vec4 world = modelMatrix * vec4(position, 1.0);
        vNormal = normalize(mat3(modelMatrix) * normal);
        vView = normalize(cameraPosition - world.xyz);
        gl_Position = projectionMatrix * viewMatrix * world;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uInner;
      uniform vec3 uOuter;
      uniform float uPower;
      uniform float uIntensity;
      varying vec3 vNormal;
      varying vec3 vView;
      void main() {
        float f = pow(1.0 - max(dot(normalize(vNormal), normalize(vView)), 0.0), uPower);
        gl_FragColor = vec4(mix(uInner, uOuter, f), f * uIntensity);
        ${outro}
      }
    `,
  });
}

/** Camera-facing radial glow on a unit plane. */
export function createGlowMaterial(color = "#5ad7f2") {
  return new ShaderMaterial({
    ...glowDefaults,
    uniforms: { uColor: { value: new Color(color) }, uIntensity: { value: 1 }, uSize: { value: 1 } },
    vertexShader: /* glsl */ `
      uniform float uSize;
      varying vec2 vUv;
      void main() {
        vUv = uv;
        vec4 mv = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
        mv.xy += position.xy * uSize;
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      uniform float uIntensity;
      varying vec2 vUv;
      void main() {
        float r = length(vUv - 0.5) * 2.0;
        float alpha = (pow(max(0.0, 1.0 - r), 2.6) * 0.8 + exp(-r * r * 30.0) * 0.6) * uIntensity;
        gl_FragColor = vec4(uColor, alpha);
        ${outro}
      }
    `,
  });
}
