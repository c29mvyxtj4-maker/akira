import { fileURLToPath } from 'url'
import path from 'path'
import { spawn } from 'child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Change to akira-saas directory and start server
const server = spawn('node', ['server.js'], {
  cwd: path.join(__dirname, 'akira-saas'),
  stdio: 'inherit',
  shell: true
})

server.on('error', (err) => {
  console.error('Failed to start server:', err)
  process.exit(1)
})

server.on('exit', (code) => {
  process.exit(code)
})
