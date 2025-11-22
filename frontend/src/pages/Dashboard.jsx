import { useAuth } from '../context/AuthContext'
export default function Dashboard(){
  const { user } = useAuth()
  return (
    <div className="container">
      <div className="page-title"><div className="ico">📊</div><h2>Dashboard</h2></div>
      <div className="card card--pad">
        Xin chào <b>{user?.username}</b>. Vai trò: <b>{user?.role}</b>.<br/>
        Đây là module IAM (Auth/RBAC) kết nối qua API Gateway.
      </div>
    </div>
  )
}
