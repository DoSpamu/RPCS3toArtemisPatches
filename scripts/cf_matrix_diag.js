'use strict';
// One-shot Cloudflare fingerprint matrix — runs ON the NUC via the diag-cf
// workflow. For each Camoufox config it loads the thread, records whether CF
// offers a Turnstile widget (page.frames() has a challenges.cloudflare.com
// frame) or hard-blocks, and dumps the fingerprint CF actually sees
// (navigator.platform, UA, WebGL renderer). Read-only, writes no state.
// Throwaway diagnostic — not part of the normal workflow.
const { Camoufox } = require('camoufox');

const URL = 'https://www.psx-place.com/threads/60-unlock-fps-patches.49905/';

const CONFIGS = [
  { headless: true,      os: 'windows' },
  { headless: true,      os: 'linux'   },
  { headless: 'virtual', os: 'linux'   },
  { headless: 'virtual', os: 'windows' },
];

async function readFingerprint(page) {
  return page.evaluate(() => {
    let webgl = 'n/a';
    try {
      const gl = document.createElement('canvas').getContext('webgl');
      const dbg = gl.getExtension('WEBGL_debug_renderer_info');
      webgl = gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL);
    } catch (e) { webgl = 'err:' + e.message; }
    return {
      platform: navigator.platform,
      ua: navigator.userAgent,
      webgl,
      hw: navigator.hardwareConcurrency,
      screen: `${screen.width}x${screen.height}`,
    };
  }).catch(e => ({ err: e.message }));
}

(async () => {
  for (const cfg of CONFIGS) {
    const label = `headless=${cfg.headless} os=${cfg.os}`;
    let browser;
    try {
      browser = await Camoufox({ headless: cfg.headless, os: cfg.os, humanize: true });
      const page = await browser.newPage();
      await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 30000 });

      // Poll up to 12s: did a CF challenge frame appear, and/or did it clear?
      let sawFrame = false, cleared = false, box = null;
      for (let i = 0; i < 12; i++) {
        const t = await page.title().catch(() => '?');
        if (!t.includes('Just a moment')) { cleared = true; break; }
        const frame = page.frames().find(f => f.url().includes('challenges.cloudflare.com'));
        if (frame) {
          sawFrame = true;
          const el = await frame.frameElement().catch(() => null);
          if (el) box = await el.boundingBox().catch(() => null);
        }
        await page.waitForTimeout(1000);
      }
      const fp = await readFingerprint(page);
      console.log(`\n### ${label}`);
      console.log(`   result: cleared=${cleared} sawWidget=${sawFrame} box=${box ? `${Math.round(box.width)}x${Math.round(box.height)}` : 'none'}`);
      console.log(`   platform=${fp.platform} hw=${fp.hw} screen=${fp.screen}`);
      console.log(`   webgl=${fp.webgl}`);
      console.log(`   ua=${fp.ua}`);
    } catch (e) {
      console.log(`\n### ${label}\n   FATAL: ${e.message}`);
    } finally {
      if (browser) await browser.close().catch(() => {});
    }
  }
  console.log('\nmatrix done');
})();
