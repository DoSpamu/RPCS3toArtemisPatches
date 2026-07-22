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
    let sawWidget = false, cleared = false, box = null, clickTried = false;
    for (let i = 0; i < 35; i++) {
      const t = await page.title().catch(() => '?');
      if (!t.includes('Just a moment')) { cleared = true; break; }
      const frame = page.frames().find(f => f.url().includes('challenges.cloudflare.com'));
      if (frame) {
        sawWidget = true;
        const el = await frame.frameElement().catch(() => null);
        if (el) box = await el.boundingBox().catch(() => null);
        if (!clickTried && i >= 3) {
          clickTried = true;
          // Proper element click inside the Turnstile iframe (Chromium exposes
          // it as a real frame). Fall back to a coordinate click on the widget.
          try {
            const cb = page.frameLocator('iframe[src*="challenges.cloudflare.com"]').locator('input[type="checkbox"], body').first();
            await cb.click({ timeout: 8000 });
            console.log('   clicked Turnstile via frameLocator');
          } catch (e) {
            console.log(`   frameLocator click failed (${e.message.split('\n')[0]}); coordinate click`);
            if (box) { const cx = box.x + 30, cy = box.y + box.height / 2; await page.mouse.click(cx, cy).catch(() => {}); }
          }
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
  // headless:false (headed under Xvfb) — stealth Chromium passes Turnstile
  // passively far more often headed than headless. ANGLE-EGL keeps WebGL on
  // the GPU regardless of the X display, so hardware WebGL survives.
  await run('patchright chromium', true);
  console.log('\nmatrix done');
})();
