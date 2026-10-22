import { Copy } from "lucide-react";
import { Link } from "react-router";
import { referralLink } from "../../data/demoData";
import useCopy from "../../hooks/useCopy";
import CountUp from "../ui/CountUp";
import CompactTree from "../network/CompactTree";
import DashHeading from "./DashHeading";

export default function TeamPanel({ model }) {
  const copy = useCopy();
  const link = referralLink(model.member.referralId);
  const { snapshot } = model;
  const stats = [
    ["Direct referrals", snapshot.directReferrals, "Sample directs"],
    ["Upline", snapshot.uplineCount, "Records above you"],
    ["Downline", snapshot.downlineCount, "Records below you"],
    ["Verified team", snapshot.verifiedRecords, "Sample status only"],
  ];

  return (
    <div>
      <DashHeading
        kicker="Network"
        title="Team and referrals"
        lede="Sample structure only. Contact details, wallets, and other members’ balances are not shown."
        action={
          <Link to="/dashboard/network" className="text-sm font-medium text-gold">
            Open network tree
          </Link>
        }
      />
      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map(([label, value, note]) => (
          <div key={label} className="dash-card px-4 py-4">
            <dt className="text-xs text-mist">{label}</dt>
            <dd className="mt-2 text-2xl font-semibold tracking-[-0.04em]">
              <CountUp value={value} />
            </dd>
            <dd className="mt-1 text-xs text-mist">{note}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)]">
        <div className="dash-card p-5 sm:p-6">
          <h3 className="text-base font-semibold">Recent team activity</h3>
          <ul className="mt-4 space-y-3">
            {(model.activity.length ? model.activity : ["No sample team activity in this view."]).map((item) => (
              <li key={item} className="rounded-xl border border-white/[0.08] px-3 py-3 text-sm leading-relaxed text-mist">
                {item}
              </li>
            ))}
          </ul>
          <button type="button" className="btn btn-secondary btn-sm mt-5" onClick={() => copy(link, "Referral link copied.")}>
            <Copy size={14} aria-hidden="true" />
            Copy referral link
          </button>
        </div>
        <CompactTree root={model.networkRoot} upline={model.upline} />
      </div>
    </div>
  );
}
