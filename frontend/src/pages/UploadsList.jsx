import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, useMemo } from 'react'
import { useAuth } from '../context/AuthContext'
import { listUploads, deleteUpload, submitUpload } from '../api/uploads'
import Modal from '../components/Modal'
import UploadForm from '../components/UploadForm'

const statusClassMap = {
  'Đã gửi': 'sc_staff',
  'Đã duyệt': 'admin',
  'Từ chối': 'evm_staff'
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

  const submit = useMutation({
    mutationFn: submitUpload,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['uploads'] })
      alert('✅ Đã gửi phiếu lên admin!')
    },
    onError: (e) => {
      alert('❌ Lỗi: ' + (e?.response?.data?.detail || 'Không thể gửi phiếu'))
    }
  })

  const del = useMutation({
    mutationFn: deleteUpload,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['uploads'] })
      alert('🗑️ Đã xóa phiếu!')
    },
    onError: (e) => {
      alert('❌ Lỗi: ' + (e?.response?.data?.detail || 'Không thể xóa phiếu'))
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
        <h2>Phiếu bảo hành của tôi</h2>
      </div>



      <div className="toolbar">
        <div className="searchbox">
          <span className="loupe">🔎</span>
          <input
            placeholder="Tìm theo VIN, tên khách hàng..."
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
          <option value="Đã gửi">Đã gửi</option>
          <option value="Đã duyệt">Đã duyệt</option>
          <option value="Từ chối">Từ chối</option>
        </select>
        <div style={{ color: 'var(--text-muted)', fontSize: 15, fontWeight: 600 }}>
          Tổng: <strong style={{ color: 'var(--primary)' }}>{filtered.length}</strong> phiếu
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            setEditingId(null)
            setOpenCreate(true)
          }}
        >
          ➕ Tạo phiếu mới
        </button>
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
                <th style={{ width: 100 }}>Thao tác</th>
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
                      <div style={{ fontSize: 18, fontWeight: 600 }}>Chưa có phiếu nào</div>
                      <div style={{ fontSize: 14, marginTop: 4 }}>Nhấn "Tạo phiếu mới" để bắt đầu</div>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map(upload => {
                  const statusValue = typeof upload.status === 'object' ? upload.status.value : upload.status
                  const isSent = upload.is_sent_to_claim || false
                  const canEdit = statusValue === 'Đã gửi' && !isSent

                  return (
                    <tr key={upload.id}>
                      <td>
                        <strong style={{ color: 'var(--primary)' }}>#{upload.id}</strong>
                        {isSent && statusValue === 'Đã gửi' && (
                          <div style={{ fontSize: 11, color: 'var(--success)', marginTop: 2, fontWeight: 600 }}>
                            ✓ Đã gửi admin
                          </div>
                        )}
                      </td>
                      <td><strong>{upload.vin}</strong></td>
                      <td>{upload.customer_name || '---'}</td>
                      <td style={{ maxWidth: 300 }}>
                        <div style={{ 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis', 
                          whiteSpace: 'nowrap' 
                        }}>
                          {upload.description || '---'}
                        </div>
                      </td>
                      <td><strong>{formatCurrency(upload.warranty_cost)}</strong></td>
                      <td>
                        <span className={`role-pill role-${statusClassMap[statusValue] || 'sc_staff'}`}>
                          {statusValue}
                        </span>
                      </td>
                      <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                        {formatDate(upload.created_at)}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                          {/* Nút Xem chi tiết */}
                          <button
                            className="icon-btn"
                            title="Xem chi tiết"
                            onClick={() => {
                              setViewingUpload(upload)
                              setOpenView(true)
                            }}
                            style={{ background: 'var(--info-light)', color: 'var(--info)' }}
                          >
                            👁
                          </button>

                          {canEdit && (
                            <>
                              {/* Nút Gửi - chỉ hiện khi chưa gửi admin */}
                              <button
                                className="btn btn-primary"
                                style={{ fontSize: 12, padding: '6px 12px' }}
                                onClick={() => {
                                  if (confirm(`Gửi phiếu #${upload.id} lên admin?`))
                                    submit.mutate(upload.id)
                                }}
                                disabled={submit.isPending}
                              >
                                📤 Gửi
                              </button>
                              {/* Nút Sửa */}
                              <button
                                className="icon-btn edit"
                                title="Sửa"
                                onClick={() => {
                                  setEditingId(upload.id)
                                  setOpenCreate(true)
                                }}
                              >
                                ✎
                              </button>
                            </>
                          )}

                          {/* Nút Xóa - chỉ khi chưa gửi */}
                          {canEdit && (
                            <button
                              className="icon-btn del"
                              title="Xóa phiếu"
                              onClick={() => {
                                if (confirm(`Xóa phiếu #${upload.id}?\nHành động này không thể hoàn tác.`))
                                  del.mutate(upload.id)
                              }}
                              disabled={del.isPending}
                            >
                              🗑
                            </button>
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

      {/* Modal Sửa/Tạo phiếu */}
      <Modal
        open={openCreate}
        title={editingId ? 'Chỉnh sửa phiếu' : 'Tạo phiếu mới'}
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
        title={`Chi tiết phiếu #${viewingUpload?.id}`}
        onClose={() => setOpenView(false)}
      >
        {viewingUpload && (
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
                  {viewingUpload.vin}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>
                  Khách hàng
                </div>
                <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>
                  {viewingUpload.customer_name || '---'}
                </div>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>
                  Chi phí bảo hành
                </div>
                <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--success)' }}>
                  {formatCurrency(viewingUpload.warranty_cost)}
                </div>
              </div>
            </div>

            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>
                Mô tả vấn đề
              </div>
              <div style={{ 
                padding: 16, 
                background: 'var(--bg-secondary)', 
                borderRadius: 12,
                whiteSpace: 'pre-wrap',
                lineHeight: 1.6
              }}>
                {viewingUpload.description || '---'}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>
                Chẩn đoán kỹ thuật
              </div>
              <div style={{ 
                padding: 16, 
                background: 'var(--bg-secondary)', 
                borderRadius: 12,
                whiteSpace: 'pre-wrap',
                lineHeight: 1.6
              }}>
                {viewingUpload.diagnosis || '---'}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>
                Tệp đính kèm
              </div>
              <div style={{ padding: 16, background: 'var(--bg-secondary)', borderRadius: 12 }}>
                {viewingUpload.file_url ? (
                  <a
                    href={viewingUpload.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ 
                      color: 'var(--primary)', 
                      textDecoration: 'none',
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8
                    }}
                  >
                    📎 Xem tệp đính kèm
                  </a>
                ) : '---'}
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
              <span className={`role-pill role-${statusClassMap[typeof viewingUpload.status === 'object' ? viewingUpload.status.value : viewingUpload.status] || 'sc_staff'}`}>
                {typeof viewingUpload.status === 'object' ? viewingUpload.status.value : viewingUpload.status}
              </span>
            </div>

            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>
                Ngày tạo
              </div>
              <div style={{ fontSize: 15, color: 'var(--text-primary)' }}>
                {formatDate(viewingUpload.created_at)}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}