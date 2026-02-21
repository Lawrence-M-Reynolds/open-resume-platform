interface LoadingSkeletonProps {
  count?: number;
}

export default function LoadingSkeleton({ count = 3 }: LoadingSkeletonProps) {
  return (
    <div className="space-y-4" role="status" aria-live="polite" aria-busy="true">
      <p className="sr-only">Loading content.</p>
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="bg-surface rounded-lg border border-gray-200 p-5 animate-pulse"
          aria-hidden="true"
        >
          <div className="h-5 bg-gray-200 rounded w-1/3 mb-3" />
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2" />
          <div className="h-4 bg-gray-200 rounded w-1/6" />
        </div>
      ))}
    </div>
  );
}
