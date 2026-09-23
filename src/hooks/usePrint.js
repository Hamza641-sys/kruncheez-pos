import { useRef, useCallback } from 'react'
import { format } from 'date-fns'

// ── Generate Customer Receipt HTML ────────────────────────
function generateReceiptHTML(order, width = '80mm') {
  const orderNum = String(order?.orderNumber || order?.id?.slice(0,4) || '0000').padStart(4,'0')
  const date     = order?.createdAt?.toDate
    ? format(order.createdAt.toDate(), 'dd/MM/yyyy hh:mm a')
    : format(new Date(), 'dd/MM/yyyy hh:mm a')

  const itemsHTML = (order?.items || []).map(item => `
    <tr>
      <td style="padding:3px 0;font-size:12px;font-weight:700;">${item.name}</td>
      <td style="padding:3px 0;font-size:12px;text-align:center;">x${item.qty}</td>
      <td style="padding:3px 0;font-size:12px;text-align:right;">Rs.${(item.price * item.qty).toLocaleString()}</td>
    </tr>
    ${item.note ? `<tr><td colspan="3" style="font-size:10px;color:#555;font-style:italic;padding-bottom:4px;">  * ${item.note}</td></tr>` : ''}
  `).join('')

  return `
    <div style="font-family:'Courier New',monospace;font-size:12px;color:#000;width:100%;line-height:1.5;">

      <!-- Header -->
      <div style="text-align:center;border-bottom:1px dashed #000;padding-bottom:8px;margin-bottom:8px;">
        <div style="font-size:26px;">🍔</div>
        <div style="font-size:16px;font-weight:900;letter-spacing:3px;margin:4px 0;">THE KRUNCHEEZ</div>
        <div style="font-size:10px;letter-spacing:2px;">FAST • FRESH • TASTY</div>
        <div style="font-size:10px;margin-top:3px;">Your Address Here</div>
        <div style="font-size:10px;">+92-XXX-XXXXXXX</div>
      </div>

      <!-- Order Info -->
      <table style="width:100%;font-size:11px;margin-bottom:6px;">
        <tr><td style="color:#333;">Order #</td><td style="text-align:right;font-weight:700;">${orderNum}</td></tr>
        <tr><td style="color:#333;">Date</td><td style="text-align:right;">${date}</td></tr>
        <tr><td style="color:#333;">Type</td><td style="text-align:right;text-transform:capitalize;">${order?.orderType || 'Dine-in'}</td></tr>
        ${order?.tableNumber ? `<tr><td style="color:#333;">Table</td><td style="text-align:right;">${order.tableNumber}</td></tr>` : ''}
        <tr><td style="color:#333;">Customer</td><td style="text-align:right;">${order?.customerName || 'Walk-in'}</td></tr>
        ${order?.customerPhone ? `<tr><td style="color:#333;">Phone</td><td style="text-align:right;">${order.customerPhone}</td></tr>` : ''}
        ${order?.customerAddress ? `<tr><td style="color:#333;">Address</td><td style="text-align:right;">${order.customerAddress}</td></tr>` : ''}
        <tr><td style="color:#333;">Staff</td><td style="text-align:right;">${order?.staffName || 'Cashier'}</td></tr>
      </table>

      <!-- Items -->
      <div style="border-top:1px dashed #000;border-bottom:1px dashed #000;padding:6px 0;margin-bottom:6px;">
        <table style="width:100%;">
          <tr style="border-bottom:1px solid #ccc;">
            <th style="text-align:left;font-size:11px;padding-bottom:4px;">Item</th>
            <th style="text-align:center;font-size:11px;padding-bottom:4px;">Qty</th>
            <th style="text-align:right;font-size:11px;padding-bottom:4px;">Price</th>
          </tr>
          ${itemsHTML}
        </table>
      </div>

      <!-- Totals -->
      <table style="width:100%;font-size:12px;margin-bottom:6px;">
        <tr><td>Subtotal</td><td style="text-align:right;">Rs. ${(order?.subtotal || 0).toLocaleString()}</td></tr>
        ${order?.discount > 0 ? `<tr><td>Discount</td><td style="text-align:right;">- Rs. ${order.discount.toLocaleString()}</td></tr>` : ''}
        <tr><td>Tax (5%)</td><td style="text-align:right;">Rs. ${(order?.tax || 0).toLocaleString()}</td></tr>
        <tr style="border-top:1px dashed #000;">
          <td style="font-size:15px;font-weight:900;padding-top:4px;">TOTAL</td>
          <td style="font-size:15px;font-weight:900;text-align:right;padding-top:4px;">Rs. ${(order?.total || 0).toLocaleString()}</td>
        </tr>
        ${order?.paymentMethod ? `<tr><td style="color:#333;">Paid via</td><td style="text-align:right;text-transform:capitalize;">${order.paymentMethod}</td></tr>` : ''}
        ${order?.amountPaid && order.amountPaid !== order.total ? `
          <tr><td style="color:#333;">Amount Paid</td><td style="text-align:right;">Rs. ${order.amountPaid.toLocaleString()}</td></tr>
          <tr><td style="color:#333;">Change</td><td style="text-align:right;">Rs. ${(order.change || 0).toLocaleString()}</td></tr>
        ` : ''}
      </table>

      <!-- Footer -->
      <div style="text-align:center;border-top:1px dashed #000;padding-top:8px;font-size:10px;line-height:1.8;">
        <div>Thank you for visiting! Come again 😊</div>
        <div>★ Powered by Kruncheez POS ★</div>
        <div style="color:#999;">kruncheez-pos.web.app</div>
      </div>
    </div>
  `
}

// ── Generate Kitchen Slip HTML ────────────────────────────
function generateKitchenHTML(order) {
  const orderNum = String(order?.orderNumber || order?.id?.slice(0,4) || '0000').padStart(4,'0')
  const time     = order?.createdAt?.toDate
    ? format(order.createdAt.toDate(), 'hh:mm a')
    : format(new Date(), 'hh:mm a')

  const itemsHTML = (order?.items || []).map(item => `
    <div style="margin:8px 0;display:flex;align-items:flex-start;gap:8px;">
      <span style="background:#000;color:#fff;padding:2px 7px;font-size:14px;font-weight:900;border-radius:3px;flex-shrink:0;">${item.qty}x</span>
      <div>
        <div style="font-size:14px;font-weight:900;text-transform:uppercase;">${item.name}</div>
        ${item.note ? `<div style="font-size:11px;font-style:italic;color:#444;">!! ${item.note}</div>` : ''}
      </div>
    </div>
  `).join('')

  return `
    <div style="font-family:'Courier New',monospace;font-size:12px;color:#000;width:100%;line-height:1.5;">

      <!-- Header -->
      <div style="text-align:center;border-bottom:2px solid #000;padding-bottom:8px;margin-bottom:8px;">
        <div style="font-size:13px;font-weight:900;letter-spacing:4px;">KITCHEN ORDER</div>
        <div style="font-size:36px;font-weight:900;margin:4px 0;">#${orderNum}</div>
        <div style="font-size:13px;">${time}</div>
      </div>

      <!-- Meta -->
      <table style="width:100%;font-size:13px;font-weight:700;margin-bottom:8px;">
        <tr><td>TYPE:</td><td style="text-align:right;text-transform:uppercase;">${order?.orderType || 'DINE-IN'}</td></tr>
        ${order?.tableNumber ? `<tr><td>TABLE:</td><td style="text-align:right;">${order.tableNumber}</td></tr>` : ''}
        ${order?.customerName && order?.customerName !== 'Walk-in' ? `<tr><td>NAME:</td><td style="text-align:right;">${order.customerName}</td></tr>` : ''}
        ${order?.customerPhone ? `<tr><td>PHONE:</td><td style="text-align:right;">${order.customerPhone}</td></tr>` : ''}
      </table>

      <!-- Items -->
      <div style="border-top:2px solid #000;border-bottom:2px solid #000;padding:8px 0;margin-bottom:8px;">
        ${itemsHTML}
      </div>

      <!-- Footer -->
      <div style="text-align:center;font-size:11px;letter-spacing:2px;">
        ── KRUNCHEEZ KITCHEN ──
      </div>
    </div>
  `
}

// ── usePrint hook ─────────────────────────────────────────
export function usePrint() {
  const printRef        = useRef(null)
  const kitchenPrintRef = useRef(null)

  // ── Print BOTH copies together ──
  const handlePrintBoth = useCallback((order, printerWidth = '80mm') => {
    const receiptHTML = generateReceiptHTML(order, printerWidth)
    const kitchenHTML = generateKitchenHTML(order)

    const printWindow = window.open('', '_blank', 'width=500,height=700')
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Kruncheez POS - Print</title>
          <style>
            * { margin:0; padding:0; box-sizing:border-box; }
            body { background:#fff; }
            .copy-wrap { width:${printerWidth}; padding:8px 6px; }
            .copy-label {
              text-align:center;
              font-family:'Courier New',monospace;
              font-size:11px;
              font-weight:900;
              letter-spacing:3px;
              margin-bottom:8px;
              padding:4px;
              border:1px solid #000;
            }
            .separator {
              border:none;
              border-top:2px dashed #000;
              margin:12px 0;
            }
            @page { size:${printerWidth} auto; margin:0; }
            @media print { body { width:${printerWidth}; } }
          </style>
        </head>
        <body>
          <div class="copy-wrap">
            <div class="copy-label">*** CUSTOMER COPY ***</div>
            ${receiptHTML}
          </div>

          <hr class="separator">

          <div class="copy-wrap">
            <div class="copy-label">*** KITCHEN COPY ***</div>
            ${kitchenHTML}
          </div>
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => { printWindow.print(); printWindow.close() }, 400)
  }, [])

  // ── Print customer receipt only ──
  const handlePrint = useCallback((order, printerWidth = '80mm') => {
    const html = generateReceiptHTML(order, printerWidth)
    const printWindow = window.open('', '_blank', 'width=400,height=600')
    printWindow.document.write(`
      <!DOCTYPE html><html><head><title>Receipt</title>
      <style>
        *{margin:0;padding:0;box-sizing:border-box;}
        body{background:#fff;}
        @page{size:${printerWidth} auto;margin:2mm;}
      </style>
      </head><body><div style="padding:6px;">${html}</div></body></html>
    `)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => { printWindow.print(); printWindow.close() }, 350)
  }, [])

  // ── Print kitchen slip only ──
  const handlePrintKitchen = useCallback((order, printerWidth = '58mm') => {
    const html = generateKitchenHTML(order)
    const printWindow = window.open('', '_blank', 'width=300,height=500')
    printWindow.document.write(`
      <!DOCTYPE html><html><head><title>Kitchen</title>
      <style>
        *{margin:0;padding:0;box-sizing:border-box;}
        body{background:#fff;}
        @page{size:${printerWidth} auto;margin:2mm;}
      </style>
      </head><body><div style="padding:6px;">${html}</div></body></html>
    `)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => { printWindow.print(); printWindow.close() }, 350)
  }, [])

  return { printRef, kitchenPrintRef, handlePrint, handlePrintKitchen, handlePrintBoth }
}
