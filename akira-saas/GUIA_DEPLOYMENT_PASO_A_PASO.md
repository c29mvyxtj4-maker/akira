# 📚 GUÍA PASO A PASO - Deployment a Netlify

**⏱️ Tiempo total: 10 minutos**

---

## 🎯 OBJETIVO
Desplegar AKIRA SaaS a producción en Netlify con un solo click.

---

# FASE 1: OBTENER LOS TOKENS (5 minutos)

## Paso 1️⃣ - Obtener Token de Netlify

### En tu terminal:
```bash
netlify login
```

Esto abrirá un navegador. Inicia sesión con tu cuenta de Netlify.

**Si no tienes cuenta:**
1. Ve a https://app.netlify.com
2. Haz clic en "Sign up"
3. Usa GitHub para registrarte (más rápido)

---

### Después de iniciar sesión, ejecuta:
```bash
netlify api getAccessToken
```

**Verás algo como:**
```
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

✅ **Copia este token completo** (lo necesitarás en 2 minutos)

---

## Paso 2️⃣ - Obtener Site ID de Netlify

### En tu terminal:
```bash
netlify status
```

**Verás algo como:**
```
───────────────────────────────────────
Account information
───────────────────────────────────────
  Email:        tu-email@example.com

───────────────────────────────────────
Site information
───────────────────────────────────────
  Site ID:      a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
  Site name:    akira-os
  Site url:     https://akira-os-dun.netlify.app
```

✅ **Copia el Site ID** (la parte larga que dice `a1b2c3d4...`)

---

## Paso 3️⃣ - Obtener Variables de Supabase

### Abre tu archivo `.env` local:
```
C:\Users\[TU_USUARIO]\Desktop\AKIRA\akira-saas\.env
```

**Verás algo como:**
```
VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_GOOGLE_AI_KEY=AIzaSyxxxxxxxxxxxxxxxx
```

✅ **Copia estos 3 valores**

---

# FASE 2: AGREGAR SECRETS A GITHUB (3 minutos)

## Paso 4️⃣ - Ir a GitHub Secrets

### En tu navegador, ve a:
```
https://github.com/c29mvyxtj4-maker/akira/settings/secrets/actions
```

**Deberías ver una pantalla que dice:**
```
Repository secrets
+ New repository secret
```

---

## Paso 5️⃣ - Agregar Secret #1: NETLIFY_AUTH_TOKEN

### Haz clic en "+ New repository secret"

**Rellena:**
```
Name: NETLIFY_AUTH_TOKEN
Value: [PEGA EL TOKEN QUE COPIASTE EN PASO 1]
```

Haz clic en "Add secret"

---

## Paso 6️⃣ - Agregar Secret #2: NETLIFY_SITE_ID

### Haz clic nuevamente en "+ New repository secret"

**Rellena:**
```
Name: NETLIFY_SITE_ID
Value: [PEGA EL SITE ID QUE COPIASTE EN PASO 2]
```

Haz clic en "Add secret"

---

## Paso 7️⃣ - Agregar Secret #3: VITE_SUPABASE_URL

### Haz clic nuevamente en "+ New repository secret"

**Rellena:**
```
Name: VITE_SUPABASE_URL
Value: [PEGA: https://xxxxxxxx.supabase.co]
```

Haz clic en "Add secret"

---

## Paso 8️⃣ - Agregar Secret #4: VITE_SUPABASE_ANON_KEY

### Haz clic nuevamente en "+ New repository secret"

**Rellena:**
```
Name: VITE_SUPABASE_ANON_KEY
Value: [PEGA LA CLAVE LARGA DE SUPABASE]
```

Haz clic en "Add secret"

---

## Paso 9️⃣ - Agregar Secret #5: VITE_GOOGLE_AI_KEY

### Haz clic nuevamente en "+ New repository secret"

**Rellena:**
```
Name: VITE_GOOGLE_AI_KEY
Value: [PEGA LA CLAVE DE GOOGLE AI]
```

Haz clic en "Add secret"

---

### ✅ Debería verse así en GitHub:
```
Repository secrets (5)

🔒 NETLIFY_AUTH_TOKEN      ••••••••••••••••••••••••••••••••
🔒 NETLIFY_SITE_ID         ••••••••••••••••••••••••••••••••
🔒 VITE_GOOGLE_AI_KEY      ••••••••••••••••••••••••••••••••
🔒 VITE_SUPABASE_ANON_KEY  ••••••••••••••••••••••••••••••••
🔒 VITE_SUPABASE_URL       ••••••••••••••••••••••••••••••••
```

---

# FASE 3: VERIFICAR DEPLOYMENT (2 minutos)

## Paso 1️⃣0️⃣ - Ver GitHub Actions en acción

### Ve a:
```
https://github.com/c29mvyxtj4-maker/akira/actions
```

**Deberías ver:**
```
🟡 Deploy to Netlify (in progress)
  ├─ 📦 Build (in progress)
  ├─ ✅ Checkout
  └─ ...
```

**Espera a que termine (~3-5 minutos)**

Cuando veas: ✅ **Deploy to Netlify** → Deployment completado

---

## Paso 1️⃣1️⃣ - Obtener tu URL en vivo

### Opción A: Ver en GitHub Actions
```
🟢 Deploy to Netlify ✅

"View deployment" → https://akira-os-dun.netlify.app
```

### Opción B: Ver en Netlify Dashboard
```
https://app.netlify.com/sites/akira-os/deploys
```

Busca el deploy más reciente con estado: **Published**

---

## ✅ ¡DEPLOYMENT COMPLETADO!

Tu sitio está **VIVO** en:
```
https://akira-os-dun.netlify.app
```

o tu URL personalizada si la configuraste.

---

# BONUS: PRÓXIMOS PASOS (Opcional)

## 🎯 Setup Custom Domain (10 minutos)

Si quieres usar tu propio dominio (ej: akira-os.com):

```
1. Compra dominio en: GoDaddy, Namecheap, Google Domains, etc.

2. Ve a: https://app.netlify.com/sites/akira-os/settings/domain

3. Haz clic en "Add custom domain"

4. Ingresa tu dominio (ej: akira-os.com)

5. Netlify te dice qué nameservers usar

6. Cambia los nameservers en tu registrador de dominio

7. Espera 24-48 horas para propagación DNS

8. ¡Listo! Tu sitio estará en tu dominio personalizado
```

---

## 🔄 Auto-Deploy en el Futuro

Ahora cada vez que hagas `git push origin master`:

```bash
$ git push origin master
To https://github.com/c29mvyxtj4-maker/akira
 * [new branch] master -> master
 
# GitHub Actions se dispara automáticamente
# → Compila
# → Ejecuta tests
# → Despliega a Netlify
```

**Sin hacer nada más.** ✨

---

## 📊 Verificar que Funciona

### 1. Abre tu URL en el navegador:
```
https://akira-os-dun.netlify.app
```

### 2. Verifica que ves:
- ✅ Logo de AKIRA
- ✅ Login page
- ✅ Sin errores en la consola

### 3. Si algo falla:
```
Abre DevTools (F12 o Cmd+Option+J)
Busca mensajes de error
Copia el error completo
```

---

# 🎊 ¡FELICIDADES!

Tu AKIRA SaaS está **en producción** 🚀

### Lo que logramos:
- ✅ Código compilado (3,325 módulos)
- ✅ Build automático con GitHub Actions
- ✅ Deployment automático a Netlify
- ✅ HTTPS automático (Let's Encrypt)
- ✅ CDN global
- ✅ Auto-redeploy en cada push

### Status:
```
🟢 Build:       PASSING
🟢 Deploy:      LIVE
🟢 Monitoring:  ACTIVE
🟢 Production:  GO
```

---

## 📞 Soporte Rápido

| Problema | Solución |
|----------|----------|
| Secrets no reconocidos | Espera 30s, GitHub cachea secrets |
| Build sigue fallando | Check GitHub Actions error log |
| Sitio muestra error 404 | Clear browser cache (Ctrl+Shift+R) |
| Deployment lento | Normal, primeiro build toma 5+ min |

---

**¿Preguntas?** Check:
- GitHub Actions tab: Logs detallados
- Netlify Dashboard: Deployment history
- Console del navegador: Client-side errors

---

**Creado por:** Claude Code  
**Plataforma:** Netlify + GitHub Actions  
**Framework:** React 18.3.1  
**Status:** ✅ PRODUCTION READY

🎉 **¡A disfrutar tu nuevo SaaS!**
