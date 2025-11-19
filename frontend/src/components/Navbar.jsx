import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const nav = useNavigate()

  return (
    <div className="appbar">
      <div className="appbar__wrap">
        <div className="brand">
          <div className="brand__icon">⚡</div>
          <div>OEM EV Warranty</div>
        </div>

        {user && (
          <div className="appbar__nav" style={{ display: 'flex', gap: 6 }}>
            <Link to="/profile">Profile</Link>
           
            {/* Admin: Quản lý Users + Claims + History */}
            {user.role === 'Admin' && (
              <>
                <Link to="/users">Users</Link>
                <Link to="/claims">Warranty Claims</Link>
                <Link to="/history">History (Admin)</Link>
                <Link to="/parts">Parts Management</Link>
                <Link to="/assignments">Assignments</Link>
                <Link to="/inventory">Inventory</Link>
                <Link to="/alerts">Alerts</Link>
              </>
            )}
           
            {/* Staff roles: Xem Uploads + Lịch sử cá nhân */}
            {['SC_Staff', 'SC_Technician', 'EVM_Staff'].includes(user.role) && (
              <>
                <Link to="/uploads">My Warranties</Link>
                <Link to="/user-history">My History</Link>
              </>
            )}
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
              <button
                className="btn btn-danger"
                onClick={async () => {
                  await logout();
                  nav('/login')
                }}
              >
                Đăng xuất
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}