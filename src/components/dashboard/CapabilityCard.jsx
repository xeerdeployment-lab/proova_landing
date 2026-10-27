import { Gauge, RefreshCcw } from "lucide-react";
import { Link } from "react-router";
import { useDashboard } from "../../hooks/useDashboard";
import cx from "../../lib/cx";
import { formatDate } from "../../lib/dates";
import { formatCents } from "../../lib/money";
import ProgressBar from "../ui/ProgressBar";
import Countdown from "./Countdown";

export default function CapabilityCard({ account, className = "" }) {
  const { refresh } = useDashboard();
  const { capability, stake } = account;
  const { window: win } = capability;
  const tone = capability.reached ? "danger" : capability.progress >= 0.85 ? "warning" : undefined;

  return (
    <section className={cx("dash-card p-5 sm:p-6", className)} aria-labelledby="capability-title">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="kicker">Reward capability</p>
          <h2 id="capability-title" className="mt-1 flex items-center gap-2 text-lg font-semibold tracking-[-0.02em]">
            <Gauge size={18} className="text-accent" aria-hidden="true" />
            {capability.multiple}x lifetime cap
          </h2>
        </div>
        <span
          className={cx(
            "rounded-full px-3 py-1 text-xs font-semibold",
            capability.reached ? "bg-danger/12 text-danger" : "bg-accent/12 text-mint",
          )}
        >
          {capability.reached ? "Cap reached" : `${Math.round(capability.progress * 100)}% used`}
        </span>
      </div>

      <div className="mt-5">
        <div className="mb-2 flex items-baseline justify-between gap-3 text-sm">
          <span className="text-mist">Counted toward cap</span>
          <span className="num text-snow">
            {formatCents(capability.countedCents)} <span className="text-mist">/ {formatCents(capability.maxCents)}</span>
          </span>
        </div>
        <ProgressBar value={capability.progress} tone={tone} size="lg" label="Reward capability used" showLabel={false} />
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
        {[
          ["Eligible stake", formatCents(capability.stakeCents)],
          ["Multiplier", `${capability.multiple}x`],
          ["Maximum reward", formatCents(capability.maxCents)],
          ["Remaining", formatCents(capability.remainingCents)],
        ].map(([label, value]) => (
          <div key={label} className="dash-card-flat px-3 py-2.5">
            <dt className="text-xs text-mist">{label}</dt>
            <dd className="num mt-0.5 font-semibold text-snow">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-5 rounded-2xl border border-line bg-white/[0.02] p-4 text-sm">
        <p className="font-medium text-snow">Higher capability</p>
        <p className="mt-1 text-mist">
          {win.directsInWindow} direct referral{win.directsInWindow === 1 ? "" : "s"} staked within {win.days} days of your first stake.
        </p>
        {win.nextTier ? (
          <>
            <div className="mt-3">
              <ProgressBar value={win.directsInWindow / win.nextTier.directs} size="sm" label={`Progress to ${win.nextTier.multiple}x`} showLabel={false} />
            </div>
            <p className="mt-2 text-xs text-mist">
              {win.nextTier.directs - win.directsInWindow} more for {win.nextTier.multiple}x · window closes in{" "}
              <Countdown to={new Date(win.endsAt).toISOString()} onElapsed={refresh} className="text-snow" />
            </p>
          </>
        ) : (
          <p className="mt-2 text-xs text-mist">
            {win.endsAt ? `Qualification window ${win.open ? "open until" : "closed on"} ${formatDate(win.endsAt, true)}.` : "The window starts with your first stake."}
          </p>
        )}
      </div>

      {stake.active ? (
        stake.restake.required ? (
          <Link to="/dashboard/restake" className="btn btn-primary mt-5 w-full">
            <RefreshCcw size={16} aria-hidden="true" />
            Restake required
          </Link>
        ) : (
          <p className="mt-4 text-xs leading-relaxed text-mist">
            When the cap is reached, a restake of at least {formatCents(stake.restake.minCents)} is required to keep earning.
          </p>
        )
      ) : null}
    </section>
  );
}
