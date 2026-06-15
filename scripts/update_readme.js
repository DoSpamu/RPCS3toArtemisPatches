'use strict';
// Regenerates the PSXPlace Community Confirmed table in README.md.
// Reads every .ncl file in "PSXPlace Confirmed/", extracts game name,
// TIDs, version, patch name, and author, then replaces the section
// between the "## Community Confirmed Games" header and the next "---".
// Also keeps the confirmed_games and patch_files badge counts in sync.

const fs   = require('fs');
const path = require('path');

const ROOT          = path.join(__dirname, '..');
const CONFIRMED_DIR = path.join(ROOT, 'PSXPlace Confirmed');
const USERLIST_DIR  = path.join(ROOT, 'USERLIST');
const README_PATH   = path.join(ROOT, 'README.md');

// ── Filename parsing ─────────────────────────────────────────────────────────

function parseFilename(filename) {
  const base = filename.replace(/\.ncl$/, '');
  // TID pattern covers BLUS, BLES, BCES, BCUS, BCAS, BCJS, MRTC, NPEB, NPUB, NPJB, NPEA…
  const tidRe = /[A-Z]{4}\d{5}/g;
  const matches = [...base.matchAll(tidRe)];

  if (!matches.length) {
    return { gameName: base.trim(), tids: [], version: '' };
  }

  const gameName = base.slice(0, matches[0].index).trim();
  const last     = matches[matches.length - 1];
  const version  = base.slice(last.index + last[0].length).trim();

  return { gameName, tids: matches.map(m => m[0]), version };
}

// ── NCL parsing ───────────────────────────────────────────────────────────────

// Returns [{name, author}, …] for every valid cheat block in the file.
// Non-standard blocks (Also known as, section separators) are skipped when
// their second line is not "0" — they get fast-forwarded to the next "#".
function parseNcl(content) {
  const lines = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  const blocks = [];
  let i = 0;

  while (i < lines.length) {
    const name = lines[i].trim();
    if (!name || name === '#') { i++; continue; }

    if ((lines[i + 1] || '').trim() !== '0') {
      // Non-standard block — skip to the closing #
      while (i < lines.length && lines[i].trimEnd() !== '#') i++;
      i++;
      continue;
    }

    const author = (lines[i + 2] || '').trim();
    blocks.push({ name, author });

    // Advance past this block's #
    while (i < lines.length && lines[i].trimEnd() !== '#') i++;
    i++;
  }

  return blocks;
}

// Pick the most relevant patch from a file's blocks.
// Priority: PSXPlace FPS patch → any PSXPlace patch → first block.
function primaryPatch(blocks) {
  if (!blocks.length) return { name: 'Unlock FPS', author: '—' };

  const fpsPsx = blocks.find(b =>
    b.name.includes('(PSXPlace)') && /fps|unlock|60\s*fps|framerate/i.test(b.name)
  );
  if (fpsPsx) return fpsPsx;

  const anyPsx = blocks.find(b => b.name.includes('(PSXPlace)'));
  if (anyPsx) return anyPsx;

  return blocks[0];
}

// ── Build table rows ──────────────────────────────────────────────────────────

function buildRows() {
  const files = fs.readdirSync(CONFIRMED_DIR)
    .filter(f => f.endsWith('.ncl'))
    .sort();

  return files
    .map(file => {
      const { gameName, tids, version } = parseFilename(file);
      const content = fs.readFileSync(path.join(CONFIRMED_DIR, file), 'utf8');
      const p       = primaryPatch(parseNcl(content));

      const patch = p.name
        .replace(/\s*\(PSXPlace\)/g, '')
        .replace(/\s*\(RPCS3\)/g, '')
        .replace(/\s*\[Tested\]/g, '')
        .trim() || 'Unlock FPS';

      // Normalize author names to their canonical display forms
      let author = p.author.replace(/^RPCS3_/, '').trim() || '—';
      if (author === 'Joey') author = 'Joey85';

      return {
        game:    gameName || file.replace('.ncl', ''),
        tids:    tids.join(' / '),
        version: version  || '—',
        patch,
        author,
        sortKey: (gameName || file).toLowerCase(),
      };
    })
    .sort((a, b) => a.sortKey.localeCompare(b.sortKey));
}

// ── README update ─────────────────────────────────────────────────────────────

const SECTION_HEADER = '## Community Confirmed Games — PSXPlace (✅)';
const SECTION_INTRO  =
  'Confirmed on real PS3 hardware by community members. ' +
  'Sources: **Joey85** (PSXPlace #49905), ' +
  '**Nascar1243** ([PS3-FPS-Patches](https://github.com/Nascar1243/PS3-FPS-Patches) — 3 weeks real-hardware testing), ' +
  '**FlexBy**, **vFxMz**, **illusion**, **NunoRS2000**, and others. ' +
  'All entries are in `USERLIST/` with `(PSXPlace)` in the cheat name.';

function generateSection(rows) {
  return [
    SECTION_HEADER,
    '',
    SECTION_INTRO,
    '',
    '| Game | Title ID | Version | Patch | Author |',
    '|------|----------|---------|-------|--------|',
    ...rows.map(r =>
      `| ${r.game} | ${r.tids || '—'} | ${r.version} | ${r.patch} | ${r.author} |`
    ),
  ].join('\n');
}

function fmtBadgeNum(n) {
  // Shields.io badge URLs use %2C for comma separators
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '%2C');
}

function updateReadme(rows) {
  let readme = fs.readFileSync(README_PATH, 'utf8');

  // Replace Community Confirmed section (from header to the next \n\n---)
  const si = readme.indexOf(SECTION_HEADER);
  const ei = readme.indexOf('\n\n---', si);
  if (si === -1 || ei === -1) {
    console.error('ERROR: Could not locate Community Confirmed section in README.md');
    process.exit(1);
  }
  readme = readme.slice(0, si) + generateSection(rows) + readme.slice(ei);

  // Badge: confirmed_games = 39 (Working Artemis) + PSXPlace Confirmed file count
  const WORKING_COUNT = 39;
  const confirmedTotal = WORKING_COUNT + rows.length;
  readme = readme.replace(
    /badge\/confirmed_games-\d+-brightgreen/,
    `badge/confirmed_games-${confirmedTotal}-brightgreen`
  );

  // Badge: patch_files = USERLIST .ncl count
  const userlistCount = fs.readdirSync(USERLIST_DIR).filter(f => f.endsWith('.ncl')).length;
  readme = readme.replace(
    /badge\/patch_files-[\d%2C]+-blue/,
    `badge/patch_files-${fmtBadgeNum(userlistCount)}-blue`
  );

  // "Start here" table: PSXPlace Confirmed game count
  readme = readme.replace(
    /\*\*`PSXPlace Confirmed\/`\*\* folder \(\d+ games\)/,
    `**\`PSXPlace Confirmed/\`** folder (${rows.length} games)`
  );

  // Downloads table: PSXPlace Confirmed game count
  readme = readme.replace(
    /(\*\*`PSXPlace Confirmed\/`\*\* \| )\d+( games)/,
    `$1${rows.length}$2`
  );

  fs.writeFileSync(README_PATH, readme, 'utf8');
  console.log(
    `README updated — PSXPlace: ${rows.length} games | ` +
    `Total confirmed: ${confirmedTotal} | USERLIST: ${userlistCount} files`
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

const rows = buildRows();
updateReadme(rows);
