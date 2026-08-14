import fs from 'fs'
import path from 'path'

export default function handler(req, res) {
  const distPath = path.join(process.cwd(), 'akira-saas/dist')
  const indexPath = path.join(distPath, 'index.html')

  // Try to serve the requested file first
  const filePath = path.join(distPath, req.url.replace(/^\//, ''))

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath)
    const mimeTypes = {
      '.html': 'text/html',
      '.js': 'application/javascript',
      '.css': 'text/css',
      '.json': 'application/json',
      '.svg': 'image/svg+xml',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.gif': 'image/gif',
      '.woff': 'font/woff',
      '.woff2': 'font/woff2',
    }

    res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream')
    res.send(fs.readFileSync(filePath))
    return
  }

  // Otherwise serve index.html for SPA routing
  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.send(fs.readFileSync(indexPath, 'utf-8'))
}
