import { useMemo } from "react";
import { Card } from "../components/Card";
import { CategoryBars } from "../components/CategoryBars";
import { CountryPicker } from "../components/CountryPicker";
import { EmptyState } from "../components/EmptyState";
import { ErrorState } from "../components/ErrorState";
import { LoadingState } from "../components/LoadingState";
import { RadarBreakdown } from "../components/RadarBreakdown";
import { ScoreCards } from "../components/ScoreCards";
import { TimeseriesChart } from "../components/TimeseriesChart";
import { YearSlider } from "../components/YearSlider";
import { ScoreBadge } from "../components/ScoreBadge";
import { CountryFlag } from "../components/CountryFlag";
import {
  EF_CATEGORIES,
  PF_CATEGORIES,
  type MetricKey,
  type YearRecord,
} from "../data/types";
import { useUrlSync } from "../hooks/useUrlSync";
import { useTimeseriesMany } from "../hooks/useTimeseriesMany";
import { useYearData } from "../hooks/useYearData";
import { paletteForIsos } from "../lib/palette";
import { useAppStore } from "../store/useAppStore";
import type { Quartile } from "../components/quartile";

export default function Compare() {
  useUrlSync({ year: true, iso: true });

  const year = useAppStore((s) => s.year);
  const setYear = useAppStore((s) => s.setYear);
  const compared = useAppStore((s) => s.comparedIsos);
  const addCompared = useAppStore((s) => s.addCompared);
  const removeCompared = useAppStore((s) => s.removeCompared);
  const clearCompared = useAppStore((s) => s.clearCompared);

  const yearResult = useYearData(year);
  const tsResult = useTimeseriesMany(compared);

  const palette = useMemo(() => paletteForIsos(compared), [compared]);

  const records: YearRecord[] = useMemo(() => {
    if (yearResult.status !== "success") return [];
    const map = new Map(yearResult.data.map((r) => [r.iso, r]));
    return compared
      .map((iso) => map.get(iso))
      .filter((r): r is YearRecord => !!r);
  }, [yearResult, compared]);

  const radarSeries = records.map((r) => {
    const values: Partial<Record<MetricKey, number | null>> = {};
    for (const cat of [...PF_CATEGORIES, ...EF_CATEGORIES]) {
      values[cat] = r[cat] ?? null;
    }
    return {
      iso: r.iso,
      name: r.country,
      color: palette.get(r.iso) ?? "#2563eb",
      values,
    };
  });

  const tsSeries =
    tsResult.status === "success"
      ? tsResult.data.map((c) => ({
          iso: c.iso,
          name: c.country,
          color: palette.get(c.iso) ?? "#2563eb",
          series: c.series,
        }))
      : [];

  return (
    <section className="space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Compare</h1>
        {compared.length > 0 && (
          <button
            type="button"
            onClick={clearCompared}
            className="text-sm text-gray-600 hover:text-gray-900 underline"
          >
            Clear all
          </button>
        )}
      </header>

      <Card>
        <CountryPicker
          selected={compared}
          onAdd={(iso) => addCompared(iso)}
          onRemove={(iso) => removeCompared(iso)}
        />
      </Card>

      {compared.length === 0 && (
        <EmptyState message="Use the search above to start comparing — up to 5 countries side by side." />
      )}

      {compared.length > 0 && (
        <>
          <Card>
            <YearSlider value={year} onChange={setYear} />
          </Card>

          {yearResult.status === "loading" && (
            <Card>
              <LoadingState message="Loading countries…" />
            </Card>
          )}
          {yearResult.status === "error" && (
            <Card>
              <ErrorState message={yearResult.error.message} />
            </Card>
          )}

          {yearResult.status === "success" && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-gray-700">
                Top-line scores · {year}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
                {records.map((r) => (
                  <Card key={r.iso}>
                    <div className="flex items-center gap-2">
                      <CountryFlag iso={r.iso} size={24} />
                      <span className="font-semibold text-gray-900 truncate">
                        {r.country}
                      </span>
                    </div>
                    <div className="mt-2 grid grid-cols-3 gap-1 text-xs">
                      <Stat label="HF" score={r.hf_score} quartile={r.hf_quartile as Quartile} />
                      <Stat label="PF" score={r.pf_score} quartile={null} />
                      <Stat label="EF" score={r.ef_score} quartile={null} />
                    </div>
                  </Card>
                ))}
              </div>

              {/* Single-country detail uses ScoreCards; comparison uses the
                  per-country mini-cards above. ScoreCards is still useful
                  if exactly one is selected so it stays in the imports. */}
              {records.length === 1 && (
                <ScoreCards
                  year={year}
                  hf={{
                    score: records[0]!.hf_score,
                    rank: records[0]!.hf_rank,
                    quartile: records[0]!.hf_quartile as Quartile,
                  }}
                  pf={{ score: records[0]!.pf_score, rank: records[0]!.pf_rank }}
                  ef={{ score: records[0]!.ef_score, rank: records[0]!.ef_rank }}
                />
              )}

              <Card>
                <h2 className="text-sm font-semibold text-gray-700 mb-2">
                  Category breakdown · {year}
                </h2>
                <RadarBreakdown series={radarSeries} />
              </Card>

              <Card>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <CategoryBars
                    series={radarSeries}
                    group="pf"
                    title="Personal Freedom categories"
                  />
                  <CategoryBars
                    series={radarSeries}
                    group="ef"
                    title="Economic Freedom categories"
                  />
                </div>
              </Card>
            </div>
          )}

          <Card>
            <h2 className="text-sm font-semibold text-gray-700 mb-2">
              Trend · 2000–2023
            </h2>
            {tsResult.status === "loading" && (
              <LoadingState message="Loading time series…" />
            )}
            {tsResult.status === "error" && (
              <ErrorState message={tsResult.error.message} />
            )}
            {tsResult.status === "success" && tsSeries.length > 0 && (
              <TimeseriesChart series={tsSeries} referenceYear={year} />
            )}
          </Card>
        </>
      )}
    </section>
  );
}

function Stat({
  label,
  score,
  quartile,
}: {
  label: string;
  score: number | null;
  quartile: Quartile;
}) {
  return (
    <div className="space-y-0.5">
      <div className="text-gray-500">{label}</div>
      {score === null ? (
        <span className="text-gray-500">—</span>
      ) : (
        <div className="flex items-center gap-1">
          <span className="font-semibold tabular-nums">{score.toFixed(2)}</span>
          {quartile !== null && (
            <ScoreBadge score={score} quartile={quartile} />
          )}
        </div>
      )}
    </div>
  );
}
