import { readFileSync } from 'fs'
import { join } from 'path'

export default function handler(req, res) {
  // Return index.html for all non-existent routes
  const indexPath = join(process.cwd(), '../dist/index.html')
  const html = readFileSync(indexPath, 'utf-8')
  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.status(200).send(html)
}
