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
import ClaimsList from './pages/ClaimsList'
import UploadsList from './pages/UploadsList'
import ClaimHistory from './pages/ClaimHistory'
import UserHistory from './pages/UserHistory'

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
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
         
          {/* Protected routes */}
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
         
          {/* Admin-only routes */}
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

          {/* Claims - Admin only */}
          <Route
            path="/claims"
            element={
              <ProtectedRoute>
                <RoleGuard roles={['Admin']}>
                  <ClaimsList />
                </RoleGuard>
              </ProtectedRoute>
            }
          />

          {/* History - Admin only */}
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <RoleGuard roles={['Admin']}>
                  <ClaimHistory />
                </RoleGuard>
              </ProtectedRoute>
            }
          />

          {/* Uploads - Staff only (read-only) */}
          <Route
            path="/uploads"
            element={
              <ProtectedRoute>
                <RoleGuard roles={['SC_Staff', 'SC_Technician', 'EVM_Staff']}>
                  <UploadsList />
                </RoleGuard>
              </ProtectedRoute>
            }
          />

          {/* User History - Staff only */}
          <Route
            path="/user-history"
            element={
              <ProtectedRoute>
                <RoleGuard roles={['SC_Staff', 'SC_Technician', 'EVM_Staff']}>
                  <UserHistory />
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