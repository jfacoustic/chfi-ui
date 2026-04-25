import { Link } from "react-router-dom";
import { Badge } from "./Badge";
import { CountryFlag } from "./CountryFlag";

interface CountryHeaderProps {
  iso: string;
  name: string;
  region: string;
  /** Optional back link target. Defaults to the heat map. */
  backTo?: string;
  backLabel?: string;
}

export function CountryHeader({
  iso,
  name,
  region,
  backTo = "/",
  backLabel = "Back to map",
}: CountryHeaderProps) {
  return (
    <header className="flex flex-wrap items-center gap-3">
      <CountryFlag iso={iso} size={48} />
      <div className="flex-1 min-w-0">
        <h1 className="text-2xl font-bold text-gray-900 truncate">{name}</h1>
        <div className="mt-1 flex items-center gap-2 text-sm text-gray-600">
          <Badge tone="gray">{region}</Badge>
          <span className="font-mono">{iso}</span>
        </div>
      </div>
      <Link
        to={backTo}
        className="text-sm text-blue-600 hover:underline whitespace-nowrap"
      >
        ← {backLabel}
      </Link>
    </header>
  );
}
