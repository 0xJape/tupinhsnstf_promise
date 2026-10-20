export default function AdminLoading() {
  return (
    <div className="space-y-6" role="status" aria-live="polite" aria-label="Loading admin page">
      <div className="space-y-3">
        <div className="h-3 w-32 animate-pulse rounded-full bg-primary/15" />
        <div className="h-9 w-64 max-w-full animate-pulse rounded-2xl bg-muted" />
        <div className="h-4 w-[28rem] max-w-full animate-pulse rounded-full bg-muted" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => <div key={index} className="surface-card h-32 animate-pulse bg-card/55" />)}
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        {Array.from({ length: 2 }, (_, index) => <div key={index} className="surface-card h-72 animate-pulse bg-card/55" />)}
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  );
}
