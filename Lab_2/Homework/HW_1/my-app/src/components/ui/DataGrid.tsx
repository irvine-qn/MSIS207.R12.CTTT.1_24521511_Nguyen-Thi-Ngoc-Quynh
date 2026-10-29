import type { DataGridProps } from "@/types/data-grid-contract";

export function DataGrid<T>({
  data,
  columns,
  onRowSelect,
  ariaLabel,
}: DataGridProps<T>) {
  return (
    <table
      aria-label={ariaLabel}
      role="grid"
      className="w-full border-collapse bg-[#0F172A] text-[#F8FAFC]"
    >
      <thead>
        <tr role="row">
          {columns.map((column, columnIndex) => (
            <th
              key={columnIndex}
              scope="col"
              className="border-b border-slate-700 px-4 py-3 text-left font-semibold"
            >
              {column.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((item, rowIndex) => (
          <tr
            key={rowIndex}
            role="row"
            className="border-b border-slate-700 last:border-b-0 hover:bg-slate-800"
          >
            {columns.map((column, columnIndex) => {
              const value = item[column.accessorKey];
              const isChangeColumn = String(column.accessorKey) === "change24h";
              const valueColor =
                isChangeColumn && typeof value === "number"
                  ? value > 0
                    ? "text-[#22C55E]"
                    : value < 0
                      ? "text-[#EF4444]"
                      : "text-[#F8FAFC]"
                  : "";

              return (
                <td
                  key={columnIndex}
                  role="gridcell"
                  className={`px-4 py-3 ${valueColor}`}
                >
                  {onRowSelect && columnIndex === 0 ? (
                    <button
                      type="button"
                      aria-label={`Select row ${rowIndex + 1}`}
                      onClick={() => onRowSelect(item)}
                      className="rounded-sm text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F8FAFC]"
                    >
                      {String(value ?? "")}
                    </button>
                  ) : (
                    String(value ?? "")
                  )}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
