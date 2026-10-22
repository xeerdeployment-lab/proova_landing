import { AdditiveBlending, Color, ShaderMaterial } from "three";

/**
 * Shader materials for the stage. All glow is additive and drawn without postprocessing,
 * so the scene keeps its look on devices where bloom would be too expensive.
 */
const outro = /* glsl */ `
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
`;

const glowDefaults = { transparent: true, depthWrite: false, blending: AdditiveBlending };

/** Soft point sprites sized in world units. `uScale` = drawing-buffer height / (2·tan(fov/2)). */
export function createHaloMaterial() {
  return new ShaderMaterial({
    ...glowDefaults,
    uniforms: { uScale: { value: 600 }, uOpacity: { value: 1 } },
    vertexShader: /* glsl */ `
      attribute float aSize;
      attribute float aGlow;
      attribute vec3 aColor;
      uniform float uScale;
      varying vec3 vColor;
      varying float vGlow;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = aSize * (0.75 + aGlow * 0.45) * uScale / max(-mv.z, 0.5);
        gl_Position = projectionMatrix * mv;
        vColor = aColor;
        vGlow = aGlow;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uOpacity;
      varying vec3 vColor;
      varying float vGlow;
      void main() {
        float r = length(gl_PointCoord - 0.5) * 2.0;
        if (r > 1.0) discard;
        float core = exp(-r * r * 14.0);
        float halo = exp(-r * r * 3.2) * 0.42;
        float alpha = (core * 0.9 + halo) * vGlow * uOpacity * (1.0 - r);
        gl_FragColor = vec4(mix(vColor, vec3(1.0), core * 0.5), alpha);
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
      uFrom: { value: new Color("#8b84ff") },
      uTo: { value: new Color("#5ad7f2") },
      uHot: { value: new Color("#e8f6ff") },
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
        vec3 color = vTone > 0.82 ? vec3(0.85, 0.74, 0.51) : (vTone > 0.45 ? vec3(0.65, 0.63, 1.0) : vec3(0.35, 0.84, 0.95));
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
      uColor: { value: new Color("#5a7dff") },
      uScan: { value: new Color("#5ad7f2") },
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
