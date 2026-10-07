import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

export default function AdminDashboard() {
  const [counts, setCounts] = useState({ students: 0, lecturers: 0, modules: 0, results: 0 })

  useEffect(() => {
    async function loadCounts() {
      const [{ count: students }, { count: lecturers }, { count: modules }, { count: results }] =
        await Promise.all([
          supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student'),
          supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'lecturer'),
          supabase.from('modules').select('*', { count: 'exact', head: true }),
          supabase.from('exam_results').select('*', { count: 'exact', head: true }),
        ])
      setCounts({ students: students ?? 0, lecturers: lecturers ?? 0, modules: modules ?? 0, results: results ?? 0 })
    }
    loadCounts()
  }, [])

  return (
    <div className="page">
      <h2>Administrator Dashboard</h2>
      <div className="stat-grid">
        <div className="stat-card"><span className="stat-num">{counts.students}</span>Students</div>
        <div className="stat-card"><span className="stat-num">{counts.lecturers}</span>Lecturers</div>
        <div className="stat-card"><span className="stat-num">{counts.modules}</span>Modules</div>
        <div className="stat-card"><span className="stat-num">{counts.results}</span>Results captured</div>
      </div>
      <div className="admin-links">
        <Link to="/admin/users" className="card-link">Manage Users</Link>
        <Link to="/admin/modules" className="card-link">Manage Modules</Link>
        <Link to="/reports" className="card-link">Generate Reports</Link>
        <Link to="/results" className="card-link">Search Results</Link>
      </div>
    </div>
  )
}
