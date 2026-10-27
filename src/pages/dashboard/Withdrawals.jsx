import { ArrowDownToLine, Clock, Wallet } from "lucide-react";
import DashHeading from "../../components/dashboard/DashHeading";
import MetricCard from "../../components/dashboard/MetricCard";
import WithdrawalForm from "../../components/forms/WithdrawalForm";
import Ledger from "../../components/tables/Ledger";
import Reveal from "../../components/ui/Reveal";
import { transactionCategories } from "../../data/planConfig";
import { useAccount } from "../../hooks/useAccount";
import usePageTitle from "../../lib/usePageTitle";

export default function Withdrawals() {
  usePageTitle("Withdrawal");
  const account = useAccount();
  const { balances } = account;

  return (
    <div className="space-y-8">
      <section className="grid grid-cols-2 gap-3 *:first:col-span-2 sm:grid-cols-3 sm:gap-4 sm:*:first:col-span-1" aria-label="Withdrawal totals">
        <MetricCard index={0} icon={Wallet} label="Available" cents={balances.availableCents} hint="Eligible to withdraw" />
        <MetricCard index={1} icon={Clock} label="Processing" cents={balances.pendingWithdrawalCents} hint="Pending withdrawals" tone="warning" />
        <MetricCard index={2} icon={ArrowDownToLine} label="Withdrawn" cents={balances.withdrawnCents} hint="Completed requests, gross" tone="teal" />
      </section>

      <section>
        <DashHeading kicker="Withdraw" title="Request a withdrawal" lede="Every line of the split is shown before you confirm, and the lines always add back to the amount you request." />
        <WithdrawalForm />
      </section>

      <Reveal>
        <section>
          <DashHeading kicker="History" title="Withdrawal history" />
          <Ledger
            rows={account.ledger.filter((row) => row.category === "withdrawal")}
            categories={transactionCategories.filter((item) => item.id === "withdrawal")}
            filename="axora-withdrawals.csv"
            pageSize={6}
            emptyTitle="No withdrawals yet"
            emptyBody="Your withdrawal requests and their processing status appear here."
          />
        </section>
      </Reveal>
    </div>
  );
}
