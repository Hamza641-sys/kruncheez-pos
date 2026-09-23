import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { MdNotifications, MdSearch, MdCalendarMonth } from 'react-icons/md'
import { useAuth } from '../context/AuthContext'
import { usePOS } from '../context/POSContext'
import './Topbar.css'

export default function Topbar() {
  const { userProfile } = useAuth()
  const { pendingCount } = usePOS()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

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

        {/* Notifications */}
        <button className="topbar-notif" onClick={() => navigate('/orders')}>
          <MdNotifications />
          {pendingCount > 0 && <span className="topbar-badge">{pendingCount}</span>}
        </button>

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
