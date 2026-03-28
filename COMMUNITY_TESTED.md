# Community Tested FPS / Performance Patches

Patches in this repo converted from RPCS3 patch.yml and PSXPlace forum research.
Use on real PS3 with **Custom Firmware + Artemis PS3** (cheat tool).

## Legend

| Symbol | Meaning |
|--------|---------|
| ✅ | Confirmed working on **real PS3 hardware** (CFW + Artemis), reported by community |
| 🔵 | From official **RPCS3 patch.yml** — patches write `0x60000000` (PPC NOP) to Cell CPU, which is identical hardware — very high confidence |
| ⚠️ | Version mismatch, uncertain, or known side effects — test carefully |
| ❌ | Known to **not work** or cause issues on real PS3 |

---

## ✅ Confirmed on Real PS3 Hardware

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
| Killzone 2 | `BCES00081 01.29` | Extended FOV | vFxMz | PSXPlace | `3F266666` ≈ 0.65 FOV multiplier |
| Killzone 3 | `BCES01007 01.14` | Extended FOV | vFxMz | PSXPlace | Two addresses |
| Lost Dimension | `01.01` | 60 FPS | FlexBy | PSXPlace | JP v1.00 |
| Lost Dimension | `BLES02197 BLUS31554 BLJM61166 01.02` | 60 FPS | FlexBy | PSXPlace | EU/US/JP v1.02; confirmed stock PS3 |
| Lost Planet 2 | `MRTC00002 01.01` | Unlock FPS | — | PS3 Codes Works=Y | ⚠️ Tested on v1.02, file is v1.01 |
| Resistance 3 | `BCES01118 01.00` | Unlock FPS | — | PS3 Codes Works=Y | EU disc |
| Resident Evil 5 Gold Edition | `BLES00816 01.01` | Unlock FPS | — | PS3 Codes Works=Y | EU disc |
| Sonic Unleashed | `BLUS30244 01.02` | Disable Shadows / Blur / DoF | illusion | PSXPlace | Confirmed by Mitsu on real HW |
| The Elder Scrolls IV: Oblivion GOTY | `BLES00163 BLUS30087` | 60 FPS | — | PSXPlace | "runs 20-60 FPS depending on scene"; XMB stops rendering at high FPS |
| The Elder Scrolls V: Skyrim Legendary | `BLES01886 BLUS31202` | 60 FPS | — | PSXPlace | "can push framerate cap to 60fps" |
| The Orange Box | `BLUS30055` | Unlock FPS | — | PS3 Codes Works=Y | US disc |

---

## 🔵 From RPCS3 Official patch.yml (High Confidence)

Patches sourced from the official RPCS3 patch.yml by FlexBy and other contributors.
All write `0x60000000` (NOP) to disable frame limiters — identical to real PS3 Cell hardware.
Not all have been explicitly tested on real hardware; report your results!

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

1. Copy the `.ncl` file for your game to your PS3's Artemis codes folder
2. Launch Artemis, select your game, activate the FPS patch
3. The patch activates immediately — no reboot needed

> **Vblank note:** Patches labeled "Unlock FPS" remove the frame limiter — actual FPS depends on your PS3 model and game. Setting Vblank frequency higher in RPCS3 does NOT apply to real PS3 hardware (those patches are emulator-only).

---

## Contributing

Tested a patch on real PS3? Open an issue or PR with:
- Game name, Title ID, firmware version
- PS3 model (Fat/Slim/Super Slim)
- CFW version (HEN/Rebug/etc.)
- Result: ✅ works / ⚠️ partial / ❌ crashes

Sources: [PSXPlace game-patches thread](https://www.psx-place.com/threads/game-patches.43706/) · [RPCS3 patch.yml](https://github.com/RPCS3/rpcs3/blob/master/bin/patch.yml) · [Artemis PS3](https://github.com/bucanero/ArtemisPS3)
