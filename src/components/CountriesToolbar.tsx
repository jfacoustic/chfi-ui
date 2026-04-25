import type { RegionFilterValue } from "../store/useAppStore";
import { RegionFilter } from "./RegionFilter";
import { YearSelect } from "./YearSelect";

interface CountriesToolbarProps {
  year: number;
  onYearChange: (y: number) => void;
  region: RegionFilterValue;
  onRegionChange: (r: RegionFilterValue) => void;
  query: string;
  onQueryChange: (q: string) => void;
}

export function CountriesToolbar({
  year,
  onYearChange,
  region,
  onRegionChange,
  query,
  onQueryChange,
}: CountriesToolbarProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <YearSelect value={year} onChange={onYearChange} />
        <label className="inline-flex items-center gap-2 text-sm flex-1 min-w-[16ch]">
          <span className="text-gray-700">Search</span>
          <input
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Country name…"
            aria-label="Search countries by name"
            className="flex-1 rounded border border-gray-300 bg-white px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </label>
      </div>
      <RegionFilter value={region} onChange={onRegionChange} />
    </div>
  );
}
