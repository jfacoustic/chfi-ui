import { Tooltip } from "./Tooltip";
import { asIso3 } from "../data/types";
import { useAppStore } from "../store/useAppStore";

interface CompareToggleButtonProps {
  iso: string;
}

const MAX = 5;

export function CompareToggleButton({ iso }: CompareToggleButtonProps) {
  const compared = useAppStore((s) => s.comparedIsos);
  const addCompared = useAppStore((s) => s.addCompared);
  const removeCompared = useAppStore((s) => s.removeCompared);

  const upper = iso.toUpperCase();
  const inList = compared.includes(asIso3(upper));
  const limitReached = compared.length >= MAX && !inList;

  const button = (
    <button
      type="button"
      disabled={limitReached}
      onClick={() => {
        if (inList) removeCompared(asIso3(upper));
        else addCompared(asIso3(upper));
      }}
      className={`px-3 py-1.5 rounded text-sm font-medium border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
        inList
          ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
      } ${limitReached ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {inList ? "Remove from compare" : "Add to compare"}
    </button>
  );

  if (limitReached) {
    return <Tooltip label="Limit reached (5)">{button}</Tooltip>;
  }
  return button;
}
