import { useUrlSync } from "../hooks/useUrlSync";

export default function Countries() {
  useUrlSync({ year: true, region: true });
  return (
    <section>
      <h1 className="text-2xl font-bold text-gray-900">Countries</h1>
      <p className="mt-2 text-gray-600">
        Sortable table placeholder — implemented in spec 07.
      </p>
    </section>
  );
}
