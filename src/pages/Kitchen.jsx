import { usePOS } from '../context/POSContext'
import { updateKitchenStatus, updateOrderStatus } from '../firebase/firestore'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import './Kitchen.css'

const COLS = [
  { key: 'queued',    label: '🕐 Queued',    color: '#f4a261' },
  { key: 'preparing', label: '🔥 Preparing',  color: '#4cc9f0' },
  { key: 'ready',     label: '✅ Ready',      color: '#2dc653' },
]

export default function Kitchen() {
  const { orders } = usePOS()

  const activeOrders = orders.filter(o => !['paid','cancelled'].includes(o.status))

  const handle = async (orderId, kitchenStatus, orderStatus) => {
    try {
      await Promise.all([
        updateKitchenStatus(orderId, kitchenStatus),
        updateOrderStatus(orderId, orderStatus),
      ])
      toast.success(`→ ${kitchenStatus}`)
    } catch { toast.error('Failed') }
  }

  return (
    <div className="kitchen-page fade-in">
      <div className="page-header">
        <div>
          <div className="page-title">👨‍🍳 Kitchen Display</div>
          <div className="page-subtitle">Live order queue — {activeOrders.length} active orders</div>
        </div>
      </div>

      <div className="kitchen-cols">
        {COLS.map(col => {
          const colOrders = activeOrders.filter(o => (o.kitchenStatus || 'queued') === col.key)
          return (
            <div key={col.key} className="kitchen-col">
              <div className="kitchen-col-header" style={{ borderColor: col.color }}>
                <span>{col.label}</span>
                <span className="kitchen-col-count" style={{ background: col.color + '22', color: col.color }}>{colOrders.length}</span>
              </div>

              <div className="kitchen-cards">
                {colOrders.length === 0 ? (
                  <div className="kitchen-empty">No orders</div>
                ) : colOrders.map(o => (
                  <div key={o.id} className="kitchen-card fade-in">
                    <div className="kitchen-card-header">
                      <span className="kitchen-order-num">#{String(o.orderNumber||o.id.slice(0,4)).padStart(4,'0')}</span>
                      <span className="kitchen-order-type" style={{ textTransform:'capitalize' }}>{o.orderType || 'Dine-in'}</span>
                      {o.tableNumber && <span className="kitchen-table">T{o.tableNumber}</span>}
                    </div>

                    <div className="kitchen-items">
                      {(o.items||[]).map((item,i) => (
                        <div key={i} className="kitchen-item">
                          <span className="kitchen-item-qty">×{item.qty}</span>
                          <span className="kitchen-item-name">{item.name}</span>
                          {item.note && <span className="kitchen-item-note">{item.note}</span>}
                        </div>
                      ))}
                    </div>

                    <div className="kitchen-card-footer">
                      <span className="kitchen-time">
                        {o.createdAt?.toDate ? `${Math.round((Date.now() - o.createdAt.toDate().getTime()) / 60000)}m ago` : '—'}
                      </span>
                      <div style={{ display:'flex', gap:6 }}>
                        {col.key === 'queued' && (
                          <button className="kitchen-btn" style={{ background:'rgba(76,201,240,0.15)', color:'#4cc9f0' }}
                            onClick={() => handle(o.id, 'preparing', 'preparing')}>
                            Start
                          </button>
                        )}
                        {col.key === 'preparing' && (
                          <button className="kitchen-btn" style={{ background:'rgba(45,198,83,0.15)', color:'#2dc653' }}
                            onClick={() => handle(o.id, 'ready', 'ready')}>
                            Done
                          </button>
                        )}
                        {col.key === 'ready' && (
                          <button className="kitchen-btn" style={{ background:'rgba(230,57,70,0.15)', color:'#e63946' }}
                            onClick={() => handle(o.id, 'served', 'served')}>
                            Served
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
