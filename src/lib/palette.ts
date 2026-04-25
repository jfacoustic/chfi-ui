/**
 * 5-slot deterministic color palette for the compare view. Each ISO3 maps
 * to a stable slot via a tiny hash so removing a country never shifts the
 * remaining colors. Palette tuned for WCAG AA contrast on a white surface.
 */
const PALETTE = [
  "#2563eb", // blue-600
  "#dc2626", // red-600
  "#059669", // emerald-600
  "#d97706", // amber-600
  "#7c3aed", // violet-600
] as const;

export const COMPARE_PALETTE: readonly string[] = PALETTE;

/** Stable hash for short strings (good enough for 165 ISO3 codes). */
function djb2(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = (h * 33) ^ s.charCodeAt(i);
  }
  return h >>> 0;
}

/** Returns the palette color for a given ISO3 code, deterministically. */
export function colorForIso(iso: string): string {
  const idx = djb2(iso.toUpperCase()) % PALETTE.length;
  return PALETTE[idx]!;
}

/**
 * Assigns colors to a list of ISOs. If two ISOs hash to the same slot, the
 * second one bumps to the next free slot so up to 5 selections always get
 * 5 distinct colors. Order of inputs determines tiebreaker.
 */
export function paletteForIsos(isos: readonly string[]): Map<string, string> {
  const out = new Map<string, string>();
  const used = new Set<number>();
  for (const iso of isos) {
    let idx = djb2(iso.toUpperCase()) % PALETTE.length;
    while (used.has(idx) && used.size < PALETTE.length) {
      idx = (idx + 1) % PALETTE.length;
    }
    used.add(idx);
    out.set(iso.toUpperCase(), PALETTE[idx]!);
  }
  return out;
}
