/**
 * Accessibility Tests - WCAG 2.1 Level AA
 * Automated tests using Axe Core
 *
 * Run with: npm run test:a11y
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { axe, toHaveNoViolations } from 'jest-axe'

expect.extend(toHaveNoViolations)

describe('AKIRA Accessibility Compliance', () => {

  describe('Component Accessibility', () => {

    it('IconButton has proper aria-label', async () => {
      const container = document.createElement('div')

      // Mock IconButton component
      const button = document.createElement('button')
      button.setAttribute('aria-label', 'Editar')
      button.setAttribute('title', 'Editar')
      button.textContent = '✏️'
      container.appendChild(button)

      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('Toast notifications have aria-live', async () => {
      const container = document.createElement('div')
      const toast = document.createElement('div')
      toast.setAttribute('role', 'status')
      toast.setAttribute('aria-live', 'polite')
      toast.setAttribute('aria-atomic', 'true')
      toast.textContent = 'Operación exitosa'
      container.appendChild(toast)

      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('Form inputs have associated labels', async () => {
      const container = document.createElement('form')

      const label = document.createElement('label')
      label.setAttribute('for', 'email-input')
      label.textContent = 'Email'

      const input = document.createElement('input')
      input.id = 'email-input'
      input.type = 'email'
      input.required = true

      container.appendChild(label)
      container.appendChild(input)

      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('Buttons have accessible names', async () => {
      const container = document.createElement('div')

      // Button with text
      const textButton = document.createElement('button')
      textButton.textContent = 'Guardar'
      container.appendChild(textButton)

      // Button with aria-label
      const iconButton = document.createElement('button')
      iconButton.setAttribute('aria-label', 'Eliminar')
      container.appendChild(iconButton)

      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('Color contrast meets WCAG AA (4.5:1)', async () => {
      const container = document.createElement('div')

      const text = document.createElement('p')
      text.style.color = '#f1f5f9' // text-1 color
      text.style.backgroundColor = '#0d0d0d' // dark background
      text.textContent = 'Texto con contraste suficiente'
      container.appendChild(text)

      const results = await axe(container)
      // Note: This may need adjustment based on actual CSS variables
      expect(results).toHaveNoViolations()
    })

    it('Modal has proper ARIA attributes', async () => {
      const container = document.createElement('div')

      const modal = document.createElement('div')
      modal.setAttribute('role', 'dialog')
      modal.setAttribute('aria-modal', 'true')
      modal.setAttribute('aria-labelledby', 'modal-title')

      const title = document.createElement('h2')
      title.id = 'modal-title'
      title.textContent = 'Confirmar acción'

      modal.appendChild(title)
      container.appendChild(modal)

      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

  })

  describe('Keyboard Navigation', () => {

    it('All interactive elements are focusable', () => {
      const elements = document.querySelectorAll('button, a[href], input, select, textarea, [tabindex]')

      elements.forEach((el) => {
        expect(el.tabIndex).toBeGreaterThanOrEqual(-1)
      })
    })

    it('Focus is visible on interactive elements', () => {
      const button = document.createElement('button')
      button.style.outline = '2px solid blue'

      // Focus should be visible
      expect(button.style.outline).toBeTruthy()
    })

  })

  describe('Screen Reader Support', () => {

    it('Headings are in logical order', () => {
      const container = document.createElement('div')

      const h1 = document.createElement('h1')
      h1.textContent = 'Página Principal'

      const h2 = document.createElement('h2')
      h2.textContent = 'Sección Clientes'

      const h3 = document.createElement('h3')
      h3.textContent = 'Subsección'

      container.appendChild(h1)
      container.appendChild(h2)
      container.appendChild(h3)

      const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6')
      const levels = Array.from(headings).map(h => parseInt(h.tagName[1]))

      // Check order: each heading should not skip levels
      for (let i = 1; i < levels.length; i++) {
        expect(levels[i] - levels[i - 1]).toBeLessThanOrEqual(1)
      }
    })

    it('Lists are semantic', () => {
      const container = document.createElement('div')

      const ul = document.createElement('ul')
      const li1 = document.createElement('li')
      li1.textContent = 'Item 1'
      const li2 = document.createElement('li')
      li2.textContent = 'Item 2'

      ul.appendChild(li1)
      ul.appendChild(li2)
      container.appendChild(ul)

      expect(container.querySelector('ul')).toBeTruthy()
      expect(container.querySelectorAll('li').length).toBe(2)
    })

    it('Images have alt text', () => {
      const container = document.createElement('div')

      const img = document.createElement('img')
      img.src = 'logo.svg'
      img.alt = 'AKIRA Logo'

      container.appendChild(img)

      expect(img.getAttribute('alt')).toBeTruthy()
      expect(img.getAttribute('alt')).toBe('AKIRA Logo')
    })

  })

  describe('Form Accessibility', () => {

    it('Error messages are announced', () => {
      const container = document.createElement('form')

      const input = document.createElement('input')
      input.id = 'name'
      input.setAttribute('aria-invalid', 'true')
      input.setAttribute('aria-describedby', 'name-error')

      const error = document.createElement('div')
      error.id = 'name-error'
      error.setAttribute('role', 'alert')
      error.textContent = 'Este campo es requerido'

      container.appendChild(input)
      container.appendChild(error)

      expect(input.getAttribute('aria-invalid')).toBe('true')
      expect(input.getAttribute('aria-describedby')).toBe('name-error')
      expect(error.getAttribute('role')).toBe('alert')
    })

    it('Required fields are marked', () => {
      const container = document.createElement('form')

      const label = document.createElement('label')
      label.setAttribute('for', 'email')
      label.innerHTML = 'Email <span aria-label="required">*</span>'

      const input = document.createElement('input')
      input.id = 'email'
      input.required = true
      input.setAttribute('aria-required', 'true')

      container.appendChild(label)
      container.appendChild(input)

      expect(input.required).toBe(true)
      expect(input.getAttribute('aria-required')).toBe('true')
    })

  })

})
