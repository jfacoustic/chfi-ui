import { Card } from "./Card";
import { ScoreBadge } from "./ScoreBadge";
import { getQuartileLabel, type Quartile } from "./quartile";

interface ScoreCardsProps {
  year: number;
  hf: { score: number | null; rank: number | null; quartile: Quartile };
  pf: { score: number | null; rank: number | null };
  ef: { score: number | null; rank: number | null };
}

function fmt(n: number | null): string {
  return n === null ? "—" : n.toFixed(2);
}

function rankText(rank: number | null): string {
  return rank === null ? "" : `Rank ${rank}`;
}

export function ScoreCards({ year, hf, pf, ef }: ScoreCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      <Card>
        <div className="text-xs uppercase tracking-wide text-gray-500">
          Human Freedom · {year}
        </div>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-3xl font-bold tabular-nums">{fmt(hf.score)}</span>
          <ScoreBadge score={hf.score} quartile={hf.quartile} />
        </div>
        <div className="mt-1 text-sm text-gray-600">
          {rankText(hf.rank)}
          {hf.quartile !== null && hf.rank !== null ? " · " : ""}
          {hf.quartile !== null ? getQuartileLabel(hf.quartile) : ""}
        </div>
      </Card>
      <Card>
        <div className="text-xs uppercase tracking-wide text-gray-500">
          Personal Freedom · {year}
        </div>
        <div className="mt-1 text-3xl font-bold tabular-nums">{fmt(pf.score)}</div>
        <div className="mt-1 text-sm text-gray-600">{rankText(pf.rank)}</div>
      </Card>
      <Card>
        <div className="text-xs uppercase tracking-wide text-gray-500">
          Economic Freedom · {year}
        </div>
        <div className="mt-1 text-3xl font-bold tabular-nums">{fmt(ef.score)}</div>
        <div className="mt-1 text-sm text-gray-600">{rankText(ef.rank)}</div>
      </Card>
    </div>
  );
}
