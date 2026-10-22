import { Download } from "lucide-react";
import { useMemo, useState } from "react";
import { ledgerStatuses } from "../../data/planConfig";
import { downloadCsv } from "../../lib/csv";
import { formatDate } from "../../lib/dates";
import { formatCents } from "../../lib/money";
import { useDashboard } from "../../hooks/useDashboard";
import Modal from "../ui/Modal";
import StatusBadge from "../ui/StatusBadge";
import DataTable from "./DataTable";
import Pagination from "./Pagination";

const pageSize = 6;

function localDay(iso) {
  const date = new Date(iso);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

export default function Ledger({
  rows,
  categories,
  caption,
  filename,
  initialQuery = "",
  emptyTitle,
  emptyBody,
}) {
  const { pushToast } = useDashboard();
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return rows.filter((row) => {
      const day = localDay(row.at);
      const haystack = `${row.id} ${row.label} ${row.referralId ?? ""} ${row.referralAlias ?? ""}`.toLowerCase();
      if (needle && !haystack.includes(needle)) return false;
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

  const exportRows = () => {
    if (!filtered.length) {
      pushToast({ title: "Nothing to export", body: "Adjust the filters and try again.", tone: "error" });
      return;
    }
    downloadCsv(
      filename,
      ["Record source", "Transaction ID", "Date", "Category", "Amount", "Status", "Detail", "Rule", "Calculation"],
      filtered.map((row) => [
        "demo",
        row.id,
        formatDate(row.at, true),
        row.label,
        row.amountCents == null ? "" : formatCents(row.amountCents),
        row.status,
        row.detail,
        row.rule,
        row.calculation,
      ]),
    );
    pushToast({ title: "Export ready", body: "The file contains demo records only." });
  };

  return (
    <div className="dash-card overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-line p-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="grid flex-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <label className="text-xs text-mist">
            Search
            <input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
              placeholder="Transaction ID"
              className="field mt-1.5 py-2.5 text-sm"
            />
          </label>
          <label className="text-xs text-mist">
            Category
            <select
              value={category}
              onChange={(event) => {
                setCategory(event.target.value);
                setPage(1);
              }}
              className="field mt-1.5 py-2.5 text-sm"
            >
              <option value="all">All categories</option>
              {categories.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs text-mist">
            Status
            <select
              value={status}
              onChange={(event) => {
                setStatus(event.target.value);
                setPage(1);
              }}
              className="field mt-1.5 py-2.5 text-sm"
            >
              <option value="all">All statuses</option>
              {ledgerStatuses.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs text-mist">
            From
            <input
              type="date"
              value={from}
              onChange={(event) => {
                setFrom(event.target.value);
                setPage(1);
              }}
              className="field mt-1.5 py-2.5 text-sm"
            />
          </label>
          <label className="text-xs text-mist">
            To
            <input
              type="date"
              value={to}
              onChange={(event) => {
                setTo(event.target.value);
                setPage(1);
              }}
              className="field mt-1.5 py-2.5 text-sm"
            />
          </label>
        </div>
        <button type="button" className="btn btn-secondary btn-sm shrink-0" onClick={exportRows}>
          <Download size={15} aria-hidden="true" />
          Export CSV
        </button>
      </div>
      <DataTable
        caption={caption}
        rows={slice}
        emptyTitle={emptyTitle}
        emptyBody={emptyBody}
        columns={[
          { key: "id", header: "Transaction ID", cell: (row) => <span className="font-medium text-snow">{row.id}</span> },
          { key: "date", header: "Date", cell: (row) => formatDate(row.at, true) },
          { key: "type", header: "Transaction type", cell: (row) => row.label },
          {
            key: "amount",
            header: "Amount",
            cell: (row) => <span className="num">{formatCents(row.amountCents)}</span>,
          },
          { key: "status", header: "Status", cell: (row) => <StatusBadge status={row.status} /> },
          {
            key: "details",
            header: "Details",
            cell: (row) => (
              <button type="button" className="text-sm font-medium text-gold hover:underline" onClick={() => setSelected(row)}>
                View
              </button>
            ),
          },
        ]}
      />
      <Pagination page={safePage} pages={pages} total={filtered.length} onPage={setPage} />
      <Modal open={Boolean(selected)} title={selected ? selected.id : "Record"} onClose={() => setSelected(null)} wide>
        {selected ? (
          <div className="space-y-4 text-sm leading-relaxed">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={selected.status} />
              <span className="text-mist">{formatDate(selected.at, true)}</span>
            </div>
            <p className="text-base text-snow">{selected.detail}</p>
            <dl className="grid gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-xs tracking-[0.14em] text-mist uppercase">Amount</dt>
                <dd className="num mt-1 text-snow">{formatCents(selected.amountCents)}</dd>
              </div>
              <div>
                <dt className="text-xs tracking-[0.14em] text-mist uppercase">Type</dt>
                <dd className="mt-1 text-snow">{selected.label}</dd>
              </div>
              {selected.referralId ? (
                <div>
                  <dt className="text-xs tracking-[0.14em] text-mist uppercase">Referral</dt>
                  <dd className="mt-1 text-snow">
                    {selected.referralAlias} · {selected.referralId}
                  </dd>
                </div>
              ) : null}
              {selected.relatedId ? (
                <div>
                  <dt className="text-xs tracking-[0.14em] text-mist uppercase">Related record</dt>
                  <dd className="mt-1 text-snow">{selected.relatedId}</dd>
                </div>
              ) : null}
            </dl>
            <div>
              <p className="text-xs tracking-[0.14em] text-mist uppercase">Applicable rule</p>
              <p className="mt-1 text-mist">{selected.rule}</p>
            </div>
            <div>
              <p className="text-xs tracking-[0.14em] text-mist uppercase">Calculation</p>
              <p className="mt-1 text-mist">{selected.calculation}</p>
            </div>
            <p className="rounded-2xl border border-line bg-navy/50 px-4 py-3 text-mist">
              Demo record. A completed or pending label in this preview does not mean funds moved. Settled records cannot be edited from the dashboard.
            </p>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
