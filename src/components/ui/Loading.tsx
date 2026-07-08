export function Loading({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
      <p className="mt-3 text-sm text-gray-500">{text}</p>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="animate-pulse bg-gray-100 rounded-xl p-6 h-36" />
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="animate-pulse space-y-3">
      <div className="h-10 bg-gray-200 rounded" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-8 bg-gray-100 rounded" />
      ))}
    </div>
  );
}
