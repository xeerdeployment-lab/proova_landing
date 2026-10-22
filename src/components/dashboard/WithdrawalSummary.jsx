import { Link } from "react-router";
import { planConfig } from "../../data/planConfig";
import { formatBps, formatCents } from "../../lib/money";
import { withdrawalPreview } from "../../lib/plan";

export default function WithdrawalSummary({ availableCents, requestedCents }) {
  const rules = planConfig.withdrawal;
  const preview = requestedCents == null ? null : withdrawalPreview(requestedCents);
  const lines = preview
    ? [
        ["Withdrawal fee", formatCents(preview.feeCents), `Stated ${formatBps(rules.statedFeeBps)} of the request.`],
        ["Community fund", formatCents(preview.communityCents), `Stated ${formatBps(rules.statedCommunityBps)} deduction.`],
        ["Upline and downline allocation", formatCents(preview.upDownCents), `Stated ${formatBps(rules.statedUpDownBps)} allocation.`],
        ["Rank reward allocation", "Not applied", "Rank rates are not stacked onto this request."],
      ]
    : [];

  return (
    <aside className="dash-card flex h-full flex-col p-5 sm:p-6">
      <p className="text-[0.68rem] font-semibold tracking-[0.18em] text-gold uppercase">Withdrawal</p>
      <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em]">Request preview</h2>
      <p className="mt-2 text-sm leading-relaxed text-mist">
        Stated deductions stay on separate lines. They are not combined, and no payout is calculated.
      </p>
      <dl className="mt-5 space-y-4 text-sm">
        <div className="flex items-start justify-between gap-4">
          <dt className="text-mist">Available balance</dt>
          <dd className="num text-right text-gold">{formatCents(availableCents)}</dd>
        </div>
        <div className="flex items-start justify-between gap-4">
          <dt className="text-mist">Minimum withdrawal</dt>
          <dd className="num text-right">{formatCents(rules.minCents)}</dd>
        </div>
        <div className="flex items-start justify-between gap-4">
          <dt className="text-mist">Requested amount</dt>
          <dd className="num text-right">{preview ? formatCents(preview.requestedCents) : "None in this view"}</dd>
        </div>
      </dl>
      {preview ? (
        <ul className="mt-4 divide-y divide-white/[0.06] border-t border-white/[0.08]">
          {lines.map(([label, value, note]) => (
            <li key={label} className="py-3">
              <div className="flex items-start justify-between gap-3 text-sm">
                <p className="text-snow">{label}</p>
                <p className="num shrink-0 text-right">{value}</p>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-mist">{note}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm leading-relaxed text-mist">
          Enter an amount on the withdrawals page to see the stated fee, community fund, and upline/downline lines.
        </p>
      )}
      <div className="mt-4 rounded-2xl border border-gold/25 bg-gold/[0.06] px-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm text-snow">Estimated net amount</p>
          <p className="text-sm font-semibold text-gold">Not calculated</p>
        </div>
        <p className="mt-1 text-xs leading-relaxed text-mist">The lines above are not added or subtracted. A net payout waits for a confirmed formula.</p>
      </div>
      <Link to="/dashboard/withdrawals" className="btn btn-secondary btn-sm mt-5 self-start">
        View withdrawal history
      </Link>
    </aside>
  );
}
