'use strict';
// GPU/EGL verification — runs ON the NUC via the temporarily repointed scrape
// step. glxinfo-under-Xvfb reports llvmpipe even with a real GPU (Xvfb is a
// software X server); hardware WebGL must come from EGL on the DRM render node.
// This dumps perms + the EGL renderer, then forces Firefox onto EGL and checks
// whether Cloudflare offers the Turnstile widget. Read-only. Throwaway.
const { execSync } = require('child_process');
const { Camoufox } = require('camoufox');

const URL = 'https://www.psx-place.com/threads/60-unlock-fps-patches.49905/';

function sh(cmd) {
  try { return execSync(cmd, { encoding: 'utf8' }).trim() || '(empty)'; }
  catch (e) { return `FAILED: ${(e.message || '').split('\n')[0]}`; }
}

// Force Firefox to use EGL on the hardware render node instead of Xvfb's
// software GLX. MOZ_X11_EGL=1 switches the X11 path to EGL.
const EGL_ENV = { ...process.env, MOZ_X11_EGL: '1', LIBGL_ALWAYS_SOFTWARE: '0' };
const EGL_PREFS = {
  'gfx.x11-egl.force-enabled': true,
  'webgl.force-enabled': true,
  'webgl.disabled': false,
  'gfx.webrender.all': true,
};

async function run(cfg) {
  const label = `headless=${cfg.headless} os=${cfg.os}`;
  let browser;
  try {
    browser = await Camoufox({ ...cfg, humanize: true, env: EGL_ENV, firefox_user_prefs: EGL_PREFS });
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
  console.log('== container GPU access ==');
  console.log('id:            ' + sh('id'));
  console.log('/dev/dri:      ' + sh('ls -ln /dev/dri').replace(/\n/g, ' | '));
  console.log('eglinfo (HW):  ' + sh('eglinfo -B 2>/dev/null | grep -iE "Device platform|OpenGL renderer|Vendor:" | head -4').replace(/\n/g, ' | '));
  console.log('glxinfo(surfaceless): ' + sh('EGL_PLATFORM=surfaceless glxinfo -B 2>/dev/null | grep -iE "renderer" | head -2').replace(/\n/g, ' | '));

  await run({ headless: true,      os: 'windows' });
  await run({ headless: 'virtual', os: 'windows' });
  console.log('\nmatrix done');
})();
