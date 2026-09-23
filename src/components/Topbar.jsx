import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { MdNotifications, MdSearch, MdCalendarMonth, MdDoneAll, MdDelete } from 'react-icons/md'
import { useAuth } from '../context/AuthContext'
import { usePOS } from '../context/POSContext'
import { useNotifications } from '../context/NotificationContext'
import './Topbar.css'

export default function Topbar() {
  const { userProfile }                              = useAuth()
  const { pendingCount }                             = usePOS()
  const { notifications, unreadCount, markAllRead, clearAll, markRead } = useNotifications()
  const navigate                                     = useNavigate()
  const [search, setSearch]                         = useState('')
  const [showNotifs, setShowNotifs]                 = useState(false)

  const handleSearch = (e) => {
    if (e.key === 'Enter' && search.trim()) {
      navigate(`/pos?q=${encodeURIComponent(search.trim())}`)
      setSearch('')
    }
  }

  return (
    <header className="topbar">
      {/* Search */}
      <div className="topbar-search">
        <MdSearch className="topbar-search-icon" />
        <input
          type="text"
          placeholder="Search orders, items, tables..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={handleSearch}
          className="topbar-search-input"
        />
      </div>

      <div className="topbar-right">
        {/* Date */}
        <div className="topbar-date">
          <MdCalendarMonth />
          <span>{format(new Date(), 'MMM dd, yyyy')}</span>
        </div>

        {/* Notification Bell */}
        <div style={{ position: 'relative' }}>
          <button
            className="topbar-notif"
            onClick={() => { setShowNotifs(v => !v); if (unreadCount > 0) markAllRead() }}
          >
            <MdNotifications />
            {unreadCount > 0 && (
              <span className="topbar-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
            )}
          </button>

          {/* Notification Dropdown */}
          {showNotifs && (
            <div className="notif-dropdown fade-in">
              <div className="notif-header">
                <span className="notif-title">Notifications</span>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="notif-action-btn" onClick={markAllRead} title="Mark all read">
                    <MdDoneAll size={16} />
                  </button>
                  <button className="notif-action-btn" onClick={clearAll} title="Clear all">
                    <MdDelete size={16} />
                  </button>
                </div>
              </div>

              <div className="notif-list">
                {notifications.length === 0 ? (
                  <div className="notif-empty">No notifications yet</div>
                ) : notifications.map(n => (
                  <div
                    key={n.id}
                    className={`notif-item ${n.read ? '' : 'unread'}`}
                    onClick={() => {
                      markRead(n.id)
                      if (n.orderId) navigate('/orders')
                      setShowNotifs(false)
                    }}
                  >
                    <div className="notif-icon">{n.icon || '🔔'}</div>
                    <div className="notif-content">
                      <div className="notif-item-title">{n.title}</div>
                      <div className="notif-item-msg">{n.message}</div>
                      <div className="notif-item-time">
                        {format(n.time instanceof Date ? n.time : new Date(n.time), 'hh:mm a')}
                      </div>
                    </div>
                    {!n.read && <div className="notif-dot" />}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User chip */}
        <div className="topbar-user">
          <div className="topbar-user-avatar">
            {userProfile?.name?.charAt(0)?.toUpperCase() || 'A'}
          </div>
          <div className="topbar-user-info">
            <span className="topbar-user-name">{userProfile?.name || 'Admin'}</span>
            <span className="topbar-user-role">{userProfile?.role || 'POS Terminal'}</span>
          </div>
        </div>
      </div>
    </header>
  )
}
