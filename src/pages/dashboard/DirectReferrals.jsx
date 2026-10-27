import { CheckCircle2, Clock, UserCheck, UserPlus, Users } from "lucide-react";
import { useMemo, useState } from "react";
import DashHeading from "../../components/dashboard/DashHeading";
import MetricCard from "../../components/dashboard/MetricCard";
import ReferralTools from "../../components/forms/ReferralTools";
import DataTable from "../../components/tables/DataTable";
import Ledger from "../../components/tables/Ledger";
import Pagination from "../../components/tables/Pagination";
import ProgressBar from "../../components/ui/ProgressBar";
import Reveal from "../../components/ui/Reveal";
import StatusBadge from "../../components/ui/StatusBadge";
import Tabs from "../../components/ui/Tabs";
import { planConfig, transactionCategories } from "../../data/planConfig";
import { useAccount } from "../../hooks/useAccount";
import { formatDate } from "../../lib/dates";
import { formatCents } from "../../lib/money";
import usePageTitle from "../../lib/usePageTitle";

const pageSize = 8;

function Qualification({ account }) {
  const { capability, ranks } = account;
  const win = capability.window;
  const tiers = [...planConfig.capability.enhanced].sort((a, b) => a.directs - b.directs);
  const nextRank = ranks.list.find((rank) => rank.id === ranks.next);

  return (
    <section className="dash-card h-full p-5 sm:p-6" aria-labelledby="qualification-title">
      <p className="kicker">Qualification</p>
      <h2 id="qualification-title" className="mt-1 text-lg font-semibold tracking-[-0.02em]">
        Referral milestones
      </h2>
      <ul className="mt-5 space-y-5">
        {tiers.map((tier) => {
          const met = capability.multiple >= tier.multiple;
          return (
            <li key={tier.multiple}>
              <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                <span className="flex items-center gap-2 text-snow">
                  {met ? <CheckCircle2 size={15} className="text-accent" aria-hidden="true" /> : <Clock size={15} className="text-mist" aria-hidden="true" />}
                  {tier.directs} directs in {tier.withinDays} days → {tier.multiple}x capability
                </span>
                <span className="num text-xs text-mist">
                  {Math.min(win.directsInWindow, tier.directs)}/{tier.directs}
                </span>
              </div>
              <ProgressBar value={win.directsInWindow / tier.directs} size="sm" label={`${tier.multiple}x capability progress`} showLabel={false} />
            </li>
          );
        })}
      </ul>
      <p className="mt-4 text-xs text-mist">
        {win.endsAt ? (win.open ? `Window open until ${formatDate(win.endsAt, true)}.` : `Window closed ${formatDate(win.endsAt, true)}.`) : "Windows start with your first stake."}
      </p>
      <div className="mt-5 rounded-2xl border border-line bg-white/[0.02] p-4 text-sm">
        <p className="font-medium text-snow">Rank requirement</p>
        <p className="mt-1 text-mist">
          {nextRank
            ? `${nextRank.name}: ${nextRank.directProgress}/${nextRank.directCount} directs staking ${formatCents(nextRank.directStakeCents)}+ within 72 hours.`
            : ranks.current
              ? `You hold ${ranks.list.find((rank) => rank.id === ranks.current)?.name}. Rank windows are closed.`
              : "Each rank needs 2 qualifying directs within 72 hours of your first stake."}
        </p>
      </div>
    </section>
  );
}

export default function DirectReferrals() {
  usePageTitle("Direct Referrals");
  const account = useAccount();
  const { referrals } = account;
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);

  const rows = useMemo(
    () => [...referrals.directs].filter((row) => filter === "all" || row.status === filter).sort((a, b) => new Date(b.joinedAt) - new Date(a.joinedAt)),
    [referrals.directs, filter],
  );
  const pages = Math.max(1, Math.ceil(rows.length / pageSize));
  const safePage = Math.min(page, pages);

  return (
    <div className="space-y-8">
      <section className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4" aria-label="Referral totals">
        <MetricCard index={0} icon={Users} label="Total direct referrals" count={referrals.total} />
        <MetricCard index={1} icon={UserCheck} label="Active directs" count={referrals.active} hint="With a confirmed stake" tone="teal" />
        <MetricCard index={2} icon={CheckCircle2} label="Rewards completed" cents={referrals.completedRewardsCents} hint={`${planConfig.directReward.rateBps / 100}% of each confirmed stake`} tone="mint" />
        <MetricCard index={3} icon={Clock} label="Rewards pending" cents={referrals.pendingRewardsCents} hint="Paid once the stake confirms" tone="warning" />
      </section>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <div className="space-y-5">
          <ReferralTools />
          <div className="dash-card p-5 text-sm leading-relaxed text-mist sm:p-6">
            <p className="font-medium text-snow">How direct rewards work</p>
            <p className="mt-1">
              You earn {planConfig.directReward.rateBps / 100}% of each direct referral&apos;s confirmed stake amount. Each referred stake pays once — the server keys the
              reward to the source stake, so it can&apos;t be paid twice. Rewards count toward your reward capability.
            </p>
          </div>
        </div>
        <Qualification account={account} />
      </div>

      <Reveal>
        <section>
          <DashHeading
            kicker="Activity"
            title="Your direct referrals"
            action={
              <Tabs
                label="Referral status"
                value={filter}
                onChange={(value) => {
                  setFilter(value);
                  setPage(1);
                }}
                tabs={[
                  { id: "all", label: "All" },
                  { id: "active", label: "Active" },
                  { id: "pending", label: "Pending" },
                ]}
              />
            }
          />
          <div className="dash-card overflow-hidden">
            <DataTable
              caption="Direct referrals"
              rows={rows.slice((safePage - 1) * pageSize, safePage * pageSize)}
              emptyIcon={UserPlus}
              emptyTitle={filter === "all" ? "No referrals yet" : `No ${filter} referrals`}
              emptyBody="Share your link to invite people. They'll appear here as soon as they register."
              columns={[
                {
                  key: "member",
                  header: "Member",
                  cell: (row) => (
                    <span className="flex flex-col">
                      <span className="font-medium text-snow">{row.alias}</span>
                      <span className="num text-xs text-mist">{row.id}</span>
                    </span>
                  ),
                },
                { key: "joined", header: "Joined", cell: (row) => formatDate(row.joinedAt, true) },
                { key: "stake", header: "Stake", cell: (row) => <span className="num">{formatCents(row.stakeCents)}</span> },
                { key: "status", header: "Status", cell: (row) => <StatusBadge status={row.status} /> },
                {
                  key: "reward",
                  header: "Your reward",
                  align: "right",
                  cell: (row) =>
                    row.reward ? (
                      <span className="flex flex-col items-end">
                        <span className={`num font-medium ${row.reward.status === "completed" ? "text-mint" : "text-warning"}`}>{formatCents(row.reward.cents)}</span>
                        <span className="text-xs text-mist capitalize">{row.reward.status}</span>
                      </span>
                    ) : (
                      <span className="text-xs text-mist">—</span>
                    ),
                },
              ]}
            />
            <Pagination page={safePage} pages={pages} total={rows.length} onPage={setPage} label="referrals" />
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section>
          <DashHeading kicker="History" title="Direct reward history" />
          <Ledger
            rows={account.ledger.filter((row) => row.category === "direct_reward")}
            categories={transactionCategories.filter((item) => item.id === "direct_reward")}
            filename="axora-direct-rewards.csv"
            pageSize={6}
            emptyTitle="No direct rewards yet"
          />
        </section>
      </Reveal>
    </div>
  );
}
