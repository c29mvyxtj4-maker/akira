import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  User, Building2, Mail, Phone, Globe,
  Instagram, Hash, DollarSign, FileText, Calendar,
} from 'lucide-react'
import { CLIENT_NICHES, CLIENT_SOURCES_MAP } from '@db/queries/clients.service'
import Input   from '@/shared/components/ui/Input'
import Select  from '@/shared/components/ui/Select'
import Button  from '@/shared/components/ui/Button'

const EMPTY = {
  name: '', company: '', email: '', phone: '',
  website: '', instagram: '', niche: '',
  status: 'lead', source: 'unknown',
  monthly_value: '', notes: '', next_followup_at: '',
}

const STATUS_OPTS = [
  { value: 'lead',    label: 'Lead' },
  { value: 'active',  label: 'Activo' },
  { value: 'at_risk', label: 'En riesgo' },
  { value: 'paused',  label: 'Pausado' },
  { value: 'lost',    label: 'Perdido' },
]

const SOURCE_OPTS = Object.entries(CLIENT_SOURCES_MAP).map(([v, l]) => ({ value: v, label: l }))
const NICHE_OPTS  = [{ value: '', label: 'Sin especificar' }, ...CLIENT_NICHES.map(n => ({ value: n, label: n }))]

export default function ClientForm({ initial, onSave, onCancel, loading }) {
  const [form, setForm]   = useState(EMPTY)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (initial) {
      setForm({
        ...EMPTY,
        ...initial,
        monthly_value:    initial.monthly_value    ?? '',
        next_followup_at: initial.next_followup_at
          ? new Date(initial.next_followup_at).toISOString().slice(0, 16)
          : '',
      })
    } else {
      setForm(EMPTY)
    }
    setErrors({})
  }, [initial])

  const set = (k) => (e) => {
    setForm(f => ({ ...f, [k]: e.target.value }))
    if (errors[k]) setErrors(er => ({ ...er, [k]: null }))
  }

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'El nombre es obligatorio'
    if (form.email && !/^[^@]+@[^@]+\.[^@]+$/.test(form.email)) e.email = 'Email invÃ¡lido'
    if (form.monthly_value !== '' && isNaN(Number(form.monthly_value))) e.monthly_value = 'Debe ser un nÃºmero'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return
    onSave({
      ...form,
      monthly_value:    form.monthly_value !== '' ? Number(form.monthly_value) : 0,
      next_followup_at: form.next_followup_at || null,
    })
  }

  const FIELD_CLASS = 'col-span-1'

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* SecciÃ³n: Identidad */}
      <div>
        <p className="text-2xs text-text-4 uppercase tracking-wider mb-3 font-semibold">Identidad</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <Input
              label="Nombre completo *"
              value={form.name}
              onChange={set('name')}
              placeholder="Nombre del contacto"
              icon={<User className="w-3.5 h-3.5" />}
              error={errors.name}
            />
          </div>
          <Input
            label="Empresa"
            value={form.company}
            onChange={set('company')}
            placeholder="Nombre de empresa"
            icon={<Building2 className="w-3.5 h-3.5" />}
          />
          <Select
            label="Tipo / Nicho"
            value={form.niche}
            onChange={set('niche')}
            options={NICHE_OPTS}
          />
        </div>
      </div>

      {/* SecciÃ³n: Contacto */}
      <div>
        <p className="text-2xs text-text-4 uppercase tracking-wider mb-3 font-semibold">Contacto</p>
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={set('email')}
            placeholder="email@empresa.com"
            icon={<Mail className="w-3.5 h-3.5" />}
            error={errors.email}
          />
          <Input
            label="TelÃ©fono"
            value={form.phone}
            onChange={set('phone')}
            placeholder="+34 600 000 000"
            icon={<Phone className="w-3.5 h-3.5" />}
          />
          <Input
            label="Sitio web"
            value={form.website}
            onChange={set('website')}
            placeholder="https://â€¦"
            icon={<Globe className="w-3.5 h-3.5" />}
          />
          <Input
            label="Instagram"
            value={form.instagram}
            onChange={set('instagram')}
            placeholder="@handle"
            icon={<Instagram className="w-3.5 h-3.5" />}
          />
        </div>
      </div>

      {/* SecciÃ³n: CRM */}
      <div>
        <p className="text-2xs text-text-4 uppercase tracking-wider mb-3 font-semibold">CRM</p>
        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Estado"
            value={form.status}
            onChange={set('status')}
            options={STATUS_OPTS}
          />
          <Select
            label="Origen"
            value={form.source}
            onChange={set('source')}
            options={SOURCE_OPTS}
          />
          <Input
            label="Valor mensual (â‚¬)"
            type="number"
            min="0"
            value={form.monthly_value}
            onChange={set('monthly_value')}
            placeholder="0"
            icon={<DollarSign className="w-3.5 h-3.5" />}
            error={errors.monthly_value}
          />
          <Input
            label="PrÃ³ximo seguimiento"
            type="datetime-local"
            value={form.next_followup_at}
            onChange={set('next_followup_at')}
            icon={<Calendar className="w-3.5 h-3.5" />}
          />
        </div>
        <div className="mt-3">
          <label className="label-base">Notas internas</label>
          <textarea
            value={form.notes}
            onChange={set('notes')}
            rows={3}
            placeholder="Observaciones, contexto, referenciasâ€¦"
            className="input-base w-full resize-none mt-1"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-2 border-t border-border">
        <Button variant="secondary" type="button" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" loading={loading}>
          {initial ? 'Guardar cambios' : 'Crear cliente'}
        </Button>
      </div>
    </form>
  )
}

