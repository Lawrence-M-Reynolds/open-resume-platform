import { Link } from 'react-router-dom';

const linkClass = 'text-muted hover:text-primary transition-colors duration-200 text-sm font-medium';

/**
 * Page header with back link, optional title, and optional actions (e.g. buttons).
 * @param {string} backTo - Path for the back link
 * @param {string} backLabel - Label for the back link (e.g. "← Resumes")
 * @param {string | null} [title] - Optional page title (h1). Omit or null for loading/error views
 * @param {React.ReactNode} [actions] - Optional actions to show on the right (e.g. Edit + Download)
 */
export default function PageHeader({ backTo, backLabel, title = null, actions }) {
  return (
    <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
      <div className="flex flex-wrap items-center gap-2 sm:gap-4 min-w-0">
        <Link to={backTo} className={`${linkClass} min-h-[44px] flex items-center shrink-0`}>
          {backLabel}
        </Link>
        {title != null && title !== '' && (
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-800 break-words min-w-0">
            {title}
          </h1>
        )}
      </div>
      {actions != null && (
        <div className="flex flex-wrap gap-2 shrink-0">{actions}</div>
      )}
    </div>
  );
}
