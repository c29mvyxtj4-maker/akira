import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

function fmtCur(n) { return (Number(n) || 0).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '€' }
function fmtDate(d) { if (!d) return '--'; return new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }) }

export function downloadQuarterlyReportPdf(report, company) {
  var pdf = new jsPDF({ unit: 'mm', format: 'a4' })
  var marginX = 18
  var pageWidth = 210
  var y = 20

  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(18)
  pdf.setTextColor(20, 20, 20)
  pdf.text('Informe trimestral', marginX, y)

  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(11)
  pdf.setTextColor(230, 57, 70)
  pdf.text('T' + report.quarter + ' ' + report.year + ' — ' + fmtDate(report.range.start) + ' a ' + fmtDate(report.range.end), marginX, y + 8)

  pdf.setFontSize(10)
  pdf.setTextColor(100, 100, 100)
  pdf.text(company.company_name || '', marginX, y + 16)
  if (company.tax_id) pdf.text('NIF: ' + company.tax_id, marginX, y + 21)

  var summaryY = y + 32
  pdf.setFillColor(248, 248, 251)
  pdf.roundedRect(marginX, summaryY, pageWidth - marginX * 2, 52, 3, 3, 'F')

  var rows = [
    ['Base imponible facturada', fmtCur(report.totals.subtotal)],
    ['IVA repercutido', fmtCur(report.totals.ivaRepercutido)],
    ['Retencion IRPF practicada', '-' + fmtCur(report.totals.irpfRetenido)],
    ['Total facturado (cobrado o por cobrar)', fmtCur(report.totals.totalFacturado)],
    ['Gastos del trimestre', fmtCur(report.totals.totalGastos)],
    ['Beneficio (base imponible - gastos)', fmtCur(report.totals.beneficio)],
  ]

  pdf.setFontSize(10)
  rows.forEach(function(row, i) {
    var rowY = summaryY + 10 + i * 7
    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(80, 80, 80)
    pdf.text(row[0], marginX + 8, rowY)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(20, 20, 20)
    pdf.text(row[1], pageWidth - marginX - 8, rowY, { align: 'right' })
  })

  var afterSummaryY = summaryY + 62

  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(12)
  pdf.setTextColor(20, 20, 20)
  pdf.text('Facturas emitidas (' + report.invoices.length + ')', marginX, afterSummaryY)

  var invoiceRows = report.invoices.map(function(inv) {
    var client = inv.clients
    return [
      inv.invoice_number,
      fmtDate(inv.issue_date),
      client ? (client.company || client.name) : '--',
      fmtCur(inv.subtotal),
      fmtCur(inv.tax_amount),
      inv.irpf_amount > 0 ? '-' + fmtCur(inv.irpf_amount) : '--',
      fmtCur(inv.total),
    ]
  })

  autoTable(pdf, {
    startY: afterSummaryY + 5,
    margin: { left: marginX, right: marginX },
    head: [['Numero', 'Fecha', 'Cliente', 'Base', 'IVA', 'IRPF', 'Total']],
    body: invoiceRows.length > 0 ? invoiceRows : [['Sin facturas en este periodo', '', '', '', '', '', '']],
    theme: 'plain',
    styles: { fontSize: 8, textColor: [40, 40, 40] },
    headStyles: { fontStyle: 'bold', textColor: [20, 20, 20], lineWidth: { bottom: 0.5 }, lineColor: [20, 20, 20] },
    columnStyles: { 3: { halign: 'right' }, 4: { halign: 'right' }, 5: { halign: 'right' }, 6: { halign: 'right' } },
  })

  var afterInvoicesY = pdf.lastAutoTable.finalY + 14

  if (afterInvoicesY > 250) {
    pdf.addPage()
    afterInvoicesY = 20
  }

  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(12)
  pdf.setTextColor(20, 20, 20)
  pdf.text('Gastos registrados (' + report.expenses.length + ')', marginX, afterInvoicesY)

  var expenseRows = report.expenses.map(function(e) {
    return [fmtDate(e.entry_date), e.category || 'General', e.description || '--', fmtCur(e.amount)]
  })

  autoTable(pdf, {
    startY: afterInvoicesY + 5,
    margin: { left: marginX, right: marginX },
    head: [['Fecha', 'Categoria', 'Descripcion', 'Importe']],
    body: expenseRows.length > 0 ? expenseRows : [['Sin gastos en este periodo', '', '', '']],
    theme: 'plain',
    styles: { fontSize: 8, textColor: [40, 40, 40] },
    headStyles: { fontStyle: 'bold', textColor: [20, 20, 20], lineWidth: { bottom: 0.5 }, lineColor: [20, 20, 20] },
    columnStyles: { 3: { halign: 'right' } },
  })

  pdf.save('informe-trimestral-T' + report.quarter + '-' + report.year + '.pdf')
}