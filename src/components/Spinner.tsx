interface SpinnerProps {
  size?: number;
  label?: string;
}

export function Spinner({ size = 24, label = "Loading" }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label={label}
      className="inline-block animate-spin rounded-full border-2 border-gray-300 border-t-gray-700"
      style={{ width: size, height: size }}
    />
  );
}
