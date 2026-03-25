# RPCS3 to Artemis Patches

A collection of RPCS3 game patches converted to Artemis cheat format for use on **real PS3 hardware** (CFW required).

## What is this?

[RPCS3](https://rpcs3.net/) has a large library of patches for PS3 games — FPS unlocks, aspect ratio fixes, graphical tweaks, and more. These patches work on real PS3 hardware too, when loaded through the [Artemis](https://www.psx-place.com/resources/artemis-ps3.522/) cheat manager.

This repository contains:
- **`patch.yml`** — RPCS3 patch database (~800+ patch entries across hundreds of PS3 games)
- **`USERLIST/`** — Pre-converted Artemis `.ncl` cheat files (~2,500 files) ready to drop onto your PS3

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

### Manual Method (Converting from patch.yml)

1. In RPCS3, right-click your game → **Manage Game Patches** → **Show Patch File**
2. Open `patch.yml` in a text editor and find the patch you want (Ctrl+F)
3. Copy the patch bytes (the `be32`/`be16` lines)
4. Open your game's Artemis `.ncl` file via FTP
5. Format the patch as Artemis codes:
   - Remove the `0x` prefix from addresses
   - Remove the `0x` prefix from values
   - Format: `# PatchName\n0\nADDRESS VALUE\n#`
6. Save and transfer back to PS3
7. Enable in Artemis and launch game

### Video Tutorials

- *RPCS3 60FPS Patches on Real PS3 Console Tutorial* — included as `.txt` transcript
- *Using RPCS3 patches on real PS3 using Artemis Cheats* — included as `.txt` transcript

## Patch Types

| Type | Description |
|------|-------------|
| FPS Unlock | Remove 30fps cap, target 60fps |
| Aspect Ratio | 21:9, 32:9 ultrawide support |
| Skip Intros | Skip logo/intro videos |
| Graphical | Shadow removal, resolution tweaks |
| Gameplay | Various gameplay modifications |

## Supported Games

The `patch.yml` contains patches for 800+ PPU hashes covering games like:
- Demon's Souls
- Kingdom Hearts HD 1.5 / 2.5 ReMix
- And many more — see `patch.yml` for the full list

The `USERLIST/` contains ~2,500 Artemis cheat files covering a wide range of PS3 titles.

## Credits

- **RPCS3 Team** and community — original patch authors (Gibbed, Whatcookie, and many others)
- **Artemis PS3** — cheat manager for PS3 CFW
- **webMAN MOD** — FTP and FPS counter support

## Disclaimer

This is for use with legally obtained PS3 games and CFW consoles only. All patches are for single-player use. Online play with cheats active may result in a ban.
