/**
 * Playwright scraper for PS3 FPS patch sources
 * Searches for FPS patches on PSXPlace, RPCS3 wiki, RPCS3 forums, Reddit
 */
const { chromium } = require('playwright');
const fs = require('fs');

const OUTPUT_FILE = 'scraped_fps_patches.txt';
const DELAY_MS = 2500;

const URLS = [
  // PSXPlace - main thread (9 pages)
  'https://www.psx-place.com/threads/game-patches.43706/',
  'https://www.psx-place.com/threads/game-patches.43706/page-2',
  'https://www.psx-place.com/threads/game-patches.43706/page-3',
  'https://www.psx-place.com/threads/game-patches.43706/page-4',
  'https://www.psx-place.com/threads/game-patches.43706/page-5',
  'https://www.psx-place.com/threads/game-patches.43706/page-6',
  'https://www.psx-place.com/threads/game-patches.43706/page-7',
  'https://www.psx-place.com/threads/game-patches.43706/page-8',
  'https://www.psx-place.com/threads/game-patches.43706/page-9',
  // PSXPlace - EBOOT FPS thread
  'https://www.psx-place.com/threads/modding-editing-eboot-bin-with-unlock-fps-patches.46668/',
  'https://www.psx-place.com/threads/modding-editing-eboot-bin-with-unlock-fps-patches.46668/page-2',
  'https://www.psx-place.com/threads/modding-editing-eboot-bin-with-unlock-fps-patches.46668/page-3',
  // RPCS3 wiki
  'https://wiki.rpcs3.net/index.php?title=Vblank_compatible_games_list',
  'https://wiki.rpcs3.net/index.php?title=Category:Patches_available',
  // RPCS3 forums
  'https://forums.rpcs3.net/thread-197087.html',
  // illusion0001 blog
  'https://illusion0001.com/patch/',
  'https://illusion0001.com/patches/2022/05/10/Motorstorm-Framerate-Patch/',
  'https://illusion0001.com/patches/2021/01/22/Demon-Souls-Patch/',
  // Reddit
  'https://www.reddit.com/r/PS3/comments/1arwdo8/',
  'https://old.reddit.com/r/PS3/comments/1arwdo8/',
  // Phoenix7 spreadsheet
  'https://docs.google.com/spreadsheets/d/1dvcFTU5xKt9ASbjlhaSD1zN1ONQPCFnmJNKMU5hGGNM/htmlview',
];

const FPS_KEYWORDS = /\b(fps|60\s*fps|unlock\s*fps|60\s*hz|vblank|frame.?rate|framerate|frame.?limit|performance\s*patch|bef32|be32)\b/i;

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function scrapePage(page, url) {
  console.log(`\n=== Fetching: ${url}`);
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await sleep(2000);

    // Try to dismiss cookie banners / login walls
    const dismissSelectors = [
      '[data-xf-click="overlay-close"]',
      '.js-overlayClose',
      'button:has-text("Accept")',
      'button:has-text("OK")',
      'button:has-text("Close")',
      '.cookie-accept',
      '#onetrust-accept-btn-handler',
    ];
    for (const sel of dismissSelectors) {
      try {
        const btn = page.locator(sel).first();
        if (await btn.isVisible({ timeout: 1000 })) {
          await btn.click();
          await sleep(500);
        }
      } catch {}
    }

    const title = await page.title();
    const status = page.url();

    // Extract text content - focus on post bodies
    let content = '';

    // XenForo posts (PSXPlace)
    const postSelectors = [
      '.bbWrapper',        // XenForo 2 post body
      '.message-body',
      '.messageText',
      '.post-message',
      '.post_body',
      '.userContent',
      'article',
      '.entry-content',
      '.md',              // Reddit markdown
      '.usertext-body',   // Old Reddit
      'main',
      '#content',
      'body',
    ];

    for (const sel of postSelectors) {
      try {
        const els = page.locator(sel);
        const count = await els.count();
        if (count > 0) {
          for (let i = 0; i < Math.min(count, 50); i++) {
            const text = await els.nth(i).innerText({ timeout: 3000 });
            if (text && text.length > 50) {
              content += text + '\n\n---POST---\n\n';
            }
          }
          if (content.length > 500) break;
        }
      } catch {}
    }

    // Fallback: full page text
    if (content.length < 200) {
      try {
        content = await page.locator('body').innerText({ timeout: 5000 });
      } catch {}
    }

    console.log(`  Title: ${title}`);
    console.log(`  URL: ${status}`);
    console.log(`  Content length: ${content.length} chars`);

    // Filter: only keep lines mentioning FPS/addresses
    const lines = content.split('\n');
    const relevantLines = [];
    let keepContext = 0;
    for (const line of lines) {
      if (FPS_KEYWORDS.test(line) || /0x[0-9a-fA-F]{6,}/i.test(line) || /BL[UECSJA][A-Z0-9]{5}/i.test(line)) {
        keepContext = 5;
      }
      if (keepContext > 0) {
        relevantLines.push(line);
        keepContext--;
      }
    }

    return {
      url,
      title,
      fullContent: content,
      relevantContent: relevantLines.join('\n'),
      success: content.length > 200,
    };
  } catch (err) {
    console.log(`  ERROR: ${err.message}`);
    return { url, title: '', fullContent: '', relevantContent: '', success: false, error: err.message };
  }
}

async function main() {
  const browser = await chromium.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-blink-features=AutomationControlled',
      '--disable-dev-shm-usage',
    ],
  });

  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 900 },
    locale: 'en-US',
    extraHTTPHeaders: {
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
    },
  });

  // Hide automation signals
  await context.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
    window.chrome = { runtime: {} };
  });

  const page = await context.newPage();
  const results = [];

  for (const url of URLS) {
    const result = await scrapePage(page, url);
    results.push(result);
    await sleep(DELAY_MS);
  }

  await browser.close();

  // Write output
  let output = `PS3 FPS Patch Scrape Results\n`;
  output += `Generated: ${new Date().toISOString()}\n`;
  output += `${'='.repeat(80)}\n\n`;

  for (const r of results) {
    output += `\n${'='.repeat(80)}\n`;
    output += `SOURCE: ${r.url}\n`;
    output += `TITLE:  ${r.title || '(no title)'}\n`;
    output += `STATUS: ${r.success ? 'OK' : 'FAILED'} | Content: ${r.fullContent.length} chars\n`;
    if (r.error) output += `ERROR:  ${r.error}\n`;
    output += `${'─'.repeat(80)}\n`;

    if (r.relevantContent && r.relevantContent.trim().length > 0) {
      output += `RELEVANT CONTENT:\n${r.relevantContent}\n`;
    } else if (r.success) {
      // Show first 3000 chars of full content
      output += `FULL CONTENT (first 3000 chars):\n${r.fullContent.substring(0, 3000)}\n`;
    } else {
      output += `(no content retrieved)\n`;
    }
  }

  fs.writeFileSync(OUTPUT_FILE, output, 'utf8');
  console.log(`\n\nDone! Output saved to ${OUTPUT_FILE}`);
  console.log(`Successful pages: ${results.filter(r => r.success).length}/${results.length}`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
