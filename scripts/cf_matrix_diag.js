'use strict';
// GPU/EGL verification on the ubuntu-noble (newer Mesa) image. Runs ON the NUC
// via the temporarily repointed scrape step. Confirms whether the container now
// initializes the Intel GPU (eglinfo device platform) and whether Firefox gets
// a hardware WebGL renderer that makes Cloudflare offer the Turnstile widget.
// Read-only. Throwaway diagnostic — revert workflow to check_psxplace.js first.
const { execSync } = require('child_process');
const { Camoufox } = require('camoufox');

const URL = 'https://www.psx-place.com/threads/60-unlock-fps-patches.49905/';

function sh(cmd) {
  try { return execSync(cmd, { encoding: 'utf8', timeout: 30000 }).trim() || '(empty)'; }
  catch (e) { return `FAILED: ${(e.message || '').split('\n')[0]}`; }
}

// MOZ_X11_EGL=1 makes Firefox use EGL (hardware render node) instead of Xvfb's
// software GLX. Firefox WebGL over EGL on renderD128 = real Intel renderer.
async function run(label, extra) {
  let browser;
  try {
    browser = await Camoufox({ headless: 'virtual', os: 'windows', humanize: true, ...extra });
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
  console.log('== container GPU access (Mesa version + device) ==');
  console.log('mesa:     ' + sh('glxinfo -B 2>/dev/null | grep -iE "OpenGL version|Mesa" | head -2').replace(/\n/g, ' | '));
  console.log('id:       ' + sh('id'));
  console.log('eglinfo:  ' + sh('eglinfo 2>/dev/null | grep -iE "Device platform|Device #|OpenGL renderer|EGL_MESA" | head -6').replace(/\n/g, ' | '));

  await run('virtual + plain', {});
  await run('virtual + MOZ_X11_EGL', { env: { ...process.env, MOZ_X11_EGL: '1', LIBGL_ALWAYS_SOFTWARE: '0' }, firefox_user_prefs: { 'gfx.x11-egl.force-enabled': true, 'webgl.force-enabled': true } });
  console.log('\nmatrix done');
})();
