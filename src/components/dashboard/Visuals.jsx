import { motion, useReducedMotion } from "motion/react";
import { planConfig } from "../../data/planConfig";
import cx from "../../lib/cx";
import { ease } from "../../lib/motion";

/** Orbital emblem for the overview hero. Pure CSS 3D; motion stops under reduced-motion. */
export function HeroOrbital({ className = "" }) {
  return (
    <div className={cx("orbital pointer-events-none select-none", className)} aria-hidden="true">
      <span className="orbital-ring r1" />
      <span className="orbital-ring r2" />
      <span className="orbital-ring r3" />
      <span className="orbital-core" />
    </div>
  );
}

/** Stacked coins whose height follows the stake amount within the plan range. */
export function CoinStack({ cents, className = "" }) {
  const reduce = useReducedMotion();
  const { minCents, maxCents } = planConfig.stake;
  const share = cents == null ? 0 : Math.max(0, Math.min(1, (cents - minCents) / (maxCents - minCents)));
  const count = cents == null ? 1 : 2 + Math.round(share * 10);

  return (
    <div className={cx("coin-stage relative flex items-center justify-center", className)} aria-hidden="true">
      <div className="absolute inset-[18%] rounded-full bg-accent/10 blur-2xl" />
      <div className="coin-stack h-[58%] w-[58%]">
        {Array.from({ length: 12 }, (_, index) => (
          <motion.span
            key={index}
            className="coin"
            initial={false}
            animate={{ z: index < count ? index * 7 : 0, opacity: index < count ? 1 - index * 0.035 : 0 }}
            transition={{ duration: reduce ? 0 : 0.5, ease, delay: reduce ? 0 : index * 0.02 }}
          />
        ))}
      </div>
    </div>
  );
}
