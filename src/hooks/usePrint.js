import { useRef, useCallback } from 'react'

// ── usePrint hook ─────────────────────────────────────────
// Single print: prints both Customer Receipt + Kitchen Slip
// together in one print dialog — two copies, one click!
// ─────────────────────────────────────────────────────────

export function usePrint() {
  const printRef        = useRef(null) // Customer receipt ref
  const kitchenPrintRef = useRef(null) // Kitchen slip ref

  // Print BOTH copies together (customer + kitchen)
  const handlePrintBoth = useCallback((printerWidth = '80mm') => {
    const receipt = printRef.current
    const kitchen = kitchenPrintRef.current
    if (!receipt) return

    const printWindow = window.open('', '_blank', 'width=500,height=700')
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Kruncheez POS - Print</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: 'Courier New', monospace;
              background: #fff;
              color: #000;
            }

            /* Each copy section */
            .copy-section {
              width: ${printerWidth};
              padding: 6px 4px;
            }

            /* Dashed separator between copies */
            .copy-separator {
              border: none;
              border-top: 2px dashed #000;
              margin: 10px 0;
              width: 100%;
            }

            .copy-label {
              text-align: center;
              font-size: 10px;
              font-weight: 700;
              letter-spacing: 2px;
              margin-bottom: 6px;
              color: #333;
            }

            /* Receipt styles */
            .receipt {
              width: 100%;
              font-family: 'Courier New', Courier, monospace;
              font-size: 12px;
              color: #000;
              line-height: 1.4;
            }
            .receipt-header { text-align: center; margin-bottom: 6px; }
            .receipt-logo   { font-size: 24px; margin-bottom: 4px; }
            .receipt-name   { font-size: 15px; font-weight: 900; letter-spacing: 2px; }
            .receipt-tagline{ font-size: 10px; letter-spacing: 1px; margin: 2px 0; }
            .receipt-address{ font-size: 10px; margin: 2px 0; }
            .receipt-phone  { font-size: 10px; }
            .receipt-divider{ text-align: center; font-size: 11px; color: #555; margin: 4px 0; }
            .receipt-info   { margin: 4px 0; }
            .receipt-row    { display: flex; justify-content: space-between; margin: 2px 0; font-size: 11px; }
            .receipt-items-header { display: flex; justify-content: space-between; font-weight: 700; font-size: 11px; padding: 2px 0; }
            .receipt-item   { margin: 4px 0; font-size: 11px; }
            .receipt-item-name   { font-weight: 700; display: block; }
            .receipt-item-detail { display: flex; justify-content: space-between; }
            .receipt-item-unit   { color: #555; font-size: 10px; }
            .receipt-item-note   { color: #777; font-size: 10px; font-style: italic; }
            .receipt-totals { margin: 4px 0; }
            .receipt-grand  { font-weight: 900; font-size: 14px; margin: 4px 0; display: flex; justify-content: space-between; }
            .receipt-footer { text-align: center; font-size: 10px; margin-top: 8px; line-height: 1.6; }

            /* Kitchen slip styles */
            .kitchen-slip { width: 100%; font-family: 'Courier New', monospace; font-size: 12px; background: #fff; color: #000; line-height: 1.5; }
            .ks-header    { text-align: center; margin-bottom: 4px; }
            .ks-title     { font-size: 13px; font-weight: 900; letter-spacing: 3px; }
            .ks-num       { font-size: 20px; font-weight: 900; margin: 2px 0; }
            .ks-time      { font-size: 11px; }
            .ks-divider   { text-align: center; font-size: 10px; margin: 3px 0; }
            .ks-meta      { font-size: 12px; margin: 4px 0; line-height: 1.6; }
            .ks-items     { margin: 4px 0; }
            .ks-item      { margin: 6px 0; }
            .ks-qty       { font-weight: 900; font-size: 14px; margin-right: 4px; }
            .ks-name      { font-weight: 700; font-size: 13px; }
            .ks-note      { font-size: 11px; font-style: italic; color: #333; }
            .ks-footer    { text-align: center; font-size: 10px; letter-spacing: 2px; margin-top: 4px; }

            @page {
              size: ${printerWidth} auto;
              margin: 2mm;
            }
            @media print {
              body { width: ${printerWidth}; }
            }
          </style>
        </head>
        <body>
          <!-- ── CUSTOMER COPY ── -->
          <div class="copy-section">
            <div class="copy-label">★ CUSTOMER COPY ★</div>
            ${receipt.innerHTML}
          </div>

          <!-- ── SEPARATOR ── -->
          <hr class="copy-separator" />

          <!-- ── KITCHEN COPY ── -->
          <div class="copy-section">
            <div class="copy-label">★ KITCHEN COPY ★</div>
            ${kitchen ? kitchen.innerHTML : receipt.innerHTML}
          </div>
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 350)
  }, [])

  // Print ONLY customer receipt
  const handlePrint = useCallback((printerWidth = '80mm') => {
    const content = printRef.current
    if (!content) return

    const printWindow = window.open('', '_blank', 'width=400,height=600')
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Kruncheez - Receipt</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Courier New', monospace; }
            .receipt { width: 100%; font-family: 'Courier New', Courier, monospace; font-size: 12px; color: #000; line-height: 1.4; }
            .receipt-header { text-align: center; margin-bottom: 6px; }
            .receipt-logo   { font-size: 24px; margin-bottom: 4px; }
            .receipt-name   { font-size: 15px; font-weight: 900; letter-spacing: 2px; }
            .receipt-tagline{ font-size: 10px; letter-spacing: 1px; margin: 2px 0; }
            .receipt-address{ font-size: 10px; margin: 2px 0; }
            .receipt-phone  { font-size: 10px; }
            .receipt-divider{ text-align: center; font-size: 11px; color: #555; margin: 4px 0; }
            .receipt-info   { margin: 4px 0; }
            .receipt-row    { display: flex; justify-content: space-between; margin: 2px 0; font-size: 11px; }
            .receipt-items-header { display: flex; justify-content: space-between; font-weight: 700; font-size: 11px; padding: 2px 0; }
            .receipt-item   { margin: 4px 0; font-size: 11px; }
            .receipt-item-name   { font-weight: 700; display: block; }
            .receipt-item-detail { display: flex; justify-content: space-between; }
            .receipt-item-unit   { color: #555; font-size: 10px; }
            .receipt-item-note   { color: #777; font-size: 10px; font-style: italic; }
            .receipt-totals { margin: 4px 0; }
            .receipt-grand  { font-weight: 900; font-size: 14px; margin: 4px 0; display: flex; justify-content: space-between; }
            .receipt-footer { text-align: center; font-size: 10px; margin-top: 8px; line-height: 1.6; }
            @page { size: ${printerWidth} auto; margin: 2mm; }
          </style>
        </head>
        <body>${content.innerHTML}</body>
      </html>
    `)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => { printWindow.print(); printWindow.close() }, 300)
  }, [])

  // Print ONLY kitchen slip
  const handlePrintKitchen = useCallback((printerWidth = '58mm') => {
    const content = kitchenPrintRef.current || printRef.current
    if (!content) return

    const printWindow = window.open('', '_blank', 'width=300,height=500')
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Kruncheez - Kitchen</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Courier New', monospace; }
            .kitchen-slip { width: 100%; font-family: 'Courier New', monospace; font-size: 12px; color: #000; line-height: 1.5; }
            .ks-header { text-align: center; margin-bottom: 4px; }
            .ks-title  { font-size: 13px; font-weight: 900; letter-spacing: 3px; }
            .ks-num    { font-size: 20px; font-weight: 900; margin: 2px 0; }
            .ks-time   { font-size: 11px; }
            .ks-divider{ text-align: center; font-size: 10px; margin: 3px 0; }
            .ks-meta   { font-size: 12px; margin: 4px 0; line-height: 1.6; }
            .ks-items  { margin: 4px 0; }
            .ks-item   { margin: 6px 0; }
            .ks-qty    { font-weight: 900; font-size: 14px; margin-right: 4px; }
            .ks-name   { font-weight: 700; font-size: 13px; }
            .ks-note   { font-size: 11px; font-style: italic; }
            .ks-footer { text-align: center; font-size: 10px; letter-spacing: 2px; margin-top: 4px; }
            @page { size: ${printerWidth} auto; margin: 2mm; }
          </style>
        </head>
        <body>${content.innerHTML}</body>
      </html>
    `)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => { printWindow.print(); printWindow.close() }, 300)
  }, [])

  return { printRef, kitchenPrintRef, handlePrint, handlePrintKitchen, handlePrintBoth }
}
