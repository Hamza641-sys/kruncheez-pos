import { useRef, useCallback } from 'react'

// ── usePrint hook ─────────────────────────────────────────
// Usage:
//   const { printRef, handlePrint } = usePrint()
//   <div ref={printRef}><Receipt order={order} /></div>
//   <button onClick={handlePrint}>Print</button>
// ─────────────────────────────────────────────────────────

export function usePrint() {
  const printRef = useRef(null)

  const handlePrint = useCallback((printerWidth = '80mm') => {
    const content = printRef.current
    if (!content) return

    const printWindow = window.open('', '_blank', 'width=400,height=600')
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Kruncheez POS - Print</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Courier New', monospace; }
            @page { size: ${printerWidth} auto; margin: 0mm; }
            @media print {
              body { width: ${printerWidth}; }
            }
          </style>
        </head>
        <body>
          ${content.innerHTML}
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.focus()

    // Small delay for styles to load
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 300)
  }, [])

  return { printRef, handlePrint }
}
