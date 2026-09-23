import { useState } from 'react'
import { seedDatabase, getCollection, deleteDocument } from '../firebase/firestore'
import { menuCategories, menuItems, tablesData } from '../firebase/seedData'
import { orderBy } from '../firebase/firestore'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

export default function Settings() {
  const { userProfile }       = useAuth()
  const [seeding, setSeeding] = useState(false)
  const [clearing, setClearing] = useState(false)
  const [seedDone, setSeedDone] = useState(false)
  const [progress, setProgress] = useState('')

  // ── Seed fresh menu ──
  const handleSeed = async () => {
    if (!window.confirm('This will add Kruncheez menu & tables to database. Continue?')) return
    setSeeding(true)
    setProgress('Seeding menu...')
    try {
      await seedDatabase(menuCategories, menuItems, tablesData)
      toast.success('Database seeded! 🎉')
      setSeedDone(true)
      setProgress('')
    } catch (err) {
      toast.error('Seed failed: ' + err.message)
      setProgress('')
    }
    setSeeding(false)
  }

  // ── Clear old menu + re-seed new menu ──
  const handleClearAndReseed = async () => {
    if (!window.confirm('⚠️ This will DELETE all existing menu items & categories, then add the new Kruncheez menu. Orders will NOT be deleted. Continue?')) return

    setClearing(true)

    try {
      // Step 1: Delete all menu items
      setProgress('Deleting old menu items...')
      const oldItems = await getCollection('menuItems')
      for (const item of oldItems) {
        await deleteDocument('menuItems', item.id)
      }
      toast.success(`Deleted ${oldItems.length} old items`)

      // Step 2: Delete all categories
      setProgress('Deleting old categories...')
      const oldCats = await getCollection('menuCategories')
      for (const cat of oldCats) {
        await deleteDocument('menuCategories', cat.id)
      }
      toast.success(`Deleted ${oldCats.length} old categories`)

      // Step 3: Seed new menu
      setProgress('Adding new Kruncheez menu...')
      await seedDatabase(menuCategories, menuItems, tablesData)

      toast.success('✅ New menu loaded successfully!')
      setSeedDone(true)
      setProgress('')
    } catch (err) {
      toast.error('Failed: ' + err.message)
      setProgress('')
    }

    setClearing(false)
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
          {[
            ['Restaurant Name', 'The Kruncheez'],
            ['Tagline', 'Fast Food, Chinese & BBQ'],
            ['Address', 'New Officers Housing Society, Northern Bypass Peshawar'],
            ['Phone', '0317-7707844 / 0309-5248080 / 0333-4007107'],
            ['Tax Rate', '5%'],
            ['Currency', 'Rs. (PKR)'],
            ['Timing', '11:00am to 2:00am'],
          ].map(([label, val]) => (
            <div key={label}>
              <label style={{ fontSize:12, color:'var(--text-muted)', display:'block', marginBottom:6 }}>{label}</label>
              <input defaultValue={val} />
            </div>
          ))}
        </div>
        <button className="btn-primary" style={{ marginTop:16, padding:'10px 24px' }}>Save Changes</button>
      </div>

      {/* Database Menu Update */}
      <div className="card">
        <div style={{ fontWeight:700, marginBottom:8, fontSize:15 }}>🍽️ Menu Database</div>
        <p style={{ fontSize:13, color:'var(--text-secondary)', marginBottom:16 }}>
          Manage menu data in Firebase. Use <strong>"Update Menu"</strong> to replace old menu with new Kruncheez menu.
        </p>

        {/* Progress indicator */}
        {(seeding || clearing) && progress && (
          <div style={{ padding:'10px 14px', background:'rgba(76,201,240,0.08)', border:'1px solid rgba(76,201,240,0.2)', borderRadius:8, marginBottom:14, fontSize:13, color:'#4cc9f0', display:'flex', alignItems:'center', gap:10 }}>
            <div className="spinner" style={{ width:18, height:18, borderWidth:2 }} />
            {progress}
          </div>
        )}

        <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
          {/* First time seed */}
          <button
            className="btn-primary"
            style={{ padding:'12px 24px', opacity: seeding || clearing ? 0.6 : 1 }}
            onClick={handleSeed}
            disabled={seeding || clearing}
          >
            {seeding ? '⏳ Seeding...' : '🚀 Seed Database (First Time)'}
          </button>

          {/* Clear old + load new */}
          <button
            style={{
              padding:'12px 24px', borderRadius:'var(--radius-md)',
              fontWeight:600, fontSize:14, cursor:'pointer',
              background: clearing ? 'rgba(230,57,70,0.5)' : 'rgba(230,57,70,0.1)',
              color: 'var(--accent)',
              border: '2px solid var(--accent)',
              opacity: seeding || clearing ? 0.6 : 1,
            }}
            onClick={handleClearAndReseed}
            disabled={seeding || clearing}
          >
            {clearing ? '⏳ Updating...' : '🔄 Clear Old Menu & Load New Menu'}
          </button>
        </div>

        {seedDone && (
          <div style={{ marginTop:12, padding:'10px 14px', background:'rgba(45,198,83,0.08)', border:'1px solid rgba(45,198,83,0.2)', borderRadius:8, fontSize:13, color:'var(--success)' }}>
            ✓ Menu loaded! <strong>{menuItems.length} items</strong> across <strong>{menuCategories.length} categories</strong>. Go to POS to start orders!
          </div>
        )}

        {/* Menu summary */}
        <div style={{ marginTop:16, display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(160px, 1fr))', gap:8 }}>
          {menuCategories.map(cat => (
            <div key={cat.id} style={{ padding:'8px 12px', background:'var(--bg-hover)', borderRadius:8, fontSize:12, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span>{cat.icon} {cat.name}</span>
              <span style={{ fontWeight:700, color:'var(--accent)' }}>
                {menuItems.filter(i => i.categoryId === cat.id).length}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Receipt Settings */}
      <div className="card">
        <div style={{ fontWeight:700, marginBottom:16, fontSize:15 }}>🧾 Receipt Settings</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
          <div>
            <label style={{ fontSize:12, color:'var(--text-muted)', display:'block', marginBottom:6 }}>Footer Message</label>
            <input defaultValue="Thank you for visiting The Kruncheez! Come Again 😊" />
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
          {[
            ['Version', '1.0.0'],
            ['Restaurant', 'The Kruncheez — Fast Food, Chinese & BBQ'],
            ['Logged in as', userProfile?.name || 'Admin'],
            ['Role', userProfile?.role || 'Admin'],
            ['Firebase Project', 'kruncheez-pos'],
            ['Total Menu Items', menuItems.length.toString()],
            ['Total Categories', menuCategories.length.toString()],
            ['Build', 'React + Vite + Firebase'],
          ].map(([k, v]) => (
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
