import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, useMemo } from 'react'
import { useAuth } from '../context/AuthContext'
import { listUploads, deleteUpload, submitUpload } from '../api/uploads'
import Modal from '../components/Modal'
import UploadForm from '../components/UploadForm'

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
    background: 'linear-gradient(135deg, #10b981 0%, #14b8a6 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 28,
    boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)'
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
  btnCreate: {
    padding: '14px 28px',
    borderRadius: 14,
    border: 'none',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: '#fff',
    fontSize: 15,
    fontWeight: 700,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 10,
    boxShadow: '0 8px 24px rgba(16, 185, 129, 0.35)',
    transition: 'all 0.3s ease'
  },
  statsRow: {
    display: 'flex',
    gap: 16,
    marginBottom: 24,
    flexWrap: 'wrap'
  },
  statCard: (color, bgColor) => ({
    flex: '1 1 180px',
    padding: '20px 24px',
    borderRadius: 16,
    background: '#fff',
    border: `1px solid ${bgColor}`,
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
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
      sent: { bg: '#dbeafe', color: '#2563eb', border: '#93c5fd' },
      approved: { bg: '#d1fae5', color: '#059669', border: '#6ee7b7' },
      rejected: { bg: '#fee2e2', color: '#dc2626', border: '#fca5a5' }
    }
    const c = colors[type] || colors.sent
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
    background: '#ecfdf5',
    color: '#059669',
    fontSize: 13,
    fontWeight: 700
  },
  sentTag: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
    padding: '2px 8px',
    borderRadius: 6,
    background: '#d1fae5',
    color: '#059669',
    fontSize: 11,
    fontWeight: 600
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
    padding: '8px 12px',
    borderRadius: 10,
    border: 'none',
    background: '#e0f2fe',
    color: '#0284c7',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  btnSend: {
    padding: '8px 14px',
    borderRadius: 10,
    border: 'none',
    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    color: '#fff',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
    transition: 'all 0.2s ease'
  },
  btnEdit: {
    padding: '8px 12px',
    borderRadius: 10,
    border: 'none',
    background: '#fef3c7',
    color: '#d97706',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  btnDelete: {
    padding: '8px 12px',
    borderRadius: 10,
    border: 'none',
    background: '#fee2e2',
    color: '#dc2626',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  emptyState: {
    padding: '80px 20px',
    textAlign: 'center'
  },
  emptyIcon: {
    fontSize: 72,
    marginBottom: 20
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
  'Đã gửi': { type: 'sent', icon: '📤', label: 'Đã gửi' },
  'Đã duyệt': { type: 'approved', icon: '✓', label: 'Đã duyệt' },
  'Từ chối': { type: 'rejected', icon: '✗', label: 'Từ chối' }
}

const StatusBadge = ({ status }) => {
  const value = typeof status === 'object' ? status.value : status
  const config = statusMap[value] || statusMap['Đã gửi']
  return (
    <span style={styles.badge(config.type)}>
      {config.icon} {config.label}
    </span>
  )
}

export default function UploadsList() {
  const { user } = useAuth()
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [openCreate, setOpenCreate] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [viewingUpload, setViewingUpload] = useState(null)
  const [openView, setOpenView] = useState(false)

  const { data = [], isLoading } = useQuery({
    queryKey: ['uploads', user?.user_id],
    queryFn: () => listUploads(user?.user_id),
    enabled: !!user
  })

  const filtered = useMemo(() => {
    let result = data
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(u =>
        u.vin?.toLowerCase().includes(q) ||
        u.customer_name?.toLowerCase().includes(q) ||
        u.description?.toLowerCase().includes(q) ||
        u.id?.toString().includes(q)
      )
    }
    if (statusFilter !== 'all') {
      result = result.filter(u => {
        const status = typeof u.status === 'object' ? u.status.value : u.status
        return status === statusFilter
      })
    }
    return result
  }, [data, search, statusFilter])

  const stats = useMemo(() => {
    const sent = data.filter(u => (typeof u.status === 'object' ? u.status.value : u.status) === 'Đã gửi').length
    const approved = data.filter(u => (typeof u.status === 'object' ? u.status.value : u.status) === 'Đã duyệt').length
    const rejected = data.filter(u => (typeof u.status === 'object' ? u.status.value : u.status) === 'Từ chối').length
    return { total: data.length, sent, approved, rejected }
  }, [data])

  const submit = useMutation({
    mutationFn: submitUpload,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['uploads'] })
      alert('✅ Đã gửi phiếu lên admin!')
    },
    onError: (e) => alert('❌ Lỗi: ' + (e?.response?.data?.detail || 'Không thể gửi'))
  })

  const del = useMutation({
    mutationFn: deleteUpload,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['uploads'] })
      alert('🗑️ Đã xóa phiếu!')
    },
    onError: (e) => alert('❌ Lỗi: ' + (e?.response?.data?.detail || 'Không thể xóa'))
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
          <div style={styles.iconBox}>📝</div>
          <div>
            <h1 style={styles.title}>Phiếu bảo hành của tôi</h1>
            <p style={styles.subtitle}>Tạo và quản lý các yêu cầu bảo hành</p>
          </div>
        </div>
        <button
          style={styles.btnCreate}
          onClick={() => { setEditingId(null); setOpenCreate(true) }}
        >
          <span style={{ fontSize: 20 }}>✚</span>
          Tạo phiếu mới
        </button>
      </div>

      {/* Stats Row */}
      <div style={styles.statsRow}>
        <div style={styles.statCard('#14b8a6', '#ccfbf1')}>
          <div style={styles.statIcon('#ccfbf1')}>📊</div>
          <div>
            <div style={styles.statValue('#14b8a6')}>{stats.total}</div>
            <div style={styles.statLabel}>Tổng phiếu</div>
          </div>
        </div>
        <div style={styles.statCard('#2563eb', '#dbeafe')}>
          <div style={styles.statIcon('#dbeafe')}>📤</div>
          <div>
            <div style={styles.statValue('#2563eb')}>{stats.sent}</div>
            <div style={styles.statLabel}>Đã gửi</div>
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
          <option value="Đã gửi">📤 Đã gửi</option>
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
                <th style={styles.th}>Mô tả vấn đề</th>
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
                    <div style={{ fontSize: 48, marginBottom: 12 }}>⏳</div>
                    <div style={{ fontSize: 16, color: '#64748b' }}>Đang tải dữ liệu...</div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="8" style={styles.td}>
                    <div style={styles.emptyState}>
                      <div style={styles.emptyIcon}>📝</div>
                      <div style={{ fontSize: 20, fontWeight: 700, color: '#334155', marginBottom: 8 }}>
                        Chưa có phiếu nào
                      </div>
                      <div style={{ fontSize: 15, color: '#64748b', marginBottom: 24 }}>
                        Nhấn "Tạo phiếu mới" để bắt đầu tạo yêu cầu bảo hành
                      </div>
                      <button
                        style={styles.btnCreate}
                        onClick={() => { setEditingId(null); setOpenCreate(true) }}
                      >
                        <span style={{ fontSize: 18 }}>✚</span>
                        Tạo phiếu đầu tiên
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((upload, idx) => {
                  const statusValue = typeof upload.status === 'object' ? upload.status.value : upload.status
                  const isSent = upload.is_sent_to_claim || false
                  const canEdit = statusValue === 'Đã gửi' && !isSent

                  return (
                    <tr key={upload.id} style={{ background: idx % 2 === 0 ? '#fff' : '#fafbfc' }}>
                      <td style={styles.td}>
                        <span style={styles.idBadge}>#{upload.id}</span>
                        {isSent && statusValue === 'Đã gửi' && (
                          <div style={styles.sentTag}>
                          </div>
                        )}
                      </td>
                      <td style={styles.td}>
                        <span style={styles.vinText}>{upload.vin}</span>
                      </td>
                      <td style={{...styles.td, fontWeight: 500}}>
                        {upload.customer_name || <span style={{color: '#94a3b8'}}>---</span>}
                      </td>
                      <td style={{...styles.td, maxWidth: 260}}>
                        <div style={{ 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis', 
                          whiteSpace: 'nowrap',
                          color: '#475569'
                        }}>
                          {upload.description || '---'}
                        </div>
                      </td>
                      <td style={{...styles.td, fontWeight: 700, color: '#059669'}}>
                        {formatCurrency(upload.warranty_cost)}
                      </td>
                      <td style={styles.td}>
                        <StatusBadge status={upload.status} />
                      </td>
                      <td style={{...styles.td, fontSize: 13, color: '#64748b'}}>
                        {formatDate(upload.created_at)}
                      </td>
                      <td style={{...styles.td, textAlign: 'center'}}>
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
                          <button
                            style={styles.btnView}
                            title="Xem chi tiết"
                            onClick={() => { setViewingUpload(upload); setOpenView(true) }}
                          >
                            👁
                          </button>
                          {canEdit && (
                            <>
                              <button
                                style={styles.btnSend}
                                onClick={() => {
                                  if (confirm(`Gửi phiếu #${upload.id} lên admin?`)) submit.mutate(upload.id)
                                }}
                                disabled={submit.isPending}
                              >
                                📤 Gửi
                              </button>
                              <button
                                style={styles.btnEdit}
                                title="Sửa"
                                onClick={() => { setEditingId(upload.id); setOpenCreate(true) }}
                              >
                                ✎
                              </button>
                              <button
                                style={styles.btnDelete}
                                title="Xóa"
                                onClick={() => {
                                  if (confirm(`Xóa phiếu #${upload.id}?\nHành động này không thể hoàn tác.`)) del.mutate(upload.id)
                                }}
                                disabled={del.isPending}
                              >
                                🗑
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

      {/* Modal Tạo/Sửa */}
      <Modal
        open={openCreate}
        title={editingId ? '✏️ Chỉnh sửa phiếu' : '✚ Tạo phiếu mới'}
        onClose={() => setOpenCreate(false)}
      >
        <UploadForm
          uploadId={editingId}
          onDone={() => {
            setOpenCreate(false)
            qc.invalidateQueries({ queryKey: ['uploads'] })
          }}
        />
      </Modal>

      {/* Modal Xem chi tiết */}
      <Modal
        open={openView}
        title={`📋 Chi tiết phiếu #${viewingUpload?.id}`}
        onClose={() => setOpenView(false)}
      >
        {viewingUpload && (
          <div style={styles.modalGrid}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
              <div style={styles.modalSection}>
                <div style={styles.modalLabel}>Mã VIN</div>
                <div style={{...styles.modalValue, fontFamily: 'monospace'}}>{viewingUpload.vin}</div>
              </div>
              <div style={styles.modalSection}>
                <div style={styles.modalLabel}>Khách hàng</div>
                <div style={styles.modalValue}>{viewingUpload.customer_name || '---'}</div>
              </div>
            </div>

            <div style={styles.modalSection}>
              <div style={styles.modalLabel}>Chi phí bảo hành</div>
              <div style={{...styles.modalValue, fontSize: 24, color: '#059669'}}>
                {formatCurrency(viewingUpload.warranty_cost)}
              </div>
            </div>

            <div style={styles.modalSection}>
              <div style={styles.modalLabel}>Mô tả vấn đề</div>
              <div style={{ color: '#334155', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                {viewingUpload.description || '---'}
              </div>
            </div>

            <div style={styles.modalSection}>
              <div style={styles.modalLabel}>Chẩn đoán kỹ thuật</div>
              <div style={{ color: '#334155', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                {viewingUpload.diagnosis || '---'}
              </div>
            </div>

            <div style={styles.modalSection}>
              <div style={styles.modalLabel}>Tệp đính kèm</div>
              {viewingUpload.file_url ? (
                <a
                  href={viewingUpload.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ 
                    color: '#2563eb', 
                    textDecoration: 'none',
                    fontWeight: 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '10px 16px',
                    background: '#dbeafe',
                    borderRadius: 10
                  }}
                >
                  📎 Xem tệp đính kèm
                </a>
              ) : <span style={{ color: '#94a3b8' }}>Không có tệp</span>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
              <div style={{...styles.modalSection, display: 'flex', alignItems: 'center', gap: 12}}>
                <span style={styles.modalLabel}>Trạng thái:</span>
                <StatusBadge status={viewingUpload.status} />
              </div>
              <div style={styles.modalSection}>
                <div style={styles.modalLabel}>Ngày tạo</div>
                <div style={{ fontSize: 14, color: '#334155', fontWeight: 500 }}>
                  {formatDate(viewingUpload.created_at)}
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}