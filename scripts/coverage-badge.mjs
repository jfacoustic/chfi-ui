#!/usr/bin/env node
/**
 * Reads coverage/coverage-summary.json (produced by `vitest run --coverage`
 * with the `json-summary` reporter) and writes a static shields-style SVG
 * badge to public/coverage-badge.svg so the README can reference it without
 * any third-party service.
 *
 * Run via: `npm run test:coverage` (chained) or `npm run coverage:badge`.
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, "..");

const SUMMARY_PATH = resolve(ROOT, "coverage/coverage-summary.json");
const BADGE_PATH = resolve(ROOT, "public/coverage-badge.svg");

/**
 * Map a coverage percentage to a shields.io-style color hex.
 * Bands: ≥90 brightgreen, ≥80 green, ≥70 yellowgreen, ≥60 yellow,
 * ≥50 orange, else red.
 */
export function pickColor(pct) {
  if (pct >= 90) return "#4c1";
  if (pct >= 80) return "#97CA00";
  if (pct >= 70) return "#a4a61d";
  if (pct >= 60) return "#dfb317";
  if (pct >= 50) return "#fe7d37";
  return "#e05d44";
}

/**
 * Format a percentage for display: one decimal, trailing zero trimmed,
 * always suffixed with "%".
 */
export function formatPct(pct) {
  const rounded = Math.round(pct * 10) / 10;
  const str = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
  return `${str}%`;
}

/**
 * Approximate text width for the default Verdana 11px label so we can size
 * the rectangles. Matches the heuristic shields.io uses (≈7px per char + 10
 * padding); good enough for two- to five-character coverage values.
 */
function textWidth(text) {
  return Math.max(text.length * 7 + 10, 30);
}

/**
 * Build a shields-style flat SVG badge. No external fonts; relies on the
 * viewer's default sans-serif fallback for the Verdana stack.
 */
export function renderBadge({ label, value, color }) {
  const labelWidth = textWidth(label);
  const valueWidth = textWidth(value);
  const totalWidth = labelWidth + valueWidth;
  const labelTextX = labelWidth / 2;
  const valueTextX = labelWidth + valueWidth / 2;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="20" role="img" aria-label="${label}: ${value}"><title>${label}: ${value}</title><linearGradient id="s" x2="0" y2="100%"><stop offset="0" stop-color="#bbb" stop-opacity=".1"/><stop offset="1" stop-opacity=".1"/></linearGradient><clipPath id="r"><rect width="${totalWidth}" height="20" rx="3" fill="#fff"/></clipPath><g clip-path="url(#r)"><rect width="${labelWidth}" height="20" fill="#555"/><rect x="${labelWidth}" width="${valueWidth}" height="20" fill="${color}"/><rect width="${totalWidth}" height="20" fill="url(#s)"/></g><g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" text-rendering="geometricPrecision" font-size="110"><text aria-hidden="true" x="${labelTextX * 10}" y="150" fill="#010101" fill-opacity=".3" transform="scale(.1)" textLength="${(labelWidth - 10) * 10}">${label}</text><text x="${labelTextX * 10}" y="140" transform="scale(.1)" fill="#fff" textLength="${(labelWidth - 10) * 10}">${label}</text><text aria-hidden="true" x="${valueTextX * 10}" y="150" fill="#010101" fill-opacity=".3" transform="scale(.1)" textLength="${(valueWidth - 10) * 10}">${value}</text><text x="${valueTextX * 10}" y="140" transform="scale(.1)" fill="#fff" textLength="${(valueWidth - 10) * 10}">${value}</text></g></svg>`;
}

async function main() {
  if (!existsSync(SUMMARY_PATH)) {
    console.error(
      `coverage-badge: ${SUMMARY_PATH} not found. Run \`npm run test:coverage\` first.`,
    );
    process.exit(1);
  }
  const raw = await readFile(SUMMARY_PATH, "utf8");
  const summary = JSON.parse(raw);
  const pct = summary?.total?.lines?.pct;
  if (typeof pct !== "number") {
    console.error("coverage-badge: total.lines.pct missing from coverage summary.");
    process.exit(1);
  }

  const svg = renderBadge({
    label: "coverage",
    value: formatPct(pct),
    color: pickColor(pct),
  });

  await mkdir(dirname(BADGE_PATH), { recursive: true });
  await writeFile(BADGE_PATH, svg, "utf8");
  console.log(`coverage-badge: wrote ${BADGE_PATH} (${formatPct(pct)} lines).`);
}

// Only run when invoked directly, not when imported by tests.
const isMain =
  process.argv[1] && resolve(process.argv[1]) === resolve(__filename);
if (isMain) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
