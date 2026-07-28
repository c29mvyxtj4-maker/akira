/*
 * Service worker autodestructivo (kill-switch).
 *
 * Un build anterior con vite-plugin-pwa dejó un service worker registrado en
 * los navegadores que precacheaba la app. Al quitar PWA del build, ese SW se
 * quedó "pegado" sirviendo la versión vieja: cada despliegue nuevo no llegaba
 * al usuario. Los navegadores comprueban /sw.js en cada navegación; al recibir
 * este script (distinto del anterior) lo instalan como actualización, y aquí
 * borramos todas las cachés, desregistramos el SW y recargamos las pestañas.
 * Resultado: cada navegador afectado se cura solo en la siguiente carga.
 *
 * No cachea nada. Es seguro dejarlo desplegado indefinidamente.
 */
self.addEventListener('install', function () {
  self.skipWaiting()
})

self.addEventListener('activate', function (event) {
  event.waitUntil(
    (async function () {
      try {
        var keys = await caches.keys()
        await Promise.all(keys.map(function (k) { return caches.delete(k) }))
      } catch (e) { /* noop */ }
      try {
        await self.registration.unregister()
      } catch (e) { /* noop */ }
      try {
        var clients = await self.clients.matchAll({ type: 'window' })
        clients.forEach(function (c) { c.navigate(c.url) })
      } catch (e) { /* noop */ }
    })()
  )
})
