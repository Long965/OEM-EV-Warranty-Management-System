import api from './client'

// gateway -> user_service
export async function listUsers() { const { data } = await api.get('/users'); return data }
export async function getUser(id) { const { data } = await api.get(`/users/${id}`); return data }
export async function createUser(payload) { const { data } = await api.post('/users', payload); return data }
export async function updateUser(id, payload) { const { data } = await api.put(`/users/${id}`, payload); return data }
export async function deleteUser(id) { const { data } = await api.delete(`/users/${id}`); return data }

export async function getProfile(userId) { const { data } = await api.get(`/users/profiles/${userId}`); return data }
export async function updateProfile(userId, payload) { const { data } = await api.put(`/users/profiles/${userId}`, payload); return data }
