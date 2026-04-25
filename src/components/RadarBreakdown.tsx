import {
  Legend,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { EF_CATEGORIES, PF_CATEGORIES, type MetricKey } from "../data/types";
import { METRIC_LABELS } from "../data/metric-labels";

export interface RadarSeries {
  iso: string;
  name: string;
  color: string;
  /** Map of category metric → score (0..10) or null. */
  values: Partial<Record<MetricKey, number | null>>;
}

interface RadarBreakdownProps {
  series: RadarSeries[];
  height?: number;
}

const CATEGORIES: MetricKey[] = [...PF_CATEGORIES, ...EF_CATEGORIES];

/**
 * 12-axis radar of all PF + EF categories. Designed to render N polygons
 * so the same component is reused on /country/:iso (N=1) and /compare (N≤5).
 * Null values are dropped (recharts renders a gap rather than a 0 spike).
 */
export function RadarBreakdown({ series, height = 360 }: RadarBreakdownProps) {
  // Recharts radar requires a row-per-axis shape: [{ category, name1: v, name2: v, ...}]
  const data = CATEGORIES.map((cat) => {
    const row: Record<string, string | number | null> = {
      category: METRIC_LABELS[cat],
    };
    for (const s of series) {
      const v = s.values[cat];
      row[s.name] = v ?? null;
    }
    return row;
  });

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart data={data} outerRadius="72%">
        <PolarGrid stroke="#e5e7eb" />
        <PolarAngleAxis
          dataKey="category"
          tick={{ fontSize: 11, fill: "#374151" }}
        />
        <PolarRadiusAxis angle={30} domain={[0, 10]} tick={{ fontSize: 10 }} />
        {series.map((s) => (
          <Radar
            key={s.iso}
            name={s.name}
            dataKey={s.name}
            stroke={s.color}
            fill={s.color}
            fillOpacity={series.length > 1 ? 0.15 : 0.4}
            strokeWidth={2}
          />
        ))}
        <Tooltip />
        {series.length > 1 && <Legend />}
      </RadarChart>
    </ResponsiveContainer>
  );
}
