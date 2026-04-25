import type { CountryTimeseries, MetricKey, TimeseriesPoint } from "../types";
import { ALL_METRICS, MAX_YEAR, MIN_YEAR } from "../types";

function makePoints(seed: number): TimeseriesPoint[] {
  const points: TimeseriesPoint[] = [];
  for (let y = MIN_YEAR; y <= MAX_YEAR; y++) {
    points.push({ year: y, value: seed + (y - MIN_YEAR) * 0.01 });
  }
  return points;
}

function makeSeries(seed: number): Record<MetricKey, TimeseriesPoint[]> {
  const out = {} as Record<MetricKey, TimeseriesPoint[]>;
  ALL_METRICS.forEach((m, i) => {
    out[m] = makePoints(seed + i * 0.1);
  });
  return out;
}

export const timeseriesFixtureUSA: CountryTimeseries = {
  iso: "USA",
  country: "United States",
  region: "North America",
  series: makeSeries(8),
};
