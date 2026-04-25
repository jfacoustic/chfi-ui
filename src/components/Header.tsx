import { NavLink } from "react-router-dom";
import { Tooltip } from "./Tooltip";

const linkClasses = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-1.5 rounded text-sm font-medium transition ${
    isActive
      ? "bg-blue-600 text-white"
      : "text-gray-700 hover:bg-gray-100"
  }`;

export function Header() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-bold text-gray-900">
            2025 Human Freedom Index Report (2023 data)
          </h1>
          <Tooltip label="Source: Cato Institute, 2025 Human Freedom Index">
            <a
              href="https://www.cato.org/human-freedom-index/2025"
              target="_blank"
              rel="noreferrer"
              aria-label="Source: Cato Institute Human Freedom Index"
              className="inline-flex items-center justify-center w-5 h-5 rounded-full border border-gray-400 text-xs text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              i
            </a>
          </Tooltip>
        </div>
        <nav className="ml-auto flex gap-1" aria-label="Primary">
          <NavLink to="/" end className={linkClasses}>
            Home
          </NavLink>
          <NavLink to="/countries" className={linkClasses}>
            Countries
          </NavLink>
          <NavLink to="/compare" className={linkClasses}>
            Compare
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
