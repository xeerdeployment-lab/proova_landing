import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatDay } from "../../lib/dates";
import { formatCents } from "../../lib/money";
import { ease } from "../../lib/motion";
import { DemoLabel, EmptyState } from "../ui/States";
import Tabs from "../ui/Tabs";

function ChartTip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const cents = payload[0]?.payload?.amountCents ?? payload[0]?.value;
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0c1120]/95 px-3 py-2 shadow-xl">
      <p className="text-xs text-mist">{label}</p>
      <p className="num mt-1 text-sm text-snow">{formatCents(cents)}</p>
      <p className="mt-1 text-[0.68rem] tracking-wide text-gold uppercase">Simulated</p>
    </div>
  );
}

export default function EarningsChart({ series }) {
  const reduce = useReducedMotion();
  const [range, setRange] = useState(30);
  const rows = series[range] ?? [];
  const summary = rows.length
    ? {
        high: Math.max(...rows.map((row) => row.amountCents)),
        low: Math.min(...rows.map((row) => row.amountCents)),
      }
    : null;

  return (
    <section className="dash-card p-5 sm:p-6" aria-labelledby="earnings-chart-title">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 id="earnings-chart-title" className="text-lg font-semibold tracking-[-0.03em]">
              Earnings over time
            </h2>
            <DemoLabel>Simulated</DemoLabel>
          </div>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-mist">
            A simulated series for the chart. These points are not ledger records, and they are not a forecast.
          </p>
        </div>
        <Tabs
          label="Earnings range"
          value={range}
          onChange={setRange}
          tabs={[
            { id: 7, label: "7 day" },
            { id: 30, label: "30 day" },
            { id: 90, label: "90 day" },
          ]}
        />
      </div>

      {rows.length === 0 ? (
        <EmptyState title="No chart series" body="This preview view has no simulated earnings points." />
      ) : (
        <>
          <motion.div
            key={range}
            className="mt-6 h-64 sm:h-72"
            role="img"
            aria-label="Simulated earnings area chart"
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={rows} margin={{ top: 12, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="earnings-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7667FF" stopOpacity={0.42} />
                    <stop offset="100%" stopColor="#7667FF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDay}
                  tick={{ fill: "#929DB3", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  minTickGap={24}
                />
                <YAxis
                  tickFormatter={(value) => formatCents(value)}
                  tick={{ fill: "#929DB3", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  width={72}
                />
                <Tooltip content={<ChartTip />} cursor={{ stroke: "rgba(220,197,139,0.45)" }} />
                <Area
                  type="monotone"
                  dataKey="amountCents"
                  stroke="#A78BFA"
                  strokeWidth={2}
                  fill="url(#earnings-fill)"
                  animationDuration={reduce ? 0 : 700}
                  isAnimationActive={!reduce}
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>
          {summary ? (
            <p className="mt-3 text-sm text-mist">
              Simulated range {formatCents(summary.low)} to {formatCents(summary.high)}. This describes the drawn series only.
            </p>
          ) : null}
          <details className="mt-4 text-sm text-mist">
            <summary className="cursor-pointer text-snow">View chart figures</summary>
            <div className="mt-3 max-h-48 overflow-auto">
              <table className="dash-table min-w-0">
                <caption className="sr-only">Simulated earnings figures</caption>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Simulated amount</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.date}>
                      <td>{formatDay(row.date)}</td>
                      <td className="num">{formatCents(row.amountCents)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </>
      )}
    </section>
  );
}
