import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import RoleGuard from './components/RoleGuard'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import UsersList from './pages/admin/UsersList'
import UserForm from './pages/admin/UserForm'

export default function App() {
  const location = useLocation()
  
  // Check if current page is auth page (login/register)
  const isAuthPage = ['/login', '/register'].includes(location.pathname)

  return (
    <div className="app-wrapper">
      {/* Only show Navbar if NOT on auth pages */}
      {!isAuthPage && <Navbar />}
      
      {/* Main content with conditional padding */}
      <div className={isAuthPage ? '' : 'main-content'}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          
          <Route 
            path="/users" 
            element={
              <ProtectedRoute>
                <RoleGuard roles={['Admin']}>
                  <UsersList />
                </RoleGuard>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/users/new" 
            element={
              <ProtectedRoute>
                <RoleGuard roles={['Admin']}>
                  <UserForm />
                </RoleGuard>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/users/:userId" 
            element={
              <ProtectedRoute>
                <RoleGuard roles={['Admin']}>
                  <UserForm />
                </RoleGuard>
              </ProtectedRoute>
            } 
          />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  )
}