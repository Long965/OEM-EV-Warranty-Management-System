import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, useLocation, Link } from 'react-router-dom'

export default function Login() {
  const [form, setForm] = useState({ username: 'admin', password: '123456' })
  const [err, setErr] = useState(null)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const nav = useNavigate()
  const loc = useLocation()

  const onSubmit = async (e) => {
    e.preventDefault()
    setErr(null)
    setLoading(true)

    try {
      const userData = await login(form.username, form.password)
      
      // Smart redirect based on role
      let redirectTo = loc.state?.from || '/'
      
      // If no specific destination, redirect based on role
      if (redirectTo === '/') {
        redirectTo = userData.role === 'Admin' ? '/users' : '/'
      }
      
      nav(redirectTo, { replace: true })
    } catch (e) {
      setErr(e?.response?.data?.detail || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-card__header">
          <div className="auth-card__icon">🔐</div>
          <h2 className="auth-title">Đăng nhập</h2>
          <p className="auth-subtitle">Vui lòng nhập thông tin để tiếp tục</p>
        </div>

        <div className="auth-card__body">
          {err && <div className="auth-error">{err}</div>}

          <form className="auth-form" onSubmit={onSubmit}>
            <div className="auth-form-group">
              <label>USERNAME</label>
              <input 
                className="input" 
                value={form.username} 
                onChange={e => setForm({ ...form, username: e.target.value })}
                placeholder="Nhập username"
                autoFocus
              />
            </div>

            <div className="auth-form-group">
              <label>PASSWORD</label>
              <input 
                className="input" 
                type="password" 
                value={form.password} 
                onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder="Nhập mật khẩu"
              />
            </div>

            <button 
              className="btn btn-primary" 
              type="submit" 
              disabled={loading}
              style={{ width: '100%', marginTop: '8px' }}
            >
              {loading ? '⏳ Đang đăng nhập...' : '→ Đăng nhập'}
            </button>
          </form>

          <div style={{ 
            marginTop: '24px', 
            textAlign: 'center', 
            fontSize: '14px',
            color: 'var(--muted)'
          }}>
            Chưa có tài khoản?{' '}
            <Link 
              to="/register" 
              style={{ 
                color: 'var(--brand)', 
                fontWeight: 700,
                textDecoration: 'none'
              }}
            >
              Đăng ký ngay
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}