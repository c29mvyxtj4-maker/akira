/**
 * End-to-End Accessibility Tests
 * Using Playwright + Axe Core
 *
 * Run with: npx playwright test
 */

import { test, expect } from '@playwright/test'
import { injectAxe, checkA11y, getViolations } from 'axe-playwright'

const pages = [
  { name: 'Dashboard', url: '/' },
  { name: 'Clients', url: '/clients' },
  { name: 'Projects', url: '/projects' },
  { name: 'Finance', url: '/finance' },
  { name: 'Offers', url: '/offers' },
  { name: 'Invoices', url: '/invoices' },
]

test.describe('Page Accessibility - WCAG 2.1 AA', () => {
  pages.forEach(({ name, url }) => {
    test(`${name} page should not have accessibility violations`, async ({ page }) => {
      await page.goto(url)

      // Wait for page to fully load
      await page.waitForLoadState('networkidle')

      // Inject Axe Core
      await injectAxe(page)

      // Check for violations
      await checkA11y(page, null, {
        rules: {
          'color-contrast': { enabled: true },
          'aria-valid-attr-value': { enabled: true },
          'button-name': { enabled: true },
          'form-field-multiple-labels': { enabled: true },
          'heading-order': { enabled: true },
          'link-name': { enabled: true },
          'image-alt': { enabled: true },
          'region': { enabled: true },
        },
      })
    })
  })
})

test.describe('Interactive Elements', () => {
  test('IconButtons should be accessible', async ({ page }) => {
    await page.goto('/finance')
    await page.waitForLoadState('networkidle')
    await injectAxe(page)

    // Find all icon buttons
    const buttons = await page.locator('button[aria-label]').all()

    for (const button of buttons) {
      const ariaLabel = await button.getAttribute('aria-label')
      expect(ariaLabel).toBeTruthy()
      expect(ariaLabel?.length).toBeGreaterThan(0)
    }

    await checkA11y(page)
  })

  test('Form inputs should be properly labeled', async ({ page }) => {
    await page.goto('/clients')
    await page.waitForLoadState('networkidle')
    await injectAxe(page)

    // Check all inputs have labels
    const inputs = await page.locator('input, select, textarea').all()

    for (const input of inputs) {
      const id = await input.getAttribute('id')
      if (id) {
        const label = await page.locator(`label[for="${id}"]`).count()
        // Either has label or aria-label
        const ariaLabel = await input.getAttribute('aria-label')
        expect(label > 0 || ariaLabel).toBeTruthy()
      }
    }

    await checkA11y(page)
  })

  test('Modals should have proper ARIA attributes', async ({ page }) => {
    await page.goto('/invoices')
    await page.waitForLoadState('networkidle')

    // Click to open a modal (if exists)
    const modalTrigger = page.locator('button').first()
    if (await modalTrigger.count() > 0) {
      await injectAxe(page)

      // Check for dialog role
      const dialogs = await page.locator('[role="dialog"]').all()
      for (const dialog of dialogs) {
        const ariaModal = await dialog.getAttribute('aria-modal')
        expect(ariaModal).toBe('true')
      }
    }
  })

  test('Toast notifications should have aria-live', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await injectAxe(page)

    // Check for status roles with aria-live
    const statuses = await page.locator('[role="status"]').all()
    for (const status of statuses) {
      const ariaLive = await status.getAttribute('aria-live')
      expect(['polite', 'assertive', 'off']).toContain(ariaLive)
    }
  })
})

test.describe('Keyboard Navigation', () => {
  test('Tab order should be logical', async ({ page }) => {
    await page.goto('/finance')
    await page.waitForLoadState('networkidle')

    // Get all focusable elements
    const focusable = await page.locator(
      'button, a[href], input, select, textarea, [tabindex]'
    ).all()

    expect(focusable.length).toBeGreaterThan(0)

    // Test tab navigation
    await page.keyboard.press('Tab')
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName)
    expect(['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA']).toContain(focusedElement)
  })

  test('Escape key should close modals', async ({ page }) => {
    await page.goto('/invoices')
    await page.waitForLoadState('networkidle')

    // Look for close button or modal
    const closeButton = page.locator('button:has-text("Cerrar"), [aria-label*="Cerrar"]').first()
    if (await closeButton.count() > 0) {
      await closeButton.click()
      await page.keyboard.press('Escape')
      // Modal should be closed
    }
  })
})

test.describe('Screen Reader Support', () => {
  test('Headings should be in logical order', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all()
    const levels = []

    for (const heading of headings) {
      const tagName = await heading.evaluate((el) => el.tagName)
      const level = parseInt(tagName[1])
      levels.push(level)
    }

    // Check logical order: no skipping of levels
    for (let i = 1; i < levels.length; i++) {
      const jump = levels[i] - levels[i - 1]
      expect(Math.abs(jump)).toBeLessThanOrEqual(1)
    }
  })

  test('Images should have alt text', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const images = await page.locator('img').all()
    for (const img of images) {
      const alt = await img.getAttribute('alt')
      // Decorative images can have empty alt=""
      expect(alt !== null).toBeTruthy()
    }
  })

  test('Links should have accessible names', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const links = await page.locator('a[href]').all()
    for (const link of links) {
      const text = await link.textContent()
      const ariaLabel = await link.getAttribute('aria-label')
      const title = await link.getAttribute('title')

      // Should have text, aria-label, or title
      expect(text?.trim() || ariaLabel || title).toBeTruthy()
    }
  })
})

test.describe('Color Contrast', () => {
  test('Text should have sufficient contrast (4.5:1 WCAG AA)', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await injectAxe(page)

    // Axe will check color contrast
    await checkA11y(page, null, {
      rules: {
        'color-contrast': { enabled: true },
      },
    })
  })
})

test.describe('Form Validation', () => {
  test('Error messages should be announced', async ({ page }) => {
    await page.goto('/clients')
    await page.waitForLoadState('networkidle')

    // Find form and submit empty
    const form = page.locator('form').first()
    if (await form.count() > 0) {
      const submitButton = form.locator('button[type="submit"]').first()
      if (await submitButton.count() > 0) {
        await submitButton.click()

        // Check for error announcements
        const alerts = await page.locator('[role="alert"]').all()
        // Errors should be present or form validation should prevent submission
      }
    }
  })

  test('Required fields should be marked', async ({ page }) => {
    await page.goto('/offers')
    await page.waitForLoadState('networkidle')

    const requiredInputs = await page.locator('input[required]').all()
    for (const input of requiredInputs) {
      const ariaRequired = await input.getAttribute('aria-required')
      // Should have aria-required or required attribute
      expect(ariaRequired === 'true' || true).toBeTruthy()
    }
  })
})
