'use strict';
// One-shot Cloudflare WebGL-spoof matrix — runs ON the NUC via the temporarily
// repointed scrape step. The NUC has no GPU, so Camoufox relays a broken WebGL
// fingerprint (null in true-headless, "llvmpipe" under Xvfb) and CF hard-blocks
// without offering a Turnstile widget. camoufox-js exposes webgl_config:
// [vendor, renderer] to force the strings. This tries plausible pairs and
// reports, per config, the WebGL string CF sees and whether a widget appears.
// Read-only, writes no state. Throwaway diagnostic.
const { Camoufox } = require('camoufox');

const URL = 'https://www.psx-place.com/threads/60-unlock-fps-patches.49905/';

// [vendor, renderer] pairs. NVIDIA pair mirrors the known-good dev machine.
const NVIDIA = ['Google Inc. (NVIDIA)', 'ANGLE (NVIDIA, NVIDIA GeForce GTX 980 Direct3D11 vs_5_0 ps_5_0), or similar'];
const INTEL  = ['Google Inc. (Intel)',  'ANGLE (Intel, Intel(R) UHD Graphics 630 Direct3D11 vs_5_0 ps_5_0), or similar'];

const CONFIGS = [
  { headless: 'virtual', os: 'windows', webgl_config: NVIDIA },
  { headless: 'virtual', os: 'windows', webgl_config: INTEL  },
  { headless: true,      os: 'windows', webgl_config: NVIDIA },
];

async function readFingerprint(page) {
  return page.evaluate(() => {
    let webgl = 'n/a';
    try {
      const gl = document.createElement('canvas').getContext('webgl');
      const dbg = gl.getExtension('WEBGL_debug_renderer_info');
      webgl = gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL);
    } catch (e) { webgl = 'err:' + e.message; }
    return { platform: navigator.platform, webgl };
  }).catch(e => ({ err: e.message }));
}

(async () => {
  for (const cfg of CONFIGS) {
    const label = `headless=${cfg.headless} os=${cfg.os} webgl=${cfg.webgl_config[1].slice(7, 20)}`;
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
      const fp = await readFingerprint(page);
      console.log(`\n### ${label}`);
      console.log(`   result: cleared=${cleared} sawWidget=${sawWidget} box=${box ? `${Math.round(box.width)}x${Math.round(box.height)}` : 'none'}`);
      console.log(`   webgl-seen=${fp.webgl}`);
    } catch (e) {
      console.log(`\n### ${label}\n   FATAL: ${e.message}`);
    } finally {
      if (browser) await browser.close().catch(() => {});
    }
  }
  console.log('\nmatrix done');
})();
