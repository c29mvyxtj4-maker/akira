import express from 'express'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const app = express()
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PORT = process.env.PORT || 3000

// Serve static files from dist/
app.use(express.static(path.join(__dirname, 'dist'), {
  maxAge: '1h',
  etag: false
}))

// SPA routing: serve index.html for all non-file routes
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'dist/index.html')

  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath)
  } else {
    res.status(500).send('Server error: index.html not found')
  }
})

app.listen(PORT, () => {
  console.log(`✅ AKIRA server running on http://localhost:${PORT}`)
  console.log(`📍 SPA routing enabled - all routes point to index.html`)
})
