import { motion, useReducedMotion } from "motion/react";
import { ease } from "../../lib/motion";

export default function SuccessMark({ tone = "success", size = 72 }) {
  const reduce = useReducedMotion();
  const color = tone === "pending" ? "#F6C76A" : "#39D98A";
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 72 72"
      aria-hidden="true"
      initial={reduce ? false : { scale: 0.6, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.45, ease }}
      className="drop-shadow-[0_0_24px_rgba(57,217,138,0.35)]"
    >
      <circle cx="36" cy="36" r="34" fill={`${color}14`} stroke={`${color}55`} />
      {!reduce ? (
        <motion.circle
          cx="36"
          cy="36"
          r="34"
          fill="none"
          stroke={color}
          strokeOpacity="0.4"
          initial={{ scale: 1, opacity: 0.8 }}
          animate={{ scale: 1.35, opacity: 0 }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
          style={{ transformOrigin: "36px 36px" }}
        />
      ) : null}
      {tone === "pending" ? (
        <motion.path
          d="M36 20v17l10 6"
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={reduce ? false : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, ease, delay: 0.2 }}
        />
      ) : (
        <motion.path
          d="M23 37.5 32 46l17-19"
          fill="none"
          stroke={color}
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={reduce ? false : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, ease, delay: 0.2 }}
        />
      )}
    </motion.svg>
  );
}
