'use strict';
const fs = require('fs');
const path = require('path');

const PATCH_FILE = path.join(__dirname, 'patch.yml');
const USERLIST_DIR = path.join(__dirname, 'USERLIST');

// ---------- FPS name matching ----------
function isFpsPatch(name) {
  const l = name.toLowerCase();
  const EXACT = new Set(['60 fps','60fps','fps unlock','unlock fps','unlock framerate','framerate unlock','frame rate unlock','unlock frame rate']);
  if (EXACT.has(l)) return true;
  const PREFIXES = ['unlock fps','unlock framerate','framerate unlock','60 fps'];
  return PREFIXES.some(p => l.startsWith(p + ' ') || l.startsWith(p + '('));
}

// ---------- Conversion helpers ----------
function f32hex(f) {
  const b = Buffer.allocUnsafe(4);
  b.writeFloatBE(parseFloat(f), 0);
  return b.toString('hex').toUpperCase();
}
const fmtAddr = s => s.trim().replace(/^0x/i,'').toUpperCase().padStart(8,'0').slice(-8);
const fmtH32  = s => s.trim().replace(/^0x/i,'').toUpperCase().padStart(8,'0').slice(-8);
const fmtH16  = s => s.trim().replace(/^0x/i,'').toUpperCase().padStart(4,'0').slice(-4);

function parseLine(raw) {
  const loadM = raw.match(/^-\s*\[\s*load\s*,\s*\*(\w+)\s*\]/);
  if (loadM) return {load: loadM[1]};
  const m = raw.match(/^-\s*\[\s*(\w+)\s*,\s*([^,\]]+?)\s*,\s*([^\]]+?)\s*\](\s*#.*)?$/);
  if (!m) return {skip:`unparseable: ${raw.slice(0,80)}`};
  const [,type,addr,rawVal] = m;
  const val = rawVal.split('#')[0].trim();
  const a = fmtAddr(addr);
  switch(type) {
    case 'be32': return `0 ${a} ${fmtH32(val)}`;
    case 'be16': return `0 ${a} ${fmtH16(val)}`;
    case 'bef32': {
      if (val.startsWith('*')) return {skip:`bef32 anchor ref: ${val}`};
      const n = parseFloat(val);
      if (isNaN(n)) return {skip:`bad float: ${val}`};
      return `0 ${a} ${f32hex(n)}`;
    }
    case 'byte': return {skip:'byte (1-byte) type skipped'};
    default: return {skip:`unsupported type: ${type}`};
  }
}

function resolveLines(rawLines, anchors) {
  const out = [], skips = [];
  for (const raw of rawLines) {
    const r = parseLine(raw);
    if (typeof r === 'string') { out.push(r); continue; }
    if (r.load) {
      const a = anchors[r.load];
      if (a) { const s = resolveLines(a, anchors); out.push(...s.out); skips.push(...s.skips); }
      else skips.push(`*${r.load} not found`);
    } else { skips.push(r.skip); }
  }
  return {out, skips};
}

// ---------- Parse patch.yml ----------
function parsePatchYml(text) {
  const lines = text.split('\n');
  const n = lines.length;
  const anchors = {};     // name -> [rawPatchLine, ...]
  const gameAnchors = {}; // name -> {gameName -> {titleId -> [versions]}}
  const fpsByTid = {};    // titleId -> [{name,author,rawLines,versions}]

  const getInd = l => { let k=0; while(k<l.length && l[k]===' ') k++; return k; };

  // ---- Pass 1: collect all anchors ----
  for (let j = 0; j < n; j++) {
    const line = lines[j];
    const anm = line.match(/^  (\w+): &(\w+)\s*$/);
    if (!anm || anm[1] !== anm[2]) continue;
    const aname = anm[1];
    const pLines = [], gMap = {};
    let isGames = false, curGame = null;
    let k = j + 1;
    while (k < n) {
      const l = lines[k], tr = l.trim();
      if (!tr) { k++; continue; }
      const ind = getInd(l);
      if (ind <= 2 && tr && !tr.startsWith('#')) break;
      if (tr.startsWith('#')) { k++; continue; }
      if (ind === 4) {
        if (tr.startsWith('- [')) { pLines.push(tr); k++; continue; }
        const gm = tr.match(/^"(.+)":\s*$/);
        if (gm) { isGames=true; curGame=gm[1]; gMap[curGame]={}; k++; continue; }
      }
      if (ind === 6 && isGames && curGame) {
        const tm = tr.match(/^(\w+):\s*\[([^\]]*)\]/);
        if (tm) {
          const vs = tm[2].split(',').map(v=>v.trim()).filter(Boolean);
          gMap[curGame][tm[1]] = vs.length ? vs : ['All'];
        }
      }
      k++;
    }
    if (pLines.length) anchors[aname] = pLines;
    if (isGames) gameAnchors[aname] = gMap;
  }

  // ---- Pass 2: collect FPS patches ----
  let state='root';
  let curName=null, curAuthor='', curRaw=[], curTids={};
  let inGames=false, inPatch=false, gamesAnchor=null, curGame2=null;

  function flush() {
    if (curName && isFpsPatch(curName)) {
      let tids = {...curTids};
      if (!Object.keys(tids).length && gamesAnchor) {
        const ga = gameAnchors[gamesAnchor];
        if (ga) for (const gObj of Object.values(ga))
          for (const [tid,vs] of Object.entries(gObj)) tids[tid]=vs;
      }
      for (const [tid,vs] of Object.entries(tids)) {
        if (!fpsByTid[tid]) fpsByTid[tid]=[];
        fpsByTid[tid].push({name:curName, author:curAuthor, rawLines:[...curRaw], versions:vs});
      }
    }
    curName=null; curAuthor=''; curRaw=[]; curTids={};
    inGames=false; inPatch=false; gamesAnchor=null; curGame2=null;
  }

  for (let j = 0; j < n; j++) {
    const line = lines[j], tr = line.trim();
    if (!tr) continue;
    const ind = getInd(line);

    if (ind === 0) {
      if (tr === 'Anchors:') { flush(); state='anchors'; continue; }
      if (/^PPU-[A-Za-z0-9]+:/.test(tr)) { flush(); state='ppu'; continue; }
      flush(); state='root'; continue;
    }
    if (state !== 'ppu' || tr.startsWith('#')) continue;

    if (ind === 2) {
      flush();
      const pm = line.match(/^  "([^"]+)":\s*$/);
      if (pm) curName = pm[1];
      continue;
    }
    if (!curName) continue;

    if (ind === 4) {
      // Patch lines at indent-4 (malformatted but common in patch.yml)
      if (inPatch && (tr.startsWith('- [')||tr.startsWith('-['))) { curRaw.push(tr); continue; }
      if (/^Games:/.test(tr)) {
        inGames=true; inPatch=false; gamesAnchor=null; curGame2=null;
        const ref = tr.match(/^Games:\s*\*(\w+)$/);
        if (ref) { gamesAnchor=ref[1]; inGames=false; }
        continue;
      }
      if (/^Patch:/.test(tr))  { inPatch=true; inGames=false; continue; }
      if (/^Author:\s/.test(tr)) { curAuthor=tr.replace(/^Author:\s*/,'').replace(/^"|"$/g,''); inGames=false; continue; }
      if (/^(Notes|Patch Version|Configurable Values):/.test(tr)) { inGames=false; continue; }
      inGames=false; inPatch=false; continue;
    }

    if (ind === 6) {
      if (inGames) {
        const gm = tr.match(/^"(.+)":\s*$/);
        if (gm) { curGame2=gm[1]; continue; }
      }
      if (inPatch && (tr.startsWith('- [')||tr.startsWith('-['))) { curRaw.push(tr); continue; }
      continue;
    }

    if (ind === 8 && inGames && curGame2) {
      const tm = tr.match(/^(\w+):\s*\[([^\]]*)\]/);
      if (tm) {
        const vs = tm[2].split(',').map(v=>v.trim()).filter(Boolean);
        curTids[tm[1]] = vs.length ? vs : ['All'];
      }
    }
  }
  flush();
  return {anchors, fpsByTid};
}

// ---------- NCL helpers ----------
function findNcl(tid, dir) {
  return fs.readdirSync(dir)
    .filter(f => f.includes(tid) && f.endsWith('.ncl'))
    .map(f => path.join(dir, f));
}

function nclVer(filename) {
  // "Game TITLEID 01.00.ncl" or "Game TITLEID v01.00 av01.01.ncl"
  const b = path.basename(filename);
  // Try "XX.XX" that comes right before .ncl
  const m = b.match(/ (\d{2}\.\d{2}(?:\.\d+)?)\.ncl$/);
  return m ? m[1] : null;
}

function verMatches(fileVer, patchVers) {
  if (!fileVer) return true;
  if (patchVers.includes('All')) return true;
  return patchVers.some(v => fileVer === v || fileVer.startsWith(v+'.'));
}

// ---------- Main ----------
function main() {
  const risky = process.argv.includes('--risky');
  const targetDir = risky
    ? path.join(__dirname, 'USERLIST_RISKY')
    : USERLIST_DIR;
  const reportFile = risky ? 'conversion_report_risky.json' : 'conversion_report.json';

  if (risky) {
    console.log('MODE: RISKY — version checking disabled, target: USERLIST_RISKY/');
    console.log('WARNING: Patches may use wrong memory addresses if game version differs!\n');
  }

  console.log('Parsing patch.yml...');
  const {anchors, fpsByTid} = parsePatchYml(fs.readFileSync(PATCH_FILE,'utf8'));

  const tids = Object.keys(fpsByTid);
  console.log(`FPS patches found for ${tids.length} unique Title IDs`);

  const rep = {modified:[], skipped:[], notFound:[]};
  let totalAdded = 0;

  for (const tid of tids.sort()) {
    const patches = fpsByTid[tid];
    const files = findNcl(tid, targetDir);
    if (!files.length) {
      for (const p of patches)
        rep.notFound.push({tid, name:p.name, reason:'no .ncl file'});
      continue;
    }

    for (const nclFile of files) {
      const fVer = nclVer(nclFile);
      let content = fs.readFileSync(nclFile,'utf8');
      const newEntries = [];

      // Track already-added patch names (case-insensitive) for this file
      const done = new Set(
        (content.match(/^.+\(RPCS3\)$/gm)||[]).map(l=>l.replace(/ \(RPCS3\)$/,'').toLowerCase())
      );

      for (const p of patches) {
        if (!risky && !verMatches(fVer, p.versions)) {
          rep.skipped.push({tid, file:path.basename(nclFile), name:p.name,
            reason:`version mismatch (file=${fVer||'any'}, patch=${p.versions.join(',')})`});
          continue;
        }
        if (done.has(p.name.toLowerCase())) {
          rep.skipped.push({tid, file:path.basename(nclFile), name:p.name, reason:'duplicate'});
          continue;
        }

        const {out:artemis, skips} = resolveLines(p.rawLines, anchors);
        if (!artemis.length) {
          rep.skipped.push({tid, file:path.basename(nclFile), name:p.name,
            reason:`no convertible lines: ${skips.join('; ')}`});
          continue;
        }

        // In risky mode, append version info to patch name so user knows which version it was for
        const patchLabel = risky && !verMatches(fVer, p.versions)
          ? `${p.name} v${p.versions.join('/')} (RPCS3)`
          : `${p.name} (RPCS3)`;

        const entry = [patchLabel, '0', 'RPCS3', ...artemis, '#'].join('\n');
        newEntries.push(entry);
        done.add(p.name.toLowerCase());
        totalAdded++;
        rep.modified.push({tid, file:path.basename(nclFile), name:patchLabel,
          lines:artemis.length, skippedLines:skips, patchVersion:p.versions});
      }

      // Prepend new RPCS3 entries so they appear first in Artemis cheat list
      if (newEntries.length) {
        content = newEntries.join('\n') + '\n' + content;
        fs.writeFileSync(nclFile, content, 'utf8');
      }
    }
  }

  fs.writeFileSync(reportFile, JSON.stringify(rep, null, 2), 'utf8');
  console.log(`\nDone. Added ${totalAdded} patch entries.`);
  console.log(`  Modified entries : ${rep.modified.length}`);
  console.log(`  Skipped          : ${rep.skipped.length}`);
  console.log(`  No .ncl found    : ${rep.notFound.length}`);
  console.log(`  Report           : ${reportFile}`);
}

main();
