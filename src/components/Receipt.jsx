import { forwardRef } from 'react'
import { format } from 'date-fns'
import './Receipt.css'

// ── Thermal Receipt — 80mm width ─────────────────────────
const Receipt = forwardRef(({ order, settings = {} }, ref) => {
  if (!order) return null

  const {
    restaurantName = 'THE KRUNCHEEZ',
    tagline        = 'Fast • Fresh • Tasty',
    address        = 'Your Address Here',
    phone          = '+92-XXX-XXXXXXX',
    footerMsg      = 'Thank you for visiting! Come again 😊',
    taxRate        = 5,
  } = settings

  const orderNum = String(order.orderNumber || order.id?.slice(0,4) || '0000').padStart(4,'0')
  const date     = order.createdAt?.toDate ? format(order.createdAt.toDate(), 'dd/MM/yyyy hh:mm a') : format(new Date(), 'dd/MM/yyyy hh:mm a')

  return (
    <div ref={ref} className="receipt">
      {/* Header */}
      <div className="receipt-header">
        <div className="receipt-logo">🍔</div>
        <div className="receipt-name">{restaurantName}</div>
        <div className="receipt-tagline">{tagline}</div>
        <div className="receipt-address">{address}</div>
        <div className="receipt-phone">{phone}</div>
      </div>

      <div className="receipt-divider">--------------------------------</div>

      {/* Order Info */}
      <div className="receipt-info">
        <div className="receipt-row"><span>Order #</span><span>{orderNum}</span></div>
        <div className="receipt-row"><span>Date</span><span>{date}</span></div>
        <div className="receipt-row"><span>Type</span><span style={{textTransform:'capitalize'}}>{order.orderType || 'Dine-in'}</span></div>
        {order.tableNumber && <div className="receipt-row"><span>Table</span><span>{order.tableNumber}</span></div>}
        <div className="receipt-row"><span>Customer</span><span>{order.customerName || 'Walk-in'}</span></div>
        {order.customerPhone && <div className="receipt-row"><span>Phone</span><span>{order.customerPhone}</span></div>}
        <div className="receipt-row"><span>Staff</span><span>{order.staffName || 'Cashier'}</span></div>
      </div>

      <div className="receipt-divider">--------------------------------</div>

      {/* Items */}
      <div className="receipt-items-header">
        <span>Item</span><span>Qty</span><span>Price</span>
      </div>
      <div className="receipt-divider">--------------------------------</div>

      {(order.items || []).map((item, i) => (
        <div key={i} className="receipt-item">
          <span className="receipt-item-name">{item.name}</span>
          <div className="receipt-item-detail">
            <span>{item.qty}</span>
            <span>Rs.{(item.price * item.qty).toLocaleString()}</span>
          </div>
          <div className="receipt-item-unit">@ Rs.{item.price} each</div>
          {item.note && <div className="receipt-item-note">* {item.note}</div>}
        </div>
      ))}

      <div className="receipt-divider">--------------------------------</div>

      {/* Totals */}
      <div className="receipt-totals">
        <div className="receipt-row"><span>Subtotal</span><span>Rs. {(order.subtotal || 0).toLocaleString()}</span></div>
        {order.discount > 0 && (
          <div className="receipt-row"><span>Discount</span><span>- Rs. {order.discount.toLocaleString()}</span></div>
        )}
        <div className="receipt-row"><span>Tax ({taxRate}%)</span><span>Rs. {(order.tax || 0).toLocaleString()}</span></div>
        <div className="receipt-divider">--------------------------------</div>
        <div className="receipt-row receipt-grand">
          <span>TOTAL</span><span>Rs. {(order.total || 0).toLocaleString()}</span>
        </div>
        {order.paymentMethod && (
          <div className="receipt-row"><span>Paid via</span><span style={{textTransform:'capitalize'}}>{order.paymentMethod}</span></div>
        )}
        {order.amountPaid > 0 && order.amountPaid !== order.total && (
          <>
            <div className="receipt-row"><span>Amount Paid</span><span>Rs. {order.amountPaid.toLocaleString()}</span></div>
            <div className="receipt-row"><span>Change</span><span>Rs. {(order.change || 0).toLocaleString()}</span></div>
          </>
        )}
      </div>

      <div className="receipt-divider">================================</div>

      {/* Footer */}
      <div className="receipt-footer">
        <div>{footerMsg}</div>
        <div style={{marginTop:6}}>★ Powered by Kruncheez POS ★</div>
        <div style={{marginTop:4, fontSize:10}}>kruncheez-pos.web.app</div>
      </div>
    </div>
  )
})

Receipt.displayName = 'Receipt'
export default Receipt
