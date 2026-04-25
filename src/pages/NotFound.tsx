import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <section className="text-center py-16">
      <h1 className="text-4xl font-bold text-gray-900">404</h1>
      <p className="mt-2 text-gray-600">That page does not exist.</p>
      <Link
        to="/"
        className="mt-6 inline-block text-blue-600 hover:underline"
      >
        Back to the heat map
      </Link>
    </section>
  );
}
