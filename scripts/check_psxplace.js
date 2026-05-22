'use strict';
const { Camoufox } = require('camoufox');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const THREAD_URL = 'https://www.psx-place.com/threads/60-unlock-fps-patches.49905/';
const STATE_FILE  = path.join(__dirname, '..', 'known_posts.json');
const USERLIST_DIR = path.join(__dirname, '..', 'USERLIST');
const RAW_DIR     = path.join(__dirname, '..', 'new_patches_raw');
const PR_BODY_FILE = path.join(__dirname, '..', 'pr_body.txt');

async function scrapePage(page, url) {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

  // Wait out Cloudflare challenge (title = "Just a moment..." for up to 30s)
  try {
    await page.waitForFunction(
      () => !document.title.includes('Just a moment'),
      { timeout: 30000 }
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
  const browser = await Camoufox({ headless: true, os: 'windows', humanize: true });
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
    const addr   = m[1].toUpperCase().padStart(8, '0').slice(-8);
    const rawVal = m[2].toUpperCase();
    const val    = rawVal.length <= 4
      ? rawVal.padStart(4, '0')
      : rawVal.padStart(8, '0').slice(-8);
    return `0 ${addr} ${val}`;
  });
}

// Parse NCL blocks directly embedded in the first post (the catalog).
// Joey85 edits the first post to add new entries in NCL format — we need to
// detect those changes via content hashing and re-parse when the post changes.
function parseFirstPost(text) {
  const lines = text.split('\n').map(l => l.trim());
  const results = [];
  const PATCH_RE = /^0\s+([0-9A-Fa-f]{8})\s+([0-9A-Fa-f]{4,8})$/;
  const TID_RE   = /\b(BL[UECSJA][A-Z0-9]{6}|NP[A-Z]{2}[0-9]{5}|BC[A-Z]{2}[0-9]{5})\b/i;

  for (let i = 0; i < lines.length - 3; i++) {
    const name   = lines[i];
    const zero   = lines[i + 1];
    const author = lines[i + 2];

    // Candidate NCL block: name / "0" / author / at-least-one patch line
    if (
      !name || zero !== '0' || !author ||
      author === '0' || author === '#' ||
      PATCH_RE.test(name) || PATCH_RE.test(author) ||
      !PATCH_RE.test(lines[i + 3])
    ) continue;

    // Collect all contiguous patch lines
    let j = i + 3;
    const patches = [];
    while (j < lines.length && lines[j] !== '#') {
      const m = lines[j].match(PATCH_RE);
      if (m) patches.push(`0 ${m[1].toUpperCase()} ${m[2].toUpperCase()}`);
      j++;
    }
    if (!patches.length || j >= lines.length) continue; // no terminating '#'

    // Extract cheat name: the name line may be a tab-row "GameName\tTID\t...\tCheatName"
    // or a note line "Some note text\tCheatName" — always use the last tab segment.
    let cheatName = name;
    if (name.includes('\t')) {
      const parts = name.split('\t').map(s => s.trim()).filter(Boolean);
      cheatName = parts[parts.length - 1];
    }

    // TID: the name line often embeds the TID (Format 1: game info + cheat on one line).
    // Fall back to looking backwards for Format 2/3 (cheat name on its own line).
    // Stop backward search at '#' to avoid leaking into a previous entry.
    let tid = null;
    const tidInName = name.match(TID_RE);
    if (tidInName) {
      tid = tidInName[1].toUpperCase();
    } else {
      for (let k = i - 1; k >= Math.max(0, i - 20); k--) {
        if (lines[k] === '#') break;
        const m = lines[k].match(TID_RE);
        if (m) { tid = m[1].toUpperCase(); break; }
      }
    }
    if (!tid) { i = j; continue; }

    results.push({ tid, cheatName, author, patches });
    i = j; // advance past '#'; for-loop will i++ past it
  }

  return results;
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

  const cheatName = entry.split('\n')[0];
  const baseName  = cheatName.replace(/ \(PSXPlace\)$/i, '').toLowerCase();
  if (content.toLowerCase().includes(baseName + ' (psxplace)')) return false;

  const trimmed = content.trimEnd();
  if (trimmed && !trimmed.endsWith('#')) {
    content = trimmed + '\n#\n';
  }

  fs.writeFileSync(nclPath, entry + '\n' + content, 'utf8');
  return true;
}

function sha256short(text) {
  return crypto.createHash('sha256').update(text).digest('hex').slice(0, 16);
}

async function main() {
  let state;
  try {
    state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  } catch (err) {
    throw new Error(`Cannot read known_posts.json: ${err.message}`);
  }
  if (!Array.isArray(state.known_post_ids)) {
    throw new Error('known_posts.json: known_post_ids must be an array');
  }
  const isBootstrap = state.known_post_ids.length === 0;

  console.log(isBootstrap
    ? 'Bootstrap run — will record all current posts as known without creating a PR.'
    : 'Checking for new posts on thread 49905...'
  );

  const allPosts = await scrapeThread();
  const knownIds = new Set(state.known_post_ids);
  const newPosts = isBootstrap ? [] : allPosts.filter(p => !knownIds.has(p.id));

  // Track first post separately: Joey85 edits it to add new patches rather than posting new replies.
  const firstPost      = allPosts[0] || null;
  const firstPostHash  = firstPost ? sha256short(firstPost.text) : null;
  const firstPostChanged = !isBootstrap && firstPost && firstPostHash !== state.first_post_hash;

  console.log(`Total posts seen: ${allPosts.length} | New replies: ${newPosts.length} | First post updated: ${firstPostChanged}`);

  // Persist state before any early returns
  state.known_post_ids = [...new Set([...state.known_post_ids, ...allPosts.map(p => p.id)])];
  if (firstPostHash) state.first_post_hash = firstPostHash;
  state.last_checked = new Date().toISOString();
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2) + '\n', 'utf8');

  if (!newPosts.length && !firstPostChanged) {
    console.log(isBootstrap ? 'Bootstrap complete. Commit known_posts.json to repo.' : 'No new activity.');
    return;
  }

  // Write raw post content for reviewer reference
  fs.mkdirSync(RAW_DIR, { recursive: true });
  const date = new Date().toISOString().slice(0, 10);
  const rawLines = newPosts.map(p =>
    `=== ${p.id} | @${p.author} ===\n${p.text}\n${'─'.repeat(60)}`
  );
  if (firstPostChanged) {
    rawLines.push(`=== FIRST POST UPDATED (hash: ${firstPostHash}) ===\n${firstPost.text}\n${'─'.repeat(60)}`);
  }
  fs.writeFileSync(path.join(RAW_DIR, `${date}.txt`), rawLines.join('\n\n'), 'utf8');

  const prRows   = [];
  const modFiles = [];

  // Process new reply posts (unchanged logic)
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

  // Process first post if its content changed (Joey85 added new games to the catalog)
  if (firstPostChanged) {
    console.log('Parsing first post for new NCL entries...');
    const entries = parseFirstPost(firstPost.text);
    console.log(`  Found ${entries.length} NCL block(s) in first post.`);

    for (const { tid, cheatName, author, patches } of entries) {
      const entry = buildNclEntry(cheatName, author, patches);
      for (const nclPath of findNclFiles(tid)) {
        if (prependToNcl(nclPath, entry)) {
          const rel = path.relative(process.cwd(), nclPath);
          modFiles.push(rel);
          prRows.push(`| (first post edit) | ${author.replace(/\|/g, '\\|')} | ${tid} | ${patches.length} |`);
          console.log(`  Added "${cheatName}" to ${path.basename(nclPath)}`);
        }
      }
    }
  }

  // Write PR body (existence of this file is the workflow's "create PR" signal)
  const prBody = [
    `## New activity detected on thread 49905`,
    '',
    `| Post | Author | Title IDs | Codes |`,
    `|------|--------|-----------|-------|`,
    ...(prRows.length ? prRows : ['| — | — | — | — |']),
    '',
    `## Modified NCL files (${modFiles.length})`,
    modFiles.length ? modFiles.map(f => `- \`${f}\``).join('\n') : '_No parseable patches found in new activity._',
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
  extractTitleIds, extractPatches, parseFirstPost, buildNclEntry,
  findNclFiles, prependToNcl,
};
