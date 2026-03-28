# RPCS3 to Artemis Patches

A collection of RPCS3 game patches converted to Artemis cheat format for use on **real PS3 hardware** (CFW required).

## What is this?

[RPCS3](https://rpcs3.net/) has a large library of patches for PS3 games — FPS unlocks, aspect ratio fixes, graphical tweaks, and more. These patches work on real PS3 hardware too, when loaded through the [Artemis](https://www.psx-place.com/resources/artemis-ps3.522/) cheat manager.

This repository contains:
- **`patch.yml`** — RPCS3 patch database (800+ patch entries across hundreds of PS3 games)
- **`USERLIST/`** — ~2,500 Artemis `.ncl` cheat files ready to copy onto your PS3, with RPCS3 FPS patches already embedded
- **`USERLIST_RISKY/`** — same as above, but also includes patches where the game version does not exactly match (use at your own risk)

## Patch sources

### RPCS3 patches — automated conversion

Patches from the official RPCS3 patch database are automatically converted by `convert.js` and labeled `(RPCS3)` in the cheat name.

#### USERLIST (safe — version matched)

| Stat | Value |
|------|-------|
| NCL files with RPCS3 patches | **310 files** |
| Total RPCS3 patch entries | **326 entries** |
| Title IDs with no matching .ncl | **450** (listed in SKIPPED_PATCHES.md) |

Full list of patched files: [PATCHED_GAMES.md](PATCHED_GAMES.md)

#### USERLIST_RISKY (version mismatched — use with care)

| Stat | Value |
|------|-------|
| Extra patches (version mismatch) | **88 additional entries** |
| Total patch entries | **~414 entries** |

Risky patches are labeled `Unlock FPS v01.04 (RPCS3)` — the version suffix tells you which game version the patch was written for.
See `USERLIST_RISKY/README_RISKY.txt` for full explanation.

### PSXPlace & community patches — manually sourced

Additional patches sourced from the [PSX-Place game patches forum thread](https://www.psx-place.com/threads/game-patches.43706/), the community PS3 Codes spreadsheet, and further scraping. These are labeled `(PSXPlace)` in the cheat name.

| Stat | Value |
|------|-------|
| New .ncl files created | **29 files** |
| Existing files with added PSXPlace entries | **19 files** |
| Total PSXPlace patch entries | **22 entries** |

**Key contributors:** NunoRS2000, FlexBy, vFxMz, illusion, Mitsu, Whatcookie, Brolijah, Zolika1351

**Highlights:**
- Extended FOV for Killzone 2 (v1.29) and Killzone 3 (v1.14) — vFxMz
- Sonic Unleashed: disable shadows/blur/DoF/reflection — illusion (confirmed on real HW by Mitsu)
- 60 FPS confirmed on real PS3: Harry Potter OotP, Castle Crashers, Lost Dimension (EU/US/JP)
- Hatsune Miku Project Diva F 2nd EU PSN (NPEB02013) — confirmed on real hardware
- New regions: Alice Madness Returns EU PSN, Borderlands 2 EU PSN, GTA IV EU PSN, Fallout NV US, Kamen Rider series (JP), Lucha Libre AAA, Warp EU/US PSN, WRC Powerslide, Zeno Clash 2, Papo & Yo, Alien Rage EU PSN, Bulletstorm EU PSN

> Both `(RPCS3)` and `(PSXPlace)` entries may appear in the same game file. They may target different memory addresses — both can be tried.

### Community-tested patches

See [COMMUNITY_TESTED.md](COMMUNITY_TESTED.md) for a curated list of patches confirmed working on real PS3 hardware, organized by game genre and test status.

## Requirements

- PS3 with **Custom Firmware** (HEN, CFW, etc.)
- [**webMAN MOD**](https://github.com/aldostools/webMAN-MOD) installed
- [**Artemis PS3 R5**](https://www.psx-place.com/resources/artemis-ps3.522/) (R5 recommended — R6 may have issues)
- [**FileZilla**](https://filezilla-project.org/) or any FTP client to transfer files to PS3

## How to Use

### Quick Method (Using Pre-made USERLIST files)

1. Connect to your PS3 via FTP (using FileZilla or similar)
2. Navigate to `hdd0/game/ARTZ00001/USRDIR/` (Artemis install directory)
3. Copy the `.ncl` file for your game from the `USERLIST/` folder into the PS3's `USERLIST/` directory
4. Open Artemis on your PS3, find your game and enable the cheats
5. Launch your game, then press **PS button → Start** to attach cheats

The RPCS3 FPS patches will appear in the cheat list alongside any existing cheats for that game.

> **Want more patches?** Use `USERLIST_RISKY/` instead — it contains 88 additional version-mismatched patches. Read `USERLIST_RISKY/README_RISKY.txt` before using.

### Regenerating patches (after updating patch.yml)

```bash
# Safe mode — only version-matched patches → USERLIST/
node convert.js

# Risky mode — all patches including version mismatches → USERLIST_RISKY/
node convert.js --risky
```

Both commands are idempotent: already-converted patches (marked `(RPCS3)`) are detected and skipped automatically.

### Manual Method (Converting from patch.yml)

1. In RPCS3, right-click your game → **Manage Game Patches** → **Show Patch File**
2. Open `patch.yml` in a text editor and find the patch you want (Ctrl+F)
3. Copy the patch bytes (the `be32`/`be16` lines)
4. Open your game's Artemis `.ncl` file via FTP
5. Format the patch as Artemis codes:
   - Remove the `0x` prefix from addresses
   - `be32` value → 8 hex digits, `be16` value → 4 hex digits
   - Entry format: `Name\n0\nAuthor\nADDRESS VALUE\n#`
6. Save and transfer back to PS3

### Video Tutorials

- *RPCS3 60FPS Patches on Real PS3 Console Tutorial* — included as `.txt` transcript
- *Using RPCS3 patches on real PS3 using Artemis Cheats* — included as `.txt` transcript

## Patch types converted

| RPCS3 type | Converted to | Notes |
|------------|-------------|-------|
| `be32` | `0 ADDR VVVVVVVV` | 32-bit write |
| `be16` | `0 ADDR VVVV` | 16-bit write (4 hex digits) |
| `bef32` | `0 ADDR VVVVVVVV` | Float converted to IEEE 754 big-endian hex |
| `load *anchor` | Inlined | Multi-line patches resolved from YAML anchors |
| `bef64`, `byte` | Skipped | No standard Artemis equivalent |

## Credits

- **RPCS3 Team** and community — original patch authors (FlexBy, Gibbed, Whatcookie, and many others)
- **PSX-Place community** — forum contributors: NunoRS2000, FlexBy, vFxMz, illusion, Mitsu, Whatcookie, Brolijah, Zolika1351, zeWaardt, SharkyBoy, CatalinW, rock77, gmanarte and others
- **bucanero/ArtemisPS3** — upstream USERLIST source
- **Artemis PS3** — cheat manager for PS3 CFW
- **webMAN MOD** — FTP and FPS counter support

## Disclaimer

For use with legally obtained PS3 games and CFW consoles only. All patches are for single-player use. Online play with cheats active may result in a ban.
