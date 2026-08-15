#!/usr/bin/env node
/**
 * Seed script para agregar datos de prueba a Supabase
 * Ejecuta: npm run seed
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY no configuradas')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function seedData() {
  console.log('🌱 Iniciando seed de datos...')

  try {
    // Obtener usuario autenticado
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      console.log('⚠️  Sin autenticación. Usando datos de prueba con org_id fijo.')
    }

    const orgId = 'b66ce8ac-6415-40c1-b801-4bef15ef7982'

    // 1. Crear eventos futuros
    console.log('📅 Creando eventos futuros...')
    const events = [
      {
        title: 'Reunión con cliente',
        description: 'Discusión de proyecto',
        start_at: '2026-08-20T10:00:00+00:00',
        end_at: '2026-08-20T11:00:00+00:00',
        type: 'meeting',
        org_id: orgId,
        archived: false,
      },
      {
        title: 'Presentación producto',
        description: 'Demo a cliente DRACS',
        start_at: '2026-08-21T14:30:00+00:00',
        end_at: '2026-08-21T15:30:00+00:00',
        type: 'meeting',
        org_id: orgId,
        archived: false,
      },
      {
        title: 'Llamada seguimiento DRACS',
        description: 'Check-in semanal',
        start_at: '2026-08-22T16:00:00+00:00',
        end_at: '2026-08-22T16:45:00+00:00',
        type: 'call',
        org_id: orgId,
        archived: false,
      },
      {
        title: 'Reunión equipo interno',
        description: 'Sync semanal',
        start_at: '2026-08-23T09:00:00+00:00',
        end_at: '2026-08-23T10:00:00+00:00',
        type: 'meeting',
        org_id: orgId,
        archived: false,
      },
      {
        title: 'Revisión documentos',
        description: 'Validación de contratos',
        start_at: '2026-08-25T11:00:00+00:00',
        end_at: '2026-08-25T12:00:00+00:00',
        type: 'other',
        org_id: orgId,
        archived: false,
      },
    ]

    for (const event of events) {
      const { error } = await supabase
        .from('calendar_events')
        .insert([event])

      if (error && error.code !== '23505') { // 23505 = unique violation (ya existe)
        console.error('❌ Error creando evento:', error)
      } else {
        console.log(`✅ Evento creado: "${event.title}"`)
      }
    }

    console.log('✅ Datos seeded exitosamente')
  } catch (err) {
    console.error('❌ Error en seed:', err)
  }
}

// Ejecutar
seedData()
