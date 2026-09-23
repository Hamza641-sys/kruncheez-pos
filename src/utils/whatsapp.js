// ── WhatsApp Receipt Utility ──────────────────────────────
// Opens WhatsApp with pre-filled order summary message
// Works on mobile (app) and desktop (web.whatsapp.com)
// ─────────────────────────────────────────────────────────

export function sendWhatsAppReceipt(order, settings = {}) {
  const {
    restaurantName = 'The Kruncheez',
    address        = 'Your Address Here',
    phone          = '+92-XXX-XXXXXXX',
  } = settings

  const orderNum = String(order.orderNumber || order.id?.slice(0,4) || '0000').padStart(4, '0')
  const date     = order.createdAt?.toDate
    ? order.createdAt.toDate().toLocaleString('en-PK')
    : new Date().toLocaleString('en-PK')

  // Build items list
  const itemsList = (order.items || [])
    .map(item => `  • ${item.name} x${item.qty}  —  Rs. ${(item.price * item.qty).toLocaleString()}`)
    .join('\n')

  const message = `
🍔 *${restaurantName}*
_Fast • Fresh • Tasty_
━━━━━━━━━━━━━━━━━━━━

🧾 *Order Receipt #${orderNum}*
📅 ${date}
📦 Type: ${(order.orderType || 'Dine-in').toUpperCase()}
${order.tableNumber ? `🪑 Table: ${order.tableNumber}` : ''}
${order.customerAddress ? `📍 Address: ${order.customerAddress}` : ''}

━━━━━━━━━━━━━━━━━━━━
*🛒 Items:*
${itemsList}

━━━━━━━━━━━━━━━━━━━━
💰 Subtotal:   Rs. ${(order.subtotal || 0).toLocaleString()}
🏷️ Tax (5%):   Rs. ${(order.tax || 0).toLocaleString()}
${order.discount > 0 ? `🎁 Discount:  -Rs. ${order.discount.toLocaleString()}\n` : ''}
*💵 TOTAL:     Rs. ${(order.total || 0).toLocaleString()}*
${order.paymentMethod ? `✅ Paid via: ${order.paymentMethod.toUpperCase()}` : ''}

━━━━━━━━━━━━━━━━━━━━
📞 ${phone}
📍 ${address}

_Thank you for choosing ${restaurantName}!_
_We hope to see you again soon 😊_
`.trim()

  const customerPhone = order.customerPhone?.replace(/\D/g, '')
  const encodedMsg    = encodeURIComponent(message)

  // If customer phone exists, open chat directly
  if (customerPhone) {
    // Add Pakistan country code if not present
    const withCode = customerPhone.startsWith('92') ? customerPhone : `92${customerPhone.replace(/^0/, '')}`
    window.open(`https://wa.me/${withCode}?text=${encodedMsg}`, '_blank')
  } else {
    // Open WhatsApp without specific number (user can choose)
    window.open(`https://wa.me/?text=${encodedMsg}`, '_blank')
  }
}

// WhatsApp button component helper
export function getWhatsAppUrl(phone, message) {
  const cleaned   = phone?.replace(/\D/g, '') || ''
  const withCode  = cleaned.startsWith('92') ? cleaned : `92${cleaned.replace(/^0/, '')}`
  const encoded   = encodeURIComponent(message)
  return `https://wa.me/${withCode}?text=${encoded}`
}
