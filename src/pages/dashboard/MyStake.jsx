import { useMemo, useState } from "react";
import ReentryPanel from "../../components/dashboard/ReentryPanel";
import StakeForm from "../../components/forms/StakeForm";
import DataTable from "../../components/tables/DataTable";
import Pagination from "../../components/tables/Pagination";
import StatusBadge from "../../components/ui/StatusBadge";
import { DemoLabel } from "../../components/ui/States";
import useDemoModel from "../../hooks/useDemoModel";
import { formatDate } from "../../lib/dates";
import { formatCents } from "../../lib/money";
import usePageTitle from "../../lib/usePageTitle";

export default function MyStake() {
  usePageTitle("My Stake");
  const { model } = useDemoModel();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const active = model.activeStake;
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return model.stakes.filter((stake) => {
      if (status !== "all" && stake.status !== status) return false;
      if (needle && !stake.id.toLowerCase().includes(needle)) return false;
      return true;
    });
  }, [model.stakes, query, status]);
  const pages = Math.max(1, Math.ceil(filtered.length / 5));
  const safePage = Math.min(page, pages);
  const rows = filtered.slice((safePage - 1) * 5, safePage * 5);

  return (
    <div className="space-y-5">
      <section className="dash-card p-6">
        <DemoLabel />
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-mist">
          Stake controls on this page calculate the stated 10% fee and 90% allocation. They do not connect a wallet, accept a payment, or create a stake.
        </p>
      </section>
      <StakeForm activeStake={active} />
      <section className="dash-card p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-lg font-semibold">Active stake</h2>
          <DemoLabel />
        </div>
        {active ? (
          <dl className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <dt className="text-xs text-mist">Stake ID</dt>
              <dd className="mt-1 font-medium">{active.id}</dd>
            </div>
            <div>
              <dt className="text-xs text-mist">Stake amount</dt>
              <dd className="num mt-1 text-xl font-semibold">{formatCents(active.amountCents)}</dd>
            </div>
            <div>
              <dt className="text-xs text-mist">Start date</dt>
              <dd className="mt-1">{formatDate(active.startedAt, true)}</dd>
            </div>
            <div>
              <dt className="text-xs text-mist">Status</dt>
              <dd className="mt-1">
                <StatusBadge status={active.status} />
              </dd>
            </div>
            <div>
              <dt className="text-xs text-mist">Rewards attributed</dt>
              <dd className="mt-1">Not verified</dd>
            </div>
            <div>
              <dt className="text-xs text-mist">Re-entry eligibility</dt>
              <dd className="mt-1">Not confirmed</dd>
            </div>
          </dl>
        ) : (
          <p className="mt-4 text-sm text-mist">No active stake in this preview view.</p>
        )}
        {active ? <p className="mt-4 text-sm leading-relaxed text-mist">{active.note}</p> : null}
      </section>
      <ReentryPanel
        member={model.member}
        directs={model.directs}
        stakeCents={active?.amountCents ?? null}
        rewardCents={model.snapshot.totalRewardsCents}
      />
      <section className="dash-card overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-line p-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Stake history</h2>
            <p className="mt-1 text-sm text-mist">Sample records. Closed does not mean a verified past stake.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
              placeholder="Search stake ID"
              aria-label="Search stake ID"
              className="field w-44 py-2.5 text-sm"
            />
            <select
              value={status}
              onChange={(event) => {
                setStatus(event.target.value);
                setPage(1);
              }}
              aria-label="Filter stake status"
              className="field w-36 py-2.5 text-sm"
            >
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>
        <DataTable
          caption="Stake history"
          rows={rows}
          emptyTitle="No stakes"
          emptyBody="No sample stakes match this search."
          columns={[
            { key: "id", header: "Stake ID", cell: (row) => row.id },
            { key: "amount", header: "Amount", cell: (row) => <span className="num">{formatCents(row.amountCents)}</span> },
            { key: "start", header: "Start date", cell: (row) => formatDate(row.startedAt) },
            { key: "closed", header: "Closed", cell: (row) => formatDate(row.closedAt) },
            { key: "status", header: "Status", cell: (row) => <StatusBadge status={row.status} /> },
            { key: "note", header: "Details", cell: (row) => <span className="text-mist">{row.note}</span> },
          ]}
        />
        <Pagination page={safePage} pages={pages} total={filtered.length} onPage={setPage} label="stakes" />
      </section>
    </div>
  );
}
