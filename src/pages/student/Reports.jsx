import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'


export default function Reports() {
  const [modules, setModules] = useState([])
  const [moduleId, setModuleId] = useState('')
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    supabase.from('modules').select('id, module_code, module_name').order('module_code')
      .then(({ data }) => setModules(data ?? []))
  }, [])

  async function generate(e) {
    e.preventDefault()
    setLoading(true)
    let query = supabase.from('exam_results').select('mark, grade, modules ( module_code, module_name )')
    if (moduleId) query = query.eq('module_id', moduleId)
    const { data } = await query

    const total = data?.length ?? 0
    const passCount = data?.filter((r) => r.grade !== 'F').length ?? 0
    const avgMark = total ? (data.reduce((sum, r) => sum + Number(r.mark), 0) / total).toFixed(1) : 0
    const gradeCounts = (data ?? []).reduce((acc, r) => {
      acc[r.grade] = (acc[r.grade] ?? 0) + 1
      return acc
    }, {})

    setReport({ total, passCount, passRate: total ? ((passCount / total) * 100).toFixed(1) : 0, avgMark, gradeCounts })
    setLoading(false)
  }

  function exportPDF() {
    window.print()
  }

  return (
    <div className="page">
      <h2>Reports</h2>
      <form className="filter-bar" onSubmit={generate}>
        <select value={moduleId} onChange={(e) => setModuleId(e.target.value)}>
          <option value="">All modules</option>
          {modules.map((m) => <option key={m.id} value={m.id}>{m.module_code} — {m.module_name}</option>)}
        </select>
        <button type="submit">{loading ? 'Generating…' : 'Generate Report'}</button>
        {report && <button type="button" onClick={exportPDF}>Export PDF</button>}
      </form>

      {report && (
        <div className="card">
          <h3>Summary</h3>
          <p>Total results: <strong>{report.total}</strong></p>
          <p>Pass rate: <strong>{report.passRate}%</strong> ({report.passCount}/{report.total})</p>
          <p>Average mark: <strong>{report.avgMark}</strong></p>
          <h4>Grade distribution</h4>
          <ul>
            {Object.entries(report.gradeCounts).map(([grade, count]) => (
              <li key={grade}>{grade}: {count}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
