import api from './client'

export async function listUploads(createdBy) {
  const { data } = await api.get('/uploads/', {
    params: createdBy ? { created_by: createdBy } : {}
  })
  return data
}

export async function getUpload(uploadId) {
  const { data } = await api.get(`/uploads/${uploadId}`)
  return data
}

export async function createUpload(payload) {
  const { data } = await api.post('/uploads/', payload)
  return data
}

export async function updateUpload(uploadId, payload) {
  const { data } = await api.put(`/uploads/${uploadId}`, payload)
  return data
}

export async function deleteUpload(uploadId) {
  const { data } = await api.delete(`/uploads/${uploadId}`)
  return data
}

export async function submitUpload(uploadId) {
  const { data } = await api.put(`/uploads/${uploadId}/submit`)
  return data
}

export async function uploadFiles(files) {
  const formData = new FormData()
  files.forEach(file => formData.append('files', file))
 
  const { data } = await api.post('/uploads/files', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return data
}