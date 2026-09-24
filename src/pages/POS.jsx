import { useState, useMemo, useRef } from 'react'
import { usePOS } from '../context/POSContext'
import { useAuth } from '../context/AuthContext'
import { createOrder, completePayment, updateDocument, getCollection } from '../firebase/firestore'
import { where } from '../firebase/firestore'
import { usePrint } from '../hooks/usePrint'
import Receipt from '../components/Receipt'
import KitchenSlip from '../components/KitchenSlip'
import CustomerCallLookup from '../components/CustomerCallLookup'
import { sendWhatsAppReceipt } from '../utils/whatsapp'
import { calculateEarnedPoints, calculateRedeemValue, canRedeem, getPointsTier } from '../utils/loyalty'
import { deductInventoryForOrder } from '../utils/inventoryDeduct'
import toast from 'react-hot-toast'
import {
  MdSearch, MdClose, MdAdd, MdRemove,
  MdTableRestaurant, MdDeliveryDining, MdTakeoutDining,
  MdPhone, MdPrint, MdPerson, MdWhatsapp
} from 'react-icons/md'
import './POS.css'

export default function POS() {
  const {
    menuItems, menuCategories, tables,
    cart, addToCart, removeFromCart, updateCartQty, clearCart,
    cartTotal,
    selectedTable, setSelectedTable,
    orderType, setOrderType,
  } = usePOS()
  const { userProfile } = useAuth()

  const [activeCategory, setActiveCategory]   = useState('all')
  const [search, setSearch]                   = useState('')
  const [showPayModal, setShowPayModal]        = useState(false)
  const [showCallModal, setShowCallModal]      = useState(false)
  const [showReceiptModal, setShowReceiptModal]= useState(false)
  const [payMethod, setPayMethod]             = useState('cash')
  const [amountPaid, setAmountPaid]           = useState('')
  const [discount, setDiscount]               = useState(0)
  const [placingOrder, setPlacingOrder]       = useState(false)
  const [customerName, setCustomerName]       = useState('')
  const [customerPhone, setCustomerPhone]     = useState('')
  const [customerAddress, setCustomerAddress] = useState('')
  const [lastOrder, setLastOrder]             = useState(null)
  const [customerData, setCustomerData]       = useState(null) // full customer object
  const [redeemPoints, setRedeemPoints]       = useState(0)    // points to redeem

  // Print hooks
  const { printRef: receiptRef, kitchenPrintRef: kitchenRef, handlePrint: printReceipt, handlePrintKitchen: printKitchen, handlePrintBoth } = usePrint()

  const tax          = 0
  const discountAmt  = Math.round(cartTotal * (discount / 100))
  const loyaltyDiscount = calculateRedeemValue(redeemPoints)
  const finalTotal   = Math.max(0, cartTotal - discountAmt - loyaltyDiscount)
  const change       = Math.max(0, Number(amountPaid) - finalTotal)
  const earnedPoints = calculateEarnedPoints(finalTotal)

  const filteredItems = useMemo(() => {
    let items = menuItems.filter(i => i.available)
    if (activeCategory !== 'all') items = items.filter(i => i.categoryId === activeCategory)
    if (search) items = items.filter(i => i.name.toLowerCase().includes(search.toLowerCase()))
    return items
  }, [menuItems, activeCategory, search])

  // Called when customer selected from lookup
  const handleCustomerSelect = (customer) => {
    setCustomerName(customer.name || '')
    setCustomerPhone(customer.phone || '')
    setCustomerAddress(customer.address || '')
    setCustomerData(customer)
    setRedeemPoints(0)
    setShowCallModal(false)
    toast.success(`${customer.name} selected`)
  }

  const buildOrderPayload = (status = 'pending') => {
    const table = tables.find(t => t.id === selectedTable)
    const orderNum = Date.now().toString().slice(-4)
    return {
      orderNumber: orderNum,
      items: cart.map(c => ({ ...c })),
      subtotal: cartTotal,
      tax,
      discount: discountAmt + loyaltyDiscount,
      loyaltyDiscount,
      redeemPoints,
      total: finalTotal,
      orderType,
      tableId: selectedTable || null,
      tableNumber: table?.number || null,
      customerName: customerName || 'Walk-in',
      customerPhone: customerPhone || null,
      customerAddress: customerAddress || null,
      customerId: customerData?.id || null,
      staffId: userProfile?.uid || null,
      staffName: userProfile?.name || 'Cashier',
      status,
      note: '',
    }
  }

  // Send to Kitchen only
  const handlePlaceOrder = async () => {
    if (cart.length === 0) { toast.error('Cart is empty'); return }
    if (orderType === 'dine-in' && !selectedTable) { toast.error('Please select a table'); return }
    setPlacingOrder(true)
    try {
      const payload = buildOrderPayload('pending')
      await createOrder(payload)
      // Auto deduct inventory
      deductInventoryForOrder(cart)
      // Print kitchen slip
      setLastOrder(payload)
      setTimeout(() => printKitchen('58mm'), 200)
      toast.success(`Order #${payload.orderNumber} sent to kitchen! 🍳`)
      clearCart(); setCustomerName(''); setCustomerPhone(''); setCustomerAddress(''); setDiscount(0)
    } catch { toast.error('Failed to place order') }
    setPlacingOrder(false)
  }

  // Pay Now
  const handlePayNow = async () => {
    if (cart.length === 0) { toast.error('Cart is empty'); return }
    if (payMethod === 'cash' && Number(amountPaid) < finalTotal) { toast.error('Insufficient amount'); return }
    setPlacingOrder(true)
    try {
      const payload = buildOrderPayload('paid')
      const orderRef = await createOrder(payload)
      // Auto deduct inventory
      deductInventoryForOrder(cart)
      await completePayment(orderRef.id, {
        method: payMethod,
        amountPaid: Number(amountPaid) || finalTotal,
        change,
      })

      // Update customer loyalty points
      if (customerData?.id) {
        const newPoints = (customerData.loyaltyPoints || 0) - redeemPoints + earnedPoints
        await updateDocument('customers', customerData.id, {
          loyaltyPoints: Math.max(0, newPoints),
          totalOrders: (customerData.totalOrders || 0) + 1,
          totalSpent: (customerData.totalSpent || 0) + finalTotal,
          lastOrderAt: new Date(),
        })
      }

      const finalOrder = {
        ...payload, id: orderRef.id,
        paymentMethod: payMethod,
        amountPaid: Number(amountPaid) || finalTotal,
        change,
        earnedPoints,
        createdAt: { toDate: () => new Date() }
      }
      setLastOrder(finalOrder)
      setShowPayModal(false)
      setShowReceiptModal(true)
      toast.success(`💰 Paid! Change: Rs. ${change} | +${earnedPoints} pts`)
      clearCart()
      setCustomerName(''); setCustomerPhone(''); setCustomerAddress('')
      setCustomerData(null); setDiscount(0); setRedeemPoints(0); setAmountPaid('')
    } catch { toast.error('Payment failed') }
    setPlacingOrder(false)
  }

  return (
    <div className="pos-page">

      {/* ── Left: Menu ─────────────────────────── */}
      <div className="pos-menu">

        {/* Order Type + Call Button */}
        <div className="pos-top-bar">
          <div className="pos-order-types">
            {[
              { type: 'dine-in',  icon: <MdTableRestaurant />, label: 'Dine In' },
              { type: 'takeaway', icon: <MdTakeoutDining />,   label: 'Takeaway' },
              { type: 'delivery', icon: <MdDeliveryDining />,  label: 'Delivery' },
            ].map(ot => (
              <button key={ot.type} className={`pos-order-type-btn ${orderType===ot.type?'active':''}`} onClick={() => setOrderType(ot.type)}>
                {ot.icon} {ot.label}
              </button>
            ))}
          </div>
          <button className="pos-call-btn" onClick={() => setShowCallModal(true)} title="Customer Call Lookup">
            <MdPhone /> Call Lookup
          </button>
        </div>

        {/* Search */}
        <div className="pos-search">
          <MdSearch className="pos-search-icon" />
          <input placeholder="Search menu items..." value={search} onChange={e => setSearch(e.target.value)} />
          {search && <MdClose className="pos-search-clear" onClick={() => setSearch('')} />}
        </div>

        {/* Categories */}
        <div className="pos-categories">
          <button className={`pos-cat-btn ${activeCategory==='all'?'active':''}`} onClick={() => setActiveCategory('all')}>🍽️ All</button>
          {menuCategories.map(cat => (
            <button key={cat.id} className={`pos-cat-btn ${activeCategory===cat.id?'active':''}`} onClick={() => setActiveCategory(cat.id)}>
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
              <div key={item.id} className={`pos-item-card ${cartItem?'in-cart':''}`} onClick={() => addToCart(item)}>
                <div className="pos-item-emoji">{menuCategories.find(c=>c.id===item.categoryId)?.icon||'🍴'}</div>
                <div className="pos-item-name">{item.name}</div>
                <div className="pos-item-price">Rs. {item.price.toLocaleString()}</div>
                {cartItem && <div className="pos-item-qty-badge">{cartItem.qty}</div>}
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Right: Cart ─────────────────────────── */}
      <div className="pos-cart">
        <div className="pos-cart-header">
          <h2 className="pos-cart-title">Order Summary</h2>
          {cart.length > 0 && <button className="pos-cart-clear" onClick={clearCart}>Clear All</button>}
        </div>

        {/* Customer Info Bar */}
        <div className="pos-customer-bar" onClick={() => setShowCallModal(true)}>
          <MdPerson className="pos-customer-bar-icon" />
          <div className="pos-customer-bar-info">
            {customerName ? (
              <>
                <span className="pos-customer-bar-name">{customerName}</span>
                {customerPhone && <span className="pos-customer-bar-phone">{customerPhone}</span>}
                {customerAddress && <span className="pos-customer-bar-addr">📍 {customerAddress}</span>}
              </>
            ) : (
              <span className="pos-customer-bar-placeholder">Tap to add customer / call lookup</span>
            )}
          </div>
          <MdPhone className="pos-customer-bar-phone-icon" />
        </div>

        {/* Table select */}
        {orderType === 'dine-in' && (
          <div className="pos-table-select">
            <label>Select Table</label>
            <select value={selectedTable||''} onChange={e => setSelectedTable(e.target.value||null)}>
              <option value="">-- Choose Table --</option>
              {tables.filter(t=>t.status==='available').map(t => (
                <option key={t.id} value={t.id}>Table {t.number} ({t.floor})</option>
              ))}
            </select>
          </div>
        )}

        {/* Delivery address */}
        {orderType === 'delivery' && (
          <div className="pos-table-select">
            <label>Delivery Address</label>
            <input value={customerAddress} onChange={e=>setCustomerAddress(e.target.value)} placeholder="Enter delivery address..." />
          </div>
        )}

        {/* Cart Items */}
        <div className="pos-cart-items">
          {cart.length === 0 ? (
            <div className="pos-cart-empty">
              <div style={{fontSize:40}}>🛒</div>
              <div>Cart is empty</div>
              <div style={{fontSize:12,color:'var(--text-muted)',marginTop:4}}>Tap items to add</div>
            </div>
          ) : cart.map(item => (
            <div key={item.itemId} className="pos-cart-item">
              <div className="pos-cart-item-name">{item.name}</div>
              <div className="pos-cart-item-controls">
                <button className="pos-qty-btn" onClick={() => updateCartQty(item.itemId, item.qty-1)}><MdRemove /></button>
                <span className="pos-qty-val">{item.qty}</span>
                <button className="pos-qty-btn" onClick={() => updateCartQty(item.itemId, item.qty+1)}><MdAdd /></button>
              </div>
              <div className="pos-cart-item-price">Rs. {(item.price*item.qty).toLocaleString()}</div>
              <button className="pos-cart-item-remove" onClick={() => removeFromCart(item.itemId)}><MdClose /></button>
            </div>
          ))}
        </div>

        {/* Discount */}
        {cart.length > 0 && (
          <div className="pos-discount">
            <label>Discount %</label>
            <input type="number" min="0" max="100" value={discount} onChange={e=>setDiscount(Number(e.target.value))} style={{width:80}} />
          </div>
        )}

        {/* Totals */}
        <div className="pos-totals">
          <div className="pos-total-row"><span>Subtotal</span><span>Rs. {cartTotal.toLocaleString()}</span></div>
          {discountAmt > 0 && <div className="pos-total-row discount"><span>Discount ({discount}%)</span><span>- Rs. {discountAmt.toLocaleString()}</span></div>}
          {loyaltyDiscount > 0 && <div className="pos-total-row discount"><span>Loyalty Discount</span><span>- Rs. {loyaltyDiscount.toLocaleString()}</span></div>}
          <div className="pos-total-row grand"><span>Total</span><span>Rs. {finalTotal.toLocaleString()}</span></div>
        </div>

        {/* Actions */}
        <div className="pos-actions">
          <button className="btn-outline pos-action-btn" disabled={cart.length===0||placingOrder} onClick={handlePlaceOrder}>
            🍳 Send to Kitchen
          </button>
          <button className="btn-primary pos-action-btn" disabled={cart.length===0||placingOrder} onClick={() => setShowPayModal(true)}>
            💳 Pay — Rs. {finalTotal.toLocaleString()}
          </button>
        </div>
      </div>

      {/* ══ CALL LOOKUP MODAL ════════════════════ */}
      {showCallModal && (
        <div className="modal-overlay" onClick={() => setShowCallModal(false)}>
          <div className="modal-box fade-in" style={{maxWidth:520}} onClick={e=>e.stopPropagation()}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
              <h3 style={{fontWeight:700,fontSize:18}}>📞 Customer Call Lookup</h3>
              <button style={{background:'none',color:'var(--text-muted)',fontSize:20}} onClick={() => setShowCallModal(false)}>✕</button>
            </div>
            <CustomerCallLookup
              onSelectCustomer={handleCustomerSelect}
              onNewOrder={(customer) => { handleCustomerSelect(customer); setShowCallModal(false) }}
            />
          </div>
        </div>
      )}

      {/* ══ PAYMENT MODAL ════════════════════════ */}
      {showPayModal && (
        <div className="modal-overlay" onClick={() => setShowPayModal(false)}>
          <div className="modal-box fade-in" onClick={e=>e.stopPropagation()}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
              <h3 style={{fontSize:18,fontWeight:700}}>💳 Payment</h3>
              <button onClick={()=>setShowPayModal(false)} style={{background:'none',color:'var(--text-muted)',fontSize:20}}>✕</button>
            </div>

            {/* Customer summary */}
            {customerName && (
              <div style={{padding:'8px 12px',background:'rgba(230,57,70,0.06)',border:'1px solid rgba(230,57,70,0.2)',borderRadius:8,marginBottom:14,fontSize:13}}>
                <strong>{customerName}</strong>
                {customerPhone && <span style={{color:'var(--text-muted)',marginLeft:8}}>{customerPhone}</span>}
                {customerAddress && <div style={{color:'var(--text-muted)',marginTop:2}}>📍 {customerAddress}</div>}
              </div>
            )}

        {/* Loyalty Points Redeem */}
            {customerData && canRedeem(customerData.loyaltyPoints || 0) && (
              <div style={{padding:'10px 12px',background:'rgba(76,201,240,0.08)',border:'1px solid rgba(76,201,240,0.2)',borderRadius:8,marginBottom:14}}>
                <div style={{fontSize:12,fontWeight:600,color:'#4cc9f0',marginBottom:8}}>
                  🎁 Loyalty Points: <strong>{customerData.loyaltyPoints}</strong> pts available
                </div>
                <div style={{display:'flex',alignItems:'center',gap:10}}>
                  <input type="range" min="0" max={Math.floor((customerData.loyaltyPoints||0)/10)*10}
                    step="10" value={redeemPoints} onChange={e=>setRedeemPoints(Number(e.target.value))}
                    style={{flex:1,accentColor:'var(--accent)'}} />
                  <span style={{fontSize:13,fontWeight:700,color:'var(--accent)',whiteSpace:'nowrap'}}>
                    {redeemPoints} pts = Rs. {calculateRedeemValue(redeemPoints)}
                  </span>
                </div>
                {redeemPoints > 0 && (
                  <div style={{fontSize:12,color:'var(--success)',marginTop:6}}>✓ Rs. {calculateRedeemValue(redeemPoints)} discount applied!</div>
                )}
              </div>
            )}

            {/* Earn points preview */}
            {earnedPoints > 0 && (
              <div style={{padding:'8px 12px',background:'rgba(45,198,83,0.06)',border:'1px solid rgba(45,198,83,0.15)',borderRadius:8,marginBottom:14,fontSize:12,color:'var(--success)'}}>
                ⭐ Customer will earn <strong>+{earnedPoints} points</strong> on this order
              </div>
            )}

            <div style={{fontSize:28,fontWeight:800,color:'var(--accent)',textAlign:'center',marginBottom:16}}>
              Rs. {finalTotal.toLocaleString()}
            </div>

            <div style={{display:'flex',gap:10,marginBottom:16}}>
              {['cash','card','online'].map(m => (
                <button key={m} onClick={()=>setPayMethod(m)} style={{flex:1,padding:'10px',borderRadius:8,fontWeight:600,fontSize:13,background:payMethod===m?'var(--accent)':'var(--bg-hover)',color:payMethod===m?'#fff':'var(--text-secondary)',border:payMethod===m?'none':'1px solid var(--border)',textTransform:'capitalize'}}>
                  {m==='cash'?'💵':m==='card'?'💳':'📱'} {m}
                </button>
              ))}
            </div>

            {payMethod==='cash' && (
              <div style={{marginBottom:14}}>
                <label style={{fontSize:12,color:'var(--text-secondary)',display:'block',marginBottom:6}}>Amount Received</label>
                <input type="number" placeholder={`Min. Rs. ${finalTotal}`} value={amountPaid} onChange={e=>setAmountPaid(e.target.value)} style={{fontSize:16,padding:'12px'}} autoFocus />
                {amountPaid && Number(amountPaid)>=finalTotal && (
                  <div style={{marginTop:10,padding:'10px 14px',background:'rgba(45,198,83,0.1)',borderRadius:8,color:'#2dc653',fontWeight:600,fontSize:15}}>
                    💵 Change: Rs. {change.toLocaleString()}
                  </div>
                )}
              </div>
            )}

            <button className="btn-primary" style={{width:'100%',padding:14,fontSize:15}} onClick={handlePayNow}
              disabled={placingOrder||(payMethod==='cash'&&Number(amountPaid)<finalTotal)}>
              {placingOrder?'Processing...':'✅ Confirm Payment'}
            </button>
          </div>
        </div>
      )}

      {/* ══ RECEIPT MODAL ════════════════════════ */}
      {showReceiptModal && lastOrder && (
        <div className="modal-overlay" onClick={()=>setShowReceiptModal(false)}>
          <div className="modal-box fade-in" style={{maxWidth:380}} onClick={e=>e.stopPropagation()}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
              <h3 style={{fontWeight:700}}>🧾 Receipt</h3>
              <button style={{background:'none',color:'var(--text-muted)',fontSize:20}} onClick={()=>setShowReceiptModal(false)}>✕</button>
            </div>

            {/* Receipt Preview */}
            <div style={{background:'#fff',borderRadius:8,padding:'8px',marginBottom:14,maxHeight:400,overflowY:'auto'}}>
              <div ref={receiptRef}>
                <Receipt order={lastOrder} />
              </div>
            </div>

            {/* Print Buttons */}
            <div style={{display:'flex',gap:10,marginBottom:8}}>
              <button className="btn-primary" style={{flex:2,padding:12,display:'flex',alignItems:'center',justifyContent:'center',gap:6,fontSize:14}}
                onClick={()=>handlePrintBoth(lastOrder,'80mm')}>
                <MdPrint /> Print Both Copies (Customer + Kitchen)
              </button>
            </div>
            <div style={{display:'flex',gap:10}}>
              <button className="btn-outline" style={{flex:1,padding:10,display:'flex',alignItems:'center',justifyContent:'center',gap:6,fontSize:12}}
                onClick={()=>printReceipt(lastOrder,'80mm')}>
                <MdPrint /> Customer Only (80mm)
              </button>
              <button className="btn-outline" style={{flex:1,padding:10,display:'flex',alignItems:'center',justifyContent:'center',gap:6,fontSize:12}}
                onClick={()=>printKitchen(lastOrder,'58mm')}>
                <MdPrint /> Kitchen Only (58mm)
              </button>
            </div>

            {/* WhatsApp send */}
            {lastOrder?.customerPhone && (
              <button
                style={{width:'100%',padding:12,marginTop:8,borderRadius:8,fontWeight:600,fontSize:13,background:'#25D366',color:'#fff',border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:8}}
                onClick={() => { sendWhatsAppReceipt(lastOrder); toast.success('Opening WhatsApp...') }}
              >
                <MdWhatsapp size={18} /> Send via WhatsApp
              </button>
            )}

            {/* Loyalty points earned */}
            {earnedPoints > 0 && (
              <div style={{textAlign:'center',fontSize:13,color:'var(--success)',marginTop:8,fontWeight:600}}>
                ⭐ +{earnedPoints} loyalty points earned!
              </div>
            )}

            {/* Hidden kitchen slip for both-print */}
            <div style={{display:'none'}}>
              <div ref={kitchenRef}>
                <KitchenSlip order={lastOrder} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
