import { Link } from "react-router";
import Ledger from "../../components/tables/Ledger";
import RuleNote from "../../components/ui/RuleNote";
import StatusBadge from "../../components/ui/StatusBadge";
import { DemoLabel } from "../../components/ui/States";
import { planConfig, rewardCategories } from "../../data/planConfig";
import useDemoModel from "../../hooks/useDemoModel";
import { formatBps, formatCents } from "../../lib/money";
import { evaluateRanks, upDownTierFor } from "../../lib/plan";
import usePageTitle from "../../lib/usePageTitle";

export default function Rewards() {
  usePageTitle("Rewards & Earnings");
  const { model } = useDemoModel();
  const directRows = model.transactions.filter((row) => row.category === "direct_reward");
  const pending = directRows.filter((row) => row.status === "pending").reduce((sum, row) => sum + (row.amountCents ?? 0), 0);
  const total = directRows.reduce((sum, row) => sum + (row.amountCents ?? 0), 0);
  const tier = upDownTierFor(model.activeStake?.amountCents ?? null);
  const ranks = evaluateRanks({
    selfStakeCents: model.activeStake?.amountCents ?? 0,
    directs: model.rankDirects,
  });
  const rewardRows = model.transactions.filter((row) => rewardCategories.some((item) => item.id === row.category));

  return (
    <div className="space-y-5">
      <section className="dash-card p-6">
        <DemoLabel />
        <h2 className="mt-4 text-2xl font-semibold tracking-[-0.04em]">Rewards stay in their own categories</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-mist">
          Direct rewards use the stated 10% rate on sample records. Up/down, level, and rank amounts stay uncalculated until the missing rules are confirmed.
        </p>
      </section>

      <section id="direct" className="dash-card p-5 sm:p-6">
        <h2 className="text-xl font-semibold">Direct reward</h2>
        <p className="mt-2 text-sm text-mist">{planConfig.directReward.note}</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <article className="rounded-2xl border border-line p-4">
            <p className="text-xs text-mist">Total direct rewards</p>
            <p className="num mt-2 text-2xl font-semibold">{formatCents(directRows.length ? total : model.snapshot.totalRewardsCents)}</p>
          </article>
          <article className="rounded-2xl border border-line p-4">
            <p className="text-xs text-mist">Pending direct rewards</p>
            <p className="num mt-2 text-2xl font-semibold">{formatCents(directRows.length ? pending : model.snapshot.pendingCents)}</p>
          </article>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="dash-table min-w-[680px]">
            <caption className="sr-only">Sample direct rewards</caption>
            <thead>
              <tr>
                <th>Record</th>
                <th>Referral</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Calculation</th>
              </tr>
            </thead>
            <tbody>
              {directRows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-mist">
                    No sample direct rewards in this view.
                  </td>
                </tr>
              ) : (
                directRows.map((row) => (
                  <tr key={row.id}>
                    <td>{row.id}</td>
                    <td>
                      {row.referralAlias}
                      <span className="block text-xs text-mist">{row.referralId}</span>
                    </td>
                    <td className="num">{formatCents(row.amountCents)}</td>
                    <td>
                      <StatusBadge status={row.status} />
                    </td>
                    <td className="max-w-sm text-mist">{row.calculation}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section id="updown" className="dash-card p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-xl font-semibold">Up/Down rewards</h2>
          <DemoLabel />
        </div>
        <div className="mt-4">
          <RuleNote title="40% allocation needs confirmation">{planConfig.upDown.scopeNote}</RuleNote>
        </div>
        <p className="mt-4 text-sm text-mist">
          Stated allocation: {formatBps(planConfig.upDown.allocationBps)}. No split between upline and downline is assumed.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="dash-table min-w-[640px]">
            <caption className="sr-only">Up and down tier configuration</caption>
            <thead>
              <tr>
                <th>Stake range</th>
                <th>Upline association</th>
                <th>Downline association</th>
                <th>Sample stake</th>
              </tr>
            </thead>
            <tbody>
              {planConfig.upDown.tiers.map((item) => (
                <tr key={item.id}>
                  <td>
                    {formatCents(item.minCents)} – {formatCents(item.maxCents)}
                  </td>
                  <td>{item.upline} users</td>
                  <td>{item.downline} users</td>
                  <td>{tier?.id === item.id ? "Current sample tier" : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <article className="rounded-2xl border border-line p-4 text-sm">
            <h3 className="font-medium text-snow">Upline distribution</h3>
            <p className="mt-2 text-mist">
              {model.snapshot.uplineCount} sample upline records are visible. The tier associates {tier ? tier.upline : "—"} upline users with the sample stake. No per-person amount is calculated.
            </p>
          </article>
          <article className="rounded-2xl border border-line p-4 text-sm">
            <h3 className="font-medium text-snow">Downline distribution</h3>
            <p className="mt-2 text-mist">
              {model.snapshot.downlineCount} unique sample downline records are visible. The tier associates {tier ? tier.downline : "—"} downline users. That count is not a payout list.
            </p>
          </article>
        </div>
      </section>

      <section id="levels" className="dash-card p-5 sm:p-6">
        <h2 className="text-xl font-semibold">Level rewards</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-mist">{planConfig.levelTriggerNote}</p>
        <ol className="mt-6 max-w-xl border-l border-line pl-6">
          {planConfig.levels.map((level) => (
            <li key={level.level} className="relative pb-4">
              <span className="absolute top-1 -left-[1.68rem] h-3 w-3 rounded-full border border-gold bg-navy" aria-hidden="true" />
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-snow">Level {level.level}</span>
                <span className="num text-sm text-gold">{formatCents(level.amountCents)}</span>
              </div>
              <p className="text-xs text-mist">Stated reward amount</p>
            </li>
          ))}
        </ol>
      </section>

      <section id="ranks" className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">Rank rewards</h2>
            <p className="mt-2 max-w-2xl text-sm text-mist">{planConfig.rankNote}</p>
          </div>
          <Link to="/dashboard/ranks" className="text-sm font-medium text-gold">
            Open rank progress
          </Link>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {ranks.map((rank) => (
            <article key={rank.id} className="dash-card p-5">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-semibold">{rank.name}</h3>
                <StatusBadge status="not-confirmed" />
              </div>
              <p className="mt-3 text-sm text-mist">Stated withdrawal deduction {formatBps(rank.deductionBps)}.</p>
              <p className="mt-3 text-sm text-mist">No confirmed distribution history.</p>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold">Reward history</h2>
        <Ledger
          rows={rewardRows}
          categories={rewardCategories}
          caption="Reward history"
          filename="proova-demo-rewards.csv"
          emptyTitle="No reward records"
          emptyBody="No sample reward rows match these filters."
        />
      </section>
    </div>
  );
}
