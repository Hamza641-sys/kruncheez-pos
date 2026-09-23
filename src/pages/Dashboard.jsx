import { useNavigate } from 'react-router-dom'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts'
import { usePOS } from '../context/POSContext'
import { useAuth } from '../context/AuthContext'
import { format } from 'date-fns'
import { MdAttachMoney, MdShoppingCart, MdAccessTime, MdTableRestaurant } from 'react-icons/md'
import './Dashboard.css'

// Generate hourly chart data from orders
function buildChartData(orders) {
  const today = new Date()
  const hours = Array.from({ length: 12 }, (_, i) => {
    const h = 10 + i
    const label = h <= 12 ? `${h} AM` : `${h - 12} PM`
    const count = orders.filter(o => {
      const d = o.createdAt?.toDate?.()
      return d && d.toDateString() === today.toDateString() && d.getHours() === h
    })
    const sales = count.filter(o => o.paymentStatus === 'paid').reduce((s, o) => s + (o.total || 0), 0)
    return { label, sales }
  })
  return hours
}

const STATUS_COLORS = {
  pending: 'badge-pending',
  preparing: 'badge-preparing',
  ready: 'badge-ready',
  paid: 'badge-paid',
  cancelled: 'badge-cancelled',
  served: 'badge-served',
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { userProfile } = useAuth()
  const {
    todaySales, todayOrders, pendingCount, occupiedTables, totalTables,
    orders, tables, menuCategories, menuItems
  } = usePOS()

  const chartData = buildChartData(orders)
  const recentOrders = orders.slice(0, 5)

  // Popular categories
  const popular = menuCategories.slice(0, 6).map(cat => {
    const sold = orders
      .flatMap(o => o.items || [])
      .filter(i => i.categoryId === cat.id)
      .reduce((s, i) => s + i.qty, 0)
    const pct = Math.min(Math.round((sold / Math.max(1, orders.length * 2)) * 100), 99)
    return { ...cat, sold, pct }
  })

  const kitchenOrders = orders
    .filter(o => ['pending','preparing','ready'].includes(o.status))
    .slice(0, 5)

  return (
    <div className="dashboard fade-in">
      {/* Header */}
      <div className="dash-header">
        <div>
          <h1 className="dash-welcome">Welcome Back, <span>{userProfile?.name || 'Admin'}</span></h1>
          <p className="dash-sub">Here's what's happening at your restaurant today.</p>
        </div>
        <button className="btn-primary dash-new-order" onClick={() => navigate('/pos')}>
          + New Order
        </button>
      </div>

      {/* Stats Row */}
      <div className="dash-stats">
        <div className="stat-card">
          <div className="stat-icon"><MdAttachMoney /></div>
          <div>
            <div className="stat-label">Today's Sales</div>
            <div className="stat-value">Rs. {todaySales.toLocaleString()}</div>
            <div className="stat-change up">↑ Live sales</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><MdShoppingCart /></div>
          <div>
            <div className="stat-label">Total Orders</div>
            <div className="stat-value">{todayOrders.length}</div>
            <div className="stat-change up">↑ Today</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><MdAccessTime /></div>
          <div>
            <div className="stat-label">Pending Orders</div>
            <div className="stat-value">{pendingCount}</div>
            <div className={`stat-change ${pendingCount > 5 ? 'down' : 'up'}`}>
              {pendingCount > 0 ? 'Needs attention' : 'All clear'}
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><MdTableRestaurant /></div>
          <div>
            <div className="stat-label">Tables Occupied</div>
            <div className="stat-value">{occupiedTables} / {totalTables}</div>
            <div className="stat-change up">↑ Active tables</div>
          </div>
        </div>
      </div>

      {/* Main grid */}
      <div className="dash-grid">
        {/* Sales Chart */}
        <div className="card dash-chart-card">
          <div className="dash-section-header">
            <div>
              <div className="dash-section-title">📊 Sales Overview</div>
            </div>
            <div className="dash-chart-tabs">
              <button className="dash-tab active">Today</button>
              <button className="dash-tab">7 Days</button>
              <button className="dash-tab">30 Days</button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#e63946" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#e63946" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" />
              <XAxis dataKey="label" tick={{ fill: '#60607a', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#60607a', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#1c1c28', border: '1px solid #2a2a3a', borderRadius: 8, color: '#f0f0f0' }}
                formatter={v => [`Rs. ${v.toLocaleString()}`, 'Sales']}
              />
              <Area type="monotone" dataKey="sales" stroke="#e63946" strokeWidth={2} fill="url(#salesGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Table Status */}
        <div className="card dash-tables-card">
          <div className="dash-section-header">
            <div className="dash-section-title">🍽️ Table Status</div>
            <button className="dash-view-all" onClick={() => navigate('/tables')}>View All</button>
          </div>
          <div className="dash-tables-grid">
            {tables.map(t => (
              <div key={t.id} className={`table-card ${t.status}`} onClick={() => navigate('/tables')}>
                <span>{t.number}</span>
                <span style={{ fontSize: 10, textTransform: 'capitalize' }}>{t.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="card dash-orders-card">
          <div className="dash-section-header">
            <div className="dash-section-title">📋 Recent Orders</div>
            <button className="dash-view-all" onClick={() => navigate('/orders')}>View All</button>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Table</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No orders yet today</td></tr>
              ) : recentOrders.map(o => (
                <tr key={o.id} style={{ cursor: 'pointer' }} onClick={() => navigate('/orders')}>
                  <td style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                    #{String(o.orderNumber || o.id.slice(0,4)).padStart(4,'0')}
                  </td>
                  <td>{o.tableNumber || o.orderType || '—'}</td>
                  <td>{(o.items || []).reduce((s, i) => s + i.qty, 0)}</td>
                  <td style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Rs. {(o.total || 0).toLocaleString()}</td>
                  <td><span className={`badge ${STATUS_COLORS[o.status] || 'badge-pending'}`}>{o.status}</span></td>
                  <td>{o.createdAt?.toDate ? format(o.createdAt.toDate(), 'hh:mm a') : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Popular Items */}
        <div className="card dash-popular-card">
          <div className="dash-section-header">
            <div className="dash-section-title">🔥 Popular Items</div>
            <button className="dash-view-all" onClick={() => navigate('/menu')}>View All</button>
          </div>
          <div className="dash-popular-grid">
            {popular.map(cat => (
              <div key={cat.id} className="dash-popular-item">
                <div className="dash-popular-icon" style={{ background: cat.color + '22' }}>
                  <span>{cat.icon}</span>
                </div>
                <div className="dash-popular-name">{cat.name}</div>
                <div className="dash-popular-sold">{cat.sold} sold</div>
                <div className="dash-popular-bar">
                  <div className="dash-popular-fill" style={{ width: `${cat.pct}%`, background: cat.color }} />
                </div>
                <div className="dash-popular-pct">{cat.pct}%</div>
              </div>
            ))}
          </div>
        </div>

        {/* Kitchen Status */}
        <div className="card dash-kitchen-card">
          <div className="dash-section-header">
            <div className="dash-section-title">👨‍🍳 Kitchen Order Status</div>
            <button className="dash-view-all" onClick={() => navigate('/kitchen')}>View All</button>
          </div>
          <div className="dash-kitchen-tabs">
            <button className="dash-tab active">All ({kitchenOrders.length})</button>
            <button className="dash-tab">Preparing ({kitchenOrders.filter(o => o.kitchenStatus === 'preparing').length})</button>
            <button className="dash-tab">Ready ({kitchenOrders.filter(o => o.kitchenStatus === 'ready').length})</button>
          </div>
          <table className="data-table" style={{ marginTop: 12 }}>
            <thead>
              <tr><th>Order #</th><th>Items</th><th>Status</th><th>Since</th></tr>
            </thead>
            <tbody>
              {kitchenOrders.length === 0 ? (
                <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No active kitchen orders</td></tr>
              ) : kitchenOrders.map(o => (
                <tr key={o.id}>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>#{String(o.orderNumber || o.id.slice(0,4)).padStart(4,'0')}</td>
                  <td>{(o.items || []).map(i => `${i.name} x${i.qty}`).join(', ')}</td>
                  <td><span className={`badge ${STATUS_COLORS[o.kitchenStatus || o.status] || 'badge-pending'}`}>{o.kitchenStatus || o.status}</span></td>
                  <td style={{ color: 'var(--text-muted)' }}>
                    {o.createdAt?.toDate ? `${Math.round((Date.now() - o.createdAt.toDate().getTime()) / 60000)}m` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
