// Captura telas públicas dos projetos em alta resolução (usa o Edge/Chrome já instalado).
// Uso: npm run capture   → salva PNGs em assets-src/capturas/ ; depois rode: npm run assets
import puppeteer from 'puppeteer-core'
import { existsSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const out = join(root, 'assets-src', 'capturas')
mkdirSync(out, { recursive: true })

const browsers = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
]
const executablePath = browsers.find(existsSync)

const shots = [
  { name: 'idr-site', url: 'https://idr.marica.rj.gov.br/inicio/', wait: 3500 },
  { name: 'idr-projetos', url: 'https://idr.marica.rj.gov.br/projetos/', wait: 3500 },
  { name: 'idr-mapa-mulher', url: 'https://idr.marica.rj.gov.br/mapa-mulher/', wait: 6000 },
  { name: 'idr-mapa-alertas', url: 'https://idr.marica.rj.gov.br/mapa-alertas/', wait: 7000 },
  { name: 'idr-socioeconomico', url: 'https://idr.marica.rj.gov.br/socioeconomico/', wait: 6000 },
  { name: 'idr-ipcb', url: 'https://idr.marica.rj.gov.br/ipcb/', wait: 6000 },
  { name: 'dashpoint-site', url: 'https://dashpoint.net.br', wait: 4000 },
  { name: 'idr-mapa-mulher-m', url: 'https://idr.marica.rj.gov.br/mapa-mulher/', wait: 6000, mobile: true },
  { name: 'idr-mapa-alertas-m', url: 'https://idr.marica.rj.gov.br/mapa-alertas/', wait: 7000, mobile: true },
]

const only = process.argv.slice(2)
const browser = await puppeteer.launch({ executablePath, headless: 'new', args: ['--hide-scrollbars'] })
for (const s of shots) {
  if (only.length && !only.includes(s.name)) continue
  const page = await browser.newPage()
  await page.setViewport(
    s.mobile ? { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true } : { width: 1440, height: 900, deviceScaleFactor: 1.5 },
  )
  try {
    await page.goto(s.url, { waitUntil: 'networkidle2', timeout: 45000 })
  } catch (e) {
    console.log('aviso', s.name, e.message)
  }
  await new Promise((r) => setTimeout(r, s.wait))
  await page.screenshot({ path: join(out, s.name + '.png') })
  console.log('ok', s.name, await page.title())
  if (process.env.EQUIPE) console.log(await page.evaluate(() => { const t = document.body.innerText.replace(/\s+/g, ' '); const i = t.search(/equipe/i); return 'len=' + t.length + ' | inicio: ' + t.slice(0, 500) + ' | equipe: ' + (i < 0 ? 'nao achei' : t.slice(Math.max(0, i - 100), i + 600)) }))
  await page.close()
}
await browser.close()
