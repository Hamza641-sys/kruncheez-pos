import { useState, useMemo } from 'react'
import { usePOS } from '../context/POSContext'
import { useAuth } from '../context/AuthContext'
import { createOrder, completePayment } from '../firebase/firestore'
import toast from 'react-hot-toast'
import { MdSearch, MdClose, MdAdd, MdRemove, MdTableRestaurant, MdDeliveryDining, MdTakeoutDining } from 'react-icons/md'
import './POS.css'

export default function POS() {
  const {
    menuItems, menuCategories, tables,
    cart, addToCart, removeFromCart, updateCartQty, clearCart,
    cartTotal, cartCount,
    selectedTable, setSelectedTable,
    orderType, setOrderType,
  } = usePOS()
  const { userProfile } = useAuth()

  const [activeCategory, setActiveCategory] = useState('all')
  const [search, setSearch] = useState('')
  const [showPayModal, setShowPayModal] = useState(false)
  const [payMethod, setPayMethod] = useState('cash')
  const [amountPaid, setAmountPaid] = useState('')
  const [discount, setDiscount] = useState(0)
  const [placingOrder, setPlacingOrder] = useState(false)
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')

  const tax = Math.round(cartTotal * 0.05)
  const discountAmt = Math.round(cartTotal * (discount / 100))
  const finalTotal = cartTotal + tax - discountAmt
  const change = Math.max(0, Number(amountPaid) - finalTotal)

  const filteredItems = useMemo(() => {
    let items = menuItems.filter(i => i.available)
    if (activeCategory !== 'all') items = items.filter(i => i.categoryId === activeCategory)
    if (search) items = items.filter(i => i.name.toLowerCase().includes(search.toLowerCase()))
    return items
  }, [menuItems, activeCategory, search])

  const handlePlaceOrder = async () => {
    if (cart.length === 0) { toast.error('Cart is empty'); return }
    if (orderType === 'dine-in' && !selectedTable) { toast.error('Please select a table'); return }
    setPlacingOrder(true)
    try {
      const table = tables.find(t => t.id === selectedTable)
      const orderNum = Date.now().toString().slice(-4)
      await createOrder({
        orderNumber: orderNum,
        items: cart.map(c => ({ ...c })),
        subtotal: cartTotal,
        tax,
        discount: discountAmt,
        total: finalTotal,
        orderType,
        tableId: selectedTable || null,
        tableNumber: table?.number || null,
        customerName: customerName || 'Walk-in',
        customerPhone: customerPhone || null,
        staffId: userProfile?.uid || null,
        staffName: userProfile?.name || 'Cashier',
        note: '',
      })
      toast.success(`Order #${orderNum} placed!`)
      clearCart()
      setCustomerName('')
      setCustomerPhone('')
      setDiscount(0)
    } catch (err) {
      toast.error('Failed to place order')
    } finally {
      setPlacingOrder(false)
    }
  }

  const handlePayNow = async () => {
    if (cart.length === 0) { toast.error('Cart is empty'); return }
    if (payMethod === 'cash' && Number(amountPaid) < finalTotal) { toast.error('Insufficient amount'); return }
    setPlacingOrder(true)
    try {
      const table = tables.find(t => t.id === selectedTable)
      const orderNum = Date.now().toString().slice(-4)
      const orderRef = await createOrder({
        orderNumber: orderNum,
        items: cart.map(c => ({ ...c })),
        subtotal: cartTotal,
        tax,
        discount: discountAmt,
        total: finalTotal,
        orderType,
        tableId: selectedTable || null,
        tableNumber: table?.number || null,
        customerName: customerName || 'Walk-in',
        customerPhone: customerPhone || null,
        staffId: userProfile?.uid || null,
        staffName: userProfile?.name || 'Cashier',
        status: 'paid',
      })
      await completePayment(orderRef.id, {
        method: payMethod,
        amountPaid: Number(amountPaid) || finalTotal,
        change,
      })
      toast.success(`Payment received! Change: Rs. ${change}`)
      clearCart()
      setShowPayModal(false)
      setAmountPaid('')
    } catch (err) {
      toast.error('Payment failed')
    } finally {
      setPlacingOrder(false)
    }
  }

  return (
    <div className="pos-page">
      {/* ── Left: Menu ──────────────────────────── */}
      <div className="pos-menu">
        {/* Order type */}
        <div className="pos-order-types">
          {[
            { type: 'dine-in',  icon: <MdTableRestaurant />,  label: 'Dine In' },
            { type: 'takeaway', icon: <MdTakeoutDining />,    label: 'Takeaway' },
            { type: 'delivery', icon: <MdDeliveryDining />,   label: 'Delivery' },
          ].map(ot => (
            <button
              key={ot.type}
              className={`pos-order-type-btn ${orderType === ot.type ? 'active' : ''}`}
              onClick={() => setOrderType(ot.type)}
            >
              {ot.icon} {ot.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="pos-search">
          <MdSearch className="pos-search-icon" />
          <input
            placeholder="Search menu items..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && <MdClose className="pos-search-clear" onClick={() => setSearch('')} />}
        </div>

        {/* Categories */}
        <div className="pos-categories">
          <button
            className={`pos-cat-btn ${activeCategory === 'all' ? 'active' : ''}`}
            onClick={() => setActiveCategory('all')}
          >
            🍽️ All
          </button>
          {menuCategories.map(cat => (
            <button
              key={cat.id}
              className={`pos-cat-btn ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>

        {/* Items Grid */}
        <div className="pos-items-grid">
          {filteredItems.length === 0 ? (
            <div className="pos-empty">No items found</div>
          ) : filteredItems.map(item => {
            const cartItem = cart.find(c => c.itemId === item.id)
            return (
              <div
                key={item.id}
                className={`pos-item-card ${cartItem ? 'in-cart' : ''}`}
                onClick={() => addToCart(item)}
              >
                <div className="pos-item-emoji">
                  {menuCategories.find(c => c.id === item.categoryId)?.icon || '🍴'}
                </div>
                <div className="pos-item-name">{item.name}</div>
                <div className="pos-item-price">Rs. {item.price.toLocaleString()}</div>
                {cartItem && (
                  <div className="pos-item-qty-badge">{cartItem.qty}</div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Right: Cart ──────────────────────────── */}
      <div className="pos-cart">
        <div className="pos-cart-header">
          <h2 className="pos-cart-title">Order Summary</h2>
          {cart.length > 0 && (
            <button className="pos-cart-clear" onClick={clearCart}>Clear All</button>
          )}
        </div>

        {/* Table select (dine-in) */}
        {orderType === 'dine-in' && (
          <div className="pos-table-select">
            <label>Select Table</label>
            <select value={selectedTable || ''} onChange={e => setSelectedTable(e.target.value || null)}>
              <option value="">-- Choose Table --</option>
              {tables.filter(t => t.status === 'available').map(t => (
                <option key={t.id} value={t.id}>Table {t.number} ({t.floor})</option>
              ))}
            </select>
          </div>
        )}

        {/* Customer info */}
        <div className="pos-customer">
          <input placeholder="Customer Name (optional)" value={customerName} onChange={e => setCustomerName(e.target.value)} />
          <input placeholder="Phone (optional)" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} />
        </div>

        {/* Cart items */}
        <div className="pos-cart-items">
          {cart.length === 0 ? (
            <div className="pos-cart-empty">
              <div style={{ fontSize: 40 }}>🛒</div>
              <div>Cart is empty</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Tap items to add</div>
            </div>
          ) : cart.map(item => (
            <div key={item.itemId} className="pos-cart-item">
              <div className="pos-cart-item-name">{item.name}</div>
              <div className="pos-cart-item-controls">
                <button className="pos-qty-btn" onClick={() => updateCartQty(item.itemId, item.qty - 1)}>
                  <MdRemove />
                </button>
                <span className="pos-qty-val">{item.qty}</span>
                <button className="pos-qty-btn" onClick={() => updateCartQty(item.itemId, item.qty + 1)}>
                  <MdAdd />
                </button>
              </div>
              <div className="pos-cart-item-price">Rs. {(item.price * item.qty).toLocaleString()}</div>
              <button className="pos-cart-item-remove" onClick={() => removeFromCart(item.itemId)}>
                <MdClose />
              </button>
            </div>
          ))}
        </div>

        {/* Discount */}
        {cart.length > 0 && (
          <div className="pos-discount">
            <label>Discount %</label>
            <input
              type="number" min="0" max="100"
              value={discount}
              onChange={e => setDiscount(Number(e.target.value))}
              style={{ width: 80 }}
            />
          </div>
        )}

        {/* Totals */}
        <div className="pos-totals">
          <div className="pos-total-row"><span>Subtotal</span><span>Rs. {cartTotal.toLocaleString()}</span></div>
          <div className="pos-total-row"><span>Tax (5%)</span><span>Rs. {tax.toLocaleString()}</span></div>
          {discountAmt > 0 && (
            <div className="pos-total-row discount"><span>Discount ({discount}%)</span><span>- Rs. {discountAmt.toLocaleString()}</span></div>
          )}
          <div className="pos-total-row grand"><span>Total</span><span>Rs. {finalTotal.toLocaleString()}</span></div>
        </div>

        {/* Action buttons */}
        <div className="pos-actions">
          <button
            className="btn-outline pos-action-btn"
            disabled={cart.length === 0 || placingOrder}
            onClick={handlePlaceOrder}
          >
            Send to Kitchen
          </button>
          <button
            className="btn-primary pos-action-btn"
            disabled={cart.length === 0 || placingOrder}
            onClick={() => setShowPayModal(true)}
          >
            Pay Now — Rs. {finalTotal.toLocaleString()}
          </button>
        </div>
      </div>

      {/* ── Payment Modal ──────────────────────── */}
      {showPayModal && (
        <div className="modal-overlay" onClick={() => setShowPayModal(false)}>
          <div className="modal-box fade-in" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700 }}>💳 Payment</h3>
              <button onClick={() => setShowPayModal(false)} style={{ background: 'none', color: 'var(--text-muted)', fontSize: 20 }}>✕</button>
            </div>

            <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--accent)', textAlign: 'center', marginBottom: 20 }}>
              Rs. {finalTotal.toLocaleString()}
            </div>

            <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
              {['cash', 'card', 'online'].map(m => (
                <button
                  key={m}
                  onClick={() => setPayMethod(m)}
                  style={{
                    flex: 1, padding: '10px', borderRadius: 8, fontWeight: 600, fontSize: 13,
                    background: payMethod === m ? 'var(--accent)' : 'var(--bg-hover)',
                    color: payMethod === m ? '#fff' : 'var(--text-secondary)',
                    border: payMethod === m ? 'none' : '1px solid var(--border)',
                    textTransform: 'capitalize',
                  }}
                >
                  {m === 'cash' ? '💵' : m === 'card' ? '💳' : '📱'} {m}
                </button>
              ))}
            </div>

            {payMethod === 'cash' && (
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Amount Received</label>
                <input
                  type="number"
                  placeholder={`Min. Rs. ${finalTotal}`}
                  value={amountPaid}
                  onChange={e => setAmountPaid(e.target.value)}
                  style={{ fontSize: 16, padding: '12px' }}
                />
                {amountPaid && Number(amountPaid) >= finalTotal && (
                  <div style={{ marginTop: 10, padding: '10px 14px', background: 'rgba(45,198,83,0.1)', borderRadius: 8, color: '#2dc653', fontWeight: 600 }}>
                    Change: Rs. {change.toLocaleString()}
                  </div>
                )}
              </div>
            )}

            <button
              className="btn-primary"
              style={{ width: '100%', padding: 14, fontSize: 15, marginTop: 8 }}
              onClick={handlePayNow}
              disabled={placingOrder || (payMethod === 'cash' && Number(amountPaid) < finalTotal)}
            >
              {placingOrder ? 'Processing...' : 'Confirm Payment'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
