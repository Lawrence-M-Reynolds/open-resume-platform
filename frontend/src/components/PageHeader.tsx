import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';

const linkClass = 'text-muted hover:text-primary transition-colors duration-200 text-sm font-medium';

interface PageHeaderProps {
  backTo: string;
  backLabel: string;
  title?: string | null;
  actions?: ReactNode;
}

export default function PageHeader({
  backTo,
  backLabel,
  title = null,
  actions,
}: PageHeaderProps) {
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
