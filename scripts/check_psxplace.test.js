'use strict';
const assert = require('node:assert');
const { extractTitleIds, extractPatches, buildNclEntry } = require('./check_psxplace.js');

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
// extractPatches — hex pair on same line
assert.deepStrictEqual(
  extractPatches('offset: 0x004DC6F4 value: 0x3F800000'),
  ['0 004DC6F4 3F800000']
);
// extractPatches — 16-bit value
assert.deepStrictEqual(
  extractPatches('addr 0x00200000 val 0x003C'),
  ['0 00200000 003C']
);
// extractPatches — no patches
assert.deepStrictEqual(extractPatches('just some game text'), []);

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

console.log('All tests passed');
