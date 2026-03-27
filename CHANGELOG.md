# Changelog

All notable changes to this project will be documented here.

## [Unreleased]

## [1.3.0] — 2026-03-27

### Added
- **PSXPlace community patches** — manually sourced from [psx-place.com/threads/game-patches.43706](https://www.psx-place.com/threads/game-patches.43706/) (9 pages, 170 posts) and the community PS3 Codes spreadsheet
  - All entries labeled `(PSXPlace)` in the cheat name to distinguish from RPCS3 patches
  - 9 new `.ncl` files created for games/regions not previously in USERLIST
  - 12 existing `.ncl` files updated with additional patch entries
  - 22 total new entries added

**New files:**
- `Castle Crashers NPEB00293` — 60 FPS (FlexBy, confirmed working on real HW)
- `Dragon Ball Z Burst Limit BLES00231` — 60 FPS (illusion, `be32` lines only; `byte` type skipped)
- `Dragon Ball Z Burst Limit BLUS30117` — 60 FPS (illusion, `be32` lines only)
- `Fallout New Vegas Ultimate Edition BLUS30888` — Unlock FPS (FlexBy; US version, only BLES01475 existed before)
- `Harry Potter And The Order Of The Phoenix BLES00070` — 60 FPS (NunoRS2000, confirmed on PS3 and RPCS3)
- `Just Cause 2 NPUB30606` — Unlock FPS (illusion, PSN version; separate from existing BLES/BLUS file)
- `Killer Is Dead BCAS20292` — Unlock FPS (Asian version; separate from BLJS/BLUS file)

**Modified files (new entries added):**
- `Batman Arkham Origins BLUS31147` — Debug Menu (tested on v1.60)
- `Borderlands 2 BLES01684` — Unlock FPS (FlexBy, tested v1.15)
- `Destroy All Humans! Path Of The Furon` — Unlock FPS (Whatcookie)
- `GTA IV Complete Edition BLES01128` — Unlock FPS
- `Killzone 2 BCES00081 v1.29` — Extended FOV (vFxMz: `0x00EC096C 3F266666`)
- `Killzone 3 BCES01007 v1.14` — Extended FOV (vFxMz: two addresses)
- `Lost Dimension v1.01` — 60 FPS (FlexBy, BLJM61166 v1.00 addresses)
- `Lost Planet 2 MRTC00002` — Unlock FPS (tested on v1.02; file is v1.01)
- `Resident Evil 5 Gold BLES00816` — Unlock FPS with alternate addresses (different from RPCS3 entry)
- `Resistance 3 BCES01118` — Unlock FPS with alternate addresses (different from RPCS3 entry)
- `Sonic Unleashed BLUS30244` — Disable Shadows, Motion Blur, Depth of Field, Reflection (illusion; confirmed improved FPS on real HW by Mitsu)
- `The Orange Box BLUS30055` — Unlock FPS alternate address (`0xC477F4` vs RPCS3's `0xC471C4`)

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
