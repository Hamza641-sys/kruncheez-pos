import { useState } from 'react'
import { usePOS } from '../context/POSContext'
import { updateTableStatus, updateDocument } from '../firebase/firestore'
import toast from 'react-hot-toast'
import './Tables.css'

const STATUS_OPTIONS = ['available', 'occupied', 'reserved', 'cleaning']

export default function Tables() {
  const { tables, orders } = usePOS()
  const [selected, setSelected] = useState(null)

  const detail = selected ? tables.find(t => t.id === selected) : null
  const tableOrder = detail ? orders.find(o => o.id === detail.currentOrderId) : null

  const handleStatus = async (tableId, status) => {
    try {
      await updateTableStatus(tableId, status)
      toast.success(`Table status: ${status}`)
    } catch { toast.error('Failed') }
  }

  const floors = [...new Set(tables.map(t => t.floor || 'Ground Floor'))]

  return (
    <div className="tables-page fade-in">
      <div className="page-header">
        <div>
          <div className="page-title">Tables</div>
          <div className="page-subtitle">Floor & table management</div>
        </div>
        <div className="tables-legend">
          {STATUS_OPTIONS.map(s => (
            <div key={s} className="tables-legend-item">
              <span className={`dot dot-${s}`} />
              <span style={{ textTransform:'capitalize', fontSize:12, color:'var(--text-secondary)' }}>{s}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="tables-layout">
        <div style={{ flex:1 }}>
          {floors.map(floor => (
            <div key={floor} style={{ marginBottom: 28 }}>
              <h3 style={{ fontSize:14, fontWeight:600, color:'var(--text-secondary)', marginBottom:14 }}>{floor}</h3>
              <div className="tables-grid">
                {tables.filter(t => (t.floor || 'Ground Floor') === floor).map(t => (
                  <div
                    key={t.id}
                    className={`table-card ${t.status}`}
                    onClick={() => setSelected(selected === t.id ? null : t.id)}
                    style={{ border: selected === t.id ? '2px solid var(--accent)' : '' }}
                  >
                    <span style={{ fontSize: 22 }}>{t.number}</span>
                    <span style={{ fontSize: 10, textTransform: 'capitalize', fontWeight: 500 }}>{t.status}</span>
                    <span style={{ fontSize: 10, color: 'inherit', opacity: 0.7 }}>Cap: {t.capacity}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {detail && (
          <div className="card tables-detail fade-in">
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
              <h3 style={{ fontWeight:700 }}>Table {detail.number}</h3>
              <button style={{ background:'none', color:'var(--text-muted)', fontSize:20 }} onClick={() => setSelected(null)}>✕</button>
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:20 }}>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:13 }}>
                <span style={{ color:'var(--text-muted)' }}>Floor</span>
                <span>{detail.floor || 'Ground'}</span>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:13 }}>
                <span style={{ color:'var(--text-muted)' }}>Capacity</span>
                <span>{detail.capacity} persons</span>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:13 }}>
                <span style={{ color:'var(--text-muted)' }}>Status</span>
                <span style={{ textTransform:'capitalize', fontWeight:600 }}>{detail.status}</span>
              </div>
              {tableOrder && (
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:13 }}>
                  <span style={{ color:'var(--text-muted)' }}>Current Order</span>
                  <span style={{ color:'var(--accent)', fontWeight:600 }}>
                    Rs. {(tableOrder.total||0).toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              <p style={{ fontSize:11, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.5px' }}>Change Status</p>
              {STATUS_OPTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => handleStatus(detail.id, s)}
                  style={{
                    padding:'10px', borderRadius: 8, fontWeight:600, fontSize:13,
                    background: detail.status === s ? 'var(--accent)' : 'var(--bg-hover)',
                    color: detail.status === s ? '#fff' : 'var(--text-secondary)',
                    border: '1px solid var(--border)', textTransform:'capitalize'
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
