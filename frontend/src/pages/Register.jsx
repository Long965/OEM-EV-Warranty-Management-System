import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'

const SELECTABLE_ROLES = [
  { id: 2, name: 'SC_Staff' },
  { id: 3, name: 'SC_Technician' },
  { id: 4, name: 'EVM_Staff' }
]

export default function Register() {
  const [form, setForm] = useState({ 
    username: '', 
    password: '', 
    email: '', 
    role_name: 'SC_Staff', 
    full_name: '', 
    phone: '', 
    gender: '' 
  })
  const [msg, setMsg] = useState(null)
  const [err, setErr] = useState(null)
  const [loading, setLoading] = useState(false)
  const { register, login } = useAuth()
  const nav = useNavigate()

  const onSubmit = async (e) => {
    e.preventDefault()
    setErr(null)
    setMsg(null)
    setLoading(true)

    try {
      // 1. Đăng ký tài khoản
      await register({ ...form })
      
      // 2. Tự động đăng nhập luôn
      await login(form.username, form.password)
      
      // 3. Hiển thị thông báo
      setMsg('✓ Đăng ký thành công! Đang chuyển vào hệ thống...')
      
      // 4. Redirect sau 600ms
      setTimeout(() => {
        const redirectTo = form.role_name === 'Admin' ? '/users' : '/'
        nav(redirectTo, { replace: true })
      }, 600)
      
    } catch (e) {
      setErr(e?.response?.data?.detail || 'Đăng ký thất bại. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card" style={{ maxWidth: '600px' }}>
        {/* Header */}
        <div className="auth-card__header">
          <div className="auth-card__icon">📝</div>
          <h2 className="auth-title">Đăng ký tài khoản</h2>
          <p className="auth-subtitle">Tạo tài khoản mới để sử dụng hệ thống</p>
        </div>

        {/* Body */}
        <div className="auth-card__body">
          {msg && <div className="auth-success">{msg}</div>}
          {err && <div className="auth-error">{err}</div>}

          <form className="auth-form" onSubmit={onSubmit}>
            {/* Row 1: Username + Full Name */}
            <div className="auth-form-row">
              <div className="auth-form-group">
                <label>USERNAME *</label>
                <input 
                  className="input" 
                  value={form.username} 
                  onChange={e => setForm({ ...form, username: e.target.value })}
                  placeholder="Nhập username"
                  required
                  autoFocus
                />
              </div>

              <div className="auth-form-group">
                <label>HỌ VÀ TÊN *</label>
                <input 
                  className="input" 
                  value={form.full_name} 
                  onChange={e => setForm({ ...form, full_name: e.target.value })}
                  placeholder="Nguyễn Văn A"
                  required
                />
              </div>
            </div>

            {/* Row 2: Email + Phone */}
            <div className="auth-form-row">
              <div className="auth-form-group">
                <label>EMAIL *</label>
                <input 
                  className="input" 
                  type="email"
                  value={form.email} 
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="email@example.com"
                  required
                />
              </div>

              <div className="auth-form-group">
                <label>ĐIỆN THOẠI</label>
                <input 
                  className="input" 
                  value={form.phone} 
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  placeholder="0912345678"
                />
              </div>
            </div>

            {/* Password */}
            <div className="auth-form-group">
              <label>MẬT KHẨU * (Tối thiểu 6 ký tự)</label>
              <input 
                className="input" 
                type="password"
                value={form.password} 
                onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                required
              />
            </div>

            {/* Row 3: Gender + Role */}
            <div className="auth-form-row">
              <div className="auth-form-group">
                <label>GIỚI TÍNH</label>
                <select 
                  className="select"
                  value={form.gender} 
                  onChange={e => setForm({ ...form, gender: e.target.value })}
                >
                  <option value="">Không xác định</option>
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                  <option value="other">Khác</option>
                </select>
              </div>

              <div className="auth-form-group">
                <label>VAI TRÒ</label>
                <select 
                  className="select"
                  value={form.role_name} 
                  onChange={e => setForm({ ...form, role_name: e.target.value })}
                >
                  {SELECTABLE_ROLES.map(r => (
                    <option key={r.id} value={r.name}>{r.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Submit Button */}
            <button 
              className="btn btn-primary" 
              type="submit" 
              disabled={loading}
              style={{ width: '100%', marginTop: '8px' }}
            >
              {loading ? '⏳ Đang đăng ký...' : '✓ Đăng ký'}
            </button>
          </form>

          {/* Link to Login */}
          <div style={{ 
            marginTop: '24px', 
            textAlign: 'center', 
            fontSize: '14px',
            color: 'var(--muted)'
          }}>
            Đã có tài khoản?{' '}
            <Link 
              to="/login" 
              style={{ 
                color: 'var(--brand)', 
                fontWeight: 700,
                textDecoration: 'none'
              }}
            >
              Đăng nhập ngay
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}