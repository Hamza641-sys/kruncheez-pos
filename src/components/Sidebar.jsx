import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import {
  MdDashboard, MdPointOfSale, MdReceipt, MdTableRestaurant,
  MdOutdoorGrill, MdMenuBook, MdInventory, MdPeople,
  MdAccountBalance, MdBarChart, MdBadge, MdSettings, MdLogout,
  MdTwoWheeler, MdEventSeat, MdAccessTime, MdNightlight, MdUndo
} from 'react-icons/md'
import './Sidebar.css'

const navItems = [
  { path: '/',             label: 'Dashboard',    icon: <MdDashboard /> },
  { path: '/pos',          label: 'POS / New Order', icon: <MdPointOfSale /> },
  { path: '/orders',       label: 'Orders',       icon: <MdReceipt /> },
  { path: '/tables',       label: 'Tables',       icon: <MdTableRestaurant /> },
  { path: '/kitchen',      label: 'Kitchen',      icon: <MdOutdoorGrill /> },
  { path: '/delivery',     label: 'Delivery',     icon: <MdTwoWheeler /> },
  { path: '/reservations', label: 'Reservations', icon: <MdEventSeat /> },
  { path: '/shifts',       label: 'Shifts',       icon: <MdAccessTime /> },
  { path: '/menu',         label: 'Menu',         icon: <MdMenuBook /> },
  { path: '/inventory',    label: 'Inventory',    icon: <MdInventory /> },
  { path: '/customers',    label: 'Customers',    icon: <MdPeople /> },
  { path: '/expenses',     label: 'Expenses',     icon: <MdAccountBalance /> },
  { path: '/reports',      label: 'Reports',      icon: <MdBarChart /> },
  { path: '/endofday',     label: 'End of Day',   icon: <MdNightlight /> },
  { path: '/refunds',      label: 'Refunds',      icon: <MdUndo /> },
  { path: '/employees',    label: 'Employees',    icon: <MdBadge /> },
  { path: '/settings',     label: 'Settings',     icon: <MdSettings /> },
]

export default function Sidebar() {
  const { logout, userProfile } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    toast.success('Logged out')
    navigate('/login')
  }

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">🍔</div>
        <div>
          <div className="sidebar-logo-name">THE KRUNCHEEZ</div>
          <div className="sidebar-logo-tagline">FAST • FRESH • TASTY</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        {navItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <span className="sidebar-link-icon">{item.icon}</span>
            <span className="sidebar-link-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Bottom branding + logout */}
      <div className="sidebar-bottom">
        <div className="sidebar-user">
          <div className="sidebar-user-avatar">
            {userProfile?.name?.charAt(0)?.toUpperCase() || 'A'}
          </div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{userProfile?.name || 'Admin'}</div>
            <div className="sidebar-user-role">{userProfile?.role || 'POS Terminal'}</div>
          </div>
        </div>
        <button className="sidebar-logout" onClick={handleLogout} title="Logout">
          <MdLogout />
        </button>
      </div>

      {/* Branding */}
      <div className="sidebar-brand-text">CRUNCH<br />IN EVERY<br />BITE</div>
    </aside>
  )
}
