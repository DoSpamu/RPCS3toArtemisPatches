# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo does

Converts RPCS3 emulator game patches (`patch.yml`) into Artemis PS3 cheat format (`.ncl` files) so they can be used on real PS3 hardware with Custom Firmware. All converted entries are marked with `(RPCS3)` in their cheat name and are **prepended** to each file so they appear first in Artemis.

## Running the converter

```bash
# Safe mode — version-matched patches only → USERLIST/
node convert.js

# Risky mode — includes version-mismatched patches → USERLIST_RISKY/
node convert.js --risky
```

Both modes are idempotent: re-running skips entries already marked `(RPCS3)` in the target file. Results are logged to `conversion_report.json` (safe) or `conversion_report_risky.json` (risky).

In risky mode, version-mismatched patches get the target version appended to their label: `Unlock FPS v01.04 (RPCS3)` so users know which game version the patch was written for.

## Patch label conventions

Two label suffixes are used in cheat names — they indicate provenance:

| Label | Source | Author field |
|-------|--------|-------------|
| `(RPCS3)` | Official RPCS3 `patch.yml` | `RPCS3` or `FlexBy/RPCS3` etc. |
| `(PSXPlace)` | PSXPlace forum / PS3 Codes spreadsheet | Real person name (e.g. `FlexBy`, `vFxMz`, `illusion`) |

Both types may coexist in the same `.ncl` file and may target different memory addresses. When a PSXPlace patch was also confirmed in RPCS3's database, prefer the `(RPCS3)` label to avoid duplicates.

## Folder structure

| Folder | Contents |
|--------|----------|
| `USERLIST/` | ~2,500 Artemis `.ncl` files — primary target for conversion |
| `USERLIST_RISKY/` | Copy of USERLIST with 88 additional version-mismatched patches |
| `USERLIST_TESTED/` | 32 `.ncl` files — only patches confirmed working on real PS3 hardware |

`USERLIST_TESTED/` is maintained manually. Files there are exact copies of their `USERLIST/` counterparts. `README_TESTED.txt` inside lists per-game attribution and source.

## File formats

### patch.yml (RPCS3 format)
Non-standard YAML — the file has **multiple `Anchors:` sections** scattered throughout, which breaks standard YAML parsers (`js-yaml` cannot load it). The custom line-by-line parser in `convert.js` handles this. `patch_new.yml` is a second copy at the same version — use `patch.yml` as the canonical source.

Structure:
```
Anchors:
  ANCHOR_NAME: &ANCHOR_NAME     # 2-space indent
    - [ type, 0xADDR, 0xVAL ]  # 4-space indent (anchors)

PPU-<hash>:                     # root level, keyed by PPU executable hash
  "Patch Name":                 # 2-space indent
    Games:
      "Game Title":
        TITLEID: [ version ]    # 8-space indent
    Patch:
      - [ type, 0xADDR, val ]   # 6-space OR 4-space (inconsistency in source)
```

Patch types in use: `be32` (32-bit), `be16` (16-bit), `bef32` (32-bit float), `byte` (8-bit), `load` (alias reference). The `load` type references an anchor by name and inlines its lines.

### .ncl (Artemis format)
Plain text, one cheat entry per block, no blank lines between entries:
```
Cheat Name
0
Author
0 XXXXXXXX YYYYYYYY   ← 32-bit write (8 hex digits)
0 XXXXXXXX YYYY       ← 16-bit write (4 hex digits)
#
```

Code prefixes seen in USERLIST: `0` (direct write), `6` (pointer follow), `B` (array-of-bytes search/replace).

### Type conversion rules
| RPCS3 type | Artemis output |
|------------|----------------|
| `be32` | `0 ADDR VVVVVVVV` |
| `be16` | `0 ADDR VVVV` (4 digits) |
| `bef32` | `0 ADDR VVVVVVVV` (IEEE 754 BE via `Buffer.writeFloatBE`) |
| `byte` | skipped (no standard Artemis equivalent) |
| `bef64` / `be64` | skipped |
| `load *ANCHOR` | resolved inline from anchor dictionary |

## Key architecture decisions in convert.js

**Two-pass parsing:**
1. Pass 1 scans the entire file to build two anchor dictionaries:
   - `anchors`: name → `[rawPatchLine, ...]` (patch code anchors)
   - `gameAnchors`: name → `{gameName → {titleId → [versions]}}` (game title anchors)
2. Pass 2 walks PPU entries, calls `flush()` at each patch boundary, resolves `Games: *anchor` references against `gameAnchors`.

**Prepend, not append:** New RPCS3 entries are collected in `newEntries[]` during the inner loop and then prepended to the file content in one operation (`newEntries.join('\n') + '\n' + content`). This ensures RPCS3 patches appear first in the Artemis cheat list.

**Version matching:** `.ncl` filenames often contain a version like `01.00`. The converter extracts this and only adds a patch if the patch's declared version matches (or is `All`). Files with no version in the name accept any patch version. The `--risky` flag bypasses this check entirely.

**Duplicate prevention:** Before writing, the converter checks for lines ending in `(RPCS3)` in the existing file content. If a patch name already exists (case-insensitive), it's skipped. This does **not** detect `(PSXPlace)` entries — manually-added patches can coexist with RPCS3 ones at different addresses.

**FPS patch detection (`isFpsPatch`):** Exact match against a known set (`60 fps`, `unlock fps`, etc.) plus prefix match for variants like `Unlock FPS (No User Input)`.

**Report structure:** `conversion_report.json` has three keys: `modified` (files written to), `skipped` (version mismatch / already present), `notFound` (TIDs with no matching `.ncl`).

## Known .ncl file quirks

**Mixed line endings:** Some original USERLIST files use CRLF (`\r\n`) while content appended by convert.js uses LF (`\n`). When parsing `.ncl` files line-by-line, always normalize with `.replace(/\r\n/g, '\n').replace(/\r/g, '\n')` before splitting. Detecting block boundaries with `line === '#'` will silently fail on CRLF lines — use `line.trimEnd() === '#'` or normalize first.

**Missing `#` terminator:** A small number of original USERLIST files have an unterminated final cheat block (the last `B`-type or `0`-type entry has no closing `#`). If content is appended to such a file without checking, the new entry gets fused into the previous block. Always verify that the line immediately before an `(RPCS3)` entry is `#`.

**Address width in patch.yml:** At least one entry (`Alpha Protocol BLES00704`) has a 9-digit hex address (`0x000d78d48`) — a typo in the source. `fmtAddr` guards against this with `.slice(-8)` to cap to 32-bit width.

## USERLIST file naming convention

Files in `USERLIST/` (and `USERLIST_RISKY/`) follow loose naming patterns:
- `Game Title TITLEID VV.VV.ncl` — single region + version
- `Game Title TITLEID1 TITLEID2 VV.VV.ncl` — multiple regions in one file
- `Game Title TITLEID v01.00 av01.01.ncl` — "v" = disc version, "av" = app version

Title ID matching is done by substring: any `.ncl` filename containing the Title ID string (e.g. `BLUS30443`) is treated as a match. The original USERLIST files come from `bucanero_codes.json` (upstream ArtemisPS3 source).

## Dependencies

`convert.js` has **no npm dependencies** — it uses only Node.js built-ins (`fs`, `path`, `Buffer`).

`js-yaml` is listed in `devDependencies` but is **not used** — the standard YAML parser cannot handle `patch.yml` due to multiple `Anchors:` sections. The custom line-by-line parser in `convert.js` handles this instead.

`playwright` and `xlsx` are used only by the scraper scripts (not `convert.js`). Install with `npm install` before running scrapers.

## Documentation files

| File | How it's maintained |
|------|-------------------|
| `PATCHED_GAMES.md` | Manually updated — lists every `.ncl` file that received an RPCS3 patch |
| `SKIPPED_PATCHES.md` | Manually updated — lists Title IDs with no matching `.ncl` and explains skip reasons |
| `COMMUNITY_TESTED.md` | Manually curated — patches confirmed on real PS3 hardware, sourced from PSXPlace forum and PS3 Codes spreadsheet |

None of these are auto-generated by `convert.js`. The `conversion_report.json` (output of `convert.js`) is the machine-readable equivalent for `modified`/`skipped`/`notFound`.

`bucanero_codes.json` is the upstream ArtemisPS3 data file — it was used as the original source to generate the `USERLIST/` folder contents. It is not read by `convert.js`.

## Scraper scripts

Three scripts exist for sourcing new patches from the web — not part of the normal conversion workflow:

| Script | Method | Target |
|--------|--------|--------|
| `scrape_fps_patches.js` | Playwright (headless Chromium) | PSXPlace forum (9 pages), RPCS3 wiki/forums, Reddit |
| `scrape_flaresolverr.js` | FlareSolverr proxy at `192.168.1.100:8191` | Same sources, bypasses Cloudflare |
| `scrape_cloudflare.js` | Alternative CF bypass | Supplementary sources |

Output is written to `scraped_fps_patches.txt` and `scraped_rpcs3.txt`. These are the raw source files used to identify PSXPlace patches — grep them for keywords like `"confirmed"`, `"real ps3"`, `"tested"` to find community-verified patches.

`USERLIST/extract_posts.js` is a helper that strips HTML tags from raw scraped content.
