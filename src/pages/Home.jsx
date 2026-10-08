import { Link } from 'react-router-dom';

const FEATURES = [
  ['01', 'Your results, in one place', 'See released marks and check which assessments are still being reviewed.'],
  ['02', 'Know where you stand', 'Follow your modules and keep track of your academic progress through the semester.'],
  ['03', 'Learn from feedback', 'Read lecturer comments and use them to plan your next steps.'],
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f7f8f5] font-sans text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <a href="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-800 text-lg font-bold text-white">E</span>
            <span><span className="block font-semibold tracking-tight">Exam Centre</span><span className="block text-xs text-slate-500">Student portal</span></span>
          </a>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-emerald-900">Lecturer sign in</Link>
            <Link to="/login" className="rounded-lg bg-emerald-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-950">Sign in</Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
        <section className="grid items-center gap-10 md:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-sm font-semibold text-emerald-800">Your studies, clearly in view</p>
            <h1 className="mt-4 max-w-xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">A better way to stay on top of your studies.</h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">Students can check exam results, modules, and feedback; lecturers can manage assessment results in one secure portal.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/login" className="rounded-lg bg-emerald-900 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-950">Go to my portal <span aria-hidden="true">→</span></Link>
              <a href="#features" className="rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">Explore features</a>
            </div>
          </div>
          <div className="rounded-3xl bg-emerald-900 p-6 text-white sm:p-8">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-emerald-100">Semester overview</p>
                <h2 className="mt-2 text-2xl font-semibold">Your progress at a glance</h2>
              </div>
              <span className="rounded-xl bg-white/10 px-3 py-2 text-xs">2026</span>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-white/10 p-4"><p className="text-sm text-emerald-100">Results</p><p className="mt-2 text-2xl font-semibold">Track</p></div>
              <div className="rounded-2xl bg-white/10 p-4"><p className="text-sm text-emerald-100">Modules</p><p className="mt-2 text-2xl font-semibold">Explore</p></div>
              <div className="col-span-2 rounded-2xl bg-white/10 p-4"><p className="text-sm text-emerald-100">Lecturer feedback</p><p className="mt-1 font-medium">Understand your progress and plan what comes next.</p></div>
            </div>
          </div>
        </section>

        <section id="features" className="mt-20 scroll-mt-8">
          <p className="text-sm font-semibold text-emerald-800">Made for students</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Everything you need for the semester.</h2>
          <div className="mt-7 grid gap-4 md:grid-cols-3">
            {FEATURES.map(([number, title, text]) => (
              <article key={number} className="rounded-2xl border border-slate-200 bg-white p-6">
                <span className="text-xs font-semibold tracking-wide text-emerald-800">{number}</span>
                <h3 className="mt-4 font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">{text}</p>
              </article>
            ))}
          </div>
        </section>
        <footer className="mt-16 border-t border-slate-200 pt-5 text-xs text-slate-400">Exam Centre · Student academic records</footer>
      </main>
    </div>
  );
}
