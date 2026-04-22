/**
 * Scraper using FlareSolverr proxy to bypass Cloudflare
 * FlareSolverr at http://192.168.1.100:8191
 */
const http = require('http');
const https = require('https');
const fs = require('fs');

const FLARE_URL = 'http://192.168.1.100:8191/v1';

const URLS = [
  // RPCS3 wiki
  'https://wiki.rpcs3.net/index.php?title=Vblank_compatible_games_list',
  'https://wiki.rpcs3.net/index.php?title=Category:Patches_available',
  'https://wiki.rpcs3.net/index.php?title=Help:Game_Patches/Main',
  // RPCS3 forums - 60FPS master list (multiple pages)
  'https://forums.rpcs3.net/thread-197087.html',
  'https://forums.rpcs3.net/thread-197087-2.html',
  'https://forums.rpcs3.net/thread-197087-3.html',
  'https://forums.rpcs3.net/thread-197087-4.html',
  'https://forums.rpcs3.net/thread-197087-5.html',
  // PSXPlace (retry with FlareSolverr)
  'https://www.psx-place.com/threads/game-patches.43706/',
  'https://www.psx-place.com/threads/game-patches.43706/page-2',
  'https://www.psx-place.com/threads/game-patches.43706/page-3',
  'https://www.psx-place.com/threads/game-patches.43706/page-4',
  'https://www.psx-place.com/threads/game-patches.43706/page-5',
  'https://www.psx-place.com/threads/game-patches.43706/page-6',
  'https://www.psx-place.com/threads/game-patches.43706/page-7',
  'https://www.psx-place.com/threads/game-patches.43706/page-8',
  'https://www.psx-place.com/threads/game-patches.43706/page-9',
  'https://www.psx-place.com/threads/modding-editing-eboot-bin-with-unlock-fps-patches.46668/',
  'https://www.psx-place.com/threads/modding-editing-eboot-bin-with-unlock-fps-patches.46668/page-2',
];

function postJson(url, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const parsed = new URL(url);
    const options = {
      hostname: parsed.hostname,
      port: parsed.port || 80,
      path: parsed.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
      },
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(body)); }
        catch (e) { resolve({ rawBody: body }); }
      });
    });

    req.on('error', reject);
    req.setTimeout(120000, () => { req.destroy(); reject(new Error('Timeout')); });
    req.write(data);
    req.end();
  });
}

// Strip HTML tags, keep text content
function stripHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#[0-9]+;/g, '')
    .replace(/ {2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// Filter only FPS-relevant content
const FPS_RE = /\b(fps|60fps|unlock.?fps|60.?hz|vblank|framerate|frame.?rate|be32|bef32|be16|0x[0-9a-f]{6,}|BL[UECSJA][A-Z0-9]{5}|NP[A-Z]{2}[0-9]{5}|BC[A-Z]{2}[0-9]{5})\b/i;

function filterRelevant(text) {
  const lines = text.split('\n');
  const out = [];
  let ctx = 0;
  for (const line of lines) {
    if (FPS_RE.test(line)) ctx = 6;
    if (ctx > 0) { out.push(line); ctx--; }
  }
  return out.join('\n');
}

async function fetchWithFlare(url) {
  console.log(`\nFetching via FlareSolverr: ${url}`);
  try {
    const result = await postJson(FLARE_URL, {
      cmd: 'request.get',
      url: url,
      maxTimeout: 60000,
    });

    if (result.status !== 'ok') {
      console.log(`  FlareSolverr error: ${JSON.stringify(result)}`);
      return { url, success: false, content: '', title: '', error: result.message || 'FlareSolverr error' };
    }

    const solution = result.solution;
    const rawHtml = solution.response || '';
    const text = stripHtml(rawHtml);
    const relevant = filterRelevant(text);

    console.log(`  Status: ${solution.status} | HTML: ${rawHtml.length} chars | Text: ${text.length} | Relevant: ${relevant.length}`);

    return {
      url,
      success: true,
      title: solution.url || url,
      content: text.substring(0, 60000),
      relevant: relevant.substring(0, 20000),
    };
  } catch (err) {
    console.log(`  Error: ${err.message}`);
    return { url, success: false, content: '', title: '', error: err.message };
  }
}

async function main() {
  // Test FlareSolverr connection first
  console.log('Testing FlareSolverr connection...');
  try {
    const test = await postJson(FLARE_URL, { cmd: 'sessions.list' });
    console.log('FlareSolverr OK:', JSON.stringify(test));
  } catch (e) {
    console.error('Cannot reach FlareSolverr:', e.message);
    process.exit(1);
  }

  const results = [];
  for (const url of URLS) {
    const result = await fetchWithFlare(url);
    results.push(result);
  }

  let output = `FlareSolverr Scrape Results\nGenerated: ${new Date().toISOString()}\n${'='.repeat(80)}\n\n`;

  for (const r of results) {
    output += `\n${'='.repeat(80)}\n`;
    output += `SOURCE: ${r.url}\n`;
    output += `STATUS: ${r.success ? 'OK' : 'FAILED'}\n`;
    if (r.error) output += `ERROR: ${r.error}\n`;
    output += `${'─'.repeat(80)}\n`;
    if (r.relevant && r.relevant.trim().length > 50) {
      output += `RELEVANT:\n${r.relevant}\n`;
    } else if (r.success) {
      output += `CONTENT (first 5000):\n${r.content.substring(0, 5000)}\n`;
    }
  }

  fs.writeFileSync('scraped_rpcs3.txt', output, 'utf8');
  console.log('\nDone! Results saved to scraped_rpcs3.txt');
  console.log(`OK: ${results.filter(r => r.success).length}/${results.length}`);
}

main().catch(err => { console.error(err); process.exit(1); });
