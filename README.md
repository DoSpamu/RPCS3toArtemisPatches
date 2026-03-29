# RPCS3 to Artemis Patches

A collection of FPS unlock patches for **real PS3 hardware** (CFW + Artemis required), sourced from the RPCS3 emulator patch database and the PSXPlace community forum.

---

## Where did this come from?

The idea that RPCS3 patches can work on real PS3 hardware is not new — it has been discussed and demonstrated by the community for years. This project is a direct follow-up to these tutorials:

- [RPCS3 60FPS Patches on Real PS3 Console Tutorial](https://www.youtube.com/watch?v=y6tdIXyJDXI)
- [Using RPCS3 patches on real PS3 using Artemis Cheats](https://www.youtube.com/watch?v=YGnGqlTuMK8)

The process shown in those videos is done manually. This project automates it with a script.

---

## What is the point of this project?

RPCS3 has a large, well-maintained patch database (`patch.yml`) with hundreds of FPS unlocks for PS3 games. These patches write directly to Cell CPU memory — the same physical hardware that is inside every PS3 console. In theory, the same memory addresses apply to real hardware.

The problem: RPCS3 uses its own YAML format, while real PS3 cheat managers like Artemis use `.ncl` text files. **This repo bridges that gap.**

`convert.js` (written with AI assistance) reads `patch.yml` and automatically converts every FPS-related patch into Artemis format, then inserts it into the correct `.ncl` file from the existing Artemis USERLIST.

> **Important:** Not every RPCS3 patch will work on real hardware. Some patches target emulator-specific behavior (vblank timing, etc.) that does not apply to a physical PS3. Patches that are confirmed working on real hardware are listed in [COMMUNITY_TESTED.md](COMMUNITY_TESTED.md).

---

## Where does the patch data come from?

This project does **not** invent patches. All patch data is sourced from:

### 1. RPCS3 official patch database
**Source:** [github.com/RPCS3/rpcs3 — patch.yml](https://github.com/RPCS3/rpcs3/blob/master/bin/patch.yml)

The official RPCS3 patch file, maintained by the RPCS3 community. Contains 800+ entries across hundreds of games. Patches converted from here are labeled `(RPCS3)` in the cheat name.

### 2. PSXPlace game patches forum
**Source:** [psx-place.com — Game Patches thread](https://www.psx-place.com/threads/game-patches.43706/)

A long-running community thread where PS3 modders share patches they have written and tested on real hardware. Patches sourced from here are labeled `(PSXPlace)` in the cheat name.

### 3. PS3 Codes community spreadsheet
**Source:** [PS3 Codes Google Spreadsheet](https://docs.google.com/spreadsheets/d/1dvcFTU5xKt9ASbjlhaSD1zN1ONQPCFnmJNKMU5hGGNM/)

A community-maintained spreadsheet listing patches with a "Works" column indicating real hardware test results. Used to verify which patches are confirmed working.

### 4. Base USERLIST files
**Source:** [bucanero/ArtemisPS3](https://github.com/bucanero/ArtemisPS3)

The ~2,500 `.ncl` files in `USERLIST/` come from the upstream ArtemisPS3 repository. RPCS3 and PSXPlace patches are prepended to these existing files.

---

## What did the script actually do?

`convert.js` performs a purely mechanical format translation:

| RPCS3 format (`patch.yml`) | Artemis format (`.ncl`) |
|---------------------------|------------------------|
| `- [ be32, 0x00ABCDEF, 0x60000000 ]` | `0 00ABCDEF 60000000` |
| `- [ be16, 0x00ABCDEF, 0x0000 ]` | `0 00ABCDEF 0000` |
| `- [ bef32, 0x00ABCDEF, 60.0 ]` | `0 00ABCDEF 42700000` (IEEE 754) |
| `- [ load, *ANCHOR ]` | inlined from anchor definition |

The script does not write patches. It converts existing ones from one text format to another.

---

## Patch statistics

| Folder | Contents |
|--------|----------|
| `USERLIST/` | ~2,500 `.ncl` files; **310 files** have RPCS3 patches injected (**326 entries**) |
| `USERLIST_RISKY/` | Same as above + **88 extra** version-mismatched patches |
| `USERLIST_TESTED/` | **32 files** — only patches confirmed working on real PS3 hardware |

Full list of patched games: [PATCHED_GAMES.md](PATCHED_GAMES.md)
Games skipped due to no matching `.ncl`: [SKIPPED_PATCHES.md](SKIPPED_PATCHES.md)

---

## Will it work on my PS3?

Maybe. It depends on the game and the patch type.

| Status | Meaning |
|--------|---------|
| `USERLIST_TESTED/` | Confirmed working on real PS3 (sourced from community reports) |
| `USERLIST/` (RPCS3 label) | High confidence — same Cell CPU addresses, but not all verified on HW |
| `USERLIST_RISKY/` | Version mismatch — the patch targets a different game version than your file |

See [COMMUNITY_TESTED.md](COMMUNITY_TESTED.md) for the full breakdown including known issues and games that crash.

---

## Requirements

- PS3 with **Custom Firmware** (HEN, Rebug, etc.)
- [**Artemis PS3 R5**](https://www.psx-place.com/resources/artemis-ps3.522/) — R5 recommended, R6 may have issues
- [**webMAN MOD**](https://github.com/aldostools/webMAN-MOD) — for FTP access and FPS overlay
- FTP client (e.g. FileZilla) to transfer files

---

## How to use

1. Connect to your PS3 via FTP
2. Navigate to `hdd0/game/ARTZ00001/USRDIR/`
3. Copy the `.ncl` file for your game from `USERLIST/` into the PS3's `USERLIST/` folder
4. Open Artemis, find your game, enable the FPS patch
5. Launch the game, then press **PS + Start** to attach cheats

> Want more patches? Use `USERLIST_RISKY/` — 88 additional version-mismatched entries. Read the included README before using.

---

## Regenerating patches

```bash
# Safe mode — version-matched patches only → USERLIST/
node convert.js

# Risky mode — includes version-mismatched patches → USERLIST_RISKY/
node convert.js --risky
```

Both commands are idempotent — already-converted patches are detected and skipped.

---

## Sources

- [RPCS3 patch.yml](https://github.com/RPCS3/rpcs3/blob/master/bin/patch.yml) — official RPCS3 patch database
- [PSXPlace game patches thread](https://www.psx-place.com/threads/game-patches.43706/) — community PS3 patches forum
- [PS3 Codes spreadsheet](https://docs.google.com/spreadsheets/d/1dvcFTU5xKt9ASbjlhaSD1zN1ONQPCFnmJNKMU5hGGNM/) — community real-hardware test results
- [bucanero/ArtemisPS3](https://github.com/bucanero/ArtemisPS3) — upstream USERLIST source
- [Artemis PS3](https://www.psx-place.com/resources/artemis-ps3.522/) — PS3 CFW cheat manager
- [webMAN MOD](https://github.com/aldostools/webMAN-MOD) — FTP + FPS counter

---

## Disclaimer

For use with legally obtained PS3 games and CFW consoles only. All patches are for single-player use. Using cheats online may result in a ban.
