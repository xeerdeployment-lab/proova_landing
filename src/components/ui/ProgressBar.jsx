import { motion, useInView, useReducedMotion } from "motion/react";
import { useRef } from "react";
import { ease } from "../../lib/motion";

export default function ProgressBar({ value = 0, label, tone, size = "md", showLabel = true }) {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const seen = useInView(ref, { once: true });
  const pct = Math.max(0, Math.min(100, value * 100));
  return (
    <div>
      {label && showLabel ? <p className="mb-2 text-xs text-mist">{label}</p> : null}
      <div
        ref={ref}
        className={`progress-track ${size === "lg" ? "h-2.5" : size === "sm" ? "h-1" : "h-1.5"}`}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(pct)}
        aria-label={label}
      >
        <motion.div
          className="progress-fill"
          data-tone={tone === "warning" || tone === "danger" ? tone : undefined}
          initial={reduce ? false : { width: 0 }}
          animate={{ width: reduce || seen ? `${pct}%` : 0 }}
          transition={{ duration: reduce ? 0 : 0.9, ease }}
        />
      </div>
    </div>
  );
}
