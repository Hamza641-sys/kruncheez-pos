import { useState, useMemo } from 'react'
import { usePOS } from '../context/POSContext'
import {
  BarChart, Bar, AreaChart, Area, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'
import { format, subDays, subMonths, subYears, startOfDay, endOfDay,
  startOfWeek, endOfWeek, startOfMonth, endOfMonth,
  startOfYear, endOfYear, eachDayOfInterval, eachWeekOfInterval,
  eachMonthOfInterval, getMonth, getYear } from 'date-fns'
import { usePrint } from '../hooks/usePrint'
import { MdPrint, MdTrendingUp, MdTrendingDown, MdAttachMoney,
  MdShoppingCart, MdPeople, MdTableRestaurant } from 'react-icons/md'
import './Reports.css'

const COLORS = ['#e63946','#4cc9f0','#2dc653','#f4a261','#9b59b6','#1abc9c','#e67e22','#3498db','#e74c3c','#2ecc71']

const RANGES = [
  { key: 'today',   label: 'Today' },
  { key: 'week',    label: 'This Week' },
  { key: 'month',   label: 'This Month' },
  { key: 'year',    label: 'This Year' },
  { key: '7days',   label: 'Last 7 Days' },
  { key: '30days',  label: 'Last 30 Days' },
  { key: '90days',  label: 'Last 90 Days' },
  { key: '12months',label: 'Last 12 Months' },
]

function getDateRange(rangeKey) {
  const now = new Date()
  switch(rangeKey) {
    case 'today':    return { from: startOfDay(now),         to: endOfDay(now) }
    case 'week':     return { from: startOfWeek(now, {weekStartsOn:1}), to: endOfWeek(now, {weekStartsOn:1}) }
    case 'month':    return { from: startOfMonth(now),       to: endOfMonth(now) }
    case 'year':     return { from: startOfYear(now),        to: endOfYear(now) }
    case '7days':    return { from: startOfDay(subDays(now,6)), to: endOfDay(now) }
    case '30days':   return { from: startOfDay(subDays(now,29)), to: endOfDay(now) }
    case '90days':   return { from: startOfDay(subDays(now,89)), to: endOfDay(now) }
    case '12months': return { from: startOfMonth(subMonths(now,11)), to: endOfMonth(now) }
    default:         return { from: startOfDay(now), to: endOfDay(now) }
  }
}

// Custom Tooltip
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{background:'#1c1c28',border:'1px solid #2a2a3a',borderRadius:8,padding:'10px 14px',color:'#f0f0f0',fontSize:12}}>
      <div style={{fontWeight:700,marginBottom:4}}>{label}</div>
      {payload.map((p,i) => (
        <div key={i} style={{color:p.color}}>
          {p.name}: {p.name==='orders' ? p.value : `Rs. ${Number(p.value).toLocaleString()}`}
        </div>
      ))}
    </div>
  )
}

export default function Reports() {
  const { orders, menuCategories } = usePOS()
  const [range, setRange] = useState('7days')
  const { printRef, handlePrint } = usePrint()

  const { from, to } = getDateRange(range)

  // Filter paid orders in range
  const rangeOrders = useMemo(() => orders.filter(o => {
    const d = o.createdAt?.toDate?.()
    return d && d >= from && d <= to && o.paymentStatus === 'paid'
  }), [orders, range])

  // Previous period for comparison
  const prevFrom = new Date(from.getTime() - (to.getTime() - from.getTime()))
  const prevOrders = useMemo(() => orders.filter(o => {
    const d = o.createdAt?.toDate?.()
    return d && d >= prevFrom && d < from && o.paymentStatus === 'paid'
  }), [orders, range])

  // ── KPIs ──────────────────────────────────────────────
  const totalSales    = rangeOrders.reduce((s,o) => s + (o.items||[]).reduce((ss,i) => ss + i.price*i.qty, 0) - (o.discount||0), 0)
  const prevSales     = prevOrders.reduce((s,o) => s + (o.items||[]).reduce((ss,i) => ss + i.price*i.qty, 0) - (o.discount||0), 0)
  const totalOrders   = rangeOrders.length
  const prevOrdCount  = prevOrders.length
  const avgOrder      = totalOrders ? Math.round(totalSales / totalOrders) : 0
  const prevAvg       = prevOrdCount ? Math.round(prevSales / prevOrdCount) : 0
  const totalItems    = rangeOrders.reduce((s,o) => s + (o.items||[]).reduce((ss,i)=>ss+i.qty,0), 0)
  const uniqueCustomers = new Set(rangeOrders.map(o=>o.customerPhone).filter(Boolean)).size

  const pctChange = (curr, prev) => {
    if (!prev) return curr > 0 ? 100 : 0
    return Math.round(((curr - prev) / prev) * 100)
  }

  // ── Chart Data ────────────────────────────────────────
  const chartData = useMemo(() => {
    const isLong = ['12months','year'].includes(range)
    const isMedium = ['90days','30days','month'].includes(range)

    if (isLong) {
      // Monthly grouping
      const months = eachMonthOfInterval({ start: from, end: to })
      return months.map(month => {
        const mOrders = rangeOrders.filter(o => {
          const d = o.createdAt?.toDate?.()
          return d && d >= startOfMonth(month) && d <= endOfMonth(month)
        })
        return {
          label: format(month, 'MMM yy'),
          sales: mOrders.reduce((s,o) => s + (o.items||[]).reduce((ss,i)=>ss+i.price*i.qty,0) - (o.discount||0), 0),
          orders: mOrders.length
        }
      })
    } else if (isMedium) {
      // Weekly grouping
      const days = eachDayOfInterval({ start: from, end: to })
      return days.map(day => {
        const dOrders = rangeOrders.filter(o => {
          const d = o.createdAt?.toDate?.()
          return d && d >= startOfDay(day) && d <= endOfDay(day)
        })
        return {
          label: format(day, 'dd MMM'),
          sales: dOrders.reduce((s,o) => s + (o.items||[]).reduce((ss,i)=>ss+i.price*i.qty,0) - (o.discount||0), 0),
          orders: dOrders.length
        }
      })
    } else {
      // Daily/hourly
      const days = eachDayOfInterval({ start: from, end: to })
      if (days.length <= 1) {
        // Hourly for today
        return Array.from({length:18},(_,i) => {
          const h = 8 + i
          const hOrders = rangeOrders.filter(o => {
            const d = o.createdAt?.toDate?.()
            return d && d.getHours() === h
          })
          return {
            label: h<=12 ? `${h}AM` : `${h-12}PM`,
            sales: hOrders.reduce((s,o) => s + (o.items||[]).reduce((ss,i)=>ss+i.price*i.qty,0) - (o.discount||0), 0),
            orders: hOrders.length
          }
        })
      }
      return days.map(day => {
        const dOrders = rangeOrders.filter(o => {
          const d = o.createdAt?.toDate?.()
          return d && d >= startOfDay(day) && d <= endOfDay(day)
        })
        return {
          label: format(day, 'EEE dd'),
          sales: dOrders.reduce((s,o) => s + (o.items||[]).reduce((ss,i)=>ss+i.price*i.qty,0) - (o.discount||0), 0),
          orders: dOrders.length
        }
      })
    }
  }, [rangeOrders, range])

  // ── Category Sales ─────────────────────────────────────
  const catData = useMemo(() => {
    const totals = {}
    rangeOrders.forEach(o => (o.items||[]).forEach(item => {
      totals[item.categoryId||'other'] = (totals[item.categoryId||'other']||0) + item.price * item.qty
    }))
    return Object.entries(totals)
      .map(([id, value]) => ({
        name: menuCategories.find(c=>c.id===id)?.name || id,
        value, icon: menuCategories.find(c=>c.id===id)?.icon || '🍴'
      }))
      .sort((a,b) => b.value - a.value)
      .slice(0,8)
  }, [rangeOrders, menuCategories])

  // ── Payment Methods ────────────────────────────────────
  const payData = useMemo(() => {
    const m = {}
    rangeOrders.forEach(o => {
      const method = o.paymentMethod || 'cash'
      m[method] = (m[method]||0) + 1
    })
    return Object.entries(m).map(([name,value]) => ({ name, value }))
  }, [rangeOrders])

  // ── Order Types ─────────────────────────────────────────
  const typeData = useMemo(() => {
    const t = { 'dine-in':0, takeaway:0, delivery:0 }
    rangeOrders.forEach(o => { t[o.orderType||'dine-in']++ })
    return Object.entries(t).map(([name,value]) => ({ name, value }))
  }, [rangeOrders])

  // ── Top Items ──────────────────────────────────────────
  const topItems = useMemo(() => {
    const counts = {}
    rangeOrders.forEach(o => (o.items||[]).forEach(item => {
      if (!counts[item.name]) counts[item.name] = { qty:0, revenue:0 }
      counts[item.name].qty     += item.qty
      counts[item.name].revenue += item.price * item.qty
    }))
    return Object.entries(counts)
      .sort((a,b) => b[1].qty - a[1].qty)
      .slice(0,10)
      .map(([name, d]) => ({ name, ...d }))
  }, [rangeOrders])

  // ── Peak Hours ─────────────────────────────────────────
  const peakHours = useMemo(() => {
    const hours = Array.from({length:18},(_,i) => {
      const h = 8+i
      const count = rangeOrders.filter(o => o.createdAt?.toDate?.()?.getHours() === h).length
      return { hour: h<=12?`${h}:00`:h===12?'12:00':`${h-12}:00`, count, label: h<=12?`${h}AM`:`${h-12}PM` }
    })
    return hours
  }, [rangeOrders])
  const maxHour = Math.max(...peakHours.map(h=>h.count), 1)

  // ── Hourly Sales ───────────────────────────────────────
  const busyHour = peakHours.reduce((max,h) => h.count > max.count ? h : max, {count:0,label:'—'})

  return (
    <div className="reports-page fade-in">

      {/* ── Header ── */}
      <div className="page-header">
        <div>
          <div className="page-title">📊 Reports & Analytics</div>
          <div className="page-subtitle">
            {format(from,'dd MMM yyyy')} — {format(to,'dd MMM yyyy')} •
            <span style={{color:'var(--accent)',marginLeft:6}}>{totalOrders} orders</span>
          </div>
        </div>
        <div style={{display:'flex',gap:10,alignItems:'center'}}>
          <button className="btn-outline" style={{display:'flex',alignItems:'center',gap:6,padding:'9px 18px'}}
            onClick={()=>window.print()}>
            <MdPrint /> Print
          </button>
        </div>
      </div>

      {/* ── Range Selector ── */}
      <div className="reports-ranges">
        {RANGES.map(r => (
          <button key={r.key} className={`reports-range-btn ${range===r.key?'active':''}`}
            onClick={()=>setRange(r.key)}>
            {r.label}
          </button>
        ))}
      </div>

      {/* ── KPI Cards ── */}
      <div className="reports-kpis">
        {[
          { label:'Total Sales',     val:`Rs. ${totalSales.toLocaleString()}`,  pct:pctChange(totalSales,prevSales),   icon:<MdAttachMoney/>,  color:'var(--accent)' },
          { label:'Total Orders',    val:totalOrders,                            pct:pctChange(totalOrders,prevOrdCount),icon:<MdShoppingCart/>, color:'var(--info)' },
          { label:'Avg Order Value', val:`Rs. ${avgOrder.toLocaleString()}`,     pct:pctChange(avgOrder,prevAvg),       icon:<MdTrendingUp/>,   color:'var(--success)' },
          { label:'Items Sold',      val:totalItems,                             pct:null,                              icon:<MdShoppingCart/>, color:'var(--warning)' },
          { label:'Unique Customers',val:uniqueCustomers,                        pct:null,                              icon:<MdPeople/>,       color:'#9b59b6' },
          { label:'Peak Hour',       val:busyHour.label,                         pct:null,                              icon:<MdTableRestaurant/>,color:'var(--info)' },
        ].map(k => (
          <div key={k.label} className="reports-kpi-card">
            <div className="reports-kpi-icon" style={{color:k.color,background:k.color+'18'}}>{k.icon}</div>
            <div className="reports-kpi-info">
              <div className="reports-kpi-label">{k.label}</div>
              <div className="reports-kpi-value" style={{color:k.color}}>{k.val}</div>
              {k.pct !== null && (
                <div className={`reports-kpi-change ${k.pct>=0?'up':'down'}`}>
                  {k.pct>=0?'↑':'↓'} {Math.abs(k.pct)}% vs prev period
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ── Main Chart ── */}
      <div className="reports-row">
        <div className="card reports-main-chart">
          <div className="reports-chart-header">
            <div style={{fontWeight:700,fontSize:15}}>📈 Sales Overview</div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={chartData} margin={{top:5,right:5,bottom:5,left:5}}>
              <defs>
                <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#e63946" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#e63946" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a"/>
              <XAxis dataKey="label" tick={{fill:'#60607a',fontSize:10}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:'#60607a',fontSize:10}} axisLine={false} tickLine={false} width={55}
                tickFormatter={v=>v>=1000?`${(v/1000).toFixed(0)}k`:v}/>
              <Tooltip content={<CustomTooltip/>}/>
              <Area type="monotone" dataKey="sales" name="sales" stroke="#e63946" strokeWidth={2}
                fill="url(#salesGrad)" dot={false} activeDot={{r:4,fill:'#e63946'}}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card reports-orders-chart">
          <div style={{fontWeight:700,fontSize:15,marginBottom:12}}>🧾 Orders Trend</div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData} margin={{top:5,right:5,bottom:5,left:0}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a"/>
              <XAxis dataKey="label" tick={{fill:'#60607a',fontSize:10}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:'#60607a',fontSize:10}} axisLine={false} tickLine={false} width={30}/>
              <Tooltip content={<CustomTooltip/>}/>
              <Bar dataKey="orders" name="orders" fill="#4cc9f0" radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Category + Payment + Type ── */}
      <div className="reports-row">
        <div className="card" style={{flex:1}}>
          <div style={{fontWeight:700,fontSize:15,marginBottom:12}}>🍽️ Sales by Category</div>
          {catData.length === 0 ? (
            <div style={{textAlign:'center',color:'var(--text-muted)',padding:40}}>No data</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={catData} dataKey="value" nameKey="name" cx="50%" cy="50%"
                  outerRadius={80} innerRadius={35}
                  label={({name,percent})=>`${name} ${(percent*100).toFixed(0)}%`}
                  labelLine={false}>
                  {catData.map((_,i) => <Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                </Pie>
                <Tooltip contentStyle={{background:'#1c1c28',border:'1px solid #2a2a3a',borderRadius:8,color:'#f0f0f0',fontSize:11}}
                  formatter={v=>[`Rs. ${Number(v).toLocaleString()}`,'']}/>
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card" style={{flex:1}}>
          <div style={{fontWeight:700,fontSize:15,marginBottom:12}}>💳 Payment Methods</div>
          {payData.length === 0 ? (
            <div style={{textAlign:'center',color:'var(--text-muted)',padding:40}}>No data</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={payData} dataKey="value" nameKey="name" cx="50%" cy="50%"
                  outerRadius={80} innerRadius={35}
                  label={({name,percent})=>`${name} ${(percent*100).toFixed(0)}%`}>
                  {payData.map((_,i) => <Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                </Pie>
                <Tooltip contentStyle={{background:'#1c1c28',border:'1px solid #2a2a3a',borderRadius:8,color:'#f0f0f0',fontSize:11}}/>
                <Legend wrapperStyle={{fontSize:11,color:'#a0a0b0'}}/>
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card" style={{flex:1}}>
          <div style={{fontWeight:700,fontSize:15,marginBottom:12}}>🍽️ Order Types</div>
          {typeData.every(t=>t.value===0) ? (
            <div style={{textAlign:'center',color:'var(--text-muted)',padding:40}}>No data</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={typeData.filter(t=>t.value>0)} dataKey="value" nameKey="name"
                  cx="50%" cy="50%" outerRadius={80} innerRadius={35}
                  label={({name,percent})=>`${name} ${(percent*100).toFixed(0)}%`}>
                  {typeData.map((_,i) => <Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                </Pie>
                <Tooltip contentStyle={{background:'#1c1c28',border:'1px solid #2a2a3a',borderRadius:8,color:'#f0f0f0',fontSize:11}}/>
                <Legend wrapperStyle={{fontSize:11,color:'#a0a0b0'}}/>
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── Top Items + Peak Hours ── */}
      <div className="reports-row">
        {/* Top 10 Items */}
        <div className="card" style={{flex:1.2}}>
          <div style={{fontWeight:700,fontSize:15,marginBottom:14}}>🔥 Top 10 Items</div>
          {topItems.length === 0 ? (
            <div style={{textAlign:'center',color:'var(--text-muted)',padding:30}}>No data</div>
          ) : topItems.map((item,i) => (
            <div key={item.name} style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
              <span style={{width:22,height:22,background:COLORS[i%COLORS.length],borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:900,color:'#fff',flexShrink:0}}>{i+1}</span>
              <span style={{flex:1,fontSize:13,color:'var(--text-primary)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{item.name}</span>
              <div style={{width:100,height:6,background:'var(--border)',borderRadius:3,overflow:'hidden',flexShrink:0}}>
                <div style={{height:'100%',background:COLORS[i%COLORS.length],width:`${(item.qty/(topItems[0]?.qty||1))*100}%`,transition:'width 0.5s'}}/>
              </div>
              <span style={{fontSize:12,fontWeight:700,color:'var(--text-primary)',width:28,textAlign:'right',flexShrink:0}}>{item.qty}</span>
              <span style={{fontSize:11,color:'var(--accent)',width:70,textAlign:'right',flexShrink:0}}>Rs.{item.revenue.toLocaleString()}</span>
            </div>
          ))}
        </div>

        {/* Peak Hours */}
        <div className="card" style={{flex:1}}>
          <div style={{fontWeight:700,fontSize:15,marginBottom:14}}>⏰ Peak Hours</div>
          <div style={{display:'flex',flexDirection:'column',gap:6}}>
            {peakHours.filter(h=>h.count>0).length === 0 ? (
              <div style={{textAlign:'center',color:'var(--text-muted)',padding:30}}>No data</div>
            ) : peakHours.map(h => (
              h.count > 0 && (
                <div key={h.hour} style={{display:'flex',alignItems:'center',gap:8}}>
                  <span style={{width:40,fontSize:11,color:'var(--text-muted)',flexShrink:0}}>{h.label}</span>
                  <div style={{flex:1,height:18,background:'var(--border)',borderRadius:4,overflow:'hidden',position:'relative'}}>
                    <div style={{height:'100%',background:`rgba(230,57,70,${0.3+0.7*(h.count/maxHour)})`,width:`${(h.count/maxHour)*100}%`,borderRadius:4,transition:'width 0.5s'}}/>
                    <span style={{position:'absolute',left:6,top:'50%',transform:'translateY(-50%)',fontSize:10,fontWeight:600,color:'#fff'}}>{h.count} orders</span>
                  </div>
                </div>
              )
            ))}
          </div>
        </div>
      </div>

      {/* ── Summary Table ── */}
      <div className="card">
        <div style={{fontWeight:700,fontSize:15,marginBottom:14}}>📋 Category Breakdown</div>
        <table className="data-table">
          <thead>
            <tr><th>Category</th><th>Orders</th><th>Items Sold</th><th>Revenue</th><th>% of Total</th></tr>
          </thead>
          <tbody>
            {catData.length === 0 ? (
              <tr><td colSpan={5} style={{textAlign:'center',color:'var(--text-muted)',padding:30}}>No data for this period</td></tr>
            ) : catData.map((cat,i) => {
              const catOrders = rangeOrders.filter(o => (o.items||[]).some(item => {
                const catObj = menuCategories.find(c=>c.name===cat.name)
                return item.categoryId === catObj?.id
              })).length
              const catQty = rangeOrders.reduce((s,o) => s + (o.items||[]).filter(item => {
                const catObj = menuCategories.find(c=>c.name===cat.name)
                return item.categoryId === catObj?.id
              }).reduce((ss,i)=>ss+i.qty,0), 0)
              const pct = totalSales ? Math.round((cat.value/totalSales)*100) : 0
              return (
                <tr key={cat.name}>
                  <td>
                    <div style={{display:'flex',alignItems:'center',gap:8}}>
                      <span style={{width:10,height:10,borderRadius:'50%',background:COLORS[i%COLORS.length],flexShrink:0}}/>
                      <span style={{fontWeight:600,color:'var(--text-primary)'}}>{cat.icon} {cat.name}</span>
                    </div>
                  </td>
                  <td>{catOrders}</td>
                  <td>{catQty}</td>
                  <td style={{fontWeight:600,color:'var(--accent)'}}>Rs. {cat.value.toLocaleString()}</td>
                  <td>
                    <div style={{display:'flex',alignItems:'center',gap:8}}>
                      <div style={{width:60,height:6,background:'var(--border)',borderRadius:3,overflow:'hidden'}}>
                        <div style={{height:'100%',background:COLORS[i%COLORS.length],width:`${pct}%`}}/>
                      </div>
                      <span style={{fontSize:12}}>{pct}%</span>
                    </div>
                  </td>
                </tr>
              )
            })}
            {catData.length > 0 && (
              <tr style={{borderTop:'2px solid var(--border)'}}>
                <td style={{fontWeight:700,color:'var(--text-primary)'}}>TOTAL</td>
                <td style={{fontWeight:700}}>{totalOrders}</td>
                <td style={{fontWeight:700}}>{totalItems}</td>
                <td style={{fontWeight:700,color:'var(--accent)'}}>Rs. {totalSales.toLocaleString()}</td>
                <td style={{fontWeight:700}}>100%</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Orders List ── */}
      <div className="card">
        <div style={{fontWeight:700,fontSize:15,marginBottom:14}}>
          🧾 All Orders ({rangeOrders.length})
        </div>
        <table className="data-table">
          <thead>
            <tr><th>#</th><th>Customer</th><th>Type</th><th>Items</th><th>Total</th><th>Payment</th><th>Date & Time</th></tr>
          </thead>
          <tbody>
            {rangeOrders.length === 0 ? (
              <tr><td colSpan={7} style={{textAlign:'center',color:'var(--text-muted)',padding:30}}>No orders in this period</td></tr>
            ) : rangeOrders.slice(0,20).map(o => (
              <tr key={o.id}>
                <td style={{fontWeight:700,color:'var(--accent)'}}>#{String(o.orderNumber||o.id.slice(0,4)).padStart(4,'0')}</td>
                <td>
                  <div style={{fontWeight:600,color:'var(--text-primary)',fontSize:12}}>{o.customerName||'Walk-in'}</div>
                  {o.customerPhone&&<div style={{fontSize:11,color:'var(--text-muted)'}}>{o.customerPhone}</div>}
                </td>
                <td style={{textTransform:'capitalize',fontSize:12}}>{o.orderType||'dine-in'}</td>
                <td style={{fontSize:12}}>{(o.items||[]).map(i=>`${i.name}×${i.qty}`).slice(0,2).join(', ')}{o.items?.length>2?'...':''}</td>
                <td style={{fontWeight:600,color:'var(--text-primary)'}}>
                  Rs. {((o.items||[]).reduce((s,i)=>s+i.price*i.qty,0)-(o.discount||0)).toLocaleString()}
                </td>
                <td style={{textTransform:'capitalize',fontSize:12}}>{o.paymentMethod||'cash'}</td>
                <td style={{fontSize:11,color:'var(--text-muted)'}}>
                  {o.createdAt?.toDate?format(o.createdAt.toDate(),'dd MMM, hh:mm a'):'—'}
                </td>
              </tr>
            ))}
            {rangeOrders.length > 20 && (
              <tr><td colSpan={7} style={{textAlign:'center',color:'var(--text-muted)',padding:10,fontSize:12}}>
                ... and {rangeOrders.length - 20} more orders
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  )
}
