/**
 * Regenerate the AKIRA icon set from the red-sun master SVG.
 * Run: node scripts/gen-icons.mjs
 */
import sharp from 'sharp'
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const master = readFileSync(join(root, 'public/icons/red-sun-master.svg'))

const png = (size) => sharp(master, { density: 384 }).resize(size, size).png()

// PWA + favicon PNGs
const pngTargets = [
  ['public/icons/favicon-16x16.png', 16],
  ['public/icons/favicon-32x32.png', 32],
  ['public/icons/apple-touch-icon.png', 180],
  ['public/icons/pwa-192x192.png', 192],
  ['public/icons/pwa-512x512.png', 512],
]

for (const [rel, size] of pngTargets) {
  await png(size).toFile(join(root, rel))
  console.log('wrote', rel, `${size}x${size}`)
}

// Build a multi-image ICO (16/32/48) with embedded PNGs.
const icoSizes = [16, 32, 48]
const images = await Promise.all(icoSizes.map((s) => png(s).toBuffer()))

const header = Buffer.alloc(6)
header.writeUInt16LE(0, 0)      // reserved
header.writeUInt16LE(1, 2)      // type: icon
header.writeUInt16LE(icoSizes.length, 4)

const dirSize = 16 * icoSizes.length
let offset = 6 + dirSize
const entries = []
for (let i = 0; i < icoSizes.length; i++) {
  const s = icoSizes[i]
  const buf = images[i]
  const e = Buffer.alloc(16)
  e.writeUInt8(s === 256 ? 0 : s, 0)   // width
  e.writeUInt8(s === 256 ? 0 : s, 1)   // height
  e.writeUInt8(0, 2)                    // palette
  e.writeUInt8(0, 3)                    // reserved
  e.writeUInt16LE(1, 4)                 // color planes
  e.writeUInt16LE(32, 6)                // bpp
  e.writeUInt32LE(buf.length, 8)        // size
  e.writeUInt32LE(offset, 12)           // offset
  offset += buf.length
  entries.push(e)
}

const ico = Buffer.concat([header, ...entries, ...images])
writeFileSync(join(root, 'public/favicon.ico'), ico)
console.log('wrote public/favicon.ico', `(${icoSizes.join('/')})`, ico.length, 'bytes')

// Keep the SVG icons in sync with the master (scaled copies).
const svg512 = readFileSync(join(root, 'public/icons/red-sun-master.svg'), 'utf8')
  .replace('width="1024" height="1024"', 'width="512" height="512"')
writeFileSync(join(root, 'public/icons/icon.svg'), svg512)
writeFileSync(join(root, 'public/favicon.svg'), svg512)
console.log('wrote public/icons/icon.svg + public/favicon.svg')
