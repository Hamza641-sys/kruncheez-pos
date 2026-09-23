import { useState, useEffect } from 'react'
import { getCollection, setDocument } from '../firebase/firestore'
import { useAuth } from '../context/AuthContext'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { orderBy } from '../firebase/firestore'

const ROLES = [
  { id: 'admin',   label: 'Admin',   perms: ['all'] },
  { id: 'manager', label: 'Manager', perms: ['dashboard','orders','menu','tables','inventory','reports','employees','customers','expenses'] },
  { id: 'cashier', label: 'Cashier', perms: ['orders','tables','customers','billing'] },
  { id: 'waiter',  label: 'Waiter',  perms: ['orders','tables'] },
  { id: 'kitchen', label: 'Kitchen', perms: ['kitchen'] },
]

export default function Employees() {
  const { createStaff } = useAuth()
  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name:'', email:'', phone:'', role:'cashier', password:'' })
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const data = await getCollection('staff', orderBy('createdAt','desc'))
      setStaff(data)
    } catch { toast.error('Failed to load') }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleAdd = async () => {
    if (!form.name || !form.email || !form.password) { toast.error('Name, email & password required'); return }
    if (form.password.length < 6) { toast.error('Password min 6 characters'); return }
    setSaving(true)
    try {
      const role = ROLES.find(r => r.id === form.role)
      await createStaff(form.email, form.password, {
        name: form.name,
        phone: form.phone,
        role: role?.label || 'Cashier',
        roleId: form.role,
        permissions: role?.perms || [],
        active: true,
      })
      toast.success('Staff account created')
      setShowModal(false)
      setForm({ name:'', email:'', phone:'', role:'cashier', password:'' })
      load()
    } catch (err) {
      toast.error(err.message || 'Failed to create account')
    }
    setSaving(false)
  }

  return (
    <div className="fade-in" style={{ display:'flex', flexDirection:'column', gap:20 }}>
      <div className="page-header">
        <div>
          <div className="page-title">Employees</div>
          <div className="page-subtitle">{staff.length} staff members</div>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>+ Add Employee</button>
      </div>

      <div className="card">
        <table className="data-table">
          <thead>
            <tr><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Status</th><th>Joined</th></tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ textAlign:'center', padding:40 }}><div className="spinner" /></td></tr>
            ) : staff.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign:'center', color:'var(--text-muted)', padding:40 }}>No staff members yet</td></tr>
            ) : staff.map(s => (
              <tr key={s.id}>
                <td>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <div style={{ width:34, height:34, borderRadius:'50%', background:'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:14 }}>
                      {s.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <span style={{ fontWeight:600, color:'var(--text-primary)' }}>{s.name}</span>
                  </div>
                </td>
                <td>{s.email}</td>
                <td>{s.phone||'—'}</td>
                <td>
                  <span style={{ padding:'3px 10px', background:'rgba(76,201,240,0.1)', color:'#4cc9f0', borderRadius:10, fontSize:12, fontWeight:600 }}>{s.role}</span>
                </td>
                <td>
                  <span style={{ fontSize:11, padding:'3px 10px', borderRadius:10, fontWeight:600, background: s.active ? 'rgba(45,198,83,0.1)':'rgba(230,57,70,0.1)', color: s.active ? '#2dc653':'#e63946' }}>
                    {s.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>{s.createdAt?.toDate ? format(s.createdAt.toDate(),'dd MMM yyyy') : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box fade-in" onClick={e => e.stopPropagation()}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
              <h3 style={{ fontWeight:700 }}>Add Employee</h3>
              <button style={{ background:'none', color:'var(--text-muted)', fontSize:20 }} onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              {[['name','Full Name *','text'],['email','Email *','email'],['phone','Phone','text'],['password','Password * (min 6)','password']].map(([k,l,t]) => (
                <div key={k}>
                  <label style={{ fontSize:12, color:'var(--text-muted)', display:'block', marginBottom:6 }}>{l}</label>
                  <input type={t} value={form[k]} onChange={e => setForm(p=>({...p,[k]:e.target.value}))} placeholder={l.replace(' *','')} />
                </div>
              ))}
              <div>
                <label style={{ fontSize:12, color:'var(--text-muted)', display:'block', marginBottom:6 }}>Role *</label>
                <select value={form.role} onChange={e => setForm(p=>({...p,role:e.target.value}))}>
                  {ROLES.map(r => <option key={r.id} value={r.id}>{r.label} — {r.perms.join(', ')}</option>)}
                </select>
              </div>
              <button className="btn-primary" style={{ width:'100%', padding:12 }} onClick={handleAdd} disabled={saving}>
                {saving ? 'Creating...' : 'Create Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
