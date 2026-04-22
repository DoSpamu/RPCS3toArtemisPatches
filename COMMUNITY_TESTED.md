# Community Tested FPS / Performance Patches

Patches in this repo converted from RPCS3 patch.yml and PSXPlace forum research.
Use on real PS3 with **Custom Firmware + Artemis PS3** (cheat tool).

> Patches listed in the **✅ Confirmed** section below are marked `[Tested]` directly in their cheat name inside `USERLIST/`. You can identify them at a glance in the Artemis UI without consulting this document.

## Legend

| Symbol | Meaning |
|--------|---------|
| ✅✅ | **100% confirmed** — in `Working Artemis Patches/` folder, personally tested on real PS3 |
| ✅ | Confirmed working on **real PS3 hardware** (CFW + Artemis), reported by community |
| 🔵 | From official **RPCS3 patch.yml** — patches write `0x60000000` (PPC NOP) to Cell CPU, which is identical hardware — high confidence but not all HW-verified |
| ⚠️ | Version mismatch, uncertain, or known side effects — **may crash your console, test carefully** |
| ❌ | Known to **not work** or cause issues on real PS3 |

---

## ✅✅ 100% Confirmed — Working Artemis Patches

These 39 games are in the [`Working Artemis Patches/`](Working%20Artemis%20Patches/) folder and are verified working on real PS3 hardware. Use these files directly — no guesswork.

Many of these also work via PS3MAPI (webMAN MOD browser method) — see [`MAPI_PATCHES.md`](MAPI_PATCHES.md) for the raw memory addresses.

| Game | File | Title ID |
|------|------|----------|
| Destroy All Humans! Path of the Furon | `BLES00467` | BLES00467 |
| Dragon Ball Z: Burst Limit | `BLUS30117 v01.00` | BLUS30117 |
| Drakengard 3 | `BLUS31197 01.01` | BLUS31197 |
| Fallout 3 | `BLUS30185 01.61` | BLUS30185 |
| Fallout: New Vegas Ultimate Edition | `BLES01475 01.00` | BLES01475 |
| Final Fantasy XIII | `MRTC00003 v01.00` | MRTC00003 |
| Folklore | `BCAS20013 BCES00050 BCUS98147 01.00` | multi |
| God of War: Ascension | `BCUS98232 v01.00 av01.12` | BCUS98232 |
| Grand Theft Auto IV | `BLUS30127 v01.00 av01.08` | BLUS30127 |
| Hatsune Miku: Project DIVA F | `BLUS31319 01.00` | BLUS31319 |
| Hatsune Miku: Project DIVA F 2nd | `BLUS31431 01.00` | BLUS31431 |
| Just Cause 2 | `BLES00517 BLUS30400 01.02` | BLES00517 / BLUS30400 |
| Kingdom Hearts HD 1.5 ReMIX | `BLUS31212 01.00` | BLUS31212 |
| Kingdom Hearts HD 2.5 ReMIX | `BLUS31460 01.00` | BLUS31460 |
| Kingdoms of Amalur: Reckoning | `BLUS30710 v01.02` | BLUS30710 |
| Lost Dimension | `BLUS31554 v01.00` | BLUS31554 |
| Lost Planet 2 | `MRTC00002 v01.02` | MRTC00002 |
| Lost Planet 3 | `BLUS31020 v01.02` | BLUS31020 |
| Metal Gear Solid 4: Guns of the Patriots | `BLUS30109` | BLUS30109 |
| MotorStorm | `BCUS98137 v01.00` | BCUS98137 |
| Need for Speed: Rivals | `BLUS31201 01.03` | BLUS31201 |
| Pirates of the Caribbean: At World's End | `BLUS30029 v01.00` | BLUS30029 |
| Resident Evil 5 | `BLUS30270 v02.00` | BLUS30270 |
| Resistance 2 | `BLUS98120 01.60` | BLUS98120 |
| Resistance 3 | `BCUS98176 01.05` | BCUS98176 |
| Shadow of the Colossus (HD) | `BCES01097 01.01` | BCES01097 |
| Shadow of the Colossus (HD) multi | `BCES01097 BCES01115 BCUS98259 NPEA00280 v01.00 av01.01` | multi |
| Silent Hill: Downpour | `BLUS30565 01.01` | BLUS30565 |
| Silent Hill: Homecoming | `BLUS30169 01.00` | BLUS30169 |
| Skate 2 | `BLUS30253 v01.02` | BLUS30253 |
| Skate 3 | `BLUS30464 v01.05` | BLUS30464 |
| The Elder Scrolls IV: Oblivion GOTY | `BLUS30087 01.00` | BLUS30087 |
| The Elder Scrolls V: Skyrim | `BLUS30778 v01.00` | BLUS30778 |
| The Elder Scrolls V: Skyrim Legendary Edition | `BLUS31202 01.00` | BLUS31202 |
| The Last of Us | `BCUS98174 BCES01584 BCES01585 BCAS20270 v01.11` | multi |
| Tony Hawk's Project 8 | `BLUS30011 v01.00` | BLUS30011 |
| Tony Hawk's Proving Ground | `BLUS30071 v01.00` | BLUS30071 |
| Uncharted: Drake's Fortune | `BCES00065 BCUS98103 01.10` | BCES00065 / BCUS98103 |
| Uncharted 2: Among Thieves | `BCUS98213 01.09` | BCUS98213 |

---

## ✅ Confirmed on Real PS3 Hardware (Community Reports)

Reported working by community members on PSXPlace forum, PS3 Codes spreadsheet (Works=Y), or directly verified.

| Game | File | Patch | Author | Source | Notes |
|------|------|-------|--------|--------|-------|
| Alice: Madness Returns | `BLES01265 01.00` | Unlock FPS | FlexBy | PSXPlace | EU disc |
| Alice: Madness Returns | `NPEB00625 01.00` | Unlock FPS | FlexBy | PSXPlace | EU PSN |
| Borderlands 2 | `BLES01684 01.02` | Unlock FPS | FlexBy | PSXPlace | EU disc; patch tested on v1.15 |
| Borderlands 2 | `BLUS30982 BLES01684 NPUB30898 01.15` | Unlock FPS | FlexBy | PSXPlace | US/EU disc + US PSN v1.15 |
| Borderlands 2 | `NPEB01144 01.00` | Unlock FPS | FlexBy | PSXPlace | EU PSN v1.00 |
| Call of Duty 4: Modern Warfare | `BLES00148 BLJS10013 01.00` | Unlock FPS | — | PSXPlace | Tested on real PS3; capped at 60hz vsync |
| Call of Duty: Black Ops | `BLES01031 BLES01032 01.13` | Unlock FPS | — | PSXPlace | Confirmed same as COD4 |
| Call of Duty: Black Ops | `BLES01031 BLES01032 BLUS30591 01.00` | Unlock FPS | — | PSXPlace | v1.00 multi-region |
| Castle Crashers | `NPEB00293 01.00` | 60 FPS | FlexBy | PSXPlace | Confirmed works in intro |
| Destroy All Humans! Path of the Furon | *(no TID)* | Unlock FPS | Whatcookie | PS3 Codes Works=Y | |
| Fallout: New Vegas Ultimate Edition | `BLUS30888 01.00` | Unlock FPS | FlexBy | PS3 Codes Works=Y | US version |
| Grand Theft Auto IV | `BLES00229 BLES00258 v01.00 av01.08` | Unlock FPS | Zolika1351/illusion | PSXPlace | Base game EU disc |
| Grand Theft Auto IV | `BLUS30127 v01.00 av01.08` | Unlock FPS | Zolika1351/illusion | PSXPlace | Base game US disc |
| Grand Theft Auto IV Complete Edition | `BLES01128 01.00` | Unlock FPS | Zolika1351/illusion | PS3 Codes Works=Y | EU disc |
| Grand Theft Auto IV | `NPEB00882 01.09` | Unlock FPS | Zolika1351/illusion | PSXPlace | EU PSN version |
| Harry Potter and the Order of the Phoenix | `BLES00070 01.01` | 60 FPS | NunoRS2000 | PSXPlace | Confirmed PS3 + RPCS3 |
| Hatsune Miku Project Diva F 2nd | `NPEB02013 01.00` | 60 FPS | Brolijah | PSXPlace | EU PSN; confirmed real HW (partially) |
| Just Cause 2 | `NPUB30606 01.02` | 60 FPS | illusion | PSXPlace | US PSN version |
| Killer Is Dead | `BCAS20292 01.00` | Unlock FPS | FlexBy | PS3 Codes Works=Y | Asian version |
| Killzone 2 | `BCES00081 BCUS98116 01.29` | Extended FOV | vFxMz | PSXPlace | `3F266666` ≈ 0.65 FOV multiplier |
| Killzone 3 | `BCES01007 BCUS98234 01.14` | Extended FOV | vFxMz | PSXPlace | Two addresses |
| Lost Dimension | `01.01` | 60 FPS | FlexBy | PSXPlace | JP v1.00 |
| Lost Dimension | `BLES02197 BLUS31554 BLJM61166 01.02` | 60 FPS | FlexBy | PSXPlace | EU/US/JP v1.02; confirmed stock PS3 |
| Lost Planet 2 | `MRTC00002 01.01` | Unlock FPS | — | PS3 Codes Works=Y | ⚠️ Tested on v1.02, file is v1.01 |
| Resistance 3 | `BCES01118 BCUS98176 01.00` | Unlock FPS | — | PS3 Codes Works=Y | EU+US disc |
| Resident Evil 5 Gold Edition | `BLES00816 01.01` | Unlock FPS | — | PS3 Codes Works=Y | EU disc |
| Sonic Unleashed | `BLUS30244 01.02` | Disable Shadows / Blur / DoF / Reflection | illusion | PSXPlace | Confirmed by Mitsu on real HW; 4 separate toggles |
| The Elder Scrolls IV: Oblivion GOTY | `BLES00163 BLUS30087` | 60 FPS | — | PSXPlace | "runs 20-60 FPS depending on scene"; XMB stops rendering at high FPS |
| The Elder Scrolls V: Skyrim Legendary | `BLES01886 BLUS31202` | 60 FPS | — | PSXPlace | "can push framerate cap to 60fps" |
| The Orange Box | `BLES00153 BLUS30055` | Unlock FPS | — | PS3 Codes Works=Y | EU+US disc; 3 patches (HL2, Episodes 1&2, Portal) |

---

## 🔵 From RPCS3 Official patch.yml — Possibly Working, May Crash

Patches sourced from the official RPCS3 patch.yml by FlexBy and other contributors.
All write `0x60000000` (NOP) to disable frame limiters — identical to real PS3 Cell hardware.

> ⚠️ **These patches have NOT been confirmed on real PS3 hardware.** They are high-confidence conversions from the RPCS3 database, but some may cause crashes, freezes, or unexpected behavior. Test at your own risk. If your game is not in the ✅✅ section above, use these with caution.

### Action / Adventure

| Game | File | Patch | Notes |
|------|------|-------|-------|
| 3D Dot Game Heroes | `BLES00875 / BLJM60180 / BLUS30490 01.00` | 60 FPS | |
| Alice: Madness Returns | `BLUS30607 01.00` | Unlock FPS | US disc |
| Alien Rage | `NPEB01088 01.00` | Unlock FPS | EU PSN |
| Alpha Protocol | `BLES00704 v01.00` | Unlock FPS | ⚠️ 9-digit address in source, capped to 32-bit |
| Anarchy Reigns | `BLES01232` | Unlock FPS | |
| Bulletstorm | `NPEB00622 01.00` | Unlock FPS | EU PSN |
| Dark Souls | `BLES01402 01.00` | Unlock FPS | ⚠️ May affect gameplay speed |
| Dragon's Dogma | `BLES01356 01.00` | Unlock FPS | |
| Dragon's Dogma: Dark Arisen | `BLES01794 01.00` / `NPUB31117 01.00` | Unlock FPS | |
| Enslaved: Odyssey to the West | `BLES00989 01.00` / `BLES00989 BLUS30558` | Unlock FPS | |
| Fallout 3 GOTY | `BLUS30451 01.00` | 60 FPS | |
| Fallout: New Vegas Ultimate Edition | `BLES01475 01.00` | 60 FPS | EU version |
| Folklore | `BCAS20013 BCES00050 BCUS98147 01.00` | 60 FPS | |
| Genji: Days of the Blade | `BCES00002 01.00` | 60 FPS | |
| Just Cause 2 | `BLES00517 BLUS30400 01.02` | 60 FPS | Disc versions |
| Kamen Rider: Battride War | `BLJS10220 v01.00` | Unlock FPS | JP only |
| Kamen Rider: Battride War II | `BLJS10262 01.00` | Unlock FPS | JP only |
| Kamen Rider: Battride War II Premium | `BLJS10263 01.00` | Unlock FPS | JP only |
| Kamen Rider: Battride War Genesis | `BLJS10319 NPJB00758 01.00` | Unlock FPS | JP only |
| Kamen Rider: Battride War Genesis | `BLJS10319 NPJB00758 01.04` | Unlock FPS | JP only |
| Kamen Rider: Battride War Genesis Memorial | `BLJS10324 01.00` | Unlock FPS | JP only |
| Kamen Rider: Battride War Genesis Memorial | `BLJS10324 01.04` | Unlock FPS | JP only |
| Killer Is Dead | `BLES01856 01.00` / `BLJS10215 BLUS31186 01.00` | Unlock FPS | EU/US/JP versions |
| Kingdoms of Amalur: Reckoning | `BLES01251 BLUS30710 01.02` | Unlock FPS | |
| Legendary | `BLES00405 01.00` | Unlock FPS | |
| Lollipop Chainsaw | `BLES01525 01.00` / `BLJS10125 01.00` / `BLUS30917 01.00` | Unlock FPS | |
| Lost Dimension | `BLUS31554 01.00` | 60 FPS | US version |
| Lucha Libre AAA | `BLUS30640 01.00` | Unlock FPS | |
| Lucha Libre AAA | `BLUS30640 01.01` | Unlock FPS | |
| Mass Effect 2 | `BLES01133 v01.01 / BLUS30650 v01.00` | Unlock FPS | |
| Metal Gear Solid 4 | `BLES00246 BLJM67001 02.00` | Unlock FPS | ⚠️ Some versions may crash |
| NeverDead | `BLES01303 BLUS30654 01.00` | Unlock FPS | |
| Nier | `BLES00826 BLUS30481 v01.01` / `BLUS30481 01.00` | Unlock FPS | |
| Papo & Yo | `NPEB01109 01.00` | Unlock FPS | EU PSN |
| Shadows of the Damned | `BLES01276 01.00` / `BLUS30653 01.00` | Unlock FPS | |
| Silent Hill: Downpour | `BLES01446` / `BLUS30565` | Unlock FPS | |
| Silent Hill: Homecoming | `BLES00460 01.00` / `BLUS30169 01.00` | Unlock FPS | |
| Splatterhouse | `BLES01120 01.00` | Unlock FPS | |
| Stranglehold | `BLES00144 01.20` | Unlock FPS | |
| Warp | `NPEB00636 01.00` | Unlock FPS | EU PSN |
| Warp | `NPUB30543 01.00` | Unlock FPS | US PSN |
| WRC Powerslide | `NPEB01324 01.01` | Unlock FPS | EU PSN, by Jao |
| Zeno Clash 2 | `NPEB01351 01.00` | Unlock FPS | EU PSN; 3 addresses |

### FPS / Shooters

| Game | File | Patch | Notes |
|------|------|-------|-------|
| Army of Two | `BLES00168 BLUS30057` | Unlock FPS | |
| Army of Two: The 40th Day | `BLES00659 01.00` / `BLES00659 01.02` | Unlock FPS | |
| Army of Two: The Devil's Cartel | `BLES01763 BLUS31069 01.01` | Unlock FPS | |
| Call of Duty 4: Modern Warfare | `BLES00148 BLJS10013 01.00` | Unlock FPS | |
| Call of Duty: Black Ops | `BLES01031 BLES01032 01.13` | Unlock FPS | |
| Call of Duty: World at War | `BLES00354 BLES00357` | Unlock FPS | |
| Haze | `BLES00157 BLES00169` | Unlock FPS | |
| Killzone (HD) | `NPEA00418 01.00` | Unlock FPS | PSN version |
| Resistance 2 | `BCAS20055 BCUS98120 01.00` | Unlock FPS | |
| Resistance: Fall of Man | `BCES00001 BCUS98107` | Unlock FPS | |
| SOCOM 4 | `BCAS20121 BCES00938 BCJS30052 BCUS98135 01.00` | Unlock FPS | |

### RPG / Open World

| Game | File | Patch | Notes |
|------|------|-------|-------|
| Demon's Souls | `BLES00932 01.00` | Unlock FPS | EU; writes `be16` |
| Demon's Souls | `BLUS30443 01.00` | Unlock FPS | US; writes `be16` |
| Dragon Ball Z: Burst Limit | `BLES00231 01.00` / `BLUS30117 01.00` | 60 FPS | From PSXPlace; `be32` only |
| Persona 5 | `BLUS31604 01.00` | Unlock FPS | ⚠️ Experimental |
| Red Dead Redemption GOTY | `BLES01294 01.00` | Unlock FPS | Sets frametime to 1000ms/frame → uncapped |
| The Elder Scrolls IV: Oblivion GOTY | `BLES00163 BLUS30087` | 60 FPS | |
| The Elder Scrolls V: Skyrim Legendary | `BLES01886 BLUS31202` | 60 FPS | |
| Time and Eternity | `BLES01848` | Unlock FPS | |

### Racing

| Game | File | Patch | Notes |
|------|------|-------|-------|
| Gran Turismo 5 | `BCES00569 BCUS98114 01.00` | Unlock FPS | |
| MotorStorm: Apocalypse | `BCES00484 01.00` | Unlock FPS | |
| Need for Speed: Rivals | `BLES01894 BLUS31201 v01.00` | Unlock FPS | |

### Horror

| Game | File | Patch | Notes |
|------|------|-------|-------|
| Resident Evil (HD Remaster) | `BLJM61211 01.00` / `NPEB02076` | Unlock FPS | |
| Resident Evil 0 | `NPEB02226 01.00` | Unlock FPS | |
| Resident Evil 5 | `BLES00485 BLUS30270 v01.00` | Unlock FPS | |
| Resident Evil 5 Gold Edition | `BLUS30491 01.01` | Unlock FPS | US version |
| Resident Evil: Revelations | `BLES01773 01.01` / `BLUS31051 01.01` | Unlock FPS | |

---

## 📁 File-Based FPS Unlocks (No Cheat Codes Needed)

Some games expose FPS limits through config files inside the game folder.
Access method: **Multiman** → back up game as **JB Folder** format → edit file via **FTP**.

| Game | File to Edit | Change | Default Cap | Notes | Source |
|------|-------------|--------|-------------|-------|--------|
| Battlefield Bad Company (Gold Ed.) | `Ps3GameSettings.cfg` | Set FPS value | — | Max 60! **>60 breaks the game** (HUD bugs). Also: "FPS Unlocker" mod by Aniroh on Nexus Mods. **Note: this is BBC1, not BBC2** — BBC2 has no confirmed file method | NunoRS2000 |
| Condemned 2: Bloodshot | `PS3_GAME/USRDIR/autoexec.cfg` | Delete or change `MaxFPS` line | 40 FPS | Delete line entirely for ~59.94 FPS. Also: `FovY` line allows custom FOV | PoppaJerry |
| Crysis | `PS3_GAME/USRDIR/autoexec.cfg` | Add `sys_maxfps = 60` | — | Vsync commands in the .cfg do **not** work | NunoRS2000 |
| Crysis 2 | `PS3_GAME/USRDIR/autoexec.cfg` | Add `sys_maxfps = 60` | — | Same as Crysis | NunoRS2000 |
| Crysis 3 | `PS3_GAME/USRDIR/autoexec.cfg` | Add `sys_maxfps = 60` | — | Same as Crysis | NunoRS2000 |
| F.E.A.R. 2: Project Origin | `PS3_GAME/USRDIR/autoexec.cfg` | Delete or change `MaxFPS` line; set `"VSyncOnFlip" "0.000000"` to disable vsync | 45 FPS | Delete `MaxFPS` entirely for ~59.94 FPS. Keep `FovY` at ≤80 to avoid weapon clipping | PoppaJerry |
| Middle-Earth: Shadow of Mordor | `PS3_GAME/USRDIR/autoexec.cfg` | Delete or change `MaxFPS` line | 45 FPS | Delete line entirely for ~59.94 FPS | PoppaJerry |
| Syndicate | `ENVIRONMENT_PS3.CFG` | Change vsync value to `0` | — | ⚠️ File is **binary format** — open with a hex editor, not a text editor | NunoRS2000 |

> **Condemned 2**, **F.E.A.R. 2**, and **Shadow of Mordor** all use the **LithTech Jupiter EX** engine — the same `autoexec.cfg` `MaxFPS` mechanism applies to all three.

---

## ⚠️ Known Issues / Use with Caution

| Game | Issue |
|------|-------|
| Grand Theft Auto V | ❌ Freezes during testing — do not use on real PS3 |
| Ratchet & Clank series | Uses `type 1` (16-bit) codes at odd offsets — untested on real HW; may crash |
| Lost Planet 2 `MRTC00002 01.01` | ⚠️ Community tested v1.02, file targets v1.01 — version mismatch |
| Batman Arkham Origins `BLUS31147 01.06` | ℹ️ Patch enables Debug Menu (not direct FPS unlock); tested on v1.60, file is v1.06 |
| MGS3 HD "50 FPS" | ❌ Reduces from native 60fps — not a useful patch |
| JoJo's Bizarre Adventure: All Star Battle | Uses `bef32` vblank patches — requires 120Hz Vblank, not practical on real PS3 |
| Metal Gear Solid V: The Phantom Pain | Patches exist on RPCS3 but PS3 version runs differently — not included |
| Alice: Madness Returns | ⚠️ Listed as `N` in PS3 Codes WIP sheet — community uncertain about real HW |

---

## How to use

1. Copy the `.ncl` file for your game from `USERLIST/` to `hdd0/game/ARTZ00001/USRDIR/USERLIST/` on your PS3 via FTP
2. Launch Artemis, select your game, activate the FPS patch
3. The patch activates immediately — no reboot needed

> **Vblank note:** Patches labeled "Unlock FPS" remove the frame limiter — actual FPS depends on your PS3 model and game. Setting Vblank frequency higher in RPCS3 does NOT apply to real PS3 hardware (those patches are emulator-only).

> **Version mismatch:** Patches labeled `v01.XX (RPCS3)` in the cheat name were written for a different game version than your file. They may still work, but test carefully and expect possible instability.

---

## Contributing

Tested a patch on real PS3? Open an issue or PR with:
- Game name, Title ID, firmware version
- PS3 model (Fat/Slim/Super Slim)
- CFW version (HEN/Rebug/etc.)
- Result: ✅ works / ⚠️ partial / ❌ crashes

Sources: [PSXPlace game-patches thread](https://www.psx-place.com/threads/game-patches.43706/) · [RPCS3 patch.yml](https://github.com/RPCS3/rpcs3/blob/master/bin/patch.yml) · [Artemis PS3](https://github.com/bucanero/ArtemisPS3)
