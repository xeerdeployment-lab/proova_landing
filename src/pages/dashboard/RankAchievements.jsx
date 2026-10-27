import { Award } from "lucide-react";
import BreakdownRows from "../../components/dashboard/BreakdownRows";
import DashHeading from "../../components/dashboard/DashHeading";
import RankCard from "../../components/dashboard/RankCard";
import Ledger from "../../components/tables/Ledger";
import Reveal from "../../components/ui/Reveal";
import RuleNote from "../../components/ui/RuleNote";
import { planConfig, transactionCategories } from "../../data/planConfig";
import { useAccount } from "../../hooks/useAccount";
import { formatBps, formatCents } from "../../lib/money";
import { sumCents, withdrawalBreakdown } from "../../lib/plan";
import usePageTitle from "../../lib/usePageTitle";

const exampleCents = 10_000;

export default function RankAchievements() {
  usePageTitle("Rank Rewards");
  const account = useAccount();
  const { ranks } = account;
  const current = ranks.list.find((rank) => rank.id === ranks.current);
  const next = ranks.list.find((rank) => rank.id === ranks.next);
  const example = withdrawalBreakdown(exampleCents);
  const earned = sumCents(ranks.history.filter((row) => row.status === "completed"));

  return (
    <div className="space-y-8">
      <section className="hero-surface flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div className="flex items-center gap-5">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-accent/30 bg-gradient-to-br from-accent/25 to-teal/10 text-mint shadow-[0_0_40px_rgba(57,217,138,0.25)]">
            <Award size={28} aria-hidden="true" />
          </span>
          <div>
            <p className="kicker text-mint/80">Current rank</p>
            <h2 className="mt-1 text-3xl font-semibold tracking-[-0.03em]">{current?.name ?? "No rank yet"}</h2>
            <p className="mt-1 text-sm text-mist">
              {next
                ? `Next: ${next.name} — ${next.checks.filter((check) => !check.met || check.pending).length} requirement(s) remaining.`
                : current
                  ? "Rank windows are complete."
                  : account.member.firstStakeAt
                    ? "Rank windows have closed."
                    : "Your 72-hour rank window opens with your first stake."}
            </p>
          </div>
        </div>
        <div className="dash-card-flat px-5 py-4 sm:text-right">
          <p className="text-xs text-mist">Rank rewards earned</p>
          <p className="font-display-num mt-1 text-2xl font-semibold text-mint">{formatCents(earned)}</p>
        </div>
      </section>

      <section aria-label="Ranks" className="grid gap-5 md:grid-cols-3">
        {ranks.list.map((rank, index) => (
          <RankCard key={rank.id} rank={rank} current={rank.id === ranks.current} index={index} />
        ))}
      </section>

      <Reveal>
        <div className="grid gap-5 lg:grid-cols-2">
          <section className="dash-card p-5 sm:p-6" aria-labelledby="rank-allocation-title">
            <p className="kicker">Allocation</p>
            <h2 id="rank-allocation-title" className="mt-1 text-lg font-semibold tracking-[-0.02em]">
              Where rank rewards come from
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-mist">
              Each withdrawal carries a {formatBps(planConfig.withdrawal.deductionBps)} deduction. The rank pools are separate slices of that deduction — they are not
              added on top of it, and they are distributed to qualified rank holders during withdrawal processing.
            </p>
            <p className="kicker mt-5 mb-3">Example · {formatCents(exampleCents)} withdrawal</p>
            <BreakdownRows
              rows={[
                { label: `Deduction (${example.labels.deduction})`, cents: example.deductionCents },
                ...example.rankPools.map((pool) => ({ label: `${pool.name} pool (${formatBps(pool.bps)} of deduction)`, cents: pool.cents, indent: true, swatch: "#F6C76A" })),
                { label: "Community fund", cents: example.communityCents, indent: true, tone: "muted" },
                { label: "Platform", cents: example.platformCents, indent: true, tone: "muted" },
              ]}
            />
          </section>
          <div className="space-y-4">
            <RuleNote tone={planConfig.withdrawal.confirmed ? "info" : "warning"} title={planConfig.withdrawal.confirmed ? "Calculation basis" : "Calculation basis — pending sign-off"}>
              The written plan doesn&apos;t say whether 4%, 3% and 3% apply to the gross withdrawal or to the deduction. Applying them to the gross would allocate
              more than the 10% deduction once the community fund is included, so they are applied to the deduction. This is set in one place in the plan
              configuration and is never double-counted.
            </RuleNote>
            <section className="dash-card p-5 text-sm sm:p-6">
              <p className="font-medium text-snow">How qualification works</p>
              <ul className="mt-2 space-y-1.5 leading-relaxed text-mist">
                <li>• Each rank needs your own stake and two direct referrals at the rank&apos;s minimum stake.</li>
                <li>• Everything must be completed within 72 hours of your first stake. The server&apos;s timestamps decide.</li>
                <li>• Your highest qualified rank is your current rank.</li>
              </ul>
            </section>
          </div>
        </div>
      </Reveal>

      <Reveal>
        <section>
          <DashHeading kicker="History" title="Rank reward history" />
          <Ledger
            rows={ranks.history}
            categories={transactionCategories.filter((item) => item.id === "rank_reward")}
            filename="axora-rank-rewards.csv"
            pageSize={6}
            emptyTitle="No rank rewards yet"
            emptyBody="Once you hold a rank, your share of each pool appears here as withdrawals are processed."
          />
        </section>
      </Reveal>
    </div>
  );
}
