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

## File formats

### patch.yml (RPCS3 format)
Non-standard YAML — the file has **multiple `Anchors:` sections** scattered throughout, which breaks standard YAML parsers (`js-yaml` cannot load it). The custom line-by-line parser in `convert.js` handles this.

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

**Duplicate prevention:** Before writing, the converter checks for lines ending in `(RPCS3)` in the existing file content. If a patch name already exists (case-insensitive), it's skipped.

**FPS patch detection (`isFpsPatch`):** Exact match against a known set (`60 fps`, `unlock fps`, etc.) plus prefix match for variants like `Unlock FPS (No User Input)`.

## USERLIST file naming convention

Files in `USERLIST/` (and `USERLIST_RISKY/`) follow loose naming patterns:
- `Game Title TITLEID VV.VV.ncl` — single region + version
- `Game Title TITLEID1 TITLEID2 VV.VV.ncl` — multiple regions in one file
- `Game Title TITLEID v01.00 av01.01.ncl` — "v" = disc version, "av" = app version

Title ID matching is done by substring: any `.ncl` filename containing the Title ID string (e.g. `BLUS30443`) is treated as a match.
