import { useState } from 'react'
import { usePOS } from '../context/POSContext'
import { addDocument, updateDocument, deleteDocument, toggleItemAvailability } from '../firebase/firestore'
import toast from 'react-hot-toast'
import './Menu.css'

export default function Menu() {
  const { menuItems, menuCategories } = usePOS()
  const [activeCategory, setActiveCategory] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name:'', categoryId:'', price:'', description:'', available:true })
  const [saving, setSaving] = useState(false)

  const filtered = activeCategory === 'all' ? menuItems : menuItems.filter(i => i.categoryId === activeCategory)

  const openAdd = () => { setEditing(null); setForm({ name:'', categoryId: menuCategories[0]?.id || '', price:'', description:'', available:true }); setShowModal(true) }
  const openEdit = (item) => { setEditing(item); setForm({ name:item.name, categoryId:item.categoryId, price:item.price, description:item.description||'', available:item.available }); setShowModal(true) }

  const handleSave = async () => {
    if (!form.name || !form.price) { toast.error('Name & price required'); return }
    setSaving(true)
    try {
      if (editing) {
        await updateDocument('menuItems', editing.id, { ...form, price: Number(form.price) })
        toast.success('Item updated')
      } else {
        await addDocument('menuItems', { ...form, price: Number(form.price) })
        toast.success('Item added')
      }
      setShowModal(false)
    } catch { toast.error('Failed') }
    setSaving(false)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this item?')) return
    try { await deleteDocument('menuItems', id); toast.success('Deleted') }
    catch { toast.error('Failed') }
  }

  const handleToggle = async (id, available) => {
    try {
      await toggleItemAvailability(id, !available)
      toast.success(!available ? 'Item enabled' : 'Item disabled')
    } catch { toast.error('Failed') }
  }

  return (
    <div className="menu-page fade-in">
      <div className="page-header">
        <div>
          <div className="page-title">Menu Management</div>
          <div className="page-subtitle">{menuItems.length} items across {menuCategories.length} categories</div>
        </div>
        <button className="btn-primary" onClick={openAdd}>+ Add Item</button>
      </div>

      <div className="menu-cats">
        <button className={`pos-cat-btn ${activeCategory==='all'?'active':''}`} onClick={() => setActiveCategory('all')}>All ({menuItems.length})</button>
        {menuCategories.map(cat => (
          <button key={cat.id} className={`pos-cat-btn ${activeCategory===cat.id?'active':''}`} onClick={() => setActiveCategory(cat.id)}>
            {cat.icon} {cat.name} ({menuItems.filter(i => i.categoryId===cat.id).length})
          </button>
        ))}
      </div>

      <div className="card">
        <table className="data-table">
          <thead>
            <tr><th>Item</th><th>Category</th><th>Price</th><th>Description</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {filtered.map(item => {
              const cat = menuCategories.find(c => c.id === item.categoryId)
              return (
                <tr key={item.id}>
                  <td>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <span style={{ fontSize:20 }}>{cat?.icon || '🍴'}</span>
                      <span style={{ fontWeight:600, color:'var(--text-primary)' }}>{item.name}</span>
                    </div>
                  </td>
                  <td>{cat?.name || '—'}</td>
                  <td style={{ fontWeight:600, color:'var(--accent)' }}>Rs. {item.price.toLocaleString()}</td>
                  <td style={{ maxWidth:200, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.description || '—'}</td>
                  <td>
                    <button
                      onClick={() => handleToggle(item.id, item.available)}
                      style={{ padding:'4px 12px', borderRadius:12, fontSize:11, fontWeight:600, background: item.available ? 'rgba(45,198,83,0.15)' : 'rgba(230,57,70,0.15)', color: item.available ? '#2dc653' : '#e63946', border:'none' }}
                    >
                      {item.available ? 'Available' : 'Unavailable'}
                    </button>
                  </td>
                  <td>
                    <div style={{ display:'flex', gap:6 }}>
                      <button className="btn-outline" style={{ padding:'4px 12px', fontSize:12 }} onClick={() => openEdit(item)}>Edit</button>
                      <button style={{ padding:'4px 12px', fontSize:12, background:'rgba(230,57,70,0.1)', color:'var(--accent)', border:'1px solid rgba(230,57,70,0.3)', borderRadius:6 }} onClick={() => handleDelete(item.id)}>Del</button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box fade-in" onClick={e => e.stopPropagation()}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
              <h3 style={{ fontWeight:700 }}>{editing ? 'Edit Item' : 'Add Menu Item'}</h3>
              <button style={{ background:'none', color:'var(--text-muted)', fontSize:20 }} onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div><label style={{ fontSize:12, color:'var(--text-muted)', display:'block', marginBottom:6 }}>Item Name *</label>
                <input value={form.name} onChange={e => setForm(p=>({...p,name:e.target.value}))} placeholder="e.g. Zinger Burger" /></div>
              <div><label style={{ fontSize:12, color:'var(--text-muted)', display:'block', marginBottom:6 }}>Category *</label>
                <select value={form.categoryId} onChange={e => setForm(p=>({...p,categoryId:e.target.value}))}>
                  {menuCategories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                </select></div>
              <div><label style={{ fontSize:12, color:'var(--text-muted)', display:'block', marginBottom:6 }}>Price (Rs.) *</label>
                <input type="number" value={form.price} onChange={e => setForm(p=>({...p,price:e.target.value}))} placeholder="e.g. 550" /></div>
              <div><label style={{ fontSize:12, color:'var(--text-muted)', display:'block', marginBottom:6 }}>Description</label>
                <textarea value={form.description} onChange={e => setForm(p=>({...p,description:e.target.value}))} rows={2} placeholder="Short description..." /></div>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <input type="checkbox" id="avail" checked={form.available} onChange={e => setForm(p=>({...p,available:e.target.checked}))} style={{ width:'auto' }} />
                <label htmlFor="avail" style={{ fontSize:13, color:'var(--text-primary)' }}>Available</label>
              </div>
              <button className="btn-primary" style={{ width:'100%', padding:12, marginTop:4 }} onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : editing ? 'Update Item' : 'Add Item'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
