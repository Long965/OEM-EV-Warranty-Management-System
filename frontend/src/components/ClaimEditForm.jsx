import { useEffect, useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { getClaim, updateClaim, createClaim } from '../api/claims'

export default function ClaimEditForm({ claimId, onDone }) {
  const isEdit = !!claimId
  const [form, setForm] = useState({
    vehicle_vin: '',
    customer_name: '',
    part_serial: '',
    issue_desc: '',
    diagnosis_report: '',
    warranty_cost: ''
  })
  const [err, setErr] = useState(null)

  const { data } = useQuery({
    queryKey: ['claim', claimId],
    queryFn: () => getClaim(claimId),
    enabled: isEdit
  })

  useEffect(() => {
    if (data) {
      setForm({
        vehicle_vin: data.vehicle_vin || '',
        customer_name: data.customer_name || '',
        part_serial: data.part_serial || '',
        issue_desc: data.issue_desc || '',
        diagnosis_report: data.diagnosis_report || '',
        warranty_cost: data.warranty_cost || ''
      })
    }
  }, [data])

  const create = useMutation({
    mutationFn: createClaim,
    onSuccess: () => onDone?.(),
    onError: (e) => setErr(e?.response?.data?.detail || 'Create failed')
  })

  const update = useMutation({
    mutationFn: (payload) => updateClaim(claimId, payload),
    onSuccess: () => onDone?.(),
    onError: (e) => setErr(e?.response?.data?.detail || 'Update failed')
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    setErr(null)
    
    const payload = {
      ...form,
      warranty_cost: form.warranty_cost ? parseFloat(form.warranty_cost) : null,
      attachments: []
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
          value={form.vehicle_vin}
          onChange={e => setForm({ ...form, vehicle_vin: e.target.value })}
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

      <div className="form-col">
        <label>Mã serial linh kiện</label>
        <input
          className="input"
          value={form.part_serial}
          onChange={e => setForm({ ...form, part_serial: e.target.value })}
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
        />
      </div>

      <div className="form-col" style={{ gridColumn: '1/-1' }}>
        <label>Mô tả lỗi <span style={{ color: '#ef4444' }}>*</span></label>
        <textarea
          className="input"
          rows="4"
          value={form.issue_desc}
          onChange={e => setForm({ ...form, issue_desc: e.target.value })}
          required
          style={{ resize: 'vertical', height: 'auto' }}
        />
      </div>

      <div className="form-col" style={{ gridColumn: '1/-1' }}>
        <label>Báo cáo chẩn đoán</label>
        <textarea
          className="input"
          rows="3"
          value={form.diagnosis_report}
          onChange={e => setForm({ ...form, diagnosis_report: e.target.value })}
          style={{ resize: 'vertical', height: 'auto' }}
        />
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
          {create.isPending || update.isPending ? 'Đang lưu...' : isEdit ? 'Lưu thay đổi' : 'Tạo phiếu'}
        </button>
      </div>
    </form>
  )
}