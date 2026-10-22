import { ArrowDownToLine, Sparkles } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { Link } from "react-router";
import MoneyFigure from "../ui/MoneyFigure";
import { DemoLabel } from "../ui/States";

const supporting = [
  ["total-rewards", "Total rewards earned", "totalRewardsCents", "Sample direct rewards only"],
  ["active-stake", "Active stake", "currentStakeCents", "Current sample stake"],
  ["withdrawals", "Total withdrawals", "totalWithdrawalsCents", "Completed sample rows"],
];

export default function FinancialSummary({ snapshot }) {
  const reduce = useReducedMotion();

  return (
    <section className="ledger-hero p-6 sm:p-8 lg:p-10" aria-labelledby="portfolio-snapshot">
      <div className="relative z-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p id="portfolio-snapshot" className="text-[0.68rem] font-semibold tracking-[0.2em] text-gold uppercase">
            Portfolio snapshot
          </p>
          <DemoLabel />
        </div>
        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-end">
          <div>
            <p className="text-sm text-white/65">Available balance</p>
            <MoneyFigure
              cents={snapshot.availableCents}
              className="mt-2 block text-5xl font-semibold tracking-[-0.055em] text-gold sm:text-6xl"
            />
            <p className="mt-3 max-w-md text-sm leading-relaxed text-white/60">
              Taken from completed direct-reward rows in this preview. This is not money you can withdraw.
            </p>
          </div>
          <dl className="grid gap-5 sm:grid-cols-3">
            {supporting.map(([key, label, field, note]) => (
              <div key={key} className="border-t border-white/10 pt-3 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-4">
                <dt className="text-xs text-white/55">{label}</dt>
                <dd className="mt-1 text-xl font-semibold text-snow">
                  <MoneyFigure cents={snapshot[field]} />
                </dd>
                <dd className="mt-1 text-[0.7rem] leading-relaxed text-white/45">{note}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <motion.div className="inline-flex" whileHover={reduce ? undefined : { y: -1 }} whileTap={reduce ? undefined : { scale: 0.98 }}>
            <Link to="/dashboard/withdrawals" className="btn btn-primary">
              <ArrowDownToLine size={16} aria-hidden="true" />
              Withdraw
            </Link>
          </motion.div>
          <motion.div className="inline-flex" whileHover={reduce ? undefined : { y: -1 }} whileTap={reduce ? undefined : { scale: 0.98 }}>
            <Link to="/dashboard/rewards" className="btn btn-secondary">
              <Sparkles size={16} aria-hidden="true" />
              View Rewards
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
