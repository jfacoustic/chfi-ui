import { CountryFlag } from "./CountryFlag";
import { ScoreBadge } from "./ScoreBadge";
import { getQuartileLabel, type Quartile } from "./quartile";
import type { MetricKey } from "../data/types";

export interface HeatMapTooltipData {
  iso: string;
  country: string;
  region: string;
  rank: number | null;
  score: number | null;
  quartile: Quartile;
  metric: MetricKey;
}

interface Props {
  data: HeatMapTooltipData;
  x: number;
  y: number;
}

export function HeatMapTooltip({ data, x, y }: Props) {
  return (
    <div
      role="tooltip"
      style={{ left: x + 12, top: y + 12 }}
      className="pointer-events-none absolute z-40 min-w-[12rem] rounded-md border border-gray-200 bg-white shadow-lg p-2 text-xs"
    >
      <div className="flex items-center gap-2">
        <CountryFlag iso={data.iso} size={24} />
        <div className="font-semibold text-gray-900">{data.country}</div>
      </div>
      <div className="mt-1 text-gray-600">{data.region}</div>
      <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-0.5">
        <span className="text-gray-500">Rank</span>
        <span className="text-right tabular-nums">
          {data.rank ?? "—"}
        </span>
        <span className="text-gray-500">Score</span>
        <span className="text-right">
          <ScoreBadge score={data.score} quartile={data.quartile} />
        </span>
        <span className="text-gray-500">Quartile</span>
        <span className="text-right">{getQuartileLabel(data.quartile)}</span>
      </div>
    </div>
  );
}
