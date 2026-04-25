import { useState } from "react";
import { flagUrl, iso3ToIso2 } from "../lib/iso";

interface CountryFlagProps {
  iso: string;
  size?: 16 | 24 | 32 | 48 | 64;
  alt?: string;
}

/**
 * Renders the country flag from flagcdn.com via the ISO3→ISO2 mapping.
 * Falls back to a glyph placeholder when no mapping exists or the image
 * fails to load.
 */
export function CountryFlag({ iso, size = 24, alt }: CountryFlagProps) {
  const iso2 = iso3ToIso2(iso);
  const url = flagUrl(iso, size);
  const [errored, setErrored] = useState(false);

  if (!iso2 || !url || errored) {
    return (
      <span
        role="img"
        aria-label={alt ?? `${iso} flag unavailable`}
        className="inline-flex items-center justify-center bg-gray-200 text-gray-500 text-[10px] rounded"
        style={{ width: size, height: Math.round((size * 3) / 4) }}
      >
        ?
      </span>
    );
  }

  return (
    <img
      src={url}
      alt={alt ?? `${iso} flag`}
      width={size}
      height={Math.round((size * 3) / 4)}
      onError={() => setErrored(true)}
      className="inline-block rounded-sm shadow-sm"
      loading="lazy"
    />
  );
}
