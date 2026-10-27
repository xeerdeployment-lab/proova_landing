import { useSearchParams } from "react-router";
import Ledger from "../../components/tables/Ledger";
import { transactionCategories } from "../../data/planConfig";
import { useAccount } from "../../hooks/useAccount";
import usePageTitle from "../../lib/usePageTitle";

export default function Transactions() {
  usePageTitle("Transaction History");
  const account = useAccount();
  const [params] = useSearchParams();
  const type = params.get("type");
  const query = params.get("q") ?? "";

  return (
    <div className="space-y-5">
      <p className="max-w-3xl text-sm leading-relaxed text-mist">
        Every stake, reward, withdrawal, fee and allocation on your account, each with a unique reference. Select a transaction to see its full
        allocation breakdown.
      </p>
      <Ledger
        key={`${query}-${type}`}
        rows={account.ledger}
        categories={transactionCategories}
        initialQuery={query}
        initialCategory={transactionCategories.some((item) => item.id === type) ? type : "all"}
        filename="axora-transactions.csv"
        pageSize={10}
      />
    </div>
  );
}
