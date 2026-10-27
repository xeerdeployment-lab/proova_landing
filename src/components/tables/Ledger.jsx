import { Download, Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { categoryLabel, ledgerStatuses, transactionCategories } from "../../data/planConfig";
import { useDashboard } from "../../hooks/useDashboard";
import cx from "../../lib/cx";
import { downloadCsv } from "../../lib/csv";
import { formatDate } from "../../lib/dates";
import { formatCents } from "../../lib/money";
import BreakdownRows from "../dashboard/BreakdownRows";
import Modal from "../ui/Modal";
import StatusBadge from "../ui/StatusBadge";
import DataTable from "./DataTable";
import Pagination from "./Pagination";

const directionCopy = {
  credit: "Credit to balance",
  debit: "Debit from balance",
  external: "Paid from wallet",
  allocation: "Allocation (part of a related record)",
};

function localDay(iso) {
  const date = new Date(iso);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function Amount({ row, className = "" }) {
  const sign = row.direction === "credit" ? "+" : row.direction === "debit" ? "−" : "";
  return (
    <span
      className={cx(
        "num font-medium",
        row.direction === "credit" ? "text-mint" : row.direction === "allocation" ? "text-mist" : "text-snow",
        (row.status === "failed" || row.status === "rejected") && "line-through opacity-60",
        className,
      )}
    >
      {sign}
      {formatCents(row.amountCents)}
    </span>
  );
}

export function TransactionDetail({ row, onClose }) {
  const { source } = useDashboard();
  return (
    <Modal open={Boolean(row)} title={row ? row.label : "Transaction"} description={row ? `Reference ${row.id}` : undefined} onClose={onClose} wide>
      {row ? (
        <div className="space-y-5 text-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-white/[0.02] p-4">
            <div>
              <p className="text-xs text-mist">{directionCopy[row.direction] ?? "Amount"}</p>
              <Amount row={row} className="font-display-num mt-1 block text-2xl" />
            </div>
            <StatusBadge status={row.status} />
          </div>
          <dl className="grid gap-3 sm:grid-cols-3">
            <div>
              <dt className="kicker">Reference</dt>
              <dd className="num mt-1 text-snow">{row.id}</dd>
            </div>
            <div>
              <dt className="kicker">Timestamp</dt>
              <dd className="mt-1 text-snow">{formatDate(row.at, true)}</dd>
            </div>
            <div>
              <dt className="kicker">Category</dt>
              <dd className="mt-1 text-snow">{categoryLabel(row.category)}</dd>
            </div>
            {row.relatedId ? (
              <div>
                <dt className="kicker">Related record</dt>
                <dd className="num mt-1 text-snow">{row.relatedId}</dd>
              </div>
            ) : null}
          </dl>
          <p className="leading-relaxed text-mist">{row.detail}</p>
          {row.allocations?.length ? (
            <div>
              <p className="kicker mb-3">Allocation breakdown</p>
              <BreakdownRows rows={row.allocations.map((item) => ({ label: item.label, cents: item.cents }))} />
            </div>
          ) : null}
          {source === "demo" ? <p className="text-xs text-warning">Demo record from the development ledger.</p> : null}
        </div>
      ) : null}
    </Modal>
  );
}

export default function Ledger({
  rows,
  categories = transactionCategories,
  caption = "Transactions",
  filename = "axora-transactions.csv",
  initialQuery = "",
  initialCategory = "all",
  pageSize = 8,
  emptyTitle = "No transactions yet",
  emptyBody = "Stakes, rewards and withdrawals will appear here once they are recorded.",
  compact = false,
}) {
  const { pushToast, source } = useDashboard();
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [status, setStatus] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return rows.filter((row) => {
      const day = localDay(row.at);
      if (needle && !`${row.id} ${row.label} ${row.relatedId ?? ""} ${row.detail ?? ""}`.toLowerCase().includes(needle)) return false;
      if (category !== "all" && row.category !== category) return false;
      if (status !== "all" && row.status !== status) return false;
      if (from && day < from) return false;
      if (to && day > to) return false;
      return true;
    });
  }, [rows, query, category, status, from, to]);

  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, pages);
  const slice = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);
  const filtersOn = query || category !== "all" || status !== "all" || from || to;
  // On phones only search shows by default; the other filters fold behind a toggle.
  const [showFilters, setShowFilters] = useState(false);
  const extraFilters = [category !== "all", status !== "all", from, to].filter(Boolean).length;
  const extra = showFilters ? "" : "max-sm:hidden";
  const set = (setter) => (event) => {
    setter(event.target.value);
    setPage(1);
  };

  const exportRows = () => {
    if (!filtered.length) {
      pushToast({ title: "Nothing to export", body: "No transactions match the current filters.", tone: "error" });
      return;
    }
    downloadCsv(
      filename,
      ["Reference", "Timestamp (UTC)", "Category", "Direction", "Amount (USD)", "Status", "Related record", "Detail", "Allocations", "Source"],
      filtered.map((row) => [
        row.id,
        row.at,
        categoryLabel(row.category),
        row.direction,
        (row.amountCents / 100).toFixed(2),
        row.status,
        row.relatedId ?? "",
        row.detail,
        (row.allocations ?? []).map((item) => `${item.label}: ${(item.cents / 100).toFixed(2)}`).join("; "),
        source === "demo" ? "demo" : "server",
      ]),
    );
    pushToast({ title: "Export ready", body: `${filtered.length} transaction${filtered.length === 1 ? "" : "s"} exported.`, tone: "success" });
  };

  return (
    <div className="dash-card overflow-hidden">
      {compact ? null : (
        <div className="flex flex-col gap-3 border-b border-line p-4 sm:p-5 xl:flex-row xl:items-end">
          <div className="grid flex-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-5">
            <label className="text-xs text-mist sm:col-span-2 lg:col-span-4 2xl:col-span-1">
              Search
              <span className="relative mt-1.5 block">
                <Search size={14} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-mist" aria-hidden="true" />
                <input value={query} onChange={set(setQuery)} placeholder="Reference or keyword" className="field py-2.5 pl-9 text-sm" type="search" />
              </span>
            </label>
            <label className={cx("text-xs text-mist", extra)}>
              Type
              <select value={category} onChange={set(setCategory)} className="field mt-1.5 py-2.5 text-sm">
                <option value="all">All types</option>
                {categories.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
            <label className={cx("text-xs text-mist", extra)}>
              Status
              <select value={status} onChange={set(setStatus)} className="field mt-1.5 py-2.5 text-sm">
                <option value="all">All statuses</option>
                {ledgerStatuses.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
            <label className={cx("text-xs text-mist", extra)}>
              From
              <input type="date" value={from} max={to || undefined} onChange={set(setFrom)} className="field mt-1.5 py-2.5 text-sm" />
            </label>
            <label className={cx("text-xs text-mist", extra)}>
              To
              <input type="date" value={to} min={from || undefined} onChange={set(setTo)} className="field mt-1.5 py-2.5 text-sm" />
            </label>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn btn-secondary btn-sm sm:hidden" aria-expanded={showFilters} onClick={() => setShowFilters((open) => !open)}>
              <SlidersHorizontal size={15} aria-hidden="true" />
              {showFilters ? "Hide filters" : "Filters"}
              {extraFilters && !showFilters ? <span className="rounded-full bg-accent/15 px-1.5 text-[0.65rem] font-semibold text-mint">{extraFilters}</span> : null}
            </button>
            {filtersOn ? (
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  setQuery("");
                  setCategory("all");
                  setStatus("all");
                  setFrom("");
                  setTo("");
                  setPage(1);
                }}
              >
                Clear
              </button>
            ) : null}
            <button type="button" className="btn btn-secondary btn-sm shrink-0 max-sm:ml-auto" onClick={exportRows}>
              <Download size={15} aria-hidden="true" />
              Export CSV
            </button>
          </div>
        </div>
      )}
      <DataTable
        caption={caption}
        rows={slice}
        emptyTitle={filtersOn ? "No matching transactions" : emptyTitle}
        emptyBody={filtersOn ? "Try a different search, type, status or date range." : emptyBody}
        onRowClick={setSelected}
        rowLabel={(row) => `${row.label} ${row.id}, view details`}
        columns={[
          {
            key: "type",
            header: "Transaction",
            cell: (row) => (
              <span className="flex min-w-0 flex-col">
                <span className="truncate font-medium text-snow">{row.label}</span>
                <span className="num text-xs text-mist">{row.id}</span>
              </span>
            ),
          },
          { key: "date", header: "Date", cell: (row) => <span className="whitespace-nowrap">{formatDate(row.at, true)}</span> },
          { key: "status", header: "Status", cell: (row) => <StatusBadge status={row.status} /> },
          { key: "amount", header: "Amount", align: "right", cell: (row) => <Amount row={row} /> },
        ]}
      />
      {compact ? null : <Pagination page={safePage} pages={pages} total={filtered.length} onPage={setPage} label="transactions" />}
      <TransactionDetail row={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
