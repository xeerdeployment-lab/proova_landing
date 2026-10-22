import { ArrowDownToLine, Receipt, RotateCcw, Sparkles, WalletCards } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useId } from "react";
import { ease } from "../../lib/motion";
import { formatDate } from "../../lib/dates";
import { layoutTree, linkPath } from "../../lib/tree";
import CountUp from "../ui/CountUp";
import StatusBadge from "../ui/StatusBadge";

/** Browser-style chrome around a frontend-built product preview. */
export function WindowFrame({ path, children, className = "" }) {
  return (
    <div className={`overflow-hidden rounded-[1.4rem] border border-white/10 bg-[#0a0e1c]/95 ${className}`}>
      <div className="flex items-center gap-3 border-b border-white/[0.07] bg-white/[0.02] px-4 py-3">
        <span className="flex gap-1.5" aria-hidden="true">
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
        </span>
        <span className="min-w-0 flex-1 truncate rounded-full bg-white/[0.04] px-3 py-1 text-center text-[0.68rem] tracking-wide text-mist">
          {path}
        </span>
        <SampleTag />
      </div>
      {children}
    </div>
  );
}

export function SampleTag({ className = "" }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border border-gold/30 bg-gold/10 px-2 py-0.5 text-[0.6rem] font-semibold tracking-[0.14em] text-gold uppercase ${className}`}
    >
      <span className="h-1 w-1 rounded-full bg-gold" aria-hidden="true" />
      Sample data
    </span>
  );
}

export function MockStat({ label, value, hint, accent = "text-snow" }) {
  return (
    <div className="tile p-3.5 sm:p-4">
      <p className="text-[0.62rem] font-semibold tracking-[0.16em] text-mist uppercase">{label}</p>
      <p className={`mt-2 text-2xl font-semibold tracking-[-0.04em] sm:text-[1.7rem] ${accent}`}>
        <CountUp value={value} />
      </p>
      {hint ? <p className="mt-1 hidden truncate text-[0.68rem] text-mist sm:block">{hint}</p> : null}
    </div>
  );
}

/** Weekly join counts from the sample network, drawn as bars. */
export function GrowthBars({ growth, delay = 0 }) {
  const reduce = useReducedMotion();
  const max = Math.max(1, ...growth.map((item) => item.count));

  return (
    <div className="flex h-24 items-end justify-around gap-3 border-b border-white/[0.06]" aria-hidden="true">
      {growth.map((item, index) => (
        <motion.span
          key={item.week}
          className="w-full max-w-10 origin-bottom rounded-t-md bg-gradient-to-t from-royal/40 to-iris/90 shadow-[0_0_20px_-6px_rgba(165,160,255,0.6)]"
          style={{ height: `${Math.max(14, (item.count / max) * 100)}%` }}
          initial={reduce ? false : { scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 0.8, ease, delay: delay + index * 0.07 }}
        />
      ))}
    </div>
  );
}

/** Compact genealogy drawing with links that draw themselves in. */
export function MiniTree({ root, width = 320, height = 150, delay = 0, className = "" }) {
  const reduce = useReducedMotion();
  const gradientId = `mini-tree-${useId().replace(/:/g, "")}`;
  const { nodes, links } = layoutTree(root, { width, top: 20, levelGap: (height - 40) / 2, padX: 24 });

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className={`h-auto w-full ${className}`} aria-hidden="true">
      <defs>
        <linearGradient id={gradientId} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2={height}>
          <stop offset="0" stopColor="#a5a0ff" stopOpacity="0.9" />
          <stop offset="1" stopColor="#5ad7f2" stopOpacity="0.35" />
        </linearGradient>
      </defs>
      {links.map((link, index) => (
        <motion.path
          key={link.id}
          d={linkPath(link)}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth="1.2"
          initial={reduce ? false : { pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.9, ease, delay: delay + index * 0.08 }}
        />
      ))}
      {nodes.map((node, index) => {
        const you = node.verification === "self";
        return (
          <motion.g
            key={node.id}
            initial={reduce ? false : { opacity: 0, scale: 0.4 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease, delay: delay + 0.2 + index * 0.06 }}
          >
            {you ? <circle cx={node.x} cy={node.y} r="13" fill="rgba(216,189,131,0.12)" /> : null}
            <circle
              cx={node.x}
              cy={node.y}
              r={you ? 7 : 5}
              fill={you ? "#d8bd83" : node.verification === "verified" ? "#8b84ff" : "#0a0e1c"}
              stroke={you ? "#f8fafc" : "#a5a0ff"}
              strokeWidth={you ? 1.4 : 1}
            />
          </motion.g>
        );
      })}
    </svg>
  );
}

const ledgerIcons = {
  stake: WalletCards,
  withdrawal: ArrowDownToLine,
  reentry: RotateCcw,
  platform_fee: Receipt,
  community_fund: Receipt,
};

function LedgerIcon({ category }) {
  const Icon = ledgerIcons[category] ?? Sparkles;
  return (
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-royal/15 text-iris" aria-hidden="true">
      <Icon size={14} strokeWidth={1.8} />
    </span>
  );
}

export function LedgerRows({ rows, delay = 0 }) {
  const reduce = useReducedMotion();

  return (
    <ul className="divide-y divide-white/[0.06]">
      {rows.map((row, index) => (
        <motion.li
          key={row.id}
          className="flex items-center gap-3 py-2.5"
          initial={reduce ? false : { opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease, delay: delay + index * 0.08 }}
        >
          <LedgerIcon category={row.category} />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-xs font-medium text-snow">{row.label}</span>
            <span className="block truncate text-[0.66rem] text-mist">
              {row.id} · {formatDate(row.at)}
            </span>
          </span>
          <StatusBadge status={row.status} />
        </motion.li>
      ))}
    </ul>
  );
}
