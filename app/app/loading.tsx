export default function AppLoading() {
  return (
    <div className="mx-auto max-w-5xl animate-pulse space-y-6 p-4 sm:p-6 lg:p-8" aria-label="Loading page">
      <div className="h-8 w-56 rounded-lg bg-muted" />
      <div className="h-4 w-72 max-w-full rounded bg-muted" />
      <div className="h-24 rounded-xl bg-muted" />
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <div className="h-24 rounded-xl bg-muted" />
        <div className="h-24 rounded-xl bg-muted" />
        <div className="h-24 rounded-xl bg-muted" />
      </div>
      <div className="h-40 rounded-xl bg-muted" />
    </div>
  );
}
