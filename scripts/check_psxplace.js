'use strict';
const { Camoufox } = require('camoufox');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const THREAD_URL    = 'https://www.psx-place.com/threads/60-unlock-fps-patches.49905/';
const STATE_FILE    = path.join(__dirname, '..', 'known_posts.json');
const PSXPLACE_DIR  = path.join(__dirname, '..', 'PSXPlace Confirmed');
const USERLIST_DIR  = path.join(__dirname, '..', 'USERLIST');
const RAW_DIR       = path.join(__dirname, '..', 'new_patches_raw');
const PR_BODY_FILE  = path.join(__dirname, '..', 'pr_body.txt');

// Cloudflare serves a "Just a moment..." challenge that Camoufox usually clears,
// but sometimes doesn't within one attempt. Each retry spins up a FRESH browser
// (new fingerprint) — retrying the same page/session would just hit the same
// block. backoffMs has attempts-1 entries (wait after every attempt but the last).
const CF_RETRY = { attempts: 3, challengeTimeoutMs: 45000, backoffMs: [10000, 20000] };

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

// Waits up to challengeTimeoutMs for Cloudflare's "Just a moment" interstitial to
// go away on its own. Returns true if the page is clear, false if still challenged.
async function challengeCleared(page) {
  try {
    await page.waitForFunction(
      () => !document.title.includes('Just a moment'),
      { timeout: CF_RETRY.challengeTimeoutMs }
    );
    return true;
  } catch (_) {
    return !(await page.title()).includes('Just a moment');
  }
}

// Best-effort click of the interactive Cloudflare Turnstile checkbox. The widget
// is a cross-origin iframe (challenges.cloudflare.com) injected into a CLOSED
// shadow root, so page.content()/CSS selectors can't see it — but Playwright
// still tracks it in page.frames(), and frameElement().boundingBox() gives the
// true 300x65 widget geometry (diagnosed 2026-07-19). The checkbox sits ~22px
// from the widget's left edge at half height. Do NOT climb the light-DOM
// ancestors of the hidden cf-turnstile-response input — they resolve to the
// 896px-wide content column, not the widget, and the click drifts off target.
// Logs each step so a single CI dispatch is diagnostic. Never throws — the
// caller re-checks clearance.
async function solveTurnstile(page) {
  try {
    let box = null;
    const deadline = Date.now() + 10000;
    while (Date.now() < deadline && !box) {
      const frame = page.frames().find(f => f.url().includes('challenges.cloudflare.com'));
      if (frame) {
        const el = await frame.frameElement().catch(() => null);
        box = el ? await el.boundingBox().catch(() => null) : null;
      }
      if (!box) await page.waitForTimeout(500);
    }
    if (!box) { console.error('Turnstile: no challenge frame appeared within 10s.'); return; }
    const cx = box.x + 22, cy = box.y + box.height / 2;
    console.error(`Turnstile: widget frame at ${Math.round(box.x)},${Math.round(box.y)} ${Math.round(box.width)}x${Math.round(box.height)} — clicking (${Math.round(cx)}, ${Math.round(cy)})…`);
    await page.mouse.move(cx - 80, cy + 30, { steps: 15 });
    await page.mouse.move(cx, cy, { steps: 10 });
    await page.mouse.click(cx, cy);
    console.error('Turnstile: checkbox click dispatched.');
  } catch (e) {
    console.error(`Turnstile: click failed (${e.message}).`);
  }
}

async function scrapePage(page, url) {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

  if (!(await challengeCleared(page))) {
    console.error('Challenge did not auto-clear — attempting Turnstile solve…');
    await solveTurnstile(page);
    if (!(await challengeCleared(page))) throw new Error('CF_BLOCKED');
    console.error('Turnstile: challenge cleared after click.');
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

// Walks every page of the thread using a caller-owned browser. The caller
// creates and closes the browser (see scrapeThreadWithRetry) so the retry
// wrapper can hand each attempt a fresh instance.
async function scrapeThread(browser) {
  const page     = await browser.newPage();
  const allPosts = [];
  let url = THREAD_URL;

  while (url) {
    console.log(`Scraping: ${url}`);
    const { posts, nextUrl } = await scrapePage(page, url);
    const filtered = posts.filter(p => p.id);
    allPosts.push(...filtered);
    console.log(`  Found ${filtered.length} posts on this page (total: ${allPosts.length})`);
    url = nextUrl;
    if (url) await page.waitForTimeout(1500);
  }

  // A thread page with zero parsed posts means the forum layout changed (or we
  // were served a stub page) — treat it as a failure, not "no activity".
  if (!allPosts.length) throw new Error('SCRAPE_EMPTY');

  return allPosts;
}

// Retries `fn` ONLY on CF_BLOCKED, backing off between attempts. Any other error
// (including SCRAPE_EMPTY, which signals a layout change, not a transient block)
// propagates immediately so its exit code keeps its diagnostic meaning.
// `wait` is injectable so tests can run without real delays.
async function retryOnCfBlock(fn, opts, wait = sleep) {
  const { attempts, backoffMs } = opts;
  for (let i = 1; i <= attempts; i++) {
    try {
      return await fn(i);
    } catch (err) {
      if (err.message !== 'CF_BLOCKED' || i === attempts) throw err;
      const ms = backoffMs[i - 1] ?? backoffMs[backoffMs.length - 1];
      console.error(`CF block on attempt ${i}/${attempts}, retrying in ${ms / 1000}s…`);
      await wait(ms);
    }
  }
}

// Each attempt gets a brand-new Camoufox instance — a fresh fingerprint is what
// actually gets us past Cloudflare; reusing the browser would reproduce the block.
async function scrapeThreadWithRetry() {
  // 'virtual' runs a headed browser under Xvfb on Linux (CI) — Turnstile almost
  // never clears in true-headless. Non-Linux dev machines keep plain headless.
  const headless = process.platform === 'linux' ? 'virtual' : true;
  return retryOnCfBlock(async () => {
    const browser = await Camoufox({ headless, os: 'windows', humanize: true });
    try {
      return await scrapeThread(browser);
    } finally {
      await browser.close();
    }
  }, CF_RETRY);
}

const TITLE_ID_RE = /\b(BL[UECSJAK][A-Z0-9]{6}|NP[A-Z]{2}[0-9]{5}|BC[A-Z]{2}[0-9]{5}|MRTC[0-9]{5})\b/gi;

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
  const TID_RE   = /\b(BL[UECSJAK][A-Z0-9]{6}|NP[A-Z]{2}[0-9]{5}|BC[A-Z]{2}[0-9]{5}|MRTC[0-9]{5})\b/i;

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

// The catalog may hold several same-named entries for one TID — e.g. the
// Prince of Persia Trilogy has one "Unlock FPS" per sub-game. Written as-is
// they overwrite each other in the target file, so prefix colliding cheat
// names with the sub-game name (collection suffix in parentheses stripped:
// "Warrior Within (Prince of Persia Trilogy 3D)" → "Warrior Within Unlock FPS").
function disambiguateEntries(entries) {
  const counts = {};
  for (const e of entries) {
    const key = `${e.tid}\0${e.cheatName.toLowerCase()}`;
    counts[key] = (counts[key] || 0) + 1;
  }
  return entries.map(e => {
    const key = `${e.tid}\0${e.cheatName.toLowerCase()}`;
    if (counts[key] < 2 || !e.gameName) return e;
    const sub = e.gameName.replace(/\s*\([^)]*\)\s*$/, '').trim();
    return sub ? { ...e, cheatName: `${sub} ${e.cheatName}` } : e;
  });
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

// Search USERLIST/ for existing .ncl files matching the given Title ID.
// Same substring convention as convert.js findNcl(). Never creates files —
// new games get a file only in PSXPlace Confirmed/.
function findUserlistFiles(tid, dir = USERLIST_DIR) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => f.includes(tid) && f.endsWith('.ncl'))
    .map(f => path.join(dir, f));
}

// Prepend entry to an .ncl file. Creates the file if it doesn't exist.
// Returns 'added' for a new entry, 'updated' when an existing same-name block
// had different patch lines and was replaced in place (first-post corrections),
// 'conflict' when such a block exists but allowUpdate is false (reply posts —
// the first-post catalog is the source of truth, replies never overwrite),
// false when an identical entry — or a hardware-verified [Tested] variant —
// is already present.
function prependToNcl(nclPath, entry, { allowUpdate = true } = {}) {
  let content = '';
  if (fs.existsSync(nclPath)) {
    content = fs.readFileSync(nclPath, 'utf8')
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n');
  }

  const entryLines = entry.split('\n');
  const cheatName  = entryLines[0].toLowerCase();
  const newCodes   = entryLines.slice(3, -1);
  const lines      = content ? content.split('\n') : [];

  // Find an existing block whose name line matches the cheat name exactly
  // (whole line, so "Super Unlock FPS" never shadows "Unlock FPS"), with an
  // optional "[Tested]" suffix.
  let i = 0;
  while (i < lines.length) {
    if (!lines[i].trim()) { i++; continue; }
    const start = i;
    while (i < lines.length && lines[i].trim() !== '#') i++;
    const end = i; // index of '#' (or EOF for an unterminated final block)

    const nameLine = lines[start].trim().toLowerCase();
    if (nameLine === cheatName || nameLine === cheatName + ' [tested]') {
      // Never auto-replace a hardware-verified entry.
      if (nameLine.endsWith(' [tested]')) return false;

      const oldCodes = lines.slice(start + 3, end).filter(l => l.trim());
      if (oldCodes.join('\n') === newCodes.join('\n')) return false;

      // Same cheat name, different codes. Only the first-post catalog may
      // correct an existing block; reply posts report a conflict instead.
      if (!allowUpdate) return 'conflict';
      lines.splice(start, end - start + 1, ...entryLines);
      fs.writeFileSync(nclPath, lines.join('\n'), 'utf8');
      return 'updated';
    }
    i = end + 1;
  }

  const trimmed = content.trimEnd();
  if (trimmed && !trimmed.endsWith('#')) {
    content = trimmed + '\n#\n';
  }

  const newContent = trimmed ? entry + '\n' + content : entry + '\n';
  fs.writeFileSync(nclPath, newContent, 'utf8');
  return 'added';
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

  const allPosts = await scrapeThreadWithRetry();
  const knownIds = new Set(state.known_post_ids);
  const newPosts = isBootstrap ? [] : allPosts.filter(p => !knownIds.has(p.id));

  const firstPost     = allPosts[0] || null;
  const firstPostHash = firstPost ? sha256short(firstPost.text) : null;
  const firstPostChanged = !isBootstrap && firstPost && state.first_post_hash !== undefined && firstPostHash !== state.first_post_hash;

  console.log(`Total posts seen: ${allPosts.length} | New replies: ${newPosts.length} | First post updated: ${firstPostChanged}`);

  state.known_post_ids = [...new Set([...state.known_post_ids, ...allPosts.map(p => p.id)])];
  if (firstPostHash) state.first_post_hash = firstPostHash;
  state.last_checked = new Date().toISOString();
  // Persisted only after processing succeeds (see end of main) — writing it
  // earlier would mark posts as known even when a crash loses their patches.
  const saveState = () =>
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2) + '\n', 'utf8');

  if (!newPosts.length && !firstPostChanged) {
    saveState();
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

  const prRows    = [];
  const modFiles  = new Set();
  const conflicts = [];

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
      const targets = [...findPsxplaceFiles(tid), ...findUserlistFiles(tid)];
      for (const nclPath of targets) {
        // Reply posts never overwrite existing blocks — the first-post
        // catalog is the source of truth; conflicts go to the PR body.
        const res = prependToNcl(nclPath, entry, { allowUpdate: false });
        if (res === 'conflict') {
          conflicts.push({ post: post.id, author, tid, file: path.basename(nclPath) });
          console.log(`  CONFLICT (manual review): ${path.basename(nclPath)}`);
        } else if (res) {
          modFiles.add(path.relative(process.cwd(), nclPath));
          console.log(`  Added: ${path.basename(nclPath)}`);
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
    const entries = disambiguateEntries(parseFirstPost(firstPost.text));
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

      // Also update existing USERLIST files (never created here) so the
      // full database stays in sync with the PSXPlace catalog.
      nclFiles = [...nclFiles, ...findUserlistFiles(tid)];

      for (const nclPath of nclFiles) {
        const res = prependToNcl(nclPath, entry);
        if (res) {
          const rel = path.relative(process.cwd(), nclPath);
          modFiles.add(rel);
          prRows.push(`| (first post edit) | ${author.replace(/\|/g, '\\|')} | ${tid} | ${patches.length} |`);
          console.log(`  ${res === 'updated' ? 'Updated' : 'Added'} "${cheatName}" in ${path.basename(nclPath)}`);
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
    `## Modified/created files (${modList.length})`,
    modList.length ? modList.map(f => `- \`${f}\``).join('\n') : '_No parseable patches found in new activity._',
    ...(conflicts.length ? [
      '',
      `## ⚠️ Conflicts — manual review needed (${conflicts.length})`,
      'Reply posts with codes that differ from an existing entry. Not applied automatically',
      '(the first-post catalog is the source of truth). See raw content for the proposed codes.',
      '',
      `| Post | Author | Title ID | File |`,
      `|------|--------|----------|------|`,
      ...conflicts.map(c => `| [${c.post}](${THREAD_URL}#${c.post}) | ${c.author.replace(/\|/g, '\\|')} | ${c.tid} | \`${c.file}\` |`),
    ] : []),
    '',
    `Raw content: \`new_patches_raw/${date}.txt\``,
  ].join('\n');

  fs.writeFileSync(PR_BODY_FILE, prBody, 'utf8');
  saveState();
  console.log(`Done. Modified/created ${modList.length} file(s) in PSXPlace Confirmed/. PR body written.`);
}

if (require.main === module) {
  // Exit codes: 2 = Cloudflare block (transient, retry tomorrow),
  // 3 = empty scrape (layout change — needs a code fix), 1 = other crash.
  main().catch(err => {
    console.error(err);
    if (err.message === 'CF_BLOCKED')   process.exit(2);
    if (err.message === 'SCRAPE_EMPTY') process.exit(3);
    process.exit(1);
  });
}

module.exports = {
  scrapeThread, scrapePage, scrapeThreadWithRetry, retryOnCfBlock, sleep,
  solveTurnstile, challengeCleared,
  extractTitleIds, extractPatches, parseFirstPost, buildNclEntry, disambiguateEntries,
  findPsxplaceFiles, findUserlistFiles, prependToNcl, normVersion, buildPsxplaceFilename,
};
