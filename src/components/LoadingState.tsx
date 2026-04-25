import { Spinner } from "./Spinner";

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = "Loading…" }: LoadingStateProps) {
  return (
    <div
      role="status"
      className="flex flex-col items-center justify-center py-16 gap-3 text-gray-600"
    >
      <Spinner size={32} />
      <span>{message}</span>
    </div>
  );
}
