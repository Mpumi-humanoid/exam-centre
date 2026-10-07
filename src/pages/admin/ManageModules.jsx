import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function ManageModules() {
  const [modules, setModules] = useState([])
  const [form, setForm] = useState({ module_code: '', module_name: '', credits: '', semester: '' })
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [semesterFilter, setSemesterFilter] = useState('')

  async function fetchModules() {
    const { data } = await supabase.from('modules').select('*').order('module_code')
    setModules(data ?? [])
  }

  useEffect(() => { fetchModules() }, [])

  async function handleAdd(e) {
    e.preventDefault()
    setError('')
    const { error } = await supabase.from('modules').insert({
      ...form,
      credits: Number(form.credits) || null,
    })
    if (error) { setError(error.message); return }
    setForm({ module_code: '', module_name: '', credits: '', semester: '' })
    fetchModules()
  }

  async function handleDelete(id) {
    await supabase.from('modules').delete().eq('id', id)
    fetchModules()
  }

  const semesters = useMemo(
    () => [...new Set(modules.map((m) => m.semester).filter(Boolean))].sort(),
    [modules]
  )

  const filteredModules = useMemo(() => {
    const term = search.trim().toLowerCase()
    return modules.filter((m) => {
      const matchesSemester = !semesterFilter || m.semester === semesterFilter
      const matchesSearch =
        !term ||
        m.module_code?.toLowerCase().includes(term) ||
        m.module_name?.toLowerCase().includes(term)
      return matchesSemester && matchesSearch
    })
  }, [modules, search, semesterFilter])

  return (
    <div className="page">
      <div className="page-header">
        <h2>Manage Modules</h2>
        <span className="muted">{filteredModules.length} of {modules.length} modules</span>
      </div>

      <form className="card inline-form" onSubmit={handleAdd}>
        {error && <p className="error">{error}</p>}
        <input placeholder="Module code" value={form.module_code}
          onChange={(e) => setForm((f) => ({ ...f, module_code: e.target.value }))} required />
        <input placeholder="Module name" value={form.module_name}
          onChange={(e) => setForm((f) => ({ ...f, module_name: e.target.value }))} required />
        <input placeholder="Credits" type="number" value={form.credits}
          onChange={(e) => setForm((f) => ({ ...f, credits: e.target.value }))} />
        <input placeholder="Semester (e.g. 2026-S1)" value={form.semester}
          onChange={(e) => setForm((f) => ({ ...f, semester: e.target.value }))} />
        <button type="submit">Add Module</button>
      </form>

      <form className="filter-bar" onSubmit={(e) => e.preventDefault()}>
        <input
          placeholder="Search by code or name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={semesterFilter} onChange={(e) => setSemesterFilter(e.target.value)}>
          <option value="">All semesters</option>
          {semesters.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        {(search || semesterFilter) && (
          <button type="button" className="link-btn" onClick={() => { setSearch(''); setSemesterFilter('') }}>
            Clear
          </button>
        )}
      </form>

      <table className="table">
        <thead><tr><th>Code</th><th>Name</th><th>Credits</th><th>Semester</th><th></th></tr></thead>
        <tbody>
          {filteredModules.length === 0 && (
            <tr><td colSpan={5} className="muted">No modules match that search.</td></tr>
          )}
          {filteredModules.map((m) => (
            <tr key={m.id}>
              <td>{m.module_code}</td>
              <td>{m.module_name}</td>
              <td>{m.credits}</td>
              <td>{m.semester}</td>
              <td><button className="link-btn" onClick={() => handleDelete(m.id)}>Delete</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
