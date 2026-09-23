import { forwardRef } from 'react'
import { format } from 'date-fns'
import './KitchenSlip.css'

// ── Kitchen Order Slip — 58mm width ──────────────────────
const KitchenSlip = forwardRef(({ order }, ref) => {
  if (!order) return null

  const orderNum = String(order.orderNumber || order.id?.slice(0,4) || '0000').padStart(4,'0')
  const time     = order.createdAt?.toDate ? format(order.createdAt.toDate(), 'hh:mm a') : format(new Date(), 'hh:mm a')

  return (
    <div ref={ref} className="kitchen-slip">
      <div className="ks-header">
        <div className="ks-title">KITCHEN ORDER</div>
        <div className="ks-num">#{orderNum}</div>
        <div className="ks-time">{time}</div>
      </div>

      <div className="ks-divider">------------------------</div>

      <div className="ks-meta">
        <div><strong>TYPE:</strong> {(order.orderType || 'DINE-IN').toUpperCase()}</div>
        {order.tableNumber && <div><strong>TABLE:</strong> {order.tableNumber}</div>}
        {order.customerName && order.customerName !== 'Walk-in' && (
          <div><strong>NAME:</strong> {order.customerName}</div>
        )}
      </div>

      <div className="ks-divider">------------------------</div>

      <div className="ks-items">
        {(order.items || []).map((item, i) => (
          <div key={i} className="ks-item">
            <span className="ks-qty">[{item.qty}x]</span>
            <span className="ks-name">{item.name.toUpperCase()}</span>
            {item.note && <div className="ks-note">  !! {item.note}</div>}
          </div>
        ))}
      </div>

      <div className="ks-divider">========================</div>
      <div className="ks-footer">KRUNCHEEZ KITCHEN</div>
    </div>
  )
})

KitchenSlip.displayName = 'KitchenSlip'
export default KitchenSlip
