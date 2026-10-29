"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import type { ColumnDef, DataGridProps } from "@/types/data-grid-contract";

type SortDirection = "ascending" | "descending" | "none";

const PAGE_SIZES = [5, 10, 20];

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#38BDF8]";

const defaultGetRowId = (_item: unknown, index: number) => String(index);

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
  getRowId = defaultGetRowId,
  filterOptions = [],
}: DataGridProps<T>) {
  const filterId = useId();
  const pageSizeId = useId();
  const statusId = useId();

  const [sortKey, setSortKey] = useState<keyof T | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("none");
  const [query, setQuery] = useState("");
  const [statusIndex, setStatusIndex] = useState(-1);
  const [pageSize, setPageSize] = useState(PAGE_SIZES[1]);
  const [page, setPage] = useState(1);
  const [announcement, setAnnouncement] = useState("");
  const [activeCell, setActiveCell] = useState({ row: 0, col: 0 });
  const [bookmarked, setBookmarked] = useState<Set<string>>(() => new Set());

  const cellRefs = useRef(new Map<string, HTMLTableCellElement>());
  const shouldFocus = useRef(false);

  // Row ids come from the original data index so they stay stable across sort/filter/page.
  const rowIds = useMemo(
    () => new Map(data.map((item, index) => [item, getRowId(item, index)])),
    [data, getRowId],
  );

  function applyFilters(text: string, status: number) {
    const needle = text.trim().toLowerCase();
    const predicate = filterOptions[status]?.predicate;
    return data.filter(
      (item) =>
        (!needle || matchesQuery(item, columns, needle)) &&
        (!predicate || predicate(item)),
    );
  }

  const filtered = applyFilters(query, statusIndex);

  const sorted = useMemo(() => {
    if (sortKey === null || sortDirection === "none") return filtered;
    const factor = sortDirection === "ascending" ? 1 : -1;
    return [...filtered].sort(
      (a, b) => compareValues(a[sortKey], b[sortKey]) * factor,
    );
  }, [filtered, sortKey, sortDirection]);

  function announceCount(count: number) {
    setAnnouncement(`${count} ${count === 1 ? "result" : "results"} found.`);
  }

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const pageRows = sorted.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const activeRow = Math.min(activeCell.row, Math.max(0, pageRows.length - 1));
  const activeCol = Math.min(activeCell.col, columns.length - 1);

  useEffect(() => {
    if (!shouldFocus.current) return;
    shouldFocus.current = false;
    cellRefs.current.get(`${activeRow}:${activeCol}`)?.focus();
  }, [activeRow, activeCol]);

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
    announceCount(applyFilters(value, statusIndex).length);
  }

  function handleStatusChange(index: number) {
    setStatusIndex(index);
    setPage(1);
    announceCount(applyFilters(query, index).length);
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

  function selectRow(item: T) {
    onRowSelect?.(item);
  }

  function toggleBookmark(item: T) {
    const id = rowIds.get(item) ?? "";
    const next = new Set(bookmarked);
    const added = !next.delete(id);
    if (added) next.add(id);
    setBookmarked(next);
    const name = String(item[columns[0].accessorKey] ?? "Row");
    setAnnouncement(`${name} ${added ? "bookmarked" : "unbookmarked"}.`);
  }

  function moveTo(row: number, col: number) {
    shouldFocus.current = true;
    setActiveCell({
      row: Math.min(Math.max(0, row), pageRows.length - 1),
      col: Math.min(Math.max(0, col), columns.length - 1),
    });
  }

  function handleCellKeyDown(event: KeyboardEvent<HTMLTableCellElement>, item: T) {
    const lastRow = pageRows.length - 1;
    const lastCol = columns.length - 1;

    switch (event.key) {
      case "ArrowUp":
        moveTo(activeRow - 1, activeCol);
        break;
      case "ArrowDown":
        moveTo(activeRow + 1, activeCol);
        break;
      case "ArrowLeft":
        moveTo(activeRow, activeCol - 1);
        break;
      case "ArrowRight":
        moveTo(activeRow, activeCol + 1);
        break;
      case "Home":
        moveTo(event.ctrlKey ? 0 : activeRow, 0);
        break;
      case "End":
        moveTo(event.ctrlKey ? lastRow : activeRow, lastCol);
        break;
      case "Enter":
        selectRow(item);
        break;
      case " ":
        toggleBookmark(item);
        break;
      default:
        return;
    }
    event.preventDefault();
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

        {filterOptions.length > 0 && (
          <label htmlFor={statusId} className="flex flex-col gap-1 text-sm text-[#94A3B8]">
            Status
            <select
              id={statusId}
              value={statusIndex}
              onChange={(event) => handleStatusChange(Number(event.target.value))}
              className={`rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-[#F8FAFC] ${focusRing}`}
            >
              <option value={-1}>All</option>
              {filterOptions.map((option, index) => (
                <option key={option.label} value={index}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        )}
      </form>

      <table
        aria-label={ariaLabel}
        aria-multiselectable="true"
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
            pageRows.map((item, rowIndex) => {
              const rowId = rowIds.get(item) ?? String(rowIndex);
              const isBookmarked = bookmarked.has(rowId);

              return (
                <tr
                  key={rowId}
                  role="row"
                  aria-selected={isBookmarked}
                  className={`border-b border-slate-700 last:border-b-0 hover:bg-slate-800 ${
                    isBookmarked ? "bg-slate-800" : ""
                  }`}
                >
                  {columns.map((column, columnIndex) => {
                    const isActive =
                      rowIndex === activeRow && columnIndex === activeCol;
                    const refKey = `${rowIndex}:${columnIndex}`;

                    return (
                      <td
                        key={String(column.accessorKey)}
                        ref={(node) => {
                          if (node) cellRefs.current.set(refKey, node);
                          else cellRefs.current.delete(refKey);
                        }}
                        role="gridcell"
                        tabIndex={isActive ? 0 : -1}
                        onKeyDown={(event) => handleCellKeyDown(event, item)}
                        onFocus={() => setActiveCell({ row: rowIndex, col: columnIndex })}
                        onClick={() => selectRow(item)}
                        className={`cursor-pointer px-4 py-3 ${focusRing} ${
                          column.cellClassName?.(item) ?? ""
                        }`}
                      >
                        {column.cell
                          ? column.cell(item)
                          : String(item[column.accessorKey] ?? "")}
                      </td>
                    );
                  })}
                </tr>
              );
            })
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
