import { useSearchParams } from "react-router";
import Ledger from "../../components/tables/Ledger";
import { DemoLabel } from "../../components/ui/States";
import { transactionCategories } from "../../data/planConfig";
import useDemoModel from "../../hooks/useDemoModel";
import usePageTitle from "../../lib/usePageTitle";

export default function Transactions() {
  usePageTitle("Transactions");
  const { model } = useDemoModel();
  const [params] = useSearchParams();

  return (
    <div className="space-y-5">
      <section className="dash-card p-6">
        <DemoLabel />
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-mist">
          Pending rows are not settled. Fee and community lines describe stated components. They are not extra charges on top of a reconciled balance, and none of these records can be edited here.
        </p>
      </section>
      <Ledger
        key={params.get("q") ?? ""}
        rows={model.transactions}
        categories={transactionCategories}
        caption="Transaction ledger"
        filename="proova-demo-transactions.csv"
        initialQuery={params.get("q") ?? ""}
        emptyTitle="No transactions"
        emptyBody="No sample records match these filters."
      />
    </div>
  );
}
