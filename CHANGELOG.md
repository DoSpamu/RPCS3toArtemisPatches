# Changelog

All notable changes to this project will be documented here.

## [Unreleased]

### Added (documentation & monitor hardening — 2026-07)
- **`EBOOT_PATCHES.md`** — index of Nascar1243's pre-patched EBOOT / update-PKG collection (70 games) with install instructions; binaries stay on MEGA, repo holds only the index
- **`MAPI_PATCHES.md`** — rewritten from Nascar1243's July 2026 "FPS Unlocking Updated" document: ~74 games (up from ~35). Lost Planet 3 and Silent Hill Downpour addresses replaced with the verified multi-address versions
- **USERLIST sync** — the monitor now also prepends confirmed patches to matching existing `USERLIST/` files (`findUserlistFiles`), not just `PSXPlace Confirmed/`; new files are still created only in `PSXPlace Confirmed/`
- **`.gitattributes`** — normalizes source/doc line endings to LF; `.ncl` files left byte-for-byte intact (mixed CRLF/LF by design)

### Fixed (scripts/check_psxplace.js)
- **Reply posts no longer overwrite existing patches** — `prependToNcl` gained an `allowUpdate` flag: only first-post catalog edits (Joey85, the source of truth) correct existing blocks in place; reply posts that conflict are reported for manual review instead of silently replacing verified codes
- **Same-name catalog entries disambiguated** — collections like Prince of Persia Trilogy (one "Unlock FPS" per sub-game under one TID) are prefixed with the sub-game name (`disambiguateEntries`) so they stop overwriting each other
- **Fail-loud monitoring** — distinct exit codes (2 = Cloudflare block, 3 = empty scrape / layout change, 1 = crash); the workflow now fails the run on scraper error so it alerts by email instead of going silently green
- **`update_readme.js`** — normalizes CRLF before locating the section terminator (previously failed on Windows checkouts)

### Fixed (repo cleanup)
- Renamed `.ncl` files that were missing their Title ID (`Lost Dimension`, `Destroy All Humans! Path Of The Furon`) so the README table and monitor matching pick them up; fixed `Bereau` → `Bureau` typo
- Fixed 24 `USERLIST/` filenames with double-encoded (mojibake) accented characters
- `package.json` license corrected `ISC` → `MIT` (matches LICENSE), author/keywords filled, version bumped to 1.1.0

### Added (PSXPlace auto-monitor — 2026-05-22)
New patches auto-detected from thread #49905 (Joey85 first-post edits), committed directly to `PSXPlace Confirmed/`:
- `Alien Rage NPEB01088 01.00` — new file
- `Condemned 2 Bloodshot BLUS30115 01.01` — new file
- `Dead Space BLES00308 01.00` — new file
- `Folklore BCES00050 01.10` — new file
- `Metal Gear Solid 4 BLES00246 02.00` — new file
- `Need for Speed Rivals BLUS31201 01.03` — new file
- `Resident Evil Revelations BLES01773 01.01` — new file
- `Silent Hill Homecoming BLES00460 01.00` — new file
- `Skyrim BLUS31202 01.00` — new file (PSXPlace Confirmed variant)
- `The Last of Us BCES01585 01.11` — new file
- `STRANGLEHOLD BLES00144 01.20` — new file
- `Destroy All Humans! Path of the Furon BLES00467` — entry added (name-match fallback, no TID in filename)
- `Prototype 2 BLES01532 BLUS30756 01.00` — entry added

### Added (PSXPlace auto-monitor — 2026-06-05)
New patches auto-detected from thread #49905 (Joey85 first-post edits):
- `FINAL FANTASY XIII MRTC00003 01.00` — new file
- `MotorStorm BCES00006 01.00` — new file
- `Resistance 2 BCES00226 01.60` — new file
- `The Evil Within BLES01916 01.05` — new file
- `The Godfather II BLES00477 01.01` — new file
- `WET BLES00707 01.00` — new file
- `Prototype 2 BLES01532 BLUS30756 01.00` — additional entry added

### Fixed (scripts/check_psxplace.js)
- **MRTC TID format** — added `MRTC[0-9]{5}` to `TITLE_ID_RE` regex; previously Lost Planet 2 (`MRTC00002`) and Mindjack (`MRTC00014`) TIDs were not matched
- **Name-based file fallback** — `findPsxplaceFiles` now falls back to game-name prefix match when no file has the TID in its filename (e.g. `Destroy All Humans! Path Of The Furon.ncl`)
- **parseFirstPost** — corrected cheat name extraction (tab-split last segment) and TID detection from name lines
- **Author field** — corrected `RPCS3_illusion` → `illusion` in The Last of Us BCES01585 NCL
- **Duplicate entry** — removed duplicate `UnlockFPS` entry in `Prototype 2 BLES01532 BLUS30756 01.00`
- **Bootstrap guard** — `first_post_hash` is no longer written on the first-ever run (bootstrap), preventing false "first post changed" detection on the next run

### Added (scripts/check_psxplace.js)
- **First-post edit tracking** — monitor now detects when Joey85 edits the catalog post (SHA-256 hash comparison). When a change is detected, all NCL blocks in the first post are re-parsed and new/updated entries are written to `PSXPlace Confirmed/`

### Changed
- **GitHub Actions** — Node.js runner upgraded from 20 to 22 LTS (`actions/setup-node`); Node 20 is deprecated in GitHub Actions from June 16 2026
- **GitHub Actions** — workflow now commits new patches directly to `master` instead of creating a PR on `auto/psxplace-monitor`; `pull-requests: write` permission removed

## [1.2] — 2026-05-21

### Fixed (community feedback / Nascar1243 real-hardware testing)
- **Deadpool BLES01789 BLUS31146** — removed problematic address `007B2238` (caused 30↔60 FPS oscillation per Nascar1243). Kept the working 7-address patch.
- **Lollipop Chainsaw PE BLUS30917 + BLES01525 BLUS30917** — prepended confirmed PSXPlace patch (`008F8908 28030001` by Nascar1243). Previous RPCS3-only entry had wrong addresses for real PS3. Max 58 FPS (UE3 engine cap).
- **Ratchet & Clank: Into the Nexus BCUS99245** (both `01.00` and `v01.00 av01.00` files) — prepended confirmed Nascar1243 patch (`0069A550 38A00001`). Single-address version works; EU file BCES01908 already had correct 2-address Joey85 patch.
- **Killer Is Dead BCAS20292** — removed duplicate PSXPlace entry that had identical addresses to the existing `(RPCS3) [Tested]` entry.
- **Killzone 3 BCES01007 BCUS98234** — removed redundant `Debug Menu (RPCS3)` entry (duplicated by `Debug Options [Tested]` from dron_3 with same addresses).
- **MAPI_PATCHES.md** — fixed bad Title ID `BLUS03702` (was a 5-digit typo) on GTA IV entry.
- **MAPI_PATCHES.md** — corrected Resistance 3 Title ID from `BLUS98176` to `BCUS98176` (Sony-format US disc).
- **MAPI_PATCHES.md** — corrected Fallout: New Vegas entry name (BLUS30888 is base game, not Ultimate Edition).
- **MAPI_PATCHES.md** — Orange Box: added Title IDs `BLUS30055 / BLES00153` and warning that HL2 Episodes don't work for all users.

### Changed
- **COMMUNITY_TESTED.md** + **README.md** — combined split EU/US rows for games where one entry covers both regions: Brutal Legend, Dead Space 2, Haze, Lollipop Chainsaw, Mirror's Edge.
- **COMMUNITY_TESTED.md** — removed Title IDs that have no matching `.ncl` file in the repo (Dead Space 2 `BLUS30717`, Mirror's Edge `BLUS30179`) to avoid misleading users.
- **README.md** — added "Start here" decision table at the top so new users can quickly pick the right method (Working Patches folder / PSXPlace folder / USERLIST / MAPI / file-based).
- **CLAUDE.md** — updated folder structure documentation to reflect current state (removed stale `archive/` references, updated USERLIST count to 2,542, added `Working Artemis Patches/` and `PSXPlace Confirmed/` folders).
- **SKIPPED_PATCHES.md** — replaced stale `USERLIST_RISKY/` references with the current `--risky` flag workflow.

### Added
- **Nascar1243/PS3-FPS-Patches** added as an official source in README, COMMUNITY_TESTED, and CHANGELOG — 3 weeks of real-hardware testing, simplified working addresses for games where Joey85's research had extra unnecessary addresses.
- **COMMUNITY_TESTED.md** — File-Based table: added Title IDs and versions for all entries that had them (Condemned 2 BLUS30115, Crysis 2 BLUS30631, Crysis 3 BLES01649, F.E.A.R. 2 BLES00464, Syndicate BLUS30804, BBC1 v1.20, BBC2 v1.05).
- Per-game notes in COMMUNITY_TESTED for engine quirks (Bulletstorm/Lollipop Chainsaw max 58-62 FPS due to UE3 cap; R&C All 4 One requires main-menu application).

## [1.1] — 2026-05-20

### Added
- **PSXPlace thread #49905 — Joey85 patches (62 games, all confirmed on real PS3)**
  - Source: https://www.psx-place.com/threads/60-unlock-fps-patches.49905/
  - Joey85 reverse-engineered these patches using Ghidra; all tested personally on real PS3 hardware
  - **16 new `.ncl` files** created for games with no prior USERLIST entry:
    - `Alpha Protocol BLUS30341 01.00` — US version
    - `Brutal Legend BLES00562 01.02` — 32 addresses
    - `Deus Ex Human Revolution Directors Cut BLUS31317 01.00`
    - `James Camerons Avatar The Game BLUS30374 01.00`
    - `Mindjack MRTC00014 01.01`
    - `Mirrors Edge BLES00322 01.01` — No OC required
    - `Saw BLES00676 01.00`
    - `Saw 2 BLES01050 01.00`
    - `Sleeping Dogs BLUS30927 01.04` — apply before loading game
    - `Prince Of Persia Trilogy 3D BLUS30754 01.00` — 2 patches: Two Thrones + Warrior Within
    - `Warhammer 40000 Space Marine BLES01347 01.05`
    - `Wheelman BLUS30262 01.01`
    - `Dead Space 2 BLES01040 01.02`
    - `Duke Nukem Forever BLES01147 01.03` — No OC required
    - `Enslaved Odyssey To The West BLES00989 01.01`
    - `Homefront BLES00962 01.04`
  - **29 existing `.ncl` files updated** — Joey's `(PSXPlace)` entry prepended, unconfirmed `(RPCS3)` FPS entries removed:
    - Aliens Colonial Marines, Asura's Wrath, Batman Arkham Asylum/City, Bulletstorm, Castle of Illusion, Dead Space 3, Deadpool, Fallout 3 GOTY, Haze, I Am Alive, Killzone 2, Lollipop Chainsaw, Prototype 2, R&C All 4 One, R&C Nexus, RE1 HD Remaster, RE6 (av01.06), RE Revelations 2 (av01.04), RE Darkside Chronicles, RE Umbrella Chronicles, Remember Me, Shadows of the Damned, Siren Blood Curse, Splinter Cell Blacklist, The Bureau XCOM, Transformers WfC, Alice Madness Returns BLUS30607, Sleeping Dogs, Warhammer Space Marine
  - R&C All 4 One + Nexus: replaced unsafe `be16` RPCS3 patches with Joey's `be32` patches
  - Deadpool + Shadows of the Damned: Joey's patches are expanded versions (more addresses)
  - Killzone 2: `Debug Menu (RPCS3)` removed; `Unlock FPS (PSXPlace)` added; all `[Tested]` entries preserved
- **`COMMUNITY_TESTED.md`** — new section "✅ Confirmed on Real PS3 Hardware — Joey85 (PSXPlace Thread #49905)" with full 62-game table
- **`COMMUNITY_TESTED.md`** — File-Based section: added Battlefield Bad Company 2 (BLES00779 v1.05, same Nexus Mods patch as BBC1, confirmed by Joey85)
- **`README.md`** — added PSXPlace thread #49905 as a source; updated patch file count to 2,542

## [1.0] — 2026-03-29

### Changed
- **Single USERLIST folder** — merged `USERLIST/`, `USERLIST_RISKY/`, and `USERLIST_TESTED/` into one `USERLIST/` (2,526 files)
  - Version-mismatched patches from the former `USERLIST_RISKY/` are now included directly, labeled `v01.XX (RPCS3)` in the cheat name
  - Patches confirmed on real PS3 hardware (formerly `USERLIST_TESTED/`) are now marked `[Tested]` in the cheat name — 277 entries across 32 games
  - 74 files gained additional risky-mode entries from the merge
- `README.md`, `CLAUDE.md`, `COMMUNITY_TESTED.md` — updated throughout to reflect single-folder structure and new label conventions

### Archived
- `archive/USERLIST_OLD/` — pre-merge USERLIST snapshot
- `archive/USERLIST_RISKY/` — superseded by inline `v01.XX` labels
- `archive/USERLIST_TESTED/` — superseded by inline `[Tested]` labels
- `archive/PATCHED_GAMES.md` — stale list; use `conversion_report.json` for machine-readable equivalent
- `archive/patch_new.yml`, `archive/gh_*.json`, `archive/scraped_*.txt`, `archive/bucanero_codes.json` — research/source artifacts

## [0.4] — 2026-03-28

### Added
- **32 new `.ncl` files** — missing USERLIST entries whose patches existed in `patch.yml` but had no file, plus new regions sourced from PSXPlace scraping:
  - `Alice Madness Returns BLES01265 01.00` + `NPEB00625 01.00` — EU disc + EU PSN (FlexBy/PSXPlace)
  - `Alien Rage NPEB01088 01.00` — EU PSN
  - `Borderlands 2 BLUS30982 BLES01684 NPUB30898 01.15` + `NPEB01144 01.00` — multi-TID + EU PSN
  - `Bulletstorm NPEB00622 01.00` — EU PSN
  - `Grand Theft Auto IV NPEB00882 01.09` — EU PSN (Zolika1351/illusion, confirmed PSXPlace)
  - `Hatsune Miku Project Diva F 2nd NPEB02013 01.00` — EU PSN, confirmed on real PS3 HW (Brolijah)
  - `Kamen Rider Battride War II BLJS10262 01.00` + `BLJS10263 01.00` (Premium Edition)
  - `Kamen Rider Battride War Genesis BLJS10319 NPJB00758 01.00` + `01.04`
  - `Kamen Rider Battride War Genesis Memorial BLJS10324 01.00` + `01.04`
  - `Lost Dimension BLES02197 BLUS31554 BLJM61166 01.02` — EU/US/JP v1.02, **confirmed on stock PS3** (FlexBy/PSXPlace)
  - `Lucha Libre AAA BLUS30640 01.00` + `01.01`
  - `Papo & Yo NPEB01109 01.00` — EU PSN
  - `Warp NPEB00636 01.00` + `NPUB30543 01.00` — EU/US PSN
  - `WRC Powerslide NPEB01324 01.01` — EU PSN (Jao)
  - `Zeno Clash 2 NPEB01351 01.00` — EU PSN (3-address NOP patch)

- **`COMMUNITY_TESTED.md`** — curated reference document with:
  - ✅ 22 patches confirmed working on real PS3 hardware (CFW + Artemis)
  - 🔵 ~70 RPCS3-sourced patches organized by genre (Action, FPS, RPG, Racing, Horror)
  - ⚠️ Known issues section (GTA V freezes, R&C untested, version mismatches)
  - Contributing guide for community test reports

### Changed
- `PATCHED_GAMES.md` — regenerated; now lists **310 files / 326 RPCS3 entries** (up from 281/297)
- `SKIPPED_PATCHES.md` — regenerated; now reflects **450 unmatched Title IDs** (previously 375)
- `README.md` — updated stats throughout; added COMMUNITY_TESTED.md reference and PSXPlace section expanded

## [0.3] — 2026-03-27

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

## [0.2] — 2026-03-25

### Added
- `USERLIST_RISKY/` — copy of USERLIST with 88 additional version-mismatched patches included
  - Total: 354 `.ncl` files with 385 RPCS3 patch entries (297 safe + 88 risky)
  - Risky patches are labeled with their target version, e.g. `Unlock FPS v01.04 (RPCS3)`
  - `USERLIST_RISKY/README_RISKY.txt` — explains risks, how to identify risky patches, and what to do if a patch fails
- `--risky` flag for `convert.js` — skips version check and writes to `USERLIST_RISKY/`
- `conversion_report_risky.json` — audit log for the risky run

## [0.1] — 2026-03-25

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

## [0.0] — 2026-03-25

### Added
- Initial release
- `patch.yml` — RPCS3 patch database with 800+ patch entries
- `USERLIST/` — ~2,500 Artemis `.ncl` cheat files for real PS3 hardware
- `README.md` with setup instructions and tutorial links
- Tutorial transcripts: *RPCS3 60FPS Patches on Real PS3* and *Using RPCS3 patches on real PS3 using Artemis*
