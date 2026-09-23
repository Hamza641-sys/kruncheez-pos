import { useState, useRef } from 'react'
import { usePOS } from '../context/POSContext'
import { getCollection } from '../firebase/firestore'
import { where, orderBy } from '../firebase/firestore'
import { format, startOfDay, endOfDay, subDays } from 'date-fns'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { usePrint } from '../hooks/usePrint'
import { MdPrint, MdCalendarMonth } from 'react-icons/md'
import './EndOfDay.css'

export default function EndOfDay() {
  const { orders, menuCategories } = usePOS()
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0])
  const [expenses, setExpenses]     = useState([])
  const [loadingExp, setLoadingExp] = useState(false)
  const { printRef, handlePrint }   = usePrint()

  // Load expenses for selected date
  const loadExpenses = async (date) => {
    setLoadingExp(true)
    try {
      const start = startOfDay(new Date(date))
      const end   = endOfDay(new Date(date))
      const data  = await getCollection('expenses', orderBy('createdAt','desc'))
      setExpenses(data.filter(e => {
        const d = e.createdAt?.toDate?.() || new Date(e.date)
        return d >= start && d <= end
      }))
    } catch {}
    setLoadingExp(false)
  }

  const handleDateChange = (date) => {
    setReportDate(date)
    loadExpenses(date)
  }

  // Filter orders for selected date
  const dateOrders = orders.filter(o => {
    const d = o.createdAt?.toDate?.()
    if (!d) return false
    const sel = new Date(reportDate)
    return d.toDateString() === sel.toDateString()
  })

  const paidOrders   = dateOrders.filter(o => o.paymentStatus === 'paid')
  const totalSales   = paidOrders.reduce((s,o) => s + (o.total||0), 0)
  const totalTax     = paidOrders.reduce((s,o) => s + (o.tax||0), 0)
  const totalDiscount= paidOrders.reduce((s,o) => s + (o.discount||0), 0)
  const cashSales    = paidOrders.filter(o=>o.paymentMethod==='cash').reduce((s,o)=>s+(o.total||0),0)
  const cardSales    = paidOrders.filter(o=>o.paymentMethod==='card').reduce((s,o)=>s+(o.total||0),0)
  const onlineSales  = paidOrders.filter(o=>o.paymentMethod==='online').reduce((s,o)=>s+(o.total||0),0)
  const totalExpenses= expenses.reduce((s,e)=>s+(e.amount||0),0)
  const netProfit    = totalSales - totalExpenses

  const cancelledOrders  = dateOrders.filter(o=>o.status==='cancelled').length
  const deliveryOrders   = dateOrders.filter(o=>o.orderType==='delivery').length
  const dineInOrders     = dateOrders.filter(o=>o.orderType==='dine-in').length
  const takeawayOrders   = dateOrders.filter(o=>o.orderType==='takeaway').length
  const avgOrderValue    = paidOrders.length ? Math.round(totalSales / paidOrders.length) : 0

  // Top selling items
  const itemSales = {}
  paidOrders.forEach(o => (o.items||[]).forEach(item => {
    itemSales[item.name] = (itemSales[item.name]||0) + item.qty
  }))
  const topItems = Object.entries(itemSales).sort((a,b)=>b[1]-a[1]).slice(0,8)

  // Hourly data
  const hourlyData = Array.from({length:16},(_,i)=>{
    const h = 8 + i
    const hOrders = paidOrders.filter(o => {
      const d = o.createdAt?.toDate?.()
      return d && d.getHours() === h
    })
    return {
      hour: h<=12?`${h}AM`:`${h-12}PM`,
      sales: hOrders.reduce((s,o)=>s+(o.total||0),0),
      orders: hOrders.length,
    }
  })

  const isToday = new Date().toISOString().split('T')[0] === reportDate

  return (
    <div className="eod-page fade-in">
      <div className="page-header">
        <div>
          <div className="page-title">🌙 End of Day Report</div>
          <div className="page-subtitle">{isToday ? "Today's Summary" : `Report for ${format(new Date(reportDate),'dd MMM yyyy')}`}</div>
        </div>
        <div style={{ display:'flex', gap:10, alignItems:'center' }}>
          <input type="date" value={reportDate} onChange={e=>handleDateChange(e.target.value)}
            style={{ padding:'9px 14px', borderRadius:8 }} />
          <button className="btn-primary" style={{ display:'flex', alignItems:'center', gap:6 }}
            onClick={() => handlePrint('A4')}>
            <MdPrint /> Print Report
          </button>
        </div>
      </div>

      {/* Printable Report */}
      <div ref={printRef}>
        <div className="eod-report">

          {/* Report Header */}
          <div className="eod-report-header">
            <div className="eod-logo">🍔</div>
            <div className="eod-brand">THE KRUNCHEEZ</div>
            <div className="eod-report-title">END OF DAY REPORT</div>
            <div className="eod-report-date">{format(new Date(reportDate), 'EEEE, dd MMMM yyyy')}</div>
          </div>

          {/* Summary Stats */}
          <div className="eod-stats-grid">
            {[
              { label:'Total Sales',    val:`Rs. ${totalSales.toLocaleString()}`,    color:'var(--accent)',   big:true },
              { label:'Total Orders',   val:paidOrders.length,                        color:'var(--info)',     big:false },
              { label:'Avg Order',      val:`Rs. ${avgOrderValue.toLocaleString()}`,  color:'var(--warning)',  big:false },
              { label:'Total Tax',      val:`Rs. ${totalTax.toLocaleString()}`,       color:'var(--text-primary)', big:false },
              { label:'Total Discount', val:`Rs. ${totalDiscount.toLocaleString()}`,  color:'var(--success)', big:false },
              { label:'Net Profit',     val:`Rs. ${netProfit.toLocaleString()}`,      color: netProfit>=0?'var(--success)':'var(--danger)', big:true },
            ].map(s=>(
              <div key={s.label} className={`eod-stat-box ${s.big?'big':''}`}>
                <div className="eod-stat-label">{s.label}</div>
                <div className="eod-stat-val" style={{ color:s.color }}>{s.val}</div>
              </div>
            ))}
          </div>

          {/* Payment Breakdown */}
          <div className="eod-section">
            <div className="eod-section-title">💳 Payment Breakdown</div>
            <div className="eod-breakdown">
              {[
                { label:'💵 Cash', val:cashSales, pct: totalSales ? Math.round((cashSales/totalSales)*100) : 0 },
                { label:'💳 Card', val:cardSales, pct: totalSales ? Math.round((cardSales/totalSales)*100) : 0 },
                { label:'📱 Online', val:onlineSales, pct: totalSales ? Math.round((onlineSales/totalSales)*100) : 0 },
              ].map(p=>(
                <div key={p.label} className="eod-break-item">
                  <span>{p.label}</span>
                  <div className="eod-bar"><div className="eod-bar-fill" style={{ width:`${p.pct}%` }}/></div>
                  <span style={{ fontWeight:700, color:'var(--text-primary)' }}>Rs. {p.val.toLocaleString()} ({p.pct}%)</span>
                </div>
              ))}
            </div>
          </div>

          {/* Order Types */}
          <div className="eod-section">
            <div className="eod-section-title">🍽️ Order Types</div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
              {[
                { label:'Dine In',   val:dineInOrders,   icon:'🪑' },
                { label:'Takeaway',  val:takeawayOrders, icon:'🥡' },
                { label:'Delivery',  val:deliveryOrders, icon:'🚴' },
                { label:'Cancelled', val:cancelledOrders,icon:'❌' },
              ].map(t=>(
                <div key={t.label} style={{ textAlign:'center', padding:'14px', background:'var(--bg-hover)', borderRadius:10 }}>
                  <div style={{ fontSize:24 }}>{t.icon}</div>
                  <div style={{ fontSize:20, fontWeight:800, color:'var(--text-primary)', margin:'4px 0' }}>{t.val}</div>
                  <div style={{ fontSize:11, color:'var(--text-muted)' }}>{t.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Hourly Sales Chart */}
          <div className="eod-section">
            <div className="eod-section-title">📊 Hourly Sales</div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={hourlyData} margin={{ top:0, right:0, bottom:0, left:0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" />
                <XAxis dataKey="hour" tick={{ fill:'#60607a', fontSize:10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill:'#60607a', fontSize:10 }} axisLine={false} tickLine={false} width={50} />
                <Tooltip contentStyle={{ background:'#1c1c28', border:'1px solid #2a2a3a', borderRadius:8, color:'#f0f0f0' }}
                  formatter={v=>[`Rs. ${v.toLocaleString()}`,'Sales']} />
                <Bar dataKey="sales" fill="#e63946" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Top Items */}
          {topItems.length > 0 && (
            <div className="eod-section">
              <div className="eod-section-title">🔥 Top Selling Items</div>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {topItems.map(([name, qty], i) => (
                  <div key={name} style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <span style={{ width:22, height:22, background:'var(--accent)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, flexShrink:0 }}>{i+1}</span>
                    <span style={{ flex:1, fontSize:13, color:'var(--text-primary)' }}>{name}</span>
                    <div style={{ width:100, height:6, background:'var(--border)', borderRadius:3, overflow:'hidden' }}>
                      <div style={{ height:'100%', background:'var(--accent)', width:`${(qty/(topItems[0][1]||1))*100}%` }} />
                    </div>
                    <span style={{ fontSize:12, fontWeight:700, color:'var(--accent)', width:30, textAlign:'right' }}>{qty}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Expenses */}
          <div className="eod-section">
            <div className="eod-section-title">💸 Expenses ({expenses.length})</div>
            {expenses.length === 0 ? (
              <div style={{ color:'var(--text-muted)', fontSize:13 }}>No expenses recorded for this date</div>
            ) : (
              <>
                {expenses.map(e=>(
                  <div key={e.id} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid var(--border)', fontSize:13 }}>
                    <span>{e.title} <span style={{ fontSize:11, color:'var(--text-muted)' }}>({e.category})</span></span>
                    <span style={{ fontWeight:600, color:'var(--danger)' }}>Rs. {(e.amount||0).toLocaleString()}</span>
                  </div>
                ))}
                <div style={{ display:'flex', justifyContent:'space-between', fontWeight:700, fontSize:15, paddingTop:10 }}>
                  <span>Total Expenses</span>
                  <span style={{ color:'var(--danger)' }}>Rs. {totalExpenses.toLocaleString()}</span>
                </div>
              </>
            )}
          </div>

          {/* Net Summary */}
          <div className="eod-net-box">
            <div className="eod-net-row"><span>Gross Sales</span><span>Rs. {totalSales.toLocaleString()}</span></div>
            <div className="eod-net-row"><span>Total Expenses</span><span style={{ color:'var(--danger)' }}>- Rs. {totalExpenses.toLocaleString()}</span></div>
            <div className="eod-net-divider" />
            <div className="eod-net-row net">
              <span>NET PROFIT</span>
              <span style={{ color: netProfit>=0?'var(--success)':'var(--danger)' }}>
                Rs. {netProfit.toLocaleString()}
              </span>
            </div>
          </div>

          <div style={{ textAlign:'center', marginTop:20, fontSize:12, color:'var(--text-muted)' }}>
            Generated by Kruncheez POS • {format(new Date(), 'dd MMM yyyy, hh:mm a')}
          </div>
        </div>
      </div>
    </div>
  )
}
