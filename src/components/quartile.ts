export type Quartile = 1 | 2 | 3 | 4 | null;

/**
 * Tailwind background classes for each quartile.
 * Q1 (top freedom) → green, Q4 (lowest) → red, null → gray.
 */
export function getQuartileColor(q: Quartile): string {
  switch (q) {
    case 1:
      return "bg-emerald-500";
    case 2:
      return "bg-lime-500";
    case 3:
      return "bg-orange-500";
    case 4:
      return "bg-red-500";
    case null:
      return "bg-gray-300";
  }
}

/** Hex value used by the SVG choropleth (react-simple-maps fills). */
export function getQuartileFill(q: Quartile): string {
  switch (q) {
    case 1:
      return "#10b981"; // emerald-500
    case 2:
      return "#84cc16"; // lime-500
    case 3:
      return "#f97316"; // orange-500
    case 4:
      return "#ef4444"; // red-500
    case null:
      return "#d1d5db"; // gray-300
  }
}

export function getQuartileLabel(q: Quartile): string {
  if (q === null) return "No data";
  return `Q${q}`;
}
