import { ArrowUpRight } from "lucide-react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { useMemo, useRef, useState, useSyncExternalStore } from "react";
import { getDemoModel } from "../data/demoData";
import { formatDay } from "../lib/dates";
import { ease, fadeUp, viewport } from "../lib/motion";
import { layoutTree, linkPath } from "../lib/tree";
import Button from "./Button";
import SectionHeading from "./SectionHeading";
import StatusBadge from "./ui/StatusBadge";

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

export default function NetworkVisualization() {
  const reduce = useReducedMotion();
  const svgRef = useRef(null);
  const narrow = useSyncExternalStore(subscribeNarrow, () => window.matchMedia(narrowQuery).matches);
  const width = narrow ? NARROW : WIDE;
  const inView = useInView(svgRef, { once: false, amount: 0.3 });
  const drawn = useInView(svgRef, { once: true, amount: 0.3 });

  const { nodes, links, parentOf } = useMemo(() => {
    const model = getDemoModel();
    const root = model.upline.length ? { ...model.upline[0], children: [model.networkRoot] } : model.networkRoot;
    const layout = layoutTree(root, { width, top: 52, levelGap: 112, padX: narrow ? 34 : 90 });
    const parents = Object.fromEntries(layout.links.map((link) => [link.to.id, link.from.id]));
    return { ...layout, parentOf: parents };
  }, [narrow, width]);

  const youId = nodes.find((node) => node.verification === "self")?.id ?? nodes[0].id;
  const [activeId, setActiveId] = useState(youId);
  const active = nodes.find((node) => node.id === activeId) ?? nodes[0];

  // Highlight the lineage between the selected node and "You".
  const lineage = useMemo(() => {
    const ids = new Set([activeId]);
    let cursor = activeId;
    while (parentOf[cursor]) {
      cursor = parentOf[cursor];
      ids.add(cursor);
    }
    return ids;
  }, [activeId, parentOf]);

  const copy = roleCopy[active.depth] ?? roleCopy[roleCopy.length - 1];

  return (
    <section id="network" className="section overflow-hidden bg-navy">
      <div aria-hidden="true" className="pointer-events-none absolute top-1/4 left-1/2 h-[36rem] w-[60rem] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(99,91,255,0.16),transparent)]" />

      <div className="container-page relative">
        <SectionHeading
          eyebrow="The network"
          title={
            <>
              A network is a set of <span className="serif-accent text-spectrum">relationships.</span>
            </>
          }
          description="This is how the dashboard’s Network Tree presents a structure: your upline, you, and the people who joined through you — each with a verification status. Select any record to see what that position means."
        />

        <div className="mt-14 grid gap-5 lg:grid-cols-12">
          <motion.div
            className="panel flex flex-col justify-center overflow-hidden p-2 sm:p-4 lg:col-span-8"
            initial={reduce ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewport}
            transition={{ duration: 0.8, ease }}
          >
            <svg
              ref={svgRef}
              viewBox={`0 0 ${width} ${HEIGHT}`}
              className="h-auto w-full"
              role="group"
              aria-label="Sample network tree. Use Tab to move between records."
            >
              <defs>
                <linearGradient id="net-link" gradientUnits="userSpaceOnUse" x1="0" y1="40" x2="0" y2={HEIGHT - 40}>
                  <stop offset="0" stopColor="#a5a0ff" />
                  <stop offset="1" stopColor="#5ad7f2" />
                </linearGradient>
                <radialGradient id="net-you" cx="0.5" cy="0.5" r="0.5">
                  <stop offset="0" stopColor="#d8bd83" stopOpacity="0.35" />
                  <stop offset="1" stopColor="#d8bd83" stopOpacity="0" />
                </radialGradient>
              </defs>

              {levelNames.map((name, depth) => (
                <g key={name} className="max-sm:hidden" aria-hidden="true">
                  <line x1="18" x2={width - 18} y1={52 + depth * 112} y2={52 + depth * 112} stroke="rgba(255,255,255,0.04)" strokeDasharray="3 7" />
                  <text x="18" y={52 + depth * 112 - 12} fill="rgba(152,162,184,0.7)" fontSize="11" letterSpacing="2" fontFamily="Plus Jakarta Sans, sans-serif">
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
                      <circle r="2.6" fill="#a5a0ff" opacity="0.9">
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
                  onSelect={() => setActiveId(node.id)}
                />
              ))}
            </svg>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-white/[0.06] px-3 pt-3 pb-1 text-xs text-mist sm:px-2">
              <Legend swatch="bg-gold" label="You" />
              <Legend swatch="bg-[#8b84ff]" label="Verified record" />
              <Legend swatch="border border-iris bg-transparent" label="Pending verification" />
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
                  <h3 className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-snow">{active.alias}</h3>
                  <dl className="mt-5 divide-y divide-white/[0.06] border-y border-white/[0.06] text-sm">
                    <Row term="Record ID" value={active.id} />
                    <Row term="Joined" value={active.joinedAt ? formatDay(active.joinedAt) : "—"} />
                    <Row term="Status" value={<StatusBadge status={active.verification} />} />
                    <Row term="Rank" value={active.rank ?? "Not confirmed"} />
                  </dl>
                  <p className="mt-5 text-sm leading-relaxed text-mist">{copy.body}</p>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="rounded-[1.4rem] border border-gold/25 bg-gold/[0.07] p-5 text-sm leading-relaxed text-snow">
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
      <circle
        className="focus-ring opacity-0 transition-opacity"
        cx={node.x}
        cy={node.y}
        r={r + 8}
        fill="none"
        stroke="#d8bd83"
        strokeWidth="1.5"
      />
      <circle
        cx={node.x}
        cy={node.y}
        r={r + 7}
        fill="none"
        stroke="rgba(165,160,255,0.55)"
        strokeWidth="1"
        style={{ opacity: selected ? 1 : 0, transition: "opacity 300ms ease" }}
      />
      <circle
        cx={node.x}
        cy={node.y}
        r={r}
        fill={you ? "#d8bd83" : verified ? (lit ? "#8b84ff" : "#5b54d6") : "#0a0f1e"}
        stroke={you ? "#f8fafc" : "#a5a0ff"}
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
        fontFamily="Plus Jakarta Sans, sans-serif"
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
        stroke="#0a0f1e"
        strokeWidth="5"
        paintOrder="stroke"
        fontFamily="Plus Jakarta Sans, sans-serif"
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
