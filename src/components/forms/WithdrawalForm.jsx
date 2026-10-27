import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { Link } from "react-router";
import { planConfig } from "../../data/planConfig";
import { useAccount, useMutation } from "../../hooks/useAccount";
import cx from "../../lib/cx";
import { formatBps, formatCents, parseMoneyInput } from "../../lib/money";
import { ease } from "../../lib/motion";
import { validateWithdrawal, withdrawalBreakdown } from "../../lib/plan";
import { api } from "../../services/api";
import BreakdownRows from "../dashboard/BreakdownRows";
import SuccessMark from "../dashboard/SuccessMark";
import TxProgress from "../dashboard/TxProgress";
import Modal from "../ui/Modal";
import RuleNote from "../ui/RuleNote";
import { InlineError } from "../ui/States";
import AmountField from "./AmountField";

const segmentColors = {
  member: "#39D98A",
  upDown: "#27B5A0",
  community: "#83F7B5",
  ranks: "#F6C76A",
  platform: "#5B6A80",
};

function breakdownRows(split) {
  return [
    { label: "Requested amount", cents: split.grossCents },
    { label: `Withdrawal deduction (${split.labels.deduction})`, cents: split.deductionCents, negative: true },
    { label: `Community fund (${split.labels.community} of deduction)`, cents: split.communityCents, indent: true, swatch: segmentColors.community, tone: "muted" },
    ...split.rankPools.map((pool) => ({
      label: `${pool.name} rank pool (${formatBps(pool.bps)} of deduction)`,
      cents: pool.cents,
      indent: true,
      swatch: segmentColors.ranks,
      tone: "muted",
    })),
    { label: "Platform (rest of deduction)", cents: split.platformCents, indent: true, swatch: segmentColors.platform, tone: "muted" },
    { label: "After deduction", cents: split.netCents },
    { label: `Up/down income (${split.labels.upDown})`, cents: split.upDownCents, negative: true, swatch: segmentColors.upDown },
  ];
}

function AllocationBar({ split }) {
  const reduce = useReducedMotion();
  const [focus, setFocus] = useState(null);
  const segments = [
    { id: "member", label: "You receive", cents: split.memberCents },
    { id: "upDown", label: "Up/down income", cents: split.upDownCents },
    { id: "community", label: "Community fund", cents: split.communityCents },
    { id: "ranks", label: "Rank pools", cents: split.rankCents },
    { id: "platform", label: "Platform", cents: split.platformCents },
  ];
  const active = segments.find((segment) => segment.id === focus);

  return (
    <div>
      <div className="flex h-3 overflow-hidden rounded-full bg-white/5" role="img" aria-label={segments.map((s) => `${s.label} ${formatCents(s.cents)}`).join(", ")}>
        {segments.map((segment) => (
          <motion.span
            key={segment.id}
            className={cx("h-full cursor-pointer transition-opacity", focus && focus !== segment.id && "opacity-40")}
            style={{ background: segmentColors[segment.id] }}
            initial={false}
            animate={{ width: `${(segment.cents / split.grossCents) * 100}%` }}
            transition={{ duration: reduce ? 0 : 0.5, ease }}
            onMouseEnter={() => setFocus(segment.id)}
            onMouseLeave={() => setFocus(null)}
          />
        ))}
      </div>
      <p className="mt-2 min-h-4 text-xs text-mist" aria-live="polite">
        {active ? `${active.label}: ${formatCents(active.cents)} (${((active.cents / split.grossCents) * 100).toFixed(1)}%)` : "Hover the bar to inspect each allocation"}
      </p>
    </div>
  );
}

export default function WithdrawalForm() {
  const account = useAccount();
  const available = account.balances.availableCents;
  const blocker = account.withdrawal.blocker;
  const [raw, setRaw] = useState("");
  const [open, setOpen] = useState(false);
  const mutation = useMutation(api.withdraw);

  const parsed = parseMoneyInput(raw);
  const errors = parsed.error
    ? [parsed.error]
    : validateWithdrawal(parsed.cents, { availableCents: available, hasPending: account.withdrawal.hasPending, capabilityReached: account.capability.reached });
  const valid = errors.length === 0;
  const split = valid ? withdrawalBreakdown(parsed.cents) : null;
  const tx = mutation.result ? account.ledger.find((row) => row.id === mutation.result.transactionId) : null;
  const txStatus = mutation.submitting ? "submitting" : (tx?.status ?? mutation.result?.status);
  const presets = [2_500, 5_000, 7_500, 10_000].map((bps) => ({
    key: bps,
    cents: bps === 10_000 ? available : Math.floor((available * bps) / 10_000),
    label: bps === 10_000 ? "Max" : `${bps / 100}%`,
  }));

  const close = () => {
    if (mutation.submitting) return;
    setOpen(false);
    if (mutation.status === "success") setRaw("");
  };

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <form
        className="dash-card p-5 sm:p-7"
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          if (!valid || blocker) return;
          mutation.reset();
          setOpen(true);
        }}
      >
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="kicker">Available to withdraw</p>
            <p className="font-display-num mt-1 text-3xl font-semibold text-snow">{formatCents(available)}</p>
          </div>
          {account.balances.pendingWithdrawalCents ? (
            <p className="text-xs text-warning">{formatCents(account.balances.pendingWithdrawalCents)} processing</p>
          ) : null}
        </div>
        {blocker ? <p className="mt-4 rounded-xl border border-warning/25 bg-warning/[0.06] px-3 py-2.5 text-sm text-warning">{blocker}</p> : null}
        {account.capability.reached ? (
          <Link to="/dashboard/restake" className="btn btn-primary btn-sm mt-3">
            Go to restake
          </Link>
        ) : null}

        <div className="mt-6">
          <AmountField
            id="withdraw-amount"
            label="Amount to withdraw"
            raw={raw}
            onRaw={setRaw}
            cents={parsed.cents}
            error={raw && !valid ? errors[0] : null}
            presets={presets}
            presetLabel={(preset) => preset.label}
            minCents={planConfig.withdrawal.minCents}
            maxCents={Math.max(available, planConfig.withdrawal.minCents)}
            disabled={Boolean(blocker)}
            hint={`Minimum ${formatCents(planConfig.withdrawal.minCents)}. Reward capability and pending requests are checked by the server before every withdrawal.`}
          />
        </div>
        <button type="submit" className="btn btn-primary mt-6 w-full sm:w-auto" disabled={!valid || Boolean(blocker)}>
          Review withdrawal
        </button>
      </form>

      <aside className="dash-card p-5 sm:p-6" aria-label="Withdrawal breakdown">
        <p className="kicker">Breakdown</p>
        {split ? (
          <>
            <p className="mt-2 text-sm text-mist">You receive</p>
            <p className="font-display-num text-3xl font-semibold text-mint">{formatCents(split.memberCents)}</p>
            <div className="mt-5">
              <AllocationBar split={split} />
            </div>
            <BreakdownRows className="mt-5" rows={breakdownRows(split)} total={{ label: `You receive (${split.labels.member})`, cents: split.memberCents }} />
          </>
        ) : (
          <p className="mt-3 text-sm leading-relaxed text-mist">Enter an amount to see exactly where each cent goes. The lines always add back to the amount you request.</p>
        )}
        <RuleNote tone={planConfig.withdrawal.confirmed ? "info" : "warning"} title={planConfig.withdrawal.confirmed ? "Calculation basis" : "Calculation basis — pending sign-off"} className="mt-5">
          {planConfig.withdrawal.basisNote}
        </RuleNote>
      </aside>

      <Modal
        open={open}
        title={mutation.status === "success" ? (txStatus === "completed" ? "Withdrawal completed" : "Withdrawal submitted") : "Confirm withdrawal"}
        description={mutation.status === "success" ? undefined : "The server re-checks your balance, pending requests and reward capability."}
        onClose={close}
      >
        {mutation.status === "success" ? (
          <div className="flex flex-col items-center text-center">
            <SuccessMark tone={txStatus === "completed" ? "success" : "pending"} />
            <p className="font-display-num mt-4 text-2xl font-semibold">{formatCents(mutation.result.breakdown?.memberCents ?? mutation.result.amountCents)}</p>
            <p className="text-xs text-mist">to you · reference {mutation.result.transactionId}</p>
            <div className="mt-6 w-full rounded-2xl border border-line p-4 text-left">
              <TxProgress status={txStatus} steps={["Request sent", "Processing", "Paid out"]} />
            </div>
            <button type="button" className="btn btn-primary mt-6 w-full" onClick={close}>
              Done
            </button>
          </div>
        ) : split ? (
          <div className="space-y-5">
            <BreakdownRows rows={breakdownRows(split)} total={{ label: "You receive", cents: split.memberCents }} />
            <InlineError error={mutation.error} />
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button type="button" className="btn btn-secondary" onClick={close} disabled={mutation.submitting}>
                Cancel
              </button>
              <button type="button" className="btn btn-primary" disabled={mutation.submitting} onClick={() => mutation.submit({ amountCents: split.grossCents })}>
                {mutation.submitting ? "Submitting…" : `Withdraw ${formatCents(split.grossCents)}`}
              </button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
