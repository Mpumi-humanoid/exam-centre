import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function ViewResults() {
  const [modules, setModules] = useState([])
  const [filters, setFilters] = useState({ moduleId: '', studentNumber: '' })
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    supabase.from('modules').select('id, module_code, module_name').order('module_code')
      .then(({ data }) => setModules(data ?? []))
  }, [])

  async function runSearch(e) {
    e?.preventDefault()
    setLoading(true)

    let query = supabase
      .from('exam_results')
      .select(`
        id, mark, grade, status, date_captured,
        modules ( module_code, module_name ),
        profiles:student_id ( username, student_number )
      `)
      .order('date_captured', { ascending: false })

    if (filters.moduleId) query = query.eq('module_id', filters.moduleId)
    if (filters.studentNumber) query = query.eq('profiles.student_number', filters.studentNumber)

    const { data, error } = await query
    if (!error) setResults(data ?? [])
    setLoading(false)
  }

  useEffect(() => { runSearch() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="page">
      <h2>Search Exam Results</h2>
      <form className="filter-bar" onSubmit={runSearch}>
        <select
          value={filters.moduleId}
          onChange={(e) => setFilters((f) => ({ ...f, moduleId: e.target.value }))}
        >
          <option value="">All modules</option>
          {modules.map((m) => (
            <option key={m.id} value={m.id}>{m.module_code} — {m.module_name}</option>
          ))}
        </select>
        <input
          placeholder="Student number"
          value={filters.studentNumber}
          onChange={(e) => setFilters((f) => ({ ...f, studentNumber: e.target.value }))}
        />
        <button type="submit">Search</button>
      </form>

      {loading ? (
        <p className="center-msg">Searching…</p>
      ) : (
        <table className="table">
          <thead>
            <tr><th>Student</th><th>Module</th><th>Mark</th><th>Grade</th><th>Status</th><th>Date</th></tr>
          </thead>
          <tbody>
            {results.length === 0 && <tr><td colSpan={6} className="muted">No results match that filter.</td></tr>}
            {results.map((r) => (
              <tr key={r.id}>
                <td>{r.profiles?.username} ({r.profiles?.student_number})</td>
                <td>{r.modules?.module_code}</td>
                <td>{r.mark}</td>
                <td>{r.grade}</td>
                <td>{r.status}</td>
                <td>{new Date(r.date_captured).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

