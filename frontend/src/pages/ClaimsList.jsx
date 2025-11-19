import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, useMemo } from 'react'
import { useAuth } from '../context/AuthContext'
import { listClaims, approveClaim, rejectClaim } from '../api/claims'
import api from '../api/client'
import Modal from '../components/Modal'

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
        c.customer_name?.toLowerCase().includes(q) ||
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
    },
    onError: (e) => {
      alert('❌ Lỗi: ' + (e?.response?.data?.detail || 'Không thể duyệt phiếu'))
    }
  })

  const reject = useMutation({
    mutationFn: rejectClaim,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['claims'] })
      alert('⚠️ Đã từ chối phiếu!')
    },
    onError: (e) => {
      alert('❌ Lỗi: ' + (e?.response?.data?.detail || 'Không thể từ chối phiếu'))
    }
  })

  const formatCurrency = (amount) => {
    if (!amount) return '---'
    return parseFloat(amount).toLocaleString('vi-VN') + '₫'
  }

  const formatDate = (dateString) => {
    if (!dateString) return '---'
    return new Date(dateString).toLocaleString('vi-VN')
  }

  return (
    <div className="container">
      <div className="page-title">
        <div className="ico">📋</div>
        <h2>Quản lý phiếu bảo hành</h2>
      </div>

      <div className="toolbar">
        <div className="searchbox">
          <span className="loupe">🔎</span>
          <input
            placeholder="Tìm theo VIN, tên khách hàng, mô tả..."
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
        <div style={{ color: 'var(--text-muted)', fontSize: 15, fontWeight: 600 }}>
          Tổng: <strong style={{ color: 'var(--primary)' }}>{filtered.length}</strong> phiếu
        </div>
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
                <th>Ngày tạo</th>
                <th style={{ width: 280 }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="8" className="card--pad">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                      <span style={{ fontSize: 20 }}>⏳</span>
                      Đang tải dữ liệu...
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="8" className="card--pad text-muted">
                    <div style={{ padding: '40px 0' }}>
                      <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
                      <div style={{ fontSize: 18, fontWeight: 600 }}>Không có phiếu nào</div>
                      <div style={{ fontSize: 14, marginTop: 4 }}>Thử điều chỉnh bộ lọc hoặc tìm kiếm</div>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map(claim => {
                  const statusValue = typeof claim.status === 'object' ? claim.status.value : claim.status
                  const isPending = statusValue === 'Chờ duyệt'
                  
                  return (
                    <tr key={claim.id}>
                      <td><strong style={{ color: 'var(--primary)' }}>#{claim.id}</strong></td>
                      <td><strong>{claim.vehicle_vin}</strong></td>
                      <td>{claim.customer_name || '---'}</td>
                      <td style={{ maxWidth: 300 }}>
                        <div style={{ 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis', 
                          whiteSpace: 'nowrap' 
                        }}>
                          {claim.issue_desc || '---'}
                        </div>
                      </td>
                      <td><strong>{formatCurrency(claim.warranty_cost)}</strong></td>
                      <td>{statusBadge(claim.status)}</td>
                      <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                        {formatDate(claim.created_at)}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                          {/* Nút Xem chi tiết */}
                          <button
                            className="icon-btn"
                            title="Xem chi tiết"
                            onClick={() => {
                              setViewingClaim(claim)
                              setOpenView(true)
                            }}
                            style={{ background: 'var(--info-light)', color: 'var(--info)' }}
                          >
                            👁
                          </button>

                          {/* Admin actions - chỉ hiện khi Chờ duyệt */}
                          {isAdmin && isPending && (
                            <>
                              <button
                                className="btn btn-success"
                                style={{ fontSize: 13, padding: '8px 16px' }}
                                onClick={() => {
                                  if (confirm(`Duyệt phiếu #${claim.id}?\nHành động này không thể hoàn tác.`))
                                    approve.mutate(claim.id)
                                }}
                                disabled={approve.isPending}
                              >
                                ✓ Duyệt
                              </button>
                              <button
                                className="btn btn-danger"
                                style={{ fontSize: 13, padding: '8px 16px' }}
                                onClick={() => {
                                  if (confirm(`Từ chối phiếu #${claim.id}?`))
                                    reject.mutate(claim.id)
                                }}
                                disabled={reject.isPending}
                              >
                                ✗ Từ chối
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Xem chi tiết */}
      <Modal
        open={openView}
        title={`Chi tiết phiếu #${viewingClaim?.id}`}
        onClose={() => setOpenView(false)}
      >
        {viewingClaim && (
          <div style={{ display: 'grid', gap: 20 }}>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(2, 1fr)', 
              gap: 20,
              padding: 20,
              background: 'var(--bg-secondary)',
              borderRadius: 12
            }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>
                  Mã VIN
                </div>
                <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>
                  {viewingClaim.vehicle_vin}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>
                  Khách hàng
                </div>
                <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>
                  {viewingClaim.customer_name || '---'}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>
                  Mã serial linh kiện
                </div>
                <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>
                  {viewingClaim.part_serial || '---'}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>
                  Chi phí bảo hành
                </div>
                <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--success)' }}>
                  {formatCurrency(viewingClaim.warranty_cost)}
                </div>
              </div>
            </div>

            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>
                Mô tả lỗi
              </div>
              <div style={{ 
                padding: 16, 
                background: 'var(--bg-secondary)', 
                borderRadius: 12,
                whiteSpace: 'pre-wrap',
                lineHeight: 1.6
              }}>
                {viewingClaim.issue_desc}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>
                Báo cáo chẩn đoán
              </div>
              <div style={{ 
                padding: 16, 
                background: 'var(--bg-secondary)', 
                borderRadius: 12,
                whiteSpace: 'pre-wrap',
                lineHeight: 1.6
              }}>
                {viewingClaim.diagnosis_report || '---'}
              </div>
            </div>

            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 16,
              padding: 16,
              background: 'var(--bg-secondary)',
              borderRadius: 12
            }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Trạng thái:
              </div>
              {statusBadge(viewingClaim.status)}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}