// Renders frames of globe.html to PNGs. Serve this folder first:
//   python3 -m http.server 8767 --directory tools/hero-film
// then: node render.js <land|port> <width> <height> <outdir> <all | comma list of frames> [start longitude]
//   node tools/hero-film/render.js land 1920 1080 frames-land all
//   node tools/hero-film/render.js port 720 1280 frames-port all
const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
  const [mode, w, h, out, which, lng0] = process.argv.slice(2);
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({ args: ['--disable-gpu-vsync'] });
  const page = await browser.newPage({ viewport: { width: 400, height: 300 } });
  page.on('pageerror', e => console.error('PAGEERROR', e));
  await page.goto(`http://localhost:8767/globe.html?mode=${mode}&w=${w}&h=${h}` + (lng0 ? `&lng0=${lng0}` : ''));
  await page.evaluate(() => window.ready);
  const info = await page.evaluate(() => window.info());
  console.log(JSON.stringify(info));
  const list = which === 'all' ? [...Array(info.FRAMES).keys()] : which.split(',').map(Number);
  const t0 = Date.now();
  for (const i of list) {
    const b64 = await page.evaluate(i => { window.render(i); return window.png().split(',')[1]; }, i);
    fs.writeFileSync(`${out}/f${String(i).padStart(4, '0')}.png`, Buffer.from(b64, 'base64'));
    if (i % 48 === 0) console.log('frame', i, ((Date.now() - t0) / 1000).toFixed(1) + 's');
  }
  console.log('done', list.length, 'frames in', ((Date.now() - t0) / 1000).toFixed(1), 's');
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
