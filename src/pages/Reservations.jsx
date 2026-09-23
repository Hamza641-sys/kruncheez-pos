import { useState, useEffect } from 'react'
import { usePOS } from '../context/POSContext'
import { addDocument, getCollection, updateDocument, deleteDocument } from '../firebase/firestore'
import { orderBy } from '../firebase/firestore'
import { format, isToday, isTomorrow, isPast, addMinutes } from 'date-fns'
import toast from 'react-hot-toast'
import { MdAdd, MdEdit, MdDelete, MdPhone, MdPeople, MdCalendarMonth, MdTableRestaurant } from 'react-icons/md'
import './Reservations.css'

const STATUS_COLORS = {
  upcoming: { bg: 'rgba(76,201,240,0.15)',  color: '#4cc9f0' },
  seated:   { bg: 'rgba(45,198,83,0.15)',   color: '#2dc653' },
  cancelled:{ bg: 'rgba(160,160,176,0.15)', color: '#a0a0b0' },
  completed:{ bg: 'rgba(230,57,70,0.08)',   color: 'var(--text-muted)' },
  no_show:  { bg: 'rgba(230,57,70,0.15)',   color: '#e63946' },
}

export default function Reservations() {
  const { tables } = usePOS()
  const [reservations, setReservations] = useState([])
  const [loading, setLoading]           = useState(true)
  const [filter,  setFilter]            = useState('upcoming')
  const [showModal, setShowModal]       = useState(false)
  const [editing,   setEditing]         = useState(null)
  const [saving,    setSaving]          = useState(false)
  const [form, setForm] = useState({
    customerName: '', phone: '', guests: 2, tableId: '',
    date: new Date().toISOString().split('T')[0],
    time: '19:00', duration: 90, note: '', status: 'upcoming',
  })

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    try {
      const data = await getCollection('reservations', orderBy('date', 'desc'))
      setReservations(data)
    } catch { toast.error('Failed to load') }
    setLoading(false)
  }

  const filtered = filter === 'all'
    ? reservations
    : reservations.filter(r => r.status === filter)

  // Today's upcoming reservations
  const todayRes = reservations.filter(r => {
    const d = new Date(`${r.date}T${r.time}`)
    return isToday(d) && r.status === 'upcoming'
  }).sort((a,b) => a.time.localeCompare(b.time))

  const openAdd = () => {
    setEditing(null)
    setForm({ customerName:'', phone:'', guests:2, tableId:'', date:new Date().toISOString().split('T')[0], time:'19:00', duration:90, note:'', status:'upcoming' })
    setShowModal(true)
  }
  const openEdit = (r) => {
    setEditing(r)
    setForm({ customerName:r.customerName, phone:r.phone, guests:r.guests, tableId:r.tableId||'', date:r.date, time:r.time, duration:r.duration||90, note:r.note||'', status:r.status })
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.customerName || !form.phone || !form.date || !form.time) { toast.error('Fill required fields'); return }
    setSaving(true)
    try {
      const table = tables.find(t => t.id === form.tableId)
      const payload = { ...form, guests: Number(form.guests), duration: Number(form.duration), tableName: table ? `Table ${table.number}` : 'TBD' }
      if (editing) {
        await updateDocument('reservations', editing.id, payload)
        toast.success('Reservation updated')
      } else {
        await addDocument('reservations', payload)
        // Mark table reserved
        if (form.tableId) await updateDocument('tables', form.tableId, { status: 'reserved' })
        toast.success('✅ Reservation booked!')
      }
      setShowModal(false)
      load()
    } catch { toast.error('Failed') }
    setSaving(false)
  }

  const handleStatus = async (id, status, tableId) => {
    try {
      await updateDocument('reservations', id, { status })
      if (status === 'seated' && tableId) await updateDocument('tables', tableId, { status: 'occupied' })
      if ((status === 'cancelled' || status === 'no_show' || status === 'completed') && tableId) {
        await updateDocument('tables', tableId, { status: 'available' })
      }
      toast.success(`Reservation → ${status}`)
      load()
    } catch { toast.error('Failed') }
  }

  const handleDelete = async (id, tableId) => {
    if (!window.confirm('Delete this reservation?')) return
    try {
      await deleteDocument('reservations', id)
      if (tableId) await updateDocument('tables', tableId, { status: 'available' })
      toast.success('Deleted')
      load()
    } catch { toast.error('Failed') }
  }

  const getDayLabel = (dateStr) => {
    const d = new Date(dateStr)
    if (isToday(d)) return '📅 Today'
    if (isTomorrow(d)) return '📅 Tomorrow'
    return format(d, 'dd MMM yyyy')
  }

  return (
    <div className="res-page fade-in">
      <div className="page-header">
        <div>
          <div className="page-title">📅 Reservations</div>
          <div className="page-subtitle">{reservations.filter(r=>r.status==='upcoming').length} upcoming bookings</div>
        </div>
        <button className="btn-primary" onClick={openAdd}><MdAdd /> New Reservation</button>
      </div>

      {/* Today's Alert */}
      {todayRes.length > 0 && (
        <div className="res-today-alert">
          <span className="res-today-title">📅 Today's Reservations ({todayRes.length})</span>
          <div className="res-today-list">
            {todayRes.map(r => (
              <div key={r.id} className="res-today-item">
                <strong>{r.time}</strong> — {r.customerName} ({r.guests} guests) — {r.tableName || 'TBD'}
                <button style={{ marginLeft:10, background:'rgba(45,198,83,0.2)', color:'#2dc653', border:'none', borderRadius:6, padding:'3px 10px', fontSize:11, fontWeight:600, cursor:'pointer' }}
                  onClick={() => handleStatus(r.id, 'seated', r.tableId)}>Seat Now</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14 }}>
        {[
          { label:'Upcoming',  val: reservations.filter(r=>r.status==='upcoming').length,  icon:'📅', color:'var(--info)' },
          { label:'Seated',    val: reservations.filter(r=>r.status==='seated').length,    icon:'🪑', color:'var(--success)' },
          { label:'Completed', val: reservations.filter(r=>r.status==='completed').length, icon:'✅', color:'var(--text-muted)' },
          { label:'No Shows',  val: reservations.filter(r=>r.status==='no_show').length,   icon:'❌', color:'var(--danger)' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon">{s.icon}</div>
            <div><div className="stat-label">{s.label}</div><div className="stat-value" style={{color:s.color}}>{s.val}</div></div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
        {['all','upcoming','seated','completed','cancelled','no_show'].map(f => (
          <button key={f} className={`pos-cat-btn ${filter===f?'active':''}`} onClick={()=>setFilter(f)} style={{textTransform:'capitalize',fontSize:12}}>
            {f.replace('_',' ')} ({f==='all' ? reservations.length : reservations.filter(r=>r.status===f).length})
          </button>
        ))}
      </div>

      {/* Reservations List */}
      <div className="res-grid">
        {loading ? (
          <div style={{ textAlign:'center', padding:40, gridColumn:'1/-1' }}><div className="spinner" style={{ margin:'auto' }} /></div>
        ) : filtered.length === 0 ? (
          <div className="card" style={{ textAlign:'center', padding:40, color:'var(--text-muted)', gridColumn:'1/-1' }}>
            No reservations found
          </div>
        ) : filtered.map(r => {
          const sc = STATUS_COLORS[r.status] || STATUS_COLORS.upcoming
          const resDate = new Date(`${r.date}T${r.time}`)
          const isOverdue = r.status === 'upcoming' && isPast(resDate)
          return (
            <div key={r.id} className={`card res-card fade-in ${isOverdue?'overdue':''}`}>
              <div className="res-card-header">
                <div className="res-date-badge">{getDayLabel(r.date)} • {r.time}</div>
                <span style={{ padding:'3px 10px', borderRadius:12, fontSize:11, fontWeight:700, background:sc.bg, color:sc.color }}>
                  {r.status.replace('_',' ')}
                </span>
              </div>

              <div className="res-customer">
                <div className="res-name">{r.customerName}</div>
                <a href={`tel:${r.phone}`} className="res-phone"><MdPhone size={13}/> {r.phone}</a>
              </div>

              <div className="res-meta">
                <span><MdPeople size={13}/> {r.guests} guests</span>
                <span><MdTableRestaurant size={13}/> {r.tableName || 'TBD'}</span>
                <span><MdCalendarMonth size={13}/> {r.duration} min</span>
              </div>

              {r.note && <div className="res-note">📝 {r.note}</div>}

              <div className="res-actions">
                {r.status === 'upcoming' && (
                  <>
                    <button className="res-btn" style={{ background:'rgba(45,198,83,0.15)',color:'#2dc653' }}
                      onClick={() => handleStatus(r.id,'seated',r.tableId)}>🪑 Seat</button>
                    <button className="res-btn" style={{ background:'rgba(160,160,176,0.15)',color:'#a0a0b0' }}
                      onClick={() => handleStatus(r.id,'no_show',r.tableId)}>No Show</button>
                    <button className="res-btn" style={{ background:'rgba(230,57,70,0.15)',color:'var(--danger)' }}
                      onClick={() => handleStatus(r.id,'cancelled',r.tableId)}>Cancel</button>
                  </>
                )}
                {r.status === 'seated' && (
                  <button className="res-btn" style={{ background:'rgba(45,198,83,0.15)',color:'#2dc653', flex:1 }}
                    onClick={() => handleStatus(r.id,'completed',r.tableId)}>✅ Completed</button>
                )}
                <button className="res-btn res-edit" onClick={() => openEdit(r)}><MdEdit size={14}/></button>
                <button className="res-btn res-del" onClick={() => handleDelete(r.id, r.tableId)}><MdDelete size={14}/></button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={()=>setShowModal(false)}>
          <div className="modal-box fade-in" style={{ maxWidth:500 }} onClick={e=>e.stopPropagation()}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
              <h3 style={{ fontWeight:700 }}>{editing?'Edit Reservation':'New Reservation'}</h3>
              <button style={{ background:'none', color:'var(--text-muted)', fontSize:20 }} onClick={()=>setShowModal(false)}>✕</button>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
              {[['customerName','Customer Name *','text'],['phone','Phone *','tel']].map(([k,l,t])=>(
                <div key={k} style={{ gridColumn:'1/-1' }}>
                  <label style={{ fontSize:12,color:'var(--text-muted)',display:'block',marginBottom:6 }}>{l}</label>
                  <input type={t} value={form[k]} onChange={e=>setForm(p=>({...p,[k]:e.target.value}))} placeholder={l.replace(' *','')} />
                </div>
              ))}
              <div>
                <label style={{ fontSize:12,color:'var(--text-muted)',display:'block',marginBottom:6 }}>Date *</label>
                <input type="date" value={form.date} onChange={e=>setForm(p=>({...p,date:e.target.value}))} />
              </div>
              <div>
                <label style={{ fontSize:12,color:'var(--text-muted)',display:'block',marginBottom:6 }}>Time *</label>
                <input type="time" value={form.time} onChange={e=>setForm(p=>({...p,time:e.target.value}))} />
              </div>
              <div>
                <label style={{ fontSize:12,color:'var(--text-muted)',display:'block',marginBottom:6 }}>Guests</label>
                <input type="number" min="1" max="20" value={form.guests} onChange={e=>setForm(p=>({...p,guests:e.target.value}))} />
              </div>
              <div>
                <label style={{ fontSize:12,color:'var(--text-muted)',display:'block',marginBottom:6 }}>Duration (min)</label>
                <input type="number" value={form.duration} onChange={e=>setForm(p=>({...p,duration:e.target.value}))} />
              </div>
              <div style={{ gridColumn:'1/-1' }}>
                <label style={{ fontSize:12,color:'var(--text-muted)',display:'block',marginBottom:6 }}>Assign Table</label>
                <select value={form.tableId} onChange={e=>setForm(p=>({...p,tableId:e.target.value}))}>
                  <option value="">-- Select Table --</option>
                  {tables.filter(t=>['available','reserved'].includes(t.status)).map(t=>(
                    <option key={t.id} value={t.id}>Table {t.number} — {t.floor} (cap: {t.capacity})</option>
                  ))}
                </select>
              </div>
              <div style={{ gridColumn:'1/-1' }}>
                <label style={{ fontSize:12,color:'var(--text-muted)',display:'block',marginBottom:6 }}>Notes</label>
                <textarea value={form.note} onChange={e=>setForm(p=>({...p,note:e.target.value}))} rows={2} placeholder="Special requests, allergies..." />
              </div>
            </div>
            <button className="btn-primary" style={{ width:'100%', padding:13, marginTop:16 }} onClick={handleSave} disabled={saving}>
              {saving?'Saving...':editing?'Update Reservation':'Book Reservation'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
