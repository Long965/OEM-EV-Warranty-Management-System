import { useEffect, useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { getUpload, createUpload, updateUpload, uploadFiles } from '../api/uploads'

export default function UploadForm({ uploadId, onDone }) {
  const isEdit = !!uploadId
  const [form, setForm] = useState({
    vin: '',
    customer_name: '',
    description: '',
    diagnosis: '',
    warranty_cost: '',
    file_url: ''
  })
  const [files, setFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const [err, setErr] = useState(null)

  const { data } = useQuery({
    queryKey: ['upload', uploadId],
    queryFn: () => getUpload(uploadId),
    enabled: isEdit
  })

  useEffect(() => {
    if (data) {
      setForm({
        vin: data.vin || '',
        customer_name: data.customer_name || '',
        description: data.description || '',
        diagnosis: data.diagnosis || '',
        warranty_cost: data.warranty_cost || '',
        file_url: data.file_url || ''
      })
    }
  }, [data])

  const create = useMutation({
    mutationFn: createUpload,
    onSuccess: () => onDone?.(),
    onError: (e) => setErr(e?.response?.data?.detail || 'Create failed')
  })

  const update = useMutation({
    mutationFn: (payload) => updateUpload(uploadId, payload),
    onSuccess: () => onDone?.(),
    onError: (e) => setErr(e?.response?.data?.detail || 'Update failed')
  })

  const handleFileChange = async (e) => {
    const selectedFiles = Array.from(e.target.files)
    if (selectedFiles.length === 0) return

    setUploading(true)
    setErr(null)

    try {
      const result = await uploadFiles(selectedFiles)
      setFiles(result.files)
      if (result.files.length > 0) {
        setForm({ ...form, file_url: result.files[0].url })
      }
      alert(`✅ Đã tải lên ${result.files.length} file`)
    } catch (e) {
      setErr('Lỗi khi tải file lên!')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setErr(null)

    const payload = {
      ...form,
      warranty_cost: form.warranty_cost ? parseFloat(form.warranty_cost) : null
    }

    if (isEdit) {
      update.mutate(payload)
    } else {
      create.mutate(payload)
    }
  }

  return (
    <form className="form-grid" onSubmit={handleSubmit}>
      {err && (
        <div style={{ gridColumn: '1/-1', color: '#b91c1c', marginBottom: 8 }}>
          {err}
        </div>
      )}

      <div className="form-col">
        <label>Mã VIN <span style={{ color: '#ef4444' }}>*</span></label>
        <input
          className="input"
          value={form.vin}
          onChange={e => setForm({ ...form, vin: e.target.value })}
          placeholder="Nhập mã VIN"
          required
        />
      </div>

      <div className="form-col">
        <label>Tên khách hàng</label>
        <input
          className="input"
          value={form.customer_name}
          onChange={e => setForm({ ...form, customer_name: e.target.value })}
          placeholder="Nguyễn Văn A"
        />
      </div>

      <div className="form-col" style={{ gridColumn: '1/-1' }}>
        <label>Mô tả vấn đề <span style={{ color: '#ef4444' }}>*</span></label>
        <textarea
          className="input"
          rows="4"
          value={form.description}
          onChange={e => setForm({ ...form, description: e.target.value })}
          placeholder="Mô tả chi tiết vấn đề bảo hành"
          required
          style={{ resize: 'vertical', height: 'auto' }}
        />
      </div>

      <div className="form-col" style={{ gridColumn: '1/-1' }}>
        <label>Chẩn đoán kỹ thuật</label>
        <textarea
          className="input"
          rows="3"
          value={form.diagnosis}
          onChange={e => setForm({ ...form, diagnosis: e.target.value })}
          placeholder="Kết quả chẩn đoán"
          style={{ resize: 'vertical', height: 'auto' }}
        />
      </div>

      <div className="form-col">
        <label>Chi phí bảo hành (₫)</label>
        <input
          className="input"
          type="number"
          step="0.01"
          min="0"
          value={form.warranty_cost}
          onChange={e => setForm({ ...form, warranty_cost: e.target.value })}
          placeholder="0"
        />
      </div>

      <div className="form-col">
        <label>Tệp đính kèm</label>
        <input
          type="file"
          multiple
          accept="image/*,.pdf,.doc,.docx"
          onChange={handleFileChange}
          style={{
            padding: '10px',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            cursor: 'pointer'
          }}
        />
        {uploading && <div style={{ fontSize: 13, color: '#2563eb', marginTop: 4 }}>⏳ Đang tải...</div>}
        {files.length > 0 && (
          <div style={{ fontSize: 13, color: '#16a34a', marginTop: 4 }}>
            ✓ Đã tải: {files.map(f => f.name).join(', ')}
          </div>
        )}
      </div>

      <div style={{ gridColumn: '1/-1', display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 4 }}>
        <button type="button" className="btn btn-ghost" onClick={() => onDone?.()}>
          Hủy
        </button>
        <button
          className="btn btn-primary"
          type="submit"
          disabled={create.isPending || update.isPending}
        >
          {create.isPending || update.isPending
            ? 'Đang lưu...'
            : isEdit
            ? 'Lưu thay đổi'
            : 'Tạo phiếu'}
        </button>
      </div>
    </form>
  )
}