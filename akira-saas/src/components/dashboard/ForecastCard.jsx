import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Info } from 'lucide-react'
import { getForecast } from '@/services/forecast.service'

function fmtCur(n) { return (Number(n) || 0).toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + '€' }

export default function ForecastCard() {
  var [data, setData] = useState(null)
  var [loading, setLoading] = useState(true)
  var [showDetail, setShowDetail] = useState(false)

  useEffect(function() {
    getForecast().then(setData).catch(function() {}).finally(function() { setLoading(false) })
  }, [])

  if (loading) {
    return <div className="skeleton" style={{ height: '160px', borderRadius: '12px' }} />
  }
  if (!data) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '18px' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
        <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <TrendingUp style={{ width: '14px', height: '14px', color: '#22c55e' }} />
          Previsión del próximo mes
        </h3>
        <button type="button" onClick={function() { setShowDetail(function(v) { return !v }) }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', display: 'flex' }}
        ><Info style={{ width: '14px', height: '14px' }} /></button>
      </div>

      <p style={{ fontSize: '28px', fontWeight: 900, color: '#22c55e', letterSpacing: '-0.02em', marginBottom: '4px' }}>
        {fmtCur(data.forecastNextMonth)}
      </p>
      <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', marginBottom: showDetail ? '14px' : '0' }}>
        MRR de suscripciones ({fmtCur(data.mrr)}) + presupuestos aceptados sin facturar ({fmtCur(data.quotesTotal)})
      </p>

      {showDetail && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div>
            <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
              Suscripciones activas ({data.activeSubs.length})
            </p>
            {data.activeSubs.length === 0 ? (
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)' }}>Ninguna</p>
            ) : data.activeSubs.map(function(s) {
              return (
                <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'rgba(255,255,255,0.5)', padding: '2px 0' }}>
                  <span>{s.name}{s.clients ? ' — ' + (s.clients.company || s.clients.name) : ''}</span>
                  <span>{fmtCur(s.price)}/{s.period}</span>
                </div>
              )
            })}
          </div>

          <div>
            <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
              Presupuestos aceptados, sin facturar ({data.acceptedQuotes.length})
            </p>
            {data.acceptedQuotes.length === 0 ? (
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)' }}>Ninguno</p>
            ) : data.acceptedQuotes.map(function(q) {
              return (
                <div key={q.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'rgba(255,255,255,0.5)', padding: '2px 0' }}>
                  <span>{q.quote_number}{q.clients ? ' — ' + (q.clients.company || q.clients.name) : ''}</span>
                  <span>{fmtCur(q.total)}</span>
                </div>
              )
            })}
          </div>

          {data.pendingTotal > 0 && (
            <div style={{ padding: '8px 10px', background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)', borderRadius: '8px', fontSize: '11px', color: '#f59e0b' }}>
              Aparte, tienes {fmtCur(data.pendingTotal)} en facturas ya emitidas pendientes de cobro (no incluido arriba, porque ya deberian estar pagandose)
            </div>
          )}
        </div>
      )}
    </motion.div>
  )
}