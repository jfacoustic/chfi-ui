import type { ReactNode } from "react";
import { ErrorBoundary } from "./ErrorBoundary";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { SearchPalette } from "./SearchPalette";

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 dark:text-gray-100 flex flex-col">
      <Header />
      <main className="flex-1 w-full max-w-6xl mx-auto p-4 md:p-6">
        <ErrorBoundary>{children}</ErrorBoundary>
      </main>
      <Footer />
      <SearchPalette />
    </div>
  );
}
