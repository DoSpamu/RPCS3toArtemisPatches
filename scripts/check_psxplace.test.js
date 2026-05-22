'use strict';
const assert = require('node:assert');
const { extractTitleIds, extractPatches, parseFirstPost, buildNclEntry, normVersion, buildPsxplaceFilename } = require('./check_psxplace.js');

// extractTitleIds — finds known PS3 Title ID patterns
assert.deepStrictEqual(extractTitleIds('Game BLUS30443 supports 60fps'), ['BLUS30443']);
assert.deepStrictEqual(extractTitleIds('BLES01614 and BLUS30983 both work'), ['BLES01614', 'BLUS30983']);
assert.deepStrictEqual(extractTitleIds('No ID here'), []);
assert.deepStrictEqual(extractTitleIds('BLUS30443 BLUS30443 duplicate'), ['BLUS30443']); // deduped
assert.deepStrictEqual(extractTitleIds('Mindjack MRTC00014 1.01'), ['MRTC00014']);        // MRTC format

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

// findPsxplaceFiles — name-based fallback (requires real filesystem; tested via integration)
// Verify the function is exported and accepts the gameName parameter without throwing
const { findPsxplaceFiles } = require('./check_psxplace.js');
assert.deepStrictEqual(findPsxplaceFiles('BLES00467'), []);          // no dir → empty
assert.deepStrictEqual(findPsxplaceFiles('BLES00467', 'Some Game'), []); // no dir → empty

console.log('All tests passed');
