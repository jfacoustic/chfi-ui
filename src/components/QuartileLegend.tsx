import { getQuartileFill, getQuartileLabel, type Quartile } from "./quartile";

const ORDER: Quartile[] = [1, 2, 3, 4, null];

const HINTS: Record<string, string> = {
  "1": "top 25%",
  "2": "upper-mid",
  "3": "lower-mid",
  "4": "bottom 25%",
  null: "no data",
};

export function QuartileLegend() {
  return (
    <ul
      role="list"
      aria-label="Quartile legend"
      className="flex flex-wrap items-center gap-3 text-xs text-gray-700"
    >
      {ORDER.map((q) => {
        const key = q === null ? "null" : String(q);
        return (
          <li key={key} className="flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className="inline-block w-3.5 h-3.5 rounded-sm border border-gray-300"
              style={{ backgroundColor: getQuartileFill(q) }}
            />
            <span className="font-medium">{getQuartileLabel(q)}</span>
            <span className="text-gray-500">({HINTS[key]})</span>
          </li>
        );
      })}
    </ul>
  );
}
