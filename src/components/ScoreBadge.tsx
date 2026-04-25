import { getQuartileLabel, type Quartile } from "./quartile";

interface ScoreBadgeProps {
  score: number | null;
  quartile: Quartile;
}

const QUARTILE_BG: Record<NonNullable<Quartile> | "null", string> = {
  1: "bg-emerald-500 text-white",
  2: "bg-lime-500 text-white",
  3: "bg-orange-500 text-white",
  4: "bg-red-500 text-white",
  null: "bg-gray-300 text-gray-700",
};

export function ScoreBadge({ score, quartile }: ScoreBadgeProps) {
  const key = quartile === null ? "null" : quartile;
  const label =
    score === null ? getQuartileLabel(null) : score.toFixed(2);
  return (
    <span
      className={`inline-flex items-center min-w-[3rem] justify-center px-2 py-0.5 rounded text-xs font-semibold tabular-nums ${QUARTILE_BG[key]}`}
      aria-label={`${label} (${getQuartileLabel(quartile)})`}
    >
      {label}
    </span>
  );
}
