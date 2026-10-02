// Small reusable pieces shared by every page.
export const inputCls = 'w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500';
export const btnDark = 'bg-gray-900 text-white py-2 px-4 rounded-md text-sm hover:bg-gray-800';
export const btnGhost = 'border border-gray-300 text-gray-700 py-2 px-4 rounded-md text-sm hover:bg-gray-100';
export const card = 'bg-white rounded-lg shadow p-6';

export const Pill = ({ children, subtle }) => (
  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${subtle ? 'bg-gray-100 text-gray-500' : 'bg-green-50 text-green-700'}`}>{children}</span>
);

export const PageHead = ({ eyebrow, title, lead }) => (
  <div className="mb-8">
    <p className="text-xs font-medium text-gray-500 mb-1">{eyebrow}</p>
    <h1 className="font-display text-3xl font-medium text-gray-900">{title}</h1>
    <p className="text-gray-500 mt-2 max-w-2xl">{lead}</p>
  </div>
);

export const Section = ({ eyebrow, title, text, children }) => (
  <section className="mb-10">
    <p className="text-xs font-medium text-gray-500">{eyebrow}</p>
    <h2 className="font-display text-xl font-medium text-gray-900">{title}</h2>
    {text && <p className="text-sm text-gray-500 mt-1">{text}</p>}
    <div className="mt-4">{children}</div>
  </section>
);

// items: [[label, value, note], ...]
export const StatCards = ({ items }) => (
  <div className="grid gap-4 sm:grid-cols-3 mb-10">
    {items.map(([label, value, note]) => (
      <div key={label} className={card}>
        <span className="text-xs text-gray-500">{label}</span>
        <strong className="block text-2xl text-gray-900 mt-1">{value}</strong>
        <small className="text-gray-400">{note}</small>
      </div>
    ))}
  </div>
);

export const Field = ({ label, children }) => (
  <label className="block text-sm font-medium text-gray-700">
    <span className="block mb-1">{label}</span>{children}
  </label>
);

// Green for 75+, amber below, dash while pending
export const Mark = ({ value }) =>
  value == null ? <span className="text-gray-400">—</span> : (
    <span className={`font-semibold ${value >= 75 ? 'text-green-700' : 'text-amber-600'}`}>{value}%</span>
  );

// columns: ['Module', ...]   rows: [[cell, cell, ...], ...]
export const DataTable = ({ columns, rows }) => (
  <div className="overflow-x-auto bg-white rounded-lg shadow">
    <table className="w-full text-sm text-left">
      <thead className="text-gray-500 border-b">
        <tr>{columns.map((c) => <th key={c} className="px-4 py-3 font-medium">{c}</th>)}</tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} className="border-b last:border-0">
            {row.map((cell, j) => <td key={j} className="px-4 py-3">{cell}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// data: [[label, value], ...]  max: the value that fills the bar
export const BarChart = ({ data, max = 100, suffix = '%' }) => (
  <div className="flex items-end gap-4 h-56 bg-white rounded-lg shadow p-6">
    {data.map(([label, value]) => (
      <div key={label} className="flex-1 h-full flex flex-col">
        <div className="flex-1 bg-gray-100 rounded flex items-end">
          <div className="w-full bg-gray-900 rounded text-white text-xs text-center pt-1" style={{ height: `${(value / max) * 100}%` }}>{value}{suffix}</div>
        </div>
        <span className="text-xs text-gray-500 text-center mt-2">{label}</span>
      </div>
    ))}
  </div>
);

// details: [[label, value], ...]
export const ProfileCard = ({ initials, name, id, details }) => (
  <article className={card}>
    <div className="h-14 w-14 rounded-full bg-gray-900 text-white flex items-center justify-center font-semibold">{initials}</div>
    <h2 className="font-display text-xl mt-3">{name}</h2>
    <span className="text-xs text-gray-500">{id}</span>
    <ul className="mt-4 divide-y text-sm">
      {details.map(([label, value]) => (
        <li key={label} className="flex justify-between py-2">
          <span className="text-gray-500">{label}</span><span className="text-gray-900 text-right">{value}</span>
        </li>
      ))}
    </ul>
  </article>
);

// Progress bar + three mini stats. stats: [[label, value], ...]
export const ProgressPanel = ({ eyebrow, title, label, value, percent, note, stats }) => (
  <article className={card}>
    <p className="text-xs font-medium text-gray-500">{eyebrow}</p>
    <h2 className="font-display text-xl mb-4">{title}</h2>
    <div className="flex justify-between text-sm mb-1"><span>{label}</span><strong>{value}</strong></div>
    <div className="h-2 bg-gray-100 rounded"><div className="h-2 bg-gray-900 rounded" style={{ width: `${percent}%` }} /></div>
    <small className="text-gray-400">{note}</small>
    <div className="grid grid-cols-3 gap-3 mt-6">
      {stats.map(([l, v]) => (
        <div key={l}><span className="text-xs text-gray-500">{l}</span><strong className="block text-xl">{v}</strong></div>
      ))}
    </div>
  </article>
);
