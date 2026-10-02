import { useState } from 'react';
import { PageHead, StatCards, DataTable, Pill, Mark, Field, inputCls } from '../../../../../Downloads/exam-centre-merged/exam-centre-main/src/components/ui.jsx';

// Temporary hard-coded data. Later this comes from your backend.
const RESULTS = [
  ['Programming I', 'CMPG211', 'Semester 1, 2026', 92, 'A'],
  ['Mathematics for Engineers', 'MTHS172', 'Semester 1, 2026', 86, 'A'],
  ['Analogue Electronics', 'ELYM215', 'Semester 1, 2026', 79, 'B'],
  ['Data Structures', 'CMPG221', 'Semester 2, 2025', 88, 'A'],
  ['Calculus II', 'MTHS182', 'Semester 2, 2025', 64, 'C'],
  ['Digital Systems', 'ELYM225', 'Semester 1, 2025', null, '—'],
];

export default function Results() {
  const [semester, setSemester] = useState('All semesters');
  const [code, setCode] = useState('');

  const rows = RESULTS
    .filter((r) => semester === 'All semesters' || r[2] === semester)
    .filter((r) => r[1].toLowerCase().includes(code.trim().toLowerCase()))
    .map(([name, c, sem, mark, grade]) => [
      name, <span className="font-mono">{c}</span>, sem, <Mark value={mark} />, grade,
      mark == null ? <Pill subtle>Pending</Pill> : <Pill>Verified</Pill>,
    ]);

  return (
    <>
      <PageHead eyebrow="Verified record" title="Your results" lead="Every mark below has passed validation and is tied to your student number." />
      <StatCards items={[['Overall average', '85%', 'Across all semesters'], ['Modules completed', '18', 'Since enrolment'], ['Current semester', 'Sem 1, 2026', '3 modules in progress']]} />
      <div className="grid gap-4 sm:grid-cols-2 mb-4">
        <Field label="Semester">
          <select className={inputCls} value={semester} onChange={(e) => setSemester(e.target.value)}>
            {['All semesters', 'Semester 1, 2026', 'Semester 2, 2025', 'Semester 1, 2025'].map((s) => <option key={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="Module code">
          <input className={inputCls} value={code} onChange={(e) => setCode(e.target.value)} placeholder="e.g. CMPG211" />
        </Field>
      </div>
      <DataTable columns={['Module', 'Module code', 'Semester', 'Mark', 'Grade', 'Status']} rows={rows} />
    </>
  );
}
