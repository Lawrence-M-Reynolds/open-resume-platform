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
    <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
      <div className="flex items-center gap-4">
        <Link to={backTo} className={linkClass}>
          {backLabel}
        </Link>
        {title != null && title !== '' && (
          <h1 className="text-2xl font-semibold text-gray-800">{title}</h1>
        )}
      </div>
      {actions != null && <div className="flex gap-2">{actions}</div>}
    </div>
  );
}
