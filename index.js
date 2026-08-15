import express from 'express'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const app = express()
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PORT = process.env.PORT || 3000

// Serve static files from akira-saas/dist
const distPath = path.join(__dirname, 'akira-saas/dist')

app.use(express.static(distPath, {
  maxAge: '1h',
  etag: false
}))

// SPA routing: serve index.html for all non-file routes
app.get('*', (req, res) => {
  const indexPath = path.join(distPath, 'index.html')

  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath)
  } else {
    res.status(500).send('Error: index.html not found. Build may have failed.')
  }
})

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err)
  res.status(500).send('Internal Server Error')
})

app.listen(PORT, () => {
  console.log(`✅ AKIRA SPA Server running on port ${PORT}`)
  console.log(`📍 Serving from: ${distPath}`)
  console.log(`🔄 SPA routing enabled - all routes point to index.html`)
})
