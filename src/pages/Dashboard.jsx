import { useNavigate } from 'react-router-dom'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts'
import { usePOS } from '../context/POSContext'
import { useAuth } from '../context/AuthContext'
import { format, subDays, startOfDay, endOfDay, eachDayOfInterval } from 'date-fns'
import {
  MdAttachMoney, MdShoppingCart, MdAccessTime, MdTableRestaurant,
  MdAdd, MdTrendingUp, MdTrendingDown, MdPeople, MdLocalFireDepartment
} from 'react-icons/md'
import './Dashboard.css'

const COLORS = ['#e63946','#4cc9f0','#2dc653','#f4a261','#9b59b6','#1abc9c','#e67e22','#3498db']

const STATUS_COLORS = {
  pending: 'badge-pending', preparing: 'badge-preparing',
  ready: 'badge-ready', paid: 'badge-paid',
  cancelled: 'badge-cancelled', served: 'badge-served',
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{background:'#1c1c28',border:'1px solid #2a2a3a',borderRadius:8,padding:'10px 14px',color:'#f0f0f0',fontSize:12}}>
      <div style={{fontWeight:700,marginBottom:4}}>{label}</div>
      {payload.map((p,i) => (
        <div key={i} style={{color:p.color||'#e63946'}}>
          {p.name==='orders'?`Orders: ${p.value}`:`Sales: Rs. ${Number(p.value).toLocaleString()}`}
        </div>
      ))}
    </div>
  )
}

export default function Dashboard() {
  const navigate   = useNavigate()
  const { userProfile } = useAuth()
  const {
    todaySales, todayOrders, pendingCount, occupiedTables, totalTables,
    orders, tables, menuCategories,
  } = usePOS()

  // ── 7-day chart data ──────────────────────────────────
  const last7Days = eachDayOfInterval({ start: subDays(new Date(), 6), end: new Date() })
  const chartData = last7Days.map(day => {
    const dayOrders = orders.filter(o => {
      const d = o.createdAt?.toDate?.()
      return d && d >= startOfDay(day) && d <= endOfDay(day) && o.paymentStatus === 'paid'
    })
    return {
      label: format(day, 'EEE dd'),
      sales: dayOrders.reduce((s,o) => s + (o.items||[]).reduce((ss,i)=>ss+i.price*i.qty,0)-(o.discount||0), 0),
      orders: dayOrders.length,
    }
  })

  // ── Yesterday comparison ──────────────────────────────
  const yesterdayOrders = orders.filter(o => {
    const d = o.createdAt?.toDate?.()
    const yest = subDays(new Date(), 1)
    return d && d >= startOfDay(yest) && d <= endOfDay(yest) && o.paymentStatus === 'paid'
  })
  const yesterdaySales = yesterdayOrders.reduce((s,o) => s + (o.items||[]).reduce((ss,i)=>ss+i.price*i.qty,0)-(o.discount||0), 0)
  const salesChange    = yesterdaySales ? Math.round(((todaySales - yesterdaySales)/yesterdaySales)*100) : 100
  const ordersChange   = yesterdayOrders.length ? Math.round(((todayOrders.length - yesterdayOrders.length)/yesterdayOrders.length)*100) : 100

  // ── Category sales (today) ────────────────────────────
  const catSales = {}
  todayOrders.filter(o=>o.paymentStatus==='paid').forEach(o =>
    (o.items||[]).forEach(item => {
      catSales[item.categoryId||'other'] = (catSales[item.categoryId||'other']||0) + item.price*item.qty
    })
  )
  const catData = Object.entries(catSales)
    .map(([id,value]) => ({
      name: menuCategories.find(c=>c.id===id)?.name || 'Other',
      value,
      icon: menuCategories.find(c=>c.id===id)?.icon || '🍴'
    }))
    .sort((a,b)=>b.value-a.value).slice(0,6)

  // ── Payment methods (today) ───────────────────────────
  const payMethods = {}
  todayOrders.filter(o=>o.paymentStatus==='paid').forEach(o => {
    payMethods[o.paymentMethod||'cash'] = (payMethods[o.paymentMethod||'cash']||0)+1
  })
  const payData = Object.entries(payMethods).map(([name,value])=>({name,value}))

  // ── Top items today ───────────────────────────────────
  const itemCounts = {}
  todayOrders.filter(o=>o.paymentStatus==='paid').forEach(o =>
    (o.items||[]).forEach(item => { itemCounts[item.name] = (itemCounts[item.name]||0)+item.qty })
  )
  const topItems = Object.entries(itemCounts).sort((a,b)=>b[1]-a[1]).slice(0,6)

  // ── Recent orders ─────────────────────────────────────
  const recentOrders = orders.slice(0,5)

  // ── Kitchen orders ────────────────────────────────────
  const kitchenOrders = orders.filter(o=>['pending','preparing','ready'].includes(o.status)).slice(0,5)

  return (
    <div className="dashboard fade-in">

      {/* ── Header ── */}
      <div className="dash-header">
        <div>
          <h1 className="dash-welcome">Welcome Back, <span>{userProfile?.name||'Admin'}</span> 👋</h1>
          <p className="dash-sub">Here's what's happening at The Kruncheez today — {format(new Date(),'EEEE, dd MMM yyyy')}</p>
        </div>
        <button className="btn-primary dash-new-order" onClick={()=>navigate('/pos')}>
          <MdAdd/> New Order
        </button>
      </div>

      {/* ── KPI Cards ── */}
      <div className="dash-kpis">
        {[
          {
            label: "Today's Sales", icon: <MdAttachMoney/>, color: '#e63946',
            val: `Rs. ${todaySales.toLocaleString()}`,
            change: salesChange, sub: 'vs yesterday'
          },
          {
            label: 'Total Orders', icon: <MdShoppingCart/>, color: '#4cc9f0',
            val: todayOrders.length,
            change: ordersChange, sub: 'vs yesterday'
          },
          {
            label: 'Pending Orders', icon: <MdAccessTime/>, color: '#f4a261',
            val: pendingCount,
            change: null, sub: pendingCount > 0 ? 'Need attention' : 'All clear'
          },
          {
            label: 'Tables Occupied', icon: <MdTableRestaurant/>, color: '#2dc653',
            val: `${occupiedTables}/${totalTables}`,
            change: null, sub: `${totalTables - occupiedTables} available`
          },
        ].map(k => (
          <div key={k.label} className="dash-kpi-card">
            <div className="dash-kpi-icon" style={{color:k.color,background:k.color+'18'}}>{k.icon}</div>
            <div className="dash-kpi-info">
              <div className="dash-kpi-label">{k.label}</div>
              <div className="dash-kpi-value" style={{color:k.color}}>{k.val}</div>
              {k.change !== null ? (
                <div className={`dash-kpi-change ${k.change>=0?'up':'down'}`}>
                  {k.change>=0?'↑':'↓'} {Math.abs(k.change)}% {k.sub}
                </div>
              ) : (
                <div className="dash-kpi-sub">{k.sub}</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ── Charts Row 1 ── */}
      <div className="dash-row">
        {/* Sales Overview */}
        <div className="card dash-chart-main">
          <div className="dash-chart-header">
            <div style={{fontWeight:700,fontSize:15}}>📈 Sales Overview — Last 7 Days</div>
            <button className="dash-view-all" onClick={()=>navigate('/reports')}>Full Reports →</button>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData} margin={{top:5,right:5,bottom:5,left:0}}>
              <defs>
                <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#e63946" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#e63946" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a"/>
              <XAxis dataKey="label" tick={{fill:'#60607a',fontSize:11}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:'#60607a',fontSize:11}} axisLine={false} tickLine={false} width={50}
                tickFormatter={v=>v>=1000?`${(v/1000).toFixed(0)}k`:v}/>
              <Tooltip content={<CustomTooltip/>}/>
              <Area type="monotone" dataKey="sales" name="sales" stroke="#e63946" strokeWidth={2.5}
                fill="url(#grad1)" dot={false} activeDot={{r:5,fill:'#e63946',stroke:'#fff',strokeWidth:2}}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Orders Trend */}
        <div className="card dash-chart-side">
          <div className="dash-chart-header">
            <div style={{fontWeight:700,fontSize:15}}>🧾 Orders Trend</div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} margin={{top:5,right:5,bottom:5,left:0}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a"/>
              <XAxis dataKey="label" tick={{fill:'#60607a',fontSize:11}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:'#60607a',fontSize:11}} axisLine={false} tickLine={false} width={28}/>
              <Tooltip content={<CustomTooltip/>}/>
              <Bar dataKey="orders" name="orders" fill="#4cc9f0" radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Charts Row 2 ── */}
      <div className="dash-row">
        {/* Category Sales */}
        <div className="card" style={{flex:1}}>
          <div className="dash-chart-header">
            <div style={{fontWeight:700,fontSize:15}}>🍽️ Sales by Category</div>
          </div>
          {catData.length === 0 ? (
            <div style={{textAlign:'center',color:'var(--text-muted)',padding:40,fontSize:13}}>No sales today yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={catData} dataKey="value" nameKey="name" cx="50%" cy="50%"
                  outerRadius={75} innerRadius={30}
                  label={({name,percent})=>`${name} ${(percent*100).toFixed(0)}%`} labelLine={false}>
                  {catData.map((_,i) => <Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                </Pie>
                <Tooltip contentStyle={{background:'#1c1c28',border:'1px solid #2a2a3a',borderRadius:8,color:'#f0f0f0',fontSize:11}}
                  formatter={v=>[`Rs. ${Number(v).toLocaleString()}`,'']}/>
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Payment Methods */}
        <div className="card" style={{flex:1}}>
          <div className="dash-chart-header">
            <div style={{fontWeight:700,fontSize:15}}>💳 Payment Methods</div>
          </div>
          {payData.length === 0 ? (
            <div style={{textAlign:'center',color:'var(--text-muted)',padding:40,fontSize:13}}>No payments today</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={payData} dataKey="value" nameKey="name" cx="50%" cy="50%"
                  outerRadius={75} innerRadius={30}
                  label={({name,percent})=>`${name} ${(percent*100).toFixed(0)}%`}>
                  {payData.map((_,i) => <Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                </Pie>
                <Tooltip contentStyle={{background:'#1c1c28',border:'1px solid #2a2a3a',borderRadius:8,color:'#f0f0f0',fontSize:11}}/>
                <Legend wrapperStyle={{fontSize:11,color:'#a0a0b0'}}/>
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Table Status */}
        <div className="card" style={{flex:1}}>
          <div className="dash-chart-header">
            <div style={{fontWeight:700,fontSize:15}}>🪑 Table Status</div>
            <button className="dash-view-all" onClick={()=>navigate('/tables')}>View All</button>
          </div>
          <div className="dash-tables-grid">
            {tables.slice(0,20).map(t => (
              <div key={t.id} className={`table-card ${t.status}`} onClick={()=>navigate('/tables')}>
                <span style={{fontSize:16,fontWeight:800}}>{t.number}</span>
                <span style={{fontSize:9,textTransform:'capitalize'}}>{t.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom Row ── */}
      <div className="dash-row">
        {/* Recent Orders */}
        <div className="card" style={{flex:1.5}}>
          <div className="dash-chart-header">
            <div style={{fontWeight:700,fontSize:15}}>📋 Recent Orders</div>
            <button className="dash-view-all" onClick={()=>navigate('/orders')}>View All</button>
          </div>
          <table className="data-table">
            <thead>
              <tr><th>#</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Time</th></tr>
            </thead>
            <tbody>
              {recentOrders.length===0 ? (
                <tr><td colSpan={6} style={{textAlign:'center',color:'var(--text-muted)',padding:30}}>No orders yet today</td></tr>
              ) : recentOrders.map(o => (
                <tr key={o.id} style={{cursor:'pointer'}} onClick={()=>navigate('/orders')}>
                  <td style={{fontWeight:700,color:'var(--accent)'}}>#{String(o.orderNumber||o.id.slice(0,4)).padStart(4,'0')}</td>
                  <td style={{fontSize:12}}>{o.customerName||'Walk-in'}</td>
                  <td style={{fontSize:12}}>{(o.items||[]).reduce((s,i)=>s+i.qty,0)}</td>
                  <td style={{fontWeight:600}}>Rs. {((o.items||[]).reduce((s,i)=>s+i.price*i.qty,0)-(o.discount||0)).toLocaleString()}</td>
                  <td><span className={`badge ${STATUS_COLORS[o.status]||'badge-pending'}`}>{o.status}</span></td>
                  <td style={{fontSize:11,color:'var(--text-muted)'}}>{o.createdAt?.toDate?format(o.createdAt.toDate(),'hh:mm a'):'—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Top Items + Kitchen */}
        <div style={{display:'flex',flexDirection:'column',gap:16,flex:1}}>
          {/* Popular Items */}
          <div className="card">
            <div className="dash-chart-header">
              <div style={{fontWeight:700,fontSize:15}}>🔥 Top Items Today</div>
              <button className="dash-view-all" onClick={()=>navigate('/reports')}>Details</button>
            </div>
            {topItems.length === 0 ? (
              <div style={{textAlign:'center',color:'var(--text-muted)',padding:20,fontSize:12}}>No sales yet</div>
            ) : topItems.map(([name,qty],i) => (
              <div key={name} style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}>
                <span style={{width:20,height:20,background:COLORS[i%COLORS.length],borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:900,color:'#fff',flexShrink:0}}>{i+1}</span>
                <span style={{flex:1,fontSize:12,color:'var(--text-primary)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{name}</span>
                <div style={{width:60,height:5,background:'var(--border)',borderRadius:3,overflow:'hidden'}}>
                  <div style={{height:'100%',background:COLORS[i%COLORS.length],width:`${(qty/(topItems[0]?.[1]||1))*100}%`}}/>
                </div>
                <span style={{fontSize:12,fontWeight:700,color:'var(--text-primary)',width:24,textAlign:'right'}}>{qty}</span>
              </div>
            ))}
          </div>

          {/* Kitchen */}
          <div className="card">
            <div className="dash-chart-header">
              <div style={{fontWeight:700,fontSize:15}}>👨‍🍳 Kitchen Queue</div>
              <button className="dash-view-all" onClick={()=>navigate('/kitchen')}>View All</button>
            </div>
            {kitchenOrders.length===0 ? (
              <div style={{textAlign:'center',color:'var(--text-muted)',padding:16,fontSize:12}}>Kitchen is clear ✅</div>
            ) : kitchenOrders.map(o => (
              <div key={o.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'6px 0',borderBottom:'1px solid var(--border)',fontSize:12}}>
                <span style={{fontWeight:700,color:'var(--accent)'}}>#{String(o.orderNumber||o.id.slice(0,4)).padStart(4,'0')}</span>
                <span style={{flex:1,marginLeft:8,color:'var(--text-secondary)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                  {(o.items||[]).map(i=>i.name).slice(0,2).join(', ')}
                </span>
                <span className={`badge ${STATUS_COLORS[o.kitchenStatus||o.status]||'badge-pending'}`} style={{fontSize:10}}>
                  {o.kitchenStatus||o.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  )
}
