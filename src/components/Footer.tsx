export function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 mt-12">
      <div className="max-w-6xl mx-auto px-4 py-4 text-xs text-gray-600 dark:text-gray-300 flex flex-wrap items-center justify-between gap-2">
        <span>
          Data:{" "}
          <a
            href="https://www.cato.org/human-freedom-index/2025"
            target="_blank"
            rel="noreferrer"
            className="text-blue-600 hover:underline"
          >
            Cato Institute — 2025 Human Freedom Index
          </a>
          . Latest data point: 2023.
        </span>
        <span className="text-gray-500">Built with React + Vite.</span>
      </div>
    </footer>
  );
}
