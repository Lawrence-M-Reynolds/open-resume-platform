import type { ReactNode } from 'react';

interface ErrorBannerProps {
  message: string;
  action?: ReactNode;
  compact?: boolean;
}

export default function ErrorBanner({
  message,
  action,
  compact = false,
}: ErrorBannerProps) {
  const baseClass = 'bg-error/10 border border-error/30 text-error rounded-lg';
  const paddingClass = compact ? 'p-3 text-sm' : 'p-4';

  return (
    <div
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      className={`${baseClass} ${paddingClass}`}
    >
      <div className="flex items-start gap-2">
        <span
          aria-hidden="true"
          className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-error/20 text-xs font-semibold mt-0.5"
        >
          !
        </span>
        <div className="min-w-0">
          {compact ? message : <p>{message}</p>}
          {action && !compact && <div className="mt-3">{action}</div>}
        </div>
      </div>
    </div>
  );
}
