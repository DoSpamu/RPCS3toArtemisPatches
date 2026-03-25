# Changelog

All notable changes to this project will be documented here.

## [Unreleased]

## [1.2.0] — 2026-03-25

### Added
- `USERLIST_RISKY/` — copy of USERLIST with 88 additional version-mismatched patches included
  - Total: 354 `.ncl` files with 385 RPCS3 patch entries (297 safe + 88 risky)
  - Risky patches are labeled with their target version, e.g. `Unlock FPS v01.04 (RPCS3)`
  - `USERLIST_RISKY/README_RISKY.txt` — explains risks, how to identify risky patches, and what to do if a patch fails
- `--risky` flag for `convert.js` — skips version check and writes to `USERLIST_RISKY/`
- `conversion_report_risky.json` — audit log for the risky run

## [1.1.0] — 2026-03-25

### Added
- Automated RPCS3→Artemis FPS patch conversion (`convert.js`)
- **297 FPS patch entries** added to **281 `.ncl` files** in USERLIST
  - Patch types converted: `Unlock FPS`, `60 FPS`, `60FPS`, `Unlock Framerate` and variants
  - Each added entry is marked `(RPCS3)` in the cheat name, with author `RPCS3`
  - Resolved YAML anchors (multi-line delta-time patches fully inlined)
  - `be32` → `0 ADDR VVVVVVVV`, `be16` → `0 ADDR VVVV`, `bef32` float → IEEE 754 hex
- `conversion_report.json` — full audit log of what was added/skipped/not found
- Sample games with converted patches: Demon's Souls, Kingdom Hearts 1.5/2.5, Drakengard 3, Uncharted 2/3, Army of Two, Anarchy Reigns, Ratchet & Clank, 3D Dot Game Heroes, and 270+ more

### Skipped (documented in conversion_report.json)
- **203 version mismatches** — .ncl file version ≠ patch version (correct: prevents wrong addresses)
- **375 unique Title IDs** with no matching .ncl file in USERLIST
- **`bef64` / `byte`** type lines — not representable in standard Artemis format

## [1.0.0] — 2026-03-25

### Added
- Initial release
- `patch.yml` — RPCS3 patch database with 800+ patch entries
- `USERLIST/` — ~2,500 Artemis `.ncl` cheat files for real PS3 hardware
- `README.md` with setup instructions and tutorial links
- Tutorial transcripts: *RPCS3 60FPS Patches on Real PS3* and *Using RPCS3 patches on real PS3 using Artemis*
