import { AlertTriangle, CheckCircle2 } from "lucide-react";
import CapabilityCard from "../../components/dashboard/CapabilityCard";
import DashHeading from "../../components/dashboard/DashHeading";
import StakeForm from "../../components/forms/StakeForm";
import Ledger from "../../components/tables/Ledger";
import Reveal from "../../components/ui/Reveal";
import { transactionCategories } from "../../data/planConfig";
import { useAccount } from "../../hooks/useAccount";
import { formatCents } from "../../lib/money";
import usePageTitle from "../../lib/usePageTitle";

export default function Restake() {
  usePageTitle("Restake");
  const account = useAccount();
  const { stake, capability } = account;
  const facts = [
    ["Current stake", formatCents(stake.active?.amountCents ?? 0)],
    ["Last stake amount", formatCents(stake.lastAmountCents ?? 0)],
    ["Minimum restake", formatCents(stake.restake.minCents)],
    ["Maximum restake", formatCents(stake.restake.maxCents)],
  ];

  return (
    <div className="space-y-8">
      {stake.restake.required ? (
        <div className="flex items-start gap-3 rounded-2xl border border-warning/30 bg-warning/[0.07] p-4 sm:p-5" role="status">
          <AlertTriangle size={20} className="mt-0.5 shrink-0 text-warning" aria-hidden="true" />
          <div>
            <p className="font-semibold text-warning">Restake required</p>
            <p className="mt-1 text-sm leading-relaxed text-mist">
              You&apos;ve reached your {capability.multiple}x reward capability of {formatCents(capability.maxCents)}. Rewards, daily income and withdrawals resume
              after a restake of at least {formatCents(stake.restake.minCents)} confirms.
            </p>
          </div>
        </div>
      ) : stake.active ? (
        <div className="flex items-start gap-3 rounded-2xl border border-accent/20 bg-accent/[0.05] p-4 sm:p-5" role="status">
          <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-accent" aria-hidden="true" />
          <div>
            <p className="font-semibold text-snow">No restake needed yet</p>
            <p className="mt-1 text-sm leading-relaxed text-mist">
              {formatCents(capability.remainingCents)} of reward capability remains on your current stake. Restaking opens when the cap is reached.
            </p>
          </div>
        </div>
      ) : null}

      <dl className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {facts.map(([label, value]) => (
          <div key={label} className="dash-card p-5">
            <dt className="text-xs text-mist">{label}</dt>
            <dd className="font-display-num mt-1 text-xl font-semibold sm:text-2xl">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <section>
          <DashHeading kicker="Restake" title="New amount" lede="Use your last stake amount or a higher one, up to the plan maximum. One active stake per address — the new stake replaces the current one when it confirms." />
          <StakeForm mode="restake" />
        </section>
        <div className="xl:pt-[5.5rem]">
          <CapabilityCard account={account} />
        </div>
      </div>

      <Reveal>
        <section>
          <DashHeading kicker="History" title="Restake transactions" />
          <Ledger
            rows={account.ledger.filter((row) => row.category === "restake" || row.category === "stake")}
            categories={transactionCategories.filter((item) => item.id === "stake" || item.id === "restake")}
            filename="axora-restakes.csv"
            pageSize={5}
            emptyTitle="No stake transactions yet"
          />
        </section>
      </Reveal>
    </div>
  );
}
