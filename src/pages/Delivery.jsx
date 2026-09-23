import { useState, useEffect } from 'react'
import { usePOS } from '../context/POSContext'
import { getCollection, addDocument, updateDocument, deleteDocument } from '../firebase/firestore'
import { where, orderBy } from '../firebase/firestore'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { MdTwoWheeler, MdPhone, MdAdd, MdEdit, MdDelete, MdLocationOn, MdCheck, MdClose } from 'react-icons/md'
import './Delivery.css'

const DELIVERY_STATUSES = ['pending', 'assigned', 'out_for_delivery', 'delivered', 'failed']
const STATUS_LABELS = {
  pending: '⏳ Pending',
  assigned: '✅ Assigned',
  out_for_delivery: '🚴 On the Way',
  delivered: '📦 Delivered',
  failed: '❌ Failed',
}
const STATUS_COLORS = {
  pending: { bg: 'rgba(244,162,97,0.15)', color: '#f4a261' },
  assigned: { bg: 'rgba(76,201,240,0.15)', color: '#4cc9f0' },
  out_for_delivery: { bg: 'rgba(230,57,70,0.15)', color: '#e63946' },
  delivered: { bg: 'rgba(45,198,83,0.15)', color: '#2dc653' },
  failed: { bg: 'rgba(160,160,176,0.15)', color: '#a0a0b0' },
}

export default function Delivery() {
  const { orders } = usePOS()
  const [riders, setRiders]           = useState([])
  const [activeTab, setActiveTab]     = useState('orders') // orders | riders
  const [filterStatus, setFilterStatus] = useState('all')
  const [showRiderModal, setShowRiderModal] = useState(false)
  const [editingRider, setEditingRider]     = useState(null)
  const [riderForm, setRiderForm]           = useState({ name:'', phone:'', cnic:'', bike:'', area:'' })
  const [saving, setSaving]           = useState(false)
  const [assigningId, setAssigningId] = useState(null)

  // Only delivery orders
  const deliveryOrders = orders.filter(o => o.orderType === 'delivery')
  const filtered = filterStatus === 'all'
    ? deliveryOrders
    : deliveryOrders.filter(o => (o.deliveryStatus || 'pending') === filterStatus)

  useEffect(() => { loadRiders() }, [])

  const loadRiders = async () => {
    try {
      const data = await getCollection('riders', orderBy('name'))
      setRiders(data)
    } catch { toast.error('Failed to load riders') }
  }

  const handleSaveRider = async () => {
    if (!riderForm.name || !riderForm.phone) { toast.error('Name & phone required'); return }
    setSaving(true)
    try {
      if (editingRider) {
        await updateDocument('riders', editingRider.id, riderForm)
        toast.success('Rider updated')
      } else {
        await addDocument('riders', { ...riderForm, status: 'available', totalDeliveries: 0 })
        toast.success('Rider added!')
      }
      setShowRiderModal(false)
      setRiderForm({ name:'', phone:'', cnic:'', bike:'', area:'' })
      setEditingRider(null)
      loadRiders()
    } catch { toast.error('Failed') }
    setSaving(false)
  }

  const handleDeleteRider = async (id) => {
    if (!window.confirm('Delete this rider?')) return
    try { await deleteDocument('riders', id); toast.success('Deleted'); loadRiders() }
    catch { toast.error('Failed') }
  }

  const handleToggleRider = async (rider) => {
    const newStatus = rider.status === 'available' ? 'busy' : 'available'
    try {
      await updateDocument('riders', rider.id, { status: newStatus })
      toast.success(`Rider → ${newStatus}`)
      loadRiders()
    } catch { toast.error('Failed') }
  }

  const handleAssignRider = async (orderId, riderId) => {
    const rider = riders.find(r => r.id === riderId)
    if (!rider) return
    setAssigningId(orderId)
    try {
      await updateDocument('orders', orderId, {
        deliveryStatus: 'assigned',
        riderId: rider.id,
        riderName: rider.name,
        riderPhone: rider.phone,
        assignedAt: new Date(),
      })
      await updateDocument('riders', rider.id, { status: 'busy' })
      toast.success(`Order assigned to ${rider.name} 🛵`)
      loadRiders()
    } catch { toast.error('Failed') }
    setAssigningId(null)
  }

  const handleDeliveryStatus = async (orderId, status, riderId) => {
    try {
      await updateDocument('orders', orderId, {
        deliveryStatus: status,
        ...(status === 'delivered' ? { deliveredAt: new Date() } : {}),
        ...(status === 'delivered' && riderId ? {} : {}),
      })
      // Free up rider if delivered/failed
      if ((status === 'delivered' || status === 'failed') && riderId) {
        await updateDocument('riders', riderId, {
          status: 'available',
          totalDeliveries: (riders.find(r=>r.id===riderId)?.totalDeliveries||0) + (status==='delivered'?1:0)
        })
        loadRiders()
      }
      toast.success(`Delivery → ${STATUS_LABELS[status]}`)
    } catch { toast.error('Failed') }
  }

  // Stats
  const todayDeliveries = deliveryOrders.filter(o => {
    const d = o.createdAt?.toDate?.()
    return d && d.toDateString() === new Date().toDateString()
  })
  const deliveredToday = todayDeliveries.filter(o => o.deliveryStatus === 'delivered').length
  const pendingCount   = deliveryOrders.filter(o => !o.deliveryStatus || o.deliveryStatus === 'pending').length
  const onWayCount     = deliveryOrders.filter(o => o.deliveryStatus === 'out_for_delivery').length
  const availableRiders = riders.filter(r => r.status === 'available').length

  const openAddRider = () => {
    setEditingRider(null)
    setRiderForm({ name:'', phone:'', cnic:'', bike:'', area:'' })
    setShowRiderModal(true)
  }
  const openEditRider = (rider) => {
    setEditingRider(rider)
    setRiderForm({ name:rider.name, phone:rider.phone, cnic:rider.cnic||'', bike:rider.bike||'', area:rider.area||'' })
    setShowRiderModal(true)
  }

  return (
    <div className="delivery-page fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="page-title">🚴 Delivery Management</div>
          <div className="page-subtitle">Track deliveries & manage riders</div>
        </div>
        <button className="btn-primary" onClick={openAddRider}><MdAdd /> Add Rider</button>
      </div>

      {/* Stats */}
      <div className="delivery-stats">
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div><div className="stat-label">Today's Deliveries</div><div className="stat-value">{todayDeliveries.length}</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div><div className="stat-label">Delivered</div><div className="stat-value" style={{color:'var(--success)'}}>{deliveredToday}</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div><div className="stat-label">Pending</div><div className="stat-value" style={{color:'var(--warning)'}}>{pendingCount}</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🛵</div>
          <div><div className="stat-label">Riders Available</div><div className="stat-value" style={{color:'var(--info)'}}>{availableRiders}/{riders.length}</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🚴</div>
          <div><div className="stat-label">On the Way</div><div className="stat-value" style={{color:'var(--accent)'}}>{onWayCount}</div></div>
        </div>
      </div>

      {/* Tabs */}
      <div className="delivery-tabs">
        <button className={`dash-tab ${activeTab==='orders'?'active':''}`} onClick={()=>setActiveTab('orders')}>
          📋 Delivery Orders ({deliveryOrders.length})
        </button>
        <button className={`dash-tab ${activeTab==='riders'?'active':''}`} onClick={()=>setActiveTab('riders')}>
          🛵 Riders ({riders.length})
        </button>
      </div>

      {/* ── ORDERS TAB ── */}
      {activeTab === 'orders' && (
        <div>
          {/* Status filter */}
          <div style={{display:'flex',gap:8,marginBottom:16,flexWrap:'wrap'}}>
            {['all',...DELIVERY_STATUSES].map(s => (
              <button key={s} className={`pos-cat-btn ${filterStatus===s?'active':''}`} onClick={()=>setFilterStatus(s)} style={{textTransform:'capitalize',fontSize:12}}>
                {s==='all'?`All (${deliveryOrders.length})`:STATUS_LABELS[s]}
              </button>
            ))}
          </div>

          <div className="delivery-orders-grid">
            {filtered.length === 0 ? (
              <div className="card" style={{textAlign:'center',padding:40,color:'var(--text-muted)',gridColumn:'1/-1'}}>
                No delivery orders found
              </div>
            ) : filtered.map(order => {
              const dStatus = order.deliveryStatus || 'pending'
              const sc = STATUS_COLORS[dStatus] || STATUS_COLORS.pending
              return (
                <div key={order.id} className="delivery-order-card card fade-in">
                  {/* Card Header */}
                  <div className="delivery-card-header">
                    <span className="delivery-order-num">#{String(order.orderNumber||order.id.slice(0,4)).padStart(4,'0')}</span>
                    <span className="delivery-status-badge" style={{background:sc.bg,color:sc.color}}>
                      {STATUS_LABELS[dStatus]}
                    </span>
                  </div>

                  {/* Customer */}
                  <div className="delivery-customer">
                    <div className="delivery-customer-name">{order.customerName || 'Walk-in'}</div>
                    {order.customerPhone && (
                      <a href={`tel:${order.customerPhone}`} className="delivery-customer-phone">
                        <MdPhone size={13}/> {order.customerPhone}
                      </a>
                    )}
                    {order.customerAddress && (
                      <div className="delivery-address"><MdLocationOn size={13}/> {order.customerAddress}</div>
                    )}
                  </div>

                  {/* Items */}
                  <div className="delivery-items">
                    {(order.items||[]).slice(0,3).map((item,i)=>(
                      <span key={i} className="delivery-item-chip">{item.name} ×{item.qty}</span>
                    ))}
                    {(order.items||[]).length > 3 && <span className="delivery-item-chip">+{order.items.length-3} more</span>}
                  </div>

                  {/* Total + Time */}
                  <div className="delivery-meta">
                    <span className="delivery-total">Rs. {(order.total||0).toLocaleString()}</span>
                    <span className="delivery-time">
                      {order.createdAt?.toDate ? format(order.createdAt.toDate(),'hh:mm a') : '—'}
                    </span>
                  </div>

                  {/* Rider assigned */}
                  {order.riderName && (
                    <div className="delivery-rider-assigned">
                      <MdTwoWheeler size={14}/> {order.riderName} • {order.riderPhone}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="delivery-actions">
                    {/* Assign rider dropdown */}
                    {(dStatus === 'pending') && (
                      <select
                        className="delivery-assign-select"
                        defaultValue=""
                        onChange={e => e.target.value && handleAssignRider(order.id, e.target.value)}
                        disabled={assigningId === order.id}
                      >
                        <option value="">Assign Rider...</option>
                        {riders.filter(r=>r.status==='available').map(r=>(
                          <option key={r.id} value={r.id}>{r.name} ({r.area||'any area'})</option>
                        ))}
                      </select>
                    )}

                    {dStatus === 'assigned' && (
                      <button className="delivery-action-btn" style={{background:'rgba(230,57,70,0.15)',color:'#e63946'}}
                        onClick={()=>handleDeliveryStatus(order.id,'out_for_delivery',order.riderId)}>
                        🛵 Mark On the Way
                      </button>
                    )}

                    {dStatus === 'out_for_delivery' && (
                      <div style={{display:'flex',gap:8}}>
                        <button className="delivery-action-btn" style={{background:'rgba(45,198,83,0.15)',color:'#2dc653',flex:1}}
                          onClick={()=>handleDeliveryStatus(order.id,'delivered',order.riderId)}>
                          ✅ Delivered
                        </button>
                        <button className="delivery-action-btn" style={{background:'rgba(160,160,176,0.15)',color:'#a0a0b0',flex:1}}
                          onClick={()=>handleDeliveryStatus(order.id,'failed',order.riderId)}>
                          ❌ Failed
                        </button>
                      </div>
                    )}

                    {dStatus === 'delivered' && (
                      <div style={{textAlign:'center',fontSize:12,color:'var(--success)',fontWeight:600,padding:'6px 0'}}>
                        ✓ Delivered {order.deliveredAt ? format(new Date(order.deliveredAt?.seconds ? order.deliveredAt.seconds*1000 : order.deliveredAt),'hh:mm a') : ''}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── RIDERS TAB ── */}
      {activeTab === 'riders' && (
        <div className="card">
          {riders.length === 0 ? (
            <div style={{textAlign:'center',padding:40,color:'var(--text-muted)'}}>
              No riders added yet. Add your first rider!
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr><th>Rider</th><th>Phone</th><th>Bike/Vehicle</th><th>Area</th><th>Total Deliveries</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {riders.map(rider => (
                  <tr key={rider.id}>
                    <td>
                      <div style={{display:'flex',alignItems:'center',gap:10}}>
                        <div style={{width:36,height:36,borderRadius:'50%',background:'var(--accent)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:14}}>
                          {rider.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <span style={{fontWeight:600,color:'var(--text-primary)'}}>{rider.name}</span>
                      </div>
                    </td>
                    <td>
                      <a href={`tel:${rider.phone}`} style={{color:'var(--info)',display:'flex',alignItems:'center',gap:4}}>
                        <MdPhone size={14}/>{rider.phone}
                      </a>
                    </td>
                    <td>{rider.bike||'—'}</td>
                    <td>{rider.area||'—'}</td>
                    <td style={{fontWeight:700,color:'var(--accent)'}}>{rider.totalDeliveries||0}</td>
                    <td>
                      <button onClick={()=>handleToggleRider(rider)}
                        style={{padding:'4px 12px',borderRadius:12,fontSize:12,fontWeight:600,border:'none',cursor:'pointer',
                          background:rider.status==='available'?'rgba(45,198,83,0.15)':'rgba(244,162,97,0.15)',
                          color:rider.status==='available'?'#2dc653':'#f4a261'}}>
                        {rider.status==='available'?'● Available':'● Busy'}
                      </button>
                    </td>
                    <td>
                      <div style={{display:'flex',gap:8}}>
                        <button className="btn-outline" style={{padding:'4px 12px',fontSize:12}} onClick={()=>openEditRider(rider)}><MdEdit size={14}/></button>
                        <button style={{padding:'4px 12px',fontSize:12,background:'rgba(230,57,70,0.1)',color:'var(--accent)',border:'1px solid rgba(230,57,70,0.3)',borderRadius:6}} onClick={()=>handleDeleteRider(rider.id)}><MdDelete size={14}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ── RIDER MODAL ── */}
      {showRiderModal && (
        <div className="modal-overlay" onClick={()=>setShowRiderModal(false)}>
          <div className="modal-box fade-in" onClick={e=>e.stopPropagation()}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
              <h3 style={{fontWeight:700}}>{editingRider?'Edit Rider':'Add New Rider'}</h3>
              <button style={{background:'none',color:'var(--text-muted)',fontSize:20}} onClick={()=>setShowRiderModal(false)}>✕</button>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:14}}>
              {[
                ['name','Full Name *','text','e.g. Ali Raza'],
                ['phone','Phone *','tel','03XXXXXXXXX'],
                ['cnic','CNIC','text','XXXXX-XXXXXXX-X'],
                ['bike','Vehicle / Bike No.','text','e.g. Honda 70 - ABC-123'],
                ['area','Delivery Area','text','e.g. DHA, Gulberg'],
              ].map(([k,l,t,p])=>(
                <div key={k}>
                  <label style={{fontSize:12,color:'var(--text-muted)',display:'block',marginBottom:6}}>{l}</label>
                  <input type={t} value={riderForm[k]} onChange={e=>setRiderForm(prev=>({...prev,[k]:e.target.value}))} placeholder={p} />
                </div>
              ))}
              <button className="btn-primary" style={{width:'100%',padding:12,marginTop:4}} onClick={handleSaveRider} disabled={saving}>
                {saving?'Saving...':editingRider?'Update Rider':'Add Rider'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
