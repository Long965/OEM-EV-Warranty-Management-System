import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, useMemo } from 'react'
import { useAuth } from '../context/AuthContext'
import { listClaims, approveClaim, rejectClaim } from '../api/claims'
import Modal from '../components/Modal'

// Styles được tách riêng để dễ quản lý
const styles = {
  container: {
    maxWidth: 1400,
    margin: '0 auto',
    padding: '32px 24px',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #ecfdf5 0%, #f0fdfa 50%, #ecfeff 100%)'
  },
  header: {
    marginBottom: 32,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 16
  },
  titleGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: 16
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 28,
    boxShadow: '0 8px 24px rgba(99, 102, 241, 0.3)'
  },
  title: {
    fontSize: 28,
    fontWeight: 800,
    color: '#1e293b',
    margin: 0
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4
  },
  statsRow: {
    display: 'flex',
    gap: 16,
    marginBottom: 24,
    flexWrap: 'wrap'
  },
  statCard: (color, bgColor) => ({
    flex: '1 1 200px',
    padding: '20px 24px',
    borderRadius: 16,
    background: '#fff',
    border: `1px solid ${bgColor}`,
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
  }),
  statIcon: (bgColor) => ({
    width: 48,
    height: 48,
    borderRadius: 12,
    background: bgColor,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 22
  }),
  statValue: (color) => ({
    fontSize: 28,
    fontWeight: 800,
    color: color
  }),
  statLabel: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: 500
  },
  toolbar: {
    display: 'flex',
    gap: 16,
    marginBottom: 24,
    flexWrap: 'wrap',
    alignItems: 'stretch'
  },
  searchBox: {
    flex: '1 1 300px',
    position: 'relative'
  },
  searchInput: {
    width: '100%',
    padding: '14px 20px 14px 52px',
    borderRadius: 14,
    border: '2px solid #e2e8f0',
    fontSize: 15,
    background: '#fff',
    transition: 'all 0.2s ease',
    outline: 'none',
    boxSizing: 'border-box'
  },
  searchIcon: {
    position: 'absolute',
    left: 18,
    top: '50%',
    transform: 'translateY(-50%)',
    fontSize: 20,
    opacity: 0.5
  },
  select: {
    padding: '14px 20px',
    borderRadius: 14,
    border: '2px solid #e2e8f0',
    fontSize: 15,
    background: '#fff',
    minWidth: 180,
    cursor: 'pointer',
    outline: 'none'
  },
  tableCard: {
    background: '#fff',
    borderRadius: 20,
    boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
    overflow: 'hidden'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  th: {
    padding: '16px 20px',
    textAlign: 'left',
    fontSize: 12,
    fontWeight: 700,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    background: '#f8fafc',
    borderBottom: '1px solid #e2e8f0'
  },
  td: {
    padding: '18px 20px',
    borderBottom: '1px solid #f1f5f9',
    fontSize: 14,
    color: '#334155'
  },
  badge: (type) => {
    const colors = {
      pending: { bg: '#fef3c7', color: '#d97706', border: '#fcd34d' },
      approved: { bg: '#d1fae5', color: '#059669', border: '#6ee7b7' },
      rejected: { bg: '#fee2e2', color: '#dc2626', border: '#fca5a5' }
    }
    const c = colors[type] || colors.pending
    return {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '6px 14px',
      borderRadius: 20,
      fontSize: 13,
      fontWeight: 600,
      background: c.bg,
      color: c.color,
      border: `1px solid ${c.border}`
    }
  },
  idBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 12px',
    borderRadius: 8,
    background: '#eef2ff',
    color: '#4f46e5',
    fontSize: 13,
    fontWeight: 700
  },
  vinText: {
    fontFamily: 'monospace',
    fontSize: 13,
    fontWeight: 600,
    color: '#334155',
    background: '#f1f5f9',
    padding: '4px 10px',
    borderRadius: 6
  },
  btnView: {
    padding: '10px 16px',
    borderRadius: 10,
    border: 'none',
    background: '#eef2ff',
    color: '#4f46e5',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    transition: 'all 0.2s ease'
  },
  btnApprove: {
    padding: '10px 18px',
    borderRadius: 10,
    border: 'none',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: '#fff',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
    transition: 'all 0.2s ease'
  },
  btnReject: {
    padding: '10px 18px',
    borderRadius: 10,
    border: 'none',
    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    color: '#fff',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
    transition: 'all 0.2s ease'
  },
  emptyState: {
    padding: '60px 20px',
    textAlign: 'center'
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
    opacity: 0.5
  },
  modalGrid: {
    display: 'grid',
    gap: 20
  },
  modalSection: {
    background: '#f8fafc',
    borderRadius: 16,
    padding: 20
  },
  modalLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: 8
  },
  modalValue: {
    fontSize: 16,
    fontWeight: 600,
    color: '#1e293b'
  }
}

const statusMap = {
  'Chờ duyệt': { type: 'pending', icon: '⏳', label: 'Chờ duyệt' },
  'Đã duyệt': { type: 'approved', icon: '✓', label: 'Đã duyệt' },
  'Từ chối': { type: 'rejected', icon: '✗', label: 'Từ chối' }
}

const StatusBadge = ({ status }) => {
  const value = typeof status === 'object' ? status.value : status
  const config = statusMap[value] || statusMap['Chờ duyệt']
  return (
    <span style={styles.badge(config.type)}>
      {config.icon} {config.label}
    </span>
  )
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

  // Thống kê
  const stats = useMemo(() => {
    const pending = data.filter(c => (typeof c.status === 'object' ? c.status.value : c.status) === 'Chờ duyệt').length
    const approved = data.filter(c => (typeof c.status === 'object' ? c.status.value : c.status) === 'Đã duyệt').length
    const rejected = data.filter(c => (typeof c.status === 'object' ? c.status.value : c.status) === 'Từ chối').length
    return { total: data.length, pending, approved, rejected }
  }, [data])

  const approve = useMutation({
    mutationFn: approveClaim,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['claims'] })
      alert('✅ Đã duyệt phiếu!')
    },
    onError: (e) => alert('❌ Lỗi: ' + (e?.response?.data?.detail || 'Không thể duyệt'))
  })

  const reject = useMutation({
    mutationFn: rejectClaim,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['claims'] })
      alert('⚠️ Đã từ chối phiếu!')
    },
    onError: (e) => alert('❌ Lỗi: ' + (e?.response?.data?.detail || 'Không thể từ chối'))
  })

  const formatCurrency = (amount) => {
    if (!amount) return '---'
    return parseFloat(amount).toLocaleString('vi-VN') + ' ₫'
  }

  const formatDate = (dateString) => {
    if (!dateString) return '---'
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    })
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.titleGroup}>
          <div style={styles.iconBox}>📋</div>
          <div>
            <h1 style={styles.title}>Quản lý phiếu bảo hành</h1>
            <p style={styles.subtitle}>Theo dõi và xử lý các yêu cầu bảo hành</p>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div style={styles.statsRow}>
        <div style={styles.statCard('#6366f1', '#e0e7ff')}>
          <div style={styles.statIcon('#e0e7ff')}>📊</div>
          <div>
            <div style={styles.statValue('#6366f1')}>{stats.total}</div>
            <div style={styles.statLabel}>Tổng phiếu</div>
          </div>
        </div>
        <div style={styles.statCard('#d97706', '#fef3c7')}>
          <div style={styles.statIcon('#fef3c7')}>⏳</div>
          <div>
            <div style={styles.statValue('#d97706')}>{stats.pending}</div>
            <div style={styles.statLabel}>Chờ duyệt</div>
          </div>
        </div>
        <div style={styles.statCard('#059669', '#d1fae5')}>
          <div style={styles.statIcon('#d1fae5')}>✓</div>
          <div>
            <div style={styles.statValue('#059669')}>{stats.approved}</div>
            <div style={styles.statLabel}>Đã duyệt</div>
          </div>
        </div>
        <div style={styles.statCard('#dc2626', '#fee2e2')}>
          <div style={styles.statIcon('#fee2e2')}>✗</div>
          <div>
            <div style={styles.statValue('#dc2626')}>{stats.rejected}</div>
            <div style={styles.statLabel}>Từ chối</div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div style={styles.toolbar}>
        <div style={styles.searchBox}>
          <span style={styles.searchIcon}>🔍</span>
          <input
            style={styles.searchInput}
            placeholder="Tìm theo VIN, tên khách hàng, mô tả..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          style={styles.select}
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="all">📁 Tất cả trạng thái</option>
          <option value="Chờ duyệt">⏳ Chờ duyệt</option>
          <option value="Đã duyệt">✓ Đã duyệt</option>
          <option value="Từ chối">✗ Từ chối</option>
        </select>
      </div>

      {/* Table */}
      <div style={styles.tableCard}>
        <div style={{ overflowX: 'auto' }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Mã phiếu</th>
                <th style={styles.th}>VIN xe</th>
                <th style={styles.th}>Khách hàng</th>
                <th style={styles.th}>Mô tả lỗi</th>
                <th style={styles.th}>Chi phí</th>
                <th style={styles.th}>Trạng thái</th>
                <th style={styles.th}>Ngày tạo</th>
                <th style={{...styles.th, textAlign: 'center'}}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="8" style={{...styles.td, textAlign: 'center', padding: '60px 20px'}}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>⏳</div>
                    <div style={{ fontSize: 16, color: '#64748b' }}>Đang tải dữ liệu...</div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="8" style={styles.td}>
                    <div style={styles.emptyState}>
                      <div style={styles.emptyIcon}>📭</div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: '#334155', marginBottom: 8 }}>
                        Không có phiếu nào
                      </div>
                      <div style={{ fontSize: 14, color: '#64748b' }}>
                        Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((claim, idx) => {
                  const statusValue = typeof claim.status === 'object' ? claim.status.value : claim.status
                  const isPending = statusValue === 'Chờ duyệt'
                  
                  return (
                    <tr key={claim.id} style={{ background: idx % 2 === 0 ? '#fff' : '#fafbfc' }}>
                      <td style={styles.td}>
                        <span style={styles.idBadge}>#{claim.id}</span>
                      </td>
                      <td style={styles.td}>
                        <span style={styles.vinText}>{claim.vehicle_vin}</span>
                      </td>
                      <td style={{...styles.td, fontWeight: 500}}>
                        {claim.customer_name || <span style={{color: '#94a3b8'}}>---</span>}
                      </td>
                      <td style={{...styles.td, maxWidth: 260}}>
                        <div style={{ 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis', 
                          whiteSpace: 'nowrap',
                          color: '#475569'
                        }}>
                          {claim.issue_desc || '---'}
                        </div>
                      </td>
                      <td style={{...styles.td, fontWeight: 700, color: '#059669'}}>
                        {formatCurrency(claim.warranty_cost)}
                      </td>
                      <td style={styles.td}>
                        <StatusBadge status={claim.status} />
                      </td>
                      <td style={{...styles.td, fontSize: 13, color: '#64748b'}}>
                        {formatDate(claim.created_at)}
                      </td>
                      <td style={{...styles.td, textAlign: 'center'}}>
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
                          <button
                            style={styles.btnView}
                            onClick={() => { setViewingClaim(claim); setOpenView(true) }}
                          >
                            👁 Xem
                          </button>
                          {isAdmin && isPending && (
                            <>
                              <button
                                style={styles.btnApprove}
                                onClick={() => {
                                  if (confirm(`Duyệt phiếu #${claim.id}?`)) approve.mutate(claim.id)
                                }}
                                disabled={approve.isPending}
                              >
                                ✓ Duyệt
                              </button>
                              <button
                                style={styles.btnReject}
                                onClick={() => {
                                  if (confirm(`Từ chối phiếu #${claim.id}?`)) reject.mutate(claim.id)
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
      <Modal open={openView} title={`Chi tiết phiếu #${viewingClaim?.id}`} onClose={() => setOpenView(false)}>
        {viewingClaim && (
          <div style={styles.modalGrid}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
              <div style={styles.modalSection}>
                <div style={styles.modalLabel}>Mã VIN</div>
                <div style={{...styles.modalValue, fontFamily: 'monospace'}}>{viewingClaim.vehicle_vin}</div>
              </div>
              <div style={styles.modalSection}>
                <div style={styles.modalLabel}>Khách hàng</div>
                <div style={styles.modalValue}>{viewingClaim.customer_name || '---'}</div>
              </div>
              <div style={styles.modalSection}>
                <div style={styles.modalLabel}>Serial linh kiện</div>
                <div style={styles.modalValue}>{viewingClaim.part_serial || '---'}</div>
              </div>
              <div style={styles.modalSection}>
                <div style={styles.modalLabel}>Chi phí bảo hành</div>
                <div style={{...styles.modalValue, fontSize: 22, color: '#059669'}}>
                  {formatCurrency(viewingClaim.warranty_cost)}
                </div>
              </div>
            </div>
            <div style={styles.modalSection}>
              <div style={styles.modalLabel}>Mô tả lỗi</div>
              <div style={{ color: '#334155', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                {viewingClaim.issue_desc || '---'}
              </div>
            </div>
            <div style={styles.modalSection}>
              <div style={styles.modalLabel}>Báo cáo chẩn đoán</div>
              <div style={{ color: '#334155', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                {viewingClaim.diagnosis_report || '---'}
              </div>
            </div>
            <div style={{...styles.modalSection, display: 'flex', alignItems: 'center', gap: 12}}>
              <span style={styles.modalLabel}>Trạng thái:</span>
              <StatusBadge status={viewingClaim.status} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}