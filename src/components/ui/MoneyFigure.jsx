import { useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { formatCents } from "../../lib/money";

export default function MoneyFigure({ cents, className = "" }) {
  const reduce = useReducedMotion();
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (cents == null || reduce) return undefined;
    let frame = 0;
    const started = performance.now();
    const tick = (now) => {
      const progress = Math.min(1, (now - started) / 700);
      const eased = 1 - (1 - progress) ** 3;
      setValue(Math.round(cents * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [cents, reduce]);

  const shown = cents == null || reduce ? cents : value;
  return <span className={`num ${className}`}>{formatCents(shown)}</span>;
}
