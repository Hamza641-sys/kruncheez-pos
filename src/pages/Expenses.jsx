import { useState, useEffect } from 'react'
import { addDocument, getCollection } from '../firebase/firestore'
import { orderBy } from '../firebase/firestore'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

const CATEGORIES = ['Rent','Utilities','Salaries','Raw Material','Maintenance','Marketing','Packaging','Miscellaneous']

export default function Expenses() {
  const { userProfile } = useAuth()
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ title:'', category:'Rent', amount:'', description:'', date: new Date().toISOString().split('T')[0] })
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const data = await getCollection('expenses', orderBy('createdAt','desc'))
      setExpenses(data)
    } catch { toast.error('Failed to load') }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const totalThisMonth = expenses.filter(e => {
    const d = e.createdAt?.toDate?.() || new Date(e.date)
    const now = new Date()
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).reduce((s,e) => s + (e.amount||0), 0)

  const byCategory = CATEGORIES.map(cat => ({
    cat, total: expenses.filter(e => e.category===cat).reduce((s,e)=>s+(e.amount||0),0)
  })).filter(c => c.total > 0).sort((a,b) => b.total - a.total)

  const handleSave = async () => {
    if (!form.title || !form.amount) { toast.error('Title & amount required'); return }
    setSaving(true)
    try {
      await addDocument('expenses', { ...form, amount: Number(form.amount), addedBy: userProfile?.name || 'Staff' })
      toast.success('Expense added')
      setShowModal(false)
      setForm({ title:'', category:'Rent', amount:'', description:'', date: new Date().toISOString().split('T')[0] })
      load()
    } catch { toast.error('Failed') }
    setSaving(false)
  }

  return (
    <div className="fade-in" style={{ display:'flex', flexDirection:'column', gap:20 }}>
      <div className="page-header">
        <div>
          <div className="page-title">Expenses</div>
          <div className="page-subtitle">Track all restaurant expenses</div>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>+ Add Expense</button>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }}>
        <div className="stat-card">
          <div className="stat-icon">💸</div>
          <div><div className="stat-label">This Month</div><div className="stat-value">Rs. {totalThisMonth.toLocaleString()}</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div><div className="stat-label">Total Records</div><div className="stat-value">{expenses.length}</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🏷️</div>
          <div><div className="stat-label">Top Category</div><div className="stat-value" style={{ fontSize:16 }}>{byCategory[0]?.cat || '—'}</div></div>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 280px', gap:16 }}>
        <div className="card">
          <table className="data-table">
            <thead>
              <tr><th>Title</th><th>Category</th><th>Amount</th><th>Date</th><th>Added By</th></tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ textAlign:'center', padding:40 }}><div className="spinner" /></td></tr>
              ) : expenses.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign:'center', color:'var(--text-muted)', padding:40 }}>No expenses recorded yet</td></tr>
              ) : expenses.map(e => (
                <tr key={e.id}>
                  <td style={{ fontWeight:600, color:'var(--text-primary)' }}>{e.title}</td>
                  <td><span style={{ padding:'3px 10px', background:'rgba(230,57,70,0.1)', color:'var(--accent)', borderRadius:10, fontSize:11, fontWeight:600 }}>{e.category}</span></td>
                  <td style={{ fontWeight:700, color:'var(--danger)' }}>Rs. {(e.amount||0).toLocaleString()}</td>
                  <td>{e.createdAt?.toDate ? format(e.createdAt.toDate(),'dd MMM yyyy') : e.date}</td>
                  <td>{e.addedBy||'—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card">
          <div style={{ fontWeight:600, marginBottom:16 }}>By Category</div>
          {byCategory.length === 0 ? (
            <div style={{ textAlign:'center', color:'var(--text-muted)', padding:20 }}>No data</div>
          ) : byCategory.map(item => {
            const maxVal = byCategory[0]?.total || 1
            return (
              <div key={item.cat} style={{ marginBottom:12 }}>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:4 }}>
                  <span>{item.cat}</span>
                  <span style={{ fontWeight:600, color:'var(--text-primary)' }}>Rs. {item.total.toLocaleString()}</span>
                </div>
                <div style={{ height:6, background:'var(--border)', borderRadius:3, overflow:'hidden' }}>
                  <div style={{ height:'100%', background:'var(--accent)', borderRadius:3, width:`${(item.total/maxVal)*100}%`, transition:'width 0.5s' }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box fade-in" onClick={e => e.stopPropagation()}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
              <h3 style={{ fontWeight:700 }}>Add Expense</h3>
              <button style={{ background:'none', color:'var(--text-muted)', fontSize:20 }} onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div><label style={{ fontSize:12, color:'var(--text-muted)', display:'block', marginBottom:6 }}>Title *</label>
                <input value={form.title} onChange={e => setForm(p=>({...p,title:e.target.value}))} placeholder="e.g. Monthly Rent" /></div>
              <div><label style={{ fontSize:12, color:'var(--text-muted)', display:'block', marginBottom:6 }}>Category</label>
                <select value={form.category} onChange={e => setForm(p=>({...p,category:e.target.value}))}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select></div>
              <div><label style={{ fontSize:12, color:'var(--text-muted)', display:'block', marginBottom:6 }}>Amount (Rs.) *</label>
                <input type="number" value={form.amount} onChange={e => setForm(p=>({...p,amount:e.target.value}))} placeholder="e.g. 50000" /></div>
              <div><label style={{ fontSize:12, color:'var(--text-muted)', display:'block', marginBottom:6 }}>Date</label>
                <input type="date" value={form.date} onChange={e => setForm(p=>({...p,date:e.target.value}))} /></div>
              <div><label style={{ fontSize:12, color:'var(--text-muted)', display:'block', marginBottom:6 }}>Description</label>
                <textarea value={form.description} onChange={e => setForm(p=>({...p,description:e.target.value}))} rows={2} placeholder="Optional notes..." /></div>
              <button className="btn-primary" style={{ width:'100%', padding:12 }} onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Add Expense'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
