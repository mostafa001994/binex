import type { ReactNode } from "react";

export interface DataTableColumn<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  rows: T[];
  columns: DataTableColumn<T>[];
  getRowKey: (row: T) => string;
  emptyText?: string;
}

export function DataTable<T>({
  rows,
  columns,
  getRowKey,
  emptyText = "داده‌ای برای نمایش وجود ندارد.",
}: DataTableProps<T>) {
  return (
    <div className="overflow-hidden rounded-card border border-border bg-surface">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-surface-muted">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`font-ui whitespace-nowrap border-b border-border px-4 py-3 text-right text-xs font-medium text-foreground-muted ${column.className ?? ""}`}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.map((row) => (
              <tr
                key={getRowKey(row)}
                className="border-b border-border-subtle last:border-b-0 hover:bg-surface-hover/70"
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={`font-ui whitespace-nowrap px-4 py-3.5 text-sm text-foreground ${column.className ?? ""}`}
                  >
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))}

            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length}
                  className="font-ui px-4 py-12 text-center text-sm text-foreground-muted"
                >
                  {emptyText}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
