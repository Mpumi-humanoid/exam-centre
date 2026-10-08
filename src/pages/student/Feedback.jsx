import { useCallback } from 'react';
import { useAuth } from '../../auth/useAuth';
import { EmptyState, ErrorState, LoadingState } from '../../components/RemoteState';
import useRemoteData from '../../hooks/useRemoteData';
import { fetchStudentResults } from '../../lib/academicData';

export default function Feedback() {
  const { user } = useAuth();
  const loadData = useCallback(() => fetchStudentResults(user.id), [user.id]);
  const { data: results, loading, error, refresh } = useRemoteData(loadData);

  if (loading) return <LoadingState message="Loading your lecturer feedback…" />;
  if (error) return <ErrorState message={error} onRetry={refresh} />;
  const feedbackItems = results.filter((result) => result.feedback);

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-medium text-emerald-800">Guidance from your lecturers</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Feedback</h1>
        <p className="mt-2 max-w-2xl text-slate-500">Use assessment feedback to understand what is working well and what to focus on next.</p>
      </div>
      <div className="mb-6 rounded-2xl bg-emerald-900 p-5 text-white sm:p-6">
        <p className="text-sm font-medium text-emerald-100">A good next step</p>
        <p className="mt-2 text-lg font-semibold">Turn each comment into one thing to practise.</p>
        <p className="mt-1 text-sm text-emerald-100">If feedback is unclear, ask your lecturer during consultation hours.</p>
      </div>
      {feedbackItems.length ? (
        <div className="space-y-4">
          {feedbackItems.map((item) => (
            <article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div><p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">{item.code} · {item.module}</p><h2 className="mt-1 font-semibold">{item.assessment}</h2></div>
                <span className={`rounded-full px-2.5 py-1 text-sm font-semibold ${item.mark === null ? 'bg-slate-100 text-slate-600' : item.mark >= 75 ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'}`}>{item.mark === null ? 'No mark' : `${item.mark}%`}</span>
              </div>
              <div className="mt-4 border-l-2 border-emerald-700 pl-4"><p className="text-sm leading-6 text-slate-600">{item.feedback}</p></div>
              <p className="mt-4 text-xs text-slate-400">Assessment date: {item.date || 'Not set'}</p>
            </article>
          ))}
        </div>
      ) : <EmptyState title="No feedback released yet" description="Lecturer comments will appear here with your released results." />}
    </div>
  );
}
