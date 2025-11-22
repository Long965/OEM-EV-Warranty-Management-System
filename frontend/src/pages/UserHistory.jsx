import { useQuery } from '@tanstack/react-query'
import { useState, useMemo } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../api/client'

const styles = {
  container: {
    maxWidth: 1400,
    margin: '0 auto',
    padding: '32px 24px',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #ecfdf5 0%, #f0fdfa 50%, #ecfeff 100%)'
  },
  header: {
    marginBottom: 24,
    display: 'flex',
    alignItems: 'center',
    gap: 16
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    background: 'linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 28,
    boxShadow: '0 8px 24px rgba(20, 184, 166, 0.3)'
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
  infoBanner: {
    background: 'linear-gradient(135deg, #d1fae5 0%, #cffafe 100%)',
    padding: '20px 24px',
    borderRadius: 16,
    marginBottom: 24,
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    border: '2px solid #5eead4',
    boxShadow: '0 4px 12px rgba(94, 234, 212, 0.2)'
  },
  bannerIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    background: '#ccfbf1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 24
  },
  bannerTitle: {
    fontWeight: 700,
    fontSize: 16,
    color: '#0d9488',
    marginBottom: 4
  },
  bannerDesc: {
    fontSize: 14,
    color: '#5b7a75'
  },
  statsRow: {
    display: 'flex',
    gap: 16,
    marginBottom: 24,
    flexWrap: 'wrap'
  },
  statCard: (color, bgColor) => ({
    flex: '1 1 160px',
    padding: '18px 22px',
    borderRadius: 16,
    background: '#fff',
    border: `1px solid ${bgColor}`,
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
  }),
  statIcon: (bgColor) => ({
    width: 44,
    height: 44,
    borderRadius: 12,
    background: bgColor,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 20
  }),
  statValue: (color) => ({
    fontSize: 26,
    fontWeight: 800,
    color: color
  }),
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: 500
  },
  toolbar: {
    display: 'flex',
    gap: 16,
    marginBottom: 24,
    flexWrap: 'wrap',
    alignItems: 'center'
  },
  searchBox: {
    flex: '1 1 350px',
    position: 'relative'
  },
  searchInput: {
    width: '100%',
    padding: '14px 20px 14px 52px',
    borderRadius: 14,
    border: '2px solid #e2e8f0',
    fontSize: 15,
    background: '#fff',
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
    background: '#f0fdfa',
    borderBottom: '1px solid #99f6e4'
  },
  td: {
    padding: '16px 20px',
    borderBottom: '1px solid #f1f5f9',
    fontSize: 14,
    color: '#334155'
  },
  idBadge: {
    display: 'inline-flex',
    padding: '4px 12px',
    borderRadius: 8,
    background: '#ccfbf1',
    color: '#0d9488',
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
  actionBadge: (type) => {
    const colors = {
      create: { bg: '#d1fae5', color: '#059669', border: '#6ee7b7' },
      edit: { bg: '#fef3c7', color: '#d97706', border: '#fcd34d' },
      send: { bg: '#dbeafe', color: '#2563eb', border: '#93c5fd' },
      delete: { bg: '#fee2e2', color: '#dc2626', border: '#fca5a5' }
    }
    const c = colors[type] || colors.create
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
  emptyState: {
    padding: '80px 20px',
    textAlign: 'center'
  },
  timelineIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 16,
    marginRight: 12
  }
}

// Map tên hành động từ database sang tên hiển thị ngắn gọn
const getActionDisplay = (action) => {
  const actionMap = {
    'Tạo mới phiếu upload': { type: 'create', icon: '➕', bg: '#d1fae5', label: 'Tạo mới phiếu' },
    'Chỉnh sửa phiếu upload': { type: 'edit', icon: '✎', bg: '#fef3c7', label: 'Chỉnh sửa phiếu' },
    'Gửi phiếu lên Claim Service': { type: 'send', icon: '📤', bg: '#dbeafe', label: 'Gửi phiếu' },
    'Xóa phiếu upload': { type: 'delete', icon: '🗑', bg: '#fee2e2', label: 'Xóa phiếu' }
  }
  return actionMap[action] || { type: 'create', icon: '•', bg: '#f1f5f9', label: action }
}

const ActionBadge = ({ action }) => {
  const config = getActionDisplay(action)
  return (
    <span style={styles.actionBadge(config.type)}>
      {config.icon} {config.label}
    </span>
  )
}

export default function UserHistory() {
  const { user } = useAuth()
  const [search, setSearch] = useState('')

  const { data = [], isLoading } = useQuery({
    queryKey: ['user-history', user?.user_id],
    queryFn: async () => {
      const { data } = await api.get('/uploads/history/user')
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

  const stats = useMemo(() => {
    const create = data.filter(h => h.action === 'Tạo mới phiếu upload').length
    const edit = data.filter(h => h.action === 'Chỉnh sửa phiếu upload').length
    const send = data.filter(h => h.action === 'Gửi phiếu lên Claim Service').length
    const del = data.filter(h => h.action === 'Xóa phiếu upload').length
    return { total: data.length, create, edit, send, del }
  }, [data])

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
        <div style={styles.iconBox}>📊</div>
        <div>
          <h1 style={styles.title}>Lịch sử hoạt động của tôi</h1>
          <p style={styles.subtitle}>Xem lại các thao tác bạn đã thực hiện</p>
        </div>
      </div>

      {/* Info Banner */}
      <div style={styles.infoBanner}>
        <div style={styles.bannerIcon}>📋</div>
        <div style={{ flex: 1 }}>
          <div style={styles.bannerTitle}>Lịch sử cá nhân</div>
          <div style={styles.bannerDesc}>
            Hiển thị tất cả các hoạt động mà bạn đã thực hiện trên hệ thống
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div style={styles.statsRow}>
        <div style={styles.statCard('#14b8a6', '#ccfbf1')}>
          <div style={styles.statIcon('#ccfbf1')}>📊</div>
          <div>
            <div style={styles.statValue('#14b8a6')}>{stats.total}</div>
            <div style={styles.statLabel}>Tổng hoạt động</div>
          </div>
        </div>
        <div style={styles.statCard('#10b981', '#d1fae5')}>
          <div style={styles.statIcon('#d1fae5')}>➕</div>
          <div>
            <div style={styles.statValue('#10b981')}>{stats.create}</div>
            <div style={styles.statLabel}>Tạo mới</div>
          </div>
        </div>
        <div style={styles.statCard('#2563eb', '#dbeafe')}>
          <div style={styles.statIcon('#dbeafe')}>📤</div>
          <div>
            <div style={styles.statValue('#2563eb')}>{stats.send}</div>
            <div style={styles.statLabel}>Đã gửi</div>
          </div>
        </div>
        <div style={styles.statCard('#dc2626', '#fee2e2')}>
          <div style={styles.statIcon('#fee2e2')}>🗑</div>
          <div>
            <div style={styles.statValue('#dc2626')}>{stats.del}</div>
            <div style={styles.statLabel}>Đã xóa</div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div style={styles.toolbar}>
        <div style={styles.searchBox}>
          <span style={styles.searchIcon}>🔍</span>
          <input
            style={styles.searchInput}
            placeholder="Tìm theo VIN, hành động..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div style={{ color: '#64748b', fontSize: 15, fontWeight: 600 }}>
          Hiển thị: <strong style={{ color: '#14b8a6' }}>{filtered.length}</strong> hoạt động
        </div>
      </div>

      {/* Table - ĐÃ XÓA CỘT PHIẾU UPLOAD */}
      <div style={styles.tableCard}>
        <div style={{ overflowX: 'auto' }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>ID</th>
                <th style={styles.th}>VIN xe</th>
                <th style={styles.th}>Hành động</th>
                <th style={styles.th}>Thời gian</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="4" style={{...styles.td, textAlign: 'center', padding: '60px 20px'}}>
                    <div style={{ fontSize: 48, marginBottom: 12 }}>⏳</div>
                    <div style={{ fontSize: 16, color: '#64748b' }}>Đang tải dữ liệu...</div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="4" style={styles.td}>
                    <div style={styles.emptyState}>
                      <div style={{ fontSize: 72, marginBottom: 16, opacity: 0.5 }}>📭</div>
                      <div style={{ fontSize: 20, fontWeight: 700, color: '#334155', marginBottom: 8 }}>
                        Chưa có lịch sử nào
                      </div>
                      <div style={{ fontSize: 15, color: '#64748b' }}>
                        Các hoạt động của bạn sẽ được ghi lại tại đây
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((h, idx) => {
                  const config = getActionDisplay(h.action)
                  return (
                    <tr key={h.id} style={{ background: idx % 2 === 0 ? '#fff' : '#f0fdfa' }}>
                      <td style={styles.td}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <div style={{...styles.timelineIcon, background: config.bg}}>
                            {config.icon}
                          </div>
                          <span style={styles.idBadge}>#{h.id}</span>
                        </div>
                      </td>
                      <td style={styles.td}>
                        {h.vin ? (
                          <span style={styles.vinText}>{h.vin}</span>
                        ) : <span style={{ color: '#94a3b8' }}>---</span>}
                      </td>
                      <td style={styles.td}>
                        <ActionBadge action={h.action} />
                      </td>
                      <td style={{...styles.td, fontSize: 13, color: '#64748b'}}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 16 }}>🕐</span>
                          {formatDate(h.timestamp)}
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
    </div>
  )
}