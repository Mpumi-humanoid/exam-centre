import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function ManageUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')

  async function fetchUsers() {
    setLoading(true)
    const { data } = await supabase.from('profiles').select('*').order('username')
    setUsers(data ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchUsers() }, [])

  async function changeRole(id, role) {
    await supabase.from('profiles').update({ role }).eq('id', id)
    fetchUsers()
  }

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase()
    return users.filter((u) => {
      const matchesRole = !roleFilter || u.role === roleFilter
      const matchesSearch =
        !term ||
        u.username?.toLowerCase().includes(term) ||
        u.student_number?.toLowerCase().includes(term) ||
        u.staff_number?.toLowerCase().includes(term)
      return matchesRole && matchesSearch
    })
  }, [users, search, roleFilter])

  if (loading) return <p className="center-msg">Loading users…</p>

  return (
    <div className="page">
      <div className="page-header">
        <h2>Manage Users</h2>
        <span className="muted">{filteredUsers.length} of {users.length} users</span>
      </div>

      <form className="filter-bar" onSubmit={(e) => e.preventDefault()}>
        <input
          placeholder="Search by username, student # or staff #"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="">All roles</option>
          <option value="student">Student</option>
          <option value="lecturer">Lecturer</option>
          <option value="admin">Admin</option>
        </select>
        {(search || roleFilter) && (
          <button type="button" className="link-btn" onClick={() => { setSearch(''); setRoleFilter('') }}>
            Clear
          </button>
        )}
      </form>

      <table className="table">
        <thead>
          <tr><th>Username</th><th>Role</th><th>Student #</th><th>Staff #</th><th>Change role</th></tr>
        </thead>
        <tbody>
          {filteredUsers.length === 0 && (
            <tr><td colSpan={5} className="muted">No users match that search.</td></tr>
          )}
          {filteredUsers.map((u) => (
            <tr key={u.id}>
              <td>{u.username}</td>
              <td>{u.role}</td>
              <td>{u.student_number ?? '-'}</td>
              <td>{u.staff_number ?? '-'}</td>
              <td>
                <select value={u.role} onChange={(e) => changeRole(u.id, e.target.value)}>
                  <option value="student">Student</option>
                  <option value="lecturer">Lecturer</option>
                  <option value="admin">Admin</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
