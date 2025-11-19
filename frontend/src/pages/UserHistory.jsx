import { useQuery } from '@tanstack/react-query'
import { useState, useMemo } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../api/client'

export default function UserHistory() {
  const { user } = useAuth()
  const [search, setSearch] = useState('')

  // ✅ FIXED: Gọi API từ upload service thay vì claim service
  const { data = [], isLoading } = useQuery({
    queryKey: ['user-history', user?.user_id],
    queryFn: async () => {
      const { data } = await api.get('/uploads/history/user')  // ✅ ĐÚNG endpoint
      return data
    },
    enabled: !!user
  })

  const filtered = useMemo(() => {
    if (!search.trim()) return data
    const q = search.toLowerCase()
    return data.filter(h =>
      h.vin?.toLowerCase().includes(q) ||
      h.action?.toLowerCase().includes(q) ||
      h.id?.toString().includes(q)
    )
  }, [data, search])

  const formatDate = (dateString) => {
    if (!dateString) return '---'
    return new Date(dateString).toLocaleString('vi-VN')
  }

  const getActionBadge = (action) => {
    const actionMap = {
      'Tạo mới phiếu upload': { class: 'sc_staff', icon: '➕' },
      'Chỉnh sửa phiếu upload': { class: 'evm_staff', icon: '✎' },
      'Gửi phiếu lên Claim Service': { class: 'admin', icon: '📤' },
      'Xóa phiếu upload': { class: 'rejected', icon: '🗑' }
    }
    const config = actionMap[action] || { class: 'sc_staff', icon: '•' }
    return (
      <span className={`role-pill role-${config.class}`}>
        {config.icon} {action}
      </span>
    )
  }

  return (
    <div className="container">
      <div className="page-title">
        <div className="ico">📜</div>
        <h2>Lịch sử hoạt động của tôi</h2>
      </div>

      {/* Info Banner */}
      <div style={{
        background: 'linear-gradient(135deg, var(--success-light) 0%, var(--info-light) 100%)',
        padding: '16px 20px',
        borderRadius: 12,
        marginBottom: 24,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        border: '2px solid var(--success)'
      }}>
        <span style={{ fontSize: 24 }}>📊</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--success)', marginBottom: 4 }}>
            Lịch sử cá nhân
          </div>
          <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
            Hiển thị tất cả các hoạt động mà bạn đã thực hiện trên hệ thống
          </div>
        </div>
      </div>

      <div className="toolbar">
        <div className="searchbox">
          <span className="loupe">🔎</span>
          <input
            placeholder="Tìm theo VIN, hành động..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: 15, fontWeight: 600 }}>
          Tổng: <strong style={{ color: 'var(--primary)' }}>{filtered.length}</strong> bản ghi
        </div>
      </div>

      <div className="card">
        <div style={{ overflow: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Phiếu Upload #</th>
                <th>VIN</th>
                <th>Hành động</th>
                <th>Thời gian</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="card--pad">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                      <span style={{ fontSize: 20 }}>⏳</span>
                      Đang tải dữ liệu...
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="5" className="card--pad text-muted">
                    <div style={{ padding: '40px 0' }}>
                      <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
                      <div style={{ fontSize: 18, fontWeight: 600 }}>Chưa có lịch sử nào</div>
                      <div style={{ fontSize: 14, marginTop: 4 }}>Các hoạt động của bạn sẽ được ghi lại tại đây</div>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map(history => (
                  <tr key={history.id}>
                    <td><strong style={{ color: 'var(--primary)' }}>#{history.id}</strong></td>
                    <td>
                      {history.upload_id ? (
                        <span style={{ color: 'var(--info)', fontWeight: 600 }}>
                          #{history.upload_id}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>---</span>
                      )}
                    </td>
                    <td><strong>{history.vin || '---'}</strong></td>
                    <td>{getActionBadge(history.action)}</td>
                    <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                      {formatDate(history.timestamp)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}