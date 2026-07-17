import { createServer } from 'http'
import { readFileSync, existsSync, statSync } from 'fs'
import { join, extname } from 'path'
import { fileURLToPath } from 'url'

var __dirname = fileURLToPath(new URL('.', import.meta.url))
var DIST = join(__dirname, 'dist')

var MIME = {
  '.html':        'text/html',
  '.js':          'application/javascript',
  '.css':         'text/css',
  '.png':         'image/png',
  '.svg':         'image/svg+xml',
  '.ico':         'image/x-icon',
  '.json':        'application/json',
  '.webmanifest': 'application/manifest+json',
  '.woff2':       'font/woff2',
}

createServer(function(req, res) {
  var url = req.url.split('?')[0]
  var filePath = join(DIST, url)

  try {
    if (existsSync(filePath) && statSync(filePath).isFile()) {
      var ext = extname(filePath)
      var mime = MIME[ext] || 'application/octet-stream'
      res.writeHead(200, { 'Content-Type': mime })
      res.end(readFileSync(filePath))
    } else {
      res.writeHead(200, { 'Content-Type': 'text/html' })
      res.end(readFileSync(join(DIST, 'index.html')))
    }
  } catch (e) {
    res.writeHead(200, { 'Content-Type': 'text/html' })
    res.end(readFileSync(join(DIST, 'index.html')))
  }
}).listen(3000, function() {
  console.log('AKIRA server en http://localhost:3000')
})