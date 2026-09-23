import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { usePOS } from '../context/POSContext'
import { addDocument, getCollection, updateDocument } from '../firebase/firestore'
import { where, orderBy } from '../firebase/firestore'
import { format, differenceInMinutes } from 'date-fns'
import toast from 'react-hot-toast'
import { MdAccessTime, MdAttachMoney, MdPerson, MdLock, MdLockOpen } from 'react-icons/md'
import './Shifts.css'

export default function Shifts() {
  const { userProfile } = useAuth()
  const { orders }      = usePOS()

  const [activeShift, setActiveShift]   = useState(null)
  const [pastShifts,  setPastShifts]    = useState([])
  const [loading,     setLoading]       = useState(true)
  const [openingCash, setOpeningCash]   = useState('')
  const [closingCash, setClosingCash]   = useState('')
  const [handoverNote,setHandoverNote]  = useState('')
  const [saving,      setSaving]        = useState(false)
  const [showClose,   setShowClose]     = useState(false)

  useEffect(() => { loadShifts() }, [])

  const loadShifts = async () => {
    setLoading(true)
    try {
      const all = await getCollection('shifts', orderBy('openedAt', 'desc'))
      const active = all.find(s => s.status === 'open')
      setActiveShift(active || null)
      setPastShifts(all.filter(s => s.status === 'closed').slice(0, 20))
    } catch { toast.error('Failed to load shifts') }
    setLoading(false)
  }

  // Shift orders
  const shiftOrders = activeShift
    ? orders.filter(o => {
        const d = o.createdAt?.toDate?.()
        const from = activeShift.openedAt?.toDate ? activeShift.openedAt.toDate() : new Date(activeShift.openedAt)
        return d && d >= from && o.paymentStatus === 'paid'
      })
    : []

  const shiftSales    = shiftOrders.reduce((s, o) => s + (o.total || 0), 0)
  const shiftCash     = shiftOrders.filter(o => o.paymentMethod === 'cash').reduce((s, o) => s + (o.total || 0), 0)
  const shiftCard     = shiftOrders.filter(o => o.paymentMethod === 'card').reduce((s, o) => s + (o.total || 0), 0)
  const shiftOnline   = shiftOrders.filter(o => o.paymentMethod === 'online').reduce((s, o) => s + (o.total || 0), 0)
  const expectedCash  = (Number(activeShift?.openingCash) || 0) + shiftCash
  const cashDiff      = Number(closingCash) - expectedCash

  const handleOpenShift = async () => {
    if (!openingCash) { toast.error('Enter opening cash amount'); return }
    setSaving(true)
    try {
      const ref = await addDocument('shifts', {
        openedBy:     userProfile?.name || 'Staff',
        openedByUid:  userProfile?.uid  || '',
        openingCash:  Number(openingCash),
        openedAt:     new Date(),
        status:       'open',
      })
      toast.success('✅ Shift opened!')
      setOpeningCash('')
      loadShifts()
    } catch { toast.error('Failed') }
    setSaving(false)
  }

  const handleCloseShift = async () => {
    if (!closingCash) { toast.error('Enter closing cash amount'); return }
    if (!activeShift) return
    setSaving(true)
    try {
      await updateDocument('shifts', activeShift.id, {
        closedBy:      userProfile?.name || 'Staff',
        closedByUid:   userProfile?.uid  || '',
        closingCash:   Number(closingCash),
        expectedCash,
        cashDifference: cashDiff,
        totalSales:    shiftSales,
        totalOrders:   shiftOrders.length,
        cashSales:     shiftCash,
        cardSales:     shiftCard,
        onlineSales:   shiftOnline,
        handoverNote,
        closedAt:      new Date(),
        status:        'closed',
      })
      toast.success('🔒 Shift closed!')
      setShowClose(false)
      setClosingCash('')
      setHandoverNote('')
      loadShifts()
    } catch { toast.error('Failed') }
    setSaving(false)
  }

  const shiftDuration = activeShift?.openedAt
    ? differenceInMinutes(new Date(), activeShift.openedAt?.toDate ? activeShift.openedAt.toDate() : new Date(activeShift.openedAt))
    : 0
  const durationStr = `${Math.floor(shiftDuration / 60)}h ${shiftDuration % 60}m`

  return (
    <div className="shifts-page fade-in">
      <div className="page-header">
        <div>
          <div className="page-title">🕐 Shift Management</div>
          <div className="page-subtitle">Track staff shifts and cash flow</div>
        </div>
        {activeShift && (
          <button className="btn-primary" style={{ background: 'var(--danger)' }} onClick={() => setShowClose(true)}>
            <MdLock /> Close Shift
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" /></div>
      ) : !activeShift ? (
        /* ── Open Shift ── */
        <div className="shift-open-card card fade-in">
          <div className="shift-open-icon">🔓</div>
          <h2 className="shift-open-title">No Active Shift</h2>
          <p className="shift-open-sub">Open a new shift to start taking orders and tracking sales.</p>
          <div className="shift-open-form">
            <div>
              <label>Opening Cash in Register (Rs.)</label>
              <input type="number" value={openingCash} onChange={e => setOpeningCash(e.target.value)}
                placeholder="e.g. 5000" style={{ fontSize: 18, padding: '12px', textAlign: 'center' }} autoFocus />
            </div>
            <button className="btn-primary" style={{ padding: '14px', fontSize: 15, width: '100%' }}
              onClick={handleOpenShift} disabled={saving}>
              <MdLockOpen /> {saving ? 'Opening...' : 'Open Shift'}
            </button>
          </div>
        </div>
      ) : (
        /* ── Active Shift Dashboard ── */
        <div className="shift-active fade-in">
          {/* Shift header */}
          <div className="card shift-info-card">
            <div className="shift-info-row">
              <div className="shift-info-item">
                <MdPerson size={20} style={{ color: 'var(--accent)' }} />
                <div>
                  <div className="shift-info-label">Opened By</div>
                  <div className="shift-info-val">{activeShift.openedBy}</div>
                </div>
              </div>
              <div className="shift-info-item">
                <MdAccessTime size={20} style={{ color: 'var(--info)' }} />
                <div>
                  <div className="shift-info-label">Started At</div>
                  <div className="shift-info-val">
                    {activeShift.openedAt?.toDate ? format(activeShift.openedAt.toDate(), 'hh:mm a') : '—'}
                  </div>
                </div>
              </div>
              <div className="shift-info-item">
                <MdAccessTime size={20} style={{ color: 'var(--warning)' }} />
                <div>
                  <div className="shift-info-label">Duration</div>
                  <div className="shift-info-val">{durationStr}</div>
                </div>
              </div>
              <div className="shift-info-item">
                <MdAttachMoney size={20} style={{ color: 'var(--success)' }} />
                <div>
                  <div className="shift-info-label">Opening Cash</div>
                  <div className="shift-info-val">Rs. {(activeShift.openingCash || 0).toLocaleString()}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Live Stats */}
          <div className="shift-stats">
            {[
              { label: 'Total Sales',    val: `Rs. ${shiftSales.toLocaleString()}`,  color: 'var(--accent)',   icon: '💰' },
              { label: 'Total Orders',   val: shiftOrders.length,                     color: 'var(--info)',     icon: '🧾' },
              { label: 'Cash Sales',     val: `Rs. ${shiftCash.toLocaleString()}`,   color: 'var(--success)',  icon: '💵' },
              { label: 'Card Sales',     val: `Rs. ${shiftCard.toLocaleString()}`,   color: 'var(--warning)',  icon: '💳' },
              { label: 'Online Sales',   val: `Rs. ${shiftOnline.toLocaleString()}`, color: 'var(--info)',     icon: '📱' },
              { label: 'Expected Cash',  val: `Rs. ${expectedCash.toLocaleString()}`,color: 'var(--text-primary)', icon: '🏦' },
            ].map(s => (
              <div key={s.label} className="stat-card">
                <div className="stat-icon">{s.icon}</div>
                <div>
                  <div className="stat-label">{s.label}</div>
                  <div className="stat-value" style={{ fontSize: 18, color: s.color }}>{s.val}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Orders table */}
          <div className="card">
            <div style={{ fontWeight: 700, marginBottom: 14 }}>Orders This Shift ({shiftOrders.length})</div>
            <table className="data-table">
              <thead>
                <tr><th>#</th><th>Customer</th><th>Items</th><th>Total</th><th>Payment</th><th>Time</th></tr>
              </thead>
              <tbody>
                {shiftOrders.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 30 }}>No paid orders yet this shift</td></tr>
                ) : shiftOrders.map(o => (
                  <tr key={o.id}>
                    <td style={{ fontWeight: 700, color: 'var(--accent)' }}>#{String(o.orderNumber || o.id.slice(0,4)).padStart(4,'0')}</td>
                    <td>{o.customerName || 'Walk-in'}</td>
                    <td>{(o.items||[]).reduce((s,i)=>s+i.qty,0)}</td>
                    <td style={{ fontWeight: 600 }}>Rs. {(o.total||0).toLocaleString()}</td>
                    <td style={{ textTransform: 'capitalize' }}>{o.paymentMethod || 'cash'}</td>
                    <td>{o.createdAt?.toDate ? format(o.createdAt.toDate(), 'hh:mm a') : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Past Shifts ── */}
      {pastShifts.length > 0 && (
        <div className="card">
          <div style={{ fontWeight: 700, marginBottom: 14 }}>Past Shifts</div>
          <table className="data-table">
            <thead>
              <tr><th>Date</th><th>Opened By</th><th>Duration</th><th>Orders</th><th>Total Sales</th><th>Opening Cash</th><th>Closing Cash</th><th>Difference</th></tr>
            </thead>
            <tbody>
              {pastShifts.map(s => {
                const diff = (s.cashDifference || 0)
                return (
                  <tr key={s.id}>
                    <td>{s.openedAt?.toDate ? format(s.openedAt.toDate(), 'dd MMM, hh:mm a') : '—'}</td>
                    <td style={{ fontWeight: 600 }}>{s.openedBy}</td>
                    <td>{s.openedAt?.toDate && s.closedAt?.toDate
                      ? `${Math.floor(differenceInMinutes(s.closedAt.toDate(), s.openedAt.toDate()) / 60)}h ${differenceInMinutes(s.closedAt.toDate(), s.openedAt.toDate()) % 60}m`
                      : '—'}</td>
                    <td>{s.totalOrders || 0}</td>
                    <td style={{ fontWeight: 600, color: 'var(--accent)' }}>Rs. {(s.totalSales||0).toLocaleString()}</td>
                    <td>Rs. {(s.openingCash||0).toLocaleString()}</td>
                    <td>Rs. {(s.closingCash||0).toLocaleString()}</td>
                    <td style={{ fontWeight: 700, color: diff >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                      {diff >= 0 ? '+' : ''}Rs. {diff.toLocaleString()}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Close Shift Modal ── */}
      {showClose && activeShift && (
        <div className="modal-overlay" onClick={() => setShowClose(false)}>
          <div className="modal-box fade-in" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
              <h3 style={{ fontWeight:700 }}>🔒 Close Shift</h3>
              <button style={{ background:'none', color:'var(--text-muted)', fontSize:20 }} onClick={()=>setShowClose(false)}>✕</button>
            </div>

            <div className="shift-close-summary">
              <div><span>Shift Duration</span><span>{durationStr}</span></div>
              <div><span>Total Orders</span><span>{shiftOrders.length}</span></div>
              <div><span>Total Sales</span><span style={{ color:'var(--accent)', fontWeight:700 }}>Rs. {shiftSales.toLocaleString()}</span></div>
              <div><span>Cash Sales</span><span>Rs. {shiftCash.toLocaleString()}</span></div>
              <div><span>Opening Cash</span><span>Rs. {(activeShift.openingCash||0).toLocaleString()}</span></div>
              <div><span>Expected in Register</span><span style={{ fontWeight:700 }}>Rs. {expectedCash.toLocaleString()}</span></div>
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:14, marginTop:16 }}>
              <div>
                <label style={{ fontSize:12, color:'var(--text-muted)', display:'block', marginBottom:6 }}>Actual Cash in Register (Rs.) *</label>
                <input type="number" value={closingCash} onChange={e=>setClosingCash(e.target.value)}
                  placeholder={`Expected: Rs. ${expectedCash}`} style={{ fontSize:16, padding:'12px' }} autoFocus />
                {closingCash && (
                  <div style={{ marginTop:8, padding:'8px 12px', borderRadius:8, fontWeight:600, fontSize:13,
                    background: cashDiff >= 0 ? 'rgba(45,198,83,0.1)' : 'rgba(230,57,70,0.1)',
                    color: cashDiff >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                    {cashDiff >= 0 ? '✓ Surplus' : '⚠️ Shortage'}: Rs. {Math.abs(cashDiff).toLocaleString()}
                  </div>
                )}
              </div>
              <div>
                <label style={{ fontSize:12, color:'var(--text-muted)', display:'block', marginBottom:6 }}>Handover Notes</label>
                <textarea value={handoverNote} onChange={e=>setHandoverNote(e.target.value)} rows={3}
                  placeholder="Any notes for next shift..." style={{ resize:'vertical' }} />
              </div>
              <button className="btn-primary" style={{ width:'100%', padding:13, background:'var(--danger)' }}
                onClick={handleCloseShift} disabled={saving || !closingCash}>
                {saving ? 'Closing...' : '🔒 Confirm Close Shift'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
