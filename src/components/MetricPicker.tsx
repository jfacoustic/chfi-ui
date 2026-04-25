import {
  ALL_METRICS,
  EF_CATEGORIES,
  PF_CATEGORIES,
  type MetricKey,
} from "../data/types";

interface MetricPickerProps {
  value: MetricKey;
  onChange: (m: MetricKey) => void;
  id?: string;
}

const LABELS: Record<MetricKey, string> = {
  hf_score: "Human Freedom",
  pf_score: "Personal Freedom",
  ef_score: "Economic Freedom",
  pf_rol: "Rule of Law",
  pf_ss: "Security & Safety",
  pf_movement: "Movement",
  pf_religion: "Religion",
  pf_assembly: "Assembly",
  pf_expression: "Expression",
  pf_identity: "Identity",
  ef_government: "Government Size",
  ef_legal: "Legal System",
  ef_money: "Sound Money",
  ef_trade: "Trade Freedom",
  ef_regulation: "Regulation",
};

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
              {LABELS[k]}
            </option>
          ))}
        </optgroup>
        <optgroup label="Personal Freedom">
          {PF_CATEGORIES.map((k) => (
            <option key={k} value={k}>
              {LABELS[k]}
            </option>
          ))}
        </optgroup>
        <optgroup label="Economic Freedom">
          {EF_CATEGORIES.map((k) => (
            <option key={k} value={k}>
              {LABELS[k]}
            </option>
          ))}
        </optgroup>
      </select>
    </label>
  );
}

// Re-export so tests and consumers don't have to redefine it.
export const METRIC_LABELS = LABELS;
export const METRIC_OPTION_COUNT = ALL_METRICS.length;
