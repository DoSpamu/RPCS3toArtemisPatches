'use strict';
// cage/Wayland GPU test. The runner wraps this in `cage -- node ...` with a
// wlroots headless backend + GPU renderer, so there is a Wayland compositor
// backed by the Intel iGPU. Camoufox launches HEADED (headless:false) with
// MOZ_ENABLE_WAYLAND=1 so Firefox renders into cage and WebGL runs on the real
// GPU (goal: "Mesa Intel(R) ..." instead of "llvmpipe"). Read-only. Throwaway.
const { Camoufox } = require('camoufox');

const URL = 'https://www.psx-place.com/threads/60-unlock-fps-patches.49905/';

async function run(label, extra) {
  let browser;
  try {
    browser = await Camoufox({
      headless: false,
      os: 'windows',
      humanize: true,
      env: { ...process.env, MOZ_ENABLE_WAYLAND: '1', LIBGL_ALWAYS_SOFTWARE: '0' },
      ...extra,
    });
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
  console.log('== Wayland session ==');
  console.log(`   WAYLAND_DISPLAY=${process.env.WAYLAND_DISPLAY || '(unset)'} XDG_RUNTIME_DIR=${process.env.XDG_RUNTIME_DIR || '(unset)'}`);
  await run('headed under cage (Wayland)', {});
  console.log('\nmatrix done');
})();
