#!/usr/bin/env node
/**
 * scripts/transform.mjs — Spec 02 data pipeline.
 *
 * Reads the column-oriented `2025-human-freedom-index.json` from the repo
 * root and emits the per-year, per-country, and manifest artifacts the UI
 * lazy-loads at runtime. The source file is large (~8.4 MB) and must never
 * be imported into the client bundle.
 *
 * Pure helpers are exported so they can be unit-tested without touching
 * the filesystem; `main()` is invoked only when this file is the entry
 * module.
 */

import { readFile, writeFile, mkdir, rm, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPO_ROOT = resolve(__dirname, "..");

// --- Field definitions (locked by spec 02 §17) -----------------------------

/** Whitelisted fields for `public/data/years/{year}.json` records. */
export const TRIMMED_FIELDS = [
  "iso",
  "country",
  "region",
  "year",
  "hf_score",
  "hf_rank",
  "hf_quartile",
  "pf_score",
  "pf_rank",
  "ef_score",
  "ef_rank",
  "pf_rol",
  "pf_ss",
  "pf_movement",
  "pf_religion",
  "pf_assembly",
  "pf_expression",
  "pf_identity",
  "ef_government",
  "ef_legal",
  "ef_money",
  "ef_trade",
  "ef_regulation",
];

/** Metrics emitted in `public/data/timeseries/{ISO}.json` series. */
export const TIMESERIES_METRICS = [
  "hf_score",
  "pf_score",
  "ef_score",
  "pf_rol",
  "pf_ss",
  "pf_movement",
  "pf_religion",
  "pf_assembly",
  "pf_expression",
  "pf_identity",
  "ef_government",
  "ef_legal",
  "ef_money",
  "ef_trade",
  "ef_regulation",
];

const EXPECTED_YEARS = Array.from({ length: 24 }, (_, i) => 2000 + i);
const EXPECTED_ROW_COUNT = 3960;
const EXPECTED_COUNTRY_COUNT = 165;

// --- Pure helpers ----------------------------------------------------------

/**
 * Transpose a Pandas `to_json` (default orient="columns") payload into an
 * array of row records.
 *
 * @param {Record<string, Record<string, unknown>>} columns
 * @returns {Array<Record<string, unknown>>}
 */
export function transpose(columns) {
  if (columns === null || typeof columns !== "object") {
    throw new Error("transpose: input must be an object");
  }
  const colNames = Object.keys(columns);
  if (colNames.length === 0) return [];

  // Determine row index set from the first column. Pandas writes string
  // numeric keys for the row index; we keep them as strings while iterating.
  const indexKeys = Object.keys(columns[colNames[0]]);
  const rows = new Array(indexKeys.length);
  for (let i = 0; i < indexKeys.length; i++) {
    const key = indexKeys[i];
    const row = {};
    for (const col of colNames) {
      row[col] = columns[col][key];
    }
    rows[i] = row;
  }
  return rows;
}

/**
 * Validate the shape of a row dataset. Throws on the first failure with a
 * message that names the offending field/value so the script's exit code is
 * meaningful in CI.
 *
 * @param {Array<Record<string, unknown>>} rows
 * @param {{ expectedRows?: number, expectedYears?: number[], expectedCountries?: number }} [options]
 */
export function validate(rows, options = {}) {
  if (!Array.isArray(rows) || rows.length === 0) {
    throw new Error("validate: rows must be a non-empty array");
  }

  const required = ["year", "iso", "countries", "region"];
  for (const field of required) {
    if (!(field in rows[0])) {
      throw new Error(`validate: required column "${field}" is missing`);
    }
  }

  if (
    options.expectedRows !== undefined &&
    rows.length !== options.expectedRows
  ) {
    throw new Error(
      `validate: expected ${options.expectedRows} rows, got ${rows.length}`,
    );
  }

  const years = new Set();
  const isos = new Set();
  for (const row of rows) {
    if (row.year != null) years.add(row.year);
    if (row.iso) isos.add(row.iso);
    if (!row.iso) {
      throw new Error(
        `validate: row missing iso (year=${row.year}, country=${row.countries})`,
      );
    }
  }

  if (options.expectedYears) {
    for (const y of options.expectedYears) {
      if (!years.has(y)) {
        throw new Error(`validate: expected year ${y} missing from data`);
      }
    }
  }

  if (
    options.expectedCountries !== undefined &&
    isos.size !== options.expectedCountries
  ) {
    throw new Error(
      `validate: expected ${options.expectedCountries} unique ISO codes, got ${isos.size}`,
    );
  }
}

/**
 * Trim a raw row to the whitelisted per-year fields, renaming `countries` to
 * `country`. Any whitelisted field absent from the source is set to `null`
 * (distinguishing "no data" from a real score of 0).
 *
 * @param {Record<string, unknown>} raw
 * @returns {Record<string, unknown>}
 */
export function trimYearRecord(raw) {
  const out = {};
  for (const f of TRIMMED_FIELDS) {
    if (f === "country") {
      out.country = raw.country ?? raw.countries ?? null;
    } else if (f in raw) {
      out[f] = raw[f];
    } else {
      out[f] = null;
    }
  }
  return out;
}

/**
 * Build the deduped `{iso, country, region}[]` manifest sorted by country
 * name. The most recent year's metadata wins for any per-ISO collision (in
 * practice the values are stable across the time series).
 *
 * @param {Array<Record<string, unknown>>} rows
 */
export function buildIndex(rows) {
  /** @type {Map<string, { iso: string, country: string, region: string, year: number }>} */
  const byIso = new Map();
  for (const row of rows) {
    const iso = row.iso;
    if (!iso) continue;
    const country = row.country ?? row.countries ?? null;
    const region = row.region ?? null;
    const year = typeof row.year === "number" ? row.year : -Infinity;
    const existing = byIso.get(iso);
    if (!existing || year > existing.year) {
      byIso.set(iso, { iso, country, region, year });
    }
  }
  return Array.from(byIso.values())
    .map(({ iso, country, region }) => ({ iso, country, region }))
    .sort((a, b) =>
      (a.country ?? "").localeCompare(b.country ?? "", "en", {
        sensitivity: "base",
      }),
    );
}

/**
 * Build per-country timeseries, keyed by ISO3. Each entry has the country
 * metadata plus a `series` object with one sorted `[{year, value}]` array
 * per declared timeseries metric.
 *
 * @param {Array<Record<string, unknown>>} rows
 */
export function buildTimeseries(rows) {
  /** @type {Record<string, any>} */
  const out = {};
  for (const row of rows) {
    const iso = row.iso;
    if (!iso) continue;
    let entry = out[iso];
    if (!entry) {
      entry = {
        iso,
        country: row.country ?? row.countries ?? null,
        region: row.region ?? null,
        series: Object.fromEntries(TIMESERIES_METRICS.map((m) => [m, []])),
      };
      out[iso] = entry;
    }
    for (const metric of TIMESERIES_METRICS) {
      const value = metric in row ? row[metric] : null;
      entry.series[metric].push({ year: row.year, value: value ?? null });
    }
  }
  // Sort each metric series by year ascending so consumers can render lines
  // without reshuffling.
  for (const entry of Object.values(out)) {
    for (const metric of TIMESERIES_METRICS) {
      entry.series[metric].sort((a, b) => a.year - b.year);
    }
  }
  return out;
}

// --- Filesystem orchestration ---------------------------------------------

const SOURCE_PATH = resolve(REPO_ROOT, "2025-human-freedom-index.json");
const OUTPUT_DIR = resolve(REPO_ROOT, "public", "data");
const YEARS_DIR = resolve(OUTPUT_DIR, "years");
const TIMESERIES_DIR = resolve(OUTPUT_DIR, "timeseries");
const INDEX_PATH = resolve(OUTPUT_DIR, "index.json");

async function ensureCleanDir(path) {
  if (existsSync(path)) {
    await rm(path, { recursive: true, force: true });
  }
  await mkdir(path, { recursive: true });
}

/**
 * Stable JSON.stringify with sorted object keys, so re-running the script
 * produces byte-identical output for the same input.
 */
function stableStringify(value, pretty = false) {
  const replacer = (_key, val) => {
    if (val && typeof val === "object" && !Array.isArray(val)) {
      const sorted = {};
      for (const k of Object.keys(val).sort()) sorted[k] = val[k];
      return sorted;
    }
    return val;
  };
  return pretty
    ? JSON.stringify(value, replacer, 2)
    : JSON.stringify(value, replacer);
}

/**
 * Per-record stringify that preserves the spec field order (and matches the
 * TS types in spec 03), but is still deterministic.
 */
function stringifyOrderedRecords(records) {
  const ordered = records.map((r) => {
    const o = {};
    for (const f of TRIMMED_FIELDS) o[f] = r[f] ?? null;
    return o;
  });
  return JSON.stringify(ordered);
}

function stringifyTimeseriesEntry(entry) {
  // Preserve a stable key order at the top level for readability/diffability.
  const ordered = {
    iso: entry.iso,
    country: entry.country,
    region: entry.region,
    series: Object.fromEntries(
      TIMESERIES_METRICS.map((m) => [m, entry.series[m]]),
    ),
  };
  return JSON.stringify(ordered);
}

/**
 * Run the full pipeline. Returns a summary object the caller can log or
 * surface to CI.
 */
export async function run({
  sourcePath = SOURCE_PATH,
  outputDir = OUTPUT_DIR,
} = {}) {
  const yearsDir = resolve(outputDir, "years");
  const timeseriesDir = resolve(outputDir, "timeseries");
  const indexPath = resolve(outputDir, "index.json");

  const rawText = await readFile(sourcePath, "utf8");
  const columns = JSON.parse(rawText);
  const rows = transpose(columns);

  validate(rows, {
    expectedRows: EXPECTED_ROW_COUNT,
    expectedYears: EXPECTED_YEARS,
    expectedCountries: EXPECTED_COUNTRY_COUNT,
  });

  // Pre-trim once; both the per-year arrays and the manifest can read from
  // the same trimmed records.
  const trimmed = rows.map(trimYearRecord);

  await mkdir(outputDir, { recursive: true });
  await ensureCleanDir(yearsDir);
  await ensureCleanDir(timeseriesDir);

  // index.json — pretty-printed, ~10 KB.
  const index = buildIndex(trimmed);
  await writeFile(indexPath, stableStringify(index, true), "utf8");

  // years/{year}.json — minified.
  const byYear = new Map();
  for (const r of trimmed) {
    if (!byYear.has(r.year)) byYear.set(r.year, []);
    byYear.get(r.year).push(r);
  }
  for (const [year, records] of byYear) {
    // Sort within each year by country for deterministic output.
    records.sort((a, b) =>
      (a.country ?? "").localeCompare(b.country ?? "", "en", {
        sensitivity: "base",
      }),
    );
    const filePath = resolve(yearsDir, `${year}.json`);
    await writeFile(filePath, stringifyOrderedRecords(records), "utf8");
  }

  // timeseries/{ISO}.json — minified.
  const timeseries = buildTimeseries(trimmed);
  for (const [iso, entry] of Object.entries(timeseries)) {
    const filePath = resolve(timeseriesDir, `${iso}.json`);
    await writeFile(filePath, stringifyTimeseriesEntry(entry), "utf8");
  }

  return {
    rowCount: rows.length,
    countryCount: index.length,
    yearRange: [Math.min(...byYear.keys()), Math.max(...byYear.keys())],
    yearFileCount: byYear.size,
    timeseriesFileCount: Object.keys(timeseries).length,
    outputDir,
  };
}

async function dirSize(path) {
  if (!existsSync(path)) return 0;
  let total = 0;
  const { readdir } = await import("node:fs/promises");
  const entries = await readdir(path, { withFileTypes: true });
  for (const e of entries) {
    const p = resolve(path, e.name);
    if (e.isDirectory()) total += await dirSize(p);
    else total += (await stat(p)).size;
  }
  return total;
}

async function main() {
  const summary = await run();
  const totalBytes = await dirSize(summary.outputDir);
  const mb = (totalBytes / 1024 / 1024).toFixed(2);
  console.log("✓ transform complete");
  console.log(`  rows:        ${summary.rowCount}`);
  console.log(`  countries:   ${summary.countryCount}`);
  console.log(
    `  years:       ${summary.yearRange[0]}–${summary.yearRange[1]} (${summary.yearFileCount} files)`,
  );
  console.log(`  timeseries:  ${summary.timeseriesFileCount} files`);
  console.log(`  output:      ${summary.outputDir}`);
  console.log(`  total size:  ${totalBytes} bytes (${mb} MB)`);
}

// Run only when invoked directly, not when imported by tests.
const isMain =
  process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url;
if (isMain) {
  main().catch((err) => {
    console.error("✗ transform failed:", err.message);
    process.exitCode = 1;
  });
}
