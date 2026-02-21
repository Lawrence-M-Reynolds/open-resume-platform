import { Link, Outlet, useLocation } from "react-router-dom";

import { APP_PATHS } from "../routes/paths";
import ThemeSettingsButton from "./ThemeSettingsButton";

export default function Layout() {
  const location = useLocation();
  const isTemplatesActive = location.pathname.startsWith(APP_PATHS.templates);
  const isResumesActive = !isTemplatesActive;
  const navItemBaseClass =
    "inline-block py-2 px-3 transition-colors duration-200 font-medium min-h-[44px] flex items-center rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2";
  const navItemClass = (active: boolean) =>
    active
      ? `${navItemBaseClass} text-primary bg-gray-100`
      : `${navItemBaseClass} text-muted hover:text-primary`;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-surface border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <Link
            to={APP_PATHS.home}
            className="inline-flex items-center gap-2 text-lg sm:text-xl font-semibold text-primary hover:text-primary-dark transition-colors duration-200 shrink-0"
          >
            <img
              src="/logo.svg"
              alt="Open Resume logo"
              className="h-8 w-8 rounded-md"
            />
            Open Resume
          </Link>
          <nav className="w-full sm:w-auto flex flex-wrap items-center gap-1">
            <Link
              to={APP_PATHS.home}
              className={navItemClass(isResumesActive)}
              aria-current={isResumesActive ? "page" : undefined}
            >
              Resumes
            </Link>
            <Link
              to={APP_PATHS.templates}
              className={navItemClass(isTemplatesActive)}
              aria-current={isTemplatesActive ? "page" : undefined}
            >
              Templates
            </Link>
            <ThemeSettingsButton className={navItemClass(false)} />
          </nav>
        </div>
      </header>
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
