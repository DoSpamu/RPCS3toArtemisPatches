'use strict';
// GPU/EGL verification on noble. EGL now enumerates a device and the runner is
// in the render group; the open question is whether Device #0 is the Intel GPU
// and whether Firefox uses it. glxinfo/Xvfb gives llvmpipe; Firefox --headless
// uses surfaceless EGL which can hit the hardware GBM device directly. Dumps the
// full eglinfo device renderer, then tests headless:true (surfaceless). Read-only.
const { execSync } = require('child_process');
const { Camoufox } = require('camoufox');

const URL = 'https://www.psx-place.com/threads/60-unlock-fps-patches.49905/';

function sh(cmd) {
  try { return execSync(cmd, { encoding: 'utf8', timeout: 40000 }).trim() || '(empty)'; }
  catch (e) { return `FAILED: ${(e.message || '').split('\n')[0]}`; }
}

async function run(label, extra) {
  let browser;
  try {
    browser = await Camoufox({ os: 'windows', humanize: true, ...extra });
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
    console.log(`\n### ${label}`);
    console.log(`   cleared=${cleared} sawWidget=${sawWidget} box=${box ? `${Math.round(box.width)}x${Math.round(box.height)}` : 'none'}`);
    console.log(`   webgl-in-browser=${webgl}`);
  } catch (e) {
    console.log(`\n### ${label}\n   FATAL: ${e.message}`);
  } finally {
    if (browser) { try { await browser.close(); } catch (_) {} }
  }
}

(async () => {
  console.log('== eglinfo -B (device renderer) ==');
  console.log(sh('eglinfo -B 2>&1 | head -40'));

  const HW = { LIBGL_ALWAYS_SOFTWARE: '0' };
  await run('headless:true (surfaceless EGL)', { headless: true, env: { ...process.env, ...HW } });
  await run('headless:true + iris override', { headless: true, env: { ...process.env, ...HW, MESA_LOADER_DRIVER_OVERRIDE: 'iris' } });
  console.log('\nmatrix done');
})();
