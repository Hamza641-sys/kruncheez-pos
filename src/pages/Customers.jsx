import { useState, useEffect } from 'react'
import { getCollection, addDocument, updateDocument } from '../firebase/firestore'
import { orderBy } from '../firebase/firestore'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

export default function Customers() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name:'', phone:'', email:'', address:'' })
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const data = await getCollection('customers', orderBy('createdAt', 'desc'))
      setCustomers(data)
    } catch { toast.error('Failed to load') }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const filtered = customers.filter(c =>
    !search || c.name?.toLowerCase().includes(search.toLowerCase()) || c.phone?.includes(search)
  )

  const handleSave = async () => {
    if (!form.name || !form.phone) { toast.error('Name & phone required'); return }
    setSaving(true)
    try {
      await addDocument('customers', { ...form, totalOrders: 0, totalSpent: 0, loyaltyPoints: 0 })
      toast.success('Customer added')
      setShowModal(false)
      setForm({ name:'', phone:'', email:'', address:'' })
      load()
    } catch { toast.error('Failed') }
    setSaving(false)
  }

  return (
    <div className="fade-in" style={{ display:'flex', flexDirection:'column', gap:20 }}>
      <div className="page-header">
        <div>
          <div className="page-title">Customers</div>
          <div className="page-subtitle">{customers.length} registered customers</div>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>+ Add Customer</button>
      </div>

      <div style={{ display:'flex', gap:12 }}>
        <input placeholder="🔍 Search by name or phone..." value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth:320 }} />
        <div style={{ display:'flex', gap:16, padding:'10px 16px', background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:10, fontSize:13 }}>
          <span>Total: <strong>{customers.length}</strong></span>
          <span>Total Revenue: <strong style={{ color:'var(--accent)' }}>Rs. {customers.reduce((s,c)=>s+(c.totalSpent||0),0).toLocaleString()}</strong></span>
        </div>
      </div>

      <div className="card">
        <table className="data-table">
          <thead>
            <tr><th>Name</th><th>Phone</th><th>Email</th><th>Total Orders</th><th>Total Spent</th><th>Loyalty Pts</th><th>Since</th></tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ textAlign:'center', padding:40 }}><div className="spinner" /></td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign:'center', color:'var(--text-muted)', padding:40 }}>No customers found</td></tr>
            ) : filtered.map(c => (
              <tr key={c.id}>
                <td>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <div style={{ width:32, height:32, borderRadius:'50%', background:'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:13 }}>
                      {c.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <span style={{ fontWeight:600, color:'var(--text-primary)' }}>{c.name}</span>
                  </div>
                </td>
                <td>{c.phone}</td>
                <td>{c.email || '—'}</td>
                <td style={{ fontWeight:600 }}>{c.totalOrders || 0}</td>
                <td style={{ fontWeight:600, color:'var(--accent)' }}>Rs. {(c.totalSpent||0).toLocaleString()}</td>
                <td>
                  <span style={{ padding:'3px 10px', background:'rgba(76,201,240,0.1)', color:'#4cc9f0', borderRadius:10, fontSize:12, fontWeight:600 }}>
                    {c.loyaltyPoints || 0} pts
                  </span>
                </td>
                <td>{c.createdAt?.toDate ? format(c.createdAt.toDate(),'dd MMM yyyy') : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box fade-in" onClick={e => e.stopPropagation()}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
              <h3 style={{ fontWeight:700 }}>Add Customer</h3>
              <button style={{ background:'none', color:'var(--text-muted)', fontSize:20 }} onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              {[['name','Full Name *','text'],['phone','Phone *','text'],['email','Email','email'],['address','Address','text']].map(([k,l,t]) => (
                <div key={k}>
                  <label style={{ fontSize:12, color:'var(--text-muted)', display:'block', marginBottom:6 }}>{l}</label>
                  <input type={t} value={form[k]} onChange={e => setForm(p=>({...p,[k]:e.target.value}))} placeholder={l.replace(' *','')} />
                </div>
              ))}
              <button className="btn-primary" style={{ width:'100%', padding:12 }} onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Add Customer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
