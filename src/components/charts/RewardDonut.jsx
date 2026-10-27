import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { formatCents } from "../../lib/money";

/** The recharts half of RewardMix, split out so recharts loads after the page has painted. */
export default function RewardDonut({ data, total, colors, animate }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={total ? data : [{ id: "none", cents: 1 }]}
          dataKey="cents"
          innerRadius="70%"
          outerRadius="100%"
          paddingAngle={total ? 2 : 0}
          stroke="none"
          isAnimationActive={animate}
        >
          {(total ? data : [{ id: "none" }]).map((item) => (
            <Cell key={item.id} fill={colors[item.id] ?? "rgba(255,255,255,0.06)"} />
          ))}
        </Pie>
        {total ? <Tooltip formatter={(value, _name, item) => [formatCents(value), item.payload.label]} contentStyle={{ background: "#101827", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }} itemStyle={{ color: "#F4F7FB" }} /> : null}
      </PieChart>
    </ResponsiveContainer>
  );
}
