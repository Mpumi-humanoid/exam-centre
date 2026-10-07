import { useCallback, useMemo, useState } from 'react';
import { useAuth } from '../../auth/useAuth';
import { EmptyState, ErrorState, LoadingState } from '../../components/RemoteState';
import useRemoteData from '../../hooks/useRemoteData';
import { fetchLecturerWorkspace, friendlyDataError } from '../../lib/academicData';
import { getSupabase } from '../../lib/supabaseClient';

const EMPTY_LIST = [];

export default function ManageResults() {
  const { user } = useAuth();
  const loadData = useCallback(() => fetchLecturerWorkspace(user.id), [user.id]);
  const { data, loading, error, refresh } = useRemoteData(loadData);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedAssessmentId, setSelectedAssessmentId] = useState('');
  const [draft, setDraft] = useState(null);
  const [query, setQuery] = useState('');
  const [saving, setSaving] = useState(false);
  const [savingAssessmentId, setSavingAssessmentId] = useState('');
  const [actionError, setActionError] = useState('');
  const [message, setMessage] = useState('');

  const students = data?.students || [];
  const assessments = data?.assessments || EMPTY_LIST;
  const results = data?.results || EMPTY_LIST;
  const selectedStudent = students.find((student) => student.id === selectedStudentId) || students[0];
  const studentModuleIds = new Set((selectedStudent?.modules || []).map((module) => module.id));
  const availableAssessments = assessments.filter((assessment) => studentModuleIds.has(assessment.module_id));
  const selectedAssessment = availableAssessments.find((assessment) => assessment.id === selectedAssessmentId) || availableAssessments[0];
  const existingResult = results.find((result) => result.student_id === selectedStudent?.id && result.assessment_id === selectedAssessment?.id);
  const draftKey = `${selectedStudent?.id || ''}:${selectedAssessment?.id || ''}`;
  const isCurrentDraft = draft?.draftKey === draftKey;
  const currentMark = isCurrentDraft ? draft.mark : existingResult?.mark ?? '';
  const currentFeedback = isCurrentDraft ? draft.feedback : existingResult?.feedback || '';

  const visibleResults = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) return results;
    return results.filter((result) => {
      const assessment = assessments.find((item) => item.id === result.assessment_id);
      const module = data?.modules.find((item) => item.id === assessment?.module_id);
      return `${result.studentName} ${module?.code || ''} ${module?.name || ''} ${assessment?.name || ''}`.toLowerCase().includes(search);
    });
  }, [query, results, assessments, data?.modules]);

  async function handleSaveResult(event) {
    event.preventDefault();
    setActionError('');
    setMessage('');
    const numericMark = Number(currentMark);
    if (!selectedStudent || !selectedAssessment) {
      setActionError('Choose a student and assessment before saving.');
      return;
    }
    if (currentMark === '' || !Number.isFinite(numericMark) || numericMark < 0 || numericMark > 100) {
      setActionError('Enter a valid mark from 0 to 100.');
      return;
    }

    setSaving(true);
    try {
      const { error: saveError } = await getSupabase().from('results').upsert({
        student_id: selectedStudent.id,
        assessment_id: selectedAssessment.id,
        mark: numericMark,
        feedback: currentFeedback.trim() || null,
      }, { onConflict: 'student_id,assessment_id' });
      if (saveError) throw saveError;
      setMessage('Result saved successfully.');
      refresh();
    } catch (saveError) {
      setActionError(friendlyDataError(saveError));
    } finally {
      setSaving(false);
    }
  }

  async function toggleAssessmentRelease(assessment) {
    setActionError('');
    setMessage('');
    setSavingAssessmentId(assessment.id);
    try {
      const { error: updateError } = await getSupabase()
        .from('assessments')
        .update({ is_released: !assessment.is_released })
        .eq('id', assessment.id)
        .select('id')
        .single();
      if (updateError) throw updateError;
      setMessage(`${assessment.name} ${assessment.is_released ? 'unreleased' : 'released'} successfully.`);
      refresh();
    } catch (updateError) {
      setActionError(friendlyDataError(updateError));
    } finally {
      setSavingAssessmentId('');
    }
  }

  if (loading) return <LoadingState message="Loading your modules, students, and results…" />;
  if (error) return <ErrorState message={error} onRetry={refresh} />;

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-medium text-emerald-800">Assessment records</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Manage student results</h1>
        <p className="mt-2 text-slate-500">Enter marks and feedback for students in your assigned modules, then publish the assessment.</p>
      </div>

      {(actionError || message) && <div className={`mb-5 rounded-xl border px-4 py-3 text-sm ${actionError ? 'border-red-200 bg-red-50 text-red-900' : 'border-emerald-200 bg-emerald-50 text-emerald-900'}`} role={actionError ? 'alert' : 'status'}>{actionError || message}</div>}

      {!data.modules.length ? (
        <EmptyState title="No modules assigned" description="Contact an administrator to assign teaching modules to your account." />
      ) : (
        <>
          <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <div className="mb-5"><h2 className="font-semibold">Add or update a student result</h2><p className="mt-1 text-sm text-slate-500">Only students enrolled in your assigned modules are available.</p></div>
            {!students.length ? <EmptyState title="No enrolled students found" description="Student enrolments for your modules will appear here." /> : !assessments.length ? <EmptyState title="No assessments found" description="An administrator needs to create assessments for your assigned modules." /> : (
              <form onSubmit={handleSaveResult} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <label className="text-sm font-medium text-slate-700">Student
                  <select value={selectedStudent?.id || ''} onChange={(event) => { setSelectedStudentId(event.target.value); setSelectedAssessmentId(''); }} className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 font-normal focus:outline-none focus:ring-2 focus:ring-emerald-700">
                    {students.map((student) => <option key={student.id} value={student.id}>{student.full_name}</option>)}
                  </select>
                </label>
                <label className="text-sm font-medium text-slate-700">Assessment
                  <select value={selectedAssessment?.id || ''} onChange={(event) => setSelectedAssessmentId(event.target.value)} required className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 font-normal focus:outline-none focus:ring-2 focus:ring-emerald-700">
                    {availableAssessments.map((assessment) => {
                      const module = data.modules.find((item) => item.id === assessment.module_id);
                      return <option key={assessment.id} value={assessment.id}>{module?.code} · {assessment.name} ({assessment.type})</option>;
                    })}
                  </select>
                </label>
                <label className="text-sm font-medium text-slate-700">Mark (0–100)
                  <input type="number" min="0" max="100" step="0.01" required value={currentMark} onChange={(event) => setDraft({ draftKey, mark: event.target.value, feedback: currentFeedback })} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal focus:outline-none focus:ring-2 focus:ring-emerald-700" placeholder="Enter mark" />
                </label>
                <label className="text-sm font-medium text-slate-700 sm:col-span-2">Feedback
                  <textarea rows="2" value={currentFeedback} onChange={(event) => setDraft({ draftKey, mark: currentMark, feedback: event.target.value })} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal focus:outline-none focus:ring-2 focus:ring-emerald-700" placeholder="Optional feedback for the student" />
                </label>
                <div className="flex items-end"><button type="submit" disabled={saving || !selectedAssessment} className="w-full rounded-lg bg-emerald-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-950 disabled:opacity-50">{saving ? 'Saving…' : existingResult ? 'Update result' : 'Save result'}</button></div>
              </form>
            )}
          </section>

          <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <div className="mb-4"><h2 className="font-semibold">Assessment publication</h2><p className="mt-1 text-sm text-slate-500">Students can see marks only after the assessment is released.</p></div>
            {assessments.length ? <div className="divide-y divide-slate-100">
              {assessments.map((assessment) => {
                const module = data.modules.find((item) => item.id === assessment.module_id);
                return (
                  <div key={assessment.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                    <div><p className="text-sm font-medium">{module?.code} · {assessment.name}</p><p className="mt-1 text-xs capitalize text-slate-500">{assessment.type} assessment · {assessment.date || 'No date set'}</p></div>
                    <button type="button" disabled={savingAssessmentId === assessment.id} onClick={() => toggleAssessmentRelease(assessment)} className={`rounded-lg px-3 py-2 text-xs font-semibold disabled:opacity-50 ${assessment.is_released ? 'border border-amber-300 text-amber-900 hover:bg-amber-50' : 'bg-emerald-900 text-white hover:bg-emerald-950'}`}>{savingAssessmentId === assessment.id ? 'Updating…' : assessment.is_released ? 'Unrelease results' : 'Release results'}</button>
                  </div>
                );
              })}
            </div> : <EmptyState title="No assessments available" />}
          </section>

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
              <div><h2 className="font-semibold">Assessment results</h2><p className="mt-1 text-xs text-slate-500">{results.length} saved results across your assigned modules</p></div>
              <label><span className="sr-only">Search results</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search student or module…" className="w-64 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700" /></label>
            </div>
            {visibleResults.length ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3.5 font-medium">Student</th><th className="px-5 py-3.5 font-medium">Module</th><th className="px-5 py-3.5 font-medium">Assessment</th><th className="px-5 py-3.5 font-medium">Mark</th><th className="px-5 py-3.5 font-medium">Feedback</th></tr></thead>
                  <tbody className="divide-y divide-slate-100">
                    {visibleResults.map((result) => {
                      const assessment = assessments.find((item) => item.id === result.assessment_id);
                      const module = data.modules.find((item) => item.id === assessment?.module_id);
                      return <tr key={result.id}><td className="px-5 py-4 font-medium">{result.studentName}</td><td className="px-5 py-4">{module?.code} · {module?.name}</td><td className="px-5 py-4">{assessment?.name}</td><td className="px-5 py-4 font-semibold">{result.mark == null ? '—' : `${result.mark}%`}</td><td className="max-w-sm px-5 py-4 text-slate-600">{result.feedback || '—'}</td></tr>;
                    })}
                  </tbody>
                </table>
              </div>
            ) : <div className="p-5"><EmptyState title={query ? 'No results match your search' : 'No results entered yet'} description={query ? 'Try searching by a different student or module.' : 'Saved results for your assigned modules will appear here.'} /></div>}
          </section>
        </>
      )}
    </div>
  );
}
