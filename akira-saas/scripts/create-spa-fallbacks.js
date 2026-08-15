#!/usr/bin/env node
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distPath = path.join(__dirname, '../dist')
const indexHtml = path.join(distPath, 'index.html')

// Read index.html
const content = fs.readFileSync(indexHtml, 'utf-8')

// Create directories for common SPA routes
const routes = [
  'documents',
  'clients',
  'projects',
  'finance',
  'invoices',
  'quotes',
  'calendar',
  'knowledge',
  'brain',
  'settings',
  'time-tracking',
]

routes.forEach(route => {
  const dir = path.join(distPath, route)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  fs.writeFileSync(path.join(dir, 'index.html'), content)
})

console.log('✅ Created SPA fallback directories')
