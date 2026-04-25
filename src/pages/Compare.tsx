import { useUrlSync } from "../hooks/useUrlSync";

export default function Compare() {
  useUrlSync({ year: true, iso: true });
  return (
    <section>
      <h1 className="text-2xl font-bold text-gray-900">Compare</h1>
      <p className="mt-2 text-gray-600">
        Compare placeholder — implemented in spec 09.
      </p>
    </section>
  );
}
