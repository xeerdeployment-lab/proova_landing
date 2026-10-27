import { LineChart as LineIcon } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { lazy, Suspense, useMemo, useState } from "react";
import { formatDay } from "../../lib/dates";
import { formatCents } from "../../lib/money";
import { ease } from "../../lib/motion";
import { earningsSeries, sumCents } from "../../lib/plan";
import { EmptyState, Skeleton } from "../ui/States";
import Tabs from "../ui/Tabs";

const ranges = [
  { id: "7", label: "7D", days: 7 },
  { id: "30", label: "30D", days: 30 },
  { id: "all", label: "All", days: null },
];

const EarningsPlot = lazy(() => import("./EarningsPlot"));

export default function EarningsChart({ ledger, now }) {
  const reduce = useReducedMotion();
  const [range, setRange] = useState("30");
  const days = ranges.find((item) => item.id === range).days;
  const rows = useMemo(() => earningsSeries(ledger, days, now), [ledger, days, now]);
  const total = sumCents(rows);
  const best = rows.reduce((top, row) => (row.amountCents > (top?.amountCents ?? 0) ? row : top), null);

  return (
    <section className="dash-card flex h-full flex-col p-5 sm:p-6" aria-labelledby="earnings-chart-title">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="kicker">Earnings</p>
          <h2 id="earnings-chart-title" className="mt-1 text-lg font-semibold tracking-[-0.02em]">
            Rewards credited
          </h2>
        </div>
        <Tabs label="Earnings range" value={range} onChange={setRange} tabs={ranges} />
      </div>

      {total === 0 ? (
        <EmptyState icon={LineIcon} title="No rewards in this range" body="Completed reward credits will chart here, day by day." />
      ) : (
        <>
          <div className="mt-4 flex flex-wrap gap-x-8 gap-y-2">
            <div>
              <p className="text-xs text-mist">Total in range</p>
              <p className="font-display-num mt-0.5 text-2xl font-semibold text-snow">{formatCents(total)}</p>
            </div>
            {best ? (
              <div>
                <p className="text-xs text-mist">Best day</p>
                <p className="num mt-1 text-sm text-snow">
                  {formatCents(best.amountCents)} <span className="text-mist">· {formatDay(best.date)}</span>
                </p>
              </div>
            ) : null}
          </div>
          <motion.div
            key={range}
            className="mt-4 h-60 min-h-0 sm:h-64 lg:flex-1"
            role="img"
            aria-label={`Area chart of daily reward credits, ${formatCents(total)} in total for the selected range.`}
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, ease }}
          >
            <Suspense fallback={<Skeleton className="h-full w-full rounded-xl" />}>
              <EarningsPlot rows={rows} animate={!reduce} />
            </Suspense>
          </motion.div>
        </>
      )}
    </section>
  );
}
