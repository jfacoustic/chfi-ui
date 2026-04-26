import { useEffect } from "react";

interface HotkeyOptions {
  /** The key to listen for (case-insensitive). */
  key: string;
  /** Require Cmd (mac) / Ctrl (other). Defaults to false. */
  meta?: boolean;
  /** Disable the listener; useful when something else owns focus. */
  disabled?: boolean;
}

/**
 * Registers a global keydown listener for a single hotkey. Cleans up on
 * unmount and on dependency change so consumers don't leak listeners.
 */
export function useHotkey(
  handler: (e: KeyboardEvent) => void,
  { key, meta = false, disabled = false }: HotkeyOptions,
): void {
  useEffect(() => {
    if (disabled) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== key.toLowerCase()) return;
      if (meta && !(e.metaKey || e.ctrlKey)) return;
      handler(e);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handler, key, meta, disabled]);
}
