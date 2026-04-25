import type { SortingState } from "@tanstack/react-table";
import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { CountriesTable } from "../components/CountriesTable";
import { CountriesToolbar } from "../components/CountriesToolbar";
import { Card } from "../components/Card";
import { EmptyState } from "../components/EmptyState";
import { ErrorState } from "../components/ErrorState";
import { LoadingState } from "../components/LoadingState";
import type { YearRecord } from "../data/types";
import { useUrlSync } from "../hooks/useUrlSync";
import { useYearData } from "../hooks/useYearData";
import { useAppStore } from "../store/useAppStore";

const SORTABLE_COLUMNS = new Set([
  "hf_rank",
  "hf_score",
  "pf_score",
  "ef_score",
  "hf_quartile",
]);

const PAGE_SIZES = [25, 50, 100] as const;

export default function Countries() {
  // Year and region come from the global store via useUrlSync; the table's
  // own state (q/sort/dir/page/pageSize) lives in the URL but is page-local.
  useUrlSync({ year: true, region: true });
  const [searchParams, setSearchParams] = useSearchParams();

  const year = useAppStore((s) => s.year);
  const region = useAppStore((s) => s.region);
  const setYear = useAppStore((s) => s.setYear);
  const setRegion = useAppStore((s) => s.setRegion);

  const query = searchParams.get("q") ?? "";
  const sortId = searchParams.get("sort") ?? "hf_rank";
  const sortDir = searchParams.get("dir") === "desc" ? "desc" : "asc";
  const pageIndex = Math.max(0, Number(searchParams.get("page") ?? "0"));
  const rawPageSize = Number(searchParams.get("pageSize") ?? "25");
  const pageSize = (PAGE_SIZES as readonly number[]).includes(rawPageSize)
    ? rawPageSize
    : 25;

  const sorting: SortingState = SORTABLE_COLUMNS.has(sortId)
    ? [{ id: sortId, desc: sortDir === "desc" }]
    : [{ id: "hf_rank", desc: false }];

  const updateParam = (mutate: (p: URLSearchParams) => void) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        mutate(next);
        return next;
      },
      { replace: true },
    );
  };

  const result = useYearData(year);

  const rows = useMemo<YearRecord[]>(() => {
    if (result.status !== "success") return [];
    const q = query.trim().toLowerCase();
    return result.data.filter((r) => {
      if (region !== "all" && r.region !== region) return false;
      if (q && !r.country.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [result, region, query]);

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Countries</h1>

      <CountriesToolbar
        year={year}
        onYearChange={setYear}
        region={region}
        onRegionChange={setRegion}
        query={query}
        onQueryChange={(v) =>
          updateParam((p) => {
            if (v) p.set("q", v);
            else p.delete("q");
            // Reset to first page on a new search.
            p.delete("page");
          })
        }
      />

      {result.status === "loading" && (
        <Card>
          <LoadingState message="Loading countries…" />
        </Card>
      )}
      {result.status === "error" && (
        <Card>
          <ErrorState message={result.error.message} />
        </Card>
      )}
      {result.status === "success" && rows.length === 0 && (
        <Card>
          <EmptyState message="No countries match your filters" />
        </Card>
      )}
      {result.status === "success" && rows.length > 0 && (
        <CountriesTable
          data={rows}
          sorting={sorting}
          onSortingChange={(s) =>
            updateParam((p) => {
              const item = s[0];
              if (!item) {
                p.delete("sort");
                p.delete("dir");
              } else {
                p.set("sort", item.id);
                p.set("dir", item.desc ? "desc" : "asc");
              }
            })
          }
          pageIndex={pageIndex}
          pageSize={pageSize}
          onPageChange={(i) =>
            updateParam((p) => {
              if (i === 0) p.delete("page");
              else p.set("page", String(i));
            })
          }
          onPageSizeChange={(n) =>
            updateParam((p) => {
              if (n === 25) p.delete("pageSize");
              else p.set("pageSize", String(n));
              // Reset to first page when page size changes.
              p.delete("page");
            })
          }
        />
      )}
    </section>
  );
}
