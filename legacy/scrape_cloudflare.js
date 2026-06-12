/**
 * Playwright scraper for Cloudflare-protected RPCS3 sites
 * Waits for Cloudflare challenge to resolve automatically
 */
const { chromium } = require('playwright');
const fs = require('fs');

const OUTPUT_FILE = 'scraped_rpcs3.txt';

const CF_URLS = [
  // RPCS3 wiki
  'https://wiki.rpcs3.net/index.php?title=Vblank_compatible_games_list',
  'https://wiki.rpcs3.net/index.php?title=Category:Patches_available',
  'https://wiki.rpcs3.net/index.php?title=Help:Game_Patches/Main',
  // RPCS3 forums
  'https://forums.rpcs3.net/thread-197087.html',
  'https://forums.rpcs3.net/thread-197087-2.html',
  'https://forums.rpcs3.net/thread-197087-3.html',
  // illusion0001
  'https://illusion0001.com/',
  'https://illusion0001.com/patch-notes/',
  'https://illusion0001.com/archives/',
];

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function waitForCloudflare(page, timeout = 30000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const title = await page.title();
    const url = page.url();
    if (!title.includes('Just a moment') && !title.includes('Checking your browser') && !title.includes('Please wait')) {
      return true;
    }
    console.log(`    Waiting for Cloudflare... (${Math.round((Date.now()-start)/1000)}s)`);
    await sleep(3000);
  }
  return false;
}

async function scrapePage(page, url) {
  console.log(`\n=== Fetching: ${url}`);
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

    // Wait for Cloudflare challenge
    await sleep(3000);
    const passed = await waitForCloudflare(page, 35000);

    if (!passed) {
      console.log(`  CLOUDFLARE: challenge not resolved after 35s`);
    }

    // Additional wait for content
    await sleep(2000);
    try {
      await page.waitForLoadState('networkidle', { timeout: 10000 });
    } catch {}

    const title = await page.title();
    console.log(`  Title: ${title}`);

    // Try to get content
    let content = '';

    // Wiki content (MediaWiki)
    const wikiSelectors = [
      '#mw-content-text',
      '.mw-parser-output',
      '#content',
      '.mw-body-content',
    ];
    for (const sel of wikiSelectors) {
      try {
        const el = page.locator(sel).first();
        if (await el.isVisible({ timeout: 2000 })) {
          content = await el.innerText({ timeout: 5000 });
          if (content.length > 200) break;
        }
      } catch {}
    }

    // Forum content (MyBB)
    const forumSelectors = [
      '.post_body',
      '.post-content',
      '.scaleimages',
      '.post',
      '.thread-content',
      '.mybb-content',
    ];
    if (content.length < 200) {
      for (const sel of forumSelectors) {
        try {
          const els = page.locator(sel);
          const count = await els.count();
          if (count > 0) {
            for (let i = 0; i < Math.min(count, 30); i++) {
              const text = await els.nth(i).innerText({ timeout: 3000 });
              if (text && text.length > 50) content += text + '\n---\n';
            }
            if (content.length > 500) break;
          }
        } catch {}
      }
    }

    // Blog/generic
    if (content.length < 200) {
      const genericSelectors = ['main', 'article', '.content', '#content', 'body'];
      for (const sel of genericSelectors) {
        try {
          content = await page.locator(sel).first().innerText({ timeout: 5000 });
          if (content.length > 200) break;
        } catch {}
      }
    }

    console.log(`  Content length: ${content.length} chars`);

    return {
      url,
      title,
      content: content.substring(0, 50000), // limit to 50k
      success: content.length > 200 && passed,
    };
  } catch (err) {
    console.log(`  ERROR: ${err.message}`);
    return { url, title: '', content: '', success: false, error: err.message };
  }
}

async function main() {
  // Use non-headless for Cloudflare challenge (needs real browser signals)
  const browser = await chromium.launch({
    headless: false,  // visible browser helps with Cloudflare
    args: [
      '--no-sandbox',
      '--disable-blink-features=AutomationControlled',
      '--start-maximized',
    ],
  });

  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 900 },
    locale: 'en-US',
  });

  await context.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
    window.chrome = { runtime: {} };
    Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
  });

  const page = await context.newPage();
  const results = [];

  // First visit a non-Cloudflare page to warm up the browser
  await page.goto('https://github.com', { waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => {});
  await sleep(2000);

  for (const url of CF_URLS) {
    const result = await scrapePage(page, url);
    results.push(result);
    await sleep(3000);
  }

  await browser.close();

  let output = `RPCS3 Cloudflare-Protected Sites Scrape\n`;
  output += `Generated: ${new Date().toISOString()}\n`;
  output += `${'='.repeat(80)}\n\n`;

  for (const r of results) {
    output += `\n${'='.repeat(80)}\n`;
    output += `SOURCE: ${r.url}\n`;
    output += `TITLE:  ${r.title || '(no title)'}\n`;
    output += `STATUS: ${r.success ? 'OK' : 'FAILED'} | Chars: ${r.content.length}\n`;
    if (r.error) output += `ERROR: ${r.error}\n`;
    output += `${'─'.repeat(80)}\n`;
    if (r.content) output += r.content.substring(0, 20000) + '\n';
  }

  fs.writeFileSync(OUTPUT_FILE, output, 'utf8');
  console.log(`\nDone! Output saved to ${OUTPUT_FILE}`);
  console.log(`Successful: ${results.filter(r => r.success).length}/${results.length}`);
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
