import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, Link, useLocation } from 'react-router-dom'

export default function Login(){
  const { login } = useAuth()
  const [form, setForm] = useState({ username:'', password:'' })
  const [err, setErr] = useState(null)
  const nav = useNavigate(); const loc = useLocation()

  async function submit(e){
    e.preventDefault()
    setErr(null)
    try{
      await login(form.username, form.password)
      nav(loc.state?.from || '/', { replace:true })
    }catch(e){ setErr(e?.response?.data?.detail || 'Đăng nhập thất bại') }
  }

  return (
    <div className="container">
      <div className="card auth-card card--pad">
        <h2 className="auth-title">Đăng nhập</h2>
        {err && <div style={{color:'#b91c1c', marginBottom:10}}>{err}</div>}
        <form className="auth-form" onSubmit={submit}>
          <label>Username</label>
          <input className="input" autoFocus value={form.username} onChange={e=>setForm({...form, username:e.target.value})}/>
          <label style={{marginTop:8}}>Password</label>
          <input className="input" type="password" value={form.password} onChange={e=>setForm({...form, password:e.target.value})}/>
          <div className="auth-actions">
            <button className="btn btn-primary" type="submit">Login</button>
          </div>
        </form>
        <div style={{marginTop:8}}>Chưa có tài khoản? <Link to="/register">Đăng ký</Link></div>
      </div>
    </div>
  )
}
