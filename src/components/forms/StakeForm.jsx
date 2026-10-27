import { ShieldCheck } from "lucide-react";
import { useCallback, useState } from "react";
import { Link } from "react-router";
import { planConfig } from "../../data/planConfig";
import { useAccount, useMutation } from "../../hooks/useAccount";
import { centsToInput, formatCents, parseMoneyInput } from "../../lib/money";
import { capabilitySummary, directRewardCents, stakeBreakdown, upDownPoolCents, upDownTierFor, validateStakeCents } from "../../lib/plan";
import { api } from "../../services/api";
import BreakdownRows from "../dashboard/BreakdownRows";
import SuccessMark from "../dashboard/SuccessMark";
import TxProgress from "../dashboard/TxProgress";
import { CoinStack } from "../dashboard/Visuals";
import Modal from "../ui/Modal";
import { InlineError } from "../ui/States";
import AmountField from "./AmountField";

/**
 * New stake or restake. Validation here is a preview of the server rules; the request itself is
 * re-validated by the server, which also owns the one-active-stake rule.
 */
export default function StakeForm({ mode = "stake" }) {
  const account = useAccount();
  const restake = mode === "restake";
  const rules = planConfig.stake;
  const minCents = restake ? account.stake.restake.minCents : rules.minCents;
  const maxCents = restake ? account.stake.restake.maxCents : rules.maxCents;
  const allowed = restake ? account.stake.restake.allowed : account.stake.canStake;
  const blockedReason = restake
    ? account.stake.restake.reason
    : account.stake.pending
      ? "A stake is awaiting confirmation."
      : "This address already has an active stake. One active stake is allowed at a time.";

  const [raw, setRaw] = useState(() => centsToInput(restake ? minCents : 12_000));
  const [open, setOpen] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const request = useCallback((args) => (restake ? api.restake(args) : api.stake(args)), [restake]);
  const mutation = useMutation(request);

  const parsed = parseMoneyInput(raw);
  const errors = parsed.error ? [parsed.error] : validateStakeCents(parsed.cents, { minCents });
  const valid = errors.length === 0;
  const cents = valid ? parsed.cents : null;
  const breakdown = cents ? stakeBreakdown(cents) : null;
  const tier = upDownTierFor(cents);
  const multiple = account.capability.multiple || planConfig.capability.baseMultiple;
  const projectedCap = cents
    ? capabilitySummary({ stakeCents: cents, firstStakeAt: account.member.firstStakeAt, directs: account.referrals.directs, countedCents: 0, now: account.serverTime })
    : null;

  const verb = restake ? "Restake" : "Stake";
  const tx = mutation.result ? account.ledger.find((row) => row.relatedId === mutation.result.transactionId && (row.category === "stake" || row.category === "restake")) : null;
  const txStatus = mutation.submitting ? "submitting" : (tx?.status ?? mutation.result?.status);

  const openReview = (event) => {
    event.preventDefault();
    if (!valid || !allowed) return;
    mutation.reset();
    setAgreed(false);
    setOpen(true);
  };

  const close = () => {
    if (mutation.submitting) return;
    setOpen(false);
  };

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
      <form className="dash-card p-5 sm:p-7" onSubmit={openReview} noValidate>
        <p className="kicker">{restake ? "Restake" : "New stake"}</p>
        <h2 className="mt-1 text-xl font-semibold tracking-[-0.02em] sm:text-2xl">{restake ? "Choose your restake amount" : "Choose an amount to stake"}</h2>
        <p className="mt-2 text-sm leading-relaxed text-mist">
          {formatCents(minCents)} to {formatCents(maxCents)} in {formatCents(rules.incrementCents)} steps. A {breakdown?.feeLabel ?? "10%"} platform fee applies
          {restake ? "; the restake must be at least your last stake amount." : "."}
        </p>

        {!allowed && blockedReason ? <p className="mt-4 rounded-xl border border-warning/25 bg-warning/[0.06] px-3 py-2.5 text-sm text-warning">{blockedReason}</p> : null}

        <div className="mt-6">
          <AmountField
            id={`${mode}-amount`}
            label={`${verb} amount`}
            raw={raw}
            onRaw={setRaw}
            cents={parsed.cents}
            error={raw && !valid ? errors[0] : null}
            presets={rules.presetsCents.map((value) => ({ cents: value }))}
            presetLabel={(preset) => `$${preset.cents / 100}`}
            minCents={minCents}
            maxCents={maxCents}
            stepCents={rules.incrementCents}
            slider
          />
        </div>

        <button type="submit" className="btn btn-primary mt-6 w-full sm:w-auto" disabled={!valid || !allowed}>
          Review {verb.toLowerCase()}
        </button>
        {!allowed ? <p className="mt-3 text-xs text-mist">You can still use the calculator above; submitting is unavailable right now.</p> : null}
      </form>

      <aside className="dash-card relative overflow-hidden p-5 sm:p-6" aria-label={`${verb} preview`}>
        <CoinStack cents={cents} className="pointer-events-none absolute -top-6 -right-10 h-44 w-44 opacity-80" />
        <p className="kicker">Preview</p>
        <p className="font-display-num mt-2 text-3xl font-semibold text-snow">{cents ? formatCents(cents) : "—"}</p>
        <p className="mt-1 text-sm text-mist">{tier ? `${tier.name} · ${tier.upline} up / ${tier.downline} down positions` : "Enter a valid amount"}</p>

        {breakdown ? (
          <BreakdownRows
            className="mt-6"
            rows={[
              { label: `${verb} amount`, cents: breakdown.amountCents },
              { label: `Platform fee (${breakdown.feeLabel})`, cents: breakdown.feeCents, negative: true, tone: "muted" },
              { label: `Up/down pool funded (${planConfig.upDown.poolBps / 100}%)`, cents: upDownPoolCents(cents), hint: "Shared across eligible positions by backend rules", tone: "muted" },
              { label: `Direct reward to your sponsor (${planConfig.directReward.rateBps / 100}%)`, cents: directRewardCents(cents), tone: "muted" },
            ]}
            total={{ label: `Net allocation (${breakdown.allocationLabel})`, cents: breakdown.allocationCents }}
          />
        ) : null}

        {projectedCap ? (
          <div className="mt-5 rounded-2xl border border-accent/20 bg-accent/[0.05] p-4 text-sm">
            <p className="flex items-center gap-2 font-medium text-snow">
              <ShieldCheck size={16} className="text-accent" aria-hidden="true" />
              Reward capability up to {formatCents(projectedCap.maxCents)}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-mist">
              {projectedCap.multiple}x this stake. Rewards stop counting at the cap, after which a restake of at least this amount is required.
            </p>
          </div>
        ) : null}
        {multiple > planConfig.capability.baseMultiple ? <p className="mt-3 text-xs text-mint">Your {multiple}x lifetime multiplier applies.</p> : null}
      </aside>

      <Modal
        open={open}
        title={mutation.status === "success" ? (txStatus === "completed" ? `${verb} confirmed` : `${verb} submitted`) : `Confirm ${verb.toLowerCase()}`}
        description={mutation.status === "success" ? undefined : "Check every line before you confirm. The server validates the request again."}
        onClose={close}
      >
        {mutation.status === "success" ? (
          <div className="flex flex-col items-center text-center">
            <SuccessMark tone={txStatus === "completed" ? "success" : "pending"} />
            <p className="font-display-num mt-4 text-2xl font-semibold">{formatCents(mutation.result.amountCents)}</p>
            <p className="num mt-1 text-xs text-mist">Reference {mutation.result.transactionId}</p>
            <div className="mt-6 w-full rounded-2xl border border-line p-4 text-left">
              <TxProgress status={txStatus} steps={["Request sent", "Awaiting wallet confirmation", "Stake active"]} />
            </div>
            <div className="mt-6 flex w-full flex-col gap-2 sm:flex-row">
              <Link to="/dashboard/transactions" className="btn btn-secondary flex-1" onClick={() => setOpen(false)}>
                View transactions
              </Link>
              <button type="button" className="btn btn-primary flex-1" onClick={() => setOpen(false)}>
                Done
              </button>
            </div>
          </div>
        ) : breakdown ? (
          <div className="space-y-5">
            <BreakdownRows
              rows={[
                { label: `${verb} amount`, cents: breakdown.amountCents },
                { label: `Platform fee (${breakdown.feeLabel})`, cents: breakdown.feeCents, negative: true },
              ]}
              total={{ label: "Net allocation", cents: breakdown.allocationCents }}
            />
            <ul className="space-y-1.5 text-xs leading-relaxed text-mist">
              <li>• {tier?.name}: up to {tier?.upline} upline and {tier?.downline} downline positions.</li>
              <li>• One active stake per address. {restake ? "Your current stake closes when this one confirms." : ""}</li>
              <li>• Rewards count toward a {projectedCap?.multiple}x cap of {formatCents(projectedCap?.maxCents)}. Rewards are not guaranteed.</li>
            </ul>
            <label className="flex items-start gap-3 text-sm text-snow">
              <input type="checkbox" className="mt-0.5 h-4 w-4 accent-[#39D98A]" checked={agreed} onChange={(event) => setAgreed(event.target.checked)} />I understand the
              fee, the reward cap and that this cannot be reversed once confirmed.
            </label>
            <InlineError error={mutation.error} />
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button type="button" className="btn btn-secondary" onClick={close} disabled={mutation.submitting}>
                Cancel
              </button>
              <button type="button" className="btn btn-primary" disabled={!agreed || mutation.submitting} onClick={() => mutation.submit({ amountCents: cents })}>
                {mutation.submitting ? "Submitting…" : `Confirm ${formatCents(cents)}`}
              </button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
