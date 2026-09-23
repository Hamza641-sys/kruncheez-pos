import { useState, useEffect } from 'react'
import { getCollection, addDocument, updateDocument } from '../firebase/firestore'
import { where, orderBy } from '../firebase/firestore'
import toast from 'react-hot-toast'

const CATEGORIES = ['Meat','Vegetables','Dairy','Spices','Beverages','Packaging','Sauces','Other']

export default function Inventory() {
  const [items, setItems]     = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name:'', category:'Meat', quantity:'', unit:'kg', minStock:10, costPerUnit:'', supplier:'' })
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const data = await getCollection('inventory', orderBy('name'))
      setItems(data)
    } catch { toast.error('Failed to load') }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const openAdd = () => { setEditing(null); setForm({ name:'', category:'Meat', quantity:'', unit:'kg', minStock:10, costPerUnit:'', supplier:'' }); setShowModal(true) }
  const openEdit = (item) => { setEditing(item); setForm({ name:item.name, category:item.category, quantity:item.quantity, unit:item.unit, minStock:item.minStock, costPerUnit:item.costPerUnit, supplier:item.supplier||'' }); setShowModal(true) }

  const handleSave = async () => {
    if (!form.name || form.quantity === '') { toast.error('Name & quantity required'); return }
    setSaving(true)
    try {
      const data = { ...form, quantity: Number(form.quantity), minStock: Number(form.minStock), costPerUnit: Number(form.costPerUnit) }
      if (editing) { await updateDocument('inventory', editing.id, data); toast.success('Updated') }
      else { await addDocument('inventory', data); toast.success('Added') }
      setShowModal(false)
      load()
    } catch { toast.error('Failed') }
    setSaving(false)
  }

  const handleStock = async (id, delta) => {
    const item = items.find(i => i.id === id)
    if (!item) return
    const newQty = Math.max(0, (item.quantity || 0) + delta)
    try { await updateDocument('inventory', id, { quantity: newQty }); load() }
    catch { toast.error('Failed') }
  }

  const lowStock = items.filter(i => i.quantity <= i.minStock)

  return (
    <div className="fade-in" style={{ display:'flex', flexDirection:'column', gap:20 }}>
      <div className="page-header">
        <div>
          <div className="page-title">Inventory</div>
          <div className="page-subtitle">{items.length} items • {lowStock.length} low stock</div>
        </div>
        <button className="btn-primary" onClick={openAdd}>+ Add Item</button>
      </div>

      {lowStock.length > 0 && (
        <div style={{ padding:'12px 16px', background:'rgba(230,57,70,0.08)', border:'1px solid rgba(230,57,70,0.2)', borderRadius:10, color:'var(--accent)', fontSize:13 }}>
          ⚠️ {lowStock.length} item(s) are running low: {lowStock.slice(0,3).map(i=>i.name).join(', ')}{lowStock.length>3?'...':''}
        </div>
      )}

      <div className="card">
        <table className="data-table">
          <thead>
            <tr><th>Item</th><th>Category</th><th>Quantity</th><th>Min Stock</th><th>Cost/Unit</th><th>Supplier</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} style={{ textAlign:'center', padding:40 }}><div className="spinner" /></td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={8} style={{ textAlign:'center', color:'var(--text-muted)', padding:40 }}>No inventory items. Add some!</td></tr>
            ) : items.map(item => (
              <tr key={item.id}>
                <td style={{ fontWeight:600, color:'var(--text-primary)' }}>{item.name}</td>
                <td>{item.category}</td>
                <td style={{ fontWeight:700, color: item.quantity <= item.minStock ? 'var(--danger)' : 'var(--success)' }}>
                  {item.quantity} {item.unit}
                </td>
                <td>{item.minStock} {item.unit}</td>
                <td>Rs. {item.costPerUnit || 0}</td>
                <td>{item.supplier || '—'}</td>
                <td>
                  <span style={{ fontSize:11, fontWeight:600, padding:'3px 10px', borderRadius:12, background: item.quantity <= item.minStock ? 'rgba(230,57,70,0.15)' : 'rgba(45,198,83,0.15)', color: item.quantity <= item.minStock ? 'var(--danger)' : 'var(--success)' }}>
                    {item.quantity <= item.minStock ? 'Low Stock' : 'OK'}
                  </span>
                </td>
                <td>
                  <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                    <button style={{ padding:'4px 10px', borderRadius:6, background:'rgba(45,198,83,0.15)', color:'#2dc653', border:'none', fontWeight:700, fontSize:14 }} onClick={() => handleStock(item.id, 10)}>+10</button>
                    <button className="btn-outline" style={{ padding:'4px 10px', fontSize:12 }} onClick={() => openEdit(item)}>Edit</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box fade-in" onClick={e => e.stopPropagation()}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
              <h3 style={{ fontWeight:700 }}>{editing ? 'Edit Item' : 'Add Inventory Item'}</h3>
              <button style={{ background:'none', color:'var(--text-muted)', fontSize:20 }} onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              {[['name','Item Name *','text','e.g. Chicken Breast'],['quantity','Quantity *','number','e.g. 50'],['minStock','Min Stock','number','e.g. 10'],['costPerUnit','Cost per Unit (Rs.)','number','e.g. 200'],['supplier','Supplier','text','e.g. Ali Traders']].map(([k,l,t,p]) => (
                <div key={k}>
                  <label style={{ fontSize:12, color:'var(--text-muted)', display:'block', marginBottom:6 }}>{l}</label>
                  <input type={t} value={form[k]} onChange={e => setForm(prev => ({...prev,[k]:e.target.value}))} placeholder={p} />
                </div>
              ))}
              <div>
                <label style={{ fontSize:12, color:'var(--text-muted)', display:'block', marginBottom:6 }}>Category</label>
                <select value={form.category} onChange={e => setForm(p=>({...p,category:e.target.value}))}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize:12, color:'var(--text-muted)', display:'block', marginBottom:6 }}>Unit</label>
                <select value={form.unit} onChange={e => setForm(p=>({...p,unit:e.target.value}))}>
                  {['kg','g','L','ml','pcs','box','packet'].map(u => <option key={u}>{u}</option>)}
                </select>
              </div>
              <button className="btn-primary" style={{ width:'100%', padding:12 }} onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : editing ? 'Update' : 'Add Item'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
