import { Link } from "react-router";
import TeamGrowthChart from "../../components/charts/TeamGrowthChart";
import ReferralTools from "../../components/forms/ReferralTools";
import { DemoLabel } from "../../components/ui/States";
import useDemoModel from "../../hooks/useDemoModel";
import usePageTitle from "../../lib/usePageTitle";

export default function MyTeam() {
  usePageTitle("My Team");
  const { model } = useDemoModel();
  const levels = model.downline.reduce((map, person) => {
    map[person.depth] = (map[person.depth] ?? 0) + 1;
    return map;
  }, {});

  return (
    <div className="space-y-5">
      <section className="dash-card p-6">
        <DemoLabel />
        <h2 className="mt-4 text-2xl font-semibold tracking-[-0.04em]">Sample team records</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-mist">
          Counts use each sample ID once. These rows do not mean someone joined through a referral link, and they do not include private contact or wallet details.
        </p>
        <dl className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Direct referrals", model.snapshot.directReferrals],
            ["Upline records", model.snapshot.uplineCount],
            ["Downline records", model.snapshot.downlineCount],
            ["Verified samples", model.snapshot.verifiedRecords],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-line bg-navy/40 p-4">
              <dt className="text-xs text-mist">{label}</dt>
              <dd className="num mt-2 text-3xl font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>
      <div className="grid gap-5 xl:grid-cols-2">
        <TeamGrowthChart rows={model.growth} />
        <section className="dash-card p-5 sm:p-6">
          <h2 className="text-lg font-semibold">Team activity</h2>
          <ul className="mt-4 space-y-3 text-sm leading-relaxed text-mist">
            {(model.activity.length ? model.activity : ["No sample activity in this view."]).map((item) => (
              <li key={item} className="rounded-2xl border border-line px-4 py-3">
                {item}
              </li>
            ))}
          </ul>
          <h3 className="mt-6 text-sm font-semibold tracking-[0.14em] text-mist uppercase">Level breakdown</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {Object.keys(levels).length === 0 ? (
              <li className="text-mist">No downline levels in this view.</li>
            ) : (
              Object.entries(levels).map(([level, count]) => (
                <li key={level} className="flex justify-between gap-3">
                  <span className="text-mist">Level {level}</span>
                  <span className="num">{count} unique sample records</span>
                </li>
              ))
            )}
          </ul>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link to="/dashboard/referrals" className="btn btn-secondary btn-sm">
              Direct referrals
            </Link>
            <Link to="/dashboard/network" className="btn btn-primary btn-sm">
              Network tree
            </Link>
          </div>
        </section>
      </div>
      <ReferralTools />
    </div>
  );
}
