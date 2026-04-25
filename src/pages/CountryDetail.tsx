import { useParams } from "react-router-dom";
import { useUrlSync } from "../hooks/useUrlSync";

export default function CountryDetail() {
  const { iso } = useParams<{ iso: string }>();
  useUrlSync({ year: true });
  return (
    <section>
      <h1 className="text-2xl font-bold text-gray-900">
        Country: {iso?.toUpperCase() ?? "?"}
      </h1>
      <p className="mt-2 text-gray-600">
        Country detail placeholder — implemented in spec 08.
      </p>
    </section>
  );
}
