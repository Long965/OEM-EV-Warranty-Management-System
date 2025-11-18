import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar(){
  const { user, logout } = useAuth()
  const nav = useNavigate()

  return (
    <div className="appbar">
      <div className="appbar__wrap">
        <div className="brand">
          <div className="brand__icon">⚡</div>
          <div>OEM EV – IAM</div>
        </div>

        {user && (
          <div className="appbar__nav" style={{display:'flex',gap:6}}>
            <Link to="/">Dashboard</Link>
            <Link to="/profile">Profile</Link>
            {user.role === 'Admin' && <Link to="/users">Users</Link>}
          </div>
        )}

        <div className="appbar__right">
          {!user ? (
            <>
              <Link to="/login" className="btn btn-outline">Login</Link>
              <Link to="/register" className="btn btn-primary">Register</Link>
            </>
          ) : (
            <>
              <span className="badge-user">{user.username} ({user.role})</span>
              <button className="btn btn-danger" onClick={async ()=>{await logout(); nav('/login')}}>Đăng xuất</button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
