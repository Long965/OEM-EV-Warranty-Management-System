import api from './client'

export async function listClaims(role = 'user', userId = '01') {
  const { data } = await api.get('/claims/', {
    params: { role, user_id: userId }
  })
  return data
}

export async function getClaim(claimId) {
  const { data } = await api.get(`/claims/${claimId}`)
  return data
}

export async function createClaim(payload) {
  const { data } = await api.post('/claims/', payload)
  return data
}

export async function updateClaim(claimId, payload) {
  const { data } = await api.put(`/claims/${claimId}`, payload)
  return data
}

export async function approveClaim(claimId) {
  const { data } = await api.put(`/claims/${claimId}/approve`)
  return data
}

export async function rejectClaim(claimId) {
  const { data } = await api.put(`/claims/${claimId}/reject`)
  return data
}

export async function deleteClaim(claimId) {
  const { data } = await api.delete(`/claims/${claimId}`)
  return data
}

export async function getClaimHistory(role = 'user', userId = '01') {
  const { data } = await api.get('/claims/history', {
    params: { role, user_id: userId }
  })
  return data
}

export async function deleteClaimHistory(historyId) {
  const { data } = await api.delete(`/claims/history/${historyId}`)
  return data
}