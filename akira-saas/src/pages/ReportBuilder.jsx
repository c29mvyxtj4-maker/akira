import { useState, useEffect } from 'react'
import { Plus, Save, Download, Mail, Calendar } from 'lucide-react'
import { motion } from 'framer-motion'
import AppLayout from '@/shared/components/layout/AppLayout'
import { fetchReports, saveReport, generateReport, scheduleReport } from '@/services/reports.service'

const REPORT_TYPES = [
  { id: 'financial', name: 'Reporte Financiero', icon: '💰' },
  { id: 'clients', name: 'Reporte de Clientes', icon: '👥' },
  { id: 'projects', name: 'Reporte de Proyectos', icon: '📊' },
  { id: 'revenue', name: 'Reporte de Ingresos', icon: '📈' },
  { id: 'forecast', name: 'Pronóstico', icon: '🔮' },
  { id: 'performance', name: 'Rendimiento', icon: '🎯' },
]

const EXPORT_FORMATS = ['PDF', 'Excel', 'CSV', 'Email']

export default function ReportBuilderPage() {
  const [reports, setReports] = useState([])
  const [currentReport, setCurrentReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [reportName, setReportName] = useState('')
  const [reportType, setReportType] = useState('financial')
  const [format, setFormat] = useState('PDF')
  const [scheduleEnabled, setScheduleEnabled] = useState(false)
  const [scheduleFrequency, setScheduleFrequency] = useState('weekly')
  const [scheduleEmail, setScheduleEmail] = useState('')
  const [dateRange, setDateRange] = useState('last_30_days')

  useEffect(() => {
    loadReports()
  }, [])

  const loadReports = async () => {
    try {
      setLoading(true)
      const { data } = await fetchReports()
      setReports(data || [])
    } catch (error) {
      console.error('Error loading reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveReport = async () => {
    if (!reportName.trim()) {
      alert('El nombre del reporte es requerido')
      return
    }

    try {
      setSaving(true)
      await saveReport({
        id: currentReport?.id,
        name: reportName,
        type: reportType,
        format: format,
        dateRange: dateRange,
        schedule: scheduleEnabled ? {
          frequency: scheduleFrequency,
          email: scheduleEmail,
        } : null,
      })
      alert('Reporte guardado exitosamente')
      loadReports()
    } catch (error) {
      console.error('Error saving report:', error)
      alert('Error al guardar reporte')
    } finally {
      setSaving(false)
    }
  }

  const handleGenerateReport = async () => {
    if (!reportName.trim()) {
      alert('El nombre del reporte es requerido')
      return
    }

    try {
      setGenerating(true)
      const result = await generateReport({
        name: reportName,
        type: reportType,
        format: format,
        dateRange: dateRange,
      })

      // Download file
      const url = result.download_url
      const link = document.createElement('a')
      link.href = url
      link.download = `${reportName}.${format.toLowerCase()}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Error generating report:', error)
      alert('Error al generar reporte')
    } finally {
      setGenerating(false)
    }
  }

  const handleScheduleReport = async () => {
    if (!scheduleEmail.trim()) {
      alert('El correo es requerido')
      return
    }

    try {
      await scheduleReport({
        name: reportName,
        type: reportType,
        format: format,
        frequency: scheduleFrequency,
        email: scheduleEmail,
      })
      alert('Reporte programado exitosamente')
    } catch (error) {
      console.error('Error scheduling report:', error)
      alert('Error al programar reporte')
    }
  }

  const header = (
    <div style={{
      padding: 'var(--space-4)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 'var(--space-3)',
    }}>
      <div>
        <h1 style={{
          margin: '0 0 4px 0',
          fontSize: '24px',
          fontWeight: 700,
          color: 'var(--text-1)',
        }}>
          Generador de reportes
        </h1>
        <p style={{
          margin: 0,
          fontSize: '13px',
          color: 'var(--text-3)',
        }}>
          Crea y programa reportes personalizados
        </p>
      </div>
      <motion.button
        whileHover={{ scale: 1.05 }}
        onClick={handleSaveReport}
        disabled={saving}
        style={{
          padding: '10px 16px',
          background: 'var(--brand)',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          color: 'white',
          fontWeight: 600,
          fontSize: '13px',
          opacity: saving ? 0.5 : 1,
        }}
      >
        <Save size={16} />
        Guardar reporte
      </motion.button>
    </div>
  )

  return (
    <AppLayout header={header}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '24px',
        padding: 'var(--space-4)',
      }}>
        {/* Configuration */}
        <div style={{
          background: 'var(--bg-1)',
          borderRadius: '12px',
          border: '1px solid var(--border)',
          padding: 'var(--space-4)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-3)',
        }}>
          <h2 style={{
            margin: '0 0 16px 0',
            fontSize: '16px',
            fontWeight: 600,
            color: 'var(--text-1)',
          }}>
            Configuración
          </h2>

          {/* Name */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--text-2)',
              marginBottom: '6px',
              textTransform: 'uppercase',
            }}>
              Nombre del reporte
            </label>
            <input
              type="text"
              value={reportName}
              onChange={(e) => setReportName(e.target.value)}
              placeholder="Mi reporte mensual"
              style={{
                width: '100%',
                padding: '8px 12px',
                background: 'var(--bg-0)',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                color: 'var(--text-1)',
                fontSize: '13px',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Type */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--text-2)',
              marginBottom: '8px',
              textTransform: 'uppercase',
            }}>
              Tipo de reporte
            </label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '8px',
            }}>
              {REPORT_TYPES.map(type => (
                <button
                  key={type.id}
                  onClick={() => setReportType(type.id)}
                  style={{
                    padding: '10px',
                    background: reportType === type.id ? 'var(--brand)' : 'var(--bg-2)',
                    border: `1px solid ${reportType === type.id ? 'var(--brand)' : 'var(--border)'}`,
                    borderRadius: '6px',
                    color: reportType === type.id ? 'white' : 'var(--text-1)',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 500,
                  }}
                >
                  <span>{type.icon}</span> {type.name}
                </button>
              ))}
            </div>
          </div>

          {/* Format */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--text-2)',
              marginBottom: '8px',
              textTransform: 'uppercase',
            }}>
              Formato de exportación
            </label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '8px',
            }}>
              {EXPORT_FORMATS.map(fmt => (
                <button
                  key={fmt}
                  onClick={() => setFormat(fmt)}
                  style={{
                    padding: '8px',
                    background: format === fmt ? 'var(--brand)' : 'var(--bg-2)',
                    border: `1px solid ${format === fmt ? 'var(--brand)' : 'var(--border)'}`,
                    borderRadius: '6px',
                    color: format === fmt ? 'white' : 'var(--text-1)',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 500,
                  }}
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--text-2)',
              marginBottom: '6px',
              textTransform: 'uppercase',
            }}>
              Período
            </label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                background: 'var(--bg-0)',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                color: 'var(--text-1)',
                fontSize: '13px',
              }}
            >
              <option value="last_7_days">Últimos 7 días</option>
              <option value="last_30_days">Últimos 30 días</option>
              <option value="last_90_days">Últimos 90 días</option>
              <option value="last_year">Último año</option>
              <option value="custom">Personalizado</option>
            </select>
          </div>

          {/* Generate */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            onClick={handleGenerateReport}
            disabled={generating}
            style={{
              padding: '12px 16px',
              background: 'var(--brand)',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              color: 'white',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              opacity: generating ? 0.5 : 1,
            }}
          >
            <Download size={16} />
            {generating ? 'Generando...' : 'Generar ahora'}
          </motion.button>
        </div>

        {/* Scheduling */}
        <div style={{
          background: 'var(--bg-1)',
          borderRadius: '12px',
          border: '1px solid var(--border)',
          padding: 'var(--space-4)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-3)',
        }}>
          <h2 style={{
            margin: '0 0 16px 0',
            fontSize: '16px',
            fontWeight: 600,
            color: 'var(--text-1)',
          }}>
            Programación automática
          </h2>

          {/* Toggle */}
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 500,
          }}>
            <input
              type="checkbox"
              checked={scheduleEnabled}
              onChange={(e) => setScheduleEnabled(e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
            Enviar reportes automáticamente
          </label>

          {scheduleEnabled && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}
            >
              {/* Frequency */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'var(--text-2)',
                  marginBottom: '6px',
                  textTransform: 'uppercase',
                }}>
                  Frecuencia
                </label>
                <select
                  value={scheduleFrequency}
                  onChange={(e) => setScheduleFrequency(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    background: 'var(--bg-0)',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    color: 'var(--text-1)',
                    fontSize: '13px',
                  }}
                >
                  <option value="daily">Diariamente</option>
                  <option value="weekly">Semanalmente</option>
                  <option value="monthly">Mensualmente</option>
                </select>
              </div>

              {/* Email */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'var(--text-2)',
                  marginBottom: '6px',
                  textTransform: 'uppercase',
                }}>
                  Destinatarios (comas separadas)
                </label>
                <input
                  type="text"
                  value={scheduleEmail}
                  onChange={(e) => setScheduleEmail(e.target.value)}
                  placeholder="correo1@ejemplo.com, correo2@ejemplo.com"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    background: 'var(--bg-0)',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    color: 'var(--text-1)',
                    fontSize: '13px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Schedule Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                onClick={handleScheduleReport}
                style={{
                  padding: '10px 16px',
                  background: 'var(--bg-2)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  color: 'var(--text-1)',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  marginTop: '8px',
                }}
              >
                <Calendar size={14} />
                Programar envío
              </motion.button>
            </motion.div>
          )}

          {/* Saved Reports */}
          <div style={{
            borderTop: '1px solid var(--border)',
            paddingTop: 'var(--space-3)',
            marginTop: 'auto',
          }}>
            <h3 style={{
              margin: '0 0 12px 0',
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--text-2)',
              textTransform: 'uppercase',
            }}>
              Reportes guardados
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '200px', overflowY: 'auto' }}>
              {reports.length === 0 ? (
                <p style={{ fontSize: '12px', color: 'var(--text-3)', margin: 0 }}>
                  No hay reportes guardados
                </p>
              ) : (
                reports.map(report => (
                  <button
                    key={report.id}
                    onClick={() => {
                      setCurrentReport(report)
                      setReportName(report.name)
                      setReportType(report.type)
                    }}
                    style={{
                      padding: '8px 10px',
                      background: 'var(--bg-0)',
                      border: '1px solid var(--border)',
                      borderRadius: '6px',
                      color: 'var(--text-1)',
                      cursor: 'pointer',
                      fontSize: '12px',
                      textAlign: 'left',
                    }}
                  >
                    {report.name}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
