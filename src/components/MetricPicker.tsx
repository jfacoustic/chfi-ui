import {
  EF_CATEGORIES,
  PF_CATEGORIES,
  type MetricKey,
} from "../data/types";
import { METRIC_LABELS } from "../data/metric-labels";

interface MetricPickerProps {
  value: MetricKey;
  onChange: (m: MetricKey) => void;
  id?: string;
}

export function MetricPicker({ value, onChange, id }: MetricPickerProps) {
  return (
    <label className="inline-flex items-center gap-2 text-sm">
      <span className="text-gray-700">Metric</span>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value as MetricKey)}
        className="rounded border border-gray-300 bg-white px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <optgroup label="Overall">
          {(["hf_score", "pf_score", "ef_score"] as const).map((k) => (
            <option key={k} value={k}>
              {METRIC_LABELS[k]}
            </option>
          ))}
        </optgroup>
        <optgroup label="Personal Freedom">
          {PF_CATEGORIES.map((k) => (
            <option key={k} value={k}>
              {METRIC_LABELS[k]}
            </option>
          ))}
        </optgroup>
        <optgroup label="Economic Freedom">
          {EF_CATEGORIES.map((k) => (
            <option key={k} value={k}>
              {METRIC_LABELS[k]}
            </option>
          ))}
        </optgroup>
      </select>
    </label>
  );
}
