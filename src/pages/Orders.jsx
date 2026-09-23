import { useState } from 'react'
import { usePOS } from '../context/POSContext'
import { updateOrderStatus, updateKitchenStatus, completePayment } from '../firebase/firestore'
import { usePrint } from '../hooks/usePrint'
import Receipt from '../components/Receipt'
import KitchenSlip from '../components/KitchenSlip'
import { sendWhatsAppReceipt } from '../utils/whatsapp'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { MdPrint, MdReceipt } from 'react-icons/md'
import './Orders.css'

const STATUSES = ['all','pending','preparing','ready','served','paid','cancelled']
const STATUS_COLORS = {
  pending:'badge-pending', preparing:'badge-preparing',
  ready:'badge-ready', paid:'badge-paid',
  cancelled:'badge-cancelled', served:'badge-served'
}

export default function Orders() {
  const { orders } = usePOS()
  const [filter, setFilter]       = useState('all')
  const [selected, setSelected]   = useState(null)
  const [paying, setPaying]       = useState(false)
  const [amountPaid, setAmountPaid] = useState('')
  const [payMethod, setPayMethod] = useState('cash')
  const [showReceipt, setShowReceipt] = useState(false)
  const [printOrder, setPrintOrder]   = useState(null)

  const { printRef: receiptRef, handlePrint: printReceipt } = usePrint()
  const { printRef: kitchenRef, handlePrint: printKitchen } = usePrint()

  const filtered = filter==='all' ? orders : orders.filter(o=>o.status===filter)
  const detail   = selected ? orders.find(o=>o.id===selected) : null
  const change   = Math.max(0, Number(amountPaid) - (detail?.total||0))

  const handleStatus = async (id, status) => {
    try { await updateOrderStatus(id, status); toast.success(`Order → ${status}`) }
    catch { toast.error('Failed') }
  }

  const handleKitchen = async (id, ks) => {
    try { await updateKitchenStatus(id, ks); toast.success(`Kitchen → ${ks}`) }
    catch { toast.error('Failed') }
  }

  const handlePay = async () => {
    if (!detail) return
    if (payMethod==='cash' && Number(amountPaid)<detail.total) { toast.error('Insufficient amount'); return }
    setPaying(true)
    try {
      await completePayment(detail.id, { method:payMethod, amountPaid:Number(amountPaid)||detail.total, change })
      toast.success('✅ Payment complete!')
      // Show receipt
      setPrintOrder({ ...detail, paymentMethod:payMethod, amountPaid:Number(amountPaid)||detail.total, change })
      setShowReceipt(true)
      setSelected(null)
      setAmountPaid('')
    } catch { toast.error('Failed') }
    setPaying(false)
  }

  const openPrintReceipt = (order) => {
    setPrintOrder(order)
    setShowReceipt(true)
  }

  return (
    <div className="orders-page fade-in">
      <div className="page-header">
        <div>
          <div className="page-title">Orders</div>
          <div className="page-subtitle">Manage all restaurant orders</div>
        </div>
      </div>

      {/* Filters */}
      <div className="orders-filters">
        {STATUSES.map(s => (
          <button key={s} className={`dash-tab ${filter===s?'active':''}`} onClick={()=>setFilter(s)} style={{textTransform:'capitalize'}}>
            {s} {s!=='all' && `(${orders.filter(o=>o.status===s).length})`}
          </button>
        ))}
      </div>

      <div className="orders-layout">
        {/* Orders Table */}
        <div className="card" style={{flex:1,overflow:'auto'}}>
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th><th>Customer</th><th>Type</th><th>Table</th>
                <th>Items</th><th>Total</th><th>Status</th><th>Kitchen</th>
                <th>Time</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length===0 ? (
                <tr><td colSpan={10} style={{textAlign:'center',color:'var(--text-muted)',padding:40}}>No orders found</td></tr>
              ) : filtered.map(o => (
                <tr key={o.id} style={{cursor:'pointer'}} onClick={()=>setSelected(o.id)}>
                  <td style={{fontWeight:700,color:'var(--text-primary)'}}>
                    #{String(o.orderNumber||o.id.slice(0,4)).padStart(4,'0')}
                  </td>
                  <td>
                    <div style={{fontWeight:600,color:'var(--text-primary)',fontSize:13}}>{o.customerName||'Walk-in'}</div>
                    {o.customerPhone && <div style={{fontSize:11,color:'var(--text-muted)'}}>{o.customerPhone}</div>}
                  </td>
                  <td style={{textTransform:'capitalize'}}>{o.orderType||'dine-in'}</td>
                  <td>{o.tableNumber?`T${o.tableNumber}`:'—'}</td>
                  <td>{(o.items||[]).reduce((s,i)=>s+i.qty,0)}</td>
                  <td style={{fontWeight:600,color:'var(--text-primary)'}}>Rs. {(o.total||0).toLocaleString()}</td>
                  <td><span className={`badge ${STATUS_COLORS[o.status]||'badge-pending'}`}>{o.status}</span></td>
                  <td><span className={`badge ${STATUS_COLORS[o.kitchenStatus]||'badge-pending'}`}>{o.kitchenStatus||'queued'}</span></td>
                  <td style={{whiteSpace:'nowrap'}}>{o.createdAt?.toDate?format(o.createdAt.toDate(),'hh:mm a'):'—'}</td>
                  <td onClick={e=>e.stopPropagation()}>
                    <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>
                      {o.status==='pending'&&(
                        <button className="btn-outline" style={{padding:'3px 8px',fontSize:11}}
                          onClick={()=>{handleStatus(o.id,'preparing');handleKitchen(o.id,'preparing')}}>Prepare</button>
                      )}
                      {o.status==='preparing'&&(
                        <button className="btn-outline" style={{padding:'3px 8px',fontSize:11}}
                          onClick={()=>{handleStatus(o.id,'ready');handleKitchen(o.id,'ready')}}>Ready</button>
                      )}
                      {o.status==='ready'&&(
                        <button className="btn-outline" style={{padding:'3px 8px',fontSize:11}}
                          onClick={()=>handleStatus(o.id,'served')}>Served</button>
                      )}
                      {['pending','preparing','ready','served'].includes(o.status)&&(
                        <button className="btn-primary" style={{padding:'3px 8px',fontSize:11}}
                          onClick={()=>setSelected(o.id)}>Pay</button>
                      )}
                      {/* Print button always visible */}
                      <button style={{padding:'3px 8px',fontSize:11,background:'rgba(76,201,240,0.1)',color:'#4cc9f0',border:'1px solid rgba(76,201,240,0.2)',borderRadius:6,display:'flex',alignItems:'center',gap:3}}
                        onClick={()=>openPrintReceipt(o)}>
                        <MdPrint size={12}/> Print
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Detail Panel */}
        {detail && (
          <div className="card orders-detail fade-in">
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
              <h3 style={{fontWeight:700}}>Order #{String(detail.orderNumber||detail.id.slice(0,4)).padStart(4,'0')}</h3>
              <button style={{background:'none',color:'var(--text-muted)',fontSize:20}} onClick={()=>setSelected(null)}>✕</button>
            </div>

            <div className="orders-detail-info">
              <div><span>Customer</span><span style={{fontWeight:600}}>{detail.customerName||'Walk-in'}</span></div>
              <div><span>Phone</span><span>{detail.customerPhone||'—'}</span></div>
              {detail.customerAddress&&<div><span>Address</span><span>{detail.customerAddress}</span></div>}
              <div><span>Type</span><span style={{textTransform:'capitalize'}}>{detail.orderType}</span></div>
              <div><span>Table</span><span>{detail.tableNumber?`Table ${detail.tableNumber}`:'—'}</span></div>
              <div><span>Staff</span><span>{detail.staffName||'—'}</span></div>
              <div><span>Time</span><span>{detail.createdAt?.toDate?format(detail.createdAt.toDate(),'dd MMM, hh:mm a'):'—'}</span></div>
            </div>

            <div style={{margin:'14px 0',borderTop:'1px solid var(--border)',paddingTop:14}}>
              {(detail.items||[]).map((item,i)=>(
                <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'6px 0',borderBottom:'1px solid var(--border)',fontSize:13}}>
                  <span>{item.name} × {item.qty}</span>
                  <span style={{color:'var(--text-primary)',fontWeight:600}}>Rs. {(item.price*item.qty).toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div style={{fontSize:13,display:'flex',flexDirection:'column',gap:4}}>
              <div style={{display:'flex',justifyContent:'space-between'}}><span>Subtotal</span><span>Rs. {(detail.subtotal||0).toLocaleString()}</span></div>
              <div style={{display:'flex',justifyContent:'space-between'}}><span>Tax (5%)</span><span>Rs. {(detail.tax||0).toLocaleString()}</span></div>
              {detail.discount>0&&<div style={{display:'flex',justifyContent:'space-between',color:'var(--success)'}}><span>Discount</span><span>- Rs. {detail.discount.toLocaleString()}</span></div>}
              <div style={{display:'flex',justifyContent:'space-between',fontWeight:700,fontSize:16,paddingTop:8,borderTop:'1px solid var(--border)'}}>
                <span>Total</span><span style={{color:'var(--accent)'}}>Rs. {(detail.total||0).toLocaleString()}</span>
              </div>
            </div>

            {/* Print Buttons */}
            <div style={{display:'flex',gap:8,marginTop:14}}>
              <button style={{flex:1,padding:'8px',borderRadius:8,fontSize:12,fontWeight:600,background:'rgba(76,201,240,0.1)',color:'#4cc9f0',border:'1px solid rgba(76,201,240,0.2)',display:'flex',alignItems:'center',justifyContent:'center',gap:4}}
                onClick={()=>openPrintReceipt(detail)}>
                <MdReceipt /> Receipt
              </button>
              <button style={{flex:1,padding:'8px',borderRadius:8,fontSize:12,fontWeight:600,background:'rgba(244,162,97,0.1)',color:'#f4a261',border:'1px solid rgba(244,162,97,0.2)',display:'flex',alignItems:'center',justifyContent:'center',gap:4}}
                onClick={()=>{setPrintOrder(detail);setTimeout(()=>printKitchen('58mm'),100)}}>
                <MdPrint /> Kitchen
              </button>
            </div>

            {/* Payment */}
            {detail.paymentStatus!=='paid' && (
              <div style={{marginTop:14,display:'flex',flexDirection:'column',gap:10}}>
                <div style={{display:'flex',gap:8}}>
                  {['cash','card','online'].map(m=>(
                    <button key={m} onClick={()=>setPayMethod(m)} style={{flex:1,padding:'8px',borderRadius:8,fontWeight:600,fontSize:12,background:payMethod===m?'var(--accent)':'var(--bg-hover)',color:payMethod===m?'#fff':'var(--text-secondary)',border:payMethod===m?'none':'1px solid var(--border)',textTransform:'capitalize'}}>{m}</button>
                  ))}
                </div>
                {payMethod==='cash'&&(
                  <input type="number" placeholder={`Amount (min Rs. ${detail.total})`} value={amountPaid} onChange={e=>setAmountPaid(e.target.value)} />
                )}
                {amountPaid&&Number(amountPaid)>=detail.total&&(
                  <div style={{padding:'8px 12px',background:'rgba(45,198,83,0.1)',borderRadius:8,color:'#2dc653',fontSize:13,fontWeight:600}}>
                    💵 Change: Rs. {change.toLocaleString()}
                  </div>
                )}
                <button className="btn-primary" style={{width:'100%',padding:12}} onClick={handlePay}
                  disabled={paying||(payMethod==='cash'&&Number(amountPaid)<detail.total)}>
                  {paying?'Processing...':'💰 Collect Payment'}
                </button>
              </div>
            )}

            {detail.paymentStatus==='paid'&&(
              <div style={{marginTop:14,padding:'10px 14px',background:'rgba(45,198,83,0.1)',borderRadius:8,color:'#2dc653',fontWeight:600,textAlign:'center'}}>
                ✓ Paid via {detail.paymentMethod}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ══ RECEIPT PRINT MODAL ══════════════════ */}
      {showReceipt && printOrder && (
        <div className="modal-overlay" onClick={()=>setShowReceipt(false)}>
          <div className="modal-box fade-in" style={{maxWidth:380}} onClick={e=>e.stopPropagation()}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
              <h3 style={{fontWeight:700}}>🧾 Print Receipt</h3>
              <button style={{background:'none',color:'var(--text-muted)',fontSize:20}} onClick={()=>setShowReceipt(false)}>✕</button>
            </div>

            <div style={{background:'#fff',borderRadius:8,padding:8,marginBottom:14,maxHeight:420,overflowY:'auto'}}>
              <div ref={receiptRef}>
                <Receipt order={printOrder} />
              </div>
            </div>

            <div style={{display:'flex',gap:10}}>
              <button className="btn-primary" style={{flex:1,padding:12,display:'flex',alignItems:'center',justifyContent:'center',gap:6}}
                onClick={()=>printReceipt('80mm')}>
                <MdPrint /> 80mm
              </button>
              <button className="btn-outline" style={{flex:1,padding:12,display:'flex',alignItems:'center',justifyContent:'center',gap:6}}
                onClick={()=>printReceipt('58mm')}>
                <MdPrint /> 58mm
              </button>
            </div>
            {printOrder?.customerPhone && (
              <button style={{width:'100%',padding:11,marginTop:8,borderRadius:8,fontWeight:600,fontSize:13,background:'#25D366',color:'#fff',border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:8}}
                onClick={()=>sendWhatsAppReceipt(printOrder)}>
                📲 Send via WhatsApp
              </button>
            )}

            {/* Hidden kitchen slip */}
            <div style={{display:'none'}}>
              <div ref={kitchenRef}><KitchenSlip order={printOrder} /></div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
