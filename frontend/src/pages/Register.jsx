import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function Register(){
  const { register } = useAuth()
  const [form, setForm] = useState({ username:'', password:'', email:'', full_name:'', phone:'', gender:'', role_name:'SC_Staff' })
  const [err, setErr] = useState(null); const [ok, setOk] = useState(null)
  const nav = useNavigate()

  async function submit(e){
    e.preventDefault(); setErr(null); setOk(null)
    try{
      await register(form)
      setOk('Đăng ký thành công. Hãy đăng nhập.')
      setTimeout(()=> nav('/login'), 900)
    }catch(e){ setErr(e?.response?.data?.detail || 'Đăng ký thất bại') }
  }

  return (
    <div className="container">
      <div className="card auth-card card--pad">
        <h2 className="auth-title">Đăng ký</h2>
        {ok && <div style={{color:'#166534', marginBottom:8}}>{ok}</div>}
        {err && <div style={{color:'#b91c1c', marginBottom:8}}>{err}</div>}
        <form className="auth-form" onSubmit={submit}>
          <label>Username</label>
          <input className="input" value={form.username} onChange={e=>setForm({...form, username:e.target.value})}/>
          <label style={{marginTop:8}}>Password</label>
          <input className="input" type="password" value={form.password} onChange={e=>setForm({...form, password:e.target.value})}/>
          <label style={{marginTop:8}}>Email</label>
          <input className="input" type="email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})}/>
          <label style={{marginTop:8}}>Full name</label>
          <input className="input" value={form.full_name} onChange={e=>setForm({...form, full_name:e.target.value})}/>
          <label style={{marginTop:8}}>Phone</label>
          <input className="input" value={form.phone} onChange={e=>setForm({...form, phone:e.target.value})}/>
          <label style={{marginTop:8}}>Gender</label>
          <input className="input" value={form.gender} onChange={e=>setForm({...form, gender:e.target.value})}/>
          <label style={{marginTop:8}}>Role</label>
          <select className="select" value={form.role_name} onChange={e=>setForm({...form, role_name:e.target.value})}>
            <option>SC_Staff</option><option>SC_Technician</option><option>EVM_Staff</option>
          </select>
          <div className="auth-actions"><button className="btn btn-primary" type="submit">Đăng ký</button></div>
        </form>
      </div>
    </div>
  )
}
