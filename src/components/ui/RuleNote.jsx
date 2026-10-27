import { Info } from "lucide-react";
import cx from "../../lib/cx";

const toneClasses = {
  info: "border-teal/25 bg-teal/[0.06] text-teal",
  warning: "border-warning/25 bg-warning/[0.06] text-warning",
};

export default function RuleNote({ title, children, tone = "info", className = "" }) {
  return (
    <div className={cx("rounded-2xl border px-4 py-3", toneClasses[tone], className)}>
      {title ? (
        <p className="flex items-center gap-2 text-sm font-semibold">
          <Info size={15} aria-hidden="true" />
          {title}
        </p>
      ) : null}
      <div className={cx("text-sm leading-relaxed text-mist", title && "mt-1.5")}>{children}</div>
    </div>
  );
}
