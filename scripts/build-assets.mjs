// Otimiza as imagens de assets-src/ para public/img/ (WebP). Uso: npm run assets
import sharp from 'sharp'
import { mkdirSync, existsSync, readdirSync } from 'node:fs'
import { join, dirname, parse } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const src = join(root, 'assets-src')
const out = join(root, 'public', 'img')
mkdirSync(out, { recursive: true })

const webp = async (input, name, { width, quality = 80, crop } = {}) => {
  if (!existsSync(input)) return console.log('faltando:', input)
  let img = sharp(input).rotate()
  if (crop) img = img.extract(crop)
  if (width) img = img.resize({ width, withoutEnlargement: true })
  const info = await img.webp({ quality }).toFile(join(out, name + '.webp'))
  console.log(name.padEnd(26), `${info.width}x${info.height}`, Math.round(info.size / 1024) + 'kb')
}

// Retrato (corta a faixa inferior com a marca-d'água do gerador)
await webp(join(src, 'originais', 'davi.jpg'), 'retrato', { crop: { left: 0, top: 0, width: 776, height: 930 }, quality: 84 })
await webp(join(src, 'originais', 'bastidores-1.jpg'), 'bastidores-1', { width: 1600, quality: 76 })
await webp(join(src, 'originais', 'bastidores-2.webp'), 'bastidores-2', { width: 900, quality: 78 })

// Kiosk em campo — desfoca a faixa com o nome do entrevistador (dado pessoal de terceiro)
{
  const input = join(src, 'originais', 'kiosk.webp')
  if (existsSync(input)) {
    const region = { left: 236, top: 377, width: 240, height: 22 }
    const blurred = await sharp(input).extract(region).blur(9).toBuffer()
    const info = await sharp(input).composite([{ input: blurred, left: region.left, top: region.top }]).webp({ quality: 82 }).toFile(join(out, 'idr-kiosk.webp'))
    console.log('idr-kiosk'.padEnd(26), `${info.width}x${info.height}`,Math.round(info.size / 1024) + 'kb')
  }
}

// Painel do IDR GPS — o mapa mostra nomes e posições dos entrevistadores; essa área é desfocada
{
  const input = join(src, 'internas', 'idr-gps.jpg')
  if (existsSync(input)) {
    const region = { left: 10, top: 136, width: 744, height: 330 }
    const blurred = await sharp(input).extract(region).blur(3.4).toBuffer()
    const info = await sharp(input)
      .composite([{ input: blurred, left: region.left, top: region.top }])
      .extract({ left: 0, top: 0, width: 760, height: 475 })
      .webp({ quality: 84 })
      .toFile(join(out, 'idr-gps.webp'))
    console.log('idr-gps'.padEnd(26), info.width + 'x' + info.height, Math.round(info.size / 1024) + 'kb')
  }
}

// Dashpoint — telas reais do app e marca
for (const f of readdirSync(join(src, 'dashpoint'))) {
  const { name, ext } = parse(f)
  if (ext === '.jpg') await webp(join(src, 'dashpoint', f), 'dp-' + name, { width: 600, quality: 80 })
  if (ext === '.png') await webp(join(src, 'dashpoint', f), 'dp-' + name, { width: 640, quality: 90 })
}

// Capturas de tela dos sites (npm run capture)
const cap = join(src, 'capturas')
if (existsSync(cap))
  for (const f of readdirSync(cap)) {
    const { name } = parse(f)
    await webp(join(cap, f), name, { width: name.endsWith('-m') ? 780 : 1800, quality: 78 })
  }
