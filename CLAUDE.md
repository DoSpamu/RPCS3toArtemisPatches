# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo does

Converts RPCS3 emulator game patches (`patch.yml`) into Artemis PS3 cheat format (`.ncl` files) so they can be used on real PS3 hardware with Custom Firmware. All converted entries are marked with `(RPCS3)` in their cheat name and are **prepended** to each file so they appear first in Artemis.

## Running the converter

```bash
# Version-matched patches only → USERLIST/
node convert.js

# Also includes version-mismatched patches → USERLIST/ (labeled v01.XX)
node convert.js --risky
```

Both modes are idempotent: re-running skips entries already marked `(RPCS3)` in the target file. Results are logged to `conversion_report.json` (written next to `convert.js`, gitignored).

In risky mode, version-mismatched patches get the target version appended to their label: `Unlock FPS v01.04 (RPCS3)` so users know which game version the patch was written for. Both safe and risky output goes to `USERLIST/`.

## Tests

```bash
npm test                            # both suites
node scripts/convert.test.js        # converter only (nclVers, canonName, parseLine…)
node scripts/check_psxplace.test.js # monitor only (parsers, prependToNcl on temp files)
```

Plain `node:assert` scripts, no test framework. CI runs `npm test` before every scrape. When changing duplicate detection or version matching in `convert.js`, an end-to-end check is cheap and definitive: run `node convert.js` twice — the second run must report `Added 0 patch entries`.

## PSXPlace thread monitor (`scripts/check_psxplace.js`)

Daily automation (GitHub Actions, cron 06:00 UTC, .github/workflows/check-psxplace.yml) that scrapes PSXPlace thread #49905 via Camoufox (Cloudflare-resistant Firefox). Since 2026-07 the job runs on a self-hosted runner (label psxplace) on the user's home NUC — datacenter IPs are Cloudflare-blocked; deployment docs in deploy/nuc-runner/. It detects two kinds of activity:

- **New reply posts** → extracts Title IDs + NCL codes, prepends `Unlock FPS (PSXPlace)` entries to matching files in `PSXPlace Confirmed/` (>20 code lines in one post = quoted catalog, skipped).
- **First-post edits** (Joey85's catalog, detected via `first_post_hash`) → `parseFirstPost()` extracts structured entries (game name, TID, version) and can **create new files**.

Key behaviors:
- `prependToNcl()` returns `'added' | 'updated' | false`. Same cheat name with **different** codes replaces the old block in place (forum corrections); `[Tested]` blocks are **never** auto-replaced; identical entries are skipped.
- State (`known_posts.json`: `known_post_ids`, `first_post_hash`, `last_checked`) is saved **after** processing succeeds — a crash must not mark posts as known before their patches are extracted.
- Raw scraped content of new posts goes to `new_patches_raw/YYYY-MM-DD.txt`; `pr_body.txt` (gitignored) gates the workflow's commit step.
- The workflow commits results **directly to master** (`[Auto] PSXPlace new patches YYYY-MM-DD`).
- Empty `known_post_ids` = bootstrap mode: records all current posts without processing them.

## Patch label conventions

Label suffixes in cheat names indicate provenance and status:

| Label | Meaning | Author field |
|-------|---------|-------------|
| `(RPCS3)` | Official RPCS3 `patch.yml` | `RPCS3` or `FlexBy/RPCS3` etc. |
| `(PSXPlace)` | PSXPlace forum / PS3 Codes spreadsheet | Real person name (e.g. `FlexBy`, `vFxMz`, `illusion`) |
| `v01.XX (RPCS3)` | Version-mismatched RPCS3 patch | `RPCS3` |
| `[Tested]` suffix | Confirmed working on real PS3 hardware | unchanged |

Both `(RPCS3)` and `(PSXPlace)` types may coexist in the same `.ncl` file and may target different memory addresses. When a PSXPlace patch was also confirmed in RPCS3's database, prefer the `(RPCS3)` label to avoid duplicates.

## Folder structure

| Folder | Contents |
|--------|----------|
| `USERLIST/` | **2,542** Artemis `.ncl` files — full patch database (RPCS3 conversions + PSXPlace community patches) |
| `Working Artemis Patches/` | **39** personally-verified `.ncl` files — same games as `MAPI_PATCHES.md` |
| `PSXPlace Confirmed/` | **83** community-verified `.ncl` files from PSXPlace thread #49905 (Joey85) + Nascar1243 — grown automatically by the monitor |
| `beta_testing/` | Saved HTML exports of Discord beta-test channel (reference material for verifying patches) |

Patches confirmed on real PS3 hardware are marked `[Tested]` in the cheat name. Version-mismatched RPCS3 patches are labeled `v01.XX (RPCS3)` inline. `Working Artemis Patches/` and `PSXPlace Confirmed/` are curated subsets of `USERLIST/` shipped together in each release zip for users who only want known-good patches.

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

**Version matching:** `.ncl` filenames often contain a version like `01.00`, or `v01.00 av01.08` pairs (`av` = app version, which is what RPCS3 patches target and takes precedence). `nclVers()` extracts all candidates and a patch is added only if its declared version matches one of them (or is `All`). Files with no version in the name accept any patch version. The `--risky` flag bypasses this check entirely.

**Duplicate prevention:** Before writing, the converter collects existing `(RPCS3)` entries and compares names canonicalized via `canonName()` — the `(RPCS3)` label, the `[Tested]` suffix, and risky-mode `vXX.XX` suffixes are stripped from both sides (any new name-suffix convention must be added there or idempotency silently breaks). This does **not** detect `(PSXPlace)` entries — manually-added patches can coexist with RPCS3 ones at different addresses.

**FPS patch detection (`isFpsPatch`):** Exact match against a known set (`60 fps`, `unlock fps`, etc.) plus prefix match for variants like `Unlock FPS (No User Input)`.

**Report structure:** `conversion_report.json` has three keys: `modified` (files written to), `skipped` (version mismatch / already present), `notFound` (TIDs with no matching `.ncl`).

## Known .ncl file quirks

**Mixed line endings:** Some original USERLIST files use CRLF (`\r\n`) while content appended by convert.js uses LF (`\n`). When parsing `.ncl` files line-by-line, always normalize with `.replace(/\r\n/g, '\n').replace(/\r/g, '\n')` before splitting. Detecting block boundaries with `line === '#'` will silently fail on CRLF lines — use `line.trimEnd() === '#'` or normalize first.

**Missing `#` terminator:** A small number of original USERLIST files have an unterminated final cheat block (the last `B`-type or `0`-type entry has no closing `#`). If content is appended to such a file without checking, the new entry gets fused into the previous block. Always verify that the line immediately before an `(RPCS3)` entry is `#`.

**Address width in patch.yml:** At least one entry (`Alpha Protocol BLES00704`) has a 9-digit hex address (`0x000d78d48`) — a typo in the source. `fmtAddr` guards against this with `.slice(-8)` to cap to 32-bit width.

**Indentation anomaly in patch.yml:** one entry (`WRC Powerslide`, line ~2487) has its patch name at 1-space indent instead of 2 — the parser requires exactly 2 spaces and silently skips it. Its NCL entry already exists in USERLIST (verified correct against the source). If patch.yml is ever refreshed, watch for new lines matching `^ "[^"]+":$`.

**Metadata pseudo-blocks:** the upstream database contains non-cheat blocks that violate the name/0/author/codes/`#` structure by design: `Also known as` / `Alternative Names` blocks (alternate game titles), `/*Section Name*/` separators in collection files, and `AoB`-named blocks whose `B`-prefix codes start right after the name. A structural linter must whitelist these — they are conventions, not corruption.

## USERLIST file naming convention

Files in `USERLIST/` follow loose naming patterns:
- `Game Title TITLEID VV.VV.ncl` — single region + version
- `Game Title TITLEID1 TITLEID2 VV.VV.ncl` — multiple regions in one file
- `Game Title TITLEID v01.00 av01.01.ncl` — "v" = disc version, "av" = app version

Title ID matching is done by substring: any `.ncl` filename containing the Title ID string (e.g. `BLUS30443`) is treated as a match. The original USERLIST files come from `bucanero_codes.json` (upstream ArtemisPS3 source).

## Dependencies

`convert.js` has **no npm dependencies** — it uses only Node.js built-ins (`fs`, `path`, `Buffer`).

`js-yaml` is deliberately **not used** — the standard YAML parser cannot handle `patch.yml` due to multiple `Anchors:` sections. The custom line-by-line parser in `convert.js` handles this instead.

The only npm dependency is `camoufox` (used by `scripts/check_psxplace.js`). The legacy scrapers in `legacy/` needed `playwright`/`xlsx` — install those manually if you ever run them.

## Documentation files

| File | How it's maintained |
|------|-------------------|
| `SKIPPED_PATCHES.md` | Manually updated — lists Title IDs with no matching `.ncl` and explains skip reasons |
| `COMMUNITY_TESTED.md` | Manually curated — patches confirmed on real PS3 hardware, sourced from PSXPlace forum and PS3 Codes spreadsheet |

Neither is auto-generated by `convert.js`. The `conversion_report.json` (output of `convert.js`) is the machine-readable equivalent for `modified`/`skipped`/`notFound`.

`MAPI_PATCHES.md` documents live-memory patches for PS3MAPI / webMAN MOD (no Artemis required) — manually curated from Nascar1243's research DOCX. `CHANGELOG.md` tracks release history.

## Legacy scraper scripts (`legacy/`)

Three one-off scripts used historically for sourcing patches from the web — not part of the normal conversion workflow (the live monitor is `scripts/check_psxplace.js`):

| Script | Method | Target |
|--------|--------|--------|
| `legacy/scrape_fps_patches.js` | Playwright (headless Chromium) | PSXPlace forum (9 pages), RPCS3 wiki/forums, Reddit |
| `legacy/scrape_flaresolverr.js` | FlareSolverr proxy at `192.168.1.100:8191` | Same sources, bypasses Cloudflare |
| `legacy/scrape_cloudflare.js` | Alternative CF bypass | Supplementary sources |

Output is written to `scraped_fps_patches.txt` and `scraped_rpcs3.txt`. These are the raw source files used to identify PSXPlace patches — grep them for keywords like `"confirmed"`, `"real ps3"`, `"tested"` to find community-verified patches. Their `playwright`/`xlsx` dependencies are no longer in `package.json`.
