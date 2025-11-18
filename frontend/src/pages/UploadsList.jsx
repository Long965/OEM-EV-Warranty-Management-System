import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, useMemo } from 'react'
import { useAuth } from '../context/AuthContext'
import { listUploads, deleteUpload, submitUpload } from '../api/uploads'
import Modal from '../components/Modal'
import UploadForm from '../components/UploadForm'

const USER_ID = '11111111-1111-1111-1111-111111111111'

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
    queryKey: ['uploads', USER_ID],
    queryFn: () => listUploads(USER_ID)
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
    }
  })

  const del = useMutation({
    mutationFn: deleteUpload,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['uploads'] })
      alert('🗑️ Đã xóa phiếu!')
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
                <th style={{ width: 240 }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="8" className="card--pad">Đang tải...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="8" className="card--pad text-muted">
                    Chưa có phiếu nào. Nhấn "Tạo phiếu mới" để bắt đầu.
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
                        <strong>#{upload.id}</strong>
                        {isSent && statusValue === 'Đã gửi' && (
                          <div style={{ fontSize: 11, color: '#2563eb', marginTop: 2 }}>
                            ✓ Đã gửi admin
                          </div>
                        )}
                      </td>
                      <td>{upload.vin}</td>
                      <td>{upload.customer_name || '---'}</td>
                      <td style={{ maxWidth: 250 }}>
                        {upload.description?.substring(0, 60) || '---'}
                        {upload.description?.length > 60 && '...'}
                      </td>
                      <td>{formatCurrency(upload.warranty_cost)}</td>
                      <td>
                        <span className={`role-pill role-${statusClassMap[statusValue] || 'sc_staff'}`}>
                          {statusValue}
                        </span>
                      </td>
                      <td style={{ fontSize: 13 }}>{formatDate(upload.created_at)}</td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                          {/* Nút Xem chi tiết - luôn hiện */}
                          <button
                            className="icon-btn"
                            title="Xem chi tiết"
                            onClick={() => {
                              setViewingUpload(upload)
                              setOpenView(true)
                            }}
                            style={{ background: '#3b82f6', color: 'white' }}
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
                              >
                                📤 Gửi
                              </button>

                              {/* Nút Sửa - chỉ hiện khi chưa gửi admin */}
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

                          {/* Nút Xóa - luôn hiện */}
                          <button
                            className="icon-btn del"
                            title="Xóa phiếu"
                            onClick={() => {
                              if (confirm(`Xóa phiếu #${upload.id}?\nHành động này không thể hoàn tác.`))
                                del.mutate(upload.id)
                            }}
                          >
                            🗑
                          </button>
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
          <div style={{ display: 'grid', gap: 16 }}>
            <div>
              <strong style={{ color: '#64748b', fontSize: 13 }}>Mã VIN:</strong>
              <div style={{ marginTop: 4 }}>{viewingUpload.vin}</div>
            </div>
            <div>
              <strong style={{ color: '#64748b', fontSize: 13 }}>Khách hàng:</strong>
              <div style={{ marginTop: 4 }}>{viewingUpload.customer_name || '---'}</div>
            </div>
            <div>
              <strong style={{ color: '#64748b', fontSize: 13 }}>Mô tả vấn đề:</strong>
              <div style={{ marginTop: 4, whiteSpace: 'pre-wrap' }}>{viewingUpload.description || '---'}</div>
            </div>
            <div>
              <strong style={{ color: '#64748b', fontSize: 13 }}>Chẩn đoán kỹ thuật:</strong>
              <div style={{ marginTop: 4, whiteSpace: 'pre-wrap' }}>{viewingUpload.diagnosis || '---'}</div>
            </div>
            <div>
              <strong style={{ color: '#64748b', fontSize: 13 }}>Chi phí bảo hành:</strong>
              <div style={{ marginTop: 4, fontSize: 18, fontWeight: 600, color: '#2563eb' }}>
                {formatCurrency(viewingUpload.warranty_cost)}
              </div>
            </div>
            <div>
              <strong style={{ color: '#64748b', fontSize: 13 }}>Tệp đính kèm:</strong>
              <div style={{ marginTop: 4 }}>
                {viewingUpload.file_url ? (
                  <a 
                    href={viewingUpload.file_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ color: '#2563eb', textDecoration: 'underline' }}
                  >
                    📎 Xem tệp
                  </a>
                ) : '---'}
              </div>
            </div>
            <div>
              <strong style={{ color: '#64748b', fontSize: 13 }}>Trạng thái:</strong>
              <div style={{ marginTop: 4 }}>
                <span className={`role-pill role-${statusClassMap[typeof viewingUpload.status === 'object' ? viewingUpload.status.value : viewingUpload.status] || 'sc_staff'}`}>
                  {typeof viewingUpload.status === 'object' ? viewingUpload.status.value : viewingUpload.status}
                </span>
              </div>
            </div>
            <div>
              <strong style={{ color: '#64748b', fontSize: 13 }}>Ngày tạo:</strong>
              <div style={{ marginTop: 4 }}>{formatDate(viewingUpload.created_at)}</div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}