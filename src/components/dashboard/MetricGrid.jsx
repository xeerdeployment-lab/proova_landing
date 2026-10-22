import {
  Activity,
  ArrowDownToLine,
  ArrowUpDown,
  Award,
  Boxes,
  CircleDollarSign,
  Layers,
  Sparkles,
  UserPlus,
  Users,
  Wallet,
  Waypoints,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { ease } from "../../lib/motion";
import CountUp from "../ui/CountUp";
import MoneyFigure from "../ui/MoneyFigure";
import StatCard from "../ui/StatCard";

const rise = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease } },
};

function figured(row) {
  if (!row?.calculated || row.amountCents == null) return null;
  return row.amountCents;
}

export default function MetricGrid({ model }) {
  const reduce = useReducedMotion();
  const { snapshot, stakes, breakdown } = model;
  const direct = figured(breakdown.find((row) => row.key === "direct"));
  const totalStaked = stakes.length ? stakes.reduce((total, stake) => total + stake.amountCents, 0) : null;
  const activeStakes = stakes.filter((stake) => stake.status === "active").length;

  const cards = [
    {
      key: "staked",
      icon: Layers,
      label: "Total staked",
      value: <MoneyFigure cents={totalStaked} />,
      detail: "Sum of sample stake records, including closed ones.",
      emphasis: "featured",
      className: "md:col-span-1 xl:col-span-6",
    },
    {
      key: "income",
      icon: CircleDollarSign,
      label: "Total income",
      value: direct == null ? "Not calculated" : <MoneyFigure cents={direct} />,
      quiet: direct == null,
      detail: "Sample direct rewards only. Other categories stay out until their rules are confirmed.",
      emphasis: "featured",
      className: "md:col-span-1 xl:col-span-6",
    },
    {
      key: "direct",
      icon: Sparkles,
      label: "Direct rewards",
      value: direct == null ? "Not calculated" : <MoneyFigure cents={direct} />,
      quiet: direct == null,
      detail: "10% of the sample direct stakes in the preview ledger.",
      className: "xl:col-span-3",
    },
    {
      key: "level",
      icon: Waypoints,
      label: "Level rewards",
      value: "Not calculated",
      quiet: true,
      detail: "No earning event is confirmed, so this stays blank.",
      className: "xl:col-span-3",
    },
    {
      key: "updown",
      icon: ArrowUpDown,
      label: "Up/Down rewards",
      value: "Not calculated",
      quiet: true,
      detail: "The 40% allocation scope is unconfirmed.",
      className: "xl:col-span-3",
    },
    {
      key: "rank",
      icon: Award,
      label: "Rank rewards",
      value: "Not calculated",
      quiet: true,
      detail: "No rank is confirmed, so nothing is distributed.",
      iconTone: "gold",
      className: "xl:col-span-3",
    },
    {
      key: "packages",
      icon: Boxes,
      label: "Total stakes",
      value: <CountUp value={stakes.length} />,
      detail: "Stake records in this preview, active and closed.",
      className: "xl:col-span-3",
    },
    {
      key: "active",
      icon: Activity,
      label: "Active stakes",
      value: <CountUp value={activeStakes} />,
      detail: "Records marked active. One active stake is stated per account.",
      className: "xl:col-span-3",
    },
    {
      key: "directs",
      icon: UserPlus,
      label: "Direct referrals",
      value: <CountUp value={snapshot.directReferrals} />,
      detail: "Sample records. They are not confirmed joins.",
      className: "xl:col-span-3",
    },
    {
      key: "team",
      icon: Users,
      label: "Total team members",
      value: <CountUp value={snapshot.teamMembers} />,
      detail: "Unique upline and downline sample IDs.",
      className: "xl:col-span-3",
    },
    {
      key: "withdrawn",
      icon: ArrowDownToLine,
      label: "Total withdrawn",
      value: <MoneyFigure cents={snapshot.totalWithdrawalsCents} />,
      detail: "Completed withdrawal rows only. Pending requests are excluded.",
      className: "xl:col-span-6",
    },
    {
      key: "available",
      icon: Wallet,
      label: "Available balance",
      value: <MoneyFigure cents={snapshot.availableCents} />,
      detail: "Completed direct rewards in the sample ledger. Not withdrawable funds.",
      emphasis: "gold",
      className: "xl:col-span-6",
    },
  ];

  return (
    <motion.div
      className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-12"
      variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.05 } } }}
      initial={reduce ? false : "hidden"}
      whileInView="visible"
      viewport={{ once: true, amount: 0.12 }}
    >
      {cards.map((card) => (
        <motion.div key={card.key} variants={reduce ? undefined : rise} className={card.className}>
          <StatCard
            icon={card.icon}
            label={card.label}
            value={card.value}
            detail={card.detail}
            emphasis={card.emphasis}
            iconTone={card.iconTone}
            quiet={card.quiet}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}
