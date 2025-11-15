import { useEffect, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { createUser, getUser, updateUser } from '../../api/users'

const ROLE_OPTIONS = [
  { id:2, name:'SC_Staff' },
  { id:3, name:'SC_Technician' }, { id:4, name:'EVM_Staff' }
]

export default function UserForm({ userId, onDone }){
  const isEdit = !!userId
  const [form, setForm] = useState({ username:'', email:'', full_name:'', phone:'', gender:'', role_id:2, password:'' })
  const [err, setErr] = useState(null)

  const { data } = useQuery({ queryKey:['user', userId], queryFn: ()=>getUser(Number(userId)), enabled: isEdit })
  useEffect(()=>{
    if(data){
      setForm({
        username: data.username||'',
        email: data.email||'',
        full_name: data.full_name||'',
        phone: data.phone||'',
        gender: data.gender||'',
        role_id: data.role_id||2,
        password:''
      })
    }
  },[data])

  const mCreate = useMutation({ mutationFn: createUser, onSuccess: ()=> onDone?.() })
  const mUpdate = useMutation({ mutationFn: (payload)=> updateUser(Number(userId), payload), onSuccess: ()=> onDone?.() })

  function submit(e){
    e.preventDefault(); setErr(null)
    const payload = {...form}
    if(!isEdit && (!payload.password || payload.password.length < 6)){ setErr('Mật khẩu tối thiểu 6 ký tự'); return }
    if(isEdit && !payload.password) delete payload.password
    ;(isEdit? mUpdate : mCreate).mutate(payload, { onError:(e)=> setErr(e?.response?.data?.detail || 'Save failed') })
  }

  return (
    <form className="form-grid" onSubmit={submit}>
      {err && <div style={{gridColumn:'1/-1', color:'#b91c1c', marginBottom:8}}>{err}</div>}

      <div className="form-col">
        <label>Username</label>
        <input className="input" value={form.username} onChange={e=>setForm({...form, username:e.target.value})}/>
      </div>

      <div className="form-col">
        <label>Họ và tên</label>
        <input className="input" value={form.full_name} onChange={e=>setForm({...form, full_name:e.target.value})}/>
      </div>

      <div className="form-col">
        <label>Email</label>
        <input className="input" type="email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})}/>
      </div>

      <div className="form-col">
        <label>Điện thoại</label>
        <input className="input" value={form.phone} onChange={e=>setForm({...form, phone:e.target.value})}/>
      </div>

      <div className="form-col">
        <label>Vai trò (Role)</label>
        <select className="select" value={form.role_id} onChange={e=>setForm({...form, role_id:Number(e.target.value)})}>
          {ROLE_OPTIONS.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
        </select>
      </div>

      <div className="form-col">
        <label>Giới tính</label>
        <select className="select" value={form.gender||''} onChange={e=>setForm({...form, gender:e.target.value})}>
          <option value="">Không xác định</option>
          <option value="male">Nam</option>
          <option value="female">Nữ</option>
          <option value="other">Khác</option>
        </select>
      </div>

      {!isEdit && (
        <div className="form-col" style={{gridColumn:'1/-1'}}>
          <label>Mật khẩu (≥ 6 ký tự)</label>
          <input className="input" type="password" value={form.password} onChange={e=>setForm({...form, password:e.target.value})}/>
        </div>
      )}

      <div style={{gridColumn:'1/-1', display:'flex', justifyContent:'flex-end', gap:10, marginTop:4}}>
        <button type="button" className="btn btn-ghost" onClick={()=>onDone?.()}>Hủy</button>
        <button className="btn btn-primary" type="submit">{isEdit ? 'Lưu thay đổi' : 'Thêm người dùng'}</button>
      </div>
    </form>
  )
}
