import { CalendarClock, Clock, Network, Sparkles, UserPlus } from "lucide-react";
import RewardMix from "../../components/charts/RewardMix";
import CapabilityCard from "../../components/dashboard/CapabilityCard";
import DashHeading from "../../components/dashboard/DashHeading";
import MetricCard from "../../components/dashboard/MetricCard";
import UpDownMap from "../../components/dashboard/UpDownMap";
import Ledger from "../../components/tables/Ledger";
import Reveal from "../../components/ui/Reveal";
import RuleNote from "../../components/ui/RuleNote";
import { planConfig, rewardCategories } from "../../data/planConfig";
import { useAccount } from "../../hooks/useAccount";
import { formatCents } from "../../lib/money";
import usePageTitle from "../../lib/usePageTitle";

export default function Rewards() {
  usePageTitle("My Rewards");
  const account = useAccount();
  const { balances, upDown, referrals, daily, stake } = account;
  const rewardRows = account.ledger.filter((row) => rewardCategories.some((item) => item.id === row.category));

  return (
    <div className="space-y-8">
      <section className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4" aria-label="Reward totals">
        <MetricCard index={0} icon={Sparkles} label="Total earned" cents={balances.totalEarnedCents} hint="Completed rewards" tone="mint" />
        <MetricCard index={1} icon={Clock} label="Pending" cents={balances.pendingRewardsCents} hint="Awaiting confirmation" tone="warning" />
        <MetricCard index={2} icon={UserPlus} label="Direct rewards" cents={referrals.completedRewardsCents} hint={`${planConfig.directReward.rateBps / 100}% of each referred stake`} to="/dashboard/referrals" />
        <MetricCard index={3} icon={CalendarClock} label="Daily income claimed" cents={daily.claimedTotalCents} hint="Across 10 levels" to="/dashboard/daily-income" tone="teal" />
      </section>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <Reveal>
          <section className="dash-card h-full p-5 sm:p-6" aria-labelledby="mix-title">
            <p className="kicker">Breakdown</p>
            <h2 id="mix-title" className="mt-1 mb-6 text-lg font-semibold tracking-[-0.02em]">
              Rewards by category
            </h2>
            <RewardMix ledger={account.ledger} />
            <p className="mt-6 text-xs leading-relaxed text-mist">
              Counted toward your capability: {planConfig.capability.countedCategories.map((id) => rewardCategories.find((item) => item.id === id)?.label).join(", ")}.
            </p>
          </section>
        </Reveal>
        <Reveal delay={0.05}>
          <CapabilityCard account={account} className="h-full" />
        </Reveal>
      </div>

      <Reveal>
        <section aria-labelledby="updown-title">
          <DashHeading
            kicker="Up/Down rewards"
            title={upDown.tier ? `${upDown.tier.name} distribution` : "Up/down distribution"}
            lede={
              stake.active
                ? `Your ${formatCents(stake.active.amountCents)} stake qualifies you for ${upDown.tier.upline} upline and ${upDown.tier.downline} downline positions.`
                : "Stake to unlock up/down positions. Preview each tier below."
            }
          />
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
            <div className="dash-card p-5 sm:p-6">
              <UpDownMap upDown={upDown} stakeCents={stake.active?.amountCents ?? 0} />
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="dash-card p-4">
                  <p className="text-xs text-mist">Allocation pool</p>
                  <p className="font-display-num mt-1 text-xl font-semibold">{formatCents(upDown.poolCents)}</p>
                  <p className="mt-1 text-xs text-mist">{planConfig.upDown.poolBps / 100}% of your stake, shared across positions</p>
                </div>
                <div className="dash-card border-accent/25 p-4">
                  <p className="text-xs text-mist">You received</p>
                  <p className="font-display-num mt-1 text-xl font-semibold text-mint">{formatCents(upDown.receivedCents)}</p>
                  <p className="mt-1 text-xs text-mist">Your settled individual payouts</p>
                </div>
              </div>
              <RuleNote title="Pool versus your payout">
                The 40% figure is the pool a stake funds, not what one person receives. How the pool is divided between positions — including open positions,
                ineligible members, rounding and unused allocation — is applied by the backend. Only settled payouts below are yours.
              </RuleNote>
              <div className="dash-card overflow-hidden">
                <p className="kicker border-b border-line px-5 py-3">Individual payouts</p>
                {upDown.payouts.length === 0 ? (
                  <p className="px-5 py-6 text-sm text-mist">No up/down payouts yet.</p>
                ) : (
                  <ul className="dash-scroll max-h-72 divide-y divide-white/5 overflow-y-auto">
                    {upDown.payouts.map((row) => (
                      <li key={row.id} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
                        <span className="min-w-0">
                          <span className="flex items-center gap-2 text-snow">
                            <Network size={13} className={row.meta?.side === "upline" ? "text-teal" : "text-accent"} aria-hidden="true" />
                            From {row.meta?.side ?? "network"} stake of {formatCents(row.allocations?.[0]?.cents)}
                          </span>
                          <span className="num block text-xs text-mist">{row.id}</span>
                        </span>
                        <span className="num shrink-0 font-medium text-mint">+{formatCents(row.amountCents)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section>
          <DashHeading kicker="History" title="Reward history" />
          <Ledger rows={rewardRows} categories={rewardCategories} filename="axora-rewards.csv" emptyTitle="No rewards yet" emptyBody="Rewards appear once your stake is active and your network grows." />
        </section>
      </Reveal>
    </div>
  );
}
