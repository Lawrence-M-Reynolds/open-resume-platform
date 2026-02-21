/**
 * Reusable card-style loading skeleton. Use for lists (resumes, etc.).
 * @param {number} count - Number of skeleton cards to show (default 3)
 */
export default function LoadingSkeleton({ count = 3 }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="bg-surface rounded-lg border border-gray-200 p-5 animate-pulse"
        >
          <div className="h-5 bg-gray-200 rounded w-1/3 mb-3" />
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2" />
          <div className="h-4 bg-gray-200 rounded w-1/6" />
        </div>
      ))}
    </div>
  );
}
