'use strict';
const assert = require('node:assert');
const { extractTitleIds, extractPatches, parseFirstPost, buildNclEntry } = require('./check_psxplace.js');

// extractTitleIds — finds known PS3 Title ID patterns
assert.deepStrictEqual(extractTitleIds('Game BLUS30443 supports 60fps'), ['BLUS30443']);
assert.deepStrictEqual(extractTitleIds('BLES01614 and BLUS30983 both work'), ['BLES01614', 'BLUS30983']);
assert.deepStrictEqual(extractTitleIds('No ID here'), []);
assert.deepStrictEqual(extractTitleIds('BLUS30443 BLUS30443 duplicate'), ['BLUS30443']); // deduped

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
const FIRST_POST_SAMPLE = `
Some intro text.

Condemned 2 Bloodshot    BLUS30115    1.01    Game disc dump
+
Cheat code    \\PS3_GAME\\USRDIR\\autoexec.cfg "MaxFPS" "60"
+
Unlock FPS
0
Joey
0 008fe1ac 38600001
#
Dead Space    BLES00523    1.00    Game disc dump
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

const fpResults = parseFirstPost(FIRST_POST_SAMPLE);
assert.strictEqual(fpResults.length, 2, 'should find 2 entries with TIDs');
assert.strictEqual(fpResults[0].tid, 'BLUS30115');
assert.strictEqual(fpResults[0].cheatName, 'Unlock FPS');
assert.strictEqual(fpResults[0].author, 'Joey');
assert.deepStrictEqual(fpResults[0].patches, ['0 008FE1AC 38600001']);
assert.strictEqual(fpResults[1].tid, 'BLES00523');
assert.deepStrictEqual(fpResults[1].patches, ['0 00AABBCC 38600001']);

// parseFirstPost — no NCL blocks
assert.deepStrictEqual(parseFirstPost('Just text, no patches.'), []);

// parseFirstPost — multiple patch lines in one block
const MULTI_PATCH = `
Test Game    BLUS30443    1.00
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

console.log('All tests passed');
