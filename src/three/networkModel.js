/**
 * Illustrative referral hierarchy for the hero stage: a core, its direct connections, and two
 * further levels. Positions are precomputed for every formation the scroll story morphs through.
 * None of this is member data.
 */
const GOLDEN = Math.PI * (3 - Math.sqrt(5));

export const LEVEL_SIZE = [0, 0.17, 0.115, 0.08];
export const LEVEL_COLOR = ["#ffffff", "#8b84ff", "#4f8cff", "#5ad7f2"];
export const ACCENT_COLOR = "#34d399";
const LEVEL_LABEL = ["Core", "Level 1 · direct connection", "Level 2", "Level 3"];

function random(seed) {
  let value = seed;
  return () => {
    value = (value + 0x6d2b79f5) | 0;
    let t = Math.imul(value ^ (value >>> 15), 1 | value);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const normalize = (v) => {
  const length = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / length, v[1] / length, v[2] / length];
};

const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];

/** Direction near `parent`, rotated `index / count` of the way around it by `angle` radians. */
function spread(parent, index, count, angle, jitter) {
  const helper = Math.abs(parent[1]) > 0.9 ? [1, 0, 0] : [0, 1, 0];
  const u = normalize(cross(parent, helper));
  const v = cross(parent, u);
  const phi = (index / count) * Math.PI * 2 + jitter;
  const k = Math.tan(angle);
  return normalize([
    parent[0] + (u[0] * Math.cos(phi) + v[0] * Math.sin(phi)) * k,
    parent[1] + (u[1] * Math.cos(phi) + v[1] * Math.sin(phi)) * k,
    parent[2] + (u[2] * Math.cos(phi) + v[2] * Math.sin(phi)) * k,
  ]);
}

export function buildNetwork({ l2PerL1, leafPerL2 }) {
  const rand = random(11);
  const nodes = [];
  const directs = 6;

  for (let i = 0; i < directs; i += 1) {
    const y = 1 - ((i + 0.5) / directs) * 2;
    const r = Math.sqrt(1 - y * y);
    const theta = i * GOLDEN + 0.4;
    const dir = normalize([Math.cos(theta) * r, y * 0.5, Math.sin(theta) * r]);
    nodes.push({ level: 1, parent: -1, dir, path: `${i + 1}` });
  }

  const firstLevel = nodes.length;
  for (let p = 0; p < firstLevel; p += 1) {
    for (let j = 0; j < l2PerL1; j += 1) {
      const dir = spread(nodes[p].dir, j, l2PerL1, 0.42, rand() * 0.8);
      nodes.push({ level: 2, parent: p, dir, path: `${nodes[p].path}.${j + 1}` });
    }
  }

  const secondLevel = nodes.length;
  for (let p = firstLevel; p < secondLevel; p += 1) {
    for (let k = 0; k < leafPerL2; k += 1) {
      const dir = spread(nodes[p].dir, k, Math.max(2, leafPerL2), 0.24, rand() * 1.2);
      nodes.push({ level: 3, parent: p, dir, path: `${nodes[p].path}.${k + 1}` });
    }
  }

  nodes.forEach((node, index) => {
    node.index = index;
    node.size = LEVEL_SIZE[node.level] * (0.85 + rand() * 0.3);
    node.color = node.level === 3 && index % 7 === 0 ? ACCENT_COLOR : LEVEL_COLOR[node.level];
    node.jitter = 0.92 + rand() * 0.16;
    node.speed = 1.6 + rand() * 1.6;
    node.children = 0;
  });
  nodes.forEach((node) => {
    if (node.parent >= 0) nodes[node.parent].children += 1;
  });

  const count = nodes.length;
  const layouts = Array.from({ length: 5 }, () => new Float32Array(count * 3));
  const barHeights = new Float32Array(count);
  const write = (layout, index, x, y, z) => {
    layout[index * 3] = x;
    layout[index * 3 + 1] = y;
    layout[index * 3 + 2] = z;
  };

  // 0 — layered network shells
  const shell = [0, 2.5, 3.9, 5.2];
  // 1 — expanded network the camera travels into
  const expanded = [0, 3.7, 6.2, 8.8];
  nodes.forEach((node) => {
    const [x, y, z] = node.dir;
    const r0 = shell[node.level] * node.jitter;
    write(layouts[0], node.index, x * r0, y * r0, z * r0);
    const r1 = expanded[node.level] * node.jitter;
    write(layouts[1], node.index, x * r1, y * r1 * 0.8, z * r1);
  });

  // 2 — analytics columns on a floor grid
  const cols = Math.ceil(Math.sqrt(count * 1.7));
  const rows = Math.ceil(count / cols);
  const gap = 0.92;
  const floor = -2.6;
  nodes.forEach((node, index) => {
    const c = index % cols;
    const r = Math.floor(index / cols);
    const wave = 0.5 + 0.5 * Math.sin(c * 0.62 + r * 0.5) * Math.cos(r * 0.3 - c * 0.18);
    const height = 0.35 + wave * 2.6 * (0.7 + rand() * 0.3);
    barHeights[index] = height;
    write(layouts[2], index, (c - (cols - 1) / 2) * gap, floor + height + 0.12, (r - (rows - 1) / 2) * gap);
  });

  // 3 — three tiers, one per step of the journey
  const tierY = [0, 2.1, 0.1, -1.9];
  const tierR = [0, 1.8, 3.5, 5.1];
  nodes.forEach((node) => {
    const angle = Math.atan2(node.dir[2], node.dir[0]);
    write(layouts[3], node.index, Math.cos(angle) * tierR[node.level], tierY[node.level], Math.sin(angle) * tierR[node.level]);
  });

  // 4 — converged shell hugging the core
  nodes.forEach((node, index) => {
    const y = 1 - ((index + 0.5) / count) * 2;
    const r = Math.sqrt(1 - y * y);
    const theta = index * GOLDEN;
    const radius = 1.42 + (node.level - 1) * 0.06;
    write(layouts[4], index, Math.cos(theta) * r * radius, y * radius, Math.sin(theta) * r * radius);
  });

  return { nodes, layouts, barHeights, floor };
}

export function describeNode(node) {
  return {
    index: node.index,
    title: `Node ${node.path}`,
    level: node.level,
    role: LEVEL_LABEL[node.level],
    connections: node.children,
    color: node.color,
  };
}
