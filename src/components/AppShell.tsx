import type { ReactNode } from "react";

/**
 * Minimal shell stub for spec 04. Spec 05 replaces this with the real
 * header/footer/error-boundary layout.
 */
export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-6xl mx-auto p-8">{children}</main>
    </div>
  );
}
