'use strict';
// GPU-passthrough verification — runs ON the NUC via the temporarily repointed
// scrape step. Confirms the container now sees a real GPU and that Cloudflare
// consequently offers the Turnstile widget. Read-only, writes no state.
// Throwaway diagnostic — revert the workflow to check_psxplace.js before merge.
const { execSync } = require('child_process');
const { Camoufox } = require('camoufox');

const URL = 'https://www.psx-place.com/threads/60-unlock-fps-patches.49905/';

function hostGl() {
  try {
    // glxinfo needs a display; run it under the same Xvfb Camoufox will use.
    const out = execSync('xvfb-run -a glxinfo 2>/dev/null | grep -iE "OpenGL renderer|OpenGL vendor"', { encoding: 'utf8' });
    return out.trim() || '(no renderer line)';
  } catch (e) {
    return `glxinfo failed: ${e.message.split('\n')[0]}`;
  }
}

async function run(cfg) {
  const label = `headless=${cfg.headless} os=${cfg.os}`;
  let browser;
  try {
    browser = await Camoufox(cfg);
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
  console.log('host GL (via xvfb-run glxinfo):');
  console.log('  ' + hostGl().replace(/\n/g, '\n  '));
  await run({ headless: 'virtual', os: 'windows', humanize: true });
  await run({ headless: 'virtual', os: 'linux',   humanize: true });
  console.log('\nmatrix done');
})();
