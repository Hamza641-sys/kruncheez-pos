import { useRef, useCallback } from 'react'
import { format } from 'date-fns'

const LOGO_URL = "https://raw.githubusercontent.com/Hamza641-sys/kruncheez-pos/2d3001fc6dcd60cb48032b924788cc86f8012ff0/ChatGPT%20Image%20Sep%2023%2C%202026%2C%2007_33_04%20AM.png"
const ICON_URL = "https://raw.githubusercontent.com/Hamza641-sys/kruncheez-pos/8a7df2faffced87fb77a673066f52592e731e3d9/ChatGPT%20Image%20Sep%2023%2C%202026%2C%2007_52_52%20AM.png"

// ── Receipt Header ────────────────────────────────────────
const RECEIPT_HEADER = `
  <div style="text-align:center;border-bottom:1px dashed #000;padding-bottom:10px;margin-bottom:8px;">
    <img src="${LOGO_URL}" style="width:180px;display:block;margin:0 auto 6px;" alt="The Kruncheez"/>
    <img src="${ICON_URL}" style="width:65px;display:block;margin:0 auto 4px;" alt="Kruncheez Icon"/>
    <div style="font-size:10px;color:#444;margin-top:4px;">Your Address Here</div>
    <div style="font-size:10px;color:#444;">+92-XXX-XXXXXXX</div>
  </div>
`

// ── Generate Items HTML ───────────────────────────────────
function getItemsHTML(items, notePrefix = '*') {
  return (items || []).map(item => `
    <tr>
      <td style="padding:3px 0;font-size:12px;font-weight:700;">${item.name}</td>
      <td style="padding:3px 0;font-size:12px;text-align:center;">x${item.qty}</td>
      <td style="padding:3px 0;font-size:12px;text-align:right;">Rs.${(item.price * item.qty).toLocaleString()}</td>
    </tr>
    ${item.note ? `<tr><td colspan="3" style="font-size:10px;color:#555;font-style:italic;padding-bottom:4px;"> ${notePrefix} ${item.note}</td></tr>` : ''}
  `).join('')
}

// ── Order Info Table ──────────────────────────────────────
function getOrderInfo(order, orderNum, date) {
  return `
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
  `
}

// ── Totals ────────────────────────────────────────────────
function getTotalsHTML(order) {
  return `
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
  `
}

// ── Generate Customer Receipt HTML ────────────────────────
function generateReceiptHTML(order) {
  const orderNum = String(order?.orderNumber || order?.id?.slice(0,4) || '0000').padStart(4,'0')
  const date     = order?.createdAt?.toDate
    ? format(order.createdAt.toDate(), 'dd/MM/yyyy hh:mm a')
    : format(new Date(), 'dd/MM/yyyy hh:mm a')

  return `
    <div style="font-family:'Courier New',monospace;font-size:12px;color:#000;width:100%;line-height:1.5;">
      ${RECEIPT_HEADER}
      ${getOrderInfo(order, orderNum, date)}
      <div style="border-top:1px dashed #000;border-bottom:1px dashed #000;padding:6px 0;margin-bottom:6px;">
        <table style="width:100%;">
          <tr><th style="text-align:left;font-size:11px;padding-bottom:4px;">Item</th><th style="text-align:center;font-size:11px;padding-bottom:4px;">Qty</th><th style="text-align:right;font-size:11px;padding-bottom:4px;">Price</th></tr>
          ${getItemsHTML(order?.items, '*')}
        </table>
      </div>
      ${getTotalsHTML(order)}
      <div style="text-align:center;border-top:1px dashed #000;padding-top:8px;font-size:10px;line-height:1.8;">
        <div>Thank you for visiting! Come again 😊</div>
        <div>★ Powered by Kruncheez POS ★</div>
        <div style="color:#999;">kruncheez-pos.web.app</div>
      </div>
    </div>
  `
}

// ── Generate Kitchen Copy HTML ────────────────────────────
function generateKitchenHTML(order) {
  const orderNum = String(order?.orderNumber || order?.id?.slice(0,4) || '0000').padStart(4,'0')
  const date     = order?.createdAt?.toDate
    ? format(order.createdAt.toDate(), 'dd/MM/yyyy hh:mm a')
    : format(new Date(), 'dd/MM/yyyy hh:mm a')

  return `
    <div style="font-family:'Courier New',monospace;font-size:12px;color:#000;width:100%;line-height:1.5;">
      <div style="text-align:center;background:#000;color:#fff;padding:6px;font-size:13px;font-weight:900;letter-spacing:3px;margin-bottom:8px;">★ KITCHEN COPY ★</div>
      ${RECEIPT_HEADER}
      ${getOrderInfo(order, orderNum, date)}
      <div style="border-top:1px dashed #000;border-bottom:1px dashed #000;padding:6px 0;margin-bottom:6px;">
        <table style="width:100%;">
          <tr><th style="text-align:left;font-size:11px;padding-bottom:4px;">Item</th><th style="text-align:center;font-size:11px;padding-bottom:4px;">Qty</th><th style="text-align:right;font-size:11px;padding-bottom:4px;">Price</th></tr>
          ${getItemsHTML(order?.items, '!!')}
        </table>
      </div>
      ${getTotalsHTML(order)}
      <div style="text-align:center;border-top:1px dashed #000;padding-top:8px;font-size:11px;font-weight:900;letter-spacing:2px;">
        ★ KITCHEN COPY ★
      </div>
    </div>
  `
}

// ── usePrint hook ─────────────────────────────────────────
export function usePrint() {
  const printRef        = useRef(null)
  const kitchenPrintRef = useRef(null)

  const handlePrintBoth = useCallback((order, printerWidth = '80mm') => {
    const receiptHTML = generateReceiptHTML(order)
    const kitchenHTML = generateKitchenHTML(order)
    const printWindow = window.open('', '_blank', 'width=500,height=700')
    printWindow.document.write(`
      <!DOCTYPE html><html><head><title>Kruncheez - Print</title>
      <style>
        *{margin:0;padding:0;box-sizing:border-box;}body{background:#fff;}
        .wrap{width:${printerWidth};padding:8px 6px;}
        .label{text-align:center;font-family:'Courier New',monospace;font-size:11px;font-weight:900;letter-spacing:3px;margin-bottom:8px;padding:4px;border:1px solid #000;}
        .sep{border:none;border-top:2px dashed #000;margin:12px 0;}
        @page{size:${printerWidth} auto;margin:0;}
        @media print{body{width:${printerWidth};}}
      </style></head><body>
        <div class="wrap"><div class="label">*** CUSTOMER COPY ***</div>${receiptHTML}</div>
        <hr class="sep"/>
        <div class="wrap">${kitchenHTML}</div>
      </body></html>
    `)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => { printWindow.print(); printWindow.close() }, 500)
  }, [])

  const handlePrint = useCallback((order, printerWidth = '80mm') => {
    const html = generateReceiptHTML(order)
    const printWindow = window.open('', '_blank', 'width=400,height=600')
    printWindow.document.write(`<!DOCTYPE html><html><head><title>Receipt</title><style>*{margin:0;padding:0;box-sizing:border-box;}body{background:#fff;}@page{size:${printerWidth} auto;margin:2mm;}</style></head><body><div style="padding:6px;">${html}</div></body></html>`)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => { printWindow.print(); printWindow.close() }, 400)
  }, [])

  const handlePrintKitchen = useCallback((order, printerWidth = '58mm') => {
    const html = generateKitchenHTML(order)
    const printWindow = window.open('', '_blank', 'width=300,height=500')
    printWindow.document.write(`<!DOCTYPE html><html><head><title>Kitchen</title><style>*{margin:0;padding:0;box-sizing:border-box;}body{background:#fff;}@page{size:${printerWidth} auto;margin:2mm;}</style></head><body><div style="padding:6px;">${html}</div></body></html>`)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => { printWindow.print(); printWindow.close() }, 400)
  }, [])

  return { printRef, kitchenPrintRef, handlePrint, handlePrintKitchen, handlePrintBoth }
}
