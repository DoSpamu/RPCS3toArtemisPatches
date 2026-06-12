'use strict';
const { Camoufox } = require('camoufox');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const THREAD_URL    = 'https://www.psx-place.com/threads/60-unlock-fps-patches.49905/';
const STATE_FILE    = path.join(__dirname, '..', 'known_posts.json');
const PSXPLACE_DIR  = path.join(__dirname, '..', 'PSXPlace Confirmed');
const RAW_DIR       = path.join(__dirname, '..', 'new_patches_raw');
const PR_BODY_FILE  = path.join(__dirname, '..', 'pr_body.txt');

async function scrapePage(page, url) {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

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
      if (url) await page.waitForTimeout(1500);
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

const TITLE_ID_RE = /\b(BL[UECSJA][A-Z0-9]{6}|NP[A-Z]{2}[0-9]{5}|BC[A-Z]{2}[0-9]{5}|MRTC[0-9]{5})\b/gi;

function extractTitleIds(text) {
  return [...new Set((text.match(TITLE_ID_RE) || []).map(s => s.toUpperCase()))];
}

function extractPatches(text) {
  const nclMatches = [...text.matchAll(/^0\s+([0-9A-Fa-f]{8})\s+([0-9A-Fa-f]{4,8})\s*$/gm)];
  if (nclMatches.length) {
    return nclMatches.map(m => `0 ${m[1].toUpperCase()} ${m[2].toUpperCase()}`);
  }
  return [...text.matchAll(/0x([0-9A-Fa-f]{1,})\s+0x([0-9A-Fa-f]{1,})/gi)].map(m => {
    const addr   = m[1].toUpperCase().padStart(8, '0').slice(-8);
    const rawVal = m[2].toUpperCase();
    const val    = rawVal.length <= 4 ? rawVal.padStart(4, '0') : rawVal.padStart(8, '0').slice(-8);
    return `0 ${addr} ${val}`;
  });
}

// Parse NCL blocks embedded in the first post (the catalog that Joey85 edits when adding games).
// Returns array of { tid, cheatName, author, patches, gameName, version } — gameName and version
// are used to create a new file in PSXPlace Confirmed/ when the game isn't there yet.
function parseFirstPost(text) {
  const lines = text.split('\n').map(l => l.trim());
  const results = [];
  const PATCH_RE = /^0\s+([0-9A-Fa-f]{8})\s+([0-9A-Fa-f]{4,8})$/;
  const TID_RE   = /\b(BL[UECSJA][A-Z0-9]{6}|NP[A-Z]{2}[0-9]{5}|BC[A-Z]{2}[0-9]{5}|MRTC[0-9]{5})\b/i;

  function parseTidLine(line) {
    const parts = line.split('\t').map(s => s.trim());
    const tidMatch = line.match(TID_RE);
    return {
      gameName: parts[0] || null,
      version:  parts[2] || null,
      tid: tidMatch ? tidMatch[1].toUpperCase() : null,
    };
  }

  for (let i = 0; i < lines.length - 3; i++) {
    const name   = lines[i];
    const zero   = lines[i + 1];
    const author = lines[i + 2];

    if (
      !name || zero !== '0' || !author ||
      author === '0' || author === '#' ||
      PATCH_RE.test(name) || PATCH_RE.test(author) ||
      !PATCH_RE.test(lines[i + 3])
    ) continue;

    let j = i + 3;
    const patches = [];
    while (j < lines.length && lines[j] !== '#') {
      const m = lines[j].match(PATCH_RE);
      if (m) patches.push(`0 ${m[1].toUpperCase()} ${m[2].toUpperCase()}`);
      j++;
    }
    if (!patches.length || j >= lines.length) continue;

    // cheat name = last tab segment (name line may be a full tab row)
    let cheatName = name;
    if (name.includes('\t')) {
      const parts = name.split('\t').map(s => s.trim()).filter(Boolean);
      cheatName = parts[parts.length - 1];
    }

    // TID + game info: prefer from the name line itself (Format 1);
    // fall back to backward search (Format 2/3 where cheat name is on its own line).
    let tid = null, gameName = null, version = null;
    const tidInName = name.match(TID_RE);
    if (tidInName) {
      const parsed = parseTidLine(name);
      tid = parsed.tid; gameName = parsed.gameName; version = parsed.version;
    } else {
      for (let k = i - 1; k >= Math.max(0, i - 20); k--) {
        if (lines[k] === '#') break;
        const m = lines[k].match(TID_RE);
        if (m) {
          const parsed = parseTidLine(lines[k]);
          tid = parsed.tid; gameName = parsed.gameName; version = parsed.version;
          break;
        }
      }
    }
    if (!tid) { i = j; continue; }

    results.push({ tid, cheatName, author, patches, gameName, version });
    i = j;
  }

  return results;
}

function buildNclEntry(cheatName, author, patches) {
  return [`${cheatName} (PSXPlace)`, '0', author, ...patches, '#'].join('\n');
}

// Normalize "1.01" → "01.01" to match PSXPlace Confirmed file naming convention.
function normVersion(ver) {
  if (!ver) return '';
  const parts = ver.split('.');
  return parts.length === 2
    ? parts[0].padStart(2, '0') + '.' + parts[1].padStart(2, '0')
    : ver;
}

// Build a filename for a new PSXPlace Confirmed entry.
function buildPsxplaceFilename(gameName, tid, version) {
  const safeName = (gameName || 'Unknown').replace(/[<>:"/\\|?*]/g, '').trim();
  const ver = normVersion(version);
  return ver ? `${safeName} ${tid} ${ver}.ncl` : `${safeName} ${tid}.ncl`;
}

// Search PSXPlace Confirmed/ for files matching the given Title ID.
// Falls back to game-name prefix match when no file has the TID in its filename
// (e.g. "Destroy All Humans! Path Of The Furon.ncl" has no TID in the name).
function findPsxplaceFiles(tid, gameName) {
  if (!fs.existsSync(PSXPLACE_DIR)) return [];
  const files = fs.readdirSync(PSXPLACE_DIR);
  const TID_RE = new RegExp(`(?<![A-Z0-9])${tid}(?![A-Z0-9])`, 'i');

  const byTid = files
    .filter(f => TID_RE.test(f) && f.endsWith('.ncl'))
    .map(f => path.join(PSXPLACE_DIR, f));
  if (byTid.length) return byTid;

  if (!gameName) return [];
  const safeName = gameName.replace(/[<>:"/\\|?*]/g, '').trim().toLowerCase();
  const byName = files
    .filter(f => f.endsWith('.ncl') && f.replace(/\.ncl$/i, '').toLowerCase().startsWith(safeName))
    .map(f => path.join(PSXPLACE_DIR, f));
  if (byName.length) console.log(`  [findPsxplaceFiles] name-match for ${tid}: ${byName.map(f => path.basename(f)).join(', ')}`);
  return byName;
}

// Prepend entry to an .ncl file. Creates the file if it doesn't exist.
// Returns true if written, false if duplicate already present.
function prependToNcl(nclPath, entry) {
  let content = '';
  if (fs.existsSync(nclPath)) {
    content = fs.readFileSync(nclPath, 'utf8')
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n');
  }

  const cheatName = entry.split('\n')[0];
  const baseName  = cheatName.replace(/ \(PSXPlace\)$/i, '').toLowerCase();
  if (content.toLowerCase().includes(baseName + ' (psxplace)')) return false;

  const trimmed = content.trimEnd();
  if (trimmed && !trimmed.endsWith('#')) {
    content = trimmed + '\n#\n';
  }

  const newContent = trimmed ? entry + '\n' + content : entry + '\n';
  fs.writeFileSync(nclPath, newContent, 'utf8');
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

  const firstPost     = allPosts[0] || null;
  const firstPostHash = firstPost ? sha256short(firstPost.text) : null;
  const firstPostChanged = !isBootstrap && firstPost && state.first_post_hash !== undefined && firstPostHash !== state.first_post_hash;

  console.log(`Total posts seen: ${allPosts.length} | New replies: ${newPosts.length} | First post updated: ${firstPostChanged}`);

  state.known_post_ids = [...new Set([...state.known_post_ids, ...allPosts.map(p => p.id)])];
  if (firstPostHash) state.first_post_hash = firstPostHash;
  state.last_checked = new Date().toISOString();
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2) + '\n', 'utf8');

  if (!newPosts.length && !firstPostChanged) {
    console.log(isBootstrap ? 'Bootstrap complete. Commit known_posts.json to repo.' : 'No new activity.');
    return;
  }

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
  const modFiles = new Set();

  // Process new reply posts — search PSXPlace Confirmed for matching files.
  // If the game isn't there yet, we report it in the PR for manual action
  // (we don't know the canonical game name/version from a freeform reply post).
  for (const post of newPosts) {
    const tids    = extractTitleIds(post.text);
    const patches = extractPatches(post.text);
    const postUrl = `${THREAD_URL}#${post.id}`;
    const author  = (post.author || 'unknown').replace(/[\r\n]/g, ' ').trim();
    const safeAuthor = author.replace(/\|/g, '\\|');

    prRows.push(`| [${post.id}](${postUrl}) | ${safeAuthor} | ${tids.join(', ') || '—'} | ${patches.length} |`);

    if (!tids.length || !patches.length) continue;

    // Guard against quoted-catalog false positives: a single reply with >20 NCL lines
    // almost certainly contains a quoted full catalog, not a single-game patch.
    if (patches.length > 20) {
      console.log(`  Skipping ${post.id}: ${patches.length} patch lines looks like a quoted catalog (max 20 for auto-add).`);
      continue;
    }

    const entry = buildNclEntry('Unlock FPS', author, patches);
    for (const tid of tids) {
      for (const nclPath of findPsxplaceFiles(tid)) {
        if (prependToNcl(nclPath, entry)) {
          modFiles.add(path.relative(process.cwd(), nclPath));
        } else {
          console.log(`  Skipped duplicate: ${path.basename(nclPath)}`);
        }
      }
    }
  }

  // Process first post edits — Joey85 edits the catalog to add new games.
  // We have structured data (game name, TID, version) so we can create new files.
  if (firstPostChanged) {
    console.log('Parsing first post for new/updated NCL entries...');
    const entries = parseFirstPost(firstPost.text);
    console.log(`  Found ${entries.length} NCL block(s) in first post.`);

    for (const { tid, cheatName, author, patches, gameName, version } of entries) {
      const entry = buildNclEntry(cheatName, author, patches);
      let nclFiles = findPsxplaceFiles(tid, gameName);

      if (nclFiles.length === 0 && gameName) {
        // New game not yet in PSXPlace Confirmed — create the file
        const filename = buildPsxplaceFilename(gameName, tid, version);
        const newPath  = path.join(PSXPLACE_DIR, filename);
        nclFiles = [newPath];
        console.log(`  Creating new file: ${filename}`);
      }

      for (const nclPath of nclFiles) {
        if (prependToNcl(nclPath, entry)) {
          const rel = path.relative(process.cwd(), nclPath);
          modFiles.add(rel);
          prRows.push(`| (first post edit) | ${author.replace(/\|/g, '\\|')} | ${tid} | ${patches.length} |`);
          console.log(`  Added "${cheatName}" to ${path.basename(nclPath)}`);
        }
      }
    }
  }

  const modList = [...modFiles];
  const prBody = [
    `## New activity detected on PSXPlace thread 49905`,
    '',
    `| Post | Author | Title IDs | Codes |`,
    `|------|--------|-----------|-------|`,
    ...(prRows.length ? prRows : ['| — | — | — | — |']),
    '',
    `## Modified/created files in \`PSXPlace Confirmed/\` (${modList.length})`,
    modList.length ? modList.map(f => `- \`${f}\``).join('\n') : '_No parseable patches found in new activity._',
    '',
    `Raw content: \`new_patches_raw/${date}.txt\``,
  ].join('\n');

  fs.writeFileSync(PR_BODY_FILE, prBody, 'utf8');
  console.log(`Done. Modified/created ${modList.length} file(s) in PSXPlace Confirmed/. PR body written.`);
}

if (require.main === module) {
  main().catch(err => { console.error(err); process.exit(1); });
}

module.exports = {
  scrapeThread, scrapePage,
  extractTitleIds, extractPatches, parseFirstPost, buildNclEntry,
  findPsxplaceFiles, prependToNcl, normVersion, buildPsxplaceFilename,
};
