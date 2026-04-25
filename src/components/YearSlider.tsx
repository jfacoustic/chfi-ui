import { MAX_YEAR, MIN_YEAR } from "../data/types";

interface YearSliderProps {
  value: number;
  onChange: (year: number) => void;
  min?: number;
  max?: number;
  id?: string;
}

export function YearSlider({
  value,
  onChange,
  min = MIN_YEAR,
  max = MAX_YEAR,
  id,
}: YearSliderProps) {
  return (
    <label className="flex items-center gap-3 text-sm w-full">
      <span className="text-gray-700 whitespace-nowrap">Year</span>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        className="flex-1 accent-blue-600"
      />
      <span
        aria-live="polite"
        className="tabular-nums font-semibold text-gray-900 min-w-[3.5ch] text-right"
      >
        {value}
      </span>
    </label>
  );
}
