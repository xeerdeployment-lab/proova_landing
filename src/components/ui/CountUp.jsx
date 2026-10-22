import { useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

export default function CountUp({ value, className = "" }) {
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (value == null || reduce) return undefined;
    let frame = 0;
    const started = performance.now();
    const tick = (now) => {
      const progress = Math.min(1, (now - started) / 700);
      const eased = 1 - (1 - progress) ** 3;
      setShown(Math.round(value * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, reduce]);

  const display = value == null || reduce ? value : shown;
  return <span className={`num ${className}`}>{display ?? "—"}</span>;
}
