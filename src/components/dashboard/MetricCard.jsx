import { ArrowUpRight } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { Link } from "react-router";
import cx from "../../lib/cx";
import { ease } from "../../lib/motion";
import CountUp from "../ui/CountUp";
import MoneyFigure from "../ui/MoneyFigure";

const toneIcon = {
  default: "bg-accent/10 text-accent",
  teal: "bg-teal/12 text-teal",
  warning: "bg-warning/10 text-warning",
  mint: "bg-mint/10 text-mint",
};

export default function MetricCard({ icon: Icon, label, cents, count, text, hint, tone = "default", to, index = 0 }) {
  const reduce = useReducedMotion();
  const value = cents !== undefined ? <MoneyFigure cents={cents} /> : count !== undefined ? <CountUp value={count} /> : text;
  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <span className={cx("flex h-9 w-9 items-center justify-center rounded-xl border sm:h-10 sm:w-10 border-white/[0.06]", toneIcon[tone])}>
          <Icon size={18} aria-hidden="true" />
        </span>
        {to ? <ArrowUpRight size={16} className="text-mist/60 transition-colors group-hover:text-mint" aria-hidden="true" /> : null}
      </div>
      <p className="mt-3.5 text-xs font-medium text-mist sm:mt-5 sm:text-[0.8125rem]">{label}</p>
      <p className="font-display-num mt-1 text-[clamp(1.05rem,5.2vw,1.5rem)] leading-tight font-semibold [overflow-wrap:anywhere] text-snow sm:text-[1.65rem]">{value}</p>
      {hint ? <p className="mt-1.5 text-[0.7rem] leading-snug text-mist/90 sm:text-xs sm:leading-relaxed">{hint}</p> : null}
    </>
  );

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5, ease, delay: reduce ? 0 : index * 0.05 }}
      className="h-full"
    >
      {to ? (
        <Link to={to} className="dash-card dash-hover group flex h-full flex-col p-4 sm:p-5">
          {body}
        </Link>
      ) : (
        <div className="dash-card dash-hover flex h-full flex-col p-4 sm:p-5">{body}</div>
      )}
    </motion.div>
  );
}
