import api from './client'

export async function login(username, password) {
  const { data } = await api.post('/auth/login', { username, password }) // gateway -> auth_service
  return data
}
export async function register(payload) {
  const { data } = await api.post('/auth/register', payload) // gateway -> auth_service
  return data
}
export async function logout() {
  const { data } = await api.post('/auth/logout')            // gateway -> auth_service
  return data
}
