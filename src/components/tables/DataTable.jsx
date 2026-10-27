import cx from "../../lib/cx";
import { EmptyState } from "../ui/States";

/**
 * A table on tablet and desktop, stacked cards on phones, so nothing scrolls sideways at 360px.
 * Columns: { key, header, cell(row), align?: "right", mobile?: false }.
 */
export default function DataTable({ columns, rows, caption, emptyTitle = "Nothing here yet", emptyBody, emptyIcon, onRowClick, rowLabel }) {
  if (!rows.length) return <EmptyState icon={emptyIcon} title={emptyTitle} body={emptyBody} />;
  const [lead, ...rest] = columns;

  return (
    <>
      <div className="dash-scroll hidden overflow-x-auto md:block">
        <table className="dash-table">
          {caption ? <caption className="sr-only">{caption}</caption> : null}
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.key} scope="col" className={column.align === "right" ? "text-right" : undefined}>
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                className={onRowClick ? "cursor-pointer focus-visible:bg-white/[0.04]" : undefined}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                tabIndex={onRowClick ? 0 : undefined}
                aria-label={onRowClick && rowLabel ? rowLabel(row) : undefined}
                onKeyDown={
                  onRowClick
                    ? (event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          onRowClick(row);
                        }
                      }
                    : undefined
                }
              >
                {columns.map((column) => (
                  <td key={column.key} className={column.align === "right" ? "text-right" : undefined}>
                    {column.cell(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="divide-y divide-white/5 md:hidden" aria-label={caption}>
        {rows.map((row) => {
          const content = (
            <>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 text-sm font-medium text-snow">{lead.cell(row)}</div>
                {rest.filter((column) => column.align === "right").map((column) => (
                  <div key={column.key} className="shrink-0 text-sm">
                    {column.cell(row)}
                  </div>
                ))}
              </div>
              <dl className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-mist">
                {rest
                  .filter((column) => column.align !== "right" && column.mobile !== false)
                  .map((column) => (
                    <div key={column.key} className="flex items-center gap-1.5">
                      <dt className="sr-only">{column.header}</dt>
                      <dd>{column.cell(row)}</dd>
                    </div>
                  ))}
              </dl>
            </>
          );
          return (
            <li key={row.id}>
              {onRowClick ? (
                <button
                  type="button"
                  className={cx("block w-full px-4 py-3.5 text-left hover:bg-white/[0.03]")}
                  onClick={() => onRowClick(row)}
                  aria-label={rowLabel ? rowLabel(row) : undefined}
                >
                  {content}
                </button>
              ) : (
                <div className="px-4 py-3.5">{content}</div>
              )}
            </li>
          );
        })}
      </ul>
    </>
  );
}
