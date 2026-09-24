import { useRef, useCallback } from 'react'
import { format } from 'date-fns'

const LOGO_URL = "https://raw.githubusercontent.com/Hamza641-sys/kruncheez-pos/2d3001fc6dcd60cb48032b924788cc86f8012ff0/ChatGPT%20Image%20Sep%2023%2C%202026%2C%2007_33_04%20AM.png"

// ── CUSTOMER COPY ─────────────────────────────────────────
function generateReceiptHTML(order) {
  const orderNum  = String(order?.orderNumber || order?.id?.slice(0,4) || '0000').padStart(4,'0')
  const invoiceNum= String(order?.orderNumber || '0000')
  const date      = order?.createdAt?.toDate
    ? format(order.createdAt.toDate(), 'dd-MMM-yy')
    : format(new Date(), 'dd-MMM-yy')
  const time      = order?.createdAt?.toDate
    ? format(order.createdAt.toDate(), 'hh:mm:ss a')
    : format(new Date(), 'hh:mm:ss a')

  const itemsHTML = (order?.items || []).map(item => `
    <tr>
      <td style="padding:3px 2px;font-size:11px;border-bottom:1px dotted #ccc;">${item.name}<br/>
        <span style="font-size:10px;color:#555;">${item.price.toLocaleString()}</span>
      </td>
      <td style="padding:3px 2px;font-size:11px;text-align:center;border-bottom:1px dotted #ccc;">${item.qty}</td>
      <td style="padding:3px 2px;font-size:11px;text-align:right;border-bottom:1px dotted #ccc;">${(item.price * item.qty).toLocaleString()}</td>
    </tr>
  `).join('')

  const subtotal  = order?.subtotal || 0
  const tax       = order?.tax || 0
  const discount  = order?.discount || 0
  const total     = order?.total || 0
  const delivery  = order?.orderType === 'delivery' ? (order?.deliveryCharge || 0) : 0

  return `
    <div style="font-family:'Courier New',Courier,monospace;font-size:12px;color:#000;width:100%;line-height:1.6;">

      <!-- Logo & Header -->
      <div style="text-align:center;margin-bottom:6px;">
        <img src="${LOGO_URL}" style="width:140px;display:block;margin:0 auto 4px;" alt="The Kruncheez"/>
        <div style="font-size:11px;">New Officers Housing Society, Northeren Bypass Peshawar</div>
        <div style="font-size:11px;">0317-7707844 / 0309-5248080 / 0333-4007107</div>
      </div>

      <div style="border-top:1px solid #000;border-bottom:1px solid #000;margin:6px 0;padding:2px 0;"></div>

      <!-- Token & Invoice -->
      <table style="width:100%;font-size:11px;margin-bottom:4px;">
        <tr>
          <td style="width:50%;">Token #</td>
          <td style="text-align:right;font-weight:700;">${orderNum}</td>
        </tr>
        <tr>
          <td>Invoice #</td>
          <td style="text-align:right;">${invoiceNum}</td>
        </tr>
      </table>

      <!-- Date Time Floor Table -->
      <table style="width:100%;font-size:11px;margin-bottom:4px;">
        <tr>
          <td>Date: <strong>${date}</strong></td>
          <td style="text-align:right;">Time: <strong>${time}</strong></td>
        </tr>
        <tr>
          <td>Floor: <strong>${order?.tableFloor || 'Ground Floor'}</strong></td>
          <td style="text-align:right;">Table: <strong>${order?.tableNumber || 'T/O'}</strong></td>
        </tr>
      </table>

      <!-- Customer Info -->
      <table style="width:100%;font-size:11px;margin-bottom:4px;">
        <tr><td>Name:</td><td style="text-align:right;">${order?.customerName || 'Walk-in'}</td></tr>
        <tr><td>Mob No:</td><td style="text-align:right;">${order?.customerPhone || '---'}</td></tr>
        <tr><td>Customer Address:</td><td style="text-align:right;">${order?.customerAddress || 'none'}</td></tr>
      </table>

      <div style="border-top:1px solid #000;margin:4px 0;"></div>

      <!-- Items Header -->
      <table style="width:100%;font-size:11px;">
        <tr style="border-bottom:1px solid #000;">
          <th style="text-align:left;padding:2px;font-size:11px;">Desc</th>
          <th style="text-align:left;padding:2px;font-size:11px;">Price</th>
          <th style="text-align:center;padding:2px;font-size:11px;">Qty</th>
          <th style="text-align:right;padding:2px;font-size:11px;">Amount</th>
        </tr>
        ${(order?.items || []).map(item => `
          <tr>
            <td style="padding:3px 2px;font-size:11px;border-bottom:1px dotted #ccc;" colspan="1">${item.name}</td>
            <td style="padding:3px 2px;font-size:11px;border-bottom:1px dotted #ccc;">${item.price.toLocaleString()}</td>
            <td style="padding:3px 2px;font-size:11px;text-align:center;border-bottom:1px dotted #ccc;">${item.qty}</td>
            <td style="padding:3px 2px;font-size:11px;text-align:right;border-bottom:1px dotted #ccc;">${(item.price * item.qty).toLocaleString()}</td>
          </tr>
        `).join('')}
      </table>

      <div style="border-top:1px solid #000;margin:4px 0;"></div>

      <!-- Totals -->
      <table style="width:100%;font-size:11px;margin-bottom:4px;">
        <tr><td>Sub Total:</td><td style="text-align:right;">${subtotal.toLocaleString()}.00</td></tr>
        <tr><td>Delivery:</td><td style="text-align:right;">${delivery.toLocaleString()}.00</td></tr>
        ${discount > 0 ? `<tr><td>Discount:</td><td style="text-align:right;">-${discount.toLocaleString()}.00</td></tr>` : ''}
        <tr><td>${tax > 0 ? tax : '0.00'} %Serv</td><td style="text-align:right;">${tax > 0 ? tax.toLocaleString() : '0.00'}</td></tr>
      </table>

      <div style="border-top:2px solid #000;margin:4px 0;"></div>

      <table style="width:100%;font-size:14px;font-weight:900;margin-bottom:6px;">
        <tr>
          <td>Total:</td>
          <td style="text-align:right;">${total.toLocaleString()}.00</td>
        </tr>
      </table>

      ${order?.paymentMethod ? `
      <div style="font-size:11px;margin-bottom:4px;">Payment: <strong style="text-transform:capitalize;">${order.paymentMethod}</strong>
        ${order?.amountPaid ? ` | Received: Rs.${order.amountPaid.toLocaleString()}` : ''}
        ${order?.change > 0 ? ` | Change: Rs.${order.change.toLocaleString()}` : ''}
      </div>` : ''}

      <div style="text-align:center;font-size:11px;font-weight:700;margin:6px 0;">Thanks for your trust</div>

      <div style="border-top:1px dashed #000;margin:4px 0;"></div>
      <div style="font-size:10px;color:#666;text-align:center;">Software Developed By: Kruncheez POS</div>
    </div>
  `
}

// ── KITCHEN COPY ──────────────────────────────────────────
function generateKitchenHTML(order) {
  const orderNum  = String(order?.orderNumber || order?.id?.slice(0,4) || '0000').padStart(4,'0')
  const invoiceNum= String(order?.orderNumber || '0000')
  const date      = order?.createdAt?.toDate
    ? format(order.createdAt.toDate(), 'dd-MMM-yy')
    : format(new Date(), 'dd-MMM-yy')
  const time      = order?.createdAt?.toDate
    ? format(order.createdAt.toDate(), 'hh:mm:ss a')
    : format(new Date(), 'hh:mm:ss a')

  return `
    <div style="font-family:'Courier New',Courier,monospace;font-size:12px;color:#000;width:100%;line-height:1.6;">

      <!-- Token & Invoice -->
      <table style="width:100%;font-size:11px;margin-bottom:4px;">
        <tr>
          <td style="width:50%;">Token #</td>
          <td style="text-align:right;font-weight:700;">${orderNum}</td>
        </tr>
        <tr>
          <td>Invoice #</td>
          <td style="text-align:right;">${invoiceNum}</td>
        </tr>
      </table>

      <!-- Date Time Floor Table -->
      <table style="width:100%;font-size:11px;margin-bottom:4px;">
        <tr>
          <td>Date: <strong>${date}</strong></td>
          <td style="text-align:right;">Time: <strong>${time}</strong></td>
        </tr>
        <tr>
          <td>Floor: <strong>${order?.tableFloor || 'Ground Floor'}</strong></td>
          <td style="text-align:right;">Table: <strong>${order?.tableNumber || 'T/O'}</strong></td>
        </tr>
      </table>

      <div style="border-top:1px solid #000;margin:4px 0;"></div>

      <!-- Items — Kitchen only needs Description + Qty -->
      <table style="width:100%;font-size:12px;">
        <tr style="border-bottom:1px solid #000;">
          <th style="text-align:left;padding:3px 2px;">Description</th>
          <th style="text-align:right;padding:3px 2px;">Qty</th>
        </tr>
        ${(order?.items || []).map(item => `
          <tr>
            <td style="padding:4px 2px;font-size:12px;font-weight:700;border-bottom:1px dotted #ccc;">${item.name}
              ${item.note ? `<br/><span style="font-size:10px;font-style:italic;font-weight:400;">!! ${item.note}</span>` : ''}
            </td>
            <td style="padding:4px 2px;font-size:13px;font-weight:900;text-align:right;border-bottom:1px dotted #ccc;">${item.qty}.00</td>
          </tr>
        `).join('')}
      </table>

      <div style="border-top:1px solid #000;margin:8px 0 4px;"></div>

      <!-- Comments Box -->
      <div style="font-size:11px;margin-bottom:4px;font-weight:700;">Comments</div>
      <div style="border:1px solid #000;min-height:40px;padding:4px;font-size:11px;">
        ${order?.note || ''}
      </div>

    </div>
  `
}

// ── usePrint hook ─────────────────────────────────────────
export function usePrint() {
  const printRef        = useRef(null)
  const kitchenPrintRef = useRef(null)

  const BASE_STYLE = `
    *{margin:0;padding:0;box-sizing:border-box;}
    body{background:#fff;}
    @page{size:80mm auto;margin:2mm;}
    @media print{body{width:80mm;}}
  `

  // Print BOTH copies
  const handlePrintBoth = useCallback((order, printerWidth = '80mm') => {
    const receiptHTML = generateReceiptHTML(order)
    const kitchenHTML = generateKitchenHTML(order)
    const win = window.open('', '_blank', 'width=500,height=800')
    win.document.write(`
      <!DOCTYPE html><html><head><title>Print</title>
      <style>
        ${BASE_STYLE}
        .wrap{width:${printerWidth};padding:6px;}
        .sep{border:none;border-top:2px dashed #000;margin:10px 0;}
      </style></head><body>
        <div class="wrap">${receiptHTML}</div>
        <hr class="sep"/>
        <div class="wrap">${kitchenHTML}</div>
      </body></html>
    `)
    win.document.close()
    win.focus()
    setTimeout(() => { win.print(); win.close() }, 500)
  }, [])

  // Print customer only
  const handlePrint = useCallback((order, printerWidth = '80mm') => {
    const html = generateReceiptHTML(order)
    const win = window.open('', '_blank', 'width=400,height=600')
    win.document.write(`<!DOCTYPE html><html><head><title>Receipt</title><style>${BASE_STYLE}</style></head><body><div style="padding:6px;">${html}</div></body></html>`)
    win.document.close()
    win.focus()
    setTimeout(() => { win.print(); win.close() }, 400)
  }, [])

  // Print kitchen only
  const handlePrintKitchen = useCallback((order, printerWidth = '80mm') => {
    const html = generateKitchenHTML(order)
    const win = window.open('', '_blank', 'width=400,height=500')
    win.document.write(`<!DOCTYPE html><html><head><title>Kitchen</title><style>${BASE_STYLE}</style></head><body><div style="padding:6px;">${html}</div></body></html>`)
    win.document.close()
    win.focus()
    setTimeout(() => { win.print(); win.close() }, 400)
  }, [])

  return { printRef, kitchenPrintRef, handlePrint, handlePrintKitchen, handlePrintBoth }
}
