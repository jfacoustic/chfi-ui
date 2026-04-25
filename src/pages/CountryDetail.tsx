import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { Card } from "../components/Card";
import { CategoryBars } from "../components/CategoryBars";
import { CompareToggleButton } from "../components/CompareToggleButton";
import { CountryHeader } from "../components/CountryHeader";
import { ErrorState } from "../components/ErrorState";
import { LoadingState } from "../components/LoadingState";
import { RadarBreakdown } from "../components/RadarBreakdown";
import { ScoreCards } from "../components/ScoreCards";
import { TimeseriesChart } from "../components/TimeseriesChart";
import { KNOWN_ISO3 } from "../data/iso3-set";
import { EF_CATEGORIES, PF_CATEGORIES, asIso3, type MetricKey } from "../data/types";
import type { Quartile } from "../components/quartile";
import { useUrlSync } from "../hooks/useUrlSync";
import { useTimeseries } from "../hooks/useTimeseries";
import { useYearData } from "../hooks/useYearData";
import { useAppStore } from "../store/useAppStore";
import NotFound from "./NotFound";

const COUNTRY_COLOR = "#2563eb"; // blue-600 — single-country detail accent

export default function CountryDetail() {
  useUrlSync({ year: true });
  const { iso: rawIso } = useParams<{ iso: string }>();
  const iso = (rawIso ?? "").toUpperCase();

  const year = useAppStore((s) => s.year);

  const valid = KNOWN_ISO3.has(iso);

  // Hooks are always called in the same order; we use a known-good ISO as
  // a placeholder when the route param is invalid so the cache isn't
  // polluted with bogus 404s. The early return below keeps the placeholder
  // fetch's data out of the rendered tree.
  const yearResult = useYearData(year);
  const tsResult = useTimeseries(asIso3(valid ? iso : "USA"));

  const record = useMemo(() => {
    if (!valid || yearResult.status !== "success") return null;
    return yearResult.data.find((r) => r.iso === iso) ?? null;
  }, [yearResult, valid, iso]);

  if (!valid) return <NotFound />;

  const loading =
    yearResult.status === "loading" || tsResult.status === "loading";
  const error =
    yearResult.status === "error"
      ? yearResult.error
      : tsResult.status === "error"
        ? tsResult.error
        : null;

  if (loading) return <LoadingState message="Loading country…" />;
  if (error) return <ErrorState message={error.message} />;
  if (yearResult.status !== "success" || tsResult.status !== "success") {
    return <LoadingState />;
  }

  const ts = tsResult.data;
  const country = record?.country ?? ts.country;
  const region = record?.region ?? ts.region;

  const radarValues: Partial<Record<MetricKey, number | null>> = {};
  for (const cat of [...PF_CATEGORIES, ...EF_CATEGORIES]) {
    radarValues[cat] = record ? (record[cat] ?? null) : null;
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <CountryHeader iso={iso} name={country} region={region} />
        <CompareToggleButton iso={iso} />
      </div>

      <ScoreCards
        year={year}
        hf={{
          score: record?.hf_score ?? null,
          rank: record?.hf_rank ?? null,
          quartile: (record?.hf_quartile ?? null) as Quartile,
        }}
        pf={{
          score: record?.pf_score ?? null,
          rank: record?.pf_rank ?? null,
        }}
        ef={{
          score: record?.ef_score ?? null,
          rank: record?.ef_rank ?? null,
        }}
      />

      <Card>
        <h2 className="text-sm font-semibold text-gray-700 mb-2">
          Category breakdown · {year}
        </h2>
        <RadarBreakdown
          series={[
            {
              iso,
              name: country,
              color: COUNTRY_COLOR,
              values: radarValues,
            },
          ]}
        />
      </Card>

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CategoryBars
            series={[
              { iso, name: country, color: COUNTRY_COLOR, values: radarValues },
            ]}
            group="pf"
            title="Personal Freedom categories"
          />
          <CategoryBars
            series={[
              { iso, name: country, color: COUNTRY_COLOR, values: radarValues },
            ]}
            group="ef"
            title="Economic Freedom categories"
          />
        </div>
      </Card>

      <Card>
        <h2 className="text-sm font-semibold text-gray-700 mb-2">
          Trend · 2000–2023
        </h2>
        <TimeseriesChart
          series={[
            {
              iso,
              name: country,
              color: COUNTRY_COLOR,
              series: ts.series,
            },
          ]}
          referenceYear={year}
        />
      </Card>
    </section>
  );
}
