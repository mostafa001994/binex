export function AdminTableSkeleton({
  rows = 5,
}: {
  rows?: number;
}) {
  return (
    <div className="space-y-2">
      {Array.from({
        length: rows,
      }).map((_, index) => (
        <div
          key={index}
          className="h-14 animate-pulse rounded-control bg-surface-raised"
        />
      ))}
    </div>
  );
}
