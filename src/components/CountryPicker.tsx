import { useMemo, useState } from "react";
import { useManifest } from "../hooks/useManifest";
import { asIso3, type CountryManifestEntry, type Iso3 } from "../data/types";
import { CountryFlag } from "./CountryFlag";
import { Tooltip } from "./Tooltip";

interface CountryPickerProps {
  selected: Iso3[];
  onAdd: (iso: Iso3) => boolean;
  onRemove: (iso: Iso3) => void;
  /** Soft-cap; matching the store's MAX_COMPARED. */
  max?: number;
}

const MAX_RESULTS = 8;

export function CountryPicker({
  selected,
  onAdd,
  onRemove,
  max = 5,
}: CountryPickerProps) {
  const manifest = useManifest();
  const [query, setQuery] = useState("");

  const limitReached = selected.length >= max;

  const matches = useMemo<CountryManifestEntry[]>(() => {
    if (manifest.status !== "success") return [];
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return manifest.data
      .filter((e) => !selected.includes(asIso3(e.iso)))
      .filter(
        (e) =>
          e.country.toLowerCase().includes(q) ||
          e.iso.toLowerCase().includes(q),
      )
      .slice(0, MAX_RESULTS);
  }, [manifest, query, selected]);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        {selected.length === 0 && (
          <span className="text-sm text-gray-500">
            Pick up to {max} countries to compare.
          </span>
        )}
        {selected.map((iso) => {
          const entry = manifest.status === "success"
            ? manifest.data.find((e) => e.iso === iso)
            : null;
          return (
            <span
              key={iso}
              className="inline-flex items-center gap-2 px-2 py-1 rounded-full bg-blue-50 border border-blue-200 text-sm"
            >
              <CountryFlag iso={iso} size={16} />
              <span className="font-medium">{entry?.country ?? iso}</span>
              <button
                type="button"
                aria-label={`Remove ${entry?.country ?? iso}`}
                onClick={() => onRemove(iso)}
                className="text-gray-500 hover:text-gray-800"
              >
                ×
              </button>
            </span>
          );
        })}
      </div>

      <div className="relative">
        {limitReached ? (
          <Tooltip label="Limit reached (5)">
            <input
              type="search"
              disabled
              placeholder="Limit reached — remove a country to add another"
              aria-label="Search countries"
              className="w-full rounded border border-gray-300 bg-gray-100 px-2 py-1.5 text-sm cursor-not-allowed"
            />
          </Tooltip>
        ) : (
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by country name or ISO3…"
            aria-label="Search countries"
            className="w-full rounded border border-gray-300 bg-white px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        )}
        {!limitReached && matches.length > 0 && (
          <ul
            role="listbox"
            className="absolute left-0 right-0 mt-1 z-30 max-h-72 overflow-auto rounded-md border border-gray-200 bg-white shadow-lg"
          >
            {matches.map((m) => (
              <li key={m.iso}>
                <button
                  type="button"
                  role="option"
                  aria-selected={false}
                  onClick={() => {
                    if (onAdd(asIso3(m.iso))) setQuery("");
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-gray-100 flex items-center gap-2"
                >
                  <CountryFlag iso={m.iso} size={24} />
                  <span className="flex-1 truncate">{m.country}</span>
                  <span className="font-mono text-xs text-gray-500">
                    {m.iso}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
