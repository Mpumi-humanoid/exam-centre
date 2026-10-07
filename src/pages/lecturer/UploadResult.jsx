import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { calculateGrade } from '../lib/grading'

export default function UploadResult() {
  const { moduleId } = useParams()
  const { profile } = useAuth()
  const [module, setModule] = useState(null)
  const [sessions, setSessions] = useState([])
  const [studentNumber, setStudentNumber] = useState('')
  const [mark, setMark] = useState('')
  const [sessionId, setSessionId] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: mod } = await supabase.from('modules').select('*').eq('id', moduleId).single()
      setModule(mod)
      const { data: sess } = await supabase.from('exam_sessions').select('*').order('year', { ascending: false })
      setSessions(sess ?? [])
      if (sess?.length) setSessionId(sess[0].id)
    }
    load()
  }, [moduleId])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setMessage('')
    setBusy(true)
    try {
      const { data: student, error: studentErr } = await supabase
        .from('profiles')
        .select('id')
        .eq('student_number', studentNumber)
        .eq('role', 'student')
        .single()

      if (studentErr || !student) throw new Error('No student found with that student number.')

      const grade = calculateGrade(mark)

      const { error: insertErr } = await supabase.from('exam_results').insert({
        student_id: student.id,
        module_id: moduleId,
        session_id: sessionId,
        mark: Number(mark),
        grade,
        status: 'captured',
        date_captured: new Date().toISOString(),
        captured_by: profile.id,
      })
      if (insertErr) throw insertErr

      setMessage(`Result captured successfully — grade ${grade}.`)
      setStudentNumber('')
      setMark('')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  if (!module) return <p className="center-msg">Loading module…</p>

  return (
    <div className="page">
      <h2>Upload Result — {module.module_code} {module.module_name}</h2>
      <form className="card" onSubmit={handleSubmit}>
        {error && <p className="error">{error}</p>}
        {message && <p className="success">{message}</p>}

        <label>
          Exam session
          <select value={sessionId} onChange={(e) => setSessionId(e.target.value)} required>
            {sessions.map((s) => (
              <option key={s.id} value={s.id}>{s.semester} {s.year}</option>
            ))}
          </select>
        </label>

        <label>
          Student number
          <input value={studentNumber} onChange={(e) => setStudentNumber(e.target.value)} required />
        </label>

        <label>
          Mark (0–100)
          <input type="number" min="0" max="100" value={mark} onChange={(e) => setMark(e.target.value)} required />
        </label>

        <button type="submit" disabled={busy}>{busy ? 'Saving…' : 'Capture Result'}</button>
      </form>
    </div>
  )
}
