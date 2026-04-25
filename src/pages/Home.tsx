import { useUrlSync } from "../hooks/useUrlSync";

export default function Home() {
  useUrlSync({ year: true, metric: true, region: true });
  return (
    <section>
      <h1 className="text-2xl font-bold text-gray-900">Heat Map</h1>
      <p className="mt-2 text-gray-600">
        World map placeholder — implemented in spec 06.
      </p>
    </section>
  );
}
