'use strict';
const { chromium } = require('patchright');
const fs = require('fs');
const path = require('path');

const THREAD_URL = 'https://www.psx-place.com/threads/60-unlock-fps-patches.49905/';
const STATE_FILE  = path.join(__dirname, '..', 'known_posts.json');
const USERLIST_DIR = path.join(__dirname, '..', 'USERLIST');
const RAW_DIR     = path.join(__dirname, '..', 'new_patches_raw');
const PR_BODY_FILE = path.join(__dirname, '..', 'pr_body.txt');

async function scrapePage(page, url) {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

  // Wait out Cloudflare challenge (title = "Just a moment..." for up to 15s)
  try {
    await page.waitForFunction(
      () => !document.title.includes('Just a moment'),
      { timeout: 15000 }
    );
  } catch (_) {
    if ((await page.title()).includes('Just a moment')) {
      throw new Error('CF_BLOCKED');
    }
  }

  const posts = await page.evaluate(() => {
    const articles = document.querySelectorAll('article.message[data-author]');
    return Array.from(articles).map(a => ({
      id:     a.id || a.getAttribute('data-content') || '',
      author: a.getAttribute('data-author') || 'unknown',
      text:   (a.querySelector('.bbWrapper') || a.querySelector('.message-body'))?.innerText || '',
    }));
  });

  const nextAnchor = await page.$('a.pageNav-jump--next');
  const nextHref   = nextAnchor ? await nextAnchor.getAttribute('href') : null;
  const nextUrl    = nextHref ? new URL(nextHref, url).href : null;

  return { posts, nextUrl };
}

async function scrapeThread() {
  const browser = await chromium.launch({ headless: true });
  const page    = await browser.newPage();
  const allPosts = [];
  let url = THREAD_URL;

  try {
    while (url) {
      console.log(`Scraping: ${url}`);
      const { posts, nextUrl } = await scrapePage(page, url);
      const filtered = posts.filter(p => p.id);
      allPosts.push(...filtered);
      console.log(`  Found ${filtered.length} posts on this page (total: ${allPosts.length})`);
      url = nextUrl;
      if (url) await page.waitForTimeout(1500); // polite delay between pages
    }
  } catch (err) {
    if (err.message === 'CF_BLOCKED') {
      console.error('CF_BLOCKED: Cloudflare challenge not resolved.');
      console.error('Fallback: swap patchright for camoufox (see CLAUDE.md).');
      process.exit(1);
    }
    throw err;
  } finally {
    await browser.close();
  }

  return allPosts;
}

const TITLE_ID_RE = /\b(BL[UECSJA][A-Z0-9]{6}|NP[A-Z]{2}[0-9]{5}|BC[A-Z]{2}[0-9]{5})\b/gi;

function extractTitleIds(text) {
  return [...new Set((text.match(TITLE_ID_RE) || []).map(s => s.toUpperCase()))];
}

function extractPatches(text) {
  // Priority 1: already in NCL format "0 XXXXXXXX YYYYYYYY"
  const nclMatches = [...text.matchAll(/^0\s+([0-9A-Fa-f]{8})\s+([0-9A-Fa-f]{4,8})\s*$/gm)];
  if (nclMatches.length) {
    return nclMatches.map(m => `0 ${m[1].toUpperCase()} ${m[2].toUpperCase()}`);
  }

  // Priority 2: "0xADDR 0xVALUE" hex pairs (whitespace-separated, no intervening text)
  return [...text.matchAll(/0x([0-9A-Fa-f]{1,})\s+0x([0-9A-Fa-f]{1,})/gi)].map(m => {
    const addr    = m[1].toUpperCase().padStart(8, '0').slice(-8);
    const rawVal  = m[2].toUpperCase();
    const val     = rawVal.length <= 4
      ? rawVal.padStart(4, '0')
      : rawVal.padStart(8, '0').slice(-8);
    return `0 ${addr} ${val}`;
  });
}

function buildNclEntry(cheatName, author, patches) {
  return [`${cheatName} (PSXPlace)`, '0', author, ...patches, '#'].join('\n');
}

function findNclFiles(tid) {
  if (!fs.existsSync(USERLIST_DIR)) return [];
  return fs.readdirSync(USERLIST_DIR)
    .filter(f => new RegExp(`(?<![A-Z0-9])${tid}(?![A-Z0-9])`, 'i').test(f) && f.endsWith('.ncl'))
    .map(f => path.join(USERLIST_DIR, f));
}

// Returns true if prepended, false if duplicate (already has this entry)
function prependToNcl(nclPath, entry) {
  let content = fs.readFileSync(nclPath, 'utf8')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n');

  // Duplicate check: same cheat name (PSXPlace) already in file
  const cheatName = entry.split('\n')[0]; // e.g. "60 FPS (PSXPlace)"
  const baseName  = cheatName.replace(/ \(PSXPlace\)$/i, '').toLowerCase();
  if (content.toLowerCase().includes(baseName + ' (psxplace)')) return false;

  // Guard: ensure existing content ends with # before prepending (quirk documented in CLAUDE.md)
  const trimmed = content.trimEnd();
  if (trimmed && !trimmed.endsWith('#')) {
    content = trimmed + '\n#\n';
  }

  fs.writeFileSync(nclPath, entry + '\n' + content, 'utf8');
  return true;
}

async function main() {
  let state;
  try {
    state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  } catch (err) {
    throw new Error(`Cannot read known_posts.json: ${err.message}\nRun: create known_posts.json with { "thread_url": "...", "last_checked": null, "known_post_ids": [] }`);
  }
  if (!Array.isArray(state.known_post_ids)) {
    throw new Error('known_posts.json: known_post_ids must be an array');
  }
  const isBootstrap = state.known_post_ids.length === 0;

  console.log(isBootstrap
    ? 'Bootstrap run — will record all current posts as known without creating a PR.'
    : 'Checking for new posts on thread 49905...'
  );

  const allPosts  = await scrapeThread();
  const knownIds  = new Set(state.known_post_ids);
  const newPosts  = isBootstrap ? [] : allPosts.filter(p => !knownIds.has(p.id));

  console.log(`Total posts seen: ${allPosts.length} | New: ${newPosts.length}`);

  // Update state with all seen IDs (bootstrap: all; normal: merge new ones in)
  state.known_post_ids = [...new Set([...state.known_post_ids, ...allPosts.map(p => p.id)])];
  state.last_checked   = new Date().toISOString();
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2) + '\n', 'utf8');

  if (!newPosts.length) {
    console.log(isBootstrap ? 'Bootstrap complete. Commit known_posts.json to repo.' : 'No new posts.');
    return;
  }

  // Write raw post content for reviewer reference
  fs.mkdirSync(RAW_DIR, { recursive: true });
  const date = new Date().toISOString().slice(0, 10);
  const rawLines = newPosts.map(p =>
    `=== ${p.id} | @${p.author} ===\n${p.text}\n${'─'.repeat(60)}`
  );
  fs.writeFileSync(path.join(RAW_DIR, `${date}.txt`), rawLines.join('\n\n'), 'utf8');

  // Parse + write NCL updates
  const prRows   = [];
  const modFiles = [];

  for (const post of newPosts) {
    const tids    = extractTitleIds(post.text);
    const patches = extractPatches(post.text);
    const postUrl = `${THREAD_URL}#${post.id}`;
    const author  = (post.author || 'unknown').replace(/[\r\n]/g, ' ').trim();
    const safeAuthor = author.replace(/\|/g, '\\|');

    prRows.push(`| [${post.id}](${postUrl}) | ${safeAuthor} | ${tids.join(', ') || '—'} | ${patches.length} |`);

    if (!tids.length || !patches.length) continue;

    const entry = buildNclEntry('60 FPS', author, patches);
    for (const tid of tids) {
      for (const nclPath of findNclFiles(tid)) {
        if (prependToNcl(nclPath, entry)) {
          modFiles.push(path.relative(process.cwd(), nclPath));
        } else {
          console.log(`  Skipped duplicate: ${path.basename(nclPath)}`);
        }
      }
    }
  }

  // Write PR body (existence of this file is the workflow's "create PR" signal)
  const prBody = [
    `## New posts detected on thread 49905`,
    '',
    `| Post | Author | Title IDs | Codes |`,
    `|------|--------|-----------|-------|`,
    ...prRows,
    '',
    `## Modified NCL files (${modFiles.length})`,
    modFiles.length ? modFiles.map(f => `- \`${f}\``).join('\n') : '_No parseable patches found in new posts._',
    '',
    `Raw content for review: \`new_patches_raw/${date}.txt\``,
  ].join('\n');

  fs.writeFileSync(PR_BODY_FILE, prBody, 'utf8');
  console.log(`Done. Modified ${modFiles.length} NCL file(s). PR body written to pr_body.txt.`);
}

if (require.main === module) {
  main().catch(err => { console.error(err); process.exit(1); });
}

module.exports = {
  scrapeThread, scrapePage,
  extractTitleIds, extractPatches, buildNclEntry,
  findNclFiles, prependToNcl,
};
