import { Link } from "react-router";
import RankCard from "../../components/dashboard/RankCard";
import ProgressBar from "../../components/ui/ProgressBar";
import RuleNote from "../../components/ui/RuleNote";
import { EmptyState } from "../../components/ui/States";
import { planConfig } from "../../data/planConfig";
import useDemoModel from "../../hooks/useDemoModel";
import useIllustrativeWindow from "../../hooks/useIllustrativeWindow";
import { formatDate, formatDuration } from "../../lib/dates";
import { evaluateRanks } from "../../lib/plan";
import usePageTitle from "../../lib/usePageTitle";

export default function RankAchievements() {
  usePageTitle("Rank & Achievements");
  const { model } = useDemoModel();
  const clock = useIllustrativeWindow();
  const ranks = evaluateRanks({
    selfStakeCents: model.activeStake?.amountCents ?? 0,
    directs: model.rankDirects,
    illustrativeDeadline: clock.deadline,
  });
  const met = ranks.reduce((total, rank) => total + rank.checks.filter((check) => check.state === "met-in-sample").length, 0);
  const possible = ranks.reduce((total, rank) => total + rank.checks.length, 0);

  return (
    <div className="space-y-8">
      <section className="dash-card p-6 sm:p-8">
        <p className="text-[0.68rem] font-semibold tracking-[0.18em] text-gold uppercase">Rank progression</p>
        <h2 className="font-display mt-3 text-4xl text-snow sm:text-5xl">No rank is achieved yet</h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-mist">
          Sample checks can show as met without confirming a rank. Eligibility needs a backend, including a verified first-stake timestamp. The clock below is illustrative and is not that timestamp.
        </p>
        <div className="mt-6 max-w-md">
          <ProgressBar value={possible ? met / possible : 0} label={`${met} of ${possible} sample checks across all ranks`} tone="gold" />
        </div>
        <dl className="mt-6 grid gap-4 sm:grid-cols-3">
          <div>
            <dt className="text-xs text-mist">Illustrative start</dt>
            <dd className="mt-1 text-sm">{formatDate(clock.start, true)}</dd>
          </div>
          <div>
            <dt className="text-xs text-mist">Illustrative 72-hour mark</dt>
            <dd className="mt-1 text-sm">{formatDate(clock.deadline, true)}</dd>
          </div>
          <div>
            <dt className="text-xs text-mist">Time remaining</dt>
            <dd className="num mt-1 text-sm text-gold">{clock.remaining ? formatDuration(clock.remaining) : "Window elapsed"}</dd>
          </div>
        </dl>
      </section>

      <div className="grid gap-5 xl:grid-cols-3">
        {ranks.map((rank) => (
          <RankCard key={rank.id} rank={rank} />
        ))}
      </div>

      <section className="dash-card">
        <div className="border-b border-line px-5 py-4">
          <h2 className="text-lg font-semibold">Achievement history</h2>
        </div>
        <EmptyState
          title="No confirmed achievements"
          body="A rank will appear here only after the backend confirms eligibility. Sample checks above are not an achievement."
        />
      </section>
      <RuleNote>{planConfig.rankNote}</RuleNote>
      <p className="text-sm text-mist">
        Return to the <Link to="/dashboard" className="text-gold">overview</Link> for the same rank cards beside your sample portfolio.
      </p>
    </div>
  );
}
