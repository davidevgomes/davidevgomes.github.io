// Captura a tela do emulador Android (adb) e salva reduzida em .mobile-check/.
// Uso: node scripts/emu-shot.mjs <nome> [mais nomes após rolar…]
//   node scripts/emu-shot.mjs hero            → só captura
//   node scripts/emu-shot.mjs tour 12         → captura, rola uma tela, repete 12 vezes e monta uma folha
import { execFileSync } from 'node:child_process'
import sharp from 'sharp'
import { mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const adb = join(process.env.LOCALAPPDATA, 'Android', 'Sdk', 'platform-tools', 'adb.exe')
const out = join(dirname(fileURLToPath(import.meta.url)), '..', '.mobile-check')
mkdirSync(out, { recursive: true })
const shot = () => execFileSync(adb, ['exec-out', 'screencap', '-p'], { maxBuffer: 64 * 1024 * 1024 })
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const [name = 'emu', count] = process.argv.slice(2)

if (!count) {
  await sharp(shot()).resize({ width: 400 }).jpeg({ quality: 78 }).toFile(join(out, name + '.jpg'))
} else {
  const W = 270
  const tiles = []
  for (let i = 0; i < +count; i++) {
    tiles.push(await sharp(shot()).resize({ width: W }).jpeg({ quality: 74 }).toBuffer())
    execFileSync(adb, ['shell', 'input', 'swipe', '540', '1900', '540', '700', '450'])
    await sleep(2200)
  }
  const per = 7
  for (let i = 0; i < tiles.length; i += per) {
    const g = tiles.slice(i, i + per)
    const h = (await sharp(g[0]).metadata()).height
    await sharp({ create: { width: g.length * (W + 6), height: h, channels: 3, background: '#666' } })
      .composite(g.map((input, k) => ({ input, left: k * (W + 6), top: 0 })))
      .jpeg({ quality: 74 })
      .toFile(join(out, `${name}-${String(i / per + 1).padStart(2, '0')}.jpg`))
  }
}
console.log('ok')
