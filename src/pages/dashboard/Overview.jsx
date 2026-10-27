import { ArrowDownToLine, ArrowRight, Award, CalendarClock, Coins, Gauge, RefreshCcw, Sparkles, UserPlus, Users, Wallet } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { Link } from "react-router";
import EarningsChart from "../../components/charts/EarningsChart";
import Countdown from "../../components/dashboard/Countdown";
import MetricCard from "../../components/dashboard/MetricCard";
import { HeroOrbital } from "../../components/dashboard/Visuals";
import Ledger from "../../components/tables/Ledger";
import MoneyFigure from "../../components/ui/MoneyFigure";
import ProgressBar from "../../components/ui/ProgressBar";
import Reveal from "../../components/ui/Reveal";
import { useAccount } from "../../hooks/useAccount";
import { useDashboard } from "../../hooks/useDashboard";
import { formatCents } from "../../lib/money";
import { greeting } from "../../lib/format";
import { ease } from "../../lib/motion";
import usePageTitle from "../../lib/usePageTitle";

/** The single most useful next step, in priority order. */
function nextAction(account) {
  const { stake, daily, capability, balances, withdrawal } = account;
  if (!stake.active && !stake.pending) return { title: "Make your first stake", body: "Stake from $30 to start earning rewards.", to: "/dashboard/stake", cta: "Stake now", icon: Coins };
  if (stake.pending) return { title: "Stake awaiting confirmation", body: "We'll update this automatically once it's confirmed.", to: "/dashboard/transactions", cta: "Track status", icon: Coins };
  if (stake.restake.required) return { title: "Restake to keep earning", body: `Your ${capability.multiple}x reward capability is reached.`, to: "/dashboard/restake", cta: "Restake", icon: RefreshCcw };
  if (daily.canClaim) return { title: `Claim ${formatCents(daily.claimableCents)} daily income`, body: "Your 24-hour claim window is open.", to: "/dashboard/daily-income", cta: "Claim now", icon: CalendarClock };
  if (!withdrawal.blocker && balances.availableCents > 0) return { title: "Withdraw your balance", body: `${formatCents(balances.availableCents)} is available.`, to: "/dashboard/withdrawals", cta: "Withdraw", icon: ArrowDownToLine };
  return { title: "Next daily claim", body: daily.nextClaimAt ? null : daily.blocker, countdown: daily.nextClaimAt, to: "/dashboard/daily-income", cta: "View income", icon: CalendarClock };
}

function Hero({ account }) {
  const reduce = useReducedMotion();
  const { stake, upDown, ranks, balances, member } = account;
  const rankName = ranks.list.find((rank) => rank.id === ranks.current)?.name;
  const firstName = member.displayName.split(" ")[0];

  return (
    <section className="hero-surface p-5 sm:p-8 lg:p-10" aria-labelledby="overview-greeting">
      <div className="dot-grid pointer-events-none absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_at_top_right,#000_20%,transparent_70%)]" aria-hidden="true" />
      <HeroOrbital className="absolute top-1/2 -right-16 hidden w-[22rem] -translate-y-1/2 opacity-90 md:block lg:right-0 lg:w-[24rem]" />
      <div className="relative max-w-xl">
        <motion.p className="kicker text-mint/80" initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
          {greeting()}
        </motion.p>
        <motion.h2
          id="overview-greeting"
          className="mt-2 text-3xl font-semibold tracking-[-0.03em] sm:text-4xl"
          initial={reduce ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }}
        >
          Welcome back, {firstName}
        </motion.h2>
        <p className="mt-3 text-sm leading-relaxed text-mist sm:text-base">
          {stake.active
            ? `Your ${formatCents(stake.active.amountCents)} stake is active in ${upDown.tier?.name ?? "—"}${rankName ? ` · ${rankName} rank` : ""}.`
            : stake.pending
              ? `Your ${formatCents(stake.pending.amountCents)} stake is awaiting confirmation.`
              : "You don't have an active stake yet."}
        </p>
        <div className="mt-7">
          <p className="text-xs text-mist">Available balance</p>
          <MoneyFigure cents={balances.availableCents} className="font-display-num mt-1 block text-4xl font-semibold text-snow sm:text-5xl" />
          {balances.pendingRewardsCents ? <p className="mt-1 text-xs text-warning">+{formatCents(balances.pendingRewardsCents)} pending confirmation</p> : null}
        </div>
        <div className="mt-7 flex flex-wrap gap-2 *:max-sm:grow">
          {stake.restake.required ? (
            <Link to="/dashboard/restake" className="btn btn-primary">
              <RefreshCcw size={16} aria-hidden="true" />
              Restake
            </Link>
          ) : stake.canStake ? (
            <Link to="/dashboard/stake" className="btn btn-primary">
              <Coins size={16} aria-hidden="true" />
              Stake now
            </Link>
          ) : null}
          {account.daily.canClaim ? (
            <Link to="/dashboard/daily-income" className={stake.restake.required || stake.canStake ? "btn btn-secondary" : "btn btn-primary"}>
              <CalendarClock size={16} aria-hidden="true" />
              Claim daily income
            </Link>
          ) : null}
          <Link to="/dashboard/withdrawals" className="btn btn-secondary">
            <ArrowDownToLine size={16} aria-hidden="true" />
            Withdraw
          </Link>
        </div>
      </div>
    </section>
  );
}

function PortfolioCard({ account }) {
  const { refresh } = useDashboard();
  const { stake, capability } = account;
  const action = nextAction(account);
  const ActionIcon = action.icon;
  const tone = capability.reached ? "danger" : capability.progress >= 0.85 ? "warning" : undefined;

  return (
    <section className="dash-card flex h-full flex-col p-5 sm:p-6" aria-labelledby="portfolio-title">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="kicker">Portfolio</p>
          <h2 id="portfolio-title" className="mt-1 text-lg font-semibold tracking-[-0.02em]">
            Stake & capability
          </h2>
        </div>
        <span className="chip">{capability.multiple}x cap</span>
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-4">
        <div>
          <dt className="text-xs text-mist">Current stake</dt>
          <dd className="font-display-num mt-1 text-2xl font-semibold">{formatCents(stake.active?.amountCents ?? 0)}</dd>
        </div>
        <div>
          <dt className="text-xs text-mist">Eligible reward limit</dt>
          <dd className="font-display-num mt-1 text-2xl font-semibold">{formatCents(capability.maxCents)}</dd>
        </div>
      </dl>

      <div className="mt-6">
        <div className="mb-2 flex justify-between gap-3 text-sm">
          <span className="text-mist">Rewards against cap</span>
          <span className="num">
            {formatCents(capability.countedCents)} <span className="text-mist">/ {formatCents(capability.maxCents)}</span>
          </span>
        </div>
        <ProgressBar value={capability.progress} tone={tone} size="lg" label="Reward capability used" showLabel={false} />
        <p className="mt-2 text-xs text-mist">{formatCents(capability.remainingCents)} capability remaining</p>
      </div>

      <div className="mt-auto pt-6">
        <div className="flex items-start gap-3 rounded-2xl border border-accent/15 bg-accent/[0.04] p-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent/12 text-accent">
            <ActionIcon size={17} aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-mist">Next eligible action</p>
            <p className="mt-0.5 text-sm font-semibold text-snow">{action.title}</p>
            {action.countdown ? (
              <p className="mt-0.5 text-xs text-mist">
                Opens in <Countdown to={action.countdown} onElapsed={refresh} className="text-snow" />
              </p>
            ) : action.body ? (
              <p className="mt-0.5 text-xs text-mist">{action.body}</p>
            ) : null}
          </div>
        </div>
        <Link to={action.to} className="btn btn-primary mt-3 w-full">
          {action.cta}
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}

export default function Overview() {
  usePageTitle("Overview");
  const account = useAccount();
  const { stake, balances, daily, referrals, team, ranks, capability } = account;
  const rankName = ranks.list.find((rank) => rank.id === ranks.current)?.name;

  const metrics = [
    { icon: Coins, label: "Active stake", cents: stake.active?.amountCents ?? 0, hint: stake.active ? account.upDown.tier?.name : "No active stake", to: "/dashboard/stake" },
    { icon: Wallet, label: "Available to withdraw", cents: balances.availableCents, hint: balances.pendingWithdrawalCents ? `${formatCents(balances.pendingWithdrawalCents)} processing` : "Settled balance", to: "/dashboard/withdrawals", tone: "teal" },
    { icon: Sparkles, label: "Total earned", cents: balances.totalEarnedCents, hint: "All completed rewards", to: "/dashboard/rewards", tone: "mint" },
    { icon: CalendarClock, label: "Claimable today", cents: daily.canClaim ? daily.claimableCents : 0, hint: daily.canClaim ? "Ready to claim" : "Claim window closed", to: "/dashboard/daily-income" },
    { icon: UserPlus, label: "Direct referrals", count: referrals.total, hint: `${referrals.active} active`, to: "/dashboard/referrals", tone: "teal" },
    { icon: Users, label: "Active team", count: team.activeMembers, hint: `${team.totalMembers} members across 10 levels`, to: "/dashboard/team", tone: "mint" },
    { icon: Award, label: "Current rank", text: rankName ?? "None yet", hint: ranks.next ? `Working toward ${ranks.list.find((r) => r.id === ranks.next)?.name}` : "Rank Rewards", to: "/dashboard/ranks", tone: "warning" },
    { icon: Gauge, label: "Remaining capability", cents: capability.remainingCents, hint: `${capability.multiple}x of ${formatCents(capability.stakeCents)}`, to: "/dashboard/restake" },
  ];

  return (
    <div className="space-y-6">
      <Hero account={account} />

      <section aria-label="Account summary" className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {metrics.map((metric, index) => (
          <MetricCard key={metric.label} index={index} {...metric} />
        ))}
      </section>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)]">
        <Reveal>
          <PortfolioCard account={account} />
        </Reveal>
        <Reveal delay={0.05}>
          <EarningsChart ledger={account.ledger} now={account.serverTime} />
        </Reveal>
      </div>

      <Reveal>
        <section aria-labelledby="recent-activity">
          <div className="mb-3 flex items-end justify-between gap-3">
            <div>
              <p className="kicker">Activity</p>
              <h2 id="recent-activity" className="mt-1 text-lg font-semibold tracking-[-0.02em]">
                Recent transactions
              </h2>
            </div>
            <Link to="/dashboard/transactions" className="btn btn-ghost btn-sm text-mint">
              View all
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>
          <Ledger rows={account.ledger.filter((row) => row.direction !== "allocation").slice(0, 6)} compact pageSize={6} caption="Recent transactions" />
        </section>
      </Reveal>
    </div>
  );
}
