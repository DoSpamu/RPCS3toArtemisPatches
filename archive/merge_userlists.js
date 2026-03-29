'use strict';
const fs   = require('fs');
const path = require('path');

// ---------------------------------------------------------------------------
// merge_userlists.js
// Merges USERLIST/, USERLIST_RISKY/, USERLIST_TESTED/ into USERLIST_MERGED/
//
// Rules:
//   - USERLIST/ is the canonical base (version-matched patches)
//   - USERLIST_RISKY/ supplies extra version-mismatched patches (already
//     annotated with "v01.XX" in the cheat name); only NEW patch names are added
//   - USERLIST_TESTED/ patches are exact copies of USERLIST/ ones — those
//     get " [Tested]" appended to their cheat name to flag real-PS3 confirmation
//   - Deduplication is case-insensitive on the full cheat name
//   - Files that exist in only one source are kept as-is
// ---------------------------------------------------------------------------

const DIRS = {
  safe:   'USERLIST',
  risky:  'USERLIST_RISKY',
  tested: 'USERLIST_TESTED',
};
const OUT = 'USERLIST_MERGED';

// ---------------------------------------------------------------------------
// .ncl parser — returns array of patch objects
// ---------------------------------------------------------------------------
function parseNcl(content) {
  const lines = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  const patches = [];
  let block = [];

  const flush = () => {
    // Need at least: name, flag, author, + at least one code line
    if (block.length >= 3) {
      // filter trailing blank lines inside block
      while (block.length > 3 && block[block.length - 1] === '') block.pop();
      patches.push({
        name:   block[0],
        flag:   block[1],
        author: block[2],
        codes:  block.slice(3),
      });
    }
    block = [];
  };

  for (const line of lines) {
    if (line.trimEnd() === '#') {
      flush();
    } else {
      block.push(line);
    }
  }
  // Handle missing final '#' terminator
  flush();

  return patches;
}

// Serialize a single patch block
function patchToString(p) {
  return [p.name, p.flag, p.author, ...p.codes, '#'].join('\n');
}

// Normalize name for deduplication
function normName(name) {
  return name.toLowerCase().trim();
}

// ---------------------------------------------------------------------------
// Collect all .ncl filenames across all three source dirs
// ---------------------------------------------------------------------------
function getAllFilenames() {
  const files = new Set();
  for (const dir of Object.values(DIRS)) {
    if (!fs.existsSync(dir)) continue;
    fs.readdirSync(dir)
      .filter(f => f.toLowerCase().endsWith('.ncl'))
      .forEach(f => files.add(f));
  }
  return [...files].sort();
}

function readPatches(dir, filename) {
  const fp = path.join(dir, filename);
  if (!fs.existsSync(fp)) return [];
  return parseNcl(fs.readFileSync(fp, 'utf8'));
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
function main() {
  if (!fs.existsSync(OUT)) fs.mkdirSync(OUT);

  const allFiles = getAllFilenames();

  let totalFiles    = 0;
  let filesWithExtra = 0;  // gained patches from RISKY
  let testedMarked  = 0;   // patches that got [Tested] label

  for (const filename of allFiles) {
    const safePatches   = readPatches(DIRS.safe,   filename);
    const riskyPatches  = readPatches(DIRS.risky,  filename);
    const testedPatches = readPatches(DIRS.tested, filename);

    // Names of patches confirmed on real PS3 hardware (from TESTED dir)
    const testedNames = new Set(testedPatches.map(p => normName(p.name)));

    const merged  = [];
    const seen    = new Set();   // normalized names already in `merged`
    let   hadExtra = false;

    function addPatch(patch) {
      const key = normName(patch.name);
      if (seen.has(key)) return;
      seen.add(key);

      // If this patch name matches something in TESTED, append [Tested]
      if (testedNames.has(key)) {
        patch = { ...patch, name: patch.name + ' [Tested]' };
        testedMarked++;
      }

      merged.push(patch);
    }

    // 1. Safe (version-matched) patches first
    for (const p of safePatches) addPatch(p);

    // 2. Risky-only patches (the ~88 version-mismatched extras)
    for (const p of riskyPatches) {
      if (!seen.has(normName(p.name))) {
        hadExtra = true;
        addPatch(p);
      }
    }

    if (merged.length === 0) continue;

    if (hadExtra) filesWithExtra++;

    const outContent = merged.map(patchToString).join('\n') + '\n';
    fs.writeFileSync(path.join(OUT, filename), outContent, 'utf8');
    totalFiles++;
  }

  console.log('=== merge_userlists.js done ===');
  console.log(`Files written        : ${totalFiles}`);
  console.log(`Files with RISKY add : ${filesWithExtra}`);
  console.log(`[Tested] markers     : ${testedMarked}`);
  console.log(`Output folder        : ${OUT}/`);
  console.log('');
  console.log('Next steps:');
  console.log('  1. Verify a few files in USERLIST_MERGED/ look correct');
  console.log('  2. If happy, rename USERLIST_MERGED/ → USERLIST/ (and archive the old three)');
  console.log('  3. Update convert.js USERLIST_DIR to point to the merged folder if needed');
}

main();
