
export default function LoadingSkeleton({ type = "card", count = 4 }) {
  const items = Array.from({ length: count });

  if (type === "card") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((_, i) => (
          <div key={i} className="bg-surface border border-border rounded-lg overflow-hidden animate-pulse">
            <div className="h-44 bg-surface-muted" />
            <div className="p-4 space-y-2">
              <div className="h-3 bg-surface-muted rounded w-1/3" />
              <div className="h-4 bg-surface-muted rounded w-3/4" />
              <div className="h-4 bg-surface-muted rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3 animate-pulse">
      {items.map((_, i) => (
        <div key={i} className="h-12 bg-surface-muted rounded-md w-full" />
      ))}
    </div>
  );
}