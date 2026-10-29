import type { DataGridProps } from "@/types/data-grid-contract";

export function DataGrid<T>({
  data,
  columns,
  onRowSelect,
  ariaLabel,
}: DataGridProps<T>) {
  return (
    <table aria-label={ariaLabel} role="grid">
      <thead>
        <tr role="row">
          {columns.map((column, columnIndex) => (
            <th key={columnIndex} scope="col">
              {column.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((item, rowIndex) => (
          <tr key={rowIndex} role="row">
            {columns.map((column, columnIndex) => (
              <td key={columnIndex} role="gridcell">
                {onRowSelect && columnIndex === 0 ? (
                  <button
                    type="button"
                    aria-label={`Select row ${rowIndex + 1}`}
                    onClick={() => onRowSelect(item)}
                  >
                    {String(item[column.accessorKey] ?? "")}
                  </button>
                ) : (
                  String(item[column.accessorKey] ?? "")
                )}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
