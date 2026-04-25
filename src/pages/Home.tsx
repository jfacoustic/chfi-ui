import { useNavigate } from "react-router-dom";
import { Card } from "../components/Card";
import { ErrorState } from "../components/ErrorState";
import { HeatMap } from "../components/HeatMap";
import { LoadingState } from "../components/LoadingState";
import { MetricPicker } from "../components/MetricPicker";
import { QuartileLegend } from "../components/QuartileLegend";
import { RegionFilter } from "../components/RegionFilter";
import { YearSliderControls } from "../components/YearSliderControls";
import { useUrlSync } from "../hooks/useUrlSync";
import { useYearData } from "../hooks/useYearData";
import { useAppStore } from "../store/useAppStore";

export default function Home() {
  useUrlSync({ year: true, metric: true, region: true });
  const navigate = useNavigate();
  const year = useAppStore((s) => s.year);
  const metric = useAppStore((s) => s.metric);
  const region = useAppStore((s) => s.region);
  const setYear = useAppStore((s) => s.setYear);
  const setMetric = useAppStore((s) => s.setMetric);
  const setRegion = useAppStore((s) => s.setRegion);

  const result = useYearData(year);

  return (
    <section className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Heat Map</h1>
        <div className="flex flex-wrap items-center gap-3">
          <MetricPicker value={metric} onChange={setMetric} />
        </div>
      </header>

      <RegionFilter value={region} onChange={setRegion} />

      <Card className="p-2">
        {result.status === "loading" && <LoadingState message="Loading map…" />}
        {result.status === "error" && (
          <ErrorState message={result.error.message} />
        )}
        {result.status === "success" && (
          <HeatMap
            records={result.data}
            metric={metric}
            region={region}
            onSelect={(iso) => navigate(`/country/${iso}`)}
          />
        )}
      </Card>

      <YearSliderControls value={year} onChange={setYear} />

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-gray-700">
        <span>
          Year: <span className="font-semibold tabular-nums">{year}</span>{" "}
          (2025 Report data)
        </span>
        <QuartileLegend />
      </div>
    </section>
  );
}
