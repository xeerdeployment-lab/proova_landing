import { useMemo, useState } from "react";
import ReferralTools from "../../components/forms/ReferralTools";
import DataTable from "../../components/tables/DataTable";
import Pagination from "../../components/tables/Pagination";
import StatusBadge from "../../components/ui/StatusBadge";
import { DemoLabel } from "../../components/ui/States";
import useDemoModel from "../../hooks/useDemoModel";
import { formatDate } from "../../lib/dates";
import usePageTitle from "../../lib/usePageTitle";

export default function DirectReferrals() {
  usePageTitle("Direct Referrals");
  const { model } = useDemoModel();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return model.directs.filter((person) => `${person.alias} ${person.id}`.toLowerCase().includes(needle));
  }, [model.directs, query]);
  const pages = Math.max(1, Math.ceil(filtered.length / 5));
  const safePage = Math.min(page, pages);
  const rows = filtered.slice((safePage - 1) * 5, safePage * 5);

  return (
    <div className="space-y-5">
      <section className="dash-card overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-line p-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <DemoLabel />
            <h2 className="mt-3 text-xl font-semibold">Direct referrals</h2>
            <p className="mt-1 max-w-xl text-sm text-mist">
              Aliases only. Wallet addresses, phone numbers, email addresses, and financial details are not shown.
            </p>
          </div>
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
            placeholder="Search alias or ID"
            aria-label="Search direct referrals"
            className="field w-full py-2.5 text-sm sm:w-64"
          />
        </div>
        <DataTable
          caption="Direct referrals"
          rows={rows}
          emptyTitle="No direct referrals"
          emptyBody="No sample direct records match this search."
          columns={[
            { key: "id", header: "Member ID", cell: (row) => row.id },
            { key: "alias", header: "Alias", cell: (row) => row.alias },
            { key: "joined", header: "Joining date", cell: (row) => formatDate(row.joinedAt) },
            { key: "verification", header: "Verification", cell: (row) => <StatusBadge status={row.verification} /> },
            { key: "stake", header: "Stake eligibility", cell: (row) => row.stakeEligibility },
            { key: "rank", header: "Current rank", cell: (row) => row.rank },
          ]}
        />
        <Pagination page={safePage} pages={pages} total={filtered.length} onPage={setPage} label="referrals" />
      </section>
      <ReferralTools />
    </div>
  );
}
