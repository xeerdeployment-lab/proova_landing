import { EmptyState, ErrorState, Skeleton } from "../ui/States";

export default function DataTable({
  caption,
  columns,
  rows,
  rowKey = "id",
  status = "ready",
  onRetry,
  emptyTitle = "Nothing to show",
  emptyBody = "No records match this view.",
}) {
  if (status === "loading") {
    return (
      <div className="space-y-3 p-4" aria-busy="true">
        <span className="sr-only">Loading records</span>
        {Array.from({ length: 5 }, (_, index) => (
          <Skeleton key={index} className="h-11 w-full" />
        ))}
      </div>
    );
  }

  if (status === "error") {
    return <ErrorState onRetry={onRetry} />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="dash-table min-w-[720px]">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} scope="col">
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length}>
                <EmptyState title={emptyTitle} body={emptyBody} />
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={row[rowKey]}>
                {columns.map((column) => (
                  <td key={column.key}>{column.cell(row)}</td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
