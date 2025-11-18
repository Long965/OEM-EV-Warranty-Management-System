import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, useMemo } from 'react'
import { useAuth } from '../context/AuthContext'
import { getClaimHistory, deleteClaimHistory } from '../api/claims'

export default function ClaimHistory() {
  const { user } = useAuth()
  const qc = useQueryClient()
  const [search, setSearch] = useState('')

  const isAdmin = user?.role === 'Admin'

  const { data = [], isLoading } = useQuery({
    queryKey: ['claim-history', user?.user_id, user?.role],
    queryFn: () => getClaimHistory(isAdmin ? 'admin' : 'user', user?.user_id),
    enabled: !!user
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

  const deleteHistory = useMutation({
    mutationFn: deleteClaimHistory,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['claim-history'] })
      alert('✅ Đã xóa lịch sử!')
    },
    onError: (e) => {
      alert('❌ Lỗi khi xóa: ' + (e?.response?.data?.detail || 'Unknown error'))
    }
  })

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

  return (
    <div className="container">
      <div className="page-title">
        <div className="ico">📜</div>
        <h2>Lịch sử phiếu bảo hành</h2>
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
        <div style={{ color: '#64748b', fontSize: 14 }}>
          Tổng: <strong>{filtered.length}</strong> bản ghi
        </div>
      </div>

      <div className="card">
        <div style={{ overflow: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Phiếu #</th>
                <th>VIN</th>
                <th>Mô tả</th>
                <th>Hành động</th>
                <th>Người thực hiện</th>
                <th>Vai trò</th>
                <th>Thời gian</th>
                {isAdmin && <th style={{ width: 100 }}>Thao tác</th>}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={isAdmin ? 9 : 8} className="card--pad">Đang tải...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 9 : 8} className="card--pad text-muted">
                    Chưa có lịch sử nào
                  </td>
                </tr>
              ) : (
                filtered.map(history => (
                  <tr key={history.id}>
                    <td><strong>#{history.id}</strong></td>
                    <td>
                      {history.claim_id ? (
                        <span style={{ color: '#2563eb', fontWeight: 500 }}>
                          #{history.claim_id}
                        </span>
                      ) : (
                        <span style={{ color: '#94a3b8' }}>---</span>
                      )}
                    </td>
                    <td>{history.vehicle_vin || '---'}</td>
                    <td style={{ maxWidth: 250 }}>
                      {history.issue_desc?.substring(0, 60) || '---'}
                      {history.issue_desc?.length > 60 && '...'}
                    </td>
                    <td>{getActionBadge(history.action)}</td>
                    <td>{history.performed_by || '---'}</td>
                    <td>
                      <span className={`role-pill role-${history.performed_role === 'admin' ? 'admin' : 'sc_staff'}`}>
                        {history.performed_role}
                      </span>
                    </td>
                    <td style={{ fontSize: 13 }}>{formatDate(history.timestamp)}</td>
                    {isAdmin && (
                      <td style={{ textAlign: 'center' }}>
                        <button
                          className="icon-btn del"
                          title="Xóa lịch sử"
                          onClick={() => {
                            if (confirm(`Xóa lịch sử #${history.id}?\nHành động này không thể hoàn tác.`))
                              deleteHistory.mutate(history.id)
                          }}
                          disabled={deleteHistory.isPending}
                        >
                          🗑
                        </button>
                      </td>
                    )}
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