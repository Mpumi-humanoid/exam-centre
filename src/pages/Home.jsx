import { Link } from 'react-router-dom';
import { btnDark, btnGhost, card, Section } from '../components/ui';

const STEPS = [
  ['Lecturer captures', 'Admins upload or enter marks per module, checked against a valid 0–100 range before saving.'],
  ['System validates', 'Marks are stored against the student and module record, with an audit trail of any changes.'],
  ['Student retrieves', 'Students log in and see only their own results, with an automatically calculated average.'],
];
const ROLES = [
  ['For students', 'Check your marks the moment they\'re published.', ['View results by module or semester', 'See your running average automatically', 'Download a result slip'], 'student'],
  ['For admins & lecturers', 'Capture and manage results with confidence.', ['Add or edit results per module', 'Search and filter across all students', 'Track every change with an audit log'], 'admin'],
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <header className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-md bg-gray-900 text-white flex items-center justify-center font-display font-semibold">R</div>
            <div className="leading-tight"><div className="font-semibold">Result Repository</div><div className="text-xs text-gray-500">academic records</div></div>
          </div>
          <nav className="flex gap-4 text-sm text-gray-500 md:ml-6">
            <a href="#how" className="hover:text-gray-800">How it works</a>
            <a href="#roles" className="hover:text-gray-800">Who it's for</a>
          </nav>
          <div className="ml-auto flex gap-2">
            <Link to="/login?role=student" className={btnGhost}>Student login</Link>
            <Link to="/login?role=admin" className={btnDark}>Admin login</Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-12">
        <section className="mb-16 max-w-2xl">
          <p className="text-xs font-medium text-gray-500 mb-2">Academic records, centralised</p>
          <h1 className="font-display text-4xl font-medium text-gray-900">One verified place for every exam result.</h1>
          <p className="text-gray-600 mt-4">No more chasing spreadsheets or waiting on a noticeboard. This is where results get captured, checked, and made available to the right people.</p>
          <div className="flex gap-3 mt-6">
            <Link to="/login?role=student" className={btnDark}>Log in as student</Link>
            <Link to="/login?role=admin" className={btnGhost}>Log in as admin</Link>
          </div>
        </section>

        <div id="how" />
        <Section eyebrow="How it works" title="From capture to record, in three steps" text="Every result moves through the same verified path before it reaches a student's screen.">
          <div className="grid gap-4 md:grid-cols-3">
            {STEPS.map(([title, text], i) => (
              <div key={title} className={card}><div className="text-sm text-gray-400 mb-1">0{i + 1}</div><h3 className="font-semibold">{title}</h3><p className="text-sm text-gray-500 mt-1">{text}</p></div>
            ))}
          </div>
        </Section>

        <div id="roles" />
        <Section eyebrow="Two ways in" title="Built around who's using it" text="Access is role-based — a student and an admin never see the same screen.">
          <div className="grid gap-4 md:grid-cols-2">
            {ROLES.map(([title, text, points, role]) => (
              <div key={title} className={card}>
                <h3 className="font-semibold">{title}</h3><p className="text-sm text-gray-500 mb-3">{text}</p>
                <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1 mb-4">{points.map((p) => <li key={p}>{p}</li>)}</ul>
                <Link to={`/login?role=${role}`} className="text-blue-600 text-sm hover:underline">Log in as {role} →</Link>
              </div>
            ))}
          </div>
        </Section>
        <footer className="text-xs text-gray-400 border-t pt-4">Result Repository — CMPG211 group project</footer>
      </main>
    </div>
  );
}
