import { ArrowUpFromLine, Layers, UserCheck, Users } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import DashHeading from "../../components/dashboard/DashHeading";
import MetricCard from "../../components/dashboard/MetricCard";
import TeamGraph from "../../components/network/TeamGraph";
import Reveal from "../../components/ui/Reveal";
import { EmptyState } from "../../components/ui/States";
import { planConfig } from "../../data/planConfig";
import { useAccount } from "../../hooks/useAccount";
import { ease } from "../../lib/motion";
import { formatCents } from "../../lib/money";
import usePageTitle from "../../lib/usePageTitle";

function LevelBars({ levels }) {
  const reduce = useReducedMotion();
  const max = Math.max(1, ...levels.map((level) => level.members));
  return (
    <ul className="space-y-3" aria-label="Members by level">
      {levels.map((level, index) => (
        <li key={level.level} className="grid grid-cols-[3.5rem_1fr_auto] items-center gap-3 text-sm">
          <span className="text-mist">L{level.level}</span>
          <span className="relative h-2.5 overflow-hidden rounded-full bg-white/5" aria-hidden="true">
            <motion.span
              className="absolute inset-y-0 left-0 rounded-full bg-white/10"
              initial={reduce ? false : { width: 0 }}
              whileInView={{ width: `${(level.members / max) * 100}%` }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease, delay: reduce ? 0 : index * 0.04 }}
            />
            <motion.span
              className="progress-fill absolute inset-y-0 left-0"
              initial={reduce ? false : { width: 0 }}
              whileInView={{ width: `${(level.active / max) * 100}%` }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease, delay: reduce ? 0 : index * 0.04 + 0.1 }}
            />
          </span>
          <span className="num w-20 text-right text-xs">
            <span className="text-snow">{level.active}</span>
            <span className="text-mist"> / {level.members}</span>
            <span className="sr-only"> active of {level.members} members</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

export default function MyTeam() {
  usePageTitle("Team Network");
  const account = useAccount();
  const { team } = account;
  const deepest = [...team.levels].reverse().find((level) => level.members > 0)?.level ?? 0;

  return (
    <div className="space-y-8">
      <section className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4" aria-label="Team totals">
        <MetricCard index={0} icon={Users} label="Team members" count={team.totalMembers} hint="Across 10 levels" />
        <MetricCard index={1} icon={UserCheck} label="Active members" count={team.activeMembers} hint="With an active stake" tone="teal" />
        <MetricCard index={2} icon={ArrowUpFromLine} label="Upline" count={team.upline.count} hint={`${team.upline.active} active`} tone="mint" />
        <MetricCard index={3} icon={Layers} label="Deepest level" count={deepest} hint="Of 10 income levels" tone="warning" />
      </section>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <Reveal>
          <section className="dash-card h-full p-5 sm:p-6" aria-labelledby="levels-title">
            <p className="kicker">Depth</p>
            <h2 id="levels-title" className="mt-1 text-lg font-semibold tracking-[-0.02em]">
              Active vs total by level
            </h2>
            <div className="mt-6">
              {team.totalMembers ? <LevelBars levels={team.levels} /> : <EmptyState icon={Users} title="No team yet" body="Members you refer, and the people they refer, appear here by level." />}
            </div>
            <p className="mt-5 text-xs leading-relaxed text-mist">
              Active members earn you daily income from {formatCents(planConfig.dailyIncome.levels[0].rateCents)} (level 1) to{" "}
              {formatCents(planConfig.dailyIncome.levels.at(-1).rateCents)} (levels 5–10) each per day.
            </p>
          </section>
        </Reveal>
        <Reveal delay={0.05}>
          <section aria-labelledby="tree-title" className="h-full">
            <DashHeading kicker="Structure" title="Network explorer" lede="Expand members to see who they referred. Search by alias or ID." />
            <TeamGraph root={team.tree.root} upline={team.tree.upline} />
          </section>
        </Reveal>
      </div>
    </div>
  );
}
