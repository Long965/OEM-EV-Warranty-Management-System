import api from './client'

// List all claims (admin sees all, user sees their own)
export async function listClaims(role = 'user', userId = '01') {
  const { data } = await api.get('/claims/', {
    params: { role, user_id: userId }
  })
  return data
}

// Get single claim
export async function getClaim(claimId) {
  const { data } = await api.get(`/claims/${claimId}`)
  return data
}

// Create claim - Chỉ Admin có thể tạo claim trực tiếp
export async function createClaim(payload) {
  const { data } = await api.post('/claims/', payload)
  return data
}

// Update claim - Chỉ Admin có thể cập nhật
export async function updateClaim(claimId, payload) {
  const { data } = await api.put(`/claims/${claimId}`, payload)
  return data
}

// Approve claim - Chỉ Admin
export async function approveClaim(claimId) {
  const { data } = await api.put(`/claims/${claimId}/approve`)
  return data
}

// Reject claim - Chỉ Admin
export async function rejectClaim(claimId) {
  const { data } = await api.put(`/claims/${claimId}/reject`)
  return data
}

// Delete claim - Chỉ Admin
export async function deleteClaim(claimId) {
  const { data } = await api.delete(`/claims/${claimId}`)
  return data
}

// Get claim history
export async function getClaimHistory(role = 'user', userId = '01') {
  const { data } = await api.get('/claims/history', {
    params: { role, user_id: userId }
  })
  return data
}

// Delete history record - Chỉ Admin
export async function deleteClaimHistory(historyId) {
  const { data } = await api.delete(`/claims/history/${historyId}`)
  return data
}