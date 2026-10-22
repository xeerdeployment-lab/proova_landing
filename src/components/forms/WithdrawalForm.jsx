import { useState } from "react";
import { planConfig } from "../../data/planConfig";
import { formatBps, formatCents, parseMoneyInput } from "../../lib/money";
import { validateWithdrawalCents, withdrawalPreview } from "../../lib/plan";
import { useDashboard } from "../../hooks/useDashboard";
import Modal from "../ui/Modal";
import RuleNote from "../ui/RuleNote";

export default function WithdrawalForm({ availableCents }) {
  const { pushToast } = useDashboard();
  const [raw, setRaw] = useState("20");
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState(false);
  const parsed = parseMoneyInput(raw);
  const errors = parsed.error ? [parsed.error] : validateWithdrawalCents(parsed.cents);
  const calculable = errors.length === 0 && parsed.cents != null;
  const overAvailable = calculable && availableCents != null && parsed.cents > availableCents;
  if (overAvailable) {
    errors.push(`This is above the sample available figure of ${formatCents(availableCents)}.`);
  }
  const valid = calculable && !overAvailable;
  const preview = calculable ? withdrawalPreview(parsed.cents) : null;
  const rules = planConfig.withdrawal;

  const lines = preview
    ? [
        ["Requested withdrawal", formatCents(preview.requestedCents), "The amount typed into this preview."],
        ["Withdrawal fee", formatCents(preview.feeCents), `Stated ${formatBps(rules.statedFeeBps)} of the request. Not confirmed as the first deduction.`],
        ["Community fund deduction", formatCents(preview.communityCents), `Stated ${formatBps(rules.statedCommunityBps)}. Shown separately so it is not hidden inside another line.`],
        ["Upline/downline allocation", formatCents(preview.upDownCents), `Stated ${formatBps(rules.statedUpDownBps)} toward upline and downline income.`],
        ["Rank reward allocation", "Not deducted here", "Initiator 4%, Explorer 3%, and Builder 3% are stated on the rank page. Stacking them onto this request is unconfirmed."],
        ["Estimated net amount", "Not calculated", "The lines above are not added or subtracted. A net payout waits for a confirmed formula."],
      ]
    : [];

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <form
        className="dash-card p-5 sm:p-6"
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          if (!valid) return;
          setResult(false);
          setOpen(true);
        }}
      >
        <p className="text-xs font-semibold tracking-[0.16em] text-gold uppercase">Withdrawal preview</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">Request an amount</h2>
        <p className="mt-3 text-sm leading-relaxed text-mist">
          Sample available figure:{" "}
          <span className="num text-snow">{formatCents(availableCents)}</span>. This is not funds you can withdraw.
          Minimum {formatCents(rules.minCents)}.
        </p>
        <label htmlFor="withdraw-amount" className="mt-6 block text-sm font-medium">
          Amount
        </label>
        <input
          id="withdraw-amount"
          inputMode="decimal"
          value={raw}
          onChange={(event) => {
            setRaw(event.target.value);
            setResult(false);
          }}
          aria-invalid={Boolean(raw) && !valid}
          aria-describedby="withdraw-amount-error"
          className="field mt-2 py-4 text-2xl font-semibold"
        />
        <p id="withdraw-amount-error" role="alert" className="mt-2 min-h-5 text-sm text-danger">
          {raw && !valid ? errors[0] : ""}
        </p>
        <button type="submit" className="btn btn-primary mt-4" disabled={!valid}>
          Review withdrawal preview
        </button>
      </form>

      <div className="space-y-4">
        <div className="dash-card p-5">
          <h3 className="text-sm font-semibold tracking-[0.14em] text-mist uppercase">Calculation preview</h3>
          {preview ? (
            <ul className="mt-4 divide-y divide-white/5">
              {lines.map(([label, value, note]) => (
                <li key={label} className="py-3">
                  <div className="flex items-start justify-between gap-4">
                    <p className="text-sm text-snow">{label}</p>
                    <p className="num text-sm text-gold">{value}</p>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-mist">{note}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-mist">Enter at least {formatCents(rules.minCents)} to see the stated lines.</p>
          )}
        </div>
        <RuleNote>{rules.formulaNote}</RuleNote>
      </div>

      <Modal
        open={open}
        title={result ? "Nothing was submitted" : "Review withdrawal preview"}
        description={result ? "No withdrawal was requested and no funds moved." : "Each deduction stays on its own line. There is no net payout yet."}
        onClose={() => setOpen(false)}
        wide
      >
        {result ? (
          <div className="space-y-3 text-sm leading-relaxed text-mist">
            <p>A withdrawal is not marked successful until a backend confirms it. This preview has no backend.</p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                setOpen(false);
                pushToast({ title: "Preview closed", body: "No withdrawal was created." });
              }}
            >
              Done
            </button>
          </div>
        ) : (
          <div>
            <ul className="space-y-2 text-sm">
              {lines.map(([label, value]) => (
                <li key={label} className="flex justify-between gap-4">
                  <span className="text-mist">{label}</span>
                  <span className="num text-snow">{value}</span>
                </li>
              ))}
            </ul>
            <div className="mt-5 flex flex-wrap gap-2">
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setOpen(false)}>
                Cancel
              </button>
              <button type="button" className="btn btn-primary btn-sm" onClick={() => setResult(true)}>
                See preview result
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
