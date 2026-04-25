import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  MAX_YEAR,
  MIN_YEAR,
  type MetricKey,
  type TimeseriesPoint,
} from "../data/types";
import { METRIC_LABELS } from "../data/metric-labels";

export interface TimeseriesSeries {
  iso: string;
  name: string;
  color: string;
  /** Per-metric points indexed by year. */
  series: Partial<Record<MetricKey, TimeseriesPoint[]>>;
}

interface TimeseriesChartProps {
  series: TimeseriesSeries[];
  /** Year of the reference line; e.g. globally selected year. */
  referenceYear: number;
  /** Which metric tabs to expose. Default: HF, PF, EF top-level scores. */
  metrics?: readonly MetricKey[];
  height?: number;
}

const DEFAULT_METRICS: readonly MetricKey[] = [
  "hf_score",
  "pf_score",
  "ef_score",
];

export function TimeseriesChart({
  series,
  referenceYear,
  metrics = DEFAULT_METRICS,
  height = 280,
}: TimeseriesChartProps) {
  const [active, setActive] = useState<MetricKey>(metrics[0]!);

  const data = useMemo(() => {
    const rows: Record<string, number | null>[] = [];
    for (let y = MIN_YEAR; y <= MAX_YEAR; y++) {
      const row: Record<string, number | null> = { year: y };
      for (const s of series) {
        const points = s.series[active] ?? [];
        const match = points.find((p) => p.year === y);
        row[s.name] = match ? match.value : null;
      }
      rows.push(row);
    }
    return rows;
  }, [series, active]);

  return (
    <div className="space-y-2">
      <div role="tablist" aria-label="Time series metric" className="flex gap-1">
        {metrics.map((m) => (
          <button
            key={m}
            role="tab"
            type="button"
            aria-selected={active === m}
            onClick={() => setActive(m)}
            className={`px-2 py-1 rounded text-xs border transition ${
              active === m
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
            }`}
          >
            {METRIC_LABELS[m]}
          </button>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 4 }}>
          <CartesianGrid stroke="#f3f4f6" vertical={false} />
          <XAxis
            dataKey="year"
            type="number"
            domain={[MIN_YEAR, MAX_YEAR]}
            tick={{ fontSize: 10, fill: "#374151" }}
            allowDecimals={false}
          />
          <YAxis
            domain={[0, 10]}
            tick={{ fontSize: 10, fill: "#374151" }}
            width={32}
          />
          <Tooltip />
          {series.length > 1 && <Legend />}
          <ReferenceLine
            x={referenceYear}
            stroke="#9ca3af"
            strokeDasharray="4 4"
            ifOverflow="extendDomain"
          />
          {series.map((s) => (
            <Line
              key={s.iso}
              type="monotone"
              dataKey={s.name}
              stroke={s.color}
              strokeWidth={2}
              dot={false}
              connectNulls
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
