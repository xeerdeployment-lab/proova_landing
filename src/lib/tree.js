/**
 * Lays out a `{ children }` tree top-down. Leaves get evenly spaced slots and each
 * parent is centred over its children. Returns flat `nodes` and parent→child `links`.
 */
export function layoutTree(root, { width, top = 40, levelGap = 100, padX = 40 }) {
  const leaves = countLeaves(root);
  const slot = (width - padX * 2) / Math.max(1, leaves);
  const nodes = [];
  const links = [];
  let leaf = 0;

  const place = (node, depth, parent) => {
    const { children = [], ...rest } = node;
    const entry = { ...rest, depth, childCount: children.length, x: 0, y: top + depth * levelGap };
    nodes.push(entry);
    if (parent) links.push({ id: `${parent.id}-${entry.id}`, from: parent, to: entry });

    if (!children.length) {
      entry.x = padX + slot * (leaf + 0.5);
      leaf += 1;
    } else {
      const xs = children.map((child) => place(child, depth + 1, entry));
      entry.x = (xs[0] + xs[xs.length - 1]) / 2;
    }
    return entry.x;
  };

  place(root, 0, null);
  return { nodes, links };
}

function countLeaves(node) {
  const children = node.children ?? [];
  return children.length ? children.reduce((sum, child) => sum + countLeaves(child), 0) : 1;
}

/** Smooth vertical S-curve between two laid-out nodes. */
export function linkPath({ from, to }) {
  const mid = (from.y + to.y) / 2;
  return `M ${from.x} ${from.y} C ${from.x} ${mid}, ${to.x} ${mid}, ${to.x} ${to.y}`;
}
