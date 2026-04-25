import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { EF_CATEGORIES, PF_CATEGORIES, type MetricKey } from "../data/types";
import { METRIC_LABELS } from "../data/metric-labels";

export interface CategoryBarsSeries {
  iso: string;
  name: string;
  color: string;
  values: Partial<Record<MetricKey, number | null>>;
}

interface CategoryBarsProps {
  series: CategoryBarsSeries[];
  /** Which set of categories to render. */
  group: "pf" | "ef";
  title: string;
  height?: number;
}

/** Multi-country grouped-bar chart for the 7 PF or 5 EF categories. */
export function CategoryBars({
  series,
  group,
  title,
  height = 240,
}: CategoryBarsProps) {
  const categories: MetricKey[] = group === "pf" ? [...PF_CATEGORIES] : [...EF_CATEGORIES];
  const data = categories.map((cat) => {
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
    <div className="space-y-1">
      <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 4 }}>
          <CartesianGrid stroke="#f3f4f6" vertical={false} />
          <XAxis
            dataKey="category"
            tick={{ fontSize: 10, fill: "#374151" }}
            interval={0}
          />
          <YAxis
            domain={[0, 10]}
            tick={{ fontSize: 10, fill: "#374151" }}
            width={32}
          />
          <Tooltip />
          {series.length > 1 && <Legend />}
          {series.map((s) => (
            <Bar
              key={s.iso}
              dataKey={s.name}
              fill={s.color}
              radius={[2, 2, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
