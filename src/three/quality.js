/** Device capability checks for the 3D layer. Three.js r163+ requires WebGL 2. */
let webglSupport;

export function hasWebGL2() {
  if (webglSupport !== undefined) return webglSupport;
  try {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("webgl2");
    webglSupport = Boolean(context);
    context?.getExtension("WEBGL_lose_context")?.loseContext();
  } catch {
    webglSupport = false;
  }
  return webglSupport;
}

/** "none" means: show the CSS/SVG fallback instead of a WebGL scene. */
export function getTier() {
  if (typeof window === "undefined" || !hasWebGL2()) return "none";
  const width = window.innerWidth;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const cores = navigator.hardwareConcurrency ?? 4;
  const memory = navigator.deviceMemory ?? 4;
  if (cores <= 2 && memory <= 2) return "none";
  if (width < 640 || memory <= 2 || navigator.connection?.saveData) return "low";
  if (width < 1024 || coarse) return "medium";
  return "high";
}

export const tierConfig = {
  high: { dpr: [1, 1.75], l2PerL1: 3, leafPerL2: 2, dust: 900, constellations: 9, flowsPerEdge: 2, segments: 48 },
  medium: { dpr: [1, 1.5], l2PerL1: 3, leafPerL2: 1, dust: 520, constellations: 6, flowsPerEdge: 1, segments: 32 },
  low: { dpr: [1, 1.25], l2PerL1: 2, leafPerL2: 1, dust: 260, constellations: 4, flowsPerEdge: 1, segments: 24 },
};
