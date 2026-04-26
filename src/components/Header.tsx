import { NavLink } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle";
import { Tooltip } from "./Tooltip";

const linkClasses = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-1.5 rounded text-sm font-medium transition ${
    isActive
      ? "bg-blue-600 text-white"
      : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
  }`;

export function Header() {
  return (
    <header className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 min-w-0">
          <h1 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-50 truncate">
            2025 Human Freedom Index Report (2023 data)
          </h1>
          <Tooltip label="Source: Cato Institute, 2025 Human Freedom Index">
            <a
              href="https://www.cato.org/human-freedom-index/2025"
              target="_blank"
              rel="noreferrer"
              aria-label="Source: Cato Institute Human Freedom Index"
              className="inline-flex items-center justify-center w-5 h-5 rounded-full border border-gray-400 dark:border-gray-500 text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              i
            </a>
          </Tooltip>
        </div>
        <nav className="ml-auto flex items-center gap-1" aria-label="Primary">
          <NavLink to="/" end className={linkClasses}>
            Home
          </NavLink>
          <NavLink to="/countries" className={linkClasses}>
            Countries
          </NavLink>
          <NavLink to="/compare" className={linkClasses}>
            Compare
          </NavLink>
          <span className="ml-1">
            <ThemeToggle />
          </span>
        </nav>
      </div>
    </header>
  );
}
