import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Home, MessageSquare, Calendar as CalendarIcon, Inbox,
  Users, FolderKanban, Wallet, FileText, Clock, BookOpen, Settings,
  ChevronRight, TrendingUp, Search, Sparkles, PenSquare,
} from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { useAuth } from '@/context/AuthContext'
import { ROUTES } from '@/config/constants'
import { DUR, EASE, SPRING } from '@/config/motion'
import CommandPalette from '@/components/layout/CommandPalette'
import AskAkiraButton from '@/components/akira/AskAkiraButton'

/*
 * PRUEBA — Home experimental estilo Notion (topbar de pastillas + accesos),
 * en tema oscuro AKIRA. Suplementa a la sidebar. Ruta independiente /inicio.
 */

function fmtCur(n) {
  if (!n && n !== 0) return '--'
  return Number(n).toLocaleString('es-ES', { maximumFractionDigits: 0 }) + '€'
}

export default function Inicio() {
  var navigate = useNavigate()
  var { kpis, loading } = useApp()
  var { profile } = useAuth()
  var name = profile && profile.full_name ? profile.full_name.split(' ')[0] : 'usuario'
  var initial = profile && profile.full_name ? profile.full_name[0].toUpperCase() : 'M'

  var [cmdOpen, setCmdOpen] = useState(false)
  var [aiOpen, setAiOpen]   = useState(false)

  // La brújula abre el command palette (igual que Ctrl/Cmd+K).
  useEffect(function() {
    function onKey(e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setCmdOpen(function(v) { return !v }) }
    }
    window.addEventListener('keydown', onKey)
    return function() { window.removeEventListener('keydown', onKey) }
  }, [])

  var PILLS = [
    { icon: CalendarIcon,  label: 'Calendario', to: ROUTES.CALENDAR },
    { icon: MessageSquare, label: 'Mensajes',   to: '/mensajes' },
    { icon: Inbox,         label: 'Bandeja',    to: '/inbox' },
  ]

  var KPIS = [
    { label: 'MRR',              value: loading ? '—' : fmtCur(kpis && kpis.mrr),          icon: TrendingUp },
    { label: 'Clientes activos', value: loading ? '—' : (kpis ? kpis.activeClients : 0),   icon: Users },
    { label: 'Proyectos',        value: loading ? '—' : (kpis ? kpis.activeProjects : 0),  icon: FolderKanban },
    { label: 'Ingresos mes',     value: loading ? '—' : fmtCur(kpis && kpis.monthIncome),  icon: Wallet },
  ]

  var QUICK = [
    { label: 'Clientes',   sub: 'Cuentas y portal',   icon: Users,        to: ROUTES.CLIENTS },
    { label: 'Proyectos',  sub: 'Kanban y entregas',  icon: FolderKanban, to: ROUTES.PROJECTS },
    { label: 'Finanzas',   sub: 'Ingresos y gastos',  icon: Wallet,       to: ROUTES.FINANCE },
    { label: 'Calendario', sub: 'Agenda y eventos',   icon: CalendarIcon, to: ROUTES.CALENDAR },
  ]

  var SECTIONS = [
    { label: 'Clientes',             icon: Users,        to: ROUTES.CLIENTS },
    { label: 'Proyectos',            icon: FolderKanban, to: ROUTES.PROJECTS },
    { label: 'Finanzas',             icon: Wallet,       to: ROUTES.FINANCE },
    { label: 'Facturas',             icon: FileText,     to: ROUTES.INVOICES },
    { label: 'Time tracking',        icon: Clock,        to: ROUTES.TIME_TRACKING },
    { label: 'Calendario',           icon: CalendarIcon, to: ROUTES.CALENDAR },
    { label: 'Base de conocimiento', icon: BookOpen,     to: ROUTES.KNOWLEDGE },
    { label: 'Ajustes',              icon: Settings,     to: ROUTES.SETTINGS },
  ]

  var sectionLabel = { fontSize: '11px', fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '24px 0 10px' }

  return (
    <div style={{ height: '100dvh', overflowY: 'auto', background: 'var(--bg-base)', paddingTop: 'calc(var(--safe-top) + 14px)' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '0 16px calc(var(--safe-bottom) + 100px)' }}>

        {/* Topbar de pastillas */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', paddingBottom: '4px', marginBottom: '20px' }}>
          <button type="button" onClick={function() { navigate(ROUTES.SETTINGS) }} aria-label="Editar perfil"
            style={{ width: '38px', height: '38px', borderRadius: '50%', flexShrink: 0, border: '1px solid var(--border)', background: 'var(--gradient-brand)', color: '#fff', fontSize: '14px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-brand)' }}>
            {initial}
          </button>
          <button type="button" onClick={function() { navigate('/inicio') }}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '999px', background: 'var(--brand-dim)', border: '1px solid var(--brand-border)', color: 'var(--brand)', flexShrink: 0, cursor: 'pointer' }}>
            <Home style={{ width: '16px', height: '16px' }} />
            <span style={{ fontSize: '13px', fontWeight: 700 }}>Inicio</span>
          </button>
          {PILLS.map(function(p) {
            var Icon = p.icon
            return (
              <button key={p.label} type="button" onClick={function() { navigate(p.to) }} title={p.label} aria-label={p.label}
                style={{ width: '40px', height: '38px', borderRadius: '999px', flexShrink: 0, background: 'var(--bg-3)', border: '1px solid var(--border)', color: 'var(--text-3)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon style={{ width: '16px', height: '16px' }} />
              </button>
            )
          })}
        </div>

        {/* Saludo */}
        <motion.h1 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: DUR.slow, ease: EASE.out }}
          style={{ fontSize: '24px', fontWeight: 900, color: 'var(--text-1)', letterSpacing: '-0.03em' }}>
          Hola, {name}
        </motion.h1>
        <p style={{ fontSize: '13px', color: 'var(--text-4)', marginTop: '2px' }}>Tu negocio de un vistazo</p>

        {/* KPIs — con animación de escalado al pasar el ratón */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginTop: '18px' }}>
          {KPIS.map(function(k, i) {
            var Icon = k.icon
            return (
              <motion.div key={k.label}
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: DUR.slow, ease: EASE.out }}
                whileHover={{ scale: 1.035 }} whileTap={{ scale: 0.98 }}
                style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '14px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'var(--brand)', opacity: 0.5 }} />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{k.label}</span>
                  <div style={{ width: '26px', height: '26px', borderRadius: 'var(--radius-md)', background: 'var(--brand-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon style={{ width: '13px', height: '13px', color: 'var(--brand)' }} />
                  </div>
                </div>
                <span style={{ fontSize: '22px', fontWeight: 900, color: 'var(--text-1)', letterSpacing: '-0.03em' }}>{k.value}</span>
              </motion.div>
            )
          })}
        </div>

        {/* Accesos rápidos — escalado + tinción roja al pasar el ratón */}
        <p style={sectionLabel}>Accesos rápidos</p>
        <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', margin: '0 -16px', padding: '0 16px 4px' }}>
          {QUICK.map(function(q) {
            var Icon = q.icon
            return (
              <motion.button key={q.label} type="button" onClick={function() { navigate(q.to) }}
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} transition={SPRING.snappy}
                onMouseEnter={function(e) { e.currentTarget.style.borderColor = 'var(--brand-border)'; e.currentTarget.style.background = 'var(--brand-dim)' }}
                onMouseLeave={function(e) { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-2)' }}
                style={{ flexShrink: 0, width: '150px', textAlign: 'left', background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '14px', cursor: 'pointer', transition: 'background 0.15s, border-color 0.15s' }}>
                <div style={{ width: '34px', height: '34px', borderRadius: 'var(--radius-md)', background: 'var(--brand-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
                  <Icon style={{ width: '17px', height: '17px', color: 'var(--brand)' }} />
                </div>
                <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-1)' }}>{q.label}</p>
                <p style={{ fontSize: '11px', color: 'var(--text-4)', marginTop: '1px' }}>{q.sub}</p>
              </motion.button>
            )
          })}
        </div>

        {/* Secciones (suplemento de la sidebar) */}
        <p style={sectionLabel}>Secciones</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {SECTIONS.map(function(s) {
            var Icon = s.icon
            return (
              <button key={s.label} type="button" onClick={function() { navigate(s.to) }}
                style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', textAlign: 'left', background: 'transparent', border: '1px solid transparent', borderRadius: 'var(--radius-md)', padding: '11px 12px', cursor: 'pointer', color: 'var(--text-2)', transition: 'background 0.12s, border-color 0.12s' }}
                onMouseEnter={function(e) { e.currentTarget.style.background = 'var(--bg-2)'; e.currentTarget.style.borderColor = 'var(--border)' }}
                onMouseLeave={function(e) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent' }}>
                <div style={{ width: '30px', height: '30px', borderRadius: 'var(--radius-md)', background: 'var(--bg-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon style={{ width: '15px', height: '15px', color: 'var(--text-3)' }} />
                </div>
                <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-1)', flex: 1 }}>{s.label}</span>
                <ChevronRight style={{ width: '15px', height: '15px', color: 'var(--text-5)' }} />
              </button>
            )
          })}
        </div>

        <p style={{ textAlign: 'center', fontSize: '11px', color: 'var(--text-5)', marginTop: '28px' }}>
          AKIRA · inicio
        </p>
      </div>

      {/* Barra inferior flotante (siempre visible): buscar · IA · crear */}
      <div style={{ position: 'fixed', left: '50%', transform: 'translateX(-50%)', bottom: 'calc(var(--safe-bottom) + 14px)', width: 'min(92vw, 640px)', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', borderRadius: '999px', background: 'var(--bg-2)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-modal)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', zIndex: 50 }}>
        <button type="button" onClick={function() { setCmdOpen(true) }} aria-label="Buscar (Ctrl+K)" title="Buscar (Ctrl+K)"
          style={{ width: '44px', height: '44px', flexShrink: 0, borderRadius: '50%', border: '1px solid var(--border)', background: 'var(--bg-3)', color: 'var(--text-2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Search style={{ width: '18px', height: '18px' }} />
        </button>
        <button type="button" onClick={function() { setAiOpen(true) }}
          style={{ flex: 1, height: '44px', borderRadius: '999px', border: '1px solid var(--brand-border)', background: 'var(--brand-dim)', color: 'var(--brand)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '14px', fontWeight: 700 }}>
          <Sparkles style={{ width: '17px', height: '17px' }} /> Preguntar a AKIRA
        </button>
        <button type="button" onClick={function() { navigate(ROUTES.KNOWLEDGE + '?new=1') }} aria-label="Nueva página de conocimiento" title="Crear página de conocimiento"
          style={{ width: '44px', height: '44px', flexShrink: 0, borderRadius: '50%', border: '1px solid var(--border)', background: 'var(--bg-3)', color: 'var(--text-2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <PenSquare style={{ width: '17px', height: '17px' }} />
        </button>
      </div>

      <CommandPalette open={cmdOpen} onClose={function() { setCmdOpen(false) }} />
      <AskAkiraButton controlledOpen={aiOpen} onOpenChange={setAiOpen} hideFab
        contextLabel="Inicio" contextText="El usuario está en la pantalla de inicio de AKIRA (KPIs y accesos)." />
    </div>
  )
}
