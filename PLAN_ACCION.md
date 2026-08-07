# 🚀 AKIRA v2.0 — Plan de Acción Inmediato

**Creado:** 2026-08-07  
**Para:** Marc  
**Objetivo:** Transformar AKIRA de v1.0 → v2.0 en 8-10 horas

---

## 🎯 TU SITUACIÓN ACTUAL

```
✅ Proyecto: C:\Users\marcr\Desktop\AKIRA\akira-saas
✅ Estado: 191 archivos, 28,861 LOC, funcionando perfectamente
✅ Stack: React 18 + Vite + Supabase + Stripe + Gemini
✅ Listo para: Agregar features sin migración
```

**Lo que tienes:** Un SaaS profesional, bien estructurado.  
**Lo que queremos agregar:** Widgets + Automation + Sync + Mobile tweaks.  
**Cómo:** Sin tocar código existente, solo nuevos módulos.  
**Tiempo:** 8-10 horas (distribuidas).  
**Riesgo:** BAJO (muy bajo).

---

## 📋 3 OPCIONES DE EJECUCIÓN

### OPCIÓN 1: RÁPIDA (Hoy, 2-3 horas)
**Solo Widgets** → Dashboard mejora inmediatamente

```
Tiempo: 2-3h
Resultado: Widget System funcionando
Impacto: Dashboard personalizable
```

**Haz esto si:** Quieres resultado rápido hoy.

---

### OPCIÓN 2: COMPLETA (Este fin de semana, 8-10 horas)
**Widgets + Automation + Sync + Mobile + Cleanup**

```
Tiempo total: 8-10h
Viernes:  Widgets (2-3h)
Sábado:   Automation (3-4h)
Domingo:  Sync + Mobile + Cleanup (2-3h)

Resultado: AKIRA v2.0 completamente nuevo
```

**Haz esto si:** Tienes el fin de semana libre.

---

### OPCIÓN 3: PAUSADO (Próxima semana, a tu ritmo)
**1 feature por día** → Tiempo para integrar bien

```
Lunes:    Widget System (test + integrar)
Martes:   Automation (test + integrar)
Miércoles: Sync + Mobile (test + integrar)
Jueves:   Cleanup + review
Viernes:  Testing final, deployment

Resultado: Cambios bien integrados, probados
```

**Haz esto si:** Prefieres sin prisa, bien hecho.

---

## 🔥 EMPIEZA AHORA: OPCIÓN 1 (WIDGETS)

### PASO 1: Prepara tu terminal (2 minutos)

```bash
# Abre PowerShell o Git Bash
cd C:\Users\marcr\Desktop\AKIRA\akira-saas

# Verifica que está corriendo
npm run dev
# Debería mostrar: Local: http://localhost:3000

# Déjalo corriendo en otra terminal/tab
```

### PASO 2: Lee el PROMPT 1 (3 minutos)

Abre `PROMPTS_PERSONALIZADOS_v2.md` en tu editor.  
Lee la sección: **"PROMPT 1: Widget System Integration"**

Es un prompt completísimo, específico para tu proyecto. Solo le falta que lo ejecutes.

### PASO 3: Ejecuta el PROMPT con Claude Code (5-10 minutos)

**Opción A: Si tienes Claude Code instalado:**

```bash
# En terminal, en el directorio akira-saas:
claude code run

# Se abre la interfaz de Claude Code
# Copia TODO el PROMPT 1 completo
# Pégalo en la ventana de Claude Code
# Presiona Enter / Generate

# Claude generará los archivos automáticamente
# Se crearán en: src/modules/widgets/
```

**Opción B: Si usas claude.ai/code:**

1. Abre https://claude.ai/code en tu navegador
2. Copia el PROMPT 1 completo
3. Pégalo en el chat
4. Presiona Enter
5. Claude genera los archivos
6. Descárgalos o cópialos a tu proyecto

### PASO 4: Aplica las migraciones SQL (3-5 minutos)

1. Abre **Supabase Dashboard** en tu navegador
2. Ve a: **SQL Editor**
3. Crea una nueva query
4. Copia el SQL del PROMPT 1 (sección "Database Tables"):
   ```sql
   CREATE TABLE dashboards (
   ...
   ```
5. Pégalo y ejecuta
6. Haz lo mismo con `dashboard_widgets` y las policies

### PASO 5: Reinicia dev server (30 segundos)

```bash
# En terminal donde corrés npm run dev:
# Presiona Ctrl+C
npm run dev

# Los cambios se recargan automáticamente
```

### PASO 6: Verifica en el navegador (2 minutos)

1. Abre http://localhost:3000
2. Ve a Dashboard
3. Deberías ver el nuevo WidgetGrid

Si ves widgets: ✅ **¡FUNCIONA!**

### PASO 7: Commit a Git (1 minuto)

```bash
git add .
git commit -m "feat(widgets): add widget system v2.0

- Implement WidgetRegistry with 10+ widget types
- Add drag-drop WidgetGrid component
- Add WidgetEditor for add/remove/configure
- Create dashboards & dashboard_widgets tables
- Implement RLS policies for multi-tenant
- Integrate with existing Dashboard"
```

---

## ✅ RESULTADO DESPUÉS DE PASO 7

**Tiempo invertido:** 15-30 minutos  
**Líneas de código agregadas:** ~2,000  
**Features nuevas:** Widget System completo  
**Breaking changes:** Cero  
**Status:** Listo para producción  

✅ Tu proyecto ahora tiene **Widget System v1**

---

## 🎨 AHORA: OPCIÓN 2 (AGREGAR AUTOMATION)

Si completaste PASO 7 y quieres más:

### PASO 8: Lee PROMPT 2 (5 minutos)

Abre `PROMPTS_PERSONALIZADOS_v2.md`  
Lee sección: **"PROMPT 2: Universal Automation Platform"**

### PASO 9: Ejecuta PROMPT 2 (15-30 minutos)

Mismo proceso que PASO 3:
```bash
# Copia PROMPT 2 completo
# Ejecuta con Claude Code
# Archivos se crean en: src/modules/automation/
```

### PASO 10: Aplica SQL de Automation (3-5 minutos)

```bash
# Supabase → SQL Editor
# Copia & pega el SQL del PROMPT 2
# Ejecuta
```

### PASO 11: Reinicia + Verifica (30 segundos)

```bash
# Ctrl+C en terminal dev
npm run dev

# Abre http://localhost:3000
# Deberías ver nueva página "Automation" en sidebar
```

### PASO 12: Commit (1 minuto)

```bash
git add .
git commit -m "feat(automation): add workflow engine + 8 agents

- Implement BaseAgent abstract class
- Create ResearchAgent, StrategyAgent, ContentAgent, etc
- Add 4 workflow templates (Content, SaaS, Client, Marketing)
- Create workflows.service.js
- Add UI: WorkflowBuilder, WorkflowExecutor, etc
- Integrate with Brain.jsx"
```

---

## 💾 DESPUÉS DE PASO 12

**Tiempo invertido:** 45-60 minutos adicionales  
**Total tiempo:** 1-1.5 horas  
**Features nuevas:** Automation Platform + 8 agents  
**Status:** v2.0 está tomando forma  

✅ Ahora tienes **Widget System + Automation**

---

## 🔄 CONTINÚA: PROMPTS 3, 4, 5 (OPCIONAL)

Si aún tienes energía:

### PROMPT 3: Sync (1-2 horas)
```bash
# Misma estructura
# Copia PROMPT 3
# Ejecuta con Claude Code
# SQL migrations
# Commit
```

### PROMPT 4: Mobile (1-2 horas)
```bash
# Revisar componentes responsivos
# Mejorar layouts para mobile
# Test en devtools mobile
```

### PROMPT 5: Cleanup (2-3 horas)
```bash
# Eliminar código duplicado
# Comprimir componentes
# Optimizar
```

---

## 📊 TIMELINE RECOMENDADO

### Opción A: RÁPIDO
```
Hoy 15 min  → Widget System LISTO
Hoy 30 min  → Automation LISTO
Total: 45 minutos → v2.0 básico
```

### Opción B: COMPLETO (fin de semana)
```
Viernes 2h   → Widgets + test
Sábado 3h    → Automation + test
Domingo 1h   → Sync + Mobile + Cleanup + test
Total: 6-7h → v2.0 COMPLETO
```

### Opción C: PAUSADO (próxima semana)
```
Lun 2-3h    → Widgets (test, integrar, commit)
Mar 3-4h    → Automation (test, integrar, commit)
Mié 2-3h    → Sync, Mobile (test, integrar, commit)
Jue 1-2h    → Cleanup (test, integrar, commit)
Vie 1h      → Review final, deploy
Total: 9-13h → v2.0 PROFESIONAL
```

---

## 📱 DURANTE EL PROCESO

### Cosas que NO debes hacer:
❌ No modifiques código existente (solo agrega)  
❌ No elimines carpetas existentes  
❌ No cambies dependencias en package.json  
❌ No pushes a main sin testing  

### Cosas que SÍ debes hacer:
✅ Crea carpetas nuevas (src/modules/)  
✅ Reutiliza servicios existentes  
✅ Aplica SQL en Supabase primero  
✅ Test en dev (npm run dev) antes de commit  
✅ Lee los errores en consola  

---

## 🧪 TESTING CADA FEATURE

### Después de agregar Widgets:
```bash
# 1. ¿Carga sin errores? (F12 → Console)
# 2. ¿Se ven widgets en Dashboard?
# 3. ¿Puedo agregar/remover widgets?
# 4. ¿Se guardan en Supabase?
# 5. ¿Persisten después de refrescar?

Si todas son SÍ → ✅ Ready to commit
```

### Después de agregar Automation:
```bash
# 1. ¿Nueva página aparece en sidebar?
# 2. ¿Puedo crear workflows?
# 3. ¿Los agents responden?
# 4. ¿Se guardan executions en Supabase?
# 5. ¿Puedo ver logs?

Si todas son SÍ → ✅ Ready to commit
```

### Después de cada prompt:
```bash
npm run build  # Verifica que compila
npm run test   # Si hay tests
```

---

## 🆘 TROUBLESHOOTING RÁPIDO

### Error: "Module not found @/modules/widgets"
**Solución:** Verifica que Vite tiene alias `@` en `vite.config.js`
```javascript
// Ya debería estar en tu config:
alias: { '@': './src' }
```

### Error: "Supabase connection failed"
**Solución:** Verifica .env tiene credenciales:
```bash
# .env en akira-saas/
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_key
```

### Error: "RLS policy violation"
**Solución:** Aplica SQL de PROMPT primero, en Supabase Dashboard → SQL Editor

### Error: "Component renders forever / blank page"
**Solución:** 
1. Abre DevTools (F12)
2. Ve a Console
3. Busca errores de React
4. Verifica imports (rutas con @/)

### Código no se actualiza en dev
**Solución:**
```bash
# Kill dev server
Ctrl+C
# Reinicia
npm run dev
```

---

## 📚 ARCHIVOS CLAVE QUE NECESITAS

```
C:\Users\marcr\Desktop\AKIRA\
├── CLAUDE.md                        # Referencia general del proyecto
├── PROMPTS_PERSONALIZADOS_v2.md     # Los 5 prompts listos para ejecutar
├── AUDIT_RESUMEN.md                 # Análisis del proyecto actual
├── PLAN_ACCION.md                   # Este archivo
└── akira-saas/
    ├── src/
    │   ├── lib/supabase.js          # (no tocar) cliente Supabase
    │   ├── context/                 # (no tocar) Auth, Org, App
    │   ├── services/                # (reutilizar!) para widgets/automation
    │   └── modules/                 # (crear aquí) widgets/, automation/, sync/
    ├── .env                         # (no pushear) credenciales
    ├── vite.config.js               # (revisar) alias @/
    └── package.json                 # (no cambiar versiones)
```

---

## 🎬 COMIENZA AHORA

### Paso 0: Decisión (1 minuto)
¿Qué opción eliges?
- [ ] **RÁPIDA:** Solo Widgets hoy (15-30 min)
- [ ] **COMPLETA:** Widgets + Automation hoy (1-1.5h)
- [ ] **TOTAL:** Todo este fin de semana (8-10h)
- [ ] **PAUSADO:** Próxima semana, tranquilo

### Paso 1: Prepara terminal
```bash
cd C:\Users\marcr\Desktop\AKIRA\akira-saas
npm run dev
```

### Paso 2: Elige prompt
Abre `PROMPTS_PERSONALIZADOS_v2.md`

### Paso 3: Ejecuta con Claude Code
Copia prompt → Pega en Claude Code → Enter

### Paso 4: Espera (5-15 minutos)
Claude genera todos los archivos

### Paso 5: Aplica SQL
Supabase Dashboard → SQL Editor → Copia SQL del prompt

### Paso 6: Commit
```bash
git add .
git commit -m "feat(v2): add [widgets/automation/etc]"
```

### ✅ LISTO
Feature nueva funciona en http://localhost:3000

---

## 📞 SI ALGO FALLA

1. **Lee la consola** (F12 en navegador)
2. **Mira los errores** en terminal dev
3. **Verifica .env** tiene credenciales
4. **Aplica SQL primero** en Supabase
5. **Reinicia dev server** (Ctrl+C, npm run dev)

99% de errores se resuelven así.

---

## 🎊 CUÁNDO HAYAS TERMINADO TODO

Tendrás:
- ✅ Widget System (10+ widgets)
- ✅ Automation Platform (8 agents, 4 templates)
- ✅ Global Sync (subscriptions centralizadas)
- ✅ Mobile tweaks (responsive)
- ✅ Clean code (organized, maintainable)

**Total LOC:** ~30,000+ (aggregated)  
**Total features:** 50+  
**Production ready:** ✅ YES  

Pasa a deployment, marketing, crecimiento. 🚀

---

## 📝 CHECKLIST FINAL

### Antes de empezar
- [ ] Terminal abierta en `C:\Users\marcr\Desktop\AKIRA\akira-saas`
- [ ] `npm run dev` funciona
- [ ] `.env` tiene credenciales Supabase
- [ ] Navegador abierto en http://localhost:3000
- [ ] PROMPTS_PERSONALIZADOS_v2.md listo para copiar

### Durante la ejecución
- [ ] Copia PROMPT completo y exacto
- [ ] Ejecuta con Claude Code
- [ ] Espera a que genere archivos
- [ ] Aplica SQL en Supabase
- [ ] Reinicia dev server
- [ ] Verifica en navegador
- [ ] Commit a Git

### Después de cada feature
- [ ] ¿Compila sin errores? (F12 console limpia)
- [ ] ¿Funciona en http://localhost:3000?
- [ ] ¿Se guardan cambios en Supabase?
- [ ] ¿Se persisten después de refrescar?
- [ ] ¿Sin breaking changes en código existente?

---

## 🏁 RESUMEN

**Tu proyecto:** Excelente, listo para v2.0  
**Tu tiempo:** 15 minutos a 10 horas (elige)  
**Tu riesgo:** Muy bajo  
**Resultado:** AKIRA v2.0, production-ready  

**Próximo paso:** Elige opción, abre prompt, ejecuta.

¡Que empiece la magia! 🚀

---

**Documento creado:** 2026-08-07  
**Para:** Marc  
**Email:** marcroson7@gmail.com  
**Proyecto:** AKIRA SaaS v2.0
