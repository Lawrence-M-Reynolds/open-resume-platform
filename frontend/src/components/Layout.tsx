import { Link, Outlet } from "react-router-dom";

import { APP_PATHS } from "../routes/paths";

export default function Layout() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-surface border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-2">
          <Link
            to={APP_PATHS.home}
            className="text-lg sm:text-xl font-semibold text-primary hover:text-primary-dark transition-colors duration-200 shrink-0"
          >
            Open Resume
          </Link>
          <nav className="flex items-center gap-1">
            <Link
              to={APP_PATHS.home}
              className="inline-block py-2 px-3 text-muted hover:text-primary transition-colors duration-200 font-medium min-h-[44px] flex items-center"
            >
              Resumes
            </Link>
            <Link
              to={APP_PATHS.templates}
              className="inline-block py-2 px-3 text-muted hover:text-primary transition-colors duration-200 font-medium min-h-[44px] flex items-center"
            >
              Templates
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
