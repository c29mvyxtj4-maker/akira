import { useState } from 'react'
import { downloadCsv, downloadExport } from '@db/queries/export.service'
import { getQuarterlyReport } from '@db/queries/quarterlyReport.service'
import { getCompanySettings } from '@db/queries/company.service'
import { downloadQuarterlyReportPdf } from '@/utils/generateQuarterlyReportPdf'
import { INP, Section, Toast } from './_shared'

function QuarterlyReportPicker() {
  var now = new Date()
  var currentQuarter = Math.floor(now.getMonth() / 3) + 1
  var [year, setYear] = useState(now.getFullYear())
  var [quarter, setQuarter] = useState(currentQuarter)
  var [generating, setGenerating] = useState(false)

  function handleGenerate() {
    setGenerating(true)
    Promise.all([getQuarterlyReport(year, quarter), getCompanySettings()])
      .then(function(results) {
        downloadQuarterlyReportPdf(results[0], results[1])
      })
      .catch(function(e) { window.alert('Error: ' + e.message) })
      .finally(function() { setGenerating(false) })
  }

  var years = [now.getFullYear(), now.getFullYear() - 1, now.getFullYear() - 2]

  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
      <select value={quarter} onChange={function(e) { setQuarter(Number(e.target.value)) }} style={INP}>
        <option value={1}>T1 (Ene-Mar)</option>
        <option value={2}>T2 (Abr-Jun)</option>
        <option value={3}>T3 (Jul-Sep)</option>
        <option value={4}>T4 (Oct-Dic)</option>
      </select>
      <select value={year} onChange={function(e) { setYear(Number(e.target.value)) }} style={INP}>
        {years.map(function(y) { return <option key={y} value={y}>{y}</option> })}
      </select>
      <button type="button" onClick={handleGenerate} disabled={generating}
        style={{ padding: '9px 18px', borderRadius: '8px', background: 'var(--gradient-brand)', border: 'none', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: generating ? 'not-allowed' : 'pointer', opacity: generating ? 0.7 : 1, whiteSpace: 'nowrap' }}
      >{generating ? 'Generando...' : 'Descargar informe (PDF)'}</button>
    </div>
  )
}

function DataExportTab() {
  var [downloading,   setDownloading]   = useState(false)
  var [downloadingCsv, setDownloadingCsv] = useState(null)
  var [toast,         setToast]         = useState(null)

  function showMsg(msg, type) {
    setToast({ msg: msg, type: type || 'success' })
    setTimeout(function() { setToast(null) }, 3000)
  }

  function handleFullExport() {
    setDownloading(true)
    downloadExport()
      .then(function() { showMsg('Copia de seguridad descargada') })
      .catch(function(e) { showMsg(e.message, 'error') })
      .finally(function() { setDownloading(false) })
  }

  function handleCsvExport(table, label) {
    setDownloadingCsv(table)
    downloadCsv(table, table)
      .then(function() { showMsg(label + ' exportado') })
      .catch(function(e) { showMsg(e.message, 'error') })
      .finally(function() { setDownloadingCsv(null) })
  }

  var CSV_TABLES = [
    ['clients', 'Clientes'],
    ['projects', 'Proyectos'],
    ['invoices', 'Facturas'],
    ['finance_entries', 'Finanzas'],
  ]

  return (
    <div>
      <Toast toast={toast} />

      <Section title="Copia de seguridad completa" description="Descarga todos tus datos en un unico archivo, por si algun dia quieres migrar o simplemente tener tu propia copia">
        <button type="button" onClick={handleFullExport} disabled={downloading}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '8px', background: 'var(--gradient-brand)', border: 'none', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: downloading ? 'not-allowed' : 'pointer', opacity: downloading ? 0.7 : 1, alignSelf: 'flex-start' }}
        >{downloading ? 'Generando...' : 'Descargar copia completa (.json)'}</button>
        <p style={{ fontSize: '11px', color: 'var(--text-5)' }}>
          Incluye clientes, proyectos, facturas, finanzas, suscripciones, servicios, calendario y documentos de conocimiento.
        </p>
      </Section>

      <Section title="Exportar por partes (Excel / Google Sheets)" description="Cada tabla en su propio archivo, mas facil de abrir y filtrar">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {CSV_TABLES.map(function(t) {
            var isLoading = downloadingCsv === t[0]
            return (
              <div key={t[0]} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: '10px' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-1)' }}>{t[1]}</span>
                <button type="button" onClick={function() { handleCsvExport(t[0], t[1]) }} disabled={isLoading}
                  style={{ padding: '6px 14px', borderRadius: '7px', background: 'var(--bg-4)', border: '1px solid var(--border)', color: 'var(--text-2)', fontSize: '12px', fontWeight: 600, cursor: isLoading ? 'not-allowed' : 'pointer' }}
                >{isLoading ? 'Descargando...' : 'Descargar CSV'}</button>
              </div>
            )
          })}
        </div>
        <Section title="Informe trimestral para tu gestor" description="Base imponible, IVA repercutido, retencion IRPF y gastos, todo listo para presentar">
        <QuarterlyReportPicker />
      </Section>
      </Section>
    </div>
  )
}


export default DataExportTab

