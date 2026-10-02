import{ useEffect, useState} from 'react'

export default function LecturerDashoard(){
const [modules, setModules] = useState([])
const [loading, setloading] = useState(true)

   useEffect(() => {
    async function fetchModules() {
      setLoading(true)
      const { data } = await supabase.from('modules').select('*').order('module_code')
      setModules(data ?? [])
      setLoading(false)
    }
    fetchModules()
  }, [])

 if (loading) return <p className="center-msg">Loading modules…</p>
return (
 <div className="page">
   <h2>Lecturer Dashboard</h2>
   <p className="muted">Pick a module to capture or edit exam results.</p>
   <table className="table">
     <thead>
        <tr><th>Code</th><th>Module</th><th>Semester</th><th></th></tr>
     </thead>
     <tbody>
        {modules.map((m) => (
          <tr key={m.id}>
            <td>{m.module_code}</td>
            <td>{m.module_name}</td>
            <td>{m.semester}</td>
            <td><Link to={`/lecturer/upload/${m.id}`}>Upload results</Link></td>
            </tr>
          ))}
      </tbody>
    </table>
 </div>
  )
}
   
