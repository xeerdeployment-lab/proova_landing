import { useMemo, useState } from "react";
import { planConfig } from "../../data/planConfig";
import { centsToInput, formatCents, parseMoneyInput } from "../../lib/money";
import { stakeBreakdown, validateStakeCents } from "../../lib/plan";
import { useDashboard } from "../../hooks/useDashboard";
import Modal from "../ui/Modal";
import RuleNote from "../ui/RuleNote";

export default function StakeForm({ activeStake }) {
  const { pushToast } = useDashboard();
  const [raw, setRaw] = useState("100");
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState(false);
  const parsed = parseMoneyInput(raw);
  const errors = parsed.error ? [parsed.error] : validateStakeCents(parsed.cents);
  const valid = errors.length === 0 && parsed.cents != null;
  const breakdown = valid ? stakeBreakdown(parsed.cents) : null;
  const blockedByActive = Boolean(activeStake);

  const eligibility = useMemo(
    () => [
      {
        label: "Amount is within the stated range and uses $10 steps",
        ok: valid,
      },
      {
        label: blockedByActive
          ? "One active stake is already in this sample. A second stake stays blocked in the preview."
          : "No active stake is in this view. The live rule still has to be enforced by the backend.",
        ok: !blockedByActive,
      },
      {
        label: "Payment and wallet connection are not available in this preview.",
        ok: false,
      },
    ],
    [blockedByActive, valid],
  );

  const choose = (cents) => {
    setRaw(centsToInput(cents));
    setResult(false);
  };

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
      <form
        className="dash-card p-5 sm:p-6"
        onSubmit={(event) => {
          event.preventDefault();
          if (!valid) return;
          setResult(false);
          setOpen(true);
        }}
        noValidate
      >
        <p className="text-xs font-semibold tracking-[0.16em] text-gold uppercase">New stake preview</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">Choose an amount</h2>
        <p className="mt-2 text-sm leading-relaxed text-mist">
          Minimum {formatCents(planConfig.stake.minCents)}, maximum {formatCents(planConfig.stake.maxCents)}, in multiples of $10.
          The stated platform fee is 10%, leaving a 90% allocation. This form does not take payment.
        </p>

        <label htmlFor="stake-amount" className="mt-6 block text-sm font-medium">
          Stake amount
        </label>
        <input
          id="stake-amount"
          inputMode="decimal"
          value={raw}
          onChange={(event) => {
            setRaw(event.target.value);
            setResult(false);
          }}
          aria-invalid={Boolean(raw) && !valid}
          aria-describedby="stake-amount-error"
          className="field mt-2 py-4 text-2xl font-semibold"
          placeholder="100"
        />
        <div id="stake-amount-error" role="alert" className="mt-2 min-h-5 text-sm text-danger">
          {raw && !valid ? errors[0] : ""}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {planConfig.stake.quickAmountsCents.map((cents) => {
            const selected = parsed.cents === cents;
            return (
              <button
                key={cents}
                type="button"
                aria-pressed={selected}
                onClick={() => choose(cents)}
                className={`rounded-full border px-3 py-2 text-sm ${
                  selected ? "border-gold/50 bg-gold/10 text-gold" : "border-line text-mist hover:text-snow"
                }`}
              >
                {formatCents(cents)}
              </button>
            );
          })}
        </div>

        <label htmlFor="stake-slider" className="mt-6 block text-sm font-medium">
          Amount slider
        </label>
        <input
          id="stake-slider"
          type="range"
          min={planConfig.stake.minCents / 100}
          max={planConfig.stake.maxCents / 100}
          step={planConfig.stake.incrementCents / 100}
          value={valid ? parsed.cents / 100 : planConfig.stake.minCents / 100}
          onChange={(event) => choose(Number(event.target.value) * 100)}
          aria-valuetext={valid ? formatCents(parsed.cents) : "No valid amount"}
          className="mt-3 w-full accent-[#635BFF]"
        />

        <button type="submit" className="btn btn-primary mt-6" disabled={!valid}>
          Review stake preview
        </button>
      </form>

      <div className="space-y-4">
        <div className="dash-card p-5">
          <h3 className="text-sm font-semibold tracking-[0.14em] text-mist uppercase">Fee breakdown</h3>
          {breakdown ? (
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-mist">Stake amount</dt>
                <dd className="num text-snow">{formatCents(breakdown.amountCents)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-mist">Platform fee ({breakdown.feeLabel})</dt>
                <dd className="num text-snow">{formatCents(breakdown.feeCents)}</dd>
              </div>
              <div className="flex justify-between gap-4 border-t border-line pt-3">
                <dt className="text-snow">Remaining allocation ({breakdown.allocationLabel})</dt>
                <dd className="num font-semibold text-snow">{formatCents(breakdown.allocationCents)}</dd>
              </div>
            </dl>
          ) : (
            <p className="mt-3 text-sm text-mist">Enter a valid stake amount to preview the fee.</p>
          )}
          <p className="mt-3 text-xs leading-relaxed text-mist">
            The remaining allocation is the stake minus the 10% fee, so the lines add up to the stake. It is not spendable cash.
          </p>
        </div>
        <div className="dash-card p-5">
          <h3 className="text-sm font-semibold tracking-[0.14em] text-mist uppercase">Eligibility preview</h3>
          <ul className="mt-4 space-y-3">
            {eligibility.map((item) => (
              <li key={item.label} className="flex gap-3 text-sm leading-relaxed">
                <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${item.ok ? "bg-success" : "bg-warning"}`} aria-hidden="true" />
                <span className="text-mist">{item.label}</span>
              </li>
            ))}
          </ul>
        </div>
        <RuleNote title="Server-side rule">
          The one-active-stake limit is only previewed here. A live account has to be checked by the backend against the authenticated member, not against this browser.
        </RuleNote>
      </div>

      <Modal
        open={open}
        title={result ? "Nothing was submitted" : "Review stake preview"}
        description={result ? "No stake was created and no payment was sent." : "Check the stated fee before you close this preview."}
        onClose={() => setOpen(false)}
      >
        {breakdown ? (
          result ? (
            <div className="space-y-3 text-sm leading-relaxed text-mist">
              <p>This preview cannot open a stake. There is no payment integration, and eligibility has not been confirmed by a backend.</p>
              {blockedByActive ? (
                <p>The sample account already shows an active stake. That block is a preview of the stated rule, not a server decision.</p>
              ) : null}
              <button
                type="button"
                className="btn btn-primary mt-2"
                onClick={() => {
                  setOpen(false);
                  pushToast({ title: "Preview closed", body: "No stake was created." });
                }}
              >
                Done
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-mist">Stake amount</dt>
                  <dd className="num">{formatCents(breakdown.amountCents)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-mist">Platform fee</dt>
                  <dd className="num">{formatCents(breakdown.feeCents)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-mist">Remaining allocation</dt>
                  <dd className="num">{formatCents(breakdown.allocationCents)}</dd>
                </div>
              </dl>
              <div className="flex flex-wrap gap-2">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setOpen(false)}>
                  Cancel
                </button>
                <button type="button" className="btn btn-primary btn-sm" onClick={() => setResult(true)}>
                  See preview result
                </button>
              </div>
            </div>
          )
        ) : null}
      </Modal>
    </div>
  );
}
