import { useEffect, useState } from "react";
import { planConfig } from "../data/planConfig";

export default function useIllustrativeWindow({ live = true } = {}) {
  const [start] = useState(() => {
    const key = "proova.dash.illustrativeStake";
    try {
      const existing = sessionStorage.getItem(key);
      if (existing) return new Date(existing);
      const stamp = new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString();
      sessionStorage.setItem(key, stamp);
      return new Date(stamp);
    } catch {
      return new Date(Date.now() - 26 * 60 * 60 * 1000);
    }
  });
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    if (!live) return undefined;
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, [live]);

  const deadline = new Date(start.getTime() + planConfig.ranks[0].windowHours * 60 * 60 * 1000);
  return { start, deadline, remaining: Math.max(0, deadline.getTime() - now.getTime()) };
}
