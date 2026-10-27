import { useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

/**
 * Counts up once, the first time the element scrolls into view. Afterwards the real value is shown
 * directly, so a balance only ever moves when the data itself changes.
 */
export function useCountUp(target, { duration = 900 } = {}) {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const [shown, setShown] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (target == null || reduce || done || !inView) return undefined;
    let frame = 0;
    let started = null;
    const tick = (now) => {
      started ??= now;
      const progress = Math.min(1, Math.max(0, (now - started) / duration));
      setShown(Math.round(target * (1 - (1 - progress) ** 3)));
      if (progress < 1) frame = requestAnimationFrame(tick);
      else setDone(true);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, reduce, inView, done, duration]);

  return [ref, reduce || done || target == null ? target : shown];
}
