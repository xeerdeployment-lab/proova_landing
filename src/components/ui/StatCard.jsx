import cx from "../../lib/cx";
import { DemoLabel } from "./States";

export default function StatCard({
  icon: Icon,
  label,
  value,
  detail,
  demo = false,
  emphasis = "default",
  iconTone = "violet",
  quiet = false,
  className = "",
}) {
  const featured = emphasis === "featured" || emphasis === "gold";
  const valueGold = emphasis === "gold";
  const iconGold = valueGold || iconTone === "gold";

  return (
    <article className={cx("dash-card dash-hover flex h-full flex-col p-5 sm:p-6", featured && "sm:p-7", className)}>
      <div className="flex items-start justify-between gap-3">
        <span
          className={cx(
            "flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08]",
            iconGold ? "bg-gold/10 text-gold" : "bg-royal/10 text-electric",
          )}
        >
          <Icon size={18} aria-hidden="true" />
        </span>
        {demo ? <DemoLabel /> : null}
      </div>
      <p
        className={cx(
          "mt-6",
          quiet ? "text-lg font-medium text-mist" : "num font-semibold tracking-[-0.045em]",
          !quiet && (featured ? "text-3xl sm:text-[2.35rem]" : "text-2xl"),
          !quiet && (valueGold ? "text-gold" : "text-snow"),
        )}
      >
        {value}
      </p>
      <p className="mt-2 text-sm font-medium text-snow">{label}</p>
      {detail ? <p className="mt-1.5 text-xs leading-relaxed text-mist">{detail}</p> : null}
    </article>
  );
}
