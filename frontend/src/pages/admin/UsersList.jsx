import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteUser, listUsers } from '../../api/users'
import { useMemo, useState } from 'react'
import Modal from '../../components/Modal'
import UserForm from './UserForm'

const roleName = (u) => (u?.role?.role_name || u?.role_name || u?.role || '').toString() || ({
  1:'Admin', 2:'SC_Staff', 3:'SC_Technician', 4:'EVM_Staff'
}[u.role_id] || '—')
const roleCls = (name) => `role-pill role-${name.toLowerCase()}`

export default function UsersList(){
  const qc = useQueryClient()
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)

  const { data=[], isLoading, error } = useQuery({ queryKey:['users'], queryFn: listUsers })

  const filtered = useMemo(()=>{
    const v = q.trim().toLowerCase()
    if(!v) return data
    return data.filter(u =>
      [u.username, u.full_name, u.email, u.user_id].filter(Boolean)
       .some(x => String(x).toLowerCase().includes(v))
    )
  }, [q, data])

  const del = useMutation({
    mutationFn: deleteUser,
    onSuccess: ()=> qc.invalidateQueries({queryKey:['users']})
  })

  return (
    <div className="container">
      <div className="page-title">
        <div className="ico">👥</div>
        <h2>Quản lý Người dùng <span className="role-chip">Role: Admin</span></h2>
      </div>

      <div className="toolbar">
        <div className="searchbox">
          <span className="loupe">🔎</span>
          <input placeholder="Tìm kiếm theo tên, username, email..." value={q} onChange={e=>setQ(e.target.value)} />
        </div>
        <button className="btn btn-primary" onClick={()=>{ setEditingId(null); setOpen(true) }}>＋ Thêm Người dùng</button>
      </div>

      <div className="card">
        {error && <div className="card--pad" style={{color:'#b91c1c'}}>{error?.response?.data?.detail || 'Load failed'}</div>}
        <div style={{overflow:'auto'}}>
          <table className="table">
            <thead>
              <tr>
                <th>ID/USERNAME</th>
                <th>HỌ VÀ TÊN / EMAIL</th>
                <th>VAI TRÒ</th>
                <th>NGÀY TẠO</th>
                <th style={{width:140}}>THAO TÁC</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan="5" className="card--pad">Đang tải...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="5" className="card--pad text-muted">Không thấy kết quả cho “{q}”.</td></tr>
              ) : filtered.map(u=>(
                <tr key={u.user_id}>
                  <td>
                    <div className="usercell">
                      <div className="avatar">{(u.username||'U').slice(0,1).toUpperCase()}</div>
                      <div className="meta">
                        <div style={{fontWeight:800}}>{u.username}</div>
                        <small>ID: {u.user_id}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{fontWeight:700}}>{u.full_name || '—'}</div>
                    <div className="text-muted">{u.email || '—'}</div>
                  </td>
                  <td><span className={roleCls(roleName(u))}>{roleName(u)}</span></td>
                  <td>{u.created_at ? new Date(u.created_at).toLocaleDateString('vi-VN') : '—'}</td>
                  <td style={{textAlign:'right'}}>
                    <button className="icon-btn edit" title="Sửa"
                      onClick={()=>{ setEditingId(u.user_id); setOpen(true) }}>✎</button>
                    <button className="icon-btn del" title="Xóa"
                      onClick={()=>{ if(confirm(`Xóa ${u.username}?`)) del.mutate(u.user_id) }}>🗑</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        open={open}
        title={editingId ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}
        onClose={()=> setOpen(false)}
      >
        <UserForm userId={editingId} onDone={()=>{ setOpen(false); qc.invalidateQueries({queryKey:['users']}) }}/>
      </Modal>
    </div>
  )
}
