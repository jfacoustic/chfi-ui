import { useMemo, useState } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import type { MetricKey, YearRecord } from "../data/types";
import type { RegionFilterValue } from "../store/useAppStore";
import { m49ToIso3 } from "../lib/m49";
import { computeQuartiles } from "../lib/quartiles";
import { getQuartileFill } from "./quartile";
import { HeatMapTooltip, type HeatMapTooltipData } from "./HeatMapTooltip";

export interface HeatMapProps {
  /** Per-country records for the active year. */
  records: readonly YearRecord[];
  metric: MetricKey;
  region: RegionFilterValue;
  onSelect: (iso: string) => void;
  /**
   * Geography source. String → react-simple-maps fetches it; object →
   * passed through as already-parsed TopoJSON (used by tests).
   */
  geography?: string | object;
  width?: number;
  height?: number;
}

const DEFAULT_GEOGRAPHY = "/topo/world-110m.json";

const NO_DATA_FILL = "#e5e7eb"; // gray-200

export function HeatMap({
  records,
  metric,
  region,
  onSelect,
  geography = DEFAULT_GEOGRAPHY,
  width = 980,
  height = 520,
}: HeatMapProps) {
  const [tooltip, setTooltip] = useState<{
    data: HeatMapTooltipData;
    x: number;
    y: number;
  } | null>(null);

  // Index records by ISO3 for O(1) lookup as we render hundreds of paths.
  const byIso = useMemo(() => {
    const m = new Map<string, YearRecord>();
    for (const r of records) m.set(r.iso, r);
    return m;
  }, [records]);

  const quartileByIso = useMemo(
    () => computeQuartiles(records, metric),
    [records, metric],
  );

  return (
    <div className="relative w-full">
      <ComposableMap
        projection="geoEqualEarth"
        width={width}
        height={height}
        role="img"
        aria-label="World heat map"
        style={{ width: "100%", height: "auto" }}
      >
        <Geographies geography={geography}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const iso = m49ToIso3(geo.id);
              const record = iso ? byIso.get(iso) : undefined;
              const quartile = iso
                ? (quartileByIso.get(iso) ?? null)
                : null;
              const value = record ? (record[metric] as number | null) : null;
              const matchesRegion =
                region === "all" || (record?.region ?? null) === region;
              const fill =
                quartile === null && !record
                  ? NO_DATA_FILL
                  : getQuartileFill(quartile);
              const opacity = matchesRegion ? 1 : 0.25;

              return (
                <Geography
                  key={geo.rsmKey ?? geo.id ?? geo.properties?.name}
                  geography={geo}
                  data-iso={iso ?? ""}
                  data-country={record?.country ?? ""}
                  className={record ? "cursor-pointer" : "cursor-default"}
                  style={{
                    default: {
                      fill,
                      opacity,
                      stroke: "#fff",
                      strokeWidth: 0.4,
                      outline: "none",
                    },
                    hover: {
                      fill,
                      opacity: matchesRegion ? 1 : 0.4,
                      stroke: "#1f2937",
                      strokeWidth: 0.8,
                      outline: "none",
                    },
                    pressed: {
                      fill,
                      opacity,
                      stroke: "#1f2937",
                      strokeWidth: 0.8,
                      outline: "none",
                    },
                  }}
                  onMouseEnter={(e) => {
                    if (!record) return;
                    setTooltip({
                      data: {
                        iso: record.iso,
                        country: record.country,
                        region: record.region,
                        rank: record.hf_rank,
                        score: value,
                        quartile,
                        metric,
                      },
                      x: e.clientX,
                      y: e.clientY,
                    });
                  }}
                  onMouseLeave={() => setTooltip(null)}
                  onClick={() => {
                    if (record) onSelect(record.iso);
                  }}
                />
              );
            })
          }
        </Geographies>
      </ComposableMap>
      {tooltip && (
        <HeatMapTooltip data={tooltip.data} x={tooltip.x} y={tooltip.y} />
      )}
    </div>
  );
}
