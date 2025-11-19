import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { getUser, getProfile, updateUser, updateProfile } from '../api/users'

export default function Profile(){
  const { user } = useAuth()
  const [base, setBase] = useState(null)
  const [profile, setProfile] = useState(null)
  const [msg, setMsg] = useState(null); const [err, setErr] = useState(null)

  useEffect(()=>{
    (async ()=>{
      try{
        const [u,p] = await Promise.all([getUser(user.user_id), getProfile(user.user_id)])
        setBase(u); setProfile(p)
      }catch(e){ setErr(e?.response?.data?.detail || 'Load profile failed') }
    })()
  },[])

  async function save(){
    try{
      await updateUser(user.user_id, { username:base.username, email:base.email, full_name:base.full_name, phone:base.phone, gender:base.gender })
      await updateProfile(user.user_id, { username:profile.username, full_name:profile.full_name, phone:profile.phone, address:profile.address, position:profile.position, gender:profile.gender })
      setMsg('Đã lưu'); setErr(null)
    }catch(e){ setErr(e?.response?.data?.detail || 'Update failed') }
  }

  return (
    <div className="container">
      <div className="page-title"><div className="ico">🧑‍💼</div><h2>Hồ sơ cá nhân</h2></div>
      <div className="card card--pad" style={{paddingBottom:12}}>
        {err && <div style={{color:'#b91c1c'}}>{err}</div>}
        {msg && <div style={{color:'#166534'}}>{msg}</div>}

        <div className="form-grid" style={{marginTop:8}}>
          <div className="form-col">
            <label>Account • Username</label>
            <input className="input" value={base?.username||''} onChange={e=>setBase({...base, username:e.target.value})}/>
          </div>
          <div className="form-col">
            <label>Profile • Username</label>
            <input className="input" value={profile?.username||''} onChange={e=>setProfile({...profile, username:e.target.value})}/>
          </div>

          <div className="form-col">
            <label>Email</label>
            <input className="input" value={base?.email||''} onChange={e=>setBase({...base, email:e.target.value})}/>
          </div>
          <div className="form-col">
            <label>Full name</label>
            <input className="input" value={base?.full_name||''} onChange={e=>setBase({...base, full_name:e.target.value})}/>
          </div>

          <div className="form-col">
            <label>Phone</label>
            <input className="input" value={base?.phone||''} onChange={e=>setBase({...base, phone:e.target.value})}/>
          </div>
          <div className="form-col">
            <label>Address</label>
            <input className="input" value={profile?.address||''} onChange={e=>setProfile({...profile, address:e.target.value})}/>
          </div>

          <div className="form-col">
            <label>Gender</label>
            <input className="input" value={base?.gender||''} onChange={e=>setBase({...base, gender:e.target.value})}/>
          </div>
          <div className="form-col">
            <label>Position</label>
            <input className="input" value={profile?.position||''} onChange={e=>setProfile({...profile, position:e.target.value})}/>
          </div>
        </div>

        <div style={{display:'flex', justifyContent:'flex-end', gap:10, marginTop:12}}>
          <button className="btn btn-primary" onClick={save}>Lưu</button>
        </div>
      </div>
    </div>
  )
}
