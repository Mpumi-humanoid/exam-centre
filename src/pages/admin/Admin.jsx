import { useState } from 'react';
import { PageHead, Section, StatCards, DataTable, Pill, Mark, Field, inputCls, btnDark, btnGhost, card } from '../../../../../Downloads/exam-centre-merged/exam-centre-main/src/components/ui.jsx';

const RECORDS = [
  ['STU-224871', 'CMPG211', 'Sem 1, 2026', 92, 'Verified'],
  ['STU-224871', 'MTHS172', 'Sem 1, 2026', 86, 'Verified'],
  ['STU-119042', 'MTHS172', 'Sem 1, 2026', 64, 'Verified'],
  ['STU-330218', 'CMPG221', 'Sem 2, 2025', 88, 'Verified'],
  ['STU-402913', 'ELYM225', 'Sem 1, 2025', null, 'Pending'],
];
const LOG = [
  ['✎', 'MTHS172 corrected', 'STU-119042 · 58% → 64%'],
  ['+', 'CMPG211 captured', 'STU-224871 · 92%'],
  ['+', 'ELYM215 captured', 'STU-224871 · 79%'],
  ['✎', 'CMPG221 corrected', 'STU-330218 · 71% → 88%'],
];

export default function Admin() {
  const [student, setStudent] = useState('');
  const [module, setModule] = useState('');
  const [status, setStatus] = useState('All statuses');

  function handleSave(e) {
    e.preventDefault();
    // TODO: POST the mark to your backend, then refresh the table
    console.log('Save result', Object.fromEntries(new FormData(e.target)));
  }

  const has = (v, q) => v.toLowerCase().includes(q.trim().toLowerCase());
  const rows = RECORDS
    .filter((r) => has(r[0], student) && has(r[1], module) && (status === 'All statuses' || r[4] === status))
    .map(([s, m, sem, mark, st]) => [
      <span className="font-mono">{s}</span>, <span className="font-mono">{m}</span>, sem, <Mark value={mark} />,
      <Pill subtle={st === 'Pending'}>{st}</Pill>,
      <a href="#capture" className="text-blue-600 hover:underline">{st === 'Pending' ? 'Review' : 'Edit'}</a>,
    ]);

  return (
    <>
      <PageHead eyebrow="Admin console" title="Manage student results" lead="Capture new marks, correct existing ones, and review every change against the audit trail." />
      <StatCards items={[['Total students', '412', 'Currently enrolled'], ['Results pending review', '06', 'Awaiting your approval'], ['Average pass rate', '94%', 'Last semester']]} />

      <div className="grid gap-4 lg:grid-cols-3 mb-10">
        <form id="capture" onSubmit={handleSave} className={`${card} lg:col-span-2 space-y-4`}>
          <h2 className="font-display text-xl">Add or update a mark</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Student number"><input name="student" className={inputCls} placeholder="STU-224871" required /></Field>
            <Field label="Module code"><input name="module" className={inputCls} placeholder="CMPG211" required /></Field>
            <Field label="Semester">
              <select name="semester" className={inputCls}>
                {['Semester 1, 2026', 'Semester 2, 2025', 'Semester 1, 2025'].map((s) => <option key={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Mark (%)"><input name="mark" type="number" min="0" max="100" className={inputCls} placeholder="0–100" required /></Field>
          </div>
          <Field label="Notes (optional)"><input name="notes" className={inputCls} placeholder="e.g. Supplementary exam, correction reason" /></Field>
          <div className="flex gap-3">
            <button type="submit" className={btnDark}>Save result</button>
            <button type="reset" className={btnGhost}>Clear form</button>
          </div>
          <p className="text-xs text-gray-400">Marks are validated against a 0–100 range before saving. Every change is logged.</p>
        </form>

        <aside id="activity" className={card}>
          <div className="flex justify-between mb-3"><h2 className="font-semibold">Audit log</h2><Pill subtle>Last 7 days</Pill></div>
          <ul className="space-y-3">
            {LOG.map(([icon, title, detail]) => (
              <li key={title + detail} className="flex gap-3 text-sm">
                <span className="h-7 w-7 shrink-0 rounded-full bg-gray-100 flex items-center justify-center">{icon}</span>
                <div><strong className="block">{title}</strong><small className="text-gray-500">{detail}</small></div>
              </li>
            ))}
          </ul>
        </aside>
      </div>

      <Section eyebrow="All records" title="Student results">
        <div className="grid gap-4 sm:grid-cols-3 mb-4">
          <Field label="Student number"><input className={inputCls} value={student} onChange={(e) => setStudent(e.target.value)} placeholder="Search by student number" /></Field>
          <Field label="Module code"><input className={inputCls} value={module} onChange={(e) => setModule(e.target.value)} placeholder="e.g. CMPG211" /></Field>
          <Field label="Status">
            <select className={inputCls} value={status} onChange={(e) => setStatus(e.target.value)}>
              {['All statuses', 'Verified', 'Pending'].map((s) => <option key={s}>{s}</option>)}
            </select>
          </Field>
        </div>
        <DataTable columns={['Student', 'Module code', 'Semester', 'Mark', 'Status', '']} rows={rows} />
      </Section>
    </>
  );
}
