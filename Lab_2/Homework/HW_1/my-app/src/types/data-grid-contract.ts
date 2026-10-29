import type { ReactNode } from "react";

export interface ColumnDef<T> {
  header: string;
  accessorKey: keyof T;
  sortable?: boolean;
  cell?: (item: T) => ReactNode;
  cellClassName?: (item: T) => string;
}

export interface FilterOption<T> {
  label: string;
  predicate: (item: T) => boolean;
}

export interface DataGridProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  onRowSelect?: (item: T) => void;
  ariaLabel: string;
  getRowId?: (item: T, index: number) => string;
  filterOptions?: FilterOption<T>[];
}
