import cx from "../../lib/cx";
import { formatCents } from "../../lib/money";

/** Label/amount rows with an optional emphasised total. Amounts are always integer cents. */
export default function BreakdownRows({ rows, total, className = "" }) {
  return (
    <dl className={cx("space-y-2.5 text-sm", className)}>
      {rows.map((row) => (
        <div key={row.label} className={cx("flex items-start justify-between gap-4", row.indent && "pl-4")}>
          <dt className={cx("min-w-0", row.indent ? "text-mist/80" : "text-mist")}>
            {row.swatch ? <span className="mr-2 inline-block h-2 w-2 rounded-full align-middle" style={{ background: row.swatch }} aria-hidden="true" /> : null}
            {row.label}
            {row.hint ? <span className="mt-0.5 block text-xs text-mist/70">{row.hint}</span> : null}
          </dt>
          <dd className={cx("num shrink-0", row.tone === "accent" ? "font-semibold text-mint" : row.tone === "muted" ? "text-mist" : "text-snow")}>
            {row.negative && row.cents ? "−" : ""}
            {formatCents(row.cents)}
          </dd>
        </div>
      ))}
      {total ? (
        <div className="flex items-center justify-between gap-4 border-t border-line pt-3">
          <dt className="font-medium text-snow">{total.label}</dt>
          <dd className="num text-base font-semibold text-mint">{formatCents(total.cents)}</dd>
        </div>
      ) : null}
    </dl>
  );
}
