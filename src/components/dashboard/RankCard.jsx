import { Check, Clock, Compass, Hammer, Lock, Rocket } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useDashboard } from "../../hooks/useDashboard";
import cx from "../../lib/cx";
import { formatDate } from "../../lib/dates";
import { formatBps } from "../../lib/money";
import { ease } from "../../lib/motion";
import ProgressBar from "../ui/ProgressBar";
import StatusBadge from "../ui/StatusBadge";
import Countdown from "./Countdown";

const icons = { initiator: Rocket, explorer: Compass, builder: Hammer };

export default function RankCard({ rank, current = false, index = 0 }) {
  const reduce = useReducedMotion();
  const { refresh } = useDashboard();
  const Icon = icons[rank.id] ?? Rocket;
  const achieved = rank.state === "achieved";

  return (
    <motion.article
      initial={reduce ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.5, ease, delay: reduce ? 0 : index * 0.08 }}
      className={cx("dash-card dash-hover relative flex h-full flex-col overflow-hidden p-5 sm:p-6", current && "border-accent/35")}
      aria-label={`${rank.name} rank, ${rank.state.replace("-", " ")}`}
    >
      {achieved ? <div className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-accent/15 blur-3xl" aria-hidden="true" /> : null}
      <div className="flex items-start justify-between gap-3">
        <span
          className={cx(
            "relative flex h-14 w-14 items-center justify-center rounded-2xl border",
            achieved ? "border-accent/40 bg-gradient-to-br from-accent/25 to-teal/10 text-mint shadow-[0_0_30px_rgba(57,217,138,0.25)]" : "border-line bg-white/[0.03] text-mist",
          )}
        >
          <Icon size={24} aria-hidden="true" />
          {achieved ? (
            <span className="absolute -right-1.5 -bottom-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[#04140c]">
              <Check size={12} strokeWidth={3} aria-hidden="true" />
            </span>
          ) : rank.state === "locked" ? (
            <span className="absolute -right-1.5 -bottom-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-raised text-mist">
              <Lock size={11} aria-hidden="true" />
            </span>
          ) : null}
        </span>
        <div className="flex flex-col items-end gap-1.5">
          <StatusBadge status={rank.state} />
          {current ? <span className="text-[0.65rem] font-semibold tracking-[0.14em] text-mint uppercase">Current rank</span> : null}
        </div>
      </div>

      <h3 className="mt-5 text-xl font-semibold tracking-[-0.02em]">{rank.name}</h3>
      <p className="mt-1 text-sm text-mist">
        <span className="num font-semibold text-snow">{formatBps(rank.deductionBps)}</span> of the withdrawal deduction pool
      </p>

      <ul className="mt-5 space-y-2.5 text-sm">
        {rank.checks.map((check) => (
          <li key={check.id} className="flex items-start gap-2.5">
            <span
              className={cx(
                "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                check.met && !check.pending ? "bg-accent/15 text-accent" : check.pending ? "bg-warning/12 text-warning" : "bg-white/[0.05] text-mist",
              )}
            >
              {check.met && !check.pending ? <Check size={12} aria-hidden="true" /> : check.pending ? <Clock size={11} aria-hidden="true" /> : <span className="h-1 w-1 rounded-full bg-current" />}
            </span>
            <span className={check.met && !check.pending ? "text-snow" : "text-mist"}>
              {check.label}
              {check.progress ? <span className="num ml-1.5 text-xs text-mist">({check.progress})</span> : null}
              <span className="sr-only">{check.met && !check.pending ? " — met" : check.pending ? " — pending" : " — not met"}</span>
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-5">
        <ProgressBar value={rank.directProgress / rank.directCount} size="sm" label={`${rank.name} referral progress`} showLabel={false} />
        <p className="mt-2 text-xs text-mist">
          {rank.state === "in-progress" ? (
            <>
              Deadline in <Countdown to={new Date(rank.deadline).toISOString()} onElapsed={refresh} className="text-warning" />
            </>
          ) : rank.state === "locked" ? (
            "The 72-hour window starts with your first stake."
          ) : rank.state === "missed" ? (
            `Window closed ${formatDate(rank.deadline, true)}.`
          ) : (
            `Qualified within the window (closed ${formatDate(rank.deadline, true)}).`
          )}
        </p>
      </div>
    </motion.article>
  );
}
