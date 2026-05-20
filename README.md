<p align="center">
  <img src="banner.svg" alt="PS3 FPS Unlock Patches" width="100%"/>
</p>

# PS3 FPS Unlock Patches — Artemis & MAPI

![Confirmed Games](https://img.shields.io/badge/confirmed_games-39-brightgreen)
![Patch Files](https://img.shields.io/badge/patch_files-2%2C542-blue)
![Platform](https://img.shields.io/badge/platform-PS3_CFW-lightgrey)
![License](https://img.shields.io/badge/license-MIT-yellow)

FPS unlock patches for **real PS3 hardware** (CFW + Artemis required).  
Sourced from the RPCS3 emulator patch database and the PSXPlace community.

---

## Downloads

The latest release (`v1.1`) has one zip with two folders:

| Folder in zip | Contents | Use when |
|---------------|----------|----------|
| **`Working Artemis Patches/`** | 39 games — 100% confirmed on real PS3 | Your game is in the list below |
| **`PSXPlace Confirmed/`** | 62 games — confirmed by Joey85 + community on real PS3 | Your game isn't in the first folder |

**[→ Download v1.1](https://github.com/DoSpamu/RPCS3toArtemisPatches/releases/tag/v1.1)**

If your game isn't in either folder, the full **`USERLIST/`** (2,542 files) is available by cloning or downloading the repository. Those files are RPCS3 conversions — not all hardware-verified.

> [!TIP]
> **Some games don't need Artemis at all.** Crysis, Condemned 2, F.E.A.R. 2, Shadow of Mordor, Battlefield Bad Company 1/2 and others let you set the FPS cap via a config file. See the **File-Based FPS Unlocks** section in [`COMMUNITY_TESTED.md`](COMMUNITY_TESTED.md).

---

## How to use (Artemis method)

**Requirements:**
- PS3 with **Custom Firmware** (HEN, Rebug, etc.)
- [**Artemis PS3 R5**](https://www.psx-place.com/resources/artemis-ps3.522/) — R5 recommended, R6 may have issues
- [**webMAN MOD**](https://github.com/aldostools/webMAN-MOD) — for FTP access

**Steps:**
1. Connect to your PS3 via FTP
2. Navigate to `hdd0/game/ARTZ00001/USRDIR/USERLIST/`
3. Copy the `.ncl` file for your game from the zip
4. Open Artemis, find your game, enable the FPS patch
5. Launch the game, then press **PS + Start** to attach cheats

---

## How to use (PS3MAPI method — no file transfer needed)

Apply patches live via webMAN MOD's browser interface without Artemis. See [`MAPI_PATCHES.md`](MAPI_PATCHES.md) for the full address list and instructions.

---

## Confirmed Working Games (39 games)

These files are in `Working Artemis Patches/` and are verified working on real PS3 hardware:

| Game | Title ID | Version |
|------|----------|---------|
| Destroy All Humans! Path of the Furon | BLES00467 | — |
| Dragon Ball Z: Burst Limit | BLUS30117 | v01.00 |
| Drakengard 3 | BLUS31197 | 01.01 |
| Fallout 3 | BLUS30185 | 01.61 |
| Fallout: New Vegas Ultimate Edition | BLES01475 | 01.00 |
| Final Fantasy XIII | MRTC00003 | v01.00 |
| Folklore | BCAS20013 / BCES00050 / BCUS98147 | 01.00 |
| God of War: Ascension | BCUS98232 | v01.00 av01.12 |
| Grand Theft Auto IV | BLUS30127 | v01.00 av01.08 |
| Hatsune Miku: Project DIVA F | BLUS31319 | 01.00 |
| Hatsune Miku: Project DIVA F 2nd | BLUS31431 | 01.00 |
| Just Cause 2 | BLES00517 / BLUS30400 | 01.02 |
| Kingdom Hearts HD 1.5 ReMIX | BLUS31212 | 01.00 |
| Kingdom Hearts HD 2.5 ReMIX | BLUS31460 | 01.00 |
| Kingdoms of Amalur: Reckoning | BLUS30710 | v01.02 |
| Lost Dimension | BLUS31554 | v01.00 |
| Lost Planet 2 | MRTC00002 | v01.02 |
| Lost Planet 3 | BLUS31020 | v01.02 |
| Metal Gear Solid 4: Guns of the Patriots | BLUS30109 | — |
| MotorStorm | BCUS98137 | v01.00 |
| Need for Speed: Rivals | BLUS31201 | 01.03 |
| Pirates of the Caribbean: At World's End | BLUS30029 | v01.00 |
| Resident Evil 5 | BLUS30270 | v02.00 |
| Resistance 2 | BLUS98120 | 01.60 |
| Resistance 3 | BCUS98176 | 01.05 |
| Shadow of the Colossus (HD) | BCES01097 | 01.01 |
| Shadow of the Colossus (HD) | BCES01097 / BCES01115 / BCUS98259 / NPEA00280 | v01.00 av01.01 |
| Silent Hill: Downpour | BLUS30565 | 01.01 |
| Silent Hill: Homecoming | BLUS30169 | 01.00 |
| Skate 2 | BLUS30253 | v01.02 |
| Skate 3 | BLUS30464 | v01.05 |
| The Elder Scrolls IV: Oblivion GOTY | BLUS30087 | 01.00 |
| The Elder Scrolls V: Skyrim | BLUS30778 | v01.00 |
| The Elder Scrolls V: Skyrim Legendary Edition | BLUS31202 | 01.00 |
| The Last of Us | BCUS98174 / BCES01584 / BCES01585 / BCAS20270 | v01.11 |
| Tony Hawk's Project 8 | BLUS30011 | v01.00 |
| Tony Hawk's Proving Ground | BLUS30071 | v01.00 |
| Uncharted: Drake's Fortune | BCES00065 / BCUS98103 | 01.10 |
| Uncharted 2: Among Thieves | BCUS98213 | 01.09 |

For more confirmed games (EU/JP regions, PSXPlace community) see [`COMMUNITY_TESTED.md`](COMMUNITY_TESTED.md).

---

## About `USERLIST/` (2,542 files)

The full patch database. Sources:
- RPCS3 patch.yml (auto-converted by `convert.js`)
- PSXPlace community patches — including 62 games confirmed by Joey85 on real PS3 hardware
- Upstream [ArtemisPS3](https://github.com/bucanero/ArtemisPS3) USERLIST

**Not all patches are guaranteed to work on real hardware.** Use the label in the cheat name to judge:

| Label in cheat name | Meaning |
|---------------------|---------|
| `[Tested]` | Confirmed working on real PS3 |
| `(PSXPlace)` | Written for real hardware by community (FlexBy, Joey85, vFxMz, etc.) |
| `(RPCS3)` | Converted from RPCS3 patch.yml — not all HW-verified |
| `v01.XX (RPCS3)` | Version mismatch — test carefully, may crash |

---

## Known crashes / do not use

| Game | Issue |
|------|-------|
| Grand Theft Auto V | Freezes on real PS3 — do not use |
| MGS3 HD "50 FPS" patch | Reduces FPS from native 60 — not useful |
| JoJo's Bizarre Adventure: All Star Battle | Requires 120Hz Vblank — not possible on real PS3 |

---

## Where does patch data come from?

- [RPCS3 patch.yml](https://github.com/RPCS3/rpcs3/blob/master/bin/patch.yml) — official RPCS3 patch database
- [PSXPlace FPS patches thread #49905](https://www.psx-place.com/threads/60-unlock-fps-patches.49905/) — 62 games confirmed by Joey85 (Ghidra reverse engineering, tested on real PS3)
- [PSXPlace game patches thread #43706](https://www.psx-place.com/threads/game-patches.43706/) — community real-hardware patches (FlexBy, vFxMz, illusion, etc.)
- [PS3 Codes spreadsheet](https://docs.google.com/spreadsheets/d/1dvcFTU5xKt9ASbjlhaSD1zN1ONQPCFnmJNKMU5hGGNM/) — community test results
- [bucanero/ArtemisPS3](https://github.com/bucanero/ArtemisPS3) — upstream USERLIST source

`convert.js` automates format conversion from RPCS3 YAML to Artemis `.ncl` text format.

---

## Requirements

- PS3 with Custom Firmware (HEN / Rebug / etc.)
- Artemis PS3 R5
- webMAN MOD (for FTP + FPS counter overlay)
- FTP client (FileZilla, etc.)

---

## Disclaimer

For use with legally obtained PS3 games and CFW consoles only. All patches are for single-player use. Using cheats online may result in a ban.
