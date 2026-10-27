import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatDay } from "../../lib/dates";
import { formatCents } from "../../lib/money";

function ChartTip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-white/10 bg-panel/95 px-3 py-2 shadow-xl backdrop-blur">
      <p className="text-xs text-mist">{formatDay(label)}</p>
      <p className="num mt-0.5 text-sm font-semibold text-snow">{formatCents(payload[0].value)}</p>
    </div>
  );
}

/** The recharts half of EarningsChart, split out so recharts loads after the page has painted. */
export default function EarningsPlot({ rows, animate }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={rows} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="earnings-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#39D98A" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#39D98A" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="earnings-stroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#27B5A0" />
            <stop offset="100%" stopColor="#83F7B5" />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
        <XAxis dataKey="date" tickFormatter={formatDay} tick={{ fill: "#9BAAC0", fontSize: 11 }} axisLine={false} tickLine={false} minTickGap={28} />
        <YAxis tickFormatter={(value) => formatCents(value)} tick={{ fill: "#9BAAC0", fontSize: 11 }} axisLine={false} tickLine={false} width={64} />
        <Tooltip content={<ChartTip />} cursor={{ stroke: "rgba(131,247,181,0.35)", strokeDasharray: "3 3" }} />
        <Area
          type="monotone"
          dataKey="amountCents"
          stroke="url(#earnings-stroke)"
          strokeWidth={2.25}
          fill="url(#earnings-fill)"
          activeDot={{ r: 4, fill: "#83F7B5", stroke: "#080D16", strokeWidth: 2 }}
          isAnimationActive={animate}
          animationDuration={700}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
