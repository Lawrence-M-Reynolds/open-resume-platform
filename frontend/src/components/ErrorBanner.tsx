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
    <div className={`${baseClass} ${paddingClass}`}>
      {compact ? message : <p>{message}</p>}
      {action && !compact && <div className="mt-3">{action}</div>}
    </div>
  );
}
