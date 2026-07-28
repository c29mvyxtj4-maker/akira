/**
 * Despliegue de producción en un solo paso.
 *
 *   npm run deploy
 *
 * Hace lo que antes era manual (y se olvidaba): despliega a producción y
 * reapunta TODOS los alias de producción al nuevo despliegue. Así el sitio
 * en vivo nunca se queda desactualizado por no mover el alias a mano.
 *
 * Requiere la CLI de Vercel instalada y con sesión iniciada (`vercel login`).
 */
import { execSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// El proyecto de Vercel está enlazado en la RAÍZ del repo con Root Directory
// = "akira-saas". Hay que ejecutar `vercel` desde la raíz; si se corre desde
// akira-saas/ (como hace npm), Vercel duplica la ruta (akira-saas/akira-saas).
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '../..')

// Alias de producción que deben apuntar siempre al último despliegue.
const PROD_ALIASES = [
  'akira-os-dun.vercel.app',
  'akira-os-akira-saas.vercel.app',
  'akira-os-marcroson7-7292-akira-saas.vercel.app',
]

function run(cmd) {
  return execSync(cmd, { encoding: 'utf8', stdio: ['inherit', 'pipe', 'pipe'], cwd: REPO_ROOT })
}

try {
  console.log('▶ Desplegando a producción…')
  const out = run('vercel --prod --yes')
  const url = (out.match(/https:\/\/akira-[a-z0-9]+-akira-saas\.vercel\.app/) || [])[0]

  if (!url) {
    console.error('✖ No se pudo leer la URL del despliegue en la salida de Vercel:\n')
    console.error(out)
    process.exit(1)
  }
  console.log('  Despliegue nuevo:', url)

  let failed = 0
  for (const alias of PROD_ALIASES) {
    process.stdout.write(`▶ Apuntando ${alias} … `)
    try {
      run(`vercel alias set ${url} ${alias}`)
      console.log('OK')
    } catch (e) {
      failed++
      console.log('FALLÓ')
      console.error('  ' + (e.stderr || e.message || '').toString().trim())
    }
  }

  if (failed > 0) {
    console.error(`\n✖ ${failed} alias no se pudieron actualizar. Revísalos arriba.`)
    process.exit(1)
  }

  console.log('\n✔ Producción actualizada en https://' + PROD_ALIASES[0])
} catch (e) {
  console.error('✖ El despliegue ha fallado:\n')
  console.error((e.stderr || e.stdout || e.message || '').toString())
  process.exit(1)
}
