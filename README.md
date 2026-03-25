# RPCS3 to Artemis Patches

A collection of RPCS3 game patches converted to Artemis cheat format for use on **real PS3 hardware** (CFW required).

## What is this?

[RPCS3](https://rpcs3.net/) has a large library of patches for PS3 games — FPS unlocks, aspect ratio fixes, graphical tweaks, and more. These patches work on real PS3 hardware too, when loaded through the [Artemis](https://www.psx-place.com/resources/artemis-ps3.522/) cheat manager.

This repository contains:
- **`patch.yml`** — RPCS3 patch database (800+ patch entries across hundreds of PS3 games)
- **`USERLIST/`** — ~2,500 Artemis `.ncl` cheat files ready to copy onto your PS3, with RPCS3 FPS patches already embedded

## RPCS3 FPS patches — conversion status

The `USERLIST/` files have been automatically updated with FPS patches from `patch.yml`:

| Stat | Value |
|------|-------|
| Games with FPS patches added | **156 unique games** |
| NCL files modified | **281 files** |
| Patch entries added | **297 entries** |

Every added entry is named `Patch Name (RPCS3)` with author `RPCS3` so it's easy to identify.

- Full list of patched games: [PATCHED_GAMES.md](PATCHED_GAMES.md)
- Explanation of what was skipped and why: [SKIPPED_PATCHES.md](SKIPPED_PATCHES.md)

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

### Regenerating patches (after updating patch.yml)

```bash
node convert.js
```

This re-reads `patch.yml`, matches patches to `.ncl` files by Title ID and game version, and appends any new entries. Already-converted patches are detected and skipped automatically. Results are logged to `conversion_report.json`.

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
| `bef32` | `0 ADDR VVVVVVVV` | Float converted to IEEE 754 hex |
| `load *anchor` | Inlined | Multi-line patches resolved from anchors |
| `bef64`, `byte` | Skipped | No standard Artemis equivalent |

## Credits

- **RPCS3 Team** and community — original patch authors (Gibbed, Whatcookie, and many others)
- **Artemis PS3** — cheat manager for PS3 CFW
- **webMAN MOD** — FTP and FPS counter support

## Disclaimer

For use with legally obtained PS3 games and CFW consoles only. All patches are for single-player use. Online play with cheats active may result in a ban.
