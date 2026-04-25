import { useEffect, useRef, useState } from "react";
import { MAX_YEAR, MIN_YEAR } from "../data/types";
import { YearSlider } from "./YearSlider";

interface YearSliderControlsProps {
  value: number;
  onChange: (year: number) => void;
  /** Animation step interval in ms (default 1000). Exposed for tests. */
  intervalMs?: number;
}

/**
 * Wraps the spec 05 YearSlider with a Play/Pause button. Playing advances
 * the year by 1 every `intervalMs` and wraps from MAX_YEAR back to MIN_YEAR.
 * Manual slider input pauses the animation.
 */
export function YearSliderControls({
  value,
  onChange,
  intervalMs = 1000,
}: YearSliderControlsProps) {
  const [playing, setPlaying] = useState(false);
  const valueRef = useRef(value);
  const onChangeRef = useRef(onChange);

  // Sync mutable refs inside an effect so we don't write during render.
  useEffect(() => {
    valueRef.current = value;
    onChangeRef.current = onChange;
  });

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      const next = valueRef.current >= MAX_YEAR ? MIN_YEAR : valueRef.current + 1;
      onChangeRef.current(next);
    }, intervalMs);
    return () => clearInterval(id);
  }, [playing, intervalMs]);

  const handleSlider = (year: number) => {
    if (playing) setPlaying(false);
    onChange(year);
  };

  return (
    <div className="flex items-center gap-3 w-full">
      <button
        type="button"
        onClick={() => setPlaying((p) => !p)}
        aria-pressed={playing}
        className="px-3 py-1 rounded border border-gray-300 bg-white text-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[4.5rem]"
      >
        {playing ? "Pause" : "Play"}
      </button>
      <div className="flex-1">
        <YearSlider value={value} onChange={handleSlider} />
      </div>
      <span className="text-xs text-gray-500 whitespace-nowrap">
        2025 Report data
      </span>
    </div>
  );
}
