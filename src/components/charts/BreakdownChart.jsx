import { formatCents } from "../../lib/money";
import { DemoLabel } from "../ui/States";

export default function BreakdownChart({ rows }) {
  const known = rows.filter((row) => row.calculated && row.amountCents != null).map((row) => row.amountCents);
  const max = Math.max(...known, 1);

  return (
    <section aria-labelledby="breakdown-title">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 id="breakdown-title" className="text-lg font-semibold tracking-[-0.03em]">
              Earnings breakdown
            </h2>
            <DemoLabel />
          </div>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-mist">
            Direct rewards use sample ledger rows. The other categories stay blank because their rules are not confirmed. A blank line is not a payout of zero.
          </p>
        </div>
      </div>
      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {rows.map((row) => {
          const knownAmount = row.calculated && row.amountCents != null;
          return (
            <li key={row.key} className="dash-card p-4 sm:p-5">
              <p className="text-sm text-mist">{row.label}</p>
              <p className={`mt-3 text-xl font-semibold tracking-[-0.03em] ${knownAmount ? "num text-snow" : "text-base text-mist"}`}>
                {knownAmount ? formatCents(row.amountCents) : "Not calculated"}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-mist">
                {knownAmount ? "From sample reward records in the preview ledger." : "Rule not confirmed. No amount is shown."}
              </p>
              {knownAmount ? (
                <div className="mt-4 h-1 overflow-hidden rounded-full bg-white/[0.06]" aria-hidden="true">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-royal to-electric"
                    style={{ width: `${Math.max(8, (row.amountCents / max) * 100)}%` }}
                  />
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
