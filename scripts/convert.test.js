'use strict';
const assert = require('node:assert');
const {
  isFpsPatch, parseLine, nclVers, verMatches, canonName, existingRpcs3Names,
} = require('../convert.js');

// ---------- nclVers ----------
// Plain trailing version
assert.deepStrictEqual(nclVers('Game BLUS30443 01.00.ncl'), ['01.00']);
assert.deepStrictEqual(nclVers('GTA IV NPEB00882 01.09.ncl'), ['01.09']);
// "av" app version preferred over disc "v"
assert.deepStrictEqual(nclVers('GTA IV BLUS30127 v01.00 av01.08.ncl'), ['01.08']);
// Multi-region: dedupe identical av versions, keep distinct ones
assert.deepStrictEqual(
  nclVers('Haze BLES00157 v01.01 av01.36 BLUS30094 v01.00 av01.36.ncl'),
  ['01.36']
);
assert.deepStrictEqual(
  nclVers('Batman BLES01587 v02.00 av01.00 BLUS30978 v01.01 av01.00.ncl'),
  ['01.00']
);
// "v" only (no av)
assert.deepStrictEqual(nclVers('Game BLUS30443 v01.02.ncl'), ['01.02']);
// No version in name
assert.strictEqual(nclVers('Game BLUS30443.ncl'), null);
// "\bv" must not match inside "av"
assert.deepStrictEqual(nclVers('Orange Box BLES00153 av01.10.ncl'), ['01.10']);

// ---------- verMatches ----------
assert.strictEqual(verMatches(['01.08'], ['01.08']), true);
assert.strictEqual(verMatches(['01.00'], ['01.08']), false);
assert.strictEqual(verMatches(null, ['01.08']), true);          // no version in filename
assert.strictEqual(verMatches(['01.00'], ['All']), true);
assert.strictEqual(verMatches(['01.36', '01.00'], ['01.36']), true); // any candidate matches
assert.strictEqual(verMatches(['01.00.1'], ['01.00']), true);   // sub-version prefix

// ---------- canonName / existingRpcs3Names (duplicate detection) ----------
assert.strictEqual(canonName('Unlock FPS (RPCS3)'), 'unlock fps');
assert.strictEqual(canonName('Unlock FPS (RPCS3) [Tested]'), 'unlock fps');     // P1
assert.strictEqual(canonName('Unlock FPS v01.04 (RPCS3)'), 'unlock fps');       // P3 risky label
assert.strictEqual(canonName('Unlock FPS v01.04/01.05 (RPCS3)'), 'unlock fps');
assert.strictEqual(canonName('Unlock FPS'), 'unlock fps');
assert.strictEqual(canonName('60 FPS (RPCS3)'), '60 fps');

const FILE_WITH_TESTED = [
  'Unlock FPS (RPCS3) [Tested]', '0', 'RPCS3', '0 00F18830 00000000', '#',
  'Some Cheat', '0', 'dev', '0 00000001 00000001', '#',
].join('\n');
assert.strictEqual(existingRpcs3Names(FILE_WITH_TESTED).has('unlock fps'), true,
  '[Tested]-suffixed RPCS3 entry must be detected as existing');

const FILE_RISKY = 'Unlock FPS v01.04 (RPCS3)\n0\nRPCS3\n0 00000001 00000001\n#';
assert.strictEqual(existingRpcs3Names(FILE_RISKY).has('unlock fps'), true,
  'risky-mode versioned label must be detected as existing');

const FILE_CRLF = 'Unlock FPS (RPCS3)\r\n0\r\nRPCS3\r\n0 00000001 00000001\r\n#\r\n';
assert.strictEqual(existingRpcs3Names(FILE_CRLF).has('unlock fps'), true,
  'CRLF line endings must not break duplicate detection');

const FILE_PSXPLACE_ONLY = 'Unlock FPS (PSXPlace)\n0\nJoey\n0 00000001 00000001\n#';
assert.strictEqual(existingRpcs3Names(FILE_PSXPLACE_ONLY).has('unlock fps'), false,
  'PSXPlace entries must NOT block RPCS3 additions (different addresses may coexist)');

// ---------- parseLine ----------
assert.strictEqual(parseLine('- [ be32, 0x0034CAD0, 0x60000000 ]'), '0 0034CAD0 60000000');
assert.strictEqual(parseLine('- [ be16, 0x00200000, 0x003C ]'), '0 00200000 003C');
// 9-digit address typo in source: keep low 32 bits
assert.strictEqual(parseLine('- [ be32, 0x000d78d48, 0x60000000 ]'), '0 00D78D48 60000000');
// bef32 → IEEE 754 BE
assert.strictEqual(parseLine('- [ bef32, 0x00400000, 60 ]'), '0 00400000 42700000');
// byte type skipped
assert.ok(parseLine('- [ byte, 0x00400000, 0x01 ]').skip);
// load reference
assert.deepStrictEqual(parseLine('- [ load, *SomeAnchor ]'), { load: 'SomeAnchor' });

// ---------- isFpsPatch ----------
assert.strictEqual(isFpsPatch('Unlock FPS'), true);
assert.strictEqual(isFpsPatch('60 FPS'), true);
assert.strictEqual(isFpsPatch('Unlock FPS (No User Input)'), true);
assert.strictEqual(isFpsPatch('Infinite Health'), false);

console.log('convert.test.js: all tests passed');
