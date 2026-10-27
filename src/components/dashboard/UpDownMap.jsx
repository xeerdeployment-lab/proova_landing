import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { planConfig } from "../../data/planConfig";
import cx from "../../lib/cx";
import { formatCents } from "../../lib/money";
import { upDownPoolCents } from "../../lib/plan";
import Tabs from "../ui/Tabs";

const perRow = 10;
const width = 360;
const gap = 30;
const dot = 7;

function rowsFor(count) {
  return Math.ceil(count / perRow);
}

function Dots({ count, eligible, side, onHover, active, offsetY, reduce }) {
  return Array.from({ length: count }, (_, index) => {
    const row = Math.floor(index / perRow);
    const col = index % perRow;
    const x = width / 2 + (col - (perRow - 1) / 2) * gap;
    const y = side === "up" ? offsetY - row * 24 : offsetY + row * 24;
    const filled = index < eligible;
    const key = `${side}-${index}`;
    return (
      <motion.circle
        key={key}
        cx={x}
        cy={y}
        r={active === key ? dot + 2 : dot}
        fill={filled ? (side === "up" ? "#27B5A0" : "#39D98A") : "rgba(255,255,255,0.04)"}
        stroke={filled ? "rgba(131,247,181,0.55)" : "rgba(255,255,255,0.14)"}
        strokeDasharray={filled ? undefined : "2 2"}
        initial={reduce ? false : { opacity: 0, scale: 0.4 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: reduce ? 0 : index * 0.012 }}
        style={{ transformOrigin: `${x}px ${y}px`, cursor: "pointer" }}
        onMouseEnter={() => onHover({ key, side, position: index + 1, filled })}
        onMouseLeave={() => onHover(null)}
      />
    );
  });
}

/**
 * Upline and downline positions for a tier. Filled positions have an eligible participant; open ones
 * are unfilled. The pool shown is what a stake funds — never an individual share, because the split
 * between positions is a backend rule.
 */
export default function UpDownMap({ upDown, stakeCents }) {
  const reduce = useReducedMotion();
  const currentTier = upDown.tier?.id ?? planConfig.upDown.tiers[0].id;
  const [tierId, setTierId] = useState(currentTier);
  const [hover, setHover] = useState(null);
  const tier = planConfig.upDown.tiers.find((item) => item.id === tierId);
  const isCurrent = tier.id === upDown.tier?.id;
  const upEligible = isCurrent ? upDown.upline.eligible : Math.min(upDown.upline.available, tier.upline);
  const downEligible = isCurrent ? upDown.downline.eligible : Math.min(upDown.downline.available, tier.downline);
  const upRows = rowsFor(tier.upline);
  const downRows = rowsFor(tier.downline);
  const centerY = 24 + upRows * 24 + 34;
  const height = centerY + 34 + downRows * 24 + 10;
  const poolBase = isCurrent ? stakeCents : tier.minCents;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs
          label="Up/down tier"
          value={tierId}
          onChange={(id) => {
            setTierId(id);
            setHover(null);
          }}
          tabs={planConfig.upDown.tiers.map((item) => ({ id: item.id, label: item.id === upDown.tier?.id ? `${item.name} · yours` : item.name }))}
        />
        <p className="text-xs text-mist">
          {formatCents(tier.minCents)} – {formatCents(tier.maxCents)} stake
        </p>
      </div>

      <div className="relative mt-4">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="mx-auto block w-full max-w-md"
          role="img"
          aria-label={`${tier.name}: ${upEligible} of ${tier.upline} upline positions and ${downEligible} of ${tier.downline} downline positions have an eligible participant.`}
        >
          <defs>
            <radialGradient id="ud-core" cx="50%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#83F7B5" />
              <stop offset="100%" stopColor="#27B5A0" />
            </radialGradient>
          </defs>
          <line x1={width / 2} y1={centerY - 30} x2={width / 2} y2={24 + (upRows - 1) * 24 + 10} stroke="rgba(39,181,160,0.35)" strokeDasharray="3 4" />
          <line x1={width / 2} y1={centerY + 30} x2={width / 2} y2={centerY + 36} stroke="rgba(57,217,138,0.35)" strokeDasharray="3 4" />
          <Dots count={tier.upline} eligible={upEligible} side="up" onHover={setHover} active={hover?.key} offsetY={24 + (upRows - 1) * 24} reduce={reduce} />
          <Dots count={tier.downline} eligible={downEligible} side="down" onHover={setHover} active={hover?.key} offsetY={centerY + 46} reduce={reduce} />
          <circle cx={width / 2} cy={centerY} r="22" fill="url(#ud-core)" opacity="0.9" />
          <circle cx={width / 2} cy={centerY} r="30" fill="none" stroke="rgba(131,247,181,0.25)" />
          <text x={width / 2} y={centerY + 4} textAnchor="middle" className="fill-[#04140c] text-[11px] font-bold">
            YOU
          </text>
          <text x={width / 2 + 40} y={centerY - 8} className="fill-[#27B5A0] text-[10px] tracking-widest">
            ↑ UPLINE
          </text>
          <text x={width / 2 + 40} y={centerY + 14} className="fill-[#39D98A] text-[10px] tracking-widest">
            ↓ DOWNLINE
          </text>
        </svg>
        <p className="mt-1 min-h-5 text-center text-xs text-mist" aria-live="polite">
          {hover
            ? `${hover.side === "up" ? "Upline" : "Downline"} position ${hover.position} · ${hover.filled ? "eligible participant" : "open — no eligible participant"}`
            : "Hover a position for detail"}
        </p>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
        {[
          ["Upline eligible", `${upEligible} / ${tier.upline}`, "bg-teal"],
          ["Downline eligible", `${downEligible} / ${tier.downline}`, "bg-accent"],
          [isCurrent ? "Pool your stake funds" : "Pool at tier minimum", formatCents(upDownPoolCents(poolBase ?? 0)), null],
          ["Allocation", `${planConfig.upDown.poolBps / 100}% of stake`, null],
        ].map(([label, value, swatch]) => (
          <div key={label} className="dash-card-flat px-3 py-2.5">
            <dt className="flex items-center gap-1.5 text-xs text-mist">
              {swatch ? <span className={cx("h-2 w-2 rounded-full", swatch)} aria-hidden="true" /> : null}
              {label}
            </dt>
            <dd className="num mt-0.5 font-semibold text-snow">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
