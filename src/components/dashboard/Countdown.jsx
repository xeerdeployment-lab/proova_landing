import { useEffect, useRef } from "react";
import { useServerNow } from "../../hooks/useAccount";
import { formatCountdown } from "../../lib/format";

/**
 * Ticks toward a server timestamp. When it reaches zero it asks the caller to refetch, because only
 * the server decides whether the window is actually open.
 */
export default function Countdown({ to, onElapsed, className = "" }) {
  const now = useServerNow();
  const target = to == null ? null : new Date(to).getTime();
  const remaining = target == null ? null : Math.max(0, target - now);
  const fired = useRef(false);

  useEffect(() => {
    if (remaining === 0 && !fired.current) {
      fired.current = true;
      onElapsed?.();
    }
    if (remaining > 0) fired.current = false;
  }, [remaining, onElapsed]);

  return (
    <time className={`num ${className}`} dateTime={to ?? undefined} aria-live="off">
      {formatCountdown(remaining)}
    </time>
  );
}
