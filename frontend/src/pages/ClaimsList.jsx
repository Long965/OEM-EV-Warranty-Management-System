import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, useMemo } from 'react'
import { useAuth } from '../context/AuthContext'
import { listClaims, approveClaim, rejectClaim, deleteClaim } from '../api/claims'
import Modal from '../components/Modal'
import ClaimEditForm from '../components/ClaimEditForm'

const statusClassMap = {
  'Chờ duyệt': 'pending',
  'Đã duyệt': 'approved',
  'Từ chối': 'rejected'
}

const statusBadge = (status) => {
  const value = typeof status === 'object' ? status.value : status
  const className = statusClassMap[value] || 'pending'
  return <span className={`role-pill role-${className}`}>{value}</span>
}

export default function ClaimsList() {
  const { user } = useAuth()
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [editingId, setEditingId] = useState(null)
  const [openEdit, setOpenEdit] = useState(false)
  const [viewingClaim, setViewingClaim] = useState(null)
  const [openView, setOpenView] = useState(false)

  const isAdmin = user?.role === 'Admin'

  const { data = [], isLoading } = useQuery({
    queryKey: ['claims', user?.user_id, user?.role],
    queryFn: () => listClaims(isAdmin ? 'admin' : 'user', user?.user_id),
    enabled: !!user
  })

  const filtered = useMemo(() => {
    let result = data
    
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(c =>
        c.vehicle_vin?.toLowerCase().includes(q) ||
        c.issue_desc?.toLowerCase().includes(q) ||
        c.id?.toString().includes(q)
      )
    }
    
    if (statusFilter !== 'all') {
      result = result.filter(c => {
        const status = typeof c.status === 'object' ? c.status.value : c.status
        return status === statusFilter
      })
    }
    
    return result
  }, [data, search, statusFilter])

  const approve = useMutation({
    mutationFn: approveClaim,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['claims'] })
      alert('✅ Đã duyệt phiếu!')
    }
  })

  const reject = useMutation({
    mutationFn: rejectClaim,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['claims'] })
      alert('⚠️ Đã từ chối phiếu!')
    }
  })

  const del = useMutation({
    mutationFn: deleteClaim,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['claims'] })
      alert('🗑️ Đã xóa phiếu!')
    }
  })

  const formatCurrency = (amount) => {
    if (!amount) return '---'
    return parseFloat(amount).toLocaleString('vi-VN') + '₫'
  }

  return (
    <div className="container">
      <div className="page-title">
        <div className="ico">📋</div>
        <h2>{isAdmin ? 'Quản lý phiếu bảo hành' : 'Trạng thái phiếu'}</h2>
      </div>

      <div className="toolbar">
        <div className="searchbox">
          <span className="loupe">🔎</span>
          <input
            placeholder="Tìm theo VIN, mô tả..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          className="select"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          style={{ width: 200 }}
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="Chờ duyệt">Chờ duyệt</option>
          <option value="Đã duyệt">Đã duyệt</option>
          <option value="Từ chối">Từ chối</option>
        </select>
        {isAdmin && (
          <button
            className="btn btn-primary"
            onClick={() => { setEditingId(null); setOpenEdit(true) }}
          >
            ➕ Tạo phiếu mới
          </button>
        )}
      </div>

      <div className="card">
        <div style={{ overflow: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>VIN</th>
                <th>Khách hàng</th>
                <th>Mô tả</th>
                <th>Chi phí</th>
                <th>Trạng thái</th>
                {isAdmin && <th style={{ width: 240 }}>Thao tác</th>}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={isAdmin ? 7 : 6} className="card--pad">Đang tải...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 7 : 6} className="card--pad text-muted">
                    Không có phiếu nào
                  </td>
                </tr>
              ) : (
                filtered.map(claim => {
                  const statusValue = typeof claim.status === 'object' ? claim.status.value : claim.status
                  const isPending = statusValue === 'Chờ duyệt'
                  
                  return (
                    <tr key={claim.id}>
                      <td><strong>#{claim.id}</strong></td>
                      <td>{claim.vehicle_vin}</td>
                      <td>{claim.customer_name || '---'}</td>
                      <td style={{ maxWidth: 300 }}>
                        {claim.issue_desc?.substring(0, 80) || '---'}
                        {claim.issue_desc?.length > 80 && '...'}
                      </td>
                      <td>{formatCurrency(claim.warranty_cost)}</td>
                      <td>{statusBadge(claim.status)}</td>
                      {isAdmin && (
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                            {/* Nút Xem chi tiết */}
                            <button
                              className="icon-btn"
                              title="Xem chi tiết"
                              onClick={() => {
                                setViewingClaim(claim)
                                setOpenView(true)
                              }}
                              style={{ background: '#3b82f6', color: 'white' }}
                            >
                              👁
                            </button>

                            {isPending && (
                              <>
                                {/* Nút Sửa - chỉ hiện khi Chờ duyệt */}
                                <button
                                  className="icon-btn edit"
                                  title="Sửa"
                                  onClick={() => {
                                    setEditingId(claim.id)
                                    setOpenEdit(true)
                                  }}
                                >
                                  ✎
                                </button>

                                {/* Nút Duyệt - chỉ hiện khi Chờ duyệt */}
                                <button
                                  className="btn btn-primary"
                                  style={{ fontSize: 12, padding: '6px 12px' }}
                                  onClick={() => {
                                    if (confirm(`Duyệt phiếu #${claim.id}?`))
                                      approve.mutate(claim.id)
                                  }}
                                >
                                  ✓ Duyệt
                                </button>

                                {/* Nút Từ chối - chỉ hiện khi Chờ duyệt */}
                                <button
                                  className="btn btn-danger"
                                  style={{ fontSize: 12, padding: '6px 12px' }}
                                  onClick={() => {
                                    if (confirm(`Từ chối phiếu #${claim.id}?`))
                                      reject.mutate(claim.id)
                                  }}
                                >
                                  ✗ Từ chối
                                </button>
                              </>
                            )}

                            {/* Nút Xóa - luôn hiện */}
                            <button
                              className="icon-btn del"
                              title="Xóa phiếu"
                              onClick={() => {
                                if (confirm(`Xóa phiếu #${claim.id}?\nHành động này không thể hoàn tác.`))
                                  del.mutate(claim.id)
                              }}
                            >
                              🗑
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Sửa/Tạo phiếu */}
      {isAdmin && (
        <Modal
          open={openEdit}
          title={editingId ? 'Chỉnh sửa phiếu bảo hành' : 'Tạo phiếu bảo hành mới'}
          onClose={() => setOpenEdit(false)}
        >
          <ClaimEditForm
            claimId={editingId}
            onDone={() => {
              setOpenEdit(false)
              qc.invalidateQueries({ queryKey: ['claims'] })
            }}
          />
        </Modal>
      )}

      {/* Modal Xem chi tiết */}
      {isAdmin && (
        <Modal
          open={openView}
          title={`Chi tiết phiếu #${viewingClaim?.id}`}
          onClose={() => setOpenView(false)}
        >
          {viewingClaim && (
            <div style={{ display: 'grid', gap: 16 }}>
              <div>
                <strong style={{ color: '#64748b', fontSize: 13 }}>Mã VIN:</strong>
                <div style={{ marginTop: 4 }}>{viewingClaim.vehicle_vin}</div>
              </div>
              <div>
                <strong style={{ color: '#64748b', fontSize: 13 }}>Khách hàng:</strong>
                <div style={{ marginTop: 4 }}>{viewingClaim.customer_name || '---'}</div>
              </div>
              <div>
                <strong style={{ color: '#64748b', fontSize: 13 }}>Mã serial linh kiện:</strong>
                <div style={{ marginTop: 4 }}>{viewingClaim.part_serial || '---'}</div>
              </div>
              <div>
                <strong style={{ color: '#64748b', fontSize: 13 }}>Mô tả lỗi:</strong>
                <div style={{ marginTop: 4, whiteSpace: 'pre-wrap' }}>{viewingClaim.issue_desc}</div>
              </div>
              <div>
                <strong style={{ color: '#64748b', fontSize: 13 }}>Báo cáo chẩn đoán:</strong>
                <div style={{ marginTop: 4, whiteSpace: 'pre-wrap' }}>{viewingClaim.diagnosis_report || '---'}</div>
              </div>
              <div>
                <strong style={{ color: '#64748b', fontSize: 13 }}>Chi phí bảo hành:</strong>
                <div style={{ marginTop: 4, fontSize: 18, fontWeight: 600, color: '#2563eb' }}>
                  {formatCurrency(viewingClaim.warranty_cost)}
                </div>
              </div>
              <div>
                <strong style={{ color: '#64748b', fontSize: 13 }}>Trạng thái:</strong>
                <div style={{ marginTop: 4 }}>{statusBadge(viewingClaim.status)}</div>
              </div>
            </div>
          )}
        </Modal>
      )}
    </div>
  )
}