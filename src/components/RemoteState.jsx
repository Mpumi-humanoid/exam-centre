export function LoadingState({ message = 'Loading…' }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600" role="status">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-800 border-r-transparent" aria-hidden="true" />
      {message}
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-900" role="alert">
      <p>{message}</p>
      {onRetry && <button type="button" onClick={onRetry} className="mt-3 font-semibold underline">Try again</button>}
    </div>
  );
}

export function EmptyState({ title, description }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
      <p className="font-semibold text-slate-800">{title}</p>
      {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
    </div>
  );
}
