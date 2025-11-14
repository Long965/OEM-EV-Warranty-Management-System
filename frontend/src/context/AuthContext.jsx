import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { login as apiLogin, logout as apiLogout, register as apiRegister } from '../api/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    const raw = localStorage.getItem('auth_user')
    if (token && raw) setUser(JSON.parse(raw))
  }, [])

  async function login(username, password) {
    const res = await apiLogin(username, password) // {access_token,user_id,role,expires_in}
    const authUser = { user_id: res.user_id, username, role: res.role, token: res.access_token }
    localStorage.setItem('access_token', res.access_token)
    localStorage.setItem('auth_user', JSON.stringify(authUser))
    setUser(authUser)
  }

  async function register(payload) { await apiRegister(payload) }
  async function logout() { try { await apiLogout() } catch {} localStorage.clear(); setUser(null) }
  const hasRole = (...roles) => !!user && roles.includes(user.role)

  const value = useMemo(() => ({ user, login, logout, register, hasRole }), [user])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
