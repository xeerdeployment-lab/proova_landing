import { useMemo, useState } from "react";
import { planConfig } from "../../data/planConfig";
import { centsToInput, formatCents } from "../../lib/money";
import { directsWithinDays } from "../../lib/plan";
import ProgressBar from "../ui/ProgressBar";
import RuleNote from "../ui/RuleNote";

export default function ReentryPanel({ member, directs, stakeCents, rewardCents }) {
  const rules = planConfig.reentry;
  const floor = stakeCents != null && stakeCents >= planConfig.stake.minCents ? stakeCents : planConfig.stake.minCents;
  const [amount, setAmount] = useState(floor);
  const threshold = stakeCents == null ? null : stakeCents * rules.compulsoryMultiple;
  const ratio = threshold && rewardCents != null ? Math.min(1, rewardCents / threshold) : 0;
  const windowCounts = useMemo(
    () =>
      rules.enhanced.map((rule) => ({
        ...rule,
        count: directsWithinDays(member.createdAt, directs, rule.withinDays).length,
      })),
    [directs, member.createdAt, rules.enhanced],
  );

  return (
    <section className="dash-card p-5 sm:p-6" aria-labelledby="reentry-title">
      <p className="text-xs font-semibold tracking-[0.16em] text-gold uppercase">Re-entry and income limits</p>
      <h2 id="reentry-title" className="mt-2 text-2xl font-semibold tracking-[-0.04em]">
        Stated limits, not a forecast
      </h2>
      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <article className="rounded-2xl border border-line bg-navy/40 p-4">
          <p className="text-xs text-mist">Sample reward total</p>
          <p className="num mt-2 text-2xl font-semibold">{formatCents(rewardCents)}</p>
          <p className="mt-2 text-xs text-mist">Direct sample rewards only. Other categories are not calculated.</p>
        </article>
        <article className="rounded-2xl border border-line bg-navy/40 p-4">
          <p className="text-xs text-mist">Applicable limit</p>
          <p className="mt-2 text-lg font-semibold">3X rule not confirmed</p>
          <p className="mt-2 text-xs leading-relaxed text-mist">
            Illustrated against {rules.compulsoryMultiple} × the sample stake ({formatCents(threshold)}). The correct base is still unconfirmed.
          </p>
        </article>
        <article className="rounded-2xl border border-line bg-navy/40 p-4">
          <p className="text-xs text-mist">Re-entry eligibility</p>
          <p className="mt-2 text-lg font-semibold">Not open</p>
          <p className="mt-2 text-xs leading-relaxed text-mist">Compulsory re-entry is not triggered, because the threshold itself is unconfirmed.</p>
        </article>
      </div>
      <div className="mt-5">
        <ProgressBar
          value={ratio}
          label={`Illustrative progress ${formatCents(rewardCents)} of ${formatCents(threshold)}. This is not a projection of earnings.`}
        />
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {windowCounts.map((rule) => (
          <article key={rule.multiple} className="rounded-2xl border border-line p-4">
            <p className="font-medium text-snow">{rule.multiple}X lifetime limit</p>
            <p className="mt-2 text-sm leading-relaxed text-mist">
              Stated qualification: {rule.directs} direct referrals within {rule.withinDays} days of joining. Sample records in that window: {rule.count}. This limit is not unlocked.
            </p>
          </article>
        ))}
      </div>
      <div className="mt-5">
        <label htmlFor="reentry-amount" className="text-sm font-medium">
          Re-entry amount preview
        </label>
        <p className="mt-1 text-sm text-mist">
          If re-entry were open, the stated choice is the last stake ({formatCents(stakeCents)}) or a higher amount up to {formatCents(planConfig.stake.maxCents)}. The control below does not create a re-entry.
        </p>
        <input
          id="reentry-amount"
          type="range"
          min={floor / 100}
          max={planConfig.stake.maxCents / 100}
          step={10}
          value={(amount ?? planConfig.stake.minCents) / 100}
          onChange={(event) => setAmount(Number(event.target.value) * 100)}
          disabled={stakeCents == null}
          className="mt-4 w-full accent-[#D8BD83]"
        />
        <p className="num mt-2 text-lg">{formatCents(stakeCents == null ? null : amount)}</p>
        <p className="text-xs text-mist">Selected preview: {stakeCents == null ? "No sample stake" : centsToInput(amount)} dollars. Submission is disabled.</p>
      </div>
      <div className="mt-5">
        <RuleNote>{rules.note}</RuleNote>
      </div>
    </section>
  );
}
