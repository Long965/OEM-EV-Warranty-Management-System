import { useQuery } from '@tanstack/react-query'
import { useState, useMemo } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../api/client'

export default function ClaimHistory() {
  const { user } = useAuth()
  const [search, setSearch] = useState('')
  const isAdmin = user?.role === 'Admin'

  const { data = [], isLoading } = useQuery({
    queryKey: ['admin-history'],
    queryFn: async () => {
      const { data } = await api.get('/claims/history/admin')
      return data
    },
    enabled: !!user && isAdmin
  })

  const filtered = useMemo(() => {
    if (!search.trim()) return data
    const q = search.toLowerCase()
    return data.filter(h =>
      h.vehicle_vin?.toLowerCase().includes(q) ||
      h.issue_desc?.toLowerCase().includes(q) ||
      h.action?.toLowerCase().includes(q) ||
      h.performed_by?.toLowerCase().includes(q) ||
      h.id?.toString().includes(q)
    )
  }, [data, search])

  const formatDate = (dateString) => {
    if (!dateString) return '---'
    return new Date(dateString).toLocaleString('vi-VN')
  }

  const getActionBadge = (action) => {
    const actionMap = {
      'Tạo mới phiếu': { class: 'sc_staff', icon: '➕' },
      'Chỉnh sửa phiếu': { class: 'evm_staff', icon: '✎' },
      'Duyệt phiếu': { class: 'admin', icon: '✓' },
      'Từ chối phiếu': { class: 'rejected', icon: '✗' }
    }
    const config = actionMap[action] || { class: 'sc_staff', icon: '•' }
    return (
      <span className={`role-pill role-${config.class}`}>
        {config.icon} {action}
      </span>
    )
  }

  const getRoleBadge = (role) => {
    const roleMap = {
      'Admin': { class: 'admin', label: 'Admin' },
      'SC_Staff': { class: 'sc_staff', label: 'SC Staff' },
      'SC_Technician': { class: 'sc_technician', label: 'SC Tech' },
      'EVM_Staff': { class: 'evm_staff', label: 'EVM Staff' }
    }
    const config = roleMap[role] || { class: 'sc_staff', label: role }
    return (
      <span className={`role-pill role-${config.class}`} style={{ fontSize: 11, padding: '4px 8px' }}>
        {config.label}
      </span>
    )
  }

  return (
    <div className="container">
      <div className="page-title">
        <div className="ico">📜</div>
        <h2>Lịch sử phiếu bảo hành (Admin)</h2>
      </div>

 
      <div style={{
        background: 'linear-gradient(135deg, var(--warning-light) 0%, var(--danger-light) 100%)',
        padding: '16px 20px',
        borderRadius: 12,
        marginBottom: 24,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        border: '2px solid var(--warning)'
      }}>
        <span style={{ fontSize: 24 }}>⚡</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--warning)', marginBottom: 4 }}>
            Lịch sử Toàn Hệ Thống
          </div>
          <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
            Hiển thị tất cả các hoạt động của Admin và User trên hệ thống warranty claim
          </div>
        </div>
      </div>

      <div className="toolbar">
        <div className="searchbox">
          <span className="loupe">🔎</span>
          <input
            placeholder="Tìm theo VIN, hành động, người thực hiện..."
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
                <th>VIN</th>
                <th>Mô tả</th>
                <th>Hành động</th>
                <th>Người thực hiện</th>
                <th>Thời gian</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="card--pad">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                      <span style={{ fontSize: 20 }}>⏳</span>
                      Đang tải dữ liệu...
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="card--pad text-muted">
                    <div style={{ padding: '40px 0' }}>
                      <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
                      <div style={{ fontSize: 18, fontWeight: 600 }}>Chưa có lịch sử nào</div>
                      <div style={{ fontSize: 14, marginTop: 4 }}>Các hoạt động sẽ được ghi lại tại đây</div>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map(history => (
                  <tr key={history.id}>
                    <td><strong style={{ color: 'var(--primary)' }}>#{history.id}</strong></td>
                    <td>
                      {history.claim_id ? (
                        <span style={{ color: 'var(--info)', fontWeight: 600 }}>
                          #{history.claim_id}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>---</span>
                      )}
                    </td>
                    <td><strong>{history.vehicle_vin || '---'}</strong></td>
                    <td style={{ maxWidth: 300 }}>
                      <div style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {history.issue_desc || '---'}
                      </div>
                    </td>
                    <td>{getActionBadge(history.action)}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontWeight: 600 }}>{history.performed_by || '---'}</span>
                        {/* ✅ FIXED: Hiển thị role từ database thay vì hardcode "Admin" */}
                        {getRoleBadge(history.performed_role)}
                      </div>
                    </td>
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