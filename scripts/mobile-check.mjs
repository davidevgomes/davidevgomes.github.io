// Tira capturas do site em tela de celular e monta folhas de contato para revisão.
// Uso: node scripts/mobile-check.mjs [largura] [altura]   (precisa do `npm run dev` rodando)
import puppeteer from 'puppeteer-core'
import sharp from 'sharp'
import { existsSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const out = join(root, '.mobile-check')
mkdirSync(out, { recursive: true })
const W = +process.argv[2] || 390
const H = +process.argv[3] || 844
const url = process.env.URL || 'http://127.0.0.1:5183/?debug'
const executablePath = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(existsSync)

const browser = await puppeteer.launch({ executablePath, headless: 'new', args: ['--hide-scrollbars', '--enable-unsafe-swiftshader', '--use-angle=swiftshader'] })
const page = await browser.newPage()
await page.setUserAgent('Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Mobile Safari/537.36')
await page.setViewport({ width: W, height: H, deviceScaleFactor: 1, isMobile: true, hasTouch: true })
const errors = []
page.on('pageerror', (e) => errors.push(e.message))
await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 })
await new Promise((r) => setTimeout(r, 3500))

const info = await page.evaluate(() => ({
  total: document.documentElement.scrollHeight,
  dock: (() => { const d = document.querySelector('.dock'); const r = d.getBoundingClientRect(); const c = getComputedStyle(d); return [d.className, Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height), c.transform, c.display, getComputedStyle(d.querySelector('.dock__mobile')).display] })(),
  overflowX: document.documentElement.scrollWidth - innerWidth,
  wide: [...document.querySelectorAll('body *')]
    .filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && (r.right > innerWidth + 2 || r.left < -2) && !e.closest('.scene, .grain, .gridlines, .dp__territory, .dp__trio, .cursor, .menu') })
    .slice(0, 25)
    .map((e) => (e.className?.toString().slice(0, 40) || e.tagName) + ' ' + Math.round(e.getBoundingClientRect().left) + '→' + Math.round(e.getBoundingClientRect().right)),
}))
console.log(JSON.stringify(info, null, 1))

const shots = []
const step = Math.round(H * 0.9)
for (let y = 0; y < info.total - H * 0.3; y += step) {
  await page.evaluate((y) => window.__go(y), y)
  await new Promise((r) => setTimeout(r, 1100))
  shots.push(await page.screenshot({ type: 'jpeg', quality: 70 }))
}
await browser.close()

const per = 7
for (let i = 0; i < shots.length; i += per) {
  const group = shots.slice(i, i + per)
  const sheet = await sharp({ create: { width: group.length * (W + 10), height: H, channels: 3, background: '#555' } })
    .composite(group.map((input, k) => ({ input, left: k * (W + 10), top: 0 })))
    .png()
    .toBuffer()
  await sharp(sheet)
    .resize({ width: Math.min(1900, group.length * 270) })
    .jpeg({ quality: 72 })
    .toFile(join(out, `sheet-${String(i / per + 1).padStart(2, '0')}.jpg`))
}
console.log('telas:', shots.length, 'folhas:', Math.ceil(shots.length / per), 'erros:', errors.slice(0, 5))
