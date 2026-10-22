import WithdrawalForm from "../../components/forms/WithdrawalForm";
import Ledger from "../../components/tables/Ledger";
import { DemoLabel } from "../../components/ui/States";
import { transactionCategories } from "../../data/planConfig";
import useDemoModel from "../../hooks/useDemoModel";
import usePageTitle from "../../lib/usePageTitle";

export default function Withdrawals() {
  usePageTitle("Withdrawals");
  const { model } = useDemoModel();
  const rows = model.transactions.filter((row) => row.category === "withdrawal");

  return (
    <div className="space-y-5">
      <section className="dash-card p-6">
        <DemoLabel />
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-mist">
          A withdrawal request on this page is a calculation preview. It is not submitted, and it is not marked successful. Pending, rejected, and failed rows below are sample statuses.
        </p>
      </section>
      <WithdrawalForm availableCents={model.snapshot.availableCents} />
      <Ledger
        rows={rows}
        categories={transactionCategories.filter((item) => item.id === "withdrawal")}
        caption="Withdrawal history"
        filename="proova-demo-withdrawals.csv"
        emptyTitle="No withdrawal records"
        emptyBody="No sample withdrawal rows match these filters."
      />
    </div>
  );
}
