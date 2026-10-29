"use client";

import { useId, useMemo, useState } from "react";
import type { ColumnDef, DataGridProps } from "@/types/data-grid-contract";

type SortDirection = "ascending" | "descending" | "none";

const PAGE_SIZES = [5, 10, 20];

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#38BDF8]";

function matchesQuery<T>(item: T, columns: ColumnDef<T>[], needle: string) {
  return columns.some((column) =>
    String(item[column.accessorKey] ?? "")
      .toLowerCase()
      .includes(needle),
  );
}

function compareValues(a: unknown, b: unknown) {
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a ?? "").localeCompare(String(b ?? ""), undefined, {
    numeric: true,
    sensitivity: "base",
  });
}

export function DataGrid<T>({
  data,
  columns,
  onRowSelect,
  ariaLabel,
}: DataGridProps<T>) {
  const filterId = useId();
  const pageSizeId = useId();

  const [sortKey, setSortKey] = useState<keyof T | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("none");
  const [query, setQuery] = useState("");
  const [pageSize, setPageSize] = useState(PAGE_SIZES[1]);
  const [page, setPage] = useState(1);
  const [announcement, setAnnouncement] = useState("");

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return data;
    return data.filter((item) => matchesQuery(item, columns, needle));
  }, [data, columns, query]);

  const sorted = useMemo(() => {
    if (sortKey === null || sortDirection === "none") return filtered;
    const factor = sortDirection === "ascending" ? 1 : -1;
    return [...filtered].sort(
      (a, b) => compareValues(a[sortKey], b[sortKey]) * factor,
    );
  }, [filtered, sortKey, sortDirection]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const pageRows = sorted.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  function handleSort(column: ColumnDef<T>) {
    const next: SortDirection =
      sortKey !== column.accessorKey || sortDirection === "none"
        ? "ascending"
        : sortDirection === "ascending"
          ? "descending"
          : "none";

    setSortKey(next === "none" ? null : column.accessorKey);
    setSortDirection(next);
    setAnnouncement(
      next === "none"
        ? `Sorting removed from ${column.header}.`
        : `Sorted by ${column.header}, ${next}.`,
    );
  }

  function handleQueryChange(value: string) {
    setQuery(value);
    setPage(1);
    const needle = value.trim().toLowerCase();
    const count = needle
      ? data.filter((item) => matchesQuery(item, columns, needle)).length
      : data.length;
    setAnnouncement(`${count} ${count === 1 ? "result" : "results"} found.`);
  }

  function goToPage(target: number) {
    const next = Math.min(Math.max(1, target), pageCount);
    setPage(next);
    setAnnouncement(`Page ${next} of ${pageCount}.`);
  }

  function handlePageSizeChange(size: number) {
    setPageSize(size);
    setPage(1);
    setAnnouncement(`Showing ${size} rows per page.`);
  }

  const pageButtons = [
    { label: "First", target: 1, disabled: currentPage === 1 },
    { label: "Previous", target: currentPage - 1, disabled: currentPage === 1 },
    { label: "Next", target: currentPage + 1, disabled: currentPage === pageCount },
    { label: "Last", target: pageCount, disabled: currentPage === pageCount },
  ];

  return (
    <>
      <form
        role="search"
        onSubmit={(event) => event.preventDefault()}
        className="flex flex-wrap items-end gap-4"
      >
        <label htmlFor={filterId} className="flex flex-col gap-1 text-sm text-[#94A3B8]">
          Filter
          <input
            id={filterId}
            type="search"
            value={query}
            onChange={(event) => handleQueryChange(event.target.value)}
            placeholder="Search ticker or name"
            className={`rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-[#F8FAFC] placeholder:text-[#94A3B8] ${focusRing}`}
          />
        </label>
      </form>

      <table
        aria-label={ariaLabel}
        role="grid"
        className="w-full border-collapse bg-[#0F172A] text-[#F8FAFC]"
      >
        <thead>
          <tr role="row">
            {columns.map((column) => {
              const direction: SortDirection =
                sortKey === column.accessorKey ? sortDirection : "none";

              return (
                <th
                  key={String(column.accessorKey)}
                  scope="col"
                  role="columnheader"
                  aria-sort={column.sortable ? direction : undefined}
                  className="border-b border-slate-700 px-4 py-3 text-left font-semibold text-[#94A3B8]"
                >
                  {column.sortable ? (
                    <button
                      type="button"
                      onClick={() => handleSort(column)}
                      className={`inline-flex items-center gap-1 rounded-sm hover:text-[#F8FAFC] ${focusRing}`}
                    >
                      {column.header}
                      <span aria-hidden="true">
                        {direction === "ascending"
                          ? "▲"
                          : direction === "descending"
                            ? "▼"
                            : "↕"}
                      </span>
                    </button>
                  ) : (
                    column.header
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {pageRows.length === 0 ? (
            <tr role="row">
              <td
                role="gridcell"
                colSpan={columns.length}
                className="px-4 py-6 text-center text-[#94A3B8]"
              >
                No matching assets.
              </td>
            </tr>
          ) : (
            pageRows.map((item, rowIndex) => (
              <tr
                key={rowIndex + (currentPage - 1) * pageSize}
                role="row"
                className="border-b border-slate-700 last:border-b-0 hover:bg-slate-800"
              >
                {columns.map((column, columnIndex) => {
                  const value = item[column.accessorKey];
                  const isChangeColumn =
                    String(column.accessorKey) === "change24h";
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
                      key={String(column.accessorKey)}
                      role="gridcell"
                      className={`px-4 py-3 ${valueColor}`}
                    >
                      {onRowSelect && columnIndex === 0 ? (
                        <button
                          type="button"
                          onClick={() => onRowSelect(item)}
                          className={`rounded-sm text-left ${focusRing}`}
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
            ))
          )}
        </tbody>
      </table>

      <nav
        aria-label="Pagination"
        className="flex flex-wrap items-center justify-between gap-4 text-sm"
      >
        <label htmlFor={pageSizeId} className="flex items-center gap-2 text-[#94A3B8]">
          Rows per page
          <select
            id={pageSizeId}
            value={pageSize}
            onChange={(event) => handlePageSizeChange(Number(event.target.value))}
            className={`rounded-md border border-slate-600 bg-slate-800 px-2 py-1 text-[#F8FAFC] ${focusRing}`}
          >
            {PAGE_SIZES.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>

        <p>
          Page {currentPage} of {pageCount}
        </p>

        <ul className="flex gap-2">
          {pageButtons.map(({ label, target, disabled }) => (
            <li key={label}>
              <button
                type="button"
                onClick={() => goToPage(target)}
                disabled={disabled}
                aria-label={`${label} page`}
                className={`rounded-md border border-slate-600 px-3 py-1 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`}
              >
                {label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <p role="status" aria-live="polite" className="sr-only">
        {announcement}
      </p>
    </>
  );
}
