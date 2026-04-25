import { ALL_METRICS, type MetricKey } from "./types";

export const METRIC_LABELS: Record<MetricKey, string> = {
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

export const METRIC_OPTION_COUNT = ALL_METRICS.length;
