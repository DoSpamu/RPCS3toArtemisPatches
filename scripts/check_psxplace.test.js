'use strict';
const assert = require('node:assert');
const { extractTitleIds, extractPatches, parseFirstPost, buildNclEntry, normVersion, buildPsxplaceFilename } = require('./check_psxplace.js');

// extractTitleIds — finds known PS3 Title ID patterns
assert.deepStrictEqual(extractTitleIds('Game BLUS30443 supports 60fps'), ['BLUS30443']);
assert.deepStrictEqual(extractTitleIds('BLES01614 and BLUS30983 both work'), ['BLES01614', 'BLUS30983']);
assert.deepStrictEqual(extractTitleIds('No ID here'), []);
assert.deepStrictEqual(extractTitleIds('BLUS30443 BLUS30443 duplicate'), ['BLUS30443']); // deduped
assert.deepStrictEqual(extractTitleIds('Mindjack MRTC00014 1.01'), ['MRTC00014']);        // MRTC format
assert.deepStrictEqual(extractTitleIds('Mirrors Edge KR BLKS20094 1.02'), ['BLKS20094']); // Korea region

// extractPatches — NCL direct format
assert.deepStrictEqual(
  extractPatches('0 004DC6F4 3F800000'),
  ['0 004DC6F4 3F800000']
);
// extractPatches — hex pair with whitespace-only separation
assert.deepStrictEqual(
  extractPatches('0x004DC6F4 0x3F800000'),
  ['0 004DC6F4 3F800000']
);
// extractPatches — 16-bit value
assert.deepStrictEqual(
  extractPatches('0x00200000 0x003C'),
  ['0 00200000 003C']
);
// extractPatches — no patches
assert.deepStrictEqual(extractPatches('just some game text'), []);
// extractPatches — 9-digit address: keep low 32 bits (last 8 hex digits), not first 8
assert.deepStrictEqual(
  extractPatches('0x000d78d48 0x003C'),
  ['0 00D78D48 003C']
);
// extractPatches — firmware version on same line should NOT match (not whitespace-adjacent to addr)
assert.deepStrictEqual(
  extractPatches('works on fw 0x00030001 — addr 0x004DC6F4'),
  []
);

// buildNclEntry
assert.strictEqual(
  buildNclEntry('60 FPS', 'TestUser', ['0 004DC6F4 3F800000']),
  '60 FPS (PSXPlace)\n0\nTestUser\n0 004DC6F4 3F800000\n#'
);
// multiple codes
assert.strictEqual(
  buildNclEntry('60 FPS', 'dev', ['0 00000001 00000001', '0 00000002 00000002']),
  '60 FPS (PSXPlace)\n0\ndev\n0 00000001 00000001\n0 00000002 00000002\n#'
);

// parseFirstPost — extract NCL blocks from the catalog (first post)
// Format 2/3: cheat name on its own line, TID found by looking backwards
const FORMAT23_SAMPLE = `
Some intro text.

Condemned 2 Bloodshot\tBLUS30115\t1.01\tGame disc dump
+
Cheat code\t\t\\PS3_GAME\\USRDIR\\autoexec.cfg "MaxFPS" "60"
+
Unlock FPS
0
Joey
0 008fe1ac 38600001
#
Dead Space\tBLES00523\t1.00\tGame disc dump
+
Unlock FPS
0
Joey
0 00aabbcc 38600001
#
No ID game here
+
Unlock FPS
0
Joey
0 00112233 3f800000
#
`.trim();

const f23Results = parseFirstPost(FORMAT23_SAMPLE);
assert.strictEqual(f23Results.length, 2, 'Format 2/3: should find 2 entries with TIDs');
assert.strictEqual(f23Results[0].tid, 'BLUS30115');
assert.strictEqual(f23Results[0].cheatName, 'Unlock FPS');
assert.strictEqual(f23Results[0].author, 'Joey');
assert.deepStrictEqual(f23Results[0].patches, ['0 008FE1AC 38600001']);
assert.strictEqual(f23Results[1].tid, 'BLES00523');
assert.deepStrictEqual(f23Results[1].patches, ['0 00AABBCC 38600001']);

// Format 1: game info + TID + cheat name all on one tab-separated line
const FORMAT1_SAMPLE = `
Alien Rage\tNPEB01088\t1.00\tCheat code\t\tUnlock FPS
0
Joey
0 009802e8 2c030001
#
F.E.A.R. 2 Project Origin\tBLES00464\t\tGame disc dump\tconfig file edit\t
FALLOUT 3 GAME OF THE YEAR\tBLUS30451\t1.00\tCheat code\t\tUnlock FPS
0
RPCS3
0 00702BCC 60000000
#
`.trim();

const f1Results = parseFirstPost(FORMAT1_SAMPLE);
assert.strictEqual(f1Results.length, 2, 'Format 1: should find 2 entries');
assert.strictEqual(f1Results[0].tid, 'NPEB01088', 'TID from name line (Format 1)');
assert.strictEqual(f1Results[0].cheatName, 'Unlock FPS', 'cheat name = last tab segment');
assert.strictEqual(f1Results[1].tid, 'BLUS30451', 'Fallout 3 TID, not FEAR 2 TID');
assert.strictEqual(f1Results[1].cheatName, 'Unlock FPS');

// Format 2 with note on cheat name line: "Note text\tCheatName"
const FORMAT2_NOTE = `
Sleeping Dogs\tBLUS30927\t1.04\tCheat code\tPatch before loading the game.
Patching during gameplay may make it unstable.\tUnlock FPS
0
Joey
0 00898bb8 60000000
#
`.trim();

const f2NoteResults = parseFirstPost(FORMAT2_NOTE);
assert.strictEqual(f2NoteResults.length, 1);
assert.strictEqual(f2NoteResults[0].tid, 'BLUS30927');
assert.strictEqual(f2NoteResults[0].cheatName, 'Unlock FPS', 'last tab segment strips the note');

// parseFirstPost — no NCL blocks
assert.deepStrictEqual(parseFirstPost('Just text, no patches.'), []);

// parseFirstPost — multiple patch lines in one block
const MULTI_PATCH = `
Test Game\tBLUS30443\t1.00
Unlock FPS
0
dev
0 004DC6F4 3F800000
0 00200000 003C
#
`.trim();
const mpResults = parseFirstPost(MULTI_PATCH);
assert.strictEqual(mpResults.length, 1);
assert.deepStrictEqual(mpResults[0].patches, ['0 004DC6F4 3F800000', '0 00200000 003C']);

// disambiguateEntries — same TID + same cheat name (e.g. Prince of Persia Trilogy:
// one "Unlock FPS" per sub-game) must get the sub-game name prefixed so the
// entries don't overwrite each other in one file
const { disambiguateEntries } = require('./check_psxplace.js');
const popEntries = [
  { tid: 'BLUS30754', cheatName: 'Unlock FPS', author: 'RPCS3', patches: ['0 0009381C 60000000'],
    gameName: 'The Two Thrones (Prince of Persia Trilogy 3D)', version: '1.00' },
  { tid: 'BLUS30754', cheatName: 'Unlock FPS', author: 'RPCS3', patches: ['0 00824E10 60000000'],
    gameName: 'Warrior Within (Prince of Persia Trilogy 3D)', version: '1.00' },
];
const popResult = disambiguateEntries(popEntries);
assert.strictEqual(popResult[0].cheatName, 'The Two Thrones Unlock FPS',
  'collection suffix in parentheses is stripped, sub-game name prefixed');
assert.strictEqual(popResult[1].cheatName, 'Warrior Within Unlock FPS');
assert.strictEqual(popResult[0].tid, 'BLUS30754', 'other fields unchanged');
assert.deepStrictEqual(popResult[1].patches, ['0 00824E10 60000000']);

// no collision → names untouched
const single = disambiguateEntries([
  { tid: 'BLUS30115', cheatName: 'Unlock FPS', author: 'Joey', patches: ['0 008FE1AC 38600001'],
    gameName: 'Condemned 2 Bloodshot', version: '1.01' },
  { tid: 'BLES00523', cheatName: 'Unlock FPS', author: 'Joey', patches: ['0 00AABBCC 38600001'],
    gameName: 'Dead Space', version: '1.00' },
]);
assert.strictEqual(single[0].cheatName, 'Unlock FPS', 'same name, different TID → no prefix');
assert.strictEqual(single[1].cheatName, 'Unlock FPS');

// colliding entry without gameName stays as-is (nothing to prefix with)
const noName = disambiguateEntries([
  { tid: 'BLUS30754', cheatName: 'Unlock FPS', author: 'RPCS3', patches: ['0 00000001 00000001'], gameName: null, version: null },
  { tid: 'BLUS30754', cheatName: 'Unlock FPS', author: 'RPCS3', patches: ['0 00000002 00000002'],
    gameName: 'Warrior Within (Prince of Persia Trilogy 3D)', version: '1.00' },
]);
assert.strictEqual(noName[0].cheatName, 'Unlock FPS', 'null gameName → unchanged');
assert.strictEqual(noName[1].cheatName, 'Warrior Within Unlock FPS');

// normVersion
assert.strictEqual(normVersion('1.01'), '01.01');
assert.strictEqual(normVersion('01.01'), '01.01');
assert.strictEqual(normVersion('1.00'), '01.00');
assert.strictEqual(normVersion(''), '');

// buildPsxplaceFilename
assert.strictEqual(
  buildPsxplaceFilename('Condemned 2 Bloodshot', 'BLUS30115', '1.01'),
  'Condemned 2 Bloodshot BLUS30115 01.01.ncl'
);
assert.strictEqual(
  buildPsxplaceFilename('Alien Rage', 'NPEB01088', '1.00'),
  'Alien Rage NPEB01088 01.00.ncl'
);

// parseFirstPost — gameName and version are returned
const GN_SAMPLE = `
Condemned 2 Bloodshot\tBLUS30115\t1.01\tGame disc dump
+
Unlock FPS
0
Joey
0 008fe1ac 38600001
#
`.trim();
const gnResults = parseFirstPost(GN_SAMPLE);
assert.strictEqual(gnResults.length, 1);
assert.strictEqual(gnResults[0].gameName, 'Condemned 2 Bloodshot');
assert.strictEqual(gnResults[0].version, '1.01');
assert.strictEqual(gnResults[0].tid, 'BLUS30115');

// findPsxplaceFiles — name-based fallback (scans the real "PSXPlace Confirmed/"
// dir when run from the repo root; the TID below must not exist in any filename)
const { findPsxplaceFiles } = require('./check_psxplace.js');
assert.deepStrictEqual(findPsxplaceFiles('BLZZ99999'), []);              // no match → empty
assert.deepStrictEqual(findPsxplaceFiles('BLZZ99999', 'No Such Game'), []); // no match → empty

// prependToNcl — exercised on temp files
const os = require('node:os');
const fs = require('node:fs');
const path = require('node:path');
const { prependToNcl } = require('./check_psxplace.js');

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ncl-test-'));
const tmpNcl = path.join(tmpDir, 'Test Game BLUS99999 01.00.ncl');

const entryV1 = buildNclEntry('Unlock FPS', 'Joey', ['0 00000001 00000001']);
const entryV2 = buildNclEntry('Unlock FPS', 'Joey', ['0 00000001 00000002']);

// new file → added
assert.strictEqual(prependToNcl(tmpNcl, entryV1), 'added');
// identical entry → duplicate
assert.strictEqual(prependToNcl(tmpNcl, entryV1), false);
// same name, different codes (forum correction) → updated in place, no duplicate block
assert.strictEqual(prependToNcl(tmpNcl, entryV2), 'updated');
const afterUpdate = fs.readFileSync(tmpNcl, 'utf8');
assert.ok(afterUpdate.includes('0 00000001 00000002'), 'corrected code present');
assert.ok(!afterUpdate.includes('0 00000001 00000001'), 'stale code removed');
assert.strictEqual((afterUpdate.match(/Unlock FPS \(PSXPlace\)/g) || []).length, 1, 'single block');

// whole-line name match: a longer name must not shadow a shorter one
const tmpNcl2 = path.join(tmpDir, 'Test Game 2 BLUS99998 01.00.ncl');
fs.writeFileSync(tmpNcl2, 'Super Unlock FPS (PSXPlace)\n0\ndev\n0 00000009 00000009\n#\n', 'utf8');
assert.strictEqual(prependToNcl(tmpNcl2, entryV1), 'added',
  '"Super Unlock FPS" must not block adding "Unlock FPS"');

// hardware-verified [Tested] blocks are never auto-replaced
const tmpNcl3 = path.join(tmpDir, 'Test Game 3 BLUS99997 01.00.ncl');
fs.writeFileSync(tmpNcl3, 'Unlock FPS (PSXPlace) [Tested]\n0\nJoey\n0 00000001 00000001\n#\n', 'utf8');
assert.strictEqual(prependToNcl(tmpNcl3, entryV2), false,
  '[Tested] entry must not be replaced by a forum post');

// allowUpdate: false (reply posts) — same name + different codes must NOT replace;
// returns 'conflict' and leaves the file untouched (first post is the source of truth)
const tmpNcl4 = path.join(tmpDir, 'Test Game 4 BLUS99996 01.00.ncl');
assert.strictEqual(prependToNcl(tmpNcl4, entryV1, { allowUpdate: false }), 'added',
  'new entry is still added with allowUpdate: false');
const beforeConflict = fs.readFileSync(tmpNcl4, 'utf8');
assert.strictEqual(prependToNcl(tmpNcl4, entryV2, { allowUpdate: false }), 'conflict',
  'reply post must not overwrite an existing block');
assert.strictEqual(fs.readFileSync(tmpNcl4, 'utf8'), beforeConflict,
  'file must be unchanged after a conflict');
assert.strictEqual(prependToNcl(tmpNcl4, entryV1, { allowUpdate: false }), false,
  'identical entry is still a duplicate skip with allowUpdate: false');
// explicit allowUpdate: true keeps the first-post correction behavior
assert.strictEqual(prependToNcl(tmpNcl4, entryV2, { allowUpdate: true }), 'updated',
  'first-post edit still replaces in place');

// findUserlistFiles — TID substring match against existing .ncl files, never creates
const { findUserlistFiles } = require('./check_psxplace.js');
const tmpUserlist = path.join(tmpDir, 'USERLIST');
fs.mkdirSync(tmpUserlist);
fs.writeFileSync(path.join(tmpUserlist, 'Some Game BLUS88888 01.00.ncl'), 'X\n0\ndev\n0 00000001 00000001\n#\n', 'utf8');
fs.writeFileSync(path.join(tmpUserlist, 'Other Game BLES77777.ncl'), 'X\n0\ndev\n0 00000001 00000001\n#\n', 'utf8');
fs.writeFileSync(path.join(tmpUserlist, 'BLUS88888 notes.txt'), 'not an ncl', 'utf8');
assert.deepStrictEqual(
  findUserlistFiles('BLUS88888', tmpUserlist).map(f => path.basename(f)),
  ['Some Game BLUS88888 01.00.ncl'],
  'matches .ncl by TID substring, ignores non-.ncl'
);
assert.deepStrictEqual(findUserlistFiles('BLUS00000', tmpUserlist), [],
  'no match → empty, no file created');
assert.deepStrictEqual(findUserlistFiles('BLUS88888', path.join(tmpDir, 'no-such-dir')), [],
  'missing dir → empty');

fs.rmSync(tmpDir, { recursive: true, force: true });

// retryOnCfBlock — retries only CF_BLOCKED; injected no-op wait keeps tests instant.
const { retryOnCfBlock } = require('./check_psxplace.js');
const noWait = async () => {};
const retryOpts = { attempts: 3, backoffMs: [0, 0] };

(async () => {
  // CF_BLOCKED every attempt → tries exactly `attempts` times, then propagates
  let calls = 0;
  await assert.rejects(
    retryOnCfBlock(async () => { calls++; throw new Error('CF_BLOCKED'); }, retryOpts, noWait),
    /CF_BLOCKED/,
    'exhausted retries re-throw CF_BLOCKED'
  );
  assert.strictEqual(calls, 3, 'CF_BLOCKED retried up to attempts (3 calls)');

  // CF_BLOCKED once, then success → returns the value, called twice
  calls = 0;
  const result = await retryOnCfBlock(async () => {
    calls++;
    if (calls === 1) throw new Error('CF_BLOCKED');
    return ['post'];
  }, retryOpts, noWait);
  assert.deepStrictEqual(result, ['post'], 'succeeds on retry after a CF block');
  assert.strictEqual(calls, 2, 'stops retrying once fn succeeds');

  // SCRAPE_EMPTY → not retried, propagates immediately (layout change, exit 3)
  calls = 0;
  await assert.rejects(
    retryOnCfBlock(async () => { calls++; throw new Error('SCRAPE_EMPTY'); }, retryOpts, noWait),
    /SCRAPE_EMPTY/,
    'SCRAPE_EMPTY propagates without retry'
  );
  assert.strictEqual(calls, 1, 'SCRAPE_EMPTY is not retried (1 call)');

  console.log('All tests passed');
})().catch(err => { console.error(err); process.exit(1); });
