import { Link } from "react-router";
import BreakdownChart from "../../components/charts/BreakdownChart";
import EarningsChart from "../../components/charts/EarningsChart";
import AccountPanel from "../../components/dashboard/AccountPanel";
import DashHeading from "../../components/dashboard/DashHeading";
import RankWindowNote from "../../components/dashboard/RankWindowNote";
import FinancialSummary from "../../components/dashboard/FinancialSummary";
import MetricGrid from "../../components/dashboard/MetricGrid";
import RankCard from "../../components/dashboard/RankCard";
import ReferralChip from "../../components/dashboard/ReferralChip";
import TeamPanel from "../../components/dashboard/TeamPanel";
import WithdrawalSummary from "../../components/dashboard/WithdrawalSummary";
import DataTable from "../../components/tables/DataTable";
import Reveal from "../../components/ui/Reveal";
import StatusBadge from "../../components/ui/StatusBadge";
import { DemoLabel } from "../../components/ui/States";
import useDemoModel from "../../hooks/useDemoModel";
import { useDashboard } from "../../hooks/useDashboard";
import useIllustrativeWindow from "../../hooks/useIllustrativeWindow";
import { formatDate } from "../../lib/dates";
import { formatCents } from "../../lib/money";
import { evaluateRanks } from "../../lib/plan";
import usePageTitle from "../../lib/usePageTitle";

export default function Overview() {
  usePageTitle("Overview");
  const { model } = useDemoModel();
  const { displayName } = useDashboard();
  const clock = useIllustrativeWindow({ live: false });
  const name = displayName || model.member.displayName;
  const recent = model.transactions.slice(0, 5);
  const requested = model.transactions.find(
    (row) => row.category === "withdrawal" && row.status === "pending" && row.amountCents != null,
  );
  const ranks = evaluateRanks({
    selfStakeCents: model.activeStake?.amountCents ?? 0,
    directs: model.rankDirects,
    illustrativeDeadline: clock.deadline,
  });

  return (
    <div className="space-y-14">
      <Reveal as="section" className="grid items-end gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(18rem,0.75fr)]">
        <div>
          <p className="text-[0.68rem] font-semibold tracking-[0.22em] text-electric uppercase">Member overview</p>
          <h2 className="font-display mt-3 text-4xl leading-[1.05] text-snow sm:text-5xl">
            Welcome back, <span className="italic">{name}</span>
          </h2>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-mist">
            Your progress, rewards, and network — all in one place.
          </p>
        </div>
        <ReferralChip code={model.member.referralId} />
      </Reveal>

      <Reveal delay={0.05}>
        <FinancialSummary snapshot={model.snapshot} />
      </Reveal>

      <Reveal as="section" delay={0.04}>
        <DashHeading
          kicker="Statistics"
          title="Financial statistics"
          lede="Sample records from this preview. Lines marked “not calculated” are waiting on a confirmed rule."
          action={<DemoLabel />}
        />
        <MetricGrid model={model} />
      </Reveal>

      <Reveal delay={0.04}>
        <AccountPanel model={model} />
      </Reveal>

      <Reveal as="section" className="space-y-5" delay={0.04}>
        <DashHeading
          kicker="Rewards"
          title="Earnings"
          lede="The chart is a simulated curve. The breakdown underneath uses sample ledger rows where a rule can be applied."
        />
        <EarningsChart series={model.earnings} />
        <BreakdownChart rows={model.breakdown} />
      </Reveal>

      <Reveal as="section" delay={0.04}>
        <DashHeading
          kicker="Progress"
          title="Rank and achievements"
          lede={<RankWindowNote />}
          action={
            <Link to="/dashboard/ranks" className="text-sm font-medium text-gold">
              Rank details
            </Link>
          }
        />
        <div className="grid gap-4 xl:grid-cols-3">
          {ranks.map((rank) => (
            <RankCard key={rank.id} rank={rank} />
          ))}
        </div>
      </Reveal>

      <Reveal delay={0.04}>
        <TeamPanel model={model} />
      </Reveal>

      <Reveal as="section" delay={0.04}>
        <DashHeading
          kicker="Ledger"
          title="Transactions"
          lede="Recent sample rows. Statuses describe this preview and do not mean funds moved."
          action={
            <Link to="/dashboard/transactions" className="text-sm font-medium text-gold">
              View all transactions
            </Link>
          }
        />
        <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(18rem,0.7fr)]">
          <div className="dash-card overflow-hidden">
            <DataTable
              caption="Recent transactions"
              rows={recent}
              emptyTitle="No recent activity"
              emptyBody="This preview view has no sample transactions."
              columns={[
                {
                  key: "id",
                  header: "Transaction ID",
                  cell: (row) => (
                    <Link to={`/dashboard/transactions?q=${encodeURIComponent(row.id)}`} className="font-medium text-snow hover:text-gold">
                      {row.id}
                    </Link>
                  ),
                },
                { key: "type", header: "Type", cell: (row) => row.label },
                { key: "date", header: "Date", cell: (row) => formatDate(row.at) },
                { key: "amount", header: "Amount", cell: (row) => <span className="num">{formatCents(row.amountCents)}</span> },
                { key: "status", header: "Status", cell: (row) => <StatusBadge status={row.status} /> },
              ]}
            />
          </div>
          <WithdrawalSummary availableCents={model.snapshot.availableCents} requestedCents={requested?.amountCents ?? null} />
        </div>
      </Reveal>
    </div>
  );
}
