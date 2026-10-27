/**
 * Scroll "acts" for the home page stage. Each landing section carries `data-act="<name>"`;
 * the backdrop turns scroll position into a fractional index over those sections and the
 * scene blends between neighbouring keyframes.
 *
 * layout   — node formation (see networkModel.js): 0 network, 1 expanded, 2 columns, 3 tiers, 4 converged
 * cam/look — camera position and target in world units
 * shift    — world offset [x, y] on wide screens; `narrowShift` replaces it on portrait screens
 * nebula   — strength of the backdrop clouds and key light
 * dim      — opacity of the navy veil over the canvas (0 = full scene, 1 = hidden)
 */
export const ACTS = {
  hero: {
    layout: 0,
    cam: [0, 0.35, 12],
    look: [0, 0, 0],
    shift: [3.7, 0.1],
    narrowShift: [0, -3.1],
    dim: 0,
    narrowDim: 0.18,
    lines: 1,
    spin: 1,
    core: 1,
    grid: 1,
    gridY: -4.4,
    columns: 0,
    nebula: 1,
  },
  intro: {
    layout: 1,
    cam: [0.8, 1.1, 7.4],
    look: [0, 0, -2],
    shift: [3, -1.3],
    narrowShift: [0, -1.8],
    dim: 0.58,
    narrowDim: 0.66,
    lines: 0.9,
    spin: 0.55,
    core: 0.8,
    grid: 0.45,
    gridY: -4.4,
    columns: 0,
    nebula: 0.85,
  },
  platform: {
    layout: 2,
    cam: [0, 7.4, 12.6],
    look: [0, -1.2, 0],
    shift: [0, 0],
    dim: 0.68,
    narrowDim: 0.76,
    lines: 0.1,
    spin: 0.12,
    core: 0.25,
    grid: 1,
    gridY: -2.6,
    columns: 1,
    nebula: 0.55,
  },
  path: {
    layout: 3,
    cam: [0, 2.4, 11.5],
    look: [0, 0, 0],
    shift: [0, 0],
    dim: 0.52,
    lines: 0.8,
    spin: 0.45,
    core: 0.7,
    grid: 0.6,
    gridY: -3.6,
    columns: 0,
    nebula: 0.75,
  },
  features: {
    layout: 1,
    cam: [-3.2, 1.6, 9],
    look: [0, 0, 0],
    shift: [4.2, 0.9],
    narrowShift: [0, 1.2],
    dim: 0.62,
    narrowDim: 0.7,
    lines: 0.9,
    spin: 0.4,
    core: 0.8,
    grid: 0.35,
    gridY: -4.4,
    columns: 0,
    nebula: 0.7,
  },
  network: {
    layout: 0,
    cam: [0, 0, 15],
    look: [0, 0, 0],
    shift: [0, 0],
    dim: 0.97,
    lines: 0.6,
    spin: 0.3,
    core: 0.5,
    grid: 0,
    gridY: -4.4,
    columns: 0,
    nebula: 0.4,
  },
  analytics: {
    layout: 2,
    cam: [4.2, 5.2, 12.4],
    look: [0, -0.8, 0],
    shift: [0, 0],
    dim: 0.5,
    narrowDim: 0.7,
    lines: 0.08,
    spin: 0.2,
    core: 0.25,
    grid: 1,
    gridY: -2.6,
    columns: 1,
    nebula: 0.6,
  },
  details: {
    layout: 0,
    cam: [0, 0, 17],
    look: [0, 0, 0],
    shift: [0, 0],
    dim: 0.88,
    lines: 0.6,
    spin: 0.3,
    core: 0.5,
    grid: 0.2,
    gridY: -4.4,
    columns: 0,
    nebula: 0.5,
  },
  finale: {
    layout: 4,
    cam: [0, 0.2, 10.4],
    look: [0, 0, 0],
    shift: [0, 1.25],
    narrowShift: [0, 2.7],
    narrowDim: 0.3,
    dim: 0,
    lines: 1,
    spin: 0.8,
    core: 1.35,
    grid: 0.8,
    gridY: -3.4,
    columns: 0,
    nebula: 1.3,
  },
};

/** Scalar act properties eased by the stage rig. */
export const STAGE_KEYS = ["lines", "spin", "core", "grid", "gridY", "columns", "nebula"];

const lerp = (a, b, t) => a + (b - a) * t;

function resolve(name, narrow) {
  const act = ACTS[name] ?? ACTS.hero;
  return {
    act,
    shift: narrow && act.narrowShift ? act.narrowShift : act.shift,
    dim: narrow && act.narrowDim != null ? act.narrowDim : act.dim,
  };
}

/** Fills `out` with the blended keyframe for a fractional act position. Allocation-free. */
export function sampleActs(names, position, narrow, out) {
  const count = Math.max(1, names.length);
  const clamped = Math.min(Math.max(position, 0), count - 1);
  const index = Math.floor(clamped);
  const t = clamped - index;
  const a = resolve(names[index], narrow);
  const b = resolve(names[Math.min(index + 1, count - 1)], narrow);

  out.layoutA = a.act.layout;
  out.layoutB = b.act.layout;
  out.blend = t;
  out.index = index;
  for (let i = 0; i < 3; i += 1) {
    out.cam[i] = lerp(a.act.cam[i], b.act.cam[i], t);
    out.look[i] = lerp(a.act.look[i], b.act.look[i], t);
  }
  out.shift[0] = lerp(a.shift[0], b.shift[0], t);
  out.shift[1] = lerp(a.shift[1], b.shift[1], t);
  out.dim = lerp(a.dim, b.dim, t);
  for (const key of STAGE_KEYS) {
    out[key] = lerp(a.act[key], b.act[key], t);
  }
  // Pointer interaction belongs to the hero only.
  out.interactive = names[index] === "hero" && t < 0.5;
  return out;
}

export function createActSample() {
  return {
    layoutA: 0,
    layoutB: 0,
    blend: 0,
    cam: [0, 0, 12],
    look: [0, 0, 0],
    shift: [0, 0],
    dim: 0,
    lines: 1,
    spin: 1,
    core: 1,
    grid: 1,
    gridY: -4.4,
    columns: 0,
    nebula: 1,
    index: 0,
    interactive: true,
  };
}
