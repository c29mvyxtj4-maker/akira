import { supabase } from '@/lib/supabase'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { scopeToOrg } from '@/lib/activeOrg'

var GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY

async function uid() {
  var res = await supabase.auth.getUser()
  if (!res.data || !res.data.user) throw new Error('No autenticado')
  return res.data.user.id
}

/* ── Construir contexto del negocio ───────────────────────── */
async function buildBusinessContext() {
  var ownerId = await uid()

  var results = await Promise.allSettled([
    scopeToOrg(supabase.from('clients').select('id,name,status,company,monthly_value,niche').eq('owner_id', ownerId).eq('archived', false)).order('created_at', { ascending: false }).limit(30),
    scopeToOrg(supabase.from('projects').select('id,name,status,stage,budget,actual_cost,due_date,progress,client_id').eq('owner_id', ownerId).eq('archived', false)).order('created_at', { ascending: false }).limit(30),
    scopeToOrg(supabase.from('subscriptions').select('name,status,price,period').eq('owner_id', ownerId).eq('archived', false)),
    scopeToOrg(supabase.from('finance_entries').select('type,amount,status,entry_date,description').eq('owner_id', ownerId).eq('archived', false)).order('entry_date', { ascending: false }).limit(50),
    supabase.from('services').select('id,name,category,price,cost,active').eq('owner_id', ownerId).eq('archived', false),
  ])

  function safe(r) {
    return r.status === 'fulfilled' && !r.value.error ? (r.value.data || []) : []
  }

  var clients       = safe(results[0])
  var projects      = safe(results[1])
  var subscriptions = safe(results[2])
  var finance       = safe(results[3])
  var services      = safe(results[4])

  var activeClients  = clients.filter(function(c) { return c.status === 'active' }).length
  var leads          = clients.filter(function(c) { return c.status === 'lead' }).length
  var atRisk         = clients.filter(function(c) { return c.status === 'at_risk' }).length
  var activeProjects = projects.filter(function(p) { return p.status === 'active' || p.status === 'pending' }).length
  var mrr = subscriptions
    .filter(function(s) { return s.status === 'active' })
    .reduce(function(sum, s) {
      var p = Number(s.price) || 0
      if (s.period === 'yearly')    return sum + p / 12
      if (s.period === 'quarterly') return sum + p / 3
      if (s.period === 'weekly')    return sum + p * 4.33
      return sum + p
    }, 0)

  var now        = new Date()
  var monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
  var monthIncome  = finance.filter(function(e) { return ['income','payment'].includes(e.type) && e.entry_date >= monthStart }).reduce(function(s, e) { return s + Number(e.amount) }, 0)
  var monthExpense = finance.filter(function(e) { return e.type === 'expense' && e.entry_date >= monthStart }).reduce(function(s, e) { return s + Number(e.amount) }, 0)
  var pendingInv   = finance.filter(function(e) { return e.type === 'invoice' && e.status === 'pending' }).reduce(function(s, e) { return s + Number(e.amount) }, 0)

  var ctx = [
    '=== CONTEXTO DEL NEGOCIO (AKIRA OS) ===',
    'Fecha de hoy: ' + now.toISOString().split('T')[0],
    '',
    '== CLIENTES (usa el ID exacto entre corchetes si necesitas referenciar uno) ==',
    'Total: ' + clients.length + ' | Activos: ' + activeClients + ' | Leads: ' + leads + ' | En riesgo: ' + atRisk,
  ]

  if (clients.length > 0) {
    ctx.push('Lista de clientes:')
    clients.slice(0, 30).forEach(function(c) {
      ctx.push('- [id: ' + c.id + '] ' + c.name + (c.company ? ' (' + c.company + ')' : '') + ' | Estado: ' + c.status + (c.monthly_value > 0 ? ' | Valor mensual: ' + c.monthly_value + 'E' : '') + (c.niche ? ' | Nicho: ' + c.niche : ''))
    })
  }

  ctx.push('')
  ctx.push('== PROYECTOS (usa el ID exacto entre corchetes si necesitas referenciar uno) ==')
  ctx.push('Total: ' + projects.length + ' | Activos/Pendientes: ' + activeProjects)

  if (projects.length > 0) {
    ctx.push('Lista de proyectos:')
    projects.slice(0, 30).forEach(function(p) {
      ctx.push('- [id: ' + p.id + '] ' + p.name + ' | Estado: ' + p.status + ' | Etapa: ' + (p.stage || 'N/A') + ' | Progreso: ' + (p.progress || 0) + '%' + (p.budget > 0 ? ' | Presupuesto: ' + p.budget + 'E' : '') + (p.due_date ? ' | Entrega: ' + p.due_date : ''))
    })
  }

  ctx.push('')
  ctx.push('== FINANZAS ==')
  ctx.push('MRR: ' + Math.round(mrr) + 'E/mes')
  ctx.push('Ingresos este mes: ' + Math.round(monthIncome) + 'E')
  ctx.push('Gastos este mes: '   + Math.round(monthExpense) + 'E')
  ctx.push('Beneficio este mes: ' + Math.round(monthIncome - monthExpense) + 'E')
  ctx.push('Facturas pendientes: ' + Math.round(pendingInv) + 'E')

  ctx.push('')
  ctx.push('== SERVICIOS (usa el ID exacto si el usuario menciona uno de estos servicios) ==')
  services.forEach(function(s) {
    ctx.push('- [id: ' + s.id + '] ' + s.name + ' | Categoria: ' + s.category + ' | Precio: ' + s.price + 'E | Activo: ' + (s.active ? 'Si' : 'No'))
  })

  ctx.push('')
  ctx.push('== SUSCRIPCIONES ==')
  subscriptions.forEach(function(s) {
    ctx.push('- ' + s.name + ' | Estado: ' + s.status + ' | ' + s.price + 'E/' + s.period)
  })

  ctx.push('')
  ctx.push('== MOVIMIENTOS RECIENTES ==')
  finance.slice(0, 10).forEach(function(e) {
    ctx.push('- ' + e.entry_date + ' | ' + e.type + ' | ' + e.amount + 'E | ' + (e.description || 'Sin descripcion'))
  })

  return ctx.join('\n')
}

/* ── Protocolo de acciones ─────────────────────────────────── */
var ACTION_PROTOCOL = [
  '',
  '=== CAPACIDAD DE ACCION ===',
  'Ademas de responder preguntas, puedes PROPONER acciones reales sobre los datos del negocio: crear un cliente, un proyecto, una factura, un evento de calendario, o un movimiento en Finanzas.',
  '',
  'REGLAS IMPORTANTES:',
  '1. NUNCA ejecutas la accion tu mismo. Solo la PROPONES, y el usuario la confirma o la cancela desde una tarjeta que vera en el chat.',
  '2. Si te falta informacion importante (por ejemplo, el importe de una factura, o no sabes a que cliente se refiere), PREGUNTA primero en texto normal. No inventes datos ni asumas importes.',
  '3. Si el usuario menciona un cliente o proyecto que existe en el contexto de arriba, usa su ID exacto tal cual aparece entre corchetes. Si no encuentras un cliente que coincida, dilo y pregunta, no inventes un ID.',
  '4. Cuando tengas todos los datos necesarios, responde con un poco de texto normal explicando lo que vas a proponer, y despues, en su propia linea, este bloque EXACTO (sin nada mas dentro, JSON valido en una sola linea):',
  '',
  '[AKIRA_ACTION]{"type":"TIPO_DE_ACCION","data":{...}}[/AKIRA_ACTION]',
  '',
  '5. Los tipos de accion validos y sus campos son EXACTAMENTE estos (usa solo estos nombres de campo):',
  '',
  'create_client: { "name": string (obligatorio), "company": string, "email": string, "phone": string, "niche": string, "status": "lead"|"active"|"at_risk"|"paused"|"lost" (por defecto "lead"), "source": string, "monthly_value": number, "notes": string }',
  '',
  'create_project: { "name": string (obligatorio), "client_id": string o null, "description": string, "status": "pending"|"active"|"review"|"completed"|"cancelled" (por defecto "pending"), "priority": "low"|"medium"|"high"|"urgent" (por defecto "medium"), "stage": "preproduction"|"production"|"postproduction"|"delivery"|"closed" (por defecto "preproduction"), "budget": number, "due_date": "YYYY-MM-DD" o null }',
  '',
  'create_invoice: { "client_id": string o null, "items": [{ "description": string, "quantity": number, "price": number }] (obligatorio, al menos una linea), "tax_rate": number (por defecto 21), "due_date": "YYYY-MM-DD" o null, "notes": string }',
  '',
  'create_calendar_event: { "title": string (obligatorio), "event_date": "YYYY-MM-DD" (obligatorio), "start_time": "HH:MM" o null, "end_time": "HH:MM" o null, "event_type": "meeting"|"deadline"|"delivery"|"billing"|"other" (por defecto "meeting"), "description": string, "location": string, "client_id": string o null }',
  '',
  'create_finance_entry: { "type": "income"|"expense"|"invoice"|"payment"|"refund" (obligatorio), "category": string (por defecto "General"), "description": string (obligatorio), "amount": number (obligatorio), "entry_date": "YYYY-MM-DD" (por defecto hoy), "status": "confirmed"|"pending" (por defecto "confirmed"), "client_id": string o null, "project_id": string o null, "notes": string }',
  '',
  'Ejemplo de respuesta cuando propones una accion:',
  'Vale, voy a preparar una factura para Genaro Alfonsin por el video de julio, 250 euros.',
  '[AKIRA_ACTION]{"type":"create_invoice","data":{"client_id":"9bad599c-817f-457b-a88f-74754b1cff83","items":[{"description":"Video de julio","quantity":1,"price":250}],"tax_rate":21}}[/AKIRA_ACTION]',
].join('\n')

var SYSTEM_PROMPT_BASE = [
  'Eres Akira Brain, el asistente de inteligencia artificial integrado en AKIRA OS, un sistema operativo de negocio para profesionales creativos audiovisuales.',
  '',
  'Tu personalidad:',
  '- Eres directo, profesional y util',
  '- Hablas en espanol',
  '- Usas datos reales del negocio cuando estan disponibles',
  '- Das respuestas concisas pero completas',
  '- Puedes analizar datos, hacer calculos y dar recomendaciones estrategicas',
  '- Conoces el sector audiovisual: produccion de video, fotografia, motion graphics, podcasts, etc',
  '',
  'Capacidades:',
  '- Analizar el estado del negocio',
  '- Identificar oportunidades y riesgos',
  '- Ayudar con propuestas y presupuestos',
  '- Redactar emails, contratos y documentos',
  '- Analizar rentabilidad de clientes y proyectos',
  '- Dar consejos de gestion empresarial',
  '- Responder preguntas sobre los datos del negocio',
  '- Proponer acciones reales (crear clientes, proyectos, facturas, eventos, movimientos) que el usuario confirma antes de guardarse',
  ACTION_PROTOCOL,
].join('\n')

/* ═══════════════════════════════════════════════════════════
   CONVERSACIONES
═══════════════════════════════════════════════════════════ */

export async function getConversations() {
  var ownerId = await uid()
  var res = await supabase
    .from('brain_conversations')
    .select('id,title,model,created_at,updated_at')
    .eq('owner_id', ownerId)
    .eq('archived', false)
    .order('updated_at', { ascending: false })
  if (res.error) throw res.error
  return res.data || []
}

export async function createConversation(title) {
  var ownerId = await uid()
  var res = await supabase.from('brain_conversations').insert({
    owner_id: ownerId,
    title:    title || 'Nueva conversacion',
    model:    'gemini-2.0-flash',
    archived: false,
  }).select().single()
  if (res.error) throw res.error
  return res.data
}

export async function updateConversationTitle(id, title) {
  var res = await supabase.from('brain_conversations').update({ title: title }).eq('id', id).select().single()
  if (res.error) throw res.error
  return res.data
}

export async function archiveConversation(id) {
  var res = await supabase.from('brain_conversations').update({ archived: true }).eq('id', id)
  if (res.error) throw res.error
  return true
}

export async function getMessages(conversationId) {
  var res = await supabase
    .from('brain_messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
  if (res.error) throw res.error
  return res.data || []
}

export async function saveMessage(conversationId, role, content) {
  var ownerId = await uid()
  var res = await supabase.from('brain_messages').insert({
    conversation_id: conversationId,
    owner_id:        ownerId,
    role:            role,
    content:         content,
  }).select().single()
  if (res.error) throw res.error
  return res.data
}

/* ═══════════════════════════════════════════════════════════
   GEMINI
═══════════════════════════════════════════════════════════ */

export async function sendMessageToGemini(conversationId, userMessage, previousMessages) {
  if (!GEMINI_KEY) throw new Error('Falta VITE_GEMINI_API_KEY en el archivo .env')

  var businessCtx   = await buildBusinessContext()
  var systemWithCtx = SYSTEM_PROMPT_BASE + '\n\n' + businessCtx

  var genAI = new GoogleGenerativeAI(GEMINI_KEY)
  var model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    systemInstruction: systemWithCtx,
  })

  var history = (previousMessages || [])
    .filter(function(m) { return m.role === 'user' || m.role === 'assistant' })
    .map(function(m) {
      return {
        role:  m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }
    })

  var chat = model.startChat({
    history: history,
    generationConfig: {
      maxOutputTokens: 2048,
      temperature:     0.7,
    },
  })

  var result = await chat.sendMessage(userMessage)
  var text   = result.response.text()

  return text
}

export async function sendMessageStream(conversationId, userMessage, previousMessages, onChunk) {
  if (!GEMINI_KEY) throw new Error('Falta VITE_GEMINI_API_KEY en el archivo .env')

  var businessCtx    = await buildBusinessContext()
  var systemWithCtx  = SYSTEM_PROMPT_BASE + '\n\n' + businessCtx

  var genAI = new GoogleGenerativeAI(GEMINI_KEY)
  var model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    systemInstruction: systemWithCtx,
  })

  var history = (previousMessages || [])
    .filter(function(m) { return m.role === 'user' || m.role === 'assistant' })
    .map(function(m) {
      return {
        role:  m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }
    })

  var chat = model.startChat({
    history: history,
    generationConfig: {
      maxOutputTokens: 2048,
      temperature:     0.7,
    },
  })

  var result     = await chat.sendMessageStream(userMessage)
  var fullText   = ''

  for await (var chunk of result.stream) {
    var chunkText = chunk.text()
    fullText += chunkText
    if (onChunk) onChunk(chunkText, fullText)
  }

  return fullText
}

/* ═══════════════════════════════════════════════════════════
   RESUMEN DE PROYECTO (V5 — resumenes generados por IA)
═══════════════════════════════════════════════════════════ */

export async function generateProjectSummary(project) {
  if (!GEMINI_KEY) throw new Error('Falta VITE_GEMINI_API_KEY en el archivo .env')

  var tasks = Array.isArray(project.tasks) ? project.tasks : []
  var done  = tasks.filter(function(t) { return t.done }).length
  var budget = Number(project.budget) || 0
  var cost   = Number(project.actual_cost) || 0

  var contextLines = [
    'Proyecto: ' + project.name,
    'Cliente: ' + (project.clients ? project.clients.name : 'Sin cliente'),
    'Estado: ' + project.status,
    'Etapa: ' + project.stage,
    'Progreso: ' + (project.progress || 0) + '%',
    'Tareas: ' + done + ' completadas de ' + tasks.length,
    budget > 0 ? 'Presupuesto: ' + budget + 'E, coste real hasta ahora: ' + cost + 'E' : null,
    project.due_date ? 'Fecha de entrega: ' + project.due_date : null,
  ].filter(Boolean).join('\n')

  var genAI = new GoogleGenerativeAI(GEMINI_KEY)
  var model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    systemInstruction: 'Eres Akira Brain. Te doy los datos de un proyecto y debes resumir su situacion en una sola frase corta, en espanol, directa y util para un vistazo rapido. No uses saludos ni introducciones. Maximo 25 palabras. Si detectas algo preocupante (retraso, sobrecoste, sin actividad), dilo directamente sin rodeos.',
  })

  var result = await model.generateContent(contextLines)
  return result.response.text().trim()
}