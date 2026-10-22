/**
 * Tiny shared store between the DOM (scroll position, info panel) and the WebGL stage.
 * Hot values are plain mutable fields read inside the render loop; only the selected node
 * notifies React subscribers, so hovering and scrolling never re-render components.
 */
const listeners = new Set();

export const stage = {
  /** Fractional index into `actNames`, written by the backdrop on scroll. */
  actPos: 0,
  actNames: ["hero"],
  /** Pointer in normalised device coordinates (-1..1), mouse only. */
  pointer: { x: 0, y: 0 },
  selected: null,
  /** DOM element the stage positions next to the selected node. */
  panelEl: null,
  invalidate: null,
  setFrameloop: null,
  degraded: false,
};

function emit() {
  listeners.forEach((listener) => listener());
}

export function selectNode(info) {
  if (stage.selected?.index === info?.index) return;
  stage.selected = info;
  emit();
  stage.invalidate?.();
}

export function subscribeStage(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getSelectedNode() {
  return stage.selected;
}
