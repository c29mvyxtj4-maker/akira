import { useEffect, useCallback } from 'react'

/**
 * Custom hook for handling keyboard shortcuts
 *
 * Usage:
 * const shortcuts = useKeyboardShortcuts([
 *   { key: 'n', ctrlKey: true, label: 'New item', handler: () => console.log('new') },
 *   { key: 's', ctrlKey: true, label: 'Save', handler: () => console.log('save') },
 * ])
 *
 * Features:
 * - Support for Ctrl, Cmd (Mac), Shift, Alt
 * - Prevents default browser behavior when needed
 * - Shows available shortcuts
 * - Works across all modern browsers
 */
export function useKeyboardShortcuts(shortcuts = [], enabled = true) {
  const handleKeyDown = useCallback(
    (event) => {
      if (!enabled) return

      // Don't trigger shortcuts when typing in input/textarea
      const isInput =
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target.contentEditable === 'true'

      for (const shortcut of shortcuts) {
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase()

        const ctrlMatch =
          shortcut.ctrlKey === undefined ||
          (shortcut.ctrlKey && (event.ctrlKey || event.metaKey)) ||
          (!shortcut.ctrlKey && !event.ctrlKey && !event.metaKey)

        const shiftMatch =
          shortcut.shiftKey === undefined ||
          (shortcut.shiftKey && event.shiftKey) ||
          (!shortcut.shiftKey && !event.shiftKey)

        const altMatch =
          shortcut.altKey === undefined ||
          (shortcut.altKey && event.altKey) ||
          (!shortcut.altKey && !event.altKey)

        if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
          // Only prevent default for shortcuts that require it
          if (shortcut.preventDefault !== false) {
            event.preventDefault()
          }

          // Don't trigger shortcuts when typing in input, unless explicitly allowed
          if (!isInput || shortcut.allowInInput) {
            shortcut.handler?.(event)
          }

          break
        }
      }
    },
    [shortcuts, enabled]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return {
    shortcuts,
    // Helper to format shortcut for display
    formatShortcut: (shortcut) => {
      const parts = []
      if (shortcut.ctrlKey) parts.push('Ctrl')
      if (shortcut.altKey) parts.push('Alt')
      if (shortcut.shiftKey) parts.push('Shift')
      parts.push(shortcut.key.toUpperCase())
      return parts.join('+')
    },
  }
}

/**
 * Global keyboard shortcuts for AKIRA
 */
export const GLOBAL_SHORTCUTS = [
  {
    key: 'k',
    ctrlKey: true,
    label: 'Open Command Palette',
    category: 'Navigation',
  },
  {
    key: 'n',
    ctrlKey: true,
    label: 'Create new (context-aware)',
    category: 'Create',
  },
  {
    key: 's',
    ctrlKey: true,
    label: 'Save',
    category: 'Actions',
    preventDefault: true,
  },
  {
    key: 'z',
    ctrlKey: true,
    label: 'Undo',
    category: 'Edit',
  },
  {
    key: 'y',
    ctrlKey: true,
    label: 'Redo',
    category: 'Edit',
  },
  {
    key: '?',
    label: 'Show shortcuts help',
    category: 'Help',
  },
  {
    key: 'Escape',
    label: 'Close dialog/modal',
    category: 'Navigation',
  },
]

/**
 * Context-specific shortcuts
 */
export const CONTEXT_SHORTCUTS = {
  clients: [
    { key: 'i', ctrlKey: true, label: 'Create invoice', category: 'Actions' },
    { key: 't', ctrlKey: true, label: 'Add timeline entry', category: 'Actions' },
    { key: 'f', ctrlKey: true, label: 'Filter clients', category: 'View' },
  ],
  projects: [
    { key: 'n', ctrlKey: true, label: 'Create task', category: 'Actions' },
    { key: 't', ctrlKey: true, label: 'Change view', category: 'View' },
    { key: 'f', ctrlKey: true, label: 'Filter projects', category: 'View' },
  ],
  invoices: [
    { key: 'n', ctrlKey: true, label: 'Create invoice', category: 'Actions' },
    { key: 's', ctrlKey: true, label: 'Send invoice', category: 'Actions' },
    { key: 'f', ctrlKey: true, label: 'Filter invoices', category: 'View' },
  ],
}

export default useKeyboardShortcuts
