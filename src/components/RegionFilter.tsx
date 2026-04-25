import { REGIONS } from "../data/regions";
import type { RegionFilterValue } from "../store/useAppStore";

interface RegionFilterProps {
  value: RegionFilterValue;
  onChange: (r: RegionFilterValue) => void;
}

export function RegionFilter({ value, onChange }: RegionFilterProps) {
  return (
    <div
      role="group"
      aria-label="Filter by region"
      className="flex flex-wrap gap-1"
    >
      <Chip selected={value === "all"} onClick={() => onChange("all")}>
        All
      </Chip>
      {REGIONS.map((r) => (
        <Chip
          key={r}
          selected={value === r}
          onClick={() => onChange(value === r ? "all" : r)}
        >
          {r}
        </Chip>
      ))}
    </div>
  );
}

function Chip({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`px-2 py-1 rounded-full text-xs border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
        selected
          ? "bg-blue-600 text-white border-blue-600"
          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
      }`}
    >
      {children}
    </button>
  );
}
