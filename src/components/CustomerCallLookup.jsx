import { useState, useEffect, useRef } from 'react'
import { getCollection, addDocument, updateDocument } from '../firebase/firestore'
import { where } from '../firebase/firestore'
import { format } from 'date-fns'
import { MdPhone, MdPerson, MdHistory, MdLocationOn, MdAdd, MdSearch } from 'react-icons/md'
import toast from 'react-hot-toast'
import './CustomerCallLookup.css'

// ── CustomerCallLookup ────────────────────────────────────
// Props:
//   onSelectCustomer(customer) — called when customer selected
//   onNewOrder(customer)       — called when "New Order" clicked
// ─────────────────────────────────────────────────────────

export default function CustomerCallLookup({ onSelectCustomer, onNewOrder }) {
  const [phone, setPhone]           = useState('')
  const [searching, setSearching]   = useState(false)
  const [customer, setCustomer]     = useState(null)  // found customer
  const [notFound, setNotFound]     = useState(false)
  const [orders, setOrders]         = useState([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [newCustomer, setNewCustomer] = useState({ name:'', phone:'', address:'', area:'', notes:'' })
  const [saving, setSaving]         = useState(false)
  const inputRef                    = useRef(null)

  // Focus on mount
  useEffect(() => { inputRef.current?.focus() }, [])

  // Auto search when phone is 11 digits
  useEffect(() => {
    if (phone.replace(/\D/g,'').length >= 11) {
      handleSearch()
    }
    // eslint-disable-next-line
  }, [phone])

  const handleSearch = async () => {
    const cleaned = phone.replace(/\D/g,'')
    if (cleaned.length < 7) { toast.error('Phone number too short'); return }

    setSearching(true)
    setCustomer(null)
    setNotFound(false)
    setOrders([])

    try {
      // Search by phone (partial match support)
      const results = await getCollection('customers', where('phone', '>=', cleaned), where('phone', '<=', cleaned + '\uf8ff'))

      if (results.length > 0) {
        const found = results[0]
        setCustomer(found)
        setNotFound(false)
        onSelectCustomer?.(found)

        // Load order history
        const orderHistory = await getCollection('orders',
          where('customerPhone', '==', found.phone)
        )
        setOrders(orderHistory.sort((a,b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)))

        // Update call count
        await updateDocument('customers', found.id, {
          lastCallAt: new Date(),
          callCount: (found.callCount || 0) + 1,
        })

        toast.success(`Welcome back, ${found.name}! 👋`)
      } else {
        setNotFound(true)
        setNewCustomer(prev => ({ ...prev, phone: cleaned }))
      }
    } catch (err) {
      toast.error('Search failed')
    }
    setSearching(false)
  }

  const handleSaveNew = async () => {
    if (!newCustomer.name || !newCustomer.phone) { toast.error('Name & phone required'); return }
    setSaving(true)
    try {
      const ref = await addDocument('customers', {
        ...newCustomer,
        totalOrders: 0,
        totalSpent: 0,
        loyaltyPoints: 0,
        callCount: 1,
        lastCallAt: new Date(),
      })
      const saved = { id: ref.id, ...newCustomer, totalOrders:0, totalSpent:0, loyaltyPoints:0 }
      setCustomer(saved)
      setNotFound(false)
      setShowAddForm(false)
      onSelectCustomer?.(saved)
      toast.success('New customer saved! ✅')
    } catch { toast.error('Failed to save') }
    setSaving(false)
  }

  const handleClear = () => {
    setPhone('')
    setCustomer(null)
    setNotFound(false)
    setOrders([])
    setShowAddForm(false)
    inputRef.current?.focus()
  }

  const lastOrder = orders[0]

  return (
    <div className="ccl-wrapper">
      {/* ── Phone Input ── */}
      <div className="ccl-search-box">
        <MdPhone className="ccl-phone-icon" />
        <input
          ref={inputRef}
          type="tel"
          className="ccl-phone-input"
          placeholder="Customer phone number..."
          value={phone}
          onChange={e => setPhone(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          maxLength={13}
        />
        {phone && (
          <button className="ccl-clear-btn" onClick={handleClear}>✕</button>
        )}
        <button className="ccl-search-btn" onClick={handleSearch} disabled={searching}>
          {searching ? '...' : <MdSearch />}
        </button>
      </div>

      {/* ── Searching ── */}
      {searching && (
        <div className="ccl-loading">
          <div className="spinner" style={{ width:24, height:24, borderWidth:2 }} />
          <span>Searching customer...</span>
        </div>
      )}

      {/* ── Customer Found ── */}
      {customer && !searching && (
        <div className="ccl-found fade-in">
          {/* Customer Card */}
          <div className="ccl-customer-card">
            <div className="ccl-avatar">
              {customer.name?.charAt(0)?.toUpperCase()}
            </div>
            <div className="ccl-customer-info">
              <div className="ccl-customer-name">{customer.name}</div>
              <div className="ccl-customer-phone"><MdPhone size={12}/> {customer.phone}</div>
              {customer.address && (
                <div className="ccl-customer-addr"><MdLocationOn size={12}/> {customer.address}{customer.area ? `, ${customer.area}` : ''}</div>
              )}
            </div>
            <div className="ccl-customer-badge">
              {customer.totalOrders > 10 ? '⭐ Regular' : customer.totalOrders > 5 ? '😊 Frequent' : '🆕 New'}
            </div>
          </div>

          {/* Stats Row */}
          <div className="ccl-stats">
            <div className="ccl-stat">
              <span className="ccl-stat-val">{customer.totalOrders || 0}</span>
              <span className="ccl-stat-label">Orders</span>
            </div>
            <div className="ccl-stat">
              <span className="ccl-stat-val">Rs.{((customer.totalSpent || 0) / 1000).toFixed(1)}k</span>
              <span className="ccl-stat-label">Spent</span>
            </div>
            <div className="ccl-stat">
              <span className="ccl-stat-val">{customer.loyaltyPoints || 0}</span>
              <span className="ccl-stat-label">Points</span>
            </div>
            <div className="ccl-stat">
              <span className="ccl-stat-val">{customer.callCount || 1}</span>
              <span className="ccl-stat-label">Calls</span>
            </div>
          </div>

          {/* Last Order */}
          {lastOrder && (
            <div className="ccl-last-order">
              <div className="ccl-last-order-title"><MdHistory size={14}/> Last Order</div>
              <div className="ccl-last-order-items">
                {(lastOrder.items || []).slice(0,3).map((item,i) => (
                  <span key={i} className="ccl-last-item">{item.name} ×{item.qty}</span>
                ))}
                {(lastOrder.items || []).length > 3 && <span className="ccl-last-item">+{lastOrder.items.length - 3} more</span>}
              </div>
              <div className="ccl-last-order-meta">
                <span>Rs. {(lastOrder.total || 0).toLocaleString()}</span>
                <span>{lastOrder.createdAt?.toDate ? format(lastOrder.createdAt.toDate(), 'dd MMM, hh:mm a') : '—'}</span>
              </div>
            </div>
          )}

          {/* Notes */}
          {customer.notes && (
            <div className="ccl-notes">📝 {customer.notes}</div>
          )}

          {/* Action Button */}
          <button className="btn-primary ccl-order-btn" onClick={() => onNewOrder?.(customer)}>
            🛒 Start New Order for {customer.name}
          </button>

          {/* Order History */}
          {orders.length > 0 && (
            <div className="ccl-history">
              <div className="ccl-history-title">Order History ({orders.length})</div>
              <div className="ccl-history-list">
                {orders.slice(0,5).map(o => (
                  <div key={o.id} className="ccl-history-item">
                    <span className="ccl-history-num">#{String(o.orderNumber||o.id.slice(0,4)).padStart(4,'0')}</span>
                    <span className="ccl-history-items-text">{(o.items||[]).map(i=>i.name).slice(0,2).join(', ')}{o.items?.length>2?'...':''}</span>
                    <span className="ccl-history-amount">Rs.{(o.total||0).toLocaleString()}</span>
                    <span className="ccl-history-date">{o.createdAt?.toDate ? format(o.createdAt.toDate(),'dd MMM') : '—'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Not Found ── */}
      {notFound && !searching && (
        <div className="ccl-notfound fade-in">
          <div className="ccl-notfound-icon">📵</div>
          <div className="ccl-notfound-text">No customer found for <strong>{phone}</strong></div>
          <div className="ccl-notfound-sub">First time caller? Save their details!</div>

          {!showAddForm ? (
            <div style={{ display:'flex', gap:10, marginTop:12 }}>
              <button className="btn-primary" style={{flex:1}} onClick={() => setShowAddForm(true)}>
                <MdAdd /> Save Customer
              </button>
              <button className="btn-outline" style={{flex:1}} onClick={() => onNewOrder?.({ name:'Walk-in', phone })}>
                Continue as Walk-in
              </button>
            </div>
          ) : (
            <div className="ccl-add-form fade-in">
              <div className="ccl-form-row">
                <label>Full Name *</label>
                <input value={newCustomer.name} onChange={e=>setNewCustomer(p=>({...p,name:e.target.value}))} placeholder="Customer name" />
              </div>
              <div className="ccl-form-row">
                <label>Phone *</label>
                <input value={newCustomer.phone} onChange={e=>setNewCustomer(p=>({...p,phone:e.target.value}))} placeholder="03XXXXXXXXX" />
              </div>
              <div className="ccl-form-row">
                <label>Address</label>
                <input value={newCustomer.address} onChange={e=>setNewCustomer(p=>({...p,address:e.target.value}))} placeholder="Street address" />
              </div>
              <div className="ccl-form-row">
                <label>Area / Block</label>
                <input value={newCustomer.area} onChange={e=>setNewCustomer(p=>({...p,area:e.target.value}))} placeholder="e.g. DHA Phase 5" />
              </div>
              <div className="ccl-form-row">
                <label>Notes</label>
                <input value={newCustomer.notes} onChange={e=>setNewCustomer(p=>({...p,notes:e.target.value}))} placeholder="e.g. Allergic to nuts, prefers spicy" />
              </div>
              <div style={{display:'flex', gap:8, marginTop:4}}>
                <button className="btn-primary" style={{flex:1}} onClick={handleSaveNew} disabled={saving}>
                  {saving ? 'Saving...' : '✅ Save & Continue'}
                </button>
                <button className="btn-outline" onClick={() => setShowAddForm(false)}>Cancel</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
