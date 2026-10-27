import { useReducedMotion } from "motion/react";
import { lazy, Suspense } from "react";
import { rewardCategories } from "../../data/planConfig";
import { formatCents } from "../../lib/money";
import { sumCents } from "../../lib/plan";
import BreakdownRows from "../dashboard/BreakdownRows";
import { Skeleton } from "../ui/States";

const RewardDonut = lazy(() => import("./RewardDonut"));

const rewardColors = {
  direct_reward: "#39D98A",
  updown_reward: "#27B5A0",
  daily_income: "#83F7B5",
  rank_reward: "#F6C76A",
};

export default function RewardMix({ ledger }) {
  const reduce = useReducedMotion();
  const data = rewardCategories.map((category) => ({
    id: category.id,
    label: category.label,
    cents: sumCents(ledger.filter((row) => row.category === category.id && row.status === "completed")),
  }));
  const total = sumCents(data.map((item) => ({ amountCents: item.cents })));

  return (
    <div className="grid items-center gap-6 sm:grid-cols-[180px_1fr]">
      <div className="relative mx-auto h-44 w-44" role="img" aria-label={`Reward mix, ${formatCents(total)} in completed rewards.`}>
        <Suspense fallback={<Skeleton className="h-full w-full rounded-full" />}>
          <RewardDonut data={data} total={total} colors={rewardColors} animate={!reduce} />
        </Suspense>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xs text-mist">Total</span>
          <span className="font-display-num text-lg font-semibold">{formatCents(total)}</span>
        </div>
      </div>
      <BreakdownRows rows={data.map((item) => ({ label: item.label, cents: item.cents, swatch: rewardColors[item.id] }))} />
    </div>
  );
}
