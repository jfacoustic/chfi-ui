import { MAX_YEAR, MIN_YEAR } from "../data/types";

interface YearSelectProps {
  value: number;
  onChange: (year: number) => void;
  id?: string;
}

/**
 * Compact dropdown variant of the year picker, used by the countries
 * table toolbar where horizontal space is at a premium and precision
 * matters more than scrubbing.
 */
export function YearSelect({ value, onChange, id }: YearSelectProps) {
  const years: number[] = [];
  for (let y = MAX_YEAR; y >= MIN_YEAR; y--) years.push(y);
  return (
    <label className="inline-flex items-center gap-2 text-sm">
      <span className="text-gray-700">Year</span>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="rounded border border-gray-300 bg-white px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {years.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
    </label>
  );
}
