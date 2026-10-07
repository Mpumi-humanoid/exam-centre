import { useCallback, useState } from 'react';
import { useAuth } from '../../auth/useAuth';
import { EmptyState, ErrorState, LoadingState } from '../../components/RemoteState';
import useRemoteData from '../../hooks/useRemoteData';
import { fetchStudentResults } from '../../lib/academicData';

const FILTERS = ['All results', 'Module results', 'Exam results'];

function formatDate(value) {
  if (!value) return 'Date not set';
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
}

export default function Results() {
  const { user } = useAuth();
  const [filter, setFilter] = useState('All results');
  const loadData = useCallback(() => fetchStudentResults(user.id), [user.id]);
  const { data: results, loading, error, refresh } = useRemoteData(loadData);

  if (loading) return <LoadingState message="Loading your results…" />;
  if (error) return <ErrorState message={error} onRetry={refresh} />;

  const shownResults = results.filter((result) => (
    filter === 'All results' || (filter === 'Module results' && result.type === 'module') || (filter === 'Exam results' && result.type === 'exam')
  ));

  return (
    <div>
      <div className="mb-7">
        <p className="text-sm font-medium text-emerald-800">Your academic record</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Module &amp; exam results</h1>
        <p className="mt-2 text-slate-500">Review your released marks and lecturer feedback.</p>
      </div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-950">
        <span><strong>{results.length} results released</strong><span className="ml-2 text-emerald-800">· Unreleased results are hidden until published.</span></span>
      </div>

      <div className="mb-4 flex flex-wrap gap-2" role="tablist" aria-label="Filter results by type">
        {FILTERS.map((item) => <button key={item} type="button" role="tab" aria-selected={filter === item} onClick={() => setFilter(item)} className={`rounded-lg px-3 py-2 text-sm font-medium ${filter === item ? 'bg-emerald-900 text-white' : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}>{item}</button>)}
      </div>

      {shownResults.length === 0 ? <EmptyState title="No results released yet" description="Released module and exam results will appear here." /> : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr>
                <th className="px-5 py-3.5 font-medium">Type</th><th className="px-5 py-3.5 font-medium">Module</th><th className="px-5 py-3.5 font-medium">Assessment</th><th className="px-5 py-3.5 font-medium">Date</th><th className="px-5 py-3.5 font-medium">Mark</th><th className="px-5 py-3.5 font-medium">Feedback</th>
              </tr></thead>
              <tbody className="divide-y divide-slate-100">
                {shownResults.map((result) => (
                  <tr key={result.id} className="align-top hover:bg-slate-50/70">
                    <td className="px-5 py-4"><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium capitalize text-slate-700">{result.type}</span></td>
                    <td className="px-5 py-4"><span className="block font-medium text-slate-800">{result.module}</span><span className="mt-1 block text-xs text-slate-500">{result.code}</span></td>
                    <td className="px-5 py-4 font-medium text-slate-700">{result.assessment}</td>
                    <td className="px-5 py-4 text-slate-600">{formatDate(result.date)}</td>
                    <td className="px-5 py-4">{result.mark == null ? <span className="text-slate-400">—</span> : <span className={`font-semibold ${result.mark >= 75 ? 'text-emerald-800' : 'text-amber-700'}`}>{result.mark}%</span>}</td>
                    <td className="max-w-sm px-5 py-4 text-slate-600">{result.feedback || <span className="text-slate-400">No feedback</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <p className="mt-4 text-xs leading-5 text-slate-500">If you think a result is incorrect, contact the module lecturer or examinations office.</p>
    </div>
  );
}
