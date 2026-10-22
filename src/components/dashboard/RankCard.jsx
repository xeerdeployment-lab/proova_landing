import { Award, Compass, Sprout } from "lucide-react";
import ProgressBar from "../ui/ProgressBar";
import StatusBadge from "../ui/StatusBadge";

const icons = { initiator: Sprout, explorer: Compass, builder: Award };

export default function RankCard({ rank }) {
  const Icon = icons[rank.id] ?? Award;
  const met = rank.checks.filter((check) => check.state === "met-in-sample").length;
  const accent = rank.id === "builder" ? "bg-gold/80" : rank.id === "explorer" ? "bg-electric/80" : "bg-royal";

  return (
    <article className="dash-card dash-hover relative flex h-full flex-col overflow-hidden p-5 sm:p-6">
      <span className={`absolute inset-x-6 top-0 h-px ${accent}`} aria-hidden="true" />
      <div className="flex items-start justify-between gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-gold/25 bg-gold/[0.06] text-gold">
          <Icon size={18} aria-hidden="true" />
        </span>
        <StatusBadge status="not-confirmed" />
      </div>
      <h3 className="font-display mt-5 text-4xl text-snow">{rank.name}</h3>
      <p className="mt-2 text-sm text-mist">Eligibility is descriptive until a backend confirms it.</p>
      <div className="mt-5">
        <ProgressBar
          value={rank.checks.length ? met / rank.checks.length : 0}
          label={`${met} of ${rank.checks.length} sample checks`}
          tone={rank.id === "builder" ? "gold" : "violet"}
        />
      </div>
      <ul className="mt-5 space-y-4">
        {rank.checks.map((check) => (
          <li key={check.id}>
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm text-snow">{check.label}</p>
              <StatusBadge status={check.state} />
            </div>
            <p className="mt-1 text-xs leading-relaxed text-mist">{check.detail}</p>
          </li>
        ))}
      </ul>
    </article>
  );
}
