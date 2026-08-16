import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

function fmtCur(n) {
  return (Number(n) || 0).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '€'
}
function fmtDate(d) {
  if (!d) return '--'
  return new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
}

function loadLogo(url) {
  return new Promise(function(resolve) {
    if (!url) { resolve(null); return }
    fetch(url)
      .then(function(res) { return res.blob() })
      .then(function(blob) {
        var reader = new FileReader()
        reader.onloadend = function() {
          var dataUrl = reader.result
          var img = new Image()
          img.onload = function() { resolve({ dataUrl: dataUrl, w: img.width, h: img.height }) }
          img.onerror = function() { resolve(null) }
          img.src = dataUrl
        }
        reader.onerror = function() { resolve(null) }
        reader.readAsDataURL(blob)
      })
      .catch(function() { resolve(null) })
  })
}

export async function downloadQuotePdf(quote, company) {
  var doc = new jsPDF({ unit: 'mm', format: 'a4' })
  var pageWidth = 210
  var marginX   = 18
  var y         = 20

  var logo = await loadLogo(company.logo_url)

  if (logo) {
    var maxH = 16
    var w = maxH * (logo.w / logo.h)
    doc.addImage(logo.dataUrl, marginX, y, w, maxH)
  } else {
    doc.setFillColor(230, 57, 70)
    doc.roundedRect(marginX, y, 16, 16, 2, 2, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text((company.company_name || 'A')[0].toUpperCase(), marginX + 8, y + 11, { align: 'center' })
  }

  var infoY = y + 22
  doc.setTextColor(20, 20, 20)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text(company.company_name || 'Tu empresa', marginX, infoY)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(100, 100, 100)
  var infoLines = []
  if (company.tax_id)      infoLines.push('NIF: ' + company.tax_id)
  if (company.address)     infoLines.push(company.address)
  if (company.postal_code || company.city) infoLines.push((company.postal_code || '') + ' ' + (company.city || ''))
  if (company.email)       infoLines.push(company.email)
  if (company.phone)       infoLines.push(company.phone)
  infoLines.forEach(function(line, i) {
    doc.text(line, marginX, infoY + 5 + i * 4.2)
  })

  doc.setTextColor(20, 20, 20)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(20)
  doc.text('PRESUPUESTO', pageWidth - marginX, y + 6, { align: 'right' })

  doc.setFontSize(12)
  doc.setTextColor(230, 57, 70)
  doc.text(quote.quote_number, pageWidth - marginX, y + 14, { align: 'right' })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(100, 100, 100)
  doc.text('Emision: ' + fmtDate(quote.issue_date), pageWidth - marginX, y + 20, { align: 'right' })
  if (quote.valid_until) {
    doc.text('Valido hasta: ' + fmtDate(quote.valid_until), pageWidth - marginX, y + 25, { align: 'right' })
  }

  var clientY = infoY + 5 + infoLines.length * 4.2 + 10
  var client = quote.clients

  doc.setFillColor(248, 248, 251)
  doc.roundedRect(marginX, clientY, pageWidth - marginX * 2, 22, 2, 2, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(150, 150, 150)
  doc.text('PARA', marginX + 5, clientY + 6)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(20, 20, 20)
  doc.text(client ? (client.company || client.name) : 'Sin cliente', marginX + 5, clientY + 13)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(100, 100, 100)
  var clientSub = []
  if (client && client.company && client.name) clientSub.push(client.name)
  if (client && client.email) clientSub.push(client.email)
  doc.text(clientSub.join('   ·   '), marginX + 5, clientY + 18)

  var items = Array.isArray(quote.items) ? quote.items : []
  var rows = items.map(function(it) {
    var lineTotal = (Number(it.quantity) || 0) * (Number(it.price) || 0)
    return [it.description, String(it.quantity), fmtCur(it.price), fmtCur(lineTotal)]
  })

  autoTable(doc, {
    startY: clientY + 30,
    margin: { left: marginX, right: marginX },
    head: [['Concepto', 'Cant.', 'Precio', 'Total']],
    body: rows,
    theme: 'plain',
    styles: { fontSize: 9, textColor: [40, 40, 40] },
    headStyles: { fontStyle: 'bold', textColor: [20, 20, 20], lineWidth: { bottom: 0.5 }, lineColor: [20, 20, 20] },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { cellWidth: 20, halign: 'right' },
      2: { cellWidth: 30, halign: 'right' },
      3: { cellWidth: 30, halign: 'right' },
    },
    didParseCell: function(data) {
      if (data.section === 'body') {
        data.cell.styles.lineWidth = { bottom: 0.2 }
        data.cell.styles.lineColor = [230, 230, 230]
      }
    },
  })

  var afterTableY = doc.lastAutoTable.finalY + 10

  var totalsX = pageWidth - marginX - 60
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(100, 100, 100)
  doc.text('Subtotal', totalsX, afterTableY)
  doc.setTextColor(20, 20, 20)
  doc.text(fmtCur(quote.subtotal), pageWidth - marginX, afterTableY, { align: 'right' })

  doc.setTextColor(100, 100, 100)
  doc.text('IVA (' + quote.tax_rate + '%)', totalsX, afterTableY + 6)
  doc.setTextColor(20, 20, 20)
  doc.text(fmtCur(quote.tax_amount), pageWidth - marginX, afterTableY + 6, { align: 'right' })

  doc.setDrawColor(20, 20, 20)
  doc.line(totalsX, afterTableY + 10, pageWidth - marginX, afterTableY + 10)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.text('Total', totalsX, afterTableY + 17)
  doc.text(fmtCur(quote.total), pageWidth - marginX, afterTableY + 17, { align: 'right' })

  if (quote.notes) {
    var notesY = afterTableY + 30
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(150, 150, 150)
    doc.text('NOTAS', marginX, notesY)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(100, 100, 100)
    var wrapped = doc.splitTextToSize(quote.notes, pageWidth - marginX * 2)
    doc.text(wrapped, marginX, notesY + 5)
  }

  doc.save(quote.quote_number + '.pdf')
}