const LEVEL_Y = [2.5, 0.95, -0.6, -2.15];

/**
 * Lays out the visible part of the sample tree in 3D: depth sets the height, siblings spread
 * on an arc that bends back in z so the hierarchy reads with real depth.
 */
export function layoutTree3D(root, expanded) {
  const placed = new Map();
  let leaves = 0;
  const visit = (node, depth, parentId) => {
    const children = expanded.has(node.id) ? (node.children ?? []) : [];
    const entry = { id: node.id, depth, parentId, x: 0 };
    placed.set(node.id, entry);
    if (!children.length) {
      entry.x = leaves;
      leaves += 1;
    } else {
      const xs = children.map((child) => visit(child, depth + 1, node.id));
      entry.x = (xs[0] + xs[xs.length - 1]) / 2;
    }
    return entry.x;
  };
  visit(root, 0, null);
  const span = Math.max(1, leaves - 1);
  const width = Math.min(9.5, 2.2 + leaves * 1.35);
  placed.forEach((entry) => {
    const u = leaves > 1 ? entry.x / span - 0.5 : 0;
    entry.position = [u * width, LEVEL_Y[Math.min(entry.depth, LEVEL_Y.length - 1)], -Math.abs(u) * width * 0.45 + 0.4];
  });
  return placed;
}
