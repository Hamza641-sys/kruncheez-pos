import { useState } from 'react'
import { usePOS } from '../context/POSContext'
import { useAuth } from '../context/AuthContext'
import { updateDocument, addDocument, updateDocument as ud } from '../firebase/firestore'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { MdSearch, MdUndo, MdBlock } from 'react-icons/md'
import './Refunds.css'

const REFUND_REASONS = [
  'Wrong order delivered',
  'Food quality issue',
  'Customer changed mind',
  'Duplicate order',
  'Long wait time',
  'Item unavailable',
  'Other',
]

export default function Refunds() {
  const { orders }      = usePOS()
  const { userProfile } = useAuth()

  const [search, setSearch]           = useState('')
  const [selected, setSelected]       = useState(null)
  const [refundType, setRefundType]   = useState('full')   // full | partial | void
  const [reason, setReason]           = useState('')
  const [partialAmt, setPartialAmt]   = useState('')
  const [selectedItems, setSelectedItems] = useState([])
  const [processing, setProcessing]   = useState(false)
  const [showModal, setShowModal]     = useState(false)
  const [refunds, setRefunds]         = useState([])

  // Refundable orders = paid orders
  const refundable = orders.filter(o => {
    const match = !search || String(o.orderNumber||'').includes(search) ||
      (o.customerName||'').toLowerCase().includes(search.toLowerCase()) ||
      (o.customerPhone||'').includes(search)
    return (o.paymentStatus === 'paid' || o.status === 'pending') && match
  })

  const openRefund = (order) => {
    setSelected(order)
    setRefundType('full')
    setReason('')
    setPartialAmt('')
    setSelectedItems([])
    setShowModal(true)
  }

  const toggleItem = (itemId) => {
    setSelectedItems(prev =>
      prev.includes(itemId) ? prev.filter(i => i !== itemId) : [...prev, itemId]
    )
  }

  const partialItemsTotal = (selected?.items || [])
    .filter(item => selectedItems.includes(item.itemId || item.name))
    .reduce((s, item) => s + item.price * item.qty, 0)

  const refundAmount = refundType === 'full'
    ? selected?.total || 0
    : refundType === 'items'
    ? partialItemsTotal
    : Number(partialAmt) || 0

  const handleProcess = async () => {
    if (!selected) return
    if (!reason) { toast.error('Select a reason'); return }
    if (refundType === 'partial' && (!partialAmt || Number(partialAmt) <= 0)) {
      toast.error('Enter refund amount'); return
    }
    if (refundType === 'items' && selectedItems.length === 0) {
      toast.error('Select items to refund'); return
    }

    setProcessing(true)
    try {
      if (refundType === 'void') {
        // Void — cancel unpaid order
        await updateDocument('orders', selected.id, {
          status: 'cancelled',
          voidedBy: userProfile?.name || 'Staff',
          voidReason: reason,
          voidedAt: new Date(),
        })
        toast.success('Order voided!')
      } else {
        // Refund
        await updateDocument('orders', selected.id, {
          paymentStatus: 'refunded',
          refundAmount,
          refundType,
          refundReason: reason,
          refundedBy: userProfile?.name || 'Staff',
          refundedAt: new Date(),
          refundedItems: refundType === 'items' ? selectedItems : [],
        })

        // Log refund record
        await addDocument('refunds', {
          orderId: selected.id,
          orderNumber: selected.orderNumber,
          customerName: selected.customerName || 'Walk-in',
          customerPhone: selected.customerPhone || '',
          originalAmount: selected.total,
          refundAmount,
          refundType,
          reason,
          processedBy: userProfile?.name || 'Staff',
          paymentMethod: selected.paymentMethod || 'cash',
        })
        toast.success(`✅ Refund of Rs. ${refundAmount.toLocaleString()} processed!`)
      }
      setShowModal(false)
      setSelected(null)
    } catch (err) {
      toast.error('Failed: ' + err.message)
    }
    setProcessing(false)
  }

  // Refund history from orders
  const refundHistory = orders.filter(o =>
    o.paymentStatus === 'refunded' || o.status === 'cancelled'
  ).slice(0, 20)

  return (
    <div className="refunds-page fade-in">
      <div className="page-header">
        <div>
          <div className="page-title">🔄 Refunds & Voids</div>
          <div className="page-subtitle">Process refunds and void orders</div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14 }}>
        {[
          { label:'Total Refunds',    val: orders.filter(o=>o.paymentStatus==='refunded').length,   icon:'🔄', color:'var(--warning)' },
          { label:'Voided Orders',    val: orders.filter(o=>o.status==='cancelled').length,          icon:'❌', color:'var(--danger)' },
          { label:'Refund Amount',    val:`Rs. ${orders.filter(o=>o.paymentStatus==='refunded').reduce((s,o)=>s+(o.refundAmount||0),0).toLocaleString()}`, icon:'💸', color:'var(--danger)' },
          { label:'Pending Orders',   val: orders.filter(o=>o.status==='pending').length,            icon:'⏳', color:'var(--info)' },
        ].map(s=>(
          <div key={s.label} className="stat-card">
            <div className="stat-icon">{s.icon}</div>
            <div><div className="stat-label">{s.label}</div><div className="stat-value" style={{fontSize:18,color:s.color}}>{s.val}</div></div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div style={{ position:'relative', maxWidth:400 }}>
        <MdSearch style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)', fontSize:18 }} />
        <input value={search} onChange={e=>setSearch(e.target.value)}
          placeholder="Search by order #, customer name or phone..."
          style={{ paddingLeft:38 }} />
      </div>

      {/* Orders Table */}
      <div className="card">
        <table className="data-table">
          <thead>
            <tr><th>#</th><th>Customer</th><th>Items</th><th>Total</th><th>Payment</th><th>Status</th><th>Time</th><th>Action</th></tr>
          </thead>
          <tbody>
            {refundable.length === 0 ? (
              <tr><td colSpan={8} style={{textAlign:'center',color:'var(--text-muted)',padding:40}}>No orders found</td></tr>
            ) : refundable.map(o => (
              <tr key={o.id}>
                <td style={{ fontWeight:700, color:'var(--accent)' }}>#{String(o.orderNumber||o.id.slice(0,4)).padStart(4,'0')}</td>
                <td>
                  <div style={{ fontWeight:600, color:'var(--text-primary)' }}>{o.customerName||'Walk-in'}</div>
                  {o.customerPhone && <div style={{ fontSize:11, color:'var(--text-muted)' }}>{o.customerPhone}</div>}
                </td>
                <td>{(o.items||[]).map(i=>i.name).slice(0,2).join(', ')}{o.items?.length>2?'...':''}</td>
                <td style={{ fontWeight:600 }}>Rs. {(o.total||0).toLocaleString()}</td>
                <td style={{ textTransform:'capitalize' }}>{o.paymentMethod||'—'}</td>
                <td>
                  <span className={`badge ${
                    o.paymentStatus==='refunded' ? 'badge-cancelled' :
                    o.status==='cancelled' ? 'badge-cancelled' :
                    o.paymentStatus==='paid' ? 'badge-paid' : 'badge-pending'
                  }`}>{o.paymentStatus==='refunded'?'Refunded':o.status==='cancelled'?'Voided':o.status}</span>
                </td>
                <td>{o.createdAt?.toDate?format(o.createdAt.toDate(),'dd MMM hh:mm a'):'—'}</td>
                <td>
                  {o.paymentStatus !== 'refunded' && o.status !== 'cancelled' && (
                    <button className="btn-primary" style={{ padding:'5px 14px', fontSize:12 }}
                      onClick={() => openRefund(o)}>
                      {o.paymentStatus==='paid' ? <><MdUndo size={13}/> Refund</> : <><MdBlock size={13}/> Void</>}
                    </button>
                  )}
                  {(o.paymentStatus==='refunded'||o.status==='cancelled') && (
                    <span style={{ fontSize:12, color:'var(--text-muted)' }}>
                      {o.paymentStatus==='refunded'?`Rs. ${(o.refundAmount||0).toLocaleString()} refunded`:'Voided'}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Refund/Void Modal */}
      {showModal && selected && (
        <div className="modal-overlay" onClick={()=>setShowModal(false)}>
          <div className="modal-box fade-in" style={{ maxWidth:520 }} onClick={e=>e.stopPropagation()}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
              <h3 style={{ fontWeight:700 }}>
                {selected.paymentStatus==='paid' ? '🔄 Process Refund' : '❌ Void Order'}
                {' '}#{String(selected.orderNumber||selected.id.slice(0,4)).padStart(4,'0')}
              </h3>
              <button style={{ background:'none', color:'var(--text-muted)', fontSize:20 }} onClick={()=>setShowModal(false)}>✕</button>
            </div>

            {/* Order summary */}
            <div style={{ padding:'10px 14px', background:'var(--bg-hover)', borderRadius:8, marginBottom:16, fontSize:13 }}>
              <div style={{ fontWeight:600, marginBottom:6 }}>{selected.customerName||'Walk-in'} — Rs. {(selected.total||0).toLocaleString()}</div>
              {(selected.items||[]).map((item,i)=>(
                <div key={i} style={{ color:'var(--text-secondary)', fontSize:12 }}>• {item.name} × {item.qty} — Rs. {(item.price*item.qty).toLocaleString()}</div>
              ))}
            </div>

            {selected.paymentStatus === 'paid' && (
              <>
                {/* Refund type */}
                <div style={{ display:'flex', gap:8, marginBottom:16 }}>
                  {[['full','Full Refund'],['items','By Items'],['partial','Custom Amount']].map(([v,l])=>(
                    <button key={v} onClick={()=>setRefundType(v)} style={{ flex:1, padding:'9px', borderRadius:8, fontWeight:600, fontSize:12, background:refundType===v?'var(--accent)':'var(--bg-hover)', color:refundType===v?'#fff':'var(--text-secondary)', border:refundType===v?'none':'1px solid var(--border)' }}>{l}</button>
                  ))}
                </div>

                {/* By items selector */}
                {refundType === 'items' && (
                  <div style={{ marginBottom:16, display:'flex', flexDirection:'column', gap:6 }}>
                    <label style={{ fontSize:12, color:'var(--text-muted)' }}>Select items to refund:</label>
                    {(selected.items||[]).map((item,i) => {
                      const id = item.itemId || item.name
                      return (
                        <label key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 12px', background:'var(--bg-hover)', borderRadius:8, cursor:'pointer', border:`1px solid ${selectedItems.includes(id)?'var(--accent)':'var(--border)'}` }}>
                          <input type="checkbox" checked={selectedItems.includes(id)} onChange={()=>toggleItem(id)} style={{ width:'auto' }} />
                          <span style={{ flex:1, fontSize:13 }}>{item.name} × {item.qty}</span>
                          <span style={{ fontWeight:600, color:'var(--accent)' }}>Rs. {(item.price*item.qty).toLocaleString()}</span>
                        </label>
                      )
                    })}
                  </div>
                )}

                {/* Custom amount */}
                {refundType === 'partial' && (
                  <div style={{ marginBottom:16 }}>
                    <label style={{ fontSize:12, color:'var(--text-muted)', display:'block', marginBottom:6 }}>Refund Amount (Rs.)</label>
                    <input type="number" value={partialAmt} onChange={e=>setPartialAmt(e.target.value)} placeholder={`Max: Rs. ${selected.total}`} />
                  </div>
                )}
              </>
            )}

            {/* Reason */}
            <div style={{ marginBottom:16 }}>
              <label style={{ fontSize:12, color:'var(--text-muted)', display:'block', marginBottom:6 }}>Reason *</label>
              <select value={reason} onChange={e=>setReason(e.target.value)}>
                <option value="">-- Select reason --</option>
                {REFUND_REASONS.map(r=><option key={r}>{r}</option>)}
              </select>
            </div>

            {/* Refund amount preview */}
            {refundAmount > 0 && (
              <div style={{ padding:'10px 14px', background:'rgba(230,57,70,0.08)', border:'1px solid rgba(230,57,70,0.2)', borderRadius:8, marginBottom:16, fontSize:14, fontWeight:700, color:'var(--accent)', textAlign:'center' }}>
                {refundType==='void' ? '❌ Void Order' : `🔄 Refund: Rs. ${refundAmount.toLocaleString()}`}
              </div>
            )}

            <button className="btn-primary" style={{ width:'100%', padding:13, background: refundType==='void'?'var(--danger)':'var(--accent)' }}
              onClick={handleProcess} disabled={processing || !reason}>
              {processing ? 'Processing...' : selected.paymentStatus==='paid' ? `Process Rs. ${refundAmount.toLocaleString()} Refund` : 'Void Order'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
