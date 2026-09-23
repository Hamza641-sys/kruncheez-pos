import { useState, useMemo } from 'react'
import { usePOS } from '../context/POSContext'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { format, subDays, startOfDay, endOfDay } from 'date-fns'

const COLORS = ['#e63946','#4cc9f0','#2dc653','#f4a261','#9b59b6','#1abc9c','#e67e22','#3498db']

export default function Reports() {
  const { orders, menuCategories } = usePOS()
  const [range, setRange] = useState('7') // 7 | 30 | today

  const rangeOrders = useMemo(() => {
    const now = new Date()
    const from = range === 'today' ? startOfDay(now) : subDays(now, Number(range))
    return orders.filter(o => {
      const d = o.createdAt?.toDate?.()
      return d && d >= from && o.paymentStatus === 'paid'
    })
  }, [orders, range])

  const totalSales = rangeOrders.reduce((s,o) => s+(o.total||0), 0)
  const totalOrders = rangeOrders.length
  const avgOrder = totalOrders ? Math.round(totalSales / totalOrders) : 0
  const totalTax = rangeOrders.reduce((s,o) => s+(o.tax||0), 0)

  // Daily chart
  const dailyData = useMemo(() => {
    const days = range === 'today' ? 1 : Number(range)
    return Array.from({ length: days }, (_, i) => {
      const day = subDays(new Date(), days - 1 - i)
      const dayLabel = format(day, days > 7 ? 'dd MMM' : 'EEE')
      const dayOrders = orders.filter(o => {
        const d = o.createdAt?.toDate?.()
        return d && d >= startOfDay(day) && d <= endOfDay(day) && o.paymentStatus === 'paid'
      })
      return { day: dayLabel, sales: dayOrders.reduce((s,o) => s+(o.total||0), 0), orders: dayOrders.length }
    })
  }, [orders, range])

  // Category sales
  const catData = useMemo(() => {
    const totals = {}
    rangeOrders.forEach(o => (o.items||[]).forEach(item => {
      totals[item.categoryId || 'other'] = (totals[item.categoryId || 'other'] || 0) + item.price * item.qty
    }))
    return Object.entries(totals).map(([id, value]) => {
      const cat = menuCategories.find(c => c.id === id)
      return { name: cat?.name || id, value }
    }).sort((a,b) => b.value - a.value).slice(0,8)
  }, [rangeOrders, menuCategories])

  // Payment method breakdown
  const payData = useMemo(() => {
    const m = {}
    rangeOrders.forEach(o => { m[o.paymentMethod||'cash'] = (m[o.paymentMethod||'cash']||0) + 1 })
    return Object.entries(m).map(([name,value]) => ({ name, value }))
  }, [rangeOrders])

  // Top items
  const topItems = useMemo(() => {
    const counts = {}
    rangeOrders.forEach(o => (o.items||[]).forEach(item => {
      counts[item.name] = (counts[item.name] || 0) + item.qty
    }))
    return Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,10).map(([name,qty])=>({ name, qty }))
  }, [rangeOrders])

  return (
    <div className="fade-in" style={{ display:'flex', flexDirection:'column', gap:20 }}>
      <div className="page-header">
        <div>
          <div className="page-title">Reports & Analytics</div>
          <div className="page-subtitle">Sales performance overview</div>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          {[['today','Today'],['7','7 Days'],['30','30 Days']].map(([v,l]) => (
            <button key={v} className={`dash-tab ${range===v?'active':''}`} onClick={() => setRange(v)}>{l}</button>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16 }}>
        <div className="stat-card"><div className="stat-icon">💰</div><div><div className="stat-label">Total Sales</div><div className="stat-value" style={{ fontSize:20 }}>Rs. {totalSales.toLocaleString()}</div></div></div>
        <div className="stat-card"><div className="stat-icon">🧾</div><div><div className="stat-label">Total Orders</div><div className="stat-value">{totalOrders}</div></div></div>
        <div className="stat-card"><div className="stat-icon">📈</div><div><div className="stat-label">Avg Order</div><div className="stat-value" style={{ fontSize:20 }}>Rs. {avgOrder.toLocaleString()}</div></div></div>
        <div className="stat-card"><div className="stat-icon">🏛️</div><div><div className="stat-label">Tax Collected</div><div className="stat-value" style={{ fontSize:20 }}>Rs. {totalTax.toLocaleString()}</div></div></div>
      </div>

      {/* Charts row 1 */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
        <div className="card">
          <div style={{ fontWeight:700, marginBottom:16 }}>Daily Sales</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" />
              <XAxis dataKey="day" tick={{ fill:'#60607a', fontSize:11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill:'#60607a', fontSize:11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background:'#1c1c28', border:'1px solid #2a2a3a', borderRadius:8, color:'#f0f0f0' }} formatter={v=>[`Rs. ${v.toLocaleString()}`, 'Sales']} />
              <Bar dataKey="sales" fill="#e63946" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div style={{ fontWeight:700, marginBottom:16 }}>Sales by Category</div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={catData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`} labelLine={false}>
                {catData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background:'#1c1c28', border:'1px solid #2a2a3a', borderRadius:8, color:'#f0f0f0' }} formatter={v=>[`Rs. ${v.toLocaleString()}`,'']} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts row 2 */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
        <div className="card">
          <div style={{ fontWeight:700, marginBottom:16 }}>Top 10 Items</div>
          {topItems.length === 0 ? (
            <div style={{ textAlign:'center', color:'var(--text-muted)', padding:20 }}>No data</div>
          ) : topItems.map((item, i) => (
            <div key={item.name} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
              <span style={{ width:20, height:20, background:'var(--accent)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:700, flexShrink:0 }}>{i+1}</span>
              <span style={{ flex:1, fontSize:13 }}>{item.name}</span>
              <div style={{ width:80, height:6, background:'var(--border)', borderRadius:3, overflow:'hidden' }}>
                <div style={{ height:'100%', background:`${COLORS[i%COLORS.length]}`, width:`${(item.qty/(topItems[0]?.qty||1))*100}%` }} />
              </div>
              <span style={{ fontSize:12, fontWeight:700, color:'var(--text-primary)', width:30, textAlign:'right' }}>{item.qty}</span>
            </div>
          ))}
        </div>

        <div className="card">
          <div style={{ fontWeight:700, marginBottom:16 }}>Payment Methods</div>
          {payData.length === 0 ? (
            <div style={{ textAlign:'center', color:'var(--text-muted)', padding:20 }}>No data</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={payData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`}>
                  {payData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background:'#1c1c28', border:'1px solid #2a2a3a', borderRadius:8, color:'#f0f0f0' }} />
                <Legend wrapperStyle={{ fontSize:12, color:'#a0a0b0' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  )
}
