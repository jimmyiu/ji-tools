import sharp from 'sharp'
import { mkdir } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const svgPath = join(root, 'public', 'favicon.svg')
const outDir = join(root, 'public', 'icons')

await mkdir(outDir, { recursive: true })

for (const size of [192, 512]) {
  await sharp(svgPath)
    .resize(size, size)
    .png()
    .toFile(join(outDir, `icon-${size}.png`))
}

console.log('Icons generated successfully')
