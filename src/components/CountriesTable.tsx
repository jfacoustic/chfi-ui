import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { useMemo } from "react";
import { Link } from "react-router-dom";
import type { YearRecord } from "../data/types";
import { Badge } from "./Badge";
import { CountryFlag } from "./CountryFlag";
import { ScoreBadge } from "./ScoreBadge";
import type { Quartile } from "./quartile";

export interface CountriesTableProps {
  data: YearRecord[];
  sorting: SortingState;
  onSortingChange: (s: SortingState) => void;
  pageIndex: number;
  pageSize: number;
  onPageChange: (i: number) => void;
  onPageSizeChange: (n: number) => void;
}

// Convert nulls to undefined so react-table's built-in `sortUndefined: 'last'`
// keeps "no data" rows at the bottom regardless of sort direction.
const u = (v: number | null): number | undefined =>
  v === null ? undefined : v;

export function CountriesTable({
  data,
  sorting,
  onSortingChange,
  pageIndex,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: CountriesTableProps) {
  const columns = useMemo<ColumnDef<YearRecord, unknown>[]>(
    () => [
      {
        id: "hf_rank",
        header: "Rank",
        accessorFn: (r) => u(r.hf_rank),
        sortUndefined: "last",
        cell: (info) => (
          <span className="tabular-nums">
            {(info.getValue() as number | undefined) ?? "—"}
          </span>
        ),
      },
      {
        id: "country",
        header: "Country",
        accessorKey: "country",
        cell: (info) => (
          <Link
            to={`/country/${info.row.original.iso}`}
            className="inline-flex items-center gap-2 text-blue-700 hover:underline"
          >
            <CountryFlag iso={info.row.original.iso} size={24} />
            <span className="font-medium">{info.getValue() as string}</span>
          </Link>
        ),
      },
      {
        id: "region",
        header: "Region",
        accessorKey: "region",
        enableSorting: false,
        cell: (info) => <Badge tone="gray">{info.getValue() as string}</Badge>,
      },
      {
        id: "hf_score",
        header: "HF Score",
        accessorFn: (r) => u(r.hf_score),
        sortUndefined: "last",
        cell: (info) => {
          const v = info.getValue() as number | undefined;
          return (
            <span className="tabular-nums">
              {v === undefined ? "—" : v.toFixed(2)}
            </span>
          );
        },
      },
      {
        id: "pf_score",
        header: "PF Score",
        accessorFn: (r) => u(r.pf_score),
        sortUndefined: "last",
        cell: (info) => {
          const v = info.getValue() as number | undefined;
          return (
            <span className="tabular-nums">
              {v === undefined ? "—" : v.toFixed(2)}
            </span>
          );
        },
      },
      {
        id: "ef_score",
        header: "EF Score",
        accessorFn: (r) => u(r.ef_score),
        sortUndefined: "last",
        cell: (info) => {
          const v = info.getValue() as number | undefined;
          return (
            <span className="tabular-nums">
              {v === undefined ? "—" : v.toFixed(2)}
            </span>
          );
        },
      },
      {
        id: "hf_quartile",
        header: "Quartile",
        accessorFn: (r) => u(r.hf_quartile),
        sortUndefined: "last",
        cell: (info) => (
          <ScoreBadge
            score={info.row.original.hf_score}
            quartile={info.row.original.hf_quartile as Quartile}
          />
        ),
      },
    ],
    [],
  );

  const table = useReactTable({
    data,
    columns,
    state: { sorting, pagination: { pageIndex, pageSize } },
    // Skip the "no sort" middle step so a click on an asc column flips to
    // desc immediately, matching common spreadsheet behavior.
    enableSortingRemoval: false,
    onSortingChange: (updater) => {
      const next =
        typeof updater === "function" ? updater(sorting) : updater;
      onSortingChange(next);
    },
    onPaginationChange: (updater) => {
      const prev = { pageIndex, pageSize };
      const next = typeof updater === "function" ? updater(prev) : updater;
      if (next.pageIndex !== pageIndex) onPageChange(next.pageIndex);
      if (next.pageSize !== pageSize) onPageSizeChange(next.pageSize);
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const total = data.length;
  const start = total === 0 ? 0 : pageIndex * pageSize + 1;
  const end = Math.min(total, (pageIndex + 1) * pageSize);

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-700">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((h) => {
                  const sortable = h.column.getCanSort();
                  const direction = h.column.getIsSorted();
                  return (
                    <th
                      key={h.id}
                      scope="col"
                      className="text-left font-semibold px-3 py-2 border-b border-gray-200"
                    >
                      {sortable ? (
                        <button
                          type="button"
                          onClick={h.column.getToggleSortingHandler()}
                          className="inline-flex items-center gap-1 hover:text-gray-900"
                          aria-sort={
                            direction === "asc"
                              ? "ascending"
                              : direction === "desc"
                                ? "descending"
                                : "none"
                          }
                        >
                          {flexRender(h.column.columnDef.header, h.getContext())}
                          <span aria-hidden="true" className="text-gray-400">
                            {direction === "asc"
                              ? "▲"
                              : direction === "desc"
                                ? "▼"
                                : "↕"}
                          </span>
                        </button>
                      ) : (
                        flexRender(h.column.columnDef.header, h.getContext())
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-gray-100 hover:bg-gray-50"
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-3 py-2 align-middle">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
        <span className="text-gray-600">
          {total === 0
            ? "0 results"
            : `Showing ${start}–${end} of ${total}`}
        </span>
        <div className="flex items-center gap-3">
          <label className="inline-flex items-center gap-2">
            <span className="text-gray-700">Rows</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="rounded border border-gray-300 bg-white px-2 py-1"
            >
              {[25, 50, 100].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
          <div className="inline-flex items-center gap-1">
            <button
              type="button"
              disabled={!table.getCanPreviousPage()}
              onClick={() => table.previousPage()}
              className="px-2 py-1 rounded border border-gray-300 bg-white disabled:opacity-50"
            >
              Prev
            </button>
            <span className="px-2 tabular-nums">
              Page {pageIndex + 1} / {Math.max(1, table.getPageCount())}
            </span>
            <button
              type="button"
              disabled={!table.getCanNextPage()}
              onClick={() => table.nextPage()}
              className="px-2 py-1 rounded border border-gray-300 bg-white disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
