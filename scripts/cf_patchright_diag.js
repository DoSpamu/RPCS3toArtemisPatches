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
    let sawWidget = false, cleared = false, box = null;
    for (let i = 0; i < 15; i++) {
      const t = await page.title().catch(() => '?');
      if (!t.includes('Just a moment')) { cleared = true; break; }
      const frame = page.frames().find(f => f.url().includes('challenges.cloudflare.com'));
      if (frame) {
        sawWidget = true;
        const el = await frame.frameElement().catch(() => null);
        if (el) box = await el.boundingBox().catch(() => null);
      }
      await page.waitForTimeout(1000);
    }
    const webgl = await page.evaluate(() => {
      try {
        const gl = document.createElement('canvas').getContext('webgl');
        const dbg = gl.getExtension('WEBGL_debug_renderer_info');
        return gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL);
      } catch (e) { return 'err:' + e.message; }
    }).catch(e => 'eval-err:' + e.message);
    console.log(`\n### ${label} (headless=${headless})`);
    console.log(`   cleared=${cleared} sawWidget=${sawWidget} box=${box ? `${Math.round(box.width)}x${Math.round(box.height)}` : 'none'}`);
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
