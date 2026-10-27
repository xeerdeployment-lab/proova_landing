import { ArrowRight, Coins } from "lucide-react";
import { Link } from "react-router";
import DashHeading from "../../components/dashboard/DashHeading";
import TxProgress from "../../components/dashboard/TxProgress";
import { CoinStack } from "../../components/dashboard/Visuals";
import StakeForm from "../../components/forms/StakeForm";
import DataTable from "../../components/tables/DataTable";
import Reveal from "../../components/ui/Reveal";
import StatusBadge from "../../components/ui/StatusBadge";
import { planConfig } from "../../data/planConfig";
import { useAccount } from "../../hooks/useAccount";
import cx from "../../lib/cx";
import { formatDate } from "../../lib/dates";
import { formatCents } from "../../lib/money";
import { upDownTierFor } from "../../lib/plan";
import usePageTitle from "../../lib/usePageTitle";

function CurrentStake({ account }) {
  const { stake, upDown, capability } = account;
  const current = stake.active ?? stake.pending;

  if (!current) {
    return (
      <section className="hero-surface flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:p-8">
        <CoinStack cents={null} className="h-32 w-32 shrink-0" />
        <div>
          <p className="kicker text-mint/80">No active stake</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.02em]">Start with as little as {formatCents(planConfig.stake.minCents)}</h2>
          <p className="mt-2 max-w-lg text-sm leading-relaxed text-mist">
            Your first stake opens daily income, direct and up/down rewards, and starts the 72-hour rank window and the 10-day capability window.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="hero-surface grid gap-6 p-6 sm:p-8 md:grid-cols-[auto_1fr_auto] md:items-center">
      <CoinStack cents={current.amountCents} className="mx-auto h-36 w-36 md:mx-0" />
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <p className="kicker text-mint/80">{stake.active ? "Active stake" : "Pending stake"}</p>
          <StatusBadge status={current.status} />
        </div>
        <p className="font-display-num mt-2 text-4xl font-semibold">{formatCents(current.amountCents)}</p>
        <p className="mt-2 text-sm text-mist">
          {stake.active ? `Active since ${formatDate(stake.active.confirmedAt, true)}` : `Submitted ${formatDate(current.createdAt, true)}`} ·{" "}
          {upDownTierFor(current.amountCents)?.name}
        </p>
        {stake.pending ? (
          <div className="mt-4 max-w-sm">
            <TxProgress status="pending" steps={["Request sent", "Awaiting wallet confirmation", "Stake active"]} />
          </div>
        ) : null}
      </div>
      {stake.active ? (
        <dl className="grid grid-cols-2 gap-3 text-sm md:grid-cols-1">
          <div className="dash-card-flat px-4 py-3">
            <dt className="text-xs text-mist">Up/down positions</dt>
            <dd className="num mt-0.5 font-semibold">
              {upDown.tier?.upline} up · {upDown.tier?.downline} down
            </dd>
          </div>
          <div className="dash-card-flat px-4 py-3">
            <dt className="text-xs text-mist">Restake</dt>
            <dd className="mt-0.5 font-semibold">
              {stake.restake.allowed ? (
                <Link to="/dashboard/restake" className="text-mint hover:underline">
                  Available · up to {formatCents(stake.restake.maxCents)}
                </Link>
              ) : (
                <span className="text-mist">Opens at {capability.multiple}x cap</span>
              )}
            </dd>
          </div>
        </dl>
      ) : null}
    </section>
  );
}

export default function MyStake() {
  usePageTitle("Stake");
  const account = useAccount();
  const activeTier = account.upDown.tier?.id;

  return (
    <div className="space-y-8">
      <CurrentStake account={account} />

      <section>
        <DashHeading
          kicker="Stake"
          title={account.stake.canStake ? "Open your stake" : "Stake calculator"}
          lede={
            account.stake.canStake
              ? "Pick an amount, review the fee and allocation, then confirm."
              : "One active stake is allowed per address. Explore amounts here; to increase your position, restake once your capability is reached."
          }
          action={
            account.stake.active ? (
              <Link to="/dashboard/restake" className="btn btn-secondary btn-sm">
                Restake options
                <ArrowRight size={14} aria-hidden="true" />
              </Link>
            ) : null
          }
        />
        <StakeForm mode="stake" />
      </section>

      <Reveal>
        <section>
          <DashHeading kicker="Tiers" title="Up/down eligibility by stake" />
          <div className="grid gap-4 md:grid-cols-3">
            {planConfig.upDown.tiers.map((tier) => (
              <div key={tier.id} className={cx("dash-card p-5", tier.id === activeTier && "border-accent/40 shadow-[0_0_0_1px_rgba(57,217,138,0.15)]")}>
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{tier.name}</p>
                  {tier.id === activeTier ? <StatusBadge status="active" label="Your tier" /> : null}
                </div>
                <p className="num mt-2 text-sm text-mist">
                  {formatCents(tier.minCents)} – {formatCents(tier.maxCents)}
                </p>
                <p className="mt-4 text-sm">
                  <span className="num font-semibold text-snow">{tier.upline}</span> <span className="text-mist">upline ·</span>{" "}
                  <span className="num font-semibold text-snow">{tier.downline}</span> <span className="text-mist">downline</span>
                </p>
                <p className="mt-1 text-xs text-mist">{planConfig.upDown.poolBps / 100}% of each stake funds the up/down pool</p>
              </div>
            ))}
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section>
          <DashHeading kicker="History" title="Stake history" />
          <div className="dash-card overflow-hidden">
            <DataTable
              caption="Stake history"
              rows={account.stake.history}
              emptyIcon={Coins}
              emptyTitle="No stakes yet"
              emptyBody="Your stakes and restakes will be listed here."
              columns={[
                {
                  key: "id",
                  header: "Stake",
                  cell: (row) => (
                    <span className="flex flex-col">
                      <span className="font-medium text-snow capitalize">{row.kind}</span>
                      <span className="num text-xs text-mist">{row.id}</span>
                    </span>
                  ),
                },
                { key: "start", header: "Started", cell: (row) => formatDate(row.confirmedAt ?? row.createdAt, true) },
                { key: "end", header: "Closed", cell: (row) => (row.closedAt ? formatDate(row.closedAt, true) : "—"), mobile: false },
                { key: "status", header: "Status", cell: (row) => <StatusBadge status={row.status} /> },
                { key: "amount", header: "Amount", align: "right", cell: (row) => <span className="num font-medium">{formatCents(row.amountCents)}</span> },
              ]}
            />
          </div>
        </section>
      </Reveal>
    </div>
  );
}
