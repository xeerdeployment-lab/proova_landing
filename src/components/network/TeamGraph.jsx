import { Minus, Plus, RotateCcw, Search } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { formatDate } from "../../lib/dates";
import StatusBadge from "../ui/StatusBadge";

const nodeWidth = 142;
const gapX = 18;
const gapY = 108;
const mobilePage = 20;

function leafCount(node) {
  if (!node.children?.length) return 1;
  return node.children.reduce((sum, child) => sum + leafCount(child), 0);
}

function layoutTree(root, upline, expanded) {
  const prune = (node) => {
    const open = expanded.has(node.id);
    const children = open ? (node.children ?? []).map(prune) : [];
    return {
      ...node,
      children,
      hiddenCount: open ? 0 : (node.children ?? []).length,
    };
  };
  const tree = prune(root);
  const positions = [];
  const links = [];

  const place = (node, left, depth) => {
    const leaves = leafCount(node);
    const width = leaves * nodeWidth + Math.max(0, leaves - 1) * gapX;
    const x = left + width / 2;
    const y = 150 + depth * gapY;
    positions.push({ ...node, x, y, depth });
    let cursor = left;
    node.children.forEach((child) => {
      const childLeaves = leafCount(child);
      const childWidth = childLeaves * nodeWidth + Math.max(0, childLeaves - 1) * gapX;
      const placed = place(child, cursor, depth + 1);
      links.push({ id: `${node.id}-${child.id}`, x1: x, y1: y + 26, x2: placed.x, y2: placed.y - 26, pending: child.verification === "pending" });
      cursor += childWidth + gapX;
    });
    return { x, y };
  };

  const leaves = leafCount(tree);
  const width = Math.max(520, leaves * nodeWidth + Math.max(0, leaves - 1) * gapX + 28);
  place(tree, 40, 0);
  const you = positions.find((node) => node.id === root.id);
  upline.forEach((node, index) => {
    const x = (you?.x ?? width / 2) + (index - (upline.length - 1) / 2) * (nodeWidth + gapX);
    positions.push({ ...node, x, y: 36, depth: -1, hiddenCount: 0, children: [] });
    if (you) {
      links.push({
        id: `${node.id}-${root.id}`,
        x1: x,
        y1: 62,
        x2: you.x,
        y2: you.y - 26,
        pending: node.verification === "pending",
      });
    }
  });
  const height = Math.max(...positions.map((node) => node.y)) + 90;
  return { positions, links, width, height };
}

function collectExpand(node, query, path = []) {
  const next = [...path, node.id];
  const hit = `${node.alias} ${node.id}`.toLowerCase().includes(query);
  let ids = hit ? next : [];
  (node.children ?? []).forEach((child) => {
    ids = ids.concat(collectExpand(child, query, next));
  });
  return ids;
}

function flatten(node, depth = 0, acc = []) {
  acc.push({ ...node, depth });
  (node.children ?? []).forEach((child) => flatten(child, depth + 1, acc));
  return acc;
}

export default function TeamGraph({ root, upline }) {
  const reduce = useReducedMotion();
  const [manual, setManual] = useState(() => new Set([root.id]));
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(root.id);
  const [view, setView] = useState({ x: 12, y: 12, k: 1 });
  const [shown, setShown] = useState(mobilePage);
  const drag = useRef(null);
  const frame = useRef(null);

  const needle = query.trim().toLowerCase();
  const matchIds = needle ? collectExpand(root, needle) : [];
  const matchKey = matchIds.join("|");
  const expanded = useMemo(() => {
    const next = new Set(manual);
    if (matchKey) matchKey.split("|").forEach((id) => next.add(id));
    return next;
  }, [manual, matchKey]);
  const activeId = matchIds.length ? matchIds[matchIds.length - 1] : selectedId;

  const graph = useMemo(() => layoutTree(root, upline, expanded), [root, upline, expanded]);
  const selected = graph.positions.find((node) => node.id === activeId) ?? graph.positions[0];
  const list = useMemo(() => [...upline.map((node) => ({ ...node, depth: 0 })), ...flatten(root)], [root, upline]);
  // Phones get a paged, searchable list instead of the pan/zoom graph.
  const members = useMemo(
    () => list.filter((node) => node.verification !== "self" && (!needle || `${node.alias} ${node.id}`.toLowerCase().includes(needle))),
    [list, needle],
  );

  // Start (and reset) with the member's own node centred, whatever the frame width.
  const rootX = graph.positions.find((node) => node.id === root.id)?.x ?? graph.width / 2;
  const centerView = () => {
    const width = frame.current?.clientWidth;
    setView(width ? { x: Math.round(width / 2 - rootX), y: 12, k: 1 } : { x: 12, y: 12, k: 1 });
  };
  const centered = useRef(false);
  useLayoutEffect(() => {
    if (centered.current || !frame.current?.clientWidth) return;
    centered.current = true;
    centerView();
  });

  useEffect(() => {
    const node = frame.current;
    if (!node) return undefined;
    const onWheel = (event) => {
      event.preventDefault();
      const delta = event.deltaY < 0 ? 0.08 : -0.08;
      setView((current) => ({ ...current, k: Math.min(1.7, Math.max(0.55, current.k + delta)) }));
    };
    node.addEventListener("wheel", onWheel, { passive: false });
    return () => node.removeEventListener("wheel", onWheel);
  }, []);

  const toggle = (node) => {
    setSelectedId(node.id);
    if (!node.hiddenCount && !(root.id === node.id || node.children?.length || node.hiddenCount)) return;
    setManual((current) => {
      const next = new Set(current);
      if (next.has(node.id)) next.delete(node.id);
      else next.add(node.id);
      return next;
    });
  };

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(16rem,0.7fr)]">
      <div className="dash-card overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-line p-4">
          <label className="relative min-w-48 flex-1">
            <span className="sr-only">Search by member ID or alias</span>
            <Search size={15} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-mist" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search member ID"
              className="field py-2.5 pl-9 text-sm"
            />
          </label>
          <div className="flex gap-2 max-lg:hidden">
            <button type="button" className="icon-btn" aria-label="Zoom in" onClick={() => setView((v) => ({ ...v, k: Math.min(1.7, v.k + 0.1) }))}>
              <Plus size={16} />
            </button>
            <button type="button" className="icon-btn" aria-label="Zoom out" onClick={() => setView((v) => ({ ...v, k: Math.max(0.55, v.k - 0.1) }))}>
              <Minus size={16} />
            </button>
            <button type="button" className="icon-btn" aria-label="Reset view" onClick={centerView}>
              <RotateCcw size={15} />
            </button>
          </div>
        </div>
        <div className="flex flex-wrap gap-4 px-4 py-3 text-xs text-mist">
          <span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-royal shadow-[0_0_0_4px_rgba(57,217,138,0.15)]" /> Active</span>
          <span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full border border-gold" /> Pending</span>
          <span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-gold" /> You</span>
        </div>
        <div className="px-4 pb-4 lg:hidden">
          {members.length === 0 ? (
            <p className="rounded-xl border border-white/[0.08] px-3 py-4 text-sm text-mist">{needle ? "No members match that search." : "No team members yet."}</p>
          ) : (
            <>
              <ul className="divide-y divide-white/5 overflow-hidden rounded-xl border border-white/[0.08]" aria-label="Team members">
                {members.slice(0, shown).map((node) => (
                  <li key={`mobile-${node.depth}-${node.id}`} className="flex items-center justify-between gap-3 px-3 py-2.5">
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-snow">{node.alias}</span>
                      <span className="block truncate text-xs text-mist">
                        {node.id} · {node.rank}
                      </span>
                    </span>
                    <StatusBadge status={node.verification} />
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex items-center justify-between gap-3 text-xs text-mist">
                <span>
                  Showing {Math.min(shown, members.length)} of {members.length}
                </span>
                {shown < members.length ? (
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShown((count) => count + mobilePage)}>
                    Show more
                  </button>
                ) : null}
              </div>
            </>
          )}
        </div>
        <div
          ref={frame}
          className="relative hidden h-[28rem] cursor-grab overflow-hidden bg-navy/40 active:cursor-grabbing lg:block"
          onPointerDown={(event) => {
            if (event.target.closest("[data-node]")) return;
            drag.current = { px: event.clientX, py: event.clientY, x: view.x, y: view.y };
            event.currentTarget.setPointerCapture(event.pointerId);
          }}
          onPointerMove={(event) => {
            if (!drag.current) return;
            setView((current) => ({
              ...current,
              x: drag.current.x + event.clientX - drag.current.px,
              y: drag.current.y + event.clientY - drag.current.py,
            }));
          }}
          onPointerUp={() => {
            drag.current = null;
          }}
        >
          <div
            className="relative"
            style={{
              width: graph.width,
              height: graph.height,
              transform: `translate(${view.x}px, ${view.y}px) scale(${view.k})`,
              transformOrigin: "0 0",
            }}
          >
            <svg width={graph.width} height={graph.height} className="absolute top-0 left-0" aria-hidden="true">
              {graph.links.map((link) => (
                <path
                  key={link.id}
                  d={`M ${link.x1} ${link.y1} C ${link.x1} ${(link.y1 + link.y2) / 2}, ${link.x2} ${(link.y1 + link.y2) / 2}, ${link.x2} ${link.y2}`}
                  fill="none"
                  stroke={link.pending ? "rgba(246,199,106,0.6)" : "rgba(57,217,138,0.6)"}
                  strokeDasharray={link.pending ? "5 5" : undefined}
                  strokeWidth="1.4"
                />
              ))}
            </svg>
            {graph.positions.map((node) => {
              const active = node.id === selected?.id;
              const match = query.trim() && `${node.alias} ${node.id}`.toLowerCase().includes(query.trim().toLowerCase());
              return (
                <motion.button
                  key={node.id}
                  type="button"
                  data-node="true"
                  onClick={() => toggle(node)}
                  whileHover={reduce ? undefined : { y: -2 }}
                  className={`absolute w-[132px] rounded-2xl border px-3 py-2 text-left ${
                    active || match ? "border-accent/60 bg-raised shadow-[0_0_0_1px_rgba(57,217,138,0.3)]" : "border-line bg-card/95"
                  }`}
                  style={{ left: node.x - 66, top: node.y - 26 }}
                >
                  <span className={`mb-1.5 inline-block h-1.5 w-1.5 rounded-full ${node.verification === "self" ? "bg-gold" : node.verification === "pending" ? "bg-transparent ring-1 ring-gold" : "bg-royal"}`} />
                  <span className="block truncate text-sm font-medium text-snow">{node.alias}</span>
                  <span className="mt-1 block truncate text-[0.68rem] text-mist">{node.id}</span>
                  {node.hiddenCount > 0 ? (
                    <span className="mt-1 inline-flex rounded-full bg-white/5 px-2 py-0.5 text-[0.65rem] text-gold">+{node.hiddenCount}</span>
                  ) : null}
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      <aside className="dash-card p-5">
        <p className="text-xs tracking-[0.14em] text-mist uppercase">Selected record</p>
        {selected ? (
          <div className="mt-3 space-y-3">
            <h3 className="text-xl font-semibold tracking-[-0.03em]">{selected.alias}</h3>
            <StatusBadge status={selected.verification === "self" ? "self" : selected.verification} />
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-mist">Member ID</dt>
                <dd className="text-snow">{selected.id}</dd>
              </div>
              <div>
                <dt className="text-mist">Record date</dt>
                <dd className="text-snow">{formatDate(selected.joinedAt)}</dd>
              </div>
              <div>
                <dt className="text-mist">Stake eligibility</dt>
                <dd className="text-snow">{selected.stakeEligibility}</dd>
              </div>
              <div>
                <dt className="text-mist">Rank</dt>
                <dd className="text-snow">{selected.rank}</dd>
              </div>
            </dl>
            <p className="text-xs leading-relaxed text-mist">Private contact, wallet, and financial details of other members are not shown.</p>
          </div>
        ) : null}
      </aside>

      <div className="dash-card hidden overflow-hidden lg:block xl:col-span-2">
        <div className="border-b border-line px-5 py-4">
          <h3 className="text-base font-semibold">List alternative</h3>
          <p className="mt-1 text-sm text-mist">The same structure as a list.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="dash-table min-w-[640px]">
            <caption className="sr-only">Network list</caption>
            <thead>
              <tr>
                <th>Member</th>
                <th>ID</th>
                <th>Status</th>
                <th>Rank</th>
                <th>Show</th>
              </tr>
            </thead>
            <tbody>
              {list.map((node) => (
                <tr key={`${node.depth}-${node.id}`}>
                  <td style={{ paddingLeft: `${1 + node.depth * 1.1}rem` }}>{node.alias}</td>
                  <td>{node.id}</td>
                  <td>
                    <StatusBadge status={node.verification === "self" ? "self" : node.verification} />
                  </td>
                  <td>{node.rank}</td>
                  <td>
                    <button
                      type="button"
                      className="text-sm text-gold"
                      onClick={() => {
                        setQuery(node.id);
                        setSelectedId(node.id);
                      }}
                    >
                      Focus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
