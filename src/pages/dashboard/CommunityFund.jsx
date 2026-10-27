import { HandHeart } from "lucide-react";
import BreakdownRows from "../../components/dashboard/BreakdownRows";
import DashHeading from "../../components/dashboard/DashHeading";
import Ledger from "../../components/tables/Ledger";
import MoneyFigure from "../../components/ui/MoneyFigure";
import Reveal from "../../components/ui/Reveal";
import { planConfig, transactionCategories } from "../../data/planConfig";
import { useAccount } from "../../hooks/useAccount";
import { formatBps, formatCents } from "../../lib/money";
import { withdrawalBreakdown } from "../../lib/plan";
import usePageTitle from "../../lib/usePageTitle";

const exampleCents = 10_000;

export default function CommunityFund() {
  usePageTitle("Community Fund");
  const account = useAccount();
  const { communityFund } = account;
  const example = withdrawalBreakdown(exampleCents);
  const rate = formatBps(planConfig.withdrawal.deductionSplit.communityFundBps);

  return (
    <div className="space-y-8">
      <section className="hero-surface grid gap-6 p-6 sm:p-8 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <p className="kicker text-mint/80">Your contribution</p>
          <MoneyFigure cents={communityFund.contributedCents} className="font-display-num mt-2 block text-4xl font-semibold" />
          <p className="mt-2 max-w-lg text-sm leading-relaxed text-mist">
            {rate} of every withdrawal deduction goes to the Axora community fund. This is the total allocated from your {communityFund.rows.length} withdrawal
            {communityFund.rows.length === 1 ? "" : "s"}.
          </p>
        </div>
        <span className="flex h-20 w-20 items-center justify-center rounded-3xl border border-accent/25 bg-accent/10 text-mint shadow-[0_0_50px_rgba(57,217,138,0.2)]" aria-hidden="true">
          <HandHeart size={34} />
        </span>
      </section>

      <Reveal>
        <div className="grid gap-5 lg:grid-cols-2">
          <section className="dash-card p-5 sm:p-6">
            <p className="kicker">How it is funded</p>
            <h2 className="mt-1 text-lg font-semibold tracking-[-0.02em]">{rate} of the withdrawal deduction</h2>
            <p className="mt-2 text-sm leading-relaxed text-mist">
              The community fund is a slice of the {formatBps(planConfig.withdrawal.deductionBps)} deduction, not an extra charge on top of it.
            </p>
            <p className="kicker mt-5 mb-3">Example · {formatCents(exampleCents)} withdrawal</p>
            <BreakdownRows
              rows={[
                { label: "Withdrawal", cents: example.grossCents },
                { label: `Deduction (${example.labels.deduction})`, cents: example.deductionCents, indent: true },
                { label: `Community fund (${example.labels.community} of deduction)`, cents: example.communityCents, indent: true, tone: "accent" },
              ]}
            />
          </section>
          <section className="dash-card p-5 text-sm leading-relaxed sm:p-6">
            <p className="kicker">Transparency</p>
            <h2 className="mt-1 text-lg font-semibold tracking-[-0.02em]">Every allocation is on your ledger</h2>
            <p className="mt-2 text-mist">
              Each withdrawal records a community fund allocation linked to it by reference, so you can trace every cent. Platform-wide fund totals and
              disbursements will appear here once the backend publishes them.
            </p>
          </section>
        </div>
      </Reveal>

      <Reveal>
        <section>
          <DashHeading kicker="History" title="Community fund allocations" />
          <Ledger
            rows={communityFund.rows}
            categories={transactionCategories.filter((item) => item.id === "community_fund")}
            filename="axora-community-fund.csv"
            pageSize={6}
            emptyTitle="No allocations yet"
            emptyBody="Allocations are recorded with each withdrawal."
          />
        </section>
      </Reveal>
    </div>
  );
}
