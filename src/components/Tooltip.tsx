import { useId, useState, type ReactNode } from "react";

interface TooltipProps {
  /** The text shown in the tooltip bubble. */
  label: string;
  /** The trigger element (focusable). */
  children: ReactNode;
}

/**
 * Minimal accessible tooltip. Visible on hover and on keyboard focus.
 * The trigger receives `aria-describedby` so screen readers announce the
 * tooltip content when focused.
 */
export function Tooltip({ label, children }: TooltipProps) {
  const [open, setOpen] = useState(false);
  const id = useId();

  return (
    <span className="relative inline-flex">
      <span
        aria-describedby={open ? id : undefined}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="inline-flex"
      >
        {children}
      </span>
      {open && (
        <span
          role="tooltip"
          id={id}
          className="absolute left-1/2 -translate-x-1/2 top-full mt-1 px-2 py-1 rounded bg-gray-900 text-white text-xs whitespace-nowrap z-50 shadow"
        >
          {label}
        </span>
      )}
    </span>
  );
}
