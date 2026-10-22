import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatDay } from "../../lib/dates";
import { DemoLabel, EmptyState } from "../ui/States";

function ChartTip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-2xl border border-line bg-navy/95 px-3 py-2 text-sm shadow-xl">
      <p className="text-mist">Week of {label}</p>
      <p className="mt-1 text-snow">{payload[0].value} sample records</p>
    </div>
  );
}

export default function TeamGrowthChart({ rows }) {
  return (
    <section className="dash-card p-5 sm:p-6">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-lg font-semibold tracking-[-0.03em]">Team growth</h2>
        <DemoLabel />
      </div>
      <p className="mt-2 text-sm leading-relaxed text-mist">
        Sample records in this preview, grouped by the dates written on those records. This is not confirmed enrollment.
      </p>
      {rows.length === 0 ? (
        <EmptyState title="No sample team records" body="Growth appears when the preview includes team rows." />
      ) : (
        <>
          <div className="mt-4 h-64" role="img" aria-label="Sample team records by week">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rows} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                <XAxis
                  dataKey="week"
                  tickFormatter={formatDay}
                  tick={{ fill: "#929DB3", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis allowDecimals={false} tick={{ fill: "#929DB3", fontSize: 12 }} axisLine={false} tickLine={false} width={32} />
                <Tooltip content={<ChartTip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                <Bar dataKey="count" fill="#7667FF" radius={[8, 8, 0, 0]} barSize={22} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <details className="mt-3 text-sm text-mist">
            <summary className="cursor-pointer text-snow">View growth figures</summary>
            <ul className="mt-3 space-y-1">
              {rows.map((row) => (
                <li key={row.week}>
                  Week of {formatDay(row.week)}: {row.count} sample records
                </li>
              ))}
            </ul>
          </details>
        </>
      )}
    </section>
  );
}
