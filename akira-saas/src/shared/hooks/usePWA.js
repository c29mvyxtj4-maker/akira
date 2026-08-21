import { useState, useEffect } from 'react'

export function usePWA() {
  var [installPrompt,   setInstallPrompt]   = useState(null)
  var [isInstalled,     setIsInstalled]     = useState(false)
  var [isIOS,           setIsIOS]           = useState(false)
  var [isStandalone,    setIsStandalone]    = useState(false)
  var [updateAvailable, setUpdateAvailable] = useState(false)

  useEffect(function() {
    var ios = /iphone|ipad|ipod/i.test(window.navigator.userAgent)
    setIsIOS(ios)

    var standalone = window.matchMedia('(display-mode: standalone)').matches
      || window.navigator.standalone === true
    setIsStandalone(standalone)
    setIsInstalled(standalone)

    function onBeforeInstall(e) {
      e.preventDefault()
      setInstallPrompt(e)
    }
    window.addEventListener('beforeinstallprompt', onBeforeInstall)

    function onAppInstalled() {
      setIsInstalled(true)
      setInstallPrompt(null)
    }
    window.addEventListener('appinstalled', onAppInstalled)

    return function() {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall)
      window.removeEventListener('appinstalled', onAppInstalled)
    }
  }, [])

  useEffect(function() {
    if (!('serviceWorker' in navigator)) return
    navigator.serviceWorker.getRegistration().then(function(reg) {
      if (!reg) return
      reg.addEventListener('updatefound', function() {
        var newWorker = reg.installing
        if (!newWorker) return
        newWorker.addEventListener('statechange', function() {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            setUpdateAvailable(true)
          }
        })
      })
    })
  }, [])

  function install() {
    if (!installPrompt) return Promise.resolve(false)
    return installPrompt.prompt().then(function(result) {
      if (result.outcome === 'accepted') {
        setInstallPrompt(null)
        setIsInstalled(true)
        return true
      }
      return false
    })
  }

  function applyUpdate() {
    if (!('serviceWorker' in navigator)) return
    navigator.serviceWorker.getRegistration().then(function(reg) {
      if (reg && reg.waiting) {
        reg.waiting.postMessage({ type: 'SKIP_WAITING' })
        window.location.reload()
      }
    })
  }

  return {
    installPrompt,
    isInstalled,
    isIOS,
    isStandalone,
    updateAvailable,
    install,
    applyUpdate,
    canInstall: !!installPrompt || (isIOS && !isStandalone),
  }
}