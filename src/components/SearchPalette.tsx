import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { useHotkey } from "../hooks/useHotkey";
import { useManifest } from "../hooks/useManifest";
import { CountryFlag } from "./CountryFlag";

const MAX_RESULTS = 10;

export function SearchPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlight, setHighlight] = useState(0);
  const navigate = useNavigate();
  const manifest = useManifest();
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const closePalette = () => {
    setOpen(false);
    setQuery("");
    setHighlight(0);
  };

  // Cmd/Ctrl+K to open.
  useHotkey(
    (e) => {
      e.preventDefault();
      setOpen(true);
    },
    { key: "k", meta: true },
  );

  // Esc closes (only while open).
  useHotkey(closePalette, { key: "Escape", disabled: !open });

  useEffect(() => {
    if (open) {
      // Focus the input on the next tick so the dialog mounts first.
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  const results = useMemo(() => {
    if (manifest.status !== "success") return [];
    const q = query.trim().toLowerCase();
    if (!q) return manifest.data.slice(0, MAX_RESULTS);
    return manifest.data
      .filter(
        (e) =>
          e.country.toLowerCase().includes(q) ||
          e.iso.toLowerCase().includes(q),
      )
      .slice(0, MAX_RESULTS);
  }, [manifest, query]);

  const selectAt = (idx: number) => {
    const choice = results[idx];
    if (!choice) return;
    closePalette();
    navigate(`/country/${choice.iso}`);
  };

  if (!open) return null;
  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Country search"
      className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/40"
      onClick={(e) => {
        if (e.target === e.currentTarget) closePalette();
      }}
    >
      <div
        ref={dialogRef}
        className="w-full max-w-lg rounded-lg bg-white shadow-xl border border-gray-200 dark:bg-gray-800 dark:border-gray-700"
      >
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setHighlight(0);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setHighlight((h) => Math.min(results.length - 1, h + 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setHighlight((h) => Math.max(0, h - 1));
            } else if (e.key === "Enter") {
              e.preventDefault();
              selectAt(highlight);
            }
          }}
          placeholder="Search countries…"
          aria-label="Search countries"
          className="w-full px-4 py-3 text-base bg-transparent border-b border-gray-200 dark:border-gray-700 dark:text-gray-100 focus:outline-none"
        />
        <ul role="listbox" className="max-h-80 overflow-auto">
          {results.length === 0 && (
            <li className="px-4 py-6 text-sm text-gray-500 text-center">
              No countries match
            </li>
          )}
          {results.map((entry, idx) => (
            <li key={entry.iso}>
              <button
                type="button"
                role="option"
                aria-selected={idx === highlight}
                onMouseEnter={() => setHighlight(idx)}
                onClick={() => selectAt(idx)}
                className={`w-full text-left px-4 py-2 flex items-center gap-2 ${
                  idx === highlight
                    ? "bg-blue-50 dark:bg-blue-900/30"
                    : "hover:bg-gray-50 dark:hover:bg-gray-700/40"
                }`}
              >
                <CountryFlag iso={entry.iso} size={24} />
                <span className="flex-1 truncate dark:text-gray-100">
                  {entry.country}
                </span>
                <span className="font-mono text-xs text-gray-500">
                  {entry.iso}
                </span>
              </button>
            </li>
          ))}
        </ul>
        <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-700 text-[10px] text-gray-500 flex items-center justify-between">
          <span>↑↓ navigate</span>
          <span>↵ select</span>
          <span>Esc close</span>
        </div>
      </div>
    </div>,
    document.body,
  );
}
