import TeamGraph from "../../components/network/TeamGraph";
import { DemoLabel } from "../../components/ui/States";
import useDemoModel from "../../hooks/useDemoModel";
import usePageTitle from "../../lib/usePageTitle";

export default function NetworkStructure() {
  usePageTitle("Network Tree");
  const { model } = useDemoModel();

  return (
    <div className="space-y-5">
      <section className="dash-card p-6">
        <DemoLabel />
        <h2 className="font-display mt-4 text-4xl text-snow">Network tree</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-mist">
          Drag to pan, scroll to zoom, and select a node for the privacy-safe detail. Pending and verified states describe sample records only. Branches start collapsed below your direct referrals.
        </p>
      </section>
      <TeamGraph root={model.networkRoot} upline={model.upline} />
    </div>
  );
}
