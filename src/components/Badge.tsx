import type { HTMLAttributes, ReactNode } from "react";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  tone?: "neutral" | "blue" | "green" | "red" | "yellow" | "gray";
}

const TONE: Record<NonNullable<BadgeProps["tone"]>, string> = {
  neutral: "bg-gray-100 text-gray-700",
  blue: "bg-blue-100 text-blue-700",
  green: "bg-emerald-100 text-emerald-700",
  red: "bg-red-100 text-red-700",
  yellow: "bg-amber-100 text-amber-700",
  gray: "bg-gray-200 text-gray-600",
};

export function Badge({
  children,
  tone = "neutral",
  className = "",
  ...rest
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${TONE[tone]} ${className}`}
      {...rest}
    >
      {children}
    </span>
  );
}
