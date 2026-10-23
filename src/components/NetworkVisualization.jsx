import { ArrowUpRight, ChevronsDownUp, ChevronsUpDown, Minus, Plus } from "lucide-react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { lazy, Suspense, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { getDemoModel } from "../data/demoData";
import { formatDay } from "../lib/dates";
import { ease, fadeUp, viewport } from "../lib/motion";
import { layoutTree, linkPath } from "../lib/tree";
import { hasWebGL2 } from "../three/quality";
import { layoutTree3D } from "../three/treeLayout";
import Button from "./Button";
import SectionHeading from "./SectionHeading";
import StatusBadge from "./ui/StatusBadge";

const NetworkTree3D = lazy(() => import("../three/NetworkTree3D"));

const WIDE = 760;
const NARROW = 420;
const narrowQuery = "(max-width: 639px)";
const HEIGHT = 450;
const levelNames = ["Upline", "You", "Level 1", "Level 2"];

const roleCopy = [
  {
    role: "Upline",
    body: "The person whose referral link you joined through. Shown for context — their results are not yours, and yours are not theirs.",
  },
  {
    role: "You",
    body: "You, at the centre of your own effort. Connections show relationships and verification status, never a payout.",
  },
  {
    role: "Direct referral",
    body: "Someone who joined with your referral link. A direct relationship is not, by itself, income.",
  },
  {
    role: "Level 2 member",
    body: "A member referred by one of your directs. It appears so you can see the structure — not as a reward you are owed.",
  },
];

/** Upline → you → directs → their referrals, as one tree plus a flat list with parent ids. */
function useSampleTree() {
  return useMemo(() => {
    const model = getDemoModel();
    const root = model.upline.length ? { ...model.upline[0], children: [model.networkRoot] } : model.networkRoot;
    const people = [];
    const walk = (node, depth, parentId) => {
      const { children = [], ...rest } = node;
      people.push({ ...rest, depth, parentId, childIds: children.map((child) => child.id) });
      children.forEach((child) => walk(child, depth + 1, node.id));
    };
    walk(root, 0, null);
    return { root, people };
  }, []);
}

export default function NetworkVisualization() {
  const reduce = useReducedMotion();
  const { root, people } = useSampleTree();
  const byId = useMemo(() => new Map(people.map((person) => [person.id, person])), [people]);
  const youId = people.find((person) => person.verification === "self")?.id ?? people[0].id;
  const [activeId, setActiveId] = useState(youId);
  const [hoverId, setHoverId] = useState(null);
  const [expanded, setExpanded] = useState(() => new Set([people[0].id, youId, people.find((p) => p.depth === 2 && p.childIds.length)?.id].filter(Boolean)));
  const active = byId.get(activeId) ?? people[0];
  const webgl = useMemo(() => hasWebGL2(), []);

  // Highlight the lineage between the selected node and the top of the tree.
  const lineage = useMemo(() => {
    const ids = new Set([activeId]);
    for (let cursor = byId.get(activeId)?.parentId; cursor; cursor = byId.get(cursor)?.parentId) ids.add(cursor);
    return ids;
  }, [activeId, byId]);

  const toggleBranch = (id) => {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const allOpen = people.every((person) => !person.childIds.length || expanded.has(person.id));
  const toggleAll = () =>
    setExpanded(allOpen ? new Set([people[0].id, youId]) : new Set(people.filter((p) => p.childIds.length).map((p) => p.id)));

  // Keep the selection on a visible record when its branch collapses.
  const visible = (id) => {
    for (let cursor = byId.get(id)?.parentId; cursor; cursor = byId.get(cursor)?.parentId) {
      if (!expanded.has(cursor)) return false;
    }
    return true;
  };
  if (!visible(activeId)) {
    let cursor = activeId;
    while (cursor && !visible(cursor)) cursor = byId.get(cursor)?.parentId;
    setActiveId(cursor ?? youId);
  }

  const copy = roleCopy[active.depth] ?? roleCopy[roleCopy.length - 1];
  const hiddenBelow = active.childIds.length && !expanded.has(active.id);

  return (
    <section id="network" data-act="network" className="section overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute top-1/4 left-1/2 h-[36rem] w-[60rem] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(0,150,180,0.18),transparent)]" />

      <div className="container-page relative">
        <SectionHeading
          eyebrow="The network"
          title={
            <>
              A network is a set of <span className="serif-accent text-spectrum">relationships.</span>
            </>
          }
          description="This is how the dashboard’s Network Tree presents a structure: your upline, you, and the people who joined through you — each with a verification status. Select any record to see what that position means, and open a branch to reveal who sits below it."
        />

        <div className="mt-14 grid gap-5 lg:grid-cols-12">
          <motion.div
            className="panel flex flex-col overflow-hidden p-2 sm:p-3 lg:col-span-8"
            initial={reduce ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewport}
            transition={{ duration: 0.8, ease }}
          >
            <div className="flex items-center justify-between gap-3 px-2 pt-1 pb-2">
              <p className="hud-label text-mist">Sample network tree</p>
              {webgl ? (
                <button
                  type="button"
                  onClick={toggleAll}
                  className="inline-flex items-center gap-1.5 border border-cyan/15 bg-cyan/[0.03] px-3 py-1.5 text-xs text-mist transition-colors hover:border-iris/40 hover:text-snow"
                >
                  {allOpen ? <ChevronsDownUp size={13} aria-hidden="true" /> : <ChevronsUpDown size={13} aria-hidden="true" />}
                  {allOpen ? "Collapse branches" : "Expand all"}
                </button>
              ) : null}
            </div>

            {webgl ? (
              <Tree3DView
                root={root}
                people={people}
                expanded={expanded}
                activeId={activeId}
                hoverId={hoverId}
                lineage={lineage}
                reduce={Boolean(reduce)}
                onSelect={setActiveId}
                onHover={setHoverId}
                onToggle={toggleBranch}
              />
            ) : (
              <TreeSVG activeId={activeId} lineage={lineage} onSelect={setActiveId} reduce={reduce} />
            )}

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-cyan/10 px-3 pt-3 pb-1 text-xs text-mist sm:px-2">
              <Legend swatch="bg-gold" label="You" />
              <Legend swatch="bg-[#00e5f2]" label="Verified record" />
              <Legend swatch="border border-cyan bg-transparent" label="Pending verification" />
              <span className="ml-auto text-mist/80">Sample members from the dashboard preview</span>
            </div>
          </motion.div>

          <motion.aside
            className="flex flex-col gap-5 lg:col-span-4"
            variants={fadeUp}
            initial={reduce ? "visible" : "hidden"}
            whileInView="visible"
            viewport={viewport}
          >
            <div className="panel flex-1 p-6" aria-live="polite">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={active.id}
                  initial={reduce ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
                  transition={{ duration: 0.3, ease }}
                >
                  <p className="eyebrow">{copy.role}</p>
                  <h3 className="mt-4 text-2xl font-head font-bold tracking-[-0.01em] text-snow uppercase">{active.alias}</h3>
                  <dl className="mt-5 divide-y divide-cyan/10 border-y border-cyan/10 text-sm">
                    <Row term="Record ID" value={active.id} />
                    <Row term="Joined" value={active.joinedAt ? formatDay(active.joinedAt) : "—"} />
                    <Row term="Status" value={<StatusBadge status={active.verification} />} />
                    <Row term="Rank" value={active.rank ?? "Not confirmed"} />
                    <Row term="Directly below" value={active.childIds.length} />
                  </dl>
                  <p className="mt-5 text-sm leading-relaxed text-mist">{copy.body}</p>
                  {webgl && active.childIds.length && active.depth > 0 ? (
                    <button
                      type="button"
                      onClick={() => toggleBranch(active.id)}
                      className="mt-5 inline-flex items-center gap-2 border border-cyan/15 bg-cyan/[0.03] px-3.5 py-2 text-xs font-medium text-snow transition-colors hover:border-cyan/50"
                    >
                      {hiddenBelow ? <Plus size={13} aria-hidden="true" /> : <Minus size={13} aria-hidden="true" />}
                      {hiddenBelow ? `Show ${active.childIds.length} below` : "Collapse this branch"}
                    </button>
                  ) : null}
                </motion.div>
              </AnimatePresence>
            </div>

            <div className=" border border-amber-300/30 bg-amber-300/[0.06] p-5 text-sm leading-relaxed text-snow">
              A position in the tree describes a relationship. It is not income, a rank, or a
              promise that recruitment pays.
            </div>

            <Button to="/dashboard/network" variant="glass" className="group self-start">
              Open the network tree preview
              <ArrowUpRight size={15} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none" aria-hidden="true" />
            </Button>
          </motion.aside>
        </div>
      </div>
    </section>
  );
}

/**
 * WebGL tree with an HTML button pinned to every node: buttons carry focus, keyboard and
 * touch input plus the visible labels, so the canvas itself needs no raycasting.
 */
function Tree3DView({ root, people, expanded, activeId, hoverId, lineage, reduce, onSelect, onHover, onToggle }) {
  const wrapRef = useRef(null);
  const labelsRef = useRef(new Map());
  const loopRef = useRef(null);
  const near = useInView(wrapRef, { once: true, margin: "600px 0px" });
  const onScreen = useInView(wrapRef, { amount: 0.05 });
  const layout = useMemo(() => layoutTree3D(root, expanded), [root, expanded]);
  const [ready, setReady] = useState(false);

  // Stop rendering while the section is offscreen.
  useEffect(() => {
    loopRef.current?.setFrameloop(onScreen ? (reduce ? "demand" : "always") : "never");
    if (onScreen) loopRef.current?.invalidate();
  }, [onScreen, reduce, ready]);

  const registerLabel = (id) => (node) => {
    if (node) labelsRef.current.set(id, node);
    else labelsRef.current.delete(id);
  };

  return (
    <div ref={wrapRef} className="relative h-[24rem] overflow-hidden bg-[radial-gradient(80%_70%_at_50%_40%,rgba(0,60,80,0.35),transparent)] sm:h-[28rem]">
      <div aria-hidden="true" className="bg-grid absolute inset-0 opacity-50" />
      {near ? (
        <Suspense fallback={null}>
          <div className={`absolute inset-0 transition-opacity duration-1000 ${ready ? "opacity-100" : "opacity-0"}`} aria-hidden="true">
            <NetworkTree3D
              people={people}
              layout={layout}
              activeId={activeId}
              hoverId={hoverId}
              lineage={lineage}
              labelsRef={labelsRef}
              reduce={reduce}
              onReady={(state) => {
                loopRef.current = state;
                setReady(true);
              }}
            />
          </div>
        </Suspense>
      ) : null}

      <div role="group" aria-label="Sample network tree. Use Tab to move between records." className="absolute inset-0">
        {people.map((person) => {
          const you = person.verification === "self";
          const selected = person.id === activeId;
          const collapsed = person.childIds.length > 0 && !expanded.has(person.id);
          const shown = layout.has(person.id);
          return (
            <button
              key={person.id}
              ref={registerLabel(person.id)}
              type="button"
              tabIndex={shown ? 0 : -1}
              aria-pressed={selected}
              aria-label={`${person.alias}, ${you ? "you" : person.verification}.${collapsed ? ` ${person.childIds.length} hidden below.` : ""} Show details.`}
              onClick={() => {
                onSelect(person.id);
                if (collapsed) onToggle(person.id);
              }}
              onFocus={() => onSelect(person.id)}
              onPointerEnter={(event) => event.pointerType === "mouse" && onHover(person.id)}
              onPointerLeave={() => onHover(null)}
              className="group absolute top-0 left-0 flex h-14 w-14 items-center justify-center rounded-full opacity-0 outline-none transition-opacity duration-500"
              style={{ visibility: "hidden" }}
            >
              <span
                aria-hidden="true"
                className={`absolute inset-1 rounded-full border transition-all duration-300 group-focus-visible:border-gold ${
                  selected ? "scale-100 border-iris/70" : "scale-75 border-transparent"
                }`}
              />
              <span
                aria-hidden="true"
                className={`pointer-events-none absolute top-full mt-0.5 rounded-full px-2 py-0.5 text-[0.68rem] whitespace-nowrap transition-colors max-sm:hidden ${
                  selected ? "bg-white/10 text-snow" : "text-mist"
                }`}
              >
                {you ? "You" : shortLabel(person.alias)}
              </span>
              {collapsed ? (
                <span aria-hidden="true" className="absolute -top-1 -right-1 border border-cyan/50 bg-[#071422] px-1.5 py-0.5 text-[0.6rem] font-semibold text-cyan">
                  +{person.childIds.length}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Original 2D tree, kept as the fallback where WebGL 2 is unavailable. */
function TreeSVG({ activeId, lineage, onSelect, reduce }) {
  const svgRef = useRef(null);
  const narrow = useSyncExternalStore(subscribeNarrow, () => window.matchMedia(narrowQuery).matches);
  const width = narrow ? NARROW : WIDE;
  const inView = useInView(svgRef, { once: false, amount: 0.3 });
  const drawn = useInView(svgRef, { once: true, amount: 0.3 });

  const { nodes, links } = useMemo(() => {
    const model = getDemoModel();
    const root = model.upline.length ? { ...model.upline[0], children: [model.networkRoot] } : model.networkRoot;
    return layoutTree(root, { width, top: 52, levelGap: 112, padX: narrow ? 34 : 90 });
  }, [narrow, width]);

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${width} ${HEIGHT}`}
      className="h-auto w-full"
      role="group"
      aria-label="Sample network tree. Use Tab to move between records."
    >
      <defs>
        <linearGradient id="net-link" gradientUnits="userSpaceOnUse" x1="0" y1="40" x2="0" y2={HEIGHT - 40}>
          <stop offset="0" stopColor="#00f5d4" />
          <stop offset="1" stopColor="#00e5f2" />
        </linearGradient>
        <radialGradient id="net-you" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#a8ff00" stopOpacity="0.35" />
          <stop offset="1" stopColor="#a8ff00" stopOpacity="0" />
        </radialGradient>
      </defs>

      {levelNames.map((name, depth) => (
        <g key={name} className="max-sm:hidden" aria-hidden="true">
          <line x1="18" x2={width - 18} y1={52 + depth * 112} y2={52 + depth * 112} stroke="rgba(255,255,255,0.04)" strokeDasharray="3 7" />
          <text x="18" y={52 + depth * 112 - 12} fill="rgba(152,162,184,0.7)" fontSize="11" letterSpacing="2" fontFamily="JetBrains Mono, monospace">
            {name.toUpperCase()}
          </text>
        </g>
      ))}

      {links.map((link, index) => {
        const lit = lineage.has(link.to.id) && lineage.has(link.from.id);
        const d = linkPath(link);
        return (
          <g key={link.id}>
            <motion.path
              d={d}
              fill="none"
              stroke={lit ? "url(#net-link)" : "rgba(248,250,252,0.14)"}
              strokeWidth={lit ? 2 : 1.2}
              initial={reduce ? false : { pathLength: 0 }}
              animate={{ pathLength: drawn || reduce ? 1 : 0 }}
              transition={{ duration: 1.1, ease, delay: index * 0.12 }}
            />
            {inView && !reduce ? (
              <circle r="2.6" fill="#00f5d4" opacity="0.9">
                <animateMotion dur="3.4s" begin={`${1.2 + index * 0.45}s`} repeatCount="indefinite" path={d} />
              </circle>
            ) : null}
          </g>
        );
      })}

      {nodes.map((node, index) => (
        <TreeNode
          key={node.id}
          node={node}
          index={index}
          selected={node.id === activeId}
          lit={lineage.has(node.id)}
          shown={drawn || reduce}
          reduce={reduce}
          onSelect={() => onSelect(node.id)}
        />
      ))}
    </svg>
  );
}

function TreeNode({ node, index, selected, lit, shown, reduce, onSelect }) {
  const you = node.verification === "self";
  const verified = node.verification === "verified";
  const r = you ? 22 : 15;
  const initials = you ? "You" : (node.alias.split(" ").at(-1) ?? "").slice(0, 3).toUpperCase();

  return (
    <motion.g
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      aria-label={`${node.alias}, ${node.verification === "self" ? "you" : node.verification}. Show details.`}
      onMouseEnter={onSelect}
      onFocus={onSelect}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect();
        }
      }}
      className="cursor-pointer outline-none [&:focus-visible_.focus-ring]:opacity-100"
      initial={reduce ? false : { opacity: 0, scale: 0.3 }}
      animate={shown ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.3 }}
      transition={{ duration: 0.6, ease, delay: 0.25 + index * 0.08 }}
    >
      <circle cx={node.x} cy={node.y} r={r + 22} fill="transparent" />
      {you ? <circle cx={node.x} cy={node.y} r={r + 26} fill="url(#net-you)" /> : null}
      <circle className="focus-ring opacity-0 transition-opacity" cx={node.x} cy={node.y} r={r + 8} fill="none" stroke="#a8ff00" strokeWidth="1.5" />
      <circle
        cx={node.x}
        cy={node.y}
        r={r + 7}
        fill="none"
        stroke="rgba(0,245,212,0.55)"
        strokeWidth="1"
        style={{ opacity: selected ? 1 : 0, transition: "opacity 300ms ease" }}
      />
      <circle
        cx={node.x}
        cy={node.y}
        r={r}
        fill={you ? "#a8ff00" : verified ? (lit ? "#00e5f2" : "#5b54d6") : "#070d13"}
        stroke={you ? "#f8fafc" : "#00f5d4"}
        strokeOpacity={lit ? 1 : 0.6}
        strokeWidth={you ? 2 : 1.3}
        style={{ transition: "fill 300ms ease, stroke-opacity 300ms ease" }}
      />
      <text
        x={node.x}
        y={node.y + (you ? 4.5 : 4)}
        textAnchor="middle"
        fontSize={you ? 12 : 10.5}
        fontWeight="600"
        fill={you ? "#080d1a" : "#f8fafc"}
        fontFamily="JetBrains Mono, monospace"
        aria-hidden="true"
      >
        {initials}
      </text>
      <text
        className="max-sm:hidden"
        x={node.x}
        y={node.y + r + 22}
        textAnchor="middle"
        fontSize="12"
        fill={selected ? "#f8fafc" : "rgba(152,162,184,0.95)"}
        stroke="#070d13"
        strokeWidth="5"
        paintOrder="stroke"
        fontFamily="JetBrains Mono, monospace"
        aria-hidden="true"
      >
        {you ? "You" : shortLabel(node.alias)}
      </text>
    </motion.g>
  );
}

function subscribeNarrow(onChange) {
  const query = window.matchMedia(narrowQuery);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function shortLabel(alias) {
  const label = alias.replace(/^Sample\s+/i, "");
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function Row({ term, value }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <dt className="text-mist">{term}</dt>
      <dd className="text-right text-snow">{value}</dd>
    </div>
  );
}

function Legend({ swatch, label }) {
  return (
    <span className="flex items-center gap-2">
      <span className={`h-2.5 w-2.5 rounded-full ${swatch}`} aria-hidden="true" />
      {label}
    </span>
  );
}
