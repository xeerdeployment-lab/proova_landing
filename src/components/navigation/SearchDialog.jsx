import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { useDashboard } from "../../hooks/useDashboard";
import { dashboardNav } from "../../data/navigation";
import Modal from "../ui/Modal";

export default function SearchDialog() {
  const { searchOpen, setSearchOpen, account } = useDashboard();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  const ledger = account?.ledger;
  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const pages = dashboardNav
      .filter((item) => !needle || item.label.toLowerCase().includes(needle))
      .map((item) => ({ id: item.to, label: item.label, hint: "Page", to: item.to }));
    const records = needle
      ? (ledger ?? [])
          .filter((row) => `${row.id} ${row.label} ${row.meta?.txHash ?? ""}`.toLowerCase().includes(needle))
          .slice(0, 5)
          .map((row) => ({
            id: row.id,
            label: row.id,
            hint: row.label,
            to: `/dashboard/transactions?q=${encodeURIComponent(row.id)}`,
          }))
      : [];
    return [...pages, ...records].slice(0, 12);
  }, [ledger, query]);

  const safeActive = results.length ? Math.min(active, results.length - 1) : 0;

  const go = (to) => {
    setSearchOpen(false);
    setQuery("");
    navigate(to);
  };

  return (
    <Modal
      open={searchOpen}
      title="Quick navigation"
      description="Jump to a page or find a transaction by reference."
      onClose={() => setSearchOpen(false)}
    >
      <label className="sr-only" htmlFor="dash-search">
        Search the dashboard
      </label>
      <div className="relative">
        <Search size={16} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-mist" />
        <input
          id="dash-search"
          data-autofocus="true"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setActive(0);
          }}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setActive((current) => Math.min(results.length - 1, current + 1));
            }
            if (event.key === "ArrowUp") {
              event.preventDefault();
              setActive((current) => Math.max(0, current - 1));
            }
            if (event.key === "Enter" && results[safeActive]) {
              event.preventDefault();
              go(results[safeActive].to);
            }
          }}
          placeholder="Page name or transaction reference"
          className="field py-3 pl-10"
        />
      </div>
      <ul className="mt-4 space-y-1" role="listbox" aria-label="Search results">
        {results.length === 0 ? (
          <li className="px-2 py-6 text-sm text-mist">No matching page or transaction.</li>
        ) : (
          results.map((result, index) => (
            <li key={result.id}>
              <button
                type="button"
                role="option"
                aria-selected={index === safeActive}
                className={`flex w-full items-center justify-between rounded-2xl px-3 py-2.5 text-left text-sm ${
                  index === safeActive ? "bg-white/[0.06] text-snow" : "text-mist hover:bg-white/[0.04] hover:text-snow"
                }`}
                onMouseEnter={() => setActive(index)}
                onClick={() => go(result.to)}
              >
                <span>{result.label}</span>
                <span className="text-xs tracking-wide text-mist uppercase">{result.hint}</span>
              </button>
            </li>
          ))
        )}
      </ul>
    </Modal>
  );
}
