import type { MetricKey, YearRecord } from "../data/types";
import type { Quartile } from "../components/quartile";

/**
 * Computes per-record quartiles for a given metric across the supplied year
 * data. For `hf_score` we trust the precomputed `hf_quartile` field; for
 * everything else we rank non-null values descending and bucket into 4
 * roughly equal groups (Q1 = top freedom, Q4 = bottom). Records with a null
 * metric value get a `null` quartile.
 */
export function computeQuartiles(
  records: readonly YearRecord[],
  metric: MetricKey,
): Map<string, Quartile> {
  const out = new Map<string, Quartile>();

  if (metric === "hf_score") {
    for (const r of records) {
      out.set(r.iso, r.hf_quartile === null ? null : (r.hf_quartile as Quartile));
    }
    return out;
  }

  // Sort non-null values descending so top scores get Q1.
  const ranked = records
    .filter((r): r is YearRecord & { [K in typeof metric]: number } => {
      const v = r[metric];
      return typeof v === "number";
    })
    .map((r) => ({ iso: r.iso, value: r[metric] as number }))
    .sort((a, b) => b.value - a.value);

  const n = ranked.length;
  if (n === 0) {
    for (const r of records) out.set(r.iso, null);
    return out;
  }

  for (let i = 0; i < n; i++) {
    const pct = (i + 1) / n;
    const q: Quartile =
      pct <= 0.25 ? 1 : pct <= 0.5 ? 2 : pct <= 0.75 ? 3 : 4;
    out.set(ranked[i]!.iso, q);
  }

  for (const r of records) {
    if (!out.has(r.iso)) out.set(r.iso, null);
  }
  return out;
}
