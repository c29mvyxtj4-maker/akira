import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

function fmtCur(n) { return (Number(n) || 0).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '€' }
function fmtDate(d) { if (!d) return '--'; return new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }) }

function loadLogo(url) {
  return new Promise(function(resolve) {
    if (!url) { resolve(null); return }
    fetch(url).then(function(res) { return res.blob() }).then(function(blob) {
      var reader = new FileReader()
      reader.onloadend = function() {
        var img = new Image()
        img.onload = function() { resolve({ dataUrl: reader.result, w: img.width, h: img.height }) }
        img.onerror = function() { resolve(null) }
        img.src = reader.result
      }
      reader.onerror = function() { resolve(null) }
      reader.readAsDataURL(blob)
    }).catch(function() { resolve(null) })
  })
}

export async function downloadDocumentPdf(doc, company) {
  var isQuote = doc.document_type === 'quote'
  var pdf = new jsPDF({ unit: 'mm', format: 'a4' })
  var pageWidth = 210
  var marginX   = 18
  var y         = 20

  var logo = await loadLogo(company.logo_url)
  if (logo) {
    var maxH = 16
    var w = maxH * (logo.w / logo.h)
    pdf.addImage(logo.dataUrl, marginX, y, w, maxH)
  } else {
    pdf.setFillColor(230, 57, 70)
    pdf.roundedRect(marginX, y, 16, 16, 2, 2, 'F')
    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(14)
    pdf.setFont('helvetica', 'bold')
    pdf.text((company.company_name || 'A')[0].toUpperCase(), marginX + 8, y + 11, { align: 'center' })
  }

  var infoY = y + 22
  pdf.setTextColor(20, 20, 20)
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(11)
  pdf.text(company.company_name || 'Tu empresa', marginX, infoY)

  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(9)
  pdf.setTextColor(100, 100, 100)
  var infoLines = []
  if (company.tax_id)  infoLines.push('NIF: ' + company.tax_id)
  if (company.address) infoLines.push(company.address)
  if (company.postal_code || company.city) infoLines.push((company.postal_code || '') + ' ' + (company.city || ''))
  if (company.email)   infoLines.push(company.email)
  if (company.phone)   infoLines.push(company.phone)
  infoLines.forEach(function(line, i) { pdf.text(line, marginX, infoY + 5 + i * 4.2) })

  pdf.setTextColor(20, 20, 20)
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(20)
  pdf.text(isQuote ? 'PRESUPUESTO' : 'FACTURA', pageWidth - marginX, y + 6, { align: 'right' })

  pdf.setFontSize(12)
  pdf.setTextColor(230, 57, 70)
  pdf.text(isQuote ? doc.quote_number : doc.invoice_number, pageWidth - marginX, y + 14, { align: 'right' })

  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(9)
  pdf.setTextColor(100, 100, 100)
  pdf.text('Emision: ' + fmtDate(doc.issue_date), pageWidth - marginX, y + 20, { align: 'right' })
  var secondDate = isQuote ? doc.valid_until : doc.due_date
  if (secondDate) {
    pdf.text((isQuote ? 'Valido hasta: ' : 'Vencimiento: ') + fmtDate(secondDate), pageWidth - marginX, y + 25, { align: 'right' })
  }

  var clientY = infoY + 5 + infoLines.length * 4.2 + 10
  var client = doc.clients

  pdf.setFillColor(248, 248, 251)
  pdf.roundedRect(marginX, clientY, pageWidth - marginX * 2, 22, 2, 2, 'F')
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(8)
  pdf.setTextColor(150, 150, 150)
  pdf.text(isQuote ? 'PARA' : 'FACTURAR A', marginX + 5, clientY + 6)
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(11)
  pdf.setTextColor(20, 20, 20)
  pdf.text(client ? (client.company || client.name) : 'Sin cliente', marginX + 5, clientY + 13)
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(9)
  pdf.setTextColor(100, 100, 100)
  var clientSub = []
  if (client && client.company && client.name) clientSub.push(client.name)
  if (client && client.email) clientSub.push(client.email)
  pdf.text(clientSub.join('   ·   '), marginX + 5, clientY + 18)

  var items = Array.isArray(doc.items) ? doc.items : []
  var rows = items.map(function(it) {
    var lineTotal = (Number(it.quantity) || 0) * (Number(it.price) || 0)
    return [it.description, String(it.quantity), fmtCur(it.price), fmtCur(lineTotal)]
  })

  autoTable(pdf, {
    startY: clientY + 30, margin: { left: marginX, right: marginX },
    head: [['Concepto', 'Cant.', 'Precio', 'Total']], body: rows, theme: 'plain',
    styles: { fontSize: 9, textColor: [40, 40, 40] },
    headStyles: { fontStyle: 'bold', textColor: [20, 20, 20], lineWidth: { bottom: 0.5 }, lineColor: [20, 20, 20] },
    columnStyles: { 0: { cellWidth: 'auto' }, 1: { cellWidth: 20, halign: 'right' }, 2: { cellWidth: 30, halign: 'right' }, 3: { cellWidth: 30, halign: 'right' } },
    didParseCell: function(data) { if (data.section === 'body') { data.cell.styles.lineWidth = { bottom: 0.2 }; data.cell.styles.lineColor = [230, 230, 230] } },
  })

  var afterTableY = pdf.lastAutoTable.finalY + 10
  var totalsX = pageWidth - marginX - 60
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(9)
  pdf.setTextColor(100, 100, 100)
  pdf.text('Subtotal', totalsX, afterTableY)
  pdf.setTextColor(20, 20, 20)
  pdf.text(fmtCur(doc.subtotal), pageWidth - marginX, afterTableY, { align: 'right' })
  pdf.setTextColor(100, 100, 100)
  pdf.text('IVA (' + doc.tax_rate + '%)', totalsX, afterTableY + 6)
  pdf.setTextColor(20, 20, 20)
  pdf.text('+' + fmtCur(doc.tax_amount), pageWidth - marginX, afterTableY + 6, { align: 'right' })

  var lineExtra = 0
  if (doc.irpf_rate > 0) {
    pdf.setTextColor(100, 100, 100)
    pdf.text('Retencion IRPF (' + doc.irpf_rate + '%)', totalsX, afterTableY + 12)
    pdf.setTextColor(20, 20, 20)
    pdf.text('-' + fmtCur(doc.irpf_amount), pageWidth - marginX, afterTableY + 12, { align: 'right' })
    lineExtra = 6
  }

  pdf.setDrawColor(20, 20, 20)
  pdf.line(totalsX, afterTableY + 10 + lineExtra, pageWidth - marginX, afterTableY + 10 + lineExtra)
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(13)
  pdf.text('Total', totalsX, afterTableY + 17 + lineExtra)
  pdf.text(fmtCur(doc.total), pageWidth - marginX, afterTableY + 17 + lineExtra, { align: 'right' })

  if (doc.notes) {
    var notesY = afterTableY + 30
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(8)
    pdf.setTextColor(150, 150, 150)
    pdf.text('NOTAS', marginX, notesY)
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(9)
    pdf.setTextColor(100, 100, 100)
    pdf.text(pdf.splitTextToSize(doc.notes, pageWidth - marginX * 2), marginX, notesY + 5)
  }

  pdf.save((isQuote ? doc.quote_number : doc.invoice_number) + '.pdf')
}