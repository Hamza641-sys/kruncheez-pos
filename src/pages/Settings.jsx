import { useState } from 'react'
import { seedDatabase } from '../firebase/firestore'
import { menuCategories, menuItems, tablesData } from '../firebase/seedData'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

export default function Settings() {
  const { userProfile } = useAuth()
  const [seeding, setSeeding] = useState(false)
  const [seedDone, setSeedDone] = useState(false)

  const handleSeed = async () => {
    if (!window.confirm('This will seed the database with Kruncheez menu & tables. Continue?')) return
    setSeeding(true)
    try {
      await seedDatabase(menuCategories, menuItems, tablesData)
      toast.success('Database seeded successfully! 🎉')
      setSeedDone(true)
    } catch (err) {
      toast.error('Seed failed: ' + err.message)
    }
    setSeeding(false)
  }

  return (
    <div className="fade-in" style={{ display:'flex', flexDirection:'column', gap:24 }}>
      <div className="page-header">
        <div>
          <div className="page-title">Settings</div>
          <div className="page-subtitle">System configuration & tools</div>
        </div>
      </div>

      {/* Restaurant Info */}
      <div className="card">
        <div style={{ fontWeight:700, marginBottom:16, fontSize:15 }}>🏪 Restaurant Info</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
          {[['Restaurant Name','The Kruncheez'],['Tagline','Fast • Fresh • Tasty'],['Address','Your Address Here'],['Phone','+92-XXX-XXXXXXX'],['Tax Rate','5%'],['Currency','Rs. (PKR)']].map(([label, val]) => (
            <div key={label}>
              <label style={{ fontSize:12, color:'var(--text-muted)', display:'block', marginBottom:6 }}>{label}</label>
              <input defaultValue={val} />
            </div>
          ))}
        </div>
        <button className="btn-primary" style={{ marginTop:16, padding:'10px 24px' }}>Save Changes</button>
      </div>

      {/* Database Seed */}
      <div className="card">
        <div style={{ fontWeight:700, marginBottom:8, fontSize:15 }}>🌱 Database Seeder</div>
        <p style={{ fontSize:13, color:'var(--text-secondary)', marginBottom:16 }}>
          Populate the database with The Kruncheez menu items, categories, and 20 tables.<br />
          Run this <strong>once</strong> after setting up a new Firebase project.
        </p>
        <button
          className={seedDone ? 'btn-outline' : 'btn-primary'}
          style={{ padding:'12px 28px', opacity: seeding ? 0.6 : 1 }}
          onClick={handleSeed}
          disabled={seeding || seedDone}
        >
          {seeding ? '⏳ Seeding...' : seedDone ? '✅ Already Seeded' : '🚀 Seed Database Now'}
        </button>
        {seedDone && <p style={{ marginTop:10, fontSize:12, color:'var(--success)' }}>✓ Menu & tables loaded. Go to POS to start taking orders!</p>}
      </div>

      {/* Receipt Settings */}
      <div className="card">
        <div style={{ fontWeight:700, marginBottom:16, fontSize:15 }}>🧾 Receipt Settings</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
          <div>
            <label style={{ fontSize:12, color:'var(--text-muted)', display:'block', marginBottom:6 }}>Footer Message</label>
            <input defaultValue="Thank you for visiting The Kruncheez!" />
          </div>
          <div>
            <label style={{ fontSize:12, color:'var(--text-muted)', display:'block', marginBottom:6 }}>Receipt Width</label>
            <select defaultValue="80mm"><option>58mm</option><option>80mm</option></select>
          </div>
        </div>
      </div>

      {/* System Info */}
      <div className="card">
        <div style={{ fontWeight:700, marginBottom:16, fontSize:15 }}>ℹ️ System Info</div>
        <div style={{ display:'flex', flexDirection:'column', gap:8, fontSize:13 }}>
          {[['Version','1.0.0'],['Logged in as', userProfile?.name||'Admin'],['Role', userProfile?.role||'Admin'],['Firebase Project','kruncheez-pos'],['Build','React + Vite + Firebase']].map(([k,v]) => (
            <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid var(--border)' }}>
              <span style={{ color:'var(--text-muted)' }}>{k}</span>
              <span style={{ fontWeight:600, color:'var(--text-primary)' }}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
