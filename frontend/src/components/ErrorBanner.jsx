/**
 * Inline error message with optional action (e.g. Retry, Back to list).
 * @param {string} message - Error text to show
 * @param {React.ReactNode} [action] - Optional button or link below the message
 * @param {boolean} [compact] - If true, use smaller padding and text (e.g. inside forms)
 */
export default function ErrorBanner({ message, action, compact = false }) {
  const baseClass = 'bg-error/10 border border-error/30 text-error rounded-lg';
  const paddingClass = compact ? 'p-3 text-sm' : 'p-4';

  return (
    <div className={`${baseClass} ${paddingClass}`}>
      {compact ? message : <p>{message}</p>}
      {action && !compact && <div className="mt-3">{action}</div>}
    </div>
  );
}
