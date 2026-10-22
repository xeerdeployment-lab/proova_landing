import { motion, useReducedMotion } from "motion/react";

export default function ProgressBar({ value = 0, label, tone = "violet" }) {
  const reduce = useReducedMotion();
  const width = `${Math.max(0, Math.min(100, value * 100))}%`;
  return (
    <div>
      {label ? <p className="mb-2 text-xs text-mist">{label}</p> : null}
      <div
        className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(value * 100)}
        aria-label={label}
      >
        <motion.div
          className={`h-full rounded-full ${tone === "gold" ? "bg-gradient-to-r from-[#c9b27a] to-gold" : "bg-gradient-to-r from-royal to-electric"}`}
          initial={reduce ? false : { width: 0 }}
          animate={{ width }}
          transition={{ duration: reduce ? 0 : 0.7, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  );
}
