'use strict';
// patchright (undetected Chromium) test against the psx-place Cloudflare
// challenge. Chromium's ANGLE gives hardware WebGL in headless containers far
// more readily than Firefox — with /dev/dri + the GL flags below it should
// report a real "ANGLE (Intel, Mesa Intel(R) ...)" renderer that Cloudflare
// trusts. Checks the WebGL renderer + whether the challenge clears / shows a
// widget. Read-only. Throwaway diagnostic.
const { chromium } = require('patchright');

const URL = 'https://www.psx-place.com/threads/60-unlock-fps-patches.49905/';

// Force Chromium onto hardware GL via ANGLE-over-EGL on the Intel render node.
const GPU_ARGS = [
  '--use-gl=angle',
  '--use-angle=gl-egl',
  '--enable-gpu',
  '--ignore-gpu-blocklist',
  '--enable-unsafe-webgpu',
  '--disable-gpu-sandbox',
  '--no-sandbox',
];

async function run(label, headless) {
  let browser;
  try {
    browser = await chromium.launch({ headless, args: GPU_ARGS });
    const page = await browser.newPage();
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    let sawWidget = false, cleared = false, box = null, clicked = false;
    for (let i = 0; i < 25; i++) {
      const t = await page.title().catch(() => '?');
      if (!t.includes('Just a moment')) { cleared = true; break; }
      const frame = page.frames().find(f => f.url().includes('challenges.cloudflare.com'));
      if (frame) {
        sawWidget = true;
        const el = await frame.frameElement().catch(() => null);
        if (el) box = await el.boundingBox().catch(() => null);
        // Click the checkbox ~30px from the widget's left edge, once, after it
        // has had a moment to render. Chromium exposes the challenge as a real
        // iframe, so a coordinate click on the frame box hits the checkbox.
        if (box && !clicked && i >= 2) {
          clicked = true;
          const cx = box.x + 30, cy = box.y + box.height / 2;
          console.log(`   clicking Turnstile at (${Math.round(cx)}, ${Math.round(cy)})…`);
          await page.mouse.move(cx - 50, cy + 15, { steps: 10 }).catch(() => {});
          await page.mouse.click(cx, cy).catch(() => {});
        }
      }
      await page.waitForTimeout(1000);
    }
    const postCount = cleared ? await page.evaluate(() => document.querySelectorAll('article.message[data-author]').length).catch(() => -1) : 0;
    const webgl = await page.evaluate(() => {
      try {
        const gl = document.createElement('canvas').getContext('webgl');
        const dbg = gl.getExtension('WEBGL_debug_renderer_info');
        return gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL);
      } catch (e) { return 'err:' + e.message; }
    }).catch(e => 'eval-err:' + e.message);
    console.log(`\n### ${label} (headless=${headless})`);
    console.log(`   cleared=${cleared} sawWidget=${sawWidget} posts=${postCount} box=${box ? `${Math.round(box.width)}x${Math.round(box.height)}` : 'none'}`);
    console.log(`   webgl-in-browser=${webgl}`);
  } catch (e) {
    console.log(`\n### ${label} (headless=${headless})\n   FATAL: ${e.message}`);
  } finally {
    if (browser) { try { await browser.close(); } catch (_) {} }
  }
}

(async () => {
  await run('patchright chromium', true);
  console.log('\nmatrix done');
})();
